/**
 * Career AI Rules Engine
 * Manages all career-specific rules, adaptations, and contextualizations
 * This is a CRITICAL engine that was missing from our initial architecture
 */

import { BaseRulesEngine, Rule, RuleContext, RuleResult } from '../core/BaseRulesEngine';

// ============================================================================
// CAREER CONTEXT DEFINITIONS
// ============================================================================

export interface CareerContext extends RuleContext {
  career: {
    id: string;
    name: CareerType;
    category: CareerCategory;
  };
  student: {
    id: string;
    grade: string;
    age?: number;
    interests?: string[];
    strengths?: string[];
  };
  activity?: {
    type: 'learn' | 'experience' | 'discover';
    subject: string;
    topic: string;
  };
  contentAdaptation?: {
    vocabularyLevel: 'basic' | 'intermediate' | 'advanced';
    complexityLevel: 'simple' | 'moderate' | 'complex';
    realWorldConnection: boolean;
  };
}

export type CareerType = 
  | 'Doctor' | 'Teacher' | 'Scientist' | 'Engineer' | 'Artist'
  | 'Chef' | 'Athlete' | 'Musician' | 'Writer' | 'Veterinarian'
  | 'Pilot' | 'Farmer' | 'Police Officer' | 'Firefighter' | 'Astronaut';

export type CareerCategory = 
  | 'Healthcare' | 'Education' | 'STEM' | 'Arts' | 'Service' 
  | 'Sports' | 'Technology' | 'Nature' | 'Public Safety' | 'Exploration';

export interface CareerProfile {
  id: string;
  name: CareerType;
  category: CareerCategory;
  description: string;
  skills: string[];
  tools: string[];
  environments: string[];
  vocabulary: Map<string, string[]>; // subject -> vocabulary
  scenarios: Map<string, string[]>; // subject -> scenarios
  visualTheme: {
    primaryColor: string;
    icon: string;
    backgroundImage?: string;
  };
  roleModels: {
    name: string;
    achievement: string;
    quote: string;
  }[];
  pathways: {
    education: string[];
    experience: string[];
    certifications: string[];
  };
  dailyActivities: string[];
  challenges: string[];
  rewards: string[];
}

export interface CareerAdaptationRules {
  vocabulary: VocabularyAdaptationRules;
  scenarios: ScenarioGenerationRules;
  visuals: VisualThemingRules;
  messaging: MessagingAdaptationRules;
  difficulty: DifficultyAdjustmentRules;
}

export interface VocabularyAdaptationRules {
  substitutions: Map<string, Map<CareerType, string>>; // generic term -> career -> specific term
  additions: Map<CareerType, string[]>; // career -> additional terms
  complexity: Map<string, 'basic' | 'technical'>; // term -> complexity level
}

export interface ScenarioGenerationRules {
  templates: Map<string, string[]>; // subject -> templates
  contextLevel: 'light' | 'moderate' | 'heavy';
  includeTools: boolean;
  includeEnvironment: boolean;
  includeRoleModel: boolean;
}

export interface VisualThemingRules {
  useCareerColors: boolean;
  includeCareerIcons: boolean;
  backgroundTheming: boolean;
  characterCustomization: boolean;
}

export interface MessagingAdaptationRules {
  greetingStyle: Map<CareerType, string[]>;
  encouragementStyle: Map<CareerType, string[]>;
  celebrationStyle: Map<CareerType, string[]>;
  instructionStyle: Map<CareerType, string[]>;
}

export interface DifficultyAdjustmentRules {
  careerComplexity: Map<CareerType, number>; // 1-10 scale
  gradeAdjustment: Map<string, number>; // grade -> adjustment factor
  prerequisiteSkills: Map<CareerType, string[]>;
}

export interface CareerProgressionRules {
  exposureLevel: 'introduction' | 'exploration' | 'immersion';
  unlockCriteria: Map<string, any>;
  badgeSystem: CareerBadgeRules;
  mentorship: MentorshipRules;
}

export interface CareerBadgeRules {
  badges: Map<CareerType, CareerBadge[]>;
  requirements: Map<string, any>;
  display: 'prominent' | 'subtle';
}

export interface CareerBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirements: string[];
  xpReward: number;
}

export interface MentorshipRules {
  virtualMentor: boolean;
  mentorPersonality: Map<CareerType, string>;
  guidanceFrequency: 'always' | 'periodic' | 'on-request';
  expertInsights: boolean;
}

// ============================================================================
// CAREER AI RULES ENGINE
// ============================================================================

export class CareerAIRulesEngine extends BaseRulesEngine<CareerContext> {
  private careerProfiles: Map<CareerType, CareerProfile>;
  private adaptationRules: CareerAdaptationRules;
  private progressionRules: CareerProgressionRules;
  private careerJourneys: Map<string, CareerJourney> = new Map();
  
  constructor() {
    super('CareerAIRulesEngine', {
      name: 'Career AI Rules Engine',
      description: 'Manages career-specific adaptations and contextualizations'
    });
    
    this.careerProfiles = this.initializeCareerProfiles();
    this.adaptationRules = this.initializeAdaptationRules();
    this.progressionRules = this.initializeProgressionRules();
  }
  
  /**
   * Register career-specific rules
   */
  protected registerRules(): void {
    // Rule: Select career profile
    this.addRuleInternal({
      id: 'select_career_profile',
      name: 'Select Career Profile',
      priority: 1,
      condition: (context) => !!context.career,
      action: (context) => this.selectCareerProfile(context)
    });
    
    // Rule: Adapt vocabulary
    this.addRuleInternal({
      id: 'adapt_vocabulary',
      name: 'Adapt Vocabulary for Career',
      priority: 2,
      condition: (context) => !!context.activity,
      action: (context) => this.adaptVocabulary(context)
    });
    
    // Rule: Generate career scenario
    this.addRuleInternal({
      id: 'generate_scenario',
      name: 'Generate Career Scenario',
      priority: 3,
      condition: (context) => !!context.activity && context.contentAdaptation?.realWorldConnection,
      action: (context) => this.generateScenario(context)
    });
    
    // Rule: Apply visual theming
    this.addRuleInternal({
      id: 'apply_visual_theme',
      name: 'Apply Career Visual Theme',
      priority: 4,
      condition: (context) => true,
      action: (context) => this.applyVisualTheme(context)
    });
    
    // Rule: Customize messaging
    this.addRuleInternal({
      id: 'customize_messaging',
      name: 'Customize Career Messaging',
      priority: 5,
      condition: (context) => true,
      action: (context) => this.customizeMessaging(context)
    });
    
    // Rule: Adjust difficulty
    this.addRuleInternal({
      id: 'adjust_difficulty',
      name: 'Adjust Difficulty for Career',
      priority: 6,
      condition: (context) => !!context.student.grade_level,
      action: (context) => this.adjustDifficulty(context)
    });
    
    // Rule: Track career exposure
    this.addRuleInternal({
      id: 'track_exposure',
      name: 'Track Career Exposure',
      priority: 7,
      condition: (context) => !!context.student.id,
      action: (context) => this.trackCareerExposure(context)
    });
    
    // Rule: Award career badges
    this.addRuleInternal({
      id: 'award_badges',
      name: 'Award Career Badges',
      priority: 8,
      condition: (context) => !!context.student.id,
      action: (context) => this.checkAndAwardBadges(context)
    });
    
    // Rule: Provide mentorship
    this.addRuleInternal({
      id: 'provide_mentorship',
      name: 'Provide Career Mentorship',
      priority: 9,
      condition: (context) => this.progressionRules.mentorship.virtualMentor,
      action: (context) => this.provideMentorship(context)
    });
    
    // Rule: Connect to role models
    this.addRuleInternal({
      id: 'connect_role_models',
      name: 'Connect to Role Models',
      priority: 10,
      condition: (context) => !!context.career,
      action: (context) => this.connectToRoleModels(context)
    });
  }
  
