# XP System Flow

## Overview

The XP system has been unified to use the **Gamification Rules Engine** as the single source of truth for XP calculations. There are three data flows:

1. **Journey Tracking** (Database) - Container sessions table
2. **PathIQ UI** (Real-time) - localStorage/React context
3. **PathIQ Persistence** (Database) - Supabase profiles & transactions

## Flow Diagram

```
User answers question
         ↓
Container calculates XP via Rules Engine
         ↓
    ┌────┴────┐
    ↓         ↓
Journey    PathIQ UI
Tracking   (real-time)
(session)
    ↓
Session completes
    ↓
Save to DB
    ↓
PathIQ Persistence
(Supabase)
```

## Step-by-Step Flow

### 1. Question Answered (Practice or Assessment)

**Container code:**
```typescript
const xpAmount = await gamificationRules.calculateXP('practice_correct', {
  studentId: student.id,
  level: profile?.level || 1,
  streak: profile?.streakDays || 0,
  firstTry: interactionCount.current === 0
});
```

**Rules Engine calculates:**
- Practice question: 10 XP base + 5 XP first try bonus
- Assessment question: 20 XP base + 5 XP speed bonus
- Plus career bonus, streak bonus, etc.

### 2. XP Awarded to TWO Systems

**A. Journey Tracking (for database persistence):**
```typescript
journeyTrackingService.awardSessionXP(trackingSessionId, 'LEARN', xpAmount);
```

**B. PathIQ UI (for real-time feedback):**
```typescript
if (features.showXP) {
  awardXP(xpAmount, 'Practice question answered correctly');
}
```

### 3. BentoLearnCardV2 Shows Animation Only

**BentoLearnCardV2 NO LONGER awards XP directly:**
- It only shows the XP animation
- Actual XP is awarded by the container
- This prevents duplicate awards

### 4. Session Completion

**When handleComplete() runs:**

```typescript
// 1. Complete journey tracking session (saves to container_sessions table)
const result = await journeyTrackingService.completeSession(trackingSessionId, 'LEARN');

// 2. Get accumulated XP from session
const sessionData = result.data;
const totalXP = sessionData.xpEarned; // e.g., 80 XP

// 3. Persist to Supabase pathiq_profiles and xp_transactions
await pathiqPersistenceService.awardXP({
  userId: student.id,
  amount: totalXP,
  reason: 'Completed skill in LEARN container',
  sessionId: trackingSessionId,
  container: 'LEARN'
});
```

## XP Calculation Rules

### Practice Questions
- **Base:** 10 XP
- **First Try Bonus:** +5 XP (if first attempt at this question index)
- **Career Bonus:** +3 XP (if career context active)
- **Total Range:** 10-18 XP per question

### Assessment Questions
- **Base:** 20 XP
- **Speed Bonus:** +5 XP (if answered in < 10 seconds)
- **Career Bonus:** +3 XP (if career context active)
- **Partial Credit:** 5 XP (if incorrect but attempted)
- **Total Range:** 5-28 XP

### Example Session
```
Practice Questions (5):
  Q1: 10 + 5 (first try) = 15 XP
  Q2: 10 XP
  Q3: 10 XP
  Q4: 10 XP
  Q5: 10 XP
  Subtotal: 55 XP

Assessment (1):
  Correct + Fast: 20 + 5 = 25 XP

Total: 80 XP
```

## Database Tables

### container_sessions
- `xp_earned` - Total XP for this session (80 in example)
- Updated in real-time during session
- Final save on completion

### xp_transactions
- One row per session completion
- `amount` = session's xp_earned (80)
- `reason` = "Completed [skill] in LEARN container"

### pathiq_profiles
- `xp` - Lifetime total XP across all sessions
- `daily_xp_earned` - XP earned today
- Updated on session completion

## UI vs Database XP

**Why they might differ:**

1. **UI shows live total** - Includes current session + previous sessions
2. **Database shows per-session** - Individual session totals

**Example:**
- Previous sessions: 500 XP (in database)
- Current session: 80 XP (being accumulated)
- **UI shows:** 580 XP total
- **container_sessions shows:** 80 XP (current row)
- **pathiq_profiles shows:** 580 XP (after completion)

## Troubleshooting

### XP not accumulating in session
- Check: `💰 Awarding X XP to journey session` logs
- Rules engine must be calculating > 0
- Check `condition` in rules engine (must match action.type)

### UI not updating
- Check: `features.showXP` is true
- Check: `awardXP()` is being called
- PathIQ gamification hook must be active

### Database XP = 0 after completion
- Check: Session completes successfully (`✅ LEARN session completed`)
- Check: Session data has xpEarned > 0 (`📊 Session data retrieved`)
- Check: pathiqPersistenceService.awardXP succeeds (`⭐ PathIQ XP awarded`)

## Key Changes Made

1. ✅ **Fixed Rules Engine** - Added handling for action types (practice_correct, assessment_correct)
2. ✅ **Fixed Rule Condition** - Changed from `!!context.activity` to `!!context.activity || !!context.action?.type`
3. ✅ **Removed Duplicate Awards** - BentoLearnCardV2 no longer calls pathIQGamification.awardXP directly
4. ✅ **Unified XP Source** - All XP calculations go through gamificationRules.calculateXP()
5. ✅ **Real-time UI Updates** - Container awards XP to PathIQ UI as questions are answered
6. ✅ **Database Persistence** - Session XP saved on completion to both container_sessions and pathiq_profiles
