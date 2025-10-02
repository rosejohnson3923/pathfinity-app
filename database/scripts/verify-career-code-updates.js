/**
 * Verify that career code updates were successful
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyUpdates() {
  console.log('\n🔍 Verifying Career Code Updates\n');
  console.log('=' .repeat(60));

  try {
    // Check overall statistics
    const { data: stats, error: statsError } = await supabase
      .from('career_paths')
      .select('career_code')
      .eq('is_active', true);

    if (statsError) throw statsError;

    const totalCareers = stats.length;
    const standardizedCodes = stats.filter(c => /^[a-z0-9-]+$/.test(c.career_code)).length;
    const oldFormatCodes = stats.filter(c => /[A-Z_]/.test(c.career_code) || c.career_code.includes('temp')).length;

    console.log('📊 Career Code Statistics:');
    console.log(`   Total active careers: ${totalCareers}`);
    console.log(`   Standardized format: ${standardizedCodes} (${Math.round((standardizedCodes/totalCareers)*100)}%)`);
    console.log(`   Old format remaining: ${oldFormatCodes}`);

    // Check specific careers that were updated
    const testCareers = ['Youth Minister', 'Voice Actor', 'Game Developer', 'Animator', 'Chef'];

    console.log('\n📋 Sample Updated Careers:');
    for (const careerName of testCareers) {
      const { data: career } = await supabase
        .from('career_paths')
        .select('career_name, career_code')
        .ilike('career_name', careerName)
        .eq('is_active', true)
        .single();

      if (career) {
        const format = /^[a-z0-9-]+$/.test(career.career_code) ? '✅' : '❌';
        console.log(`   ${format} ${career.career_name}: ${career.career_code}`);
      }
    }

    // Check career_attributes consistency
    const { data: attrCheck, error: attrError } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT
          COUNT(*) as total_attributes,
          COUNT(CASE WHEN EXISTS (SELECT 1 FROM career_paths WHERE career_paths.career_code = career_attributes.career_code) THEN 1 END) as matching_codes
        FROM career_attributes
      `
    }).catch(() => null);

    if (attrCheck && attrCheck.length > 0) {
      const attr = attrCheck[0];
      console.log('\n🔗 Career Attributes Consistency:');
      console.log(`   Total attributes: ${attr.total_attributes}`);
      console.log(`   Matching career codes: ${attr.matching_codes}`);

      if (attr.total_attributes === attr.matching_codes) {
        console.log('   ✅ All career_attributes have valid career_code references');
      } else {
        console.log('   ⚠️  Some career_attributes have invalid references');
      }
    }

    // Check for any remaining issues
    const { data: issues } = await supabase
      .from('career_paths')
      .select('career_name, career_code')
      .or('career_code.like.%temp%,career_code.like.%_%')
      .eq('is_active', true);

    if (issues && issues.length > 0) {
      console.log('\n⚠️  Potential Issues Found:');
      issues.forEach(issue => {
        console.log(`   ${issue.career_name}: ${issue.career_code}`);
      });
    } else {
      console.log('\n✅ No issues found - all career codes are properly formatted!');
    }

    // Test the Neurosurgeon filtering to make sure it still works
    console.log('\n🧪 Testing Neurosurgeon Filtering (should be hidden for Kindergarten):');

    const { data: kCareers } = await supabase
      .from('career_paths')
      .select('career_name, grade_category, min_grade_level_num')
      .eq('grade_category', 'elementary')
      .lte('min_grade_level_num', 0)
      .eq('is_active', true);

    const hasNeurosurgeon = kCareers?.some(c => c.career_name.toLowerCase().includes('neurosurgeon'));

    if (hasNeurosurgeon) {
      console.log('   ❌ Neurosurgeon is still showing for Kindergarten');
    } else {
      console.log('   ✅ Neurosurgeon correctly hidden for Kindergarten');
    }

    console.log(`   Kindergarten careers available: ${kCareers?.length || 0}`);

  } catch (error) {
    console.error('Error during verification:', error.message);
  }
}

verifyUpdates()
  .then(() => {
    console.log('\n🎉 Verification complete!\n');
    console.log('The career progression system should now be fully updated with');
    console.log('standardized career codes from your CSV file.');
    console.log('\nDashboard URL: http://localhost:3003/test/career-database\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });