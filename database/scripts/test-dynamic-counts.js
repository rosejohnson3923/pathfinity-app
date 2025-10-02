/**
 * Test dynamic career counts across grade levels
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getCareerCountByGradeAndTier(gradeLevel, tier) {
  const gradeLevelNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

  let query = supabase
    .from('career_paths')
    .select('id', { count: 'exact' })
    .eq('is_active', true);

  // Apply tier filtering
  if (tier === 'premium') {
    query = query.in('access_tier', ['select', 'premium']);
  } else {
    query = query.eq('access_tier', 'select');
  }

  // Apply grade-level filtering
  if (gradeLevelNum <= 5) {
    // K-5: Only elementary careers that have unlocked
    query = query
      .eq('grade_category', 'elementary')
      .lte('min_grade_level_num', gradeLevelNum);
  } else if (gradeLevelNum <= 8) {
    // 6-8: All elementary + all middle careers
    query = query.in('grade_category', ['elementary', 'middle']);
  } else {
    // 9-12: All careers
  }

  const { count, error } = await query;

  if (error) throw error;
  return count || 0;
}

async function testDynamicCounts() {
  console.log('\n📊 Testing Dynamic Career Counts Across Grade Levels\n');
  console.log('=' .repeat(70));

  const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const tiers = ['select', 'premium'];

  console.log('Grade | Select | Premium | Difference');
  console.log('------|--------|---------|----------');

  for (const grade of grades) {
    try {
      const selectCount = await getCareerCountByGradeAndTier(grade, 'select');
      const premiumCount = await getCareerCountByGradeAndTier(grade, 'premium');
      const difference = premiumCount - selectCount;

      console.log(`  ${grade.padEnd(2)}  |   ${selectCount.toString().padStart(2)}   |   ${premiumCount.toString().padStart(3)}   |    ${difference.toString().padStart(3)}`);
    } catch (error) {
      console.log(`  ${grade.padEnd(2)}  | ERROR  |  ERROR  |   ERROR`);
      console.error(`Error for grade ${grade}:`, error.message);
    }
  }

  console.log('\n🔍 Key Expectations:');
  console.log('• K-5: Should show progressive increases as more elementary careers unlock');
  console.log('• 6-8: Should show significant jump (elementary + middle careers)');
  console.log('• 9-12: Should show highest counts (all careers available)');
  console.log('• Premium should always be >= Select for the same grade');

  // Test specific transition points
  console.log('\n🎯 Testing Transition Points:');

  try {
    const k_select = await getCareerCountByGradeAndTier('K', 'select');
    const k_premium = await getCareerCountByGradeAndTier('K', 'premium');
    const grade5_select = await getCareerCountByGradeAndTier('5', 'select');
    const grade5_premium = await getCareerCountByGradeAndTier('5', 'premium');
    const grade6_select = await getCareerCountByGradeAndTier('6', 'select');
    const grade6_premium = await getCareerCountByGradeAndTier('6', 'premium');
    const grade9_select = await getCareerCountByGradeAndTier('9', 'select');
    const grade9_premium = await getCareerCountByGradeAndTier('9', 'premium');

    console.log(`K → Grade 5 (Elementary): ${k_premium} → ${grade5_premium} (+${grade5_premium - k_premium})`);
    console.log(`Grade 5 → Grade 6 (Middle): ${grade5_premium} → ${grade6_premium} (+${grade6_premium - grade5_premium})`);
    console.log(`Grade 6 → Grade 9 (High): ${grade6_premium} → ${grade9_premium} (+${grade9_premium - grade6_premium})`);

    console.log('\n✅ Dashboard tier boxes will now show these exact counts!');

  } catch (error) {
    console.error('Error testing transition points:', error);
  }
}

testDynamicCounts()
  .then(() => {
    console.log('\n✅ Dynamic count testing complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });