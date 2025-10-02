/**
 * Generate safe SQL script that handles duplicate career codes
 */

const fs = require('fs');
const csv = require('csv-parser');

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function generateSafeSQL() {
  console.log('\n🔧 Generating safe career code update SQL with duplicate handling...\n');

  try {
    // Read CSV data
    const csvData = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.id?.trim() && row.career_code?.trim()) {
            csvData.push({
              id: row.id.trim(),
              career_code: row.career_code.trim(),
              career_name: row.career_name?.trim()
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`Found ${csvData.length} careers in CSV`);

    // Known conflicts that need special handling
    const knownConflicts = [
      'marketing-director', 'scientist', 'ceo', 'vr-developer', 'ai-engineer', 'coach'
    ];

    // Generate SQL script
    let sql = `-- Safe Career Code Update Script
-- Handles duplicate key conflicts by renaming existing careers temporarily
-- Run this entire script in Supabase SQL editor

-- Step 1: Add temporary field
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS career_code1 TEXT;

-- Step 2: Handle conflicts first - rename existing careers that would conflict
DO $$
DECLARE
  conflict_codes TEXT[] := ARRAY['marketing-director', 'scientist', 'ceo', 'vr-developer', 'ai-engineer', 'coach'];
  conflict_code TEXT;
  temp_suffix TEXT;
BEGIN
  FOREACH conflict_code IN ARRAY conflict_codes
  LOOP
    temp_suffix := '_temp_' || extract(epoch from now())::bigint::text;

    -- Check if this code exists and would conflict
    IF EXISTS (SELECT 1 FROM career_paths WHERE career_code = conflict_code) THEN
      -- Temporarily rename the existing career to avoid conflict
      UPDATE career_paths
      SET career_code = conflict_code || temp_suffix
      WHERE career_code = conflict_code;

      -- Also update career_attributes if it exists
      UPDATE career_attributes
      SET career_code = conflict_code || temp_suffix
      WHERE career_code = conflict_code;

      RAISE NOTICE 'Temporarily renamed existing % to %', conflict_code, conflict_code || temp_suffix;
    END IF;
  END LOOP;
END $$;

-- Step 3: Import all career codes from CSV to career_code1
`;

    // Add update statements for each career
    csvData.forEach(career => {
      const safeName = career.career_name?.replace(/'/g, "''") || 'Unknown';
      sql += `UPDATE career_paths SET career_code1 = '${career.career_code}' WHERE id = '${career.id}'; -- ${safeName}\n`;
    });

    sql += `
-- Step 4: Drop foreign key constraint temporarily
ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;

-- Step 5: Update career_code with career_code1 values where they differ
UPDATE career_paths
SET career_code = career_code1
WHERE career_code != career_code1
  AND career_code1 IS NOT NULL
  AND id IN (
    -- Only update careers that are in our CSV
    ${csvData.map(c => `'${c.id}'`).join(',\n    ')}
  );

-- Step 6: Update career_attributes to match the new career codes
-- This handles the mapping from old codes to new codes
UPDATE career_attributes
SET career_code = cp.career_code
FROM career_paths cp
WHERE career_attributes.career_code != cp.career_code
  AND EXISTS (
    -- Find old career_code patterns and match to new ones
    SELECT 1 FROM career_paths cp2
    WHERE cp2.id = cp.id
    AND (
      -- Map specific old patterns to new codes
      (career_attributes.career_code LIKE '%_' || UPPER(REPLACE(cp.career_code, '-', '_'))) OR
      (career_attributes.career_code = 'ELEM_' || UPPER(REPLACE(cp.career_code, '-', '_'))) OR
      (career_attributes.career_code = 'MID_' || UPPER(REPLACE(cp.career_code, '-', '_'))) OR
      (career_attributes.career_code = 'HIGH_' || UPPER(REPLACE(cp.career_code, '-', '_'))) OR
      (career_attributes.career_code LIKE '%temp_%')
    )
  );

-- Step 7: Clean up any remaining temporary codes in career_attributes
UPDATE career_attributes
SET career_code = REGEXP_REPLACE(career_code, '_temp_[0-9]+$', '')
WHERE career_code LIKE '%_temp_%'
  AND EXISTS (
    SELECT 1 FROM career_paths
    WHERE career_code = REGEXP_REPLACE(career_attributes.career_code, '_temp_[0-9]+$', '')
  );

-- Step 8: Remove any orphaned temporary career_paths (careers that were renamed but not in our CSV)
DELETE FROM career_paths
WHERE career_code LIKE '%_temp_%'
  AND id NOT IN (
    ${csvData.map(c => `'${c.id}'`).join(',\n    ')}
  );

-- Step 9: Remove any orphaned career_attributes
DELETE FROM career_attributes
WHERE NOT EXISTS (
  SELECT 1 FROM career_paths WHERE career_paths.career_code = career_attributes.career_code
);

-- Step 10: Recreate foreign key constraint
ALTER TABLE career_attributes
ADD CONSTRAINT career_attributes_career_code_fkey
FOREIGN KEY (career_code) REFERENCES career_paths(career_code);

-- Step 11: Drop temporary field
ALTER TABLE career_paths DROP COLUMN IF EXISTS career_code1;

-- Step 12: Verification
SELECT 'VERIFICATION RESULTS:' as verification;

SELECT
  'Career Paths Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN career_code ~ '^[a-z0-9-]+$' THEN 1 END) as standardized_format,
  COUNT(CASE WHEN career_code ~ '[A-Z_]' OR career_code LIKE '%temp%' THEN 1 END) as old_format_remaining
FROM career_paths
WHERE is_active = true;

SELECT
  'Career Attributes Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM career_paths WHERE career_paths.career_code = career_attributes.career_code) THEN 1 END) as matching_references
FROM career_attributes;

-- Show any remaining problematic codes
SELECT 'Remaining Issues:' as issues;
SELECT career_name, career_code
FROM career_paths
WHERE career_code LIKE '%temp%' OR career_code ~ '[A-Z_]'
ORDER BY career_name;

-- Show sample of updated careers
SELECT 'Sample Updated Careers:' as sample;
SELECT career_name, career_code
FROM career_paths
WHERE career_name IN ('Youth Minister', 'Voice Actor', 'Game Developer', 'Animator', 'Chef', 'Marketing Director')
  AND is_active = true
ORDER BY career_name;
`;

    // Write SQL file
    const sqlFilePath = 'safe-career-code-update.sql';
    fs.writeFileSync(sqlFilePath, sql);

    console.log(`✅ Generated safe SQL script: ${sqlFilePath}`);
    console.log(`📊 Includes ${csvData.length} career code updates`);
    console.log(`⚠️  Handles ${knownConflicts.length} known conflicts by temporary renaming`);
    console.log('\n📝 Next steps:');
    console.log('1. Open Supabase SQL editor');
    console.log(`2. Copy and paste the contents of ${sqlFilePath}`);
    console.log('3. Run the script');
    console.log('4. Check verification results');
    console.log('\nThis script safely handles duplicate key conflicts!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generateSafeSQL()
  .then(() => {
    console.log('\n🎉 Safe SQL generation complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });