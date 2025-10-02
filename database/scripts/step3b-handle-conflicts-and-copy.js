/**
 * Step 3b: Handle conflicts and copy career_code1 to career_code
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function handleConflictsAndCopy() {
  console.log('\n🔄 Step 3b: Handle conflicts and copy codes\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Identify conflicts
    console.log('1️⃣ Identifying conflicts...');

    const { data: careersWithCode1, error: code1Error } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .not('career_code1', 'is', null);

    if (code1Error) throw code1Error;

    const needsUpdate = careersWithCode1.filter(c => c.career_code !== c.career_code1);
    const targetCodes = needsUpdate.map(c => c.career_code1);

    // Find existing careers that would conflict
    const { data: existingCareers, error: existingError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code')
      .in('career_code', targetCodes);

    if (existingError) throw existingError;

    const conflicts = [];
    needsUpdate.forEach(updating => {
      const conflicting = existingCareers.find(existing =>
        existing.career_code === updating.career_code1 &&
        existing.id !== updating.id
      );

      if (conflicting) {
        conflicts.push({
          updating: updating,
          conflicting: conflicting
        });
      }
    });

    console.log(`   🔍 Found ${conflicts.length} conflicts to resolve`);

    // Step 2: Resolve conflicts by temporarily renaming
    if (conflicts.length > 0) {
      console.log('\n2️⃣ Resolving conflicts...');

      const tempSuffix = '_temp_' + Date.now();

      for (const conflict of conflicts) {
        const tempCode = conflict.conflicting.career_code + tempSuffix;

        console.log(`   🔄 Renaming "${conflict.conflicting.career_name}" to temp code...`);

        // Rename the conflicting career temporarily
        const { error: renameError } = await supabase
          .from('career_paths')
          .update({ career_code: tempCode })
          .eq('id', conflict.conflicting.id);

        if (renameError) {
          console.log(`   ❌ Failed to rename ${conflict.conflicting.career_name}: ${renameError.message}`);
        } else {
          console.log(`   ✅ Renamed to: ${tempCode}`);

          // Also update career_attributes if they exist
          await supabase
            .from('career_attributes')
            .update({ career_code: tempCode })
            .eq('career_code', conflict.conflicting.career_code);
        }
      }
    }

    // Step 3: Now copy career_code1 to career_code
    console.log('\n3️⃣ Copying career_code1 → career_code...');

    let successCount = 0;
    let errorCount = 0;

    const batchSize = 20;
    for (let i = 0; i < needsUpdate.length; i += batchSize) {
      const batch = needsUpdate.slice(i, i + batchSize);

      console.log(`   📦 Batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(needsUpdate.length / batchSize)}...`);

      for (const career of batch) {
        try {
          const { error } = await supabase
            .from('career_paths')
            .update({ career_code: career.career_code1 })
            .eq('id', career.id);

          if (error) throw error;

          successCount++;

          if (successCount % 30 === 0) {
            console.log(`   ✅ Updated ${successCount}/${needsUpdate.length}...`);
          }

        } catch (error) {
          errorCount++;
          if (errorCount <= 5) {
            console.log(`   ❌ ${career.career_name}: ${error.message}`);
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log(`   ✅ Successfully copied: ${successCount}`);
    console.log(`   ❌ Failed copies: ${errorCount}`);

    // Step 4: Update career_attributes to match new codes
    console.log('\n4️⃣ Updating career_attributes...');

    // Update career_attributes for careers that changed
    let attrUpdates = 0;
    const updatedCareers = needsUpdate.slice(0, successCount);

    for (const career of updatedCareers) {
      // Check if there are old-style attributes that need updating
      const oldPatterns = [
        `ELEM_${career.career_code1.toUpperCase().replace(/-/g, '_')}`,
        `MID_${career.career_code1.toUpperCase().replace(/-/g, '_')}`,
        `HIGH_${career.career_code1.toUpperCase().replace(/-/g, '_')}`
      ];

      for (const oldPattern of oldPatterns) {
        const { data: attrExists } = await supabase
          .from('career_attributes')
          .select('career_code')
          .eq('career_code', oldPattern)
          .single();

        if (attrExists) {
          await supabase
            .from('career_attributes')
            .update({ career_code: career.career_code1 })
            .eq('career_code', oldPattern);

          attrUpdates++;
          break;
        }
      }
    }

    console.log(`   ✅ Updated ${attrUpdates} career_attributes records`);

    // Step 5: Validation
    console.log('\n5️⃣ Final validation...');

    const { data: finalCheck } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .not('career_code1', 'is', null);

    const finalMatches = finalCheck.filter(c => c.career_code === c.career_code1).length;
    const stillDifferent = finalCheck.filter(c => c.career_code !== c.career_code1).length;

    console.log(`   📊 ${finalMatches} careers now have matching codes`);
    console.log(`   📊 ${stillDifferent} careers still have different codes`);

    // Show any remaining temp codes
    const { data: tempCodes } = await supabase
      .from('career_paths')
      .select('career_name, career_code')
      .like('career_code', '%temp%');

    if (tempCodes && tempCodes.length > 0) {
      console.log(`\n⚠️  ${tempCodes.length} careers still have temporary codes:`);
      tempCodes.forEach(career => {
        console.log(`   ${career.career_name}: ${career.career_code}`);
      });
    }

    const successRate = Math.round((successCount / needsUpdate.length) * 100);
    console.log(`\n📈 Overall Success: ${successRate}% (${successCount}/${needsUpdate.length})`);

    return successRate >= 90;

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

handleConflictsAndCopy()
  .then((success) => {
    if (success) {
      console.log('\n✅ Step 3b Complete: Career codes updated successfully!');
      console.log('\nNext: Run step4-cleanup.js to recreate constraints and cleanup');
    } else {
      console.log('\n❌ Step 3b had issues: Check validation results above');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });