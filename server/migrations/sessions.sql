-- Create sessions table for connect-pg-simple
CREATE TABLE IF NOT EXISTS "sessions" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "sessions_pkey" PRIMARY KEY ("sid")
);

CREATE INDEX IF NOT EXISTS "IDX_sessions_expire" ON "sessions" ("expire");

-- Add RLS policies for security
ALTER TABLE "sessions" ENABLE ROW LEVEL SECURITY;

-- Only allow the application to access sessions
CREATE POLICY "sessions_access_policy" ON "sessions"
  FOR ALL
  USING (true)
  WITH CHECK (true); 