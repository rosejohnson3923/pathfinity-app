/**
 * PathIQ™ Server-Side License Validation
 * Copyright (c) 2024 Esposure Inc. All rights reserved.
 * 
 * This is a Node.js/Express endpoint for license validation
 * Deploy this on your secure backend server
 */

const express = require('express');
const crypto = require('crypto');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: ['https://pathfinity.ai', 'https://www.pathfinity.ai', 'https://app.pathfinity.ai'],
  credentials: true
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

app.use('/api/validate-license', limiter);

// License database (in production, use a real database)
const licenses = {
  'PATHIQ-2024-PROD-001': {
    domain: 'pathfinity.ai',
    expiresAt: '2025-12-31',
    features: ['full_access', 'esa_features', 'pathiq_intelligence'],
    maxFingerprints: 1000,
    fingerprints: new Set()
  },
  'PATHIQ-2024-DEMO-001': {
    domain: 'localhost',
    expiresAt: '2024-12-31',
    features: ['demo_access'],
    maxFingerprints: 10,
    fingerprints: new Set()
  }
};

// Security logs database (in production, use a real database)
const securityLogs = [];

/**
 * Validate license endpoint
 */
app.post('/api/validate-license', async (req, res) => {
  const { licenseKey, domain, fingerprint, timestamp } = req.body;
  
  // Log the validation attempt
  const logEntry = {
    timestamp: new Date().toISOString(),
    licenseKey: licenseKey ? licenseKey.substring(0, 10) + '...' : 'none',
    domain,
    fingerprint,
    ip: req.ip,
    userAgent: req.headers['user-agent']
  };
  
  securityLogs.push(logEntry);
  
  // Validate required fields
  if (!licenseKey || !domain || !fingerprint) {
    return res.status(400).json({
      valid: false,
      error: 'Missing required fields'
    });
  }
  
  // Check if license exists
  const license = licenses[licenseKey];
  if (!license) {
    return res.status(401).json({
      valid: false,
      error: 'Invalid license key'
    });
  }
  
  // Check domain
  if (!domain.includes(license.domain) && license.domain !== 'localhost') {
    return res.status(401).json({
      valid: false,
      error: 'Domain not authorized for this license'
    });
  }
  
  // Check expiration
  const expirationDate = new Date(license.expiresAt);
  if (new Date() > expirationDate) {
    return res.status(401).json({
      valid: false,
      error: 'License expired'
    });
  }
  
  // Check fingerprint limit
  license.fingerprints.add(fingerprint);
  if (license.fingerprints.size > license.maxFingerprints) {
    return res.status(401).json({
      valid: false,
      error: 'Maximum device limit exceeded'
    });
  }
  
  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  
  // Return success
  res.json({
    valid: true,
    sessionToken,
    features: license.features,
    expiresAt: license.expiresAt,
    message: 'License validated successfully'
  });
});

/**
 * Security log endpoint
 */
app.post('/api/security-log', (req, res) => {
  const { event, timestamp, fingerprint, url, userAgent } = req.body;
  
  const logEntry = {
    event,
    timestamp,
    fingerprint,
    url,
    userAgent,
    ip: req.ip,
    serverTime: new Date().toISOString()
  };
  
  securityLogs.push(logEntry);
  
  // In production, send alerts for critical events
  if (event === 'tampering_detected' || event === 'invalid_license') {
    // Send alert to admin
    console.error('SECURITY ALERT:', logEntry);
  }
  
  res.json({ logged: true });
});

/**
 * Admin endpoint to view logs (protect this in production!)
 */
app.get('/api/admin/logs', (req, res) => {
  // In production, require authentication
  const authToken = req.headers.authorization;
  if (authToken !== 'Bearer ADMIN_SECRET_TOKEN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  res.json({
    logs: securityLogs.slice(-100), // Last 100 logs
    totalLogs: securityLogs.length
  });
});

/**
 * Admin endpoint to add/update licenses (protect this in production!)
 */
app.post('/api/admin/license', (req, res) => {
  // In production, require authentication
  const authToken = req.headers.authorization;
  if (authToken !== 'Bearer ADMIN_SECRET_TOKEN') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { licenseKey, licenseData } = req.body;
  
  if (!licenseKey || !licenseData) {
    return res.status(400).json({ error: 'Missing license data' });
  }
  
  licenses[licenseKey] = {
    ...licenseData,
    fingerprints: new Set()
  };
  
  res.json({
    success: true,
    message: 'License added/updated successfully'
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'PathIQ License Validator',
    timestamp: new Date().toISOString()
  });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`PathIQ™ License Validator running on port ${PORT}`);
  console.log('© 2024 Esposure Inc. All rights reserved.');
});

module.exports = app;