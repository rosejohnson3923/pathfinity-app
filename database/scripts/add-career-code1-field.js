/**
 * Add career_code1 temporary field to career_paths table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addCareerCode1Field() {
  console.log('\n🔧 Adding career_code1 temporary field...\n');

  try {
    // Test if field already exists by trying to select it
    try {
      const { data } = await supabase
        .from('career_paths')
        .select('career_code1')
        .limit(1);

      console.log('✅ career_code1 field already exists');
      return;
    } catch (error) {
      if (error.message.includes('column "career_code1" does not exist')) {
        console.log('ℹ️  career_code1 field does not exist, adding it...');
      } else {
        throw error;
      }
    }

    // Since we can't run DDL through Supabase client, provide instructions
    console.log('📝 Please run this SQL command in your Supabase SQL editor:');
    console.log('');
    console.log('ALTER TABLE career_paths ADD COLUMN career_code1 TEXT;');
    console.log('');
    console.log('After adding the field, run the career code import script.');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

addCareerCode1Field()
  .then(() => {
    console.log('\n✅ Field check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });