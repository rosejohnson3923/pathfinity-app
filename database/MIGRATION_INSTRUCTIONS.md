# Database Migration Instructions

## Session Persistence Migration Setup

To enable the session persistence feature, you need to run the database migrations in your Supabase project.

### Prerequisites
- Access to your Supabase project dashboard
- SQL Editor permissions

### Migration Steps

#### Step 1: Create Base Tables (Required if not already created)
This creates the core tables like `users`, `districts`, `schools`, etc.

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **SQL Editor**
3. Copy the contents of `database/schema/01_core_tables.sql`
4. Paste into the SQL Editor
5. Click **Run**

#### Step 2: Setup Migration Tracking (Optional)
This creates a table to track which migrations have been applied.

1. In the SQL Editor
2. Copy the contents of `database/migrations/000_setup_migrations.sql`
3. Paste into the SQL Editor
4. Click **Run**

#### Step 3: Run Session Persistence Migration
This creates the tables needed for session management.

**Option A: With Foreign Keys (if base tables exist)**
1. In the SQL Editor
2. Copy the contents of `database/migrations/008_learning_sessions.sql`
3. Paste into the SQL Editor
4. Click **Run**

**Option B: Standalone Version (if base tables don't exist yet)**
1. In the SQL Editor
2. Copy the contents of `database/migrations/008_learning_sessions_standalone.sql`
3. Paste into the SQL Editor
4. Click **Run**

### Verification

After running the migrations, verify the tables were created:

1. Run the test script:
   ```bash
   node test-session-db.mjs
   ```

2. Expected output:
   ```
   ✅ Table exists! Found 0 sessions
   ✅ session_analytics table exists
   ✅ session_achievements table exists
   ```

### Tables Created

The migration creates these tables:

1. **learning_sessions** - Stores active learning sessions
   - Tracks career and companion choices
   - Maintains progress across containers
   - 8-hour timeout for flexibility

2. **session_analytics** - Stores analytics events
   - Tracks user behavior patterns
   - Records progress milestones
   - Enables PathIQ insights

3. **session_achievements** - Stores earned achievements
   - Tracks gamification rewards
   - Records special milestones
   - Supports badges and streaks

### Troubleshooting

If you encounter errors:

1. **"relation already exists"** - The tables already exist. This is fine, the migration uses IF NOT EXISTS.

2. **"permission denied"** - Ensure you're using the service role key or have proper permissions.

3. **"schema_migrations does not exist"** - This is fine, the migration handles this case. The tracking table is optional.

### Manual Verification Query

Run this query to check if tables exist:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('learning_sessions', 'session_analytics', 'session_achievements');
```

### Next Steps

After migrations are complete:

1. Restart your development server
2. Test the session persistence by:
   - Logging in as a student
   - Making career/companion selections
   - Refreshing the page
   - Verifying the "Welcome Back" modal appears

### Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase credentials in `.env`
3. Ensure the backend server is running on port 3002