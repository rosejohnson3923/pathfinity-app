# Career Challenge Testing Guide

## Overview
This document provides a comprehensive testing strategy for the Discovered Live! Career Challenge feature. The testing approach includes unit tests, integration tests, and end-to-end testing.

## Testing Options

### 1. Standalone HTML Test Page
**File:** `test-career-challenge.html`

**Usage:**
```bash
# Open directly in browser
open test-career-challenge.html

# Or with URL parameters for auto-initialization
open "test-career-challenge.html?url=YOUR_SUPABASE_URL&key=YOUR_ANON_KEY"
```

**Features:**
- No build process required
- Complete test suite in a single file
- Visual feedback for all test results
- Real-time console output
- Stress testing capabilities

### 2. React Test Component
**File:** `src/components/career-challenge/TestSuite.tsx`

**Integration:**
```tsx
// Add to your routes
import { CareerChallengeTestSuite } from './components/career-challenge/TestSuite';

// In your router
<Route path="/test/career-challenge" element={<CareerChallengeTestSuite />} />
```

**Features:**
- Integrated with existing React app
- Uses actual service classes
- Real-time test status updates
- Comprehensive test categories

### 3. Command Line Testing
```bash
# Run database validation
npm run test:db

# Run service tests
npm run test:services

# Run full integration test
npm run test:career-challenge
```

## Testing Checklist

### Phase 1: Database Testing ✅

#### Schema Validation
- [ ] All 9 tables exist
- [ ] Correct column types and constraints
- [ ] Indexes are properly configured
- [ ] RLS policies are active

#### Data Integrity
- [ ] Industries have valid data
- [ ] Challenges linked to industries
- [ ] Role cards have proper rarities
- [ ] Synergies reference valid roles

```sql
-- Quick validation query
SELECT
  (SELECT COUNT(*) FROM cc_industries) as industries,
  (SELECT COUNT(*) FROM cc_challenges) as challenges,
  (SELECT COUNT(*) FROM cc_role_cards) as role_cards,
  (SELECT COUNT(*) FROM cc_synergies) as synergies;
```

### Phase 2: Service Layer Testing 🔧

#### CareerChallengeService
- [ ] `getIndustries()` returns data
- [ ] `getChallengesByIndustry()` filters correctly
- [ ] `getRoleCardsByIndustry()` returns appropriate cards
- [ ] `calculateTeamPower()` computes correctly
- [ ] `checkSynergies()` identifies valid combinations
- [ ] `attemptChallenge()` returns proper results
- [ ] `drawRoleCards()` maintains rarity distribution
- [ ] `createTrade()` handles transactions

#### Test Code:
```typescript
// Service test example
const service = new CareerChallengeService(supabase);

// Test 1: Get Industries
const industries = await service.getIndustries();
console.assert(industries.length > 0, 'Should have industries');

// Test 2: Calculate Team Power
const teamPower = await service.calculateTeamPower(
  ['role1', 'role2', 'role3'],
  'challenge1'
);
console.assert(teamPower > 0, 'Should calculate power');
```

### Phase 3: Game Engine Testing 🎮

#### Core Mechanics
- [ ] Game session creation
- [ ] Player join/leave handling
- [ ] Turn management
- [ ] Challenge selection
- [ ] Team submission
- [ ] Score calculation
- [ ] Victory conditions
- [ ] Game cleanup

#### Multiplayer Features
- [ ] Real-time updates via Supabase
- [ ] Broadcast events
- [ ] Player synchronization
- [ ] Reconnection handling
- [ ] Concurrent game support

#### Test Scenarios:
```typescript
// Engine test example
const engine = new CareerChallengeGameEngine(supabase);

// Create game
const gameState = await engine.createGameSession(
  'player1',
  'industryId',
  'ROOM001',
  { type: 'score', target: 100 }
);

// Join player
await engine.joinGameSession(gameState.sessionId, 'player2', 'Player 2');

// Start game
await engine.startGame();

// Select challenge
await engine.selectChallenge('player1', 'challenge1');

// Submit team
const result = await engine.submitTeam('player1', ['card1', 'card2']);
```

### Phase 4: AI Integration Testing 🤖

#### Content Generation
- [ ] Challenge generation works
- [ ] Role card generation appropriate
- [ ] Synergy creation logical
- [ ] Content moderation active
- [ ] Caching system functional
- [ ] Rate limiting enforced

#### Test with Mock Data:
```typescript
// AI test (requires API key)
const aiService = new CareerChallengeAIService(apiKey);

const challenge = await aiService.generateChallenge({
  industry: 'esports',
  difficulty: 'medium',
  category: 'Team Management'
});

console.assert(challenge.title, 'Should generate title');
console.assert(challenge.scenarioText, 'Should generate scenario');
```

### Phase 5: UI Component Testing 🎨

#### Visual Components
- [ ] ChallengeCard renders correctly
- [ ] RoleCard displays rarity effects
- [ ] GameRoom handles all states
- [ ] Animations work smoothly
- [ ] Dark mode compatibility
- [ ] Responsive design

#### User Interactions
- [ ] Challenge selection works
- [ ] Team building drag/drop
- [ ] Score updates live
- [ ] Turn timer displays
- [ ] Victory screen shows

### Phase 6: Integration Testing 🔗

#### Full Game Flow
1. [ ] Create room as host
2. [ ] Other players can join
3. [ ] Host can start game
4. [ ] Players receive role cards
5. [ ] Turn rotation works
6. [ ] Challenges can be selected
7. [ ] Teams can be submitted
8. [ ] Scores update correctly
9. [ ] Victory triggers properly
10. [ ] Game cleanup works

#### Edge Cases
- [ ] Player disconnection mid-game
- [ ] Host leaving game
- [ ] Turn timer expiration
- [ ] Invalid team submissions
- [ ] Concurrent challenge attempts
- [ ] Database connection loss

### Phase 7: Performance Testing 💪

#### Load Testing
- [ ] 100 rapid challenge attempts
- [ ] 50 complex synergy calculations
- [ ] 10 concurrent game sessions
- [ ] 1000 role card draws
- [ ] Memory usage stable
- [ ] No memory leaks

#### Benchmarks:
```javascript
// Performance test
console.time('100 Challenges');
for (let i = 0; i < 100; i++) {
  await service.attemptChallenge(sessionId, playerId, challengeId, teamIds);
}
console.timeEnd('100 Challenges'); // Should be < 10s
```

### Phase 8: Security Testing 🔒

#### Authorization
- [ ] RLS policies work correctly
- [ ] Players can't modify others' data
- [ ] Session hijacking prevented
- [ ] API keys not exposed

#### Data Validation
- [ ] Input sanitization works
- [ ] SQL injection prevented
- [ ] XSS protection active
- [ ] Rate limiting enforced

## Manual Testing Script

### Quick Start Test (5 minutes)
1. Open test page or component
2. Initialize Supabase connection
3. Run "Test Schema" - should show 9 tables
4. Run "Get Industries" - should show 3 industries
5. Run "Create Game" - should create session
6. Run "Full Game Flow" - should complete successfully

### Comprehensive Test (30 minutes)
1. **Database Layer (5 min)**
   - Run all database tests
   - Verify data integrity
   - Check foreign keys

2. **Service Layer (5 min)**
   - Test each service method
   - Verify calculations
   - Check error handling

3. **Game Engine (10 min)**
   - Create multiple games
   - Test full game flow
   - Verify turn management
   - Test victory conditions

4. **Multiplayer (5 min)**
   - Test with 4 players
   - Verify real-time updates
   - Test disconnection/reconnection

5. **Performance (5 min)**
   - Run stress tests
   - Monitor memory usage
   - Check response times

## Automated Testing

### Jest Test Suite
```typescript
// __tests__/career-challenge.test.ts
import { CareerChallengeService } from '../src/services/CareerChallengeService';
import { createClient } from '@supabase/supabase-js';

describe('Career Challenge', () => {
  let service: CareerChallengeService;
  let supabase: any;

  beforeAll(() => {
    supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );
    service = new CareerChallengeService(supabase);
  });

  describe('Industries', () => {
    test('should fetch all industries', async () => {
      const industries = await service.getIndustries();
      expect(industries.length).toBeGreaterThan(0);
      expect(industries[0]).toHaveProperty('name');
      expect(industries[0]).toHaveProperty('code');
    });
  });

  describe('Challenges', () => {
    test('should fetch challenges by industry', async () => {
      const industries = await service.getIndustries();
      const challenges = await service.getChallengesByIndustry(industries[0].id);
      expect(challenges.length).toBeGreaterThan(0);
      expect(challenges[0]).toHaveProperty('title');
    });
  });

  describe('Team Power', () => {
    test('should calculate team power correctly', async () => {
      // Mock data
      const roleCardIds = ['card1', 'card2', 'card3'];
      const challengeId = 'challenge1';

      const power = await service.calculateTeamPower(roleCardIds, challengeId);
      expect(power).toBeGreaterThan(0);
    });
  });
});
```

### Playwright E2E Tests
```typescript
// e2e/career-challenge.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Career Challenge E2E', () => {
  test('should complete full game flow', async ({ page }) => {
    // Navigate to game
    await page.goto('/career-challenge');

    // Create room
    await page.click('button:has-text("Create Room")');
    await page.fill('input[name="roomCode"]', 'TEST001');
    await page.click('button:has-text("Create")');

    // Wait for room creation
    await expect(page.locator('text=Room Code: TEST001')).toBeVisible();

    // Start game
    await page.click('button:has-text("Start Game")');

    // Select challenge
    await page.click('.challenge-card:first-child');

    // Select role cards
    await page.click('.role-card:nth-child(1)');
    await page.click('.role-card:nth-child(2)');

    // Submit team
    await page.click('button:has-text("Submit Team")');

    // Verify score update
    await expect(page.locator('.score')).not.toHaveText('0');
  });
});
```

## Troubleshooting

### Common Issues

1. **Database tables not found**
   - Run migration: `database/migrations/career_challenge_schema_fixed.sql`
   - Check Supabase dashboard for table creation

2. **Service initialization fails**
   - Verify Supabase URL and anon key
   - Check network connectivity
   - Ensure RLS policies allow access

3. **Real-time not working**
   - Enable real-time in Supabase dashboard
   - Check WebSocket connection
   - Verify channel subscriptions

4. **AI generation fails**
   - Check OpenAI API key in .env
   - Verify rate limits not exceeded
   - Check API quota/billing

5. **Performance issues**
   - Add database indexes
   - Implement pagination
   - Use connection pooling
   - Enable query caching

## Success Criteria

The Career Challenge feature is considered ready for production when:

- ✅ All database tests pass
- ✅ Service layer handles all operations
- ✅ Game engine manages state correctly
- ✅ Multiplayer synchronization works
- ✅ UI renders properly on all devices
- ✅ Performance benchmarks met
- ✅ Security requirements satisfied
- ✅ 95% test coverage achieved

## Next Steps

After successful testing:

1. Deploy to staging environment
2. Conduct user acceptance testing
3. Performance optimization
4. Security audit
5. Production deployment
6. Monitor error rates
7. Gather user feedback
8. Iterate and improve

## Contact

For issues or questions about testing:
- Check GitHub Issues
- Review test logs in `/test-results`
- Contact development team

---

*Last Updated: [Current Date]*
*Version: 1.0.0*