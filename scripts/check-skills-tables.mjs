#!/usr/bin/env node

/**
 * Check and compare skills_master vs skills_master_v2 tables
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

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function checkSkillsTables() {
  console.log(chalk.bold.blue('\n📊 Skills Tables Comparison\n'));
  
  // Check skills_master (original)
  console.log(chalk.yellow('skills_master (Original Table):'));
  try {
    // Get unique grades
    const { data: grades } = await supabase
      .from('skills_master')
      .select('grade')
      .order('grade');
    
    const uniqueGrades = [...new Set(grades?.map(g => g.grade) || [])];
    console.log(chalk.green(`  Grades: ${uniqueGrades.join(', ')}`));
    
    // Get counts by grade
    const gradeCounts = {};
    for (const grade of uniqueGrades) {
      const { count } = await supabase
        .from('skills_master')
        .select('*', { count: 'exact', head: true })
        .eq('grade', grade);
      gradeCounts[grade] = count;
    }
    
    console.log(chalk.blue('  Skills by grade:'));
    Object.entries(gradeCounts).forEach(([grade, count]) => {
      console.log(chalk.gray(`    Grade ${grade}: ${count} skills`));
    });
    
    // Get total count
    const { count: totalCount } = await supabase
      .from('skills_master')
      .select('*', { count: 'exact', head: true });
    console.log(chalk.green(`  Total: ${totalCount} skills`));
    
    // Get unique subjects
    const { data: subjects } = await supabase
      .from('skills_master')
      .select('subject')
      .order('subject');
    
    const uniqueSubjects = [...new Set(subjects?.map(s => s.subject) || [])];
    console.log(chalk.green(`  Subjects: ${uniqueSubjects.join(', ')}`));
    
  } catch (error) {
    console.log(chalk.red(`  Error: ${error.message}`));
  }
  
  // Check skills_master_v2 (new)
  console.log(chalk.yellow('\nskills_master_v2 (New Table):'));
  try {
    // Get unique grades
    const { data: grades } = await supabase
      .from('skills_master_v2')
      .select('grade')
      .order('grade');
    
    const uniqueGrades = [...new Set(grades?.map(g => g.grade) || [])];
    console.log(chalk.green(`  Grades: ${uniqueGrades.join(', ')}`));
    
    // Get counts by grade
    const gradeCounts = {};
    for (const grade of uniqueGrades) {
      const { count } = await supabase
        .from('skills_master_v2')
        .select('*', { count: 'exact', head: true })
        .eq('grade', grade);
      gradeCounts[grade] = count;
    }
    
    console.log(chalk.blue('  Skills by grade:'));
    Object.entries(gradeCounts).forEach(([grade, count]) => {
      console.log(chalk.gray(`    Grade ${grade}: ${count} skills`));
    });
    
    // Get total count
    const { count: totalCount } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true });
    console.log(chalk.green(`  Total: ${totalCount} skills`));
    
    // Get unique subjects
    const { data: subjects } = await supabase
      .from('skills_master_v2')
      .select('subject')
      .order('subject');
    
    const uniqueSubjects = [...new Set(subjects?.map(s => s.subject) || [])];
    console.log(chalk.green(`  Subjects: ${uniqueSubjects.join(', ')}`));
    
  } catch (error) {
    console.log(chalk.red(`  Error: ${error.message}`));
  }
  
  // Check for Grade 10 specifically
  console.log(chalk.bold.yellow('\n📚 Grade 10 Analysis:'));
  
  // Grade 10 in skills_master
  try {
    const { count: g10Count } = await supabase
      .from('skills_master')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10');
    
    console.log(chalk.blue('  skills_master:'));
    console.log(chalk.gray(`    Grade 10 skills: ${g10Count || 0}`));
    
    if (g10Count > 0) {
      // Get subjects for Grade 10
      const { data: g10Subjects } = await supabase
        .from('skills_master')
        .select('subject')
        .eq('grade', '10');
      
      const subjectCounts = {};
      g10Subjects?.forEach(s => {
        subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      });
      
      Object.entries(subjectCounts).forEach(([subject, count]) => {
        console.log(chalk.gray(`      ${subject}: ${count} skills`));
      });
    }
  } catch (error) {
    console.log(chalk.red(`    Error: ${error.message}`));
  }
  
  // Grade 10 in skills_master_v2
  try {
    const { count: g10Count } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10');
    
    console.log(chalk.blue('  skills_master_v2:'));
    console.log(chalk.gray(`    Grade 10 skills: ${g10Count || 0}`));
    
    if (g10Count > 0) {
      // Get subjects for Grade 10
      const { data: g10Subjects } = await supabase
        .from('skills_master_v2')
        .select('subject')
        .eq('grade', '10');
      
      const subjectCounts = {};
      g10Subjects?.forEach(s => {
        subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
      });
      
      Object.entries(subjectCounts).forEach(([subject, count]) => {
        console.log(chalk.gray(`      ${subject}: ${count} skills`));
      });
    }
  } catch (error) {
    console.log(chalk.red(`    Error: ${error.message}`));
  }
  
  // Recommendations
  console.log(chalk.bold.blue('\n💡 Recommendations:'));
  console.log(chalk.cyan('  1. The original skills_master has Grade 10 data already'));
  console.log(chalk.cyan('  2. Consider using skills_master for existing grades'));
  console.log(chalk.cyan('  3. Use skills_master_v2 for new features like:'));
  console.log(chalk.gray('     - Question type associations'));
  console.log(chalk.gray('     - Common Core alignment'));
  console.log(chalk.gray('     - Extended metadata'));
  console.log(chalk.cyan('  4. May need to migrate existing Grade 10 data or choose one table'));
}

checkSkillsTables().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});