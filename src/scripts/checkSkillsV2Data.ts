/**
 * Script to check what data exists in skills_master_v2
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSkillsV2() {
  console.log('🔍 Checking skills_master_v2 table data...\n');
  
  // Get total count
  const { count: totalCount } = await supabase
    .from('skills_master_v2')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Total records in skills_master_v2: ${totalCount || 0}\n`);
  
  // Get distinct grade levels
  const { data: allRecords } = await supabase
    .from('skills_master_v2')
    .select('grade_level, subject');
  
  if (allRecords && allRecords.length > 0) {
    const gradeLevels = [...new Set(allRecords.map(r => r.grade_level))].filter(Boolean).sort();
    console.log(`📚 Grade levels in table: ${gradeLevels.join(', ')}\n`);
    
    // Count by grade level
    for (const grade of gradeLevels) {
      const gradeRecords = allRecords.filter(r => r.grade_level === grade);
      const subjects = [...new Set(gradeRecords.map(r => r.subject))].filter(Boolean).sort();
      console.log(`Grade ${grade}: ${gradeRecords.length} records`);
      console.log(`  Subjects: ${subjects.join(', ')}`);
    }
    
    // Show sample records
    console.log('\n📝 Sample records:');
    const { data: samples } = await supabase
      .from('skills_master_v2')
      .select('skill_id, subject, grade_level, skill_name')
      .limit(5);
    
    if (samples) {
      samples.forEach(s => {
        console.log(`  - ${s.subject} (Grade ${s.grade_level}): ${s.skill_name}`);
      });
    }
  } else {
    console.log('⚠️ No records found in skills_master_v2');
  }
  
  // Specifically check for Grade 10
  console.log('\n🎯 Checking specifically for Grade 10:');
  const { data: grade10, count: grade10Count } = await supabase
    .from('skills_master_v2')
    .select('subject', { count: 'exact' })
    .eq('grade_level', '10');
  
  if (grade10 && grade10.length > 0) {
    console.log(`✅ Found ${grade10Count} records for grade_level='10'`);
    const subjects = [...new Set(grade10.map(r => r.subject))].filter(Boolean);
    console.log(`Subjects: ${subjects.join(', ')}`);
  } else {
    console.log(`⚠️ No records found for grade_level='10'`);
  }
}

checkSkillsV2().catch(console.error);