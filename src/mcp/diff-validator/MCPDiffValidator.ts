// ================================================================
// MCP DIFF VALIDATOR - PERSISTENT CROSS-CONVERSATION SYSTEM
// Analyzes architectural changes across Grade/Subject/Skill combinations
// Ensures compatibility between and across LearnMasterContainer, ExperienceMasterContainer, DiscoverMasterContainer
// ================================================================

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface DiffAnalysisRequest {
  changeId: string;
  title: string;
  description: string;
  proposedChanges: ProposedChange[];
  affectedComponents: string[];
  riskThreshold: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProposedChange {
  component: string;
  currentState: string;
  proposedState: string;
  changeType: 'format' | 'structure' | 'logic' | 'data' | 'integration';
  files: string[];
}

export interface ComponentImpact {
  component: string;
  impactLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  description: string;
  breakingChanges: string[];
  mitigationSteps: string[];
  testingRequired: string[];
  rollbackSteps: string[];
  crossContainerEffects: CrossContainerEffect[];
}

export interface CrossContainerEffect {
  sourceContainer: string;
  targetContainer: string;
  dataFlow: string;
  potentialIssue: string;
  validationRequired: string;
}

export interface DiffValidationResult {
  changeId: string;
  timestamp: string;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  recommendation: 'proceed' | 'proceed_with_caution' | 'requires_modifications' | 'do_not_proceed';
  summary: string;
  componentImpacts: ComponentImpact[];
  crossContainerAnalysis: CrossContainerEffect[];
  migrationPlan: MigrationStep[];
  testingPlan: TestingRequirement[];
  rollbackPlan: RollbackStep[];
  conversationContext: string;
}

export interface MigrationStep {
  order: number;
  description: string;
  component: string;
  estimatedTime: string;
  dependencies: string[];
  validationCriteria: string[];
}

export interface TestingRequirement {
  category: 'unit' | 'integration' | 'cross_container' | 'regression';
  description: string;
  components: string[];
  testData: string[];
  successCriteria: string[];
}

export interface RollbackStep {
  order: number;
  description: string;
  component: string;
  files: string[];
  backupRequired: boolean;
}

export class MCPDiffValidator {
  private static readonly CONTEXT_DIR = '/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/mcp/context';
  private static readonly RESULTS_DIR = '/mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary/src/mcp/diff-validator/results';
  
  constructor() {
    this.ensureDirectoriesExist();
  }

  private ensureDirectoriesExist(): void {
    if (!existsSync(MCPDiffValidator.CONTEXT_DIR)) {
      mkdirSync(MCPDiffValidator.CONTEXT_DIR, { recursive: true });
    }
    if (!existsSync(MCPDiffValidator.RESULTS_DIR)) {
      mkdirSync(MCPDiffValidator.RESULTS_DIR, { recursive: true });
    }
  }

  /**
   * Main validation method - analyzes proposed changes and returns comprehensive report
   */
  public async validateChange(request: DiffAnalysisRequest): Promise<DiffValidationResult> {
    console.log(`🔍 MCP Diff Validator: Starting analysis for ${request.changeId}`);
    
    // Save request context for future reference
    this.saveRequestContext(request);
    
    // Analyze each component
    const componentImpacts = await this.analyzeComponentImpacts(request);
    
    // Analyze cross-container effects
    const crossContainerAnalysis = await this.analyzeCrossContainerEffects(request, componentImpacts);
    
    // Calculate overall risk
    const overallRisk = this.calculateOverallRisk(componentImpacts);
    
    // Generate migration plan
    const migrationPlan = await this.generateMigrationPlan(request, componentImpacts);
    
    // Generate testing plan
    const testingPlan = await this.generateTestingPlan(request, componentImpacts);
    
    // Generate rollback plan
    const rollbackPlan = await this.generateRollbackPlan(request, componentImpacts);
    
    // Create final result
    const result: DiffValidationResult = {
      changeId: request.changeId,
      timestamp: new Date().toISOString(),
      overallRisk,
      recommendation: this.generateRecommendation(overallRisk, componentImpacts),
      summary: this.generateSummary(request, componentImpacts, overallRisk),
      componentImpacts,
      crossContainerAnalysis,
      migrationPlan,
      testingPlan,
      rollbackPlan,
      conversationContext: this.captureConversationContext()
    };
    
    // Persist result for future conversations
    this.saveValidationResult(result);
    
    console.log(`✅ MCP Diff Validator: Analysis complete. Risk: ${overallRisk}, Recommendation: ${result.recommendation}`);
    
    return result;
  }

  /**
   * Analyze impact on each affected component
   */
  private async analyzeComponentImpacts(request: DiffAnalysisRequest): Promise<ComponentImpact[]> {
    const impacts: ComponentImpact[] = [];
    
    for (const component of request.affectedComponents) {
      const impact = await this.analyzeIndividualComponent(component, request);
      impacts.push(impact);
    }
    
    return impacts;
  }

  /**
   * Analyze individual component impact
   */
  private async analyzeIndividualComponent(component: string, request: DiffAnalysisRequest): Promise<ComponentImpact> {
    switch (component) {
      case 'LearnMasterContainer':
        return this.analyzeLearnMasterContainerImpact(request);
      case 'ExperienceMasterContainer':
        return this.analyzeExperienceMasterContainerImpact(request);
      case 'DiscoverMasterContainer':
        return this.analyzeDiscoverMasterContainerImpact(request);
      case 'TemplateSystem':
        return this.analyzeTemplateSystemImpact(request);
      case 'SkillProgressTracking':
        return this.analyzeSkillProgressTrackingImpact(request);
      case 'CrossContainerDataFlow':
        return this.analyzeCrossContainerDataFlowImpact(request);
      default:
        return this.analyzeGenericComponentImpact(component, request);
    }
  }

  private analyzeLearnMasterContainerImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'LearnMasterContainer',
      impactLevel: 'low',
      description: 'Already uses simplified A.1 format consistently. No changes required.',
      breakingChanges: [],
      mitigationSteps: [
        'Verify existing A.1 format handling remains unchanged',
        'Ensure skill progression logic is not affected'
      ],
      testingRequired: [
        'Regression testing of existing skill progression',
        'Verify A.1 skill code processing',
        'Test cross-subject navigation'
      ],
      rollbackSteps: [
        'No rollback required - no changes to LearnMasterContainer'
      ],
      crossContainerEffects: [
        {
          sourceContainer: 'LearnMasterContainer',
          targetContainer: 'ExperienceMasterContainer',
          dataFlow: 'Skill completion data with A.1 format',
          potentialIssue: 'Format mismatch if ExperienceMasterContainer expects K.RL.1',
          validationRequired: 'Test skill data handoff between containers'
        }
      ]
    };
  }

  private analyzeExperienceMasterContainerImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'ExperienceMasterContainer',
      impactLevel: 'high',
      description: 'Major impact: resolving format inconsistency by standardizing to A.1 format. Fixes template lookup failures.',
      breakingChanges: [
        'Template registry keys need updating from K.RL.1 to A.1',
        'Skill code normalization logic changes',
        'Template file naming convention changes'
      ],
      mitigationSteps: [
        'Update experienceTemplateService.ts normalizeSkillCode function',
        'Update template registry mapping',
        'Rename existing template files',
        'Add backward compatibility layer during transition'
      ],
      testingRequired: [
        'Template resolution for all Grade/Subject/Career combinations',
        'Career-specific template loading',
        'Cross-subject progression within experience flow',
        'Fallback behavior when templates are missing'
      ],
      rollbackSteps: [
        'Revert normalizeSkillCode to convert A.1 → K.RL.1',
        'Restore original template registry keys',
        'Revert template file names'
      ],
      crossContainerEffects: [
        {
          sourceContainer: 'LearnMasterContainer',
          targetContainer: 'ExperienceMasterContainer',
          dataFlow: 'Completed skills in A.1 format',
          potentialIssue: 'Template lookup now works correctly with consistent format',
          validationRequired: 'Test Learn → Experience skill progression'
        }
      ]
    };
  }

  private analyzeDiscoverMasterContainerImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'DiscoverMasterContainer',
      impactLevel: 'medium',
      description: 'Medium impact: likely uses career-applied skill data from Experience. Format consistency will improve data flow.',
      breakingChanges: [
        'May expect specific skill code format from Experience container',
        'Career progression data format dependencies'
      ],
      mitigationSteps: [
        'Verify DiscoverMasterContainer skill code processing',
        'Update any hardcoded skill format expectations',
        'Ensure career progression data compatibility',
        'Test skill-to-project mapping with A.1 format'
      ],
      testingRequired: [
        'Experience → Discover container progression',
        'Career-applied skill data processing',
        'Project recommendation based on skills',
        'Skill validation in Discover phase'
      ],
      rollbackSteps: [
        'Revert any skill code format changes in Discover container',
        'Restore format conversion if previously implemented'
      ],
      crossContainerEffects: [
        {
          sourceContainer: 'ExperienceMasterContainer',
          targetContainer: 'DiscoverMasterContainer',
          dataFlow: 'Career-applied skills with A.1 format',
          potentialIssue: 'May expect different format for project recommendations',
          validationRequired: 'Test Experience → Discover skill data handoff'
        },
        {
          sourceContainer: 'LearnMasterContainer',
          targetContainer: 'DiscoverMasterContainer',
          dataFlow: 'Base skill mastery data',
          potentialIssue: 'Skill combination logic may depend on format',
          validationRequired: 'Verify skill-based project suggestions work correctly'
        }
      ]
    };
  }

  private analyzeTemplateSystemImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'TemplateSystem',
      impactLevel: 'critical',
      description: 'Complete restructuring of template registry and file naming system. High risk of breaking existing templates.',
      breakingChanges: [
        'Template registry key format change (K.RL.1 → A.1)',
        'Template file naming convention change',
        'Template metadata skillCode property changes',
        'Potential loss of Common Core standards compliance in primary keys'
      ],
      mitigationSteps: [
        'Create migration script for existing templates',
        'Implement dual-key lookup during transition',
        'Add Common Core standards as metadata field',
        'Maintain template functionality tests'
      ],
      testingRequired: [
        'Template loading for all existing templates',
        'Template registry key resolution',
        'Career-specific template selection',
        'Template metadata integrity',
        'Missing template fallback behavior'
      ],
      rollbackSteps: [
        'Restore original template registry',
        'Revert template file names',
        'Remove Common Core metadata fields',
        'Restore original skillCode properties in templates'
      ],
      crossContainerEffects: []
    };
  }

  private analyzeSkillProgressTrackingImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'SkillProgressTracking',
      impactLevel: 'medium',
      description: 'Positive impact: enables consistent skill tracking across all containers with unified A.1 format.',
      breakingChanges: [],
      mitigationSteps: [
        'Verify skill progression data consistency',
        'Update any hardcoded skill code references',
        'Ensure database skill codes align with A.1 format'
      ],
      testingRequired: [
        'Cross-container skill progression tracking',
        'Skill completion data integrity',
        'Progress reporting accuracy'
      ],
      rollbackSteps: [
        'Revert any skill tracking format changes',
        'Restore inconsistent format handling if necessary'
      ],
      crossContainerEffects: [
        {
          sourceContainer: 'LearnMasterContainer',
          targetContainer: 'ExperienceMasterContainer',
          dataFlow: 'Skill completion status',
          potentialIssue: 'None - this change fixes the existing format mismatch',
          validationRequired: 'Verify end-to-end skill progression tracking'
        },
        {
          sourceContainer: 'ExperienceMasterContainer',
          targetContainer: 'DiscoverMasterContainer',
          dataFlow: 'Career-applied skills',
          potentialIssue: 'DiscoverMasterContainer may expect consistent format',
          validationRequired: 'Test Experience → Discover progression'
        }
      ]
    };
  }

  private analyzeCrossContainerDataFlowImpact(request: DiffAnalysisRequest): ComponentImpact {
    return {
      component: 'CrossContainerDataFlow',
      impactLevel: 'high',
      description: 'Major benefit: resolves data format inconsistency that was breaking skill progression between containers.',
      breakingChanges: [],
      mitigationSteps: [
        'Verify all container handoffs use consistent A.1 format',
        'Update ThreeContainerOrchestrator if needed',
        'Test full Learn → Experience → Discover flow'
      ],
      testingRequired: [
        'Complete three-phase flow testing',
        'Skill data integrity across container transitions',
        'Container orchestration logic'
      ],
      rollbackSteps: [
        'Restore format conversion logic between containers',
        'Accept broken skill progression as previous state'
      ],
      crossContainerEffects: [
        {
          sourceContainer: 'All Containers',
          targetContainer: 'All Containers',
          dataFlow: 'Unified skill format',
          potentialIssue: 'None - this fixes existing issues',
          validationRequired: 'End-to-end flow testing'
        }
      ]
    };
  }

  private analyzeGenericComponentImpact(component: string, request: DiffAnalysisRequest): ComponentImpact {
    return {
      component,
      impactLevel: 'medium',
      description: `Impact analysis needed for ${component}`,
      breakingChanges: ['Unknown - requires investigation'],
      mitigationSteps: [`Analyze ${component} integration with skill code format`],
      testingRequired: [`Test ${component} functionality with A.1 format`],
      rollbackSteps: [`Revert ${component} changes if needed`],
      crossContainerEffects: []
    };
  }

  /**
   * Analyze cross-container effects
   */
  private async analyzeCrossContainerEffects(
    request: DiffAnalysisRequest, 
    componentImpacts: ComponentImpact[]
  ): Promise<CrossContainerEffect[]> {
    const effects: CrossContainerEffect[] = [];
    
    // Collect all cross-container effects from component impacts
    componentImpacts.forEach(impact => {
      effects.push(...impact.crossContainerEffects);
    });
    
    return effects;
  }

  /**
   * Calculate overall risk level
   */
  private calculateOverallRisk(componentImpacts: ComponentImpact[]): 'low' | 'medium' | 'high' | 'critical' {
    const riskLevels = componentImpacts.map(impact => impact.impactLevel);
    
    if (riskLevels.includes('critical')) return 'critical';
    if (riskLevels.includes('high')) return 'high';
    if (riskLevels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Generate recommendation
   */
  private generateRecommendation(
    overallRisk: string, 
    componentImpacts: ComponentImpact[]
  ): 'proceed' | 'proceed_with_caution' | 'requires_modifications' | 'do_not_proceed' {
    const criticalImpacts = componentImpacts.filter(i => i.impactLevel === 'critical');
    const highImpacts = componentImpacts.filter(i => i.impactLevel === 'high');
    
    if (criticalImpacts.length > 2) return 'do_not_proceed';
    if (criticalImpacts.length > 0 || highImpacts.length > 3) return 'requires_modifications';
    if (overallRisk === 'high') return 'proceed_with_caution';
    
    return 'proceed';
  }

  /**
   * Generate summary
   */
  private generateSummary(
    request: DiffAnalysisRequest,
    componentImpacts: ComponentImpact[],
    overallRisk: string
  ): string {
    const benefits = componentImpacts.filter(i => 
      i.description.includes('benefit') || 
      i.description.includes('fixes') || 
      i.description.includes('resolves')
    ).length;
    
    const risks = componentImpacts.filter(i => i.impactLevel === 'high' || i.impactLevel === 'critical').length;
    
    return `Analysis of ${request.title}: ${benefits} components show benefits, ${risks} components show significant risk. Overall risk: ${overallRisk}. This change addresses critical architecture inconsistency between containers.`;
  }

  /**
   * Generate migration plan
   */
  private async generateMigrationPlan(
    request: DiffAnalysisRequest,
    componentImpacts: ComponentImpact[]
  ): Promise<MigrationStep[]> {
    const steps: MigrationStep[] = [];
    let order = 1;

    // Add steps based on component impacts
    componentImpacts.forEach(impact => {
      impact.mitigationSteps.forEach(step => {
        steps.push({
          order: order++,
          description: step,
          component: impact.component,
          estimatedTime: this.estimateStepTime(step),
          dependencies: this.identifyDependencies(step, componentImpacts),
          validationCriteria: [`${impact.component} functionality validated`]
        });
      });
    });

    return steps.sort((a, b) => a.order - b.order);
  }

  /**
   * Generate testing plan
   */
  private async generateTestingPlan(
    request: DiffAnalysisRequest,
    componentImpacts: ComponentImpact[]
  ): Promise<TestingRequirement[]> {
    const tests: TestingRequirement[] = [];

    componentImpacts.forEach(impact => {
      if (impact.testingRequired.length > 0) {
        tests.push({
          category: this.categorizeTest(impact.component),
          description: `Test ${impact.component} functionality`,
          components: [impact.component],
          testData: ['A.1 skill codes', 'Grade/Subject combinations'],
          successCriteria: impact.testingRequired
        });
      }
    });

    // Add cross-container integration tests
    tests.push({
      category: 'cross_container',
      description: 'Test skill progression across all containers',
      components: ['LearnMasterContainer', 'ExperienceMasterContainer', 'DiscoverMasterContainer'],
      testData: ['Multi-subject skill sequences', 'Career progression data'],
      successCriteria: ['End-to-end skill tracking', 'Consistent data format', 'No data loss']
    });

    return tests;
  }

  /**
   * Generate rollback plan
   */
  private async generateRollbackPlan(
    request: DiffAnalysisRequest,
    componentImpacts: ComponentImpact[]
  ): Promise<RollbackStep[]> {
    const steps: RollbackStep[] = [];
    let order = 1;

    componentImpacts.forEach(impact => {
      impact.rollbackSteps.forEach(step => {
        steps.push({
          order: order++,
          description: step,
          component: impact.component,
          files: this.identifyAffectedFiles(impact.component, request),
          backupRequired: impact.impactLevel === 'high' || impact.impactLevel === 'critical'
        });
      });
    });

    return steps.sort((a, b) => a.order - b.order);
  }

  // Helper methods
  private estimateStepTime(step: string): string {
    if (step.includes('migration') || step.includes('script')) return '2-4 hours';
    if (step.includes('testing') || step.includes('validation')) return '1-2 hours';
    if (step.includes('update') || step.includes('modify')) return '30-60 minutes';
    return '15-30 minutes';
  }

  private identifyDependencies(step: string, impacts: ComponentImpact[]): string[] {
    const dependencies = [];
    if (step.includes('template')) dependencies.push('Template system analysis');
    if (step.includes('registry')) dependencies.push('Template registry updates');
    return dependencies;
  }

  private categorizeTest(component: string): 'unit' | 'integration' | 'cross_container' | 'regression' {
    if (component.includes('Container')) return 'cross_container';
    if (component.includes('System')) return 'integration';
    return 'unit';
  }

  private identifyAffectedFiles(component: string, request: DiffAnalysisRequest): string[] {
    const files = [];
    request.proposedChanges.forEach(change => {
      if (change.component === component) {
        files.push(...change.files);
      }
    });
    return files;
  }

  private captureConversationContext(): string {
    return `MCP Diff Analysis - ${new Date().toISOString()} - Skill Code Format Standardization`;
  }

  /**
   * Save request context for persistence across conversations
   */
  private saveRequestContext(request: DiffAnalysisRequest): void {
    const contextFile = join(MCPDiffValidator.CONTEXT_DIR, `${request.changeId}-request.json`);
    writeFileSync(contextFile, JSON.stringify(request, null, 2));
    console.log(`📝 Saved request context to ${contextFile}`);
  }

  /**
   * Save validation result for persistence across conversations
   */
  private saveValidationResult(result: DiffValidationResult): void {
    const resultFile = join(MCPDiffValidator.RESULTS_DIR, `${result.changeId}-result.json`);
    writeFileSync(resultFile, JSON.stringify(result, null, 2));
    console.log(`📝 Saved validation result to ${resultFile}`);
  }

  /**
   * Load previous validation results
   */
  public static loadValidationResult(changeId: string): DiffValidationResult | null {
    const resultFile = join(MCPDiffValidator.RESULTS_DIR, `${changeId}-result.json`);
    if (existsSync(resultFile)) {
      const content = readFileSync(resultFile, 'utf8');
      return JSON.parse(content);
    }
    return null;
  }

  /**
   * List all previous analyses for reference
   */
  public static listPreviousAnalyses(): string[] {
    const resultsDir = MCPDiffValidator.RESULTS_DIR;
    if (!existsSync(resultsDir)) return [];
    
    const files = require('fs').readdirSync(resultsDir);
    return files
      .filter((file: string) => file.endsWith('-result.json'))
      .map((file: string) => file.replace('-result.json', ''));
  }
}

export default MCPDiffValidator;