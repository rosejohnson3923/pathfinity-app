/**
 * Check why Neurosurgeon is showing for Kindergarten
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkNeurosurgeon() {
  console.log('\n🔍 Checking Neurosurgeon Data\n');
  console.log('=' .repeat(60));

  try {
    // Check Neurosurgeon career details
    const { data: neurosurgeon, error } = await supabase
      .from('career_paths')
      .select('*')
      .ilike('career_name', '%neurosurgeon%')
      .eq('is_active', true);

    if (error) throw error;

    if (neurosurgeon && neurosurgeon.length > 0) {
      console.log('\n📋 Neurosurgeon Career Details:');
      neurosurgeon.forEach(n => {
        console.log(`\nCareer: ${n.career_name}`);
        console.log(`  ID: ${n.id}`);
        console.log(`  Access Tier: ${n.access_tier}`);
        console.log(`  Grade Category: ${n.grade_category}`);
        console.log(`  Min Grade Level: ${n.min_grade_level} (numeric: ${n.min_grade_level_num})`);
        console.log(`  Max Grade Level: ${n.max_grade_level} (numeric: ${n.max_grade_level_num})`);
        console.log(`  Career Category: ${n.career_category}`);
      });
    } else {
      console.log('❌ No Neurosurgeon career found!');
    }

    // Test the service query for Kindergarten
    console.log('\n\n🧪 Testing Service Query for Kindergarten:');
    console.log('-'.repeat(60));

    // Simulate the service query for K, Premium tier
    let query = supabase
      .from('career_paths')
      .select('career_name, grade_category, min_grade_level, min_grade_level_num, access_tier')
      .in('access_tier', ['select', 'premium'])  // Premium includes both
      .eq('is_active', true);

    // K-5: Elementary students see only elementary careers that have unlocked
    const gradeLevelNum = 0; // Kindergarten = 0
    if (gradeLevelNum <= 5) {
      query = query
        .eq('grade_category', 'elementary')
        .lte('min_grade_level_num', gradeLevelNum);
    }

    const { data: kCareers, error: kError } = await query.order('career_name');

    if (kError) throw kError;

    console.log(`\nFound ${kCareers.length} careers for Kindergarten Premium:`);

    // Check if Neurosurgeon is in the results
    const neurosurgeonInResults = kCareers.find(c => c.career_name.toLowerCase().includes('neurosurgeon'));

    if (neurosurgeonInResults) {
      console.log(`\n❌ PROBLEM: Neurosurgeon IS showing in Kindergarten results!`);
      console.log(`   Career: ${neurosurgeonInResults.career_name}`);
      console.log(`   Grade Category: ${neurosurgeonInResults.grade_category}`);
      console.log(`   Min Grade: ${neurosurgeonInResults.min_grade_level} (${neurosurgeonInResults.min_grade_level_num})`);
      console.log(`   Access Tier: ${neurosurgeonInResults.access_tier}`);
    } else {
      console.log(`\n✅ Good: Neurosurgeon is NOT in Kindergarten results`);
    }

    // Show first 10 careers for reference
    console.log(`\nFirst 10 Kindergarten careers:`);
    kCareers.slice(0, 10).forEach((career, i) => {
      console.log(`  ${i + 1}. ${career.career_name} (${career.grade_category}, min: ${career.min_grade_level})`);
    });

    // Check dashboard component query
    console.log('\n\n🎯 Testing Dashboard Component Logic:');
    console.log('-'.repeat(60));

    // Check what the dashboard component would get
    const dashboardQuery = supabase
      .from('career_paths')
      .select('*')
      .eq('is_active', true);

    const { data: allCareers } = await dashboardQuery;

    // Group by field like the dashboard does
    const careersByField = {};
    allCareers.forEach(career => {
      const field = career.career_category || 'other';
      if (!careersByField[field]) {
        careersByField[field] = [];
      }
      careersByField[field].push(career);
    });

    console.log('\nCareer fields found:');
    Object.keys(careersByField).forEach(field => {
      const count = careersByField[field].length;
      console.log(`  ${field}: ${count} careers`);
    });

    // Check if Neurosurgeon is in any field
    Object.entries(careersByField).forEach(([field, careers]) => {
      const hasNeurosurgeon = careers.find(c => c.career_name.toLowerCase().includes('neurosurgeon'));
      if (hasNeurosurgeon) {
        console.log(`\n📍 Neurosurgeon found in field "${field}":`, hasNeurosurgeon.career_name);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkNeurosurgeon()
  .then(() => {
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });