/**
 * HYBRID AI SERVICE
 * Intelligently routes content generation between Azure OpenAI and Claude.ai
 * Maximizes free Azure benefits while leveraging Claude's educational expertise
 */

import { azureOpenAIService, ContentGenerationRequest } from './azureOpenAIService';
import Anthropic from '@anthropic-ai/sdk';

// Lazy Claude configuration
let claude: Anthropic | null = null;

const getClaude = () => {
  if (!claude) {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    if (apiKey) {
      claude = new Anthropic({
        apiKey: apiKey
      });
    }
  }
  return claude;
};

export interface AIProviderStats {
  provider: 'azure' | 'claude';
  successRate: number;
  averageQuality: number;
  averageLatency: number;
  totalRequests: number;
  costSavings: number;
}

export interface AIRoutingStrategy {
  contentType: string;
  preferredProvider: 'azure' | 'claude' | 'auto';
  fallbackProvider: 'azure' | 'claude';
  qualityThreshold: number;
}

export class HybridAIService {
  private stats: Map<string, AIProviderStats> = new Map();
  private routingStrategies: AIRoutingStrategy[] = [
    // Bulk content generation -> Azure (free unlimited)
    {
      contentType: 'bulk_testbed',
      preferredProvider: 'azure',
      fallbackProvider: 'claude',
      qualityThreshold: 0.8
    },
    // Real-time student content -> Azure (free, fast)
    {
      contentType: 'personalized_content',
      preferredProvider: 'azure',
      fallbackProvider: 'claude',
      qualityThreshold: 0.85
    },
    // Assessment generation -> Azure (unlimited questions)
    {
      contentType: 'assessment',
      preferredProvider: 'azure',
      fallbackProvider: 'claude',
      qualityThreshold: 0.9
    },
    // High-quality educational content -> Claude (educational expertise)
    {
      contentType: 'learn_instruction',
      preferredProvider: 'claude',
      fallbackProvider: 'azure',
      qualityThreshold: 0.95
    },
    // Narrative content -> Claude (creative writing strength)
    {
      contentType: 'discover_narrative',
      preferredProvider: 'claude',
      fallbackProvider: 'azure',
      qualityThreshold: 0.9
    },
    // Career scenarios -> Auto (A/B test both)
    {
      contentType: 'experience_career',
      preferredProvider: 'auto',
      fallbackProvider: 'azure',
      qualityThreshold: 0.85
    }
  ];

  /**
   * Generate content using intelligent provider routing
   */
  async generateContent(request: ContentGenerationRequest & { contentCategory?: string }): Promise<any> {
    const contentCategory = request.contentCategory || this.categorizeContent(request);
    const strategy = this.getRoutingStrategy(contentCategory);
    const startTime = Date.now();
    
    let result;
    let usedProvider: 'azure' | 'claude';
    
    try {
      if (strategy.preferredProvider === 'auto') {
        // A/B test both providers
        result = await this.runABTest(request);
        usedProvider = result.provider;
      } else {
        // Use preferred provider
        usedProvider = strategy.preferredProvider;
        result = await this.generateWithProvider(request, usedProvider);
      }
      
      // Track success
      this.updateStats(usedProvider, true, Date.now() - startTime, result.quality || 0.8);
      
      return {
        ...result,
        provider: usedProvider,
        generatedAt: new Date().toISOString(),
        costSavings: usedProvider === 'azure' ? this.estimateCostSavings(request) : 0
      };
      
    } catch (error) {
      console.error(`${strategy.preferredProvider} generation failed, trying fallback:`, error);
      
      // Try fallback provider
      try {
        usedProvider = strategy.fallbackProvider;
        result = await this.generateWithProvider(request, usedProvider);
        
        this.updateStats(usedProvider, true, Date.now() - startTime, result.quality || 0.7);
        
        return {
          ...result,
          provider: usedProvider,
          fallbackUsed: true,
          generatedAt: new Date().toISOString()
        };
        
      } catch (fallbackError) {
        this.updateStats(strategy.preferredProvider, false, Date.now() - startTime, 0);
        throw new Error(`Both AI providers failed: ${error.message} | ${fallbackError.message}`);
      }
    }
  }

  /**
   * Generate massive testbed content using free Azure
   */
  async generateMassiveTestbed(
    grades: string[],
    subjects: string[],
    containers: string[],
    quantity: number = 100
  ): Promise<any[]> {
    console.log(`🚀 Generating massive testbed: ${quantity} pieces using FREE Azure AI!`);
    
    // This is where Azure's free tier shines - unlimited content generation!
    return await azureOpenAIService.generateBulkTestbedContent(grades, subjects, containers);
  }

  /**
   * Generate unlimited assessment questions
   */
  async generateUnlimitedAssessments(
    grade: string,
    subject: string,
    quantity: number = 1000
  ): Promise<any[]> {
    console.log(`📝 Generating ${quantity} assessment questions using FREE Azure AI!`);
    
    const skills = this.getSkillsForGrade(grade, subject);
    return await azureOpenAIService.generateUnlimitedAssessments(grade, subject, skills, quantity);
  }

  /**
   * Real-time personalized content for students
   */
  async generatePersonalizedLearning(studentProfile: any, contentType: string): Promise<any> {
    // Use Azure for real-time personalization (free + fast)
    return await azureOpenAIService.generatePersonalizedContent(
      studentProfile, 
      contentType, 
      this.getDifficultyForStudent(studentProfile)
    );
  }

  /**
   * Generate premium educational content using Claude
   */
  async generatePremiumContent(request: ContentGenerationRequest): Promise<any> {
    const prompt = this.buildClaudePrompt(request);
    
    try {
      const claudeClient = getClaude();
      if (!claudeClient) {
        throw new Error('Claude API key not configured');
      }
      const response = await claudeClient.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }]
      });

      const content = response.content[0].text;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      console.error('Claude generation error:', error);
      throw error;
    }
  }

  /**
   * A/B test both providers and return best result
   */
  private async runABTest(request: ContentGenerationRequest): Promise<any> {
    const [azureResult, claudeResult] = await Promise.allSettled([
      this.generateWithProvider(request, 'azure'),
      this.generateWithProvider(request, 'claude')
    ]);

    // Compare results and return better one
    const azureScore = azureResult.status === 'fulfilled' ? this.scoreContent(azureResult.value) : 0;
    const claudeScore = claudeResult.status === 'fulfilled' ? this.scoreContent(claudeResult.value) : 0;

    if (azureScore >= claudeScore && azureResult.status === 'fulfilled') {
      return { ...azureResult.value, provider: 'azure', quality: azureScore };
    } else if (claudeResult.status === 'fulfilled') {
      return { ...claudeResult.value, provider: 'claude', quality: claudeScore };
    } else {
      throw new Error('Both providers failed in A/B test');
    }
  }

  /**
   * Generate content with specific provider
   */
  private async generateWithProvider(request: ContentGenerationRequest, provider: 'azure' | 'claude'): Promise<any> {
    if (provider === 'azure') {
      return await azureOpenAIService.generateEducationalContent(request);
    } else {
      return await this.generatePremiumContent(request);
    }
  }

  /**
   * Get routing strategy for content type
   */
  private getRoutingStrategy(contentType: string): AIRoutingStrategy {
    return this.routingStrategies.find(s => s.contentType === contentType) || {
      contentType: 'default',
      preferredProvider: 'azure', // Default to free Azure
      fallbackProvider: 'claude',
      qualityThreshold: 0.8
    };
  }

  /**
   * Categorize content for routing decisions
   */
  private categorizeContent(request: ContentGenerationRequest): string {
    const { contentType, learningContainer, quantity = 1 } = request;
    
    if (quantity > 10) return 'bulk_testbed';
    if (contentType === 'assessment') return 'assessment';
    if (learningContainer === 'learn' && contentType === 'instruction') return 'learn_instruction';
    if (learningContainer === 'discover') return 'discover_narrative';
    if (learningContainer === 'experience') return 'experience_career';
    
    return 'personalized_content';
  }

  /**
   * Score content quality (simple heuristic)
   */
  private scoreContent(content: any): number {
    let score = 0.5; // Base score
    
    // Check for completeness
    if (content.title && content.title.length > 5) score += 0.1;
    if (content.content_data || content.tasks || content.story_elements) score += 0.2;
    if (content.learning_objectives || content.embedded_skills) score += 0.1;
    if (content.estimated_duration_minutes) score += 0.05;
    if (content.tags && content.tags.length > 0) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  /**
   * Update provider statistics
   */
  private updateStats(provider: 'azure' | 'claude', success: boolean, latency: number, quality: number): void {
    const key = provider;
    const current = this.stats.get(key) || {
      provider,
      successRate: 0,
      averageQuality: 0,
      averageLatency: 0,
      totalRequests: 0,
      costSavings: 0
    };

    current.totalRequests++;
    current.successRate = ((current.successRate * (current.totalRequests - 1)) + (success ? 1 : 0)) / current.totalRequests;
    current.averageLatency = ((current.averageLatency * (current.totalRequests - 1)) + latency) / current.totalRequests;
    current.averageQuality = ((current.averageQuality * (current.totalRequests - 1)) + quality) / current.totalRequests;
    
    if (provider === 'azure') {
      current.costSavings += 0.02; // Estimated $0.02 saved per request
    }

    this.stats.set(key, current);
  }

  /**
   * Estimate cost savings from using free Azure
   */
  private estimateCostSavings(request: ContentGenerationRequest): number {
    const baseClaudeCost = 0.025; // Estimated Claude cost per request
    const tokenMultiplier = (request.quantity || 1) * 1.5; // More content = more tokens
    return baseClaudeCost * tokenMultiplier;
  }

  /**
   * Get difficulty level for student
   */
  private getDifficultyForStudent(studentProfile: any): 'easy' | 'medium' | 'hard' {
    // Simple heuristic - in production, use ML to determine optimal difficulty
    const grade = parseInt(studentProfile.grade_level) || 0;
    if (grade <= 2) return 'easy';
    if (grade <= 8) return 'medium';
    return 'hard';
  }

  /**
   * Get skills for grade/subject
   */
  private getSkillsForGrade(grade: string, subject: string): string[] {
    // This would come from your skills database in production
    return [`${subject.toLowerCase()}-${grade}-skill-1`, `${subject.toLowerCase()}-${grade}-skill-2`];
  }

  /**
   * Build Claude-specific prompt
   */
  private buildClaudePrompt(request: ContentGenerationRequest): string {
    return `You are an expert educational content creator. Generate high-quality ${request.contentType} content for Grade ${request.grade} ${request.subject}.

Learning Container: ${request.learningContainer}
Skills Focus: ${request.skills.join(', ')}

Create engaging, pedagogically sound content that adapts to different learning styles.
Return ONLY valid JSON with the complete content structure.`;
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): AIProviderStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Get total cost savings
   */
  getTotalCostSavings(): number {
    return Array.from(this.stats.values()).reduce((total, stat) => total + stat.costSavings, 0);
  }

  /**
   * Health check for all providers
   */
  async healthCheck(): Promise<{ azure: any, claude: any }> {
    const [azureHealth, claudeHealth] = await Promise.allSettled([
      azureOpenAIService.healthCheck(),
      this.checkClaudeHealth()
    ]);

    return {
      azure: azureHealth.status === 'fulfilled' ? azureHealth.value : { status: 'error', message: azureHealth.reason },
      claude: claudeHealth.status === 'fulfilled' ? claudeHealth.value : { status: 'error', message: claudeHealth.reason }
    };
  }

  private async checkClaudeHealth(): Promise<{ status: 'healthy' | 'error', message: string }> {
    try {
      const claudeClient = getClaude();
      if (!claudeClient) {
        throw new Error('Claude API key not configured');
      }
      const response = await claudeClient.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Say "healthy"' }]
      });
      
      return {
        status: 'healthy',
        message: `Claude service operational: ${response.content[0].text}`
      };
    } catch (error) {
      return {
        status: 'error',
        message: `Claude service error: ${error.message}`
      };
    }
  }
}

// Export singleton instance
export const hybridAIService = new HybridAIService();