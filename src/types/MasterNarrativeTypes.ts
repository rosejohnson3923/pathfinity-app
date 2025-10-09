/**
 * Master Narrative Types
 *
 * Defines the enriched Master Narrative structure that serves as the
 * source of truth for story consistency across all containers.
 */

export type Subject = 'Math' | 'ELA' | 'Science' | 'Social Studies';
export type ContainerType = 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
export type CompanionId = 'finn' | 'sage' | 'spark' | 'harmony';

/**
 * Enriched Master Narrative
 * Generated once at login, stores complete story context
 */
export interface EnrichedMasterNarrative {
  // Session metadata
  sessionId: string;
  userId: string;
  createdAt: string;

  // User selections
  career: string;
  companion: CompanionId;
  gradeLevel: string;

  // Core narrative structure
  masterNarrative: {
    greeting: string;
    introduction: string;
    mission: string;
    narrativeArc: NarrativeArc;
    companionVoice: CompanionVoice;
    careerNarrative: CareerNarrative;
    subjectNarratives: Record<Subject, SubjectNarrative>;
    containerTransitions: ContainerTransitions;
    thematicElements: ThematicElements;
  };

  // Version tracking
  version: string;
  generatedBy: string;
}

/**
 * Narrative Arc
 * The story backbone: premise → mission → stakes → resolution
 */
export interface NarrativeArc {
  premise: string;           // "You're learning to become a Chef"
  mission: string;            // "Help prepare for the restaurant's grand opening"
  stakes: string;             // "The success of opening night depends on your skills"
  resolution: string;         // "You've mastered the skills needed for a successful service"
}

/**
 * Companion Voice
 * Defines how the AI companion speaks, teaches, and encourages
 */
export interface CompanionVoice {
  companionId: CompanionId;
  greetingStyle: string;      // How companion greets student
  teachingVoice: string;      // How companion explains concepts
  encouragementStyle: string; // How companion encourages
  transitionPhrasing: string; // How companion moves between sections
}

/**
 * Career Narrative
 * Defines the career context and workplace settings
 */
export interface CareerNarrative {
  careerIdentity: string;     // "You are a Chef in training"
  workplaceSettings: {
    LEARN: string;            // "The Chef's training kitchen"
    EXPERIENCE: string;       // "The restaurant's prep station during lunch service"
    DISCOVER: string;         // "The grand opening celebration"
  };
  professionalRole: string;   // "You're the newest member of the culinary team"
  careerGoal: string;         // "Master the skills to run your own station"
}

/**
 * Subject Narrative
 * Defines how each subject connects to the career
 */
export interface SubjectNarrative {
  careerStoryline: string;      // "Chefs count ingredients to create perfect dishes"
  narrativeBridge: string;      // How this subject connects to career story
  motivationalContext: string;  // Why this matters in the story
}

/**
 * Container Transitions
 * Smooth narrative transitions between containers
 */
export interface ContainerTransitions {
  toLEARN: string;      // "Let's start your training in the kitchen..."
  toEXPERIENCE: string; // "Now that you've learned the basics, let's apply them during service..."
  toDISCOVER: string;   // "For the grand opening, you'll need to use ALL your skills..."
  conclusion: string;   // "You've shown you have what it takes to be a great Chef!"
}

/**
 * Thematic Elements
 * Consistent tone, vocabulary, and metaphors throughout the story
 */
export interface ThematicElements {
  tone: string;              // "Encouraging, hands-on, professional"
  vocabulary: string[];      // Career-specific terms to use consistently
  metaphors: string[];       // Story metaphors ("like preparing a recipe", etc.)
  culturalContext: string;   // Grade-appropriate career context
}
