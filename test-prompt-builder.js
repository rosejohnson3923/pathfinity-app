// Test script to verify PromptBuilder generates proper prompts
import { promptBuilder } from './src/services/ai-prompts/PromptBuilder.ts';

const testContext = {
  container: 'LEARN',
  subject: 'Math',
  grade: 'K',
  skill: {
    id: 'skill-001',
    name: 'Counting to 3',
    description: 'Count objects up to 3',
    subject: 'Math'
  },
  career: {
    id: 'career-001',
    name: 'Doctor',
    description: 'Medical professional'
  },
  student: {
    id: 'student-001',
    display_name: 'Alex',
    grade_level: 'K'
  },
  companion: {
    name: 'Dr. Helper',
    personality: 'Encouraging'
  }
};

console.log('\n========================================');
console.log('TESTING PROMPT BUILDER');
console.log('========================================\n');

try {
  const prompt = promptBuilder.buildPrompt(testContext);
  
  console.log('✅ Prompt generated successfully!');
  console.log('📏 Length:', prompt.length, 'characters');
  console.log('\n📋 Key sections found:');
  
  // Check for key mandatory field mentions
  const checks = {
    'correct_answer mentioned': prompt.includes('correct_answer'),
    'MANDATORY FIELDS section': prompt.includes('MANDATORY FIELDS'),
    'practiceSupport mentioned': prompt.includes('practiceSupport'),
    'visual field mentioned': prompt.includes('visual'),
    'Universal Rules': prompt.includes('UNIVERSAL RULES'),
    'Subject Rules': prompt.includes('MATH SPECIFIC RULES'),
    'Container Rules': prompt.includes('LEARN CONTAINER APPROACH'),
    'Quality Check': prompt.includes('FINAL QUALITY CHECK')
  };
  
  Object.entries(checks).forEach(([check, found]) => {
    console.log(`  ${found ? '✅' : '❌'} ${check}`);
  });
  
  console.log('\n📝 Prompt preview (first 500 chars):');
  console.log(prompt.substring(0, 500) + '...\n');
  
  // Test validation
  console.log('🔍 Testing validation with missing correct_answer:');
  const badContent = {
    practice: [{
      question: 'Test question',
      type: 'multiple_choice',
      options: ['A', 'B', 'C', 'D'],
      // Missing correct_answer!
      visual: '❓',
      hint: 'hint',
      explanation: 'explanation'
    }],
    assessment: {
      question: 'Test',
      type: 'true_false',
      visual: '❓',
      // Missing correct_answer!
      explanation: 'explanation'
    }
  };
  
  const validation = promptBuilder.validateContent(badContent, testContext);
  console.log(`  Valid: ${validation.valid}`);
  console.log(`  Errors: ${validation.errors.length > 0 ? validation.errors.join(', ') : 'None'}`);
  
} catch (error) {
  console.error('❌ Error:', error.message);
}

console.log('\n========================================\n');