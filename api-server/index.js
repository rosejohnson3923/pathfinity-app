/**
 * Pathfinity Backend API Server
 * Handles secure Azure Storage operations
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
dotenv.config({ path: path.join(__dirname, '..', '.env') }); // Also load main .env for Azure keys

// Import routes
const cacheRoutes = require('./routes/cache');
const healthRoutes = require('./routes/health');
const ttsRoutes = require('./routes/tts');
const chatRoutes = require('./routes/chat').router;

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/cache', cacheRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Pathfinity API Server running on port ${PORT}`);
  console.log(`📦 Azure Storage Account: pathfinitystorage`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});