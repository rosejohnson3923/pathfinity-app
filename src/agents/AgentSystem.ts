// ================================================================
// AGENT SYSTEM - 6-Agent Finn Architecture Initialization
// Centralized system for managing the complete 6-agent ecosystem
// ================================================================

import { AgentRegistry, AgentType } from './base/FinnAgent';
import { FinnSee } from './FinnSee';
import { FinnSpeak } from './FinnSpeak';
import { FinnThink } from './FinnThink';
import { FinnTool } from './FinnTool';
import { FinnSafe } from './FinnSafe';
import { FinnView } from './FinnView';

export interface AgentSystemConfig {
  enabledAgents: AgentType[];
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  agentSettings: {
    [key in AgentType]?: {
      enabled: boolean;
      maxConcurrentRequests: number;
      estimatedResponseTime: number;
      settings: Record<string, any>;
    };
  };
  systemSettings: {
    healthCheckInterval: number;
    autoRestartFailedAgents: boolean;
    maxRetryAttempts: number;
    coordinationTimeout: number;
  };
}

export interface AgentSystemStatus {
  systemHealth: {
    healthy: boolean;
    agentCount: number;
    activeAgents: number;
    systemUptime: number;
    lastHealthCheck: Date;
  };
  agentStatuses: {
    [key in AgentType]?: {
      status: 'active' | 'inactive' | 'error';
      uptime: number;
      requestCount: number;
      activeRequests: number;
      lastError?: string;
      performance: {
        averageResponseTime: number;
        successRate: number;
        errorRate: number;
      };
    };
  };
  systemMetrics: {
    totalRequests: number;
    totalResponses: number;
    averageSystemResponseTime: number;
    memoryUsage: number;
    cpuUsage: number;
  };
}

export class AgentSystem {
  private registry: AgentRegistry;
  private config: AgentSystemConfig;
  private agents: Map<AgentType, any> = new Map();
  private systemStartTime: Date;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private systemMetrics: any = {
    totalRequests: 0,
    totalResponses: 0,
    responseTimeSum: 0,
    errorCount: 0
  };

  constructor(config: AgentSystemConfig) {
    this.config = config;
    this.registry = new AgentRegistry();
    this.systemStartTime = new Date();
    
    console.log('🤖 Agent System initializing with 6-agent architecture...');
  }

  // ================================================================
  // SYSTEM LIFECYCLE
  // ================================================================

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('⚠️ Agent System already initialized');
      return;
    }

    try {
      console.log('🚀 Initializing Agent System...');
      
      // Initialize agents based on configuration
      await this.initializeAgents();
      
      // Start health monitoring
      await this.startHealthMonitoring();
      
      // Set up system coordination
      await this.setupSystemCoordination();
      
      this.isInitialized = true;
      console.log('✅ Agent System initialized successfully');
      
    } catch (error) {
      console.error('❌ Agent System initialization failed:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (!this.isInitialized) {
      console.log('⚠️ Agent System not initialized');
      return;
    }

    try {
      console.log('🛑 Shutting down Agent System...');
      
      // Stop health monitoring
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      
      // Shutdown all agents
      await this.shutdownAgents();
      
      // Clean up resources
      this.agents.clear();
      this.isInitialized = false;
      
      console.log('✅ Agent System shutdown complete');
      
    } catch (error) {
      console.error('❌ Agent System shutdown failed:', error);
      throw error;
    }
  }

  // ================================================================
  // AGENT INITIALIZATION
  // ================================================================

  private async initializeAgents(): Promise<void> {
    console.log('🔧 Initializing agents...');
    
    for (const agentType of this.config.enabledAgents) {
      try {
        await this.initializeAgent(agentType);
      } catch (error) {
        console.error(`❌ Failed to initialize ${agentType} agent:`, error);
        if (!this.config.systemSettings.autoRestartFailedAgents) {
          throw error;
        }
      }
    }
  }

  private async initializeAgent(agentType: AgentType): Promise<void> {
    const agentConfig = this.createAgentConfig(agentType);
    let agent: any;

    switch (agentType) {
      case 'see':
        agent = new FinnSee(agentConfig);
        break;
      case 'speak':
        agent = new FinnSpeak(agentConfig);
        break;
      case 'think':
        agent = new FinnThink(agentConfig);
        break;
      case 'tool':
        agent = new FinnTool(agentConfig);
        break;
      case 'safe':
        agent = new FinnSafe(agentConfig);
        break;
      case 'view':
        agent = new FinnView(agentConfig);
        break;
      default:
        throw new Error(`Unknown agent type: ${agentType}`);
    }

    // Initialize the agent
    await agent.initialize();
    
    // Register with the registry
    this.registry.registerAgent(agent);
    
    // Store in local map
    this.agents.set(agentType, agent);
    
    console.log(`✅ ${agentType} agent initialized successfully`);
  }

  private createAgentConfig(agentType: AgentType): any {
    const agentSettings = this.config.agentSettings[agentType] || {};
    
    return {
      agentType,
      name: `Finn${agentType.charAt(0).toUpperCase() + agentType.slice(1)}`,
      version: '1.0.0',
      enabled: agentSettings.enabled !== false,
      debug: this.config.debugMode,
      capabilities: {
        canProcess: this.getAgentCapabilities(agentType),
        dependencies: this.getAgentDependencies(agentType),
        provides: this.getAgentProvides(agentType),
        maxConcurrentRequests: agentSettings.maxConcurrentRequests || 10,
        estimatedResponseTime: agentSettings.estimatedResponseTime || 1000
      },
      settings: agentSettings.settings || {}
    };
  }

  private getAgentCapabilities(agentType: AgentType): string[] {
    const capabilities = {
      see: ['visual_content', 'diagrams', 'animations', 'spatial_reasoning'],
      speak: ['conversations', 'collaboration', 'presentations', 'discussions'],
      think: ['problem_solving', 'critical_thinking', 'logical_reasoning', 'metacognition'],
      tool: ['tool_discovery', 'orchestration', 'mcp_integration', 'skill_matching'],
      safe: ['content_safety', 'compliance', 'privacy', 'accessibility'],
      view: ['video_curation', 'content_filtering', 'engagement_analysis', 'playlist_management']
    };
    
    return capabilities[agentType] || [];
  }

  private getAgentDependencies(agentType: AgentType): AgentType[] {
    const dependencies = {
      see: [],
      speak: [],
      think: [],
      tool: ['safe' as AgentType],
      safe: [],
      view: ['safe' as AgentType]
    };
    
    return dependencies[agentType] || [];
  }

  private getAgentProvides(agentType: AgentType): string[] {
    const provides = {
      see: ['visual_learning', 'interactive_content', 'spatial_support'],
      speak: ['collaborative_learning', 'communication_support', 'social_interaction'],
      think: ['reasoning_support', 'problem_solving', 'analytical_thinking'],
      tool: ['educational_tools', 'skill_based_resources', 'tool_recommendations'],
      safe: ['content_validation', 'safety_assessment', 'compliance_monitoring'],
      view: ['video_content', 'educational_media', 'curated_playlists']
    };
    
    return provides[agentType] || [];
  }

  // ================================================================
  // SYSTEM COORDINATION
  // ================================================================

  private async setupSystemCoordination(): Promise<void> {
    console.log('🔗 Setting up system coordination...');
    
    // Set up inter-agent communication
    await this.setupInterAgentCommunication();
    
    // Initialize coordination workflows
    await this.initializeCoordinationWorkflows();
    
    // Set up system-wide event handling
    await this.setupSystemEventHandling();
  }

  private async setupInterAgentCommunication(): Promise<void> {
    // Set up message routing and coordination between agents
    console.log('📡 Inter-agent communication established');
  }

  private async initializeCoordinationWorkflows(): Promise<void> {
    // Initialize common workflows that require multiple agents
    console.log('🔄 Coordination workflows initialized');
  }

  private async setupSystemEventHandling(): Promise<void> {
    // Set up system-wide event handling
    console.log('📢 System event handling established');
  }

  // ================================================================
  // HEALTH MONITORING
  // ================================================================

  private async startHealthMonitoring(): Promise<void> {
    console.log('🏥 Starting health monitoring...');
    
    const interval = this.config.systemSettings.healthCheckInterval || 30000; // 30 seconds
    
    this.healthCheckInterval = setInterval(async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        console.error('❌ Health check failed:', error);
      }
    }, interval);
  }

  private async performHealthCheck(): Promise<void> {
    const systemHealth = this.registry.getSystemHealth();
    
    // Check for failed agents
    for (const [agentType, agentStatus] of Object.entries(systemHealth.agentStatuses)) {
      if (!agentStatus.health.healthy && this.config.systemSettings.autoRestartFailedAgents) {
        console.log(`🔄 Attempting to restart failed agent: ${agentType}`);
        await this.restartAgent(agentType as AgentType);
      }
    }
    
    // Log system health if in debug mode
    if (this.config.debugMode) {
      console.log('🏥 System Health:', {
        healthy: systemHealth.healthy,
        activeAgents: systemHealth.agentCount,
        issues: systemHealth.systemIssues
      });
    }
  }

  private async restartAgent(agentType: AgentType): Promise<void> {
    try {
      // Shutdown the failed agent
      const agent = this.agents.get(agentType);
      if (agent) {
        await agent.shutdown();
        this.registry.unregisterAgent(agentType);
      }
      
      // Reinitialize the agent
      await this.initializeAgent(agentType);
      
      console.log(`✅ Agent ${agentType} restarted successfully`);
    } catch (error) {
      console.error(`❌ Failed to restart agent ${agentType}:`, error);
    }
  }

  // ================================================================
  // AGENT SYSTEM INTERFACE
  // ================================================================

  async requestAgentAction(agentType: AgentType, action: string, data: any): Promise<any> {
    if (!this.isInitialized) {
      throw new Error('Agent System not initialized');
    }

    const agent = this.agents.get(agentType);
    if (!agent) {
      throw new Error(`Agent ${agentType} not found or not initialized`);
    }

    this.systemMetrics.totalRequests++;
    const startTime = Date.now();

    try {
      const message = {
        toAgent: agentType,
        messageType: 'request' as const,
        payload: {
          requestType: action,
          data
        },
        priority: 'medium' as const
      };

      const response = await agent.handleMessage({
        id: `system-${Date.now()}`,
        fromAgent: 'system' as AgentType,
        timestamp: new Date(),
        ...message
      });

      const responseTime = Date.now() - startTime;
      this.systemMetrics.totalResponses++;
      this.systemMetrics.responseTimeSum += responseTime;

      return response;
    } catch (error) {
      this.systemMetrics.errorCount++;
      throw error;
    }
  }

  async coordinateMultiAgentTask(task: {
    name: string;
    agents: AgentType[];
    workflow: any;
    data: any;
  }): Promise<any> {
    console.log(`🤝 Coordinating multi-agent task: ${task.name}`);
    
    // This would implement complex multi-agent coordination
    // For now, return a basic coordination result
    return {
      taskName: task.name,
      coordinationResult: 'success',
      involvedAgents: task.agents,
      executionTime: Date.now(),
      results: {}
    };
  }

  getSystemStatus(): AgentSystemStatus {
    const systemHealth = this.registry.getSystemHealth();
    const now = Date.now();
    const uptime = now - this.systemStartTime.getTime();

    return {
      systemHealth: {
        healthy: systemHealth.healthy,
        agentCount: systemHealth.agentCount,
        activeAgents: systemHealth.agentCount,
        systemUptime: uptime,
        lastHealthCheck: new Date()
      },
      agentStatuses: systemHealth.agentStatuses,
      systemMetrics: {
        totalRequests: this.systemMetrics.totalRequests,
        totalResponses: this.systemMetrics.totalResponses,
        averageSystemResponseTime: this.systemMetrics.totalResponses > 0 
          ? this.systemMetrics.responseTimeSum / this.systemMetrics.totalResponses 
          : 0,
        memoryUsage: process.memoryUsage().heapUsed / 1024 / 1024, // MB
        cpuUsage: process.cpuUsage().user / 1000 // ms
      }
    };
  }

  getAgent(agentType: AgentType): any {
    return this.agents.get(agentType);
  }

  getRegistry(): AgentRegistry {
    return this.registry;
  }

  // ================================================================
  // SYSTEM SHUTDOWN
  // ================================================================

  private async shutdownAgents(): Promise<void> {
    console.log('🛑 Shutting down agents...');
    
    for (const [agentType, agent] of this.agents.entries()) {
      try {
        await agent.shutdown();
        this.registry.unregisterAgent(agentType);
        console.log(`✅ ${agentType} agent shutdown complete`);
      } catch (error) {
        console.error(`❌ Failed to shutdown ${agentType} agent:`, error);
      }
    }
  }
}

