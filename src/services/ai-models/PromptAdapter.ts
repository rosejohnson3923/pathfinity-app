/**
 * Prompt Adapter
 * Adapts prompts based on model capabilities and requirements
 */

import { ModelCapability } from './ModelCapabilities';
import { PromptContext } from '../ai-prompts/PromptBuilder';

export class PromptAdapter {
  /**
   * Adapts a prompt for a specific model's requirements
   */
  static adaptPrompt(
    originalPrompt: string,
    context: PromptContext,
    model: ModelCapability
  ): string {
    let adaptedPrompt = originalPrompt;

    // Apply model-specific adaptations
    if (model.requiresStructuredPrompt) {
      adaptedPrompt = this.enforceStructuredFormat(adaptedPrompt, model);
    }

    // Simplify for basic models
    if (model.name === 'Phi-4') {
      adaptedPrompt = this.simplifyForPhi4(adaptedPrompt, context);
    }

    // Enhance for Llama models
    if (model.name.includes('Llama')) {
      adaptedPrompt = this.adaptForLlama(adaptedPrompt, context);
    }

    // Add JSON enforcement if needed
    if (model.supportsJSON && model.responseFormat === 'json_object') {
      adaptedPrompt = this.enforceJSONOutput(adaptedPrompt, model);
    }

    // Add vision instructions if applicable
    if (model.supportsVision && context.hasImages) {
      adaptedPrompt = this.addVisionInstructions(adaptedPrompt);
    }

    // Adjust complexity based on grade
    if (context.studentProfile?.grade) {
      adaptedPrompt = this.adjustComplexityForGrade(
        adaptedPrompt,
        context.studentProfile.grade,
        model
      );
    }

    return adaptedPrompt;
  }

  /**
   * Simplify prompt for Phi-4 model (K-2 grades)
   */
  private static simplifyForPhi4(prompt: string, context: PromptContext): string {
    let simplified = prompt;

    // Remove complex instructions
    simplified = simplified.replace(/sophisticated|elaborate|comprehensive/gi, 'simple');
    simplified = simplified.replace(/analyze|evaluate|synthesize/gi, 'look at');

    // Simplify JSON structure requirements
    simplified += '\n\nIMPORTANT: Keep all text very simple. Use short words (3-5 letters).';
    simplified += '\nReturn ONLY valid JSON starting with { and ending with }';
    simplified += '\nDo not include any text before or after the JSON.';

    // Add counting-specific instructions for K-2
    if (context.subject === 'MATH' && ['K', '1', '2'].includes(context.studentProfile?.grade || '')) {
      simplified += '\nFor counting questions:';
      simplified += '\n- Use simple objects to count';
      simplified += '\n- Numbers should be 1-10 only';
      simplified += '\n- Include visual emojis in the "visual" field';
    }

    return simplified;
  }

  /**
   * Adapt prompt for Llama models
   */
  private static adaptForLlama(prompt: string, context: PromptContext): string {
    let adapted = prompt;

    // Llama models need very explicit JSON instructions
    adapted = adapted.replace(/Generate.*JSON/gi, 'Output ONLY valid JSON with no other text');

    // Add explicit structure
    adapted += '\n\n### Instructions:';
    adapted += '\n1. Read the requirements carefully';
    adapted += '\n2. Generate educational content as specified';
    adapted += '\n3. Return ONLY valid JSON';
    adapted += '\n4. Start your response with { and end with }';
    adapted += '\n5. Include no markdown, no explanations, just JSON';

    // Add example structure for clarity
    adapted += '\n\n### Expected JSON Structure:';
    adapted += '\n{';
    adapted += '\n  "questions": [...],';
    adapted += '\n  "instructions": "...",';
    adapted += '\n  "career_context": "..."';
    adapted += '\n}';

    return adapted;
  }

  /**
   * Enforce structured format for models that require it
   */
  private static enforceStructuredFormat(prompt: string, model: ModelCapability): string {
    let structured = prompt;

    // Add clear section markers
    structured = '### TASK ###\n' + structured;

    structured += '\n\n### OUTPUT FORMAT ###';
    structured += '\nYou must return ONLY valid JSON.';
    structured += '\nNo markdown code blocks.';
    structured += '\nNo explanations.';
    structured += '\nStart with { and end with }';

    if (model.name === 'DeepSeek-V3') {
      // DeepSeek for validation needs specific format
      structured += '\n\n### VALIDATION RULES ###';
      structured += '\nCheck for: subject isolation, grade appropriateness, answer correctness';
      structured += '\nReturn validation result as JSON:';
      structured += '\n{"isValid": boolean, "errors": [...], "suggestions": [...]}';
    }

    return structured;
  }

  /**
   * Enforce JSON output format
   */
  private static enforceJSONOutput(prompt: string, model: ModelCapability): string {
    // Remove any conflicting instructions
    let jsonPrompt = prompt.replace(/return.*markdown/gi, '');

    // Add strong JSON enforcement
    jsonPrompt += '\n\n' + '='.repeat(50);
    jsonPrompt += '\nCRITICAL: Output ONLY valid JSON';
    jsonPrompt += '\n- Start with {';
    jsonPrompt += '\n- End with }';
    jsonPrompt += '\n- No text before or after';
    jsonPrompt += '\n- No markdown code blocks';
    jsonPrompt += '\n- Valid JSON syntax only';
    jsonPrompt += '\n' + '='.repeat(50);

    return jsonPrompt;
  }

  /**
   * Add vision-specific instructions
   */
  private static addVisionInstructions(prompt: string): string {
    return prompt + '\n\nNote: Images have been provided. Analyze them as part of your response.';
  }

  /**
   * Adjust complexity based on grade level
   */
  private static adjustComplexityForGrade(
    prompt: string,
    grade: string,
    model: ModelCapability
  ): string {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    if (gradeNum <= 2) {
      prompt += '\n\nGrade Level K-2 Requirements:';
      prompt += '\n- Use very simple words (3-5 letters when possible)';
      prompt += '\n- Keep sentences short';
      prompt += '\n- Use familiar objects';
      prompt += '\n- Numbers 1-20 only';
    } else if (gradeNum <= 5) {
      prompt += '\n\nGrade Level 3-5 Requirements:';
      prompt += '\n- Use grade-appropriate vocabulary';
      prompt += '\n- Include some challenging words';
      prompt += '\n- Problems can be multi-step';
    } else if (gradeNum <= 8) {
      prompt += '\n\nGrade Level 6-8 Requirements:';
      prompt += '\n- Use subject-specific terminology';
      prompt += '\n- Include analytical thinking';
      prompt += '\n- Problems should require reasoning';
    } else {
      prompt += '\n\nGrade Level 9-12 Requirements:';
      prompt += '\n- Use advanced vocabulary';
      prompt += '\n- Include complex reasoning';
      prompt += '\n- Prepare for college-level thinking';
    }

    return prompt;
  }

  /**
   * Get system message for a model
   */
  static getSystemMessage(model: ModelCapability): string {
    if (model.name === 'Phi-4') {
      return 'You are an educational AI that creates very simple content for young children (K-2). Always return valid JSON.';
    }

    if (model.name.includes('Llama')) {
      return 'You are a JSON generator for educational content. Output only valid JSON with no additional text.';
    }

    if (model.name === 'DeepSeek-V3') {
      return 'You are a validation system. Analyze content and return JSON validation results.';
    }

    // Default for GPT models
    return 'You are an AI that generates educational content in JSON format for the PathIQ Intelligence System.';
  }

  /**
   * Estimate token count (rough approximation)
   */
  static estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4);
  }

  /**
   * Truncate prompt if it exceeds model's context window
   */
  static truncateToContext(prompt: string, model: ModelCapability): string {
    const estimatedTokens = this.estimateTokens(prompt);

    if (estimatedTokens > model.contextWindow * 0.8) { // Leave 20% buffer
      // Truncate the middle section, keeping instructions
      const maxChars = model.contextWindow * 3; // ~3 chars per token for safety
      const keepStart = Math.floor(maxChars * 0.3);
      const keepEnd = Math.floor(maxChars * 0.2);

      return prompt.substring(0, keepStart) +
             '\n... [content truncated] ...\n' +
             prompt.substring(prompt.length - keepEnd);
    }

    return prompt;
  }
}