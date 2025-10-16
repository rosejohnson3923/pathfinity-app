/**
 * Career Challenge AI Content Generation Service
 *
 * Generates dynamic content for Career Challenge using OpenAI:
 * - Industry-specific challenges
 * - Role card descriptions and abilities
 * - Synergy explanations
 * - Educational content
 *
 * Includes caching, moderation, and quality control
 */

import OpenAI from 'openai';
import { supabase } from '../lib/supabase';
import type {
  Industry,
  Challenge,
  RoleCard,
  Synergy
} from '../types/CareerChallengeTypes';

/**
 * Content generation request types
 */
interface ChallengeGenerationRequest {
  industry: Industry;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  existingChallenges?: string[]; // To avoid duplicates
  realWorldContext?: boolean;
}

interface RoleCardGenerationRequest {
  industry: Industry;
  roleType: 'management' | 'technical' | 'creative' | 'support' | 'specialist';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  existingRoles?: string[]; // To avoid duplicates
}

interface SynergyGenerationRequest {
  industry: Industry;
  roles: RoleCard[];
  synergyType: 'pair' | 'trio' | 'team';
}

/**
 * Generated content interfaces
 */
interface GeneratedChallenge {
  title: string;
  scenarioText: string;
  category: string;
  requiredRoles: string[];
  recommendedRoles: string[];
  realWorldExample: string;
  learningOutcomes: string[];
  difficultyJustification: string;
}

interface GeneratedRoleCard {
  roleName: string;
  roleTitle: string;
  description: string;
  backstory: string;
  flavorText: string;
  keySkills: string[];
  educationRequirements: string[];
  salaryRange: string;
  categoryBonuses: Record<string, number>;
  specialAbilityName?: string;
  specialAbilityEffect?: string;
}

interface GeneratedSynergy {
  synergyName: string;
  description: string;
  explanation: string;
  realWorldExample: string;
  powerBonus: number;
  categoryBonuses?: Record<string, number>;
}

/**
 * Content moderation result
 */
interface ModerationResult {
  approved: boolean;
  issues: string[];
  suggestions?: string[];
}

class CareerChallengeAIService {
  private static instance: CareerChallengeAIService;
  private openai: OpenAI;
  private client: any;
  private contentCache: Map<string, any> = new Map();
  private moderationCache: Map<string, ModerationResult> = new Map();

  private constructor() {
    // Initialize OpenAI - you'll need to add your API key
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  static getInstance(): CareerChallengeAIService {
    if (!CareerChallengeAIService.instance) {
      CareerChallengeAIService.instance = new CareerChallengeAIService();
    }
    return CareerChallengeAIService.instance;
  }

  async initialize() {
    this.client = await supabase();
  }

  // ================================================================
  // CHALLENGE GENERATION
  // ================================================================

  /**
   * Generate a new challenge for an industry
   */
  async generateChallenge(request: ChallengeGenerationRequest): Promise<GeneratedChallenge> {
    const cacheKey = `challenge_${request.industry.code}_${request.category}_${request.difficulty}`;

    // Check cache first
    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    const prompt = this.buildChallengePrompt(request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are an expert game designer creating educational career challenges for students.
                     Create engaging, realistic scenarios that teach real industry skills and decision-making.
                     The content should be appropriate for ${request.difficulty} difficulty and educational.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');

      const generated = JSON.parse(response) as GeneratedChallenge;

      // Validate and moderate
      const moderation = await this.moderateContent(generated.scenarioText);
      if (!moderation.approved) {
        throw new Error(`Content moderation failed: ${moderation.issues.join(', ')}`);
      }

      // Cache the result
      this.contentCache.set(cacheKey, generated);

      return generated;
    } catch (error) {
      console.error('Error generating challenge:', error);
      // Return a fallback challenge
      return this.getFallbackChallenge(request);
    }
  }

  /**
   * Build prompt for challenge generation
   */
  private buildChallengePrompt(request: ChallengeGenerationRequest): string {
    const { industry, category, difficulty } = request;

    return `Generate a Career Challenge for the ${industry.name} industry.

Industry Context:
- Name: ${industry.name}
- Description: ${industry.description}
- Categories: ${industry.challengeCategories.join(', ')}

Requirements:
- Category: ${category}
- Difficulty: ${difficulty}
- Target audience: Students learning about careers
- Should teach real industry skills

${request.existingChallenges ? `Avoid these existing challenges: ${request.existingChallenges.join(', ')}` : ''}

Generate a JSON object with:
{
  "title": "Brief, catchy title (max 50 chars)",
  "scenarioText": "Detailed scenario description (100-200 words) that presents a realistic industry challenge",
  "category": "${category}",
  "requiredRoles": ["1-2 role types that MUST be used"],
  "recommendedRoles": ["2-3 additional role types that would help"],
  "realWorldExample": "A real company or situation where this happened",
  "learningOutcomes": ["3-4 skills or concepts students will learn"],
  "difficultyJustification": "Why this is ${difficulty} difficulty"
}

Make it engaging, educational, and realistic. Include specific details and stakes.`;
  }

  // ================================================================
  // ROLE CARD GENERATION
  // ================================================================

  /**
   * Generate a new role card for an industry
   */
  async generateRoleCard(request: RoleCardGenerationRequest): Promise<GeneratedRoleCard> {
    const cacheKey = `role_${request.industry.code}_${request.roleType}_${request.rarity}`;

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    const prompt = this.buildRoleCardPrompt(request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are creating role cards for an educational career game.
                     Each role should represent a real career in the ${request.industry.name} industry.
                     Make them inspiring and informative for students.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');

      const generated = JSON.parse(response) as GeneratedRoleCard;

      // Adjust power levels based on rarity
      generated.categoryBonuses = this.adjustBonusesForRarity(
        generated.categoryBonuses,
        request.rarity
      );

      // Validate and moderate
      const moderation = await this.moderateContent(
        `${generated.description} ${generated.backstory}`
      );
      if (!moderation.approved) {
        throw new Error(`Content moderation failed: ${moderation.issues.join(', ')}`);
      }

      this.contentCache.set(cacheKey, generated);
      return generated;
    } catch (error) {
      console.error('Error generating role card:', error);
      return this.getFallbackRoleCard(request);
    }
  }

  /**
   * Build prompt for role card generation
   */
  private buildRoleCardPrompt(request: RoleCardGenerationRequest): string {
    const { industry, roleType, rarity } = request;

    const powerLevel = {
      common: '3-5',
      uncommon: '4-6',
      rare: '5-7',
      epic: '6-8',
      legendary: '7-10'
    }[rarity];

    return `Generate a ${rarity} rarity ${roleType} role card for the ${industry.name} industry.

Context:
- Industry: ${industry.name}
- Role Type: ${roleType}
- Rarity: ${rarity} (Power level: ${powerLevel})
- Categories: ${industry.challengeCategories.join(', ')}

${request.existingRoles ? `Avoid these existing roles: ${request.existingRoles.join(', ')}` : ''}

Generate a JSON object with:
{
  "roleName": "Professional title (e.g., 'Data Analyst', 'Project Manager')",
  "roleTitle": "Descriptive subtitle (e.g., 'Strategic Planning Expert')",
  "description": "What this role does in the industry (50-100 words)",
  "backstory": "Brief character background that students can relate to (50-75 words)",
  "flavorText": "Inspirational quote or motto for this role",
  "keySkills": ["3-5 essential skills for this career"],
  "educationRequirements": ["Typical education path"],
  "salaryRange": "Realistic salary range (e.g., '$45,000 - $75,000')",
  "categoryBonuses": {
    // Assign bonuses to 2-3 categories, higher for ${rarity} rarity
    // Total bonuses should sum to approximately ${powerLevel} range
  },
  ${rarity === 'epic' || rarity === 'legendary' ? `
  "specialAbilityName": "Unique ability name",
  "specialAbilityEffect": "What the special ability does",` : ''}
}

Make it realistic, inspiring, and educational. Show career possibilities!`;
  }

  // ================================================================
  // SYNERGY GENERATION
  // ================================================================

  /**
   * Generate synergies between role cards
   */
  async generateSynergy(request: SynergyGenerationRequest): Promise<GeneratedSynergy> {
    const roleNames = request.roles.map(r => r.roleName).sort().join('_');
    const cacheKey = `synergy_${request.industry.code}_${roleNames}`;

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey);
    }

    const prompt = this.buildSynergyPrompt(request);

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          {
            role: "system",
            content: `You are creating synergies between career roles to teach teamwork and collaboration.
                     Explain why certain roles work well together in real industry settings.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      });

      const response = completion.choices[0].message.content;
      if (!response) throw new Error('No response from AI');

      const generated = JSON.parse(response) as GeneratedSynergy;

      this.contentCache.set(cacheKey, generated);
      return generated;
    } catch (error) {
      console.error('Error generating synergy:', error);
      return this.getFallbackSynergy(request);
    }
  }

  /**
   * Build prompt for synergy generation
   */
  private buildSynergyPrompt(request: SynergyGenerationRequest): string {
    const { industry, roles, synergyType } = request;
    const roleDescriptions = roles.map(r => `${r.roleName}: ${r.description}`).join('\n');

    const bonusRange = {
      pair: '10-20',
      trio: '20-30',
      team: '30-50'
    }[synergyType];

    return `Generate a synergy between these roles in the ${industry.name} industry:

${roleDescriptions}

Synergy Type: ${synergyType}
Expected Bonus Range: ${bonusRange} power points

Generate a JSON object with:
{
  "synergyName": "Catchy synergy name (e.g., 'Dynamic Duo', 'Power Trio')",
  "description": "Brief description of the synergy (30-50 words)",
  "explanation": "Why these roles work well together (50-100 words)",
  "realWorldExample": "Example of this collaboration in real companies",
  "powerBonus": ${bonusRange.split('-')[0]}, // Number in the ${bonusRange} range
  "categoryBonuses": {
    // Optional: Additional bonuses for 1-2 categories
  }
}

Focus on teaching real teamwork concepts and industry collaboration patterns.`;
  }

  // ================================================================
  // CONTENT MODERATION
  // ================================================================

  /**
   * Moderate generated content for appropriateness
   */
  async moderateContent(content: string): Promise<ModerationResult> {
    const cacheKey = `mod_${content.substring(0, 50)}`;

    if (this.moderationCache.has(cacheKey)) {
      return this.moderationCache.get(cacheKey);
    }

    try {
      const moderation = await this.openai.moderations.create({
        input: content,
      });

      const results = moderation.results[0];
      const issues: string[] = [];

      // Check for any flagged categories
      if (results.flagged) {
        for (const [category, flagged] of Object.entries(results.categories)) {
          if (flagged) {
            issues.push(category);
          }
        }
      }

      // Additional educational content checks
      const educationalIssues = this.checkEducationalAppropriateness(content);
      issues.push(...educationalIssues);

      const result: ModerationResult = {
        approved: issues.length === 0,
        issues,
        suggestions: issues.length > 0 ? this.getModerationSuggestions(issues) : undefined
      };

      this.moderationCache.set(cacheKey, result);
      return result;
    } catch (error) {
      console.error('Moderation error:', error);
      // Default to approved with warning
      return {
        approved: true,
        issues: ['Moderation service unavailable - manual review recommended']
      };
    }
  }

  /**
   * Check for educational appropriateness
   */
  private checkEducationalAppropriateness(content: string): string[] {
    const issues: string[] = [];
    const lowerContent = content.toLowerCase();

    // Check for inappropriate language for educational context
    const inappropriateTerms = [
      'kill', 'death', 'suicide', 'drug', 'alcohol', 'weapon',
      'gambling', 'violence', 'hate', 'discrimination'
    ];

    for (const term of inappropriateTerms) {
      if (lowerContent.includes(term)) {
        issues.push(`Contains potentially inappropriate term: ${term}`);
      }
    }

    // Check for overly complex language
    const averageWordLength = content.split(' ')
      .reduce((sum, word) => sum + word.length, 0) / content.split(' ').length;

    if (averageWordLength > 8) {
      issues.push('Language may be too complex for target audience');
    }

    return issues;
  }

  /**
   * Get suggestions for fixing moderation issues
   */
  private getModerationSuggestions(issues: string[]): string[] {
    const suggestions: string[] = [];

    for (const issue of issues) {
      if (issue.includes('violence')) {
        suggestions.push('Reframe conflict as professional challenges or competition');
      }
      if (issue.includes('inappropriate term')) {
        suggestions.push('Use professional, educational language');
      }
      if (issue.includes('complex')) {
        suggestions.push('Simplify language for student audience');
      }
    }

    return suggestions;
  }

  // ================================================================
  // BULK GENERATION
  // ================================================================

  /**
   * Generate complete content set for a new industry
   */
  async generateIndustryContent(
    industryCode: string,
    industryName: string,
    industryDescription: string,
    categories: string[]
  ): Promise<{
    challenges: GeneratedChallenge[];
    roleCards: GeneratedRoleCard[];
    synergies: GeneratedSynergy[];
  }> {
    if (!this.client) await this.initialize();

    const industry: Industry = {
      id: '', // Will be set when saved
      code: industryCode,
      name: industryName,
      description: industryDescription,
      challengeCategories: categories,
      difficultyLevels: ['easy', 'medium', 'hard'],
      gradeLevelMin: 'middle',
      gradeLevelMax: 'high',
      isActive: true,
      isPremium: false,
      timesPlayed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const challenges: GeneratedChallenge[] = [];
    const roleCards: GeneratedRoleCard[] = [];
    const synergies: GeneratedSynergy[] = [];

    // Generate 3 challenges per category
    for (const category of categories.slice(0, 3)) {
      for (const difficulty of ['easy', 'medium', 'hard'] as const) {
        const challenge = await this.generateChallenge({
          industry,
          category,
          difficulty,
          existingChallenges: challenges.map(c => c.title),
          realWorldContext: true
        });
        challenges.push(challenge);

        // Rate limit to avoid API throttling
        await this.delay(1000);
      }
    }

    // Generate role cards (2 per rarity level)
    const roleTypes = ['management', 'technical', 'creative', 'support', 'specialist'] as const;
    const rarities = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;

    for (const rarity of rarities) {
      for (let i = 0; i < 2; i++) {
        const roleType = roleTypes[i % roleTypes.length];
        const roleCard = await this.generateRoleCard({
          industry,
          roleType,
          rarity,
          existingRoles: roleCards.map(r => r.roleName)
        });
        roleCards.push(roleCard);

        await this.delay(1000);
      }
    }

    // Generate synergies for role pairs
    // Create 5 synergies from different role combinations
    for (let i = 0; i < Math.min(5, roleCards.length - 1); i++) {
      const roles = [
        this.mapGeneratedToRoleCard(roleCards[i], industry.id),
        this.mapGeneratedToRoleCard(roleCards[i + 1], industry.id)
      ];

      const synergy = await this.generateSynergy({
        industry,
        roles,
        synergyType: 'pair'
      });
      synergies.push(synergy);

      await this.delay(1000);
    }

    // Save to cache for future use
    await this.cacheIndustryContent(industryCode, {
      challenges,
      roleCards,
      synergies
    });

    return {
      challenges,
      roleCards,
      synergies
    };
  }

  // ================================================================
  // UTILITY METHODS
  // ================================================================

  /**
   * Adjust category bonuses based on rarity
   */
  private adjustBonusesForRarity(
    bonuses: Record<string, number>,
    rarity: string
  ): Record<string, number> {
    const multiplier = {
      common: 0.7,
      uncommon: 0.85,
      rare: 1.0,
      epic: 1.2,
      legendary: 1.5,
      mythic: 2.0
    }[rarity] || 1.0;

    const adjusted: Record<string, number> = {};
    for (const [category, value] of Object.entries(bonuses)) {
      adjusted[category] = Math.round(value * multiplier);
    }
    return adjusted;
  }

  /**
   * Get fallback challenge if generation fails
   */
  private getFallbackChallenge(request: ChallengeGenerationRequest): GeneratedChallenge {
    return {
      title: `${request.category} Challenge`,
      scenarioText: `A ${request.difficulty} challenge in ${request.category} for the ${request.industry.name} industry.
                    You must use your team's skills to overcome obstacles and achieve success.`,
      category: request.category,
      requiredRoles: ['manager'],
      recommendedRoles: ['specialist', 'analyst'],
      realWorldExample: 'Common industry scenario',
      learningOutcomes: [
        'Problem-solving skills',
        'Team collaboration',
        'Industry knowledge'
      ],
      difficultyJustification: `This is ${request.difficulty} difficulty based on complexity and requirements.`
    };
  }

  /**
   * Get fallback role card if generation fails
   */
  private getFallbackRoleCard(request: RoleCardGenerationRequest): GeneratedRoleCard {
    const basePower = {
      common: 4,
      uncommon: 5,
      rare: 6,
      epic: 7,
      legendary: 8
    }[request.rarity] || 5;

    return {
      roleName: `${request.roleType} Specialist`,
      roleTitle: `${request.industry.name} Professional`,
      description: `A skilled ${request.roleType} professional in the ${request.industry.name} industry.`,
      backstory: 'Started their career with passion and dedication, working their way up through experience.',
      flavorText: 'Excellence through dedication',
      keySkills: ['Communication', 'Problem-solving', 'Leadership'],
      educationRequirements: ['Bachelor\'s degree or equivalent experience'],
      salaryRange: '$50,000 - $90,000',
      categoryBonuses: {
        [request.industry.challengeCategories[0]]: basePower
      }
    };
  }

  /**
   * Get fallback synergy if generation fails
   */
  private getFallbackSynergy(request: SynergyGenerationRequest): GeneratedSynergy {
    const roleNames = request.roles.map(r => r.roleName).join(' & ');
    return {
      synergyName: 'Team Collaboration',
      description: `${roleNames} work together effectively.`,
      explanation: 'These roles complement each other\'s skills and create a stronger team.',
      realWorldExample: 'Commonly seen in successful organizations',
      powerBonus: request.synergyType === 'pair' ? 15 : request.synergyType === 'trio' ? 25 : 35,
      categoryBonuses: {}
    };
  }

  /**
   * Map generated role card to RoleCard type
   */
  private mapGeneratedToRoleCard(generated: GeneratedRoleCard, industryId: string): RoleCard {
    return {
      id: `temp_${Date.now()}`,
      industryId,
      roleCode: generated.roleName.toLowerCase().replace(/\s+/g, '_'),
      roleName: generated.roleName,
      roleTitle: generated.roleTitle,
      rarity: 'common',
      basePower: 5,
      categoryBonuses: generated.categoryBonuses,
      description: generated.description,
      flavorText: generated.flavorText,
      backstory: generated.backstory,
      keySkills: generated.keySkills,
      educationRequirements: generated.educationRequirements,
      salaryRange: generated.salaryRange,
      isActive: true,
      isCollectible: true,
      totalCopiesDistributed: 0,
      timesPlayed: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Cache industry content for reuse
   */
  private async cacheIndustryContent(
    industryCode: string,
    content: any
  ): Promise<void> {
    if (!this.client) await this.initialize();

    try {
      await this.client
        .from('cc_ai_content_cache')
        .upsert({
          industry_code: industryCode,
          content_type: 'full_industry',
          content_data: content,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error caching industry content:', error);
    }
  }

  /**
   * Delay helper for rate limiting
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear content cache
   */
  clearCache(): void {
    this.contentCache.clear();
    this.moderationCache.clear();
  }
}

export const careerChallengeAIService = CareerChallengeAIService.getInstance();
export type {
  CareerChallengeAIService,
  ChallengeGenerationRequest,
  RoleCardGenerationRequest,
  SynergyGenerationRequest,
  GeneratedChallenge,
  GeneratedRoleCard,
  GeneratedSynergy,
  ModerationResult
};