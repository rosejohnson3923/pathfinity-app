/**
 * Script to optimize skills in the database for YouTube searching
 * Run this to process existing skills and when new grades are added
 *
 * Usage:
 *   npx ts-node src/scripts/optimizeSkills.ts [grades]
 *
 * Examples:
 *   npx ts-node src/scripts/optimizeSkills.ts          # Process all skills
 *   npx ts-node src/scripts/optimizeSkills.ts K 1      # Process only K and 1
 *   npx ts-node src/scripts/optimizeSkills.ts 10       # Process only grade 10
 */

import { SkillOptimizationService } from '../services/SkillOptimizationService';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Validate environment
if (!process.env.VITE_SUPABASE_URL || !process.env.VITE_SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables');
  console.error('   Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in .env.local');
  process.exit(1);
}

async function main() {
  console.log('🚀 Starting Skill Optimization Process\n');

  // Get grades from command line arguments
  const grades = process.argv.slice(2);

  if (grades.length > 0) {
    console.log(`📚 Processing grades: ${grades.join(', ')}\n`);
  } else {
    console.log('📚 Processing all grades in database\n');
  }

  try {
    // First, let's test with a single skill to show the transformation
    console.log('📝 Example Optimization:');
    console.log('------------------------');

    const example = SkillOptimizationService.optimizeSkill(
      "Determine the main idea of a passage",
      "ELA",
      "10"
    );

    console.log('Original:', example.original_skill_name);
    console.log('Optimized:', example.youtube_search_terms);
    console.log('Key Terms:', example.simplified_terms);
    console.log('Grade Query:', example.grade_appropriate_query);
    console.log('\n');

    // Process skills in database
    console.log('💾 Processing skills in database...\n');

    const results = await SkillOptimizationService.optimizeSkillsInDatabase(
      grades.length > 0 ? grades : undefined
    );

    // Display results
    console.log('\n📊 Final Results:');
    console.log('================');
    console.log(`✅ Processed: ${results.processed} skills`);
    console.log(`💾 Updated: ${results.updated} skills`);
    console.log(`❌ Errors: ${results.errors.length}`);

    if (results.errors.length > 0) {
      console.log('\n⚠️ Errors encountered:');
      results.errors.forEach(error => {
        console.log(`   - ${error}`);
      });
    }

    // Generate migration SQL for database admin
    if (process.argv.includes('--sql')) {
      console.log('\n📄 SQL Migration Script:');
      console.log('=======================');
      const sql = await SkillOptimizationService.generateMigrationSQL();
      console.log(sql);
    }

    console.log('\n✨ Optimization complete!');

  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);