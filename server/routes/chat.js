/**
 * Chat Routes and WebSocket Handler
 * Manages real-time chat communication with Finn agents
 */

const express = require('express');
const router = express.Router();

// Health check for chat API
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'chat',
    timestamp: new Date().toISOString(),
    agents: ['FinnSpeak', 'FinnThink', 'FinnSafe', 'FinnSee', 'FinnView', 'FinnTool']
  });
});

// REST API fallback for chat messages
router.post('/message', async (req, res) => {
  try {
    const { message, context, agent = 'FinnSpeak', model = 'gpt-35-turbo' } = req.body;

    console.log(`💬 Chat message received:`);
    console.log(`   User: ${message}`);
    console.log(`   Companion: ${context?.companionId || 'pat'}`);
    console.log(`   Career: ${context?.career || 'Explorer'}`);
    console.log(`   Agent: ${agent}`);

    // For now, return a contextual response based on the companion
    const companionResponses = {
      pat: "That's a great question! Let me help you explore that. ",
      finn: "Let's navigate this adventure together! ",
      sage: "An excellent inquiry. Consider this perspective: ",
      spark: "Wow, that's exciting! Here's what I think: ",
      harmony: "I understand how you feel. Let's work through this: "
    };

    const companionId = context?.companionId || 'pat';
    const baseResponse = companionResponses[companionId] || companionResponses.pat;

    // Create a simple contextual response
    let response = baseResponse;

    // Add career-specific context
    if (context?.career) {
      response += `As you explore being a ${context.career}, `;
    }

    // Simple keyword-based responses for demo
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      response += "It's wonderful to see you! What would you like to learn about today?";
    } else if (lowerMessage.includes('help')) {
      response += "I'm here to help! You can ask me about your lessons, activities, or anything you're curious about.";
    } else if (lowerMessage.includes('how') || lowerMessage.includes('what')) {
      response += "That's something we can explore together! Let me share what I know about that.";
    } else if (lowerMessage.includes('why')) {
      response += "Great question! Understanding 'why' helps us learn better. Here's what I think...";
    } else if (lowerMessage.includes('2+2') || lowerMessage.includes('2 + 2')) {
      response += "2 + 2 equals 4! Math is fun, isn't it? Would you like to try more math problems?";
    } else {
      response += "I'm listening! Tell me more about what you're thinking.";
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
        model
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

  // Companion responses (same as REST API)
  const companionResponses = {
    pat: "That's a great question! Let me help you explore that. ",
    finn: "Let's navigate this adventure together! ",
    sage: "An excellent inquiry. Consider this perspective: ",
    spark: "Wow, that's exciting! Here's what I think: ",
    harmony: "I understand how you feel. Let's work through this: "
  };

  const companionId = context?.companionId || 'pat';
  const baseResponse = companionResponses[companionId] || companionResponses.pat;

  let response = baseResponse;

  // Add contextual response (simplified for demo)
  const lowerMessage = message.toLowerCase();
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    response += "It's wonderful to see you! What would you like to learn about today?";
  } else if (lowerMessage.includes('help')) {
    response += "I'm here to help! You can ask me about your lessons, activities, or anything you're curious about.";
  } else if (lowerMessage.includes('2+2') || lowerMessage.includes('2 + 2')) {
    response += "2 + 2 equals 4! Math is fun, isn't it? Would you like to try more math problems?";
  } else {
    response += "That's interesting! Tell me more about what you'd like to explore.";
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