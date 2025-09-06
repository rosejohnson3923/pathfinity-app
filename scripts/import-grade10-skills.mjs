#!/usr/bin/env node

/**
 * Import Grade 10 Skills from skillsDataComplete_Grade10.txt
 * Maps skills to skills_master_v2 table in database
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';
import chalk from 'chalk';

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

/**
 * Parse the Grade 10 skills file
 */
async function parseSkillsFile() {
  const filePath = join(PROJECT_ROOT, 'src/data/skillsDataComplete_Grade10.txt');
  const fileContent = await readFile(filePath, 'utf-8');
  const lines = fileContent.split('\n').filter(line => line.trim());
  
  const skills = [];
  const subjectCounts = {};
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = line.split('\t');
    if (parts.length >= 6) {
      const [subject, grade, skillsArea, skillCluster, skillNumber, skillName] = parts;
      
      // Only process Grade 10 skills
      if (grade === '10') {
        // Map subjects to include Algebra 1 and Pre-calculus
        let mappedSubjects = [subject];
        
        // If it's Math, check for specific areas
        if (subject === 'Math') {
          // Check if it's algebra-related
          if (skillsArea.toLowerCase().includes('algebra') || 
              skillName.toLowerCase().includes('algebra') ||
              skillsArea.toLowerCase().includes('equations') ||
              skillsArea.toLowerCase().includes('functions')) {
            mappedSubjects.push('Algebra 1');
          }
          
          // Check if it's pre-calculus related
          if (skillsArea.toLowerCase().includes('trigonometry') ||
              skillsArea.toLowerCase().includes('logarithm') ||
              skillsArea.toLowerCase().includes('exponential') ||
              skillsArea.toLowerCase().includes('polynomial') ||
              skillsArea.toLowerCase().includes('complex numbers')) {
            mappedSubjects.push('Pre-calculus');
          }
        }
        
        // Add skill for each mapped subject
        for (const mappedSubject of mappedSubjects) {
          // Generate a unique skill code
          const skillCode = `G10_${mappedSubject.replace(/[\s-]/g, '_')}_${skillNumber}`;
          
          skills.push({
            skill_number: skillNumber,
            skill_name: skillName,
            subject: mappedSubject,
            grade: '10',
            skills_area: skillsArea,
            skills_cluster: skillCluster,
            skill_description: `${skillName} - ${skillsArea}`,
            difficulty_level: determineDifficulty(skillsArea, skillName),
            is_active: true,
            estimated_time_minutes: 20,
            mastery_threshold: 80
          });
          
          // Count skills per subject
          subjectCounts[mappedSubject] = (subjectCounts[mappedSubject] || 0) + 1;
        }
      }
    }
  }
  
  return { skills, subjectCounts };
}

/**
 * Determine difficulty level based on skill area and name
 */
function determineDifficulty(skillsArea, skillName) {
  const area = skillsArea.toLowerCase();
  const name = skillName.toLowerCase();
  
  // Advanced topics = difficulty 5
  if (area.includes('calculus') || area.includes('advanced') || 
      name.includes('complex') || name.includes('advanced')) {
    return 5;
  }
  
  // Intermediate topics = difficulty 4
  if (area.includes('trigonometry') || area.includes('logarithm') ||
      area.includes('polynomial') || area.includes('statistics')) {
    return 4;
  }
  
  // Standard algebra/geometry = difficulty 3
  if (area.includes('algebra') || area.includes('geometry') ||
      area.includes('functions') || area.includes('equations')) {
    return 3;
  }
  
  // Basic topics = difficulty 2
  if (area.includes('foundations') || area.includes('basic') ||
      name.includes('identify') || name.includes('compare')) {
    return 2;
  }
  
  // Default
  return 3;
}

/**
 * Import skills to database
 */
async function importToDatabase(skills) {
  console.log(chalk.blue(`\nImporting ${skills.length} Grade 10 skills...`));
  
  const batchSize = 50;
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < skills.length; i += batchSize) {
    const batch = skills.slice(i, i + batchSize);
    
    try {
      const { data, error } = await supabase
        .from('skills_master_v2')
        .insert(batch);
      
      if (error) {
        console.error(chalk.red(`Error in batch ${Math.floor(i/batchSize) + 1}: ${error.message}`));
        errorCount += batch.length;
      } else {
        successCount += batch.length;
        console.log(chalk.gray(`  Imported skills ${i + 1} to ${Math.min(i + batchSize, skills.length)}`));
      }
    } catch (err) {
      console.error(chalk.red(`Exception in batch ${Math.floor(i/batchSize) + 1}: ${err.message}`));
      errorCount += batch.length;
    }
  }
  
  return { successCount, errorCount };
}

/**
 * Verify import
 */
async function verifyImport() {
  console.log(chalk.blue('\n📊 Verifying import...'));
  
  // Get total count
  const { count: totalCount } = await supabase
    .from('skills_master_v2')
    .select('*', { count: 'exact', head: true })
    .eq('grade', '10');
  
  console.log(chalk.green(`  Total Grade 10 skills in database: ${totalCount}`));
  
  // Get counts by subject
  const { data: skills } = await supabase
    .from('skills_master_v2')
    .select('subject')
    .eq('grade', '10');
  
  if (skills) {
    const subjectCounts = {};
    skills.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    });
    
    console.log(chalk.blue('\n  Skills by subject:'));
    Object.entries(subjectCounts).sort().forEach(([subject, count]) => {
      console.log(chalk.gray(`    ${subject}: ${count} skills`));
    });
  }
  
  // Sample skills
  const { data: sampleSkills } = await supabase
    .from('skills_master_v2')
    .select('skill_code, skill_name, subject')
    .eq('grade', '10')
    .limit(5);
  
  if (sampleSkills && sampleSkills.length > 0) {
    console.log(chalk.blue('\n  Sample imported skills:'));
    sampleSkills.forEach(skill => {
      console.log(chalk.gray(`    ${skill.skill_code}: ${skill.skill_name} (${skill.subject})`));
    });
  }
}

/**
 * Main execution
 */
async function main() {
  console.log(chalk.bold.blue('🚀 Grade 10 Skills Import'));
  console.log(chalk.gray(`   Source: skillsDataComplete_Grade10.txt`));
  
  try {
    // Parse the skills file
    const { skills, subjectCounts } = await parseSkillsFile();
    console.log(chalk.green(`\n✅ Parsed ${skills.length} skills`));
    
    console.log(chalk.blue('\n  Skills to import by subject:'));
    Object.entries(subjectCounts).sort().forEach(([subject, count]) => {
      console.log(chalk.gray(`    ${subject}: ${count} skills`));
    });
    
    // Check if skills already exist
    const { count: existingCount } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10');
    
    if (existingCount > 0) {
      console.log(chalk.yellow(`\n⚠️ Found ${existingCount} existing Grade 10 skills`));
      console.log(chalk.yellow('  These will be updated/replaced'));
    }
    
    // Import to database
    const { successCount, errorCount } = await importToDatabase(skills);
    
    console.log(chalk.blue('\n📊 Import Summary:'));
    console.log(chalk.green(`  ✅ Successfully imported: ${successCount}`));
    if (errorCount > 0) {
      console.log(chalk.red(`  ❌ Failed: ${errorCount}`));
    }
    
    // Verify the import
    await verifyImport();
    
    console.log(chalk.bold.green('\n✨ Grade 10 skills import completed!'));
    console.log(chalk.blue('\nNext steps:'));
    console.log(chalk.gray('  1. Run comprehensive tests: npm run test:taylor'));
    console.log(chalk.gray('  2. Update services to use database'));
    console.log(chalk.gray('  3. Deploy to production'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error);
    process.exit(1);
  }
}

// Run the import
main();