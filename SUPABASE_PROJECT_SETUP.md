# Supabase Project Setup for pathfinity-app

## Current Issue
The project appears to be using a Supabase instance (`zohdmprtfyijneqnwjsu`) that either:
1. Belongs to the old `pathfinity-revolutionary` project
2. Is the correct project but missing proper table configuration
3. Has tables that aren't exposed via the API

## Verification Steps

### 1. Verify Which Project You're Connected To
Run the SQL script `verify-supabase-project.sql` in your Supabase SQL Editor to check:
- Current database name
- List of all tables
- Whether monitoring tables exist
- API accessibility status

### 2. Check Supabase Dashboard
1. Go to https://app.supabase.com
2. Find the project with ID `zohdmprtfyijneqnwjsu`
3. Verify this is the intended project for `pathfinity-app`

### 3. If This is the Wrong Project
You need to create a new Supabase project for pathfinity-app:

#### Create New Project
1. Go to https://app.supabase.com
2. Click "New Project"
3. Name it "pathfinity-app"
4. Save the new credentials

#### Update Environment Variables
```bash
# .env
VITE_SUPABASE_URL=https://YOUR_NEW_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=your_new_anon_key

# Also update the service role key if needed
SUPABASE_SERVICE_ROLE_KEY=your_new_service_role_key
```

### 4. If This is the Correct Project
The tables exist but aren't accessible via API. This could be because:

#### A. Tables Need API Exposure
In Supabase Dashboard:
1. Go to Settings → API
2. Check "Exposed schemas" - ensure `public` is selected
3. Check "Exposed tables" - ensure your tables are included

#### B. RLS is Blocking Access
Run this SQL to temporarily disable RLS for testing:
```sql
ALTER TABLE error_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE detection_performance_metrics DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_analytics DISABLE ROW LEVEL SECURITY;
```

#### C. API Schema Needs Refresh
Sometimes Supabase's API schema cache needs updating:
1. Go to Settings → API
2. Click "Reload Schema Cache" (if available)
3. Or make a small schema change and revert it to trigger refresh

## Setting Up Tables for New Project

If you're setting up a fresh Supabase project, run these scripts in order:

1. **Core Tables** (from existing migrations)
   - Run all SQL files in `/database/*.sql`

2. **Monitoring Tables**
   - Run `create-monitoring-tables.sql`

3. **Fix Permissions**
   - Run `fix-api-exposure.sql`

## Testing the Connection

After setup, test the connection with this simple script:

```javascript
// test-supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

// Test read
const { data, error } = await supabase
  .from('error_logs')
  .select('*')
  .limit(1)

if (error) {
  console.error('Read failed:', error)
} else {
  console.log('Read successful:', data)
}

// Test write
const { error: writeError } = await supabase
  .from('error_logs')
  .insert({
    error_type: 'test',
    error_message: 'Test message',
    severity: 'low'
  })

if (writeError) {
  console.error('Write failed:', writeError)
} else {
  console.log('Write successful')
}
```

## Common Issues and Solutions

### Issue: 404 on table access
**Solution:** Table doesn't exist or isn't in public schema. Check with:
```sql
SELECT * FROM information_schema.tables
WHERE table_name = 'error_logs';
```

### Issue: 403 Forbidden
**Solution:** RLS policy blocking access. Check policies with:
```sql
SELECT * FROM pg_policies
WHERE tablename = 'error_logs';
```

### Issue: Multiple Supabase client warnings
**Solution:** Supabase client is being initialized multiple times. Ensure singleton pattern in `src/lib/supabase.ts`

### Issue: Connection refused
**Solution:** Wrong URL or network issue. Verify URL format:
- Correct: `https://[project-id].supabase.co`
- Wrong: `https://[project-id].supabase.io` (old format)

## Migration from pathfinity-revolutionary

If you need to migrate data from the old project:

1. Export data from old project:
```sql
-- In old project
COPY (SELECT * FROM skills) TO '/tmp/skills.csv' CSV HEADER;
COPY (SELECT * FROM students) TO '/tmp/students.csv' CSV HEADER;
```

2. Import to new project:
```sql
-- In new project
COPY skills FROM '/tmp/skills.csv' CSV HEADER;
COPY students FROM '/tmp/students.csv' CSV HEADER;
```

## Recommended Next Steps

1. **Run `verify-supabase-project.sql`** to understand current state
2. **Decide** if this is the correct project or if you need a new one
3. **Follow** the appropriate section above based on your decision
4. **Test** with the provided test script
5. **Update** this document with your actual project details once confirmed

## Project Details (TO BE FILLED)

Once you've verified/created the correct project, document it here:

- **Project Name:** [Your project name]
- **Project ID:** [Your project ID]
- **Project URL:** [Your supabase URL]
- **Created Date:** [Date created]
- **Purpose:** pathfinity-app production database
- **Tables Created:** [List of tables]
- **Special Configuration:** [Any special settings]