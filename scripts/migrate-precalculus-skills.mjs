#!/usr/bin/env node

/**
 * Migrate Precalculus skills from skills_master to skills_master_v2
 * Also migrate any missing Algebra1 skills
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

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error(chalk.red('❌ Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function migrateSkills() {
  console.log(chalk.bold.blue('🚀 Migrating Precalculus and Algebra1 Skills to skills_master_v2\n'));
  
  try {
    // Get Precalculus skills from skills_master
    console.log(chalk.yellow('Fetching Precalculus skills from skills_master...'));
    const { data: precalcSkills, error: precalcError } = await supabase
      .from('skills_master')
      .select('*')
      .eq('grade', '10')
      .eq('subject', 'Precalculus');
    
    if (precalcError) throw precalcError;
    console.log(chalk.green(`  Found ${precalcSkills?.length || 0} Precalculus skills`));
    
    // Get Algebra1 skills from skills_master
    console.log(chalk.yellow('\nFetching Algebra1 skills from skills_master...'));
    const { data: algebraSkills, error: algebraError } = await supabase
      .from('skills_master')
      .select('*')
      .eq('grade', '10')
      .eq('subject', 'Algebra1');
    
    if (algebraError) throw algebraError;
    console.log(chalk.green(`  Found ${algebraSkills?.length || 0} Algebra1 skills`));
    
    // Transform skills for skills_master_v2
    console.log(chalk.blue('\nTransforming skills for skills_master_v2...'));
    
    const transformSkill = (skill) => ({
      subject: skill.subject === 'Algebra1' ? 'Algebra 1' : skill.subject, // Normalize name
      grade: skill.grade,
      skills_area: skill.skills_area,
      skills_cluster: skill.skills_cluster || skill.skill_cluster || 'General',
      skill_number: skill.skill_number,
      skill_name: skill.skill_name,
      skill_description: skill.skill_description || `${skill.skill_name} - ${skill.skills_area}`,
      difficulty_level: skill.difficulty_level || 3,
      estimated_time_minutes: skill.estimated_time_minutes || 20,
      mastery_threshold: 80,
      prerequisites: skill.prerequisites || [],
      is_active: true,
      source_file: 'Migrated from skills_master',
      import_date: new Date().toISOString()
    });
    
    const precalcTransformed = (precalcSkills || []).map(transformSkill);
    const algebraTransformed = (algebraSkills || []).map(transformSkill);
    
    console.log(chalk.gray(`  Transformed ${precalcTransformed.length} Precalculus skills`));
    console.log(chalk.gray(`  Transformed ${algebraTransformed.length} Algebra 1 skills`));
    
    // Check existing skills in skills_master_v2 to avoid duplicates
    console.log(chalk.yellow('\nChecking existing skills in skills_master_v2...'));
    
    const { count: existingAlgebra } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10')
      .eq('subject', 'Algebra 1');
    
    const { count: existingPrecalc } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10')
      .eq('subject', 'Precalculus');
    
    console.log(chalk.gray(`  Existing Algebra 1: ${existingAlgebra || 0} skills`));
    console.log(chalk.gray(`  Existing Precalculus: ${existingPrecalc || 0} skills`));
    
    // Insert skills in batches
    const batchSize = 50;
    let successCount = 0;
    let errorCount = 0;
    
    // Insert Precalculus skills
    if (precalcTransformed.length > 0) {
      console.log(chalk.blue('\nInserting Precalculus skills...'));
      for (let i = 0; i < precalcTransformed.length; i += batchSize) {
        const batch = precalcTransformed.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from('skills_master_v2')
            .insert(batch);
          
          if (error) {
            console.error(chalk.red(`  Error in batch: ${error.message}`));
            errorCount += batch.length;
          } else {
            successCount += batch.length;
            console.log(chalk.gray(`  Inserted Precalculus skills ${i + 1} to ${Math.min(i + batchSize, precalcTransformed.length)}`));
          }
        } catch (err) {
          console.error(chalk.red(`  Exception: ${err.message}`));
          errorCount += batch.length;
        }
      }
    }
    
    // Insert Algebra1 skills (skip if we already have some)
    if (algebraTransformed.length > 0 && existingAlgebra < 10) {
      console.log(chalk.blue('\nInserting Algebra 1 skills...'));
      for (let i = 0; i < algebraTransformed.length; i += batchSize) {
        const batch = algebraTransformed.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from('skills_master_v2')
            .insert(batch);
          
          if (error) {
            console.error(chalk.red(`  Error in batch: ${error.message}`));
            errorCount += batch.length;
          } else {
            successCount += batch.length;
            console.log(chalk.gray(`  Inserted Algebra 1 skills ${i + 1} to ${Math.min(i + batchSize, algebraTransformed.length)}`));
          }
        } catch (err) {
          console.error(chalk.red(`  Exception: ${err.message}`));
          errorCount += batch.length;
        }
      }
    }
    
    // Final verification
    console.log(chalk.blue('\n📊 Verifying final state...'));
    
    const { data: finalSubjects } = await supabase
      .from('skills_master_v2')
      .select('subject')
      .eq('grade', '10');
    
    const subjectCounts = {};
    finalSubjects?.forEach(s => {
      subjectCounts[s.subject] = (subjectCounts[s.subject] || 0) + 1;
    });
    
    console.log(chalk.green('  Grade 10 skills in skills_master_v2:'));
    Object.entries(subjectCounts).sort().forEach(([subject, count]) => {
      const emoji = subject === 'Precalculus' ? '✅' : 
                    subject === 'Algebra 1' && count > 1 ? '✅' : '';
      console.log(chalk.gray(`    ${subject}: ${count} skills ${emoji}`));
    });
    
    // Summary
    console.log(chalk.bold.blue('\n📋 Migration Summary:'));
    console.log(chalk.green(`  ✅ Successfully migrated: ${successCount} skills`));
    if (errorCount > 0) {
      console.log(chalk.red(`  ❌ Failed: ${errorCount} skills`));
    }
    
    const { count: totalCount } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true })
      .eq('grade', '10');
    
    console.log(chalk.bold.green(`\n✨ Total Grade 10 skills in skills_master_v2: ${totalCount}`));
    
    // Check if we have all 6 subjects Taylor needs
    const requiredSubjects = ['Math', 'ELA', 'Science', 'Social Studies', 'Algebra 1', 'Precalculus'];
    const missingSubjects = requiredSubjects.filter(s => !subjectCounts[s] || subjectCounts[s] === 0);
    
    if (missingSubjects.length === 0) {
      console.log(chalk.bold.green('\n🎉 SUCCESS! All 6 subjects for Taylor (Grade 10) are now available!'));
    } else {
      console.log(chalk.yellow(`\n⚠️ Missing subjects: ${missingSubjects.join(', ')}`));
    }
    
  } catch (error) {
    console.error(chalk.red('\n❌ Fatal error:'), error);
    process.exit(1);
  }
}

// Run the migration
migrateSkills();