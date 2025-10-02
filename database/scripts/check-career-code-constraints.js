/**
 * Check foreign key constraints on career_code field
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkConstraints() {
  console.log('\n🔍 Checking career_code constraints\n');

  try {
    // Check if career_path_progressions references career_code
    const { data: progressions, error: progError } = await supabase
      .from('career_path_progressions')
      .select('*')
      .limit(5);

    if (progError) throw progError;

    console.log('📋 career_path_progressions columns:');
    if (progressions.length > 0) {
      console.log(Object.keys(progressions[0]).join(', '));
    }

    // Sample a few career_codes to test updating
    const { data: sampleCareers, error: sampleError } = await supabase
      .from('career_paths')
      .select('id, career_code, career_name')
      .limit(3);

    if (sampleError) throw sampleError;

    console.log('\n📋 Sample careers to test updating:');
    sampleCareers.forEach(career => {
      console.log(`  ${career.career_name}: ${career.career_code}`);
    });

    // Try updating one career_code to test for constraints
    const testCareer = sampleCareers[0];
    const newCode = testCareer.career_code + '-test';

    console.log(`\n🧪 Testing update of ${testCareer.career_name} career_code...`);

    const { error: updateError } = await supabase
      .from('career_paths')
      .update({ career_code: newCode })
      .eq('id', testCareer.id);

    if (updateError) {
      console.log(`❌ Update failed: ${updateError.message}`);
      console.log('This suggests there are foreign key constraints on career_code');
    } else {
      console.log(`✅ Update succeeded - rolling back...`);

      // Roll back the test change
      await supabase
        .from('career_paths')
        .update({ career_code: testCareer.career_code })
        .eq('id', testCareer.id);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkConstraints()
  .then(() => {
    console.log('\n✅ Constraint check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });