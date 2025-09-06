#!/usr/bin/env npx tsx

/**
 * Direct test to OpenAI to check for token limitation issues with fill_blank questions
 */

import { config } from 'dotenv';
import * as path from 'path';

// Load environment variables
config({ path: path.resolve(process.cwd(), '.env.local') });

// Set import.meta.env for compatibility
(globalThis as any).import = {
  meta: {
    env: {
      ...process.env,
      VITE_USE_KEY_VAULT: process.env.VITE_USE_KEY_VAULT || 'false'
    }
  }
};

import { azureOpenAIService } from '../services/azureOpenAIService';

async function testDirectOpenAI() {
  console.log('🔬 Testing Direct OpenAI for fill_blank generation...\n');
  
  const testPrompt = `
You are an educational content creator. Generate a fill_blank question for ELA, Grade 5.

IMPORTANT: Generate COMPLETE sentences, not truncated or cut off!

Generate ONE fill_blank question in JSON format:
{
  "question": "COMPLETE SENTENCE HERE",
  "type": "fill_blank",
  "explanation": "Why this is the answer",
  "hint": "Helpful hint"
}

The question should be about identifying main ideas in text, integrated with a Surgeon career context.

Example of what we want:
{
  "question": "A surgeon carefully reviews a patient's medical history before performing surgery.",
  "type": "fill_blank",
  "explanation": "The answer is 'patient's' because surgeons must review patient medical histories",
  "hint": "Think about whose records a doctor examines"
}

Now generate a NEW fill_blank question about main ideas with surgeon context. 
Make sure the sentence is COMPLETE and not cut off with ... or truncated!
`;

  try {
    console.log('Sending request to Azure OpenAI...\n');
    console.log('Prompt length:', testPrompt.length, 'characters\n');
    
    // Test with different token limits
    const tokenLimits = [500, 1000, 2000];
    
    for (const maxTokens of tokenLimits) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Testing with maxTokens: ${maxTokens}`);
      console.log('='.repeat(60));
      
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o',
        testPrompt,
        'You are an expert educational content creator.',
        { 
          temperature: 0.7, 
          maxTokens: maxTokens,
          jsonMode: true 
        }
      );
      
      console.log('\nRaw response length:', response.length, 'characters');
      
      try {
        const parsed = JSON.parse(response);
        console.log('\nParsed response:');
        console.log(JSON.stringify(parsed, null, 2));
        
        // Check if question is complete
        const question = parsed.question || '';
        const isComplete = !question.includes('…') && 
                          !question.includes('...') && 
                          !question.endsWith(' a ') && 
                          !question.endsWith(' the ') &&
                          question.length > 20;
        
        console.log('\nQuestion analysis:');
        console.log('- Length:', question.length);
        console.log('- Complete?', isComplete ? '✅' : '❌');
        console.log('- Has ellipsis?', question.includes('…') || question.includes('...') ? '❌ Yes' : '✅ No');
        
      } catch (parseError) {
        console.error('Failed to parse JSON:', parseError);
        console.log('Raw response:', response);
      }
    }
    
    // Also test without specifying maxTokens (use default)
    console.log(`\n${'='.repeat(60)}`);
    console.log('Testing with DEFAULT maxTokens');
    console.log('='.repeat(60));
    
    const defaultResponse = await azureOpenAIService.generateWithModel(
      'gpt4o',
      testPrompt,
      'You are an expert educational content creator.',
      { 
        temperature: 0.7,
        jsonMode: true 
      }
    );
    
    console.log('\nRaw response length:', defaultResponse.length, 'characters');
    
    try {
      const parsed = JSON.parse(defaultResponse);
      console.log('\nParsed response:');
      console.log(JSON.stringify(parsed, null, 2));
      
      const question = parsed.question || '';
      const isComplete = !question.includes('…') && 
                        !question.includes('...') && 
                        !question.endsWith(' a ') && 
                        !question.endsWith(' the ') &&
                        question.length > 20;
      
      console.log('\nQuestion analysis:');
      console.log('- Length:', question.length);
      console.log('- Complete?', isComplete ? '✅' : '❌');
      
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.log('Raw response:', defaultResponse);
    }
    
  } catch (error) {
    console.error('Error calling OpenAI:', error);
  }
}

// Run the test
testDirectOpenAI().catch(console.error);