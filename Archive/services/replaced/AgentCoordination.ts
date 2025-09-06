// ================================================================
// AGENT COORDINATION SERVICE
// Multi-agent collaboration and workflow orchestration
// ================================================================

import { AgentType, AgentMessage, AgentResponse } from '../agents/base/FinnAgent';
import { AgentSystem } from '../agents/AgentSystem';

export interface CoordinationWorkflow {
  id: string;
  name: string;
  description: string;
  agents: AgentType[];
  steps: WorkflowStep[];
  coordination: CoordinationStrategy;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  fallbackStrategy: FallbackStrategy;
}

export interface WorkflowStep {
  id: string;
  name: string;
  agent: AgentType;
  action: string;
  inputMapping: Record<string, string>;
  outputMapping: Record<string, string>;
  dependencies: string[];
  condition?: string;
  timeout?: number;
  required: boolean;
}

export interface CoordinationStrategy {
  type: 'sequential' | 'parallel' | 'conditional' | 'competitive' | 'collaborative';
  parameters: {
    maxParallelTasks?: number;
    consensusThreshold?: number;
    competitionMetric?: string;
    collaborationMode?: 'peer_review' | 'consensus' | 'weighted_voting';
  };
}

export interface RetryPolicy {
  maxAttempts: number;
  backoffStrategy: 'linear' | 'exponential' | 'fixed';
  baseDelayMs: number;
  maxDelayMs: number;
  retryableErrors: string[];
}

export interface FallbackStrategy {
  type: 'single_agent' | 'reduced_workflow' | 'cached_response' | 'default_response';
  fallbackAgent?: AgentType;
  fallbackWorkflow?: string;
  defaultResponse?: any;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  startTime: Date;
  endTime?: Date;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  steps: StepExecution[];
  results: any;
  errors: any[];
  metadata: {
    totalTime: number;
    agentsUsed: AgentType[];
    retryCount: number;
    fallbackUsed: boolean;
  };
}

export interface StepExecution {
  stepId: string;
  agent: AgentType;
  startTime: Date;
  endTime?: Date;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped';
  input: any;
  output?: any;
  error?: string;
  retryCount: number;
}

export class AgentCoordination {
  private agentSystem: AgentSystem;
  private workflows: Map<string, CoordinationWorkflow> = new Map();
  private activeExecutions: Map<string, WorkflowExecution> = new Map();
  private executionHistory: WorkflowExecution[] = [];
  private coordinationMetrics: any = {
    totalWorkflows: 0,
    totalExecutions: 0,
    successRate: 0,
    averageExecutionTime: 0,
    agentUtilization: {}
  };

  constructor(agentSystem: AgentSystem) {
    this.agentSystem = agentSystem;
    this.initializeStandardWorkflows();
  }

  // ================================================================
  // WORKFLOW MANAGEMENT
  // ================================================================

  registerWorkflow(workflow: CoordinationWorkflow): void {
    this.workflows.set(workflow.id, workflow);
    this.coordinationMetrics.totalWorkflows++;
    console.log(`📋 Registered workflow: ${workflow.name}`);
  }

  getWorkflow(workflowId: string): CoordinationWorkflow | null {
    return this.workflows.get(workflowId) || null;
  }

  getAllWorkflows(): CoordinationWorkflow[] {
    return Array.from(this.workflows.values());
  }

  removeWorkflow(workflowId: string): boolean {
    const removed = this.workflows.delete(workflowId);
    if (removed) {
      this.coordinationMetrics.totalWorkflows--;
      console.log(`🗑️ Removed workflow: ${workflowId}`);
    }
    return removed;
  }

  // ================================================================
  // WORKFLOW EXECUTION
  // ================================================================

