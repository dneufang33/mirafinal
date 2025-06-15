import { config as dotenvConfig } from "dotenv";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

dotenvConfig();

// Database connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Session store
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool,
  tableName: 'sessions'
});

export const config = {
  // Environment
  isProduction: process.env.NODE_ENV === 'production',
  port: parseInt(process.env.PORT || '5000', 10),

  // Security
  sessionSecret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5000',
  cookieDomain: process.env.COOKIE_DOMAIN || 'localhost',

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Session
  sessionStore,

  // Stripe
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,

  // Optional: Error tracking
  sentryDsn: process.env.SENTRY_DSN,

  // Email configuration
  smtpHost: process.env.SMTP_HOST || "smtp.gmail.com",
  smtpPort: parseInt(process.env.SMTP_PORT || "587", 10),
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
} as const;

// Validate required environment variables
const requiredEnvVars = [
  'DATABASE_URL',
  'SESSION_SECRET',
  'STRIPE_SECRET_KEY'
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
} 