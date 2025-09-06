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

async function checkAndFixSkill() {
  console.log(chalk.blue('\n🔍 Finding the actual Grade 10 Math A.1 skill...\n'));

  // Look for A.1 specifically
  const { data: a1Skills, error: a1Error } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .eq('subject', 'Math')
    .eq('skill_number', 'A.1');

  if (a1Skills && a1Skills.length > 0) {
    console.log(chalk.yellow('Found skill A.1:'));
    const skill = a1Skills[0];
    console.log(`  ID: ${skill.id}`);
    console.log(`  Current Name: "${skill.skill_name}"`);
    console.log(`  Expected Name: "Compare and order integers"`);
    
    if (skill.skill_name !== 'Compare and order integers') {
      console.log(chalk.red('\n❌ Skill name is WRONG! Fixing...'));
      
      const { error: updateError } = await supabase
        .from('skills_master_v2')
        .update({ 
          skill_name: 'Compare and order integers'
        })
        .eq('id', skill.id);
      
      if (updateError) {
        console.log(chalk.red('Error updating:', updateError.message));
      } else {
        console.log(chalk.green('✅ Fixed! Updated to "Compare and order integers"'));
      }
    } else {
      console.log(chalk.green('\n✅ Skill name is already correct!'));
    }
  } else {
    console.log(chalk.red('No skill found with skill_number A.1'));
    
    // Let's check what skills start with A.
    const { data: aSkills, error: aError } = await supabase
      .from('skills_master_v2')
      .select('skill_number, skill_name')
      .eq('grade_level', '10')
      .eq('subject', 'Math')
      .ilike('skill_number', 'A.%')
      .order('skill_number')
      .limit(10);
    
    if (aSkills && aSkills.length > 0) {
      console.log(chalk.blue('\nSkills starting with A.:'));
      aSkills.forEach(s => {
        console.log(`  ${s.skill_number}: ${s.skill_name}`);
      });
    }
  }

  // Also check what Taylor actually sees (first Math skill by ID)
  const { data: firstMath, error: firstError } = await supabase
    .from('skills_master_v2')
    .select('*')
    .eq('grade_level', '10')
    .eq('subject', 'Math')
    .order('id', { ascending: true })
    .limit(1);

  if (firstMath && firstMath.length > 0) {
    console.log(chalk.magenta('\n🎯 First Math skill (what Taylor sees):'));
    console.log(`  ${firstMath[0].skill_number}: ${firstMath[0].skill_name}`);
    
    if (firstMath[0].skill_name.includes('Add, subtract, multiply, and divide')) {
      console.log(chalk.red('  ^ This is the WRONG skill showing!'));
      console.log(chalk.blue('  Updating to correct skill...'));
      
      const { error: fixError } = await supabase
        .from('skills_master_v2')
        .update({
          skill_name: 'Compare and order integers',
          skill_number: 'A.1'
        })
        .eq('id', firstMath[0].id);
      
      if (!fixError) {
        console.log(chalk.green('  ✅ Fixed!'));
      }
    }
  }
}

checkAndFixSkill().catch(console.error);