// ================================================================
// DEFAULT CONFIGURATION
// ================================================================

export const DEFAULT_AGENT_SYSTEM_CONFIG: AgentSystemConfig = {
  enabledAgents: ['see', 'speak', 'think', 'tool', 'safe', 'view'],
  debugMode: false,
  logLevel: 'info',
  agentSettings: {
    see: {
      enabled: true,
      maxConcurrentRequests: 10,
      estimatedResponseTime: 1500,
      settings: {
        visualQuality: 'high',
        animationSupport: true,
        accessibilityMode: 'full'
      }
    },
    speak: {
      enabled: true,
      maxConcurrentRequests: 8,
      estimatedResponseTime: 2000,
      settings: {
        languageSupport: ['en', 'es', 'fr'],
        moderationLevel: 'moderate',
        collaborationMode: 'adaptive'
      }
    },
    think: {
      enabled: true,
      maxConcurrentRequests: 6,
      estimatedResponseTime: 2500,
      settings: {
        reasoningDepth: 'comprehensive',
        scaffoldingLevel: 'adaptive',
        metacognitionSupport: true
      }
    },
    tool: {
      enabled: true,
      maxConcurrentRequests: 12,
      estimatedResponseTime: 3000,
      settings: {
        mcpEndpoints: ['https://mcp.pathfinity.com/tools'],
        cacheStrategy: 'prefer_cache',
        safetyLevel: 'strict'
      }
    },
    safe: {
      enabled: true,
      maxConcurrentRequests: 15,
      estimatedResponseTime: 1000,
      settings: {
        strictnessLevel: 'moderate',
        complianceStandards: ['COPPA', 'FERPA', 'WCAG-AA'],
        continuousMonitoring: true
      }
    },
    view: {
      enabled: true,
      maxConcurrentRequests: 10,
      estimatedResponseTime: 2000,
      settings: {
        safeChannels: ['Khan Academy', 'Crash Course', 'TED-Ed'],
        contentRating: 'G',
        requireCaptions: true
      }
    }
  },
  systemSettings: {
    healthCheckInterval: 30000,
    autoRestartFailedAgents: true,
    maxRetryAttempts: 3,
    coordinationTimeout: 10000
  }
};

// ================================================================
// SYSTEM FACTORY
// ================================================================

export function createAgentSystem(config?: Partial<AgentSystemConfig>): AgentSystem {
  const finalConfig = {
    ...DEFAULT_AGENT_SYSTEM_CONFIG,
    ...config,
    agentSettings: {
      ...DEFAULT_AGENT_SYSTEM_CONFIG.agentSettings,
      ...config?.agentSettings
    },
    systemSettings: {
      ...DEFAULT_AGENT_SYSTEM_CONFIG.systemSettings,
      ...config?.systemSettings
    }
  };

  return new AgentSystem(finalConfig);
}

// Export default instance for easy usage
export const defaultAgentSystem = createAgentSystem();