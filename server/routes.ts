import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage-new";
import { insertQuestionnaireSchema, type Questionnaire } from "../shared/schema";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Questionnaire routes
  app.post("/api/questionnaire", async (req, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse(req.body);
      
      // Store questionnaire
      const questionnaire = await storage.createQuestionnaire(questionnaireData);

      // Generate reading using OpenAI
      const reading = await generateReading(questionnaireData);
      
      // Store reading
      const storedReading = await storage.createReading({
        questionnaireId: questionnaire.id,
        title: "Your Sacred Birth Chart Reading",
        content: reading,
        readingType: "birth_chart",
        isPaid: false
      });

      res.json({ 
        questionnaire,
        reading: storedReading,
        message: "Your reading has been generated successfully"
      });
    } catch (error: any) {
      console.error("Questionnaire error:", error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get questionnaire and reading
  app.get("/api/questionnaire/:id", async (req, res) => {
    try {
      const questionnaireId = parseInt(req.params.id);
      const questionnaire = await storage.getQuestionnaireById(questionnaireId);
      
      if (!questionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }

      const readings = await storage.getReadingsByQuestionnaireId(questionnaireId);
      
      res.json({ 
        questionnaire,
        readings
      });
    } catch (error: any) {
      console.error("Error fetching questionnaire:", error);
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

  const httpServer = createServer(app);
  return httpServer;
}

async function generateReading(data: Omit<Questionnaire, "id" | "createdAt">): Promise<string> {
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
