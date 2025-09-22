/**
 * Tests for Skill Optimization Service
 */

import { SkillOptimizationService } from '../SkillOptimizationService';

describe('SkillOptimizationService', () => {
  describe('Grade 10 ELA - Taylor\'s Example', () => {
    it('should optimize "Determine the main idea of a passage" for Grade 10 ELA', () => {
      const result = SkillOptimizationService.optimizeSkill(
        'Determine the main idea of a passage',
        'ELA',
        '10'
      );

      expect(result.original_skill_name).toBe('Determine the main idea of a passage');
      expect(result.simplified_terms).toContain('main idea');
      expect(result.youtube_search_terms).toBe('main idea ELA 10th grade');
      expect(result.grade_appropriate_query).toContain('10th grade');
      expect(result.grade_appropriate_query).not.toContain('for kids');
    });
  });

  describe('Kindergarten Math - Sam\'s Example', () => {
    it('should optimize "Count objects up to 10" for Kindergarten Math', () => {
      const result = SkillOptimizationService.optimizeSkill(
        'Count objects up to 10',
        'Math',
        'K'
      );

      expect(result.simplified_terms).toContain('count objects up to 10');
      expect(result.youtube_search_terms).toContain('kindergarten');
      expect(result.grade_appropriate_query).toContain('for kids');
    });
  });

  describe('Grade 7 Math - Integer Operations', () => {
    it('should optimize "Compare and order integers" for Grade 7 Math', () => {
      const result = SkillOptimizationService.optimizeSkill(
        'Compare and order integers',
        'Math',
        '7'
      );

      expect(result.simplified_terms).toContain('integers');
      expect(result.youtube_search_terms).toBe('integers Math 7th grade');
      expect(result.grade_appropriate_query).toContain('middle school');
    });
  });

  describe('Key Term Extraction', () => {
    const testCases = [
      {
        input: 'Determine the main idea of a passage',
        expected: ['main idea']
      },
      {
        input: 'Solve addition problems with regrouping',
        expected: ['addition']
      },
      {
        input: 'Identify fractions and decimals',
        expected: ['fractions', 'decimals']
      },
      {
        input: 'Analyze character development in literature',
        expected: ['character']
      },
      {
        input: 'Understand photosynthesis in plants',
        expected: ['photosynthesis']
      }
    ];

    testCases.forEach(({ input, expected }) => {
      it(`should extract key terms from "${input}"`, () => {
        const result = SkillOptimizationService.optimizeSkill(input, 'Test', '5');
        expected.forEach(term => {
          expect(result.simplified_terms).toContain(term);
        });
      });
    });
  });

  describe('Grade Appropriate Language', () => {
    it('should use "for kids" for elementary grades', () => {
      const result = SkillOptimizationService.optimizeSkill('Addition', 'Math', '2');
      expect(result.grade_appropriate_query).toContain('for kids');
    });

    it('should use "middle school" for grades 6-8', () => {
      const result = SkillOptimizationService.optimizeSkill('Algebra', 'Math', '7');
      expect(result.grade_appropriate_query).toContain('middle school');
    });

    it('should use "high school" for grades 9-12', () => {
      const result = SkillOptimizationService.optimizeSkill('Calculus', 'Math', '11');
      expect(result.grade_appropriate_query).toContain('high school');
    });
  });
});

// Example output for documentation
export const exampleOptimizations = () => {
  console.log('\n📚 Example Skill Optimizations:\n');
  console.log('================================\n');

  const examples = [
    { skill: 'Determine the main idea of a passage', subject: 'ELA', grade: '10' },
    { skill: 'Count objects up to 10', subject: 'Math', grade: 'K' },
    { skill: 'Compare and order integers', subject: 'Math', grade: '7' },
    { skill: 'Identify character traits in stories', subject: 'ELA', grade: '1' }
  ];

  examples.forEach(({ skill, subject, grade }) => {
    const result = SkillOptimizationService.optimizeSkill(skill, subject, grade);
    console.log(`Grade ${grade} ${subject}:`);
    console.log(`  Original: "${skill}"`);
    console.log(`  Optimized: "${result.youtube_search_terms}"`);
    console.log(`  Key Terms: [${result.simplified_terms.join(', ')}]`);
    console.log('');
  });
};

// Run examples if called directly
if (require.main === module) {
  exampleOptimizations();
}