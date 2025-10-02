# Career Path Progression Database Migration Instructions

## Quick Start - Manual Migration

The career progression system needs to be set up in your Supabase database. Follow these steps:

### Step 1: Access Supabase SQL Editor

1. Go to your Supabase dashboard: https://zohdmprtfyijneqnwjsu.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Run Migration Scripts

Run these SQL files in order:

#### First Migration (if not already done):
Copy and paste the contents of:
```
database/migrations/011_career_path_progression.sql
```

#### Second Migration (FIXED version):
Copy and paste the contents of:
```
database/migrations/012_career_data_complete_FIXED.sql
```

### Step 3: Verify Installation

After running both migrations, run this verification query:

```sql
-- Check career counts
SELECT
    (SELECT COUNT(*) FROM careers) as total_careers,
    (SELECT COUNT(*) FROM careers WHERE tier = 'standard') as standard_careers,
    (SELECT COUNT(*) FROM careers WHERE tier = 'premium') as premium_careers,
    (SELECT COUNT(*) FROM career_path_progressions) as total_progressions,
    (SELECT COUNT(*) FROM booster_types) as booster_types;
```

Expected results:
- total_careers: 70+
- standard_careers: 30+
- premium_careers: 40+
- total_progressions: 280+ (each career × 4 booster types)
- booster_types: 4

### Step 4: Test the Dashboard

Once migrations are complete, test the database-driven dashboard:

1. Navigate to: http://localhost:5173/test/career-database
2. You should see:
   - Select tier with 30+ standard careers
   - Premium tier with 40+ premium careers
   - Each career showing 4 booster progressions
   - Real-time database connection

## Troubleshooting

### If you get errors about existing tables:
The tables might already exist. That's fine - the migrations use `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`.

### If you get JSONB casting errors:
Use the FIXED version of the migration (012_career_data_complete_FIXED.sql) which has corrected JSONB syntax.

### To check current database state:
Run: `node database/scripts/apply-career-migrations.js`

## What This Creates

The migration sets up:

1. **careers** table - 70+ careers across Standard and Premium tiers
2. **career_path_progressions** table - 4 progressions for each career
3. **booster_types** table - 4 booster enhancement types
4. **career_fields** table - 10 career field categories

Each career can be enhanced with:
- **Trade Skills** - Hands-on technical expertise
- **Corporate Leadership** - Management and team leadership
- **Business Ownership** - Entrepreneurial skills
- **AI Integration** - AI-powered tools and automation

## Support

If you encounter issues:
1. Check the Supabase logs for error details
2. Verify your environment variables are set correctly
3. Ensure you're connected to the correct database