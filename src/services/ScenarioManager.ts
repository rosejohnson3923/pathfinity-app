/**
 * ScenarioManager
 *
 * Manages business scenarios, solution generation, and gameplay flow
 * for the Executive Decision Maker Career Challenge game.
 */

import {
  BusinessScenario,
  SolutionCard,
  CSuiteRole,
  ScenarioType,
  IndustryContext,
  LensEffect,
} from '../types/CareerChallengeTypes';
import { lensEffectEngine } from './LensEffectEngine';

interface ScenarioTemplate {
  type: ScenarioType;
  businessDriver: string;
  titlePattern: string;
  descriptionPattern: string;
  perfectSolutions: string[];
  imperfectSolutions: string[];
  optimalExecutive: CSuiteRole;
  keywords: string[];
}

export class ScenarioManager {
  // Content policy: Prohibited keywords that indicate inappropriate content
  private readonly prohibitedKeywords = [
    // Political
    'democrat', 'republican', 'political party', 'election', 'vote', 'campaign',
    'liberal', 'conservative', 'partisan', 'legislation', 'congressman', 'senator',

    // Religious
    'christian', 'muslim', 'jewish', 'buddhist', 'hindu', 'religious', 'faith',
    'prayer', 'worship', 'church', 'mosque', 'temple', 'synagogue',

    // Discriminatory/DEI
    'diversity', 'equity', 'inclusion', 'dei', 'affirmative action', 'quota',
    'racial', 'gender identity', 'lgbtq', 'transgender', 'sexual orientation',
    'disability', 'handicap', 'protected class', 'minority', 'underrepresented',

    // Controversial social issues
    'abortion', 'gun control', 'immigration', 'climate change politics',
    'social justice', 'activism', 'protest', 'boycott', 'cultural appropriation',
    'microaggression', 'privilege', 'systemic', 'oppression',
  ];

  private scenarioTemplates: ScenarioTemplate[] = [
    // Crisis - People scenarios
    {
      type: 'crisis',
      businessDriver: 'people',
      titlePattern: 'Employee {crisis_type} Crisis',
      descriptionPattern: 'A {crisis_type} has impacted {percentage}% of your workforce. Morale is {morale_level} and productivity has dropped {productivity_drop}%. Immediate action is required to stabilize the situation.',
      perfectSolutions: [
        'Implement immediate employee support program with counseling and flexible work arrangements',
        'Create transparent communication channels with daily leadership updates',
        'Deploy emergency response team with HR specialists and mental health professionals',
        'Establish employee assistance fund with financial support options',
        'Form crisis management committee with employee representatives',
      ],
      imperfectSolutions: [
        'Send company-wide email acknowledging the situation',
        'Offer unpaid leave to affected employees',
        'Postpone all performance reviews indefinitely',
        'Reduce workload by canceling non-essential projects',
        'Hire temporary workers to fill gaps',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['employee', 'morale', 'workforce', 'culture', 'team'],
    },
    {
      type: 'crisis',
      businessDriver: 'people',
      titlePattern: 'Mass Resignation Wave',
      descriptionPattern: '{department} department has seen {percentage}% resignation rate in the past {timeframe}. Key talent is leaving for competitors offering {incentive}. Team cohesion is breaking down.',
      perfectSolutions: [
        'Conduct immediate retention interviews with remaining staff to understand concerns',
        'Implement competitive counter-offer program with market-rate adjustments',
        'Launch career development fast-track program with clear advancement paths',
        'Create retention bonuses tied to project completion milestones',
        'Establish mentorship program pairing high-performers with senior leaders',
      ],
      imperfectSolutions: [
        'Freeze all resignations pending investigation',
        'Outsource departing roles to contractors',
        'Merge teams to consolidate remaining talent',
        'Implement non-compete agreements for all employees',
        'Increase workload for remaining staff with overtime pay',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['retention', 'talent', 'resignation', 'turnover', 'staffing'],
    },

    // Crisis - Product scenarios
    {
      type: 'crisis',
      businessDriver: 'product',
      titlePattern: 'Critical Product Failure',
      descriptionPattern: 'Your flagship product {product_name} has experienced a critical failure affecting {customer_count} customers. {failure_type} has resulted in {impact}. Customer complaints are flooding in.',
      perfectSolutions: [
        'Deploy emergency fix team with 24/7 support until resolution',
        'Implement automatic refund/credit system for affected customers',
        'Create dedicated customer communication portal with real-time updates',
        'Establish product quality task force to prevent future failures',
        'Launch comprehensive product audit and testing protocol',
      ],
      imperfectSolutions: [
        'Issue press release minimizing the impact',
        'Offer discount coupons for future purchases',
        'Blame third-party suppliers for the failure',
        'Delay response until full investigation complete',
        'Remove product from market temporarily',
      ],
      optimalExecutive: 'COO',
      keywords: ['product', 'quality', 'failure', 'customer', 'defect'],
    },
    {
      type: 'crisis',
      businessDriver: 'product',
      titlePattern: 'Supply Chain Disruption',
      descriptionPattern: 'Critical supplier {supplier_name} has ceased operations. {percentage}% of production capacity is affected. Inventory will last {days} days. Customer orders are at risk.',
      perfectSolutions: [
        'Activate alternate supplier network with expedited contracts',
        'Implement production rationing system prioritizing key customers',
        'Negotiate emergency supply agreements with competitors',
        'Establish in-house production for critical components',
        'Create customer communication plan with revised delivery timelines',
      ],
      imperfectSolutions: [
        'Cancel all pending orders immediately',
        'Increase prices to reduce demand',
        'Switch to inferior quality alternatives',
        'Delay communication until solution found',
        'Sue supplier for breach of contract',
      ],
      optimalExecutive: 'COO',
      keywords: ['supply', 'production', 'inventory', 'supplier', 'logistics'],
    },

    // Crisis - Financial scenarios
    {
      type: 'crisis',
      businessDriver: 'financial',
      titlePattern: 'Cash Flow Emergency',
      descriptionPattern: 'Revenue has dropped {percentage}% while expenses remain fixed. Cash runway is {months} months. {creditor_count} creditors are demanding immediate payment. Payroll is at risk.',
      perfectSolutions: [
        'Negotiate payment terms extension with major creditors',
        'Implement emergency cost reduction without layoffs',
        'Secure bridge financing or emergency credit line',
        'Accelerate accounts receivable collection with incentives',
        'Restructure debt with longer-term payment plans',
      ],
      imperfectSolutions: [
        'Delay all vendor payments indefinitely',
        'Implement across-the-board salary cuts',
        'Sell core assets at discount prices',
        'Take high-interest emergency loans',
        'File for bankruptcy protection',
      ],
      optimalExecutive: 'CFO',
      keywords: ['cash', 'revenue', 'expense', 'payment', 'financial'],
    },

    // Risk - People scenarios
    {
      type: 'risk',
      businessDriver: 'people',
      titlePattern: 'Union Organization Activity',
      descriptionPattern: 'Employees in {department} are showing signs of unionization. {percentage}% have signed interest cards. Management-employee relations are strained. External organizers are active.',
      perfectSolutions: [
        'Conduct listening sessions to understand employee concerns',
        'Implement proactive improvements to working conditions',
        'Establish employee advisory board with decision-making power',
        'Review and adjust compensation to market standards',
        'Create transparent grievance resolution process',
      ],
      imperfectSolutions: [
        'Hire union-busting consultants immediately',
        'Implement surveillance on organizing employees',
        'Threaten job losses if unionization proceeds',
        'Relocate operations to non-union location',
        'Offer one-time bonuses to stop organizing',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['union', 'employee', 'relations', 'organizing', 'labor'],
    },
    {
      type: 'risk',
      businessDriver: 'people',
      titlePattern: 'Skills Gap Emerging',
      descriptionPattern: 'Technology changes require new skills that {percentage}% of workforce lacks. Competitors are poaching talent with {skill_type} expertise. Training budget is limited.',
      perfectSolutions: [
        'Launch comprehensive reskilling program with career pathways',
        'Partner with educational institutions for certification programs',
        'Create internal talent marketplace for skill development',
        'Implement mentorship and knowledge transfer initiatives',
        'Establish learning and development budget increase',
      ],
      imperfectSolutions: [
        'Replace current workforce with new hires',
        'Outsource skill-dependent functions entirely',
        'Ignore gap hoping technology changes again',
        'Mandate unpaid training after hours',
        'Reduce skill requirements for positions',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['skills', 'training', 'development', 'talent', 'capability'],
    },

    // Risk - Product scenarios
    {
      type: 'risk',
      businessDriver: 'product',
      titlePattern: 'Competitor Innovation Threat',
      descriptionPattern: 'Competitor {competitor_name} announced breakthrough {innovation_type}. Market analysts predict {market_impact}% market share shift. Your product roadmap is now outdated.',
      perfectSolutions: [
        'Accelerate R&D investment in competitive response',
        'Form innovation task force with best engineers',
        'Acquire strategic technology company or patents',
        'Pivot product strategy to differentiated value proposition',
        'Partner with innovation leaders for technology access',
      ],
      imperfectSolutions: [
        'Copy competitor features directly',
        'Spread FUD about competitor product',
        'Cut prices to maintain market share',
        'Ignore threat and maintain current strategy',
        'Sue competitor for patent infringement',
      ],
      optimalExecutive: 'CTO',
      keywords: ['innovation', 'competitor', 'technology', 'product', 'market'],
    },
    {
      type: 'risk',
      businessDriver: 'product',
      titlePattern: 'Quality Standards Change',
      descriptionPattern: 'New regulations require {compliance_type} compliance by {deadline}. {percentage}% of product line is affected. Non-compliance penalties are ${penalty_amount}.',
      perfectSolutions: [
        'Create compliance task force with cross-functional team',
        'Implement quality management system upgrades',
        'Engage regulatory consultants for guidance',
        'Redesign products for compliance with innovation',
        'Establish ongoing compliance monitoring system',
      ],
      imperfectSolutions: [
        'Lobby against new regulations',
        'Find loopholes to avoid compliance',
        'Rush minimal changes without testing',
        'Withdraw products from regulated markets',
        'Continue selling until forced to stop',
      ],
      optimalExecutive: 'COO',
      keywords: ['regulation', 'compliance', 'quality', 'standards', 'requirements'],
    },

    // Risk - Financial scenarios
    {
      type: 'risk',
      businessDriver: 'financial',
      titlePattern: 'Currency Fluctuation Impact',
      descriptionPattern: 'Currency {currency_pair} has moved {percentage}% against projections. International operations showing ${amount} variance. Hedging strategies are insufficient.',
      perfectSolutions: [
        'Implement comprehensive currency hedging program',
        'Diversify supplier base across currency zones',
        'Adjust pricing strategy for currency impacts',
        'Renegotiate international contracts with currency clauses',
        'Establish natural hedges through operational adjustments',
      ],
      imperfectSolutions: [
        'Speculate on currency reversal',
        'Cancel all international operations',
        'Force customers to bear currency risk',
        'Ignore impact hoping for correction',
        'Take high-risk currency positions',
      ],
      optimalExecutive: 'CFO',
      keywords: ['currency', 'international', 'hedging', 'foreign', 'exchange'],
    },

    // Opportunity - Market scenarios
    {
      type: 'opportunity',
      businessDriver: 'market',
      titlePattern: 'Market Expansion Opening',
      descriptionPattern: '{region} market showing {growth_rate}% growth potential. Early movers gaining advantage. Investment requirement is ${investment}. Window of opportunity is {timeframe}.',
      perfectSolutions: [
        'Conduct rapid market entry feasibility study',
        'Establish local partnerships for market knowledge',
        'Create localized product/service offering',
        'Build dedicated market entry team with local expertise',
        'Implement phased expansion with risk mitigation',
      ],
      imperfectSolutions: [
        'Rush entry without market research',
        'Copy existing model without localization',
        'Acquire overpriced local competitor',
        'Wait for perfect conditions to enter',
        'Enter all segments simultaneously',
      ],
      optimalExecutive: 'CMO',
      keywords: ['market', 'expansion', 'growth', 'opportunity', 'entry'],
    },
    {
      type: 'opportunity',
      businessDriver: 'market',
      titlePattern: 'Strategic Acquisition Target',
      descriptionPattern: 'Company {target_name} is available for acquisition. Synergies estimated at ${synergy_value}. Multiple bidders interested. Due diligence window is {days} days.',
      perfectSolutions: [
        'Form due diligence team with integration planning',
        'Develop competitive bid with creative structure',
        'Identify and quantify all synergy opportunities',
        'Create day-one integration plan for success',
        'Secure financing with optimal capital structure',
      ],
      imperfectSolutions: [
        'Overbid to guarantee winning',
        'Skip detailed due diligence to move fast',
        'Assume all synergies will materialize',
        'Plan integration after acquisition closes',
        'Use all cash reserves for acquisition',
      ],
      optimalExecutive: 'CFO',
      keywords: ['acquisition', 'merger', 'synergy', 'integration', 'deal'],
    },

    // Opportunity - Technology scenarios
    {
      type: 'opportunity',
      businessDriver: 'technology',
      titlePattern: 'AI/Automation Potential',
      descriptionPattern: 'New {technology_type} technology could automate {percentage}% of {process_type}. ROI projected at {roi}%. Implementation timeline is {months} months.',
      perfectSolutions: [
        'Pilot AI implementation in controlled environment',
        'Create change management program for workforce',
        'Develop in-house AI expertise and capabilities',
        'Partner with leading AI technology providers',
        'Establish AI governance and ethics framework',
      ],
      imperfectSolutions: [
        'Automate everything immediately',
        'Replace human workers without retraining',
        'Outsource all AI to external vendors',
        'Implement AI without testing or validation',
        'Ignore employee concerns about automation',
      ],
      optimalExecutive: 'CTO',
      keywords: ['AI', 'automation', 'technology', 'digital', 'innovation'],
    },
    {
      type: 'opportunity',
      businessDriver: 'technology',
      titlePattern: 'Digital Transformation Opportunity',
      descriptionPattern: 'Digital channels showing {growth}% growth. Traditional channels declining {decline}%. Competitors investing ${amount} in digital. Customer expectations shifting rapidly.',
      perfectSolutions: [
        'Develop comprehensive digital transformation strategy',
        'Create customer-centric digital experience',
        'Build digital-first culture and capabilities',
        'Invest in modern technology infrastructure',
        'Establish digital innovation lab for experimentation',
      ],
      imperfectSolutions: [
        'Add basic website and call it digital',
        'Outsource all digital to agencies',
        'Copy competitor digital strategies',
        'Force customers to use digital only',
        'Maintain separate digital and traditional silos',
      ],
      optimalExecutive: 'CTO',
      keywords: ['digital', 'transformation', 'customer', 'platform', 'online'],
    },

    // Opportunity - People scenarios
    {
      type: 'opportunity',
      businessDriver: 'people',
      titlePattern: 'Talent Acquisition Windfall',
      descriptionPattern: 'Competitor {company} downsizing releases {number} skilled professionals. Talent includes {expertise_areas}. Hiring window is limited. Salary expectations are reasonable.',
      perfectSolutions: [
        'Launch targeted recruiting campaign immediately',
        'Create accelerated interview and onboarding process',
        'Offer competitive packages with growth opportunities',
        'Develop integration program for new talent',
        'Establish alumni network for future recruiting',
      ],
      imperfectSolutions: [
        'Hire everyone without role clarity',
        'Lowball offers to save money',
        'Skip reference checks to move faster',
        'Hire only senior people ignoring culture fit',
        'Create new roles just to acquire talent',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['talent', 'hiring', 'recruitment', 'acquisition', 'workforce'],
    },

    // Crisis - Proceeds (Allocation) scenarios
    {
      type: 'crisis',
      businessDriver: 'proceeds',
      titlePattern: 'Charitable Commitment Crisis',
      descriptionPattern: 'Major community disaster requires immediate response. Your {charity_amount}M charitable pledge is being questioned as insufficient. Social media backlash growing. Employees demanding company action.',
      perfectSolutions: [
        'Immediately increase charitable commitment with transparent breakdown of impact',
        'Establish employee donation matching program at 2:1 ratio',
        'Deploy company resources (people, products) to directly support relief',
        'Create long-term community rebuilding partnership beyond crisis',
        'Form stakeholder committee to guide ongoing charitable strategy',
      ],
      imperfectSolutions: [
        'Issue generic statement of support without new funding',
        'Make small one-time donation for PR purposes',
        'Wait for crisis to pass before responding',
        'Only donate if competitors donate more',
        'Restrict employee volunteering to off-hours only',
      ],
      optimalExecutive: 'CFO',
      keywords: ['charity', 'donation', 'community', 'social responsibility', 'giving'],
    },
    {
      type: 'crisis',
      businessDriver: 'proceeds',
      titlePattern: 'Sponsorship Scandal',
      descriptionPattern: 'Major sponsored event has become controversial due to {controversy_type}. {percentage}% of customers calling for withdrawal. Brand association at risk. Existing {contract_length} year contract in place.',
      perfectSolutions: [
        'Immediately suspend sponsorship pending values alignment review',
        'Create transparent criteria for all future sponsorship decisions',
        'Redirect sponsorship funds to community organizations that align with values',
        'Establish stakeholder advisory board for sponsorship governance',
        'Develop comprehensive brand partnership guidelines with ethics review',
      ],
      imperfectSolutions: [
        'Continue sponsorship to avoid breach of contract penalties',
        'Issue vague statement without changing sponsorship',
        'Quietly reduce sponsorship visibility without official withdrawal',
        'Blame event organizers and demand they fix issues',
        'Wait until contract ends then quietly non-renew',
      ],
      optimalExecutive: 'CMO',
      keywords: ['sponsorship', 'brand', 'controversy', 'partnership', 'values'],
    },

    // Risk - Proceeds (Allocation) scenarios
    {
      type: 'risk',
      businessDriver: 'proceeds',
      titlePattern: 'Employee Benefits Inequality',
      descriptionPattern: 'Internal audit reveals {percentage}% disparity in benefits between departments. Lower-paid workers lack key perks given to executives. Union organizing risk increasing. Media investigating.',
      perfectSolutions: [
        'Conduct comprehensive benefits equity review across all levels',
        'Implement universal baseline benefits for all employees immediately',
        'Create transparent benefits tier system with clear progression path',
        'Establish employee benefits committee with worker representation',
        'Launch benefits education program ensuring everyone understands full package',
      ],
      imperfectSolutions: [
        'Defend current system as market-competitive',
        'Make small token improvements to lowest tier',
        'Focus on executive retention while ignoring broader issues',
        'Require confidentiality agreements about benefits discussions',
        'Outsource lower-paid roles to avoid benefits obligations',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['benefits', 'perks', 'equity', 'compensation', 'fairness'],
    },
    {
      type: 'risk',
      businessDriver: 'proceeds',
      titlePattern: 'Charitable Giving Strategy Gap',
      descriptionPattern: 'Competitors are gaining reputation advantage with {competitor_amount}M+ charitable programs. Your current {your_amount}M budget seems scattered and ineffective. No measurable community impact. Stakeholders questioning commitment.',
      perfectSolutions: [
        'Develop focused charitable giving strategy aligned with core mission',
        'Create multi-year community partnership with measurable outcomes',
        'Establish employee-led charitable allocation committee',
        'Implement skills-based volunteering leveraging company expertise',
        'Launch transparent impact reporting with third-party verification',
      ],
      imperfectSolutions: [
        'Simply match competitor donation amounts without strategy',
        'Spread donations thinly across many causes for visibility',
        'Focus only on causes that provide marketing value',
        'Make donations contingent on media coverage and recognition',
        'Limit giving to CEO\'s personal preferred charities',
      ],
      optimalExecutive: 'CFO',
      keywords: ['charity', 'giving', 'community', 'impact', 'strategy'],
    },

    // Opportunity - Proceeds (Allocation) scenarios
    {
      type: 'opportunity',
      businessDriver: 'proceeds',
      titlePattern: 'Strategic Sponsorship Opening',
      descriptionPattern: 'Major {event_type} event seeking title sponsor. {audience_size}M+ audience reach. Competitors interested. Investment required: ${sponsorship_amount}M over {years} years. Perfect brand alignment opportunity.',
      perfectSolutions: [
        'Conduct comprehensive ROI analysis including brand value and community impact',
        'Structure multi-year partnership with escalating community benefit requirements',
        'Integrate employee engagement and volunteering into sponsorship package',
        'Establish clear metrics and regular reporting on sponsorship outcomes',
        'Create activation strategy that demonstrates company values through partnership',
      ],
      imperfectSolutions: [
        'Commit immediately based on audience size alone',
        'Negotiate lowest possible investment without considering impact',
        'Focus solely on logo placement and brand visibility',
        'Ignore values alignment in favor of market reach',
        'Overbid to beat competitors regardless of strategic fit',
      ],
      optimalExecutive: 'CMO',
      keywords: ['sponsorship', 'partnership', 'brand', 'community', 'investment'],
    },
    {
      type: 'opportunity',
      businessDriver: 'proceeds',
      titlePattern: 'Employee Benefits Innovation',
      descriptionPattern: 'New benefits platform could revolutionize employee experience. {percentage}% improvement in retention projected. Implementation cost ${cost}M. Competitors already adopting. Could become employer-of-choice differentiator.',
      perfectSolutions: [
        'Pilot benefits innovation with diverse employee group for feedback',
        'Create phased implementation ensuring all levels benefit equitably',
        'Establish employee advisory council for ongoing benefits optimization',
        'Integrate benefits education and financial wellness support',
        'Design benefits flexibility allowing personalization within budget framework',
      ],
      imperfectSolutions: [
        'Roll out new benefits to executives first',
        'Implement cheapest version without employee input',
        'Focus benefits on recruitment over retention of current staff',
        'Add perks while reducing core compensation',
        'Copy competitor benefits without understanding your workforce needs',
      ],
      optimalExecutive: 'CHRO',
      keywords: ['benefits', 'perks', 'innovation', 'employee experience', 'retention'],
    },
  ];

  /**
   * Validate scenario content against content policy
   */
  private validateContent(text: string): { valid: boolean; violations: string[] } {
    const violations: string[] = [];
    const lowerText = text.toLowerCase();

    for (const keyword of this.prohibitedKeywords) {
      if (lowerText.includes(keyword)) {
        violations.push(keyword);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Generate a scenario based on type and business driver
   */
  public generateScenario(
    type: ScenarioType,
    businessDriver: string,
    difficultyLevel: number = 3,
    industryContext?: IndustryContext,
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): BusinessScenario {
    // Find matching template
    const templates = this.scenarioTemplates.filter(
      t => t.type === type && t.businessDriver === businessDriver
    );

    if (templates.length === 0) {
      // Generate generic scenario if no template matches
      return this.generateGenericScenario(type, businessDriver, difficultyLevel, industryContext);
    }

    // Select random template
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Generate scenario from template
    const title = this.fillTemplate(template.titlePattern, industryContext);
    const description = this.fillTemplate(template.descriptionPattern, industryContext);

    // Validate content policy compliance
    const titleValidation = this.validateContent(title);
    const descValidation = this.validateContent(description);

    if (!titleValidation.valid || !descValidation.valid) {
      console.error('⚠️ CONTENT POLICY VIOLATION DETECTED');
      console.error('Prohibited keywords found:', [
        ...titleValidation.violations,
        ...descValidation.violations
      ]);
      console.error('Template:', template.titlePattern);
      // Fall back to generic scenario to avoid inappropriate content
      return this.generateGenericScenario(type, businessDriver, difficultyLevel, industryContext);
    }

    const scenario: BusinessScenario = {
      id: this.generateScenarioId(),
      title,
      description,
      businessDriver,
      scenarioType: type,
      optimalExecutive: template.optimalExecutive,
      difficultyLevel,
      basePoints: this.calculateBasePoints(type, difficultyLevel),
      timeLimitSeconds: this.calculateTimeLimit(difficultyLevel),
      industrySpecific: industryContext !== undefined,
      keywords: template.keywords,
      executivePitches: this.generateExecutivePitches(template, industryContext),
    };

    if (industryContext) {
      scenario.industryContext = industryContext;
    }

    // Apply age-appropriate modifications based on grade category
    if (gradeCategory) {
      this.applyAgeAppropriateModifications(scenario, gradeCategory);
    }

    return scenario;
  }

  /**
   * Apply age-appropriate modifications to scenario content
   */
  private applyAgeAppropriateModifications(
    scenario: BusinessScenario,
    gradeCategory: 'elementary' | 'middle' | 'high'
  ): void {
    if (gradeCategory === 'elementary') {
      // Elementary (K-5): Simplify to very basic concepts
      scenario.title = this.simplifyForElementary(scenario.title);
      scenario.description = this.simplifyForElementary(scenario.description);

      // Simplify keywords
      if (scenario.keywords) {
        scenario.keywords = scenario.keywords.map(k => this.simplifyKeyword(k));
      }
    } else if (gradeCategory === 'middle') {
      // Middle (6-8): Moderate simplification
      scenario.title = this.simplifyForMiddle(scenario.title);
      scenario.description = this.simplifyForMiddle(scenario.description);
    }
    // High school keeps the full business complexity
  }

  /**
   * Simplify text for elementary school students
   */
  private simplifyForElementary(text: string): string {
    // Replace complex business terms with simple concepts
    const replacements: Record<string, string> = {
      'cash flow': 'money',
      'revenue': 'money earned',
      'expenses': 'costs',
      'creditors': 'people we owe',
      'payroll': 'paying workers',
      'currency': 'money from different places',
      'hedging': 'protection',
      'acquisition': 'buying another company',
      'synergy': 'working together better',
      'compliance': 'following rules',
      'workforce': 'workers',
      'productivity': 'how much work gets done',
      'morale': 'how happy people are',
      'retention': 'keeping people',
      'resignation': 'leaving the job',
      'operations': 'daily work',
      'stakeholder': 'important person',
      'implementation': 'doing it',
      'comprehensive': 'complete',
      'strategic': 'smart plan',
      'optimization': 'making better',
      'innovation': 'new idea',
      'infrastructure': 'building blocks',
    };

    let simplified = text;
    for (const [complex, simple] of Object.entries(replacements)) {
      const regex = new RegExp(`\\b${complex}\\b`, 'gi');
      simplified = simplified.replace(regex, simple);
    }

    // Shorten long sentences
    simplified = simplified.replace(/\. [A-Z]/g, match => `! ${match.charAt(2)}`);

    return simplified;
  }

  /**
   * Simplify text for middle school students
   */
  private simplifyForMiddle(text: string): string {
    // Replace very technical terms with moderately simpler ones
    const replacements: Record<string, string> = {
      'fiscal responsibility': 'money management',
      'hedging strategies': 'protection plans',
      'synergy opportunities': 'ways to work together',
      'stakeholder communication': 'talking to important people',
      'cross-functional coordination': 'teamwork across departments',
    };

    let simplified = text;
    for (const [complex, simple] of Object.entries(replacements)) {
      const regex = new RegExp(complex, 'gi');
      simplified = simplified.replace(regex, simple);
    }

    return simplified;
  }

  /**
   * Simplify keyword for elementary students
   */
  private simplifyKeyword(keyword: string): string {
    const simpleKeywords: Record<string, string> = {
      'revenue': 'money',
      'expense': 'cost',
      'workforce': 'workers',
      'retention': 'keeping',
      'resignation': 'leaving',
      'synergy': 'teamwork',
      'compliance': 'rules',
      'innovation': 'new ideas',
    };

    return simpleKeywords[keyword.toLowerCase()] || keyword;
  }

  /**
   * Detect grade category from scenario content
   */
  private detectGradeCategory(scenario: BusinessScenario): 'elementary' | 'middle' | 'high' | undefined {
    // Check if scenario has been simplified by looking for elementary-level replacements
    const elementaryMarkers = ['money earned', 'how happy people are', 'how much work gets done', 'people we owe', 'paying workers'];
    const middleMarkers = ['money management', 'protection plans', 'talking to important people'];

    const lowerDescription = scenario.description.toLowerCase();

    // Check for elementary markers
    if (elementaryMarkers.some(marker => lowerDescription.includes(marker))) {
      return 'elementary';
    }

    // Check for middle school markers
    if (middleMarkers.some(marker => lowerDescription.includes(marker))) {
      return 'middle';
    }

    // Default to high school if no simplification detected
    return undefined;
  }

  /**
   * Generate solution cards for a scenario
   */
  public generateSolutions(
    scenario: BusinessScenario,
    count: number = 10
  ): { perfect: SolutionCard[], imperfect: SolutionCard[] } {
    // Find matching template - prioritize title matching first, then keywords
    // This handles age-appropriate scenarios where keywords have been simplified
    let template = this.scenarioTemplates.find(
      t => t.type === scenario.scenarioType &&
           t.businessDriver === scenario.businessDriver &&
           scenario.title.includes(t.titlePattern.split(' ')[0]) // Match first word of title pattern
    );

    // Fallback to keyword matching if title matching doesn't work
    if (!template) {
      template = this.scenarioTemplates.find(
        t => t.type === scenario.scenarioType &&
             t.businessDriver === scenario.businessDriver
      );
    }

    if (!template) {
      console.warn('⚠️ No matching template found for scenario, using generic solutions');
      return this.generateGenericSolutions(scenario, count);
    }

    // Detect grade category from scenario simplification
    const gradeCategory = this.detectGradeCategory(scenario);

    const perfectSolutions: SolutionCard[] = [];
    const imperfectSolutions: SolutionCard[] = [];

    // Generate perfect solutions
    for (let i = 0; i < Math.min(5, template.perfectSolutions.length); i++) {
      let content = this.customizeSolution(
        template.perfectSolutions[i],
        scenario.industryContext
      );

      // Apply age-appropriate simplification to solutions
      if (gradeCategory === 'elementary') {
        content = this.simplifyForElementary(content);
      } else if (gradeCategory === 'middle') {
        content = this.simplifyForMiddle(content);
      }

      const solutionId = `${scenario.id}-perfect-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      perfectSolutions.push({
        id: solutionId,
        content: content,
        isPerfect: true,
        baseValue: this.calculateSolutionValue(true, scenario.difficultyLevel),
        sixCsAlignment: this.generateSixCsAlignment(true),
        keywords: this.extractKeywords(content),
      });

      console.log(`✅ Generated perfect solution ${i+1}:`, {
        id: solutionId,
        preview: content.substring(0, 50) + '...',
        keywords: this.extractKeywords(content)
      });
    }

    // Generate imperfect solutions
    for (let i = 0; i < Math.min(5, template.imperfectSolutions.length); i++) {
      let content = this.customizeSolution(
        template.imperfectSolutions[i],
        scenario.industryContext
      );

      // Apply age-appropriate simplification to solutions
      if (gradeCategory === 'elementary') {
        content = this.simplifyForElementary(content);
      } else if (gradeCategory === 'middle') {
        content = this.simplifyForMiddle(content);
      }

      const solutionId = `${scenario.id}-imperfect-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      imperfectSolutions.push({
        id: solutionId,
        content: content,
        isPerfect: false,
        baseValue: this.calculateSolutionValue(false, scenario.difficultyLevel),
        sixCsAlignment: this.generateSixCsAlignment(false),
        keywords: this.extractKeywords(content),
      });

      console.log(`❌ Generated imperfect solution ${i+1}:`, {
        id: solutionId,
        preview: content.substring(0, 50) + '...',
        keywords: this.extractKeywords(content)
      });
    }

    console.log(`📊 Total solutions generated: ${perfectSolutions.length} perfect, ${imperfectSolutions.length} imperfect`);

    return { perfect: perfectSolutions, imperfect: imperfectSolutions };
  }

  /**
   * Generate lens effects for all executives
   */
  public generateLensEffects(
    solutions: SolutionCard[],
    scenario: BusinessScenario
  ): LensEffect[] {
    const executives: CSuiteRole[] = ['CMO', 'CFO', 'CHRO', 'COO', 'CTO'];
    const lensEffects: LensEffect[] = [];

    for (const solution of solutions) {
      for (const executive of executives) {
        const effect = this.generateLensEffect(solution, executive, scenario);
        lensEffects.push(effect);
      }
    }

    return lensEffects;
  }

  /**
   * Generate a specific lens effect
   */
  private generateLensEffect(
    solution: SolutionCard,
    executive: CSuiteRole,
    scenario: BusinessScenario
  ): LensEffect {
    switch (executive) {
      case 'CMO':
        return lensEffectEngine.getCMOLens(solution, scenario);
      case 'CFO':
        return lensEffectEngine.getCFOLens(solution, scenario);
      case 'CHRO':
        return lensEffectEngine.getCHROLens(solution, scenario);
      case 'COO':
        return lensEffectEngine.getCOOLens(solution, scenario);
      case 'CTO':
        return lensEffectEngine.getCTOLens(solution, scenario);
      default:
        throw new Error(`Unknown executive role: ${executive}`);
    }
  }

  /**
   * Calculate scoring for a round
   */
  public calculateRoundScore(
    selectedSolutions: SolutionCard[],
    perfectSolutions: SolutionCard[],
    selectedExecutive: CSuiteRole,
    optimalExecutive: CSuiteRole,
    timeSpentSeconds: number,
    timeLimitSeconds: number
  ): {
    baseScore: number;
    lensMultiplier: number;
    speedBonus: number;
    totalScore: number;
    perfectSelected: number;
    imperfectSelected: number;
  } {
    // Calculate base score from solutions
    let baseScore = 0;
    let perfectSelected = 0;
    let imperfectSelected = 0;

    for (const solution of selectedSolutions) {
      baseScore += solution.baseValue;
      if (solution.isPerfect) {
        perfectSelected++;
      } else {
        imperfectSelected++;
      }
    }

    // Calculate lens multiplier
    const lensMultiplier = lensEffectEngine.calculateLensMultiplier(
      selectedExecutive,
      optimalExecutive
    );

    // Calculate speed bonus
    const speedRatio = Math.max(0, 1 - (timeSpentSeconds / timeLimitSeconds));
    const speedBonus = Math.floor(speedRatio * 50); // Max 50 points for speed

    // Calculate total score
    const totalScore = Math.floor((baseScore * lensMultiplier) + speedBonus);

    return {
      baseScore,
      lensMultiplier,
      speedBonus,
      totalScore,
      perfectSelected,
      imperfectSelected,
    };
  }

  /**
   * Fill template with dynamic values
   */
  private fillTemplate(template: string, industryContext?: IndustryContext): string {
    const replacements: Record<string, string[]> = {
      '{crisis_type}': ['safety', 'health', 'morale', 'legal', 'ethical'],
      '{percentage}': ['30', '40', '50', '60', '70'],
      '{morale_level}': ['critically low', 'declining rapidly', 'unstable', 'deteriorating'],
      '{productivity_drop}': ['20', '25', '30', '35', '40'],
      '{department}': ['Engineering', 'Sales', 'Marketing', 'Operations', 'Finance'],
      '{timeframe}': ['week', 'month', 'quarter'],
      '{incentive}': ['50% higher salaries', 'equity packages', 'remote work', 'better benefits'],
      '{product_name}': industryContext?.productExamples?.[0] || 'flagship product',
      '{customer_count}': ['10,000', '50,000', '100,000', '500,000'],
      '{failure_type}': ['System outage', 'Data breach', 'Quality defect', 'Service disruption'],
      '{impact}': ['data loss', 'service downtime', 'customer injury', 'financial loss'],
      '{supplier_name}': industryContext?.supplierExamples?.[0] || 'primary supplier',
      '{days}': ['7', '14', '21', '30'],
      '{months}': ['2', '3', '4', '6'],
      '{creditor_count}': ['5', '10', '15', '20'],
      '{skill_type}': ['AI/ML', 'cloud', 'data science', 'cybersecurity', 'automation'],
      '{competitor_name}': industryContext?.competitorExamples?.[0] || 'main competitor',
      '{innovation_type}': ['product feature', 'technology platform', 'business model', 'service offering'],
      '{market_impact}': ['10', '15', '20', '25', '30'],
      '{compliance_type}': ['safety', 'environmental', 'data privacy', 'financial', 'quality'],
      '{deadline}': ['3 months', '6 months', '1 year', '18 months'],
      '{penalty_amount}': ['1M', '5M', '10M', '50M'],
      '{currency_pair}': ['USD/EUR', 'USD/GBP', 'USD/JPY', 'USD/CNY'],
      '{amount}': ['1M', '2M', '5M', '10M'],
      '{region}': ['Asian', 'European', 'Latin American', 'African', 'Middle Eastern'],
      '{growth_rate}': ['15', '20', '25', '30', '40'],
      '{investment}': ['5M', '10M', '25M', '50M', '100M'],
      '{target_name}': ['TechCorp', 'InnovateCo', 'MarketLeader', 'GrowthVenture'],
      '{synergy_value}': ['10M', '25M', '50M', '100M', '200M'],
      '{technology_type}': ['AI', 'blockchain', 'IoT', 'robotics', 'quantum'],
      '{process_type}': ['operations', 'customer service', 'data analysis', 'manufacturing'],
      '{roi}': ['200%', '300%', '400%', '500%'],
      '{growth}': ['50', '75', '100', '150', '200'],
      '{decline}': ['10', '15', '20', '25', '30'],
      '{company}': industryContext?.competitorExamples?.[1] || 'major competitor',
      '{number}': ['50', '100', '200', '500', '1000'],
      '{expertise_areas}': ['AI specialists, product managers, engineers', 'data scientists, designers, architects'],
      '{charity_amount}': ['1', '5', '10', '25'],
      '{controversy_type}': ['ethical violations', 'discriminatory practices', 'environmental damage', 'political controversy'],
      '{contract_length}': ['3', '5', '10'],
      '{competitor_amount}': ['50', '100', '250', '500'],
      '{your_amount}': ['10', '25', '50', '100'],
      '{event_type}': ['sports', 'cultural', 'educational', 'community'],
      '{audience_size}': ['5', '10', '25', '50', '100'],
      '{sponsorship_amount}': ['5', '10', '25', '50'],
      '{years}': ['3', '5'],
      '{cost}': ['2', '5', '10', '15'],
    };

    let result = template;
    for (const [placeholder, values] of Object.entries(replacements)) {
      if (result.includes(placeholder)) {
        const value = values[Math.floor(Math.random() * values.length)];
        result = result.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
      }
    }

    return result;
  }

  /**
   * Customize solution for industry context
   */
  private customizeSolution(solution: string, industryContext?: IndustryContext): string {
    if (!industryContext) return solution;

    // Add industry-specific details
    const industryPhrases: Record<string, string[]> = {
      technology: ['leverage cloud infrastructure', 'utilize AI/ML capabilities', 'implement DevOps practices'],
      healthcare: ['ensure HIPAA compliance', 'prioritize patient safety', 'coordinate with medical staff'],
      finance: ['maintain regulatory compliance', 'protect customer assets', 'ensure transaction integrity'],
      retail: ['optimize inventory management', 'enhance customer experience', 'streamline supply chain'],
      manufacturing: ['improve production efficiency', 'ensure quality control', 'optimize resource utilization'],
    };

    const phrases = industryPhrases[industryContext.industryName.toLowerCase()] || [];
    if (phrases.length > 0 && Math.random() > 0.5) {
      const phrase = phrases[Math.floor(Math.random() * phrases.length)];
      return `${solution} and ${phrase}`;
    }

    return solution;
  }

  /**
   * Generate executive pitches for a scenario
   */
  private generateExecutivePitches(
    template: ScenarioTemplate,
    industryContext?: IndustryContext
  ): Record<CSuiteRole, string> {
    const pitches: Record<CSuiteRole, string> = {
      CMO: `This is a brand reputation issue. Let me handle the messaging and stakeholder communication to protect our market position.`,
      CFO: `I'll focus on the financial implications and ensure we maintain fiscal responsibility while addressing this ${template.type}.`,
      CHRO: `This directly impacts our people. I'll ensure we handle this with empathy while maintaining organizational stability.`,
      COO: `I'll streamline our operations to address this efficiently and ensure minimal disruption to our core business.`,
      CTO: `Technology can provide innovative solutions here. Let me leverage our technical capabilities to address this ${template.type}.`,
    };

    return pitches;
  }

  /**
   * Generate generic scenario when no template matches
   */
  private generateGenericScenario(
    type: ScenarioType,
    businessDriver: string,
    difficultyLevel: number,
    industryContext?: IndustryContext
  ): BusinessScenario {
    const titles: Record<string, string> = {
      crisis: `Critical ${businessDriver} Crisis`,
      risk: `Emerging ${businessDriver} Risk`,
      opportunity: `Strategic ${businessDriver} Opportunity`,
    };

    const descriptions: Record<string, string> = {
      crisis: `A critical situation has emerged affecting your ${businessDriver} operations. Immediate action is required to prevent escalation.`,
      risk: `A potential risk has been identified in your ${businessDriver} area. Proactive measures are needed to mitigate impact.`,
      opportunity: `A significant opportunity has appeared in the ${businessDriver} domain. Quick action could provide competitive advantage.`,
    };

    return {
      id: this.generateScenarioId(),
      title: titles[type],
      description: descriptions[type],
      businessDriver,
      scenarioType: type,
      optimalExecutive: this.determineOptimalExecutive(businessDriver),
      difficultyLevel,
      basePoints: this.calculateBasePoints(type, difficultyLevel),
      timeLimitSeconds: this.calculateTimeLimit(difficultyLevel),
      industrySpecific: false,
      industryContext,
      executivePitches: this.generateDefaultPitches(),
    };
  }

  /**
   * Generate generic solutions when no template matches
   */
  private generateGenericSolutions(
    scenario: BusinessScenario,
    count: number
  ): { perfect: SolutionCard[], imperfect: SolutionCard[] } {
    const perfect: SolutionCard[] = [];
    const imperfect: SolutionCard[] = [];

    // Generate 5 perfect solutions
    for (let i = 0; i < 5; i++) {
      perfect.push({
        id: `solution-perfect-${i}`,
        content: `Strategic solution addressing the ${scenario.businessDriver} ${scenario.scenarioType} with comprehensive approach`,
        isPerfect: true,
        baseValue: 20,
        sixCsAlignment: this.generateSixCsAlignment(true),
        keywords: [scenario.businessDriver, 'strategic', 'comprehensive'],
      });
    }

    // Generate 5 imperfect solutions
    for (let i = 0; i < 5; i++) {
      imperfect.push({
        id: `solution-imperfect-${i}`,
        content: `Quick fix for ${scenario.businessDriver} ${scenario.scenarioType} with limited scope`,
        isPerfect: false,
        baseValue: 10,
        sixCsAlignment: this.generateSixCsAlignment(false),
        keywords: [scenario.businessDriver, 'quick', 'limited'],
      });
    }

    return { perfect, imperfect };
  }

  /**
   * Generate default executive pitches
   */
  private generateDefaultPitches(): Record<CSuiteRole, string> {
    return {
      CMO: 'Let me handle this from a marketing and brand perspective.',
      CFO: "I'll ensure financial prudence in our response.",
      CHRO: "I'll focus on the human element of this situation.",
      COO: "I'll manage the operational aspects efficiently.",
      CTO: "I'll apply technology solutions to address this.",
    };
  }

  /**
   * Determine optimal executive based on business driver
   */
  private determineOptimalExecutive(businessDriver: string): CSuiteRole {
    const mapping: Record<string, CSuiteRole> = {
      people: 'CHRO',
      product: 'COO',
      pricing: 'CFO',
      process: 'COO',
      proceeds: 'CFO',
      profits: 'CFO',
      market: 'CMO',
      technology: 'CTO',
      financial: 'CFO',
    };

    return mapping[businessDriver] || 'COO';
  }

  /**
   * Calculate base points for a scenario
   */
  private calculateBasePoints(type: ScenarioType, difficulty: number): number {
    const baseValues: Record<ScenarioType, number> = {
      crisis: 150,
      risk: 100,
      opportunity: 125,
    };

    return baseValues[type] * difficulty;
  }

  /**
   * Calculate time limit based on difficulty
   */
  private calculateTimeLimit(difficulty: number): number {
    const baseTimes = [90, 75, 60, 45, 30]; // Seconds for difficulty 1-5
    return baseTimes[difficulty - 1] || 60;
  }

  /**
   * Calculate solution value based on perfection and difficulty
   */
  private calculateSolutionValue(isPerfect: boolean, difficulty: number): number {
    const base = isPerfect ? 20 : 10;
    return base * (1 + (difficulty - 3) * 0.2); // Adjust by difficulty
  }

  /**
   * Generate 6 C's alignment for a solution
   */
  private generateSixCsAlignment(isPerfect: boolean): Record<string, number> {
    if (isPerfect) {
      return {
        character: Math.floor(Math.random() * 3) + 8, // 8-10
        competence: Math.floor(Math.random() * 3) + 8,
        communication: Math.floor(Math.random() * 3) + 7,
        compassion: Math.floor(Math.random() * 3) + 7,
        commitment: Math.floor(Math.random() * 3) + 8,
        confidence: Math.floor(Math.random() * 3) + 7,
      };
    } else {
      return {
        character: Math.floor(Math.random() * 3) + 3, // 3-5
        competence: Math.floor(Math.random() * 3) + 4,
        communication: Math.floor(Math.random() * 3) + 3,
        compassion: Math.floor(Math.random() * 3) + 2,
        commitment: Math.floor(Math.random() * 3) + 4,
        confidence: Math.floor(Math.random() * 3) + 5,
      };
    }
  }

  /**
   * Extract keywords from solution content
   */
  private extractKeywords(content: string): string[] {
    const commonWords = new Set(['the', 'and', 'or', 'but', 'with', 'for', 'to', 'from', 'of', 'in', 'on', 'at', 'by', 'all']);
    const words = content.toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 5);
    return [...new Set(words)];
  }

  /**
   * Generate unique scenario ID
   */
  private generateScenarioId(): string {
    return `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get random scenario for quick play
   */
  public getRandomScenario(
    difficultyLevel: number = 3,
    industryContext?: IndustryContext,
    gradeCategory?: 'elementary' | 'middle' | 'high'
  ): BusinessScenario {
    const types: ScenarioType[] = ['crisis', 'risk', 'opportunity'];
    const drivers = ['people', 'product', 'financial', 'market', 'technology', 'proceeds'];

    const type = types[Math.floor(Math.random() * types.length)];
    const driver = drivers[Math.floor(Math.random() * drivers.length)];

    return this.generateScenario(type, driver, difficultyLevel, industryContext, gradeCategory);
  }

  /**
   * Validate solution selection
   */
  public validateSolutionSelection(
    selectedSolutions: SolutionCard[],
    requiredCount: number = 5
  ): { valid: boolean; message?: string } {
    if (selectedSolutions.length !== requiredCount) {
      return {
        valid: false,
        message: `You must select exactly ${requiredCount} solutions (selected: ${selectedSolutions.length})`,
      };
    }

    const uniqueIds = new Set(selectedSolutions.map(s => s.id));
    if (uniqueIds.size !== selectedSolutions.length) {
      return {
        valid: false,
        message: 'Duplicate solutions selected',
      };
    }

    return { valid: true };
  }
}

// Export singleton instance
export const scenarioManager = new ScenarioManager();