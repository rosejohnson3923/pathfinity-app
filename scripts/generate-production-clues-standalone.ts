/**
 * Generate Production Career Bingo Clues (Standalone Node.js Version)
 *
 * Generates age-appropriate clues using OpenAI for all active careers
 * - Elementary (K-5): 10 clues per career (5-7 words, simple vocabulary)
 * - Middle (6-8): 10 clues per career (10-15 words, technical terms)
 * - High (9-12): 10 clues per career (varied length, complex concepts)
 *
 * This is a standalone version that doesn't depend on Vite environment variables
 *
 * Usage:
 *   npx tsx scripts/generate-production-clues-standalone.ts
 */

import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY!;
const azureEndpoint = process.env.VITE_AZURE_OPENAI_ENDPOINT!;
const azureApiKey = process.env.VITE_AZURE_OPENAI_API_KEY!;
const azureDeployment = process.env.VITE_AZURE_OPENAI_GPT4O_DEPLOYMENT || 'gpt-4o';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Check .env file.');
  process.exit(1);
}

if (!azureEndpoint || !azureApiKey) {
  console.error('❌ Missing Azure OpenAI credentials. Check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Initialize Azure OpenAI client
const openai = new OpenAI({
  apiKey: azureApiKey,
  baseURL: `${azureEndpoint}/openai/deployments/${azureDeployment}`,
  defaultQuery: { 'api-version': '2024-08-01-preview' },
  defaultHeaders: { 'api-key': azureApiKey },
});

const CLUES_PER_CAREER_PER_GRADE = 10;
const GRADE_CATEGORIES: Array<'elementary' | 'middle' | 'high'> = ['elementary', 'middle', 'high'];

interface Career {
  career_code: string;
  career_name: string;
}

/**
 * Language constraints for each grade category
 */
const LANGUAGE_CONSTRAINTS = {
  elementary: `
- Use ONLY simple, everyday words a kindergartner would know
- MAXIMUM 7 words per sentence
- Use present tense ("I help", not "I helped")
- Focus on concrete, visible actions
- NO complex vocabulary or abstract concepts
`,
  middle: `
- Use 10-15 words per sentence
- Can include technical terms but provide context
- Use clear, direct language
- Focus on skills and responsibilities
- Can mention tools, equipment, or methods used in the career
`,
  high: `
- Use varied sentence structures and lengths
- Include technical vocabulary and domain-specific terms
- Can discuss complex processes and abstract concepts
- Focus on specialized skills, strategic thinking, and advanced responsibilities
- May include industry jargon appropriate for career exploration
`
};

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
 * Generate clues using Azure OpenAI
 */
async function generateClues(
  careerCode: string,
  careerName: string,
  gradeCategory: 'elementary' | 'middle' | 'high',
  count: number
): Promise<any[]> {
  const constraints = LANGUAGE_CONSTRAINTS[gradeCategory];

  const systemPrompt = `You are a career education expert creating clues for a multiplayer career bingo game.

Your task: Generate ${count} career clues for "${careerName}" that are appropriate for ${gradeCategory} students.

CRITICAL LANGUAGE REQUIREMENTS:
${constraints}

CLUE FORMAT REQUIREMENTS:
${gradeCategory === 'elementary' ? `
- Use EXACTLY 5-7 words per clue
- Use simple, everyday vocabulary
- Focus on concrete, observable actions
- Examples: "I help people feel better", "I teach students every day", "I cook food in restaurants"
` : gradeCategory === 'middle' ? `
- Use 10-15 words per clue
- Can include some technical terms with context
- Focus on skills and responsibilities
- Examples: "I use scientific methods to research and discover new medical treatments", "I design buildings and create blueprints for construction projects"
` : `
- Use varied sentence structures
- Include technical vocabulary and complex concepts
- Focus on specialized skills and advanced responsibilities
- Examples: "I analyze complex data patterns to develop strategic business solutions and optimize organizational performance"
`}

RESPONSE FORMAT (JSON object with clues array):
{
  "clues": [
    {
      "clueText": "The career clue (${gradeCategory === 'elementary' ? '5-7 words' : gradeCategory === 'middle' ? '10-15 words' : 'varied length'})",
      "skillConnection": "Brief explanation of the key skill this clue highlights (1 sentence)",
      "difficulty": "easy" | "medium" | "hard",
      "minPlayCount": 0 for easy, 3 for medium, 6 for hard,
      "distractorCareers": ["career_code1", "career_code2"] - 2-3 similar careers that could confuse students
    }
  ]
}

Generate ${count} diverse clues that highlight different aspects of the career.
Ensure clues progress from easy to hard (first clues easy, last clues hard).

IMPORTANT: Respond ONLY with valid JSON in the format above, no other text.`;

  try {
    const response = await openai.chat.completions.create({
      model: azureDeployment,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate ${count} career clues for: ${careerName} (${careerCode}) - ${gradeCategory} level` }
      ],
      temperature: 0.8,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) throw new Error('No response from OpenAI');

    const result = JSON.parse(content);
    const clues = result.clues || result;

    if (!Array.isArray(clues)) {
      throw new Error('AI response is not an array of clues');
    }

    return clues.map((clue: any) => ({
      careerCode,
      clueText: clue.clueText || clue.clue_text,
      skillConnection: clue.skillConnection || clue.skill_connection,
      difficulty: clue.difficulty || 'easy',
      minPlayCount: clue.minPlayCount ?? (clue.difficulty === 'easy' ? 0 : clue.difficulty === 'medium' ? 3 : 6),
      distractorCareers: clue.distractorCareers || clue.distractor_careers || []
    }));
  } catch (error) {
    console.error('Error generating clues:', error);
    throw new Error(`Failed to generate clues for ${careerName}: ${error}`);
  }
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
  console.log('Using age-appropriate language constraints\n');
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

        const clues = await generateClues(
          career.career_code,
          career.career_name,
          gradeCategory,
          CLUES_PER_CAREER_PER_GRADE
        );

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
