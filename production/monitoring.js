/**
 * PATHFINITY PRODUCTION MONITORING MODULE
 * Comprehensive monitoring, metrics collection, and performance tracking
 */

const prometheus = require('prom-client');
const responseTime = require('response-time');
const onFinished = require('on-finished');

class ProductionMonitoring {
    constructor() {
        this.register = new prometheus.Registry();
        this.metrics = {};
        this.initializeMetrics();
        this.setupPrometheusDefaults();
    }

    initializeMetrics() {
        // ================================================================
        // HTTP METRICS
        // ================================================================

        // HTTP request duration histogram
        this.metrics.httpRequestDuration = new prometheus.Histogram({
            name: 'pathfinity_http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [0.1, 0.5, 1, 2, 5, 10, 30, 60]
        });

        // HTTP request counter
        this.metrics.httpRequestsTotal = new prometheus.Counter({
            name: 'pathfinity_http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code']
        });

        // HTTP request size histogram
        this.metrics.httpRequestSize = new prometheus.Histogram({
            name: 'pathfinity_http_request_size_bytes',
            help: 'Size of HTTP requests in bytes',
            labelNames: ['method', 'route'],
            buckets: [100, 1000, 10000, 100000, 1000000]
        });

        // HTTP response size histogram
        this.metrics.httpResponseSize = new prometheus.Histogram({
            name: 'pathfinity_http_response_size_bytes',
            help: 'Size of HTTP responses in bytes',
            labelNames: ['method', 'route', 'status_code'],
            buckets: [100, 1000, 10000, 100000, 1000000]
        });

        // ================================================================
        // AI CHARACTER METRICS
        // ================================================================

        // AI character interactions counter
        this.metrics.aiInteractionsTotal = new prometheus.Counter({
            name: 'pathfinity_ai_interactions_total',
            help: 'Total number of AI character interactions',
            labelNames: ['character', 'interaction_type', 'grade_level']
        });

        // AI response time histogram
        this.metrics.aiResponseTime = new prometheus.Histogram({
            name: 'pathfinity_ai_response_time_seconds',
            help: 'Time taken for AI character responses',
            labelNames: ['character', 'model'],
            buckets: [0.5, 1, 2, 5, 10, 15, 30]
        });

        // AI token usage histogram
        this.metrics.aiTokenUsage = new prometheus.Histogram({
            name: 'pathfinity_ai_tokens_used',
            help: 'Number of tokens used in AI interactions',
            labelNames: ['character', 'model', 'request_type'],
            buckets: [10, 50, 100, 500, 1000, 2000, 5000]
        });

        // AI cost tracking
        this.metrics.aiCostTotal = new prometheus.Counter({
            name: 'pathfinity_ai_cost_cents_total',
            help: 'Total AI API costs in cents',
            labelNames: ['character', 'model']
        });

        // ================================================================
        // LEARNING ANALYTICS METRICS
        // ================================================================

        // Learning events counter
        this.metrics.learningEventsTotal = new prometheus.Counter({
            name: 'pathfinity_learning_events_total',
            help: 'Total number of learning events',
            labelNames: ['event_type', 'grade_level', 'subject']
        });

        // Assessment submissions counter
        this.metrics.assessmentSubmissions = new prometheus.Counter({
            name: 'pathfinity_assessment_submissions_total',
            help: 'Total number of assessment submissions',
            labelNames: ['assessment_type', 'grade_level', 'subject']
        });

        // Student mastery score histogram
        this.metrics.studentMasteryScore = new prometheus.Histogram({
            name: 'pathfinity_student_mastery_score',
            help: 'Distribution of student mastery scores',
            labelNames: ['subject', 'grade_level'],
            buckets: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]
        });

        // Content generation counter
        this.metrics.contentGenerated = new prometheus.Counter({
            name: 'pathfinity_content_generated_total',
            help: 'Total number of AI-generated content pieces',
            labelNames: ['content_type', 'grade_level', 'subject']
        });

        // ================================================================
        // SYSTEM METRICS
        // ================================================================

        // Active users gauge
        this.metrics.activeUsers = new prometheus.Gauge({
            name: 'pathfinity_active_users',
            help: 'Number of currently active users',
            labelNames: ['user_type']
        });

        // Database connection pool gauge
        this.metrics.dbConnections = new prometheus.Gauge({
            name: 'pathfinity_database_connections',
            help: 'Number of active database connections'
        });

        // Memory usage gauge
        this.metrics.memoryUsage = new prometheus.Gauge({
            name: 'pathfinity_memory_usage_bytes',
            help: 'Memory usage in bytes',
            labelNames: ['type'] // heap_used, heap_total, external, rss
        });

        // Event loop lag gauge
        this.metrics.eventLoopLag = new prometheus.Gauge({
            name: 'pathfinity_event_loop_lag_seconds',
            help: 'Event loop lag in seconds'
        });

        // Cache hit rate
        this.metrics.cacheHitRate = new prometheus.Gauge({
            name: 'pathfinity_cache_hit_rate',
            help: 'Cache hit rate percentage',
            labelNames: ['cache_type']
        });

        // ================================================================
        // ERROR METRICS
        // ================================================================

        // Application errors counter
        this.metrics.errorsTotal = new prometheus.Counter({
            name: 'pathfinity_errors_total',
            help: 'Total number of application errors',
            labelNames: ['error_type', 'component', 'severity']
        });

        // Database errors counter
        this.metrics.databaseErrors = new prometheus.Counter({
            name: 'pathfinity_database_errors_total',
            help: 'Total number of database errors',
            labelNames: ['operation', 'error_type']
        });

        // AI service errors counter
        this.metrics.aiServiceErrors = new prometheus.Counter({
            name: 'pathfinity_ai_service_errors_total',
            help: 'Total number of AI service errors',
            labelNames: ['service', 'error_type']
        });

        // Register all metrics
        Object.values(this.metrics).forEach(metric => {
            this.register.registerMetric(metric);
        });
    }

    setupPrometheusDefaults() {
        // Collect default Node.js metrics
        prometheus.collectDefaultMetrics({
            register: this.register,
            prefix: 'pathfinity_nodejs_',
            timeout: 5000
        });
    }

    // ================================================================
    // MIDDLEWARE FUNCTIONS
    // ================================================================

    httpMetricsMiddleware() {
        return (req, res, next) => {
            const start = Date.now();
            const route = this.normalizeRoute(req.route?.path || req.path);
            
            // Track request size
            if (req.get('content-length')) {
                this.metrics.httpRequestSize
                    .labels(req.method, route)
                    .observe(parseInt(req.get('content-length')));
            }

            // Track response when finished
            onFinished(res, () => {
                const duration = (Date.now() - start) / 1000;
                const statusCode = res.statusCode.toString();
                
                // Update metrics
                this.metrics.httpRequestDuration
                    .labels(req.method, route, statusCode)
                    .observe(duration);
                
                this.metrics.httpRequestsTotal
                    .labels(req.method, route, statusCode)
                    .inc();

                // Track response size
                if (res.get('content-length')) {
                    this.metrics.httpResponseSize
                        .labels(req.method, route, statusCode)
                        .observe(parseInt(res.get('content-length')));
                }
            });

            next();
        };
    }

    responseTimeMiddleware() {
        return responseTime((req, res, time) => {
            const route = this.normalizeRoute(req.route?.path || req.path);
            this.metrics.httpRequestDuration
                .labels(req.method, route, res.statusCode.toString())
                .observe(time / 1000);
        });
    }

    // ================================================================
    // TRACKING METHODS
    // ================================================================

    trackAIInteraction(character, interactionType, gradeLevel, responseTime, tokens, cost, model) {
        this.metrics.aiInteractionsTotal
            .labels(character, interactionType, gradeLevel)
            .inc();

        if (responseTime) {
            this.metrics.aiResponseTime
                .labels(character, model)
                .observe(responseTime);
        }

        if (tokens) {
            this.metrics.aiTokenUsage
                .labels(character, model, interactionType)
                .observe(tokens);
        }

        if (cost) {
            this.metrics.aiCostTotal
                .labels(character, model)
                .inc(cost);
        }
    }

    trackLearningEvent(eventType, gradeLevel, subject) {
        this.metrics.learningEventsTotal
            .labels(eventType, gradeLevel, subject)
            .inc();
    }

    trackAssessmentSubmission(assessmentType, gradeLevel, subject) {
        this.metrics.assessmentSubmissions
            .labels(assessmentType, gradeLevel, subject)
            .inc();
    }

    trackStudentMastery(subject, gradeLevel, score) {
        this.metrics.studentMasteryScore
            .labels(subject, gradeLevel)
            .observe(score);
    }

    trackContentGeneration(contentType, gradeLevel, subject) {
        this.metrics.contentGenerated
            .labels(contentType, gradeLevel, subject)
            .inc();
    }

    trackError(errorType, component, severity) {
        this.metrics.errorsTotal
            .labels(errorType, component, severity)
            .inc();
    }

    trackDatabaseError(operation, errorType) {
        this.metrics.databaseErrors
            .labels(operation, errorType)
            .inc();
    }

    trackAIServiceError(service, errorType) {
        this.metrics.aiServiceErrors
            .labels(service, errorType)
            .inc();
    }

    updateActiveUsers(userType, count) {
        this.metrics.activeUsers
            .labels(userType)
            .set(count);
    }

    updateDatabaseConnections(count) {
        this.metrics.dbConnections.set(count);
    }

    updateCacheHitRate(cacheType, rate) {
        this.metrics.cacheHitRate
            .labels(cacheType)
            .set(rate);
    }

    // ================================================================
    // SYSTEM MONITORING
    // ================================================================

    startSystemMonitoring() {
        // Update memory usage every 10 seconds
        setInterval(() => {
            const memInfo = process.memoryUsage();
            this.metrics.memoryUsage.labels('heap_used').set(memInfo.heapUsed);
            this.metrics.memoryUsage.labels('heap_total').set(memInfo.heapTotal);
            this.metrics.memoryUsage.labels('external').set(memInfo.external);
            this.metrics.memoryUsage.labels('rss').set(memInfo.rss);
        }, 10000);

        // Monitor event loop lag
        let lastTime = process.hrtime.bigint();
        setInterval(() => {
            const currentTime = process.hrtime.bigint();
            const lag = Number(currentTime - lastTime - 1000000000n) / 1e9;
            this.metrics.eventLoopLag.set(Math.max(0, lag));
            lastTime = currentTime;
        }, 1000);
    }

    // ================================================================
    // UTILITY METHODS
    // ================================================================

    normalizeRoute(path) {
        if (!path) return 'unknown';
        
        // Normalize dynamic routes
        return path
            .replace(/\/\d+/g, '/:id')
            .replace(/\/[a-f0-9-]{36}/g, '/:uuid')
            .replace(/\/[a-zA-Z0-9_-]+\.(js|css|png|jpg|gif|ico|svg|woff|woff2|ttf|eot)/g, '/static')
            || '/';
    }

    async getMetrics() {
        return await this.register.metrics();
    }

    // ================================================================
    // INITIALIZATION AND CLEANUP
    // ================================================================

    init(app) {
        console.log('🔧 Initializing production monitoring...');
        
        // Add middleware
        app.use(this.httpMetricsMiddleware());
        app.use(this.responseTimeMiddleware());
        
        // Start system monitoring
        this.startSystemMonitoring();
        
        console.log('✅ Production monitoring initialized');
    }

    cleanup() {
        console.log('🧹 Cleaning up monitoring resources...');
        this.register.clear();
    }
}

// Create singleton instance
const monitoring = new ProductionMonitoring();

// ================================================================
# EXPORT FUNCTIONS
# ================================================================

module.exports = {
    init: (app) => monitoring.init(app),
    getMetrics: () => monitoring.getMetrics(),
    cleanup: () => monitoring.cleanup(),
    
    // Tracking functions
    trackAIInteraction: (...args) => monitoring.trackAIInteraction(...args),
    trackLearningEvent: (...args) => monitoring.trackLearningEvent(...args),
    trackAssessmentSubmission: (...args) => monitoring.trackAssessmentSubmission(...args),
    trackStudentMastery: (...args) => monitoring.trackStudentMastery(...args),
    trackContentGeneration: (...args) => monitoring.trackContentGeneration(...args),
    trackError: (...args) => monitoring.trackError(...args),
    trackDatabaseError: (...args) => monitoring.trackDatabaseError(...args),
    trackAIServiceError: (...args) => monitoring.trackAIServiceError(...args),
    
    // Update functions
    updateActiveUsers: (...args) => monitoring.updateActiveUsers(...args),
    updateDatabaseConnections: (...args) => monitoring.updateDatabaseConnections(...args),
    updateCacheHitRate: (...args) => monitoring.updateCacheHitRate(...args),
    
    // Direct access to monitoring instance
    monitoring
};