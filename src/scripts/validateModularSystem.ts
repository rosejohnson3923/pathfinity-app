/**
 * Validate Modular System Against Original Problem
 * =================================================
 * Tests the exact scenario that was failing: "Which number is smaller: -10 or -5?"
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!AZURE_ENDPOINT || !AZURE_KEY) {
  console.error('❌ Missing Azure OpenAI credentials');
  process.exit(1);
}

// The EXACT problem scenario that was failing
const PROBLEM_SCENARIO = {
  gradeLevel: '5',
  career: 'Engineer',
  subject: 'Math',
  skillName: 'Which number is smaller: -10 or -5',
  skillId: 'MATH.5.NBT.3'
};

// Additional "which" scenarios that must work
const WHICH_SCENARIOS = [
  {
    name: 'Which number is larger',
    context: {
      gradeLevel: '4',
      career: 'Scientist',
      subject: 'Math',
      skillName: 'Which number is larger: 345 or 354',
      skillId: 'MATH.4.NBT.2'
    }
  },
  {
    name: 'Which fraction is greater',
    context: {
      gradeLevel: '5',
      career: 'Chef',
      subject: 'Math',
      skillName: 'Which fraction is greater: 2/3 or 3/4',
      skillId: 'MATH.5.NF.2'
    }
  },
  {
    name: 'Which shape has more sides',
    context: {
      gradeLevel: '2',
      career: 'Artist',
      subject: 'Math',
      skillName: 'Which shape has more sides: triangle or pentagon',
      skillId: 'MATH.2.G.1'
    }
  },
  {
    name: 'Which word comes first alphabetically',
    context: {
      gradeLevel: '3',
      career: 'Teacher',
      subject: 'ELA',
      skillName: 'Which word comes first alphabetically',
      skillId: 'ELA.3.L.2'
    }
  }
];

function assembleModularPrompt(context: any): string {
  const parts: string[] = [];
  
  // CRITICAL enforcement for "which" questions
  const skillLower = context.skillName.toLowerCase();
  const isWhichQuestion = skillLower.includes('which');
  
  if (isWhichQuestion) {
    parts.push('🚨 CRITICAL REQUIREMENT 🚨');
    parts.push('This is a "WHICH" question - it MUST be multiple_choice type!');
    parts.push('NEVER use true_false for any question that starts with "which"!');
    parts.push('The question should present options to choose from.');
    parts.push('');
  }
  
  parts.push('Generate an educational question with these specifications:');
  parts.push('');
  
  // Grade level
  parts.push(`GRADE LEVEL: ${context.gradeLevel}`);
  const gradeNum = context.gradeLevel === 'K' ? 0 : parseInt(context.gradeLevel);
  if (gradeNum <= 2) {
    parts.push('- Use simple, clear language');
  } else if (gradeNum <= 5) {
    parts.push('- Use grade-appropriate vocabulary');
  } else {
    parts.push('- Use more advanced vocabulary');
  }
  
  // Subject and skill
  parts.push('');
  parts.push(`SUBJECT: ${context.subject}`);
  parts.push(`SKILL TO TEST: ${context.skillName}`);
  parts.push('The question MUST directly address this exact skill.');
  
  // Career
  parts.push('');
  parts.push(`CAREER CONTEXT: ${context.career}`);
  parts.push('Include career-related context if natural.');
  
  // Question type rules
  parts.push('');
  parts.push('QUESTION TYPE DETERMINATION:');
  
  if (isWhichQuestion) {
    parts.push('✅ MUST be "multiple_choice" (this is a "which" question)');
    parts.push('❌ CANNOT be "true_false"');
    parts.push('Provide 4 distinct options to choose from');
  } else if (skillLower.includes('counting')) {
    parts.push('✅ Use "counting" type with visual elements');
  } else {
    parts.push('Choose appropriate type based on skill');
  }
  
  // Output format
  parts.push('');
  parts.push('REQUIRED JSON FORMAT:');
  parts.push(JSON.stringify({
    type: isWhichQuestion ? 'multiple_choice' : 'multiple_choice | true_false | counting | numeric',
    question: 'The question text addressing the skill',
    options: isWhichQuestion ? ['Option A', 'Option B', 'Option C', 'Option D'] : '(if multiple_choice)',
    correct_answer: 'index or value',
    explanation: 'Brief explanation'
  }, null, 2));
  
  parts.push('');
  parts.push('Generate the question now. Remember: "which" = multiple_choice!');
  
  return parts.join('\n');
}

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
          content: 'You are an educational content generator. Respond only with valid JSON, no extra text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 500
    })
  });
  
  if (!response.ok) {
    throw new Error(`Azure API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  return JSON.parse(jsonMatch[0]);
}

async function validateModularSystem() {
  console.log('🎯 VALIDATING FIX FOR ORIGINAL PROBLEM');
  console.log('=' .repeat(60));
  console.log('Original issue: "Which number is smaller: -10 or -5?"');
  console.log('Was showing as: true_false ❌');
  console.log('Should be: multiple_choice ✅\n');
  
  // Test the exact original problem 5 times
  console.log('Testing original problem 5 times for consistency...\n');
  
  const originalResults: any[] = [];
  for (let i = 0; i < 5; i++) {
    try {
      const prompt = assembleModularPrompt(PROBLEM_SCENARIO);
      const question = await callAzureOpenAI(prompt);
      
      console.log(`Test ${i + 1}: Type=${question.type}`);
      console.log(`         Q: "${question.question?.substring(0, 60)}..."`);
      
      originalResults.push({
        type: question.type,
        question: question.question,
        options: question.options
      });
      
    } catch (error: any) {
      console.log(`Test ${i + 1}: ERROR - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // Check if all are multiple_choice
  const types = originalResults.map(r => r.type);
  const allCorrect = types.every(t => t === 'multiple_choice');
  const anyTrueFalse = types.includes('true_false');
  
  console.log('\n' + '-'.repeat(60));
  console.log('ORIGINAL PROBLEM VALIDATION:');
  console.log(`All multiple_choice: ${allCorrect ? '✅ YES' : '❌ NO'}`);
  console.log(`Any true_false: ${anyTrueFalse ? '❌ YES (BAD!)' : '✅ NO (GOOD!)'}`);
  
  if (allCorrect && !anyTrueFalse) {
    console.log('\n🎉 ORIGINAL PROBLEM IS FIXED!');
  } else {
    console.log('\n❌ ORIGINAL PROBLEM STILL BROKEN!');
  }
  
  // Test other "which" questions
  console.log('\n\n📊 TESTING OTHER "WHICH" QUESTIONS');
  console.log('=' .repeat(60));
  
  let whichPassCount = 0;
  const whichResults: any[] = [];
  
  for (const scenario of WHICH_SCENARIOS) {
    console.log(`\nTesting: ${scenario.name}`);
    console.log(`  Skill: ${scenario.context.skillName}`);
    
    try {
      const prompt = assembleModularPrompt(scenario.context);
      const question = await callAzureOpenAI(prompt);
      
      const isMultipleChoice = question.type === 'multiple_choice';
      const status = isMultipleChoice ? '✅' : '❌';
      
      console.log(`  Result: ${status} Type=${question.type}`);
      console.log(`          Q: "${question.question?.substring(0, 50)}..."`);
      
      if (isMultipleChoice) whichPassCount++;
      
      whichResults.push({
        scenario: scenario.name,
        passed: isMultipleChoice,
        type: question.type,
        question: question.question
      });
      
    } catch (error: any) {
      console.log(`  Result: ❌ ERROR - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 1200));
  }
  
  // Final report
  console.log('\n\n' + '=' .repeat(60));
  console.log('🏆 FINAL VALIDATION REPORT');
  console.log('=' .repeat(60));
  
  const originalFixed = allCorrect && !anyTrueFalse;
  const whichQuestionsFixed = whichPassCount === WHICH_SCENARIOS.length;
  
  console.log('\n1. ORIGINAL PROBLEM ("Which number is smaller: -10 or -5"):');
  console.log(`   Status: ${originalFixed ? '✅ FIXED' : '❌ STILL BROKEN'}`);
  console.log(`   Consistency: ${allCorrect ? '100%' : `${(originalResults.filter(r => r.type === 'multiple_choice').length / 5 * 100).toFixed(0)}%`} multiple_choice`);
  
  console.log('\n2. ALL "WHICH" QUESTIONS:');
  console.log(`   Status: ${whichQuestionsFixed ? '✅ ALL WORKING' : '⚠️ PARTIALLY WORKING'}`);
  console.log(`   Pass rate: ${whichPassCount}/${WHICH_SCENARIOS.length} (${(whichPassCount / WHICH_SCENARIOS.length * 100).toFixed(0)}%)`);
  
  console.log('\n3. OVERALL ASSESSMENT:');
  if (originalFixed && whichQuestionsFixed) {
    console.log('   ✅✅✅ COMPLETE SUCCESS! The modular system has fixed the issue!');
    console.log('   All "which" questions now correctly generate as multiple_choice.');
  } else if (originalFixed) {
    console.log('   ✅ PRIMARY ISSUE FIXED! The original problem is resolved.');
    console.log('   Some edge cases may need refinement.');
  } else {
    console.log('   ❌ Issue persists. Further refinement needed.');
  }
  
  // Save validation report
  const report = {
    timestamp: new Date().toISOString(),
    validationType: 'original_problem_fix',
    originalProblem: {
      description: 'Which number is smaller: -10 or -5?',
      previousBehavior: 'Showing as true_false',
      expectedBehavior: 'Should be multiple_choice',
      currentStatus: originalFixed ? 'FIXED' : 'BROKEN',
      consistency: `${(originalResults.filter(r => r.type === 'multiple_choice').length / 5 * 100).toFixed(0)}%`,
      results: originalResults
    },
    whichQuestions: {
      totalTested: WHICH_SCENARIOS.length,
      passed: whichPassCount,
      passRate: `${(whichPassCount / WHICH_SCENARIOS.length * 100).toFixed(0)}%`,
      results: whichResults
    },
    conclusion: originalFixed ? 'PRIMARY_ISSUE_RESOLVED' : 'ISSUE_PERSISTS'
  };
  
  fs.writeFileSync(
    'modular-system-validation.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Validation report saved to: modular-system-validation.json');
}

// Run validation
validateModularSystem().catch(console.error);