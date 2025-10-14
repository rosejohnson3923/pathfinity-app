/**
 * Generate Production Career Bingo Clues
 *
 * Generates age-appropriate clues using OpenAI for all active careers
 * - Elementary (K-5): 10 clues per career (5-7 words, simple vocabulary)
 * - Middle (6-8): 10 clues per career (10-15 words, technical terms)
 * - High (9-12): 10 clues per career (varied length, complex concepts)
 *
 * Uses CareerBingoClueGenerator which enforces language constraints from:
 * src/services/ai-prompts/rules/UniversalContentRules.ts
 *
 * Usage:
 *   npx tsx scripts/generate-production-clues.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables FIRST before any imports
dotenv.config();

// Now we can safely import services that depend on env vars
import { generateCareerClues } from '../src/services/CareerBingoClueGenerator';
import type { CareerClueGenerationRequest } from '../src/services/CareerBingoClueGenerator';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CLUES_PER_CAREER_PER_GRADE = 10;
const GRADE_CATEGORIES: Array<'elementary' | 'middle' | 'high'> = ['elementary', 'middle', 'high'];

interface Career {
  career_code: string;
  career_name: string;
}

/**
 * Get active careers from database
 */
async function getActiveCareers(): Promise<Career[]> {
  const { data, error } = await supabase
    .from('career_paths')
    .select('career_code, career_name')
    .eq('is_active', true)
    .order('career_name');

  if (error) throw new Error(`Failed to fetch careers: ${error.message}`);
  return data || [];
}

/**
 * Check existing clue count
 */
async function getExistingClueCount(careerCode: string, gradeCategory: string): Promise<number> {
  const { count, error } = await supabase
    .from('dl_clues')
    .select('*', { count: 'exact', head: true })
    .eq('career_code', careerCode)
    .eq('grade_category', gradeCategory);

  return count || 0;
}

/**
 * Insert generated clues into database
 */
async function insertClues(careerCode: string, gradeCategory: string, clues: any[]): Promise<void> {
  const records = clues.map(clue => ({
    career_code: careerCode,
    clue_text: clue.clueText,
    skill_connection: clue.skillConnection,
    difficulty: clue.difficulty,
    grade_category: gradeCategory,
    min_play_count: clue.minPlayCount,
    distractor_careers: clue.distractorCareers || [],
    is_active: true,
    times_shown: 0,
    times_correct: 0,
  }));

  const { error } = await supabase.from('dl_clues').insert(records);
  if (error) throw new Error(`Failed to insert clues: ${error.message}`);
}

/**
 * Main generation function
 */
async function main() {
  console.log('🚀 Career Bingo Production Clue Generator\n');
  console.log('Using age-appropriate language constraints from:');
  console.log('  src/services/ai-prompts/rules/UniversalContentRules.ts\n');
  console.log(`Configuration:
  - Elementary (K-5): 5-7 words, simple vocabulary
  - Middle (6-8): 10-15 words, technical terms
  - High (9-12): Varied length, complex concepts
  - Clues per career per grade: ${CLUES_PER_CAREER_PER_GRADE}
\n`);

  const careers = await getActiveCareers();
  console.log(`📚 Found ${careers.length} active careers\n`);

  let totalGenerated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

  // Process each career
  for (let i = 0; i < careers.length; i++) {
    const career = careers[i];
    console.log(`\n[${i + 1}/${careers.length}] 🎯 ${career.career_name} (${career.career_code})`);

    // Generate for each grade category
    for (const gradeCategory of GRADE_CATEGORIES) {
      const existing = await getExistingClueCount(career.career_code, gradeCategory);

      if (existing >= CLUES_PER_CAREER_PER_GRADE) {
        console.log(`  ⏭️  ${gradeCategory}: ${existing} clues exist (skipping)`);
        totalSkipped++;
        continue;
      }

      try {
        console.log(`  🤖 ${gradeCategory}: Generating ${CLUES_PER_CAREER_PER_GRADE} clues...`);

        const request: CareerClueGenerationRequest = {
          careerCode: career.career_code,
          careerName: career.career_name,
          gradeCategory,
          count: CLUES_PER_CAREER_PER_GRADE,
        };

        const clues = await generateCareerClues(request);
        await insertClues(career.career_code, gradeCategory, clues);

        console.log(`  ✅ ${gradeCategory}: Inserted ${clues.length} clues`);
        totalGenerated++;

        // Rate limit: wait 1 second between API calls
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`  ❌ ${gradeCategory}: ${error instanceof Error ? error.message : error}`);
        totalFailed++;
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Generation Complete!\n');
  console.log(`✅ Successfully generated: ${totalGenerated} career/grade combinations`);
  console.log(`⏭️  Skipped (already exist): ${totalSkipped}`);
  console.log(`❌ Failed: ${totalFailed}`);
  console.log(`📈 Total new clues: ${totalGenerated * CLUES_PER_CAREER_PER_GRADE}`);
  console.log('='.repeat(60) + '\n');

  // Verification
  console.log('🔍 Verification:\n');
  for (const grade of GRADE_CATEGORIES) {
    const { count } = await supabase
      .from('dl_clues')
      .select('*', { count: 'exact', head: true })
      .eq('grade_category', grade);
    console.log(`  ${grade}: ${count} total clues`);
  }

  console.log('\n📝 Sample clues:\n');
  const { data: samples } = await supabase
    .from('dl_clues')
    .select('career_code, clue_text, grade_category, difficulty')
    .order('created_at', { ascending: false })
    .limit(6);

  if (samples) {
    samples.forEach(s => {
      console.log(`  [${s.grade_category}/${s.difficulty}] ${s.career_code}: "${s.clue_text}"`);
    });
  }

  console.log();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
