/**
 * Experience Container Micro-Generator
 * Generates interactive workplace scenarios using Master Narrative context
 * Cost: ~$0.0005 (using GPT-3.5-turbo)
 */

import { MultiModelService } from '../ai-models/MultiModelService';
import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';

/**
 * Experience Content Interfaces
 */
export interface ExperienceScenario {
  setting: string;                    // Where in the workplace
  situation: string;                  // What's happening
  challenge: string;                  // What Sam needs to solve
  tools: string[];                    // Career tools available
  choices: ScenarioChoice[];          // 3-4 decision points
  outcome: string;                     // Success message
  skillApplication: string;           // How the skill was used
}

export interface ScenarioChoice {
  id: string;
  description: string;                // What Sam can do
  result: string;                     // What happens
  isOptimal: boolean;                 // Best choice?
  feedback: string;                   // Why this choice matters
  skillUsage: string;                 // How this uses the skill
}

export interface ExperienceContent {
  introduction: string;                // "Welcome to your workplace, Sam!"
  scenario: ExperienceScenario;       // Main interactive scenario
  reflection: {
    question: string;                  // "How did you use counting today?"
    sampleAnswer: string;              // Expected reflection
  };
  careerConnection: string;           // How real professionals do this
  metadata: {
    narrativeId: string;
    subject: string;
    skill: string;
    generatedAt: Date;
    cost: number;
  };
}

/**
 * Experience Micro-Generator Service
 */
export class ExperienceMicroGenerator {
  private aiService: MultiModelService;

  constructor() {
    this.aiService = new MultiModelService();
  }

  /**
   * Generate Experience container content
   */
  async generateExperienceContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<ExperienceContent> {
    console.log(`🎮 Generating Experience content for ${subject} - ${skill.skillName}`);

    try {
      const prompt = this.buildExperiencePrompt(narrative, subject, skill, gradeLevel);

      const response = await this.aiService.generateContent(
        prompt,
        {
          container: 'EXPERIENCE',
          subject,
          grade: gradeLevel,
          skill
        },
        'gpt-3.5-turbo'
      );

      // Extract content from response
      let content = response;
      if (response && response.content) {
        content = response.content;
      }
      if (typeof content === 'string') {
        content = JSON.parse(content);
      }

      return {
        ...content,
        metadata: {
          narrativeId: narrative.narrativeId,
          subject,
          skill: skill.skillCode,
          generatedAt: new Date(),
          cost: 0.0005
        }
      };

    } catch (error) {
      console.error('Failed to generate Experience content:', error);

      // Return mock content for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockExperienceContent(narrative, subject, skill, gradeLevel);
      }

      throw error;
    }
  }

  /**
   * Build prompt for Experience generation
   */
  private buildExperiencePrompt(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): string {
    const context = narrative.subjectContextsAligned[subject as keyof typeof narrative.subjectContextsAligned];

    return `Create an interactive workplace scenario where ${narrative.character.name} practices ${skill.skillName}.

Context:
- Learner: ${narrative.character.name} is working as a ${narrative.character.role}
- Workplace: ${narrative.character.workplace}
- Setting: ${narrative.settingProgression.experience.location}
- Subject: ${subject}
- Skill: ${skill.skillName}
- Grade: ${gradeLevel}
- Career Context: ${context.experience}

Generate JSON with:
{
  "introduction": "Hi ${narrative.character.name}! Welcome to your workplace... (1-2 sentences)",
  "scenario": {
    "setting": "Specific location in ${narrative.character.workplace}",
    "situation": "What's happening that requires ${skill.skillName}",
    "challenge": "What ${narrative.character.name} needs to solve",
    "tools": ["3-4 career-specific tools available"],
    "choices": [
      {
        "id": "choice1",
        "description": "What ${narrative.character.name} could do",
        "result": "What happens if they choose this",
        "isOptimal": true/false,
        "feedback": "Why this choice is good/not optimal",
        "skillUsage": "How this uses ${skill.skillName}"
      }
      // Generate 3-4 choices
    ],
    "outcome": "Success message when ${narrative.character.name} completes the task",
    "skillApplication": "How ${narrative.character.name} used ${skill.skillName} to succeed"
  },
  "reflection": {
    "question": "Ask ${narrative.character.name} how they used ${skill.skillName}",
    "sampleAnswer": "Expected reflection about using the skill"
  },
  "careerConnection": "How real ${narrative.character.role}s use this skill"
}

IMPORTANT:
- Address ${narrative.character.name} directly as "you"
- Make choices age-appropriate for ${gradeLevel}
- Show clear cause and effect
- Celebrate learning and growth`;
  }

  /**
   * Get mock Experience content
   */
  private getMockExperienceContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): ExperienceContent {
    return {
      introduction: `Hi ${narrative.character.name}! Welcome to ${narrative.character.workplace}! Today you'll practice ${skill.skillName} in your real workplace.`,
      scenario: {
        setting: narrative.settingProgression.experience.location,
        situation: `The ${narrative.character.workplace} is busy today and you need to help!`,
        challenge: `Use ${skill.skillName} to complete your ${narrative.character.role} tasks`,
        tools: narrative.character.equipment.slice(0, 3),
        choices: [
          {
            id: 'choice1',
            description: 'Count items one by one carefully',
            result: 'You count accurately and complete the task!',
            isOptimal: true,
            feedback: `Great choice, ${narrative.character.name}! Counting carefully is important for a ${narrative.character.role}.`,
            skillUsage: `You used ${skill.skillName} perfectly!`
          },
          {
            id: 'choice2',
            description: 'Guess the number quickly',
            result: 'You might make a mistake',
            isOptimal: false,
            feedback: 'Guessing can lead to errors. Try counting!',
            skillUsage: 'This doesn\'t use the skill properly'
          },
          {
            id: 'choice3',
            description: 'Ask for help counting',
            result: 'You learn by working together',
            isOptimal: true,
            feedback: 'Asking for help is smart when learning!',
            skillUsage: 'You practice the skill with support'
          }
        ],
        outcome: `Excellent work, ${narrative.character.name}! You've successfully used ${skill.skillName} at ${narrative.character.workplace}!`,
        skillApplication: `You used ${skill.skillName} to ${narrative.cohesiveStory.mission}`
      },
      reflection: {
        question: `How did using ${skill.skillName} help you as a ${narrative.character.role} today?`,
        sampleAnswer: `I used ${skill.skillName} to complete my work accurately and help at ${narrative.character.workplace}.`
      },
      careerConnection: `Real ${narrative.character.role}s use ${skill.skillName} every day to do their important work!`,
      metadata: {
        narrativeId: narrative.narrativeId,
        subject,
        skill: skill.skillCode,
        generatedAt: new Date(),
        cost: 0.0005
      }
    };
  }
}

// Export singleton instance
export const experienceMicroGenerator = new ExperienceMicroGenerator();