/**
 * Skill Optimization Service
 * Processes skill names to create optimized YouTube search terms
 * Can be used for batch processing when new grades are added
 */

import { supabase } from '../lib/supabase';

interface SkillOptimizationResult {
  original_skill_name: string;
  youtube_search_terms: string;
  simplified_terms: string[];
  grade_appropriate_query: string;
}

export class SkillOptimizationService {
  /**
   * Grade level mappings for age-appropriate language
   */
  private static getGradeGrouping(grade: string): {
    ageGroup: string;
    gradeLabel: string;
    complexity: 'elementary' | 'middle' | 'high';
  } {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    if (gradeNum <= 2) {
      return {
        ageGroup: 'for kids',
        gradeLabel: grade === 'K' ? 'kindergarten' : `${grade}st grade`,
        complexity: 'elementary'
      };
    } else if (gradeNum <= 5) {
      return {
        ageGroup: 'for kids',
        gradeLabel: `${grade}th grade`,
        complexity: 'elementary'
      };
    } else if (gradeNum <= 8) {
      return {
        ageGroup: 'for middle school',
        gradeLabel: `${grade}th grade`,
        complexity: 'middle'
      };
    } else {
      return {
        ageGroup: 'for high school',
        gradeLabel: `${grade}th grade`,
        complexity: 'high'
      };
    }
  }

  /**
   * Extract key concepts from skill names
   */
  private static extractKeyTerms(skillName: string): string[] {
    // Remove common educational phrases that don't help with YouTube searches
    const removePatterns = [
      /^determine\s+/i,
      /^identify\s+/i,
      /^understand\s+/i,
      /^analyze\s+/i,
      /^evaluate\s+/i,
      /^demonstrate\s+/i,
      /^explain\s+/i,
      /^describe\s+/i,
      /^compare\s+and\s+contrast\s+/i,
      /^solve\s+/i,
      /^apply\s+/i,
      /^use\s+/i,
      /\s+in\s+a\s+passage$/i,
      /\s+in\s+context$/i,
      /\s+with\s+accuracy$/i,
      /\s+correctly$/i,
    ];

    let simplified = skillName;
    removePatterns.forEach(pattern => {
      simplified = simplified.replace(pattern, '');
    });

    // Extract key mathematical/academic terms
    const keyTermPatterns = [
      // Math concepts
      /addition/i,
      /subtraction/i,
      /multiplication/i,
      /division/i,
      /fractions?/i,
      /decimals?/i,
      /percentage?s?/i,
      /algebra/i,
      /geometry/i,
      /equations?/i,
      /graphs?/i,
      /integers?/i,
      /ratios?/i,
      /proportions?/i,

      // ELA concepts
      /main\s+idea/i,
      /theme/i,
      /character/i,
      /plot/i,
      /setting/i,
      /vocabulary/i,
      /grammar/i,
      /reading/i,
      /writing/i,
      /comprehension/i,
      /summary/i,
      /inference/i,
      /context\s+clues/i,
      /figurative\s+language/i,
      /metaphor/i,
      /simile/i,

      // Science concepts
      /cells?/i,
      /atoms?/i,
      /molecules?/i,
      /energy/i,
      /forces?/i,
      /motion/i,
      /ecosystems?/i,
      /weather/i,
      /planets?/i,
      /photosynthesis/i,
      /evolution/i,
      /genetics/i,

      // Social Studies concepts
      /history/i,
      /geography/i,
      /government/i,
      /economics/i,
      /culture/i,
      /civilization/i,
      /revolution/i,
      /democracy/i,
      /constitution/i,
      /maps?/i,
      /timeline/i
    ];

    const foundTerms: string[] = [];
    keyTermPatterns.forEach(pattern => {
      const match = simplified.match(pattern);
      if (match) {
        foundTerms.push(match[0].toLowerCase());
      }
    });

    // If no key terms found, use the simplified version
    if (foundTerms.length === 0) {
      foundTerms.push(simplified.toLowerCase().trim());
    }

    return foundTerms;
  }

  /**
   * Generate multiple search variants for better YouTube results
   */
  private static generateSearchVariants(
    skillName: string,
    subject: string,
    grade: string
  ): string[] {
    const { ageGroup, gradeLabel, complexity } = this.getGradeGrouping(grade);
    const keyTerms = this.extractKeyTerms(skillName);
    const variants: string[] = [];

    // Variant 1: Key terms only with grade level
    if (keyTerms.length > 0) {
      variants.push(`${keyTerms.join(' ')} ${gradeLabel} lesson`);
    }

    // Variant 2: Subject focused with key terms
    if (keyTerms.length > 0) {
      variants.push(`${subject} ${keyTerms[0]} ${ageGroup}`);
    }

    // Variant 3: Simplified educational query
    if (complexity === 'elementary') {
      variants.push(`${keyTerms[0] || skillName} for kids educational`);
    } else if (complexity === 'middle') {
      variants.push(`${keyTerms[0] || skillName} middle school ${subject}`);
    } else {
      variants.push(`${keyTerms[0] || skillName} high school ${subject}`);
    }

    // Variant 4: Tutorial style
    variants.push(`how to ${keyTerms[0] || skillName} ${gradeLabel}`);

    return variants;
  }

  /**
   * Optimize a single skill for YouTube searching
   */
  public static optimizeSkill(
    skillName: string,
    subject: string,
    grade: string
  ): SkillOptimizationResult {
    const keyTerms = this.extractKeyTerms(skillName);
    const searchVariants = this.generateSearchVariants(skillName, subject, grade);
    const { ageGroup, gradeLabel } = this.getGradeGrouping(grade);

    // Primary search query (most likely to return good results)
    const primaryQuery = keyTerms.length > 0
      ? `${keyTerms[0]} ${subject} ${gradeLabel}`
      : `${skillName} ${subject} ${gradeLabel}`;

    return {
      original_skill_name: skillName,
      youtube_search_terms: primaryQuery,
      simplified_terms: keyTerms,
      grade_appropriate_query: searchVariants[0]
    };
  }

  /**
   * Batch process skills from database and update with optimized search terms
   */
  public static async optimizeSkillsInDatabase(
    grades?: string[]
  ): Promise<{
    processed: number;
    updated: number;
    errors: string[];
  }> {
    const results = {
      processed: 0,
      updated: 0,
      errors: [] as string[]
    };

    try {
      // Fetch skills to process
      let query = supabase
        .from('skills_master')
        .select('*');

      if (grades && grades.length > 0) {
        query = query.in('grade', grades);
      }

      const { data: skills, error } = await query;

      if (error) throw error;
      if (!skills || skills.length === 0) {
        console.log('No skills found to process');
        return results;
      }

      console.log(`Processing ${skills.length} skills...`);

      // Process each skill
      for (const skill of skills) {
        try {
          results.processed++;

          // Optimize the skill
          const optimization = this.optimizeSkill(
            skill.skill_name,
            skill.subject,
            skill.grade
          );

          // Prepare update data
          const updateData = {
            youtube_search_terms: optimization.youtube_search_terms,
            simplified_terms: optimization.simplified_terms,
            search_variants: this.generateSearchVariants(
              skill.skill_name,
              skill.subject,
              skill.grade
            )
          };

          // Update the database
          const { error: updateError } = await supabase
            .from('skills_master')
            .update(updateData)
            .eq('id', skill.id);

          if (updateError) {
            results.errors.push(`Failed to update skill ${skill.id}: ${updateError.message}`);
          } else {
            results.updated++;
            console.log(`✅ Updated skill: ${skill.skill_name} -> ${optimization.youtube_search_terms}`);
          }

        } catch (skillError) {
          results.errors.push(`Error processing skill ${skill.id}: ${skillError}`);
        }
      }

      console.log(`\n📊 Processing Complete:`);
      console.log(`   Processed: ${results.processed}`);
      console.log(`   Updated: ${results.updated}`);
      console.log(`   Errors: ${results.errors.length}`);

      return results;

    } catch (error) {
      console.error('Failed to process skills:', error);
      results.errors.push(`Fatal error: ${error}`);
      return results;
    }
  }

  /**
   * Generate a migration script for database admin to run
   */
  public static async generateMigrationSQL(): Promise<string> {
    const sql = `
-- Add new columns for YouTube optimization
ALTER TABLE skills_master
ADD COLUMN IF NOT EXISTS youtube_search_terms TEXT,
ADD COLUMN IF NOT EXISTS simplified_terms TEXT[],
ADD COLUMN IF NOT EXISTS search_variants TEXT[];

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS idx_youtube_search_terms ON skills_master(youtube_search_terms);

-- Function to optimize skill names (can be run manually or via trigger)
CREATE OR REPLACE FUNCTION optimize_skill_for_youtube(
  p_skill_name TEXT,
  p_subject TEXT,
  p_grade TEXT
) RETURNS TABLE(
  youtube_search_terms TEXT,
  simplified_terms TEXT[]
) AS $$
BEGIN
  -- This is a simplified version - full logic would be in application
  RETURN QUERY
  SELECT
    REGEXP_REPLACE(
      LOWER(p_skill_name),
      '^(determine|identify|understand|analyze|evaluate|demonstrate|explain|describe) ',
      ''
    ) || ' ' || p_subject || ' grade ' || p_grade AS youtube_search_terms,
    STRING_TO_ARRAY(
      REGEXP_REPLACE(
        LOWER(p_skill_name),
        ' (in a passage|in context|with accuracy|correctly)$',
        ''
      ),
      ' '
    ) AS simplified_terms;
END;
$$ LANGUAGE plpgsql;

-- Example update for existing records
-- UPDATE skills_master
-- SET (youtube_search_terms, simplified_terms) =
--   (SELECT youtube_search_terms, simplified_terms
--    FROM optimize_skill_for_youtube(skill_name, subject, grade))
-- WHERE youtube_search_terms IS NULL;
`;
    return sql;
  }
}

// Export for CLI usage
export default SkillOptimizationService;