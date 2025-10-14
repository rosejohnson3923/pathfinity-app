/**
 * Career Bingo Clue Generator
 *
 * Generates grade-appropriate career clues for Discovered Live! Career Bingo
 * using AI with strict language constraints based on grade level
 */

import { azureOpenAIService } from './azureOpenAIService';
import { getLanguageConstraintsOnly } from './ai-prompts/rules/UniversalContentRules';

export interface CareerClueGenerationRequest {
  careerCode: string;
  careerName: string;
  gradeCategory: 'elementary' | 'middle' | 'high';
  count?: number; // Number of clues to generate (default: 5)
}

export interface GeneratedCareerClue {
  careerCode: string;
  clueText: string;
  skillConnection: string;
  difficulty: 'easy' | 'medium' | 'hard';
  minPlayCount: number;
  distractorCareers: string[];
}

/**
 * Grade category to grade level mapping
 */
const GRADE_MAPPINGS = {
  elementary: 'K', // Use K constraints for elementary (3-5 words)
  middle: '6-8',   // Middle school constraints (10-15 words)
  high: '9-12'     // High school constraints (varied)
};

/**
 * Generate career clues using AI with grade-appropriate language
 */
export async function generateCareerClues(
  request: CareerClueGenerationRequest
): Promise<GeneratedCareerClue[]> {
  const { careerCode, careerName, gradeCategory, count = 5 } = request;

  // Map grade category to specific grade for language constraints
  const gradeLevel = GRADE_MAPPINGS[gradeCategory];
  const languageConstraints = getLanguageConstraintsOnly(gradeLevel);

  // Build the AI prompt
  const systemPrompt = `You are a career education expert creating clues for a multiplayer career bingo game.

Your task: Generate ${count} career clues for "${careerName}" that are appropriate for ${gradeCategory} students.

CRITICAL LANGUAGE REQUIREMENTS:
${languageConstraints}

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
    const userPrompt = `Generate ${count} career clues for: ${careerName} (${careerCode}) - ${gradeCategory} level`;

    const response = await azureOpenAIService.generateWithModel(
      'gpt4o',
      userPrompt,
      systemPrompt,
      {
        temperature: 0.8,
        maxTokens: 2000,
        jsonMode: true
      }
    );

    // Parse the response
    const result = JSON.parse(response);
    const clues = result.clues || result;

    if (!Array.isArray(clues)) {
      throw new Error('AI response is not an array of clues');
    }

    // Add career code to each clue and validate
    return clues.map((clue: any) => ({
      careerCode,
      clueText: clue.clueText || clue.clue_text,
      skillConnection: clue.skillConnection || clue.skill_connection,
      difficulty: clue.difficulty || 'easy',
      minPlayCount: clue.minPlayCount ?? (clue.difficulty === 'easy' ? 0 : clue.difficulty === 'medium' ? 3 : 6),
      distractorCareers: clue.distractorCareers || clue.distractor_careers || []
    }));
  } catch (error) {
    console.error('Error generating career clues:', error);
    throw new Error(`Failed to generate clues for ${careerName}: ${error}`);
  }
}

/**
 * Batch generate clues for multiple careers
 */
export async function batchGenerateClues(
  requests: CareerClueGenerationRequest[]
): Promise<{ [careerCode: string]: GeneratedCareerClue[] }> {
  const results: { [careerCode: string]: GeneratedCareerClue[] } = {};

  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchPromises = batch.map(req => generateCareerClues(req));

    try {
      const batchResults = await Promise.all(batchPromises);
      batch.forEach((req, index) => {
        results[req.careerCode] = batchResults[index];
      });
    } catch (error) {
      console.error(`Error processing batch ${i / batchSize + 1}:`, error);
    }

    // Wait a bit between batches to respect rate limits
    if (i + batchSize < requests.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}
