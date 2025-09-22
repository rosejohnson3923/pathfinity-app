# Pathfinity Backend API Server

Backend API for handling secure Azure Storage operations.

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
The server uses the same `.env.local` file from the parent directory with:
```
AZURE_STORAGE_CONNECTION_STRING=your_connection_string
PORT=3001 (optional, defaults to 3001)
FRONTEND_URL=http://localhost:5173 (optional)
```

### 3. Run Locally
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Master Narrative
- `GET /api/cache/master-narrative/:key` - Retrieve Master Narrative
- `POST /api/cache/master-narrative` - Store Master Narrative

### Micro Content
- `GET /api/cache/micro-content/:type/:key` - Retrieve Micro Content
- `POST /api/cache/micro-content` - Store Micro Content

### Metrics
- `POST /api/cache/metrics` - Store usage metrics
- `GET /api/cache/stats` - Get cache statistics

## Deployment Options

### Option 1: Azure App Service
1. Create Azure App Service
2. Set environment variables in Configuration
3. Deploy via GitHub Actions or Azure CLI

### Option 2: Azure Functions
Convert endpoints to serverless functions for cost optimization

### Option 3: Docker Container
```bash
docker build -t pathfinity-api .
docker run -p 3001:3001 pathfinity-api
```

### Option 4: Vercel/Railway
Deploy as Node.js application with environment variables

## Security Notes

- **Never expose Azure Storage keys in frontend code**
- Add authentication middleware before production
- Use HTTPS in production
- Consider rate limiting for API endpoints
- Implement CORS properly for your domain

## Testing

Test the API locally:
```bash
# Health check
curl http://localhost:3001/api/health

# Get cache stats
curl http://localhost:3001/api/cache/stats
```