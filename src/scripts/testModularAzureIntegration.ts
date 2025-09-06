/**
 * Test Modular Prompt System with Real Azure Integration
 * ========================================================
 * Tests the modular prompt architecture with actual Azure OpenAI calls
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Azure OpenAI Configuration
const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_KEY = process.env.VITE_AZURE_OPENAI_API_KEY; // Fixed variable name
const DEPLOYMENT_NAME = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!AZURE_ENDPOINT || !AZURE_KEY) {
  console.error('❌ Missing Azure OpenAI credentials');
  process.exit(1);
}

// Test scenarios - comprehensive coverage
const TEST_SCENARIOS = [
  {
    name: 'Which number comparison MUST be multiple_choice',
    context: {
      gradeLevel: '5',
      career: 'Engineer',
      subject: 'Math',
      skillName: 'Which number is smaller: comparing negative numbers',
      skillId: 'MATH.5.NBT.3'
    },
    expectedType: 'multiple_choice',
    notType: 'true_false',
    mustContain: ['which', 'smaller']
  },
  {
    name: 'Kindergarten counting with visuals',
    context: {
      gradeLevel: 'K',
      career: 'Doctor',
      subject: 'Math',
      skillName: 'Counting to 10',
      skillId: 'MATH.K.CC.1'
    },
    expectedType: 'counting',
    mustContain: ['count', 'how many']
  },
  {
    name: 'Letter recognition for 1st grade',
    context: {
      gradeLevel: '1',
      career: 'Teacher',
      subject: 'ELA',
      skillName: 'Letter Recognition',
      skillId: 'ELA.1.RF.1'
    },
    expectedType: 'multiple_choice',
    mustContain: ['letter']
  },
  {
    name: 'Fraction comparison MUST be multiple_choice',
    context: {
      gradeLevel: '4',
      career: 'Chef',
      subject: 'Math',
      skillName: 'Comparing Fractions',
      skillId: 'MATH.4.NF.2'
    },
    expectedType: 'multiple_choice',
    mustContain: ['fraction'],
    notType: 'true_false'
  },
  {
    name: 'Which shape question MUST be multiple_choice',
    context: {
      gradeLevel: '2',
      career: 'Artist',
      subject: 'Math',
      skillName: 'Which shape has more sides',
      skillId: 'MATH.2.G.1'
    },
    expectedType: 'multiple_choice',
    notType: 'true_false',
    mustContain: ['which', 'shape']
  }
];

// Assemble modular prompt
function assembleModularPrompt(context: any): string {
  const parts: string[] = [];
  
  // Critical instruction at the top
  parts.push('CRITICAL: You MUST generate a question that matches the exact requirements below.');
  parts.push('');
  
  // Determine if this is a "which" question
  const isWhichQuestion = context.skillName.toLowerCase().includes('which');
  const isComparison = context.skillName.toLowerCase().includes('compar');
  
  if (isWhichQuestion || isComparison) {
    parts.push('⚠️ CRITICAL REQUIREMENT: This is a comparison/selection question.');
    parts.push('This MUST be a multiple_choice question with 4 options.');
    parts.push('NEVER use true_false for "which" or comparison questions!');
    parts.push('');
  }
  
  // Grade-specific language
  const gradeLevel = context.gradeLevel;
  parts.push(`GRADE LEVEL ${gradeLevel} REQUIREMENTS:`);
  
  if (gradeLevel === 'K') {
    parts.push('- Use very simple words and short sentences');
    parts.push('- Include visual elements (emojis) when appropriate');
    parts.push('- Focus on concrete, visible concepts');
    parts.push('- Vocabulary: see, count, find, look, choose');
  } else if (parseInt(gradeLevel) <= 2) {
    parts.push('- Use simple, clear language');
    parts.push('- One idea per sentence');
    parts.push('- Concrete examples only');
  } else if (parseInt(gradeLevel) <= 5) {
    parts.push('- Grade-appropriate vocabulary');
    parts.push('- Clear, direct instructions');
    parts.push('- Can include multi-step problems');
  }
  
  // Subject and skill
  parts.push('');
  parts.push(`SUBJECT: ${context.subject}`);
  parts.push(`SKILL TO TEST: ${context.skillName}`);
  parts.push('The question MUST directly test this specific skill.');
  
  // Career context
  parts.push('');
  parts.push(`CAREER CONTEXT: ${context.career}`);
  parts.push(`Include ${context.career.toLowerCase()}-related context if natural.`);
  
  // Question type determination
  parts.push('');
  parts.push('QUESTION TYPE RULES:');
  
  if (context.skillName.toLowerCase().includes('counting')) {
    parts.push('✅ Use "counting" type with visual emojis');
  } else if (isWhichQuestion || isComparison) {
    parts.push('✅ MUST use "multiple_choice" type (4 options)');
    parts.push('❌ NEVER use "true_false" for this skill');
  } else if (context.skillName.toLowerCase().includes('true') || 
             context.skillName.toLowerCase().includes('false')) {
    parts.push('✅ Can use "true_false" type');
  } else {
    parts.push('✅ Default to "multiple_choice" with 4 options');
  }
  
  // Output format
  parts.push('');
  parts.push('OUTPUT FORMAT (strict JSON):');
  parts.push(JSON.stringify({
    type: 'multiple_choice | true_false | counting | numeric',
    question: 'The question text',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correct_answer: 0,
    explanation: 'Brief explanation'
  }, null, 2));
  
  parts.push('');
  parts.push('Generate the question now:');
  
  return parts.join('\n');
}

// Call Azure OpenAI
async function callAzureOpenAI(prompt: string): Promise<any> {
  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=2024-02-15-preview`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': AZURE_KEY!
    },
    body: JSON.stringify({
      messages: [
        {
          role: 'system',
          content: 'You are an educational content generator. Always respond with valid JSON only, no additional text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })
  });
  
  if (!response.ok) {
    throw new Error(`Azure API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

// Main test runner
async function runModularAzureTest() {
  console.log('🧪 TESTING MODULAR PROMPT SYSTEM WITH AZURE OPENAI');
  console.log('=' .repeat(60));
  console.log(`Testing ${TEST_SCENARIOS.length} critical scenarios`);
  console.log('Previous baseline: 0% accuracy\n');
  
  const results: any[] = [];
  let passCount = 0;
  
  for (let i = 0; i < TEST_SCENARIOS.length; i++) {
    const scenario = TEST_SCENARIOS[i];
    console.log(`\n[${i + 1}/${TEST_SCENARIOS.length}] ${scenario.name}`);
    console.log(`  Grade: ${scenario.context.gradeLevel}, Career: ${scenario.context.career}`);
    console.log(`  Skill: ${scenario.context.skillName}`);
    
    try {
      // Generate modular prompt
      const prompt = assembleModularPrompt(scenario.context);
      
      // Call Azure
      const question = await callAzureOpenAI(prompt);
      
      // Validate
      let passed = true;
      const issues: string[] = [];
      
      // Check type
      if (scenario.expectedType && question.type !== scenario.expectedType) {
        issues.push(`Expected ${scenario.expectedType}, got ${question.type}`);
        passed = false;
      }
      
      if (scenario.notType && question.type === scenario.notType) {
        issues.push(`CRITICAL: Should NOT be ${scenario.notType}!`);
        passed = false;
      }
      
      // Check content
      const questionText = (question.question || '').toLowerCase();
      
      if (scenario.mustContain) {
        const missing = scenario.mustContain.filter(term => 
          !questionText.includes(term.toLowerCase())
        );
        if (missing.length > 0) {
          issues.push(`Missing required terms: ${missing.join(', ')}`);
          passed = false;
        }
      }
      
      // Check skill relevance
      const skillWords = scenario.context.skillName.toLowerCase().split(' ')
        .filter((w: string) => w.length > 3);
      const hasRelevance = skillWords.some((word: string) => 
        questionText.includes(word)
      );
      
      if (!hasRelevance && !scenario.context.skillName.includes('Letter')) {
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
        console.log(`     Got type: ${question.type}`);
        console.log(`     Question: "${question.question?.substring(0, 60)}..."`);
      }
      
      results.push({
        scenario: scenario.name,
        passed,
        issues,
        question
      });
      
    } catch (error: any) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.push({
        scenario: scenario.name,
        passed: false,
        error: error.message
      });
    }
    
    // Rate limit delay
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  // Consistency test - the critical "which" question
  console.log('\n\n📊 CONSISTENCY TEST: "Which number is smaller"');
  console.log('=' .repeat(60));
  console.log('Testing 3 times to ensure it NEVER produces true_false...\n');
  
  const consistencyResults: any[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const prompt = assembleModularPrompt({
        gradeLevel: '5',
        career: 'Engineer',
        subject: 'Math',
        skillName: 'Which number is smaller: -10 or -5',
        skillId: 'MATH.5.COMP'
      });
      
      const question = await callAzureOpenAI(prompt);
      console.log(`Run ${i + 1}: Type=${question.type}, Q="${question.question?.substring(0, 50)}..."`);
      consistencyResults.push(question);
      
    } catch (error: any) {
      console.log(`Run ${i + 1}: ERROR - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
  
  const types = consistencyResults.map(r => r.type);
  const allMultipleChoice = types.every(t => t === 'multiple_choice');
  const noTrueFalse = !types.includes('true_false');
  
  console.log(`\n✅ All multiple_choice: ${allMultipleChoice ? 'YES ✓' : 'NO ✗'}`);
  console.log(`✅ No true_false: ${noTrueFalse ? 'YES ✓' : 'NO ✗'}`);
  
  // Final report
  console.log('\n\n' + '=' .repeat(60));
  console.log('📈 MODULAR SYSTEM IMPROVEMENT REPORT');
  console.log('=' .repeat(60));
  
  const successRate = (passCount / TEST_SCENARIOS.length) * 100;
  const consistencyPassed = allMultipleChoice && noTrueFalse;
  
  console.log('Previous System:');
  console.log('  - Accuracy: 0%');
  console.log('  - "Which" questions: Incorrectly classified as true_false');
  console.log('  - Skills relevance: Questions not matching skills');
  
  console.log('\nModular System:');
  console.log(`  - Accuracy: ${successRate.toFixed(1)}%`);
  console.log(`  - Passed: ${passCount}/${TEST_SCENARIOS.length}`);
  console.log(`  - Consistency: ${consistencyPassed ? 'PASSED ✓' : 'FAILED ✗'}`);
  
  if (successRate >= 80 && consistencyPassed) {
    console.log('\n🎉 SUCCESS! MODULAR SYSTEM SHOWS SIGNIFICANT IMPROVEMENT!');
    console.log(`   Improved from 0% to ${successRate.toFixed(1)}% accuracy`);
  } else if (successRate > 0) {
    console.log('\n⚠️  PARTIAL SUCCESS - Some improvement but needs refinement');
    console.log(`   Improved from 0% to ${successRate.toFixed(1)}% accuracy`);
  } else {
    console.log('\n❌ NO IMPROVEMENT - System still needs work');
  }
  
  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    testType: 'modular_azure_integration',
    previousBaseline: '0%',
    currentAccuracy: `${successRate.toFixed(1)}%`,
    summary: {
      totalTests: TEST_SCENARIOS.length,
      passed: passCount,
      failed: TEST_SCENARIOS.length - passCount,
      improvement: `+${successRate.toFixed(1)}%`
    },
    criticalFixes: {
      whichQuestions: consistencyPassed ? 'FIXED' : 'STILL BROKEN',
      skillRelevance: passCount > 0 ? 'IMPROVED' : 'NO CHANGE'
    },
    results,
    consistencyTest: {
      passed: consistencyPassed,
      results: consistencyResults
    }
  };
  
  fs.writeFileSync(
    'modular-azure-integration-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Detailed report saved to: modular-azure-integration-report.json');
}

// Run the test
runModularAzureTest().catch(console.error);