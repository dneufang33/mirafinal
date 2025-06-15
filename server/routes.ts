import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage-new";
import { insertQuestionnaireSchema } from "../shared/schema";
import { z } from "zod";
import session from "express-session";
import cors from "cors";
import authRouter from "./routes/auth";
import OpenAI from "openai";
import { generatePDF } from "./utils/pdf";
import { sendReadingEmail } from "./utils/email";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing required Stripe secret: STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount auth routes
  app.use("/api/auth", authRouter);

  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse(req.body);
      
      // Store questionnaire
      const questionnaire = await storage.createQuestionnaire(questionnaireData);

      // Generate reading using OpenAI
      const reading = await generateReading(questionnaireData);
      
      // Generate PDF
      const pdfBuffer = await generatePDF(reading, questionnaireData);
      
      // Store reading
      const storedReading = await storage.createReading({
        questionnaireId: questionnaire.id,
        title: "Your Sacred Birth Chart Reading",
        content: reading,
        readingType: "birth_chart",
        isPaid: false
      });

      // Send email with PDF
      await sendReadingEmail(questionnaireData.email, pdfBuffer, "Your Sacred Birth Chart Reading");

      res.json({ 
        questionnaire,
        reading: storedReading,
        message: "Your reading has been sent to your email"
      });
    } catch (error: any) {
      console.error("Questionnaire error:", error);
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
      res.json({ 
        insight: {
          title: "Today's Cosmic Guidance",
          content: "The stars align to bring you wisdom and clarity. Trust in the universe's plan for you.",
          date: today
        }
      });
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

async function generateReading(data: any): Promise<string> {
  const prompt = `As an experienced astrologer, create a profound and personalized reading based on the following birth chart information:

Birth Date: ${data.birthDate}
Zodiac Sign: ${data.zodiacSign}
Birth Place: ${data.birthCity}, ${data.birthCountry}
Age: ${data.age}
Spiritual Goals: ${data.spiritualGoals}
Relationship History: ${data.relationshipHistory}
Life Intentions: ${data.lifeIntentions}

Please provide a comprehensive reading that:
1. Analyzes their cosmic blueprint and celestial influences
2. Explores their spiritual path and life purpose
3. Offers insights about their relationships and personal growth
4. Provides guidance for their current life phase
5. Includes specific astrological interpretations of their chart

Make the reading profound, mystical, and deeply personal, using astrological terminology and cosmic wisdom.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      {
        role: "system",
        content: "You are a master astrologer with deep knowledge of celestial wisdom, tarot, and spiritual guidance. Your readings are profound, mystical, and deeply personal, while maintaining a professional and authoritative tone."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 2000
  });

  return completion.choices[0].message.content || "Unable to generate reading at this time.";
}
