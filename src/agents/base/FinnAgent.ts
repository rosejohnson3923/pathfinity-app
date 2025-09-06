// ================================================================
// FINN AGENT BASE CLASS
// Foundation for all 6 Finn agents with common functionality
// ================================================================

// Simple browser-compatible event emitter
class EventEmitter {
  private events: { [key: string]: Function[] } = {};
  
  on(event: string, listener: Function): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }
  
  emit(event: string, ...args: any[]): void {
    if (this.events[event]) {
      this.events[event].forEach(listener => listener(...args));
    }
  }
  
  off(event: string, listener: Function): void {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(l => l !== listener);
    }
  }
}

// Base agent types
export type AgentType = 'see' | 'speak' | 'think' | 'tool' | 'safe' | 'view';
export type AgentStatus = 'inactive' | 'active' | 'processing' | 'error';
export type AgentPriority = 'low' | 'medium' | 'high' | 'critical';

// Agent communication interfaces
export interface AgentMessage {
  id: string;
  fromAgent: AgentType;
  toAgent: AgentType | 'all';
  messageType: 'request' | 'response' | 'notification' | 'error';
  payload: any;
  timestamp: Date;
  priority: AgentPriority;
}

export interface AgentResponse {
  success: boolean;
  data?: any;
  error?: string;
  confidence?: number; // 0-1 for recommendations
  reasoning?: string;
  metadata?: {
    processingTime: number;
    resourcesUsed: string[];
    dependencies: AgentType[];
  };
}

export interface AgentCapabilities {
  canProcess: string[]; // Types of requests this agent can handle
  dependencies: AgentType[]; // Other agents this agent depends on
  provides: string[]; // Services this agent provides
  maxConcurrentRequests: number;
  estimatedResponseTime: number; // milliseconds
}

// Base agent configuration
export interface AgentConfig {
  agentType: AgentType;
  name: string;
  version: string;
  enabled: boolean;
  debug: boolean;
  capabilities: AgentCapabilities;
  settings: Record<string, any>;
}

// Base Finn Agent class
export abstract class FinnAgent extends EventEmitter {
  protected config: AgentConfig;
  protected status: AgentStatus = 'inactive';
  protected activeRequests: Map<string, any> = new Map();
  protected startTime: Date;
  protected requestCount: number = 0;

  constructor(config: AgentConfig) {
    super();
    this.config = config;
    this.startTime = new Date();
    this.log('Agent initialized', { type: this.config.agentType, name: this.config.name });
  }

  // ================================================================
  // CORE AGENT LIFECYCLE
  // ================================================================

  async initialize(): Promise<void> {
    try {
      this.status = 'active';
      await this.onInitialize();
      this.emit('initialized', { agent: this.config.agentType });
      this.log('Agent initialized successfully');
    } catch (error) {
      this.status = 'error';
      this.log('Agent initialization failed', { error });
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      this.status = 'inactive';
      await this.onShutdown();
      this.emit('shutdown', { agent: this.config.agentType });
      this.log('Agent shutdown successfully');
    } catch (error) {
      this.log('Agent shutdown failed', { error });
      throw error;
    }
  }

  // ================================================================
  // AGENT COMMUNICATION
  // ================================================================

  async sendMessage(message: Omit<AgentMessage, 'id' | 'fromAgent' | 'timestamp'>): Promise<void> {
    const fullMessage: AgentMessage = {
      id: this.generateMessageId(),
      fromAgent: this.config.agentType,
      timestamp: new Date(),
      ...message
    };

    this.emit('message', fullMessage);
    this.log('Message sent', { to: fullMessage.toAgent, type: fullMessage.messageType });
  }

  async handleMessage(message: AgentMessage): Promise<AgentResponse> {
    try {
      this.log('Message received', { from: message.fromAgent, type: message.messageType });
      
      // Check if agent can handle this message
      if (!this.canHandleMessage(message)) {
        return {
          success: false,
          error: `Agent ${this.config.agentType} cannot handle message type: ${message.messageType}`
        };
      }

      // Track active request
      this.activeRequests.set(message.id, message);
      this.requestCount++;

      const startTime = Date.now();
      const response = await this.processMessage(message);
      const processingTime = Date.now() - startTime;

      // Add metadata
      response.metadata = {
        processingTime,
        resourcesUsed: this.getResourcesUsed(message),
        dependencies: this.config.capabilities.dependencies,
        ...response.metadata
      };

      // Clean up
      this.activeRequests.delete(message.id);
      
      this.log('Message processed', { 
        messageId: message.id, 
        processingTime,
        success: response.success 
      });

      return response;

    } catch (error) {
      this.activeRequests.delete(message.id);
      this.log('Message processing failed', { messageId: message.id, error });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // ================================================================
  // AGENT STATUS AND MONITORING
  // ================================================================

  getStatus(): {
    agentType: AgentType;
    status: AgentStatus;
    uptime: number;
    requestCount: number;
    activeRequests: number;
    capabilities: AgentCapabilities;
  } {
    return {
      agentType: this.config.agentType,
      status: this.status,
      uptime: Date.now() - this.startTime.getTime(),
      requestCount: this.requestCount,
      activeRequests: this.activeRequests.size,
      capabilities: this.config.capabilities
    };
  }

  getHealth(): {
    healthy: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check if agent is overwhelmed
    if (this.activeRequests.size >= this.config.capabilities.maxConcurrentRequests) {
      issues.push('Agent at maximum concurrent request capacity');
      recommendations.push('Consider scaling or load balancing');
    }

    // Check if agent is in error state
    if (this.status === 'error') {
      issues.push('Agent in error state');
      recommendations.push('Check logs and restart if necessary');
    }

    return {
      healthy: issues.length === 0,
      issues,
      recommendations
    };
  }

  // ================================================================
  // ABSTRACT METHODS (TO BE IMPLEMENTED BY SUBCLASSES)
  // ================================================================

  protected abstract onInitialize(): Promise<void>;
  protected abstract onShutdown(): Promise<void>;
  protected abstract processMessage(message: AgentMessage): Promise<AgentResponse>;
  protected abstract canHandleMessage(message: AgentMessage): boolean;

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  protected log(message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      agent: this.config.agentType,
      message,
      ...(data && { data })
    };

    if (this.config.debug) {
      console.log(`[${timestamp}] [${this.config.agentType.toUpperCase()}] ${message}`, data || '');
    }

    this.emit('log', logEntry);
  }

  protected generateMessageId(): string {
    return `${this.config.agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected getResourcesUsed(message: AgentMessage): string[] {
    // Default implementation - can be overridden by subclasses
    return ['memory', 'cpu'];
  }

  // ================================================================
  // CONFIGURATION MANAGEMENT
  // ================================================================

  updateConfig(updates: Partial<AgentConfig>): void {
    this.config = { ...this.config, ...updates };
    this.emit('configUpdated', { agent: this.config.agentType, updates });
    this.log('Configuration updated', updates);
  }

  getConfig(): AgentConfig {
    return { ...this.config };
  }

  // ================================================================
  // COORDINATION HELPERS
  // ================================================================

  async requestHelp(targetAgent: AgentType, request: any): Promise<AgentResponse> {
    const message: Omit<AgentMessage, 'id' | 'fromAgent' | 'timestamp'> = {
      toAgent: targetAgent,
      messageType: 'request',
      payload: request,
      priority: 'medium'
    };

    await this.sendMessage(message);
    
    // In a real implementation, this would wait for a response
    // For now, we'll simulate a response
    return {
      success: true,
      data: { helper: targetAgent, request },
      confidence: 0.8,
      reasoning: `Requested help from ${targetAgent} agent`
    };
  }

  async notifyAgents(notification: any, priority: AgentPriority = 'medium'): Promise<void> {
    const message: Omit<AgentMessage, 'id' | 'fromAgent' | 'timestamp'> = {
      toAgent: 'all',
      messageType: 'notification',
      payload: notification,
      priority
    };

    await this.sendMessage(message);
  }
}

// ================================================================
// AGENT REGISTRY AND COORDINATION
// ================================================================

export class AgentRegistry {
  private agents: Map<AgentType, FinnAgent> = new Map();
  private messageQueue: AgentMessage[] = [];
  private isProcessingQueue = false;

  registerAgent(agent: FinnAgent): void {
    const agentType = agent.getStatus().agentType;
    this.agents.set(agentType, agent);
    
    // Set up message routing
    agent.on('message', (message: AgentMessage) => {
      this.routeMessage(message);
    });

    console.log(`🤖 Agent registered: ${agentType}`);
  }

  unregisterAgent(agentType: AgentType): void {
    const agent = this.agents.get(agentType);
    if (agent) {
      agent.removeAllListeners();
      this.agents.delete(agentType);
      console.log(`🤖 Agent unregistered: ${agentType}`);
    }
  }

  getAgent(agentType: AgentType): FinnAgent | null {
    return this.agents.get(agentType) || null;
  }

  getAllAgents(): Map<AgentType, FinnAgent> {
    return new Map(this.agents);
  }

  private async routeMessage(message: AgentMessage): Promise<void> {
    if (message.toAgent === 'all') {
      // Broadcast to all agents except sender
      for (const [agentType, agent] of this.agents) {
        if (agentType !== message.fromAgent) {
          await agent.handleMessage(message);
        }
      }
    } else {
      // Route to specific agent
      const targetAgent = this.agents.get(message.toAgent);
      if (targetAgent) {
        await targetAgent.handleMessage(message);
      } else {
        console.warn(`🤖 Agent not found: ${message.toAgent}`);
      }
    }
  }

  // Get system-wide health status
  getSystemHealth(): {
    healthy: boolean;
    agentCount: number;
    agentStatuses: Record<AgentType, any>;
    systemIssues: string[];
  } {
    const agentStatuses: Record<AgentType, any> = {} as Record<AgentType, any>;
    const systemIssues: string[] = [];

    for (const [agentType, agent] of this.agents) {
      const status = agent.getStatus();
      const health = agent.getHealth();
      
      agentStatuses[agentType] = {
        ...status,
        health
      };

      if (!health.healthy) {
        systemIssues.push(`${agentType}: ${health.issues.join(', ')}`);
      }
    }

    return {
      healthy: systemIssues.length === 0,
      agentCount: this.agents.size,
      agentStatuses,
      systemIssues
    };
  }
}

// Export types for use by other modules
export type { AgentMessage, AgentResponse, AgentCapabilities, AgentConfig };