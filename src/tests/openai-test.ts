// OpenAI API Test for Pathfinity
// Run this to test your API connection

import OpenAI from 'openai';

// Initialize OpenAI (replace with your actual key for testing)
const openai = new OpenAI({
  apiKey: 'YOUR_OPENAI_API_KEY_HERE', // Replace with your actual API key
  dangerouslyAllowBrowser: true // Only for testing - use server-side in production
});

// Test function
export const testOpenAIConnection = async () => {
  try {
    console.log('🧪 Testing OpenAI connection...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful educational content creator.'
        },
        {
          role: 'user',
          content: 'Create a simple test response to confirm the API is working. Just say "OpenAI API connection successful for Pathfinity!"'
        }
      ],
      max_tokens: 50,
      temperature: 0.7
    });

    const result = response.choices[0].message.content;
    console.log('✅ API Response:', result);
    return result;
    
  } catch (error) {
    console.error('❌ API Test Failed:', error);
    
    if (error.status === 401) {
      console.error('🔑 Invalid API Key - please check your key');
    } else if (error.status === 429) {
      console.error('📊 Rate limit exceeded - try again in a moment');
    } else {
      console.error('🚫 Unknown error:', error.message);
    }
    
    return null;
  }
};

// Test educational content generation
export const testEducationalContent = async () => {
  try {
    console.log('📚 Testing educational content generation...');
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: `You are an expert educational content creator for K-10 students. Create age-appropriate, engaging educational content that follows learning science principles. Always respond in valid JSON format.`
        },
        {
          role: 'user',
          content: `Create a simple Kindergarten assignment for "Count pictures - up to 3". 

Include:
1. A friendly title
2. Simple instructions (under 20 words)
3. One easy question with 2 picture-based answer choices
4. Encouraging feedback

Format as JSON with: title, instructions, question, options, correct_answer, feedback`
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const content = JSON.parse(response.choices[0].message.content);
    console.log('📋 Generated Content:', content);
    return content;
    
  } catch (error) {
    console.error('❌ Educational content test failed:', error);
    return null;
  }
};

// Export for testing
export { testOpenAIConnection, testEducationalContent };