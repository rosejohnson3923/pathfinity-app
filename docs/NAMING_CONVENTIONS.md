# Pathfinity Naming Conventions

## Overview

This document establishes the naming conventions used throughout the Pathfinity codebase to ensure consistency between database schema and TypeScript code.

## Core Principle

**Database columns use `snake_case`, TypeScript interfaces use `camelCase`.**

The Supabase client automatically handles the mapping between snake_case (database) and camelCase (TypeScript) when fetching data.

---

## Database Layer (SQL)

### Table Names
- Use `snake_case` for all table names
- Use singular or plural based on convention:
  - `skills_master` (plural)
  - `career_paths` (plural)
  - `student_profiles` (plural)
  - `journey_summary` (singular)

### Column Names
- **Always use `snake_case`** for column names
- **IMPORTANT:** Grade-related columns vary by table:
  - `grade` - Used in `skills_master` table (K, 1, 2, etc.)
  - `grade_level` - Used in `student_profiles` table
  - `grade_category` - Used in `career_paths` table (elementary/middle/high)
- Common columns:
  - `skill_name` (NOT `skillName` or `name`)
  - `skill_number` (NOT `skillNumber`)
  - `career_code` (NOT `careerCode`)
  - `career_name` (NOT `careerName`)
  - `created_at` (NOT `createdAt`)
  - `updated_at` (NOT `updatedAt`)

### Foreign Keys
- Format: `{table_name}_id` or `{referenced_column}`
- Examples:
  - `student_id` references `students(id)`
  - `skill_id` references `skills_master(id)`
  - `career_code` references `career_paths(career_code)`

### Examples from Actual Schema:

#### skills_master table
```sql
CREATE TABLE skills_master (
  id UUID PRIMARY KEY,
  subject TEXT NOT NULL,
  grade TEXT NOT NULL,           -- snake_case (NOTE: 'grade' not 'grade_level')
  skill_number TEXT NOT NULL,    -- snake_case
  skill_name TEXT NOT NULL,      -- snake_case
  skill_description TEXT,        -- snake_case
  skills_area TEXT NOT NULL,     -- snake_case
  skills_cluster TEXT NOT NULL,  -- snake_case
  difficulty_level INTEGER,      -- snake_case
  created_at TIMESTAMPTZ,        -- snake_case
  updated_at TIMESTAMPTZ         -- snake_case
);
```

#### career_paths table
```sql
CREATE TABLE career_paths (
  career_code VARCHAR(100) PRIMARY KEY,  -- snake_case
  career_name TEXT NOT NULL,              -- snake_case
  grade_category TEXT NOT NULL,           -- snake_case
  icon TEXT,
  color TEXT,
  is_active BOOLEAN                       -- snake_case
);
```

#### career_analytics_view
```sql
CREATE VIEW career_analytics_view AS
SELECT
  cp.career_code,          -- snake_case
  cp.career_name,          -- snake_case
  cp.grade_category,       -- snake_case
  cp.access_tier           -- snake_case
FROM career_paths cp;
```

---

## TypeScript Layer

### Interface Names
- Use `PascalCase` for interface names
- Examples: `Skill`, `CareerCore`, `StudentProfile`

### Property Names
- **Always use `camelCase`** for interface properties
- The Supabase client automatically converts snake_case to camelCase

### Examples from Actual Codebase:

#### LearningTypes.ts
```typescript
export interface Skill {
  skill_number: string;   // Exception: Base DB interface keeps snake_case
  skill_name: string;     // Exception: Base DB interface keeps snake_case
  subject: string;
  gradeLevel: string;     // Mapped from grade_level in service layer
  difficulty: number;
}
```

#### CareerTypes.ts
```typescript
export interface CareerCore {
  career_code: string;    // Exception: Kept as snake_case to match DB
  career_name: string;    // Exception: Kept as snake_case to match DB
  grade_category: string; // Exception: Kept as snake_case to match DB
  icon: string;
  color: string;
  description?: string;
}
```

### Service Layer Pattern

When fetching from Supabase, the service layer handles any necessary transformations:

```typescript
// Supabase query returns snake_case by default
const { data } = await supabase
  .from('skills_master_v2')
  .select('skill_name, grade_level, skill_number')
  .eq('grade_level', gradeLevel);

// Data comes back with snake_case properties matching the DB
// If you need camelCase, transform in the service layer
const transformedData = data.map(skill => ({
  skillName: skill.skill_name,
  gradeLevel: skill.grade_level,
  skillNumber: skill.skill_number
}));
```

---

## Career Detective Challenge Tables

### Correct Naming (Following Convention)

```sql
-- career_clues table
CREATE TABLE career_clues (
  id UUID PRIMARY KEY,
  career_code TEXT REFERENCES career_paths(career_code),
  clue_text TEXT NOT NULL,
  skill_connection TEXT NOT NULL,
  difficulty TEXT,
  grade_category TEXT,              -- snake_case (NOT gradeCategory)
  min_play_count INTEGER,           -- snake_case
  distractor_careers TEXT[],        -- snake_case
  distractor_strategy TEXT,         -- snake_case
  created_at TIMESTAMPTZ,           -- snake_case
  updated_at TIMESTAMPTZ,           -- snake_case
  is_active BOOLEAN,                -- snake_case
  times_shown INTEGER,              -- snake_case
  times_correct INTEGER,            -- snake_case
  avg_response_time_seconds FLOAT   -- snake_case
);

-- career_detective_games table
CREATE TABLE career_detective_games (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students(id),
  journey_summary_id UUID REFERENCES journey_summary(id),
  bingo_grid JSONB NOT NULL,
  total_questions INTEGER,             -- snake_case
  status TEXT,
  current_question_index INTEGER,      -- snake_case
  questions_asked JSONB,               -- snake_case
  correct_answers INTEGER,             -- snake_case
  incorrect_answers INTEGER,           -- snake_case
  unlocked_squares JSONB,              -- snake_case
  completed_rows INTEGER[],            -- snake_case
  completed_columns INTEGER[],         -- snake_case
  completed_diagonals INTEGER[],       -- snake_case
  base_xp_earned INTEGER,              -- snake_case
  bingo_bonus_xp INTEGER,              -- snake_case
  streak_bonus_xp INTEGER,             -- snake_case
  total_xp INTEGER,                    -- snake_case
  current_streak INTEGER,              -- snake_case
  max_streak INTEGER,                  -- snake_case
  avg_response_time_seconds FLOAT,     -- snake_case
  started_at TIMESTAMPTZ,              -- snake_case
  completed_at TIMESTAMPTZ,            -- snake_case
  time_elapsed_seconds INTEGER,        -- snake_case
  user_play_count INTEGER              -- snake_case
);

-- career_detective_answers table
CREATE TABLE career_detective_answers (
  id UUID PRIMARY KEY,
  game_id UUID REFERENCES career_detective_games(id),
  clue_id UUID REFERENCES career_clues(id),
  question_number INTEGER,            -- snake_case
  career_code TEXT REFERENCES career_paths(career_code),
  options_shown JSONB,                -- snake_case
  correct_option_index INTEGER,       -- snake_case
  student_answer_index INTEGER,       -- snake_case
  is_correct BOOLEAN,                 -- snake_case
  response_time_seconds FLOAT,        -- snake_case
  answered_at TIMESTAMPTZ,            -- snake_case
  unlocked_position JSONB             -- snake_case
);
```

### Corresponding TypeScript Interfaces

```typescript
export interface CareerClue {
  id: string;
  careerCode: string;              // camelCase
  clueText: string;                // camelCase
  skillConnection: string;         // camelCase
  difficulty: 'easy' | 'medium' | 'hard';
  gradeCategory: 'elementary' | 'middle' | 'high';  // camelCase
  minPlayCount: number;            // camelCase
  distractorCareers?: string[];    // camelCase
  distractorStrategy?: 'random' | 'related' | 'same_skill';  // camelCase
  createdAt: string;               // camelCase
  updatedAt: string;               // camelCase
  isActive: boolean;               // camelCase
  timesShown: number;              // camelCase
  timesCorrect: number;            // camelCase
  avgResponseTimeSeconds?: number; // camelCase
}

export interface CareerDetectiveGame {
  id: string;
  studentId: string;               // camelCase
  journeySummaryId?: string;       // camelCase
  bingoGrid: BingoGrid;            // camelCase
  totalQuestions: number;          // camelCase
  status: 'in_progress' | 'completed' | 'abandoned';
  currentQuestionIndex: number;    // camelCase
  questionsAsked: string[];        // camelCase
  correctAnswers: number;          // camelCase
  incorrectAnswers: number;        // camelCase
  unlockedSquares: GridPosition[]; // camelCase
  completedRows: number[];         // camelCase
  completedColumns: number[];      // camelCase
  completedDiagonals: number[];    // camelCase
  baseXpEarned: number;            // camelCase
  bingoBonusXp: number;            // camelCase
  streakBonusXp: number;           // camelCase
  totalXp: number;                 // camelCase
  currentStreak: number;           // camelCase
  maxStreak: number;               // camelCase
  avgResponseTimeSeconds?: number; // camelCase
  startedAt: string;               // camelCase
  completedAt?: string;            // camelCase
  timeElapsedSeconds?: number;     // camelCase
  userPlayCount: number;           // camelCase
}
```

---

## Quick Reference Table

| Database Column (SQL) | TypeScript Property | Table(s) | Notes |
|----------------------|---------------------|----------|-------|
| `grade` | `grade` | `skills_master` | K, 1, 2, 3, etc. |
| `grade_level` | `gradeLevel` | `student_profiles` | Student's grade |
| `grade_category` | `gradeCategory` | `career_paths` | elementary/middle/high |
| `skill_name` | `skillName` | `skills_master` | Name of skill |
| `skill_number` | `skillNumber` | `skills_master` | e.g., "A.1" |
| `career_code` | `careerCode` | `career_paths` | Unique identifier |
| `career_name` | `careerName` | `career_paths` | Display name |
| `created_at` | `createdAt` | All tables | Timestamp |
| `updated_at` | `updatedAt` | All tables | Timestamp |
| `is_active` | `isActive` | Various | Boolean flag |
| `student_id` | `studentId` | Various | UUID reference |
| `journey_summary_id` | `journeySummaryId` | Various | UUID reference |
| `min_play_count` | `minPlayCount` | `career_clues` | Integer |
| `times_shown` | `timesShown` | `career_clues` | Integer |
| `times_correct` | `timesCorrect` | `career_clues` | Integer |
| `current_question_index` | `currentQuestionIndex` | `career_detective_games` | Integer |
| `unlocked_squares` | `unlockedSquares` | `career_detective_games` | Array |

---

## Common Mistakes to Avoid

❌ **WRONG:** Using camelCase in SQL
```sql
CREATE TABLE career_clues (
  careerCode TEXT,        -- WRONG
  gradeCategory TEXT,     -- WRONG
  minPlayCount INTEGER    -- WRONG
);
```

✅ **CORRECT:** Using snake_case in SQL
```sql
CREATE TABLE career_clues (
  career_code TEXT,       -- CORRECT
  grade_category TEXT,    -- CORRECT
  min_play_count INTEGER  -- CORRECT
);
```

❌ **WRONG:** Using snake_case in TypeScript interfaces
```typescript
interface CareerClue {
  career_code: string;    // WRONG
  grade_category: string; // WRONG
  min_play_count: number; // WRONG
}
```

✅ **CORRECT:** Using camelCase in TypeScript interfaces
```typescript
interface CareerClue {
  careerCode: string;     // CORRECT
  gradeCategory: string;  // CORRECT
  minPlayCount: number;   // CORRECT
}
```

---

## Important Notes

### ⚠️ Grade Column Naming - Critical!

**Different tables use different column names for grade information:**

1. **`skills_master` table** → Uses `grade` column
   - Values: 'Pre-K', 'K', '1', '2', '3', '7', '10', etc.
   - This is the skill's grade level
   - **This is the ACTIVE table** (NOT `skills_master_v2`)

2. **`student_profiles` table** → Uses `grade_level` column
   - Values: 'Pre-K', 'K', '1', '2', '3', etc.
   - This is the student's current grade

3. **`career_paths` table** → Uses `grade_category` column
   - Values: 'elementary', 'middle', 'high'
   - Broader categorization for career audience targeting

**Always verify which table you're querying to use the correct column name!**

---

## References

- **Database Schema Documentation:** `/documentation/pathfinity_database_schema.txt`
- **Core Types:** `/src/types/LearningTypes.ts`, `/src/types/CareerTypes.ts`
- **Career Detective Types:** `/src/types/CareerDetectiveTypes.ts`
- **Service Examples:** `/src/services/CareerAccessService.ts`
- **Migration Examples:** `/database/migrations/011_career_attributes_table.sql`
- **Career Detective Migration:** `/database/migrations/039_career_detective_game_tables.sql`

---

**Last Updated:** 2025-10-11
**Maintained By:** Development Team
