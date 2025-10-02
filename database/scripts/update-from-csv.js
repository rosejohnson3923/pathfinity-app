/**
 * Update career_paths from cleaned CSV file
 * Updates: access_tier, grade_category, min_grade_level, max_grade_level
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Path to your cleaned CSV file
const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function updateFromCSV() {
  console.log('\n🔄 Updating Career Paths from Cleaned CSV\n');
  console.log('=' .repeat(60));

  try {
    // Check if CSV file exists
    if (!fs.existsSync(CSV_FILE)) {
      console.error(`❌ CSV file not found: ${CSV_FILE}`);
      console.log('Please make sure the file is in the database directory.');
      process.exit(1);
    }

    console.log(`📁 Reading CSV file: ${CSV_FILE}`);

    const updates = [];
    let rowCount = 0;

    // Read and parse CSV
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          rowCount++;

          // Map CSV columns (adjust column names if needed)
          const update = {
            id: row.id?.trim(),
            career_name: row.career_name?.trim(),
            career_code: row.career_code?.trim(),
            access_tier: row.access_tier?.trim(),
            grade_category: row.grade_category?.trim(),
            min_grade_level: row.min_grade_level?.trim(),
            max_grade_level: row.max_grade_level?.trim()
          };

          // Validate required fields
          if (!update.id || !update.career_name) {
            console.warn(`⚠️  Row ${rowCount}: Missing ID or career_name, skipping`);
            return;
          }

          // Validate access_tier
          if (!['select', 'premium'].includes(update.access_tier)) {
            console.warn(`⚠️  Row ${rowCount}: Invalid access_tier "${update.access_tier}" for ${update.career_name}`);
            return;
          }

          // Validate grade_category
          if (!['elementary', 'middle', 'high'].includes(update.grade_category)) {
            console.warn(`⚠️  Row ${rowCount}: Invalid grade_category "${update.grade_category}" for ${update.career_name}`);
            return;
          }

          updates.push(update);
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`\n📊 Parsed ${updates.length} valid updates from ${rowCount} rows`);

    if (updates.length === 0) {
      console.log('❌ No valid updates found. Please check your CSV format.');
      process.exit(1);
    }

    // Show sample of what will be updated
    console.log('\n🔍 Sample updates:');
    console.log('-'.repeat(60));
    updates.slice(0, 5).forEach((update, i) => {
      console.log(`${i + 1}. ${update.career_name}`);
      console.log(`   Tier: ${update.access_tier} | Category: ${update.grade_category}`);
      console.log(`   Grades: ${update.min_grade_level} - ${update.max_grade_level}`);
    });

    if (updates.length > 5) {
      console.log(`   ... and ${updates.length - 5} more`);
    }

    // Confirm before proceeding
    console.log(`\n⚠️  About to update ${updates.length} career records.`);
    console.log('This will modify the database. Continue? (Press Ctrl+C to cancel)');

    // Wait 3 seconds for user to cancel if needed
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\n🚀 Starting updates...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Update in batches of 10
    const batchSize = 10;
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      console.log(`\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(updates.length / batchSize)}`);

      for (const update of batch) {
        try {
          const { error } = await supabase
            .from('career_paths')
            .update({
              // Skip career_code for now due to foreign key constraints
              access_tier: update.access_tier,
              grade_category: update.grade_category,
              min_grade_level: update.min_grade_level,
              max_grade_level: update.max_grade_level
            })
            .eq('id', update.id);

          if (error) {
            throw error;
          }

          successCount++;
          console.log(`   ✅ ${update.career_name}`);

        } catch (error) {
          errorCount++;
          const errorMsg = `${update.career_name}: ${error.message}`;
          errors.push(errorMsg);
          console.log(`   ❌ ${errorMsg}`);
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\n📈 Update Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Verify the updates
    console.log('\n🔍 Verification:');
    console.log('-'.repeat(60));

    const { data: verification, error: verifyError } = await supabase
      .from('career_paths')
      .select('grade_category, access_tier, count(*)')
      .eq('is_active', true);

    if (!verifyError) {
      // Group by grade_category and access_tier
      const stats = {};

      const { data: statsData } = await supabase
        .from('career_paths')
        .select('grade_category, access_tier')
        .eq('is_active', true);

      statsData.forEach(row => {
        const key = `${row.grade_category}-${row.access_tier}`;
        stats[key] = (stats[key] || 0) + 1;
      });

      console.log('\nUpdated distribution:');
      ['elementary', 'middle', 'high'].forEach(category => {
        const select = stats[`${category}-select`] || 0;
        const premium = stats[`${category}-premium`] || 0;
        console.log(`  ${category.padEnd(10)}: ${select} select, ${premium} premium`);
      });
    }

    if (successCount > 0) {
      console.log('\n✅ Career paths updated successfully!');
      console.log('\nNext steps:');
      console.log('1. Remove duplicates');
      console.log('2. Test the progression system');
      console.log('3. Verify the dashboard works correctly');
    }

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateFromCSV()
  .then(() => {
    console.log('\n🎉 Update process complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });