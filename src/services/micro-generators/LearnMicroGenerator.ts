/**
 * Learn Container Micro-Generator
 * Generates content for Learn container's three modals using Master Narrative context
 * Cost: ~$0.0005 per modal (using cheaper models like GPT-3.5)
 */

import { MultiModelService } from '../ai-models/MultiModelService';
import { MasterNarrative } from '../narrative/MasterNarrativeGenerator';
import { youTubeService } from '../content-providers/YouTubeService';
import { YouTubeVideo } from '../content-providers/types';

/**
 * Learn Modal Content Interfaces
 */
export interface InstructionalContent {
  video: YouTubeVideo;
  introduction: string;           // Pathfinity wrapper intro
  learningObjectives: string[];   // 2-3 objectives
  vocabularyWords: string[];      // 3-5 key words
  narrativeContext: string;       // How this connects to Sam's journey
}

export interface PracticeContent {
  introduction: string;           // "Let's practice what we learned!"
  questions: PracticeQuestion[];  // 5 questions
  encouragement: string[];        // Positive feedback messages
  narrativeContext: string;       // Sam's practice scenario
}

export interface AssessmentContent {
  question: AssessmentQuestion;   // 1 summative question
  feedback: {
    correct: string;
    incorrect: string;
  };
  narrativeContext: string;       // Sam's assessment moment
}

export interface PracticeQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false';  // Only these for K
  question: string;
  options?: string[];              // For multiple choice
  correctAnswer: string | boolean;
  explanation: string;
  visualHint?: string;            // Visual cue for kindergarten
}

export interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false';
  question: string;
  options?: string[];
  correctAnswer: string | boolean;
  explanation: string;
}

export interface LearnContainerContent {
  instructional: InstructionalContent;
  practice: PracticeContent;
  assessment: AssessmentContent;
  metadata: {
    narrativeId: string;
    subject: string;
    skill: string;
    generatedAt: Date;
    totalCost: number;
  };
}

/**
 * Learn Micro-Generator Service
 */
export class LearnMicroGenerator {
  private aiService: MultiModelService;

  constructor() {
    this.aiService = new MultiModelService();
  }

