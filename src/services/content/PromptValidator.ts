/**
 * PromptValidator
 * 
 * Validates AI prompts and responses to ensure they maintain consistency
 * with career and skill focus while meeting quality standards.
 */

import { Career, Skill, Grade, Subject } from '../../types';

/**
 * AI response structure
 */
export interface AIResponse {
  content: any;
  metadata?: {
    model?: string;
    timestamp?: Date;
    tokens?: number;
  };
  raw?: string;
}

/**
 * Failed prompt information
 */
export interface FailedPrompt {
  prompt: string;
  response: AIResponse;
  failure: PromptFailure;
  timestamp: Date;
}

/**
 * Prompt failure details
 */
export interface PromptFailure {
  type: 'invalid_json' | 'missing_fields' | 'wrong_type' | 'no_career' | 'no_skill' | 'inappropriate';
  message: string;
  details?: any;
}

/**
 * Failure pattern detected
 */
export interface FailurePattern {
  pattern: string;
  frequency: number;
  failureType: string;
  suggestion: string;
}

/**
 * Effectiveness metrics
 */
export interface EffectivenessMetrics {
  totalAttempts: number;
  successCount: number;
  successRate: number;
  averageResponseTime: number;
  commonFailures: FailurePattern[];
  lastSuccess?: Date;
  lastFailure?: Date;
}

/**
 * Validation requirements
 */
interface ValidationRequirements {
  requiredFields: string[];
  careerTerms: string[];
  skillTerms: string[];
  forbiddenTerms?: string[];
  gradeLevel: Grade;
  subject: Subject;
}

/**
 * Service for validating AI prompts and responses
 */
export class PromptValidator {
  private static instance: PromptValidator;
  private promptHistory: Map<string, EffectivenessMetrics> = new Map();
  private failureLog: FailedPrompt[] = [];
  private successPatterns: Map<string, number> = new Map();
  private failurePatterns: Map<string, FailurePattern> = new Map();

  // Validation thresholds
  private readonly GRADE_VOCABULARY: Record<string, string[]> = {
    'K': ['big', 'small', 'count', 'add', 'take away'],
    '1': ['plus', 'minus', 'equals', 'more', 'less'],
    '2': ['subtract', 'addition', 'sum', 'difference'],
    '3': ['multiply', 'divide', 'fraction', 'decimal'],
    '4': ['quotient', 'product', 'factor', 'remainder'],
    '5': ['percentage', 'ratio', 'proportion', 'variable'],
    '6': ['equation', 'expression', 'coefficient', 'exponent'],
    '7': ['algebra', 'geometry', 'probability', 'statistics'],
    '8': ['polynomial', 'function', 'theorem', 'proof']
  };

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): PromptValidator {
    if (!PromptValidator.instance) {
      PromptValidator.instance = new PromptValidator();
    }
    return PromptValidator.instance;
  }

  /**
   * Validate that prompt has required elements
   */
  public validateRequiredElements(
    prompt: string,
    requirements: string[]
  ): boolean {
    const promptLower = prompt.toLowerCase();
    return requirements.every(req => promptLower.includes(req.toLowerCase()));
  }

  /**
   * Validate career presence in prompt
   */
  public validateCareerPresence(prompt: string, career: Career): boolean {
    const promptLower = prompt.toLowerCase();
    const careerTerms = [
      career.title.toLowerCase(),
      ...career.skills.map(s => s.toLowerCase()),
      ...career.title.split(/[\s-]+/).map(w => w.toLowerCase())
    ];

    // Check if at least 2 career references exist
    const careerMentions = careerTerms.filter(term => 
      promptLower.includes(term)
    ).length;

    return careerMentions >= 2;
  }

  /**
   * Validate skill presence in prompt
   */
  public validateSkillPresence(prompt: string, skill: Skill): boolean {
    const promptLower = prompt.toLowerCase();
    const skillTerms = [
      skill.name.toLowerCase(),
      skill.description.toLowerCase(),
      ...skill.name.split(/[\s-]+/).map(w => w.toLowerCase())
    ];

    // Check if skill is adequately referenced
    const skillMentions = skillTerms.filter(term => 
      promptLower.includes(term)
    ).length;

    return skillMentions >= 2;
  }

  /**
   * Validate grade appropriateness
   */
  public validateGradeAppropriateness(prompt: string, grade: Grade): boolean {
    const promptLower = prompt.toLowerCase();
    
    // Check for vocabulary appropriate to grade
    const gradeVocab = this.GRADE_VOCABULARY[grade] || [];
    const inappropriateVocab = this.getInappropriateVocabulary(grade);
    
    // Should contain some grade-appropriate terms
    const hasAppropriateTerms = gradeVocab.some(term => promptLower.includes(term));
    
    // Should not contain terms too advanced
    const hasInappropriateTerms = inappropriateVocab.some(term => promptLower.includes(term));
    
    return hasAppropriateTerms && !hasInappropriateTerms;
  }

  /**
   * Validate subject alignment
   */
  public validateSubjectAlignment(prompt: string, subject: Subject): boolean {
    const promptLower = prompt.toLowerCase();
    const subjectIndicators = this.getSubjectIndicators(subject);
    
    // Check if prompt contains subject-specific language
    const subjectReferences = subjectIndicators.filter(indicator => 
      promptLower.includes(indicator)
    ).length;

    return subjectReferences >= 2;
  }

  /**
   * Validate AI response structure
   */
  public validateResponse(
    response: AIResponse,
    requirements: ValidationRequirements
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if response is valid JSON (if expected)
    if (typeof response.content === 'string') {
      try {
        response.content = JSON.parse(response.content);
      } catch (e) {
        errors.push('Response is not valid JSON');
        return { valid: false, errors };
      }
    }

    // Check required fields
    requirements.requiredFields.forEach(field => {
      if (!(field in response.content)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    // Check career presence in response
    const responseText = JSON.stringify(response.content).toLowerCase();
    const hasCareer = requirements.careerTerms.some(term => 
      responseText.includes(term.toLowerCase())
    );
    
    if (!hasCareer) {
      errors.push('Response lacks career context');
    }

    // Check skill presence
    const hasSkill = requirements.skillTerms.some(term => 
      responseText.includes(term.toLowerCase())
    );
    
    if (!hasSkill) {
      errors.push('Response lacks skill focus');
    }

    // Check for forbidden terms (if any)
    if (requirements.forbiddenTerms) {
      const hasForbidden = requirements.forbiddenTerms.some(term => 
        responseText.includes(term.toLowerCase())
      );
      
      if (hasForbidden) {
        errors.push('Response contains inappropriate content');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Track prompt success
   */
  public trackPromptSuccess(
    prompt: string,
    response: AIResponse
  ): void {
    const promptKey = this.getPromptKey(prompt);
    
    // Update metrics
    const metrics = this.promptHistory.get(promptKey) || this.createEmptyMetrics();
    metrics.totalAttempts++;
    metrics.successCount++;
    metrics.successRate = (metrics.successCount / metrics.totalAttempts) * 100;
    metrics.lastSuccess = new Date();
    
    this.promptHistory.set(promptKey, metrics);
    
    // Track success patterns
    this.analyzeSuccessPatterns(prompt);
  }

  /**
   * Track prompt failure
   */
  public trackPromptFailure(
    prompt: string,
    response: AIResponse,
    failure: PromptFailure
  ): void {
    const promptKey = this.getPromptKey(prompt);
    
    // Log failure
    this.failureLog.push({
      prompt,
      response,
      failure,
      timestamp: new Date()
    });

    // Update metrics
    const metrics = this.promptHistory.get(promptKey) || this.createEmptyMetrics();
    metrics.totalAttempts++;
    metrics.successRate = (metrics.successCount / metrics.totalAttempts) * 100;
    metrics.lastFailure = new Date();
    
    // Track failure pattern
    this.updateFailurePattern(failure);
    
    this.promptHistory.set(promptKey, metrics);
  }

  /**
   * Get prompt effectiveness
   */
  public getPromptEffectiveness(promptId: string): EffectivenessMetrics {
    const metrics = this.promptHistory.get(promptId) || this.createEmptyMetrics();
    
    // Add common failures
    metrics.commonFailures = this.getCommonFailuresForPrompt(promptId);
    
    return metrics;
  }

  /**
   * Identify failure patterns
   */
  public identifyFailurePatterns(
    failures: FailedPrompt[]
  ): FailurePattern[] {
    const patterns: Map<string, FailurePattern> = new Map();
    
    failures.forEach(failure => {
      const patternKey = `${failure.failure.type}-${this.extractPatternFromPrompt(failure.prompt)}`;
      
      if (patterns.has(patternKey)) {
        const pattern = patterns.get(patternKey)!;
        pattern.frequency++;
      } else {
        patterns.set(patternKey, {
          pattern: patternKey,
          frequency: 1,
          failureType: failure.failure.type,
          suggestion: this.generateSuggestionForFailure(failure.failure)
        });
      }
    });

    // Sort by frequency
    return Array.from(patterns.values()).sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Suggest prompt improvements
   */
  public suggestPromptImprovements(
    prompt: string,
    failures: PromptFailure[]
  ): string {
    const suggestions: string[] = [];

    // Analyze failure types
    const failureTypes = new Set(failures.map(f => f.type));

    if (failureTypes.has('invalid_json')) {
      suggestions.push('Ensure prompt explicitly requests JSON format');
      suggestions.push('Provide clear JSON structure example');
    }

    if (failureTypes.has('missing_fields')) {
      suggestions.push('List all required fields explicitly');
      suggestions.push('Provide complete response template');
    }

    if (failureTypes.has('no_career')) {
      suggestions.push('Emphasize career context more strongly');
      suggestions.push('Add "MUST include career references" instruction');
    }

    if (failureTypes.has('no_skill')) {
      suggestions.push('Reinforce skill focus requirement');
      suggestions.push('Add specific skill application examples');
    }

    if (failureTypes.has('inappropriate')) {
      suggestions.push('Add grade-level constraints');
      suggestions.push('Specify forbidden concepts explicitly');
    }

    // Build improved prompt
    let improvedPrompt = prompt;
    
    if (suggestions.length > 0) {
      improvedPrompt += '\n\nADDITIONAL REQUIREMENTS:\n';
      suggestions.forEach(suggestion => {
        improvedPrompt += `- ${suggestion}\n`;
      });
    }

    return improvedPrompt;
  }

  /**
   * Optimize prompt based on history
   */
  public optimizePrompt(prompt: string): string {
    const promptKey = this.getPromptKey(prompt);
    const metrics = this.promptHistory.get(promptKey);
    
    if (!metrics || metrics.successRate >= 90) {
      return prompt; // No optimization needed
    }

    // Get common failures for this prompt type
    const commonFailures = metrics.commonFailures || [];
    
    // Build optimization additions
    const optimizations: string[] = [];

    if (metrics.successRate < 50) {
      optimizations.push('CRITICAL: Follow the exact structure provided');
      optimizations.push('IMPORTANT: Include all required fields');
    }

    commonFailures.forEach(failure => {
      optimizations.push(failure.suggestion);
    });

    // Add success patterns
    const successPatterns = this.getSuccessPatterns();
    if (successPatterns.length > 0) {
      optimizations.push(`SUCCESSFUL PATTERN: ${successPatterns[0]}`);
    }

    // Apply optimizations
    let optimizedPrompt = prompt;
    if (optimizations.length > 0) {
      optimizedPrompt = this.injectOptimizations(prompt, optimizations);
    }

    return optimizedPrompt;
  }

  /**
   * Validate prompt structure
   */
  public validatePromptStructure(prompt: string): {
    valid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    // Check for required sections
    const requiredSections = ['CONTEXT:', 'REQUIREMENTS:', 'STRUCTURE'];
    requiredSections.forEach(section => {
      if (!prompt.includes(section)) {
        issues.push(`Missing section: ${section}`);
      }
    });

    // Check for response format specification
    if (!prompt.includes('JSON') && !prompt.includes('format')) {
      issues.push('No response format specified');
    }

    // Check for examples
    if (!prompt.includes('example') && !prompt.includes('Example')) {
      issues.push('No examples provided');
    }

    // Check length (too short prompts often fail)
    if (prompt.length < 200) {
      issues.push('Prompt may be too brief');
    }

    // Check for contradictions
    if (prompt.includes('must not') && prompt.includes('must include')) {
      const contradictions = this.findContradictions(prompt);
      if (contradictions.length > 0) {
        issues.push('Potential contradictions detected');
      }
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  /**
   * Get inappropriate vocabulary for grade
   */
  private getInappropriateVocabulary(grade: Grade): string[] {
    const gradeNum = this.gradeToNumber(grade);
    const inappropriate: string[] = [];
    
    // Add vocabulary from higher grades
    Object.entries(this.GRADE_VOCABULARY).forEach(([g, vocab]) => {
      if (this.gradeToNumber(g) > gradeNum + 2) {
        inappropriate.push(...vocab);
      }
    });

    return inappropriate;
  }

  /**
   * Get subject indicators
   */
  private getSubjectIndicators(subject: Subject): string[] {
    const indicators: Record<Subject, string[]> = {
      'Math': ['calculate', 'number', 'equation', 'solve', 'math', 'arithmetic'],
      'ELA': ['read', 'write', 'grammar', 'story', 'language', 'literature'],
      'Science': ['experiment', 'hypothesis', 'observe', 'data', 'scientific', 'discover'],
      'Social Studies': ['history', 'culture', 'society', 'community', 'geography', 'civic']
    };

    return indicators[subject] || [];
  }

  /**
   * Get prompt key for tracking
   */
  private getPromptKey(prompt: string): string {
    // Extract key elements for grouping similar prompts
    const elements: string[] = [];
    
    if (prompt.includes('counting')) elements.push('counting');
    if (prompt.includes('multiple')) elements.push('multiple-choice');
    if (prompt.includes('true')) elements.push('true-false');
    if (prompt.includes('Math')) elements.push('math');
    if (prompt.includes('ELA')) elements.push('ela');
    if (prompt.includes('Science')) elements.push('science');
    
    return elements.join('-') || 'generic';
  }

  /**
   * Create empty metrics
   */
  private createEmptyMetrics(): EffectivenessMetrics {
    return {
      totalAttempts: 0,
      successCount: 0,
      successRate: 0,
      averageResponseTime: 0,
      commonFailures: []
    };
  }

  /**
   * Analyze success patterns
   */
  private analyzeSuccessPatterns(prompt: string): void {
    // Extract successful patterns
    const patterns = [
      prompt.includes('MUST') ? 'explicit-requirements' : '',
      prompt.includes('example') ? 'includes-examples' : '',
      prompt.includes('JSON') ? 'specifies-format' : '',
      prompt.includes('career') && prompt.includes('CAREER') ? 'emphasizes-career' : '',
      prompt.includes('skill') && prompt.includes('SKILL') ? 'emphasizes-skill' : ''
    ].filter(p => p);

    patterns.forEach(pattern => {
      this.successPatterns.set(pattern, (this.successPatterns.get(pattern) || 0) + 1);
    });
  }

  /**
   * Update failure pattern
   */
  private updateFailurePattern(failure: PromptFailure): void {
    const key = failure.type;
    
    if (this.failurePatterns.has(key)) {
      const pattern = this.failurePatterns.get(key)!;
      pattern.frequency++;
    } else {
      this.failurePatterns.set(key, {
        pattern: key,
        frequency: 1,
        failureType: failure.type,
        suggestion: this.generateSuggestionForFailure(failure)
      });
    }
  }

  /**
   * Get common failures for prompt
   */
  private getCommonFailuresForPrompt(promptId: string): FailurePattern[] {
    // Filter failures related to this prompt type
    const relevantFailures = this.failureLog.filter(f => 
      this.getPromptKey(f.prompt) === promptId
    );

    return this.identifyFailurePatterns(relevantFailures);
  }

  /**
   * Extract pattern from prompt
   */
  private extractPatternFromPrompt(prompt: string): string {
    // Simple pattern extraction
    if (prompt.includes('counting')) return 'counting';
    if (prompt.includes('multiple choice')) return 'multiple-choice';
    if (prompt.includes('true/false')) return 'true-false';
    return 'general';
  }

  /**
   * Generate suggestion for failure
   */
  private generateSuggestionForFailure(failure: PromptFailure): string {
    const suggestions: Record<string, string> = {
      'invalid_json': 'Specify exact JSON structure with example',
      'missing_fields': 'List all required fields in REQUIREMENTS section',
      'wrong_type': 'Clarify expected question type explicitly',
      'no_career': 'Add "MUST reference career in every element" instruction',
      'no_skill': 'Add "MUST demonstrate skill application" requirement',
      'inappropriate': 'Add grade-level vocabulary constraints'
    };

    return suggestions[failure.type] || 'Review prompt structure and requirements';
  }

  /**
   * Get success patterns
   */
  private getSuccessPatterns(): string[] {
    return Array.from(this.successPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([pattern]) => pattern)
      .slice(0, 3);
  }

  /**
   * Inject optimizations into prompt
   */
  private injectOptimizations(prompt: string, optimizations: string[]): string {
    // Find where to inject (after REQUIREMENTS if exists)
    const requirementsIndex = prompt.indexOf('REQUIREMENTS:');
    
    if (requirementsIndex > -1) {
      const nextSectionIndex = prompt.indexOf('\n\n', requirementsIndex);
      const insertPoint = nextSectionIndex > -1 ? nextSectionIndex : prompt.length;
      
      const optimizationSection = '\n\nOPTIMIZATIONS:\n' + 
        optimizations.map(opt => `- ${opt}`).join('\n');
      
      return prompt.slice(0, insertPoint) + optimizationSection + prompt.slice(insertPoint);
    }

    // Otherwise add at end
    return prompt + '\n\nOPTIMIZATIONS:\n' + optimizations.map(opt => `- ${opt}`).join('\n');
  }

  /**
   * Find contradictions in prompt
   */
  private findContradictions(prompt: string): string[] {
    const contradictions: string[] = [];
    
    // Check for conflicting instructions
    if (prompt.includes('simple') && prompt.includes('complex')) {
      contradictions.push('Conflicting complexity requirements');
    }
    
    if (prompt.includes('brief') && prompt.includes('detailed')) {
      contradictions.push('Conflicting length requirements');
    }

    return contradictions;
  }

  /**
   * Convert grade to number
   */
  private gradeToNumber(grade: string): number {
    const gradeMap: Record<string, number> = {
      'K': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8
    };
    return gradeMap[grade] || 3;
  }

  /**
   * Get failure log
   */
  public getFailureLog(): FailedPrompt[] {
    return this.failureLog;
  }

  /**
   * Clear history
   */
  public clearHistory(): void {
    this.promptHistory.clear();
    this.failureLog = [];
    this.successPatterns.clear();
    this.failurePatterns.clear();
  }

  /**
   * Export metrics
   */
  public exportMetrics(): {
    promptHistory: Array<[string, EffectivenessMetrics]>;
    failurePatterns: FailurePattern[];
    successPatterns: Array<[string, number]>;
  } {
    return {
      promptHistory: Array.from(this.promptHistory.entries()),
      failurePatterns: Array.from(this.failurePatterns.values()),
      successPatterns: Array.from(this.successPatterns.entries())
    };
  }
}

// Export singleton instance getter
export const getPromptValidator = () => PromptValidator.getInstance();