/**
 * Simple Test of Modular Prompt System
 * =====================================
 * Tests the modular prompt assembly without Azure dependencies
 */

import { modularPromptSystem } from '../services/prompts/PromptArchitecture';
import * as fs from 'fs';

// Test scenarios
const TEST_CASES = [
  {
    name: 'Kindergarten Counting with Doctor Career',
    context: {
      gradeLevel: 'K',
      career: 'Doctor',
      subject: 'Math',
      skillName: 'Counting to 10',
      skillId: 'MATH.K.CC.1',
      questionType: 'counting'
    },
    expectedInPrompt: [
      'very simple words',
      'visual aids and emojis',
      'medical and health',
      'How many',
      'countable objects'
    ]
  },
  {
    name: '5th Grade Comparison with Engineer Career',
    context: {
      gradeLevel: '5',
      career: 'Engineer',
      subject: 'Math',
      skillName: 'Comparing positive and negative numbers',
      skillId: 'MATH.5.NBT.3',
      questionType: 'multiple_choice'
    },
    expectedInPrompt: [
      'grade-appropriate vocabulary',
      'building and problem-solving',
      'MUST have exactly 4 options',
      'NEVER use for selection questions'
    ]
  },
  {
    name: '1st Grade Letter Recognition with Teacher Career',
    context: {
      gradeLevel: '1',
      career: 'Teacher',
      subject: 'ELA',
      skillName: 'Letter Recognition',
      skillId: 'ELA.1.RF.1',
      questionType: 'multiple_choice'
    },
    expectedInPrompt: [
      'simple, clear language',
      'education and learning',
      'Letter Recognition',
      'identifying or distinguishing letters'
    ]
  },
  {
    name: 'True/False for 3rd Grade',
    context: {
      gradeLevel: '3',
      career: 'Scientist',
      subject: 'Science',
      skillName: 'States of Matter',
      skillId: 'SCI.3.PS.1',
      questionType: 'true_false'
    },
    expectedInPrompt: [
      'NEVER use for "which" or comparison questions',
      'Statement should be clear and unambiguous',
      'research and experiments'
    ]
  }
];

function testModularPromptAssembly() {
  console.log('🧩 TESTING MODULAR PROMPT ASSEMBLY');
  console.log('=' .repeat(60));
  console.log(`Testing ${TEST_CASES.length} prompt assembly scenarios\n`);
  
  const results: any[] = [];
  let passCount = 0;
  
  for (const testCase of TEST_CASES) {
    console.log(`\n📝 ${testCase.name}`);
    console.log(`   Grade: ${testCase.context.gradeLevel}, Career: ${testCase.context.career}`);
    console.log(`   Subject: ${testCase.context.subject}, Type: ${testCase.context.questionType}`);
    
    // Assemble the prompt
    const prompt = modularPromptSystem.assemblePrompt(testCase.context);
    
    // Check if expected content is present
    const missingContent: string[] = [];
    let passed = true;
    
    for (const expected of testCase.expectedInPrompt) {
      if (!prompt.toLowerCase().includes(expected.toLowerCase())) {
        missingContent.push(expected);
        passed = false;
      }
    }
    
    if (passed) {
      console.log('   ✅ PASSED - All expected content found');
      passCount++;
    } else {
      console.log('   ❌ FAILED - Missing content:');
      missingContent.forEach(content => console.log(`      - ${content}`));
    }
    
    // Check prompt length and structure
    const lines = prompt.split('\n');
    console.log(`   📏 Prompt length: ${prompt.length} chars, ${lines.length} lines`);
    
    // Save result
    results.push({
      testCase: testCase.name,
      passed,
      missingContent,
      promptLength: prompt.length,
      promptPreview: prompt.substring(0, 200) + '...'
    });
  }
  
  // Test edge case handling
  console.log('\n\n🔍 EDGE CASE PROMPT TESTS');
  console.log('=' .repeat(60));
  
  const edgeCases = [
    {
      name: 'Which Question Prevention',
      scenario: 'which_question',
      expectedContent: 'This MUST be multiple_choice, NEVER true/false'
    },
    {
      name: 'Negative Number Comparison',
      scenario: 'negative_number_comparison',
      expectedContent: 'should be a multiple_choice question, NOT true/false'
    },
    {
      name: 'Fraction Comparison',
      scenario: 'fraction_comparison',
      expectedContent: 'multiple_choice with fraction options'
    }
  ];
  
  for (const edgeCase of edgeCases) {
    const edgePrompt = modularPromptSystem.getEdgeCasePrompt(edgeCase.scenario);
    const hasExpected = edgePrompt.toLowerCase().includes(edgeCase.expectedContent.toLowerCase());
    
    console.log(`\n${edgeCase.name}: ${hasExpected ? '✅' : '❌'}`);
    if (!hasExpected) {
      console.log(`   Expected: "${edgeCase.expectedContent}"`);
    }
  }
  
  // Final Report
  console.log('\n\n' + '=' .repeat(60));
  console.log('📊 MODULAR PROMPT ASSEMBLY REPORT');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${TEST_CASES.length}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${TEST_CASES.length - passCount}`);
  console.log(`Success Rate: ${((passCount / TEST_CASES.length) * 100).toFixed(1)}%`);
  
  // Save detailed prompts for review
  const detailedPrompts: any = {};
  for (const testCase of TEST_CASES) {
    const prompt = modularPromptSystem.assemblePrompt(testCase.context);
    detailedPrompts[testCase.name] = {
      context: testCase.context,
      fullPrompt: prompt,
      sections: prompt.split('\n\n').map(section => ({
        preview: section.substring(0, 100),
        length: section.length
      }))
    };
  }
  
  fs.writeFileSync(
    'modular-prompts-analysis.json',
    JSON.stringify({
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: TEST_CASES.length,
        passed: passCount,
        failed: TEST_CASES.length - passCount,
        successRate: ((passCount / TEST_CASES.length) * 100).toFixed(1) + '%'
      },
      results,
      detailedPrompts
    }, null, 2)
  );
  
  console.log('\n📄 Detailed analysis saved to: modular-prompts-analysis.json');
  
  // Show example prompt
  console.log('\n📋 EXAMPLE PROMPT OUTPUT:');
  console.log('=' .repeat(60));
  const examplePrompt = modularPromptSystem.assemblePrompt({
    gradeLevel: '5',
    career: 'Engineer',
    subject: 'Math',
    skillName: 'Which number is smaller',
    skillId: 'MATH.5.COMP',
    questionType: 'multiple_choice'
  });
  console.log(examplePrompt.substring(0, 500) + '...\n');
  
  if (passCount === TEST_CASES.length) {
    console.log('✅ MODULAR PROMPT SYSTEM IS WORKING CORRECTLY!');
  } else {
    console.log('⚠️  MODULAR PROMPT SYSTEM NEEDS ADJUSTMENTS');
  }
}

// Run the test
testModularPromptAssembly();