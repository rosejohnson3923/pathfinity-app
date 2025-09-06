/**
 * Career Context Converter Service
 * Converts AI-generated content to appropriate format for CareerContextScreen
 */

export interface CareerContextData {
  greeting: string;
  concept: string;
  careerConnection?: string;
}

export class CareerContextConverter {
  /**
   * Converts AI instruction content to CareerContextScreen format
   * Simplifies greeting and separates career context
   */
  static convertInstruction(
    instruction: string,
    studentName: string,
    skillName: string,
    careerName?: string
  ): CareerContextData {
    // Parse instruction into parts
    const parts = instruction.split('\n\n');
    let greeting = parts[0] || '';
    const conceptParts = parts.slice(1);
    
    // Extract career context if present
    let careerConnection = '';
    
    // Check if greeting contains career context (usually after "and seeing how")
    if (greeting.includes('and seeing how')) {
      const splitPoint = greeting.indexOf('and seeing how');
      careerConnection = greeting.substring(splitPoint);
      greeting = greeting.substring(0, splitPoint).trim();
    } else if (greeting.includes('and how')) {
      const splitPoint = greeting.indexOf('and how');
      careerConnection = greeting.substring(splitPoint);
      greeting = greeting.substring(0, splitPoint).trim();
    }
    
    // Ensure greeting ends with proper punctuation
    if (!greeting.endsWith('.') && !greeting.endsWith('!')) {
      greeting += '.';
    }
    
    // Construct simplified greeting if needed
    // Format: "Hi [Name]! Today, we're learning about [skill]."
    if (!greeting.includes(studentName)) {
      greeting = `Hi ${studentName}! Today, we're learning about ${skillName}.`;
    } else {
      // Clean up the existing greeting
      // Remove everything after the skill mention
      const skillMatch = greeting.match(/learning about ([^.!]+)/i);
      if (skillMatch) {
        const learningPart = skillMatch[0];
        const beforeLearning = greeting.substring(0, greeting.indexOf(learningPart));
        greeting = `${beforeLearning}${learningPart}.`;
      }
    }
    
    // Join the concept parts
    const concept = conceptParts.join('\n\n');
    
    return {
      greeting,
      concept,
      careerConnection: careerConnection || undefined
    };
  }
  
  /**
   * Generates a simple greeting if AI content is not available
   */
  static generateDefaultGreeting(
    studentName: string,
    skillName: string,
    gradeLevel: string
  ): string {
    const greetings = [
      `Hi ${studentName}! Today, we're learning about ${skillName}.`,
      `Hello ${studentName}! Let's explore ${skillName} together.`,
      `Welcome ${studentName}! Ready to learn about ${skillName}?`
    ];
    
    // Use grade level to pick appropriate greeting
    const index = gradeLevel === 'K' ? 0 : 
                  gradeLevel <= '2' ? 1 : 2;
    
    return greetings[Math.min(index, greetings.length - 1)];
  }
  
  /**
   * Formats the career connection as a separate callout
   */
  static formatCareerConnection(
    careerName: string,
    careerConnection: string
  ): string {
    if (!careerConnection) {
      return `${careerName}s use these skills every day!`;
    }
    
    // Clean up the career connection text
    let cleaned = careerConnection.replace(/^and\s+/i, '');
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    
    if (!cleaned.endsWith('.') && !cleaned.endsWith('!')) {
      cleaned += '!';
    }
    
    return cleaned;
  }
}

// Export singleton instance for convenience
export const careerContextConverter = CareerContextConverter;