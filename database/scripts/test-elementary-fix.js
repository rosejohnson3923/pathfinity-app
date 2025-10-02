/**
 * Test elementary career filtering fix
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testElementaryFix() {
  console.log('\n🧪 Testing Elementary Career Filtering Fix\n');
  console.log('=' .repeat(50));

  try {
    // Test the exact query that getCareersByGradeLevel() should run for K, Premium
    console.log('1️⃣ Testing Kindergarten Premium query...');

    const gradeLevelNum = 0; // Kindergarten
    const selectedTier = 'premium';

    let query = supabase
      .from('career_paths')
      .select('id, career_name, grade_category, min_grade_level, min_grade_level_num, access_tier, career_category')
      .eq('is_active', true);

    // Apply tier filtering
    if (selectedTier === 'premium') {
      query = query.in('access_tier', ['select', 'premium']);
    } else {
      query = query.eq('access_tier', 'select');
    }

    // Apply grade-level filtering
    if (gradeLevelNum <= 5) {
      query = query
        .eq('grade_category', 'elementary')
        .lte('min_grade_level_num', gradeLevelNum);
    }

    const { data: results, error } = await query.order('career_name');

    if (error) throw error;

    console.log(`   📊 Total careers found: ${results.length}`);

    if (results.length === 0) {
      console.log('   ❌ NO CAREERS FOUND - Issue still exists!');
      return false;
    }

    console.log('\n   ✅ Elementary careers for Kindergarten Premium:');
    results.forEach((career, i) => {
      console.log(`   ${i + 1}. ${career.career_name} (${career.career_category})`);
      console.log(`      Grade: ${career.min_grade_level} | Tier: ${career.access_tier}`);
    });

    // Group by career_category to test the field grouping
    console.log('\n2️⃣ Testing field grouping...');

    const byCategory = {};
    results.forEach(career => {
      const category = career.career_category || 'other';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(career);
    });

    console.log(`   📊 Career fields with elementary careers: ${Object.keys(byCategory).length}`);

    Object.entries(byCategory).forEach(([category, careers]) => {
      console.log(`   ${category}: ${careers.length} careers`);
    });

    // Test a specific problematic case
    console.log('\n3️⃣ Testing for inappropriate careers...');

    const inappropriateCareers = results.filter(career => {
      const name = career.career_name.toLowerCase();
      return name.includes('neurosurgeon') ||
             name.includes('surgeon') ||
             name.includes('lawyer') ||
             name.includes('ceo');
    });

    if (inappropriateCareers.length > 0) {
      console.log('   ⚠️  Found inappropriate careers for Kindergarten:');
      inappropriateCareers.forEach(career => {
        console.log(`      ${career.career_name} (${career.min_grade_level})`);
      });
    } else {
      console.log('   ✅ No inappropriate careers found for Kindergarten');
    }

    return results.length > 0 && inappropriateCareers.length === 0;

  } catch (error) {
    console.error('Error:', error.message);
    return false;
  }
}

testElementaryFix()
  .then((success) => {
    if (success) {
      console.log('\n🎉 Elementary career filtering fix SUCCESSFUL!');
      console.log('Dashboard should now show appropriate careers for Kindergarten');
    } else {
      console.log('\n❌ Elementary career filtering still has issues');
    }
    console.log('\n' + '=' .repeat(50) + '\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });