/**
 * Narrative to Bento Adapter
 * Maps Master Narrative and micro-generated content to existing BentoLearnCardV2 structure
 * Preserves existing production styling and functionality
 */

import { LearnContainerContent } from '../micro-generators/LearnMicroGenerator';
import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';

// Existing BentoLearnCardV2 question structure
export interface BentoQuestion {
  id: string;
  number: number;
  type: string;
  text: string;
  image?: string;
  options?: string[];
  correctAnswer?: string | string[];
  hint?: string;
  xpReward?: number;
}

// Extended structure with narrative context
export interface NarrativeEnhancedQuestion extends BentoQuestion {
  careerContext?: string;
  narrativeWrapper?: {
    intro: string;
    outro: string;
    characterVoice: string;
  };
}

export class NarrativeToBentoAdapter {
  /**
   * Convert Practice questions from LearnContainerContent to BentoQuestion format
   */
  static adaptPracticeQuestions(
    content: LearnContainerContent,
    narrative: MasterNarrative,
    startNumber: number = 1
  ): NarrativeEnhancedQuestion[] {
    if (!content.practice?.questions) {
      return [];
    }

    return content.practice.questions.map((q, index) => ({
      // Core BentoQuestion fields
      id: `practice_${narrative.narrativeId}_${index}`,
      number: startNumber + index,
      type: q.type || 'multiple-choice',
      text: this.wrapQuestionWithNarrative(q.question, narrative, 'practice'),
      image: q.image,
      options: q.options,
      correctAnswer: q.correctAnswer,
      hint: q.hint || content.practice.supportingHints?.[index],
      xpReward: q.xpReward || 10,

      // Narrative enhancements
      careerContext: narrative.subjectContextsAligned[content.metadata.subject]?.learn,
      narrativeWrapper: {
        intro: content.practice.introduction,
        outro: content.practice.encouragement || `Great job! You're becoming a real ${narrative.character.role}!`,
        characterVoice: narrative.character.tone
      }
    }));
  }

  /**
   * Convert Assessment questions from LearnContainerContent to BentoQuestion format
   */
  static adaptAssessmentQuestions(
    content: LearnContainerContent,
    narrative: MasterNarrative
  ): NarrativeEnhancedQuestion[] {
    if (!content.assessment?.questions) {
      return [];
    }

    // Assessment typically has fewer questions with higher XP rewards
    return content.assessment.questions.map((q, index) => ({
      // Core BentoQuestion fields
      id: `assessment_${narrative.narrativeId}_${index}`,
      number: index + 1,
      type: q.type || 'multiple-choice',
      text: this.wrapQuestionWithNarrative(q.question, narrative, 'assessment'),
      image: q.image,
      options: q.options,
      correctAnswer: q.correctAnswer,
      hint: q.hint || 'Think about what you learned during practice!',
      xpReward: q.xpReward || 25,

      // Narrative enhancements
      careerContext: narrative.subjectContextsAligned[content.metadata.subject]?.learn,
      narrativeWrapper: {
        intro: content.assessment.introduction,
        outro: content.assessment.successMessage,
        characterVoice: narrative.character.tone
      }
    }));
  }

  /**
   * Wrap question text with narrative context
   */
  private static wrapQuestionWithNarrative(
    originalQuestion: string,
    narrative: MasterNarrative,
    phase: 'practice' | 'assessment'
  ): string {
    // For assessment, keep it more formal
    if (phase === 'assessment') {
      return originalQuestion;
    }

    // For practice, add career context if it makes sense
    const careerMention = Math.random() > 0.5
      ? ` As a future ${narrative.character.role}, `
      : '';

    return `${careerMention}${originalQuestion}`;
  }

  /**
   * Create instruction phase content (not a question, but narrative intro)
   */
  static createInstructionPhaseData(
    content: LearnContainerContent,
    narrative: MasterNarrative
  ) {
    return {
      narrativeIntro: content.instructional?.introduction ||
        `Hi ${narrative.character.name}! ${narrative.character.greeting}`,

      videoContext: {
        hook: content.instructional?.videoIntro?.hook ||
          `Let's learn ${content.metadata.skill}!`,
        careerContext: content.instructional?.videoIntro?.careerContext ||
          `This skill will help you become an amazing ${narrative.character.role}!`,
        expert: content.instructional?.keyExpert || {
          title: `Expert ${narrative.character.role}`,
          funFact: `Did you know? ${narrative.character.role}s use this skill every day!`
        }
      },

      keyLearningPoints: content.instructional?.keyLearningPoints || [
        `Understanding ${content.metadata.skill}`,
        `Practicing with real examples`,
        `Applying what you've learned`
      ],

      transitionToPractice: {
        message: `Ready to practice, ${narrative.character.name}?`,
        encouragement: narrative.character.encouragement
      }
    };
  }

  /**
   * Convert feedback messages to match existing Bento structure
   */
  static adaptFeedback(
    isCorrect: boolean,
    content: LearnContainerContent,
    narrative: MasterNarrative,
    phase: 'practice' | 'assessment'
  ): { isCorrect: boolean; message: string } {
    if (phase === 'practice') {
      return {
        isCorrect,
        message: isCorrect
          ? content.practice?.encouragement || `Excellent work! ${narrative.character.encouragement}`
          : content.practice?.supportingHints?.[0] || `Not quite, but keep trying! Remember what we learned about this.`
      };
    } else {
      return {
        isCorrect,
        message: isCorrect
          ? content.assessment?.successMessage || `Amazing job! You've mastered this skill!`
          : `Keep practicing! Every ${narrative.character.role} needs practice to become great!`
      };
    }
  }

  /**
   * Get progress display text with narrative context
   */
  static getProgressText(
    current: number,
    total: number,
    phase: 'practice' | 'assessment',
    narrative: MasterNarrative
  ): string {
    if (phase === 'practice') {
      return `Practice ${current} of ${total} - Journey to becoming a ${narrative.character.role}`;
    } else {
      return `Assessment ${current} of ${total} - Show what you've learned!`;
    }
  }

  /**
   * Adapt the entire learning journey for BentoLearnCardV2
   */
  static adaptFullJourney(
    content: LearnContainerContent,
    narrative: MasterNarrative
  ) {
    return {
      // Instruction phase (new - video component)
      instruction: this.createInstructionPhaseData(content, narrative),

      // Practice phase (existing modal structure)
      practiceQuestions: this.adaptPracticeQuestions(content, narrative, 1),

      // Assessment phase (existing modal structure)
      assessmentQuestions: this.adaptAssessmentQuestions(content, narrative),

      // Metadata for tracking
      metadata: {
        narrativeId: narrative.narrativeId,
        career: narrative.character.role,
        subject: content.metadata.subject,
        skill: content.metadata.skill,
        studentName: narrative.character.name,
        generatedAt: content.metadata.generatedAt,
        cost: content.metadata.cost
      }
    };
  }
}

export default NarrativeToBentoAdapter;