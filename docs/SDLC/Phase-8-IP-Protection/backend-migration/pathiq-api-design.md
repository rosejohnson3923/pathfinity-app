# PathIQ™ Backend API Design

## Critical Notice
**⚠️ THIS IS THE MOST IMPORTANT DOCUMENT FOR IP PROTECTION**

All PathIQ algorithms MUST be moved to the backend immediately. Any PathIQ logic visible in the browser can be stolen.

## Current Vulnerable Modules

### HIGH RISK - Must Move Immediately:
1. **pathIQService.ts** - Contains career selection algorithms
2. **pathIQIntelligenceSystem.ts** - Core intelligence engine
3. **pathIQGamificationService.ts** - XP economy logic
4. **learningMetricsService.ts** - Learning analytics
5. **ageProvisioningService.ts** - Age-based logic

### Files to Protect:
```
src/services/
├── pathIQService.ts              # CRITICAL - Move ALL logic
├── pathIQIntelligenceSystem.ts   # CRITICAL - Move ALL logic
├── pathIQGamificationService.ts  # CRITICAL - Move ALL logic
├── pathIQIntegration.ts          # CRITICAL - Move ALL logic
├── learningMetricsService.ts     # HIGH - Move calculations
├── ageProvisioningService.ts     # HIGH - Move rules
└── leaderboardService.ts         # MEDIUM - Move rankings
```

## Proposed API Architecture

### Base Structure:
```
/api/v1/pathiq/
├── /intelligence/          # Core PathIQ intelligence
├── /careers/              # Career recommendations
├── /gamification/         # XP and achievements
├── /metrics/              # Learning analytics
├── /provisioning/         # Age-appropriate features
└── /leaderboards/         # Rankings and comparisons
```

## API Endpoints Design

### 1. Intelligence API
```typescript
// GET /api/v1/pathiq/intelligence
Response: {
  authority: "PathIQ Intelligence System",
  timestamp: string,
  career: {
    trending: Career[],
    predictions: Prediction[],
    recommendations: Recommendation[]
  },
  learning: {
    masteryBenchmark: number,
    optimalLearningTime: string,
    predictedTimeToMastery: number
  },
  insights: Insight[]
}

// GET /api/v1/pathiq/intelligence/personalized
Request: {
  userId: string,
  context: {
    grade?: string,
    skill?: string,
    career?: string,
    performance?: number
  }
}
Response: {
  insights: PersonalizedInsight[],
  recommendations: string[]
}
```

### 2. Career Selection API
```typescript
// GET /api/v1/pathiq/careers/recommendations
Request: {
  userId: string,
  grade: string,
  schoolType: string
}
Response: {
  careers: Career[],
  algorithm: "PathIQ Proprietary",
  version: "2.0"
}

// POST /api/v1/pathiq/careers/track
Request: {
  userId: string,
  careerId: string,
  action: "selected" | "explored" | "completed"
}
Response: {
  tracked: boolean,
  analytics: CareerAnalytics
}
```

### 3. Gamification API
```typescript
// GET /api/v1/pathiq/gamification/profile
Request: {
  userId: string
}
Response: {
  xp: number,
  level: number,
  achievements: Achievement[],
  // NO ALGORITHM DETAILS
}

// POST /api/v1/pathiq/gamification/xp/award
Request: {
  userId: string,
  action: string,
  metadata: object
}
Response: {
  xpAwarded: number,
  newTotal: number,
  levelUp?: boolean
  // NO CALCULATION LOGIC
}

// POST /api/v1/pathiq/gamification/hint
Request: {
  userId: string,
  hintType: string
}
Response: {
  hint: string,
  cost: number,
  remaining: number
  // NO COST CALCULATION LOGIC
}
```

### 4. Learning Metrics API
```typescript
// POST /api/v1/pathiq/metrics/record
Request: {
  userId: string,
  skill: string,
  performance: object
}
Response: {
  recorded: boolean,
  mastery: number
  // NO ALGORITHM EXPOSED
}

// GET /api/v1/pathiq/metrics/analytics
Request: {
  userId: string,
  timeframe?: string
}
Response: {
  metrics: object,
  trends: object
  // PROCESSED DATA ONLY
}
```

### 5. Provisioning API
```typescript
// GET /api/v1/pathiq/provisioning/config
Request: {
  grade: string,
  schoolType: string
}
Response: {
  features: {
    showXP: boolean,
    showLeaderboard: boolean,
    // etc.
  },
  // NO LOGIC FOR DECISIONS
}
```

## Migration Strategy

### Phase 1: Setup Backend (Week 1)
```javascript
// 1. Create Express/Node backend
npm init pathfinity-backend
npm install express cors helmet
npm install jsonwebtoken bcrypt

// 2. Setup folder structure
backend/
├── src/
│   ├── controllers/
│   │   └── pathiq/
│   ├── services/
│   │   └── pathiq/  # Move all PathIQ logic here
│   ├── middleware/
│   │   ├── auth.js
│   │   └── security.js
│   └── routes/
│       └── pathiq.js
```

### Phase 2: Move Logic (Week 2)
1. Copy all PathIQ services to backend
2. Remove all algorithms from frontend
3. Create thin API clients in frontend
4. Test each endpoint thoroughly

### Phase 3: Secure (Week 3)
1. Add JWT authentication
2. Implement request signing
3. Add rate limiting
4. Enable CORS properly
5. Add monitoring

## Frontend Changes Required

### Before (VULNERABLE):
```typescript
// src/services/pathIQService.ts
export class PathIQService {
  getCareerSelections(grade: string) {
    // ENTIRE ALGORITHM VISIBLE
    const careers = this.CAREER_DATABASE[grade];
    const selected = this.applyDiversityAlgorithm(careers);
    return selected;
  }
}
```

### After (PROTECTED):
```typescript
// src/services/pathIQClient.ts
export class PathIQClient {
  async getCareerSelections(grade: string) {
    // Only API call, no logic
    const response = await fetch('/api/v1/pathiq/careers/recommendations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grade, userId: this.userId })
    });
    return response.json();
  }
}
```

## Security Headers Required

### Every API Response Must Include:
```javascript
res.set({
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'X-PathIQ-Version': '2.0',
  'X-Copyright': '© 2024 Pathfinity Inc.'
});
```

## Environment Variables

### Required .env Configuration:
```bash
# Security
JWT_SECRET=<long-random-string>
API_SIGNING_SECRET=<long-random-string>
ENCRYPTION_KEY=<32-byte-key>

# PathIQ Configuration
PATHIQ_VERSION=2.0
PATHIQ_MODE=production

# Rate Limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# Monitoring
SENTRY_DSN=<your-sentry-dsn>
LOG_LEVEL=info
```

## Testing Requirements

### Must Test:
1. All algorithms work correctly via API
2. No sensitive data in API responses
3. Authentication works properly
4. Rate limiting prevents abuse
5. Error messages don't leak information

## Deployment Checklist

### Before Going Live:
- [ ] All PathIQ logic removed from frontend
- [ ] Backend API fully tested
- [ ] Authentication implemented
- [ ] Request signing active
- [ ] Rate limiting configured
- [ ] Monitoring enabled
- [ ] Security headers set
- [ ] HTTPS only
- [ ] API documentation complete
- [ ] Rollback plan ready

## Emergency Contacts

**If PathIQ algorithms are exposed:**
1. Immediately remove from frontend
2. Contact: security@pathfinity.com
3. Deploy hotfix within 2 hours
4. Document incident

---

**Remember: Every minute PathIQ remains in the frontend is a minute it can be stolen.**