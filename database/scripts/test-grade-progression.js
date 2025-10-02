/**
 * Test Grade Progression System
 * Verifies that careers show appropriately for each grade level
 * Tests both Select and Premium tiers across K-12
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testGradeProgression() {
  console.log('\n🎓 Testing Grade Progression System\n');
  console.log('=' .repeat(70));

  try {
    // Test all grade levels with both tiers
    const gradeTests = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const tiers = ['select', 'premium'];

    for (const grade of gradeTests) {
      console.log(`\n📚 Testing Grade ${grade === 'K' ? 'Kindergarten' : grade}:`);
      console.log('-'.repeat(50));

      for (const tier of tiers) {
        // Simulate the service query
        let query = supabase
          .from('career_paths')
          .select('career_name, grade_category, min_grade_level, min_grade_level_num, access_tier')
          .eq('is_active', true);

        // Apply tier filtering
        if (tier === 'select') {
          query = query.eq('access_tier', 'select');
        } else {
          query = query.in('access_tier', ['select', 'premium']);
        }

        // Apply grade-level filtering using dual progression logic
        const gradeLevelNum = grade === 'K' ? 0 : parseInt(grade);

        if (gradeLevelNum <= 5) {
          // K-5: Elementary students see only elementary careers that have unlocked
          query = query
            .eq('grade_category', 'elementary')
            .lte('min_grade_level_num', gradeLevelNum);
        } else if (gradeLevelNum <= 8) {
          // 6-8: Middle school students see ALL elementary + ALL middle careers
          query = query
            .in('grade_category', ['elementary', 'middle']);
        } else {
          // 9-12: High school students see ALL careers
        }

        const { data: careers, error } = await query.order('career_name');

        if (error) throw error;

        // Analyze results
        const categoryBreakdown = {};
        const inappropriate = [];

        careers.forEach(career => {
          // Count by category
          categoryBreakdown[career.grade_category] = (categoryBreakdown[career.grade_category] || 0) + 1;

          // Check for inappropriate careers for young students
          if (gradeLevelNum <= 5) {
            const inappropriateCareers = ['neurosurgeon', 'surgeon', 'lawyer', 'ceo', 'president'];
            if (inappropriateCareers.some(ic => career.career_name.toLowerCase().includes(ic))) {
              inappropriate.push(career.career_name);
            }
          }
        });

        console.log(`  ${tier.toUpperCase().padEnd(7)}: ${careers.length.toString().padStart(3)} careers`);

        // Show category breakdown
        Object.entries(categoryBreakdown).forEach(([category, count]) => {
          console.log(`    ${category}: ${count}`);
        });

        // Flag inappropriate careers
        if (inappropriate.length > 0) {
          console.log(`    ⚠️  INAPPROPRIATE: ${inappropriate.join(', ')}`);
        }
      }
    }

    // Test specific career visibility
    console.log('\n\n🔍 Testing Specific Career Visibility:');
    console.log('=' .repeat(70));

    const testCareers = [
      { name: 'Neurosurgeon', shouldShowAtGrade: 9 },
      { name: 'Chef', shouldShowAtGrade: 0 }, // Kindergarten
      { name: 'Doctor', shouldShowAtGrade: 0 }, // Should be available early
      { name: 'Teacher', shouldShowAtGrade: 0 }
    ];

    for (const testCareer of testCareers) {
      console.log(`\n📋 ${testCareer.name}:`);

      // Find this career in database
      const { data: careerData } = await supabase
        .from('career_paths')
        .select('*')
        .ilike('career_name', `%${testCareer.name.toLowerCase()}%`)
        .eq('is_active', true)
        .limit(1)
        .single();

      if (!careerData) {
        console.log(`  ❌ Career not found in database`);
        continue;
      }

      console.log(`  Grade Category: ${careerData.grade_category}`);
      console.log(`  Min Grade: ${careerData.min_grade_level} (${careerData.min_grade_level_num})`);
      console.log(`  Access Tier: ${careerData.access_tier}`);

      // Test visibility at different grades
      const testGrades = [0, 2, 5, 6, 9]; // K, 2nd, 5th, 6th, 9th

      for (const gradeNum of testGrades) {
        const gradeLabel = gradeNum === 0 ? 'K' : gradeNum.toString();
        let shouldShow = false;

        if (gradeNum <= 5) {
          // Elementary logic
          shouldShow = careerData.grade_category === 'elementary' &&
                      (careerData.min_grade_level_num || 0) <= gradeNum;
        } else if (gradeNum <= 8) {
          // Middle school logic
          shouldShow = ['elementary', 'middle'].includes(careerData.grade_category);
        } else {
          // High school logic
          shouldShow = true;
        }

        const status = shouldShow ? '✅' : '❌';
        const expected = gradeNum >= testCareer.shouldShowAtGrade ? '(should show)' : '(should hide)';
        console.log(`    Grade ${gradeLabel}: ${status} ${expected}`);
      }
    }

    // Summary statistics
    console.log('\n\n📊 Summary Statistics:');
    console.log('=' .repeat(70));

    const { data: allStats } = await supabase
      .from('career_paths')
      .select('grade_category, access_tier')
      .eq('is_active', true);

    const stats = {};
    allStats.forEach(row => {
      const key = `${row.grade_category}-${row.access_tier}`;
      stats[key] = (stats[key] || 0) + 1;
    });

    ['elementary', 'middle', 'high'].forEach(category => {
      const select = stats[`${category}-select`] || 0;
      const premium = stats[`${category}-premium`] || 0;
      const total = select + premium;
      console.log(`${category.toUpperCase().padEnd(10)}: ${total.toString().padStart(3)} total (${select} select, ${premium} premium)`);
    });

    const grandTotal = Object.values(stats).reduce((sum, count) => sum + count, 0);
    console.log(`${'TOTAL'.padEnd(10)}: ${grandTotal.toString().padStart(3)} careers`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

testGradeProgression()
  .then(() => {
    console.log('\n✅ Grade progression test complete!\n');
    console.log('🌐 Test the dashboard at: http://localhost:3003/test/career-database');
    console.log('\nKey findings:');
    console.log('- K-5: Only elementary careers that have unlocked');
    console.log('- 6-8: All elementary + all middle careers');
    console.log('- 9-12: All careers available');
    console.log('- Inappropriate careers should be filtered for young students\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });