/**
 * Base Rules Engine
 * Foundation class for all specialized rules engines in the system
 */

import {
  Rule,
  RuleContext,
  RuleResult,
  RuleExecutionOptions,
  RuleExecutionReport,
  RuleExecutionDetail,
  RuleEngineConfig,
  RuleEngineEvent,
  RuleEngineEventListener,
  RuleEngineEventPayload,
  RuleEngineError,
  RuleEngineErrorCode,
  RuleMetrics,
  RuleTelemetryEvent,
  MonitoringConfig,
  ValidationConfig,
  RuleValidationResult,
  ValidationError,
  ValidationWarning,
  DeepPartial
} from './types';

/**
 * Abstract base class for all rules engines
 */
export abstract class BaseRulesEngine<T extends RuleContext = RuleContext> {
  protected rules: Map<string, Rule<T>> = new Map();
  protected config: RuleEngineConfig;
  protected metrics: Map<string, RuleMetrics> = new Map();
  protected eventListeners: Map<RuleEngineEvent, Set<RuleEngineEventListener>> = new Map();
  protected isInitialized: boolean = false;
  protected executionHistory: RuleExecutionReport[] = [];
  private maxHistorySize: number = 100;

  constructor(
    engineId: string,
    config?: DeepPartial<RuleEngineConfig>
  ) {
    this.config = this.mergeConfig(engineId, config);
    this.initialize();
  }

  /**
   * Initialize the rules engine
   */
  protected initialize(): void {
    // Initialize event listener maps
    Object.values(RuleEngineEvent).forEach(event => {
      this.eventListeners.set(event as RuleEngineEvent, new Set());
    });

    // Call child class initialization
    this.registerRules();

    this.isInitialized = true;
    this.emitEvent(RuleEngineEvent.ENGINE_STARTED, { engineId: this.config.id });
  }

  /**
   * Abstract method to be implemented by child classes for registering rules
   */
  protected abstract registerRules(): void;

  /**
   * Merge default config with provided config
   */
  private mergeConfig(engineId: string, config?: DeepPartial<RuleEngineConfig>): RuleEngineConfig {
    const defaultConfig: RuleEngineConfig = {
      id: engineId,
      name: engineId,
      description: `Rules engine for ${engineId}`,
      version: '1.0.0',
      enabled: true,
      defaultOptions: {
        stopOnFirstMatch: false,
        parallel: false,
        timeout: 5000,
        dryRun: false,
        logLevel: 'info'
      },
      monitoring: {
        enabled: true,
        telemetryEnabled: true,
        metricsEnabled: true,
        logLevel: 'info'
      },
      validation: {
        enabled: true,
        validateOnAdd: true,
        validateOnExecute: false,
        strictMode: false
      }
    };

    return { ...defaultConfig, ...config } as RuleEngineConfig;
  }

  /**
   * Add a rule to the engine (protected version for use during initialization)
   */
  protected addRuleInternal(rule: Rule<T>): void {
    this.addRuleImplementation(rule);
  }

  /**
   * Add a rule to the engine
   */
  public addRule(rule: Rule<T>): void {
    if (!this.isInitialized) {
      throw new RuleEngineError(
        'Engine not initialized',
        RuleEngineErrorCode.ENGINE_NOT_INITIALIZED
      );
    }
    this.addRuleImplementation(rule);
  }

  /**
   * Internal implementation for adding a rule
   */
  private addRuleImplementation(rule: Rule<T>): void {

    // Validate rule if validation is enabled
    if (this.config.validation?.validateOnAdd) {
      const validation = this.validateRule(rule);
      if (!validation.valid) {
        throw new RuleEngineError(
          `Rule validation failed: ${validation.errors[0]?.message}`,
          RuleEngineErrorCode.RULE_VALIDATION_FAILED,
          validation
        );
      }
    }

    // Add rule with default values
    const completeRule: Rule<T> = {
      ...rule,
      priority: rule.priority ?? 100,
      enabled: rule.enabled ?? true,
      version: rule.version ?? '1.0.0'
    };

    this.rules.set(rule.id, completeRule);
    
    // Initialize metrics for the rule
    this.metrics.set(rule.id, {
      ruleId: rule.id,
      executionCount: 0,
      successCount: 0,
      failureCount: 0,
      averageExecutionTime: 0,
      lastExecutionTime: 0
    });

    this.emitEvent(RuleEngineEvent.RULE_ADDED, { rule: completeRule });
    
    if (this.config.monitoring?.logLevel === 'debug') {
      console.log(`✅ Rule added: ${rule.name} (${rule.id})`);
    }
  }

  /**
   * Remove a rule from the engine
   */
  public removeRule(ruleId: string): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      return false;
    }

    this.rules.delete(ruleId);
    this.metrics.delete(ruleId);
    
    this.emitEvent(RuleEngineEvent.RULE_REMOVED, { ruleId });
    
    return true;
  }

  /**
   * Get a rule by ID
   */
  public getRule(ruleId: string): Rule<T> | undefined {
    return this.rules.get(ruleId);
  }

  /**
   * Get all rules
   */
  public getAllRules(): Rule<T>[] {
    return Array.from(this.rules.values());
  }

  /**
   * Execute rules against a context
   */
  public async execute(
    context: T,
    options?: RuleExecutionOptions
  ): Promise<RuleResult[]> {
    if (!this.isInitialized) {
      throw new RuleEngineError(
        'Engine not initialized',
        RuleEngineErrorCode.ENGINE_NOT_INITIALIZED
      );
    }

    const execOptions = { ...this.config.defaultOptions, ...options };
    const startTime = Date.now();
    const report: RuleExecutionReport = {
      totalRules: this.rules.size,
      executedRules: 0,
      successfulRules: 0,
      failedRules: 0,
      skippedRules: 0,
      totalExecutionTime: 0,
      ruleExecutions: []
    };

    const results: RuleResult[] = [];

    // Sort rules by priority
    const sortedRules = Array.from(this.rules.values())
      .filter(rule => rule.enabled)
      .sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100));

    // Execute rules based on options
    if (execOptions.parallel) {
      const promises = sortedRules.map(rule => 
        this.executeRule(rule, context, execOptions, report)
      );
      const ruleResults = await Promise.all(promises);
      results.push(...ruleResults.filter(r => r !== null) as RuleResult[]);
    } else {
      for (const rule of sortedRules) {
        const result = await this.executeRule(rule, context, execOptions, report);
        
        if (result) {
          results.push(result);
          
          if (execOptions.stopOnFirstMatch && result.success) {
            break;
          }
        }
      }
    }

    // Finalize report
    report.totalExecutionTime = Date.now() - startTime;
    
    // Store execution history
    this.storeExecutionReport(report);

    // Emit telemetry
    if (this.config.monitoring?.telemetryEnabled) {
      this.emitTelemetry({
        eventType: 'rule_executed',
        timestamp: new Date(),
        engineId: this.config.id,
        context,
        duration: report.totalExecutionTime
      });
    }

    return results;
  }

  /**
   * Execute a single rule
   */
  private async executeRule(
    rule: Rule<T>,
    context: T,
    options: RuleExecutionOptions,
    report: RuleExecutionReport
  ): Promise<RuleResult | null> {
    const startTime = Date.now();
    const detail: RuleExecutionDetail = {
      ruleId: rule.id,
      ruleName: rule.name,
      executed: false,
      conditionMet: false,
      executionTime: 0
    };

    try {
      // Check condition with timeout
      const conditionMet = await this.executeWithTimeout(
        () => rule.condition(context),
        options.timeout || 5000,
        `Rule condition timeout: ${rule.id}`
      );

      detail.conditionMet = conditionMet;

      if (!conditionMet) {
        report.skippedRules++;
        detail.executed = false;
        detail.executionTime = Date.now() - startTime;
        report.ruleExecutions.push(detail);
        return null;
      }

      // Execute action if not dry run
      if (options.dryRun) {
        detail.executed = false;
        detail.result = {
          success: true,
          data: { dryRun: true },
          metadata: { ruleId: rule.id }
        };
      } else {
        const result = await this.executeWithTimeout(
          () => rule.action(context),
          options.timeout || 5000,
          `Rule action timeout: ${rule.id}`
        );

        detail.executed = true;
        detail.result = {
          ...result,
          appliedRules: [...(result.appliedRules || []), rule.id],
          executionTime: Date.now() - startTime
        };

        // Update metrics
        this.updateMetrics(rule.id, detail.result.success, Date.now() - startTime);

        if (detail.result.success) {
          report.successfulRules++;
        } else {
          report.failedRules++;
        }

        report.executedRules++;
      }

      detail.executionTime = Date.now() - startTime;
      report.ruleExecutions.push(detail);

      // Emit event
      this.emitEvent(RuleEngineEvent.RULE_EXECUTED, {
        rule,
        result: detail.result,
        context
      });

      return detail.result || null;

    } catch (error) {
      detail.executed = true;
      detail.error = error instanceof Error ? error.message : String(error);
      detail.executionTime = Date.now() - startTime;
      report.ruleExecutions.push(detail);
      report.failedRules++;

      // Update failure metrics
      this.updateMetrics(rule.id, false, Date.now() - startTime);

      // Emit error event
      this.emitEvent(RuleEngineEvent.RULE_FAILED, {
        rule,
        error: detail.error,
        context
      });

      if (this.config.monitoring?.logLevel !== 'none') {
        console.error(`❌ Rule execution failed: ${rule.name}`, error);
      }

      return {
        success: false,
        error: detail.error,
        metadata: { ruleId: rule.id },
        executionTime: detail.executionTime
      };
    }
  }

  /**
   * Execute a function with timeout
   */
  private async executeWithTimeout<R>(
    fn: () => R | Promise<R>,
    timeout: number,
    timeoutMessage: string
  ): Promise<R> {
    return Promise.race([
      Promise.resolve(fn()),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(timeoutMessage)), timeout)
      )
    ]);
  }

  /**
   * Validate a rule
   */
  protected validateRule(rule: Rule<T>): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Required field validation
    if (!rule.id) {
      errors.push({
        ruleId: rule.id || 'unknown',
        field: 'id',
        message: 'Rule ID is required',
        severity: 'critical'
      });
    }

    if (!rule.name) {
      errors.push({
        ruleId: rule.id || 'unknown',
        field: 'name',
        message: 'Rule name is required',
        severity: 'error'
      });
    }

    if (!rule.condition) {
      errors.push({
        ruleId: rule.id || 'unknown',
        field: 'condition',
        message: 'Rule condition is required',
        severity: 'critical'
      });
    }

    if (!rule.action) {
      errors.push({
        ruleId: rule.id || 'unknown',
        field: 'action',
        message: 'Rule action is required',
        severity: 'critical'
      });
    }

    // Warnings
    if (!rule.description) {
      warnings.push({
        ruleId: rule.id || 'unknown',
        field: 'description',
        message: 'Rule description is recommended for documentation',
        suggestion: 'Add a description to explain what this rule does'
      });
    }

    if (rule.priority === undefined) {
      warnings.push({
        ruleId: rule.id || 'unknown',
        field: 'priority',
        message: 'Rule priority not set, defaulting to 100',
        suggestion: 'Set priority to control execution order'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Update metrics for a rule
   */
  private updateMetrics(ruleId: string, success: boolean, executionTime: number): void {
    const metrics = this.metrics.get(ruleId);
    if (!metrics) return;

    metrics.executionCount++;
    if (success) {
      metrics.successCount++;
    } else {
      metrics.failureCount++;
    }

    // Update average execution time
    metrics.averageExecutionTime = 
      (metrics.averageExecutionTime * (metrics.executionCount - 1) + executionTime) / 
      metrics.executionCount;
    
    metrics.lastExecutionTime = executionTime;
    metrics.lastExecutedAt = new Date();
  }

  /**
   * Get metrics for a rule
   */
  public getMetrics(ruleId?: string): RuleMetrics | RuleMetrics[] | undefined {
    if (ruleId) {
      return this.metrics.get(ruleId);
    }
    return Array.from(this.metrics.values());
  }

  /**
   * Store execution report in history
   */
  private storeExecutionReport(report: RuleExecutionReport): void {
    this.executionHistory.push(report);
    
    // Maintain max history size
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
  }

  /**
   * Get execution history
   */
  public getExecutionHistory(): RuleExecutionReport[] {
    return [...this.executionHistory];
  }

  /**
   * Clear execution history
   */
  public clearHistory(): void {
    this.executionHistory = [];
  }

  /**
   * Subscribe to engine events
   */
  public on(event: RuleEngineEvent, listener: RuleEngineEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Unsubscribe from engine events
   */
  public off(event: RuleEngineEvent, listener: RuleEngineEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event
   */
  protected emitEvent(event: RuleEngineEvent, data?: any): void {
    const payload: RuleEngineEventPayload = {
      event,
      engineId: this.config.id,
      timestamp: new Date(),
      data
    };

    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(payload);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Emit telemetry event
   */
  protected emitTelemetry(event: RuleTelemetryEvent): void {
    if (this.config.monitoring?.customTelemetryHandler) {
      this.config.monitoring.customTelemetryHandler(event);
    }

    if (this.config.monitoring?.logLevel === 'debug') {
      console.log('📊 Telemetry:', event);
    }
  }

  /**
   * Enable or disable the engine
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    console.log(`${this.config.name} ${enabled ? 'enabled' : 'disabled'}`);
  }

  /**
   * Check if engine is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled ?? true;
  }

  /**
   * Get engine configuration
   */
  public getConfig(): RuleEngineConfig {
    return { ...this.config };
  }

  /**
   * Reset the engine
   */
  public reset(): void {
    this.rules.clear();
    this.metrics.clear();
    this.executionHistory = [];
    this.registerRules();
    console.log(`🔄 ${this.config.name} reset`);
  }

  /**
   * Destroy the engine
   */
  public destroy(): void {
    this.rules.clear();
    this.metrics.clear();
    this.executionHistory = [];
    this.eventListeners.clear();
    this.isInitialized = false;
    
    this.emitEvent(RuleEngineEvent.ENGINE_STOPPED, { engineId: this.config.id });
    
    console.log(`🛑 ${this.config.name} destroyed`);
  }
}

// Export types needed by child classes
export type { Rule, RuleContext, RuleResult } from './types';