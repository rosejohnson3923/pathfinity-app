/**
 * Chat Routes and WebSocket Handler
 * Manages real-time chat communication with Finn agents
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Health check for chat API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chat',
    timestamp: new Date().toISOString(),
    agents: ['FinnSpeak', 'FinnThink', 'FinnSafe', 'FinnSee', 'FinnView', 'FinnTool']
  });
});

// Azure OpenAI configuration - lazy load to ensure env is loaded
const getAzureConfig = () => ({
  endpoint: process.env.VITE_AZURE_OPENAI_ENDPOINT || 'https://pathfinity-ai.openai.azure.com',
  key: process.env.VITE_AZURE_OPENAI_API_KEY || process.env.VITE_AZURE_GPT4_API_KEY,
  apiVersion: '2024-02-15-preview'
});

// Model mapping for Finn agents
const AGENT_MODEL_MAP = {
  'FinnSpeak': 'gpt-35-turbo',     // Primary chat agent
  'FinnThink': 'gpt-4',             // Complex reasoning
  'FinnSee': 'gpt-4o',              // Visual analysis
  'FinnView': 'gpt-4o',             // YouTube intelligence
  'FinnSafe': 'gpt-35-turbo',      // Safety checks (using GPT-3.5 for now)
  'FinnTool': 'gpt-35-turbo'        // Orchestration
};

// Simple emotion detection for server-side
function detectEmotion(message) {
  const lowerMessage = message.toLowerCase();

  // Check for emotional indicators
  if (lowerMessage.match(/\b(confused|don't understand|lost|unclear|what\?|huh)/i)) {
    return { emotion: 'confused', instruction: 'The student seems confused. Provide clear, step-by-step explanations.' };
  }
  if (lowerMessage.match(/\b(frustrated|annoying|can't|difficult|hard|ugh)/i)) {
    return { emotion: 'frustrated', instruction: 'The student seems frustrated. Be extra patient and encouraging.' };
  }
  if (lowerMessage.match(/\b(sad|unhappy|crying|miss|lonely)/i)) {
    return { emotion: 'sad', instruction: 'The student might be feeling down. Be extra supportive and gentle.' };
  }
  if (lowerMessage.match(/\b(anxious|worried|nervous|scared|stressed)/i)) {
    return { emotion: 'anxious', instruction: 'The student seems anxious. Be reassuring and break things into small steps.' };
  }
  if (lowerMessage.match(/\b(excited|amazing|wow|cool|awesome|yay)/i) || message.includes('!')) {
    return { emotion: 'excited', instruction: 'The student is excited. Match their enthusiasm while keeping them focused.' };
  }
  if (lowerMessage.match(/\b(happy|great|good|thanks|love)/i)) {
    return { emotion: 'happy', instruction: 'The student seems happy. Maintain their positive energy.' };
  }
  if (lowerMessage.match(/\b(bored|boring|whatever|meh)/i)) {
    return { emotion: 'bored', instruction: 'The student seems bored. Make the content more engaging with examples or activities.' };
  }

  return { emotion: 'neutral', instruction: '' };
}

// Call Azure OpenAI API
async function callAzureOpenAI(message, context, agent = 'FinnSpeak') {
  const config = getAzureConfig();
  const modelName = AGENT_MODEL_MAP[agent] || 'gpt-35-turbo';

  // Detect emotion in the message
  const emotionData = detectEmotion(message);
  console.log(`   Detected emotion: ${emotionData.emotion}`);

  // Build system prompt based on companion and context
  const companionPrompts = {
    pat: "You are Pat, a friendly navigation guide helping students explore their learning journey. You use the 🧭 emoji occasionally. Be encouraging and help them discover their path.",
    finn: "You are Finn, an adventurous explorer companion. You love discovering new things and encourage curiosity. Be enthusiastic and adventurous.",
    sage: "You are Sage, a wise and thoughtful companion. You provide deep insights and help students think critically. Be thoughtful and analytical.",
    spark: "You are Spark, an energetic and creative companion. You inspire innovation and creative thinking. Be exciting and imaginative.",
    harmony: "You are Harmony, a calm and supportive companion. You help students feel confident and manage their emotions. Be understanding and supportive."
  };

  const companionId = context?.companionId || 'pat';
  const systemPrompt = `${companionPrompts[companionId] || companionPrompts.pat}

You are helping a student who is exploring the career of ${context?.career || 'Explorer'}.
Their grade level is ${context?.gradeLevel || 'Elementary'}.
Current subject: ${context?.subject || 'General'}.
Current activity: ${context?.currentActivity || 'Learning'}.

${emotionData.instruction ? `Important: ${emotionData.instruction}` : ''}

Always:
- Be age-appropriate and encouraging
- Recognize and respond to the student's emotional state
- Help them learn and understand concepts
- If they ask math questions, solve them step by step
- Keep responses concise and engaging
- Use simple language for younger students`;

  try {
    const endpoint = `${config.endpoint}/openai/deployments/${modelName}/chat/completions?api-version=${config.apiVersion}`;

    console.log(`   Calling Azure OpenAI: ${modelName} at ${config.endpoint}`);
    console.log(`   API Key configured: ${config.key ? 'Yes' : 'No'} (length: ${config.key?.length || 0})`);

    const response = await axios.post(
      endpoint,
      {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 200,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0
      },
      {
        headers: {
          'api-key': config.key,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log('   Azure OpenAI response received successfully');
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('   Azure OpenAI API error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });

    // Fallback to simple responses if API fails
    return getFallbackResponse(message, context, companionId);
  }
}

// Fallback responses when API is unavailable
function getFallbackResponse(message, context, companionId) {
  const companionResponses = {
    pat: "That's a great question! Let me help you explore that. ",
    finn: "Let's navigate this adventure together! ",
    sage: "An excellent inquiry. Consider this perspective: ",
    spark: "Wow, that's exciting! Here's what I think: ",
    harmony: "I understand how you feel. Let's work through this: "
  };

  let response = companionResponses[companionId] || companionResponses.pat;
  const lowerMessage = message.toLowerCase();

  // Basic pattern matching as fallback
  if (lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/)) {
    const match = lowerMessage.match(/(\d+)\s*([+\-*/])\s*(\d+)/);
    const num1 = parseInt(match[1]);
    const operator = match[2];
    const num2 = parseInt(match[3]);
    let result;

    switch(operator) {
      case '+': result = num1 + num2; break;
      case '-': result = num1 - num2; break;
      case '*': result = num1 * num2; break;
      case '/': result = num2 !== 0 ? (num1 / num2).toFixed(2) : 'undefined'; break;
    }

    response += `${num1} ${operator} ${num2} equals ${result}!`;
  } else if (lowerMessage.includes('help')) {
    response += "I'm here to help! You can ask me about math, science, reading, or any subject you're learning.";
  } else {
    response += "That's interesting! Tell me more about what you're thinking.";
  }

  return response;
}

