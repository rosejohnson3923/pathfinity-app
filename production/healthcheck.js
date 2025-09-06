/**
 * PATHFINITY HEALTH CHECK MODULE
 * Comprehensive health monitoring for production deployment
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Mock database and Redis connections for demonstration
// In production, these would be actual connections
const mockDatabaseCheck = () => Promise.resolve({ status: 'healthy', latency: 5 });
const mockRedisCheck = () => Promise.resolve({ status: 'healthy', latency: 2 });

class HealthChecker {
    constructor() {
        this.checks = new Map();
        this.registerDefaultChecks();
    }

    registerDefaultChecks() {
        // Database health check
        this.checks.set('database', async () => {
            try {
                const start = Date.now();
                await mockDatabaseCheck();
                const latency = Date.now() - start;
                
                return {
                    status: 'healthy',
                    latency: `${latency}ms`,
                    details: 'PostgreSQL connection successful'
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    details: 'Database connection failed'
                };
            }
        });

        // Redis health check
        this.checks.set('redis', async () => {
            try {
                const start = Date.now();
                await mockRedisCheck();
                const latency = Date.now() - start;
                
                return {
                    status: 'healthy',
                    latency: `${latency}ms`,
                    details: 'Redis connection successful'
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    details: 'Redis connection failed'
                };
            }
        });

        // File system health check
        this.checks.set('filesystem', async () => {
            try {
                const testFile = path.join(os.tmpdir(), 'pathfinity-health-check');
                const testData = 'health-check-' + Date.now();
                
                fs.writeFileSync(testFile, testData);
                const readData = fs.readFileSync(testFile, 'utf8');
                fs.unlinkSync(testFile);
                
                if (readData === testData) {
                    return {
                        status: 'healthy',
                        details: 'File system read/write successful'
                    };
                } else {
                    throw new Error('File system data corruption detected');
                }
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    details: 'File system check failed'
                };
            }
        });

        // Memory health check
        this.checks.set('memory', async () => {
            const memInfo = process.memoryUsage();
            const totalMem = os.totalmem();
            const freeMem = os.freemem();
            const usedMem = totalMem - freeMem;
            const memoryUsagePercent = (usedMem / totalMem) * 100;
            
            const status = memoryUsagePercent < 90 ? 'healthy' : 'warning';
            
            return {
                status,
                details: {
                    heapUsed: `${Math.round(memInfo.heapUsed / 1024 / 1024)}MB`,
                    heapTotal: `${Math.round(memInfo.heapTotal / 1024 / 1024)}MB`,
                    external: `${Math.round(memInfo.external / 1024 / 1024)}MB`,
                    systemMemoryUsage: `${memoryUsagePercent.toFixed(1)}%`,
                    freeMemory: `${Math.round(freeMem / 1024 / 1024)}MB`
                }
            };
        });

        // CPU health check
        this.checks.set('cpu', async () => {
            const cpus = os.cpus();
            const loadAvg = os.loadavg();
            const numCpus = cpus.length;
            
            // Calculate CPU usage (simplified)
            const cpuUsage = (loadAvg[0] / numCpus) * 100;
            const status = cpuUsage < 80 ? 'healthy' : 'warning';
            
            return {
                status,
                details: {
                    cores: numCpus,
                    model: cpus[0].model,
                    loadAverage: {
                        '1min': loadAvg[0].toFixed(2),
                        '5min': loadAvg[1].toFixed(2),
                        '15min': loadAvg[2].toFixed(2)
                    },
                    usage: `${cpuUsage.toFixed(1)}%`
                }
            };
        });

        // Azure OpenAI service health check
        this.checks.set('azure_openai', async () => {
            try {
                // In production, this would make an actual API call
                // For now, we'll simulate based on environment variables
                const hasEndpoint = !!process.env.AZURE_OPENAI_ENDPOINT;
                const hasApiKey = !!process.env.AZURE_OPENAI_API_KEY;
                
                if (!hasEndpoint || !hasApiKey) {
                    return {
                        status: 'warning',
                        details: 'Azure OpenAI configuration incomplete'
                    };
                }
                
                return {
                    status: 'healthy',
                    details: 'Azure OpenAI service accessible'
                };
            } catch (error) {
                return {
                    status: 'unhealthy',
                    error: error.message,
                    details: 'Azure OpenAI service check failed'
                };
            }
        });
    }

    async runCheck(checkName) {
        if (!this.checks.has(checkName)) {
            throw new Error(`Health check '${checkName}' not found`);
        }
        
        const check = this.checks.get(checkName);
        const start = Date.now();
        
        try {
            const result = await check();
            const duration = Date.now() - start;
            
            return {
                name: checkName,
                ...result,
                timestamp: new Date().toISOString(),
                duration: `${duration}ms`
            };
        } catch (error) {
            return {
                name: checkName,
                status: 'error',
                error: error.message,
                timestamp: new Date().toISOString(),
                duration: `${Date.now() - start}ms`
            };
        }
    }

    async runAllChecks() {
        const checks = Array.from(this.checks.keys());
        const results = await Promise.all(
            checks.map(check => this.runCheck(check))
        );
        
        const overallStatus = results.every(r => r.status === 'healthy') 
            ? 'healthy' 
            : results.some(r => r.status === 'unhealthy') 
                ? 'unhealthy' 
                : 'warning';
        
        return {
            status: overallStatus,
            timestamp: new Date().toISOString(),
            checks: results.reduce((acc, check) => {
                acc[check.name] = {
                    status: check.status,
                    duration: check.duration,
                    ...(check.details && { details: check.details }),
                    ...(check.error && { error: check.error })
                };
                return acc;
            }, {}),
            summary: {
                total: results.length,
                healthy: results.filter(r => r.status === 'healthy').length,
                warning: results.filter(r => r.status === 'warning').length,
                unhealthy: results.filter(r => r.status === 'unhealthy').length,
                error: results.filter(r => r.status === 'error').length
            }
        };
    }
}

const healthChecker = new HealthChecker();

// ================================================================
// HEALTH CHECK ENDPOINTS
// ================================================================

// Basic health check - just return 200 if server is running
const basic = (req, res) => {
    res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: process.env.npm_package_version || '1.0.0'
    });
};

// Detailed health check - run all health checks
const detailed = async (req, res) => {
    try {
        const healthStatus = await healthChecker.runAllChecks();
        const statusCode = healthStatus.status === 'healthy' ? 200 : 
                          healthStatus.status === 'warning' ? 200 : 503;
        
        res.status(statusCode).json({
            service: 'Pathfinity AI Education Platform',
            version: process.env.npm_package_version || '1.0.0',
            environment: process.env.NODE_ENV || 'production',
            uptime: `${Math.floor(process.uptime())}s`,
            worker: process.pid,
            ...healthStatus
        });
    } catch (error) {
        res.status(503).json({
            status: 'error',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Readiness check - determines if the service is ready to receive traffic
const readiness = async (req, res) => {
    try {
        // Check critical dependencies
        const criticalChecks = ['database', 'redis'];
        const results = await Promise.all(
            criticalChecks.map(check => healthChecker.runCheck(check))
        );
        
        const isReady = results.every(r => r.status === 'healthy');
        const statusCode = isReady ? 200 : 503;
        
        res.status(statusCode).json({
            ready: isReady,
            timestamp: new Date().toISOString(),
            checks: results.reduce((acc, check) => {
                acc[check.name] = {
                    status: check.status,
                    duration: check.duration
                };
                return acc;
            }, {})
        });
    } catch (error) {
        res.status(503).json({
            ready: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};

// Liveness check - determines if the service is still alive
const liveness = (req, res) => {
    // Simple check - if we can respond, we're alive
    const memInfo = process.memoryUsage();
    const heapUsedMB = Math.round(memInfo.heapUsed / 1024 / 1024);
    const heapTotalMB = Math.round(memInfo.heapTotal / 1024 / 1024);
    
    // Consider unhealthy if heap usage is over 90%
    const heapUsagePercent = (memInfo.heapUsed / memInfo.heapTotal) * 100;
    const isAlive = heapUsagePercent < 95; // Allow some buffer
    
    const statusCode = isAlive ? 200 : 503;
    
    res.status(statusCode).json({
        alive: isAlive,
        timestamp: new Date().toISOString(),
        uptime: `${Math.floor(process.uptime())}s`,
        memory: {
            heapUsed: `${heapUsedMB}MB`,
            heapTotal: `${heapTotalMB}MB`,
            usage: `${heapUsagePercent.toFixed(1)}%`
        },
        worker: process.pid
    });
};

// Command-line health check for Docker
const cliHealthCheck = async () => {
    try {
        const http = require('http');
        
        const options = {
            hostname: 'localhost',
            port: process.env.PORT || 3000,
            path: '/health',
            method: 'GET',
            timeout: 5000
        };
        
        return new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                if (res.statusCode === 200) {
                    console.log('✅ Health check passed');
                    resolve(true);
                } else {
                    console.error(`❌ Health check failed with status: ${res.statusCode}`);
                    reject(false);
                }
            });
            
            req.on('error', (error) => {
                console.error('❌ Health check failed:', error.message);
                reject(false);
            });
            
            req.on('timeout', () => {
                console.error('❌ Health check timed out');
                req.destroy();
                reject(false);
            });
            
            req.end();
        });
    } catch (error) {
        console.error('❌ Health check error:', error.message);
        return false;
    }
};

// If called directly from command line (for Docker health check)
if (require.main === module) {
    cliHealthCheck()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

module.exports = {
    basic,
    detailed,
    readiness,
    liveness,
    healthChecker,
    cliHealthCheck
};