  async executeWorkflow(
    workflowId: string, 
    input: any, 
    options?: {
      priority?: 'low' | 'medium' | 'high';
      timeout?: number;
      metadata?: any;
    }
  ): Promise<WorkflowExecution> {
    const workflow = this.getWorkflow(workflowId);
    if (!workflow) {
      throw new Error(`Workflow not found: ${workflowId}`);
    }

    const executionId = this.generateExecutionId();
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      startTime: new Date(),
      status: 'running',
      steps: workflow.steps.map(step => ({
        stepId: step.id,
        agent: step.agent,
        startTime: new Date(),
        status: 'pending',
        input: null,
        retryCount: 0
      })),
      results: {},
      errors: [],
      metadata: {
        totalTime: 0,
        agentsUsed: [],
        retryCount: 0,
        fallbackUsed: false
      }
    };

    this.activeExecutions.set(executionId, execution);
    this.coordinationMetrics.totalExecutions++;

    try {
      console.log(`🚀 Executing workflow: ${workflow.name} (${executionId})`);
      
      const result = await this.runWorkflow(workflow, execution, input, options);
      
      execution.status = 'completed';
      execution.endTime = new Date();
      execution.results = result;
      execution.metadata.totalTime = execution.endTime.getTime() - execution.startTime.getTime();

      console.log(`✅ Workflow completed: ${workflow.name} (${execution.metadata.totalTime}ms)`);

    } catch (error) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.errors.push({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
        context: 'workflow_execution'
      });
      execution.metadata.totalTime = execution.endTime.getTime() - execution.startTime.getTime();

      console.error(`❌ Workflow failed: ${workflow.name}`, error);

      // Try fallback strategy
      if (workflow.fallbackStrategy.type !== 'default_response') {
        try {
          const fallbackResult = await this.executeFallback(workflow, execution, input);
          execution.results = fallbackResult;
          execution.metadata.fallbackUsed = true;
          execution.status = 'completed';
          console.log(`🔄 Fallback successful for workflow: ${workflow.name}`);
        } catch (fallbackError) {
          console.error(`❌ Fallback failed for workflow: ${workflow.name}`, fallbackError);
        }
      }
    }

    // Move to history and clean up
    this.executionHistory.push(execution);
    this.activeExecutions.delete(executionId);

    // Keep only last 100 executions in history
    if (this.executionHistory.length > 100) {
      this.executionHistory.shift();
    }

    this.updateCoordinationMetrics(execution);

    return execution;
  }

  private async runWorkflow(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    input: any,
    options?: any
  ): Promise<any> {
    const context = { input, results: {}, metadata: {} };

    switch (workflow.coordination.type) {
      case 'sequential':
        return await this.executeSequential(workflow, execution, context);
      case 'parallel':
        return await this.executeParallel(workflow, execution, context);
      case 'conditional':
        return await this.executeConditional(workflow, execution, context);
      case 'competitive':
        return await this.executeCompetitive(workflow, execution, context);
      case 'collaborative':
        return await this.executeCollaborative(workflow, execution, context);
      default:
        throw new Error(`Unsupported coordination type: ${workflow.coordination.type}`);
    }
  }

  // ================================================================
  // COORDINATION STRATEGIES
  // ================================================================

  private async executeSequential(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    context: any
  ): Promise<any> {
    console.log(`🔄 Executing sequential workflow: ${workflow.steps.length} steps`);

    for (const step of workflow.steps) {
      const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
      
      // Check dependencies
      if (!this.checkDependencies(step, context)) {
        if (step.required) {
          throw new Error(`Required step ${step.id} dependencies not met`);
        }
        stepExecution.status = 'skipped';
        continue;
      }

      // Execute step
      const stepResult = await this.executeStep(step, stepExecution, context, workflow.retryPolicy);
      
      // Store result for next steps
      context.results[step.id] = stepResult;
      
      // Update metadata
      if (!execution.metadata.agentsUsed.includes(step.agent)) {
        execution.metadata.agentsUsed.push(step.agent);
      }
    }

    return context.results;
  }

  private async executeParallel(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    context: any
  ): Promise<any> {
    console.log(`⚡ Executing parallel workflow: ${workflow.steps.length} steps`);

    const maxParallel = workflow.coordination.parameters.maxParallelTasks || workflow.steps.length;
    const batches = this.createBatches(workflow.steps, maxParallel);

    for (const batch of batches) {
      const batchPromises = batch.map(step => {
        const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
        return this.executeStep(step, stepExecution, context, workflow.retryPolicy);
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        const step = batch[index];
        if (result.status === 'fulfilled') {
          context.results[step.id] = result.value;
        } else {
          if (step.required) {
            throw new Error(`Required step ${step.id} failed: ${result.reason}`);
          }
        }
      });
    }

    return context.results;
  }

  private async executeConditional(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    context: any
  ): Promise<any> {
    console.log(`🔀 Executing conditional workflow: ${workflow.steps.length} steps`);

    for (const step of workflow.steps) {
      const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
      
      // Evaluate condition
      if (step.condition && !this.evaluateCondition(step.condition, context)) {
        stepExecution.status = 'skipped';
        continue;
      }

      // Check dependencies
      if (!this.checkDependencies(step, context)) {
        if (step.required) {
          throw new Error(`Required step ${step.id} dependencies not met`);
        }
        stepExecution.status = 'skipped';
        continue;
      }

      // Execute step
      const stepResult = await this.executeStep(step, stepExecution, context, workflow.retryPolicy);
      context.results[step.id] = stepResult;
    }

    return context.results;
  }

  private async executeCompetitive(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    context: any
  ): Promise<any> {
    console.log(`🏆 Executing competitive workflow: ${workflow.steps.length} steps`);

    // Execute all steps in parallel
    const competitorPromises = workflow.steps.map(step => {
      const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
      return this.executeStep(step, stepExecution, context, workflow.retryPolicy)
        .then(result => ({ step, result, stepExecution }));
    });

    const results = await Promise.allSettled(competitorPromises);
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length === 0) {
      throw new Error('All competitive steps failed');
    }

    // Select best result based on metric
    const metric = workflow.coordination.parameters.competitionMetric || 'confidence';
    const winner = this.selectBestResult(successful, metric);

    return {
      winner: winner.result,
      allResults: successful.map(s => s.result),
      winningAgent: winner.step.agent
    };
  }

  private async executeCollaborative(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    context: any
  ): Promise<any> {
    console.log(`🤝 Executing collaborative workflow: ${workflow.steps.length} steps`);

    const mode = workflow.coordination.parameters.collaborationMode || 'consensus';
    
    // Execute all steps in parallel
    const collaboratorPromises = workflow.steps.map(step => {
      const stepExecution = execution.steps.find(s => s.stepId === step.id)!;
      return this.executeStep(step, stepExecution, context, workflow.retryPolicy)
        .then(result => ({ step, result, stepExecution }));
    });

    const results = await Promise.allSettled(collaboratorPromises);
    const successful = results
      .filter(r => r.status === 'fulfilled')
      .map(r => r.value);

    if (successful.length === 0) {
      throw new Error('All collaborative steps failed');
    }

    // Combine results based on collaboration mode
    switch (mode) {
      case 'consensus':
        return this.buildConsensus(successful, workflow.coordination.parameters.consensusThreshold || 0.6);
      case 'peer_review':
        return this.conductPeerReview(successful);
      case 'weighted_voting':
        return this.conductWeightedVoting(successful);
      default:
        throw new Error(`Unsupported collaboration mode: ${mode}`);
    }
  }

  // ================================================================
  // STEP EXECUTION
  // ================================================================

  private async executeStep(
    step: WorkflowStep, 
    stepExecution: StepExecution, 
    context: any, 
    retryPolicy: RetryPolicy
  ): Promise<any> {
    stepExecution.status = 'running';
    stepExecution.startTime = new Date();

    // Map input data
    const input = this.mapStepInput(step, context);
    stepExecution.input = input;

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= retryPolicy.maxAttempts; attempt++) {
      try {
        stepExecution.retryCount = attempt - 1;

        // Execute agent action
        const response = await this.agentSystem.requestAgentAction(
          step.agent, 
          step.action, 
          input
        );

        if (response.success) {
          stepExecution.status = 'completed';
          stepExecution.endTime = new Date();
          stepExecution.output = response.data;
          
          // Map output data
          const mappedOutput = this.mapStepOutput(step, response.data);
          return mappedOutput;
        } else {
          throw new Error(response.error || 'Agent action failed');
        }

      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < retryPolicy.maxAttempts && this.isRetryableError(lastError, retryPolicy)) {
          const delay = this.calculateRetryDelay(attempt, retryPolicy);
          console.log(`🔄 Retrying step ${step.id} (attempt ${attempt + 1}/${retryPolicy.maxAttempts}) in ${delay}ms`);
          await this.delay(delay);
        } else {
          stepExecution.status = 'failed';
          stepExecution.endTime = new Date();
          stepExecution.error = lastError.message;
          throw lastError;
        }
      }
    }

    throw lastError!;
  }

  // ================================================================
  // FALLBACK STRATEGIES
  // ================================================================

  private async executeFallback(
    workflow: CoordinationWorkflow, 
    execution: WorkflowExecution, 
    input: any
  ): Promise<any> {
    const { fallbackStrategy } = workflow;

    switch (fallbackStrategy.type) {
      case 'single_agent':
        if (!fallbackStrategy.fallbackAgent) {
          throw new Error('No fallback agent specified');
        }
        return await this.agentSystem.requestAgentAction(
          fallbackStrategy.fallbackAgent, 
          'fallback_action', 
          input
        );

      case 'reduced_workflow':
        if (!fallbackStrategy.fallbackWorkflow) {
          throw new Error('No fallback workflow specified');
        }
        const fallbackExecution = await this.executeWorkflow(
          fallbackStrategy.fallbackWorkflow, 
          input
        );
        return fallbackExecution.results;

      case 'cached_response':
        const cachedResponse = await this.getCachedResponse(workflow.id, input);
        if (cachedResponse) {
          return cachedResponse;
        }
        throw new Error('No cached response available');

      case 'default_response':
        return fallbackStrategy.defaultResponse || { error: 'Workflow failed', fallback: true };

      default:
        throw new Error(`Unsupported fallback strategy: ${fallbackStrategy.type}`);
    }
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  private checkDependencies(step: WorkflowStep, context: any): boolean {
    if (!step.dependencies || step.dependencies.length === 0) {
      return true;
    }

    return step.dependencies.every(dep => context.results[dep] !== undefined);
  }

  private evaluateCondition(condition: string, context: any): boolean {
    // Simple condition evaluation - in production, use a proper expression evaluator
    try {
      const func = new Function('context', `return ${condition}`);
      return func(context);
    } catch (error) {
      console.error('Condition evaluation failed:', error);
      return false;
    }
  }

  private mapStepInput(step: WorkflowStep, context: any): any {
    const input: any = {};
    
    for (const [key, mapping] of Object.entries(step.inputMapping)) {
      const value = this.getValueFromMapping(mapping, context);
      input[key] = value;
    }
    
    return input;
  }

  private mapStepOutput(step: WorkflowStep, output: any): any {
    if (!step.outputMapping || Object.keys(step.outputMapping).length === 0) {
      return output;
    }

    const mapped: any = {};
    
    for (const [key, mapping] of Object.entries(step.outputMapping)) {
      mapped[key] = output[mapping] || output;
    }
    
    return mapped;
  }

  private getValueFromMapping(mapping: string, context: any): any {
    if (mapping.startsWith('input.')) {
      return context.input[mapping.substring(6)];
    }
    if (mapping.startsWith('results.')) {
      const [, stepId, field] = mapping.split('.');
      return context.results[stepId]?.[field] || context.results[stepId];
    }
    return mapping;
  }

  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = [];
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize));
    }
    return batches;
  }

  private selectBestResult(results: any[], metric: string): any {
    return results.reduce((best, current) => {
      const bestScore = best.result[metric] || 0;
      const currentScore = current.result[metric] || 0;
      return currentScore > bestScore ? current : best;
    });
  }

  private buildConsensus(results: any[], threshold: number): any {
    // Simple consensus building - in production, implement more sophisticated logic
    const consensus = {
      agreements: [],
      disagreements: [],
      confidence: 0
    };

    // Find common elements across results
    const allKeys = new Set();
    results.forEach(r => Object.keys(r.result).forEach(key => allKeys.add(key)));

    for (const key of allKeys) {
      const values = results.map(r => r.result[key]).filter(v => v !== undefined);
      const uniqueValues = [...new Set(values)];
      
      if (uniqueValues.length === 1) {
        consensus.agreements.push({ key, value: uniqueValues[0] });
      } else {
        consensus.disagreements.push({ key, values: uniqueValues });
      }
    }

    consensus.confidence = consensus.agreements.length / allKeys.size;
    
    return consensus;
  }

  private conductPeerReview(results: any[]): any {
    // Simple peer review - in production, implement agent-based review
    return {
      reviewed: results.map(r => r.result),
      averageScore: results.reduce((sum, r) => sum + (r.result.confidence || 0), 0) / results.length,
      recommendations: ['Implement peer review logic']
    };
  }

  private conductWeightedVoting(results: any[]): any {
    // Simple weighted voting - in production, implement proper voting algorithm
    const weights = results.map(r => r.result.confidence || 1);
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    
    return {
      result: results[0].result, // Simplified - take first result
      weights,
      totalWeight,
      votingResults: results.map(r => r.result)
    };
  }

  private isRetryableError(error: Error, retryPolicy: RetryPolicy): boolean {
    return retryPolicy.retryableErrors.some(pattern => 
      error.message.includes(pattern)
    );
  }

  private calculateRetryDelay(attempt: number, retryPolicy: RetryPolicy): number {
    let delay: number;
    
    switch (retryPolicy.backoffStrategy) {
      case 'linear':
        delay = retryPolicy.baseDelayMs * attempt;
        break;
      case 'exponential':
        delay = retryPolicy.baseDelayMs * Math.pow(2, attempt - 1);
        break;
      case 'fixed':
      default:
        delay = retryPolicy.baseDelayMs;
        break;
    }
    
    return Math.min(delay, retryPolicy.maxDelayMs);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async getCachedResponse(workflowId: string, input: any): Promise<any> {
    // Simple cache lookup - in production, implement proper caching
    const cacheKey = `${workflowId}_${JSON.stringify(input)}`;
    return null; // No cache implementation yet
  }

  private updateCoordinationMetrics(execution: WorkflowExecution): void {
    this.coordinationMetrics.totalExecutions++;
    
    if (execution.status === 'completed') {
      this.coordinationMetrics.successRate = 
        (this.coordinationMetrics.successRate * (this.coordinationMetrics.totalExecutions - 1) + 1) / 
        this.coordinationMetrics.totalExecutions;
    }
    
    this.coordinationMetrics.averageExecutionTime = 
      (this.coordinationMetrics.averageExecutionTime * (this.coordinationMetrics.totalExecutions - 1) + 
       execution.metadata.totalTime) / this.coordinationMetrics.totalExecutions;

    // Update agent utilization
    execution.metadata.agentsUsed.forEach(agent => {
      this.coordinationMetrics.agentUtilization[agent] = 
        (this.coordinationMetrics.agentUtilization[agent] || 0) + 1;
    });
  }

  private generateExecutionId(): string {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // ================================================================
  // STANDARD WORKFLOWS
  // ================================================================

  private initializeStandardWorkflows(): void {
    // Educational Content Creation Workflow
    this.registerWorkflow({
      id: 'educational-content-creation',
      name: 'Educational Content Creation',
      description: 'Create comprehensive educational content using multiple agents',
      agents: ['see', 'think', 'tool', 'safe'],
      steps: [
        {
          id: 'analyze-requirements',
          name: 'Analyze Educational Requirements',
          agent: 'think',
          action: 'analyze_critically',
          inputMapping: { requirements: 'input.requirements' },
          outputMapping: { analysis: 'analysis' },
          dependencies: [],
          required: true
        },
        {
          id: 'find-tools',
          name: 'Find Educational Tools',
          agent: 'tool',
          action: 'discover_tools',
          inputMapping: { 
            skillCategory: 'results.analyze-requirements.skillCategory',
            subject: 'input.subject',
            gradeLevel: 'input.gradeLevel'
          },
          outputMapping: { tools: 'discoveredTools' },
          dependencies: ['analyze-requirements'],
          required: true
        },
        {
          id: 'create-visuals',
          name: 'Create Visual Content',
          agent: 'see',
          action: 'create_visual_content',
          inputMapping: { 
            type: 'input.visualType',
            parameters: 'results.analyze-requirements.visualParameters'
          },
          outputMapping: { visuals: 'visualElements' },
          dependencies: ['analyze-requirements'],
          required: false
        },
        {
          id: 'validate-safety',
          name: 'Validate Content Safety',
          agent: 'safe',
          action: 'validate_content_safety',
          inputMapping: { 
            content: 'results.create-visuals',
            tools: 'results.find-tools'
          },
          outputMapping: { validation: 'safetyResults' },
          dependencies: ['find-tools', 'create-visuals'],
          required: true
        }
      ],
      coordination: {
        type: 'sequential',
        parameters: {}
      },
      timeoutMs: 60000,
      retryPolicy: {
        maxAttempts: 3,
        backoffStrategy: 'exponential',
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        retryableErrors: ['timeout', 'network', 'temporary']
      },
      fallbackStrategy: {
        type: 'single_agent',
        fallbackAgent: 'tool'
      }
    });

    // Multi-Agent Assessment Workflow
    this.registerWorkflow({
      id: 'multi-agent-assessment',
      name: 'Multi-Agent Assessment',
      description: 'Comprehensive assessment using multiple agent perspectives',
      agents: ['think', 'see', 'speak', 'safe'],
      steps: [
        {
          id: 'cognitive-assessment',
          name: 'Cognitive Assessment',
          agent: 'think',
          action: 'solve_problem',
          inputMapping: { problem: 'input.problem' },
          outputMapping: { cognitive: 'reasoning' },
          dependencies: [],
          required: true
        },
        {
          id: 'visual-assessment',
          name: 'Visual Assessment',
          agent: 'see',
          action: 'process_visual_learning',
          inputMapping: { content: 'input.visualContent' },
          outputMapping: { visual: 'visualAnalysis' },
          dependencies: [],
          required: true
        },
        {
          id: 'communication-assessment',
          name: 'Communication Assessment',
          agent: 'speak',
          action: 'assess_collaboration',
          inputMapping: { interaction: 'input.interaction' },
          outputMapping: { communication: 'collaborationMetrics' },
          dependencies: [],
          required: true
        },
        {
          id: 'safety-assessment',
          name: 'Safety Assessment',
          agent: 'safe',
          action: 'validate_content_safety',
          inputMapping: { 
            content: 'results.visual-assessment',
            interaction: 'results.communication-assessment'
          },
          outputMapping: { safety: 'safetyValidation' },
          dependencies: ['visual-assessment', 'communication-assessment'],
          required: true
        }
      ],
      coordination: {
        type: 'collaborative',
        parameters: {
          collaborationMode: 'consensus',
          consensusThreshold: 0.7
        }
      },
      timeoutMs: 120000,
      retryPolicy: {
        maxAttempts: 2,
        backoffStrategy: 'linear',
        baseDelayMs: 2000,
        maxDelayMs: 5000,
        retryableErrors: ['timeout', 'analysis_incomplete']
      },
      fallbackStrategy: {
        type: 'reduced_workflow',
        fallbackWorkflow: 'simple-assessment'
      }
    });

    // Completion Feedback Workflow
    this.registerWorkflow({
      id: 'completion-feedback',
      name: 'Completion Feedback',
      description: 'Provide comprehensive feedback after tool completion',
      agents: ['speak', 'think', 'safe'],
      steps: [
        {
          id: 'feedback-message',
          name: 'Generate Feedback Message',
          agent: 'speak',
          action: 'provide_guidance',
          inputMapping: { 
            type: 'completion_feedback',
            assignment: 'input.assignment',
            results: 'input.results'
          },
          outputMapping: { message: 'feedbackMessage' },
          dependencies: [],
          required: true
        },
        {
          id: 'encouragement',
          name: 'Provide Encouragement',
          agent: 'speak',
          action: 'provide_guidance',
          inputMapping: { 
            type: 'encouragement',
            isCorrect: 'input.isCorrect',
            assignment: 'input.assignment'
          },
          outputMapping: { encouragement: 'encouragementText' },
          dependencies: [],
          required: true
        },
        {
          id: 'next-steps',
          name: 'Suggest Next Steps',
          agent: 'think',
          action: 'analyze_critically',
          inputMapping: { 
            subject: 'input.assignment.subject',
            content: 'input.results',
            analysisType: 'next_steps'
          },
          outputMapping: { nextSteps: 'suggestions' },
          dependencies: ['feedback-message'],
          required: false
        }
      ],
      coordination: {
        type: 'parallel',
        parameters: { maxParallelTasks: 2 }
      },
      timeoutMs: 15000,
      retryPolicy: {
        maxAttempts: 2,
        backoffStrategy: 'fixed',
        baseDelayMs: 1000,
        maxDelayMs: 3000,
        retryableErrors: ['timeout', 'network']
      },
      fallbackStrategy: {
        type: 'default_response',
        defaultResponse: {
          'feedback-message': { message: 'Great job!' },
          'encouragement': { text: 'Keep up the good work!' }
        }
      }
    });

    console.log('📋 Standard workflows initialized');
  }

  // ================================================================
  // PUBLIC API
  // ================================================================

  getCoordinationMetrics(): any {
    return { ...this.coordinationMetrics };
  }

  getActiveExecutions(): WorkflowExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  getExecutionHistory(): WorkflowExecution[] {
    return [...this.executionHistory];
  }

  async cancelExecution(executionId: string): Promise<boolean> {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return false;

    execution.status = 'cancelled';
    execution.endTime = new Date();
    execution.metadata.totalTime = execution.endTime.getTime() - execution.startTime.getTime();

    this.executionHistory.push(execution);
    this.activeExecutions.delete(executionId);

    console.log(`🛑 Execution cancelled: ${executionId}`);
    return true;
  }

  async healthCheck(): Promise<{
    healthy: boolean;
    activeExecutions: number;
    successRate: number;
    averageExecutionTime: number;
    issues: string[];
  }> {
    const issues: string[] = [];
    
    // Check for stuck executions
    const now = Date.now();
    const stuckExecutions = Array.from(this.activeExecutions.values())
      .filter(e => now - e.startTime.getTime() > 300000); // 5 minutes

    if (stuckExecutions.length > 0) {
      issues.push(`${stuckExecutions.length} executions may be stuck`);
    }

    // Check success rate
    if (this.coordinationMetrics.successRate < 0.8) {
      issues.push('Success rate below 80%');
    }

    return {
      healthy: issues.length === 0,
      activeExecutions: this.activeExecutions.size,
      successRate: this.coordinationMetrics.successRate,
      averageExecutionTime: this.coordinationMetrics.averageExecutionTime,
      issues
    };
  }
}

// Export singleton instance - initialized with proper agent system
import { defaultAgentSystem } from '../agents/AgentSystem';
export const agentCoordination = new AgentCoordination(defaultAgentSystem);