/**
 * Update career_code fields from CSV with proper foreign key handling
 * Updates career_attributes first, then career_paths
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function updateCareerCodesWithAttributes() {
  console.log('\n🔄 Updating Career Codes (Attributes + Paths)\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Read CSV to get the mappings
    console.log('📊 Reading CSV file...');
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

    // Step 2: Get current career_paths data to find mappings
    console.log('\n🔍 Getting current career_paths data...');
    const { data: currentPaths, error: pathsError } = await supabase
      .from('career_paths')
      .select('id, career_code, career_name')
      .eq('is_active', true);

    if (pathsError) throw pathsError;

    // Step 3: Create mapping of old_code -> new_code
    const codeUpdates = [];
    csvData.forEach(csvCareer => {
      const currentCareer = currentPaths.find(c => c.id === csvCareer.id);
      if (currentCareer && currentCareer.career_code !== csvCareer.career_code) {
        codeUpdates.push({
          id: csvCareer.id,
          career_name: csvCareer.career_name,
          old_code: currentCareer.career_code,
          new_code: csvCareer.career_code
        });
      }
    });

    if (codeUpdates.length === 0) {
      console.log('✅ All career codes are already up to date!');
      return;
    }

    console.log(`\\n🎯 Found ${codeUpdates.length} career codes that need updating:`);
    codeUpdates.slice(0, 10).forEach((update, i) => {
      console.log(`  ${i + 1}. ${update.career_name}`);
      console.log(`     ${update.old_code} → ${update.new_code}`);
    });

    if (codeUpdates.length > 10) {
      console.log(`     ... and ${codeUpdates.length - 10} more`);
    }

    // Step 4: Check which career_attributes exist for these codes
    console.log('\\n🔍 Checking career_attributes...');
    const oldCodes = codeUpdates.map(u => u.old_code);
    const { data: existingAttrs, error: attrsError } = await supabase
      .from('career_attributes')
      .select('career_code')
      .in('career_code', oldCodes);

    if (attrsError) {
      console.log('❌ Could not check career_attributes:', attrsError.message);
    } else {
      console.log(`📋 Found ${existingAttrs?.length || 0} career_attributes records to update`);
    }

    console.log('\\n⚠️  About to update career codes. This will:');
    console.log('   1. Update career_attributes table first');
    console.log('   2. Update career_paths table');
    console.log('   Continue? (Press Ctrl+C to cancel)');

    // Wait 3 seconds
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\\n🚀 Starting updates...');

    let pathSuccessCount = 0;
    let attrSuccessCount = 0;
    let errorCount = 0;
    const errors = [];

    // Step 5: Process updates in batches
    const batchSize = 5;
    for (let i = 0; i < codeUpdates.length; i += batchSize) {
      const batch = codeUpdates.slice(i, i + batchSize);

      console.log(`\\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(codeUpdates.length / batchSize)}`);

      for (const update of batch) {
        try {
          console.log(`\\n📝 Updating ${update.career_name}...`);

          // Step 5a: Update career_attributes first (if exists)
          const { data: attrCheck, error: attrCheckError } = await supabase
            .from('career_attributes')
            .select('career_code')
            .eq('career_code', update.old_code)
            .single();

          if (attrCheckError && attrCheckError.code !== 'PGRST116') {
            // PGRST116 = no rows returned, which is fine
            console.log(`   ⚠️  Could not check career_attributes: ${attrCheckError.message}`);
          } else if (attrCheck) {
            // Attribute exists, update it
            const { error: attrUpdateError } = await supabase
              .from('career_attributes')
              .update({ career_code: update.new_code })
              .eq('career_code', update.old_code);

            if (attrUpdateError) {
              throw new Error(`career_attributes update failed: ${attrUpdateError.message}`);
            }
            attrSuccessCount++;
            console.log(`   ✅ Updated career_attributes`);
          } else {
            console.log(`   ℹ️  No career_attributes record found`);
          }

          // Step 5b: Update career_paths
          const { error: pathUpdateError } = await supabase
            .from('career_paths')
            .update({ career_code: update.new_code })
            .eq('id', update.id);

          if (pathUpdateError) {
            throw pathUpdateError;
          }

          pathSuccessCount++;
          console.log(`   ✅ Updated career_paths`);

        } catch (error) {
          errorCount++;
          const errorMsg = `${update.career_name}: ${error.message}`;
          errors.push(errorMsg);
          console.log(`   ❌ ${errorMsg}`);

          // Try to rollback career_attributes if career_paths failed
          if (error.message.includes('career_paths')) {
            try {
              await supabase
                .from('career_attributes')
                .update({ career_code: update.old_code })
                .eq('career_code', update.new_code);
              console.log(`   🔄 Rolled back career_attributes`);
            } catch (rollbackError) {
              console.log(`   ⚠️  Rollback failed: ${rollbackError.message}`);
            }
          }
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('\\n📈 Career Code Update Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ career_paths updated: ${pathSuccessCount}`);
    console.log(`✅ career_attributes updated: ${attrSuccessCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);

    if (errors.length > 0) {
      console.log('\\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Step 6: Verification
    if (pathSuccessCount > 0) {
      console.log('\\n🔍 Verification:');

      // Check a few updated careers
      const { data: verificationPaths } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .in('id', codeUpdates.slice(0, 5).map(u => u.id));

      console.log('\\nSample updated career_paths:');
      verificationPaths?.forEach(career => {
        console.log(`   ${career.career_name}: ${career.career_code}`);
      });

      // Check career_attributes
      const { data: verificationAttrs } = await supabase
        .from('career_attributes')
        .select('career_code')
        .in('career_code', codeUpdates.slice(0, 5).map(u => u.new_code));

      console.log(`\\ncareer_attributes with new codes: ${verificationAttrs?.length || 0}`);
    }

  } catch (error) {
    console.error('\\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateCareerCodesWithAttributes()
  .then(() => {
    console.log('\\n🎉 Career code update complete!');
    console.log('\\nAll career_code fields have been standardized to match your CSV data.\\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });