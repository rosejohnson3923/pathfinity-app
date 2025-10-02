/**
 * Update career_code using temporary field approach
 * 1. Add career_code1 field
 * 2. Import CSV data to career_code1
 * 3. Drop foreign key constraint
 * 4. Copy career_code1 to career_code
 * 5. Recreate foreign key constraint
 * 6. Drop career_code1 field
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function updateCareerCodesWithTempField() {
  console.log('\n🔄 Updating Career Codes (Temporary Field Method)\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Add career_code1 field
    console.log('1️⃣ Adding career_code1 temporary field...');

    try {
      // Check if field already exists
      const { data: existingColumn } = await supabase
        .from('career_paths')
        .select('career_code1')
        .limit(1);

      console.log('   ✅ career_code1 field already exists');
    } catch (error) {
      if (error.message.includes('column "career_code1" does not exist')) {
        console.log('   ℹ️  career_code1 field does not exist, needs to be added manually');
        console.log('   📝 Please run this SQL in Supabase SQL editor:');
        console.log('');
        console.log('   ALTER TABLE career_paths ADD COLUMN career_code1 TEXT;');
        console.log('');
        console.log('   Then run this script again.');
        return;
      } else {
        throw error;
      }
    }

    // Step 2: Read CSV data
    console.log('\n2️⃣ Reading CSV file...');
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

    console.log(`   📊 Found ${csvData.length} careers in CSV`);

    // Step 3: Import CSV data to career_code1 field
    console.log('\n3️⃣ Importing CSV data to career_code1...');

    let importSuccessCount = 0;
    let importErrorCount = 0;
    const importErrors = [];

    for (const csvCareer of csvData) {
      try {
        const { error } = await supabase
          .from('career_paths')
          .update({ career_code1: csvCareer.career_code })
          .eq('id', csvCareer.id);

        if (error) {
          throw error;
        }

        importSuccessCount++;

        if (importSuccessCount % 50 === 0) {
          console.log(`   ✅ Imported ${importSuccessCount}/${csvData.length}...`);
        }

      } catch (error) {
        importErrorCount++;
        const errorMsg = `${csvCareer.career_name}: ${error.message}`;
        importErrors.push(errorMsg);

        if (importErrorCount <= 5) {
          console.log(`   ❌ ${errorMsg}`);
        }
      }
    }

    console.log(`   ✅ Successfully imported ${importSuccessCount} career codes to career_code1`);

    if (importErrorCount > 0) {
      console.log(`   ❌ Failed to import ${importErrorCount} career codes`);
      if (importErrors.length <= 10) {
        importErrors.forEach(error => console.log(`      - ${error}`));
      }
    }

    if (importSuccessCount === 0) {
      console.log('   ❌ No data was imported. Cannot proceed with swap.');
      return;
    }

    // Step 4: Show what will be swapped
    console.log('\n4️⃣ Analyzing differences between career_code and career_code1...');

    const { data: compareData, error: compareError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .neq('career_code', 'career_code1')
      .eq('is_active', true);

    if (compareError) {
      console.log(`   ❌ Error comparing fields: ${compareError.message}`);
      return;
    }

    if (!compareData || compareData.length === 0) {
      console.log('   ✅ All career_code fields already match career_code1. No swap needed.');

      // Clean up career_code1 field
      console.log('\n5️⃣ Cleaning up career_code1 field...');
      console.log('   📝 Please run this SQL in Supabase SQL editor:');
      console.log('');
      console.log('   ALTER TABLE career_paths DROP COLUMN career_code1;');
      console.log('');
      return;
    }

    console.log(`   📋 Found ${compareData.length} careers that need career_code updated:`);
    compareData.slice(0, 10).forEach((career, i) => {
      console.log(`      ${i + 1}. ${career.career_name}`);
      console.log(`         ${career.career_code} → ${career.career_code1}`);
    });

    if (compareData.length > 10) {
      console.log(`      ... and ${compareData.length - 10} more`);
    }

    console.log('\n⚠️  Ready to swap career_code1 → career_code');
    console.log('   This will:');
    console.log('   1. Temporarily drop the foreign key constraint');
    console.log('   2. Update career_code with career_code1 values');
    console.log('   3. Update career_attributes table');
    console.log('   4. Recreate the foreign key constraint');
    console.log('   5. Drop the career_code1 field');
    console.log('');
    console.log('   Continue? (Press Ctrl+C to cancel)');

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 5: Manual steps needed
    console.log('\n5️⃣ Manual steps required...');
    console.log('');
    console.log('Due to foreign key constraints, please run these SQL commands in Supabase SQL editor:');
    console.log('');
    console.log('-- Step 1: Drop foreign key constraint');
    console.log('ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;');
    console.log('');
    console.log('-- Step 2: Update career_paths.career_code from career_code1');
    console.log('UPDATE career_paths SET career_code = career_code1 WHERE career_code != career_code1 AND career_code1 IS NOT NULL;');
    console.log('');
    console.log('-- Step 3: Update career_attributes to match new career codes');
    console.log('UPDATE career_attributes SET career_code = cp.career_code');
    console.log('FROM career_paths cp');
    console.log('WHERE career_attributes.career_code = cp.career_code1');
    console.log('  AND cp.career_code != cp.career_code1');
    console.log('  AND cp.career_code1 IS NOT NULL;');
    console.log('');
    console.log('-- Step 4: Recreate foreign key constraint');
    console.log('ALTER TABLE career_attributes ADD CONSTRAINT career_attributes_career_code_fkey');
    console.log('FOREIGN KEY (career_code) REFERENCES career_paths(career_code);');
    console.log('');
    console.log('-- Step 5: Drop temporary field');
    console.log('ALTER TABLE career_paths DROP COLUMN career_code1;');
    console.log('');
    console.log('After running these commands, all career codes will be updated to match your CSV!');

    // Step 6: Create verification script
    const verificationScript = `
-- Verification queries (run after the above steps)
-- Check for differences (should return 0 rows)
SELECT career_name, career_code
FROM career_paths
WHERE career_code != career_code1 AND career_code1 IS NOT NULL;

-- Count updated records
SELECT COUNT(*) as updated_count
FROM career_paths
WHERE career_code1 IS NOT NULL;

-- Check career_attributes consistency
SELECT COUNT(*) as consistent_attributes
FROM career_attributes ca
JOIN career_paths cp ON ca.career_code = cp.career_code
WHERE cp.is_active = true;
`;

    console.log('\n6️⃣ Verification queries (run after manual steps):');
    console.log(verificationScript);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateCareerCodesWithTempField()
  .then(() => {
    console.log('\n🎉 Career code import to temporary field complete!');
    console.log('\nNext: Run the provided SQL commands to complete the update.\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });