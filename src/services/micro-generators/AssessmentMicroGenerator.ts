/**
 * Assessment Micro-Generator
 * Adapts master narrative for the ASSESSMENT container (practice & evaluation)
 * Creates contextualized questions from YouTube content + narrative
 * Uses only ~100 tokens to generate assessment items
 * Part of the Narrative-First Architecture - Phase 3
 */

import { MasterNarrative } from '../narrative/NarrativeSchema';
import { YouTubeVideo, YouTubeTranscript } from '../content-providers/types';

export interface AssessmentQuestion {
  id: string;
  scenario: string;               // Career context for question
  question: string;               // The actual question
  type: 'multiple-choice' | 'counting' | 'ordering' | 'matching';
  choices?: string[];            // For multiple choice
  correctAnswer: string | number;
  feedback: {
    correct: string;            // Positive reinforcement
    incorrect: string;          // Helpful hint
    explanation: string;        // Why this matters
  };
  difficulty: 'easy' | 'medium' | 'hard';
  skillTested: string;
}

export interface AssessmentContent {
  scenario: string;              // Overall assessment context
  questions: AssessmentQuestion[];
  progressiveDifficulty: boolean;
  totalPoints: number;
  passingScore: number;
  completionMessage: string;
  careerBadge?: {
    name: string;
    description: string;
    icon: string;
  };
}

export class AssessmentMicroGenerator {
  /**
   * Generate ASSESSMENT content from master narrative + optional video
   * Creates career-contextualized questions
   * ~100 tokens per question generation
   */
  async generate(
    narrative: MasterNarrative,
    youtube?: YouTubeVideo,
    transcript?: YouTubeTranscript[],
    questionCount: number = 5
  ): Promise<AssessmentContent> {
    const content = this.assembleAssessment(
      narrative,
      youtube,
      transcript,
      questionCount
    );
    return content;
  }

  /**
   * Assemble complete assessment from narrative
   */
  private assembleAssessment(
    narrative: MasterNarrative,
    youtube?: YouTubeVideo,
    transcript?: YouTubeTranscript[],
    questionCount: number
  ): AssessmentContent {
    const scenario = this.createScenario(narrative);
    const questions = this.generateQuestions(narrative, youtube, transcript, questionCount);
    const completionMessage = this.createCompletionMessage(narrative);
    const careerBadge = this.createCareerBadge(narrative);

    const totalPoints = questions.length * 10;
    const passingScore = Math.floor(totalPoints * 0.7); // 70% to pass

    return {
      scenario,
      questions,
      progressiveDifficulty: true,
      totalPoints,
      passingScore,
      completionMessage,
      careerBadge
    };
  }

  /**
   * Create assessment scenario from narrative
   */
  private createScenario(narrative: MasterNarrative): string {
    const { protagonist, setting, challenges, journey } = narrative;

    return narrative.adaptations.forAssessment ||
      `${protagonist.name} has a new challenge at ${setting.location}! ` +
      `${challenges[0].description} Help ${protagonist.name} by answering these questions. ` +
      `Each correct answer brings us closer to ${challenges[0].successOutcome.toLowerCase()}.`;
  }

  /**
   * Generate assessment questions
   */
  private generateQuestions(
    narrative: MasterNarrative,
    youtube?: YouTubeVideo,
    transcript?: YouTubeTranscript[],
    count: number
  ): AssessmentQuestion[] {
    const questions: AssessmentQuestion[] = [];
    const { skill, grade } = narrative;

    // Generate different question types
    if (skill.includes('Counting')) {
      questions.push(...this.generateCountingQuestions(narrative, count));
    } else if (skill.includes('Addition')) {
      questions.push(...this.generateAdditionQuestions(narrative, count));
    } else {
      questions.push(...this.generateGenericQuestions(narrative, count));
    }

    // If we have video transcript, add content-specific questions
    if (transcript && transcript.length > 0) {
      questions.push(...this.generateTranscriptQuestions(narrative, transcript, 2));
    }

    return questions.slice(0, count);
  }

  /**
   * Generate counting questions
   */
  private generateCountingQuestions(
    narrative: MasterNarrative,
    count: number
  ): AssessmentQuestion[] {
    const { protagonist, career, setting, challenges } = narrative;
    const questions: AssessmentQuestion[] = [];

    // Easy counting question
    questions.push({
      id: 'count_1',
      scenario: `${protagonist.name} sees some ${career.tools[0]} at ${setting.location}.`,
      question: 'How many do you see? 🐢 🐢 🐢 🐢 🐢',
      type: 'counting',
      correctAnswer: 5,
      feedback: {
        correct: `Excellent counting! ${protagonist.name} is impressed!`,
        incorrect: 'Try counting again, one at a time.',
        explanation: `${career.title}s count carefully to track important data.`
      },
      difficulty: 'easy',
      skillTested: 'Counting to 10'
    });

    // Medium counting question
    questions.push({
      id: 'count_2',
      scenario: `${protagonist.name} is organizing research equipment.`,
      question: `If ${protagonist.name} has 3 ${career.tools[0]} and finds 4 more, how many total?`,
      type: 'multiple-choice',
      choices: ['5', '6', '7', '8'],
      correctAnswer: '7',
      feedback: {
        correct: `Perfect! You're thinking like a ${career.title}!`,
        incorrect: 'Remember to add: 3 + 4 = ?',
        explanation: `${career.title}s use addition when combining data sets.`
      },
      difficulty: 'medium',
      skillTested: 'Counting to 10'
    });

    // Hard counting question
    questions.push({
      id: 'count_3',
      scenario: `${challenges[0].description}`,
      question: `${protagonist.name} counted 10 items but 2 are hidden. How many can you see?`,
      type: 'multiple-choice',
      choices: ['6', '7', '8', '9'],
      correctAnswer: '8',
      feedback: {
        correct: `Outstanding! You solved it like a real ${career.title}!`,
        incorrect: 'Think: 10 total minus 2 hidden equals?',
        explanation: challenges[0].careerRelevance
      },
      difficulty: 'hard',
      skillTested: 'Counting to 10'
    });

    return questions;
  }

