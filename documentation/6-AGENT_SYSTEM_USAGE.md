# 6-Agent Finn Architecture - Usage Guide

## Overview

The Pathfinity 6-Agent Finn Architecture provides a comprehensive AI-powered educational system with specialized agents for different aspects of learning. Each agent has specific capabilities while working together seamlessly for optimal educational outcomes.

## Architecture Components

### 🎯 **The Six Agents**

| Agent | Role | Primary Capabilities |
|-------|------|---------------------|
| **FinnSee** | Visual Learning | Interactive content, diagrams, animations, spatial reasoning |
| **FinnSpeak** | Collaborative Learning | Conversations, peer collaboration, presentations, discussions |
| **FinnThink** | Logical Reasoning | Problem-solving, critical thinking, analytical reasoning |
| **FinnTool** | Tool Orchestration | Dynamic tool discovery, MCP integration, skill matching |
| **FinnSafe** | Safety & Compliance | Content validation, privacy compliance, accessibility |
| **FinnView** | Video Curation | YouTube content curation, educational video safety |

### 🔧 **Core Services**

- **AgentSystem**: Central coordination and management
- **MCPToolDiscovery**: HTTP-based tool discovery service
- **AgentCoordination**: Multi-agent workflow orchestration
- **SkillCategoryMappings**: A.0 skill category to tool mappings

## Quick Start Guide

### 1. System Initialization

```typescript
import { createAgentSystem, DEFAULT_AGENT_SYSTEM_CONFIG } from './src/agents/AgentSystem';

// Initialize the agent system
const agentSystem = createAgentSystem({
  enabledAgents: ['see', 'speak', 'think', 'tool', 'safe', 'view'],
  debugMode: true,
  logLevel: 'info'
});

// Start the system
await agentSystem.initialize();
```

### 2. Basic Agent Usage

```typescript
// Request visual content creation
const visualResponse = await agentSystem.requestAgentAction(
  'see',
  'create_visual_content',
  {
    type: 'diagram',
    subject: 'Math',
    gradeLevel: 'K',
    skillNumber: 'A.0',
    parameters: {
      visualStyle: 'colorful',
      complexity: 'simple',
      interactionLevel: 'clickable'
    }
  }
);

// Discover educational tools
const toolResponse = await agentSystem.requestAgentAction(
  'tool',
  'discover_tools',
  {
    skillCategory: 'A.0',
    subject: 'Math',
    gradeLevel: 'K',
    student: {
      id: 'student-123',
      preferences: {
        interactionStyle: 'visual',
        difficultyPreference: 'moderate'
      }
    }
  }
);
```

### 3. Multi-Agent Coordination

```typescript
import { agentCoordination } from './src/services/AgentCoordination';

// Execute a comprehensive educational workflow
const workflowResult = await agentCoordination.executeWorkflow(
  'educational-content-creation',
  {
    requirements: 'Create counting activities for Pre-K students',
    subject: 'Math',
    gradeLevel: 'Pre-K',
    visualType: 'interactive',
    skillCategory: 'A.0'
  },
  {
    priority: 'high',
    timeout: 60000
  }
);

console.log('Workflow completed:', workflowResult.results);
```

## Detailed Usage Examples

### 🎨 **FinnSee - Visual Learning Agent**

```typescript
// Create interactive diagrams
const diagramResponse = await agentSystem.requestAgentAction('see', 'create_visual_content', {
  type: 'diagram',
  subject: 'Math',
  gradeLevel: 'K',
  skillNumber: 'A.0',
  parameters: {
    visualStyle: 'cartoonish',
    complexity: 'simple',
    interactionLevel: 'fully_interactive',
    learningObjective: 'Count objects up to 10',
    accessibility: {
      colorBlind: true,
      highContrast: false,
      largeText: true
    }
  }
});

// Process visual learning requirements
const learningResponse = await agentSystem.requestAgentAction('see', 'process_visual_learning', {
  gradeLevel: 'K',
  subject: 'Math',
  learningStyle: 'visual',
  skill: 'counting',
  studentNeeds: {
    attention: 'short',
    interactionPreference: 'drag_drop'
  }
});
```

### 🗣️ **FinnSpeak - Collaborative Learning Agent**

```typescript
// Start a collaborative discussion
const discussionResponse = await agentSystem.requestAgentAction('speak', 'start_conversation', {
  type: 'peer_discussion',
  participants: [
    {
      studentId: 'student-1',
      name: 'Emma',
      gradeLevel: 'K',
      communicationStyle: 'visual'
    },
    {
      studentId: 'student-2',
      name: 'Alex',
      gradeLevel: 'K',
      communicationStyle: 'verbal'
    }
  ],
  topic: {
    subject: 'Math',
    skillNumber: 'A.0',
    learningObjective: 'Discuss different counting strategies',
    vocabulary: ['count', 'number', 'more', 'less']
  },
  parameters: {
    duration: 15, // minutes
    structure: 'guided',
    moderationLevel: 'active'
  }
});

// Facilitate group project
const projectResponse = await agentSystem.requestAgentAction('speak', 'manage_group_project', {
  projectType: 'collaborative_counting',
  participants: ['student-1', 'student-2', 'student-3'],
  subject: 'Math',
  gradeLevel: 'K',
  timeline: {
    duration: 30,
    phases: ['planning', 'execution', 'presentation']
  }
});
```

### 🧠 **FinnThink - Logical Reasoning Agent**

```typescript
// Solve mathematical problems
const problemResponse = await agentSystem.requestAgentAction('think', 'solve_problem', {
  type: 'problem_solving',
  problem: {
    description: 'Count and compare groups of objects',
    context: 'Kindergarten math activity',
    constraints: ['Use visual aids', 'Keep it simple']
  },
  student: {
    gradeLevel: 'K',
    priorKnowledge: ['counting to 5', 'number recognition'],
    thinkingStyle: 'sequential'
  },
  parameters: {
    scaffoldingLevel: 'extensive',
    timeLimit: 10, // minutes
    assessmentType: 'formative'
  }
});

// Develop critical thinking
const criticalResponse = await agentSystem.requestAgentAction('think', 'analyze_critically', {
  subject: 'Math',
  content: 'Comparing quantities of objects',
  gradeLevel: 'K',
  analysisType: 'pattern_recognition',
  framework: 'elementary_reasoning'
});
```

### 🛠️ **FinnTool - Tool Orchestration Agent**

```typescript
// Discover tools based on skill categories
const toolDiscoveryResponse = await agentSystem.requestAgentAction('tool', 'discover_tools', {
  skillCategory: 'A.0', // Numbers and Counting
  subject: 'Math',
  gradeLevel: 'K',
  learningObjective: 'Count objects up to 10',
  student: {
    id: 'student-123',
    preferences: {
      interactionStyle: 'visual',
      difficultyPreference: 'moderate',
      timePreference: 'medium'
    },
    accessibilityNeeds: ['keyboard_navigation', 'screen_reader']
  },
  parameters: {
    toolType: 'interactive',
    maxTools: 5,
    preferredSource: 'verified',
    safetyLevel: 'strict'
  }
});

// Launch a specific tool
const launchResponse = await agentSystem.requestAgentAction('tool', 'launch_tool', {
  toolId: 'counting-bears',
  studentId: 'student-123',
  configuration: {
    difficulty: 'beginner',
    timeLimit: 15,
    assessment: true
  }
});
```

### 🛡️ **FinnSafe - Safety & Compliance Agent**

```typescript
// Validate content safety
const safetyResponse = await agentSystem.requestAgentAction('safe', 'validate_content_safety', {
  type: 'content_safety',
  target: {
    type: 'tool',
    id: 'counting-bears',
    url: 'https://educational-tools.com/counting-bears'
  },
  context: {
    gradeLevel: 'K',
    subject: 'Math',
    useCase: 'counting_practice',
    studentCount: 25
  },
  parameters: {
    strictnessLevel: 'strict',
    complianceStandards: ['COPPA', 'FERPA', 'WCAG-AA'],
    accessibilityLevel: 'enhanced',
    ageRanges: ['K-6']
  }
});

// Check privacy compliance
const privacyResponse = await agentSystem.requestAgentAction('safe', 'check_privacy_compliance', {
  targetId: 'educational-video-123',
  targetType: 'video',
  gradeLevel: 'K',
  dataTypes: ['viewing_history', 'interaction_data'],
  complianceStandards: ['COPPA', 'FERPA']
});
```

### 📹 **FinnView - Video Content Curation Agent**

```typescript
// Search for educational videos
const videoResponse = await agentSystem.requestAgentAction('view', 'search_videos', {
  type: 'search_videos',
  searchCriteria: {
    topic: 'counting numbers',
    skillCategory: 'A.0',
    subject: 'Math',
    gradeLevel: 'K',
    learningObjective: 'Learn to count objects',
    duration: { min: 3, max: 10 },
    captionRequired: true
  },
  student: {
    id: 'student-123',
    gradeLevel: 'K',
    learningPreferences: {
      visualStyle: 'animated',
      attentionSpan: 'short'
    },
    parentalControls: {
      strictMode: true,
      contentRating: 'G'
    }
  },
  parameters: {
    maxResults: 5,
    requireCaptions: true,
    safetyLevel: 'strict',
    sourcePreference: 'verified_educational'
  }
});

// Create educational playlist
const playlistResponse = await agentSystem.requestAgentAction('view', 'create_playlist', {
  playlistType: 'skill_progression',
  topic: 'Counting and Numbers',
  skillCategory: 'A.0',
  gradeLevel: 'K',
  videos: videoResponse.data.curatedVideos,
  learningPath: 'sequential'
});
```

## Advanced Integration Patterns

### 1. Educational Content Pipeline

```typescript
// Complete educational content creation workflow
async function createEducationalContent(requirements: {
  skillCategory: string;
  subject: string;
  gradeLevel: string;
  learningObjective: string;
  studentCount: number;
}) {
  
  // Step 1: Analyze learning requirements
  const analysis = await agentSystem.requestAgentAction('think', 'analyze_critically', {
    subject: requirements.subject,
    content: requirements.learningObjective,
    gradeLevel: requirements.gradeLevel,
    analysisType: 'educational_needs'
  });

  // Step 2: Discover appropriate tools
  const tools = await agentSystem.requestAgentAction('tool', 'discover_tools', {
    skillCategory: requirements.skillCategory,
    subject: requirements.subject,
    gradeLevel: requirements.gradeLevel,
    parameters: { maxTools: 3, safetyLevel: 'strict' }
  });

  // Step 3: Create visual content
  const visuals = await agentSystem.requestAgentAction('see', 'create_visual_content', {
    type: 'interactive',
    subject: requirements.subject,
    gradeLevel: requirements.gradeLevel,
    skillNumber: requirements.skillCategory,
    parameters: {
      complexity: 'appropriate',
      interactionLevel: 'clickable',
      accessibility: { colorBlind: true, largeText: true }
    }
  });

  // Step 4: Find supporting videos
  const videos = await agentSystem.requestAgentAction('view', 'search_videos', {
    type: 'search_videos',
    searchCriteria: {
      topic: requirements.learningObjective,
      skillCategory: requirements.skillCategory,
      subject: requirements.subject,
      gradeLevel: requirements.gradeLevel
    },
    parameters: { maxResults: 2, requireCaptions: true }
  });

  // Step 5: Validate everything for safety
  const safety = await agentSystem.requestAgentAction('safe', 'validate_content_safety', {
    type: 'content_safety',
    target: { type: 'content_package', id: 'educational-package' },
    context: {
      gradeLevel: requirements.gradeLevel,
      subject: requirements.subject,
      useCase: 'classroom_instruction',
      studentCount: requirements.studentCount
    },
    parameters: {
      strictnessLevel: 'strict',
      complianceStandards: ['COPPA', 'FERPA', 'WCAG-AA']
    }
  });

  return {
    analysis: analysis.data,
    tools: tools.data.discoveredTools,
    visuals: visuals.data,
    videos: videos.data.curatedVideos,
    safety: safety.data,
    ready: safety.data.validationResults.safetyStatus === 'safe'
  };
}
```

### 2. Multi-Agent Assessment System

```typescript
// Comprehensive student assessment using multiple agents
async function assessStudent(studentData: {
  id: string;
  gradeLevel: string;
  subject: string;
  skillCategory: string;
  assessmentType: 'formative' | 'summative';
}) {
  
  // Execute multi-agent assessment workflow
  const assessment = await agentCoordination.executeWorkflow(
    'multi-agent-assessment',
    {
      problem: {
        description: `Assess ${studentData.subject} skills for ${studentData.gradeLevel} student`,
        context: 'Educational assessment',
        skillCategory: studentData.skillCategory
      },
      visualContent: {
        type: 'assessment_visual',
        gradeLevel: studentData.gradeLevel,
        subject: studentData.subject
      },
      interaction: {
        studentId: studentData.id,
        assessmentType: studentData.assessmentType,
        duration: 20 // minutes
      }
    }
  );

  return {
    cognitiveAssessment: assessment.results['cognitive-assessment'],
    visualAssessment: assessment.results['visual-assessment'],
    communicationAssessment: assessment.results['communication-assessment'],
    safetyValidation: assessment.results['safety-assessment'],
    overallScore: calculateOverallScore(assessment.results),
    recommendations: generateRecommendations(assessment.results)
  };
}
```

### 3. Adaptive Learning Path

```typescript
// Create adaptive learning experience
async function createAdaptiveLearningPath(student: {
  id: string;
  gradeLevel: string;
  currentSkills: string[];
  learningPreferences: any;
  progressHistory: any[];
}) {
  
  // Analyze current skill level
  const skillAnalysis = await agentSystem.requestAgentAction('think', 'analyze_critically', {
    subject: 'comprehensive',
    content: student.currentSkills,
    gradeLevel: student.gradeLevel,
    analysisType: 'skill_gap_analysis'
  });

  // Find next appropriate skill categories
  const nextSkills = determineNextSkills(skillAnalysis.data, student.gradeLevel);

  // Create personalized learning path
  const learningPath = await Promise.all(
    nextSkills.map(async (skillCategory) => {
      // Get tools for this skill
      const tools = await agentSystem.requestAgentAction('tool', 'discover_tools', {
        skillCategory,
        subject: getSubjectForSkill(skillCategory),
        gradeLevel: student.gradeLevel,
        student: {
          id: student.id,
          preferences: student.learningPreferences
        }
      });

      // Create visual support
      const visuals = await agentSystem.requestAgentAction('see', 'create_visual_content', {
        type: 'interactive',
        subject: getSubjectForSkill(skillCategory),
        gradeLevel: student.gradeLevel,
        skillNumber: skillCategory,
        parameters: {
          complexity: 'adaptive',
          interactionLevel: 'fully_interactive'
        }
      });

      // Find educational videos
      const videos = await agentSystem.requestAgentAction('view', 'search_videos', {
        type: 'search_videos',
        searchCriteria: {
          topic: getTopicForSkill(skillCategory),
          skillCategory,
          gradeLevel: student.gradeLevel
        },
        parameters: { maxResults: 1, requireCaptions: true }
      });

      return {
        skillCategory,
        tools: tools.data.discoveredTools,
        visuals: visuals.data,
        videos: videos.data.curatedVideos,
        estimatedTime: calculateEstimatedTime(skillCategory, student.gradeLevel),
        difficulty: calculateDifficulty(skillCategory, student.currentSkills)
      };
    })
  );

  return {
    studentId: student.id,
    learningPath,
    totalEstimatedTime: learningPath.reduce((sum, item) => sum + item.estimatedTime, 0),
    adaptiveFeatures: {
      personalizedContent: true,
      progressTracking: true,
      difficultyAdjustment: true
    }
  };
}
```

## System Monitoring and Management

### Health Monitoring

```typescript
// Check system health
const systemStatus = agentSystem.getSystemStatus();
console.log('System Health:', systemStatus.systemHealth);
console.log('Active Agents:', systemStatus.agentStatuses);

// Check coordination health
const coordinationHealth = await agentCoordination.healthCheck();
console.log('Coordination Health:', coordinationHealth);

// Monitor individual agent performance
const agentMetrics = {
  see: agentSystem.getAgent('see')?.getStatus(),
  speak: agentSystem.getAgent('speak')?.getStatus(),
  think: agentSystem.getAgent('think')?.getStatus(),
  tool: agentSystem.getAgent('tool')?.getStatus(),
  safe: agentSystem.getAgent('safe')?.getStatus(),
  view: agentSystem.getAgent('view')?.getStatus()
};
```

### Configuration Management

```typescript
// Update agent configuration
const agentConfig = {
  see: {
    enabled: true,
    maxConcurrentRequests: 15,
    settings: {
      visualQuality: 'high',
      animationSupport: true,
      accessibilityMode: 'enhanced'
    }
  },
  tool: {
    enabled: true,
    settings: {
      mcpEndpoints: ['https://mcp.pathfinity.com/tools'],
      cacheStrategy: 'prefer_fresh',
      safetyLevel: 'strict'
    }
  }
};

// Apply configuration updates
Object.entries(agentConfig).forEach(([agentType, config]) => {
  const agent = agentSystem.getAgent(agentType as AgentType);
  agent?.updateConfig(config);
});
```

## Error Handling and Fallbacks

```typescript
// Comprehensive error handling
async function robustAgentRequest(
  agentType: AgentType,
  action: string,
  data: any,
  options: {
    timeout?: number;
    retries?: number;
    fallbackStrategy?: 'cache' | 'alternative_agent' | 'default';
  } = {}
) {
  const maxRetries = options.retries || 3;
  const timeout = options.timeout || 30000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await Promise.race([
        agentSystem.requestAgentAction(agentType, action, data),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeout)
        )
      ]);

      if (response.success) {
        return response;
      }

      if (attempt === maxRetries) {
        // Try fallback strategies
        return await executeFallbackStrategy(agentType, action, data, options.fallbackStrategy);
      }

    } catch (error) {
      console.error(`Agent request failed (attempt ${attempt}/${maxRetries}):`, error);
      
      if (attempt === maxRetries) {
        return await executeFallbackStrategy(agentType, action, data, options.fallbackStrategy);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}
```

## Performance Optimization

### Caching Strategy

```typescript
// Implement request caching
const requestCache = new Map<string, any>();

async function cachedAgentRequest(
  agentType: AgentType,
  action: string,
  data: any,
  ttl: number = 300000 // 5 minutes
) {
  const cacheKey = `${agentType}-${action}-${JSON.stringify(data)}`;
  const cached = requestCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log('🎯 Cache hit for:', cacheKey);
    return cached.response;
  }

  const response = await agentSystem.requestAgentAction(agentType, action, data);
  
  if (response.success) {
    requestCache.set(cacheKey, {
      response,
      timestamp: Date.now()
    });
  }

  return response;
}
```

### Batch Processing

```typescript
// Process multiple requests efficiently
async function batchProcessSkills(
  skills: Array<{
    skillCategory: string;
    subject: string;
    gradeLevel: string;
  }>,
  batchSize: number = 5
) {
  const results = [];
  
  for (let i = 0; i < skills.length; i += batchSize) {
    const batch = skills.slice(i, i + batchSize);
    
    const batchPromises = batch.map(skill =>
      agentSystem.requestAgentAction('tool', 'discover_tools', {
        skillCategory: skill.skillCategory,
        subject: skill.subject,
        gradeLevel: skill.gradeLevel,
        parameters: { maxTools: 3 }
      })
    );

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults);
    
    // Small delay between batches to avoid overwhelming the system
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return results;
}
```

## Best Practices

### 1. **Agent Selection**
- Use FinnSee for visual/spatial learning needs
- Use FinnSpeak for collaborative/communication activities
- Use FinnThink for problem-solving and reasoning
- Use FinnTool for educational resource discovery
- Use FinnSafe for content validation and compliance
- Use FinnView for video content curation

### 2. **Safety First**
- Always validate content through FinnSafe before presenting to students
- Use strict safety levels for younger students (Pre-K, K)
- Ensure COPPA and FERPA compliance for all activities

### 3. **Performance Optimization**
- Cache frequently requested tool discoveries
- Use batch processing for multiple similar requests
- Implement appropriate timeouts for all agent requests
- Monitor system health and agent performance regularly

### 4. **Error Handling**
- Implement retry logic with exponential backoff
- Provide fallback strategies for critical operations
- Log all errors for debugging and system improvement
- Use graceful degradation when agents are unavailable

### 5. **Accessibility**
- Always include accessibility parameters in requests
- Support keyboard navigation, screen readers, and color-blind users
- Provide alternative formats for visual content
- Follow WCAG guidelines for all generated content

## Conclusion

The 6-Agent Finn Architecture provides a powerful, flexible, and safe foundation for educational AI systems. By leveraging the specialized capabilities of each agent and coordinating their interactions, you can create rich, personalized learning experiences that adapt to individual student needs while maintaining the highest standards of safety and compliance.

For additional support and advanced use cases, refer to the individual agent documentation and the technical API reference.