# Mira Deployment Guide

This guide will help you deploy the Mira application to production.

## Prerequisites

1. Node.js 18+ installed
2. PostgreSQL 14+ database
3. Stripe account for payments
4. Domain name and SSL certificate
5. Hosting provider (e.g., Heroku, DigitalOcean, AWS)

## Environment Setup

1. Create a `.env` file in the root directory with the following variables:
   ```
   # Server Configuration
   NODE_ENV=production
   PORT=5000

   # Database Configuration
   DATABASE_URL=postgresql://user:password@host:5432/database

   # Session Configuration
   SESSION_SECRET=your-secure-session-secret

   # Stripe Configuration
   STRIPE_SECRET_KEY=your-stripe-secret-key
   STRIPE_WEBHOOK_SECRET=your-stripe-webhook-secret

   # Security
   CORS_ORIGIN=https://your-domain.com
   COOKIE_DOMAIN=your-domain.com

   # Optional: Error Tracking
   SENTRY_DSN=your-sentry-dsn
   ```

2. Generate a secure session secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

## Database Setup

1. Create a new PostgreSQL database
2. Run the database migrations:
   ```bash
   npm run db:push
   ```
3. Run the sessions table migration:
   ```bash
   psql -d your_database -f server/migrations/sessions.sql
   ```

## Building for Production

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Start the production server:
   ```bash
   npm start
   ```

## Deployment Checklist

- [ ] Set up SSL certificate
- [ ] Configure domain DNS
- [ ] Set up database backups
- [ ] Configure monitoring (e.g., Sentry)
- [ ] Set up CI/CD pipeline
- [ ] Configure rate limiting
- [ ] Set up logging
- [ ] Configure error tracking
- [ ] Test payment processing
- [ ] Verify session management
- [ ] Check security headers
- [ ] Test CORS configuration

## Security Considerations

1. Always use HTTPS in production
2. Keep dependencies updated
3. Regularly rotate secrets
4. Monitor for security vulnerabilities
5. Implement rate limiting
6. Use secure session configuration
7. Enable security headers
8. Configure proper CORS settings

## Monitoring

1. Set up application monitoring
2. Configure error tracking
3. Monitor database performance
4. Set up uptime monitoring
5. Configure logging

## Backup Strategy

1. Regular database backups
2. Backup verification
3. Disaster recovery plan
4. Backup retention policy

## Maintenance

1. Regular dependency updates
2. Security patches
3. Performance monitoring
4. Database maintenance
5. Log rotation

## Troubleshooting

Common issues and solutions:

1. Database connection issues
   - Verify DATABASE_URL
   - Check network connectivity
   - Verify database credentials

2. Session issues
   - Verify SESSION_SECRET
   - Check cookie settings
   - Verify session store configuration

3. CORS issues
   - Verify CORS_ORIGIN
   - Check allowed methods
   - Verify credentials setting

4. Payment issues
   - Verify Stripe keys
   - Check webhook configuration
   - Verify payment endpoints

For additional help, please open an issue in the repository. 