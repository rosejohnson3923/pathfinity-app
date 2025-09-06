#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import chalk from 'chalk';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSkills() {
  console.log(chalk.blue('\n🔍 Checking Grade 10 Skills in skills_master_v2...\n'));

  // First, count total Grade 10 skills
  const { count, error: countError } = await supabase
    .from('skills_master_v2')
    .select('*', { count: 'exact', head: true })
    .eq('grade_level', '10');

  console.log(chalk.cyan(`Total Grade 10 skills in database: ${count || 0}`));

  // Get first 10 Grade 10 Math skills
  const { data: mathSkills, error: mathError } = await supabase
    .from('skills_master_v2')
    .select('id, skill_number, skill_name, skills_area, subject')
    .eq('grade_level', '10')
    .eq('subject', 'Math')
    .order('skill_number')
    .limit(10);

  if (mathSkills && mathSkills.length > 0) {
    console.log(chalk.green('\n✅ Found Grade 10 Math skills:'));
    mathSkills.forEach(skill => {
      console.log(`  ${chalk.cyan(skill.skill_number || 'N/A')}: ${skill.skill_name}`);
      if (skill.skill_number === 'A.1' || skill.skill_name.includes('integers')) {
        console.log(chalk.yellow(`    ^ This is the skill being displayed!`));
      }
    });
  } else {
    console.log(chalk.red('\n❌ No Grade 10 Math skills found'));
  }

  // Check specifically for any skill with "integers" in the name
  const { data: integerSkills, error: intError } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .ilike('skill_name', '%integer%')
    .limit(5);

  if (integerSkills && integerSkills.length > 0) {
    console.log(chalk.blue('\n📋 Skills with "integer" in name:'));
    integerSkills.forEach(skill => {
      console.log(`  ${chalk.cyan(skill.skill_number)}: ${skill.skill_name} (${skill.subject})`);
    });
  }

  // Check what Taylor would see - the first skill
  const { data: firstSkill, error: firstError } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .eq('subject', 'Math')
    .order('id')
    .limit(1);

  if (firstSkill && firstSkill.length > 0) {
    console.log(chalk.magenta('\n🎯 First skill Taylor would see (by ID):'));
    console.log(`  ID: ${firstSkill[0].id}`);
    console.log(`  Skill: ${firstSkill[0].skill_number}: ${firstSkill[0].skill_name}`);
    console.log(`  Area: ${firstSkill[0].skills_area}`);
  }

  // Count by subject
  console.log(chalk.blue('\n📊 Grade 10 skills by subject:'));
  const subjects = ['Math', 'Science', 'ELA', 'Social Studies', 'World Languages', 'Health'];
  
  for (const subject of subjects) {
    const { count: subCount } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade_level', '10')
      .eq('subject', subject);
    
    if (subCount > 0) {
      console.log(`  ${subject}: ${subCount} skills`);
    }
  }
}

checkSkills().catch(console.error);