/**
 * Modular System Test - Iteration 2
 * ==================================
 * Enhanced testing with more validation criteria
 * Goal: Achieve 95%+ accuracy through iterative improvement
 */

import fetch from 'node-fetch';
import * as fs from 'fs';
import * as dotenv from 'dotenv';
import { modularPromptSystem } from '../services/prompts/PromptArchitecture';

// Load environment variables
dotenv.config();

const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const DEPLOYMENT_NAME = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4o';

if (!AZURE_ENDPOINT || !AZURE_KEY) {
  console.error('❌ Missing Azure OpenAI credentials');
  process.exit(1);
}

// Enhanced test matrix focusing on problem areas from iteration 1
const TEST_MATRIX = [
  // High school fixes (previous failures)
  { 
    grade: '11', 
    career: 'Teacher', 
    subject: 'Math', 
    skill: 'Trigonometry - Finding sin(60°)', 
    expectedType: ['numeric', 'multiple_choice'],
    validation: {
      mustContain: ['sin', 'trig', '60', 'angle'],
      gradeAppropriate: true,
      careerRelevant: true
    }
  },
  { 
    grade: '12', 
    career: 'Police Officer', 
    subject: 'Social Studies', 
    skill: 'Constitutional Rights - Fourth Amendment', 
    expectedType: ['multiple_choice', 'true_false'],
    validation: {
      mustContain: ['right', 'amendment', 'constitution'],
      gradeAppropriate: true
    }
  },
  { 
    grade: '11', 
    career: 'Writer', 
    subject: 'ELA', 
    skill: 'Literary Analysis of Themes', 
    expectedType: ['multiple_choice'],  // Removed long_answer
    validation: {
      mustContain: ['theme', 'literary', 'analyze'],
      gradeAppropriate: true
    }
  },
  { 
    grade: '12', 
    career: 'Doctor', 
    subject: 'Science', 
    skill: 'Genetics and DNA Structure', 
    expectedType: ['multiple_choice'],
    validation: {
      mustContain: ['DNA', 'genetic', 'gene'],
      gradeAppropriate: true
    }
  },
  
  // Kindergarten shape fix (was counting, should be multiple_choice)
  { 
    grade: 'K', 
    career: 'Chef', 
    subject: 'Math', 
    skill: 'Shapes Recognition - Circle, Square, Triangle', 
    expectedType: ['multiple_choice'],
    validation: {
      mustContain: ['shape', 'circle', 'square', 'triangle'],
      mustBeSimple: true,
      noComplexWords: true
    }
  },
  
  // Critical "which" questions - ensure they stay fixed
  { 
    grade: '5', 
    career: 'Engineer', 
    subject: 'Math', 
    skill: 'Which number is smaller: -10 or -5', 
    expectedType: ['multiple_choice'],
    notType: 'true_false',
    validation: {
      mustContain: ['which', 'smaller', '-10', '-5'],
      criticalWhichQuestion: true
    }
  },
  { 
    grade: '4', 
    career: 'Chef', 
    subject: 'Math', 
    skill: 'Which fraction is larger: 1/2 or 1/3', 
    expectedType: ['multiple_choice'],
    notType: 'true_false',
    validation: {
      mustContain: ['which', 'fraction', '1/2', '1/3'],
      criticalWhichQuestion: true
    }
  },
  
  // Additional comprehensive coverage
  { 
    grade: '1', 
    career: 'Doctor', 
    subject: 'ELA', 
    skill: 'Identifying Beginning Sounds', 
    expectedType: ['multiple_choice'],
    validation: {
      mustContain: ['sound', 'begin', 'letter'],
      mustBeSimple: true
    }
  },
  { 
    grade: '3', 
    career: 'Scientist', 
    subject: 'Science', 
    skill: 'Plant Life Cycle', 
    expectedType: ['multiple_choice', 'true_false'],
    validation: {
      mustContain: ['plant', 'grow', 'seed', 'life'],
      gradeAppropriate: true
    }
  },
  { 
    grade: '6', 
    career: 'Artist', 
    subject: 'Math', 
    skill: 'Finding Area of Complex Shapes', 
    expectedType: ['numeric', 'multiple_choice'],
    validation: {
      mustContain: ['area', 'shape', 'square', 'calculate'],
      gradeAppropriate: true
    }
  },
  { 
    grade: '8', 
    career: 'Engineer', 
    subject: 'Science', 
    skill: 'Newton\'s Laws of Motion', 
    expectedType: ['multiple_choice'],
    validation: {
      mustContain: ['Newton', 'force', 'motion', 'law'],
      gradeAppropriate: true
    }
  },
  { 
    grade: '10', 
    career: 'Writer', 
    subject: 'ELA', 
    skill: 'Identifying Rhetorical Devices', 
    expectedType: ['multiple_choice'],
    validation: {
      mustContain: ['rhetorical', 'device', 'metaphor', 'simile'],
      gradeAppropriate: true
    }
  }
];

// Enhanced validation function with more criteria
function validateQuestion(question: any, test: any): { 
  passed: boolean; 
  score: number; 
  issues: string[]; 
  strengths: string[] 
} {
  const issues: string[] = [];
  const strengths: string[] = [];
  let score = 100; // Start at 100 and deduct points
  
  const questionText = typeof question.question === 'string' 
    ? question.question.toLowerCase() 
    : JSON.stringify(question).toLowerCase();
  const gradeNum = test.grade === 'K' ? 0 : parseInt(test.grade);
  
  // 1. Type validation (Critical - 40 points)
  if (test.notType && question.type === test.notType) {
    issues.push(`CRITICAL: Type cannot be ${test.notType}`);
    score -= 40;
  } else if (test.expectedType && !test.expectedType.includes(question.type)) {
    issues.push(`Type should be: ${test.expectedType.join(' or ')}, got ${question.type}`);
    score -= 30;
  } else {
    strengths.push(`Correct type: ${question.type}`);
  }
  
  // 2. Content validation (20 points)
  if (test.validation?.mustContain) {
    const missing = test.validation.mustContain.filter((term: string) => 
      !questionText.includes(term.toLowerCase())
    );
    
    if (missing.length > 0) {
      // Check for acceptable alternatives
      const stillRelevant = 
        (missing.includes('trig') && questionText.includes('trigonometr')) ||
        (missing.includes('genetic') && questionText.includes('gene')) ||
        (missing.includes('analyze') && questionText.includes('analys'));
      
      if (!stillRelevant && missing.length > test.validation.mustContain.length / 2) {
        issues.push(`Missing key terms: ${missing.join(', ')}`);
        score -= 20;
      } else if (missing.length > 0) {
        issues.push(`Missing some terms: ${missing.join(', ')}`);
        score -= 10;
      }
    } else {
      strengths.push('All required terms present');
    }
  }
  
  // 3. Grade appropriateness (20 points)
  if (test.validation?.gradeAppropriate) {
    const complexWords = ['synthesize', 'hypothesize', 'extrapolate', 'derivative'];
    const hasComplexWords = complexWords.some(word => questionText.includes(word));
    
    if (gradeNum <= 8 && hasComplexWords) {
      issues.push('Language too complex for grade level');
      score -= 15;
    } else if (gradeNum >= 9 && questionText.length < 50) {
      issues.push('Question may be too simple for high school');
      score -= 10;
    } else {
      strengths.push('Grade-appropriate language');
    }
  }
  
  // 4. Simplicity check for K-2 (15 points)
  if (test.validation?.mustBeSimple) {
    const avgWordLength = questionText.split(' ')
      .filter(w => w.length > 0)
      .reduce((sum, word) => sum + word.length, 0) / questionText.split(' ').length;
    
    if (avgWordLength > 6) {
      issues.push('Words too complex for young learners');
      score -= 15;
    } else {
      strengths.push('Appropriately simple language');
    }
  }
  
  // 5. Career relevance (5 points)
  if (test.validation?.careerRelevant) {
    const careerMentioned = questionText.includes(test.career.toLowerCase());
    if (!careerMentioned) {
      issues.push('Career context missing');
      score -= 5;
    } else {
      strengths.push('Good career integration');
    }
  }
  
  // 6. Critical "which" question check (Critical)
  if (test.validation?.criticalWhichQuestion) {
    if (question.type !== 'multiple_choice') {
      issues.push('CRITICAL: "Which" question must be multiple_choice!');
      score = 0; // Automatic fail
    } else {
      strengths.push('✅ "Which" question correctly formatted');
    }
  }
  
  // 7. Options validation for multiple_choice (10 points)
  if (question.type === 'multiple_choice') {
    if (!question.options || question.options.length !== 4) {
      issues.push('Multiple choice should have exactly 4 options');
      score -= 10;
    } else {
      strengths.push('Proper multiple choice format');
    }
  }
  
  const passed = score >= 70; // 70% threshold for passing
  
  return { passed, score, issues, strengths };
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
          content: 'You are an educational content generator. You MUST respond with valid JSON only. No explanatory text before or after the JSON.'
        },
        {
          role: 'user',
          content: prompt + '\n\nRemember: Return ONLY valid JSON with these fields: type, question, options (if multiple_choice), correct_answer, explanation'
        }
      ],
      temperature: 0.2,  // Lower temperature for more consistent outputs
      max_tokens: 500
    })
  });
  
  if (!response.ok) {
    throw new Error(`Azure API error: ${response.status}`);
  }
  
  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  // Try to extract JSON more robustly
  let parsedQuestion;
  try {
    // First try: direct parse
    parsedQuestion = JSON.parse(content);
  } catch (e1) {
    try {
      // Second try: extract JSON from text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedQuestion = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (e2) {
      // Last resort: try to construct from content
      console.log('   ⚠️  Failed to parse JSON, raw content:', content?.substring(0, 100));
      throw new Error('Invalid JSON response from AI');
    }
  }
  
  // Ensure required fields exist
  if (!parsedQuestion.type) {
    console.log('   ⚠️  Missing type in response');
    parsedQuestion.type = 'multiple_choice'; // Default fallback
  }
  
  if (!parsedQuestion.question) {
    console.log('   ⚠️  Missing question in response');
    throw new Error('No question text in response');
  }
  
  return parsedQuestion;
}

async function runIteration2Test() {
  console.log('🚀 MODULAR SYSTEM TEST - ITERATION 2');
  console.log('=' .repeat(60));
  console.log('Enhanced validation with scoring system');
  console.log(`Testing ${TEST_MATRIX.length} scenarios with improvements\n`);
  
  const results: any[] = [];
  let totalScore = 0;
  let passCount = 0;
  let criticalPassCount = 0;
  let criticalTotal = 0;
  
  // Track improvements
  const problemAreasFixed: string[] = [];
  const stillProblematic: string[] = [];
  
  for (let i = 0; i < TEST_MATRIX.length; i++) {
    const test = TEST_MATRIX[i];
    const isCritical = test.validation?.criticalWhichQuestion || 
                       (test.grade === '11' || test.grade === '12');
    
    if (isCritical) criticalTotal++;
    
    console.log(`\n[${i + 1}/${TEST_MATRIX.length}] Grade ${test.grade}, ${test.career}, ${test.subject}`);
    console.log(`  Skill: ${test.skill} ${isCritical ? '⚠️' : ''}`);
    
    try {
      // Use the improved modular prompt system
      const prompt = modularPromptSystem.assemblePrompt({
        gradeLevel: test.grade,
        career: test.career,
        subject: test.subject,
        skillName: test.skill,
        skillId: `${test.subject}.${test.grade}.TEST`
      });
      
      const question = await callAzureOpenAI(prompt);
      
      // Enhanced validation
      const { passed, score, issues, strengths } = validateQuestion(question, test);
      
      totalScore += score;
      
      if (passed) {
        console.log(`  ✅ PASSED (Score: ${score}/100)`);
        strengths.forEach(s => console.log(`     + ${s}`));
        passCount++;
        if (isCritical) {
          criticalPassCount++;
          if (test.grade === '11' || test.grade === '12') {
            problemAreasFixed.push(`Grade ${test.grade} ${test.subject}`);
          }
        }
      } else {
        console.log(`  ❌ FAILED (Score: ${score}/100)`);
        issues.forEach(issue => console.log(`     - ${issue}`));
        if (test.grade === '11' || test.grade === '12') {
          stillProblematic.push(`Grade ${test.grade} ${test.subject}`);
        }
      }
      
      console.log(`     Type: ${question.type}`);
      console.log(`     Q: "${question.question?.substring(0, 60)}..."`);
      
      results.push({
        test,
        passed,
        score,
        isCritical,
        issues,
        strengths,
        question
      });
      
    } catch (error: any) {
      console.log(`  ❌ ERROR: ${error.message}`);
      results.push({
        test,
        passed: false,
        score: 0,
        error: error.message
      });
      totalScore += 0;
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Calculate metrics
  const avgScore = totalScore / TEST_MATRIX.length;
  const overallAccuracy = (passCount / TEST_MATRIX.length) * 100;
  const criticalAccuracy = criticalTotal > 0 ? (criticalPassCount / criticalTotal) * 100 : 100;
  
  // Report
  console.log('\n\n' + '=' .repeat(60));
  console.log('📊 ITERATION 2 RESULTS');
  console.log('=' .repeat(60));
  
  console.log('\n1. OVERALL METRICS:');
  console.log(`   Accuracy: ${passCount}/${TEST_MATRIX.length} (${overallAccuracy.toFixed(1)}%)`);
  console.log(`   Average Score: ${avgScore.toFixed(1)}/100`);
  console.log(`   Critical Tests: ${criticalPassCount}/${criticalTotal} (${criticalAccuracy.toFixed(1)}%)`);
  
  console.log('\n2. IMPROVEMENTS FROM ITERATION 1:');
  console.log(`   Previous: 83.9% accuracy`);
  console.log(`   Current: ${overallAccuracy.toFixed(1)}% accuracy`);
  console.log(`   Change: ${overallAccuracy > 83.9 ? '+' : ''}${(overallAccuracy - 83.9).toFixed(1)}%`);
  
  if (problemAreasFixed.length > 0) {
    console.log('\n3. FIXED PROBLEM AREAS:');
    [...new Set(problemAreasFixed)].forEach(area => console.log(`   ✅ ${area}`));
  }
  
  if (stillProblematic.length > 0) {
    console.log('\n4. STILL NEEDS WORK:');
    [...new Set(stillProblematic)].forEach(area => console.log(`   ❌ ${area}`));
  }
  
  console.log('\n5. ASSESSMENT:');
  if (overallAccuracy >= 95 && criticalAccuracy === 100) {
    console.log('   🎉 TARGET ACHIEVED! 95%+ accuracy with perfect critical tests');
  } else if (overallAccuracy >= 90) {
    console.log('   ✅ Excellent progress! Close to target');
  } else if (overallAccuracy > 83.9) {
    console.log('   📈 Improvement! Keep iterating');
  } else {
    console.log('   ⚠️  No improvement or regression - review changes');
  }
  
  // Save detailed report
  const report = {
    iteration: 2,
    timestamp: new Date().toISOString(),
    metrics: {
      accuracy: `${overallAccuracy.toFixed(1)}%`,
      averageScore: avgScore.toFixed(1),
      criticalAccuracy: `${criticalAccuracy.toFixed(1)}%`,
      passed: passCount,
      failed: TEST_MATRIX.length - passCount,
      total: TEST_MATRIX.length
    },
    comparison: {
      previousAccuracy: '83.9%',
      currentAccuracy: `${overallAccuracy.toFixed(1)}%`,
      improvement: `${(overallAccuracy - 83.9).toFixed(1)}%`
    },
    problemAreasFixed: [...new Set(problemAreasFixed)],
    stillProblematic: [...new Set(stillProblematic)],
    results
  };
  
  fs.writeFileSync(
    'iteration2-test-report.json',
    JSON.stringify(report, null, 2)
  );
  
  console.log('\n📄 Report saved to: iteration2-test-report.json');
  
  // Recommendations for next iteration
  if (overallAccuracy < 95) {
    console.log('\n📝 RECOMMENDATIONS FOR NEXT ITERATION:');
    const failedTests = results.filter(r => !r.passed);
    const commonIssues = new Map<string, number>();
    
    failedTests.forEach(test => {
      test.issues?.forEach((issue: string) => {
        commonIssues.set(issue, (commonIssues.get(issue) || 0) + 1);
      });
    });
    
    const sorted = Array.from(commonIssues.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    
    sorted.forEach(([issue, count]) => {
      console.log(`   - Fix: "${issue}" (${count} occurrences)`);
    });
  }
}

// Run iteration 2
runIteration2Test().catch(console.error);