  /**
   * Generate addition questions
   */
  private generateAdditionQuestions(
    narrative: MasterNarrative,
    count: number
  ): AssessmentQuestion[] {
    const { protagonist, career } = narrative;
    const questions: AssessmentQuestion[] = [];

    questions.push({
      id: 'add_1',
      scenario: `${protagonist.name} is combining research samples.`,
      question: '2 samples + 3 samples = ?',
      type: 'multiple-choice',
      choices: ['4', '5', '6', '7'],
      correctAnswer: '5',
      feedback: {
        correct: `Great addition! ${career.title}s add data all the time!`,
        incorrect: 'Count on your fingers: 2... then 3 more.',
        explanation: `Addition helps ${career.title}s combine information.`
      },
      difficulty: 'easy',
      skillTested: 'Addition'
    });

    return questions;
  }

  /**
   * Generate generic skill questions
   */
  private generateGenericQuestions(
    narrative: MasterNarrative,
    count: number
  ): AssessmentQuestion[] {
    const { protagonist, skill, skillsMap } = narrative;
    const skillInfo = skillsMap[skill] || skillsMap[Object.keys(skillsMap)[0]];
    const questions: AssessmentQuestion[] = [];

    questions.push({
      id: 'generic_1',
      scenario: `${protagonist.name} needs to use ${skill}.`,
      question: `Why is ${skill} important for ${protagonist.role}s?`,
      type: 'multiple-choice',
      choices: [
        skillInfo.whyItMatters,
        'It looks cool',
        'It\'s not really important',
        'Only for fun'
      ],
      correctAnswer: skillInfo.whyItMatters,
      feedback: {
        correct: 'You understand the real-world application!',
        incorrect: `Think about how ${protagonist.name} uses this skill daily.`,
        explanation: skillInfo.careerApplication
      },
      difficulty: 'medium',
      skillTested: skill
    });

    return questions;
  }

  /**
   * Generate questions from video transcript
   */
  private generateTranscriptQuestions(
    narrative: MasterNarrative,
    transcript: YouTubeTranscript[],
    count: number
  ): AssessmentQuestion[] {
    const { protagonist, career } = narrative;
    const questions: AssessmentQuestion[] = [];

    // Extract key concepts from transcript
    const transcriptText = transcript.map(t => t.text).join(' ');

    questions.push({
      id: 'video_1',
      scenario: `Based on what we just learned in the video...`,
      question: `How would ${protagonist.name} apply this concept?`,
      type: 'multiple-choice',
      choices: [
        `Use it to ${career.dailyActivities[0]}`,
        'Ignore it completely',
        'Only use it sometimes',
        'Teach it to others first'
      ],
      correctAnswer: `Use it to ${career.dailyActivities[0]}`,
      feedback: {
        correct: 'You connected the video to the career perfectly!',
        incorrect: 'Think about how this helps in daily work.',
        explanation: `${career.title}s apply these concepts every day.`
      },
      difficulty: 'medium',
      skillTested: narrative.skill
    });

    return questions;
  }

  /**
   * Create completion message
   */
  private createCompletionMessage(narrative: MasterNarrative): string {
    const { protagonist, journey, career } = narrative;

    return `🎉 Congratulations! ${journey.conclusion} ` +
           `${protagonist.name} says: "${protagonist.catchphrase || 'Great job!'}" ` +
           `You've proven you have what it takes to be a ${career.title}!`;
  }

  /**
   * Create career achievement badge
   */
  private createCareerBadge(narrative: MasterNarrative): AssessmentContent['careerBadge'] {
    const { career, skill } = narrative;

    return {
      name: `Junior ${career.title} - ${skill}`,
      description: `Mastered ${skill} like a real ${career.title}!`,
      icon: narrative.visuals.iconography[0] || '🏆'
    };
  }

  /**
   * Adapt assessment for grade level
   */
  adaptForGrade(
    content: AssessmentContent,
    grade: string
  ): AssessmentContent {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);

    if (gradeNum <= 2) {
      // Simplify for K-2
      return {
        ...content,
        questions: content.questions
          .filter(q => q.difficulty !== 'hard')
          .slice(0, 3),
        passingScore: content.questions.length * 6 // 60% for younger
      };
    }

    if (gradeNum >= 6) {
      // Add complexity for middle school
      const harderQuestions = content.questions.map(q => ({
        ...q,
        difficulty: q.difficulty === 'easy' ? 'medium' as const : 'hard' as const
      }));

      return {
        ...content,
        questions: harderQuestions,
        passingScore: content.totalPoints * 0.8 // 80% for older
      };
    }

    return content;
  }

  /**
   * Generate practice mode (unlimited attempts)
   */
  createPracticeMode(
    narrative: MasterNarrative
  ): {
    infiniteQuestions: boolean;
    instantFeedback: boolean;
    hintsAvailable: boolean;
    showProgress: boolean;
  } {
    return {
      infiniteQuestions: true,
      instantFeedback: true,
      hintsAvailable: true,
      showProgress: true
    };
  }
}

// Export singleton instance
export const assessmentMicroGenerator = new AssessmentMicroGenerator();