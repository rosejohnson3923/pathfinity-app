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

async function detectQuestionType(questionText, grade, subject) {
  // Get detection rules from database
  const { data: rules } = await supabase
    .from('detection_rules')
    .select('*')
    .eq('is_active', true)
    .order('priority');
  
  const textLower = questionText.toLowerCase();
  
  for (const rule of rules || []) {
    // Check grade condition
    if (rule.grade_condition) {
      const gradeNum = parseInt(grade);
      const condition = JSON.parse(rule.grade_condition);
      if (condition.min && gradeNum < condition.min) continue;
      if (condition.max && gradeNum > condition.max) continue;
    }
    
    // Check subject condition
    if (rule.subject_condition && !rule.subject_condition.includes(subject)) {
      continue;
    }
    
    // Check pattern
    if (rule.pattern_regex) {
      try {
        const regex = new RegExp(rule.pattern_regex, 'i');
        if (regex.test(textLower)) {
          return rule.question_type;
        }
      } catch (e) {
        // Invalid regex, skip
      }
    }
    
    // Check keywords
    if (rule.keywords) {
      const keywords = rule.keywords;
      if (keywords.some(keyword => textLower.includes(keyword.toLowerCase()))) {
        return rule.question_type;
      }
    }
  }
  
  return 'multiple_choice'; // default
}

async function testCountingDetection() {
  console.log(chalk.yellow('1. Testing Grade 10 Configuration:'));
  
  // Check Grade 10 configuration
  const { data: gradeConfig } = await supabase
    .from('grade_configurations')
    .select('*')
    .eq('grade', '10')
    .single();
  
  if (gradeConfig) {
    console.log(chalk.green('✅ Grade 10 Configuration Found:'));
    console.log(`   Excluded types: ${gradeConfig.excluded_question_types?.join(', ') || 'none'}`);
    const isCountingExcluded = gradeConfig.excluded_question_types?.includes('counting');
    console.log(`   Counting excluded: ${isCountingExcluded ? chalk.green('YES ✅') : chalk.red('NO ❌')}`);
  }
  
  console.log(chalk.yellow('\n2. Testing Detection Rules:'));
  
  // Get counting detection rules
  const { data: countingRules } = await supabase
    .from('detection_rules')
    .select('*')
    .eq('question_type', 'counting')
    .eq('is_active', true)
    .order('priority');
  
  console.log(`   Found ${countingRules?.length || 0} active counting detection rules`);
  countingRules?.forEach(rule => {
    console.log(`   - ${rule.rule_name} (priority: ${rule.priority})`);
    if (rule.pattern_regex) {
      console.log(`     Pattern: "${rule.pattern_regex.substring(0, 50)}..."`);
    }
    if (rule.keywords) {
      console.log(`     Keywords: ${rule.keywords.slice(0, 3).join(', ')}`);
    }
  });
  
  console.log(chalk.yellow('\n3. Testing Counting Question Detection:'));
  
  let correctDetections = 0;
  
  for (const question of countingQuestions) {
    const detectedType = await detectQuestionType(question, '10', 'Math');
    const isCorrect = detectedType === 'counting';
    if (isCorrect) correctDetections++;
    
    console.log(`   ${isCorrect ? chalk.green('✅') : chalk.red('❌')} "${question.substring(0, 40)}..."`);
    console.log(`      Detected as: ${chalk.cyan(detectedType)}`);
  }
  
  console.log(chalk.yellow('\n4. Testing Non-Counting Questions (should NOT detect as counting):'));
  
  let correctNonDetections = 0;
  
  for (const question of notCountingQuestions) {
    const detectedType = await detectQuestionType(question, '10', 'Math');
    const isCorrect = detectedType !== 'counting';
    if (isCorrect) correctNonDetections++;
    
    console.log(`   ${isCorrect ? chalk.green('✅') : chalk.red('❌')} "${question.substring(0, 40)}..."`);
    console.log(`      Detected as: ${chalk.cyan(detectedType)}`);
  }
  
  console.log(chalk.yellow('\n5. Testing Question Type Priorities:'));
  
  // Get all question types ordered by priority
  const { data: questionTypes } = await supabase
    .from('question_type_definitions')
    .select('id, display_name, detection_priority')
    .order('detection_priority')
    .limit(5);
  
  console.log('   Top 5 detection priorities:');
  questionTypes?.forEach(type => {
    console.log(`   ${type.detection_priority}. ${type.id} (${type.display_name})`);
  });
  
  // Get counting specifically
  const { data: countingType } = await supabase
    .from('question_type_definitions')
    .select('id, display_name, detection_priority')
    .eq('id', 'counting')
    .single();
  
  console.log(`\n   Counting priority: ${chalk.cyan(countingType?.detection_priority)} (should be high/low priority)`);
  
  console.log(chalk.yellow('\n6. Testing Grade Suitability:'));
  
  // Check if counting is in excluded types for Grade 10
  const isExcluded = gradeConfig?.excluded_question_types?.includes('counting');
  console.log(`   Counting is excluded for Grade 10: ${isExcluded ? chalk.green('YES ✅') : chalk.red('NO ❌')}`);
  
  // Check if counting would be suitable for lower grades
  const { data: grade1Config } = await supabase
    .from('grade_configurations')
    .select('excluded_question_types')
    .eq('grade', '1')
    .single();
  
  const isExcludedGrade1 = grade1Config?.excluded_question_types?.includes('counting');
  console.log(`   Counting is excluded for Grade 1: ${isExcludedGrade1 ? chalk.red('YES ❌') : chalk.green('NO ✅')}`);
  
  // Summary
  console.log(chalk.bold.blue('\n📊 Test Summary:'));
  console.log(`   Counting questions detected: ${correctDetections}/${countingQuestions.length} ${correctDetections === countingQuestions.length ? chalk.green('✅') : chalk.red('❌')}`);
  console.log(`   Non-counting correctly identified: ${correctNonDetections}/${notCountingQuestions.length} ${correctNonDetections === notCountingQuestions.length ? chalk.green('✅') : chalk.red('❌')}`);
  console.log(`   Grade 10 excludes counting: ${isExcluded ? chalk.green('✅') : chalk.red('❌')}`);
  console.log(`   Counting priority: ${countingType?.detection_priority} ${countingType?.detection_priority >= 90 ? chalk.green('✅ (low priority)') : chalk.yellow('⚠️')}`);
  
  const allTestsPassed = 
    correctDetections === countingQuestions.length &&
    correctNonDetections === notCountingQuestions.length &&
    isExcluded &&
    countingType?.detection_priority >= 90;
  
  if (allTestsPassed) {
    console.log(chalk.bold.green('\n✨ ALL TESTS PASSED!'));
    console.log(chalk.green('Counting detection works correctly for Grade 10:'));
    console.log(chalk.green('  - Questions with "count/how many" ARE detected as counting'));
    console.log(chalk.green('  - Counting IS excluded from Grade 10 suitable types'));
    console.log(chalk.green('  - Counting has low detection priority (100)'));
  } else {
    console.log(chalk.bold.red('\n❌ SOME TESTS FAILED!'));
    console.log(chalk.red('Review the results above to identify issues.'));
  }
  
  // Additional info
  console.log(chalk.yellow('\n📝 Notes:'));
  console.log('  - Counting type can still be explicitly requested for Grade 10');
  console.log('  - It will be detected if the question matches counting patterns');
  console.log('  - But it won\'t be automatically selected as suitable for Grade 10');
}

testCountingDetection().catch(error => {
  console.error(chalk.red('Test failed:'), error);
  process.exit(1);
});