// REST API fallback for chat messages
router.post('/message', async (req, res) => {
  try {
    const { message, context, agent = 'FinnSpeak', model } = req.body;

    console.log(`💬 Chat message received:`);
    console.log(`   User: ${message}`);
    console.log(`   Companion: ${context?.companionId || 'pat'}`);
    console.log(`   Career: ${context?.career || 'Explorer'}`);
    console.log(`   Agent: ${agent}`);

    const companionId = context?.companionId || 'pat';
    let response;
    let detectedEmotion = 'neutral';

    // Try to use Azure OpenAI if configured
    const config = getAzureConfig();
    if (config.key && config.key !== 'undefined') {
      console.log('   Using Azure OpenAI for response...');
      // Detect emotion for metadata
      const emotionData = detectEmotion(message);
      detectedEmotion = emotionData.emotion;
      response = await callAzureOpenAI(message, context, agent);
    } else {
      console.log('   Azure OpenAI not configured, using fallback responses');
      response = getFallbackResponse(message, context, companionId);
    }

    // Send response
    res.json({
      response,
      agent,
      confidence: 0.95,
      timestamp: new Date().toISOString(),
      metadata: {
        companionId,
        career: context?.career,
        model,
        detectedEmotion
      }
    });

  } catch (error) {
    console.error('❌ Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat message',
      timestamp: new Date().toISOString()
    });
  }
});

// WebSocket setup function (to be called from server.js)
function setupWebSocketServer(server) {
  const WebSocket = require('ws');
  const wss = new WebSocket.Server({
    server,
    path: '/ws/chat'
  });

  console.log('🔌 WebSocket server initialized at /ws/chat');

  // Track connected clients
  const clients = new Map();

  wss.on('connection', (ws, req) => {
    // Extract session ID from query params
    const url = new URL(req.url, `http://${req.headers.host}`);
    const sessionId = url.searchParams.get('session') || `session_${Date.now()}`;
    const userId = url.searchParams.get('user') || 'anonymous';

    console.log(`✅ WebSocket client connected: ${sessionId} (User: ${userId})`);

    // Store client info
    clients.set(ws, { sessionId, userId, connectedAt: new Date() });

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'status',
      payload: {
        connected: true,
        sessionId,
        message: 'Connected to Pathfinity Chat'
      },
      timestamp: new Date()
    }));

    // Handle incoming messages
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log(`📨 WebSocket message from ${sessionId}:`, message.type);

        switch (message.type) {
          case 'ping':
            // Respond to ping with pong
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date()
            }));
            break;

          case 'message':
            // Process chat message
            const { payload } = message;
            const response = await processAgentMessage(payload);

            // Send response back
            ws.send(JSON.stringify({
              type: 'message',
              payload: response,
              timestamp: new Date()
            }));
            break;

          case 'typing':
            // Broadcast typing indicator to other clients (future feature)
            console.log(`User ${userId} is ${message.payload.isTyping ? 'typing' : 'stopped typing'}`);
            break;

          default:
            console.warn('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Failed to process message' },
          timestamp: new Date()
        }));
      }
    });

    // Handle client disconnect
    ws.on('close', () => {
      const client = clients.get(ws);
      console.log(`🔌 WebSocket client disconnected: ${client?.sessionId}`);
      clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
}

// Process message with agent system
async function processAgentMessage(payload) {
  const { message, context, agent = 'FinnSpeak', id } = payload;
  const companionId = context?.companionId || 'pat';

  let response;

  // Try to use Azure OpenAI if configured
  const config = getAzureConfig();
  if (config.key && config.key !== 'undefined') {
    console.log('   WebSocket: Using Azure OpenAI for response...');
    response = await callAzureOpenAI(message, context, agent);
  } else {
    console.log('   WebSocket: Using fallback responses');
    response = getFallbackResponse(message, context, companionId);
  }

  return {
    id: `response_${Date.now()}`,
    replyTo: id,
    role: 'assistant',
    content: response,
    companionId,
    agent,
    confidence: 0.95,
    mediaType: 'text',
    timestamp: new Date()
  };
}

module.exports = {
  router,
  setupWebSocketServer
};