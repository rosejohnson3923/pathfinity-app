# Consolidate Careers Tables

## Problem
We have two career tables that should be one:
- **`career_paths`**: 119+ careers, has grade-level filtering, more complete
- **`careers`**: Only 68 careers, no grade filtering, used by progressions

## Solution
Merge everything into `career_paths` table and drop the redundant `careers` table.

## Run This Migration

In your Supabase SQL Editor, run:

```sql
-- File: database/migrations/028_consolidate_careers_to_career_paths.sql
```

This migration will:
1. Add missing columns to `career_paths` (emoji, field_id)
2. Copy all careers from `careers` → `career_paths`
3. Update `career_path_progressions` to reference `career_paths` instead
4. Update all views and functions
5. Preserve all existing data

## After Migration

The system will have:
- **One unified table**: `career_paths` with 119+ careers
- **Grade-level filtering**: Works properly for age-appropriate career selection
- **All progressions intact**: Linked to the consolidated table
- **Subscription tiers**: Using `access_tier` field ('select' or 'premium')

## Verify Results

```sql
-- Check the consolidated data
SELECT
    COUNT(*) as total_careers,
    COUNT(CASE WHEN access_tier = 'select' THEN 1 END) as select_careers,
    COUNT(CASE WHEN access_tier = 'premium' THEN 1 END) as premium_careers
FROM career_paths
WHERE is_active = true;

-- Check progressions are linked correctly
SELECT
    cp.career_name,
    COUNT(cpp.id) as progression_count
FROM career_paths cp
LEFT JOIN career_path_progressions cpp ON cp.id = cpp.base_career_path_id
GROUP BY cp.career_name
HAVING COUNT(cpp.id) > 0
LIMIT 10;
```

## Clean Up (After Verification)

Once verified, you can uncomment and run the cleanup lines in the migration to:
- Drop the old `careers` table
- Remove temporary columns

## Update Code

After migration, the `CareerPathProgressionService.ts` needs to be updated to use `career_paths` table instead of `careers`.