# Mira - Celestial Oracle Web Application

Mira is a modern web application that provides celestial readings and spiritual guidance through an intuitive interface.

## Features

- User authentication and profile management
- Interactive questionnaire for personalized readings
- Secure payment processing with Stripe
- Daily cosmic insights
- Admin dashboard for content management
- Responsive design with modern UI

## Tech Stack

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Authentication: Express Session
- Payments: Stripe
- Styling: Tailwind CSS, Radix UI

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Neon database)
- Stripe account
- npm or yarn

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mira.git
   cd mira
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration values.

4. Set up the database:
   ```bash
   npm run db:setup
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Push database schema changes
- `npm run check` - Type check the codebase

## Database Setup

1. Create a PostgreSQL database (or use Neon)
2. Set the `DATABASE_URL` in your `.env` file
3. Run `npm run db:setup` to initialize the database

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the GitHub repository. 