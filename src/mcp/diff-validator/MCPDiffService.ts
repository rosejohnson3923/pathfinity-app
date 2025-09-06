// ================================================================
// MCP DIFF SERVICE - CONVERSATION-PERSISTENT INTERFACE
// Service interface for running diff validations across conversations
// ================================================================

import MCPDiffValidator, { DiffAnalysisRequest, DiffValidationResult } from './MCPDiffValidator';

export class MCPDiffService {
  private static instance: MCPDiffService;
  private validator: MCPDiffValidator;

  private constructor() {
    this.validator = new MCPDiffValidator();
  }

  public static getInstance(): MCPDiffService {
    if (!MCPDiffService.instance) {
      MCPDiffService.instance = new MCPDiffService();
    }
    return MCPDiffService.instance;
  }

  /**
   * Run skill code format standardization analysis
   */
  public async analyzeSkillCodeFormatChange(): Promise<DiffValidationResult> {
    console.log('🚀 MCP Diff Service: Starting Skill Code Format Analysis...');

    const request: DiffAnalysisRequest = {
      changeId: 'skill-code-format-standardization-v1',
      title: 'Standardize Skill Code Format to A.1 Across All Master Containers',
      description: 'Change from inconsistent format (A.1 input → K.RL.1 lookup) to consistent A.1 format throughout the system while preserving Common Core compliance as metadata',
      proposedChanges: [
        {
          component: 'ExperienceMasterContainer',
          currentState: 'A.1 input converted to K.RL.1 for template lookup, causing mismatches',
          proposedState: 'A.1 input used directly for template lookup with A.1 template keys',
          changeType: 'format',
          files: [
            'src/services/experienceTemplateService.ts',
            'src/components/mastercontainers/ExperienceMasterContainer.tsx'
          ]
        },
        {
          component: 'TemplateSystem',
          currentState: 'Template registry uses K.RL.1 format keys (K-ELA-K.RL.1-librarian)',
          proposedState: 'Template registry uses A.1 format keys (K-ELA-A.1-librarian) + Common Core metadata',
          changeType: 'structure',
          files: [
            'src/services/experienceTemplateService.ts',
            'src/data/experienceTemplates/kindergarten/ela/K.RL.1-librarian.ts'
          ]
        },
        {
          component: 'LearnMasterContainer',
          currentState: 'Already uses A.1 format consistently',
          proposedState: 'No changes - maintain existing A.1 format',
          changeType: 'data',
          files: [
            'src/components/mastercontainers/LearnMasterContainer.tsx'
          ]
        },
        {
          component: 'DiscoverMasterContainer',
          currentState: 'Unknown skill format dependencies',
          proposedState: 'Ensure compatibility with consistent A.1 format from upstream containers',
          changeType: 'integration',
          files: [
            'src/components/mastercontainers/DiscoverMasterContainer.tsx'
          ]
        }
      ],
      affectedComponents: [
        'LearnMasterContainer',
        'ExperienceMasterContainer', 
        'DiscoverMasterContainer',
        'TemplateSystem',
        'SkillProgressTracking',
        'CrossContainerDataFlow'
      ],
      riskThreshold: 'high'
    };

    const result = await this.validator.validateChange(request);

    // Generate and display summary report
    this.displayAnalysisReport(result);

    return result;
  }

  /**
   * Display formatted analysis report
   */
  private displayAnalysisReport(result: DiffValidationResult): void {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 MCP DIFF VALIDATION REPORT');
    console.log('='.repeat(80));
    console.log(`📋 Change: ${result.changeId}`);
    console.log(`⚠️  Overall Risk: ${result.overallRisk.toUpperCase()}`);
    console.log(`✅ Recommendation: ${result.recommendation.replace(/_/g, ' ').toUpperCase()}`);
    console.log(`📝 Summary: ${result.summary}`);
    console.log('\n' + '📊 COMPONENT IMPACT ANALYSIS');
    console.log('-'.repeat(50));

    result.componentImpacts.forEach((impact, index) => {
      const riskIcon = this.getRiskIcon(impact.impactLevel);
      console.log(`${index + 1}. ${riskIcon} ${impact.component} (${impact.impactLevel.toUpperCase()})`);
      console.log(`   📋 ${impact.description}`);
      if (impact.breakingChanges.length > 0) {
        console.log(`   ⚠️  Breaking Changes: ${impact.breakingChanges.length} identified`);
      }
      console.log('');
    });

    console.log('🔄 CROSS-CONTAINER EFFECTS');
    console.log('-'.repeat(50));
    result.crossContainerAnalysis.forEach((effect, index) => {
      console.log(`${index + 1}. ${effect.sourceContainer} → ${effect.targetContainer}`);
      console.log(`   📊 Data Flow: ${effect.dataFlow}`);
      console.log(`   🎯 Validation: ${effect.validationRequired}`);
      console.log('');
    });

    console.log('🗺️  MIGRATION PLAN');
    console.log('-'.repeat(50));
    result.migrationPlan.slice(0, 5).forEach(step => {
      console.log(`${step.order}. ${step.description} (${step.estimatedTime})`);
    });
    if (result.migrationPlan.length > 5) {
      console.log(`   ... and ${result.migrationPlan.length - 5} more steps`);
    }

    console.log('\n🧪 KEY TESTING REQUIREMENTS');
    console.log('-'.repeat(50));
    result.testingPlan.forEach(test => {
      console.log(`• ${test.category.toUpperCase()}: ${test.description}`);
    });

    console.log('\n📁 PERSISTENT STORAGE');
    console.log('-'.repeat(50));
    console.log(`✅ Analysis saved for future conversations`);
    console.log(`🔍 Use MCPDiffService.loadPreviousAnalysis('${result.changeId}') to retrieve`);
    
    console.log('\n' + '='.repeat(80));
  }

  private getRiskIcon(level: string): string {
    switch (level) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '❓';
    }
  }

  /**
   * Load previous analysis result
   */
  public static loadPreviousAnalysis(changeId: string): DiffValidationResult | null {
    return MCPDiffValidator.loadValidationResult(changeId);
  }

  /**
   * List all previous analyses
   */
  public static listPreviousAnalyses(): string[] {
    return MCPDiffValidator.listPreviousAnalyses();
  }

  /**
   * Quick validation check - returns simplified result
   */
  public async quickValidation(changeId: string): Promise<{
    recommendation: string;
    riskLevel: string;
    keyPoints: string[];
  }> {
    const result = await this.analyzeSkillCodeFormatChange();
    
    return {
      recommendation: result.recommendation.replace(/_/g, ' ').toUpperCase(),
      riskLevel: result.overallRisk.toUpperCase(),
      keyPoints: [
        `${result.componentImpacts.length} components analyzed`,
        `${result.crossContainerAnalysis.length} cross-container effects identified`,
        `${result.migrationPlan.length} migration steps planned`,
        'Analysis persisted for future reference'
      ]
    };
  }
}

// Export singleton instance for easy access
export const mcpDiffService = MCPDiffService.getInstance();

export default MCPDiffService;