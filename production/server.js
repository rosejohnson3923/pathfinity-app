/**
 * PATHFINITY PRODUCTION SERVER
 * Enterprise-grade production server with monitoring, security, and performance optimization
 */

const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const cluster = require('cluster');
const os = require('os');

// Import monitoring and health check modules
const monitoring = require('./monitoring');
const healthCheck = require('./healthcheck');

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'production';

// ================================================================
// CLUSTER SETUP FOR HIGH AVAILABILITY
// ================================================================
if (cluster.isMaster && NODE_ENV === 'production') {
    const numWorkers = Math.min(os.cpus().length, 4); // Limit to 4 workers
    
    console.log(`🚀 Starting Pathfinity in cluster mode with ${numWorkers} workers`);
    
    // Fork workers
    for (let i = 0; i < numWorkers; i++) {
        cluster.fork();
    }
    
    // Handle worker crashes
    cluster.on('exit', (worker, code, signal) => {
        console.error(`💥 Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
        console.log('🔄 Starting a new worker...');
        cluster.fork();
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('📝 Received SIGTERM, shutting down gracefully...');
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }
    });
    
    return;
}

// ================================================================
// SECURITY MIDDLEWARE
// ================================================================

// Helmet for security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://api.pathfinity.ai"],
            mediaSrc: ["'self'"],
            objectSrc: ["'none'"],
            frameSrc: ["'none'"]
        }
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['https://pathfinity.ai'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Limit each IP to 1000 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.warn(`🚨 Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            error: 'Too many requests from this IP, please try again later.',
            retryAfter: '15 minutes'
        });
    }
});

app.use('/api', limiter);

// ================================================================
// LOGGING AND MONITORING
// ================================================================

// Create logs directory
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Morgan logging with custom format
const logFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms';

app.use(morgan(logFormat, {
    stream: fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' })
}));

// Console logging for development
if (NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Initialize monitoring
monitoring.init(app);

// ================================================================
// PERFORMANCE MIDDLEWARE
// ================================================================

// Compression
app.use(compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    level: 6,
    threshold: 1024
}));

// Body parsing with limits
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Static file serving with caching
app.use(express.static(path.join(__dirname, '../dist'), {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, filePath) => {
        if (path.extname(filePath) === '.html') {
            res.setHeader('Cache-Control', 'no-cache');
        }
    }
}));

// ================================================================
// HEALTH CHECKS AND MONITORING ENDPOINTS
// ================================================================

// Health check endpoint
app.get('/health', healthCheck.basic);
app.get('/health/detailed', healthCheck.detailed);
app.get('/health/ready', healthCheck.readiness);
app.get('/health/live', healthCheck.liveness);

// Metrics endpoint for Prometheus
app.get('/metrics', monitoring.getMetrics);

// Status endpoint
app.get('/status', (req, res) => {
    res.json({
        service: 'Pathfinity AI Education Platform',
        version: process.env.npm_package_version || '1.0.0',
        environment: NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        worker: process.pid
    });
});

// ================================================================
// API ROUTES
// ================================================================

// AI Character routes
app.use('/api/characters', require('./routes/characters'));

// Learning analytics routes
app.use('/api/analytics', require('./routes/analytics'));

// Assessment routes
app.use('/api/assessments', require('./routes/assessments'));

// Content generation routes
app.use('/api/content', require('./routes/content'));

// Student profile routes
app.use('/api/students', require('./routes/students'));

// Authentication routes
app.use('/api/auth', require('./routes/auth'));

// ================================================================
// SPA ROUTING (MUST BE LAST)
# ================================================================

// Serve React app for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'), (err) => {
        if (err) {
            console.error('Error serving index.html:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });
});

// ================================================================
// ERROR HANDLING
# ================================================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        error: 'API endpoint not found',
        path: req.path,
        method: req.method
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('🚨 Unhandled error:', err);
    
    // Log error details
    const errorDetails = {
        message: err.message,
        stack: err.stack,
        url: req.url,
        method: req.method,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
    };
    
    fs.appendFileSync(
        path.join(logsDir, 'error.log'),
        JSON.stringify(errorDetails) + '\n'
    );
    
    // Send appropriate response
    if (req.path.startsWith('/api/')) {
        res.status(err.status || 500).json({
            error: NODE_ENV === 'production' ? 'Internal server error' : err.message,
            ...(NODE_ENV !== 'production' && { stack: err.stack })
        });
    } else {
        res.status(500).sendFile(path.join(__dirname, '../dist/index.html'));
    }
});

// ================================================================
// SERVER STARTUP
# ================================================================

const server = app.listen(PORT, () => {
    console.log(`
    🎓 Pathfinity AI Education Platform
    🚀 Server running on port ${PORT}
    🌍 Environment: ${NODE_ENV}
    👨‍💻 Worker PID: ${process.pid}
    📅 Started: ${new Date().toISOString()}
    
    🔗 Health Check: http://localhost:${PORT}/health
    📊 Metrics: http://localhost:${PORT}/metrics
    🎯 API Base: http://localhost:${PORT}/api
    `);
});

// ================================================================
// GRACEFUL SHUTDOWN
# ================================================================

const gracefulShutdown = (signal) => {
    console.log(`📝 Received ${signal}, shutting down gracefully...`);
    
    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        
        // Close database connections, Redis, etc.
        monitoring.cleanup();
        
        process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('⏰ Forced shutdown due to timeout');
        process.exit(1);
    }, 30000);
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown('unhandledRejection');
});

module.exports = app;