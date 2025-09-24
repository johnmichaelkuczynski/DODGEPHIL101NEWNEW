# Migration Guide: Moving from Replit

## Quick Start (Docker - Recommended)

1. **Download/Clone your code**
2. **Create `.env` file** (see EXPORT_README.md for template)
3. **Run with Docker:**
   ```bash
   docker-compose up -d
   ```
4. **Access at:** http://localhost:5000

## Manual Setup

### 1. Database Setup (PostgreSQL)

#### Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```bash
sudo -u postgres createdb logic101
sudo -u postgres createuser --interactive yourusername
```

#### Set Database URL
```env
DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/logic101
```

### 2. Node.js Setup

#### Install Node.js 18+
```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from https://nodejs.org/
```

#### Install Dependencies & Run
```bash
npm install
npm run db:push  # Create database tables
npm run build    # Build the application
npm run start    # Start production server
```

### 3. API Keys Setup

You'll need these API keys for full functionality:

#### OpenAI (Required for podcasts)
1. Go to https://platform.openai.com/api-keys
2. Create new secret key
3. Add to `.env`: `OPENAI_API_KEY=sk-...`

#### Anthropic Claude (Optional)
1. Go to https://console.anthropic.com/
2. Create API key
3. Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

#### DeepSeek (Optional but recommended - cheaper)
1. Go to https://platform.deepseek.com/
2. Create API key
3. Add to `.env`: `DEEPSEEK_API_KEY=sk-...`

#### Perplexity (Optional)
1. Go to https://www.perplexity.ai/settings/api
2. Generate API key
3. Add to `.env`: `PERPLEXITY_API_KEY=pplx-...`

## Deployment Options

### Option 1: DigitalOcean App Platform (Easy)
1. Create DigitalOcean account
2. Connect GitHub repo
3. Add environment variables in dashboard
4. Deploy automatically

### Option 2: Railway (Easy)
1. Connect GitHub to Railway
2. Add PostgreSQL service
3. Set environment variables
4. Deploy with one click

### Option 3: AWS/Google Cloud (Advanced)
1. Use container deployment
2. Set up managed PostgreSQL
3. Configure load balancer
4. Set up environment variables

### Option 4: Traditional VPS
1. Rent VPS (DigitalOcean Droplet, Linode, etc.)
2. Install Node.js and PostgreSQL
3. Upload code and configure
4. Use PM2 for process management

## Common Issues & Solutions

### Database Connection Errors
- Ensure PostgreSQL is running: `sudo service postgresql start`
- Check connection string format
- Verify database exists: `psql -l`

### Build Failures
- Ensure Node.js 18+ is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### API Key Issues
- Verify keys are correctly formatted
- Check API key permissions and credits
- Test API keys independently first

### Port Already in Use
- Change port in package.json scripts
- Kill existing processes: `lsof -ti:5000 | xargs kill`

## Production Checklist
- [ ] All environment variables set
- [ ] Database schema migrated (`npm run db:push`)
- [ ] API keys working and have sufficient credits
- [ ] SSL certificate configured (for HTTPS)
- [ ] Process manager configured (PM2, systemd, or Docker)
- [ ] Backup strategy for database
- [ ] Monitoring/logging set up

## Getting Git Working Again

If you need to restore Git functionality:

```bash
# Initialize new git repo
git init

# Add your remote repository
git remote add origin https://github.com/yourusername/logic101-app.git

# Add all files
git add .

# Make initial commit
git commit -m "Export from Replit - Logic 101 Application"

# Push to your repository
git push -u origin main
```

Your application is now completely independent of Replit and can be hosted anywhere!