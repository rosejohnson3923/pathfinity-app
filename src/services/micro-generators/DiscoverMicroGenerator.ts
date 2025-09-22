/**
 * Discover Container Micro-Generator
 * Generates field trip exploration content using Master Narrative context
 * Cost: ~$0.0005 (using GPT-3.5-turbo)
 */

import { MultiModelService } from '../ai-models/MultiModelService';
import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';

/**
 * Discover Content Interfaces
 */
export interface DiscoveryActivity {
  location: string;                   // Field trip location
  guide: string;                      // Who's leading the trip
  exploration: ExplorationPoint[];    // 3 things to discover
  realWorldConnection: string;        // How pros use this skill
  communityImpact: string;            // How this helps community
}

export interface ExplorationPoint {
  id: string;
  title: string;                      // What to explore
  description: string;                // What Sam discovers
  observation: string;                // What to notice
  skillApplication: string;           // How the skill is used
  funFact: string;                    // Interesting tidbit
}

export interface DiscoverContent {
  introduction: string;                // "Hi Sam! Ready for a field trip?"
  activity: DiscoveryActivity;        // Main discovery activity
  threeThings: {                      // 3-2-1 structure
    discovered: string[];              // 3 things discovered
    skillsUsed: string[];             // 2 ways skill was used
    bigIdea: string;                   // 1 big idea learned
  };
  reflection: {
    prompt: string;                    // "What was most interesting?"
    connection: string;                // Connect to career goals
  };
  takeHome: string;                   // Message for parents
  metadata: {
    narrativeId: string;
    subject: string;
    skill: string;
    generatedAt: Date;
    cost: number;
  };
}

/**
 * Discover Micro-Generator Service
 */
export class DiscoverMicroGenerator {
  private aiService: MultiModelService;

  constructor() {
    this.aiService = new MultiModelService();
  }

  /**
   * Generate Discover container content
   */
  async generateDiscoverContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<DiscoverContent> {
    console.log(`🌍 Generating Discover content for ${subject} - ${skill.skillName}`);

    try {
      const prompt = this.buildDiscoverPrompt(narrative, subject, skill, gradeLevel);

      const response = await this.aiService.generateContent(
        prompt,
        {
          container: 'DISCOVER',
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
      console.error('Failed to generate Discover content:', error);

      // Return mock content for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockDiscoverContent(narrative, subject, skill, gradeLevel);
      }

      throw error;
    }
  }

  /**
   * Build prompt for Discover generation
   */
  private buildDiscoverPrompt(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): string {
    const context = narrative.subjectContextsAligned[subject as keyof typeof narrative.subjectContextsAligned];

    return `Create a field trip discovery experience where ${narrative.character.name} explores how ${skill.skillName} is used in the real world.

Context:
- Learner: ${narrative.character.name} aspiring to be a ${narrative.character.role}
- Field Trip: ${narrative.settingProgression.discover.location}
- Subject: ${subject}
- Skill: ${skill.skillName}
- Grade: ${gradeLevel}
- Career Context: ${context.discover}

Generate JSON with:
{
  "introduction": "Hi ${narrative.character.name}! Ready for your field trip to... (1-2 sentences)",
  "activity": {
    "location": "${narrative.settingProgression.discover.location}",
    "guide": "Professional who will show ${narrative.character.name} around",
    "exploration": [
      {
        "id": "explore1",
        "title": "First discovery point",
        "description": "What ${narrative.character.name} finds",
        "observation": "What to notice about ${skill.skillName}",
        "skillApplication": "How ${skill.skillName} is used here",
        "funFact": "Cool fact about this"
      }
      // Generate 3 exploration points
    ],
    "realWorldConnection": "How real ${narrative.character.role}s use ${skill.skillName}",
    "communityImpact": "How this helps the community"
  },
  "threeThings": {
    "discovered": ["3 specific things ${narrative.character.name} discovered"],
    "skillsUsed": ["2 ways ${narrative.character.name} used ${skill.skillName}"],
    "bigIdea": "1 important concept ${narrative.character.name} learned"
  },
  "reflection": {
    "prompt": "Question asking ${narrative.character.name} what was interesting",
    "connection": "How this field trip connects to becoming a ${narrative.character.role}"
  },
  "takeHome": "Message for parents about what ${narrative.character.name} learned"
}

IMPORTANT:
- Address ${narrative.character.name} directly as "you"
- Use 3-2-1 structure (3 discoveries, 2 skills, 1 big idea)
- Make it feel like a real field trip
- Connect to community and real world`;
  }

  /**
   * Get mock Discover content
   */
  private getMockDiscoverContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): DiscoverContent {
    const location = narrative.settingProgression.discover.location;

    return {
      introduction: `Hi ${narrative.character.name}! Ready for an exciting field trip to ${location}? Let's discover how ${skill.skillName} is used in the real world!`,
      activity: {
        location,
        guide: `A friendly ${narrative.character.role} who works here`,
        exploration: [
          {
            id: 'explore1',
            title: 'First Stop',
            description: `You discover how ${narrative.character.role}s count items`,
            observation: 'Notice how everything is organized by numbers',
            skillApplication: `${skill.skillName} helps keep track of everything`,
            funFact: `${narrative.character.role}s count hundreds of items every day!`
          },
          {
            id: 'explore2',
            title: 'Second Stop',
            description: 'You see the counting system in action',
            observation: 'Watch how professionals use numbers',
            skillApplication: 'Every number has an important meaning',
            funFact: 'Counting prevents mistakes and keeps everyone safe!'
          },
          {
            id: 'explore3',
            title: 'Third Stop',
            description: 'You try counting like a pro',
            observation: 'You can do this too!',
            skillApplication: `Using ${skill.skillName} just like real ${narrative.character.role}s`,
            funFact: 'You\'re already learning professional skills!'
          }
        ],
        realWorldConnection: `Real ${narrative.character.role}s use ${skill.skillName} to ${narrative.cohesiveStory.mission}`,
        communityImpact: `This helps everyone in the community stay healthy and happy!`
      },
      threeThings: {
        discovered: [
          `How ${narrative.character.role}s use numbers`,
          `Why counting is important`,
          `How you can help the community`
        ],
        skillsUsed: [
          `Counted items like a pro`,
          `Organized things by number`
        ],
        bigIdea: `${skill.skillName} helps ${narrative.character.role}s make a difference!`
      },
      reflection: {
        prompt: `What was the most exciting thing you discovered today, ${narrative.character.name}?`,
        connection: `This field trip showed you how ${skill.skillName} will help you become an amazing ${narrative.character.role}!`
      },
      takeHome: `Today ${narrative.character.name} visited ${location} and learned how ${narrative.character.role}s use ${skill.skillName} to help the community. They discovered 3 amazing things and practiced professional skills!`,
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
export const discoverMicroGenerator = new DiscoverMicroGenerator();