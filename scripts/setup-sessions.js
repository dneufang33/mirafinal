import { neon } from '@neondatabase/serverless';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupSessions() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is required');
    process.exit(1);
  }

  try {
    // Create database connection
    const sql = neon(process.env.DATABASE_URL);

    // Read and execute sessions.sql
    console.log('Setting up sessions table...');
    const sessionsSql = await fs.readFile(
      path.join(__dirname, '../server/migrations/sessions.sql'),
      'utf-8'
    );
    
    // Split the SQL into individual statements and execute them
    const statements = sessionsSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (const statement of statements) {
      await sql(statement);
    }

    console.log('Sessions table setup completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up sessions table:', error);
    process.exit(1);
  }
}

setupSessions(); 