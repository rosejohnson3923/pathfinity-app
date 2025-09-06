/**
 * PATHFINITY MSW HANDLERS
 * Mock API handlers for testing Pathfinity AI education platform
 */

import { http, HttpResponse } from 'msw';

// ================================================================
// AUTHENTICATION HANDLERS
// ================================================================

const authHandlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'test@pathfinity.ai' && body.password === 'password123') {
      return HttpResponse.json({
        user: {
          id: 'test-user-id',
          email: 'test@pathfinity.ai',
          role: 'student',
          firstName: 'Test',
          lastName: 'User',
          gradeLevel: 'K'
        },
        token: 'mock-jwt-token'
      });
    }
    
    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  // Logout endpoint
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // User profile endpoint
  http.get('/api/auth/me', ({ request }) => {
    const token = request.headers.get('Authorization');
    
    if (!token || !token.includes('mock-jwt-token')) {
      return HttpResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@pathfinity.ai',
      role: 'student',
      firstName: 'Test',
      lastName: 'User',
      gradeLevel: 'K',
      isActive: true
    });
  })
];

// ================================================================
// AI CHARACTER HANDLERS
// ================================================================

const aiCharacterHandlers = [
  // Finn character interaction
  http.post('/api/characters/finn/chat', async ({ request }) => {
    const body = await request.json() as { message: string; context?: any };
    
    return HttpResponse.json({
      character: 'finn',
      response: `Hello! I'm Finn, your AI learning companion. You said: "${body.message}". How can I help you learn today?`,
      timestamp: new Date().toISOString(),
      tokens: 150,
      cost: 0.002,
      context: body.context
    });
  }),

  // Sage character interaction
  http.post('/api/characters/sage/chat', async ({ request }) => {
    const body = await request.json() as { message: string; context?: any };
    
    return HttpResponse.json({
      character: 'sage',
      response: `Greetings, young scholar! I am Sage, here to guide your intellectual journey. Regarding "${body.message}", let me share some wisdom...`,
      timestamp: new Date().toISOString(),
      tokens: 160,
      cost: 0.0022
    });
  }),

  // Spark character interaction
  http.post('/api/characters/spark/chat', async ({ request }) => {
    const body = await request.json() as { message: string; context?: any };
    
    return HttpResponse.json({
      character: 'spark',
      response: `Hey there, creative genius! I'm Spark, and I love innovation! About "${body.message}" - let's think outside the box!`,
      timestamp: new Date().toISOString(),
      tokens: 140,
      cost: 0.0018
    });
  }),

  // Harmony character interaction
  http.post('/api/characters/harmony/chat', async ({ request }) => {
    const body = await request.json() as { message: string; context?: any };
    
    return HttpResponse.json({
      character: 'harmony',
      response: `Hi! I'm Harmony, and I care about everyone feeling good while learning. You mentioned "${body.message}" - how are you feeling about this?`,
      timestamp: new Date().toISOString(),
      tokens: 155,
      cost: 0.002
    });
  }),

  // Character health check
  http.get('/api/characters/:character/health', ({ params }) => {
    const { character } = params;
    
    if (['finn', 'sage', 'spark', 'harmony'].includes(character as string)) {
      return HttpResponse.json({
        character,
        status: 'healthy',
        uptime: '24h',
        lastInteraction: new Date().toISOString()
      });
    }
    
    return HttpResponse.json(
      { error: 'Character not found' },
      { status: 404 }
    );
  })
];

// ================================================================
# STUDENT PROFILE HANDLERS
# ================================================================

const studentProfileHandlers = [
  // Get student profile
  http.get('/api/students/:studentId', ({ params }) => {
    const { studentId } = params;
    
    return HttpResponse.json({
      id: studentId,
      studentId: studentId,
      firstName: 'Test',
      lastName: 'Student',
      displayName: 'Test Student',
      gradeLevel: 'K',
      learningStyle: 'visual',
      learningPreferences: {
        characterPreference: 'finn',
        difficultyLevel: 'medium',
        interactionStyle: 'visual'
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }),

  // Update student profile
  http.put('/api/students/:studentId', async ({ params, request }) => {
    const { studentId } = params;
    const updates = await request.json();
    
    return HttpResponse.json({
      id: studentId,
      studentId: studentId,
      firstName: 'Test',
      lastName: 'Student',
      displayName: 'Test Student',
      gradeLevel: 'K',
      learningStyle: 'visual',
      ...updates,
      updatedAt: new Date().toISOString()
    });
  })
];

// ================================================================
# ASSESSMENT HANDLERS
# ================================================================

const assessmentHandlers = [
  // Get assessments
  http.get('/api/assessments', ({ request }) => {
    const url = new URL(request.url);
    const gradeLevel = url.searchParams.get('gradeLevel');
    const subject = url.searchParams.get('subject');
    
    return HttpResponse.json({
      assessments: [
        {
          id: 'test-assessment-1',
          title: 'Math Assessment - Counting',
          assessmentType: 'diagnostic',
          gradeLevel: gradeLevel || 'K',
          subject: subject || 'Math',
          skill: 'counting',
          questions: [
            {
              id: 'q1',
              type: 'multiple-choice',
              question: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: '4'
            }
          ],
          status: 'created',
          isActive: true
        }
      ],
      total: 1,
      page: 1,
      limit: 10
    });
  }),

  // Submit assessment
  http.post('/api/assessments/:assessmentId/submit', async ({ params, request }) => {
    const { assessmentId } = params;
    const submission = await request.json();
    
    return HttpResponse.json({
      submissionId: 'test-submission-id',
      assessmentId,
      studentId: 'test-user-id',
      responses: submission.responses,
      score: 85,
      masteryLevel: 'proficient',
      feedback: 'Great job! You showed strong understanding of counting concepts.',
      submittedAt: new Date().toISOString()
    });
  })
];

// ================================================================
# LEARNING ANALYTICS HANDLERS
# ================================================================

const analyticsHandlers = [
  // Record learning event
  http.post('/api/analytics/events', async ({ request }) => {
    const event = await request.json();
    
    return HttpResponse.json({
      eventId: 'test-event-id',
      ...event,
      timestamp: new Date().toISOString()
    });
  }),

  // Get student progress
  http.get('/api/analytics/students/:studentId/progress', ({ params }) => {
    const { studentId } = params;
    
    return HttpResponse.json({
      studentId,
      overallProgress: {
        totalXP: 1250,
        level: 5,
        streakDays: 7,
        masteryScore: 78
      },
      subjectProgress: {
        Math: {
          masteryLevel: 85,
          timeSpent: 120,
          lastActivity: new Date().toISOString()
        },
        ELA: {
          masteryLevel: 72,
          timeSpent: 95,
          lastActivity: new Date().toISOString()
        }
      },
      recentAchievements: [
        {
          type: 'skill_mastery',
          skill: 'counting',
          earnedAt: new Date().toISOString()
        }
      ]
    });
  })
];

// ================================================================
# CONTENT GENERATION HANDLERS
# ================================================================

const contentHandlers = [
  // Generate content
  http.post('/api/content/generate', async ({ request }) => {
    const body = await request.json() as {
      contentType: string;
      gradeLevel: string;
      subject: string;
      skill: string;
    };
    
    return HttpResponse.json({
      contentId: 'generated-content-id',
      contentType: body.contentType,
      title: `Generated ${body.contentType} for ${body.skill}`,
      content: {
        lesson: {
          introduction: `Welcome to learning about ${body.skill}!`,
          activities: [
            {
              type: 'interactive',
              description: `Practice ${body.skill} with fun activities`
            }
          ]
        }
      },
      metadata: {
        gradeLevel: body.gradeLevel,
        subject: body.subject,
        skill: body.skill,
        difficulty: 'medium',
        estimatedTime: 15
      },
      qualityScore: 0.92,
      safetyValidated: true,
      generatedAt: new Date().toISOString()
    });
  })
];

// ================================================================
# HEALTH CHECK HANDLERS
# ================================================================

const healthHandlers = [
  // Basic health check
  http.get('/health', () => {
    return HttpResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: '24h',
      version: '1.0.0'
    });
  }),

  // Detailed health check
  http.get('/health/detailed', () => {
    return HttpResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        database: { status: 'healthy', latency: '5ms' },
        redis: { status: 'healthy', latency: '2ms' },
        azure_openai: { status: 'healthy' }
      }
    });
  })
];

// ================================================================
# ERROR SIMULATION HANDLERS
# ================================================================

const errorHandlers = [
  // Simulate 500 error
  http.get('/api/test/error/500', () => {
    return HttpResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }),

  // Simulate network timeout
  http.get('/api/test/timeout', () => {
    return new Promise(() => {}); // Never resolves
  }),

  // Simulate rate limiting
  http.get('/api/test/rate-limit', () => {
    return HttpResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    );
  })
];

// ================================================================
# EXPORT ALL HANDLERS
# ================================================================

export const handlers = [
  ...authHandlers,
  ...aiCharacterHandlers,
  ...studentProfileHandlers,
  ...assessmentHandlers,
  ...analyticsHandlers,
  ...contentHandlers,
  ...healthHandlers,
  ...errorHandlers
];