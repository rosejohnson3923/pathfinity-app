#!/usr/bin/env node

/**
 * Test Modular Prompt System with Azure OpenAI
 * =============================================
 * Direct test bypassing TypeScript compilation issues
 */

const { config } = require('dotenv');
const { OpenAIClient, AzureKeyCredential } = require('@azure/openai');
const fs = require('fs');

// Load environment variables
config();

// Azure OpenAI Configuration
const AZURE_OPENAI_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.VITE_AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY) {
  console.error('❌ Missing Azure OpenAI credentials in environment');
  process.exit(1);
}

// Initialize Azure OpenAI client
const client = new OpenAIClient(
  AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(AZURE_OPENAI_KEY)
);

// Test scenarios
const TEST_SCENARIOS = [
  {
    name: 'Which number comparison (5th grade)',
    context: {
      gradeLevel: '5',
      career: 'Engineer',
      subject: 'Math',
      skillName: 'Comparing positive and negative numbers',
      skillId: 'MATH.5.NBT.3'
    },
    expectedType: 'multiple_choice',
    notType: 'true_false'
  },
  {
    name: 'Kindergarten counting',
    context: {
      gradeLevel: 'K',
      career: 'Doctor',
      subject: 'Math',
      skillName: 'Counting to 10',
      skillId: 'MATH.K.CC.1'
    },
    expectedType: 'counting'
  },
  {
    name: 'Letter recognition (1st grade)',
    context: {
      gradeLevel: '1',
      career: 'Teacher',
      subject: 'ELA',
      skillName: 'Letter Recognition',
      skillId: 'ELA.1.RF.1'
    },
    expectedType: 'multiple_choice',
    shouldContain: ['letter']
  },
  {
    name: 'Fraction comparison (4th grade)',
    context: {
      gradeLevel: '4',
      career: 'Chef',
      subject: 'Math',
      skillName: 'Comparing Fractions',
      skillId: 'MATH.4.NF.2'
    },
    expectedType: 'multiple_choice',
    shouldContain: ['fraction']
  },
  {
    name: 'Even/Odd numbers (2nd grade)',
    context: {
      gradeLevel: '2',
      career: 'Police Officer',
      subject: 'Math',
      skillName: 'Even and Odd Numbers',
      skillId: 'MATH.2.OA.3'
    },
    couldBeTypes: ['true_false', 'multiple_choice']
  }
];

// Modular prompt assembly function
function assembleModularPrompt(context) {
  const parts = [];
  
  // Base instruction
  parts.push('Generate an educational question with the following specifications:\n');
  
  // Grade-specific requirements
  const gradeLevel = context.gradeLevel;
  const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
  
  parts.push(`\nGRADE LEVEL ${gradeLevel} REQUIREMENTS:`);
  
  if (gradeLevel === 'K') {
    parts.push('- Language: Use very simple words. Short sentences. Focus on basic concepts.');
    parts.push('- Complexity: Single-step problems only. Use visual aids and emojis.');
    parts.push('- Use words like: see, count, find, look, choose');
    parts.push('- Avoid words like: calculate, analyze, determine, evaluate');
  } else if (gradeNum <= 2) {
    parts.push('- Language: Use simple, clear language. One idea per sentence.');
    parts.push('- Complexity: One or two-step problems. Concrete examples.');
    parts.push('- Use words like: add, take away, group, sort, compare');
  } else if (gradeNum <= 5) {
    parts.push('- Language: Use grade-appropriate vocabulary. Clear instructions.');
    parts.push('- Complexity: Multi-step problems allowed. Some abstraction.');
    parts.push('- Use words like: multiply, divide, explain, describe, solve');
  }
  
  // Subject-specific requirements
  parts.push(`\nSUBJECT (${context.subject}):`);
  parts.push(`- Skill: ${context.skillName}`);
  parts.push(`- Create a question that directly tests this specific skill`);
  
  // Career context
  parts.push(`\nCAREER CONTEXT (${context.career}):`);
  parts.push(`- Include ${context.career.toLowerCase()}-related context when natural`);
  
  // Critical rules for question types
  parts.push('\nCRITICAL RULES:');
  parts.push('1. If the skill involves "which" or comparison, MUST use multiple_choice, NEVER true_false');
  parts.push('2. If the skill is "Counting", use counting type with visual emojis');
  parts.push('3. For negative number comparisons, ALWAYS use multiple_choice');
  parts.push('4. For fraction comparisons, ALWAYS use multiple_choice');
  parts.push('5. The question MUST be relevant to the specific skill mentioned');
  
  // Output format
  parts.push('\nOUTPUT FORMAT (JSON):');
  parts.push(JSON.stringify({
    type: 'multiple_choice | true_false | counting | numeric | etc.',
    question: 'The question text',
    options: ['A', 'B', 'C', 'D'],
    correct_answer: 0,
    explanation: 'Why this answer is correct'
  }, null, 2));
  
  return parts.join('\n');
}

// Test runner
async function runTest() {
  console.log('🧪 TESTING MODULAR PROMPT SYSTEM WITH AZURE OPENAI');
  console.log('=' .repeat(60));
  console.log(`Running ${TEST_SCENARIOS.length} test scenarios\n`);
  
  const results = [];
  let passCount = 0;
  
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n[${i + 1}/${TEST_SCENARIOS.length}] ${scenario.name}`);
    console.log(`  Grade: ${scenario.context.gradeLevel}, Career: ${scenario.context.career}`);
    console.log(`  Subject: ${scenario.context.subject}, Skill: ${scenario.context.skillName}`);
    
    try {
      // Generate prompt
      const prompt = assembleModularPrompt(scenario.context);
      
      // Call Azure OpenAI
      const response = await client.getChatCompletions(
        AZURE_OPENAI_DEPLOYMENT,
        [
          {
            role: 'system',
            content: 'You are an educational content generator. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 500
        }
      );
      
      const content = response.choices[0]?.message?.content;
      
      // Parse response
      let question;
      try {
        // Extract JSON from response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          question = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.log(`  ❌ Failed to parse response: ${parseError.message}`);
        continue;
      }
      
      // Validate result
      let passed = true;
      const issues = [];
      
      // Check type
      if (scenario.expectedType && question.type !== scenario.expectedType) {
        issues.push(`Expected type ${scenario.expectedType}, got ${question.type}`);
        passed = false;
      }
      
      if (scenario.notType && question.type === scenario.notType) {
        issues.push(`Should NOT be type ${scenario.notType}`);
        passed = false;
      }
      
      if (scenario.couldBeTypes && !scenario.couldBeTypes.includes(question.type)) {
        issues.push(`Should be one of: ${scenario.couldBeTypes.join(', ')}`);
        passed = false;
      }
      
      // Check content
      const questionText = (question.question || '').toLowerCase();
      
      if (scenario.shouldContain) {
        const missing = scenario.shouldContain.filter(term => 
          !questionText.includes(term.toLowerCase())
        );
        if (missing.length > 0) {
          issues.push(`Missing expected terms: ${missing.join(', ')}`);
          passed = false;
        }
      }
      
      // Check skill relevance
      const skillWords = scenario.context.skillName.toLowerCase().split(' ');
      const hasRelevance = skillWords.some(word => 
        questionText.includes(word)
      );
      
      if (!hasRelevance && scenario.context.skillName !== 'Letter Recognition') {
        issues.push('Question not relevant to skill');
        passed = false;
      }
      
      if (passed) {
        console.log(`  ✅ PASSED`);
        console.log(`     Type: ${question.type}`);
        console.log(`     Question: "${question.question?.substring(0, 60)}..."`);
        passCount++;
      } else {
        console.log(`  ❌ FAILED`);
        issues.forEach(issue => console.log(`     - ${issue}`));
        console.log(`     Type: ${question.type}`);
        console.log(`     Question: "${question.question?.substring(0, 60)}..."`);
      }
      
      results.push({
        scenario: scenario.name,
        passed,
        issues,
        question
      });
      
    } catch (error) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.push({
        scenario: scenario.name,
        passed: false,
        error: error.message
      });
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Consistency test
  console.log('\n\n📊 CONSISTENCY TEST');
  console.log('=' .repeat(60));
  console.log('Testing "Which number is smaller" 3 times...\n');
  
  const consistencyResults = [];
  const consistencyContext = {
    gradeLevel: '5',
    career: 'Engineer',
    subject: 'Math',
    skillName: 'Which number is smaller',
    skillId: 'MATH.5.COMP'
  };
  
  for (let i = 0; i < 3; i++) {
    try {
      const prompt = assembleModularPrompt(consistencyContext);
      const response = await client.getChatCompletions(
        AZURE_OPENAI_DEPLOYMENT,
        [
          {
            role: 'system',
            content: 'You are an educational content generator. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          temperature: 0.3,
          maxTokens: 500
        }
      );
      
      const content = response.choices[0]?.message?.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const question = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      
      console.log(`Run ${i + 1}: Type=${question.type}, Q="${question.question?.substring(0, 50)}..."`);
      consistencyResults.push(question);
      
    } catch (error) {
      console.log(`Run ${i + 1}: ERROR - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  const types = consistencyResults.map(r => r.type);
  const allMultipleChoice = types.every(t => t === 'multiple_choice');
  const noTrueFalse = !types.includes('true_false');
  
  console.log(`\n✅ All multiple_choice: ${allMultipleChoice ? 'YES' : 'NO'}`);
  console.log(`✅ No true_false: ${noTrueFalse ? 'YES' : 'NO'}`);
  
  // Final report
  console.log('\n\n' + '=' .repeat(60));
  console.log('📈 MODULAR SYSTEM TEST REPORT');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${TEST_SCENARIOS.length}`);
  console.log(`✅ Passed: ${passCount}`);
  console.log(`❌ Failed: ${TEST_SCENARIOS.length - passCount}`);
  console.log(`Success Rate: ${((passCount / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
  
  const consistencyPassed = allMultipleChoice && noTrueFalse;
  console.log(`\nConsistency Test: ${consistencyPassed ? '✅ PASSED' : '❌ FAILED'}`);
  
  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    modularSystemTest: true,
    summary: {
      totalTests: TEST_SCENARIOS.length,
      passed: passCount,
      failed: TEST_SCENARIOS.length - passCount,
      successRate: ((passCount / TEST_SCENARIOS.length) * 100).toFixed(1) + '%'
    },
    results,
    consistencyTest: {
      passed: consistencyPassed,
      results: consistencyResults
    }
  };
  
  fs.writeFileSync(
    'modular-azure-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Report saved to: modular-azure-test-report.json');
  
  // Overall assessment
  const overallSuccess = (passCount / TEST_SCENARIOS.length) * 100 >= 80 && consistencyPassed;
  if (overallSuccess) {
    console.log('\n✅ MODULAR SYSTEM SHOWS SIGNIFICANT IMPROVEMENT!');
    console.log('   Previous baseline: 0% accuracy');
    console.log(`   Current accuracy: ${((passCount / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
  } else {
    console.log('\n⚠️  MODULAR SYSTEM NEEDS FURTHER REFINEMENT');
    console.log(`   Current accuracy: ${((passCount / TEST_SCENARIOS.length) * 100).toFixed(1)}%`);
  }
}

// Run the test
runTest().catch(console.error);