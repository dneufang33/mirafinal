import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertQuestionnaireSchema, insertReadingSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount auth routes
  app.use("/api/auth", authRouter);

  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const questionnaireData = insertQuestionnaireSchema.parse({
        ...req.body,
        userId: user.id
      });

      const questionnaire = await storage.createQuestionnaire(questionnaireData);
      
      // Generate a basic reading after questionnaire completion
      await storage.createReading({
        userId: user.id,
        questionnaireId: questionnaire.id,
        title: "Your Sacred Birth Chart Reading",
        content: `Welcome to your cosmic blueprint, ${user.fullName}! As a ${questionnaire.zodiacSign}, your celestial journey began on ${questionnaire.birthDate} in ${questionnaire.birthCity}, ${questionnaire.birthCountry}. The stars have aligned to reveal profound insights about your spiritual path and life purpose. Your birth chart shows strong influences in the realm of ${questionnaire.spiritualGoals}, while your relationships have taught you valuable lessons about ${questionnaire.relationshipHistory}. The universe calls you to focus on ${questionnaire.lifeIntentions} as you move forward on your sacred journey.`,
        readingType: "birth_chart",
        isPaid: false
      });

      res.json({ questionnaire });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/questionnaire", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const questionnaire = await storage.getQuestionnaireByUserId(user.id);
      res.json({ questionnaire });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Readings routes
  app.get("/api/readings", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const readings = await storage.getReadingsByUserId(user.id);
      res.json({ readings });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/readings/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const reading = await storage.getReadingById(parseInt(req.params.id));
      if (!reading || reading.userId !== user.id) {
        return res.status(404).json({ message: "Reading not found" });
      }

      res.json({ reading });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Daily insights
  app.get("/api/daily-insight", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const insight = await storage.getDailyInsightByDate(today);
      res.json({ insight });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: user.id.toString()
        }
      });

      // Store payment record
      await storage.createPayment({
        userId: user.id,
        stripePaymentIntentId: paymentIntent.id,
        amount: amount.toString(),
        currency: "usd",
        paymentType: "one_time",
        status: "pending"
      });

      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  app.post('/api/get-or-create-subscription', async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    let user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    try {
      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent']
        });
        const paymentIntent = (invoice as any).payment_intent;

        res.json({
          subscriptionId: subscription.id,
          clientSecret: paymentIntent?.client_secret,
        });
        return;
      }
      
      if (!user.email) {
        throw new Error('No user email on file');
      }

      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName || user.username,
      });

      user = await storage.updateUserStripeInfo(user.id, customer.id, "");

      // Create a price on the fly for the subscription
      const price = await stripe.prices.create({
        unit_amount: 2900, // $29.00 in cents
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: {
          name: 'Lunar Oracle Subscription'
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
      user = await storage.getUser(user.id);

      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
        expand: ['payment_intent']
      });
      const paymentIntent = (invoice as any).payment_intent;
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.session.userId) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.session.userId) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const users = await storage.getAllUsers();
      const payments = await storage.getAllPayments();
      const readings = await storage.getAllReadings();
      
      const monthlyRevenue = payments
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + parseFloat(p.amount), 0);

      const subscriptions = users.filter(u => u.subscriptionStatus === 'active').length;

      res.json({
        totalUsers: users.length,
        monthlyRevenue: monthlyRevenue,
        readingsGenerated: readings.length,
        subscriptions: subscriptions
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/questionnaires", async (req, res) => {
    if (!req.session.userId) {
      return res.status(403).json({ message: "Admin access required" });
    }
    const user = await storage.getUser(req.session.userId);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    try {
      const questionnaires = await storage.getAllQuestionnaires();
      res.json({ questionnaires });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
