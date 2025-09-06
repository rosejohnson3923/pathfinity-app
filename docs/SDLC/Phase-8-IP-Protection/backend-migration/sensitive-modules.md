# Sensitive Modules Inventory

## 🔴 CRITICAL - Contains Proprietary Algorithms

These modules contain PathIQ™ intellectual property and MUST be moved to backend immediately:

### 1. pathIQService.ts
**Risk Level:** CRITICAL
**Contains:**
- Career selection algorithms
- Category diversity logic
- Grade-appropriate filtering
- Career matching algorithms
- Analytics tracking logic

**Action Required:** Move ALL logic to backend API

### 2. pathIQIntelligenceSystem.ts  
**Risk Level:** CRITICAL
**Contains:**
- Core PathIQ intelligence engine
- Predictive algorithms
- Learning benchmarks
- Platform pulse calculations
- Insight generation logic

**Action Required:** Move ENTIRE module to backend

### 3. pathIQGamificationService.ts
**Risk Level:** CRITICAL
**Contains:**
- XP calculation formulas
- Achievement unlock logic
- Hint cost algorithms
- Level progression math
- PathIQ scoring system

**Action Required:** Move ALL game logic to backend

### 4. pathIQIntegration.ts
**Risk Level:** CRITICAL
**Contains:**
- Service orchestration logic
- Event processing algorithms
- User context management
- Intelligence distribution

**Action Required:** Move orchestration to backend

## 🟡 HIGH RISK - Contains Business Logic

### 5. learningMetricsService.ts
**Risk Level:** HIGH
**Contains:**
- Mastery calculation algorithms
- Performance tracking logic
- Adaptive difficulty adjustments
- Learning curve analysis

**Action Required:** Move calculations to backend, keep only display logic

### 6. ageProvisioningService.ts
**Risk Level:** HIGH
**Contains:**
- Age-appropriate rules
- Feature gating logic
- School type configurations
- Grade group mappings

**Action Required:** Move decision logic to backend

### 7. leaderboardService.ts
**Risk Level:** MEDIUM
**Contains:**
- Ranking algorithms
- Comparison logic
- Trend calculations

**Action Required:** Move ranking logic to backend

## 🟢 MEDIUM RISK - Contains Configuration

### 8. experienceTemplateService.ts
**Risk Level:** MEDIUM
**Contains:**
- Lesson templates
- Assessment configurations
- Project definitions

**Action Required:** Consider moving to CMS or backend

### 9. careerChoiceService.ts
**Risk Level:** MEDIUM
**Contains:**
- Career database
- Skill mappings
- Resource links

**Action Required:** Move database to backend

## Frontend Files That Can Remain

These files can stay in frontend as they only handle display:

### Safe to Keep:
- React Components (UI only)
- CSS/Styling files
- Static assets
- Display utilities
- Routing logic
- State management (UI state only)

### Must Remove:
- Any calculation logic
- Any selection algorithms
- Any scoring formulas
- Any predictive models
- Any analytics calculations

## Code Audit Checklist

### For Each Module:
- [ ] Identify all algorithms
- [ ] List all business logic
- [ ] Document API endpoints needed
- [ ] Create backend service
- [ ] Create frontend API client
- [ ] Test thoroughly
- [ ] Remove frontend logic
- [ ] Deploy and verify

## Migration Priority Order

### Week 1 - CRITICAL
1. pathIQIntelligenceSystem.ts
2. pathIQService.ts
3. pathIQGamificationService.ts

### Week 2 - HIGH
4. pathIQIntegration.ts
5. learningMetricsService.ts
6. ageProvisioningService.ts

### Week 3 - MEDIUM
7. leaderboardService.ts
8. experienceTemplateService.ts
9. careerChoiceService.ts

## Red Flags to Search For

Search your codebase for these terms that indicate sensitive logic:

### Algorithm Indicators:
- `calculate`
- `algorithm`
- `formula`
- `score`
- `rank`
- `predict`
- `analyze`
- `process`
- `evaluate`
- `determine`

### Business Logic Indicators:
- `if (grade`
- `switch (level`
- `Math.`
- `filter(`
- `sort(`
- `reduce(`
- `.map(` with logic
- `Random` with logic

### PathIQ Specific:
- `PathIQ`
- `intelligence`
- `mastery`
- `benchmark`
- `provisioning`
- `diversity`

## Verification Steps

### After Migration:
1. **Source Review:** Open browser DevTools, verify no algorithms visible
2. **Network Check:** Monitor API calls, ensure only data returned
3. **Bundle Analysis:** Check production bundle for sensitive strings
4. **Security Scan:** Run security audit tools
5. **Code Search:** Grep for algorithm keywords

## Emergency Response

### If Sensitive Code Found in Production:
1. **Immediate:** Deploy hotfix removing the code
2. **Within 1 hour:** Push backend API replacement
3. **Within 24 hours:** Full security audit
4. **Document:** Record incident and prevention measures

---

**Remember: If you can see it in the browser, so can everyone else.**