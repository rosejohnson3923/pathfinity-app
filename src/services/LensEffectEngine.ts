/**
 * LensEffectEngine
 *
 * Applies executive lens effects to solutions, showing how different
 * C-Suite roles perceive and evaluate business solutions differently.
 */

import {
  SolutionCard,
  LensEffect,
  LensedSolution,
  CSuiteRole,
  SixCs,
  BusinessScenario,
  ScenarioType,
} from '../types/CareerChallengeTypes';

export class LensEffectEngine {
  /**
   * Apply lens effect to a solution based on executive role
   */
  public applyLens(
    solution: SolutionCard,
    lensEffect: LensEffect | undefined,
    executive: CSuiteRole
  ): LensedSolution {
    // If no specific lens effect is defined, generate a default one
    if (!lensEffect) {
      lensEffect = this.generateDefaultLensEffect(solution, executive);
    }

    return {
      ...solution,
      displayValue: lensEffect.perceivedValue,
      displayDescription: lensEffect.lensDescription,
      visualEmphasis: lensEffect.emphasisLevel,
      badges: lensEffect.visualIndicators.badges || [],
      warnings: lensEffect.visualIndicators.warnings || [],
      isPerfectHidden: lensEffect.distortsPerception && solution.isPerfect,
    };
  }

  /**
   * Apply lens to multiple solutions
   */
  public applyLensToSolutions(
    solutions: SolutionCard[],
    lensEffects: LensEffect[],
    executive: CSuiteRole
  ): LensedSolution[] {
    return solutions.map(solution => {
      const lensEffect = lensEffects.find(
        le => le.solutionId === solution.id && le.executiveRole === executive
      );
      return this.applyLens(solution, lensEffect, executive);
    });
  }

  /**
   * Calculate lens multiplier for scoring
   */
  public calculateLensMultiplier(
    selectedExecutive: CSuiteRole,
    optimalExecutive: CSuiteRole
  ): number {
    // Perfect match
    if (selectedExecutive === optimalExecutive) {
      return 1.5;
    }

    // Define executive relationships
    const executiveRelationships: Record<CSuiteRole, Partial<Record<CSuiteRole, number>>> = {
      CMO: { CHRO: 1.1, CFO: 0.8, COO: 0.9, CTO: 0.9 },
      CFO: { COO: 1.1, CMO: 0.8, CHRO: 0.75, CTO: 0.9 },
      CHRO: { CMO: 1.1, COO: 0.9, CFO: 0.75, CTO: 0.85 },
      COO: { CFO: 1.1, CTO: 1.0, CMO: 0.9, CHRO: 0.9 },
      CTO: { COO: 1.0, CFO: 0.9, CMO: 0.9, CHRO: 0.85 },
    };

    // Get relationship multiplier
    const relationship = executiveRelationships[selectedExecutive]?.[optimalExecutive];
    return relationship || 0.85; // Default penalty for poor match
  }

  /**
   * Generate lens-specific description for a solution
   */
  public generateLensDescription(
    solution: SolutionCard,
    executive: CSuiteRole
  ): string {
    const lensDescriptors: Record<CSuiteRole, (content: string) => string> = {
      CMO: (content) => this.generateCMODescription(content),
      CFO: (content) => this.generateCFODescription(content),
      CHRO: (content) => this.generateCHRODescription(content),
      COO: (content) => this.generateCOODescription(content),
      CTO: (content) => this.generateCTODescription(content),
    };

    return lensDescriptors[executive](solution.content);
  }

  /**
   * Get CMO lens effect
   */
  public getCMOLens(solution: SolutionCard, scenario: BusinessScenario): LensEffect {
    const marketingKeywords = ['brand', 'reputation', 'customer', 'market', 'pr', 'media', 'communication'];
    const hasMarketingFocus = marketingKeywords.some(keyword =>
      solution.content.toLowerCase().includes(keyword)
    );

    let perceivedValue = 3; // Base value
    const badges: string[] = [];
    const warnings: string[] = [];

    if (hasMarketingFocus) {
      perceivedValue = Math.min(5, perceivedValue + 2);
      badges.push('Brand Impact', 'PR Value');
    }

    if (solution.content.includes('cost') || solution.content.includes('budget')) {
      perceivedValue = Math.max(1, perceivedValue - 1);
      warnings.push('Budget Concern');
    }

    if (!solution.isPerfect && hasMarketingFocus) {
      // CMO overvalues marketing solutions even if they're not perfect
      perceivedValue = Math.min(5, perceivedValue + 1);
    }

    return {
      id: `${solution.id}-CMO`,
      solutionId: solution.id,
      executiveRole: 'CMO',
      perceivedValue: perceivedValue as 1 | 2 | 3 | 4 | 5,
      lensDescription: this.generateCMODescription(solution.content),
      emphasisLevel: hasMarketingFocus ? 'high' : 'medium',
      visualIndicators: {
        badges,
        warnings,
        color: hasMarketingFocus ? 'purple' : 'gray',
      },
      distortsPerception: !solution.isPerfect && hasMarketingFocus,
      biasType: 'brand_focus',
    };
  }

  /**
   * Get CFO lens effect
   */
  public getCFOLens(solution: SolutionCard, scenario: BusinessScenario): LensEffect {
    const financialKeywords = ['cost', 'budget', 'roi', 'revenue', 'profit', 'investment', 'savings'];
    const hasFinancialFocus = financialKeywords.some(keyword =>
      solution.content.toLowerCase().includes(keyword)
    );

    let perceivedValue = 3;
    const badges: string[] = [];
    const warnings: string[] = [];

    if (hasFinancialFocus) {
      perceivedValue = Math.min(5, perceivedValue + 2);
      badges.push('Cost Efficient', 'ROI Positive');
    }

    if (solution.content.includes('employee') || solution.content.includes('wellbeing')) {
      perceivedValue = Math.max(1, perceivedValue - 1);
      warnings.push('Expense Risk');
    }

    // CFO undervalues people-focused solutions
    if (solution.isPerfect && solution.content.includes('employee')) {
      perceivedValue = Math.max(2, perceivedValue - 1);
    }

    return {
      id: `${solution.id}-CFO`,
      solutionId: solution.id,
      executiveRole: 'CFO',
      perceivedValue: perceivedValue as 1 | 2 | 3 | 4 | 5,
      lensDescription: this.generateCFODescription(solution.content),
      emphasisLevel: hasFinancialFocus ? 'high' : 'low',
      visualIndicators: {
        badges,
        warnings,
        color: hasFinancialFocus ? 'green' : 'gray',
      },
      distortsPerception: solution.isPerfect && !hasFinancialFocus,
      biasType: 'financial_focus',
    };
  }

  /**
   * Get CHRO lens effect
   */
  public getCHROLens(solution: SolutionCard, scenario: BusinessScenario): LensEffect {
    const peopleKeywords = ['employee', 'team', 'culture', 'morale', 'wellbeing', 'talent', 'staff'];
    const hasPeopleFocus = peopleKeywords.some(keyword =>
      solution.content.toLowerCase().includes(keyword)
    );

    let perceivedValue = 3;
    const badges: string[] = [];
    const warnings: string[] = [];

    if (hasPeopleFocus) {
      perceivedValue = Math.min(5, perceivedValue + 2);
      badges.push('Employee First', 'Culture Positive');
    }

    if (solution.content.includes('automation') || solution.content.includes('outsource')) {
      perceivedValue = Math.max(1, perceivedValue - 2);
      warnings.push('Job Impact', 'Morale Risk');
    }

    // CHRO correctly identifies people-focused solutions
    if (solution.isPerfect && hasPeopleFocus) {
      perceivedValue = 5;
    }

    return {
      id: `${solution.id}-CHRO`,
      solutionId: solution.id,
      executiveRole: 'CHRO',
      perceivedValue: perceivedValue as 1 | 2 | 3 | 4 | 5,
      lensDescription: this.generateCHRODescription(solution.content),
      emphasisLevel: hasPeopleFocus ? 'high' : 'medium',
      visualIndicators: {
        badges,
        warnings,
        color: hasPeopleFocus ? 'blue' : 'gray',
      },
      distortsPerception: !solution.isPerfect && hasPeopleFocus,
      biasType: 'people_focus',
    };
  }

  /**
   * Get COO lens effect
   */
  public getCOOLens(solution: SolutionCard, scenario: BusinessScenario): LensEffect {
    const operationalKeywords = ['process', 'efficiency', 'operation', 'supply', 'logistics', 'workflow'];
    const hasOperationalFocus = operationalKeywords.some(keyword =>
      solution.content.toLowerCase().includes(keyword)
    );

    let perceivedValue = 3;
    const badges: string[] = [];
    const warnings: string[] = [];

    if (hasOperationalFocus) {
      perceivedValue = Math.min(5, perceivedValue + 2);
      badges.push('Operational Excellence', 'Efficiency Gain');
    }

    if (solution.content.includes('experiment') || solution.content.includes('pilot')) {
      perceivedValue = Math.max(2, perceivedValue - 1);
      warnings.push('Implementation Risk');
    }

    return {
      id: `${solution.id}-COO`,
      solutionId: solution.id,
      executiveRole: 'COO',
      perceivedValue: perceivedValue as 1 | 2 | 3 | 4 | 5,
      lensDescription: this.generateCOODescription(solution.content),
      emphasisLevel: hasOperationalFocus ? 'high' : 'medium',
      visualIndicators: {
        badges,
        warnings,
        color: hasOperationalFocus ? 'orange' : 'gray',
      },
      distortsPerception: false, // COO is generally balanced
      biasType: 'operational_focus',
    };
  }

  /**
   * Get CTO lens effect
   */
  public getCTOLens(solution: SolutionCard, scenario: BusinessScenario): LensEffect {
    const techKeywords = ['technology', 'system', 'software', 'digital', 'automation', 'ai', 'data'];
    const hasTechFocus = techKeywords.some(keyword =>
      solution.content.toLowerCase().includes(keyword)
    );

    let perceivedValue = 3;
    const badges: string[] = [];
    const warnings: string[] = [];

    if (hasTechFocus) {
      perceivedValue = Math.min(5, perceivedValue + 2);
      badges.push('Tech Innovation', 'Digital First');
    }

    if (solution.content.includes('manual') || solution.content.includes('traditional')) {
      perceivedValue = Math.max(1, perceivedValue - 2);
      warnings.push('Legacy Approach');
    }

    // CTO overvalues tech solutions even when simpler options are better
    if (!solution.isPerfect && hasTechFocus) {
      perceivedValue = Math.min(5, perceivedValue + 1);
    }

    return {
      id: `${solution.id}-CTO`,
      solutionId: solution.id,
      executiveRole: 'CTO',
      perceivedValue: perceivedValue as 1 | 2 | 3 | 4 | 5,
      lensDescription: this.generateCTODescription(solution.content),
      emphasisLevel: hasTechFocus ? 'high' : 'low',
      visualIndicators: {
        badges,
        warnings,
        color: hasTechFocus ? 'cyan' : 'gray',
      },
      distortsPerception: !solution.isPerfect && hasTechFocus,
      biasType: 'tech_solutionism',
    };
  }

  /**
   * Generate default lens effect if none exists
   */
  private generateDefaultLensEffect(solution: SolutionCard, executive: CSuiteRole): LensEffect {
    // Default scenario for testing
    const mockScenario: BusinessScenario = {
      id: 'default',
      title: 'Default Scenario',
      description: '',
      businessDriver: 'people',
      scenarioType: 'crisis',
      optimalExecutive: 'CHRO',
      difficultyLevel: 3,
      basePoints: 100,
      timeLimitSeconds: 60,
      industrySpecific: false,
      executivePitches: {},
    };

    switch (executive) {
      case 'CMO':
        return this.getCMOLens(solution, mockScenario);
      case 'CFO':
        return this.getCFOLens(solution, mockScenario);
      case 'CHRO':
        return this.getCHROLens(solution, mockScenario);
      case 'COO':
        return this.getCOOLens(solution, mockScenario);
      case 'CTO':
        return this.getCTOLens(solution, mockScenario);
      default:
        return {
          id: `${solution.id}-default`,
          solutionId: solution.id,
          executiveRole: executive,
          perceivedValue: 3,
          lensDescription: solution.content,
          emphasisLevel: 'medium',
          visualIndicators: {},
          distortsPerception: false,
          biasType: 'neutral',
        };
    }
  }

  /**
   * Generate CMO-specific description
   */
  private generateCMODescription(content: string): string {
    const phrases = [
      'This could impact our brand reputation',
      'Consider the PR implications',
      'How will customers perceive this?',
      'This affects our market positioning',
    ];
    return `${content} - ${phrases[Math.floor(Math.random() * phrases.length)]}`;
  }

  /**
   * Generate CFO-specific description
   */
  private generateCFODescription(content: string): string {
    const phrases = [
      "What's the ROI on this?",
      'Consider the financial impact',
      'This affects our bottom line',
      'Budget implications need review',
    ];
    return `${content} - ${phrases[Math.floor(Math.random() * phrases.length)]}`;
  }

  /**
   * Generate CHRO-specific description
   */
  private generateCHRODescription(content: string): string {
    const phrases = [
      'How does this affect our people?',
      'Consider employee morale',
      'This impacts our culture',
      'Team wellbeing is crucial here',
    ];
    return `${content} - ${phrases[Math.floor(Math.random() * phrases.length)]}`;
  }

  /**
   * Generate COO-specific description
   */
  private generateCOODescription(content: string): string {
    const phrases = [
      'How does this affect operations?',
      'Consider implementation challenges',
      'This impacts our processes',
      'Efficiency implications are key',
    ];
    return `${content} - ${phrases[Math.floor(Math.random() * phrases.length)]}`;
  }

  /**
   * Generate CTO-specific description
   */
  private generateCTODescription(content: string): string {
    const phrases = [
      "What's the technical feasibility?",
      'Consider the system implications',
      'This affects our tech stack',
      'Digital transformation opportunity',
    ];
    return `${content} - ${phrases[Math.floor(Math.random() * phrases.length)]}`;
  }

  /**
   * Calculate how well the lens matches the scenario type
   */
  public calculateLensScenarioMatch(
    executive: CSuiteRole,
    scenarioType: ScenarioType,
    businessDriver: string
  ): number {
    // Define optimal matches
    const optimalMatches: Record<string, CSuiteRole[]> = {
      // Scenario Type matches
      crisis_people: ['CHRO', 'CMO'],
      crisis_product: ['COO', 'CTO'],
      crisis_financial: ['CFO', 'COO'],
      risk_people: ['CHRO'],
      risk_product: ['CTO', 'COO'],
      risk_financial: ['CFO'],
      opportunity_market: ['CMO', 'CFO'],
      opportunity_tech: ['CTO'],
      opportunity_people: ['CHRO'],
    };

    const key = `${scenarioType}_${businessDriver}`;
    const optimal = optimalMatches[key] || [];

    if (optimal.includes(executive)) {
      return 1.5; // Optimal match
    } else if (optimal.length === 0) {
      return 1.0; // No specific optimal, neutral
    } else {
      return 0.85; // Suboptimal match
    }
  }
}

// Export singleton instance
export const lensEffectEngine = new LensEffectEngine();