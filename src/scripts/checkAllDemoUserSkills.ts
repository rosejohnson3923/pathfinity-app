/**
 * Script to check skills availability for all demo users
 * in both skills_master and skills_master_v2 tables
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
// Use service role key to bypass RLS on skills_master_v2
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Demo users configuration
const demoUsers = [
  { name: 'Sam', grade: 'K' },
  { name: 'Emma', grade: '2' },
  { name: 'Michael', grade: '4' },
  { name: 'Sarah', grade: '6' },
  { name: 'Alex', grade: '8' },
  { name: 'Taylor', grade: '10' },
  { name: 'Jordan', grade: '12' }
];

async function checkSkillsForUser(userName: string, grade: string) {
  console.log(`\n📚 Checking skills for ${userName} (Grade ${grade})`);
  console.log('=' + '='.repeat(50));

  // Check skills_master table (uses 'grade' column)
  console.log('\n📊 Table: skills_master');
  console.log('-' + '-'.repeat(30));
  
  const { data: skillsMaster, error: error1 } = await supabase
    .from('skills_master')
    .select('subject, grade')
    .eq('grade', grade)
    .limit(10);

  if (error1) {
    console.log(`  ❌ Error: ${error1.message}`);
  } else if (skillsMaster && skillsMaster.length > 0) {
    console.log(`  ✅ Found ${skillsMaster.length} skills using grade="${grade}"`);
    const subjects = [...new Set(skillsMaster.map(s => s.subject))];
    console.log(`  Subjects: ${subjects.join(', ')}`);
    console.log(`  Sample records:`);
    skillsMaster.slice(0, 2).forEach(skill => {
      console.log(`    - Subject: ${skill.subject}, grade: ${skill.grade}`);
    });
  } else {
    console.log(`  ⚠️ No skills found for grade="${grade}"`);
  }

  // Check skills_master_v2 table (uses 'grade_level' column)
  console.log('\n📊 Table: skills_master_v2');
  console.log('-' + '-'.repeat(30));
  
  const { data: skillsMasterV2, error: errorV2 } = await supabase
    .from('skills_master_v2')
    .select('subject, grade_level')
    .eq('grade_level', grade)
    .limit(10);

  if (errorV2) {
    console.log(`  ❌ Error: ${errorV2.message}`);
  } else if (skillsMasterV2 && skillsMasterV2.length > 0) {
    console.log(`  ✅ Found ${skillsMasterV2.length} skills using grade_level="${grade}"`);
    const subjects = [...new Set(skillsMasterV2.map(s => s.subject))];
    console.log(`  Subjects: ${subjects.join(', ')}`);
    console.log(`  Sample records:`);
    skillsMasterV2.slice(0, 2).forEach(skill => {
      console.log(`    - Subject: ${skill.subject}, grade_level: ${skill.grade_level}`);
    });
  } else {
    console.log(`  ⚠️ No skills found for grade_level="${grade}"`);
  }

  // Get actual distinct values from both tables
  console.log('\n🔍 Checking actual grade values in tables:');
  
  // Check distinct grades in skills_master
  const { data: grades1 } = await supabase
    .from('skills_master')
    .select('grade')
    .limit(1000);
    
  if (grades1) {
    const uniqueGrades = [...new Set(grades1.map(g => g.grade))].filter(Boolean).sort();
    console.log(`  skills_master.grade values: ${uniqueGrades.slice(0, 15).join(', ')}${uniqueGrades.length > 15 ? '...' : ''}`);
  }

  // Check distinct grades in skills_master_v2
  const { data: grades2 } = await supabase
    .from('skills_master_v2')
    .select('grade_level')
    .limit(1000);
    
  if (grades2) {
    const uniqueGradeLevels = [...new Set(grades2.map(g => g.grade_level))].filter(Boolean).sort();
    console.log(`  skills_master_v2.grade_level values: ${uniqueGradeLevels.slice(0, 15).join(', ')}${uniqueGradeLevels.length > 15 ? '...' : ''}`);
  }
}

async function checkAllDemoUsers() {
  console.log('🚀 Checking Skills Availability for All Demo Users');
  console.log('=' + '='.repeat(60));
  
  for (const user of demoUsers) {
    await checkSkillsForUser(user.name, user.grade);
  }

  // Summary check
  console.log('\n\n📈 SUMMARY - Total Skills Count by Grade');
  console.log('=' + '='.repeat(60));
  
  for (const user of demoUsers) {
    const { count: count1 } = await supabase
      .from('skills_master')
      .select('*', { count: 'exact', head: true })
      .eq('grade', user.grade);
      
    const { count: count2 } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade_level', user.grade);
    
    console.log(`${user.name.padEnd(10)} (Grade ${user.grade.padEnd(2)}): skills_master=${count1 || 0}, skills_master_v2=${count2 || 0}`);
  }

  // Check column consistency
  console.log('\n\n🔧 COLUMN ANALYSIS');
  console.log('=' + '='.repeat(60));
  
  // Get sample data to analyze columns
  const { data: sample1 } = await supabase
    .from('skills_master')
    .select('*')
    .limit(1);
    
  const { data: sample2 } = await supabase
    .from('skills_master_v2')
    .select('*')
    .limit(1);
  
  if (sample1 && sample1[0]) {
    console.log('\nskills_master columns:', Object.keys(sample1[0]).join(', '));
  }
  
  if (sample2 && sample2[0]) {
    console.log('\nskills_master_v2 columns:', Object.keys(sample2[0]).join(', '));
  }
}

checkAllDemoUsers().catch(console.error);