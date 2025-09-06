/**
 * Core Types for AIRulesEngine
 * Defines the fundamental types used throughout the rules engine system
 */

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Base context passed to all rules engines
 */
export interface RuleContext {
  timestamp: Date;
  userId?: string;
  sessionId?: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

/**
 * Result returned from rule execution
 */
export interface RuleResult {
  success: boolean;
  data?: any;
  error?: string;
  warnings?: string[];
  metadata?: Record<string, any>;
  appliedRules?: string[];
  executionTime?: number;
}

/**
 * Individual rule definition
 */
export interface Rule<T extends RuleContext = RuleContext> {
  id: string;
  name: string;
  description?: string;
  condition: (context: T) => boolean | Promise<boolean>;
  action: (context: T) => RuleResult | Promise<RuleResult>;
  priority?: number;
  enabled?: boolean;
  tags?: string[];
  version?: string;
}

/**
 * Rule execution options
 */
export interface RuleExecutionOptions {
  stopOnFirstMatch?: boolean;
  parallel?: boolean;
  timeout?: number;
  dryRun?: boolean;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
}

/**
 * Rule execution report
 */
export interface RuleExecutionReport {
  totalRules: number;
  executedRules: number;
  successfulRules: number;
  failedRules: number;
  skippedRules: number;
  totalExecutionTime: number;
  ruleExecutions: RuleExecutionDetail[];
}

/**
 * Detailed information about a single rule execution
 */
export interface RuleExecutionDetail {
  ruleId: string;
  ruleName: string;
  executed: boolean;
  conditionMet: boolean;
  result?: RuleResult;
  executionTime: number;
  error?: string;
}

/**
 * Rule validation result
 */
export interface RuleValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  ruleId: string;
  field: string;
  message: string;
  severity: 'critical' | 'error';
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  ruleId: string;
  field: string;
  message: string;
  suggestion?: string;
}

// ============================================================================
// MONITORING TYPES
// ============================================================================

/**
 * Rule performance metrics
 */
export interface RuleMetrics {
  ruleId: string;
  executionCount: number;
  successCount: number;
  failureCount: number;
  averageExecutionTime: number;
  lastExecutionTime: number;
  lastExecutedAt?: Date;
}

/**
 * Telemetry event for rule execution
 */
export interface RuleTelemetryEvent {
  eventType: 'rule_executed' | 'rule_failed' | 'rule_skipped' | 'engine_error';
  timestamp: Date;
  ruleId?: string;
  engineId: string;
  context: RuleContext;
  result?: RuleResult;
  duration?: number;
  error?: string;
}

// ============================================================================
// ENGINE TYPES
// ============================================================================

/**
 * Base configuration for all rules engines
 */
export interface RuleEngineConfig {
  id: string;
  name: string;
  description?: string;
  version?: string;
  enabled?: boolean;
  defaultOptions?: RuleExecutionOptions;
  monitoring?: MonitoringConfig;
  validation?: ValidationConfig;
}

/**
 * Monitoring configuration
 */
export interface MonitoringConfig {
  enabled: boolean;
  telemetryEnabled?: boolean;
  metricsEnabled?: boolean;
  logLevel?: 'none' | 'error' | 'warn' | 'info' | 'debug';
  customTelemetryHandler?: (event: RuleTelemetryEvent) => void;
}

/**
 * Validation configuration
 */
export interface ValidationConfig {
  enabled: boolean;
  validateOnAdd?: boolean;
  validateOnExecute?: boolean;
  strictMode?: boolean;
  customValidators?: RuleValidator[];
}

/**
 * Custom rule validator
 */
export interface RuleValidator {
  name: string;
  validate: (rule: Rule) => ValidationError | ValidationWarning | null;
}

// ============================================================================
// REGISTRY TYPES
// ============================================================================

/**
 * Rule registration entry
 */
export interface RuleRegistration {
  rule: Rule;
  engineId: string;
  registeredAt: Date;
  registeredBy?: string;
  metadata?: Record<string, any>;
}

/**
 * Rule registry interface
 */
export interface IRuleRegistry {
  register(rule: Rule, engineId: string): void;
  unregister(ruleId: string, engineId: string): boolean;
  get(ruleId: string, engineId: string): Rule | undefined;
  getAll(engineId: string): Rule[];
  exists(ruleId: string, engineId: string): boolean;
  clear(engineId: string): void;
}

// ============================================================================
// LOADER TYPES
// ============================================================================

/**
 * Rule source configuration
 */
export interface RuleSource {
  type: 'file' | 'database' | 'api' | 'memory';
  location: string;
  format?: 'json' | 'yaml' | 'typescript';
  options?: Record<string, any>;
}

/**
 * Rule loader interface
 */
export interface IRuleLoader {
  load(source: RuleSource): Promise<Rule[]>;
  save(rules: Rule[], destination: RuleSource): Promise<void>;
  validate(rules: Rule[]): RuleValidationResult;
}

// ============================================================================
// CHAIN OF RESPONSIBILITY TYPES
// ============================================================================

/**
 * Rule chain for sequential processing
 */
export interface RuleChain<T extends RuleContext = RuleContext> {
  id: string;
  name: string;
  rules: Rule<T>[];
  continueOnError?: boolean;
  aggregateResults?: boolean;
}

/**
 * Rule chain result
 */
export interface RuleChainResult {
  chainId: string;
  results: RuleResult[];
  aggregatedData?: any;
  totalExecutionTime: number;
  interrupted?: boolean;
  interruptReason?: string;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

/**
 * Rule engine event types
 */
export enum RuleEngineEvent {
  RULE_ADDED = 'rule_added',
  RULE_REMOVED = 'rule_removed',
  RULE_EXECUTED = 'rule_executed',
  RULE_FAILED = 'rule_failed',
  ENGINE_STARTED = 'engine_started',
  ENGINE_STOPPED = 'engine_stopped',
  ENGINE_ERROR = 'engine_error'
}

/**
 * Event payload for rule engine events
 */
export interface RuleEngineEventPayload {
  event: RuleEngineEvent;
  engineId: string;
  timestamp: Date;
  data?: any;
}

/**
 * Event listener for rule engine events
 */
export type RuleEngineEventListener = (payload: RuleEngineEventPayload) => void;

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Custom error class for rule engine errors
 */
export class RuleEngineError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'RuleEngineError';
  }
}

/**
 * Error codes for rule engine
 */
export enum RuleEngineErrorCode {
  RULE_NOT_FOUND = 'RULE_NOT_FOUND',
  RULE_VALIDATION_FAILED = 'RULE_VALIDATION_FAILED',
  RULE_EXECUTION_FAILED = 'RULE_EXECUTION_FAILED',
  RULE_TIMEOUT = 'RULE_TIMEOUT',
  ENGINE_NOT_INITIALIZED = 'ENGINE_NOT_INITIALIZED',
  ENGINE_CONFIGURATION_ERROR = 'ENGINE_CONFIGURATION_ERROR',
  INVALID_CONTEXT = 'INVALID_CONTEXT',
  CIRCULAR_DEPENDENCY = 'CIRCULAR_DEPENDENCY'
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Deep partial type for configuration objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Type guard for rule context
 */
export function isRuleContext(obj: any): obj is RuleContext {
  return obj && typeof obj === 'object' && 'timestamp' in obj;
}

/**
 * Type guard for rule result
 */
export function isRuleResult(obj: any): obj is RuleResult {
  return obj && typeof obj === 'object' && 'success' in obj && typeof obj.success === 'boolean';
}

// ============================================================================
// EXPORT ALL TYPES
// ============================================================================

export type {
  Rule as IRule,
  RuleContext as IRuleContext,
  RuleResult as IRuleResult
};