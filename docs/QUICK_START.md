# Pathfinity Quick Start Guide

## Prerequisites

Before running the database setup, you need:

### 1. Docker Desktop
- **Download**: https://docs.docker.com/desktop/
- **Why needed**: Supabase local development requires Docker
- **Installation**: Follow the official Docker installation guide for your OS

### 2. Node.js and npm
- **Version**: Node.js 18+ 
- **Check**: `node --version` and `npm --version`

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Docker Desktop
- Open Docker Desktop application
- Wait for it to fully start (green status indicator)

### 3. Initialize and Start Supabase
```bash
# Initialize Supabase (already done)
npx supabase init

# Start local Supabase instance
npx supabase start
```

This will output something like:
```
Started supabase local development setup.

         API URL: http://localhost:54321
     GraphQL URL: http://localhost:54321/graphql/v1
          DB URL: postgresql://postgres:postgres@localhost:54322/postgres
      Studio URL: http://localhost:54323
    Inbucket URL: http://localhost:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Update Environment Variables
Update `.env.local` with the keys from step 3:

```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 5. Run Database Setup
```bash
# Initialize database with schema and indexes
npm run db:setup

# Import curriculum data and generate test data
npm run db:full-setup

# Verify everything is working
npm run db:check
```

### 6. Start Development Server
```bash
npm run dev
```

## Alternative: Using Remote Supabase

If you prefer not to use local Supabase:

### 1. Create Supabase Project
- Go to https://supabase.com
- Create a new project
- Get your project URL and API keys

### 2. Update Environment
Update `.env.local` with your remote Supabase credentials:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Run Setup
```bash
npm run db:setup
npm run db:import-all-early
npm run db:seed
```

## Troubleshooting

### "Docker daemon not running"
- Start Docker Desktop
- Wait for it to fully initialize
- Try `docker ps` to verify it's working

### "supabaseKey is required"
- Check your `.env.local` file has the correct keys
- Make sure you copied the keys from `npx supabase start` output

### "Database connection failed"
- Verify Supabase is running: `npx supabase status`
- Check the URL in your environment variables

### "Missing tables"
- Run: `npx supabase db push`
- Then: `npm run db:setup`

## Success Indicators

When everything is working correctly:

1. **Supabase Status**: `npx supabase status` shows all services running
2. **Database Check**: `npm run db:check` passes all validations
3. **Studio Access**: http://localhost:54323 shows your database
4. **Skills Data**: Tables contain curriculum and test data

## Next Steps

After setup is complete:
- Explore the database in Supabase Studio (http://localhost:54323)
- Check out the imported skills data
- Review generated test student progress
- Start the development server with `npm run dev`