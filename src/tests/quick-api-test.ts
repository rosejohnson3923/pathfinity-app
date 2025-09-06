// Quick OpenAI API Test

// Simple test to verify your API key works
const testAPI = async () => {
  console.log('🔑 Testing OpenAI API connection...');
  
  try {
    // Replace 'YOUR_API_KEY' with your actual key for this test
    const apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'user',
            content: 'Test message: Respond with "OpenAI API working for Pathfinity!"'
          }
        ],
        max_tokens: 20
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ SUCCESS! API Response:', data.choices[0].message.content);
      return true;
    } else {
      console.error('❌ API Error:', data.error);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Connection Error:', error);
    return false;
  }
};

// Test educational content generation
const testEducationalGeneration = async () => {
  console.log('📚 Testing educational content generation...');
  
  const apiKey = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator for Kindergarten students. Create simple, engaging content. Respond in JSON format.'
          },
          {
            role: 'user',
            content: `Create a Kindergarten assignment for "Count pictures - up to 3". Include: {"title": "...", "instructions": "...", "question": "...", "options": ["A", "B"], "correct_answer": 0, "feedback": "..."}`
          }
        ],
        max_tokens: 200,
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      const content = JSON.parse(data.choices[0].message.content);
      console.log('✅ Generated Educational Content:');
      console.log('📋 Title:', content.title);
      console.log('📝 Instructions:', content.instructions);
      console.log('❓ Question:', content.question);
      console.log('🎯 Options:', content.options);
      return content;
    } else {
      console.error('❌ Educational Generation Error:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Generation Error:', error);
  }
};

// Export functions for testing
export { testAPI, testEducationalGeneration };

// Run tests
console.log('🚀 Ready to test OpenAI integration!');
console.log('1. Replace YOUR_API_KEY_HERE with your actual key');
console.log('2. Run testAPI() to test connection');
console.log('3. Run testEducationalGeneration() to test content creation');