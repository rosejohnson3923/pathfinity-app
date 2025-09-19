/**
 * Test Multi-Model System with Student Personas
 * Run: npx ts-node test/multi-model/test-personas.ts
 */

import { MultiModelService } from '../../src/services/ai-models/MultiModelService';
import { PromptContext } from '../../src/services/ai-prompts/PromptBuilder';
import { ModelRouter } from '../../src/services/ai-models/ModelRouter';

// Test personas
const PERSONAS = [
  { name: 'Sam', grade: 'K', expectedModel: 'phi-4' },
  { name: 'Alex', grade: '1', expectedModel: 'phi-4' },
  { name: 'Jordan', grade: '7', expectedModel: 'gpt-4o-mini' },
  { name: 'Taylor', grade: '10', expectedModel: 'gpt-4o' }
];

const SUBJECTS = ['MATH', 'ELA', 'SCIENCE', 'SOCIAL_STUDIES'];
const CONTAINERS = ['LEARN', 'ASSESSMENT', 'EXPERIENCE', 'DISCOVER'];

async function testPersona(persona: typeof PERSONAS[0]) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${persona.name} (Grade ${persona.grade})`);
  console.log('='.repeat(60));

  const multiModel = MultiModelService.getInstance({
    enableMultiModel: true,
    enableValidation: false,
    enableCostTracking: true
  });

  for (const subject of SUBJECTS) {
    for (const container of CONTAINERS) {
      const context: PromptContext = {
        studentProfile: {
          grade: persona.grade,
          id: persona.name.toLowerCase(),
          display_name: persona.name
        },
        subject: subject as any,
        container: container as any,
        career: { name: 'Coach', id: 'coach', description: 'Sports Coach' }
      };

      // Get model selection
      const selection = ModelRouter.selectModel(context);

      // Check if model matches expected (unless overridden)
      const expectedForContainer =
        container === 'EXPERIENCE' || container === 'DISCOVER'
          ? 'gpt-4o'
          : persona.expectedModel;

      const correct = selection.primary.name === expectedForContainer ? '✅' : '❌';

      console.log(
        `${correct} ${subject.padEnd(15)} ${container.padEnd(12)} → ${selection.primary.name.padEnd(15)} Cost: $${selection.estimatedCost.toFixed(4)}`
      );

      // Test actual generation for one case per persona
      if (subject === 'MATH' && container === 'LEARN') {
        await testGeneration(multiModel, context, persona);
      }
    }
  }
}

async function testGeneration(
  multiModel: MultiModelService,
  context: PromptContext,
  persona: typeof PERSONAS[0]
) {
  console.log(`\n  📝 Testing actual generation for ${persona.name}'s MATH LEARN...`);

  const prompt = `
Generate a simple counting question for a ${persona.grade} grade student.
Subject: MATH
Career context: Coach

Return JSON:
{
  "question": "...",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": "A",
  "explanation": "..."
}`;

  try {
    const start = Date.now();
    const result = await multiModel.generateContent(prompt, context);

    console.log(`  ✅ Generation successful!`);
    console.log(`  📊 Model used: ${result.modelUsed}`);
    console.log(`  ⏱️  Latency: ${result.latency}ms`);
    console.log(`  💰 Cost: $${result.cost.toFixed(4)}`);
    console.log(`  📈 Tokens: ${result.tokens.input} in / ${result.tokens.output} out`);

    if (result.routingDecision.isFallback) {
      console.log(`  🔄 Fallback used: ${result.routingDecision.fallbackReason}`);
    }

    // Verify content structure
    if (result.content && result.content.question) {
      console.log(`  ✅ Content structure valid`);
      console.log(`  📝 Question: ${result.content.question.substring(0, 50)}...`);
    }
  } catch (error) {
    console.error(`  ❌ Generation failed: ${error}`);
  }
}

async function testCostComparison() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('COST COMPARISON: Multi-Model vs GPT-4o Only');
  console.log('='.repeat(60));

  let multiModelTotal = 0;
  let gpt4oTotal = 0;

  for (const persona of PERSONAS) {
    let personaMultiCost = 0;
    let personaGPT4oCost = 0;

    for (const subject of SUBJECTS) {
      for (const container of CONTAINERS) {
        const context: PromptContext = {
          studentProfile: {
            grade: persona.grade,
            id: persona.name.toLowerCase(),
            display_name: persona.name
          },
          subject: subject as any,
          container: container as any
        };

        // Multi-model cost
        const selection = ModelRouter.selectModel(context);
        personaMultiCost += selection.estimatedCost;

        // GPT-4o cost (assuming 500 input, 600 output tokens)
        const gpt4oCost = (500 / 1000 * 2.50) + (600 / 1000 * 10.00);
        personaGPT4oCost += gpt4oCost;
      }
    }

    multiModelTotal += personaMultiCost;
    gpt4oTotal += personaGPT4oCost;

    const savings = ((1 - personaMultiCost / personaGPT4oCost) * 100).toFixed(1);
    console.log(
      `${persona.name.padEnd(10)} Grade ${persona.grade.padEnd(3)} ` +
      `Multi: $${personaMultiCost.toFixed(3)} ` +
      `GPT-4o: $${personaGPT4oCost.toFixed(3)} ` +
      `Savings: ${savings}%`
    );
  }

  const totalSavings = ((1 - multiModelTotal / gpt4oTotal) * 100).toFixed(1);
  console.log('\n' + '-'.repeat(60));
  console.log(
    `TOTAL: Multi-Model: $${multiModelTotal.toFixed(2)} | ` +
    `GPT-4o Only: $${gpt4oTotal.toFixed(2)} | ` +
    `SAVINGS: ${totalSavings}%`
  );
}

async function main() {
  console.log('🚀 Multi-Model System Test Suite');
  console.log('Testing with Student Personas\n');

  // Test model health
  const health = ModelRouter.getModelHealth();
  console.log('Model Health Status:');
  Object.entries(health).forEach(([model, status]) => {
    const icon = status.healthy ? '✅' : '❌';
    console.log(`  ${icon} ${model}: ${status.healthy ? 'Healthy' : `${status.recentFailures} failures`}`);
  });

  // Test each persona
  for (const persona of PERSONAS) {
    await testPersona(persona);
  }

  // Show cost comparison
  await testCostComparison();

  // Get final metrics
  const multiModel = MultiModelService.getInstance();
  const metrics = await multiModel.getMetrics();

  console.log(`\n${'='.repeat(60)}`);
  console.log('SESSION METRICS');
  console.log('='.repeat(60));
  console.log(`Total Requests: ${metrics.totalRequests}`);
  console.log(`Total Cost: $${metrics.totalCost.toFixed(4)}`);
  console.log(`Average Cost per Request: $${metrics.averageCostPerRequest.toFixed(4)}`);
  console.log('\nRequests by Model:');
  Object.entries(metrics.requestsByModel).forEach(([model, count]) => {
    console.log(`  ${model}: ${count} requests`);
  });
}

// Run tests
main().catch(console.error);