  /**
   * Generate complete Learn container content
   */
  async generateLearnContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,  // Skill object from curriculum
    gradeLevel: string
  ): Promise<LearnContainerContent> {
    console.log(`📚 Generating Learn content for ${subject} - ${skill.skillName}`);

    try {
      // Generate all three modals in parallel for efficiency
      const [instructionalResult, practiceResult, assessmentResult] = await Promise.all([
        this.generateInstructionalContent(narrative, subject, skill, gradeLevel),
        this.generatePracticeContent(narrative, subject, skill, gradeLevel),
        this.generateAssessmentContent(narrative, subject, skill, gradeLevel)
      ]);

      // Extract content from the AI service response structure
      const instructional = instructionalResult.content || instructionalResult;
      const practice = practiceResult.content || practiceResult;
      const assessment = assessmentResult.content || assessmentResult;

      return {
        instructional,
        practice,
        assessment,
        metadata: {
          narrativeId: narrative.narrativeId,
          subject,
          skill: skill.skillCode,
          generatedAt: new Date(),
          totalCost: 0.0015  // ~$0.0005 per modal
        }
      };

    } catch (error) {
      console.error('Failed to generate Learn content:', error);

      // Return mock content for development
      if (process.env.NODE_ENV === 'development') {
        return this.getMockLearnContent(narrative, subject, skill, gradeLevel);
      }

      throw error;
    }
  }

  /**
   * Generate Instructional Modal content
   */
  private async generateInstructionalContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<InstructionalContent> {
    // First, find an appropriate YouTube video
    const videos = await youTubeService.searchEducationalVideos(
      gradeLevel,
      subject,
      skill.skillName
    );

    const selectedVideo = await youTubeService.selectOptimalVideo(
      videos.videos,
      gradeLevel
    );

    if (!selectedVideo) {
      throw new Error('No suitable video found');
    }

    // Generate narrative wrapper content
    const prompt = `Create instructional content for ${narrative.character.name}'s learning journey.

Context:
- Character: ${narrative.character.name} as ${narrative.character.role}
- Setting: ${narrative.settingProgression.learn.location}
- Subject: ${subject}
- Skill: ${skill.skillName}
- Grade: ${gradeLevel}
- Video Title: ${selectedVideo.title}

Generate JSON with:
{
  "introduction": "Welcome message from ${narrative.character.name} (1-2 sentences)",
  "learningObjectives": ["2-3 specific objectives for this skill"],
  "vocabularyWords": ["3-5 key words for ${gradeLevel} level"],
  "narrativeContext": "How this video helps ${narrative.character.name} at ${narrative.character.workplace} (1-2 sentences)"
}

Make it engaging and appropriate for ${gradeLevel} grade students.`;

    const response = await this.aiService.generateContent(
      prompt,
      {
        container: 'LEARN',
        subject,
        grade: gradeLevel,
        skill
      },
      'gpt-3.5-turbo'  // Use cheaper model for micro-generation
    );

    // Extract content from response (handle both direct content and wrapped response)
    let content = response;
    if (response && response.content) {
      content = response.content;
    }
    if (typeof content === 'string') {
      content = JSON.parse(content);
    }

    return {
      video: selectedVideo,
      introduction: content.introduction || `Hi! I'm ${narrative.character.name}, let's learn together!`,
      learningObjectives: content.learningObjectives || [`Learn about ${skill.skillName}`, `Practice with examples`, `Apply to real work`],
      vocabularyWords: content.vocabularyWords || ['learning', 'practice', 'success'],
      narrativeContext: content.narrativeContext || `This helps me at ${narrative.character.workplace}!`
    };
  }

  /**
   * Generate Practice Modal content (5 questions)
   */
  private async generatePracticeContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<PracticeContent> {
    const prompt = `Create practice questions for ${narrative.character.name}'s learning journey.

Context:
- Character: ${narrative.character.name} working at ${narrative.character.workplace}
- Subject: ${subject}
- Skill: ${skill.skillName}
- Grade: ${gradeLevel} (use only multiple_choice or true_false question types)
- Career Context: ${narrative.cohesiveStory.mission}

Generate JSON with:
{
  "introduction": "Encouraging intro from ${narrative.character.name} about practicing",
  "questions": [
    {
      "id": "q1",
      "type": "multiple_choice",
      "question": "Question text with career context",
      "options": ["Option A", "Option B", "Option C"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct",
      "visualHint": "Visual cue for kindergarteners"
    },
    // Generate exactly 5 questions mixing multiple_choice and true_false
  ],
  "encouragement": ["3 different positive feedback messages"],
  "narrativeContext": "How ${narrative.character.name} uses this skill at work"
}

IMPORTANT:
- Make questions age-appropriate for ${gradeLevel}
- Include career context naturally
- For K grade, use simple language and visual hints
- Mix question types (both multiple_choice and true_false)`;

    const response = await this.aiService.generateContent(
      prompt,
      {
        container: 'LEARN',
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
    return content;
  }

  /**
   * Generate Assessment Modal content (1 summative question)
   */
  private async generateAssessmentContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): Promise<AssessmentContent> {
    const prompt = `Create an assessment question for ${narrative.character.name}'s learning journey.

Context:
- Character: ${narrative.character.name} at ${narrative.character.workplace}
- Subject: ${subject}
- Skill: ${skill.skillName}
- Grade: ${gradeLevel}
- Mission: ${narrative.cohesiveStory.mission}

Generate JSON with:
{
  "question": {
    "id": "assessment_1",
    "type": "multiple_choice",
    "question": "Summative question that tests understanding",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option B",
    "explanation": "Detailed explanation of the concept"
  },
  "feedback": {
    "correct": "Celebration message with ${narrative.character.name}",
    "incorrect": "Encouraging message to try again"
  },
  "narrativeContext": "How mastering this helps ${narrative.character.name} achieve ${narrative.cohesiveStory.mission}"
}

Make it challenging but fair for ${gradeLevel} grade level.`;

    const response = await this.aiService.generateContent(
      prompt,
      {
        container: 'LEARN',
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
    return content;
  }

  /**
   * Get mock Learn content for development
   */
  private getMockLearnContent(
    narrative: MasterNarrative,
    subject: string,
    skill: any,
    gradeLevel: string
  ): LearnContainerContent {
    // Mock YouTube video
    const mockVideo: YouTubeVideo = {
      id: 'mock_video_123',
      title: `Learning ${skill.skillName} with Fun`,
      channelId: 'mock_channel',
      channelTitle: 'Educational Channel',
      duration: 180,
      embedUrl: 'https://www.youtube.com/embed/mock_video_123',
      thumbnailUrl: 'https://i.ytimg.com/vi/mock_video_123/hqdefault.jpg',
      viewCount: 10000,
      likeCount: 500,
      publishedAt: new Date(),
      hasAds: false,
      hasTranscript: true,
      educationalScore: 85
    };

    return {
      instructional: {
        video: mockVideo,
        introduction: `Hi! I'm ${narrative.character.name}, and today we're learning about ${skill.skillName}!`,
        learningObjectives: [
          `Understand ${skill.skillName}`,
          `Practice with real examples`,
          `Apply to ${narrative.character.role} work`
        ],
        vocabularyWords: ['counting', 'numbers', 'one', 'two', 'three'],
        narrativeContext: `This helps me as a ${narrative.character.role} at ${narrative.character.workplace}!`
      },
      practice: {
        introduction: "Let's practice what we learned!",
        questions: [
          {
            id: 'q1',
            type: 'multiple_choice',
            question: `At ${narrative.character.workplace}, how many ${subject === 'math' ? 'items' : 'letters'} do you see?`,
            options: ['1', '2', '3'],
            correctAnswer: '2',
            explanation: 'There are 2 items!',
            visualHint: '🟦🟦'
          },
          {
            id: 'q2',
            type: 'true_false',
            question: `${narrative.character.name} needs to count to 3.`,
            correctAnswer: true,
            explanation: 'Yes, counting helps at work!',
            visualHint: '✓'
          },
          {
            id: 'q3',
            type: 'multiple_choice',
            question: 'Which comes first?',
            options: ['1', '2', '3'],
            correctAnswer: '1',
            explanation: 'Number 1 comes first!',
            visualHint: '1️⃣'
          },
          {
            id: 'q4',
            type: 'true_false',
            question: '2 is more than 3.',
            correctAnswer: false,
            explanation: '3 is more than 2!',
            visualHint: '❌'
          },
          {
            id: 'q5',
            type: 'multiple_choice',
            question: 'Count the stars: ⭐⭐⭐',
            options: ['1', '2', '3'],
            correctAnswer: '3',
            explanation: 'There are 3 stars!',
            visualHint: '⭐⭐⭐'
          }
        ],
        encouragement: [
          'Great job!',
          'You\'re doing amazing!',
          'Keep going, you\'re learning so much!'
        ],
        narrativeContext: `As a ${narrative.character.role}, I use these skills every day!`
      },
      assessment: {
        question: {
          id: 'assessment_1',
          type: 'multiple_choice',
          question: `Help ${narrative.character.name} count the ${narrative.character.equipment[0]}s!`,
          options: ['1', '2', '3', '4'],
          correctAnswer: '3',
          explanation: `We count to organize our work at ${narrative.character.workplace}!`
        },
        feedback: {
          correct: `Amazing job, ${narrative.character.name}! You're ready to be a ${narrative.character.role}!`,
          incorrect: `That's okay, ${narrative.character.name}! Practice makes perfect. Let's try again!`
        },
        narrativeContext: `Mastering ${skill.skillName} will help you ${narrative.cohesiveStory.mission}!`
      },
      metadata: {
        narrativeId: narrative.narrativeId,
        subject,
        skill: skill.skillCode,
        generatedAt: new Date(),
        totalCost: 0.00
      }
    };
  }
}

// Export singleton instance
export const learnMicroGenerator = new LearnMicroGenerator();