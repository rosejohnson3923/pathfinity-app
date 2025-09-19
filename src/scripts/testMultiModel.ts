import { MultiModelService } from '../services/ai-models/MultiModelService';
import { ModelRouter } from '../services/ai-models/ModelRouter';
import { PromptAdapter } from '../services/ai-models/PromptAdapter';
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
  skill: string;
  prompt: string;
  expectedModel?: string;
}

const testCases: TestCase[] = [
  {
    name: 'Sam (K) - Math Counting',
    grade: 'K',
    subject: 'Math',
    skill: 'Counting to 10',
    prompt: 'Create a counting question for kindergarten about basketballs',
    expectedModel: 'phi-4' // Should use efficient model for K
  },
  {
    name: 'Alex (1st) - Reading',
    grade: '1',
    subject: 'ELA',
    skill: 'Sight Words',
    prompt: 'Create a sight word recognition question for 1st grade',
    expectedModel: 'phi-4' // Should use efficient model for Grade 1
  },
  {
    name: 'Jordan (7th) - ELA Main Idea',
    grade: '7',
    subject: 'ELA',
    skill: 'Main Idea',
    prompt: 'Create a main idea question with a reading passage for 7th grade',
    expectedModel: 'gpt-4o-mini' // Should use better model for complex content
  },
  {
    name: 'Taylor (10th) - Advanced Math',
    grade: '10',
    subject: 'Math',
    skill: 'Algebra II',
    prompt: 'Create a quadratic equation problem for 10th grade',
    expectedModel: 'gpt-4o' // Should use best model for advanced content
  }
];

async function testMultiModel() {
  console.log('🚀 Starting Multi-Model System Test\n');
  console.log('Configuration:');
  console.log('- Multi-Model Enabled:', process.env.ENABLE_MULTI_MODEL === 'true');
  console.log('- Validation Enabled:', process.env.ENABLE_VALIDATION === 'true');
  console.log('- Cost Tracking:', process.env.ENABLE_COST_TRACKING === 'true');
  console.log('- Target Grades:', process.env.MULTI_MODEL_TARGET_GRADES);
  console.log('- Debug Mode:', process.env.MULTI_MODEL_DEBUG === 'true');
  console.log('\n' + '='.repeat(60) + '\n');

  const multiModelService = new MultiModelService();
  const promptAdapter = new PromptAdapter();

  const results = [];

  for (const testCase of testCases) {
    console.log(`\n📝 Test Case: ${testCase.name}`);
    console.log(`   Grade: ${testCase.grade}, Subject: ${testCase.subject}`);

    try {
      // Determine which model to use
      const modelSelection = ModelRouter.routeRequest({
        studentProfile: {
          grade: testCase.grade,
          subject: testCase.subject
        },
        promptType: 'content_generation',
        content: testCase.prompt
      });

      console.log(`   Selected Model: ${modelSelection.name}`);
      console.log(`   Reason: Grade ${testCase.grade} - ${testCase.subject}`);

      if (testCase.expectedModel) {
        const matches = modelSelection.name === testCase.expectedModel;
        console.log(`   Expected: ${testCase.expectedModel} - ${matches ? '✅' : '❌'}`);
      }

      // Adapt the prompt for the selected model
      const adaptedPrompt = promptAdapter.adaptPrompt(
        testCase.prompt,
        modelSelection.name,
        {
          grade: testCase.grade,
          subject: testCase.subject,
          skill: testCase.skill
        }
      );

      console.log(`   Prompt adapted: ${adaptedPrompt.substring(0, 100)}...`);

      // Generate content (mock for now if API keys not set)
      if (process.env.AZURE_SWEDEN_API_KEY || process.env.AZURE_EASTUS_API_KEY) {
        const startTime = Date.now();

        const response = await multiModelService.generateContent({
          grade: testCase.grade,
          subject: testCase.subject,
          skill: testCase.skill,
          contentType: 'question',
          prompt: testCase.prompt
        });

        const endTime = Date.now();
        const latency = endTime - startTime;

        console.log(`   ✅ Content generated in ${latency}ms`);
        console.log(`   Model used: ${response.modelUsed}`);
        console.log(`   Validated: ${response.validated ? '✅' : '⏭️'}`);

        if (response.cost) {
          console.log(`   Cost: $${response.cost.toFixed(6)}`);
        }

        results.push({
          testCase: testCase.name,
          model: response.modelUsed,
          latency,
          cost: response.cost,
          validated: response.validated,
          success: true
        });
      } else {
        console.log(`   ⚠️  Skipping actual API call (no API keys configured)`);
        console.log(`   Would use model: ${modelSelection.name}`);

        results.push({
          testCase: testCase.name,
          model: modelSelection.name,
          latency: 0,
          cost: 0,
          validated: false,
          success: false,
          reason: 'No API keys'
        });
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      results.push({
        testCase: testCase.name,
        model: 'N/A',
        latency: 0,
        cost: 0,
        validated: false,
        success: false,
        error: error.message
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary\n');

  const successful = results.filter(r => r.success).length;
  const totalCost = results.reduce((sum, r) => sum + (r.cost || 0), 0);
  const avgLatency = results.reduce((sum, r) => sum + r.latency, 0) / results.length;

  console.log(`Total Tests: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${results.length - successful}`);
  console.log(`Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`Avg Latency: ${avgLatency.toFixed(0)}ms`);

  console.log('\nModel Usage:');
  const modelUsage = results.reduce((acc, r) => {
    acc[r.model] = (acc[r.model] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(modelUsage).forEach(([model, count]) => {
    console.log(`  ${model}: ${count} times`);
  });

  // Cost comparison
  console.log('\n💰 Cost Analysis:');
  console.log('If all used GPT-4o:');
  const gpt4oCost = results.length * 0.005; // Rough estimate
  console.log(`  Estimated cost: $${gpt4oCost.toFixed(6)}`);
  console.log(`  Actual cost: $${totalCost.toFixed(6)}`);
  console.log(`  Savings: $${(gpt4oCost - totalCost).toFixed(6)} (${((1 - totalCost/gpt4oCost) * 100).toFixed(1)}%)`);

  return results;
}

// Run the test
testMultiModel()
  .then(() => {
    console.log('\n✅ Multi-Model test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

export { testMultiModel };