  /**
   * Initialize all 15 career profiles
   */
  private initializeCareerProfiles(): Map<CareerType, CareerProfile> {
    const profiles = new Map<CareerType, CareerProfile>();
    
    // DOCTOR
    profiles.set('Doctor', {
      id: 'doctor',
      name: 'Doctor',
      category: 'Healthcare',
      description: 'Doctors help people stay healthy and treat illnesses',
      skills: ['diagnosis', 'treatment', 'patient care', 'medical knowledge'],
      tools: ['stethoscope', 'thermometer', 'x-ray machine', 'medicine'],
      environments: ['hospital', 'clinic', 'emergency room', 'office'],
      vocabulary: new Map([
        ['math', ['patients', 'doses', 'temperature', 'heartbeats', 'measurements']],
        ['science', ['body', 'health', 'medicine', 'symptoms', 'treatment']],
        ['ela', ['medical chart', 'prescription', 'health report', 'patient notes']],
        ['social_studies', ['hospital', 'healthcare', 'community health', 'medical history']]
      ]),
      scenarios: new Map([
        ['math', ['Dr. Smith needs to calculate medicine doses...', 'The hospital has 45 patients...']],
        ['science', ['A patient comes in with symptoms...', 'We need to understand how the body works...']],
        ['ela', ['Write a patient report...', 'Read the medical instructions...']],
        ['social_studies', ['Learn about healthcare in different countries...', 'How hospitals help communities...']]
      ]),
      visualTheme: {
        primaryColor: '#10B981',
        icon: '🏥',
        backgroundImage: 'hospital-theme'
      },
      roleModels: [
        { name: 'Dr. Mae Jemison', achievement: 'First African American woman astronaut and physician', quote: 'Never limit yourself!' },
        { name: 'Dr. Jonas Salk', achievement: 'Developed the polio vaccine', quote: 'Hope lies in dreams and courage' }
      ],
      pathways: {
        education: ['biology', 'chemistry', 'medical school'],
        experience: ['volunteer at hospital', 'shadow doctors', 'first aid training'],
        certifications: ['CPR', 'medical license', 'specialization']
      },
      dailyActivities: ['examining patients', 'reviewing test results', 'prescribing medicine', 'surgery'],
      challenges: ['long hours', 'difficult decisions', 'continuous learning'],
      rewards: ['saving lives', 'helping people', 'respect', 'good salary']
    });
    
    // TEACHER
    profiles.set('Teacher', {
      id: 'teacher',
      name: 'Teacher',
      category: 'Education',
      description: 'Teachers help students learn and grow',
      skills: ['instruction', 'patience', 'creativity', 'communication'],
      tools: ['whiteboard', 'books', 'computer', 'art supplies'],
      environments: ['classroom', 'library', 'playground', 'lab'],
      vocabulary: new Map([
        ['math', ['students', 'groups', 'books', 'pencils', 'desks']],
        ['science', ['experiment', 'observe', 'hypothesis', 'discover']],
        ['ela', ['lesson', 'story', 'reading', 'writing', 'vocabulary']],
        ['social_studies', ['classroom', 'school', 'education', 'learning']]
      ]),
      scenarios: new Map([
        ['math', ['Ms. Johnson has 24 students to divide into groups...', 'The class needs 5 books each...']],
        ['science', ['Let\'s do a science experiment...', 'Students observe plant growth...']],
        ['ela', ['Today we\'re reading a story about...', 'Write about your favorite subject...']],
        ['social_studies', ['Learn about schools around the world...', 'How education has changed...']]
      ]),
      visualTheme: {
        primaryColor: '#6366F1',
        icon: '🏫',
        backgroundImage: 'classroom-theme'
      },
      roleModels: [
        { name: 'Maria Montessori', achievement: 'Revolutionized early childhood education', quote: 'The child is the builder of man' },
        { name: 'Jaime Escalante', achievement: 'Inspired students to excel in mathematics', quote: 'Students will rise to the level of expectations' }
      ],
      pathways: {
        education: ['education degree', 'subject expertise', 'child development'],
        experience: ['tutoring', 'camp counselor', 'teaching assistant'],
        certifications: ['teaching license', 'subject certification', 'special education']
      },
      dailyActivities: ['lesson planning', 'teaching classes', 'grading papers', 'parent meetings'],
      challenges: ['diverse learners', 'limited resources', 'classroom management'],
      rewards: ['student success', 'making a difference', 'summers off', 'lifelong learning']
    });
    
    // SCIENTIST
    profiles.set('Scientist', {
      id: 'scientist',
      name: 'Scientist',
      category: 'STEM',
      description: 'Scientists discover new things about our world',
      skills: ['research', 'analysis', 'experimentation', 'critical thinking'],
      tools: ['microscope', 'beaker', 'computer', 'lab equipment'],
      environments: ['laboratory', 'field research', 'observatory', 'research station'],
      vocabulary: new Map([
        ['math', ['data', 'measurements', 'calculations', 'graphs', 'statistics']],
        ['science', ['hypothesis', 'experiment', 'observation', 'conclusion', 'theory']],
        ['ela', ['research paper', 'lab report', 'findings', 'abstract']],
        ['social_studies', ['scientific revolution', 'discoveries', 'innovation', 'global research']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate the results of the experiment...', 'Graph the data collected...']],
        ['science', ['Test your hypothesis about...', 'Observe changes in the experiment...']],
        ['ela', ['Write a lab report about...', 'Present your findings...']],
        ['social_studies', ['Learn about famous scientists...', 'How science changes the world...']]
      ]),
      visualTheme: {
        primaryColor: '#8B5CF6',
        icon: '🔬',
        backgroundImage: 'laboratory-theme'
      },
      roleModels: [
        { name: 'Marie Curie', achievement: 'First woman to win Nobel Prize', quote: 'Nothing in life is to be feared, it is only to be understood' },
        { name: 'George Washington Carver', achievement: 'Agricultural scientist and inventor', quote: 'Education is the key to unlock the golden door of freedom' }
      ],
      pathways: {
        education: ['science degree', 'research experience', 'PhD'],
        experience: ['science fair', 'lab internship', 'research assistant'],
        certifications: ['lab safety', 'specialized equipment', 'research ethics']
      },
      dailyActivities: ['conducting experiments', 'analyzing data', 'writing papers', 'presenting findings'],
      challenges: ['complex problems', 'failed experiments', 'funding', 'peer review'],
      rewards: ['discoveries', 'publications', 'solving problems', 'advancing knowledge']
    });
    
    // ENGINEER
    profiles.set('Engineer', {
      id: 'engineer',
      name: 'Engineer',
      category: 'STEM',
      description: 'Engineers design and build things that solve problems',
      skills: ['problem-solving', 'design', 'mathematics', 'creativity'],
      tools: ['computer', 'blueprint', 'calculator', '3D printer', 'CAD software'],
      environments: ['office', 'construction site', 'factory', 'lab'],
      vocabulary: new Map([
        ['math', ['measurements', 'angles', 'calculations', 'dimensions', 'force']],
        ['science', ['materials', 'structure', 'energy', 'mechanics', 'systems']],
        ['ela', ['blueprint', 'specifications', 'proposal', 'documentation']],
        ['social_studies', ['infrastructure', 'innovation', 'technology', 'development']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate the strength needed for the bridge...', 'Measure the angles for the design...']],
        ['science', ['Choose the best material for...', 'Test how the structure holds weight...']],
        ['ela', ['Write specifications for the project...', 'Read the building requirements...']],
        ['social_studies', ['Learn about famous engineering projects...', 'How engineers improve cities...']]
      ]),
      visualTheme: {
        primaryColor: '#F59E0B',
        icon: '⚙️',
        backgroundImage: 'engineering-theme'
      },
      roleModels: [
        { name: 'Hedy Lamarr', achievement: 'Actress and inventor of frequency hopping', quote: 'Hope and curiosity about the future seemed better than guarantees' },
        { name: 'Lonnie Johnson', achievement: 'Invented the Super Soaker and worked on spacecraft', quote: 'Persistence is the key to success' }
      ],
      pathways: {
        education: ['engineering degree', 'mathematics', 'physics'],
        experience: ['robotics club', 'building projects', 'coding'],
        certifications: ['professional engineer', 'CAD certification', 'project management']
      },
      dailyActivities: ['designing solutions', 'testing prototypes', 'solving problems', 'collaborating'],
      challenges: ['complex problems', 'tight deadlines', 'budget constraints', 'safety requirements'],
      rewards: ['creating innovations', 'solving problems', 'good salary', 'seeing ideas built']
    });
    
    // ARTIST
    profiles.set('Artist', {
      id: 'artist',
      name: 'Artist',
      category: 'Arts',
      description: 'Artists create beautiful things and express ideas through art',
      skills: ['creativity', 'observation', 'technique', 'expression'],
      tools: ['paintbrush', 'canvas', 'pencil', 'clay', 'digital tablet'],
      environments: ['studio', 'gallery', 'outdoor', 'digital space'],
      vocabulary: new Map([
        ['math', ['shapes', 'patterns', 'symmetry', 'proportions', 'angles']],
        ['science', ['colors', 'light', 'materials', 'textures', 'chemistry of paint']],
        ['ela', ['describe', 'interpret', 'critique', 'artist statement']],
        ['social_studies', ['art history', 'culture', 'movements', 'influence']]
      ]),
      scenarios: new Map([
        ['math', ['Create a pattern using shapes...', 'Draw with perfect proportions...']],
        ['science', ['Mix colors to create...', 'Understand how light affects art...']],
        ['ela', ['Write about your artwork...', 'Describe what you see in the painting...']],
        ['social_studies', ['Learn about art from different cultures...', 'How art reflects history...']]
      ]),
      visualTheme: {
        primaryColor: '#EC4899',
        icon: '🎨',
        backgroundImage: 'art-studio-theme'
      },
      roleModels: [
        { name: 'Frida Kahlo', achievement: 'Iconic Mexican artist', quote: 'I paint my own reality' },
        { name: 'Jean-Michel Basquiat', achievement: 'Neo-expressionist artist', quote: 'I don\'t think about art when I\'m working' }
      ],
      pathways: {
        education: ['art school', 'workshops', 'self-taught'],
        experience: ['practice daily', 'art shows', 'commissions'],
        certifications: ['fine arts degree', 'specialized techniques', 'digital arts']
      },
      dailyActivities: ['creating artwork', 'sketching ideas', 'preparing materials', 'exhibitions'],
      challenges: ['creative blocks', 'criticism', 'financial stability', 'competition'],
      rewards: ['self-expression', 'touching hearts', 'exhibitions', 'creative freedom']
    });
    
    // CHEF
    profiles.set('Chef', {
      id: 'chef',
      name: 'Chef',
      category: 'Service',
      description: 'Chefs create delicious meals and run kitchens',
      skills: ['cooking', 'creativity', 'time management', 'taste'],
      tools: ['knife', 'pan', 'oven', 'mixer', 'ingredients'],
      environments: ['kitchen', 'restaurant', 'bakery', 'food truck'],
      vocabulary: new Map([
        ['math', ['measurements', 'portions', 'temperature', 'time', 'servings']],
        ['science', ['heat', 'chemical reactions', 'nutrition', 'food safety']],
        ['ela', ['recipe', 'menu', 'instructions', 'food description']],
        ['social_studies', ['cuisine', 'food culture', 'traditions', 'global dishes']]
      ]),
      scenarios: new Map([
        ['math', ['Measure ingredients for 20 servings...', 'Calculate cooking time...']],
        ['science', ['Understand how heat changes food...', 'Learn about nutrition...']],
        ['ela', ['Write a new recipe...', 'Read cooking instructions...']],
        ['social_studies', ['Explore foods from different countries...', 'Learn food history...']]
      ]),
      visualTheme: {
        primaryColor: '#EF4444',
        icon: '👨‍🍳',
        backgroundImage: 'kitchen-theme'
      },
      roleModels: [
        { name: 'Julia Child', achievement: 'Brought French cuisine to America', quote: 'People who love to eat are always the best people' },
        { name: 'Gordon Ramsay', achievement: 'Michelin star chef', quote: 'Push your limits and challenge yourself' }
      ],
      pathways: {
        education: ['culinary school', 'apprenticeship', 'food science'],
        experience: ['home cooking', 'restaurant work', 'food competitions'],
        certifications: ['food safety', 'culinary arts', 'specialized cuisine']
      },
      dailyActivities: ['preparing ingredients', 'cooking dishes', 'creating menus', 'managing kitchen'],
      challenges: ['long hours', 'high pressure', 'physical demands', 'consistency'],
      rewards: ['creating joy', 'artistic expression', 'immediate feedback', 'feeding people']
    });
    
    // ATHLETE
    profiles.set('Athlete', {
      id: 'athlete',
      name: 'Athlete',
      category: 'Sports',
      description: 'Athletes train hard and compete in sports',
      skills: ['physical fitness', 'dedication', 'teamwork', 'strategy'],
      tools: ['equipment', 'training gear', 'stopwatch', 'playbook'],
      environments: ['field', 'court', 'gym', 'stadium'],
      vocabulary: new Map([
        ['math', ['scores', 'statistics', 'time', 'distance', 'speed']],
        ['science', ['muscles', 'energy', 'nutrition', 'physics of motion']],
        ['ela', ['playbook', 'strategy', 'sports report', 'interview']],
        ['social_studies', ['Olympics', 'sports history', 'teamwork', 'sportsmanship']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate batting average...', 'Track running times...']],
        ['science', ['Learn how muscles work...', 'Understand sports nutrition...']],
        ['ela', ['Write about the game...', 'Read the team strategy...']],
        ['social_studies', ['Learn about Olympic history...', 'How sports unite people...']]
      ]),
      visualTheme: {
        primaryColor: '#0EA5E9',
        icon: '🏃',
        backgroundImage: 'sports-theme'
      },
      roleModels: [
        { name: 'Serena Williams', achievement: '23 Grand Slam singles titles', quote: 'I really think a champion is defined not by their wins but by how they can recover' },
        { name: 'Muhammad Ali', achievement: 'Boxing legend and activist', quote: 'Float like a butterfly, sting like a bee' }
      ],
      pathways: {
        education: ['sports training', 'kinesiology', 'sports management'],
        experience: ['youth sports', 'school teams', 'competitions'],
        certifications: ['coaching', 'fitness training', 'sports medicine']
      },
      dailyActivities: ['training', 'practicing skills', 'competing', 'recovery'],
      challenges: ['injuries', 'competition', 'maintaining peak performance', 'career length'],
      rewards: ['achievement', 'teamwork', 'fitness', 'inspiration']
    });
    
    // MUSICIAN
    profiles.set('Musician', {
      id: 'musician',
      name: 'Musician',
      category: 'Arts',
      description: 'Musicians create and perform music',
      skills: ['rhythm', 'melody', 'practice', 'performance'],
      tools: ['instruments', 'sheet music', 'recording equipment', 'metronome'],
      environments: ['studio', 'concert hall', 'practice room', 'stage'],
      vocabulary: new Map([
        ['math', ['beats', 'measures', 'tempo', 'rhythm', 'fractions']],
        ['science', ['sound waves', 'frequency', 'acoustics', 'vibration']],
        ['ela', ['lyrics', 'composition', 'musical notation', 'performance notes']],
        ['social_studies', ['music history', 'cultural music', 'influence', 'genres']]
      ]),
      scenarios: new Map([
        ['math', ['Count beats in a measure...', 'Calculate note values...']],
        ['science', ['Learn how instruments make sound...', 'Understand acoustics...']],
        ['ela', ['Write song lyrics...', 'Read sheet music...']],
        ['social_studies', ['Explore music from different cultures...', 'How music shapes society...']]
      ]),
      visualTheme: {
        primaryColor: '#A855F7',
        icon: '🎵',
        backgroundImage: 'music-theme'
      },
      roleModels: [
        { name: 'Beyoncé', achievement: 'Multi-Grammy winning artist', quote: 'The most alluring thing a woman can have is confidence' },
        { name: 'Yo-Yo Ma', achievement: 'World-renowned cellist', quote: "The thing that I've always been slightly obsessed with is the idea of human potential" }
      ],
      pathways: {
        education: ['music lessons', 'music school', 'music theory'],
        experience: ['practice daily', 'performances', 'bands/orchestras'],
        certifications: ['music degree', 'instrument mastery', 'music production']
      },
      dailyActivities: ['practicing instrument', 'composing', 'performing', 'recording'],
      challenges: ['constant practice', 'performance anxiety', 'competition', 'irregular income'],
      rewards: ['artistic expression', 'connecting with audiences', 'creativity', 'joy of music']
    });
    
    // WRITER
    profiles.set('Writer', {
      id: 'writer',
      name: 'Writer',
      category: 'Arts',
      description: 'Writers create stories, articles, and books',
      skills: ['creativity', 'vocabulary', 'grammar', 'storytelling'],
      tools: ['computer', 'notebook', 'pen', 'dictionary', 'research materials'],
      environments: ['office', 'library', 'café', 'home'],
      vocabulary: new Map([
        ['math', ['chapters', 'pages', 'word count', 'deadlines', 'editions']],
        ['science', ['research', 'fact-checking', 'documentation', 'technical writing']],
        ['ela', ['plot', 'character', 'setting', 'dialogue', 'narrative']],
        ['social_studies', ['journalism', 'history', 'culture', 'current events']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate pages for each chapter...', 'Track daily word count...']],
        ['science', ['Research facts for the story...', 'Write about scientific topics...']],
        ['ela', ['Create an interesting character...', 'Write dialogue between characters...']],
        ['social_studies', ['Write about historical events...', 'Report on current news...']]
      ]),
      visualTheme: {
        primaryColor: '#06B6D4',
        icon: '✏️',
        backgroundImage: 'writing-theme'
      },
      roleModels: [
        { name: 'Maya Angelou', achievement: 'Poet and civil rights activist', quote: 'There is no greater agony than bearing an untold story inside you' },
        { name: 'J.K. Rowling', achievement: 'Harry Potter author', quote: 'Rock bottom became the solid foundation on which I rebuilt my life' }
      ],
      pathways: {
        education: ['english degree', 'creative writing', 'journalism'],
        experience: ['blogging', 'school newspaper', 'writing contests'],
        certifications: ['writing workshops', 'MFA', 'specialized genres']
      },
      dailyActivities: ['writing', 'editing', 'researching', 'reading'],
      challenges: ['writer\'s block', 'rejection', 'deadlines', 'solitary work'],
      rewards: ['sharing stories', 'influencing minds', 'creative freedom', 'legacy']
    });
    
    // VETERINARIAN
    profiles.set('Veterinarian', {
      id: 'veterinarian',
      name: 'Veterinarian',
      category: 'Healthcare',
      description: 'Veterinarians take care of animals\' health',
      skills: ['animal care', 'medical knowledge', 'compassion', 'problem-solving'],
      tools: ['stethoscope', 'x-ray', 'medicine', 'surgical tools'],
      environments: ['animal clinic', 'zoo', 'farm', 'animal hospital'],
      vocabulary: new Map([
        ['math', ['doses', 'weight', 'measurements', 'appointments', 'costs']],
        ['science', ['animal biology', 'diseases', 'treatments', 'behavior']],
        ['ela', ['medical records', 'care instructions', 'pet owner communication']],
        ['social_studies', ['animal welfare', 'conservation', 'pet ownership', 'wildlife']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate medicine dose for a 50-pound dog...', 'Schedule appointments for pets...']],
        ['science', ['Diagnose what\'s wrong with the animal...', 'Learn about different species...']],
        ['ela', ['Write care instructions for pet owners...', 'Read animal medical journals...']],
        ['social_studies', ['Learn about animal protection laws...', 'How vets help wildlife...']]
      ]),
      visualTheme: {
        primaryColor: '#84CC16',
        icon: '🐾',
        backgroundImage: 'veterinary-theme'
      },
      roleModels: [
        { name: 'Dr. Jane Goodall', achievement: 'Primatologist and conservationist', quote: 'What you do makes a difference' },
        { name: 'Dr. Evan Antin', achievement: 'Wildlife veterinarian', quote: 'Every animal deserves compassionate care' }
      ],
      pathways: {
        education: ['biology', 'veterinary school', 'animal science'],
        experience: ['volunteer at shelter', 'work with animals', 'veterinary assistant'],
        certifications: ['veterinary license', 'specializations', 'exotic animals']
      },
      dailyActivities: ['examining animals', 'surgery', 'prescribing treatments', 'owner education'],
      challenges: ['emotional cases', 'difficult diagnoses', 'animal behavior', 'owner concerns'],
      rewards: ['saving animals', 'pet-owner bonds', 'variety of cases', 'animal gratitude']
    });
    
    // PILOT
    profiles.set('Pilot', {
      id: 'pilot',
      name: 'Pilot',
      category: 'Technology',
      description: 'Pilots fly airplanes and transport people safely',
      skills: ['navigation', 'decision-making', 'technical knowledge', 'communication'],
      tools: ['aircraft', 'navigation systems', 'radio', 'flight computer'],
      environments: ['cockpit', 'airport', 'simulator', 'hangar'],
      vocabulary: new Map([
        ['math', ['altitude', 'speed', 'distance', 'fuel calculations', 'angles']],
        ['science', ['aerodynamics', 'weather', 'physics', 'navigation']],
        ['ela', ['flight plan', 'radio communication', 'aviation reports', 'checklists']],
        ['social_studies', ['geography', 'international travel', 'aviation history', 'time zones']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate fuel needed for the flight...', 'Determine arrival time...']],
        ['science', ['Understand how planes fly...', 'Read weather patterns...']],
        ['ela', ['Communicate with air traffic control...', 'Write flight reports...']],
        ['social_studies', ['Navigate using geography...', 'Learn aviation history...']]
      ]),
      visualTheme: {
        primaryColor: '#3B82F6',
        icon: '✈️',
        backgroundImage: 'aviation-theme'
      },
      roleModels: [
        { name: 'Amelia Earhart', achievement: 'First woman to fly solo across Atlantic', quote: 'Adventure is worthwhile in itself' },
        { name: 'Chesley Sullenberger', achievement: 'Miracle on the Hudson pilot', quote: 'We never know what we\'re truly capable of' }
      ],
      pathways: {
        education: ['flight school', 'aviation degree', 'military training'],
        experience: ['flight hours', 'simulator training', 'small aircraft'],
        certifications: ['pilot license', 'instrument rating', 'type ratings']
      },
      dailyActivities: ['pre-flight checks', 'flying', 'navigation', 'communication'],
      challenges: ['weather conditions', 'responsibility', 'irregular schedule', 'jet lag'],
      rewards: ['travel', 'views', 'responsibility', 'adventure']
    });
    
    // FARMER
    profiles.set('Farmer', {
      id: 'farmer',
      name: 'Farmer',
      category: 'Nature',
      description: 'Farmers grow food and raise animals',
      skills: ['agriculture', 'animal care', 'business', 'problem-solving'],
      tools: ['tractor', 'seeds', 'irrigation', 'harvester'],
      environments: ['field', 'barn', 'greenhouse', 'orchard'],
      vocabulary: new Map([
        ['math', ['acres', 'yield', 'costs', 'profit', 'measurements']],
        ['science', ['soil', 'crops', 'seasons', 'biology', 'weather']],
        ['ela', ['farm journal', 'crop reports', 'market analysis', 'instructions']],
        ['social_studies', ['agriculture history', 'food systems', 'sustainability', 'markets']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate seeds needed for 10 acres...', 'Determine harvest profit...']],
        ['science', ['Test soil for planting...', 'Understand plant growth...']],
        ['ela', ['Write about farming seasons...', 'Read weather reports...']],
        ['social_studies', ['Learn how farms feed communities...', 'Agricultural traditions...']]
      ]),
      visualTheme: {
        primaryColor: '#65A30D',
        icon: '🌾',
        backgroundImage: 'farm-theme'
      },
      roleModels: [
        { name: 'George Washington Carver', achievement: 'Agricultural scientist', quote: 'Education is the key to unlock the golden door' },
        { name: 'Temple Grandin', achievement: 'Animal scientist', quote: 'Different, not less' }
      ],
      pathways: {
        education: ['agriculture degree', 'business', 'environmental science'],
        experience: ['4-H', 'farm work', 'gardening'],
        certifications: ['organic farming', 'agricultural business', 'equipment operation']
      },
      dailyActivities: ['planting', 'harvesting', 'animal care', 'equipment maintenance'],
      challenges: ['weather dependence', 'physical work', 'market prices', 'long hours'],
      rewards: ['feeding people', 'working outdoors', 'independence', 'connection to land']
    });
    
    // POLICE OFFICER
    profiles.set('Police Officer', {
      id: 'police_officer',
      name: 'Police Officer',
      category: 'Public Safety',
      description: 'Police officers protect and serve communities',
      skills: ['law enforcement', 'communication', 'problem-solving', 'physical fitness'],
      tools: ['badge', 'radio', 'patrol car', 'safety equipment'],
      environments: ['patrol', 'station', 'community', 'court'],
      vocabulary: new Map([
        ['math', ['speed', 'distance', 'time', 'statistics', 'patterns']],
        ['science', ['investigation', 'evidence', 'forensics', 'safety']],
        ['ela', ['reports', 'laws', 'testimony', 'communication']],
        ['social_studies', ['community', 'justice', 'civic duty', 'law']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate patrol routes...', 'Analyze crime statistics...']],
        ['science', ['Collect evidence at a scene...', 'Use safety equipment...']],
        ['ela', ['Write incident reports...', 'Read and understand laws...']],
        ['social_studies', ['Serve the community...', 'Learn about justice system...']]
      ]),
      visualTheme: {
        primaryColor: '#1E40AF',
        icon: '👮',
        backgroundImage: 'police-theme'
      },
      roleModels: [
        { name: 'Beverly Harvard', achievement: 'First African American female police chief', quote: 'Leadership is about service' },
        { name: 'Frank Serpico', achievement: 'Exposed police corruption', quote: 'The problem is that the atmosphere does not yet exist' }
      ],
      pathways: {
        education: ['criminal justice', 'police academy', 'law enforcement'],
        experience: ['community service', 'security', 'military'],
        certifications: ['police training', 'specialized units', 'detective']
      },
      dailyActivities: ['patrolling', 'responding to calls', 'investigations', 'community engagement'],
      challenges: ['dangerous situations', 'difficult decisions', 'stress', 'public scrutiny'],
      rewards: ['helping people', 'making communities safe', 'justice', 'respect']
    });
    
    // FIREFIGHTER
    profiles.set('Firefighter', {
      id: 'firefighter',
      name: 'Firefighter',
      category: 'Public Safety',
      description: 'Firefighters save lives and protect property from fires',
      skills: ['bravery', 'physical strength', 'teamwork', 'quick thinking'],
      tools: ['fire truck', 'hose', 'ladder', 'protective gear'],
      environments: ['fire station', 'emergency scenes', 'training facility', 'community'],
      vocabulary: new Map([
        ['math', ['water pressure', 'ladder angles', 'response time', 'building heights']],
        ['science', ['fire chemistry', 'heat', 'smoke', 'building materials']],
        ['ela', ['emergency protocols', 'incident reports', 'safety instructions']],
        ['social_studies', ['fire safety', 'community service', 'emergency response', 'prevention']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate water needed to fight fire...', 'Determine ladder angle to reach window...']],
        ['science', ['Understand how fire spreads...', 'Learn about fire-resistant materials...']],
        ['ela', ['Write fire incident report...', 'Read emergency procedures...']],
        ['social_studies', ['Teach fire safety to community...', 'Learn fire prevention history...']]
      ]),
      visualTheme: {
        primaryColor: '#DC2626',
        icon: '🚒',
        backgroundImage: 'fire-station-theme'
      },
      roleModels: [
        { name: 'Molly Williams', achievement: 'First known female firefighter in US', quote: 'Courage is not the absence of fear' },
        { name: 'Red Adair', achievement: 'Famous oil well firefighter', quote: 'If you think it\'s expensive to hire a professional' }
      ],
      pathways: {
        education: ['fire science', 'EMT training', 'fire academy'],
        experience: ['volunteer firefighter', 'EMT', 'physical training'],
        certifications: ['firefighter certification', 'EMT', 'hazmat', 'rescue']
      },
      dailyActivities: ['equipment maintenance', 'training', 'emergency response', 'community education'],
      challenges: ['dangerous work', 'physical demands', 'emotional stress', '24-hour shifts'],
      rewards: ['saving lives', 'heroism', 'teamwork', 'community respect']
    });
    
    // ASTRONAUT
    profiles.set('Astronaut', {
      id: 'astronaut',
      name: 'Astronaut',
      category: 'Exploration',
      description: 'Astronauts explore space and conduct research',
      skills: ['science', 'engineering', 'physical fitness', 'problem-solving'],
      tools: ['spacecraft', 'spacesuit', 'computers', 'scientific instruments'],
      environments: ['space station', 'spacecraft', 'training center', 'mission control'],
      vocabulary: new Map([
        ['math', ['orbit', 'velocity', 'trajectory', 'calculations', 'coordinates']],
        ['science', ['gravity', 'atmosphere', 'physics', 'experiments', 'space']],
        ['ela', ['mission logs', 'research papers', 'communication', 'procedures']],
        ['social_studies', ['space exploration', 'international cooperation', 'history', 'discovery']]
      ]),
      scenarios: new Map([
        ['math', ['Calculate orbital trajectory...', 'Determine fuel requirements...']],
        ['science', ['Conduct experiments in zero gravity...', 'Study effects of space...']],
        ['ela', ['Write mission reports...', 'Communicate with mission control...']],
        ['social_studies', ['Learn space exploration history...', 'International space cooperation...']]
      ]),
      visualTheme: {
        primaryColor: '#7C3AED',
        icon: '🚀',
        backgroundImage: 'space-theme'
      },
      roleModels: [
        { name: 'Sally Ride', achievement: 'First American woman in space', quote: 'Reach for the stars' },
        { name: 'Neil Armstrong', achievement: 'First person on the moon', quote: 'One small step for man, one giant leap for mankind' }
      ],
      pathways: {
        education: ['STEM degree', 'advanced degree', 'pilot training'],
        experience: ['military pilot', 'scientist', 'engineer', 'physical fitness'],
        certifications: ['NASA selection', 'space training', 'specialized missions']
      },
      dailyActivities: ['training', 'experiments', 'maintenance', 'exercise'],
      challenges: ['extreme danger', 'isolation', 'physical effects', 'selection competition'],
      rewards: ['exploration', 'advancing science', 'unique experience', 'inspiring others']
    });
    
    return profiles;
  }
  
  /**
   * Initialize adaptation rules
   */
  private initializeAdaptationRules(): CareerAdaptationRules {
    // Vocabulary substitutions
    const substitutions = new Map<string, Map<CareerType, string>>();
    
    // Example: "items" can be replaced with career-specific terms
    const itemsMap = new Map<CareerType, string>([
      ['Doctor', 'patients'],
      ['Teacher', 'students'],
      ['Chef', 'ingredients'],
      ['Scientist', 'samples'],
      ['Engineer', 'components'],
      ['Artist', 'colors'],
      ['Athlete', 'equipment'],
      ['Musician', 'instruments'],
      ['Writer', 'chapters'],
      ['Veterinarian', 'animals'],
      ['Pilot', 'passengers'],
      ['Farmer', 'crops'],
      ['Police Officer', 'cases'],
      ['Firefighter', 'emergencies'],
      ['Astronaut', 'experiments']
    ]);
    substitutions.set('items', itemsMap);
    
    // Messaging styles
    const greetingStyle = new Map<CareerType, string[]>();
    greetingStyle.set('Doctor', ['Ready to help patients today?', 'Let\'s learn about health!']);
    greetingStyle.set('Teacher', ['Welcome to class!', 'Ready to learn something new?']);
    greetingStyle.set('Scientist', ['Let\'s discover something amazing!', 'Time for experiments!']);
    greetingStyle.set('Engineer', ['Let\'s build something great!', 'Time to solve problems!']);
    greetingStyle.set('Artist', ['Let\'s create something beautiful!', 'Time to express yourself!']);
    
    return {
      vocabulary: {
        substitutions,
        additions: new Map(),
        complexity: new Map()
      },
      scenarios: {
        templates: new Map(),
        contextLevel: 'moderate',
        includeTools: true,
        includeEnvironment: true,
        includeRoleModel: false
      },
      visuals: {
        useCareerColors: true,
        includeCareerIcons: true,
        backgroundTheming: true,
        characterCustomization: true
      },
      messaging: {
        greetingStyle,
        encouragementStyle: new Map(),
        celebrationStyle: new Map(),
        instructionStyle: new Map()
      },
      difficulty: {
        careerComplexity: new Map([
          ['Doctor', 8],
          ['Teacher', 5],
          ['Scientist', 8],
          ['Engineer', 7],
          ['Artist', 4],
          ['Chef', 5],
          ['Athlete', 4],
          ['Musician', 5],
          ['Writer', 6],
          ['Veterinarian', 7],
          ['Pilot', 8],
          ['Farmer', 5],
          ['Police Officer', 6],
          ['Firefighter', 6],
          ['Astronaut', 10]
        ]),
        gradeAdjustment: new Map([
          ['K', 0.5],
          ['1', 0.6],
          ['2', 0.7],
          ['3', 0.8],
          ['4', 0.9],
          ['5', 1.0]
        ]),
        prerequisiteSkills: new Map()
      }
    };
  }
  
  /**
   * Initialize progression rules
   */
  private initializeProgressionRules(): CareerProgressionRules {
    const badges = new Map<CareerType, CareerBadge[]>();
    
    // Example badges for Doctor
    badges.set('Doctor', [
      {
        id: 'first_aid',
        name: 'First Aid Helper',
        description: 'Learned basic first aid',
        icon: '🩹',
        requirements: ['complete_health_lesson', 'answer_5_medical_questions'],
        xpReward: 50
      },
      {
        id: 'diagnosis_detective',
        name: 'Diagnosis Detective',
        description: 'Solved medical mysteries',
        icon: '🔍',
        requirements: ['solve_3_diagnosis_problems'],
        xpReward: 100
      }
    ]);
    
    return {
      exposureLevel: 'exploration',
      unlockCriteria: new Map(),
      badgeSystem: {
        badges,
        requirements: new Map(),
        display: 'prominent'
      },
      mentorship: {
        virtualMentor: true,
        mentorPersonality: new Map([
          ['Doctor', 'caring and knowledgeable'],
          ['Teacher', 'patient and encouraging'],
          ['Scientist', 'curious and analytical'],
          ['Engineer', 'logical and creative'],
          ['Artist', 'expressive and inspiring']
        ]),
        guidanceFrequency: 'periodic',
        expertInsights: true
      }
    };
  }
  
  // Rule Actions
  
  private selectCareerProfile(context: CareerContext): RuleResult {
    const profile = this.careerProfiles.get(context.career.name);
    
    if (!profile) {
      return {
        success: false,
        error: `Career profile not found: ${context.career.name}`
      };
    }
    
    return {
      success: true,
      data: {
        profile,
        category: profile.category,
        tools: profile.tools,
        environments: profile.environments
      }
    };
  }
  
  private adaptVocabulary(context: CareerContext): RuleResult {
    const profile = this.careerProfiles.get(context.career.name);
    if (!profile || !context.activity) {
      return { success: false, error: 'Missing profile or activity' };
    }
    
    const vocabulary = profile.vocabulary.get(context.activity.subject) || [];
    const adaptedVocabulary = [...vocabulary];
    
    // Apply substitutions
    this.adaptationRules.vocabulary.substitutions.forEach((careerMap, genericTerm) => {
      const specificTerm = careerMap.get(context.career.name);
      if (specificTerm) {
        adaptedVocabulary.push(specificTerm);
      }
    });
    
    return {
      success: true,
      data: {
        vocabulary: adaptedVocabulary,
        complexity: context.contentAdaptation?.vocabularyLevel || 'intermediate'
      }
    };
  }
  
  private generateScenario(context: CareerContext): RuleResult {
    const profile = this.careerProfiles.get(context.career.name);
    if (!profile || !context.activity) {
      return { success: false, error: 'Missing profile or activity' };
    }
    
    const scenarios = profile.scenarios.get(context.activity.subject) || [];
    const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    const enrichedScenario = {
      text: selectedScenario,
      tools: this.adaptationRules.scenarios.includeTools ? profile.tools : [],
      environment: this.adaptationRules.scenarios.includeEnvironment ? 
        profile.environments[0] : undefined,
      roleModel: this.adaptationRules.scenarios.includeRoleModel ? 
        profile.roleModels[0] : undefined
    };
    
    return {
      success: true,
      data: {
        scenario: enrichedScenario,
        contextLevel: this.adaptationRules.scenarios.contextLevel
      }
    };
  }
  
  private applyVisualTheme(context: CareerContext): RuleResult {
    const profile = this.careerProfiles.get(context.career.name);
    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }
    
    const theme = {
      ...profile.visualTheme,
      useCareerColors: this.adaptationRules.visuals.useCareerColors,
      includeIcons: this.adaptationRules.visuals.includeCareerIcons,
      backgroundEnabled: this.adaptationRules.visuals.backgroundTheming
    };
    
    return {
      success: true,
      data: { theme }
    };
  }
  
  private customizeMessaging(context: CareerContext): RuleResult {
    const greetings = this.adaptationRules.messaging.greetingStyle.get(context.career.name) || 
      ['Welcome!', 'Let\'s learn!'];
    
    const selectedGreeting = greetings[Math.floor(Math.random() * greetings.length)];
    
    return {
      success: true,
      data: {
        greeting: selectedGreeting,
        style: 'career-specific'
      }
    };
  }
  
  private adjustDifficulty(context: CareerContext): RuleResult {
    const careerComplexity = this.adaptationRules.difficulty.careerComplexity.get(context.career.name) || 5;
    const gradeAdjustment = this.adaptationRules.difficulty.gradeAdjustment.get(context.student.grade_level) || 1;
    
    const adjustedDifficulty = Math.round(careerComplexity * gradeAdjustment);
    
    return {
      success: true,
      data: {
        baseDifficulty: careerComplexity,
        adjustedDifficulty,
        gradeAdjustment
      }
    };
  }
  
  private trackCareerExposure(context: CareerContext): RuleResult {
    let journey = this.careerJourneys.get(context.student.id);
    
    if (!journey) {
      journey = {
        studentId: context.student.id,
        careerExposure: new Map(),
        badges: [],
        currentFocus: context.career.name
      };
      this.careerJourneys.set(context.student.id, journey);
    }
    
    const exposure = journey.careerExposure.get(context.career.name) || 0;
    journey.careerExposure.set(context.career.name, exposure + 1);
    
    return {
      success: true,
      data: {
        totalExposure: exposure + 1,
        careersExplored: journey.careerExposure.size
      }
    };
  }
  
  private checkAndAwardBadges(context: CareerContext): RuleResult {
    const journey = this.careerJourneys.get(context.student.id);
    if (!journey) {
      return { success: false, error: 'No journey found' };
    }
    
    const careerBadges = this.progressionRules.badgeSystem.badges.get(context.career.name) || [];
    const newBadges: CareerBadge[] = [];
    
    careerBadges.forEach(badge => {
      if (!journey.badges.find(b => b.id === badge.id)) {
        // Check if requirements are met (simplified)
        const eligible = Math.random() > 0.7; // Placeholder for actual requirement checking
        if (eligible) {
          newBadges.push(badge);
          journey.badges.push(badge);
        }
      }
    });
    
    return {
      success: true,
      data: {
        newBadges,
        totalBadges: journey.badges.length
      }
    };
  }
  
  private provideMentorship(context: CareerContext): RuleResult {
    const personality = this.progressionRules.mentorship.mentorPersonality.get(context.career.name) || 
      'supportive and knowledgeable';
    
    const mentorshipMessage = `As a ${context.career.name}, remember to be ${personality}. ` +
      `Every great ${context.career.name} started where you are now!`;
    
    return {
      success: true,
      data: {
        message: mentorshipMessage,
        personality,
        frequency: this.progressionRules.mentorship.guidanceFrequency
      }
    };
  }
  
  private connectToRoleModels(context: CareerContext): RuleResult {
    const profile = this.careerProfiles.get(context.career.name);
    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }
    
    const roleModel = profile.roleModels[Math.floor(Math.random() * profile.roleModels.length)];
    
    return {
      success: true,
      data: {
        roleModel,
        inspiration: roleModel.quote,
        achievement: roleModel.achievement
      }
    };
  }
  
  // Public Methods
  
  public getCareerProfile(careerName: CareerType): CareerProfile | undefined {
    return this.careerProfiles.get(careerName);
  }
  
  public getAllCareers(): CareerType[] {
    return Array.from(this.careerProfiles.keys());
  }
  
  public getCareersByCategory(category: CareerCategory): CareerType[] {
    return Array.from(this.careerProfiles.entries())
      .filter(([_, profile]) => profile.category === category)
      .map(([name, _]) => name);
  }
  
  public getStudentJourney(studentId: string): CareerJourney | undefined {
    return this.careerJourneys.get(studentId);
  }
  
  public getCareerVocabulary(career: CareerType, subject: string): string[] {
    const profile = this.careerProfiles.get(career);
    return profile?.vocabulary.get(subject) || [];
  }
  
  public getCareerScenarios(career: CareerType, subject: string): string[] {
    const profile = this.careerProfiles.get(career);
    return profile?.scenarios.get(subject) || [];
  }
}

// Helper interfaces
interface CareerJourney {
  studentId: string;
  careerExposure: Map<CareerType, number>;
  badges: CareerBadge[];
  currentFocus: CareerType;
}

// Export singleton instance
export const careerAIRulesEngine = new CareerAIRulesEngine();