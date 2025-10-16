/**
 * Executive Decision AI Content Generation Service
 *
 * Generates dynamic content for Executive Decision Maker game using Azure OpenAI:
 * - Business scenarios (Crisis, Risk, Opportunity)
 * - Perfect and imperfect solutions
 * - Executive lens effects and biases
 * - Leadership analysis and insights
 * - Career recommendations
 */

import { azureOpenAIService } from './azureOpenAIService';
import { supabase } from '../lib/supabase';
import {
  BusinessScenario,
  SolutionCard,
  LensEffect,
  CSuiteRole,
  ScenarioType,
  IndustryContext,
  SixCs,
  LeadershipInsights
} from '../types/CareerChallengeTypes';
import {
  getAgeAppropriatePrompt,
  validateContentForAge,
  getScenarioComplexity,
  getSimplified6Cs
} from './ai-prompts/rules/ExecutiveDecisionRules';

/**
 * Scenario generation request
 */
interface ScenarioGenerationRequest {
  scenarioType: ScenarioType;
  businessDriver: string;
  industryContext?: IndustryContext;
  difficultyLevel: number;
  currentEvents?: boolean;
  avoidTopics?: string[];
  gradeLevel?: string; // Specific grade (K, 1, 2, etc.)
  gradeCategory?: 'elementary' | 'middle' | 'high'; // Grade category for content rules
}

/**
 * Solution generation request
 */
interface SolutionGenerationRequest {
  scenario: BusinessScenario;
  count: number;
  perfectCount: number;
  imperfectCount: number;
  industryContext?: IndustryContext;
  gradeCategory?: 'elementary' | 'middle' | 'high';
}

/**
 * Leadership analysis request
 */
interface LeadershipAnalysisRequest {
  selectedSolutions: SolutionCard[];
  perfectSolutions: SolutionCard[];
  selectedExecutive: CSuiteRole;
  optimalExecutive: CSuiteRole;
  scenario: BusinessScenario;
  timeSpentSeconds: number;
  timeLimitSeconds: number;
}

/**
 * Generated scenario response
 */
interface GeneratedScenario {
  title: string;
  description: string;
  businessContext: string;
  stakeholders: string[];
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  potentialImpact: {
    financial: string;
    reputation: string;
    operational: string;
    people: string;
  };
  optimalExecutive: CSuiteRole;
  executiveRationale: Record<CSuiteRole, string>;
  keywords: string[];
  realWorldAnalog?: string;
}

/**
 * Generated solution response
 */
interface GeneratedSolution {
  content: string;
  isPerfect: boolean;
  rationale: string;
  sixCsAlignment: Record<string, number>;
  executiveBiases: Record<CSuiteRole, {
    perceivedValue: number;
    reasoning: string;
  }>;
  implementationTime: string;
  resourceRequirement: string;
  keywords: string[];
}

/**
 * Generated leadership analysis
 */
interface GeneratedLeadershipAnalysis {
  sixCs: SixCs;
  insights: LeadershipInsights;
  careerRecommendations: Array<{
    role: string;
    fitScore: number;
    description: string;
    requiredSkills: string[];
    developmentAreas: string[];
  }>;
  decisionPattern: string;
  leadershipStyle: string;
  realWorldComparison?: string;
}

class ExecutiveDecisionAIService {
  private static instance: ExecutiveDecisionAIService;
  private client: any;
  private scenarioCache: Map<string, GeneratedScenario> = new Map();
  private analysisCache: Map<string, GeneratedLeadershipAnalysis> = new Map();
  private apiAvailable: boolean = true;

  private constructor() {
    // Azure OpenAI is configured through azureOpenAIService
    console.log('Executive Decision AI Service initialized with Azure OpenAI');
  }

  static getInstance(): ExecutiveDecisionAIService {
    if (!ExecutiveDecisionAIService.instance) {
      ExecutiveDecisionAIService.instance = new ExecutiveDecisionAIService();
    }
    return ExecutiveDecisionAIService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  // ================================================================
  // SCENARIO GENERATION
  // ================================================================

  /**
   * Generate a business scenario
   */
  async generateScenario(request: ScenarioGenerationRequest): Promise<BusinessScenario> {
    const cacheKey = `scenario_${request.scenarioType}_${request.businessDriver}_${request.difficultyLevel}`;

    // Check cache first
    if (this.scenarioCache.has(cacheKey) && !request.currentEvents) {
      const cached = this.scenarioCache.get(cacheKey)!;
      return this.mapGeneratedToScenario(cached, request);
    }

    const prompt = this.buildScenarioPrompt(request);

    try {
      const gradeForPrompt = request.gradeCategory || request.gradeLevel;
      const ageNote = gradeForPrompt === 'elementary'
        ? `\n\nCRITICAL REQUIREMENT FOR ELEMENTARY (K-5):
           - Every sentence should be 7-10 words for easy understanding.
           - Write like this: "The store needs more customers to stay open for business."
           - Keep language simple and clear for young students.
           - FORBIDDEN: arguing, conflict, pressure, deadlines, crisis, emergency, struggle
           - Use ONLY these concepts: sharing, teamwork, helping, fairness, being kind
           - Content violating these rules will be REJECTED.`
        : gradeForPrompt ? `\n\nCRITICAL: This content is for ${gradeForPrompt} students. You MUST follow ALL age-appropriate constraints listed in the prompt, especially forbidden topics and language complexity requirements. Content that violates these rules will be rejected.`
        : '';

      const systemPrompt = `You are an expert business strategist creating realistic executive decision scenarios.
                     Create scenarios that teach real business decision-making and leadership skills.
                     Focus on ${request.scenarioType} scenarios that would genuinely challenge C-suite executives.
                     ${request.industryContext ? `CRITICAL: The scenario MUST be directly related to the ${request.industryContext.industryName} industry. Create situations specific to this company's operations, products, services, and customers.` : ''}
                     ${request.currentEvents ? 'Include references to current business trends and events.' : ''}${ageNote}`;

      const response = await azureOpenAIService.generateWithModel(
        'gpt4', // Use GPT-4 for high-quality scenario generation
        prompt,
        systemPrompt,
        {
          temperature: 0.8,
          maxTokens: 1000,
          jsonMode: true
        }
      );

      if (!response) throw new Error('No response from AI');

      const generated = JSON.parse(response) as GeneratedScenario;

      // Validate content for age-appropriateness if grade level or category is specified
      const gradeForValidation = request.gradeCategory || request.gradeLevel;
      if (gradeForValidation) {
        console.log('🔍 Validating AI-generated scenario for grade:', gradeForValidation);
        console.log('📄 Generated scenario:', generated);
        const validation = validateContentForAge(generated, gradeForValidation);
        if (!validation.valid) {
          console.error('❌ Content validation FAILED:', validation.issues);
          console.error('🔄 Using template fallback instead');
          // Use age-appropriate fallback instead of retrying
          return this.getAgeAppropriateFallbackScenario(request);
        }
        console.log('✅ Content validation PASSED');
      }

      // Cache the result
      if (!request.currentEvents) {
        this.scenarioCache.set(cacheKey, generated);
      }

      return this.mapGeneratedToScenario(generated, request);
    } catch (error) {
      console.error('Error generating scenario:', error);
      // Check if we need age-appropriate fallback
      const gradeForValidation = request.gradeCategory || request.gradeLevel;
      if (gradeForValidation) {
        return this.getAgeAppropriateFallbackScenario(request);
      }
      return this.getFallbackScenario(request);
    }
  }

  /**
   * Build prompt for scenario generation
   */
  private buildScenarioPrompt(request: ScenarioGenerationRequest): string {
    const { scenarioType, businessDriver, industryContext, difficultyLevel, gradeLevel, gradeCategory } = request;

    // Add age-appropriate constraints if grade level or category is specified
    const gradeForPrompt = gradeCategory || gradeLevel;
    const ageConstraints = gradeForPrompt ? getAgeAppropriatePrompt(gradeForPrompt) : '';

    return `Generate a ${scenarioType} scenario for a business focused on ${businessDriver}.

${ageConstraints}

${industryContext ? `
CRITICAL: This scenario MUST be SPECIFICALLY about this company and industry:
- Industry: ${industryContext.industryName}
- Company Size: ${industryContext.companySize} employees
- Company Age: ${industryContext.companyAge} years old
- Company Values: ${industryContext.companyValues?.join(', ')}

The scenario MUST directly involve this ${industryContext.industryName} company's operations, products, services, or customers.
DO NOT create generic scenarios about unrelated topics like libraries, schools, or other industries.
The ${scenarioType} must be something that would realistically happen to a company in the ${industryContext.industryName} industry.
` : ''}

Difficulty Level: ${difficultyLevel} (1=easy, 5=expert)

Generate a JSON object with:
{
  "title": "Brief, impactful title (max 60 chars)",
  "description": "Detailed scenario description (150-250 words) presenting the ${scenarioType} situation",
  "businessContext": "Additional context about market conditions, competition, or internal factors (50-100 words)",
  "stakeholders": ["List 3-5 key stakeholder groups affected"],
  "urgencyLevel": "low|medium|high|critical based on time pressure",
  "potentialImpact": {
    "financial": "Specific financial impact description",
    "reputation": "Brand and reputation impact",
    "operational": "Operational and process impact",
    "people": "Employee and culture impact"
  },
  "optimalExecutive": "CMO|CFO|CHRO|COO|CTO - who is best suited",
  "executiveRationale": {
    "CMO": "Why CMO would/wouldn't be optimal",
    "CFO": "Why CFO would/wouldn't be optimal",
    "CHRO": "Why CHRO would/wouldn't be optimal",
    "COO": "Why COO would/wouldn't be optimal",
    "CTO": "Why CTO would/wouldn't be optimal"
  },
  "keywords": ["5-7 key terms related to the scenario"],
  "realWorldAnalog": "Optional: Similar real-world business situation"
}

Make it realistic, challenging, and educational. Include specific details, metrics, and stakes.
${request.avoidTopics ? `Avoid these topics: ${request.avoidTopics.join(', ')}` : ''}`;
  }

  // ================================================================
  // SOLUTION GENERATION
  // ================================================================

  /**
   * Generate solutions for a scenario
   */
  async generateSolutions(
    request: SolutionGenerationRequest
  ): Promise<{ perfect: SolutionCard[], imperfect: SolutionCard[] }> {
    const prompt = this.buildSolutionPrompt(request);

    try {
      // Add age-appropriate guidance to system prompt
      const ageNote = request.gradeCategory === 'elementary'
        ? `\n\nCRITICAL REQUIREMENT FOR ELEMENTARY (K-5):
           - Every sentence should be 7-10 words for easy understanding.
           - Write like this: "Ask families for ideas about what they would like to see."
           - Keep language simple and clear for young students.
           - FORBIDDEN: arguing, conflict, pressure, deadlines, crisis, emergency, struggle, firing, layoffs
           - Use ONLY these concepts: sharing, teamwork, helping, fairness, being kind, working together
           - Content violating these rules will be REJECTED.`
        : request.gradeCategory ? `\n\nCRITICAL: This content is for ${request.gradeCategory} students. You MUST follow ALL age-appropriate constraints listed in the prompt, especially forbidden topics and language complexity requirements. Content that violates these rules will be rejected.`
        : '';

      const systemPrompt = `You are an expert business consultant generating solution options for executives.
                     Create a mix of excellent solutions and flawed but tempting solutions.
                     Each solution should be realistic and reflect actual business practices.
                     Perfect solutions address all stakeholder needs comprehensively.
                     Imperfect solutions may have hidden flaws, incomplete thinking, or bias.

                     CRITICAL: You MUST generate valid JSON. Ensure all strings are properly escaped.
                     Use double quotes for strings, avoid unescaped special characters.
                     Keep content concise to avoid JSON truncation.${ageNote}`;

      const response = await azureOpenAIService.generateWithModel(
        'gpt4o', // Use GPT-4o for creative solution generation
        prompt,
        systemPrompt,
        {
          temperature: 0.8, // Keep creative for good solutions
          maxTokens: 4000, // Increased to avoid JSON truncation
          jsonMode: true
        }
      );

      if (!response) throw new Error('No response from AI');

      let generated: {
        perfectSolutions: GeneratedSolution[];
        imperfectSolutions: GeneratedSolution[];
      };

      try {
        generated = JSON.parse(response);
      } catch (parseError) {
        console.error('JSON parse error for solutions:', parseError);
        console.error('Response length:', response.length);
        console.error('Response preview:', response.substring(0, 500));
        // Try to salvage or use fallback
        throw new Error('Failed to parse solution JSON');
      }

      const perfect = generated.perfectSolutions.map((sol, i) =>
        this.mapGeneratedToSolution(sol, `perfect-${i}`, true)
      );

      const imperfect = generated.imperfectSolutions.map((sol, i) =>
        this.mapGeneratedToSolution(sol, `imperfect-${i}`, false)
      );

      return { perfect, imperfect };
    } catch (error) {
      console.error('Error generating solutions:', error);
      return this.getFallbackSolutions(request);
    }
  }

  /**
   * Build prompt for solution generation
   */
  private buildSolutionPrompt(request: SolutionGenerationRequest): string {
    const { scenario, perfectCount, imperfectCount, gradeCategory } = request;

    // Add age-appropriate constraints for solutions
    let ageConstraints = '';
    let wordLimit = '30-50 words';

    if (gradeCategory === 'elementary') {
      ageConstraints = `\n\nCRITICAL AGE-APPROPRIATE REQUIREMENTS FOR ELEMENTARY (K-5):
- Every sentence in solutions should be 7-10 words for easy understanding.
- Example: "Ask families for ideas about what they would like to see."
- FORBIDDEN concepts: arguing, conflict, pressure, deadlines, crisis, emergency, struggle, firing, layoffs
- Use ONLY these concepts: sharing, teamwork, helping, fairness, being kind, working together
- Solution content should be 30-40 words TOTAL (3-5 sentences of 7-10 words each)`;
      wordLimit = '30-40 words (3-5 sentences of 7-10 words each)';
    } else if (gradeCategory === 'middle') {
      ageConstraints = `\n\nAGE-APPROPRIATE REQUIREMENTS FOR MIDDLE SCHOOL (6-8):
- Use clear, straightforward language appropriate for 11-14 year olds
- Avoid overly complex business jargon
- Focus on practical, understandable solutions
- Solutions should teach good decision-making principles`;
      wordLimit = '25-40 words';
    } else if (gradeCategory === 'high') {
      ageConstraints = `\n\nAGE-APPROPRIATE REQUIREMENTS FOR HIGH SCHOOL (9-12):
- Use appropriate business terminology to prepare for college/career
- Solutions can include strategic thinking and complex concepts
- Teach real-world business decision-making`;
      wordLimit = '30-50 words';
    }

    return `Generate ${perfectCount} perfect and ${imperfectCount} imperfect solutions for this scenario.

CRITICAL: Keep ALL text CONCISE. Solution descriptions must be under 50 words. Reasoning must be under 20 words.${ageConstraints}

Scenario: ${scenario.title}
Description: ${scenario.description}
Type: ${scenario.scenarioType}

Generate compact JSON:
{
  "perfectSolutions": [
    {
      "content": "Brief solution (${wordLimit})",
      "isPerfect": true,
      "rationale": "Brief reason (under 20 words)",
      "sixCsAlignment": {
        "character": 7-10,
        "competence": 7-10,
        "communication": 7-10,
        "compassion": 7-10,
        "commitment": 7-10,
        "confidence": 7-10
      },
      "executiveBiases": {
        "CMO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CFO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CHRO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "COO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CTO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" }
      },
      "implementationTime": "Brief timeframe",
      "resourceRequirement": "Brief resources",
      "keywords": ["3-4 terms"]
    }
    // Generate ${perfectCount} perfect solutions like this
  ],
  "imperfectSolutions": [
    {
      "content": "Flawed solution (${wordLimit})",
      "isPerfect": false,
      "rationale": "Flaw explanation (under 20 words)",
      "sixCsAlignment": {
        "character": 3-6,
        "competence": 3-6,
        "communication": 3-6,
        "compassion": 2-5,
        "commitment": 3-6,
        "confidence": 4-7
      },
      "executiveBiases": {
        "CMO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CFO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CHRO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "COO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" },
        "CTO": { "perceivedValue": 1-5, "reasoning": "Brief (under 15 words)" }
      },
      "implementationTime": "Brief timeframe",
      "resourceRequirement": "Brief resources",
      "keywords": ["3-4 terms"]
    }
    // Generate ${imperfectCount} imperfect solutions like this
  ]
}

Perfect solutions: Comprehensive, strong 6 C's alignment, long-term positive impact.
Imperfect solutions: Subtle flaws, executive biases, weaker 6 C's, tempting shortcuts.`;
  }

  // ================================================================
  // LEADERSHIP ANALYSIS
  // ================================================================

  /**
   * Analyze leadership decisions and generate insights
   */
  async analyzeLeadership(
    request: LeadershipAnalysisRequest
  ): Promise<GeneratedLeadershipAnalysis> {
    const cacheKey = `analysis_${request.selectedExecutive}_${request.selectedSolutions.length}`;

    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!;
    }

    const prompt = this.buildAnalysisPrompt(request);

    try {
      const systemPrompt = `You are an executive coach and leadership development expert.
                     Analyze business decisions and provide constructive feedback on leadership qualities.
                     Focus on the 6 C's of Leadership and provide actionable insights.
                     Be encouraging but honest about areas for improvement.`;

      const response = await azureOpenAIService.generateWithModel(
        'gpt4', // Use GPT-4 for analytical insights
        prompt,
        systemPrompt,
        {
          temperature: 0.7,
          maxTokens: 1500,
          jsonMode: true
        }
      );

      if (!response) throw new Error('No response from AI');

      const generated = JSON.parse(response) as GeneratedLeadershipAnalysis;

      this.analysisCache.set(cacheKey, generated);
      return generated;
    } catch (error) {
      console.error('Error analyzing leadership:', error);
      return this.getFallbackAnalysis(request);
    }
  }

  /**
   * Build prompt for leadership analysis
   */
  private buildAnalysisPrompt(request: LeadershipAnalysisRequest): string {
    const {
      selectedSolutions,
      perfectSolutions,
      selectedExecutive,
      optimalExecutive,
      scenario,
      timeSpentSeconds,
      timeLimitSeconds
    } = request;

    const perfectCount = selectedSolutions.filter(s => s.isPerfect).length;
    const speedRatio = (timeLimitSeconds - timeSpentSeconds) / timeLimitSeconds;

    return `Analyze this executive decision-making performance:

Scenario: ${scenario.title} (${scenario.scenarioType})
Executive Chosen: ${selectedExecutive} (Optimal was: ${optimalExecutive})
Solutions Selected: ${perfectCount} perfect out of ${selectedSolutions.length} total
Decision Speed: ${speedRatio > 0.5 ? 'Fast' : speedRatio > 0.2 ? 'Moderate' : 'Slow'} (${timeSpentSeconds}s of ${timeLimitSeconds}s)

Selected Solutions:
${selectedSolutions.map(s => `- ${s.content} (${s.isPerfect ? 'Perfect' : 'Imperfect'})`).join('\n')}

Generate a JSON object with:
{
  "sixCs": {
    "character": 1-10 based on ethical choices and integrity shown,
    "competence": 1-10 based on solution quality and business acumen,
    "communication": 1-10 based on understanding stakeholder needs,
    "compassion": 1-10 based on people-focused considerations,
    "commitment": 1-10 based on follow-through and dedication,
    "confidence": 1-10 based on decisiveness and conviction
  },
  "insights": {
    "strengths": ["2-3 specific leadership strengths demonstrated"],
    "improvements": ["2-3 specific areas for development"],
    "biasAwareness": "Comment on executive lens choice and bias recognition",
    "decisionQuality": "Analysis of solution selection pattern",
    "businessImpact": "Predicted outcome of these decisions",
    "leadershipGrowth": "Specific advice for leadership development"
  },
  "careerRecommendations": [
    {
      "role": "Specific career path that fits this leadership style",
      "fitScore": 70-95,
      "description": "Why this role fits their demonstrated skills",
      "requiredSkills": ["3-4 skills they demonstrated"],
      "developmentAreas": ["2-3 skills to develop for this role"]
    }
    // Include 2-3 career recommendations
  ],
  "decisionPattern": "Description of their decision-making style",
  "leadershipStyle": "Transformational|Collaborative|Analytical|Directive|Adaptive",
  "realWorldComparison": "Optional: Similar to leadership style of [famous business leader]"
}

Be specific, constructive, and educational. Celebrate successes while identifying growth opportunities.`;
  }

  // ================================================================
  // LENS EFFECT GENERATION
  // ================================================================

  /**
   * Generate dynamic lens effects for solutions
   */
  async generateLensEffects(
    solutions: SolutionCard[],
    executive: CSuiteRole,
    scenario: BusinessScenario
  ): Promise<LensEffect[]> {
    const effects: LensEffect[] = [];

    for (const solution of solutions) {
      const prompt = `As a ${executive}, evaluate this solution for a ${scenario.scenarioType}:

Solution: ${solution.content}
Perfect: ${solution.isPerfect}

How would a ${executive} perceive this? Consider their typical biases, priorities, and blind spots.
Provide a perceived value (1-5) and explanation of their lens effect.

Generate a JSON object with:
{
  "perceivedValue": 1-5,
  "lensDescription": "How the ${executive} interprets this solution",
  "emphasisLevel": "high|medium|low",
  "badges": ["Positive aspects they'd highlight"] or [],
  "warnings": ["Concerns they'd have"] or [],
  "distortsPerception": true/false (if their bias significantly misrepresents the solution),
  "biasType": "Type of cognitive bias at play"
}`;

      try {
        const systemPrompt = `You are simulating how different C-suite executives perceive solutions through their professional lens.`;

        const response = await azureOpenAIService.generateWithModel(
          'gpt35', // Use GPT-3.5 for quick lens effects
          prompt,
          systemPrompt,
          {
            temperature: 0.7,
            jsonMode: true
          }
        );

        if (response) {
          const generated = JSON.parse(response);
          effects.push({
            id: `${solution.id}-${executive}`,
            solutionId: solution.id,
            executiveRole: executive,
            ...generated
          } as LensEffect);
        }
      } catch (error) {
        console.error(`Error generating lens effect for ${solution.id}:`, error);
        // Use fallback lens effect
        effects.push(this.getFallbackLensEffect(solution, executive, scenario));
      }
    }

    return effects;
  }

  // ================================================================
  // MAPPING AND FALLBACK METHODS
  // ================================================================

  /**
   * Map generated scenario to BusinessScenario type
   */
  private mapGeneratedToScenario(
    generated: GeneratedScenario,
    request: ScenarioGenerationRequest
  ): BusinessScenario {
    return {
      id: `scenario-${Date.now()}`,
      title: generated.title,
      description: generated.description,
      businessDriver: request.businessDriver,
      scenarioType: request.scenarioType,
      optimalExecutive: generated.optimalExecutive,
      difficultyLevel: request.difficultyLevel,
      basePoints: 100 * request.difficultyLevel,
      timeLimitSeconds: this.getTimeLimit(request.difficultyLevel),
      industrySpecific: request.industryContext !== undefined,
      industryContext: request.industryContext,
      keywords: generated.keywords,
      executivePitches: generated.executiveRationale
    };
  }

  /**
   * Map generated solution to SolutionCard type
   */
  private mapGeneratedToSolution(
    generated: GeneratedSolution,
    id: string,
    isPerfect: boolean
  ): SolutionCard {
    return {
      id,
      content: generated.content,
      isPerfect,
      baseValue: isPerfect ? 20 : 10,
      sixCsAlignment: generated.sixCsAlignment,
      keywords: generated.keywords
    };
  }

  /**
   * Get time limit based on difficulty
   */
  private getTimeLimit(difficulty: number): number {
    const timeLimits = [90, 75, 60, 45, 30];
    return timeLimits[difficulty - 1] || 60;
  }

  /**
   * Age-appropriate fallback scenario templates
   */
  private getAgeAppropriateFallbackScenario(request: ScenarioGenerationRequest): BusinessScenario {
    const gradeCategory = request.gradeCategory || 'elementary';
    console.warn('⚠️ Using TEMPLATE fallback scenario for grade:', gradeCategory);

    const elementaryScenarios = [
      {
        title: 'The Toy Store Needs More Happy Customers',
        description: 'The toy store in town is nice. But not many kids come to visit. The owner wants more families to shop there. She needs help making the store fun and welcoming.',
        optimalExecutive: 'CMO' as CSuiteRole,
        keywords: ['customers', 'happy', 'store', 'families', 'welcoming']
      },
      {
        title: 'The Bakery Made Too Many Cookies',
        description: 'The bakery made lots of cookies today. Now they have too many. The baker wants to sell all the cookies before they get old. How can the bakery share these yummy cookies with people?',
        optimalExecutive: 'COO' as CSuiteRole,
        keywords: ['bakery', 'cookies', 'selling', 'sharing', 'planning']
      },
      {
        title: 'The Park Needs More Fun Activities',
        description: 'The community park is nice but quiet. Families want more fun things to do. The park manager wants to add activities that everyone will enjoy. What should the park add?',
        optimalExecutive: 'CHRO' as CSuiteRole,
        keywords: ['park', 'activities', 'families', 'community', 'fun']
      }
    ];

    const middleScenarios = [
      {
        title: 'New Competitor Opens with Lower Prices',
        description: 'A new store just opened across the street. They sell similar products but charge less money. Some customers are going to the new store instead. The business needs to decide how to compete while staying profitable and fair.',
        optimalExecutive: 'CFO' as CSuiteRole,
        keywords: ['competition', 'pricing', 'customers', 'strategy', 'profit']
      },
      {
        title: 'Social Media Crisis Threatens Brand',
        description: 'Customers are posting negative reviews online about a product issue. The complaints are spreading fast on social media. The company needs to respond quickly and honestly to protect its reputation while fixing the problem.',
        optimalExecutive: 'CMO' as CSuiteRole,
        keywords: ['social media', 'reputation', 'customers', 'communication', 'crisis']
      }
    ];

    const highScenarios = [
      {
        title: 'Digital Transformation vs. Traditional Methods',
        description: 'The company faces a strategic decision about modernizing operations with AI and automation. While technology promises efficiency gains, it requires significant investment and workforce retraining. Stakeholders are divided on the pace and scope of change.',
        optimalExecutive: 'CTO' as CSuiteRole,
        keywords: ['technology', 'innovation', 'strategy', 'change management', 'investment']
      },
      {
        title: 'International Expansion Opportunity',
        description: 'Market analysis shows strong demand for the company products in emerging markets. However, international expansion requires substantial capital, new supply chain partnerships, and understanding different cultural contexts. The decision involves balancing growth ambitions with operational capabilities.',
        optimalExecutive: 'COO' as CSuiteRole,
        keywords: ['expansion', 'global', 'strategy', 'risk', 'operations']
      }
    ];

    const scenarioSets = {
      elementary: elementaryScenarios,
      middle: middleScenarios,
      high: highScenarios
    };

    const scenarios = scenarioSets[gradeCategory] || elementaryScenarios;
    const selected = scenarios[Math.floor(Math.random() * scenarios.length)];

    return {
      id: `scenario-age-appropriate-${Date.now()}`,
      title: selected.title,
      description: selected.description,
      businessDriver: request.businessDriver,
      scenarioType: request.scenarioType,
      optimalExecutive: selected.optimalExecutive,
      difficultyLevel: request.difficultyLevel,
      basePoints: 100 * request.difficultyLevel,
      timeLimitSeconds: this.getTimeLimit(request.difficultyLevel),
      industrySpecific: false,
      keywords: selected.keywords,
      executivePitches: this.getAgeAppropriatePitches(gradeCategory)
    };
  }

  /**
   * Get age-appropriate executive pitches
   */
  private getAgeAppropriatePitches(gradeCategory: string): Record<CSuiteRole, string> {
    if (gradeCategory === 'elementary') {
      return {
        CMO: 'I can help tell people about this!',
        CFO: 'I can help count the money!',
        CHRO: 'I can help make everyone happy!',
        COO: 'I can help make things work better!',
        CTO: 'I can help use computers and tools!'
      };
    } else if (gradeCategory === 'middle') {
      return {
        CMO: 'I can manage our marketing and customer communication strategy.',
        CFO: 'I can analyze the financial impact and ensure profitability.',
        CHRO: 'I can focus on our team and organizational culture.',
        COO: 'I can improve our operations and processes.',
        CTO: 'I can leverage technology to solve this challenge.'
      };
    } else {
      return {
        CMO: 'Let me handle the brand positioning and stakeholder communication strategy.',
        CFO: "I'll ensure financial prudence and optimize our capital allocation.",
        CHRO: "I'll focus on organizational development and talent strategy.",
        COO: "I'll manage the operational excellence and implementation.",
        CTO: "I'll apply digital transformation and technical innovation."
      };
    }
  }

  /**
   * Fallback scenario if generation fails
   */
  private getFallbackScenario(request: ScenarioGenerationRequest): BusinessScenario {
    return {
      id: `scenario-fallback-${Date.now()}`,
      title: `${request.scenarioType} Scenario`,
      description: `A ${request.scenarioType} situation affecting ${request.businessDriver} operations.`,
      businessDriver: request.businessDriver,
      scenarioType: request.scenarioType,
      optimalExecutive: 'COO',
      difficultyLevel: request.difficultyLevel,
      basePoints: 100 * request.difficultyLevel,
      timeLimitSeconds: 60,
      industrySpecific: false,
      keywords: [request.scenarioType, request.businessDriver],
      executivePitches: {
        CMO: "Let me handle the communication aspects.",
        CFO: "I'll focus on the financial implications.",
        CHRO: "This impacts our people directly.",
        COO: "I'll ensure operational efficiency.",
        CTO: "Technology can solve this."
      }
    };
  }

  /**
   * Fallback solutions if generation fails
   */
  private getFallbackSolutions(
    request: SolutionGenerationRequest
  ): { perfect: SolutionCard[], imperfect: SolutionCard[] } {
    const perfect: SolutionCard[] = Array(request.perfectCount).fill(0).map((_, i) => ({
      id: `perfect-${i}`,
      content: `Comprehensive solution addressing all stakeholder needs.`,
      isPerfect: true,
      baseValue: 20,
      sixCsAlignment: {
        character: 8,
        competence: 8,
        communication: 8,
        compassion: 8,
        commitment: 8,
        confidence: 8
      },
      keywords: ['comprehensive', 'stakeholder', 'strategic']
    }));

    const imperfect: SolutionCard[] = Array(request.imperfectCount).fill(0).map((_, i) => ({
      id: `imperfect-${i}`,
      content: `Quick fix that addresses immediate concerns.`,
      isPerfect: false,
      baseValue: 10,
      sixCsAlignment: {
        character: 5,
        competence: 5,
        communication: 5,
        compassion: 4,
        commitment: 5,
        confidence: 6
      },
      keywords: ['quick', 'immediate', 'tactical']
    }));

    return { perfect, imperfect };
  }

  /**
   * Fallback leadership analysis
   */
  private getFallbackAnalysis(request: LeadershipAnalysisRequest): GeneratedLeadershipAnalysis {
    const perfectCount = request.selectedSolutions.filter(s => s.isPerfect).length;
    const avgScore = 5 + (perfectCount / request.selectedSolutions.length) * 3;

    return {
      sixCs: {
        character: avgScore,
        competence: avgScore,
        communication: avgScore,
        compassion: avgScore - 1,
        commitment: avgScore,
        confidence: avgScore + 1
      },
      insights: {
        strengths: ['Decision-making under pressure', 'Strategic thinking'],
        improvements: ['Consider multiple perspectives', 'Balance speed with thoroughness'],
        biasAwareness: 'Developing awareness of executive biases',
        decisionQuality: 'Shows potential for growth',
        businessImpact: 'Mixed outcomes expected',
        leadershipGrowth: 'Focus on holistic decision-making'
      },
      careerRecommendations: [
        {
          role: 'Business Analyst',
          fitScore: 75,
          description: 'Strong analytical skills demonstrated',
          requiredSkills: ['Analysis', 'Problem-solving', 'Communication'],
          developmentAreas: ['Leadership', 'Strategic vision']
        }
      ],
      decisionPattern: 'Analytical with room for growth',
      leadershipStyle: 'Developing',
      realWorldComparison: undefined
    };
  }

  /**
   * Fallback lens effect
   */
  private getFallbackLensEffect(
    solution: SolutionCard,
    executive: CSuiteRole,
    scenario: BusinessScenario
  ): LensEffect {
    return {
      id: `${solution.id}-${executive}`,
      solutionId: solution.id,
      executiveRole: executive,
      perceivedValue: 3,
      lensDescription: `${executive} perspective on this solution`,
      emphasisLevel: 'medium',
      visualIndicators: {
        badges: [],
        warnings: [],
        color: 'gray'
      },
      distortsPerception: false,
      biasType: 'neutral'
    };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.scenarioCache.clear();
    this.analysisCache.clear();
  }
}

export const executiveDecisionAIService = ExecutiveDecisionAIService.getInstance();
export type {
  ExecutiveDecisionAIService,
  ScenarioGenerationRequest,
  SolutionGenerationRequest,
  LeadershipAnalysisRequest,
  GeneratedScenario,
  GeneratedSolution,
  GeneratedLeadershipAnalysis
};