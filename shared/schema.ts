import { pgTable, serial, text, integer, boolean, timestamp, decimal, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"), // active, canceled, past_due
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  birthDate: text("birth_date").notNull(),
  birthTime: text("birth_time").notNull(),
  birthCity: text("birth_city").notNull(),
  birthCountry: text("birth_country").notNull(),
  zodiacSign: text("zodiac_sign").notNull(),
  personalityTraits: jsonb("personality_traits"),
  spiritualGoals: text("spiritual_goals"),
  relationshipHistory: text("relationship_history"),
  lifeIntentions: text("life_intentions"),
  specificQuestions: text("specific_questions"),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const readings = pgTable("readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  questionnaireId: integer("questionnaire_id").references(() => questionnaires.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  readingType: text("reading_type").notNull(), // birth_chart, transit, compatibility, etc.
  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("usd"),
  paymentType: text("payment_type").notNull(), // one_time, subscription
  status: text("status").notNull(), // pending, completed, failed
  createdAt: timestamp("created_at").defaultNow(),
});

export const dailyInsights = pgTable("daily_insights", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  date: text("date").notNull(),
  zodiacSign: text("zodiac_sign"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users);
export const insertQuestionnaireSchema = createInsertSchema(questionnaires);
export const insertReadingSchema = createInsertSchema(readings);
export const insertPaymentSchema = createInsertSchema(payments);
export const insertDailyInsightSchema = createInsertSchema(dailyInsights);

// TypeScript types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Questionnaire = typeof questionnaires.$inferSelect;
export type InsertQuestionnaire = typeof questionnaires.$inferInsert;
export type Reading = typeof readings.$inferSelect;
export type InsertReading = typeof readings.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type DailyInsight = typeof dailyInsights.$inferSelect;
export type InsertDailyInsight = typeof dailyInsights.$inferInsert;