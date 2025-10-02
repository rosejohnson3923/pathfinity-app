/**
 * Check all tables with foreign key dependencies on career_paths.career_code
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAllForeignKeys() {
  console.log('\n🔍 Checking all foreign key dependencies on career_paths.career_code\n');
  console.log('=' .repeat(60));

  try {
    // Check career_path_progressions table
    console.log('1️⃣ Checking career_path_progressions table...');

    const { data: progressions, error: progError } = await supabase
      .from('career_path_progressions')
      .select('*')
      .limit(5);

    if (progError) {
      console.log('   ❌ Error accessing career_path_progressions:', progError.message);
    } else {
      console.log('   ✅ career_path_progressions table accessible');
      console.log('   📊 Sample columns:', Object.keys(progressions[0] || {}).join(', '));

      // Check if it has career_code references
      const hasCareerCode = progressions.some(p => p.career_code !== undefined);
      const hasBaseCareerCode = progressions.some(p => p.base_career_code !== undefined);

      if (hasCareerCode) {
        console.log('   🔗 Found career_code column');
      }
      if (hasBaseCareerCode) {
        console.log('   🔗 Found base_career_code column');
      }
      if (!hasCareerCode && !hasBaseCareerCode) {
        console.log('   ✅ No career_code dependencies found');
      }
    }

    // Check any other potential tables
    console.log('\n2️⃣ Checking for other tables...');

    // Check if there are any lesson or content tables
    const potentialTables = [
      'lessons',
      'lesson_plans',
      'career_lessons',
      'user_career_selections',
      'career_progress',
      'career_recommendations'
    ];

    for (const tableName of potentialTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (!error && data) {
          console.log(`   ✅ Found table: ${tableName}`);
          const columns = Object.keys(data[0] || {});
          const careerCodeCols = columns.filter(col => col.includes('career') && col.includes('code'));

          if (careerCodeCols.length > 0) {
            console.log(`      🔗 Potential career_code columns: ${careerCodeCols.join(', ')}`);
          }
        }
      } catch (error) {
        // Table doesn't exist - skip silently
      }
    }

    // Check career_attributes consistency
    console.log('\n3️⃣ Verifying career_attributes consistency...');

    const { data: allCareerPaths } = await supabase
      .from('career_paths')
      .select('career_code')
      .eq('is_active', true);

    const { data: allAttributes } = await supabase
      .from('career_attributes')
      .select('career_code');

    const pathCodes = allCareerPaths.map(cp => cp.career_code);
    const attrCodes = allAttributes.map(attr => attr.career_code);

    const missingInPaths = attrCodes.filter(code => !pathCodes.includes(code));
    const missingInAttrs = pathCodes.filter(code => !attrCodes.includes(code));

    console.log(`   📊 career_paths codes: ${pathCodes.length}`);
    console.log(`   📊 career_attributes codes: ${attrCodes.length}`);
    console.log(`   ❌ Attributes missing career_paths: ${missingInPaths.length}`);
    console.log(`   ❌ Paths missing attributes: ${missingInAttrs.length}`);

    if (missingInPaths.length > 0) {
      console.log('   🚨 Orphaned career_attributes:');
      missingInPaths.slice(0, 5).forEach(code => console.log(`      ${code}`));
    }

    if (missingInAttrs.length > 0) {
      console.log('   ⚠️  career_paths without attributes:');
      missingInAttrs.slice(0, 10).forEach(code => console.log(`      ${code}`));
    }

    // Show sample of standardized vs old format codes
    console.log('\n4️⃣ Checking code format distribution...');

    const standardizedCodes = pathCodes.filter(code => /^[a-z0-9-]+$/.test(code));
    const oldFormatCodes = pathCodes.filter(code => /[A-Z_]/.test(code) || code.includes('temp'));

    console.log(`   ✅ Standardized format: ${standardizedCodes.length} (${Math.round(standardizedCodes.length/pathCodes.length*100)}%)`);
    console.log(`   ⚠️  Old format: ${oldFormatCodes.length}`);

    if (oldFormatCodes.length > 0) {
      console.log('   📋 Remaining old format codes:');
      oldFormatCodes.slice(0, 10).forEach(code => console.log(`      ${code}`));
    }

    // Check if attributes have corresponding old codes that need updating
    console.log('\n5️⃣ Checking if career_attributes need further updates...');

    const oldStyleAttributes = attrCodes.filter(code =>
      /^(ELEM_|MID_|HIGH_)/.test(code) ||
      code.includes('_temp_') ||
      /[A-Z_]/.test(code)
    );

    console.log(`   ⚠️  Old-style career_attributes: ${oldStyleAttributes.length}`);

    if (oldStyleAttributes.length > 0) {
      console.log('   📋 Sample old-style attributes:');
      oldStyleAttributes.slice(0, 10).forEach(code => console.log(`      ${code}`));

      // Try to find mappings
      console.log('\n   🔍 Looking for mapping opportunities...');

      for (const oldCode of oldStyleAttributes.slice(0, 5)) {
        const possibleMatches = pathCodes.filter(pathCode => {
          const oldLower = oldCode.toLowerCase().replace(/^(elem_|mid_|high_)/, '').replace(/_/g, '-');
          return pathCode === oldLower || pathCode.includes(oldLower.substring(0, 5));
        });

        if (possibleMatches.length > 0) {
          console.log(`      ${oldCode} → ${possibleMatches[0]}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkAllForeignKeys()
  .then(() => {
    console.log('\n✅ Foreign key dependency check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });