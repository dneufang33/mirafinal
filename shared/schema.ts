import { z } from "zod";

// Validation schemas
export const insertQuestionnaireSchema = z.object({
  email: z.string().email(),
  birthDate: z.string(),
  zodiacSign: z.string(),
  birthCity: z.string(),
  birthCountry: z.string(),
  age: z.number(),
  spiritualGoals: z.string(),
  relationshipHistory: z.string(),
  lifeIntentions: z.string()
});

export const insertReadingSchema = z.object({
  questionnaireId: z.number(),
  title: z.string(),
  content: z.string(),
  readingType: z.string(),
  isPaid: z.boolean()
});

// Database types
export interface Questionnaire {
  id: number;
  email: string;
  birthDate: string;
  zodiacSign: string;
  birthCity: string;
  birthCountry: string;
  age: number;
  spiritualGoals: string;
  relationshipHistory: string;
  lifeIntentions: string;
  createdAt: Date;
}

export interface Reading {
  id: number;
  questionnaireId: number;
  title: string;
  content: string;
  readingType: string;
  isPaid: boolean;
  createdAt: Date;
}
