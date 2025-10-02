/**
 * Check if career_code1 field still exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCareerCode1Field() {
  console.log('\n🔍 Checking if career_code1 field exists...\n');

  try {
    // Try to select the career_code1 field
    const { data, error } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, career_code1')
      .limit(5);

    if (error) {
      if (error.message.includes('column "career_code1" does not exist')) {
        console.log('❌ career_code1 field has been DROPPED');
        console.log('   The field no longer exists in the database');
        return false;
      } else {
        throw error;
      }
    }

    console.log('✅ career_code1 field still EXISTS');
    console.log('   Sample data:');

    data.forEach((career, i) => {
      console.log(`   ${i + 1}. ${career.career_name}`);
      console.log(`      career_code: ${career.career_code}`);
      console.log(`      career_code1: ${career.career_code1 || 'NULL'}`);
    });

    // Count how many have career_code1 values
    const { data: countData, error: countError } = await supabase
      .from('career_paths')
      .select('career_code1')
      .not('career_code1', 'is', null);

    if (!countError) {
      console.log(`\n📊 ${countData.length} careers have career_code1 values`);
    }

    return true;

  } catch (error) {
    console.error('Error checking field:', error.message);
    return false;
  }
}

checkCareerCode1Field()
  .then((exists) => {
    if (exists) {
      console.log('\n💡 Since career_code1 still exists, we can complete the update!');
    } else {
      console.log('\n⚠️  career_code1 was dropped - would need to regenerate from CSV');
    }
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });