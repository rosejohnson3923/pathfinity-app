#!/usr/bin/env node

/**
 * Direct test to OpenAI API to check for token issues
 */

const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });

const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const DEPLOYMENT = process.env.VITE_AZURE_GPT4O_DEPLOYMENT || 'gpt-4o';

if (!AZURE_ENDPOINT || !AZURE_KEY) {
  console.error('Missing Azure OpenAI credentials in .env.local');
  process.exit(1);
}

async function testDirectOpenAI() {
  console.log('🔬 Testing Direct OpenAI for fill_blank generation...\n');
  console.log('Endpoint:', AZURE_ENDPOINT);
  console.log('Deployment:', DEPLOYMENT);
  console.log('Key length:', AZURE_KEY.length, '\n');
  
  const prompt = `
You are an educational content creator. Generate a fill_blank question for ELA, Grade 5.

IMPORTANT: Generate COMPLETE sentences, not truncated or cut off!

Generate ONE fill_blank question in JSON format:
{
  "question": "COMPLETE SENTENCE HERE with a blank marked as _____",
  "type": "fill_blank",
  "correct_answer": "the word that fills the blank",
  "explanation": "Why this is the answer",
  "hint": "Helpful hint"
}

The question should be about identifying main ideas in text, integrated with a Surgeon career context.

Example:
{
  "question": "A surgeon carefully reviews a patient's _____ before performing surgery.",
  "type": "fill_blank",
  "correct_answer": "records",
  "explanation": "Surgeons must review patient medical records",
  "hint": "Think about what documents a doctor examines"
}

Now generate a NEW fill_blank question. Make sure the sentence is COMPLETE!`;

  const tokenLimits = [500, 1000, 2000, null]; // null = no limit specified
  
  for (const maxTokens of tokenLimits) {
    console.log('\n' + '='.repeat(60));
    console.log(`Testing with maxTokens: ${maxTokens || 'DEFAULT'}`);
    console.log('='.repeat(60));
    
    const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-08-01-preview`;
    
    const requestBody = {
      messages: [
        {
          role: 'system',
          content: 'You are an expert educational content creator. Always provide complete, non-truncated responses.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    };
    
    if (maxTokens) {
      requestBody.max_tokens = maxTokens;
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': AZURE_KEY
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await response.json();
      
      if (data.error) {
        console.error('API Error:', data.error);
        continue;
      }
      
      const content = data.choices[0].message.content;
      console.log('\nRaw response length:', content.length, 'characters');
      console.log('Finish reason:', data.choices[0].finish_reason);
      console.log('Token usage:', data.usage);
      
      try {
        const parsed = JSON.parse(content);
        console.log('\nParsed question:');
        console.log('Question:', parsed.question);
        console.log('Answer:', parsed.correct_answer);
        
        // Check if complete
        const q = parsed.question || '';
        const issues = [];
        if (q.includes('…')) issues.push('Has ellipsis (…)');
        if (q.includes('...')) issues.push('Has dots (...)');
        if (q.endsWith(' a ')) issues.push('Ends with " a "');
        if (q.endsWith(' the ')) issues.push('Ends with " the "');
        if (q.length < 30) issues.push('Too short');
        if (!q.includes('_____')) issues.push('Missing _____ blank marker');
        
        if (issues.length > 0) {
          console.log('\n❌ Issues found:', issues);
        } else {
          console.log('\n✅ Question appears complete!');
        }
        
      } catch (e) {
        console.error('Parse error:', e.message);
        console.log('Raw content:', content);
      }
      
    } catch (error) {
      console.error('Request failed:', error.message);
    }
  }
}

testDirectOpenAI().catch(console.error);