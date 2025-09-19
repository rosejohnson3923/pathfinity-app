/**
 * Simple test for multi-model routing logic
 */

import { getModelForGrade } from '../services/ai-models/ModelCapabilities';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

// Load multi-model configuration
if (fs.existsSync('.env.multimodel')) {
  dotenv.config({ path: '.env.multimodel' });
}

interface TestCase {
  name: string;
  grade: string;
  subject: string;
  expectedModel: string;
}

const testCases: TestCase[] = [
  {
    name: 'Sam (K) - Math',
    grade: 'K',
    subject: 'Math',
    expectedModel: 'phi-4'
  },
  {
    name: 'Alex (1st) - Reading',
    grade: '1',
    subject: 'ELA',
    expectedModel: 'phi-4'
  },
  {
    name: 'Grade 2 - Science',
    grade: '2',
    subject: 'Science',
    expectedModel: 'phi-4'
  },
  {
    name: 'Grade 3 - Math',
    grade: '3',
    subject: 'Math',
    expectedModel: 'gpt-35-turbo'
  },
  {
    name: 'Grade 5 - ELA',
    grade: '5',
    subject: 'ELA',
    expectedModel: 'gpt-35-turbo'
  },
  {
    name: 'Jordan (7th) - ELA',
    grade: '7',
    subject: 'ELA',
    expectedModel: 'gpt-4o-mini'
  },
  {
    name: 'Grade 8 - Science',
    grade: '8',
    subject: 'Science',
    expectedModel: 'gpt-4o-mini'
  },
  {
    name: 'Taylor (10th) - Math',
    grade: '10',
    subject: 'Math',
    expectedModel: 'gpt-4o'
  },
  {
    name: 'Grade 12 - AP Physics',
    grade: '12',
    subject: 'Science',
    expectedModel: 'gpt-4o'
  }
];

function testModelRouting() {
  console.log('🚀 Multi-Model Routing Test\n');
  console.log('Configuration:');
  console.log('- Multi-Model Enabled:', process.env.ENABLE_MULTI_MODEL === 'true');
  console.log('- Target Grades:', process.env.MULTI_MODEL_TARGET_GRADES);
  console.log('\n' + '='.repeat(60) + '\n');

  let passed = 0;
  let failed = 0;

  // Test grade-based routing
  console.log('📊 Grade-Based Model Selection:\n');

  for (const testCase of testCases) {
    const model = getModelForGrade(testCase.grade);
    const modelName = model?.name || 'unknown';
    const matches = modelName === testCase.expectedModel;

    console.log(`${testCase.name}:`);
    console.log(`  Grade ${testCase.grade} → ${modelName} ${matches ? '✅' : '❌'}`);

    if (!matches) {
      console.log(`  Expected: ${testCase.expectedModel}`);
      failed++;
    } else {
      passed++;
    }

    if (model) {
      console.log(`  Cost: Input $${(model.costPerMilTokensInput / 1000).toFixed(6)}/1K, Output $${(model.costPerMilTokensOutput / 1000).toFixed(6)}/1K`);
      console.log(`  Context: ${model.contextWindow.toLocaleString()} tokens`);
    }
    console.log();
  }

  // Cost comparison
  console.log('\n' + '='.repeat(60));
  console.log('💰 Cost Comparison (per 1000 questions):\n');

  const grades = ['K', '1', '2', '3', '5', '7', '9', '11'];
  let multiModelCost = 0;
  let gpt4oCost = 0;

  for (const grade of grades) {
    const model = getModelForGrade(grade);
    if (model) {
      // Assume 500 input tokens, 200 output tokens per question
      const costPerQuestion = (model.costPerMilTokensInput * 0.5 / 1000) + (model.costPerMilTokensOutput * 0.2 / 1000);
      multiModelCost += costPerQuestion * 1000;

      // GPT-4o cost for comparison (roughly $5 per 1M input, $15 per 1M output)
      const gpt4oQuestionCost = (5 * 0.5 / 1000) + (15 * 0.2 / 1000);
      gpt4oCost += gpt4oQuestionCost * 1000;

      console.log(`Grade ${grade.padEnd(2)} - ${model.name.padEnd(20)} $${(costPerQuestion * 1000).toFixed(2)}`);
    }
  }

  console.log('\nTotal Multi-Model Cost: $' + multiModelCost.toFixed(2));
  console.log('Total GPT-4o Cost:      $' + gpt4oCost.toFixed(2));
  console.log('Savings:                $' + (gpt4oCost - multiModelCost).toFixed(2) +
                ` (${((1 - multiModelCost/gpt4oCost) * 100).toFixed(1)}%)`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📈 Test Summary:\n');
  console.log(`Passed: ${passed}/${testCases.length}`);
  console.log(`Failed: ${failed}/${testCases.length}`);

  if (failed === 0) {
    console.log('\n✅ All routing tests passed!');
  } else {
    console.log('\n⚠️  Some routing tests failed. Check the model mappings.');
  }

  return passed === testCases.length;
}

// Run the test
const success = testModelRouting();
process.exit(success ? 0 : 1);