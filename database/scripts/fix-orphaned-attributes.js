/**
 * Fix orphaned career_attributes records before recreating foreign key constraint
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixOrphanedAttributes() {
  console.log('\n🔧 Fixing orphaned career_attributes records\n');
  console.log('=' .repeat(50));

  try {
    // Step 1: Find all career_attributes that don't have matching career_paths
    console.log('1️⃣ Finding orphaned career_attributes...');

    const { data: allAttributes, error: attrError } = await supabase
      .from('career_attributes')
      .select('career_code');

    if (attrError) throw attrError;

    const { data: allCareerPaths, error: pathError } = await supabase
      .from('career_paths')
      .select('career_code')
      .eq('is_active', true);

    if (pathError) throw pathError;

    const validCodes = allCareerPaths.map(cp => cp.career_code);
    const orphanedCodes = allAttributes
      .map(attr => attr.career_code)
      .filter(code => !validCodes.includes(code));

    console.log(`   📊 Total career_attributes: ${allAttributes.length}`);
    console.log(`   📊 Valid career_paths codes: ${validCodes.length}`);
    console.log(`   ❌ Orphaned attributes: ${orphanedCodes.length}`);

    if (orphanedCodes.length === 0) {
      console.log('   ✅ No orphaned records found - safe to recreate constraint');
      return true;
    }

    // Step 2: Show orphaned records
    console.log('\n2️⃣ Orphaned career_attributes codes:');
    const uniqueOrphaned = [...new Set(orphanedCodes)];
    uniqueOrphaned.forEach((code, i) => {
      console.log(`   ${i + 1}. ${code}`);
    });

    // Step 3: Check if any of these can be mapped to existing codes
    console.log('\n3️⃣ Checking for possible mappings...');

    const possibleMappings = [];
    for (const orphanedCode of uniqueOrphaned) {
      // Look for similar codes in career_paths
      const similarCodes = validCodes.filter(valid => {
        const lower = valid.toLowerCase();
        const orphanedLower = orphanedCode.toLowerCase();

        return lower.includes(orphanedLower) ||
               orphanedLower.includes(lower) ||
               lower.replace(/-/g, '').includes(orphanedLower.replace(/-/g, '')) ||
               orphanedLower.replace(/-/g, '').includes(lower.replace(/-/g, ''));
      });

      if (similarCodes.length > 0) {
        possibleMappings.push({
          orphaned: orphanedCode,
          candidates: similarCodes
        });
      }
    }

    if (possibleMappings.length > 0) {
      console.log('   🔍 Possible mappings found:');
      possibleMappings.forEach(mapping => {
        console.log(`      ${mapping.orphaned} → ${mapping.candidates.join(', ')}`);
      });
    }

    // Step 4: Clean up orphaned records
    console.log('\n4️⃣ Removing orphaned career_attributes...');

    let deleteCount = 0;
    for (const orphanedCode of uniqueOrphaned) {
      try {
        const { error: deleteError } = await supabase
          .from('career_attributes')
          .delete()
          .eq('career_code', orphanedCode);

        if (deleteError) throw deleteError;

        deleteCount++;
        console.log(`   ✅ Deleted attributes for: ${orphanedCode}`);

      } catch (error) {
        console.log(`   ❌ Failed to delete ${orphanedCode}: ${error.message}`);
      }
    }

    console.log(`\n   📊 Deleted ${deleteCount} orphaned attribute records`);

    // Step 5: Verify cleanup
    console.log('\n5️⃣ Verifying cleanup...');

    const { data: remainingAttributes } = await supabase
      .from('career_attributes')
      .select('career_code');

    const remainingOrphaned = remainingAttributes
      .map(attr => attr.career_code)
      .filter(code => !validCodes.includes(code));

    console.log(`   📊 Remaining career_attributes: ${remainingAttributes.length}`);
    console.log(`   ❌ Remaining orphaned: ${remainingOrphaned.length}`);

    if (remainingOrphaned.length === 0) {
      console.log('   ✅ All orphaned records cleaned up!');
      console.log('\n📝 Now you can safely run:');
      console.log('');
      console.log('   ALTER TABLE career_attributes');
      console.log('   ADD CONSTRAINT career_attributes_career_code_fkey');
      console.log('   FOREIGN KEY (career_code) REFERENCES career_paths(career_code);');
      console.log('');
      return true;
    } else {
      console.log('   ⚠️  Some orphaned records remain:');
      remainingOrphaned.slice(0, 5).forEach(code => {
        console.log(`      ${code}`);
      });
      return false;
    }

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

fixOrphanedAttributes()
  .then((success) => {
    if (success) {
      console.log('\n✅ Orphaned attributes cleanup complete!');
      console.log('Foreign key constraint can now be safely recreated.');
    } else {
      console.log('\n❌ Some issues remain - check output above');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });