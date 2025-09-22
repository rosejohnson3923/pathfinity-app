/**
 * Updated TTS Configuration for AI Foundry
 *
 * Based on the Azure AI Foundry endpoints:
 * - Speech to Text: https://eastus.stt.speech.microsoft.com
 * - Text to Speech Neural: https://eastus.tts.speech.microsoft.com
 * - Custom Voice: https://pathfinity-ai-foundry.cognitiveservices.azure.com/
 *
 * We need to use the AI Foundry Cognitive Services key, not the regular AI key
 */

// Configuration for Azure Speech with AI Foundry
const speechConfig = {
  // Use the AI Foundry Cognitive Services key
  key: process.env.AZURE_AI_FOUNDRY_KEY || process.env.AZURE_COGNITIVE_SERVICES_KEY,
  region: process.env.AZURE_SPEECH_REGION || 'eastus',

  // Custom endpoints for AI Foundry
  endpoints: {
    tts: 'https://eastus.tts.speech.microsoft.com',
    stt: 'https://eastus.stt.speech.microsoft.com',
    customVoice: 'https://pathfinity-ai-foundry.cognitiveservices.azure.com/'
  }
};

module.exports = speechConfig;