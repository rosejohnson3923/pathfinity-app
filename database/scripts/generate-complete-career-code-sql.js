/**
 * Generate complete SQL script for career code updates from CSV
 */

const fs = require('fs');
const csv = require('csv-parser');

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function generateCompleteSQL() {
  console.log('\n🔧 Generating complete career code update SQL...\n');

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

    // Generate SQL script
    let sql = `-- Complete Career Code Update Script
-- Generated from CSV data
-- Run this entire script in Supabase SQL editor

-- Step 1: Add temporary field
ALTER TABLE career_paths ADD COLUMN IF NOT EXISTS career_code1 TEXT;

-- Step 2: Import all career codes from CSV
`;

    // Add update statements for each career
    csvData.forEach(career => {
      const safeName = career.career_name?.replace(/'/g, "''") || 'Unknown';
      sql += `UPDATE career_paths SET career_code1 = '${career.career_code}' WHERE id = '${career.id}'; -- ${safeName}\n`;
    });

    sql += `
-- Step 3: Drop foreign key constraint temporarily
ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;

-- Step 4: Update career_code with career_code1 values where they differ
UPDATE career_paths
SET career_code = career_code1
WHERE career_code != career_code1
  AND career_code1 IS NOT NULL;

-- Step 5: Update career_attributes table by matching old codes to new codes
-- First, let's see what codes need updating in career_attributes
DO $$
DECLARE
  old_code TEXT;
  new_code TEXT;
  update_count INTEGER := 0;
BEGIN
  -- Update each old code pattern to new code
  FOR old_code, new_code IN
    SELECT DISTINCT cp1.career_code as old_code, cp2.career_code as new_code
    FROM career_paths cp1
    JOIN career_paths cp2 ON cp1.id = cp2.id
    WHERE cp1.career_code != cp2.career_code1
      AND cp2.career_code1 IS NOT NULL
      AND EXISTS (SELECT 1 FROM career_attributes WHERE career_code = cp1.career_code)
  LOOP
    UPDATE career_attributes SET career_code = new_code WHERE career_code = old_code;
    GET DIAGNOSTICS update_count = ROW_COUNT;
    IF update_count > 0 THEN
      RAISE NOTICE 'Updated % career_attributes records: % -> %', update_count, old_code, new_code;
    END IF;
  END LOOP;
END $$;

-- Step 6: Recreate foreign key constraint
ALTER TABLE career_attributes
ADD CONSTRAINT career_attributes_career_code_fkey
FOREIGN KEY (career_code) REFERENCES career_paths(career_code);

-- Step 7: Drop temporary field
ALTER TABLE career_paths DROP COLUMN IF EXISTS career_code1;

-- Step 8: Verification
SELECT 'VERIFICATION RESULTS:' as verification;

SELECT
  'Career Paths Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN career_code ~ '^[a-z0-9-]+$' THEN 1 END) as standardized_format,
  COUNT(CASE WHEN career_code ~ '[A-Z_]' THEN 1 END) as old_format_remaining
FROM career_paths
WHERE is_active = true;

SELECT
  'Career Attributes Summary' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN EXISTS (SELECT 1 FROM career_paths WHERE career_paths.career_code = career_attributes.career_code) THEN 1 END) as matching_references
FROM career_attributes;

-- Show sample of updated careers
SELECT 'Sample Updated Careers:' as sample;
SELECT career_name, career_code
FROM career_paths
WHERE career_name IN ('Youth Minister', 'Voice Actor', 'Game Developer', 'Animator', 'Chef')
  AND is_active = true
ORDER BY career_name;
`;

    // Write SQL file
    const sqlFilePath = 'complete-career-code-update.sql';
    fs.writeFileSync(sqlFilePath, sql);

    console.log(`✅ Generated SQL script: ${sqlFilePath}`);
    console.log(`📊 Includes ${csvData.length} career code updates`);
    console.log('\n📝 Next steps:');
    console.log('1. Open Supabase SQL editor');
    console.log(`2. Copy and paste the contents of ${sqlFilePath}`);
    console.log('3. Run the script');
    console.log('4. Verify the results');
    console.log('\nThis will update all career codes to match your CSV data!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

generateCompleteSQL()
  .then(() => {
    console.log('\n🎉 SQL generation complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });