# Database Migration Instructions

## Quick Start: Running Migrations in Supabase Dashboard

Since direct SQL execution requires database admin access, please run these migrations through the Supabase SQL Editor:

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query**

### Step 2: Run Migrations in Order

**IMPORTANT**: Run these migrations in sequence, one at a time.

#### Migration 1: AI Content Storage (002)
1. Open file: `/database/migrations/002_ai_content_storage.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run** (or press Ctrl+Enter)
5. Verify tables created:
   - ai_generated_content
   - content_cache
   - question_types
   - question_validation_log
   - test_scenarios

#### Migration 2: Static Reference Data (003)
1. Open file: `/database/migrations/003_static_reference_data.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify tables created:
   - question_type_definitions
   - grade_configurations
   - subject_configurations
   - skills_master_v2
   - detection_rules
   - Plus detection function

#### Migration 3: Common Core Career Skills (004)
1. Open file: `/database/migrations/004_common_core_career_skills.sql`
2. Copy the entire contents
3. Paste into SQL Editor
4. Click **Run**
5. Verify tables created:
   - common_core_standards
   - career_paths
   - career_standard_mapping
   - student_career_interests
   - student_common_core_progress
   - career_readiness_scores
   - career_skill_clusters
   - career_learning_paths
   - career_aligned_content_cache

### Step 3: Verify Migration Success

Run this query to check all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  -- From migration 002
  'ai_generated_content',
  'content_cache',
  'question_types',
  'question_validation_log',
  'test_scenarios',
  -- From migration 003
  'question_type_definitions',
  'grade_configurations',
  'subject_configurations',
  'skills_master_v2',
  'detection_rules',
  -- From migration 004
  'common_core_standards',
  'career_paths',
  'career_standard_mapping',
  'student_career_interests',
  'student_common_core_progress',
  'career_readiness_scores',
  'career_skill_clusters',
  'career_learning_paths',
  'career_aligned_content_cache'
)
ORDER BY table_name;
```

You should see 19 tables listed.

### Step 4: Verify Sample Data

Check that sample data was inserted:

```sql
-- Check question types (should have 15)
SELECT COUNT(*) as question_type_count FROM question_type_definitions;

-- Check career paths (should have 10)
SELECT COUNT(*) as career_count FROM career_paths;

-- Check detection rules (should have multiple)
SELECT COUNT(*) as detection_rule_count FROM detection_rules;
```

### Step 5: Create Migration Tracking (Optional)

To track which migrations have been run:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(255) PRIMARY KEY,
  executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_migrations (version) VALUES 
  ('002_ai_content_storage'),
  ('003_static_reference_data'),
  ('004_common_core_career_skills');
```

## Alternative: Using psql Command Line

If you have psql access to your database:

```bash
# Set connection string (get from Supabase dashboard > Settings > Database)
export DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres"

# Run migrations
psql $DATABASE_URL -f database/migrations/002_ai_content_storage.sql
psql $DATABASE_URL -f database/migrations/003_static_reference_data.sql
psql $DATABASE_URL -f database/migrations/004_common_core_career_skills.sql
```

## Troubleshooting

### If a migration fails:
1. Check for error messages in the SQL Editor output
2. Common issues:
   - Table already exists: Add `IF NOT EXISTS` to CREATE TABLE statements
   - Permission denied: Ensure you're using the service role key
   - Syntax error: Check for missing semicolons or quotes

### To rollback:
```sql
-- Drop all tables from migration 004
DROP TABLE IF EXISTS career_aligned_content_cache CASCADE;
DROP TABLE IF EXISTS career_learning_paths CASCADE;
DROP TABLE IF EXISTS career_skill_clusters CASCADE;
DROP TABLE IF EXISTS career_readiness_scores CASCADE;
DROP TABLE IF EXISTS student_common_core_progress CASCADE;
DROP TABLE IF EXISTS student_career_interests CASCADE;
DROP TABLE IF EXISTS career_standard_mapping CASCADE;
DROP TABLE IF EXISTS career_paths CASCADE;
DROP TABLE IF EXISTS common_core_standards CASCADE;

-- Drop all tables from migration 003
DROP TABLE IF EXISTS detection_rules CASCADE;
DROP TABLE IF EXISTS skills_master_v2 CASCADE;
DROP TABLE IF EXISTS subject_configurations CASCADE;
DROP TABLE IF EXISTS grade_configurations CASCADE;
DROP TABLE IF EXISTS question_type_definitions CASCADE;
DROP FUNCTION IF EXISTS detect_question_type CASCADE;

-- Drop all tables from migration 002
DROP TABLE IF EXISTS test_scenarios CASCADE;
DROP TABLE IF EXISTS question_validation_log CASCADE;
DROP TABLE IF EXISTS question_types CASCADE;
DROP TABLE IF EXISTS content_cache CASCADE;
DROP TABLE IF EXISTS ai_generated_content CASCADE;
```

## Next Steps

After migrations are complete:
1. Run the Common Core import: `npm run import:common-core`
2. Import Grade 10 skills data (when available)
3. Continue with Phase 3 of the implementation plan