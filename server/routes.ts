import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertQuestionnaireSchema, insertUserSchema } from "../shared/schema";
import { z } from "zod";
import bcrypt from "bcrypt";
import OpenAI from "openai";
import authRoutes from "./routes/auth";

// Initialize OpenAI - you'll need to set OPENAI_API_KEY in your .env file
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const user = await storage.getUser(req.session.userId);
  if (!user) {
    return res.status(401).json({ message: "User not found" });
  }
  
  req.user = user;
  next();
};

// Admin middleware
const requireAdmin = async (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Mount auth routes
  app.use("/api/auth", authRoutes);

  // Questionnaire routes
  app.post("/api/questionnaire", requireAuth, async (req, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse({
        ...req.body,
        userId: req.user.id
      });
      
      // Store questionnaire
      const questionnaire = await storage.createQuestionnaire(questionnaireData);

      // Generate AI reading
      const reading = await generateAIReading(questionnaireData);
      
      // Store reading
      const storedReading = await storage.createReading({
        userId: req.user.id,
        questionnaireId: questionnaire.id,
        title: "Your Sacred Birth Chart Reading",
        content: reading,
        readingType: "birth_chart",
        isPaid: false
      });

      res.json({ 
        questionnaire,
        reading: storedReading,
        message: "Your cosmic blueprint has been created successfully"
      });
    } catch (error: any) {
      console.error("Questionnaire error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's questionnaire
  app.get("/api/questionnaire", requireAuth, async (req, res) => {
    try {
      const questionnaires = await storage.getQuestionnairesByUserId(req.user.id);
      res.json({ questionnaires });
    } catch (error: any) {
      console.error("Error fetching questionnaires:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's readings
  app.get("/api/readings", requireAuth, async (req, res) => {
    try {
      const readings = await storage.getReadingsByUserId(req.user.id);
      res.json({ readings });
    } catch (error: any) {
      console.error("Error fetching readings:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Daily insights
  app.get("/api/daily-insight", async (req, res) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const insight = await storage.getDailyInsightByDate(today);
      
      if (!insight) {
        // Create a default insight if none exists
        const defaultInsight = await storage.createDailyInsight({
          title: "Today's Cosmic Guidance",
          content: "The stars align to bring you wisdom and clarity. Trust in the universe's plan for you.",
          date: today,
          zodiacSign: null,
          isActive: true
        });
        return res.json({ insight: defaultInsight });
      }
      
      res.json({ insight });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const safeUsers = users.map(({ password, ...user }) => user);
      res.json({ users: safeUsers });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/questionnaires", requireAuth, requireAdmin, async (req, res) => {
    try {
      const questionnaires = await storage.getAllQuestionnaires();
      res.json({ questionnaires });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/admin/stats", requireAuth, requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const payments = await storage.getAllPayments();
      const readings = await storage.getAllReadings();
      
      const stats = {
        totalUsers: users.length,
        monthlyRevenue: payments.reduce((sum, p) => sum + parseFloat(p.amount.toString()), 0),
        readingsGenerated: readings.length,
        subscriptions: users.filter(u => u.subscriptionStatus === 'active').length
      };
      
      res.json(stats);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

async function generateAIReading(data: any): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    // Return a fallback reading if no API key is provided
    return `Welcome to your cosmic journey, dear seeker. Based on your birth details from ${data.birthCity}, ${data.birthCountry}, and your zodiac sign ${data.zodiacSign}, the universe has woven a unique tapestry of celestial influences just for you.

Your spiritual goals reveal a deep yearning for ${data.spiritualGoals}. The stars whisper that this path will lead you to profound self-discovery and enlightenment.

In matters of the heart, your relationship patterns show ${data.relationshipHistory}. The cosmic energies suggest that understanding these patterns will unlock new depths of love and connection.

Your life intentions - ${data.lifeIntentions} - are beautifully aligned with your celestial blueprint. The universe supports your journey toward these sacred goals.

This is just the beginning of your cosmic exploration. May the stars guide you on your path to wisdom and fulfillment.`;
  }

  const prompt = `As an experienced astrologer, create a profound and personalized reading based on the following birth chart information:

Birth Date: ${data.birthDate}
Birth Time: ${data.birthTime}
Zodiac Sign: ${data.zodiacSign}
Birth Place: ${data.birthCity}, ${data.birthCountry}
Personality Traits: ${data.personalityTraits?.join(', ') || 'Not specified'}
Spiritual Goals: ${data.spiritualGoals}
Relationship History: ${data.relationshipHistory}
Life Intentions: ${data.lifeIntentions}
${data.specificQuestions ? `Specific Questions: ${data.specificQuestions}` : ''}

Please provide a comprehensive reading that:
1. Analyzes their cosmic blueprint and celestial influences
2. Explores their spiritual path and life purpose
3. Offers insights about their relationships and personal growth
4. Provides guidance for their current life phase
5. Includes specific astrological interpretations of their chart

Make the reading profound, mystical, and deeply personal, using astrological terminology and cosmic wisdom. The reading should be approximately 800-1000 words.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a master astrologer with deep knowledge of celestial wisdom, tarot, and spiritual guidance. Your readings are profound, mystical, and deeply personal, while maintaining a professional and authoritative tone. You weave together astrological insights with spiritual wisdom to create transformative readings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    return completion.choices[0].message.content || "Unable to generate reading at this time. Please try again later.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "The cosmic energies are currently in flux. Please try again in a few moments for your personalized reading.";
  }
}