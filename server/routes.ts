import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertUserSchema, insertQuestionnaireSchema, insertReadingSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

// Mock user session for development
let currentUser: any = null;

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      currentUser = user;
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      currentUser = user;
      res.json({ user: { id: user.id, username: user.username, email: user.email, fullName: user.fullName, isAdmin: user.isAdmin } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    currentUser = null;
    res.json({ message: "Logged out successfully" });
  });

  app.get("/api/auth/me", (req, res) => {
    if (!currentUser) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ user: { id: currentUser.id, username: currentUser.username, email: currentUser.email, fullName: currentUser.fullName, isAdmin: currentUser.isAdmin } });
  });

  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const questionnaireData = insertQuestionnaireSchema.parse({
        ...req.body,
        userId: currentUser.id
      });

      const questionnaire = await storage.createQuestionnaire(questionnaireData);
      
      // Generate a basic reading after questionnaire completion
      await storage.createReading({
        userId: currentUser.id,
        questionnaireId: questionnaire.id,
        title: "Your Sacred Birth Chart Reading",
        content: `Welcome to your cosmic blueprint, ${currentUser.fullName}! As a ${questionnaire.zodiacSign}, your celestial journey began on ${questionnaire.birthDate} in ${questionnaire.birthCity}, ${questionnaire.birthCountry}. The stars have aligned to reveal profound insights about your spiritual path and life purpose. Your birth chart shows strong influences in the realm of ${questionnaire.spiritualGoals}, while your relationships have taught you valuable lessons about ${questionnaire.relationshipHistory}. The universe calls you to focus on ${questionnaire.lifeIntentions} as you move forward on your sacred journey.`,
        readingType: "birth_chart",
        isPaid: false
      });

      res.json({ questionnaire });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/questionnaire", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const questionnaire = await storage.getQuestionnaireByUserId(currentUser.id);
      res.json({ questionnaire });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Readings routes
  app.get("/api/readings", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const readings = await storage.getReadingsByUserId(currentUser.id);
      res.json({ readings });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/readings/:id", async (req, res) => {
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const reading = await storage.getReadingById(parseInt(req.params.id));
      if (!reading || reading.userId !== currentUser.id) {
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
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: currentUser.id.toString()
        }
      });

      // Store payment record
      await storage.createPayment({
        userId: currentUser.id,
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
    try {
      if (!currentUser) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let user = currentUser;

      if (user.stripeSubscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent']
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice.payment_intent as any)?.client_secret,
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
          name: 'Lunar Oracle Subscription',
          description: 'Monthly cosmic wisdom and daily whispers'
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{ price: price.id }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(user.id, customer.id, subscription.id);
      currentUser = await storage.getUser(user.id);

      const invoice = subscription.latest_invoice as any;
      const paymentIntent = invoice.payment_intent;
  
      res.json({
        subscriptionId: subscription.id,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    try {
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      res.json({ users });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

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
    try {
      if (!currentUser || !currentUser.isAdmin) {
        return res.status(403).json({ message: "Admin access required" });
      }

      const questionnaires = await storage.getAllQuestionnaires();
      res.json({ questionnaires });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
