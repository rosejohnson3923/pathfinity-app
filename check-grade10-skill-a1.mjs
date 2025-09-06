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
  console.log(chalk.blue('\n🔍 Checking Grade 10 Math Skill A.1...\n'));

  // Check if A.1 exists with correct name
  const { data: correctSkill, error: error1 } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .eq('skill_number', 'A.1')
    .eq('subject', 'Math');

  if (correctSkill && correctSkill.length > 0) {
    console.log(chalk.green('✅ Found skill A.1:'));
    console.log(JSON.stringify(correctSkill[0], null, 2));
  } else {
    console.log(chalk.yellow('⚠️ No skill found with skill_number = A.1'));
  }

  // Check for the wrong skill name
  const { data: wrongSkill, error: error2 } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .ilike('skill_name', '%Add, subtract, multiply, and divide integers%')
    .eq('subject', 'Math');

  if (wrongSkill && wrongSkill.length > 0) {
    console.log(chalk.red('\n❌ Found skill with WRONG name:'));
    console.log(JSON.stringify(wrongSkill[0], null, 2));
    console.log(chalk.yellow('\nThis needs to be updated!'));
    
    // Fix it
    console.log(chalk.blue('\n🔧 Fixing the skill name...'));
    const { data: updated, error: updateError } = await supabase
      .from('skills_master_v2')
      .update({ 
        skill_name: 'Compare and order integers',
        skill_number: 'A.1',
        skills_area: 'Math Foundations'
      })
      .eq('id', wrongSkill[0].id);
    
    if (updateError) {
      console.log(chalk.red('Error updating:', updateError.message));
    } else {
      console.log(chalk.green('✅ Fixed! Skill updated to: "Compare and order integers"'));
    }
  } else {
    console.log(chalk.gray('\nNo skill found with the wrong name.'));
  }

  // Check first 5 Grade 10 Math skills
  console.log(chalk.blue('\n📋 First 5 Grade 10 Math skills in database:\n'));
  const { data: firstFive, error: error3 } = await supabase
    .from('skills_master_v2')
    .select('skill_number, skill_name, skills_area')
    .eq('grade_level', '10')
    .eq('subject', 'Math')
    .order('skill_number')
    .limit(5);

  if (firstFive) {
    firstFive.forEach(skill => {
      console.log(`${chalk.cyan(skill.skill_number)}: ${skill.skill_name} (${skill.skills_area})`);
    });
  }

  // Check if we have the correct data from our source file
  console.log(chalk.blue('\n📄 Expected Grade 10 Math skills (from source):\n'));
  console.log('A.1: Compare and order integers');
  console.log('A.2: Add and subtract integers');  
  console.log('A.3: Multiply and divide integers');
  console.log('A.4: Add and subtract positive and negative decimals');
  console.log('A.5: Add and subtract positive and negative fractions');
}

checkSkills().catch(console.error);