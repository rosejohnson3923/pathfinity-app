# Fix Career Tier Naming: Standard → Select

## Quick Migration

Run this SQL in your Supabase SQL Editor:

```sql
-- Fix careers table tier naming: Change 'standard' to 'select'
ALTER TABLE careers DROP CONSTRAINT IF EXISTS careers_tier_check;

UPDATE careers
SET tier = 'select'
WHERE tier = 'standard';

ALTER TABLE careers
ADD CONSTRAINT careers_tier_check
CHECK (tier IN ('select', 'premium'));

-- Verify the results
SELECT
  tier,
  COUNT(*) as count
FROM careers
GROUP BY tier
ORDER BY tier;
```

## Expected Result
- All careers should now have tier = 'select' or 'premium'
- NO careers should have tier = 'standard'

## Test
Visit: http://localhost:5173/test/career-database

The dashboard should now work properly with Select and Premium tiers.