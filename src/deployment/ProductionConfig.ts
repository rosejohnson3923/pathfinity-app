/**
 * Production Deployment Configuration
 * Defines all requirements and setup for production deployment
 */

export interface ProductionDeploymentConfig {
  infrastructure: InfrastructureConfig;
  services: ServicesConfig;
  monitoring: MonitoringConfig;
  security: SecurityConfig;
  scaling: ScalingConfig;
  rollout: RolloutStrategy;
}

/**
 * 1. INFRASTRUCTURE REQUIREMENTS
 */
interface InfrastructureConfig {
  // Primary Services
  compute: {
    provider: 'AWS' | 'GCP' | 'Azure';
    instances: {
      type: string;              // e.g., 't3.large'
      minCount: number;           // Minimum 2 for HA
      maxCount: number;           // Auto-scaling max
      regions: string[];          // Multi-region deployment
    };
  };

  // Database Layer
  database: {
    primary: {
      type: 'PostgreSQL';
      version: string;
      instances: number;          // Read replicas
      backup: {
        frequency: 'hourly' | 'daily';
        retention: number;        // Days
      };
    };
    cache: {
      type: 'Redis';
      nodes: number;              // Cluster nodes
      memory: string;             // e.g., '16GB'
      evictionPolicy: 'LRU';
    };
  };

  // CDN for Static Assets
  cdn: {
    provider: 'CloudFlare' | 'CloudFront';
    locations: string[];          // Edge locations
    caching: {
      narratives: number;         // 30 days
      videos: number;             // 7 days
      static: number;             // 365 days
    };
  };

  // Load Balancer
  loadBalancer: {
    type: 'Application' | 'Network';
    healthCheck: {
      path: '/health';
      interval: number;           // Seconds
      timeout: number;
      unhealthyThreshold: number;
    };
  };
}

/**
 * 2. SERVICES CONFIGURATION
 */
interface ServicesConfig {
  // API Keys Management
  apiKeys: {
    storage: 'AWS Secrets Manager' | 'HashiCorp Vault';
    rotation: {
      enabled: boolean;
      frequency: number;          // Days
    };
    keys: {
      openai: {
        primary: string;          // Encrypted reference
        fallback: string;         // Backup key
        rateLimit: number;        // Requests per minute
      };
      youtube: {
        keys: string[];           // Multiple keys for rotation
        quotaPerKey: number;      // Daily quota
      };
    };
  };

  // Service Endpoints
  endpoints: {
    api: string;                  // api.pathfinity.com
    app: string;                  // app.pathfinity.com
    cdn: string;                  // cdn.pathfinity.com
  };

  // Rate Limiting
  rateLimiting: {
    perStudent: {
      requests: number;           // Per minute
      burst: number;              // Burst allowance
    };
    perSchool: {
      requests: number;           // Per minute
      concurrent: number;         // Max concurrent
    };
  };
}

/**
 * 3. MONITORING & OBSERVABILITY
 */
interface MonitoringConfig {
  // Application Performance Monitoring
  apm: {
    provider: 'DataDog' | 'NewRelic' | 'AppDynamics';
    features: {
      tracing: boolean;
      profiling: boolean;
      errorTracking: boolean;
      customMetrics: boolean;
    };
  };

  // Logging
  logging: {
    aggregator: 'ELK' | 'Splunk' | 'CloudWatch';
    levels: {
      production: 'INFO';
      staging: 'DEBUG';
    };
    retention: number;            // Days
  };

  // Metrics & Dashboards
  metrics: {
    // Business Metrics
    business: [
      'cost_per_student',
      'cache_hit_rate',
      'youtube_success_rate',
      'narrative_generation_time',
      'student_engagement_duration'
    ];
    
    // Technical Metrics
    technical: [
      'api_latency_p99',
      'error_rate',
      'throughput',
      'cpu_utilization',
      'memory_usage'
    ];

    // Alerts
    alerts: {
      costThreshold: number;      // Daily cost limit
      errorRate: number;          // Max error %
      latency: number;            // P99 in ms
      cacheHitRate: number;       // Min %
    };
  };

  // Cost Monitoring
  costTracking: {
    budgets: {
      daily: number;
      monthly: number;
    };
    alerts: {
      threshold: number;          // % of budget
      recipients: string[];
    };
  };
}

/**
 * 4. SECURITY CONFIGURATION
 */
interface SecurityConfig {
  // Authentication
  auth: {
    provider: 'Auth0' | 'AWS Cognito' | 'Custom';
    mfa: boolean;
    sessionTimeout: number;       // Minutes
  };

  // Data Protection
  encryption: {
    atRest: 'AES-256';
    inTransit: 'TLS 1.3';
    keyManagement: 'AWS KMS' | 'HashiCorp Vault';
  };

  // Compliance
  compliance: {
    standards: ['COPPA', 'FERPA', 'GDPR'];
    dataRetention: {
      student: number;            // Days
      analytics: number;
      logs: number;
    };
  };

  // WAF Rules
  waf: {
    enabled: boolean;
    rules: [
      'rate_limiting',
      'sql_injection',
      'xss_protection',
      'bot_detection'
    ];
  };
}

/**
 * 5. AUTO-SCALING CONFIGURATION
 */
interface ScalingConfig {
  // Application Scaling
  application: {
    metric: 'cpu' | 'memory' | 'requests';
    targetUtilization: number;    // Percentage
    scaleUpThreshold: number;
    scaleDownThreshold: number;
    cooldown: number;             // Seconds
  };

  // Database Scaling
  database: {
    readReplicas: {
      min: number;
      max: number;
      trigger: 'connections' | 'cpu';
    };
  };

  // Cache Scaling
  cache: {
    autoEviction: boolean;
    memoryThreshold: number;      // Percentage
    preWarmOnScale: boolean;
  };
}

/**
 * 6. DEPLOYMENT STRATEGY
 */
interface RolloutStrategy {
  // Deployment Method
  method: 'blue-green' | 'canary' | 'rolling';
  
  // Canary Configuration
  canary?: {
    initialPercentage: number;    // Start with 5%
    incrementPercentage: number;  // Increase by 10%
    intervalMinutes: number;      // Wait between increments
    metrics: {
      errorThreshold: number;     // Rollback if exceeded
      latencyThreshold: number;
    };
  };

  // Rollback Strategy
  rollback: {
    automatic: boolean;
    conditions: [
      'error_rate_spike',
      'latency_degradation',
      'cost_explosion'
    ];
    timeWindow: number;           // Minutes to monitor
  };

  // Pre-deployment Checks
  preDeployment: [
    'run_all_tests',
    'verify_api_keys',
    'check_cache_warm',
    'validate_cdn_config',
    'security_scan'
  ];

  // Post-deployment Validation
  postDeployment: [
    'smoke_tests',
    'load_test_subset',
    'verify_metrics',
    'check_cost_baseline'
  ];
}

/**
 * PRODUCTION DEPLOYMENT CHECKLIST
 */
export const PRODUCTION_DEPLOYMENT: ProductionDeploymentConfig = {
  infrastructure: {
    compute: {
      provider: 'AWS',
      instances: {
        type: 't3.large',
        minCount: 2,
        maxCount: 10,
        regions: ['us-east-1', 'us-west-2']
      }
    },
    database: {
      primary: {
        type: 'PostgreSQL',
        version: '14',
        instances: 3,
        backup: {
          frequency: 'hourly',
          retention: 30
        }
      },
      cache: {
        type: 'Redis',
        nodes: 3,
        memory: '32GB',
        evictionPolicy: 'LRU'
      }
    },
    cdn: {
      provider: 'CloudFront',
      locations: ['us', 'eu', 'ap'],
      caching: {
        narratives: 2592000,      // 30 days in seconds
        videos: 604800,           // 7 days
        static: 31536000          // 365 days
      }
    },
    loadBalancer: {
      type: 'Application',
      healthCheck: {
        path: '/health',
        interval: 30,
        timeout: 5,
        unhealthyThreshold: 2
      }
    }
  },

  services: {
    apiKeys: {
      storage: 'AWS Secrets Manager',
      rotation: {
        enabled: true,
        frequency: 90
      },
      keys: {
        openai: {
          primary: '${SECRET_OPENAI_KEY}',
          fallback: '${SECRET_OPENAI_KEY_BACKUP}',
          rateLimit: 3000
        },
        youtube: {
          keys: ['${YT_KEY_1}', '${YT_KEY_2}', '${YT_KEY_3}'],
          quotaPerKey: 10000
        }
      }
    },
    endpoints: {
      api: 'https://api.pathfinity.com',
      app: 'https://app.pathfinity.com',
      cdn: 'https://cdn.pathfinity.com'
    },
    rateLimiting: {
      perStudent: {
        requests: 60,
        burst: 100
      },
      perSchool: {
        requests: 1000,
        concurrent: 200
      }
    }
  },

  monitoring: {
    apm: {
      provider: 'DataDog',
      features: {
        tracing: true,
        profiling: true,
        errorTracking: true,
        customMetrics: true
      }
    },
    logging: {
      aggregator: 'CloudWatch',
      levels: {
        production: 'INFO',
        staging: 'DEBUG'
      },
      retention: 90
    },
    metrics: {
      business: [
        'cost_per_student',
        'cache_hit_rate',
        'youtube_success_rate',
        'narrative_generation_time',
        'student_engagement_duration'
      ],
      technical: [
        'api_latency_p99',
        'error_rate',
        'throughput',
        'cpu_utilization',
        'memory_usage'
      ],
      alerts: {
        costThreshold: 500,       // $500/day
        errorRate: 1,             // 1%
        latency: 2000,            // 2s
        cacheHitRate: 70          // 70%
      }
    },
    costTracking: {
      budgets: {
        daily: 500,
        monthly: 15000
      },
      alerts: {
        threshold: 80,
        recipients: ['ops@pathfinity.com', 'finance@pathfinity.com']
      }
    }
  },

  security: {
    auth: {
      provider: 'Auth0',
      mfa: true,
      sessionTimeout: 60
    },
    encryption: {
      atRest: 'AES-256',
      inTransit: 'TLS 1.3',
      keyManagement: 'AWS KMS'
    },
    compliance: {
      standards: ['COPPA', 'FERPA', 'GDPR'],
      dataRetention: {
        student: 365,
        analytics: 730,
        logs: 90
      }
    },
    waf: {
      enabled: true,
      rules: [
        'rate_limiting',
        'sql_injection',
        'xss_protection',
        'bot_detection'
      ]
    }
  },

  scaling: {
    application: {
      metric: 'cpu',
      targetUtilization: 70,
      scaleUpThreshold: 80,
      scaleDownThreshold: 30,
      cooldown: 300
    },
    database: {
      readReplicas: {
        min: 1,
        max: 5,
        trigger: 'connections'
      }
    },
    cache: {
      autoEviction: true,
      memoryThreshold: 85,
      preWarmOnScale: true
    }
  },

  rollout: {
    method: 'canary',
    canary: {
      initialPercentage: 5,
      incrementPercentage: 10,
      intervalMinutes: 30,
      metrics: {
        errorThreshold: 2,        // 2% error rate
        latencyThreshold: 3000    // 3s
      }
    },
    rollback: {
      automatic: true,
      conditions: [
        'error_rate_spike',
        'latency_degradation',
        'cost_explosion'
      ],
      timeWindow: 15
    },
    preDeployment: [
      'run_all_tests',
      'verify_api_keys',
      'check_cache_warm',
      'validate_cdn_config',
      'security_scan'
    ],
    postDeployment: [
      'smoke_tests',
      'load_test_subset',
      'verify_metrics',
      'check_cost_baseline'
    ]
  }
};

/**
 * Cost Analysis for Production
 */
export const PRODUCTION_COST_ANALYSIS = {
  infrastructure: {
    compute: 500,                 // $/month for EC2
    database: 300,                // $/month for RDS
    cache: 150,                   // $/month for ElastiCache
    cdn: 100,                     // $/month for CloudFront
    monitoring: 200               // $/month for DataDog
  },
  api: {
    openai: {
      withoutOptimization: 50000, // $/month (old system)
      withOptimization: 10500     // $/month (new system - 79% reduction)
    },
    youtube: 0                    // Free within quota
  },
  total: {
    withoutOptimization: 51250,
    withOptimization: 11750,
    savings: 39500,               // $39,500/month saved
    savingsPercentage: 77.1
  }
};

/**
 * Deployment Commands
 */
export const DEPLOYMENT_COMMANDS = {
  // Build & Test
  build: 'npm run build:production',
  test: 'npm run test:all',
  
  // Docker
  dockerBuild: 'docker build -t pathfinity:latest .',
  dockerPush: 'docker push registry.pathfinity.com/pathfinity:latest',
  
  // Kubernetes
  deploy: 'kubectl apply -f k8s/',
  rollout: 'kubectl rollout status deployment/pathfinity',
  
  // Database
  migrate: 'npm run db:migrate:production',
  seed: 'npm run db:seed:cache',
  
  // Cache
  warmCache: 'npm run cache:warm:popular',
  
  // Monitoring
  verifyMetrics: 'npm run monitor:verify',
  
  // Health Check
  healthCheck: 'curl https://api.pathfinity.com/health'
};