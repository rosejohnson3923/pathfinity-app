/**
 * Check why Therapist is showing for Kindergarten
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

async function checkTherapistIssue() {
  console.log('\n🔍 Investigating Therapist Career Issue\n');
  console.log('=' .repeat(60));

  try {
    // 1. Check Therapist career details
    const { data: therapist, error: therapistError } = await supabase
      .from('career_paths')
      .select('*')
      .ilike('career_name', '%therapist%')
      .eq('is_active', true);

    if (therapistError) throw therapistError;

    console.log('\n📋 Therapist Career Details:');
    console.log('-'.repeat(60));

    if (therapist && therapist.length > 0) {
      therapist.forEach(t => {
        console.log(`\nCareer: ${t.career_name}`);
        console.log(`  ID: ${t.id}`);
        console.log(`  Access Tier: ${t.access_tier}`);
        console.log(`  Grade Category: ${t.grade_category}`);
        console.log(`  Min Grade Level: ${t.min_grade_level} (numeric: ${t.min_grade_level_num})`);
        console.log(`  Max Grade Level: ${t.max_grade_level} (numeric: ${t.max_grade_level_num})`);
        console.log(`  Career Category: ${t.career_category}`);
        console.log(`  Field ID: ${t.field_id}`);
      });
    } else {
      console.log('❌ No Therapist career found!');
    }

    // 2. Check what Select tier careers are available for Kindergarten (grade 0)
    console.log('\n\n📚 Select Tier Careers Available for Kindergarten:');
    console.log('-'.repeat(60));

    const { data: kCareers, error: kError } = await supabase
      .from('career_paths')
      .select('career_name, min_grade_level, min_grade_level_num, access_tier')
      .eq('access_tier', 'select')
      .lte('min_grade_level_num', 0) // Kindergarten = 0
      .eq('is_active', true)
      .order('career_name');

    if (kError) throw kError;

    console.log(`\nFound ${kCareers.length} Select careers for Kindergarten:\n`);

    kCareers.forEach((career, index) => {
      const marker = career.career_name.toLowerCase().includes('therapist') ? ' ⚠️ ' : '    ';
      console.log(`${marker}${(index + 1).toString().padStart(2)}. ${career.career_name.padEnd(30)} (min grade: ${career.min_grade_level || 'NULL'}, num: ${career.min_grade_level_num})`);
    });

    // 3. Check for NULL or problematic min_grade_level_num values
    console.log('\n\n⚠️  Checking for NULL Grade Issues:');
    console.log('-'.repeat(60));

    const { data: nullGrades, error: nullError } = await supabase
      .from('career_paths')
      .select('career_name, min_grade_level, min_grade_level_num, access_tier')
      .is('min_grade_level_num', null)
      .eq('is_active', true);

    if (nullError) throw nullError;

    if (nullGrades && nullGrades.length > 0) {
      console.log(`\nFound ${nullGrades.length} careers with NULL min_grade_level_num:`);
      nullGrades.forEach(career => {
        console.log(`  - ${career.career_name} (tier: ${career.access_tier}, min_grade: ${career.min_grade_level})`);
      });
    } else {
      console.log('\n✅ No careers with NULL min_grade_level_num');
    }

    // 4. Show the SQL that would be used by the service
    console.log('\n\n🔧 Service Query for K-Select:');
    console.log('-'.repeat(60));
    console.log(`
The service uses this query:
  SELECT * FROM career_paths
  WHERE access_tier = 'select'
    AND min_grade_level_num <= 0  -- (K = 0)
    AND is_active = true
  ORDER BY career_name

This should NOT include Therapist if it has a higher min_grade_level_num.
`);

    // 5. Check if there are duplicate Therapist entries
    console.log('\n🔍 Checking for Duplicate Therapist Entries:');
    console.log('-'.repeat(60));

    const { data: allTherapists, error: dupError } = await supabase
      .from('career_paths')
      .select('*')
      .ilike('career_name', '%therapist%');

    if (dupError) throw dupError;

    if (allTherapists && allTherapists.length > 1) {
      console.log(`\n⚠️  Found ${allTherapists.length} Therapist-related entries:`);
      allTherapists.forEach(t => {
        console.log(`  - ${t.career_name} (active: ${t.is_active}, tier: ${t.access_tier}, min_grade: ${t.min_grade_level})`);
      });
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkTherapistIssue()
  .then(() => {
    console.log('\n✅ Investigation complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });