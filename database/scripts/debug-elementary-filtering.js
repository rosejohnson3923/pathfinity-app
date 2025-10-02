/**
 * Debug elementary career filtering issue
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugElementaryFiltering() {
  console.log('\n🔍 Debugging Elementary Career Filtering\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Check raw elementary careers in database
    console.log('1️⃣ Checking elementary careers in database...');

    const { data: elementaryCareers, error: elemError } = await supabase
      .from('career_paths')
      .select('id, career_name, career_code, grade_category, min_grade_level, min_grade_level_num, access_tier')
      .eq('grade_category', 'elementary')
      .eq('is_active', true)
      .order('career_name');

    if (elemError) throw elemError;

    console.log(`   📊 Total elementary careers found: ${elementaryCareers.length}`);

    if (elementaryCareers.length === 0) {
      console.log('   ❌ NO elementary careers found in database!');
      console.log('   This is the root problem - no careers marked as grade_category = "elementary"');
    } else {
      console.log('\n   📋 Sample elementary careers:');
      elementaryCareers.slice(0, 10).forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.career_name}`);
        console.log(`      grade_category: ${career.grade_category}`);
        console.log(`      min_grade_level: ${career.min_grade_level} (numeric: ${career.min_grade_level_num})`);
        console.log(`      access_tier: ${career.access_tier}`);
      });
    }

    // Step 2: Check all grade categories
    console.log('\n2️⃣ Checking all grade categories...');

    const { data: allCareers, error: allError } = await supabase
      .from('career_paths')
      .select('grade_category')
      .eq('is_active', true);

    if (allError) throw allError;

    const categoryCount = {};
    allCareers.forEach(career => {
      categoryCount[career.grade_category] = (categoryCount[career.grade_category] || 0) + 1;
    });

    console.log('   📊 Grade category distribution:');
    Object.entries(categoryCount).forEach(([category, count]) => {
      console.log(`      ${category}: ${count} careers`);
    });

    // Step 3: Test the service query for Kindergarten
    console.log('\n3️⃣ Testing service query for Kindergarten...');

    const gradeLevelNum = 0; // Kindergarten
    const selectedTier = 'premium';

    console.log(`   Testing: Grade K (${gradeLevelNum}), Tier: ${selectedTier}`);

    // Simulate the exact service query
    let query = supabase
      .from('career_paths')
      .select('career_name, grade_category, min_grade_level, min_grade_level_num, access_tier')
      .eq('is_active', true);

    // Apply tier filtering
    if (selectedTier === 'premium') {
      query = query.in('access_tier', ['select', 'premium']);
    } else {
      query = query.eq('access_tier', 'select');
    }

    // Apply grade-level filtering
    if (gradeLevelNum <= 5) {
      console.log('   📋 Applying elementary filter: grade_category = "elementary" AND min_grade_level_num <= 0');
      query = query
        .eq('grade_category', 'elementary')
        .lte('min_grade_level_num', gradeLevelNum);
    }

    const { data: serviceResults, error: serviceError } = await query.order('career_name');

    if (serviceError) throw serviceError;

    console.log(`   📊 Service query returned: ${serviceResults.length} careers`);

    if (serviceResults.length === 0) {
      console.log('   ❌ Service query returned 0 careers - this confirms the filtering issue');
    } else {
      console.log('\n   ✅ Sample service results:');
      serviceResults.slice(0, 5).forEach((career, i) => {
        console.log(`   ${i + 1}. ${career.career_name} (${career.grade_category}, min: ${career.min_grade_level})`);
      });
    }

    // Step 4: Check specific filtering conditions
    console.log('\n4️⃣ Checking filtering conditions...');

    // Test each condition separately
    const { data: activeCareers } = await supabase
      .from('career_paths')
      .select('career_name')
      .eq('is_active', true);

    const { data: tierCareers } = await supabase
      .from('career_paths')
      .select('career_name')
      .eq('is_active', true)
      .in('access_tier', ['select', 'premium']);

    const { data: elemCareers } = await supabase
      .from('career_paths')
      .select('career_name')
      .eq('is_active', true)
      .in('access_tier', ['select', 'premium'])
      .eq('grade_category', 'elementary');

    const { data: gradeCareers } = await supabase
      .from('career_paths')
      .select('career_name')
      .eq('is_active', true)
      .in('access_tier', ['select', 'premium'])
      .eq('grade_category', 'elementary')
      .lte('min_grade_level_num', 0);

    console.log('   Filter step results:');
    console.log(`      is_active = true: ${activeCareers.length}`);
    console.log(`      + access_tier filter: ${tierCareers.length}`);
    console.log(`      + grade_category = 'elementary': ${elemCareers.length}`);
    console.log(`      + min_grade_level_num <= 0: ${gradeCareers.length}`);

    // Step 5: Check min_grade_level_num values
    console.log('\n5️⃣ Checking min_grade_level_num values...');

    const { data: gradeValues } = await supabase
      .from('career_paths')
      .select('career_name, min_grade_level, min_grade_level_num, grade_category')
      .eq('is_active', true)
      .eq('grade_category', 'elementary')
      .order('min_grade_level_num');

    if (gradeValues && gradeValues.length > 0) {
      console.log('   📋 Elementary careers min_grade_level_num distribution:');
      const gradeDistribution = {};
      gradeValues.forEach(career => {
        const key = career.min_grade_level_num;
        gradeDistribution[key] = (gradeDistribution[key] || 0) + 1;
      });

      Object.entries(gradeDistribution).forEach(([grade, count]) => {
        console.log(`      min_grade_level_num = ${grade}: ${count} careers`);
      });

      console.log('\n   📋 Sample elementary careers with grades:');
      gradeValues.slice(0, 10).forEach(career => {
        const available = career.min_grade_level_num <= 0 ? '✅' : '❌';
        console.log(`      ${available} ${career.career_name}: ${career.min_grade_level} (${career.min_grade_level_num})`);
      });
    } else {
      console.log('   ❌ No elementary careers found with min_grade_level_num data');
    }

    // Step 6: Test dashboard component filtering
    console.log('\n6️⃣ Testing dashboard component filtering logic...');

    const allCareersByField = {};
    const { data: allCareersForDashboard } = await supabase
      .from('career_paths')
      .select('*')
      .eq('is_active', true);

    // Group by field like dashboard does
    allCareersForDashboard.forEach(career => {
      const field = career.career_category || 'other';
      if (!allCareersByField[field]) {
        allCareersByField[field] = [];
      }
      allCareersByField[field].push(career);
    });

    console.log(`   📊 Total career fields: ${Object.keys(allCareersByField).length}`);

    // Test dashboard filtering for one field
    const testField = Object.keys(allCareersByField)[0];
    const testCareers = allCareersByField[testField];

    console.log(`\n   🧪 Testing dashboard filter on field "${testField}" (${testCareers.length} careers):`);

    const dashboardGrade = 'K';
    const dashboardTier = 'premium';

    const filteredCareers = testCareers.filter(career => {
      // First filter by subscription tier
      const tierMatch = dashboardTier === 'premium' || career.access_tier === 'select';
      if (!tierMatch) return false;

      // Then filter by grade level using the dual progression logic
      const gradeLevelNum = dashboardGrade === 'K' ? 0 : parseInt(dashboardGrade);

      if (gradeLevelNum <= 5) {
        // K-5: Only elementary careers that have unlocked
        return career.grade_category === 'elementary' &&
               (career.min_grade_level_num || 0) <= gradeLevelNum;
      } else if (gradeLevelNum <= 8) {
        // 6-8: All elementary + all middle careers
        return ['elementary', 'middle'].includes(career.grade_category);
      } else {
        // 9-12: All careers
        return true;
      }
    });

    console.log(`      Dashboard filter result: ${filteredCareers.length} careers`);

    if (filteredCareers.length > 0) {
      console.log('      ✅ Dashboard filtering working for this field');
    } else {
      console.log('      ❌ Dashboard filtering returning 0 careers');

      // Debug why
      const tierFiltered = testCareers.filter(career =>
        dashboardTier === 'premium' || career.access_tier === 'select'
      );

      const elementary = tierFiltered.filter(career =>
        career.grade_category === 'elementary'
      );

      const gradeFiltered = elementary.filter(career =>
        (career.min_grade_level_num || 0) <= 0
      );

      console.log(`      Debug: tier filter → ${tierFiltered.length}`);
      console.log(`      Debug: elementary → ${elementary.length}`);
      console.log(`      Debug: grade filter → ${gradeFiltered.length}`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugElementaryFiltering()
  .then(() => {
    console.log('\n✅ Debug complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });