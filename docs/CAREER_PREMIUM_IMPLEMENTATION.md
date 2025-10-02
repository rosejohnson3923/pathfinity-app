# Career Premium Tier Implementation Plan

## Confirmed Business Model

### Tier Structure by Grade Level

```
ELEMENTARY STUDENTS:
├── Basic Plan:    10 careers (community helpers)
└── Premium Plan:  25 careers total (+15 premium careers)

MIDDLE SCHOOL STUDENTS:
├── Basic Plan:    30 careers (10 elem basic + 20 middle basic)
└── Premium Plan:  55 careers total (25 elem all + 30 middle premium)

HIGH SCHOOL STUDENTS:
├── Basic Plan:    50 careers (10 elem + 20 middle + 20 high basic)
└── Premium Plan:  115 careers total (25 elem + 50 middle + 40 high premium)
```

### Key Principle
**Premium is cumulative** - Premium subscribers get ALL premium careers for their grade level and below, preventing revenue leakage from grade manipulation.

## Implementation Phases

### Phase 1: Database Migration (Week 1)

Create migration file: `database/migrations/010_career_premium_system.sql`

```sql
-- Add premium fields to existing career_paths table
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS
    access_tier VARCHAR(20) DEFAULT 'basic' CHECK (access_tier IN ('basic', 'premium')),
    min_grade_level VARCHAR(10) NOT NULL,
    max_grade_level VARCHAR(10),
    grade_category VARCHAR(20) CHECK (grade_category IN ('elementary', 'middle', 'high')),

    -- Premium metadata
    premium_since DATE,
    premium_reason TEXT,
    expected_revenue_impact DECIMAL(10,2),

    -- Analytics
    basic_selections INTEGER DEFAULT 0,
    premium_selections INTEGER DEFAULT 0,
    upgrade_trigger_count INTEGER DEFAULT 0;

-- Create subscription management tables
CREATE TABLE subscription_tiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tier_code VARCHAR(20) NOT NULL UNIQUE,
    tier_name VARCHAR(100) NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2),

    -- Features
    includes_premium_careers BOOLEAN DEFAULT FALSE,
    custom_career_slots INTEGER DEFAULT 0,

    -- Stripe integration
    stripe_product_id VARCHAR(100),
    stripe_price_id_monthly VARCHAR(100),
    stripe_price_id_annual VARCHAR(100),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenant subscriptions
CREATE TABLE tenant_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    tier_id UUID REFERENCES subscription_tiers(id),

    -- Subscription details
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    current_period_start DATE NOT NULL,
    current_period_end DATE NOT NULL,

    -- Billing
    stripe_subscription_id VARCHAR(100),
    payment_method VARCHAR(50),

    -- Usage
    students_enrolled INTEGER DEFAULT 0,
    careers_accessed TEXT[],
    last_career_access TIMESTAMP WITH TIME ZONE,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Career access analytics
CREATE TABLE career_access_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    user_id UUID NOT NULL,
    career_code VARCHAR(50) NOT NULL,

    -- Event details
    event_type VARCHAR(50) NOT NULL, -- view, select, preview_locked
    was_premium BOOLEAN DEFAULT FALSE,
    had_access BOOLEAN DEFAULT TRUE,

    -- Conversion tracking
    showed_upgrade_prompt BOOLEAN DEFAULT FALSE,
    clicked_upgrade BOOLEAN DEFAULT FALSE,
    completed_upgrade BOOLEAN DEFAULT FALSE,

    -- Context
    user_grade VARCHAR(10),
    session_id UUID,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_career_paths_tier_grade ON career_paths(access_tier, min_grade_level);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(tenant_id, status);
CREATE INDEX idx_career_access_analytics ON career_access_events(tenant_id, created_at);
```

### Phase 2: Categorize Current Careers

```javascript
// Migration script to categorize existing careers
const categorizeCareers = async () => {
    // Elementary Basic (10 careers)
    const elementaryBasic = [
        'teacher', 'doctor', 'firefighter', 'police-officer',
        'veterinarian', 'chef', 'artist', 'nurse',
        'dentist', 'librarian'
    ];

    // Elementary Premium (+15 careers)
    const elementaryPremium = [
        'park-ranger', 'bus-driver', 'mail-carrier',
        'grocery-worker', 'janitor', 'cafeteria-worker',
        'coach', 'crossing-guard', 'musician',
        'farmer', 'baker', 'pilot', 'scientist-basic',
        'zookeeper', 'astronaut-basic'
    ];

    // Middle School Basic (20 careers)
    const middleBasic = [
        'programmer', 'entrepreneur', 'manager',
        'bank-teller', 'writer', 'photographer',
        'engineer', 'electrician', 'plumber',
        'carpenter', 'athlete', 'social-worker',
        'lawyer', 'real-estate-agent', 'journalist',
        'scientist', 'environmental-scientist',
        'graphic-designer', 'dancer', 'web-designer'
    ];

    // Middle School Premium (+30 careers)
    const middlePremium = [
        'game-developer', 'youtuber', 'podcast-producer',
        'drone-operator', 'app-developer', 'data-analyst',
        'social-media-manager', 'ux-designer', 'animator',
        // ... add more specialized middle school careers
    ];

    // High School Basic (20 careers)
    const highBasic = [
        'software-engineer', 'marketing-manager',
        'financial-analyst', 'nurse-practitioner',
        'mechanical-engineer', 'accountant',
        'teacher-secondary', 'sales-manager',
        // ... traditional career paths
    ];

    // High School Premium (+40 careers)
    const highPremium = [
        'ai-engineer', 'data-scientist', 'cybersecurity-specialist',
        'cloud-architect', 'blockchain-developer', 'robotics-engineer',
        'biotech-researcher', 'sustainability-consultant',
        'space-industry-worker', 'quantum-computing-specialist',
        // ... emerging and specialized careers
    ];

    // Update database
    for (const careerId of elementaryBasic) {
        await db.query(`
            UPDATE career_paths
            SET access_tier = 'basic',
                min_grade_level = 'K',
                grade_category = 'elementary'
            WHERE career_code = $1
        `, [careerId]);
    }

    // ... repeat for other categories
};
```

### Phase 3: Update PathIQ Service

```typescript
// New PathIQService.ts structure
class PathIQService {
    async getAvailableCareers(
        gradeLevel: string,
        hasPremium: boolean,
        tenantId: string
    ): Promise<Career[]> {
        const gradeNum = this.gradeToNumber(gradeLevel);

        const query = `
            SELECT * FROM career_paths
            WHERE
                -- Grade appropriate
                min_grade_level_num <= $1
                AND (max_grade_level_num IS NULL OR max_grade_level_num >= $1)
                -- Access tier
                AND (access_tier = 'basic' OR ($2 = true AND access_tier = 'premium'))
                -- Active
                AND is_active = true
            ORDER BY
                CASE WHEN access_tier = 'premium' THEN 1 ELSE 0 END,
                sort_order,
                career_name
        `;

        const careers = await db.query(query, [gradeNum, hasPremium]);

        // Track access for analytics
        await this.trackCareerAccess(careers, tenantId, hasPremium);

        return careers;
    }

    async handlePremiumCareerClick(
        careerId: string,
        userId: string,
        tenantId: string,
        hasPremium: boolean
    ): Promise<CareerAccessResult> {
        if (!hasPremium) {
            // Log the premium career interest
            await this.trackPremiumInterest(careerId, userId, tenantId);

            return {
                allowed: false,
                showUpgrade: true,
                message: "This is a Premium Career! Unlock 65+ more careers with Premium.",
                previewData: await this.getCareerPreview(careerId)
            };
        }

        return { allowed: true };
    }
}
```

### Phase 4: Upgrade Flow UI

```typescript
// Components for upgrade prompts
const PremiumCareerModal: React.FC<{career: Career, onUpgrade: () => void}> = ({career, onUpgrade}) => {
    return (
        <Modal className="premium-upgrade-modal">
            <div className="career-preview">
                <div className="career-icon">{career.icon}</div>
                <h2>{career.name}</h2>
                <p className="premium-badge">✨ Premium Career</p>

                <div className="career-details">
                    <p>{career.description}</p>
                    <div className="career-stats">
                        <div>💰 Salary: {career.salaryRange}</div>
                        <div>📈 Growth: {career.growthOutlook}</div>
                        <div>🎓 Education: {career.education}</div>
                    </div>
                </div>

                <div className="upgrade-benefits">
                    <h3>Unlock Premium to Access:</h3>
                    <ul>
                        <li>✅ This career and 65+ more premium careers</li>
                        <li>✅ Detailed daily tasks and requirements</li>
                        <li>✅ Success stories from real professionals</li>
                        <li>✅ Industry partner connections</li>
                    </ul>
                </div>

                <div className="upgrade-actions">
                    <button className="btn-upgrade-now" onClick={onUpgrade}>
                        Upgrade to Premium - $49/month
                    </button>
                    <button className="btn-tell-teacher">
                        Ask My Teacher
                    </button>
                    <button className="btn-preview-only">
                        Continue with Preview
                    </button>
                </div>
            </div>
        </Modal>
    );
};
```

### Phase 5: Analytics Dashboard

```sql
-- Premium conversion analytics
CREATE VIEW premium_conversion_metrics AS
SELECT
    DATE_TRUNC('week', created_at) as week,
    COUNT(DISTINCT tenant_id) as unique_tenants,
    COUNT(*) FILTER (WHERE event_type = 'preview_locked') as premium_views,
    COUNT(*) FILTER (WHERE showed_upgrade_prompt) as upgrade_prompts_shown,
    COUNT(*) FILTER (WHERE clicked_upgrade) as upgrade_clicks,
    COUNT(*) FILTER (WHERE completed_upgrade) as conversions,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE completed_upgrade) /
        NULLIF(COUNT(*) FILTER (WHERE showed_upgrade_prompt), 0),
        2
    ) as conversion_rate
FROM career_access_events
WHERE was_premium = true
GROUP BY week
ORDER BY week DESC;

-- Most valuable premium careers (driving conversions)
CREATE VIEW high_value_premium_careers AS
SELECT
    career_code,
    COUNT(*) as total_views,
    COUNT(*) FILTER (WHERE completed_upgrade) as conversions,
    ROUND(
        100.0 * COUNT(*) FILTER (WHERE completed_upgrade) /
        COUNT(*),
        2
    ) as conversion_rate,
    AVG(CASE WHEN completed_upgrade THEN 49 ELSE 0 END) as revenue_per_view
FROM career_access_events
WHERE was_premium = true
GROUP BY career_code
HAVING COUNT(*) > 10
ORDER BY conversion_rate DESC;
```

## Rollout Strategy

### Soft Launch (Week 1)
- Enable for 10% of users
- A/B test pricing ($39 vs $49 vs $59)
- Monitor conversion rates

### Gradual Rollout (Week 2-3)
- Expand to 50% of users
- Refine upgrade messaging based on data
- Add more premium careers based on interest

### Full Launch (Week 4)
- 100% availability
- Marketing campaign to existing users
- Teacher training on premium benefits

## Success Metrics

### Target KPIs (First Quarter)
- 15% of tenants upgrade to premium
- $25,000 MRR from premium subscriptions
- 3% monthly churn rate
- 80% of premium users access premium careers monthly

### Monitoring Dashboard
```typescript
interface PremiumMetrics {
    // Revenue
    mrr: number;
    arr: number;
    averageRevenuePerTenant: number;

    // Conversion
    freeToPremiuimConversion: number;
    premiumCareerClickToUpgrade: number;
    timeToFirstUpgrade: number;

    // Engagement
    premiumCareersAccessedPerUser: number;
    mostPopularPremiumCareers: Career[];
    premiumRetentionRate: number;

    // Growth
    newPremiumSignupsThisMonth: number;
    churnedPremiumThisMonth: number;
    netPremiumGrowth: number;
}
```

This implementation maintains quality control while creating a sustainable revenue stream!