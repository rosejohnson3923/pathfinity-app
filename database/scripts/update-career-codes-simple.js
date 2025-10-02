/**
 * Simple career_code update - handles duplicates by renaming temporarily
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const CSV_FILE = 'Supabase Snippet Career Paths List.csv';

async function updateCareerCodesSimple() {
  console.log('\n🔄 Updating Career Codes (Simple Method)\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Read CSV data
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

    // Step 2: Get current career_paths data
    console.log('\n🔍 Getting current career data...');
    const { data: currentPaths, error: pathsError } = await supabase
      .from('career_paths')
      .select('id, career_code, career_name')
      .eq('is_active', true);

    if (pathsError) throw pathsError;

    const { data: currentAttrs, error: attrsError } = await supabase
      .from('career_attributes')
      .select('career_code');

    if (attrsError) {
      console.log('⚠️  Could not read career_attributes:', attrsError.message);
    }

    // Step 3: Create update mappings
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

    console.log(`\\n🎯 Found ${codeUpdates.length} career codes that need updating`);

    // Step 4: Handle conflicts by identifying careers that will conflict
    const allCurrentCodes = currentPaths.map(p => p.career_code);
    const conflictingUpdates = [];
    const safeUpdates = [];

    codeUpdates.forEach(update => {
      const wouldConflict = allCurrentCodes.includes(update.new_code) &&
                           !codeUpdates.find(u => u.old_code === update.new_code);
      if (wouldConflict) {
        conflictingUpdates.push(update);
      } else {
        safeUpdates.push(update);
      }
    });

    console.log(`\\n📋 Update strategy:`);
    console.log(`   Safe updates: ${safeUpdates.length}`);
    console.log(`   Conflicting updates: ${conflictingUpdates.length}`);

    if (conflictingUpdates.length > 0) {
      console.log(`\\n⚠️  Some updates will create conflicts. These will be handled by:`);
      console.log(`   1. Temporarily renaming the conflicting career`);
      console.log(`   2. Applying the update`);
      console.log(`   3. Handling any remaining conflicts`);
    }

    console.log('\\n   Continue? (Press Ctrl+C to cancel)');
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('\\n🚀 Starting updates...');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Step 5: Process safe updates first
    console.log(`\\n1️⃣ Processing ${safeUpdates.length} safe updates...`);
    for (const update of safeUpdates) {
      try {
        // Update career_paths
        const { error: pathError } = await supabase
          .from('career_paths')
          .update({ career_code: update.new_code })
          .eq('id', update.id);

        if (pathError) throw pathError;

        // Update career_attributes if it exists
        const { data: attrExists } = await supabase
          .from('career_attributes')
          .select('career_code')
          .eq('career_code', update.old_code)
          .single();

        if (attrExists) {
          const { error: attrError } = await supabase
            .from('career_attributes')
            .update({ career_code: update.new_code })
            .eq('career_code', update.old_code);

          if (attrError) {
            console.log(`   ⚠️  ${update.career_name}: Could not update attributes: ${attrError.message}`);
          }
        }

        successCount++;
        if (successCount % 20 === 0) {
          console.log(`   ✅ Updated ${successCount} careers...`);
        }

      } catch (error) {
        errorCount++;
        const errorMsg = `${update.career_name}: ${error.message}`;
        errors.push(errorMsg);
        if (errorCount <= 5) {
          console.log(`   ❌ ${errorMsg}`);
        }
      }
    }

    // Step 6: Process conflicting updates
    if (conflictingUpdates.length > 0) {
      console.log(`\\n2️⃣ Processing ${conflictingUpdates.length} conflicting updates...`);

      for (const update of conflictingUpdates) {
        try {
          // Find the career that currently has the target code
          const existingCareer = currentPaths.find(p => p.career_code === update.new_code);

          if (existingCareer) {
            // Temporarily rename the existing career
            const tempCode = `temp_${update.new_code}_${Date.now()}`;

            console.log(`   🔄 Temporarily renaming ${existingCareer.career_name} to avoid conflict...`);

            const { error: tempError } = await supabase
              .from('career_paths')
              .update({ career_code: tempCode })
              .eq('id', existingCareer.id);

            if (tempError) {
              console.log(`   ❌ Could not temp rename: ${tempError.message}`);
              continue;
            }

            // Update attributes for temp rename
            await supabase
              .from('career_attributes')
              .update({ career_code: tempCode })
              .eq('career_code', update.new_code);
          }

          // Now apply our update
          const { error: pathError } = await supabase
            .from('career_paths')
            .update({ career_code: update.new_code })
            .eq('id', update.id);

          if (pathError) throw pathError;

          // Update career_attributes
          const { data: attrExists } = await supabase
            .from('career_attributes')
            .select('career_code')
            .eq('career_code', update.old_code)
            .single();

          if (attrExists) {
            await supabase
              .from('career_attributes')
              .update({ career_code: update.new_code })
              .eq('career_code', update.old_code);
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
    }

    // Summary
    console.log('\\n📈 Career Code Update Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully updated: ${successCount}`);
    console.log(`❌ Failed updates: ${errorCount}`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    } else if (errors.length > 10) {
      console.log(`\\n❌ ${errors.length} errors encountered (showing first 10):`);
      errors.slice(0, 10).forEach(error => console.log(`   - ${error}`));
    }

    // Verification
    if (successCount > 0) {
      console.log('\\n🔍 Verification:');
      const { data: verificationPaths } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .in('id', codeUpdates.slice(0, 5).map(u => u.id));

      console.log('\\nSample updated careers:');
      verificationPaths?.forEach(career => {
        console.log(`   ${career.career_name}: ${career.career_code}`);
      });

      // Check for any remaining temp codes
      const { data: tempCodes } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .like('career_code', 'temp_%');

      if (tempCodes && tempCodes.length > 0) {
        console.log('\\n⚠️  Temporary codes still exist:');
        tempCodes.forEach(career => {
          console.log(`   ${career.career_name}: ${career.career_code}`);
        });
        console.log('   These may need manual cleanup');
      }
    }

  } catch (error) {
    console.error('\\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

updateCareerCodesSimple()
  .then(() => {
    console.log('\\n🎉 Career code update complete!\\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });