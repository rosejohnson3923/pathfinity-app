#!/usr/bin/env node

/**
 * Test Counting Detection for Grade 10
 * Verifies that counting questions are correctly detected and marked as unsuitable
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';

// Load environment
config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(chalk.red('Missing Supabase credentials'));
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Import the service for testing
import { staticDataService } from './src/services/StaticDataService.js';

console.log(chalk.bold.blue('\n🧪 Testing Counting Detection for Grade 10\n'));

// Test questions that should be detected as counting
const countingQuestions = [
  'How many apples are in the basket?',
  'Count the number of stars shown.',
  'How many basketballs does the Athlete have?',
  'Count how many tools the Chef is using.',
  'What is the total count of items?'
];

// Test questions that should NOT be detected as counting
const notCountingQuestions = [
  'What is 5 + 3?',
  'True or False: There are 5 apples.',
  'Which answer is correct?',
  'Calculate the total cost.',
  'Solve for x: 2x + 5 = 15'
];

async function testCountingDetection() {
  console.log(chalk.yellow('1. Testing Grade 10 Configuration:'));
  
  // Check Grade 10 configuration
  const { data: gradeConfig } = await supabase
    .from('grade_configurations')
    .select('*')
    .eq('grade', '10')
    .single();
  
  if (gradeConfig) {
    console.log(chalk.green('✅ Grade 10 Configuration:'));
    console.log(`   Excluded types: ${gradeConfig.excluded_question_types?.join(', ') || 'none'}`);
    console.log(`   Counting excluded: ${gradeConfig.excluded_question_types?.includes('counting') ? 'YES ✅' : 'NO ❌'}`);
  }
  
  console.log(chalk.yellow('\n2. Testing Detection Rules:'));
  
  // Get counting detection rules
  const { data: countingRules } = await supabase
    .from('detection_rules')
    .select('*')
    .eq('question_type', 'counting')
    .eq('is_active', true);
  
  console.log(`   Found ${countingRules?.length || 0} active counting detection rules`);
  countingRules?.forEach(rule => {
    console.log(`   - ${rule.rule_name} (priority: ${rule.priority})`);
  });
  
  console.log(chalk.yellow('\n3. Testing Counting Question Detection:'));
  
  let correctDetections = 0;
  
  for (const question of countingQuestions) {
    // Test detection using StaticDataService
    const detectedType = await staticDataService.detectQuestionType(
      question,
      '10', // Grade 10
      'Math'
    );
    
    const isCorrect = detectedType === 'counting';
    if (isCorrect) correctDetections++;
    
    console.log(`   ${isCorrect ? '✅' : '❌'} "${question.substring(0, 30)}..."`);
    console.log(`      Detected as: ${detectedType}`);
  }
  
  console.log(chalk.yellow('\n4. Testing Non-Counting Questions (should NOT detect as counting):'));
  
  let correctNonDetections = 0;
  
  for (const question of notCountingQuestions) {
    const detectedType = await staticDataService.detectQuestionType(
      question,
      '10', // Grade 10
      'Math'
    );
    
    const isCorrect = detectedType !== 'counting';
    if (isCorrect) correctNonDetections++;
    
    console.log(`   ${isCorrect ? '✅' : '❌'} "${question.substring(0, 30)}..."`);
    console.log(`      Detected as: ${detectedType}`);
  }
  
  console.log(chalk.yellow('\n5. Testing Suitability Check:'));
  
  // Check if counting is suitable for Grade 10
  const isSuitable = await staticDataService.isQuestionTypeSuitable('counting', '10');
  console.log(`   Counting suitable for Grade 10: ${!isSuitable ? 'NO ✅' : 'YES ❌'}`);
  
  // Get suitable types for Grade 10 Math
  const suitableTypes = await staticDataService.getSuitableQuestionTypes('10', 'Math');
  const includesCounting = suitableTypes.some(t => t.id === 'counting');
  console.log(`   Suitable types include counting: ${!includesCounting ? 'NO ✅' : 'YES ❌'}`);
  
  console.log(chalk.yellow('\n6. Testing with AI Service Integration:'));
  
  // Test a real counting question scenario
  const testSkill = {
    skill_number: 'M.10.1',
    skill_name: 'Basic arithmetic',
    subject: 'Math',
    grade_level: '10'
  };
  
  const testStudent = {
    id: 'taylor-10th',
    display_name: 'Taylor',
    grade_level: '10'
  };
  
  console.log('   Simulating question generation request...');
  console.log('   Student: Taylor (Grade 10)');
  console.log('   Subject: Math');
  console.log('   Request type: counting (should be unsuitable)');
  
  // Check what types are actually suitable
  const availableTypes = await staticDataService.getQuestionTypesForGrade('10', 'Math');
  console.log(`\n   Available types for Grade 10 Math: ${availableTypes.slice(0, 5).map(t => t.id).join(', ')}`);
  
  // Summary
  console.log(chalk.bold.blue('\n📊 Test Summary:'));
  console.log(chalk.green(`✅ Counting questions detected: ${correctDetections}/${countingQuestions.length}`));
  console.log(chalk.green(`✅ Non-counting correctly identified: ${correctNonDetections}/${notCountingQuestions.length}`));
  console.log(chalk.green(`✅ Grade 10 excludes counting: ${gradeConfig?.excluded_question_types?.includes('counting') ? 'YES' : 'NO'}`));
  console.log(chalk.green(`✅ Suitability check correct: ${!isSuitable ? 'YES' : 'NO'}`));
  
  const allTestsPassed = 
    correctDetections === countingQuestions.length &&
    correctNonDetections === notCountingQuestions.length &&
    gradeConfig?.excluded_question_types?.includes('counting') &&
    !isSuitable;
  
  if (allTestsPassed) {
    console.log(chalk.bold.green('\n✨ ALL TESTS PASSED! Counting detection works correctly for Grade 10.'));
  } else {
    console.log(chalk.bold.red('\n❌ SOME TESTS FAILED! Review the results above.'));
  }
}

testCountingDetection().catch(error => {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
});