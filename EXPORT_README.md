# Logic 101 Application Export

## Overview
This is a complete export of your philosophical learning platform with 5-tab Logic 101 interface, including Living Book functionality, adaptive diagnostics, practice systems, and AI-powered content generation.

## Prerequisites
- Node.js 18+ and npm
- PostgreSQL database
- API keys for AI services (OpenAI, Anthropic, DeepSeek, Perplexity)

## Environment Variables Required
Create a `.env` file in the root directory with:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/logic101
PGHOST=localhost
PGPORT=5432
PGUSER=your_username
PGPASSWORD=your_password
PGDATABASE=logic101

# AI API Keys
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key
PERPLEXITY_API_KEY=your_perplexity_key

# Azure Speech (optional)
AZURE_SPEECH_KEY=your_azure_key
AZURE_SPEECH_REGION=your_region
AZURE_SPEECH_ENDPOINT=your_endpoint

# Google Speech (optional)
GOOGLE_SPEECH_API_KEY=your_google_key

# Session Secret
SESSION_SECRET=your_random_session_secret_here

# PayPal (optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_ENVIRONMENT=sandbox
```

## Installation Steps

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up PostgreSQL database:**
   - Create a new database named `logic101`
   - Run the schema migration:
   ```bash
   npm run db:push
   ```

3. **Build the application:**
   ```bash
   npm run build
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## Database Schema
The database schema is defined in `shared/schema.ts` using Drizzle ORM. Key tables include:
- `users` - User accounts and authentication
- `chatMessages` - Chat history and AI interactions
- `podcasts` - Generated podcast content
- `practiceAttempts` - User practice performance tracking

## Architecture Overview
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: Multiple AI models (OpenAI GPT-4, Anthropic Claude, DeepSeek, Perplexity)
- **Build System**: Vite for frontend, ESBuild for backend

## Key Features
1. **Living Book** - Interactive philosophical text with AI chat and podcast generation
2. **Course System** - 5-tab interface with modules, tutor, practice, and diagnostics
3. **Adaptive Diagnostics** - AI-powered assessment with logic keyboard
4. **Practice System** - Homework, quizzes, and comprehensive final exams
5. **AI Integration** - Multi-model support for content generation
6. **User Management** - Authentication and credit system

## Deployment Options

### Option 1: Traditional VPS/Server
- Upload files to your server
- Install Node.js and PostgreSQL
- Set environment variables
- Run with PM2 or similar process manager

### Option 2: Docker (Recommended)
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "start"]
```

### Option 3: Cloud Platforms
- **Vercel**: Frontend deployment with serverless functions
- **Railway**: Full-stack deployment with PostgreSQL
- **DigitalOcean App Platform**: Container-based deployment
- **AWS/Google Cloud**: VM or container deployment

## Important Notes
- All AI API keys must be configured for full functionality
- PostgreSQL database is required (no SQLite support)
- Audio generation requires OpenAI API key for text-to-speech
- PayPal integration is optional for payment processing

## Troubleshooting
- If podcast generation fails, check OpenAI API key and ensure sufficient credits
- For database connection issues, verify PostgreSQL is running and credentials are correct
- Logic keyboard requires proper Unicode symbol rendering in the browser

## Support
This export includes all source code, database schema, and configuration needed to run independently of Replit.