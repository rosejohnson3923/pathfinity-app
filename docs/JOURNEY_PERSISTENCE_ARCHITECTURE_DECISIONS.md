# Journey Persistence Architecture - Final Decisions

## Overview
This document captures the finalized architectural decisions for user journey persistence, career/companion flexibility, and cost optimization after extensive discussion and analysis of user needs.

## Core Decisions

### 1. Core Architecture: Session-Based Persistence

**DECISION:** Replace `DailyLearningContextManager` with `SessionLearningContextManager`
- **Database-driven sessions** (not browser/localStorage)
- Sessions managed by server timestamps, not client time
- Sessions persist across devices (iPad → laptop continuity)
- **Session timeout: 8 hours of inactivity** (supports flexible homeschool schedules)

**Rationale for 8-hour timeout:**
- Morning session: 8am-10am (2 hours)
- Lunch/activities break
- Afternoon session: 2pm-4pm (2 hours)
- Still within same learning session/narrative
- Maintains career/companion consistency throughout the "school day"

### 2. Golden Rule: One Career, One Companion per Session

**DECISION:** Users select career/companion at session start and maintain it throughout
- Simplifies narrative generation and caching
- Clear mental model for students: "Today I'm a dentist"
- Cost-effective: One Master Narrative per session max
- Session ends = opportunity to choose new career/companion

### 3. Container-Specific Narrative Strategy

**DECISION:** Different narrative approaches per container
- **Learn**: Full Master Narrative generation (rich storytelling)
- **Experience**: JIT generation with career context embedding
- **Discover**: JIT generation with career context embedding

**Key Insight:** Only Learn needs Master Narrative caching since Experience/Discover use fast JIT generation (<500ms)

### 4. Welcome Back Logic

**DECISION:** Container-aware return experience

**For Active Learn Container:**
```
"Welcome back! Continue learning as {career} with {companion}"
[Continue] → Use cached Master Narrative
```

**For Completed Learn or Experience/Discover:**
```
"Welcome back! You were a {career} with {companion}"
[Continue as {career}] [Choose New Adventure]
```

### 5. Master Narrative Caching Strategy

**DECISION:** Single cache slot per student's active Learn session
- Cache key: `user_id + session_id + learn_container`
- If user continues same career → reuse cached narrative (FREE!)
- If user switches career → generate new narrative, replace cache
- No caching for Experience/Discover (JIT is fast enough)

### 6. Container Progression Rules

**DECISION:** Linear progression with flexibility points

1. **Must complete containers in order**: Learn → Experience → Discover
2. **Learn is locked once started**: Must complete all 4 subjects with same career/companion
3. **Can switch careers between containers**: Complete Learn as Coach, start Experience as Designer
4. **Switching mechanism**: Log out and back in after completing Learn

### 7. Start Over Mechanism

**DECISION:** Allow restart with informed consent

If user wants to change career mid-Learn:
- Show progress loss warning (e.g., "You'll lose 75% progress")
- Highlight alternative: "Complete 1 more subject then switch freely!"
- If confirmed: Archive session, reset to beginning
- Track abandonment patterns for PathIQ analytics

**Smart Restart Dialog:**
```
⚠️ Starting Over - Are You Sure?

You've completed 3 of 4 subjects (75%) as a Coach with Finn.

💡 **Did you know?**
Once you complete Learn (just 1 subject left!), you can switch to ANY career
for Experience and Discover. Many students learn fundamentals with one career
then explore applications with different careers!

Your Options:
1. **Finish Learn as Coach** (30 mins remaining)
   → Then choose a NEW career for Experience & Discover

2. **Start Over** with new career
   → Lose all progress (2-3 hours of work)
   → Begin Learn from scratch

[Finish as Coach - Then Switch] [Start Over - I Understand]
```

### 8. Journey Structure Confirmation

**DECISION:** Journey flows through all subjects per container level
```
Learn Container:
  → Math skill
  → ELA skill
  → Science skill
  → Social Studies skill

Experience Container:
  → Math skill
  → ELA skill
  → Science skill
  → Social Studies skill

Discover Container:
  → Math skill
  → ELA skill
  → Science skill
  → Social Studies skill
```

NOT skill cluster lock (which would be all three containers per subject)

### 9. Demo User Handling

**DECISION:** Demo users follow same persistence rules as production
- Demo users (Sam, Taylor, etc.) get full journey persistence
- `is_demo` flag in database for analytics isolation
- Demo data never affects production analytics
- No special routing or dashboards needed for demo students

### 10. Database Schema Approach

**DECISION:** Server-managed learning sessions
```sql
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL,
  career_id TEXT NOT NULL,
  companion_id TEXT NOT NULL,
  started_at TIMESTAMP DEFAULT NOW(),
  last_activity TIMESTAMP DEFAULT NOW(),
  current_container TEXT CHECK (current_container IN ('learn', 'experience', 'discover')),
  container_progress JSONB DEFAULT '{}',
  master_narrative_cache TEXT,
  is_active BOOLEAN DEFAULT true,
  is_demo BOOLEAN DEFAULT false,
  session_metadata JSONB DEFAULT '{}',

  -- Indexes for performance
  INDEX idx_user_active (user_id, is_active),
  INDEX idx_last_activity (last_activity),
  INDEX idx_demo_sessions (is_demo)
);
```

## Implementation Priority

1. **First**: Implement session-based persistence in database
2. **Second**: Update Welcome Back UI with container-aware logic
3. **Third**: Implement Master Narrative caching for Learn only
4. **Fourth**: Add Start Over mechanism with warnings
5. **Fifth**: Enable career switching between containers
6. **Finally**: Implement PathIQ analytics tracking

## Use Case Examples

### Example 1: Sam (Kindergarten) - Consistent Learner
- **Day 1**: Chooses Dentist with Sage, completes Learn (all subjects)
- **Day 2**: Welcome back screen, continues as Dentist for Experience
- **Day 3**: Continues as Dentist for Discover
- Benefits from narrative consistency, parental approval

### Example 2: Taylor (Grade 10) - Explorer
- **Day 1 Morning**: Chooses Coach with Finn for Learn
- **Day 1 Afternoon**: Completes Learn, logs out
- **Day 2**: Chooses UI/UX Designer with Harmony for Experience
- **Day 3**: Chooses Scientist with Nova for Discover
- Explores different career applications while maintaining learning progress

### Example 3: Homeschool Flexible Schedule
- **8am-10am**: Learn Math and ELA as Chef
- **Break for activities/lunch**
- **2pm-4pm**: Continue Learn Science and Social Studies as Chef (same session)
- **Next day**: New session, can choose new career or continue

## Cost Analysis

### Savings from Architecture
- **Master Narrative caching**: ~70% reduction in Learn container AI costs
- **JIT for Experience/Discover**: No caching needed, <500ms generation
- **Session-based choices**: Reduces unnecessary regeneration
- **Smart restart guidance**: Reduces abandonment and wasted generation

### Analytics Value
- Track career/companion persistence patterns
- Identify optimal career/skill combinations
- Measure engagement by career choice flexibility
- Understand session patterns across different user types

## Narrative Continuity Flow

1. **Master Narrative (Learn only)** sets the rich story context
2. **SessionLearningContext** maintains career/companion consistency
3. **JIT generators** embed career context into Experience/Discover content
4. Career thread runs through all containers via context passing, not regeneration

## Key Technical Files to Update

- `/src/services/content/DailyLearningContextManager.ts` → Rename to `SessionLearningContextManager.ts`
- `/src/screens/modal-migration/StudentDashboard.tsx` → Add welcome back logic
- `/src/contexts/NarrativeContext.tsx` → Update caching strategy
- `/src/services/authService.ts` → Track session lifecycle
- `/src/database/migrations/` → Add learning_sessions table

## Conclusion

This architecture balances:
- **Narrative coherence** (consistent within Learn)
- **User flexibility** (switch between containers)
- **Cost optimization** (smart caching, JIT generation)
- **Educational outcomes** (encourages completion)
- **Parent satisfaction** (visible progress, sensible choices)
- **Analytics richness** (detailed journey tracking)

While maintaining a simple mental model: "Pick your adventure for today's learning journey!"