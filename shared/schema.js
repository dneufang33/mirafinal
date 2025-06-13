"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.insertDailyInsightSchema = exports.insertPaymentSchema = exports.insertReadingSchema = exports.insertQuestionnaireSchema = exports.insertUserSchema = exports.dailyInsights = exports.payments = exports.readings = exports.questionnaires = exports.users = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    username: (0, pg_core_1.text)("username").notNull().unique(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    password: (0, pg_core_1.text)("password").notNull(),
    fullName: (0, pg_core_1.text)("full_name"),
    stripeCustomerId: (0, pg_core_1.text)("stripe_customer_id"),
    stripeSubscriptionId: (0, pg_core_1.text)("stripe_subscription_id"),
    subscriptionStatus: (0, pg_core_1.text)("subscription_status"), // active, canceled, past_due
    isAdmin: (0, pg_core_1.boolean)("is_admin").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.questionnaires = (0, pg_core_1.pgTable)("questionnaires", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }).notNull(),
    birthDate: (0, pg_core_1.text)("birth_date").notNull(),
    birthTime: (0, pg_core_1.text)("birth_time").notNull(),
    birthCity: (0, pg_core_1.text)("birth_city").notNull(),
    birthCountry: (0, pg_core_1.text)("birth_country").notNull(),
    zodiacSign: (0, pg_core_1.text)("zodiac_sign").notNull(),
    personalityTraits: (0, pg_core_1.jsonb)("personality_traits"),
    spiritualGoals: (0, pg_core_1.text)("spiritual_goals"),
    relationshipHistory: (0, pg_core_1.text)("relationship_history"),
    lifeIntentions: (0, pg_core_1.text)("life_intentions"),
    specificQuestions: (0, pg_core_1.text)("specific_questions"),
    completedAt: (0, pg_core_1.timestamp)("completed_at").defaultNow(),
});
exports.readings = (0, pg_core_1.pgTable)("readings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }).notNull(),
    questionnaireId: (0, pg_core_1.integer)("questionnaire_id").references(function () { return exports.questionnaires.id; }).notNull(),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    readingType: (0, pg_core_1.text)("reading_type").notNull(), // birth_chart, transit, compatibility, etc.
    isPaid: (0, pg_core_1.boolean)("is_paid").default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.payments = (0, pg_core_1.pgTable)("payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").references(function () { return exports.users.id; }).notNull(),
    stripePaymentIntentId: (0, pg_core_1.text)("stripe_payment_intent_id"),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    currency: (0, pg_core_1.text)("currency").default("usd"),
    paymentType: (0, pg_core_1.text)("payment_type").notNull(), // one_time, subscription
    status: (0, pg_core_1.text)("status").notNull(), // pending, completed, failed
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.dailyInsights = (0, pg_core_1.pgTable)("daily_insights", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    title: (0, pg_core_1.text)("title").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    date: (0, pg_core_1.text)("date").notNull(),
    zodiacSign: (0, pg_core_1.text)("zodiac_sign"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
// Insert schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.insertQuestionnaireSchema = (0, drizzle_zod_1.createInsertSchema)(exports.questionnaires);
exports.insertReadingSchema = (0, drizzle_zod_1.createInsertSchema)(exports.readings);
exports.insertPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.payments);
exports.insertDailyInsightSchema = (0, drizzle_zod_1.createInsertSchema)(exports.dailyInsights);
