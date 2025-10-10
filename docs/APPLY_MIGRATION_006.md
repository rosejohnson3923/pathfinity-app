# Apply Migration 006: Practice/Assessment Fields

## What This Adds

This migration adds separate tracking for practice vs assessment questions:
- `practice_questions_attempted`
- `practice_questions_correct`
- `assessment_questions_attempted`
- `assessment_questions_correct`

The existing `questions_attempted` and `questions_correct` fields remain as totals for backward compatibility.

## How to Apply

### Option 1: Via Supabase Dashboard (Recommended)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/006_add_practice_assessment_fields.sql`
6. Click **Run** (or press Cmd/Ctrl + Enter)
7. Verify you see "Success. No rows returned"

### Option 2: Via Supabase CLI

```bash
supabase db push
```

## Verify the Migration

Run this query in Supabase SQL Editor:

```sql
SELECT
  column_name,
  data_type,
  column_default
FROM information_schema.columns
WHERE table_name = 'container_sessions'
  AND column_name LIKE '%questions%'
ORDER BY ordinal_position;
```

You should see:
- questions_attempted
- questions_correct
- practice_questions_attempted (NEW)
- practice_questions_correct (NEW)
- assessment_questions_attempted (NEW)
- assessment_questions_correct (NEW)

## Test the Integration

Complete a LEARN container session and then run the better query:

```sql
SELECT
  container,
  subject,
  skill_name,
  questions_attempted,
  questions_correct,
  practice_questions_attempted,
  practice_questions_correct,
  assessment_questions_attempted,
  assessment_questions_correct,
  score,
  xp_earned,
  completed,
  created_at
FROM container_sessions
ORDER BY created_at DESC
LIMIT 5;
```

You should see:
- `practice_questions_attempted` = number of practice questions you answered
- `practice_questions_correct` = how many you got right
- `assessment_questions_attempted` = 1 (if you completed the assessment)
- `assessment_questions_correct` = 1 or 0 (depending on assessment result)
- `questions_attempted` = sum of practice + assessment
- `questions_correct` = sum of correct practice + correct assessment
