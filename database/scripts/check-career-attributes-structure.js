/**
 * Check the structure of career_attributes table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStructure() {
  console.log('\n🔍 Checking career_attributes table structure\n');

  try {
    // Get sample records to understand structure
    const { data: samples, error: sampleError } = await supabase
      .from('career_attributes')
      .select('*')
      .limit(5);

    if (sampleError) {
      console.log('❌ Error querying career_attributes:', sampleError.message);
      return;
    }

    if (!samples || samples.length === 0) {
      console.log('📋 career_attributes table is empty');
      return;
    }

    console.log('📋 career_attributes table columns:');
    console.log(Object.keys(samples[0]).join(', '));

    console.log('\n📋 Sample records:');
    samples.forEach((record, i) => {
      console.log(`\n${i + 1}. career_code: ${record.career_code}`);
      Object.entries(record).forEach(([key, value]) => {
        if (key !== 'career_code') {
          console.log(`   ${key}: ${value}`);
        }
      });
    });

    // Count total records
    const { count, error: countError } = await supabase
      .from('career_attributes')
      .select('*', { count: 'exact', head: true });

    if (!countError) {
      console.log(`\n📊 Total career_attributes records: ${count}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkStructure()
  .then(() => {
    console.log('\n✅ Structure check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });