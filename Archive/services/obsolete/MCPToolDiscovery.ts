// ================================================================
// MCP TOOL DISCOVERY SERVICE
// HTTP-based tool discovery using Model Context Protocol
// ================================================================

import { DiscoveredTool } from '../agents/FinnTool';

export interface MCPRequest {
  method: 'discover_tools' | 'validate_tool' | 'get_tool_info' | 'search_tools';
  params: {
    skillCategory?: string;
    subject?: string;
    gradeLevel?: string;
    toolType?: string;
    language?: string;
    maxResults?: number;
    filters?: {
      verified?: boolean;
      educational?: boolean;
      accessibility?: boolean;
      freeOnly?: boolean;
    };
  };
  metadata?: {
    requestId?: string;
    timestamp?: string;
    source?: string;
    priority?: 'low' | 'medium' | 'high';
  };
}

export interface MCPResponse {
  success: boolean;
  data?: {
    tools: DiscoveredTool[];
    totalCount: number;
    searchMetadata: {
      query: string;
      resultsFound: number;
      searchTime: number;
      sources: string[];
      cacheHit: boolean;
    };
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata: {
    requestId: string;
    timestamp: string;
    processingTime: number;
    version: string;
  };
}

export interface MCPEndpoint {
  url: string;
  name: string;
  description: string;
  priority: number;
  timeout: number;
  retryAttempts: number;
  authRequired: boolean;
  rateLimitPerMinute: number;
  lastUsed?: Date;
  successRate: number;
  averageResponseTime: number;
}

export interface MCPCache {
  key: string;
  data: DiscoveredTool[];
  timestamp: Date;
  ttl: number;
  hitCount: number;
  source: string;
}

export class MCPToolDiscovery {
  private endpoints: MCPEndpoint[] = [];
  private cache: Map<string, MCPCache> = new Map();
  private requestCounter = 0;
  private rateLimitTracker: Map<string, number[]> = new Map();
  
  constructor() {
    this.initializeEndpoints();
  }

  // ================================================================
  // TOOL DISCOVERY METHODS
  // ================================================================

  async discoverTools(request: {
    skillCategory: string;
    subject: string;
    gradeLevel: string;
    toolType?: string;
    maxResults?: number;
    filters?: any;
  }): Promise<DiscoveredTool[]> {
    const mcpRequest: MCPRequest = {
      method: 'discover_tools',
      params: {
        skillCategory: request.skillCategory,
        subject: request.subject,
        gradeLevel: request.gradeLevel,
        toolType: request.toolType,
        maxResults: request.maxResults || 10,
        filters: request.filters
      },
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        source: 'pathfinity-finntool',
        priority: 'medium'
      }
    };

    // Check cache first
    const cacheKey = this.generateCacheKey(mcpRequest);
    const cachedResult = this.getFromCache(cacheKey);
    
    if (cachedResult) {
      console.log(`🎯 Cache hit for ${cacheKey}`);
      return cachedResult;
    }

    // Perform discovery across all endpoints
    const results = await this.queryAllEndpoints(mcpRequest);
    
    // Merge and deduplicate results
    const mergedTools = this.mergeToolResults(results);
    
    // Cache the results
    this.cacheResults(cacheKey, mergedTools, mcpRequest);
    
    return mergedTools;
  }

  async validateTool(toolId: string): Promise<{
    valid: boolean;
    tool?: DiscoveredTool;
    validationResults?: any;
  }> {
    const mcpRequest: MCPRequest = {
      method: 'validate_tool',
      params: { toolId },
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        source: 'pathfinity-finntool',
        priority: 'high'
      }
    };

    const results = await this.queryAllEndpoints(mcpRequest);
    
    // If any endpoint validates the tool, consider it valid
    for (const result of results) {
      if (result.success && result.data?.tools.length > 0) {
        return {
          valid: true,
          tool: result.data.tools[0],
          validationResults: result.data.searchMetadata
        };
      }
    }

    return { valid: false };
  }

  async getToolInfo(toolId: string): Promise<DiscoveredTool | null> {
    const mcpRequest: MCPRequest = {
      method: 'get_tool_info',
      params: { toolId },
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        source: 'pathfinity-finntool',
        priority: 'medium'
      }
    };

    const results = await this.queryAllEndpoints(mcpRequest);
    
    for (const result of results) {
      if (result.success && result.data?.tools.length > 0) {
        return result.data.tools[0];
      }
    }

    return null;
  }

  async searchTools(query: string, filters?: any): Promise<DiscoveredTool[]> {
    const mcpRequest: MCPRequest = {
      method: 'search_tools',
      params: {
        query,
        filters: filters || {},
        maxResults: 20
      },
      metadata: {
        requestId: this.generateRequestId(),
        timestamp: new Date().toISOString(),
        source: 'pathfinity-finntool',
        priority: 'medium'
      }
    };

    const results = await this.queryAllEndpoints(mcpRequest);
    const mergedTools = this.mergeToolResults(results);
    
    return mergedTools;
  }

  // ================================================================
  // ENDPOINT MANAGEMENT
  // ================================================================

  private initializeEndpoints(): void {
    this.endpoints = [
      {
        url: 'https://mcp.pathfinity.com/api/v1/tools',
        name: 'Pathfinity MCP Server',
        description: 'Primary MCP server for educational tools',
        priority: 1,
        timeout: 5000,
        retryAttempts: 3,
        authRequired: false,
        rateLimitPerMinute: 100,
        successRate: 0.95,
        averageResponseTime: 1200
      },
      {
        url: 'https://api.github.com/educational-tools',
        name: 'GitHub Educational Tools',
        description: 'Educational tools from GitHub repositories',
        priority: 2,
        timeout: 8000,
        retryAttempts: 2,
        authRequired: true,
        rateLimitPerMinute: 60,
        successRate: 0.85,
        averageResponseTime: 2000
      },
      {
        url: 'https://tools.education.gov/api/v1',
        name: 'US Education Department Tools',
        description: 'Government-verified educational tools',
        priority: 3,
        timeout: 10000,
        retryAttempts: 2,
        authRequired: false,
        rateLimitPerMinute: 30,
        successRate: 0.90,
        averageResponseTime: 3000
      },
      {
        url: 'https://api.commoncore.org/tools',
        name: 'Common Core Tools',
        description: 'Common Core aligned educational tools',
        priority: 4,
        timeout: 7000,
        retryAttempts: 2,
        authRequired: false,
        rateLimitPerMinute: 50,
        successRate: 0.88,
        averageResponseTime: 2500
      }
    ];

    console.log(`🔗 Initialized ${this.endpoints.length} MCP endpoints`);
  }

  addEndpoint(endpoint: MCPEndpoint): void {
    this.endpoints.push(endpoint);
    this.endpoints.sort((a, b) => a.priority - b.priority);
    console.log(`➕ Added MCP endpoint: ${endpoint.name}`);
  }

  removeEndpoint(url: string): void {
    const index = this.endpoints.findIndex(ep => ep.url === url);
    if (index > -1) {
      const removed = this.endpoints.splice(index, 1)[0];
      console.log(`➖ Removed MCP endpoint: ${removed.name}`);
    }
  }

  getEndpointStatus(): {
    totalEndpoints: number;
    activeEndpoints: number;
    averageResponseTime: number;
    overallSuccessRate: number;
  } {
    const totalEndpoints = this.endpoints.length;
    const activeEndpoints = this.endpoints.filter(ep => ep.successRate > 0.5).length;
    const avgResponseTime = this.endpoints.reduce((sum, ep) => sum + ep.averageResponseTime, 0) / totalEndpoints;
    const overallSuccessRate = this.endpoints.reduce((sum, ep) => sum + ep.successRate, 0) / totalEndpoints;

    return {
      totalEndpoints,
      activeEndpoints,
      averageResponseTime: avgResponseTime,
      overallSuccessRate
    };
  }

  // ================================================================
  // QUERY EXECUTION
  // ================================================================

  private async queryAllEndpoints(request: MCPRequest): Promise<MCPResponse[]> {
    const responses: MCPResponse[] = [];
    const promises = this.endpoints.map(endpoint => this.queryEndpoint(endpoint, request));
    
    try {
      const results = await Promise.allSettled(promises);
      
      results.forEach((result, index) => {
        const endpoint = this.endpoints[index];
        
        if (result.status === 'fulfilled') {
          responses.push(result.value);
          this.updateEndpointMetrics(endpoint, true, result.value.metadata.processingTime);
        } else {
          console.error(`❌ Endpoint ${endpoint.name} failed:`, result.reason);
          this.updateEndpointMetrics(endpoint, false, 0);
        }
      });
      
    } catch (error) {
      console.error('❌ Failed to query endpoints:', error);
    }

    return responses;
  }

  private async queryEndpoint(endpoint: MCPEndpoint, request: MCPRequest): Promise<MCPResponse> {
    // Check rate limiting
    if (!this.checkRateLimit(endpoint)) {
      throw new Error(`Rate limit exceeded for endpoint: ${endpoint.name}`);
    }

    const startTime = Date.now();
    
    try {
      // In a real implementation, this would make an actual HTTP request
      const response = await this.simulateHttpRequest(endpoint, request);
      
      const processingTime = Date.now() - startTime;
      
      return {
        success: true,
        data: response,
        metadata: {
          requestId: request.metadata?.requestId || this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          version: '1.0.0'
        }
      };
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      return {
        success: false,
        error: {
          code: 'ENDPOINT_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { endpoint: endpoint.name, processingTime }
        },
        metadata: {
          requestId: request.metadata?.requestId || this.generateRequestId(),
          timestamp: new Date().toISOString(),
          processingTime,
          version: '1.0.0'
        }
      };
    }
  }

  private async simulateHttpRequest(endpoint: MCPEndpoint, request: MCPRequest): Promise<any> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 500));
    
    // Simulate different responses based on endpoint
    const mockTools = this.generateMockTools(request, endpoint);
    
    return {
      tools: mockTools,
      totalCount: mockTools.length,
      searchMetadata: {
        query: this.buildQueryString(request),
        resultsFound: mockTools.length,
        searchTime: 100 + Math.random() * 400,
        sources: [endpoint.name],
        cacheHit: false
      }
    };
  }

  private generateMockTools(request: MCPRequest, endpoint: MCPEndpoint): DiscoveredTool[] {
    const { skillCategory, subject, gradeLevel, toolType } = request.params;
    const maxResults = request.params.maxResults || 5;
    
    const tools: DiscoveredTool[] = [];
    
    // Check if grade level qualifies for early elementary tools (PreK-2)
    const isEarlyElementary = gradeLevel === 'PreK' || 
                              gradeLevel === 'K' || 
                              gradeLevel === 'Kindergarten' || 
                              gradeLevel === '1' || 
                              gradeLevel === '1st Grade' ||
                              gradeLevel === '2' ||
                              gradeLevel === '2nd Grade';
    
    // Debug the condition check
    console.log('🔍 Tool discovery condition check:', {
      skillCategory,
      subject,
      gradeLevel,
      skillMatch: skillCategory === 'A.0' || skillCategory === 'A.1',
      subjectMatch: subject?.toLowerCase() === 'math',
      mathSubjectMatch: subject?.toLowerCase().includes('algebra') || subject?.toLowerCase().includes('geometry'),
      gradeMatch: isEarlyElementary,
      isEarlyElementary,
      endpoint: endpoint.name
    });
    
    // Check if subject is math-related
    const isMathSubject = subject?.toLowerCase() === 'math' || 
                          subject?.toLowerCase().includes('algebra') || 
                          subject?.toLowerCase().includes('geometry') || 
                          subject?.toLowerCase().includes('calculus') || 
                          subject?.toLowerCase().includes('trigonometry') || 
                          subject?.toLowerCase().includes('statistics');
    
    // Check if subject is ELA-related
    const isELASubject = subject?.toLowerCase() === 'ela' || 
                         subject?.toLowerCase() === 'english' ||
                         subject?.toLowerCase().includes('reading') ||
                         subject?.toLowerCase().includes('writing') ||
                         subject?.toLowerCase().includes('language') ||
                         subject?.toLowerCase().includes('literacy');
    
    // Check if subject is Science-related
    const isScienceSubject = subject?.toLowerCase() === 'science' || 
                             subject?.toLowerCase().includes('physics') ||
                             subject?.toLowerCase().includes('chemistry') ||
                             subject?.toLowerCase().includes('biology') ||
                             subject?.toLowerCase().includes('earth') ||
                             subject?.toLowerCase().includes('environment');
    
    // Check if subject is Social Studies-related
    const isSocialStudiesSubject = subject?.toLowerCase() === 'socialstudies' || 
                                   subject?.toLowerCase() === 'social studies' ||
                                   subject?.toLowerCase().includes('social') ||
                                   subject?.toLowerCase().includes('community') ||
                                   subject?.toLowerCase().includes('civics') ||
                                   subject?.toLowerCase().includes('history');
    
    // Add specific Letter Identification tools for Grade+Subject+SkillNumber: PreK-2 + ELA + A.1
    if (skillCategory === 'A.1' && 
        isELASubject && 
        (gradeLevel === 'PreK' || gradeLevel === 'K' || gradeLevel === 'Kindergarten' || 
         gradeLevel === '1' || gradeLevel === '1st Grade' || gradeLevel === '2' || gradeLevel === '2nd Grade') && 
        isEarlyElementary) {
      console.log('🔤 MCPToolDiscovery: Adding Letter Identification Interactive tool (PRIORITY)', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'letter-identification-interactive',
        name: 'Letter Identification Interactive',
        description: 'Interactive letter recognition and identification for alphabet learning (PreK-2)',
        category: skillCategory || 'A.1',
        skillCategories: [skillCategory || 'A.1'],
        source: {
          type: 'verified',
          url: 'builtin://letter-identification-interactive',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader', 'audio_support', 'touch_friendly']
        },
        compatibility: {
          gradeLevel: ['PreK', 'K', 'Kindergarten', '1', '1st Grade', '2', '2nd Grade'],
          subjects: ['ELA', 'English', 'Reading', 'Language Arts'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 8500,
          userRating: 4.9,
          educationalEffectiveness: 0.96,
          technicalReliability: 0.98
        },
        configuration: {
          launchUrl: 'builtin://letter-identification-interactive',
          configurationOptions: {
            letterCase: 'uppercase',
            gameType: 'identification',
            audioEnabled: true,
            difficulty: 'beginner'
          },
          integrationMethod: 'iframe'
        }
      });
      console.log('🔤 MCPToolDiscovery: Letter Identification tool added successfully with HIGH PRIORITY metrics');
      
      // Return immediately to prioritize this tool and prevent generic tools from being added
      return tools;
    }
    
    // Add specific Shape Sorting tools for Grade+Subject+SkillNumber: PreK-2 + Science + A.1
    if (skillCategory === 'A.1' && 
        isScienceSubject && 
        (gradeLevel === 'PreK' || gradeLevel === 'K' || gradeLevel === 'Kindergarten' || 
         gradeLevel === '1' || gradeLevel === '1st Grade' || gradeLevel === '2' || gradeLevel === '2nd Grade') && 
        isEarlyElementary) {
      console.log('🔷 MCPToolDiscovery: Adding Shape Sorting Interactive tool (PRIORITY)', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'shape-sorting-interactive',
        name: 'Shape Sorting Interactive',
        description: 'Interactive shape classification and identification for Science Foundations (PreK-2)',
        category: skillCategory || 'A.1',
        skillCategories: [skillCategory || 'A.1'],
        source: {
          type: 'verified',
          url: 'builtin://shape-sorting-interactive',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader', 'audio_support', 'touch_friendly']
        },
        compatibility: {
          gradeLevel: ['PreK', 'K', 'Kindergarten', '1', '1st Grade', '2', '2nd Grade'],
          subjects: ['Science', 'STEM', 'Foundations'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 7500,
          userRating: 4.8,
          educationalEffectiveness: 0.94,
          technicalReliability: 0.97
        },
        configuration: {
          launchUrl: 'builtin://shape-sorting-interactive',
          configurationOptions: {
            shapeTypes: 'basic',
            gameType: 'classification',
            audioEnabled: true,
            difficulty: 'beginner'
          },
          integrationMethod: 'iframe'
        }
      });
      console.log('🔷 MCPToolDiscovery: Shape Sorting tool added successfully with HIGH PRIORITY metrics');
      
      // Return immediately to prioritize this tool and prevent generic tools from being added
      return tools;
    }
    
    // Add specific Rules and Laws tools for Grade+Subject+SkillNumber: 1st Grade + Social Studies + A.1
    if (skillCategory === 'A.1' && 
        isSocialStudiesSubject && 
        (gradeLevel === '1' || gradeLevel === '1st Grade') && 
        isEarlyElementary) {
      console.log('🏛️ MCPToolDiscovery: Adding Rules and Laws Interactive tool (HIGHEST PRIORITY for A.1)', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'rules-and-laws-interactive',
        name: 'Rules and Laws Interactive',
        description: 'Interactive tool for understanding basic rules and safety (PreK-2)',
        category: skillCategory || 'A.1',
        skillCategories: [skillCategory || 'A.1'],
        source: {
          type: 'verified',
          url: 'builtin://rules-and-laws-interactive',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader', 'audio_support', 'touch_friendly']
        },
        compatibility: {
          gradeLevel: ['1', '1st Grade'],
          subjects: ['SocialStudies', 'Social Studies', 'Civics', 'Rules', 'Laws'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 7200,
          userRating: 4.8,
          educationalEffectiveness: 0.94,
          technicalReliability: 0.97
        },
        configuration: {
          launchUrl: 'builtin://rules-and-laws-interactive',
          configurationOptions: {
            ruleTypes: 'basic',
            gameType: 'identification',
            audioEnabled: true,
            difficulty: 'beginner'
          },
          integrationMethod: 'iframe'
        }
      });
      console.log('🏛️ MCPToolDiscovery: Rules and Laws tool added successfully with HIGHEST PRIORITY metrics for A.1');
      
      // Return immediately to prioritize this tool and prevent generic tools from being added
      return tools;
    }

    // Add specific Community Helper tools for Grade+Subject+SkillNumber: Kindergarten + Social Studies + A.1
    // DEBUG: 7th Grade specific logging (safe - doesn't affect K or 1st grade)
    if (gradeLevel === '7' || gradeLevel === '7th Grade') {
      console.log('🔍 JORDAN(7TH) DEBUG: Tool discovery for 7th grade', {
        skillCategory, 
        subject,
        gradeLevel,
        isMathSubject,
        isSocialStudiesSubject,
        isELASubject: subject?.toLowerCase().includes('ela') || subject?.toLowerCase().includes('english'),
        endpoint: endpoint.name
      });
    }
    
    console.log('🔍 MCPToolDiscovery: Community Helper condition check', {
      skillCategory, 
      skillCategoryMatch: skillCategory === 'A.1',
      isSocialStudiesSubject, 
      gradeLevel,
      gradeMatch: gradeLevel === 'K' || gradeLevel === 'Kindergarten',
      isEarlyElementary,
      subject,
      endpoint: endpoint.name
    });
    
    if (skillCategory === 'A.1' && 
        isSocialStudiesSubject && 
        (gradeLevel === 'K' || gradeLevel === 'Kindergarten') && 
        isEarlyElementary) {
      console.log('🏘️ MCPToolDiscovery: Adding Community Helper Interactive tool (PRIORITY for A.1)', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'community-helper-interactive',
        name: 'Community Helper Interactive',
        description: 'Interactive community helper identification for Social Studies Foundations (PreK-2)',
        category: skillCategory || 'A.1',
        skillCategories: [skillCategory || 'A.1'],
        source: {
          type: 'verified',
          url: 'builtin://community-helper-interactive',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader', 'audio_support', 'touch_friendly']
        },
        compatibility: {
          gradeLevel: ['K', 'Kindergarten'],
          subjects: ['SocialStudies', 'Social Studies', 'Community', 'Civics'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 6500,
          userRating: 4.7,
          educationalEffectiveness: 0.93,
          technicalReliability: 0.96
        },
        configuration: {
          launchUrl: 'builtin://community-helper-interactive',
          configurationOptions: {
            helperTypes: 'basic',
            gameType: 'identification',
            audioEnabled: true,
            difficulty: 'beginner'
          },
          integrationMethod: 'iframe'
        }
      });
      console.log('🏘️ MCPToolDiscovery: Community Helper tool added successfully with HIGH PRIORITY metrics for A.1');
      
      // Return immediately to prioritize this tool and prevent generic tools from being added
      return tools;
    }
    
    
    // Add specific Number Line tools for Grade+Subject+SkillNumber: PreK-2 + Math + A.0/A.1
    if ((skillCategory === 'A.0' || skillCategory === 'A.1') && 
        isMathSubject && 
        (gradeLevel === 'PreK' || gradeLevel === 'K' || gradeLevel === 'Kindergarten' || 
         gradeLevel === '1' || gradeLevel === '1st Grade' || gradeLevel === '2' || gradeLevel === '2nd Grade') && 
        isEarlyElementary) {
      console.log('🔢 MCPToolDiscovery: Adding Number Line Interactive tool (PRIORITY)', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'number-line-interactive-basic',
        name: 'Number Line Interactive',
        description: 'Interactive number line for basic counting and sequencing (PreK-2)',
        category: skillCategory || 'A.0',
        skillCategories: [skillCategory || 'A.0'],
        source: {
          type: 'verified',
          url: 'builtin://number-line-interactive',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader', 'touch_friendly']
        },
        compatibility: {
          gradeLevel: ['PreK', 'K', 'Kindergarten', '1', '1st Grade', '2', '2nd Grade'],
          subjects: ['Math'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98, // Higher safety score for priority
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 10000, // Higher usage count for priority ranking
          userRating: 4.9, // Higher rating for priority
          educationalEffectiveness: 0.95, // Higher effectiveness for priority
          technicalReliability: 0.98 // Higher reliability for priority
        },
        configuration: {
          launchUrl: 'builtin://number-line-interactive',
          configurationOptions: {
            maxNumber: 10,
            showNumbers: true,
            problemType: 'sequence',
            difficulty: 'basic'
          },
          integrationMethod: 'iframe'
        }
      });
      console.log('🔢 MCPToolDiscovery: Number Line tool added successfully with HIGH PRIORITY metrics');
      
      // Return immediately to prioritize this tool and prevent generic tools from being added
      return tools;
    }
    
    // Add calculator tools for Grade+Subject+SkillNumber: 3-12 + Math + A.0/A.1  
    if ((skillCategory === 'A.0' || skillCategory === 'A.1') && 
        isMathSubject && 
        (gradeLevel === '3' || gradeLevel === '4' || gradeLevel === '5' || gradeLevel === '6' || 
         gradeLevel === '7' || gradeLevel === '7th Grade' || gradeLevel === '8' || gradeLevel === '9' || gradeLevel === '10' || gradeLevel === '10th Grade' || 
         gradeLevel === '11' || gradeLevel === '12') && 
        !isEarlyElementary) {
      console.log('🧮 MCPToolDiscovery: Adding Calculator tool for higher grades', {
        skillCategory, subject, gradeLevel, endpoint: endpoint.name
      });
      tools.push({
        id: 'simple-calculator-math',
        name: 'Math Calculator',
        description: 'Simple calculator for basic math operations',
        category: skillCategory || 'A.0',
        skillCategories: [skillCategory || 'A.0'],
        source: {
          type: 'verified',
          url: 'builtin://simple-calculator',
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: true,
          adaptive: false,
          collaborative: false,
          accessibility: ['keyboard_navigation', 'screen_reader']
        },
        compatibility: {
          gradeLevel: ['3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
          subjects: ['Math'],
          platforms: ['web', 'mobile', 'tablet']
        },
        safety: {
          verified: true,
          safetyScore: 0.98,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA', 'WCAG_AA']
        },
        metrics: {
          usageCount: 15000,
          userRating: 4.8,
          educationalEffectiveness: 0.92,
          technicalReliability: 0.97
        },
        configuration: {
          launchUrl: 'builtin://simple-calculator',
          configurationOptions: {
            operations: ['add', 'subtract', 'multiply', 'divide'],
            precision: 2,
            maxDigits: 10
          },
          integrationMethod: 'iframe'
        }
      });
      
      // Return immediately to prioritize this tool
      return tools;
    }
    
    // Generate additional mock tools
    console.log('🔧 MCPToolDiscovery: Adding generic tools', { 
      currentToolCount: tools.length, 
      maxResults, 
      willAddCount: Math.min(maxResults - tools.length, 3)
    });
    for (let i = 0; i < Math.min(maxResults - tools.length, 3); i++) {
      const toolId = `${endpoint.name.toLowerCase().replace(/\s+/g, '-')}-${skillCategory}-${i + 1}`;
      
      tools.push({
        id: toolId,
        name: `${subject} ${toolType || 'Interactive'} Tool ${i + 1}`,
        description: `Educational ${toolType || 'interactive'} tool for ${skillCategory} skills in ${subject} for ${gradeLevel} students`,
        category: skillCategory || 'A.0',
        skillCategories: [skillCategory || 'A.0'],
        source: {
          type: this.getSourceType(endpoint.name),
          url: `${endpoint.url}/tools/${toolId}`,
          version: '1.0.0',
          lastUpdated: new Date()
        },
        capabilities: {
          interactive: true,
          assessment: Math.random() > 0.5,
          adaptive: Math.random() > 0.3,
          collaborative: Math.random() > 0.7,
          accessibility: ['keyboard_navigation', 'screen_reader']
        },
        compatibility: {
          gradeLevel: [gradeLevel || 'K'],
          subjects: [subject || 'Math'],
          platforms: ['web', 'mobile']
        },
        safety: {
          verified: endpoint.name.includes('Education') || endpoint.name.includes('Pathfinity'),
          safetyScore: 0.85 + Math.random() * 0.15,
          lastSafetyCheck: new Date(),
          compliance: ['COPPA', 'FERPA']
        },
        metrics: {
          usageCount: Math.floor(Math.random() * 10000) + 100,
          userRating: 3.5 + Math.random() * 1.5,
          educationalEffectiveness: 0.7 + Math.random() * 0.3,
          technicalReliability: 0.8 + Math.random() * 0.2
        },
        configuration: {
          launchUrl: `${endpoint.url}/launch/${toolId}`,
          configurationOptions: {
            difficulty: 'adaptive',
            duration: 'flexible',
            assessment: 'embedded'
          },
          integrationMethod: 'iframe' as const
        }
      });
    }
    
    console.log('🔧 MCPToolDiscovery: Final tools for endpoint', endpoint.name, ':', 
      tools.map(t => ({ id: t.id, name: t.name, sourceType: t.source.type })));
    
    return tools;
  }

  private getSourceType(endpointName: string): 'github' | 'npm' | 'verified' | 'internal' {
    if (endpointName.includes('GitHub')) return 'github';
    if (endpointName.includes('Education') || endpointName.includes('Pathfinity')) return 'verified';
    return 'verified';
  }

  // ================================================================
  // CACHING SYSTEM
  // ================================================================

  private generateCacheKey(request: MCPRequest): string {
    const { skillCategory, subject, gradeLevel, toolType } = request.params;
    return `${skillCategory || 'any'}_${subject || 'any'}_${gradeLevel || 'any'}_${toolType || 'any'}`;
  }

  private getFromCache(key: string): DiscoveredTool[] | null {
    const cached = this.cache.get(key);
    
    if (!cached) {
      return null;
    }

    const now = Date.now();
    const age = now - cached.timestamp.getTime();
    
    if (age > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    cached.hitCount++;
    return cached.data;
  }

  private cacheResults(key: string, tools: DiscoveredTool[], request: MCPRequest): void {
    const ttl = 2 * 60 * 60 * 1000; // 2 hours
    
    this.cache.set(key, {
      key,
      data: tools,
      timestamp: new Date(),
      ttl,
      hitCount: 0,
      source: 'mcp_discovery'
    });

    console.log(`💾 Cached ${tools.length} tools for key: ${key}`);
  }

  getCacheStats(): {
    totalEntries: number;
    totalHits: number;
    hitRate: number;
    memoryUsage: number;
  } {
    const totalEntries = this.cache.size;
    const totalHits = Array.from(this.cache.values()).reduce((sum, entry) => sum + entry.hitCount, 0);
    const hitRate = totalHits / Math.max(this.requestCounter, 1);
    const memoryUsage = JSON.stringify(Array.from(this.cache.entries())).length;

    return {
      totalEntries,
      totalHits,
      hitRate,
      memoryUsage
    };
  }

  clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  // ================================================================
  // RATE LIMITING
  // ================================================================

  private checkRateLimit(endpoint: MCPEndpoint): boolean {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window
    
    const requests = this.rateLimitTracker.get(endpoint.url) || [];
    const recentRequests = requests.filter(time => time > windowStart);
    
    if (recentRequests.length >= endpoint.rateLimitPerMinute) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimitTracker.set(endpoint.url, recentRequests);
    
    return true;
  }

  private updateEndpointMetrics(endpoint: MCPEndpoint, success: boolean, responseTime: number): void {
    // Update success rate with exponential moving average
    const alpha = 0.1;
    const newSuccessRate = success ? 1 : 0;
    endpoint.successRate = (1 - alpha) * endpoint.successRate + alpha * newSuccessRate;
    
    // Update average response time
    if (success && responseTime > 0) {
      endpoint.averageResponseTime = (1 - alpha) * endpoint.averageResponseTime + alpha * responseTime;
    }
    
    endpoint.lastUsed = new Date();
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private mergeToolResults(responses: MCPResponse[]): DiscoveredTool[] {
    const toolMap = new Map<string, DiscoveredTool>();
    
    console.log('🔗 MCPToolDiscovery: Merging tool results from', responses.length, 'responses');
    
    responses.forEach((response, index) => {
      if (response.success && response.data?.tools) {
        console.log(`📦 Response ${index}:`, response.data.tools.map(t => ({ 
          id: t.id, 
          name: t.name, 
          sourceType: t.source.type 
        })));
        
        response.data.tools.forEach(tool => {
          // Use tool name + source as unique key to avoid duplicates
          const key = `${tool.name}_${tool.source.type}`;
          
          if (!toolMap.has(key)) {
            console.log('✅ Adding new tool:', key);
            toolMap.set(key, tool);
          } else {
            console.log('🔄 Merging duplicate tool:', key);
            // Merge tool data if duplicate found
            const existing = toolMap.get(key)!;
            existing.metrics.usageCount += tool.metrics.usageCount;
            existing.metrics.userRating = (existing.metrics.userRating + tool.metrics.userRating) / 2;
          }
        });
      }
    });
    
    const mergedTools = Array.from(toolMap.values());
    console.log('🎯 Final merged tools:', mergedTools.map(t => ({ 
      id: t.id, 
      name: t.name, 
      sourceType: t.source.type 
    })));
    
    return mergedTools;
  }

  private buildQueryString(request: MCPRequest): string {
    const { skillCategory, subject, gradeLevel, toolType } = request.params;
    return `${skillCategory || 'any'} ${subject || 'any'} ${gradeLevel || 'any'} ${toolType || 'tools'}`;
  }

  private generateRequestId(): string {
    this.requestCounter++;
    return `mcp-${Date.now()}-${this.requestCounter}`;
  }

  // ================================================================
  // PUBLIC API
  // ================================================================

  getServiceStatus(): {
    healthy: boolean;
    endpointStats: any;
    cacheStats: any;
    requestCount: number;
    uptime: number;
  } {
    const endpointStats = this.getEndpointStatus();
    const cacheStats = this.getCacheStats();
    
    return {
      healthy: endpointStats.activeEndpoints > 0,
      endpointStats,
      cacheStats,
      requestCount: this.requestCounter,
      uptime: Date.now() - (this.endpoints[0]?.lastUsed?.getTime() || Date.now())
    };
  }

  async healthCheck(): Promise<boolean> {
    try {
      // Perform a simple discovery request to test endpoints
      const testRequest: MCPRequest = {
        method: 'discover_tools',
        params: {
          skillCategory: 'A.0',
          subject: 'Math',
          gradeLevel: 'K',
          maxResults: 1
        }
      };

      const responses = await this.queryAllEndpoints(testRequest);
      const successfulResponses = responses.filter(r => r.success);
      
      return successfulResponses.length > 0;
    } catch (error) {
      console.error('❌ MCP health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const mcpToolDiscovery = new MCPToolDiscovery();