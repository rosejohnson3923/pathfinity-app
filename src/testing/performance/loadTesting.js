/**
 * PATHFINITY LOAD TESTING
 * Performance testing suite using Artillery.js for AI education platform
 */

const { performance } = require('perf_hooks');

// Load testing configuration
const loadTestConfig = {
  target: process.env.LOAD_TEST_TARGET || 'http://localhost:3000',
  phases: [
    // Warm-up phase
    {
      duration: 60,
      arrivalRate: 1,
      name: 'warm_up'
    },
    // Ramp-up phase
    {
      duration: 300,
      arrivalRate: 1,
      rampTo: 10,
      name: 'ramp_up'
    },
    // Sustained load phase
    {
      duration: 600,
      arrivalRate: 10,
      name: 'sustained_load'
    },
    // Peak load phase
    {
      duration: 300,
      arrivalRate: 10,
      rampTo: 25,
      name: 'peak_load'
    },
    // Cool-down phase
    {
      duration: 120,
      arrivalRate: 25,
      rampTo: 1,
      name: 'cool_down'
    }
  ],
  payload: {
    path: './test-data/users.csv',
    fields: ['email', 'password', 'gradeLevel']
  }
};

// Test scenarios
const scenarios = [
  {
    name: 'User Login and Dashboard Access',
    weight: 30,
    flow: [
      {
        post: {
          url: '/api/auth/login',
          json: {
            email: '{{ email }}',
            password: '{{ password }}'
          },
          capture: {
            json: '$.token',
            as: 'authToken'
          }
        }
      },
      {
        get: {
          url: '/api/dashboard',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          }
        }
      },
      {
        think: 3
      }
    ]
  },
  {
    name: 'AI Character Interaction',
    weight: 40,
    flow: [
      {
        post: {
          url: '/api/auth/login',
          json: {
            email: '{{ email }}',
            password: '{{ password }}'
          },
          capture: {
            json: '$.token',
            as: 'authToken'
          }
        }
      },
      {
        post: {
          url: '/api/characters/finn/chat',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          },
          json: {
            message: 'Hello Finn! Can you help me with counting?',
            context: {}
          }
        }
      },
      {
        think: 5
      },
      {
        post: {
          url: '/api/characters/finn/chat',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          },
          json: {
            message: 'Count to 10 for me please',
            context: {
              previousMessages: [
                { role: 'user', content: 'Hello Finn! Can you help me with counting?' },
                { role: 'assistant', content: 'Hi there! I\'d love to help you count!' }
              ]
            }
          }
        }
      },
      {
        think: 3
      }
    ]
  },
  {
    name: 'Assessment Taking',
    weight: 20,
    flow: [
      {
        post: {
          url: '/api/auth/login',
          json: {
            email: '{{ email }}',
            password: '{{ password }}'
          },
          capture: {
            json: '$.token',
            as: 'authToken'
          }
        }
      },
      {
        get: {
          url: '/api/assessments?gradeLevel={{ gradeLevel }}&subject=Math',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          },
          capture: {
            json: '$.assessments[0].id',
            as: 'assessmentId'
          }
        }
      },
      {
        think: 2
      },
      {
        post: {
          url: '/api/assessments/{{ assessmentId }}/submit',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          },
          json: {
            responses: [
              {
                questionId: 'q1',
                answer: '4'
              }
            ]
          }
        }
      }
    ]
  },
  {
    name: 'Learning Analytics Tracking',
    weight: 10,
    flow: [
      {
        post: {
          url: '/api/auth/login',
          json: {
            email: '{{ email }}',
            password: '{{ password }}'
          },
          capture: {
            json: '$.token',
            as: 'authToken'
          }
        }
      },
      {
        post: {
          url: '/api/analytics/events',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          },
          json: {
            eventType: 'lesson_complete',
            metadata: {
              subject: 'Math',
              skill: 'counting',
              masteryScore: 85
            }
          }
        }
      },
      {
        get: {
          url: '/api/analytics/progress',
          headers: {
            'Authorization': 'Bearer {{ authToken }}'
          }
        }
      }
    ]
  }
];

// Performance metrics collection
class PerformanceCollector {
  constructor() {
    this.metrics = {
      responseTime: {
        min: Infinity,
        max: 0,
        avg: 0,
        p95: 0,
        p99: 0,
        samples: []
      },
      throughput: {
        requestsPerSecond: 0,
        totalRequests: 0
      },
      errors: {
        total: 0,
        rate: 0,
        types: {}
      },
      aiCharacter: {
        responseTime: {
          min: Infinity,
          max: 0,
          avg: 0,
          samples: []
        },
        tokenUsage: {
          total: 0,
          avg: 0,
          samples: []
        },
        cost: {
          total: 0,
          avg: 0
        }
      }
    };
    this.startTime = performance.now();
  }

  recordResponse(responseTime, endpoint, statusCode, responseData = {}) {
    // Record general response time
    this.metrics.responseTime.samples.push(responseTime);
    this.metrics.responseTime.min = Math.min(this.metrics.responseTime.min, responseTime);
    this.metrics.responseTime.max = Math.max(this.metrics.responseTime.max, responseTime);
    
    // Calculate average
    const samples = this.metrics.responseTime.samples;
    this.metrics.responseTime.avg = samples.reduce((a, b) => a + b, 0) / samples.length;
    
    // Calculate percentiles
    const sorted = [...samples].sort((a, b) => a - b);
    this.metrics.responseTime.p95 = sorted[Math.floor(sorted.length * 0.95)];
    this.metrics.responseTime.p99 = sorted[Math.floor(sorted.length * 0.99)];

    // Record throughput
    this.metrics.throughput.totalRequests++;
    const elapsed = (performance.now() - this.startTime) / 1000;
    this.metrics.throughput.requestsPerSecond = this.metrics.throughput.totalRequests / elapsed;

    // Record errors
    if (statusCode >= 400) {
      this.metrics.errors.total++;
      this.metrics.errors.types[statusCode] = (this.metrics.errors.types[statusCode] || 0) + 1;
      this.metrics.errors.rate = this.metrics.errors.total / this.metrics.throughput.totalRequests;
    }

    // Record AI-specific metrics
    if (endpoint.includes('/characters/') && endpoint.includes('/chat')) {
      this.recordAIMetrics(responseTime, responseData);
    }
  }

  recordAIMetrics(responseTime, responseData) {
    const ai = this.metrics.aiCharacter;
    
    // Response time
    ai.responseTime.samples.push(responseTime);
    ai.responseTime.min = Math.min(ai.responseTime.min, responseTime);
    ai.responseTime.max = Math.max(ai.responseTime.max, responseTime);
    ai.responseTime.avg = ai.responseTime.samples.reduce((a, b) => a + b, 0) / ai.responseTime.samples.length;

    // Token usage
    if (responseData.tokens) {
      ai.tokenUsage.samples.push(responseData.tokens);
      ai.tokenUsage.total += responseData.tokens;
      ai.tokenUsage.avg = ai.tokenUsage.total / ai.tokenUsage.samples.length;
    }

    // Cost tracking
    if (responseData.cost) {
      ai.cost.total += responseData.cost;
      ai.cost.avg = ai.cost.total / ai.responseTime.samples.length;
    }
  }

  getReport() {
    const duration = (performance.now() - this.startTime) / 1000;
    
    return {
      duration: `${duration.toFixed(2)}s`,
      summary: {
        totalRequests: this.metrics.throughput.totalRequests,
        requestsPerSecond: this.metrics.throughput.requestsPerSecond.toFixed(2),
        errorRate: `${(this.metrics.errors.rate * 100).toFixed(2)}%`,
        avgResponseTime: `${this.metrics.responseTime.avg.toFixed(2)}ms`,
        p95ResponseTime: `${this.metrics.responseTime.p95.toFixed(2)}ms`,
        p99ResponseTime: `${this.metrics.responseTime.p99.toFixed(2)}ms`
      },
      aiCharacterMetrics: {
        avgResponseTime: `${this.metrics.aiCharacter.responseTime.avg.toFixed(2)}ms`,
        minResponseTime: `${this.metrics.aiCharacter.responseTime.min.toFixed(2)}ms`,
        maxResponseTime: `${this.metrics.aiCharacter.responseTime.max.toFixed(2)}ms`,
        avgTokens: this.metrics.aiCharacter.tokenUsage.avg.toFixed(0),
        totalTokens: this.metrics.aiCharacter.tokenUsage.total,
        totalCost: `$${this.metrics.aiCharacter.cost.total.toFixed(4)}`
      },
      errors: this.metrics.errors.types,
      recommendations: this.generateRecommendations()
    };
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.metrics.responseTime.avg > 1000) {
      recommendations.push('Average response time is high (>1s). Consider optimizing backend services.');
    }
    
    if (this.metrics.aiCharacter.responseTime.avg > 5000) {
      recommendations.push('AI character response time is high (>5s). Consider implementing response caching.');
    }
    
    if (this.metrics.errors.rate > 0.05) {
      recommendations.push('Error rate is high (>5%). Check error logs and improve error handling.');
    }
    
    if (this.metrics.throughput.requestsPerSecond < 10) {
      recommendations.push('Low throughput (<10 RPS). Consider scaling infrastructure.');
    }
    
    if (this.metrics.aiCharacter.cost.total > 1) {
      recommendations.push('High AI costs detected. Consider implementing usage limits or cost optimization.');
    }

    return recommendations;
  }
}

// Stress testing scenarios
const stressTestScenarios = {
  aiCharacterOverload: {
    description: 'Test AI character system under heavy load',
    config: {
      phases: [
        { duration: 60, arrivalRate: 50 }
      ]
    },
    scenario: {
      name: 'AI Character Stress Test',
      flow: [
        {
          post: {
            url: '/api/characters/finn/chat',
            json: {
              message: 'Generate a long educational story about {{ random(["math", "science", "reading"]) }}'
            }
          }
        }
      ]
    }
  },
  
  databaseLoad: {
    description: 'Test database performance under load',
    config: {
      phases: [
        { duration: 120, arrivalRate: 30 }
      ]
    },
    scenario: {
      name: 'Database Load Test',
      flow: [
        {
          get: {
            url: '/api/analytics/progress?detailed=true'
          }
        },
        {
          post: {
            url: '/api/analytics/events',
            json: {
              eventType: 'lesson_complete',
              metadata: {
                subject: '{{ random(["Math", "ELA", "Science"]) }}',
                skill: 'test-skill-{{ $randomNumber(1, 100) }}'
              }
            }
          }
        }
      ]
    }
  },

  memoryLeak: {
    description: 'Long-running test to detect memory leaks',
    config: {
      phases: [
        { duration: 1800, arrivalRate: 5 } // 30 minutes
      ]
    },
    scenario: {
      name: 'Memory Leak Detection',
      flow: [
        {
          loop: [
            {
              post: {
                url: '/api/characters/sage/chat',
                json: {
                  message: 'Tell me about {{ random(["photosynthesis", "fractions", "history"]) }}'
                }
              }
            },
            {
              think: 2
            }
          ],
          count: 10
        }
      ]
    }
  }
};

// Performance benchmarks
const performanceBenchmarks = {
  responseTime: {
    api: {
      target: 500, // ms
      warning: 1000,
      critical: 2000
    },
    aiCharacter: {
      target: 3000, // ms
      warning: 5000,
      critical: 10000
    },
    dashboard: {
      target: 1000, // ms
      warning: 2000,
      critical: 3000
    }
  },
  throughput: {
    target: 100, // requests per second
    warning: 50,
    critical: 20
  },
  errorRate: {
    target: 0.01, // 1%
    warning: 0.05, // 5%
    critical: 0.1 // 10%
  },
  aiCost: {
    dailyTarget: 50, // USD
    warning: 100,
    critical: 200
  }
};

// Export configuration for Artillery
module.exports = {
  config: loadTestConfig,
  scenarios,
  stressTestScenarios,
  performanceBenchmarks,
  PerformanceCollector
};

// CLI execution support
if (require.main === module) {
  console.log('🚀 Pathfinity Load Testing Configuration');
  console.log('📊 Scenarios:', Object.keys(scenarios).length);
  console.log('⚡ Stress Tests:', Object.keys(stressTestScenarios).length);
  console.log('🎯 Use with Artillery: artillery run loadTesting.js');
}