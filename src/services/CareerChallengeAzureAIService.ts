/**
 * Career Challenge Azure AI Service
 * Integrates with Azure Key Vault (pathfinity-kv-2823) for AI content generation
 */

import { createClient } from '@supabase/supabase-js';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';

// Types for AI generation
export interface ChallengeGenerationRequest {
  industry: string;
  industryName: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  category: string;
  theme?: string;
  educationalFocus?: string;
}

export interface RoleCardGenerationRequest {
  industry: string;
  industryName: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic';
  powerRange: { min: number; max: number };
  existingRoles?: string[]; // To avoid duplicates
}

export interface SynergyGenerationRequest {
  industry: string;
  industryName: string;
  roleCards: string[];
  synergyType: 'additive' | 'multiplicative' | 'special' | 'conditional';
}

export interface GeneratedChallenge {
  title: string;
  scenarioText: string;
  category: string;
  difficulty: string;
  minRolesRequired: number;
  maxRolesAllowed: number;
  baseDifficultyScore: number;
  perfectScore: number;
  failureThreshold: number;
  skillConnections: string[];
  learningOutcomes: string[];
  realWorldExample: string;
}

export interface GeneratedRoleCard {
  roleName: string;
  roleTitle: string;
  description: string;
  rarity: string;
  basePower: number;
  categoryBonuses: Record<string, number>;
  specialAbilities?: Array<{
    name: string;
    effect: string;
    powerModifier?: number;
  }>;
  flavorText: string;
  backstory: string;
  keySkills: string[];
  educationRequirements: string[];
  salaryRange: string;
}

export interface GeneratedSynergy {
  synergyName: string;
  description: string;
  explanation: string;
  powerBonus: number;
  powerMultiplier: number;
  requiredRoles: string[];
  realWorldExample: string;
}

export class CareerChallengeAzureAIService {
  private supabase: any;
  private secretClient: SecretClient;
  private azureEndpoint: string = '';
  private azureApiKey: string = '';
  private deploymentName: string = 'gpt-4';
  private initialized: boolean = false;

  constructor(supabase: any) {
    this.supabase = supabase;

    // Initialize Azure Key Vault client
    const vaultName = 'pathfinity-kv-2823';
    const vaultUrl = `https://${vaultName}.vault.azure.net`;

    const credential = new DefaultAzureCredential();
    this.secretClient = new SecretClient(vaultUrl, credential);
  }

  /**
   * Initialize the service by fetching secrets from Azure Key Vault
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // Fetch Azure OpenAI endpoint and key from Key Vault
      const endpointSecret = await this.secretClient.getSecret('azure-openai-endpoint');
      const apiKeySecret = await this.secretClient.getSecret('azure-openai-key');

      this.azureEndpoint = endpointSecret.value || '';
      this.azureApiKey = apiKeySecret.value || '';

      // Get deployment name if stored
      try {
        const deploymentSecret = await this.secretClient.getSecret('azure-openai-deployment');
        this.deploymentName = deploymentSecret.value || 'gpt-4';
      } catch {
        // Use default if not found
      }

      this.initialized = true;
      console.log('✅ Azure AI Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Azure AI Service:', error);
      throw new Error('Failed to connect to Azure Key Vault');
    }
  }

  /**
   * Generate a challenge using Azure OpenAI
   */
  async generateChallenge(request: ChallengeGenerationRequest): Promise<GeneratedChallenge> {
    await this.initialize();

    const prompt = `
Create a Career Challenge card for the ${request.industryName} industry.

Requirements:
- Difficulty: ${request.difficulty}
- Category: ${request.category}
- Must be educational and engaging for students
- Should reflect real-world scenarios in ${request.industryName}
${request.theme ? `- Theme: ${request.theme}` : ''}
${request.educationalFocus ? `- Educational Focus: ${request.educationalFocus}` : ''}

Generate a JSON object with these fields:
{
  "title": "Engaging title (max 50 chars)",
  "scenarioText": "Detailed scenario description (100-200 words)",
  "category": "${request.category}",
  "difficulty": "${request.difficulty}",
  "minRolesRequired": 2-3 for easy, 3-4 for medium, 4-5 for hard,
  "maxRolesAllowed": minRoles + 1 or 2,
  "baseDifficultyScore": 10-15 for easy, 20-30 for medium, 35-50 for hard,
  "perfectScore": baseDifficultyScore + 10-20,
  "failureThreshold": baseDifficultyScore - 5-10,
  "skillConnections": ["skill1", "skill2", "skill3"],
  "learningOutcomes": ["outcome1", "outcome2"],
  "realWorldExample": "Brief real-world connection"
}
`;

    try {
      const response = await this.callAzureOpenAI(prompt);
      const generated = JSON.parse(response);

      // Store in cache
      await this.cacheContent('challenge', request.industry, generated);

      return generated;
    } catch (error) {
      console.error('Failed to generate challenge:', error);
      throw error;
    }
  }

  /**
   * Generate a role card using Azure OpenAI
   */
  async generateRoleCard(request: RoleCardGenerationRequest): Promise<GeneratedRoleCard> {
    await this.initialize();

    const existingRolesList = request.existingRoles?.join(', ') || 'none';

    const prompt = `
Create a Role Card for the ${request.industryName} industry.

Requirements:
- Rarity: ${request.rarity}
- Base Power: ${request.powerRange.min}-${request.powerRange.max}
- Must be a unique role (not in: ${existingRolesList})
- Should represent a real career in ${request.industryName}

Rarity guidelines:
- common: Entry-level positions
- uncommon: Specialized roles
- rare: Senior positions
- epic: Leadership roles
- legendary: C-suite/Directors
- mythic: Industry legends/Founders

Generate a JSON object with these fields:
{
  "roleName": "Professional title",
  "roleTitle": "Descriptive title",
  "description": "Role description (50-100 words)",
  "rarity": "${request.rarity}",
  "basePower": ${request.powerRange.min}-${request.powerRange.max},
  "categoryBonuses": {
    "Management": 0-3,
    "Technical": 0-3,
    "Creative": 0-3,
    "Finance": 0-3
  },
  "specialAbilities": [
    {
      "name": "Ability name",
      "effect": "What it does",
      "powerModifier": 1-3
    }
  ],
  "flavorText": "Inspirational quote or description",
  "backstory": "Brief character background",
  "keySkills": ["skill1", "skill2", "skill3"],
  "educationRequirements": ["requirement1", "requirement2"],
  "salaryRange": "$XX,XXX - $XXX,XXX"
}
`;

    try {
      const response = await this.callAzureOpenAI(prompt);
      const generated = JSON.parse(response);

      // Store in cache
      await this.cacheContent('role_card', request.industry, generated);

      return generated;
    } catch (error) {
      console.error('Failed to generate role card:', error);
      throw error;
    }
  }

  /**
   * Generate a synergy using Azure OpenAI
   */
  async generateSynergy(request: SynergyGenerationRequest): Promise<GeneratedSynergy> {
    await this.initialize();

    const rolesList = request.roleCards.join(', ');

    const prompt = `
Create a Synergy for these roles in ${request.industryName}: ${rolesList}

Requirements:
- Type: ${request.synergyType}
- Must make logical sense why these roles work well together
- Should reflect real-world team dynamics

Synergy types:
- additive: Simple power bonus
- multiplicative: Percentage boost
- special: Unique effect
- conditional: Situational bonus

Generate a JSON object with these fields:
{
  "synergyName": "Creative synergy name",
  "description": "What happens when these roles work together",
  "explanation": "Why this synergy makes sense",
  "powerBonus": 3-10 for additive, 0 for multiplicative,
  "powerMultiplier": 1.0 for additive, 1.2-1.5 for multiplicative,
  "requiredRoles": ${JSON.stringify(request.roleCards)},
  "realWorldExample": "Real-world example of this team dynamic"
}
`;

    try {
      const response = await this.callAzureOpenAI(prompt);
      const generated = JSON.parse(response);

      // Store in cache
      await this.cacheContent('synergy', request.industry, generated);

      return generated;
    } catch (error) {
      console.error('Failed to generate synergy:', error);
      throw error;
    }
  }

  /**
   * Generate a complete industry pack
   */
  async generateIndustryPack(industryCode: string, industryName: string) {
    await this.initialize();

    const pack = {
      industry: industryCode,
      industryName: industryName,
      challenges: [],
      roleCards: [],
      synergies: [],
    };

    try {
      // Generate 5 challenges of varying difficulty
      for (const difficulty of ['easy', 'medium', 'medium', 'hard', 'expert']) {
        const challenge = await this.generateChallenge({
          industry: industryCode,
          industryName,
          difficulty: difficulty as any,
          category: this.randomCategory(),
        });
        pack.challenges.push(challenge);
      }

      // Generate 10 role cards of varying rarity
      const rarities = [
        'common', 'common', 'common',
        'uncommon', 'uncommon',
        'rare', 'rare',
        'epic',
        'legendary',
        'mythic'
      ];

      for (const rarity of rarities) {
        const roleCard = await this.generateRoleCard({
          industry: industryCode,
          industryName,
          rarity: rarity as any,
          powerRange: this.getPowerRange(rarity),
          existingRoles: pack.roleCards.map(r => r.roleName),
        });
        pack.roleCards.push(roleCard);
      }

      // Generate 3-5 synergies
      const synergyCombos = this.generateSynergyCombinations(pack.roleCards.map(r => r.roleName));
      for (const combo of synergyCombos.slice(0, 5)) {
        const synergy = await this.generateSynergy({
          industry: industryCode,
          industryName,
          roleCards: combo,
          synergyType: this.randomSynergyType(),
        });
        pack.synergies.push(synergy);
      }

      // Store the complete pack
      await this.cacheContent('full_industry', industryCode, pack);

      return pack;
    } catch (error) {
      console.error('Failed to generate industry pack:', error);
      throw error;
    }
  }

  /**
   * Call Azure OpenAI API
   */
  private async callAzureOpenAI(prompt: string): Promise<string> {
    const url = `${this.azureEndpoint}/openai/deployments/${this.deploymentName}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.azureApiKey,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a creative game designer creating educational content for Career Challenge, a career exploration game for students. Always respond with valid JSON only, no markdown formatting.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.8,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`Azure OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Cache generated content in database
   */
  private async cacheContent(type: string, industry: string, content: any): Promise<void> {
    const contentKey = `${type}_${industry}_${Date.now()}`;

    const { error } = await this.supabase.rpc('cc_store_ai_content', {
      p_industry_code: industry,
      p_content_type: type,
      p_content_key: contentKey,
      p_content_data: content,
      p_ai_model: `azure-${this.deploymentName}`,
      p_expires_days: 30,
    });

    if (error) {
      console.error('Failed to cache content:', error);
    }
  }

  /**
   * Check cache before generating
   */
  async getCachedContent(contentKey: string): Promise<any | null> {
    const { data, error } = await this.supabase.rpc('cc_get_cached_content', {
      p_content_key: contentKey,
    });

    if (error || !data) {
      return null;
    }

    return data;
  }

  // Helper methods
  private randomCategory(): string {
    const categories = ['Management', 'Technical', 'Creative', 'Finance', 'Operations', 'Customer Relations'];
    return categories[Math.floor(Math.random() * categories.length)];
  }

  private randomSynergyType(): 'additive' | 'multiplicative' | 'special' | 'conditional' {
    const types = ['additive', 'multiplicative', 'special', 'conditional'] as const;
    return types[Math.floor(Math.random() * types.length)];
  }

  private getPowerRange(rarity: string): { min: number; max: number } {
    const ranges: Record<string, { min: number; max: number }> = {
      common: { min: 3, max: 5 },
      uncommon: { min: 4, max: 6 },
      rare: { min: 6, max: 8 },
      epic: { min: 7, max: 9 },
      legendary: { min: 8, max: 10 },
      mythic: { min: 9, max: 10 },
    };
    return ranges[rarity] || { min: 3, max: 5 };
  }

  private generateSynergyCombinations(roles: string[]): string[][] {
    const combinations: string[][] = [];

    // Generate pairs
    for (let i = 0; i < roles.length; i++) {
      for (let j = i + 1; j < roles.length; j++) {
        combinations.push([roles[i], roles[j]]);
      }
    }

    // Generate some triplets
    for (let i = 0; i < Math.min(3, roles.length - 2); i++) {
      combinations.push([roles[i], roles[i + 1], roles[i + 2]]);
    }

    return combinations;
  }
}