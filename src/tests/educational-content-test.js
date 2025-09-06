// Educational Content Generation Test for Alex - Kindergarten Level
// Pathfinity System Integration Test

const OPENAI_API_KEY = 'YOUR_OPENAI_API_KEY_HERE'; // Replace with your actual API key
const API_URL = 'https://api.openai.com/v1/chat/completions';

// Test Configuration for Alex - Kindergarten
const testConfig = {
  studentName: "Alex",
  gradeLevel: "Kindergarten",
  skillCode: "A.1",
  skillName: "Letter Recognition", // Example skill - adjust as needed
  difficultyLevel: "beginner",
  contentType: "interactive_question"
};

// Educational Content Generation Function
async function generateEducationalContent(skill, studentName, gradeLevel) {
  const prompt = `Create educational content for ${studentName}, a ${gradeLevel} student.

Skill: ${skill.skillName} (Code: ${skill.skillCode})
Difficulty: ${skill.difficultyLevel}

Generate content in this exact JSON format:
{
  "title": "Engaging title for the activity",
  "instructions": "Simple, clear instructions for a ${gradeLevel} student",
  "question": "Age-appropriate question or activity prompt",
  "options": ["option1", "option2", "option3", "option4"],
  "correctAnswer": "correct option from above",
  "explanation": "Simple explanation of why this is correct",
  "encouragement": "Positive reinforcement message"
}

Requirements:
- Use simple vocabulary appropriate for ${gradeLevel}
- Make it engaging and fun
- Include encouraging language
- Ensure educational value
- Keep instructions clear and short`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4-1106-preview',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content creator specializing in age-appropriate learning materials for young children.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating content:', error);
    throw error;
  }
}

// Content Validation Function
function validateEducationalContent(content) {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const parsed = JSON.parse(content);
    
    // Required fields check
    const requiredFields = ['title', 'instructions', 'question', 'options', 'correctAnswer', 'explanation', 'encouragement'];
    requiredFields.forEach(field => {
      if (!parsed[field]) {
        validation.errors.push(`Missing required field: ${field}`);
        validation.isValid = false;
      }
    });

    // Options validation
    if (parsed.options && !Array.isArray(parsed.options)) {
      validation.errors.push('Options must be an array');
      validation.isValid = false;
    }

    if (parsed.options && parsed.options.length < 2) {
      validation.errors.push('Must have at least 2 options');
      validation.isValid = false;
    }

    // Correct answer validation
    if (parsed.correctAnswer && parsed.options && !parsed.options.includes(parsed.correctAnswer)) {
      validation.errors.push('Correct answer must be one of the options');
      validation.isValid = false;
    }

    // Age-appropriateness checks (basic)
    const complexWords = ['sophisticated', 'comprehensive', 'analyze', 'evaluate', 'synthesize'];
    const contentText = JSON.stringify(parsed).toLowerCase();
    
    complexWords.forEach(word => {
      if (contentText.includes(word)) {
        validation.warnings.push(`Potentially too complex word for Kindergarten: "${word}"`);
      }
    });

    // Length checks
    if (parsed.instructions && parsed.instructions.length > 100) {
      validation.warnings.push('Instructions might be too long for Kindergarten');
    }

    return validation;
  } catch (error) {
    validation.isValid = false;
    validation.errors.push(`Invalid JSON format: ${error.message}`);
    return validation;
  }
}

// Main Test Function
async function runEducationalContentTest() {
  console.log('🎯 Starting Educational Content Generation Test for Alex (Kindergarten)');
  console.log('=' .repeat(60));
  
  try {
    // Step 1: Generate content
    console.log('📝 Step 1: Generating educational content...');
    const generatedContent = await generateEducationalContent(
      testConfig, 
      testConfig.studentName, 
      testConfig.gradeLevel
    );
    
    console.log('✅ Content generated successfully!');
    console.log('\n📄 Generated Content:');
    console.log(generatedContent);
    
    // Step 2: Validate content
    console.log('\n🔍 Step 2: Validating content...');
    const validation = validateEducationalContent(generatedContent);
    
    if (validation.isValid) {
      console.log('✅ Content validation passed!');
    } else {
      console.log('❌ Content validation failed!');
      console.log('Errors:', validation.errors);
    }
    
    if (validation.warnings.length > 0) {
      console.log('⚠️  Warnings:', validation.warnings);
    }
    
    // Step 3: Parse and display formatted content
    console.log('\n📋 Step 3: Formatted Content Preview:');
    try {
      const parsed = JSON.parse(generatedContent);
      console.log(`
🎓 Activity for ${testConfig.studentName}
📖 ${parsed.title}
📝 Instructions: ${parsed.instructions}
❓ Question: ${parsed.question}
🔤 Options: ${parsed.options.join(', ')}
✅ Correct Answer: ${parsed.correctAnswer}
💡 Explanation: ${parsed.explanation}
🌟 Encouragement: ${parsed.encouragement}
      `);
    } catch (e) {
      console.log('Could not parse content for preview');
    }
    
    // Step 4: Test summary
    console.log('\n📊 Test Summary:');
    console.log(`Student: ${testConfig.studentName}`);
    console.log(`Grade Level: ${testConfig.gradeLevel}`);
    console.log(`Skill: ${testConfig.skillName} (${testConfig.skillCode})`);
    console.log(`Validation Status: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    console.log(`Errors: ${validation.errors.length}`);
    console.log(`Warnings: ${validation.warnings.length}`);
    
    if (validation.isValid) {
      console.log('\n🎉 SUCCESS! Ready to integrate with your 3,435 skills system!');
    } else {
      console.log('\n🔧 Please fix validation errors before proceeding');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    // Common error handling
    if (error.message.includes('401')) {
      console.log('🔑 Check your API key - it might be invalid or expired');
    } else if (error.message.includes('429')) {
      console.log('⏰ Rate limit exceeded - wait a few minutes and try again');
    } else if (error.message.includes('network')) {
      console.log('🌐 Network error - check your internet connection');
    }
  }
}

// Run the test
console.log('🚀 Pathfinity Educational Content Generation Test');
console.log('Ready to test content generation for Alex (Kindergarten)?');
console.log('API Key configured and ready to use');
console.log('\nTo run: Call runEducationalContentTest()');

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    runEducationalContentTest,
    generateEducationalContent,
    validateEducationalContent,
    testConfig
  };
}