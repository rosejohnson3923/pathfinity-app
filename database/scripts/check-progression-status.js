/**
 * Check the status of the dual progression system
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

async function checkProgressionStatus() {
  console.log('\n🎯 Dual Progression System Status Check\n');
  console.log('=' .repeat(60));

  try {
    // 1. Check for duplicates
    console.log('\n📋 Checking for Duplicate Careers:');
    console.log('-'.repeat(60));

    const { data: allCareers } = await supabase
      .from('career_paths')
      .select('career_name, id, grade_category, min_grade_level, access_tier')
      .eq('is_active', true)
      .order('career_name');

    const careerNames = {};
    allCareers.forEach(career => {
      if (!careerNames[career.career_name]) {
        careerNames[career.career_name] = [];
      }
      careerNames[career.career_name].push(career);
    });

    const duplicates = Object.entries(careerNames)
      .filter(([name, careers]) => careers.length > 1);

    if (duplicates.length > 0) {
      console.log(`\n⚠️  Found ${duplicates.length} duplicate career names:`);
      duplicates.forEach(([name, careers]) => {
        console.log(`\n  ${name} (${careers.length} entries):`);
        careers.forEach(c => {
          console.log(`    - ID: ${c.id.substring(0, 8)}... | Category: ${c.grade_category} | Tier: ${c.access_tier}`);
        });
      });
    } else {
      console.log('\n✅ No duplicate careers found');
    }

    // 2. Check progression by grade
    console.log('\n\n📊 Career Progression by Grade:');
    console.log('-'.repeat(60));

    const grades = [
      { label: 'K', num: 0, type: 'Elementary (Intra)' },
      { label: '1', num: 1, type: 'Elementary (Intra)' },
      { label: '2', num: 2, type: 'Elementary (Intra)' },
      { label: '3', num: 3, type: 'Elementary (Intra)' },
      { label: '4', num: 4, type: 'Elementary (Intra)' },
      { label: '5', num: 5, type: 'Elementary (Intra)' },
      { label: '6', num: 6, type: 'Middle (Inter)' },
      { label: '7', num: 7, type: 'Middle (Inter)' },
      { label: '8', num: 8, type: 'Middle (Inter)' },
      { label: '9', num: 9, type: 'High (Inter)' },
      { label: '10', num: 10, type: 'High (Inter)' },
      { label: '11', num: 11, type: 'High (Inter)' },
      { label: '12', num: 12, type: 'High (Inter)' }
    ];

    console.log('\nGrade | Type              | Select | Premium | Total | New');
    console.log('------|-------------------|--------|---------|-------|-----');

    for (const grade of grades) {
      let query;

      if (grade.num <= 5) {
        // Elementary: intra-category progression
        query = supabase
          .from('career_paths')
          .select('career_name, access_tier, min_grade_level_num')
          .eq('grade_category', 'elementary')
          .lte('min_grade_level_num', grade.num)
          .eq('is_active', true);
      } else if (grade.num <= 8) {
        // Middle: see all elementary + all middle
        query = supabase
          .from('career_paths')
          .select('career_name, access_tier, min_grade_level_num, grade_category')
          .in('grade_category', ['elementary', 'middle'])
          .eq('is_active', true);
      } else {
        // High: see all careers
        query = supabase
          .from('career_paths')
          .select('career_name, access_tier, min_grade_level_num, grade_category')
          .eq('is_active', true);
      }

      const { data: careers } = await query;

      const selectCount = careers.filter(c => c.access_tier === 'select').length;
      const premiumCount = careers.filter(c => c.access_tier === 'premium').length;

      // Count new careers at this grade
      let newCount = 0;
      if (grade.num <= 5) {
        newCount = careers.filter(c => c.min_grade_level_num === grade.num).length;
      } else if (grade.num === 6) {
        // Count middle school careers as "new" at grade 6
        newCount = careers.filter(c => c.grade_category === 'middle').length;
      } else if (grade.num === 9) {
        // Count high school careers as "new" at grade 9
        newCount = careers.filter(c => c.grade_category === 'high').length;
      }

      console.log(
        `  ${grade.label.padEnd(3)} | ${grade.type.padEnd(17)} | ${String(selectCount).padStart(6)} | ` +
        `${String(premiumCount).padStart(7)} | ${String(careers.length).padStart(5)} | ${String(newCount).padStart(4)}`
      );
    }

    // 3. Check category distribution
    console.log('\n\n📦 Career Category Distribution:');
    console.log('-'.repeat(60));

    const { data: categoryStats } = await supabase
      .from('career_paths')
      .select('grade_category, access_tier, min_grade_level')
      .eq('is_active', true);

    const categories = {};
    categoryStats.forEach(career => {
      const cat = career.grade_category || 'unknown';
      if (!categories[cat]) {
        categories[cat] = {
          total: 0,
          select: 0,
          premium: 0,
          grades: new Set()
        };
      }
      categories[cat].total++;
      if (career.access_tier === 'select') categories[cat].select++;
      if (career.access_tier === 'premium') categories[cat].premium++;
      if (career.min_grade_level) categories[cat].grades.add(career.min_grade_level);
    });

    console.log('\nCategory   | Total | Select | Premium | Unlock Grades');
    console.log('-----------|-------|--------|---------|---------------');

    Object.entries(categories)
      .sort(([a], [b]) => {
        const order = { elementary: 1, middle: 2, high: 3, all: 4, unknown: 5 };
        return (order[a] || 5) - (order[b] || 5);
      })
      .forEach(([category, stats]) => {
        const grades = Array.from(stats.grades).sort().join(', ');
        console.log(
          `${category.padEnd(10)} | ${String(stats.total).padStart(5)} | ` +
          `${String(stats.select).padStart(6)} | ${String(stats.premium).padStart(7)} | ${grades}`
        );
      });

    // 4. Verify Therapist
    console.log('\n\n🔍 Therapist Status:');
    console.log('-'.repeat(60));

    const { data: therapist } = await supabase
      .from('career_paths')
      .select('*')
      .eq('career_name', 'Therapist')
      .eq('is_active', true);

    if (therapist && therapist.length > 0) {
      therapist.forEach(t => {
        console.log(`  Category: ${t.grade_category}`);
        console.log(`  Min Grade: ${t.min_grade_level} (numeric: ${t.min_grade_level_num})`);
        console.log(`  Access Tier: ${t.access_tier}`);
        console.log(`  ✅ Should NOT appear in K-5: ${t.grade_category === 'high' ? 'CORRECT' : '❌ WRONG'}`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkProgressionStatus()
  .then(() => {
    console.log('\n✅ Status check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });