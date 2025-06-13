import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "pg";

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
  sentryDsn: process.env.SENTRY_DSN
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