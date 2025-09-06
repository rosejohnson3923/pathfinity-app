/**
 * Master AI Rules Engine
 * Orchestrates all specialized rules engines and manages cross-cutting concerns
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from './core/BaseRulesEngine';
import { RuleEngineError, RuleEngineErrorCode } from './core/types';
import { ruleRegistry } from './core/RuleRegistry';
import { ruleMonitor } from './monitoring/RuleMonitor';

/**
 * Master context that includes all cross-cutting concerns
 */
export interface MasterContext extends RuleContext {
  userId: string;
  studentId: string;
  sessionId: string;
  career?: {
    id: string;
    name: string;
  };
  companion?: {
    id: string;
    name: string;
  };
  theme?: 'light' | 'dark';
  grade?: string;
  subject?: string;
  activity?: string;
  container?: 'learn' | 'experience' | 'discover';
  gamification?: {
    points: number;
    level: number;
    badges: string[];
  };
  // Skills mapping specific fields
  currentSkill?: string;
  targetSkill?: string;
  masteredSkills?: string[];
  skillSearchCriteria?: any;
}

/**
 * Engine registration entry
 */
interface EngineRegistration {
  engine: BaseRulesEngine<any>;
  priority: number;
  enabled: boolean;
  tags: string[];
}

/**
 * Orchestration result combining all engine results
 */
export interface OrchestrationResult {
  success: boolean;
  results: Map<string, RuleResult[]>;
  crossCuttingData: {
    theme?: any;
    companion?: any;
    gamification?: any;
  };
  executionTime: number;
  engineExecutions: {
    engineId: string;
    executed: boolean;
    resultCount: number;
    executionTime: number;
  }[];
}

/**
 * Master orchestrator for all rules engines
 */
export class MasterAIRulesEngine extends BaseRulesEngine<MasterContext> {
  private static instance: MasterAIRulesEngine;
  private engines: Map<string, EngineRegistration> = new Map();
  private executionOrder: string[] = [];
  
  private constructor() {
    super('MasterAIRulesEngine', {
      name: 'Master AI Rules Engine',
      description: 'Orchestrates all specialized rules engines',
      version: '1.0.0',
      monitoring: {
        enabled: true,
        telemetryEnabled: true,
        metricsEnabled: true,
        logLevel: 'info'
      }
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): MasterAIRulesEngine {
    if (!MasterAIRulesEngine.instance) {
      MasterAIRulesEngine.instance = new MasterAIRulesEngine();
    }
    return MasterAIRulesEngine.instance;
  }

  /**
   * Register master orchestration rules
   */
  protected registerRules(): void {
    // Rule: Validate context
    this.addRuleInternal({
      id: 'validate_context',
      name: 'Validate Master Context',
      description: 'Ensures all required context fields are present',
      priority: 1,
      condition: (context) => true,
      action: (context) => this.validateContext(context)
    });

    // Rule: Determine execution order
    this.addRuleInternal({
      id: 'determine_order',
      name: 'Determine Engine Execution Order',
      description: 'Determines which engines to execute and in what order',
      priority: 2,
      condition: (context) => true,
      action: (context) => this.determineExecutionOrder(context)
    });

    // Rule: Pre-execution preparation
    this.addRuleInternal({
      id: 'pre_execution',
      name: 'Pre-Execution Preparation',
      description: 'Prepares context for engine execution',
      priority: 3,
      condition: (context) => true,
      action: (context) => this.prepareExecution(context)
    });

    // Rule: Cross-cutting concern coordination
    this.addRuleInternal({
      id: 'coordinate_concerns',
      name: 'Coordinate Cross-Cutting Concerns',
      description: 'Ensures theme, companion, and gamification are coordinated',
      priority: 4,
      condition: (context) => !!(context.theme || context.companion || context.gamification),
      action: (context) => this.coordinateCrossCuttingConcerns(context)
    });

    // Rule: Post-execution aggregation
    this.addRuleInternal({
      id: 'post_execution',
      name: 'Post-Execution Aggregation',
      description: 'Aggregates results from all engines',
      priority: 100,
      condition: (context) => true,
      action: (context) => this.aggregateResults(context)
    });
  }

  /**
   * Validate master context
   */
  private validateContext(context: MasterContext): RuleResult {
    const errors: string[] = [];

    if (!context.userId) {
      errors.push('userId is required');
    }

    if (!context.studentId) {
      errors.push('studentId is required');
    }

    if (!context.sessionId) {
      errors.push('sessionId is required');
    }

    if (errors.length > 0) {
      return {
        success: false,
        error: 'Context validation failed',
        warnings: errors
      };
    }

    return {
      success: true,
      data: { validated: true }
    };
  }

  /**
   * Determine execution order based on context
   */
  private determineExecutionOrder(context: MasterContext): RuleResult {
    const order: string[] = [];

    // Always execute theme engine first if theme is present
    if (context.theme && this.engines.has('ThemeRulesEngine')) {
      order.push('ThemeRulesEngine');
    }

    // Execute companion engine if companion is present
    if (context.companion && this.engines.has('CompanionRulesEngine')) {
      order.push('CompanionRulesEngine');
    }

    // Execute gamification engine if needed
    if (context.gamification && this.engines.has('GamificationRulesEngine')) {
      order.push('GamificationRulesEngine');
    }

    // Execute container-specific engine
    if (context.container) {
      const containerEngine = `${context.container.charAt(0).toUpperCase()}${context.container.slice(1)}AIRulesEngine`;
      if (this.engines.has(containerEngine)) {
        order.push(containerEngine);
      }
    }

    // Execute Skills Mapping Engine if grade/subject present
    if ((context.grade_level || context.subject) && this.engines.has('AISkillsMappingEngine')) {
      order.push('AISkillsMappingEngine');
    }

    // Add any remaining enabled engines not yet in order
    this.engines.forEach((registration, engineId) => {
      if (registration.enabled && !order.includes(engineId)) {
        order.push(engineId);
      }
    });

    // Sort by priority
    order.sort((a, b) => {
      const aReg = this.engines.get(a);
      const bReg = this.engines.get(b);
      return (aReg?.priority || 100) - (bReg?.priority || 100);
    });

    this.executionOrder = order;

    return {
      success: true,
      data: { executionOrder: order }
    };
  }

  /**
   * Prepare execution context
   */
  private prepareExecution(context: MasterContext): RuleResult {
    // Enrich context with additional data if needed
    const enrichedContext = {
      ...context,
      timestamp: new Date(),
      correlationId: `${context.sessionId}_${Date.now()}`
    };

    return {
      success: true,
      data: { context: enrichedContext }
    };
  }

  /**
   * Coordinate cross-cutting concerns
   */
  private coordinateCrossCuttingConcerns(context: MasterContext): RuleResult {
    const coordination: any = {};

    // Theme coordination
    if (context.theme) {
      coordination.theme = {
        mode: context.theme,
        components: this.getThemeAffectedComponents(context)
      };
    }

    // Companion coordination
    if (context.companion) {
      coordination.companion = {
        id: context.companion.id,
        career: context.career,
        grade: context.grade
      };
    }

    // Gamification coordination
    if (context.gamification) {
      coordination.gamification = {
        currentPoints: context.gamification.points,
        currentLevel: context.gamification.level,
        activity: context.activity
      };
    }

    return {
      success: true,
      data: { coordination }
    };
  }

  /**
   * Get components affected by theme
   */
  private getThemeAffectedComponents(context: MasterContext): string[] {
    const components: string[] = [];

    if (context.container === 'learn') {
      components.push('AILearnContainer', 'VisualRenderer', 'QuestionInput');
    } else if (context.container === 'experience') {
      components.push('AIExperienceContainer', 'InteractiveElements');
    } else if (context.container === 'discover') {
      components.push('AIDiscoverContainer', 'ExplorationUI');
    }

    return components;
  }

  /**
   * Aggregate results from all engines
   */
  private aggregateResults(context: MasterContext): RuleResult {
    // This will be populated during orchestration
    return {
      success: true,
      data: { aggregated: true }
    };
  }

  /**
   * Register a specialized engine
   */
  public registerEngine(
    engineId: string,
    engine: BaseRulesEngine<any>,
    options?: {
      priority?: number;
      enabled?: boolean;
      tags?: string[];
    }
  ): void {
    const registration: EngineRegistration = {
      engine,
      priority: options?.priority || 100,
      enabled: options?.enabled !== false,
      tags: options?.tags || []
    };

    this.engines.set(engineId, registration);
    
    console.log(`🔧 Registered engine: ${engineId} (priority: ${registration.priority})`);
  }

  /**
   * Unregister an engine
   */
  public unregisterEngine(engineId: string): boolean {
    const removed = this.engines.delete(engineId);
    if (removed) {
      console.log(`🔧 Unregistered engine: ${engineId}`);
    }
    return removed;
  }

  /**
   * Get registered engine
   */
  public getEngine(engineId: string): BaseRulesEngine<any> | undefined {
    return this.engines.get(engineId)?.engine;
  }

  /**
   * Enable/disable an engine
   */
  public setEngineEnabled(engineId: string, enabled: boolean): void {
    const registration = this.engines.get(engineId);
    if (registration) {
      registration.enabled = enabled;
      console.log(`🔧 Engine ${engineId} ${enabled ? 'enabled' : 'disabled'}`);
    }
  }

  /**
   * Orchestrate execution across all engines
   */
  public async orchestrate(context: MasterContext): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const results = new Map<string, RuleResult[]>();
    const engineExecutions: any[] = [];
    const crossCuttingData: any = {};

    try {
      // Execute master rules first
      const masterResults = await this.execute(context);
      results.set('MasterAIRulesEngine', masterResults);

      // Get execution order from master rules
      const orderResult = masterResults.find(r => r.data?.executionOrder);
      const executionOrder = orderResult?.data?.executionOrder || this.executionOrder;

      // Execute engines in order
      for (const engineId of executionOrder) {
        const registration = this.engines.get(engineId);
        if (!registration || !registration.enabled) {
          continue;
        }

        const engineStartTime = Date.now();
        
        try {
          // Create engine-specific context
          const engineContext = this.createEngineContext(context, engineId);
          
          // Execute engine
          const engineResults = await registration.engine.execute(engineContext);
          results.set(engineId, engineResults);

          // Extract cross-cutting data
          this.extractCrossCuttingData(engineId, engineResults, crossCuttingData);

          // Record execution
          engineExecutions.push({
            engineId,
            executed: true,
            resultCount: engineResults.length,
            executionTime: Date.now() - engineStartTime
          });

          // Record in monitor
          ruleMonitor.recordExecution(
            engineId,
            true,
            Date.now() - engineStartTime,
            'MasterAIRulesEngine',
            context
          );

        } catch (error) {
          console.error(`❌ Engine execution failed: ${engineId}`, error);
          
          engineExecutions.push({
            engineId,
            executed: false,
            resultCount: 0,
            executionTime: Date.now() - engineStartTime,
            error: error instanceof Error ? error.message : String(error)
          });

          // Record failure in monitor
          ruleMonitor.recordExecution(
            engineId,
            false,
            Date.now() - engineStartTime,
            'MasterAIRulesEngine',
            context
          );
        }
      }

      // Success - all engines executed
      return {
        success: true,
        results,
        crossCuttingData,
        executionTime: Date.now() - startTime,
        engineExecutions
      };

    } catch (error) {
      // Master orchestration failure
      throw new RuleEngineError(
        'Orchestration failed',
        RuleEngineErrorCode.ENGINE_CONFIGURATION_ERROR,
        error
      );
    }
  }

  /**
   * Create engine-specific context from master context
   */
  private createEngineContext(masterContext: MasterContext, engineId: string): any {
    // Base context
    const baseContext = {
      timestamp: masterContext.timestamp,
      userId: masterContext.userId,
      sessionId: masterContext.sessionId,
      correlationId: masterContext.correlationId,
      metadata: masterContext.metadata
    };

    // Add engine-specific fields based on engine type
    switch (engineId) {
      case 'AISkillsMappingEngine':
        return {
          ...baseContext,
          operation: 'lookup',
          studentGrade: masterContext.grade_level,
          studentSubject: masterContext.subject,
          currentSkill: masterContext.currentSkill,
          masteredSkills: masterContext.masteredSkills || []
        };
        
      case 'CompanionRulesEngine':
        return {
          ...baseContext,
          companion: masterContext.companion?.id,
          student: {
            id: masterContext.studentId,
            grade: masterContext.grade
          },
          career: masterContext.career,
          currentActivity: masterContext.activity
        };

      case 'ThemeRulesEngine':
        return {
          ...baseContext,
          theme: masterContext.theme,
          component: masterContext.container,
          source: 'MasterAIRulesEngine'
        };

      case 'GamificationRulesEngine':
        return {
          ...baseContext,
          student: {
            id: masterContext.studentId,
            grade: masterContext.grade
          },
          activity: masterContext.activity,
          subject: masterContext.subject,
          currentPoints: masterContext.gamification?.points,
          currentLevel: masterContext.gamification?.level
        };

      case 'LearnAIRulesEngine':
      case 'ExperienceAIRulesEngine':
      case 'DiscoverAIRulesEngine':
        return {
          ...baseContext,
          student: {
            id: masterContext.studentId,
            grade: masterContext.grade
          },
          subject: masterContext.subject,
          career: masterContext.career,
          companion: masterContext.companion,
          theme: masterContext.theme
        };

      default:
        return baseContext;
    }
  }

  /**
   * Extract cross-cutting data from engine results
   */
  private extractCrossCuttingData(
    engineId: string,
    results: RuleResult[],
    crossCuttingData: any
  ): void {
    switch (engineId) {
      case 'ThemeRulesEngine':
        crossCuttingData.theme = results
          .filter(r => r.success && r.data?.theme)
          .map(r => r.data.theme);
        break;

      case 'CompanionRulesEngine':
        crossCuttingData.companion = results
          .filter(r => r.success && r.data?.message)
          .map(r => r.data);
        break;

      case 'GamificationRulesEngine':
        crossCuttingData.gamification = results
          .filter(r => r.success && r.data?.points)
          .map(r => r.data);
        break;
    }
  }

  /**
   * Get orchestration statistics
   */
  public getOrchestrationStats(): {
    totalEngines: number;
    enabledEngines: number;
    totalOrchestrations: number;
    averageExecutionTime: number;
    engineStats: Map<string, any>;
  } {
    const enabledEngines = Array.from(this.engines.values())
      .filter(reg => reg.enabled).length;

    const engineStats = new Map<string, any>();
    this.engines.forEach((reg, id) => {
      const metrics = ruleMonitor.getMetrics(id);
      if (metrics) {
        engineStats.set(id, {
          executions: metrics.executionCount,
          successRate: metrics.executionCount > 0 
            ? (metrics.successCount / metrics.executionCount) * 100 
            : 0,
          averageTime: metrics.averageExecutionTime
        });
      }
    });

    const ownMetrics = this.getMetrics('orchestrate');
    
    return {
      totalEngines: this.engines.size,
      enabledEngines,
      totalOrchestrations: ownMetrics?.executionCount || 0,
      averageExecutionTime: ownMetrics?.averageExecutionTime || 0,
      engineStats
    };
  }

  /**
   * Reset all engines
   */
  public resetAll(): void {
    this.engines.forEach((reg, id) => {
      try {
        reg.engine.reset();
        console.log(`🔄 Reset engine: ${id}`);
      } catch (error) {
        console.error(`Failed to reset engine ${id}:`, error);
      }
    });
    
    this.reset();
  }
}

// Export singleton instance
export const masterAIRulesEngine = MasterAIRulesEngine.getInstance();