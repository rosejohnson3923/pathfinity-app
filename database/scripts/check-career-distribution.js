/**
 * Check Career Distribution by Grade
 * This script shows how many careers are available at each grade level
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCareerDistribution() {
  console.log('\n📊 Checking Career Distribution by Grade Level\n');
  console.log('=' .repeat(60));

  try {
    // Get all careers with grade level info
    const { data: careers, error } = await supabase
      .from('career_paths')
      .select('career_name, min_grade_level, min_grade_level_num, access_tier')
      .eq('is_active', true)
      .order('min_grade_level_num', { ascending: true });

    if (error) throw error;

    // Build statistics for each grade
    const grades = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    const gradeStats = [];

    console.log('\nGrade | Total Available | New at Grade | Select | Premium');
    console.log('------|----------------|--------------|--------|----------');

    grades.forEach((grade, index) => {
      const gradeNum = index; // K = 0, 1 = 1, etc.

      // Careers available at this grade (all with min_grade_level_num <= gradeNum)
      const available = careers.filter(c => (c.min_grade_level_num ?? 0) <= gradeNum);

      // New careers that unlock at this grade
      const newAtGrade = careers.filter(c => c.min_grade_level_num === gradeNum);

      // Count by tier
      const selectCount = available.filter(c => c.access_tier === 'select').length;
      const premiumCount = available.filter(c => c.access_tier === 'premium').length;

      console.log(
        `  ${grade.padEnd(3)} |      ${String(available.length).padStart(3)}       |` +
        `      ${String(newAtGrade.length).padStart(3)}     |` +
        `   ${String(selectCount).padStart(3)}  |    ${String(premiumCount).padStart(3)}`
      );

      gradeStats.push({
        grade,
        available: available.length,
        newAtGrade: newAtGrade.length,
        select: selectCount,
        premium: premiumCount
      });
    });

    // Show some problem areas
    console.log('\n⚠️  Issues Found:');
    console.log('=' .repeat(60));

    // Check for uneven distribution
    const problemGrades = gradeStats.filter(s => s.newAtGrade === 0 || s.newAtGrade > 50);
    if (problemGrades.length > 0) {
      console.log('\nGrades with distribution issues:');
      problemGrades.forEach(g => {
        if (g.newAtGrade === 0) {
          console.log(`  - Grade ${g.grade}: No new careers unlock`);
        } else if (g.newAtGrade > 50) {
          console.log(`  - Grade ${g.grade}: Too many careers unlock (${g.newAtGrade})`);
        }
      });
    }

    // Show careers with NULL min_grade_level
    const nullGradeCareers = careers.filter(c => c.min_grade_level === null);
    if (nullGradeCareers.length > 0) {
      console.log(`\n${nullGradeCareers.length} careers have NULL min_grade_level:`);
      nullGradeCareers.slice(0, 5).forEach(c => {
        console.log(`  - ${c.career_name}`);
      });
      if (nullGradeCareers.length > 5) {
        console.log(`  ... and ${nullGradeCareers.length - 5} more`);
      }
    }

    // Summary
    console.log('\n📈 Summary:');
    console.log('=' .repeat(60));
    console.log(`Total careers in database: ${careers.length}`);
    console.log(`Select tier careers: ${careers.filter(c => c.access_tier === 'select').length}`);
    console.log(`Premium tier careers: ${careers.filter(c => c.access_tier === 'premium').length}`);

    // Show sample careers at key grades
    console.log('\n📚 Sample Careers by Grade:');
    console.log('=' .repeat(60));

    const keySamples = [
      { grade: 'K', num: 0 },
      { grade: '2', num: 2 },
      { grade: '4', num: 4 },
      { grade: '6', num: 6 },
      { grade: '7', num: 7 },
      { grade: '9', num: 9 }
    ];

    keySamples.forEach(({ grade, num }) => {
      const newCareers = careers
        .filter(c => c.min_grade_level_num === num)
        .slice(0, 3)
        .map(c => c.career_name);

      if (newCareers.length > 0) {
        console.log(`\nGrade ${grade} unlocks: ${newCareers.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkCareerDistribution()
  .then(() => {
    console.log('\n✅ Analysis complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });