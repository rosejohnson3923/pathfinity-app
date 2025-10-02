/**
 * Step 3: Copy career_code1 to career_code and validate
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function copyCodes() {
  console.log('\n🔄 Step 3: Copying career_code1 → career_code\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Pre-validation
    console.log('1️⃣ Pre-validation checks...');

    const { data: preCheck, error: preError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .not('career_code1', 'is', null);

    if (preError) throw preError;

    const totalWithCode1 = preCheck.length;
    const needsUpdate = preCheck.filter(c => c.career_code !== c.career_code1).length;
    const alreadyMatch = totalWithCode1 - needsUpdate;

    console.log(`   ✅ ${totalWithCode1} careers have career_code1 values`);
    console.log(`   🔄 ${needsUpdate} careers need updating`);
    console.log(`   ✅ ${alreadyMatch} careers already match`);

    if (needsUpdate === 0) {
      console.log('\n🎉 All career codes already match! No updates needed.');
      return true;
    }

    // Step 2: Check for potential conflicts
    console.log('\n2️⃣ Checking for potential conflicts...');

    // Find careers that would create conflicts
    const potentialConflicts = [];
    const targetCodes = preCheck.map(c => c.career_code1);

    const { data: existingCodes, error: existingError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code')
      .in('career_code', targetCodes);

    if (existingError) throw existingError;

    preCheck.forEach(career => {
      const wouldConflict = existingCodes.find(existing =>
        existing.career_code === career.career_code1 &&
        existing.id !== career.id
      );

      if (wouldConflict) {
        potentialConflicts.push({
          updating_career: career,
          conflicting_career: wouldConflict
        });
      }
    });

    if (potentialConflicts.length > 0) {
      console.log(`   ⚠️  Found ${potentialConflicts.length} potential conflicts:`);
      potentialConflicts.slice(0, 3).forEach(conflict => {
        console.log(`      ${conflict.updating_career.career_name} → ${conflict.updating_career.career_code1}`);
        console.log(`      conflicts with ${conflict.conflicting_career.career_name} (${conflict.conflicting_career.career_code})`);
      });

      console.log('\n   This requires dropping foreign key constraints first.');
      console.log('   📝 Please run this SQL command in Supabase SQL editor:');
      console.log('');
      console.log('   ALTER TABLE career_attributes DROP CONSTRAINT IF EXISTS career_attributes_career_code_fkey;');
      console.log('');
      console.log('   Then run this script again.');
      return false;
    }

    console.log(`   ✅ No conflicts detected - safe to proceed`);

    // Step 3: Perform the updates
    console.log('\n3️⃣ Updating career_code values...');

    const careersToUpdate = preCheck.filter(c => c.career_code !== c.career_code1);
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    const batchSize = 10;
    for (let i = 0; i < careersToUpdate.length; i += batchSize) {
      const batch = careersToUpdate.slice(i, i + batchSize);

      console.log(`   📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(careersToUpdate.length / batchSize)}...`);

      for (const career of batch) {
        try {
          const { error } = await supabase
            .from('career_paths')
            .update({ career_code: career.career_code1 })
            .eq('id', career.id);

          if (error) throw error;

          successCount++;

          if (successCount % 20 === 0) {
            console.log(`   ✅ Updated ${successCount}/${careersToUpdate.length}...`);
          }

        } catch (error) {
          errorCount++;
          const errorMsg = `${career.career_name}: ${error.message}`;
          errors.push(errorMsg);

          if (errorCount <= 5) {
            console.log(`   ❌ ${errorMsg}`);
          }
        }
      }

      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`   ✅ Successfully updated: ${successCount}`);
    console.log(`   ❌ Failed updates: ${errorCount}`);

    if (errors.length > 0 && errors.length <= 10) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(error => console.log(`   - ${error}`));
    }

    // Step 4: Post-validation
    console.log('\n4️⃣ Post-validation checks...');

    const { data: postCheck, error: postError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .not('career_code1', 'is', null);

    if (postError) throw postError;

    const finalMatches = postCheck.filter(c => c.career_code === c.career_code1).length;
    const stillNeedUpdate = postCheck.filter(c => c.career_code !== c.career_code1).length;

    console.log(`   📊 ${finalMatches} careers now have matching codes`);
    console.log(`   📊 ${stillNeedUpdate} careers still need updating`);

    // Show sample of successfully updated careers
    const recentlyUpdated = postCheck.filter(c =>
      c.career_code === c.career_code1 &&
      careersToUpdate.some(u => u.id === c.id)
    );

    console.log('\n📋 Sample successfully updated careers:');
    recentlyUpdated.slice(0, 5).forEach((career, i) => {
      console.log(`   ${i + 1}. ${career.career_name}: ${career.career_code}`);
    });

    // Success criteria
    const updateRate = careersToUpdate.length > 0 ? Math.round((successCount / careersToUpdate.length) * 100) : 100;
    console.log(`\n📈 Update Summary:`);
    console.log(`   Success rate: ${updateRate}% (${successCount}/${careersToUpdate.length})`);
    console.log(`   Total matching codes: ${finalMatches}/${postCheck.length}`);

    return successCount > 0 || stillNeedUpdate === 0;

  } catch (error) {
    console.error('Error during code copying:', error.message);
    return false;
  }
}

copyCodes()
  .then((success) => {
    if (success) {
      console.log('\n✅ Step 3 Complete: career_code values updated!');
      console.log('\nNext: Run step4-cleanup.js to finish the process');
    } else {
      console.log('\n❌ Step 3 Failed: Please check errors above');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });