/**
 * Remove duplicate careers after CSV update
 * Strategy: Keep the career with lowercase career_category (original), remove others
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function removeDuplicates() {
  console.log('\n🧹 Removing Duplicate Careers\n');
  console.log('=' .repeat(60));

  try {
    // Find all duplicate career names using RPC call
    const { data: allCareers, error: dupError } = await supabase
      .from('career_paths')
      .select('career_name, id, career_category, grade_category, created_at')
      .eq('is_active', true)
      .order('career_name');

    if (dupError) throw dupError;

    // Group by career_name and find duplicates
    const careerGroups = {};
    allCareers.forEach(career => {
      if (!careerGroups[career.career_name]) {
        careerGroups[career.career_name] = [];
      }
      careerGroups[career.career_name].push(career);
    });

    const duplicates = Object.entries(careerGroups)
      .filter(([name, careers]) => careers.length > 1)
      .map(([name, careers]) => ({ career_name: name, count: careers.length }));

    if (!duplicates || duplicates.length === 0) {
      console.log('✅ No duplicate careers found!');
      return;
    }

    console.log(`\n📋 Found duplicates for ${duplicates.length} career names:`);

    // Get details for each duplicate group
    const duplicateDetails = [];

    for (const dup of duplicates) {
      const careers = careerGroups[dup.career_name];

      // Strategy: Keep the one with lowercase career_category (original)
      // If no lowercase, keep the oldest (first created)
      let toKeep = careers.find(c => c.career_category === c.career_category?.toLowerCase()) || careers[0];
      let toDelete = careers.filter(c => c.id !== toKeep.id);

      duplicateDetails.push({
        career_name: dup.career_name,
        keep: toKeep,
        delete: toDelete
      });

      console.log(`\n📝 ${dup.career_name}:`);
      console.log(`   KEEP: ID ${toKeep.id.substring(0, 8)}... (${toKeep.career_category})`);
      toDelete.forEach(d => {
        console.log(`   DELETE: ID ${d.id.substring(0, 8)}... (${d.career_category})`);
      });
    }

    const totalToDelete = duplicateDetails.reduce((sum, d) => sum + d.delete.length, 0);

    console.log(`\n⚠️  About to delete ${totalToDelete} duplicate records.`);
    console.log('This action cannot be undone. Continue? (Press Ctrl+C to cancel)');

    // Wait 5 seconds for user to cancel
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('\n🗑️  Deleting duplicates...');

    let deleteCount = 0;
    const deleteErrors = [];

    for (const group of duplicateDetails) {
      for (const career of group.delete) {
        try {
          // First, handle any foreign key references
          // Check if this career has progressions
          const { data: progressions } = await supabase
            .from('career_path_progressions')
            .select('id')
            .eq('base_career_path_id', career.id);

          if (progressions && progressions.length > 0) {
            // Move progressions to the career we're keeping
            const { error: moveError } = await supabase
              .from('career_path_progressions')
              .update({ base_career_path_id: group.keep.id })
              .eq('base_career_path_id', career.id);

            if (moveError) {
              console.log(`   ⚠️  Warning: Could not move progressions for ${career.career_name}`);
            } else {
              console.log(`   📦 Moved ${progressions.length} progressions to keeper`);
            }
          }

          // Now delete the duplicate career
          const { error: deleteError } = await supabase
            .from('career_paths')
            .delete()
            .eq('id', career.id);

          if (deleteError) {
            throw deleteError;
          }

          deleteCount++;
          console.log(`   ✅ Deleted duplicate: ${career.career_name} (${career.id.substring(0, 8)}...)`);

        } catch (error) {
          const errorMsg = `${career.career_name}: ${error.message}`;
          deleteErrors.push(errorMsg);
          console.log(`   ❌ ${errorMsg}`);
        }
      }
    }

    console.log('\n📈 Duplicate Removal Summary:');
    console.log('=' .repeat(60));
    console.log(`✅ Successfully deleted: ${deleteCount} duplicates`);
    console.log(`❌ Failed deletions: ${deleteErrors.length}`);

    if (deleteErrors.length > 0) {
      console.log('\n❌ Deletion errors:');
      deleteErrors.forEach(error => console.log(`   - ${error}`));
    }

    // Verify no duplicates remain
    const { data: remainingCareers } = await supabase
      .from('career_paths')
      .select('career_name')
      .eq('is_active', true);

    const remainingGroups = {};
    remainingCareers.forEach(career => {
      remainingGroups[career.career_name] = (remainingGroups[career.career_name] || 0) + 1;
    });

    const remainingDups = Object.entries(remainingGroups)
      .filter(([name, count]) => count > 1)
      .map(([name, count]) => ({ career_name: name, count }));

    if (remainingDups && remainingDups.length > 0) {
      console.log(`\n⚠️  ${remainingDups.length} duplicate groups still remain:`);
      remainingDups.forEach(d => console.log(`   - ${d.career_name}`));
    } else {
      console.log('\n✅ All duplicates successfully removed!');
    }

    // Show final counts
    const { data: finalCounts } = await supabase
      .from('career_paths')
      .select('grade_category, access_tier')
      .eq('is_active', true);

    const stats = {};
    finalCounts.forEach(row => {
      const key = `${row.grade_category}-${row.access_tier}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    console.log('\n📊 Final career distribution:');
    console.log('-'.repeat(40));
    ['elementary', 'middle', 'high'].forEach(category => {
      const select = stats[`${category}-select`] || 0;
      const premium = stats[`${category}-premium`] || 0;
      const total = select + premium;
      console.log(`${category.padEnd(10)}: ${total.toString().padStart(3)} total (${select} select, ${premium} premium)`);
    });

    const grandTotal = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`${'TOTAL'.padEnd(10)}: ${grandTotal.toString().padStart(3)} careers`);

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

removeDuplicates()
  .then(() => {
    console.log('\n🎉 Duplicate removal complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });