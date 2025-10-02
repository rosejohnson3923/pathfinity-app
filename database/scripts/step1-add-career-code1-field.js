/**
 * Step 1: Add career_code1 field and validate it exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCareerCode1Field() {
  console.log('\n🔧 Step 1: Adding career_code1 field\n');
  console.log('=' .repeat(50));

  try {
    // First, check if field already exists
    console.log('1️⃣ Checking if career_code1 field already exists...');

    try {
      const { data } = await supabase
        .from('career_paths')
        .select('career_code1')
        .limit(1);

      console.log('   ✅ career_code1 field already exists');

      // Count existing values
      const { data: existingValues } = await supabase
        .from('career_paths')
        .select('career_code1')
        .not('career_code1', 'is', null);

      console.log(`   📊 ${existingValues?.length || 0} careers already have career_code1 values`);

      return true;

    } catch (error) {
      if (error.message.includes('column "career_code1" does not exist')) {
        console.log('   ℹ️  career_code1 field does not exist - needs to be added');
      } else {
        throw error;
      }
    }

    // Field doesn't exist, so we need to add it
    console.log('\n2️⃣ Adding career_code1 field to database...');
    console.log('   📝 Please run this SQL command in Supabase SQL editor:');
    console.log('');
    console.log('   ALTER TABLE career_paths ADD COLUMN career_code1 TEXT;');
    console.log('');
    console.log('   After running the command, run this script again to verify.');

    return false;

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

addCareerCode1Field()
  .then((fieldExists) => {
    if (fieldExists) {
      console.log('\n✅ Step 1 Complete: career_code1 field is ready!');
      console.log('\nNext: Run step2-import-csv-data.js');
    } else {
      console.log('\n⏳ Step 1 Pending: Please add the field and run this script again');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });