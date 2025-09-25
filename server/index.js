/**
 * Pathfinity Backend API Server
 * Handles secure Azure Storage operations
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });
// Also load main .env for Supabase credentials
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Import routes
const cacheRoutes = require('./routes/cache');
const healthRoutes = require('./routes/health');
const sessionRoutes = require('./routes/sessions');

// Import chat routes with WebSocket
let chatRoutes, setupWebSocketServer;
try {
  console.log('📦 Loading chat module from:', path.join(__dirname, 'routes', 'chat.js'));
  const chatModule = require('./routes/chat');
  console.log('📦 Chat module loaded, checking exports...');
  chatRoutes = chatModule.router;
  setupWebSocketServer = chatModule.setupWebSocketServer;
  console.log('✅ Chat module loaded successfully');
  console.log('   Router:', typeof chatRoutes);
  console.log('   WebSocket setup:', typeof setupWebSocketServer);
} catch (error) {
  console.error('❌ Failed to load chat module:', error);
  console.error('   Stack:', error.stack);
  // Provide fallback functions
  chatRoutes = require('express').Router();
  setupWebSocketServer = () => console.log('⚠️ WebSocket server not initialized (chat module failed to load)');
}

const app = express();
const PORT = process.env.PORT || 3002;

// Create HTTP server for WebSocket support
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow all localhost origins for development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }

    // Allow configured frontend URL
    const allowedOrigins = process.env.FRONTEND_URL ?
      [process.env.FRONTEND_URL] :
      ['http://localhost:3000', 'http://localhost:5173'];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins for now during development
    }
  },
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
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Setup WebSocket server
console.log('🔌 Setting up WebSocket server...');
console.log('   setupWebSocketServer type:', typeof setupWebSocketServer);
if (setupWebSocketServer) {
  try {
    const wss = setupWebSocketServer(server);
    console.log('🔌 WebSocket server initialized successfully');
    console.log('   WebSocket Server:', wss ? 'Created' : 'Not created');
  } catch (error) {
    console.error('❌ WebSocket setup failed:', error);
    console.error('   Stack:', error.stack);
  }
} else {
  console.log('⚠️ No WebSocket setup function available');
}

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Pathfinity API Server running on port ${PORT}`);
  console.log(`📦 Azure Storage Account: pathfinitystorage`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}/ws/chat`);
});