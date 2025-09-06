// ================================================================
// MOCK MCP SERVER
// Testing endpoint for category-based tool mappings
// ================================================================

import { DiscoveredTool } from '../agents/FinnTool';
import { MCPRequest, MCPResponse } from '../services/MCPToolDiscovery';

export interface MockToolDatabase {
  [skillCategory: string]: {
    [subject: string]: {
      [gradeLevel: string]: DiscoveredTool[];
    };
  };
}

export class MockMCPServer {
  private toolDatabase: MockToolDatabase;
  private requestLog: Array<{ timestamp: Date; request: MCPRequest; response: MCPResponse }> = [];
  private serverStartTime: Date;

  constructor() {
    this.serverStartTime = new Date();
    this.toolDatabase = this.initializeToolDatabase();
    console.log('🚀 Mock MCP Server initialized');
  }

  // ================================================================
  // SERVER ENDPOINTS
  // ================================================================

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    try {
      let responseData: any;

      switch (request.method) {
        case 'discover_tools':
          responseData = await this.discoverTools(request);
          break;
        case 'validate_tool':
          responseData = await this.validateTool(request);
          break;
        case 'get_tool_info':
          responseData = await this.getToolInfo(request);
          break;
        case 'search_tools':
          responseData = await this.searchTools(request);
          break;
        default:
          throw new Error(`Unsupported method: ${request.method}`);
      }

      const response: MCPResponse = {
        success: true,
        data: responseData,
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      };

      this.logRequest(request, response);
      return response;

    } catch (error) {
      const response: MCPResponse = {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: { method: request.method, params: request.params }
        },
        metadata: {
          requestId,
          timestamp: new Date().toISOString(),
          processingTime: Date.now() - startTime,
          version: '1.0.0'
        }
      };

      this.logRequest(request, response);
      return response;
    }
  }

  // ================================================================
  // TOOL DISCOVERY METHODS
  // ================================================================

  private async discoverTools(request: MCPRequest): Promise<any> {
    const { skillCategory, subject, gradeLevel, toolType, maxResults = 10, filters } = request.params;

    // Simulate network delay
    await this.simulateNetworkDelay();

    const tools: DiscoveredTool[] = [];

    // Get tools for specific category/subject/grade
    if (skillCategory && subject && gradeLevel) {
      const categoryTools = this.toolDatabase[skillCategory]?.[subject]?.[gradeLevel] || [];
      tools.push(...categoryTools);
    }

    // Get tools for skill category across all subjects/grades
    else if (skillCategory) {
      const categoryData = this.toolDatabase[skillCategory] || {};
      Object.values(categoryData).forEach(subjectData => {
        Object.values(subjectData).forEach(gradeTools => {
          tools.push(...gradeTools);
        });
      });
    }

    // Get tools for subject across all categories/grades
    else if (subject) {
      Object.values(this.toolDatabase).forEach(categoryData => {
        const subjectData = categoryData[subject] || {};
        Object.values(subjectData).forEach(gradeTools => {
          tools.push(...gradeTools);
        });
      });
    }

    // Apply filters
    let filteredTools = this.applyFilters(tools, filters);

    // Apply tool type filter
    if (toolType) {
      filteredTools = filteredTools.filter(tool => 
        tool.name.toLowerCase().includes(toolType.toLowerCase()) ||
        tool.description.toLowerCase().includes(toolType.toLowerCase())
      );
    }

    // Limit results
    const limitedTools = filteredTools.slice(0, maxResults);

    return {
      tools: limitedTools,
      totalCount: filteredTools.length,
      searchMetadata: {
        query: this.buildQueryString(request.params),
        resultsFound: limitedTools.length,
        searchTime: 50 + Math.random() * 200,
        sources: ['MockMCPServer'],
        cacheHit: false
      }
    };
  }

  private async validateTool(request: MCPRequest): Promise<any> {
    const { toolId } = request.params;
    
    await this.simulateNetworkDelay();

    // Search for tool across all categories
    const allTools = this.getAllTools();
    const tool = allTools.find(t => t.id === toolId);

    if (tool) {
      return {
        tools: [tool],
        totalCount: 1,
        searchMetadata: {
          query: `validate:${toolId}`,
          resultsFound: 1,
          searchTime: 30 + Math.random() * 100,
          sources: ['MockMCPServer'],
          cacheHit: false
        }
      };
    }

    return {
      tools: [],
      totalCount: 0,
      searchMetadata: {
        query: `validate:${toolId}`,
        resultsFound: 0,
        searchTime: 20 + Math.random() * 50,
        sources: ['MockMCPServer'],
        cacheHit: false
      }
    };
  }

  private async getToolInfo(request: MCPRequest): Promise<any> {
    const { toolId } = request.params;
    
    await this.simulateNetworkDelay();

    const allTools = this.getAllTools();
    const tool = allTools.find(t => t.id === toolId);

    if (tool) {
      // Add additional detailed information
      const detailedTool = {
        ...tool,
        detailedInfo: {
          fullDescription: `${tool.description} This tool provides comprehensive educational support with interactive features and assessment capabilities.`,
          usageInstructions: [
            'Launch the tool using the provided URL',
            'Configure settings based on student needs',
            'Monitor student progress through built-in analytics',
            'Adjust difficulty based on performance'
          ],
          technicalRequirements: {
            browser: ['Chrome', 'Firefox', 'Safari', 'Edge'],
            minVersion: '90+',
            javascript: true,
            cookies: false,
            storage: 'localStorage'
          },
          educationalFrameworks: ['Common Core', 'NGSS', 'State Standards'],
          supportedLanguages: ['English', 'Spanish', 'French'],
          dataPrivacy: {
            collectsPersonalData: false,
            sharesData: false,
            gdprCompliant: true,
            coppaCompliant: true
          }
        }
      };

      return {
        tools: [detailedTool],
        totalCount: 1,
        searchMetadata: {
          query: `info:${toolId}`,
          resultsFound: 1,
          searchTime: 40 + Math.random() * 120,
          sources: ['MockMCPServer'],
          cacheHit: false
        }
      };
    }

    return {
      tools: [],
      totalCount: 0,
      searchMetadata: {
        query: `info:${toolId}`,
        resultsFound: 0,
        searchTime: 20 + Math.random() * 50,
        sources: ['MockMCPServer'],
        cacheHit: false
      }
    };
  }

  private async searchTools(request: MCPRequest): Promise<any> {
    const { query, filters, maxResults = 20 } = request.params;
    
    await this.simulateNetworkDelay();

    const allTools = this.getAllTools();
    const searchTerms = query.toLowerCase().split(' ');

    // Search across tool names, descriptions, and categories
    const matchedTools = allTools.filter(tool => {
      const searchableText = [
        tool.name,
        tool.description,
        tool.category,
        ...tool.skillCategories,
        ...tool.compatibility.subjects,
        ...tool.compatibility.gradeLevel
      ].join(' ').toLowerCase();

      return searchTerms.some(term => searchableText.includes(term));
    });

    // Apply filters
    const filteredTools = this.applyFilters(matchedTools, filters);

    // Sort by relevance (simple scoring)
    const scoredTools = filteredTools.map(tool => ({
      tool,
      score: this.calculateRelevanceScore(tool, searchTerms)
    }));

    scoredTools.sort((a, b) => b.score - a.score);

    const limitedTools = scoredTools.slice(0, maxResults).map(item => item.tool);

    return {
      tools: limitedTools,
      totalCount: filteredTools.length,
      searchMetadata: {
        query,
        resultsFound: limitedTools.length,
        searchTime: 80 + Math.random() * 300,
        sources: ['MockMCPServer'],
        cacheHit: false
      }
    };
  }

  // ================================================================
  // TOOL DATABASE INITIALIZATION
  // ================================================================

  private initializeToolDatabase(): MockToolDatabase {
    const database: MockToolDatabase = {};

    // A.0 - Numbers and Counting
    this.addSkillCategory(database, 'A.0', {
      'Math': {
        'Pre-K': [
          this.createTool('counting-bears', 'A.0', 'Math', 'Pre-K', 'Counting Bears', 'Interactive counting tool with virtual manipulatives'),
          this.createTool('number-recognition', 'A.0', 'Math', 'Pre-K', 'Number Recognition Game', 'Visual number recognition activities'),
          this.createTool('simple-patterns', 'A.0', 'Math', 'Pre-K', 'Simple Patterns', 'Pattern recognition with shapes and colors')
        ],
        'K': [
          this.createTool('counting-to-10', 'A.0', 'Math', 'K', 'Counting to 10', 'Interactive counting exercises up to 10'),
          this.createTool('number-line', 'A.0', 'Math', 'K', 'Number Line Explorer', 'Interactive number line for counting and ordering'),
          this.createTool('basic-addition', 'A.0', 'Math', 'K', 'Basic Addition', 'Visual addition with objects and numbers')
        ],
        '1': [
          this.createTool('counting-to-100', 'A.0', 'Math', '1', 'Counting to 100', 'Advanced counting activities up to 100'),
          this.createTool('place-value', 'A.0', 'Math', '1', 'Place Value Blocks', 'Tens and ones place value understanding')
        ]
      }
    });

    // B.0 - Shapes and Geometry
    this.addSkillCategory(database, 'B.0', {
      'Math': {
        'Pre-K': [
          this.createTool('shape-sorter', 'B.0', 'Math', 'Pre-K', 'Shape Sorter', 'Interactive shape recognition and sorting'),
          this.createTool('pattern-blocks', 'B.0', 'Math', 'Pre-K', 'Pattern Blocks', 'Virtual pattern blocks for geometric exploration')
        ],
        'K': [
          this.createTool('2d-shapes', 'B.0', 'Math', 'K', '2D Shapes Explorer', 'Interactive 2D shape identification and properties'),
          this.createTool('3d-shapes', 'B.0', 'Math', 'K', '3D Shapes Viewer', 'Virtual 3D shape manipulation and exploration')
        ],
        '1': [
          this.createTool('geometry-builder', 'B.0', 'Math', '1', 'Geometry Builder', 'Create and analyze geometric shapes'),
          this.createTool('symmetry-explorer', 'B.0', 'Math', '1', 'Symmetry Explorer', 'Explore lines of symmetry in shapes')
        ]
      }
    });

    // C.0 - Reading and Phonics
    this.addSkillCategory(database, 'C.0', {
      'ELA': {
        'Pre-K': [
          this.createTool('letter-sounds', 'C.0', 'ELA', 'Pre-K', 'Letter Sounds', 'Interactive phonics with letter-sound correspondence'),
          this.createTool('rhyme-time', 'C.0', 'ELA', 'Pre-K', 'Rhyme Time', 'Rhyming games and activities')
        ],
        'K': [
          this.createTool('sight-words', 'C.0', 'ELA', 'K', 'Sight Words Practice', 'Interactive sight word recognition and reading'),
          this.createTool('phonics-blending', 'C.0', 'ELA', 'K', 'Phonics Blending', 'Blend sounds to make words')
        ],
        '1': [
          this.createTool('reading-comprehension', 'C.0', 'ELA', '1', 'Reading Comprehension', 'Interactive stories with comprehension questions'),
          this.createTool('word-families', 'C.0', 'ELA', '1', 'Word Families', 'Explore word patterns and families')
        ]
      }
    });

    // D.0 - Science Exploration
    this.addSkillCategory(database, 'D.0', {
      'Science': {
        'Pre-K': [
          this.createTool('weather-watch', 'D.0', 'Science', 'Pre-K', 'Weather Watch', 'Interactive weather observation and patterns'),
          this.createTool('animal-habitats', 'D.0', 'Science', 'Pre-K', 'Animal Habitats', 'Explore where animals live')
        ],
        'K': [
          this.createTool('plant-life-cycle', 'D.0', 'Science', 'K', 'Plant Life Cycle', 'Interactive plant growth simulation'),
          this.createTool('simple-machines', 'D.0', 'Science', 'K', 'Simple Machines', 'Explore levers, pulleys, and wheels')
        ],
        '1': [
          this.createTool('seasons-simulator', 'D.0', 'Science', '1', 'Seasons Simulator', 'Understand seasonal changes and cycles'),
          this.createTool('matter-states', 'D.0', 'Science', '1', 'States of Matter', 'Explore solids, liquids, and gases')
        ]
      }
    });

    // E.0 - Social Studies
    this.addSkillCategory(database, 'E.0', {
      'SocialStudies': {
        'Pre-K': [
          this.createTool('family-community', 'E.0', 'SocialStudies', 'Pre-K', 'Family & Community', 'Learn about family roles and community helpers'),
          this.createTool('rules-safety', 'E.0', 'SocialStudies', 'Pre-K', 'Rules & Safety', 'Understanding classroom and home rules')
        ],
        'K': [
          this.createTool('maps-directions', 'E.0', 'SocialStudies', 'K', 'Maps & Directions', 'Basic map reading and directions'),
          this.createTool('community-helpers', 'E.0', 'SocialStudies', 'K', 'Community Helpers', 'Learn about different community jobs')
        ],
        '1': [
          this.createTool('past-present', 'E.0', 'SocialStudies', '1', 'Past & Present', 'Understanding time and historical changes'),
          this.createTool('citizenship', 'E.0', 'SocialStudies', '1', 'Good Citizenship', 'Rights, responsibilities, and civic participation')
        ]
      }
    });

    console.log('📚 Tool database initialized with comprehensive skill categories');
    return database;
  }

  private addSkillCategory(database: MockToolDatabase, category: string, data: any): void {
    database[category] = data;
  }

  private createTool(
    id: string,
    skillCategory: string,
    subject: string,
    gradeLevel: string,
    name: string,
    description: string
  ): DiscoveredTool {
    return {
      id: `mock-${id}`,
      name,
      description,
      category: skillCategory,
      skillCategories: [skillCategory],
      source: {
        type: 'verified',
        url: `https://mock-mcp-server.com/tools/${id}`,
        version: '1.0.0',
        lastUpdated: new Date()
      },
      capabilities: {
        interactive: true,
        assessment: Math.random() > 0.5,
        adaptive: Math.random() > 0.3,
        collaborative: Math.random() > 0.7,
        accessibility: ['keyboard_navigation', 'screen_reader', 'color_blind_friendly']
      },
      compatibility: {
        gradeLevel: [gradeLevel],
        subjects: [subject],
        platforms: ['web', 'tablet', 'mobile']
      },
      safety: {
        verified: true,
        safetyScore: 0.9 + Math.random() * 0.1,
        lastSafetyCheck: new Date(),
        compliance: ['COPPA', 'FERPA', 'GDPR', 'WCAG-AA']
      },
      metrics: {
        usageCount: Math.floor(Math.random() * 5000) + 500,
        userRating: 4.0 + Math.random() * 1.0,
        educationalEffectiveness: 0.8 + Math.random() * 0.2,
        technicalReliability: 0.85 + Math.random() * 0.15
      },
      configuration: {
        launchUrl: `https://pathfinity.com/tools/launch/${id}`,
        configurationOptions: {
          difficulty: 'adaptive',
          duration: 'flexible',
          assessment: 'formative',
          language: 'en',
          accessibility: 'full'
        },
        integrationMethod: 'iframe'
      }
    };
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private applyFilters(tools: DiscoveredTool[], filters: any): DiscoveredTool[] {
    if (!filters) return tools;

    return tools.filter(tool => {
      if (filters.verified !== undefined && tool.safety.verified !== filters.verified) {
        return false;
      }
      
      if (filters.educational !== undefined && tool.source.type !== 'verified') {
        return false;
      }
      
      if (filters.accessibility !== undefined && !tool.capabilities.accessibility) {
        return false;
      }
      
      if (filters.freeOnly !== undefined && filters.freeOnly) {
        // Assume all mock tools are free
        return true;
      }
      
      return true;
    });
  }

  private calculateRelevanceScore(tool: DiscoveredTool, searchTerms: string[]): number {
    let score = 0;
    
    const searchableText = [
      tool.name,
      tool.description,
      tool.category,
      ...tool.skillCategories,
      ...tool.compatibility.subjects,
      ...tool.compatibility.gradeLevel
    ].join(' ').toLowerCase();

    searchTerms.forEach(term => {
      if (tool.name.toLowerCase().includes(term)) score += 10;
      if (tool.description.toLowerCase().includes(term)) score += 5;
      if (tool.category.toLowerCase().includes(term)) score += 8;
      if (searchableText.includes(term)) score += 1;
    });

    // Boost score based on tool quality metrics
    score += tool.metrics.userRating * 2;
    score += tool.metrics.educationalEffectiveness * 5;
    score += tool.safety.safetyScore * 3;

    return score;
  }

  private getAllTools(): DiscoveredTool[] {
    const allTools: DiscoveredTool[] = [];
    
    Object.values(this.toolDatabase).forEach(categoryData => {
      Object.values(categoryData).forEach(subjectData => {
        Object.values(subjectData).forEach(gradeTools => {
          allTools.push(...gradeTools);
        });
      });
    });
    
    return allTools;
  }

  private buildQueryString(params: any): string {
    const { skillCategory, subject, gradeLevel, toolType, query } = params;
    
    if (query) return query;
    
    const parts = [
      skillCategory || 'any',
      subject || 'any',
      gradeLevel || 'any',
      toolType || 'tools'
    ];
    
    return parts.join(' ');
  }

  private async simulateNetworkDelay(): Promise<void> {
    const delay = 50 + Math.random() * 200; // 50-250ms
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  private generateRequestId(): string {
    return `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private logRequest(request: MCPRequest, response: MCPResponse): void {
    this.requestLog.push({
      timestamp: new Date(),
      request,
      response
    });

    // Keep only last 100 requests
    if (this.requestLog.length > 100) {
      this.requestLog.shift();
    }
  }

  // ================================================================
  // SERVER MANAGEMENT
  // ================================================================

  getServerStatus(): {
    uptime: number;
    totalRequests: number;
    successRate: number;
    averageResponseTime: number;
    toolCount: number;
    categoryCount: number;
  } {
    const uptime = Date.now() - this.serverStartTime.getTime();
    const totalRequests = this.requestLog.length;
    const successfulRequests = this.requestLog.filter(entry => entry.response.success).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests : 0;
    const averageResponseTime = this.requestLog.reduce((sum, entry) => sum + entry.response.metadata.processingTime, 0) / Math.max(totalRequests, 1);
    const toolCount = this.getAllTools().length;
    const categoryCount = Object.keys(this.toolDatabase).length;

    return {
      uptime,
      totalRequests,
      successRate,
      averageResponseTime,
      toolCount,
      categoryCount
    };
  }

  getRequestLog(): Array<{ timestamp: Date; request: MCPRequest; response: MCPResponse }> {
    return [...this.requestLog];
  }

  getToolsByCategory(category: string): DiscoveredTool[] {
    const categoryData = this.toolDatabase[category];
    if (!categoryData) return [];

    const tools: DiscoveredTool[] = [];
    Object.values(categoryData).forEach(subjectData => {
      Object.values(subjectData).forEach(gradeTools => {
        tools.push(...gradeTools);
      });
    });

    return tools;
  }

  getCategories(): string[] {
    return Object.keys(this.toolDatabase);
  }

  resetServer(): void {
    this.requestLog = [];
    this.serverStartTime = new Date();
    console.log('🔄 Mock MCP Server reset');
  }
}

// Export singleton instance
export const mockMCPServer = new MockMCPServer();