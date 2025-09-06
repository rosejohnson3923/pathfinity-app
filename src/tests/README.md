# AI Content Generation Tests

This directory contains test files for the AI-powered educational content generation system.

## 🔑 API Key Setup

**IMPORTANT**: Never commit your actual OpenAI API key to Git!

### Setup Instructions:

1. **Get your OpenAI API key** from https://platform.openai.com/api-keys
2. **Update .env.local** with your actual key:
   ```
   OPENAI_API_KEY=your_actual_openai_api_key_here
   ```
3. **For testing individual files**, replace `YOUR_OPENAI_API_KEY_HERE` with your actual key temporarily

### Test Files:

- **openai-test.ts** - Full OpenAI integration test with error handling
- **quick-api-test.ts** - Simple API connection test using fetch
- **educational-content-test.js** - Educational content generation test for Alex (Kindergarten)
- **finn-maestro-test.ts** - Complete Finn Maestro Agent system test

### Running Tests:

```bash
# Test basic API connection
node src/tests/quick-api-test.ts

# Test educational content generation
node src/tests/educational-content-test.js

# Test complete Finn Maestro system
npm run test:finn-maestro
```

## 🔒 Security Notes:

- ✅ API keys should only be in `.env.local` (already in `.gitignore`)
- ❌ Never commit API keys to test files
- ✅ Use placeholder values in committed test files
- ✅ Regenerate your API key if accidentally committed

## 📋 Test Results:

All tests have been verified working with:
- ✅ Basic API connection
- ✅ Educational content generation for all grade levels
- ✅ Multi-grade content validation (3rd, 7th, 10th grade)
- ✅ Complete learning journey orchestration