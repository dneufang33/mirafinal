const { neon } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-http');
const { migrate } = require('drizzle-orm/neon-http/migrator');
const schema = require('../shared/schema.js');
const fs = require('fs/promises');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function createDatabase() {
  try {
    // Get database URL from user
    const dbUrl = await new Promise(resolve => {
      rl.question('Enter your Neon database URL: ', (answer) => {
        resolve(answer.trim());
      });
    });

    if (!dbUrl) {
      console.error('Database URL is required');
      process.exit(1);
    }

    // Create database connection
    console.log('Connecting to database...');
    const sql = neon(dbUrl);
    const db = drizzle(sql, { schema });

    // Run migrations
    console.log('Running migrations...');
    await migrate(db, { migrationsFolder: path.join(__dirname, '../drizzle') });

    // Create sessions table
    console.log('Setting up sessions table...');
    const sessionsSql = await fs.readFile(
      path.join(__dirname, '../server/migrations/sessions.sql'),
      'utf-8'
    );
    await sql.query(sessionsSql);

    // Create .env file
    const envContent = `# Server Configuration\nNODE_ENV=development\nPORT=5000\n\n# Database Configuration\nDATABASE_URL=${dbUrl}\n\n# Session Configuration\nSESSION_SECRET=${Buffer.from(crypto.randomBytes(32)).toString('hex')}\n\n# Stripe Configuration (Test Keys)\nSTRIPE_SECRET_KEY=sk_test_your_stripe_test_key\nSTRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret\n\n# Security\nCORS_ORIGIN=http://localhost:5000\nCOOKIE_DOMAIN=localhost\n\n# Optional: Error Tracking\nSENTRY_DSN=your_sentry_dsn_here\n`;

    await fs.writeFile(path.join(__dirname, '../.env'), envContent);
    console.log('Created .env file with database configuration');

    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Edit .env file with your Stripe keys');
    console.log('2. Run "npm run dev" to start the development server');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

createDatabase(); 