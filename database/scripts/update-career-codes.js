/**
 * Update career_code fields from CSV
 * Handles foreign key constraints by updating dependent tables first
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function updateCareerCodes() {
  console.log('\n🔄 Updating Career Codes from CSV\n');
  console.log('=' .repeat(60));

  try {
    // Read CSV data
    const csvUpdates = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_FILE)
        .pipe(csv())
        .on('data', (row) => {
          if (row.id?.trim() && row.career_code?.trim()) {
            csvUpdates.push({
              id: row.id.trim(),
              career_code: row.career_code.trim(),
              career_name: row.career_name?.trim()
            });
          }
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`📊 Found ${csvUpdates.length} career code updates in CSV`);

    // Get current career_code values from database
    const { data: currentCareers, error: currentError } = await supabase
      .from('career_paths')
      .select('id, career_code, career_name')
      .eq('is_active', true);

    if (currentError) throw currentError;

    // Find careers that need career_code updates
    const needsUpdate = [];
    csvUpdates.forEach(csvCareer => {
      const dbCareer = currentCareers.find(c => c.id === csvCareer.id);
      if (dbCareer && dbCareer.career_code !== csvCareer.career_code) {
        needsUpdate.push({
          id: csvCareer.id,
          career_name: csvCareer.career_name,
          old_code: dbCareer.career_code,
          new_code: csvCareer.career_code
        });
      }
    });

    if (needsUpdate.length === 0) {
      console.log('✅ All career codes are already up to date!');
      return;
    }

    console.log(`\\n🎯 Found ${needsUpdate.length} careers that need career_code updates:`);
    needsUpdate.slice(0, 10).forEach((update, i) => {
      console.log(`  ${i + 1}. ${update.career_name}`);
      console.log(`     ${update.old_code} → ${update.new_code}`);
    });

    if (needsUpdate.length > 10) {
      console.log(`     ... and ${needsUpdate.length - 10} more`);
    }

    // Check what tables reference career_code
    console.log('\\n🔍 Checking foreign key references...');

    // Check career_attributes table
    const { data: attributeRefs, error: attrError } = await supabase
      .from('career_attributes')
      .select('career_code, count(*)')
      .in('career_code', needsUpdate.map(u => u.old_code));

    if (attrError) {
      console.log('❌ Could not check career_attributes:', attrError.message);
    } else {
      console.log(`📋 Found ${attributeRefs?.length || 0} career_attributes records to update`);
    }

    console.log('\\n⚠️  About to update career codes. This will:');
    console.log('   1. Update career_attributes table first (if exists)');
    console.log('   2. Update career_paths table');
    console.log('   Continue? (Press Ctrl+C to cancel)');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\\n🚀 Starting updates...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    for (const update of needsUpdate) {
      try {
        console.log(`\\n📝 Updating ${update.career_name}...`);

        // Step 1: Update career_attributes if it exists
        const { data: existingAttrs, error: checkError } = await supabase
          .from('career_attributes')
          .select('id')
          .eq('career_code', update.old_code);

        if (checkError) {
          console.log(`   ⚠️  Could not check career_attributes: ${checkError.message}`);
        } else if (existingAttrs && existingAttrs.length > 0) {
          const { error: attrUpdateError } = await supabase
            .from('career_attributes')
            .update({ career_code: update.new_code })
            .eq('career_code', update.old_code);

          if (attrUpdateError) {
            throw new Error(`career_attributes update failed: ${attrUpdateError.message}`);
          }
          console.log(`   ✅ Updated ${existingAttrs.length} career_attributes records`);
        }

        // Step 2: Update career_paths
        const { error: pathUpdateError } = await supabase
          .from('career_paths')
          .update({ career_code: update.new_code })
          .eq('id', update.id);

        if (pathUpdateError) {
          throw pathUpdateError;
        }

        successCount++;
        console.log(`   ✅ Updated career_paths record`);

      } catch (error) {
        errorCount++;
        const errorMsg = `${update.career_name}: ${error.message}`;
        errors.push(errorMsg);
        console.log(`   ❌ ${errorMsg}`);

        // Try to rollback career_attributes if career_paths failed
        try {
          await supabase
            .from('career_attributes')
            .update({ career_code: update.old_code })
            .eq('career_code', update.new_code);
        } catch (rollbackError) {
          console.log(`   ⚠️  Rollback failed: ${rollbackError.message}`);
        }
      }
    }

    console.log('\\n📈 Career Code Update Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successful updates: ${successCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Verification
    if (successCount > 0) {
      console.log('\\n🔍 Verification:');
      const { data: updatedCareers } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .in('id', needsUpdate.filter((_, i) => i < successCount).map(u => u.id));

      console.log('Sample updated careers:');
      updatedCareers?.slice(0, 5).forEach(career => {
        console.log(`   ${career.career_name}: ${career.career_code}`);
      });
    }

  } catch (error) {
    console.error('\\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateCareerCodes()
  .then(() => {
    console.log('\\n🎉 Career code update complete!\\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });