#!/usr/bin/env node

/**
 * Check the status of imported data in the database
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Load environment variables
config({ path: join(PROJECT_ROOT, '.env.local') });
config({ path: join(PROJECT_ROOT, '.env.development') });

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function checkDataStatus() {
  console.log(chalk.bold.blue('\n📊 Database Data Status Check\n'));
  
  // Check question type definitions
  console.log(chalk.yellow('Question Type Definitions:'));
  try {
    const { data: questionTypes, error } = await supabase
      .from('question_type_definitions')
      .select('id, name, priority')
      .order('priority');
    
    if (error) throw error;
    
    if (questionTypes && questionTypes.length > 0) {
      console.log(chalk.green(`  ✅ ${questionTypes.length} question types found`));
      questionTypes.slice(0, 5).forEach(qt => {
        console.log(chalk.gray(`     - ${qt.name} (priority: ${qt.priority})`));
      });
      if (questionTypes.length > 5) {
        console.log(chalk.gray(`     ... and ${questionTypes.length - 5} more`));
      }
    } else {
      console.log(chalk.red('  ❌ No question types found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Check detection rules
  console.log(chalk.yellow('\nDetection Rules:'));
  try {
    const { data: rules, count } = await supabase
      .from('detection_rules')
      .select('*', { count: 'exact', head: false })
      .order('priority')
      .limit(5);
    
    if (rules && rules.length > 0) {
      console.log(chalk.green(`  ✅ ${count} detection rules found`));
      rules.forEach(rule => {
        console.log(chalk.gray(`     - Pattern: "${rule.pattern}" → ${rule.type_id} (priority: ${rule.priority})`));
      });
      if (count > 5) {
        console.log(chalk.gray(`     ... and ${count - 5} more`));
      }
    } else {
      console.log(chalk.red('  ❌ No detection rules found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Check grade configurations
  console.log(chalk.yellow('\nGrade Configurations:'));
  try {
    const { data: grades, count } = await supabase
      .from('grade_configurations')
      .select('*', { count: 'exact', head: false })
      .order('grade_order')
      .limit(3);
    
    if (grades && grades.length > 0) {
      console.log(chalk.green(`  ✅ ${count} grades configured`));
      grades.forEach(grade => {
        console.log(chalk.gray(`     - Grade ${grade.grade}: ${grade.display_name}`));
      });
      if (count > 3) {
        console.log(chalk.gray(`     ... and ${count - 3} more`));
      }
    } else {
      console.log(chalk.red('  ❌ No grade configurations found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Check Common Core standards
  console.log(chalk.yellow('\nCommon Core Standards:'));
  try {
    const { data: standards, count } = await supabase
      .from('common_core_standards')
      .select('*', { count: 'exact', head: false })
      .limit(5);
    
    if (standards && standards.length > 0) {
      console.log(chalk.green(`  ✅ ${count} Common Core standards found`));
      standards.forEach(std => {
        console.log(chalk.gray(`     - ${std.common_core_id}: ${std.skill_name} (Grade ${std.grade})`));
      });
      if (count > 5) {
        console.log(chalk.gray(`     ... and ${count - 5} more`));
      }
    } else {
      console.log(chalk.red('  ❌ No Common Core standards found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Check career paths
  console.log(chalk.yellow('\nCareer Paths:'));
  try {
    const { data: careers, count } = await supabase
      .from('career_paths')
      .select('*', { count: 'exact', head: false })
      .limit(5);
    
    if (careers && careers.length > 0) {
      console.log(chalk.green(`  ✅ ${count} career paths found`));
      careers.forEach(career => {
        console.log(chalk.gray(`     - ${career.career_name} (${career.career_category})`));
      });
      if (count > 5) {
        console.log(chalk.gray(`     ... and ${count - 5} more`));
      }
    } else {
      console.log(chalk.red('  ❌ No career paths found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Check skills_master_v2 (Grade 10)
  console.log(chalk.yellow('\nGrade 10 Skills:'));
  try {
    const { data: skills, count } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: false })
      .eq('grade', '10')
      .limit(5);
    
    if (skills && skills.length > 0) {
      console.log(chalk.green(`  ✅ ${count} Grade 10 skills found`));
      
      // Get counts by subject
      const { data: subjectCounts } = await supabase
        .from('skills_master_v2')
        .select('subject')
        .eq('grade', '10');
      
      if (subjectCounts) {
        const counts = {};
        subjectCounts.forEach(s => {
          counts[s.subject] = (counts[s.subject] || 0) + 1;
        });
        Object.entries(counts).forEach(([subject, count]) => {
          console.log(chalk.gray(`     - ${subject}: ${count} skills`));
        });
      }
    } else {
      console.log(chalk.red('  ❌ No Grade 10 skills found'));
    }
  } catch (error) {
    console.log(chalk.red(`  ❌ Error: ${error.message}`));
  }
  
  // Summary
  console.log(chalk.bold.blue('\n📋 Summary:'));
  
  const checks = [];
  
  // Question types check
  try {
    const { count: qtCount } = await supabase
      .from('question_type_definitions')
      .select('*', { count: 'exact', head: true });
    checks.push({ name: 'Question Types', expected: 15, actual: qtCount || 0 });
  } catch (e) {
    checks.push({ name: 'Question Types', expected: 15, actual: 0 });
  }
  
  // Detection rules check
  try {
    const { count: drCount } = await supabase
      .from('detection_rules')
      .select('*', { count: 'exact', head: true });
    checks.push({ name: 'Detection Rules', expected: '25+', actual: drCount || 0 });
  } catch (e) {
    checks.push({ name: 'Detection Rules', expected: '25+', actual: 0 });
  }
  
  // Common Core check
  try {
    const { count: ccCount } = await supabase
      .from('common_core_standards')
      .select('*', { count: 'exact', head: true });
    checks.push({ name: 'Common Core Standards', expected: '300+', actual: ccCount || 0 });
  } catch (e) {
    checks.push({ name: 'Common Core Standards', expected: '300+', actual: 0 });
  }
  
  // Career paths check
  try {
    const { count: cpCount } = await supabase
      .from('career_paths')
      .select('*', { count: 'exact', head: true });
    checks.push({ name: 'Career Paths', expected: 10, actual: cpCount || 0 });
  } catch (e) {
    checks.push({ name: 'Career Paths', expected: 10, actual: 0 });
  }
  
  // Grade 10 skills check
  try {
    const { count: g10Count } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10');
    checks.push({ name: 'Grade 10 Skills', expected: '966+', actual: g10Count || 0 });
  } catch (e) {
    checks.push({ name: 'Grade 10 Skills', expected: '966+', actual: 0 });
  }
  
  checks.forEach(check => {
    const status = check.actual > 0 ? chalk.green('✅') : chalk.red('❌');
    const actualStr = check.actual > 0 ? chalk.green(check.actual) : chalk.red(check.actual);
    console.log(`  ${status} ${check.name}: ${actualStr} / ${check.expected}`);
  });
  
  // Next steps
  console.log(chalk.bold.blue('\n📝 Next Steps:'));
  
  const missingData = checks.filter(c => c.actual === 0);
  if (missingData.length > 0) {
    console.log(chalk.yellow('  Missing data detected. Run these commands:'));
    
    if (missingData.find(c => c.name === 'Question Types' || c.name === 'Detection Rules')) {
      console.log(chalk.cyan('  1. Import question types: npm run import:question-types'));
    }
    if (missingData.find(c => c.name === 'Common Core Standards')) {
      console.log(chalk.cyan('  2. Import Common Core: npm run import:common-core'));
    }
    if (missingData.find(c => c.name === 'Grade 10 Skills')) {
      console.log(chalk.cyan('  3. Import Grade 10 skills: npm run import:grade10-skills'));
    }
  } else {
    console.log(chalk.green('  ✅ All data is loaded! Ready to proceed with Phase 6: Service Updates'));
  }
}

checkDataStatus().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});