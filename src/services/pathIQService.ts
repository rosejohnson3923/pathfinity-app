/**
 * PathIQ Intelligence Service
 * Implements the 3+1 career selection pattern with lifetime learning analytics
 */

interface CareerRating {
  careerId: string;
  name: string;
  icon: string;
  color: string;
  score: number; // PathIQ rating score (0-100)
  matchReasons: string[];
  skillAlignment: number;
  interestAlignment: number;
  previousExposure: number;
  peerSuccess: number;
  marketDemand: number;
}

interface PathIQProfile {
  userId: string;
  careerPreferences: Map<string, number>; // Career ID -> preference score
  learningPatterns: {
    bestTimeOfDay: string;
    preferredPace: 'slow' | 'medium' | 'fast';
    visualLearner: boolean;
    audioLearner: boolean;
    kinestheticLearner: boolean;
  };
  careerExposureHistory: {
    careerId: string;
    date: Date;
    engagementScore: number;
    completionRate: number;
    category?: string; // Career category for analytics
    selectionType?: 'recommended' | 'passion'; // How the career was selected
  }[];
  passionIndicators: {
    topic: string;
    score: number;
  }[];
}

class PathIQService {
  private static instance: PathIQService;
  private profiles: Map<string, PathIQProfile> = new Map();

  // Progressive Career System Configuration
  private readonly CAREER_PROGRESSION_CONFIG = {
    BASE_CAREERS_PER_CATEGORY: 1,  // X value - easily adjustable for future expansion
    
    // Grade-based multipliers for careers per category
    GRADE_MULTIPLIERS: {
      'K': 2,   // X * 2 = 2 careers per category (minimum for randomness)
      '1': 3,   // X * 3 = 3 careers per category
      '2': 4,   // X * 4 = 4 careers per category
      '3': 5,   // X * 5 = 5 careers per category
      '4': 6,   // X * 6 = 6 careers per category
      '5': 7,   // X * 7 = 7 careers per category
      '6': 9,   // X * 9 = 9 careers per category
      '7': 11,  // X * 11 = 11 careers per category
      '8': 13,  // X * 13 = 13 careers per category
    },
    
    // Selection mode by grade - how PathIQ presents recommendations
    SELECTION_MODES: {
      'K': 'RANDOM_CAREERS' as const,    // Pick 3 random careers directly
      '1': 'RANDOM_CAREERS' as const,    // Pick 3 random careers directly
      '2': 'RANDOM_CAREERS' as const,    // Pick 3 random careers directly
      '3': 'RANDOM_CATEGORIES' as const, // Pick 3 categories → user selects career
      '4': 'RANDOM_CATEGORIES' as const, // Pick 3 categories → user selects career
      '5': 'RANDOM_CATEGORIES' as const, // Pick 3 categories → user selects career
      '6': 'RANDOM_SPECIALIZATIONS' as const, // Pick 3 specialized subcategories
      '7': 'RANDOM_SPECIALIZATIONS' as const, // Pick 3 specialized subcategories
      '8': 'RANDOM_SPECIALIZATIONS' as const, // Pick 3 specialized subcategories
    },
    
    // Categories available per grade level (progressive unlocking)
    GRADE_CATEGORIES: {
      'K': ['all'],   // Show all categories for K to ensure 3 different categories
      '1': ['all'],   // Show all categories for grade 1
      '2': ['all'],   // Show all categories for grade 2
      '3': ['all'],   // Show all categories for elementary
      '4': ['all'],   // Show all categories for elementary
      '5': ['all'],   // Show all categories for elementary
      '6': ['all'],   // All categories available for middle school
      '7': ['all'],   // All categories available for middle school
      '8': ['all'],   // All categories available for middle school
      '9': ['all'],   // All categories available for high school
      '10': ['all'],  // All categories available for high school
      '11': ['all'],  // All categories available for high school
      '12': ['all'],  // All categories available for high school
    }
  };

  // Career database organized by grade level - Elementary focuses on Community Helpers
  // These are people children see and interact with in their daily lives
  
  // Kindergarten-specific careers (ages 5-6) - Only the most familiar community helpers
  private readonly KINDERGARTEN_CAREERS = [
    { id: 'teacher', name: 'Teacher', icon: '👨‍🏫', color: '#3B82F6', category: 'education', skills: ['communication', 'patience', 'organization'], level: 'kindergarten', description: 'Help children learn new things every day' },
    { id: 'doctor', name: 'Doctor', icon: '👩‍⚕️', color: '#14B8A6', category: 'health', skills: ['empathy', 'science', 'decision-making'], level: 'kindergarten', description: 'Help people feel better when they are sick' },
    { id: 'firefighter', name: 'Firefighter', icon: '🚒', color: '#DC2626', category: 'safety', skills: ['bravery', 'teamwork', 'physical-fitness'], level: 'kindergarten', description: 'Keep people safe from fires and help in emergencies' },
    { id: 'police-officer', name: 'Police Officer', icon: '👮', color: '#1E40AF', category: 'safety', skills: ['courage', 'justice', 'community'], level: 'kindergarten', description: 'Keep our community safe and help people' },
    { id: 'veterinarian', name: 'Veterinarian', icon: '🐾', color: '#84CC16', category: 'health', skills: ['animal-care', 'science', 'patience'], level: 'kindergarten', description: 'Take care of animals and keep pets healthy' },
    { id: 'chef', name: 'Chef', icon: '👨‍🍳', color: '#EC4899', category: 'community', skills: ['creativity', 'time-management', 'attention-to-detail'], level: 'kindergarten', description: 'Cook delicious food for people to enjoy' },
    { id: 'artist', name: 'Artist', icon: '🎨', color: '#F59E0B', category: 'creative', skills: ['creativity', 'visual-thinking', 'expression'], level: 'kindergarten', description: 'Create beautiful pictures and artwork' }
  ];
  
  // Elementary careers for grades 1-5 (more options as they understand more careers)
  private readonly ELEMENTARY_CAREERS = [
    // Education helpers they see daily
    { id: 'teacher', name: 'Teacher', icon: '👨‍🏫', color: '#3B82F6', category: 'education', skills: ['communication', 'patience', 'organization'], level: 'elementary', description: 'Help students learn new things every day' },
    { id: 'librarian', name: 'Librarian', icon: '📚', color: '#7C3AED', category: 'education', skills: ['organization', 'reading', 'helping'], level: 'elementary', description: 'Share the magic of books and help people find information' },
    { id: 'coach', name: 'Coach', icon: '🏃', color: '#F97316', category: 'education', skills: ['leadership', 'fitness', 'motivation'], level: 'elementary', description: 'Teach sports and help athletes reach their best' },
    
    // Safety helpers in their community
    { id: 'firefighter', name: 'Firefighter', icon: '🚒', color: '#DC2626', category: 'safety', skills: ['bravery', 'teamwork', 'physical-fitness'], level: 'elementary' },
    { id: 'police-officer', name: 'Police Officer', icon: '👮', color: '#1E40AF', category: 'safety', skills: ['courage', 'justice', 'community'], level: 'elementary' },
    { id: 'crossing-guard', name: 'Crossing Guard', icon: '🛑', color: '#F59E0B', category: 'safety', skills: ['vigilance', 'patience', 'responsibility'], level: 'elementary' },
    
    // Health helpers they visit
    { id: 'doctor', name: 'Doctor', icon: '👩‍⚕️', color: '#14B8A6', category: 'health', skills: ['empathy', 'science', 'decision-making'], level: 'elementary' },
    { id: 'nurse', name: 'Nurse', icon: '👨‍⚕️', color: '#E11D48', category: 'health', skills: ['compassion', 'medical-knowledge', 'stamina'], level: 'elementary' },
    { id: 'dentist', name: 'Dentist', icon: '🦷', color: '#06B6D4', category: 'health', skills: ['precision', 'care', 'communication'], level: 'elementary' },
    { id: 'veterinarian', name: 'Veterinarian', icon: '🐾', color: '#84CC16', category: 'health', skills: ['animal-care', 'science', 'patience'], level: 'elementary' },
    
    // Community helpers they encounter daily
    { id: 'chef', name: 'Chef', icon: '👨‍🍳', color: '#EC4899', category: 'community', skills: ['creativity', 'time-management', 'attention-to-detail'], level: 'elementary' },
    { id: 'park-ranger', name: 'Park Ranger', icon: '🌲', color: '#10B981', category: 'community', skills: ['conservation', 'education', 'outdoor-skills'], level: 'elementary' },
    { id: 'bus-driver', name: 'Bus Driver', icon: '🚌', color: '#EAB308', category: 'community', skills: ['safety', 'punctuality', 'responsibility'], level: 'elementary' },
    { id: 'mail-carrier', name: 'Mail Carrier', icon: '📬', color: '#8B5CF6', category: 'community', skills: ['organization', 'fitness', 'reliability'], level: 'elementary' },
    { id: 'grocery-worker', name: 'Grocery Store Worker', icon: '🛒', color: '#059669', category: 'community', skills: ['customer-service', 'organization', 'helpfulness'], level: 'elementary' },
    { id: 'janitor', name: 'Janitor', icon: '🧹', color: '#78716C', category: 'community', skills: ['attention-to-detail', 'responsibility', 'hard-work'], level: 'elementary' },
    { id: 'cafeteria-worker', name: 'Cafeteria Worker', icon: '🍽️', color: '#EA580C', category: 'community', skills: ['food-safety', 'teamwork', 'service'], level: 'elementary' },
    
    // Creative helpers they see
    { id: 'artist', name: 'Artist', icon: '🎨', color: '#F59E0B', category: 'creative', skills: ['creativity', 'visual-thinking', 'expression'], level: 'elementary' },
    { id: 'musician', name: 'Musician', icon: '🎵', color: '#6366F1', category: 'creative', skills: ['creativity', 'rhythm', 'practice'], level: 'elementary' }
  ];

  private readonly MIDDLE_SCHOOL_CAREERS = [
    // Technology & Digital - highly relatable to this age group
    { id: 'programmer', name: 'Programmer', icon: '💻', color: '#7C3AED', category: 'technology', skills: ['logic', 'problem-solving', 'creativity'], level: 'middle', description: 'Create software and apps that people use every day', dailyTasks: ['Write code to build new features', 'Debug and fix software problems', 'Collaborate with team members on projects', 'Test apps to make sure they work perfectly'] },
    { id: 'game-developer', name: 'Game Developer', icon: '🎮', color: '#F97316', category: 'technology', skills: ['creativity', 'programming', 'storytelling'], level: 'middle', description: 'Design and build fun video games', dailyTasks: ['Design game levels and characters', 'Program game mechanics and controls', 'Test games for bugs and balance', 'Create storylines and quests'] },
    { id: 'youtuber', name: 'YouTuber/Content Creator', icon: '📹', color: '#EF4444', category: 'media', skills: ['creativity', 'communication', 'editing'], level: 'middle', description: 'Make videos and content that entertain and educate', dailyTasks: ['Plan and film new video content', 'Edit videos with cool effects and music', 'Respond to comments and connect with viewers', 'Research trending topics and ideas'] },
    { id: 'web-designer', name: 'Web Designer', icon: '🌐', color: '#06B6D4', category: 'technology', skills: ['design', 'creativity', 'technical-skills'], level: 'middle', description: 'Create beautiful and useful websites', dailyTasks: ['Design website layouts and graphics', 'Choose colors and fonts that look great', 'Make websites work on phones and tablets', 'Update and improve existing websites'] },
    
    // Business & Entrepreneurship
    { id: 'entrepreneur', name: 'Entrepreneur', icon: '🚀', color: '#10B981', category: 'business', skills: ['leadership', 'innovation', 'risk-taking'], level: 'middle', description: 'Start your own business and bring new ideas to life', dailyTasks: ['Develop new business ideas', 'Meet with customers and partners', 'Manage budgets and finances', 'Lead and inspire your team'] },
    { id: 'manager', name: 'Team Manager', icon: '💼', color: '#6366F1', category: 'business', skills: ['leadership', 'organization', 'communication'], level: 'middle', description: 'Lead teams to achieve goals together', dailyTasks: ['Run team meetings and set goals', 'Help team members solve problems', 'Track progress on projects', 'Celebrate team achievements'] },
    { id: 'real-estate-agent', name: 'Real Estate Agent', icon: '🏠', color: '#F59E0B', category: 'business', skills: ['sales', 'negotiation', 'local-knowledge'], level: 'middle', description: 'Help people find their dream homes', dailyTasks: ['Show houses to potential buyers', 'Research property values and neighborhoods', 'Negotiate deals between buyers and sellers', 'Create listings with photos and descriptions'] },
    { id: 'bank-teller', name: 'Bank Teller', icon: '💵', color: '#84CC16', category: 'business', skills: ['math', 'customer-service', 'accuracy'], level: 'middle', description: 'Help people manage their money safely', dailyTasks: ['Process deposits and withdrawals', 'Help customers with their accounts', 'Count money accurately', 'Explain banking services'] },
    
    // Creative & Media
    { id: 'writer', name: 'Writer', icon: '✍️', color: '#D97706', category: 'creative', skills: ['creativity', 'communication', 'imagination'], level: 'middle', description: 'Create stories and articles that inspire', dailyTasks: ['Write stories, articles, or books', 'Research topics for accuracy', 'Edit and revise your work', 'Brainstorm creative ideas'] },
    { id: 'photographer', name: 'Photographer', icon: '📷', color: '#7E22CE', category: 'creative', skills: ['creativity', 'patience', 'visual-eye'], level: 'middle', description: 'Capture special moments through photography', dailyTasks: ['Take photos at events or locations', 'Edit photos to look their best', 'Set up lighting and equipment', 'Work with clients on their vision'] },
    { id: 'graphic-designer', name: 'Graphic Designer', icon: '🎨', color: '#EC4899', category: 'creative', skills: ['design', 'creativity', 'software-skills'], level: 'middle', description: 'Design visual art for brands and media', dailyTasks: ['Create logos and brand designs', 'Design posters and advertisements', 'Use design software like Photoshop', 'Present ideas to clients'] },
    { id: 'journalist', name: 'Journalist', icon: '📰', color: '#94A3B8', category: 'media', skills: ['writing', 'research', 'interviewing'], level: 'middle' },
    
    // STEM & Research
    { id: 'engineer', name: 'Engineer', icon: '⚙️', color: '#059669', category: 'stem', skills: ['math', 'problem-solving', 'innovation'], level: 'middle' },
    { id: 'scientist', name: 'Research Scientist', icon: '🔬', color: '#3B82F6', category: 'stem', skills: ['research', 'analysis', 'experimentation'], level: 'middle' },
    { id: 'environmental-scientist', name: 'Environmental Scientist', icon: '🌍', color: '#16A085', category: 'stem', skills: ['ecology', 'research', 'conservation'], level: 'middle' },
    
    // Skilled Trades - important to introduce
    { id: 'electrician', name: 'Electrician', icon: '⚡', color: '#FCD34D', category: 'trades', skills: ['technical-skills', 'problem-solving', 'safety'], level: 'middle' },
    { id: 'plumber', name: 'Plumber', icon: '🔧', color: '#3B82F6', category: 'trades', skills: ['technical-skills', 'problem-solving', 'customer-service'], level: 'middle' },
    { id: 'carpenter', name: 'Carpenter', icon: '🔨', color: '#92400E', category: 'trades', skills: ['craftsmanship', 'math', 'creativity'], level: 'middle' },
    
    // Sports & Performance
    { id: 'athlete', name: 'Professional Athlete', icon: '⚽', color: '#DC2626', category: 'sports', skills: ['dedication', 'teamwork', 'physical-fitness'], level: 'middle' },
    { id: 'dancer', name: 'Dancer', icon: '💃', color: '#BE185D', category: 'performing-arts', skills: ['rhythm', 'expression', 'physical-fitness'], level: 'middle' },
    
    // Public Service & Law
    { id: 'lawyer', name: 'Lawyer', icon: '⚖️', color: '#1E40AF', category: 'law', skills: ['critical-thinking', 'communication', 'research'], level: 'middle' },
    { id: 'social-worker', name: 'Social Worker', icon: '🤝', color: '#7C3AED', category: 'public-service', skills: ['empathy', 'problem-solving', 'advocacy'], level: 'middle' }
  ];

  private readonly HIGH_SCHOOL_CAREERS = [
    // Emerging Technology & AI - Market leaders
    { id: 'ai-engineer', name: 'AI/ML Engineer', icon: '🤖', color: '#6366F1', category: 'technology', skills: ['programming', 'mathematics', 'machine-learning'], level: 'high' },
    { id: 'data-scientist', name: 'Data Scientist', icon: '📊', color: '#0891B2', category: 'technology', skills: ['statistics', 'programming', 'analysis'], level: 'high' },
    { id: 'cybersecurity-specialist', name: 'Cybersecurity Specialist', icon: '🔒', color: '#DC2626', category: 'technology', skills: ['security', 'networking', 'problem-solving'], level: 'high' },
    { id: 'cloud-architect', name: 'Cloud Architect', icon: '☁️', color: '#3B82F6', category: 'technology', skills: ['infrastructure', 'programming', 'system-design'], level: 'high' },
    { id: 'blockchain-developer', name: 'Blockchain Developer', icon: '⛓️', color: '#8B5CF6', category: 'fintech', skills: ['cryptography', 'programming', 'finance'], level: 'high' },
    { id: 'robotics-engineer', name: 'Robotics Engineer', icon: '🦾', color: '#F97316', category: 'engineering', skills: ['programming', 'mechanics', 'AI'], level: 'high' },
    
    // Traditional Engineering & Science
    { id: 'software-engineer', name: 'Software Engineer', icon: '💻', color: '#10B981', category: 'engineering', skills: ['programming', 'problem-solving', 'collaboration'], level: 'high' },
    { id: 'aerospace-engineer', name: 'Aerospace Engineer', icon: '🚀', color: '#0EA5E9', category: 'engineering', skills: ['physics', 'mathematics', 'innovation'], level: 'high' },
    { id: 'biotech-researcher', name: 'Biotech Researcher', icon: '🧬', color: '#EC4899', category: 'science', skills: ['biology', 'research', 'innovation'], level: 'high' },
    { id: 'renewable-energy-engineer', name: 'Renewable Energy Engineer', icon: '⚡', color: '#84CC16', category: 'engineering', skills: ['sustainability', 'engineering', 'innovation'], level: 'high' },
    
    // Creative & Design
    { id: 'ux-designer', name: 'UX/UI Designer', icon: '🎨', color: '#F59E0B', category: 'design', skills: ['design-thinking', 'user-research', 'creativity'], level: 'high' },
    { id: 'architect', name: 'Architect', icon: '🏛️', color: '#4338CA', category: 'design', skills: ['creativity', 'math', 'spatial-reasoning'], level: 'high' },
    { id: 'app-developer', name: 'Mobile App Developer', icon: '📱', color: '#06B6D4', category: 'technology', skills: ['mobile-development', 'design', 'programming'], level: 'high' },
    
    // Business & Finance
    { id: 'ceo', name: 'Chief Executive Officer', icon: '👔', color: '#1E40AF', category: 'business', skills: ['leadership', 'strategy', 'decision-making'], level: 'high' },
    { id: 'investment-banker', name: 'Investment Banker', icon: '💰', color: '#EAB308', category: 'finance', skills: ['finance', 'analysis', 'negotiation'], level: 'high' },
    { id: 'marketing-director', name: 'Marketing Director', icon: '📈', color: '#E11D48', category: 'business', skills: ['strategy', 'creativity', 'analytics'], level: 'high' },
    { id: 'financial-analyst', name: 'Financial Analyst', icon: '📉', color: '#14B8A6', category: 'finance', skills: ['analysis', 'mathematics', 'forecasting'], level: 'high' },
    
    // Healthcare & Life Sciences
    { id: 'surgeon', name: 'Surgeon', icon: '🏥', color: '#EF4444', category: 'healthcare', skills: ['precision', 'medical-knowledge', 'decision-making'], level: 'high' },
    { id: 'psychiatrist', name: 'Psychiatrist', icon: '🧠', color: '#9333EA', category: 'healthcare', skills: ['psychology', 'medicine', 'empathy'], level: 'high' },
    { id: 'pharmacist', name: 'Pharmacist', icon: '💊', color: '#16A085', category: 'healthcare', skills: ['chemistry', 'patient-care', 'attention-to-detail'], level: 'high' },
    { id: 'mental-health-counselor', name: 'Mental Health Counselor', icon: '💚', color: '#059669', category: 'healthcare', skills: ['counseling', 'empathy', 'communication'], level: 'high' },
    
    // Media & Communications
    { id: 'social-media-strategist', name: 'Social Media Strategist', icon: '📱', color: '#E11D48', category: 'media', skills: ['digital-marketing', 'analytics', 'creativity'], level: 'high' },
    { id: 'podcast-producer', name: 'Podcast Producer', icon: '🎙️', color: '#7C3AED', category: 'media', skills: ['audio-production', 'storytelling', 'networking'], level: 'high' },
    { id: 'video-game-designer', name: 'Video Game Designer', icon: '🎮', color: '#F97316', category: 'media', skills: ['game-design', 'programming', 'creativity'], level: 'high' },
    
    // Emerging & Future Careers
    { id: 'sustainability-consultant', name: 'Sustainability Consultant', icon: '🌱', color: '#10B981', category: 'environment', skills: ['environmental-science', 'consulting', 'innovation'], level: 'high' },
    { id: 'drone-operator', name: 'Drone Operator', icon: '🚁', color: '#F59E0B', category: 'technology', skills: ['piloting', 'technology', 'photography'], level: 'high' },
    { id: 'space-industry-worker', name: 'Space Industry Professional', icon: '🛸', color: '#6366F1', category: 'space', skills: ['aerospace', 'technology', 'innovation'], level: 'high' },
    
    // Legal & Government
    { id: 'lawyer', name: 'Corporate Lawyer', icon: '⚖️', color: '#991B1B', category: 'law', skills: ['critical-thinking', 'communication', 'research'], level: 'high' },
    { id: 'policy-advisor', name: 'Policy Advisor', icon: '🏛️', color: '#64748B', category: 'government', skills: ['policy-analysis', 'research', 'communication'], level: 'high' }
  ];

  // Career category definitions for organized display
  private readonly CAREER_CATEGORIES = {
    elementary: [
      { id: 'education', name: 'School Helpers', icon: '🏫', careers: ['teacher', 'librarian', 'coach'] },
      { id: 'safety', name: 'Safety Heroes', icon: '🦸', careers: ['firefighter', 'police-officer', 'crossing-guard'] },
      { id: 'health', name: 'Health Helpers', icon: '🏥', careers: ['doctor', 'nurse', 'dentist', 'veterinarian'] },
      { id: 'community', name: 'Community Helpers', icon: '🏘️', careers: ['chef', 'park-ranger', 'bus-driver', 'mail-carrier', 'grocery-worker', 'janitor', 'cafeteria-worker'] },
      { id: 'creative', name: 'Creative People', icon: '🎭', careers: ['artist', 'musician'] }
    ],
    middle: [
      { id: 'technology', name: 'Tech & Digital', icon: '💻', careers: ['programmer', 'game-developer', 'youtuber', 'web-designer'] },
      { id: 'business', name: 'Business & Money', icon: '💼', careers: ['entrepreneur', 'manager', 'real-estate-agent', 'bank-teller'] },
      { id: 'creative', name: 'Creative & Media', icon: '🎨', careers: ['writer', 'photographer', 'graphic-designer', 'journalist'] },
      { id: 'stem', name: 'Science & Engineering', icon: '🔬', careers: ['engineer', 'scientist', 'environmental-scientist'] },
      { id: 'trades', name: 'Skilled Trades', icon: '🔧', careers: ['electrician', 'plumber', 'carpenter'] },
      { id: 'sports', name: 'Sports & Performance', icon: '🏆', careers: ['athlete', 'dancer'] },
      { id: 'service', name: 'Public Service', icon: '⚖️', careers: ['lawyer', 'social-worker'] }
    ],
    high: [
      { id: 'ai-tech', name: 'AI & Emerging Tech', icon: '🤖', careers: ['ai-engineer', 'data-scientist', 'cybersecurity-specialist', 'cloud-architect', 'blockchain-developer', 'robotics-engineer'] },
      { id: 'engineering', name: 'Engineering', icon: '⚙️', careers: ['software-engineer', 'aerospace-engineer', 'renewable-energy-engineer'] },
      { id: 'science', name: 'Science & Research', icon: '🧬', careers: ['biotech-researcher'] },
      { id: 'design', name: 'Design & Creative', icon: '🎨', careers: ['ux-designer', 'architect', 'app-developer'] },
      { id: 'business', name: 'Business Leadership', icon: '👔', careers: ['ceo', 'marketing-director'] },
      { id: 'finance', name: 'Finance', icon: '💰', careers: ['investment-banker', 'financial-analyst'] },
      { id: 'healthcare', name: 'Healthcare', icon: '🏥', careers: ['surgeon', 'psychiatrist', 'pharmacist', 'mental-health-counselor'] },
      { id: 'media', name: 'Media & Gaming', icon: '📱', careers: ['social-media-strategist', 'podcast-producer', 'video-game-designer'] },
      { id: 'future', name: 'Future Careers', icon: '🚀', careers: ['sustainability-consultant', 'drone-operator', 'space-industry-worker'] },
      { id: 'law-gov', name: 'Law & Government', icon: '⚖️', careers: ['lawyer', 'policy-advisor'] }
    ]
  };

  private constructor() {}

  static getInstance(): PathIQService {
    if (!PathIQService.instance) {
      PathIQService.instance = new PathIQService();
    }
    return PathIQService.instance;
  }

  /**
   * Get careers organized by category for a grade level
   */
  getCareersByCategory(gradeLevel: string): { 
    category: { id: string; name: string; icon: string }; 
    careers: CareerRating[] 
  }[] {
    const gradeLevelNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);
    const gradeLevelGroup = gradeLevelNum <= 5 ? 'elementary' :
                           gradeLevelNum <= 8 ? 'middle' : 'high';
    
    const categories = this.CAREER_CATEGORIES[gradeLevelGroup];
    const allCareers = this.getAllCareersForGrade(gradeLevelNum);
    
    return categories.map(category => ({
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon
      },
      careers: category.careers
        .map(careerId => allCareers.find(c => c.id === careerId))
        .filter(Boolean)
        .map(career => this.calculateCareerRating(
          career!,
          this.getOrCreateProfile('default'),
          gradeLevel,
          []
        ))
    }));
  }

  /**
   * Get all careers for a grade level (helper method)
   */
  private getAllCareersForGrade(gradeLevelNum: number): any[] {
    let appropriateCareers: any[] = [];
    
    if (gradeLevelNum <= 5) {
      appropriateCareers = [...this.ELEMENTARY_CAREERS];
    } else if (gradeLevelNum <= 8) {
      appropriateCareers = [
        ...this.ELEMENTARY_CAREERS,
        ...this.MIDDLE_SCHOOL_CAREERS
      ];
    } else {
      appropriateCareers = [
        ...this.ELEMENTARY_CAREERS,
        ...this.MIDDLE_SCHOOL_CAREERS,
        ...this.HIGH_SCHOOL_CAREERS
      ];
    }
    
    return appropriateCareers;
  }

  /**
   * Get the 3+1 career selections for a student
   * ALWAYS returns 3 careers from 3 different categories
   * The "+1" is the ability to browse all careers via "Other" option
   */
  getCareerSelections(userId: string, grade: string | undefined, interests?: string[]): {
    recommended: CareerRating[] | { category: { id: string; name: string; icon: string; description: string }; careerCount: number }[];
    passionCareers: CareerRating[];
    passionCategories?: { category: { id: string; name: string; icon: string }; careers: CareerRating[] }[];
    selectionMode: 'RANDOM_CAREERS' | 'RANDOM_CATEGORIES' | 'RANDOM_SPECIALIZATIONS';
  } {
    const profile = this.getOrCreateProfile(userId);
    const gradeLevel = grade || 'K'; // Default to K if no grade
    
    // Get careers available for this grade using progressive system
    const appropriateCareers = this.getCareersForGrade(gradeLevel);
    
    // ALWAYS use the 3-careers-from-3-categories selection
    // This ensures diversity in career presentation for all grades
    return this.getThreeCareersFromThreeCategories(appropriateCareers, profile, gradeLevel, interests);
  }

  /**
   * Calculate PathIQ rating for a career based on multiple factors
   */
  private calculateCareerRating(
    career: any,
    profile: PathIQProfile,
    grade: string,
    interests?: string[]
  ): CareerRating {
    const matchReasons: string[] = [];
    let score = 50; // Base score

    // 1. Grade-appropriate scoring
    const gradeLevel = this.getGradeLevel(grade);
    if (this.isAgeAppropriate(career.category, gradeLevel)) {
      score += 10;
      matchReasons.push('Perfect for your grade level');
    }

    // 2. Interest alignment
    const interestScore = this.calculateInterestAlignment(career, interests);
    score += interestScore * 20;
    if (interestScore > 0.5) {
      matchReasons.push('Matches your interests');
    }

    // 3. Previous exposure and engagement
    const exposureScore = this.calculateExposureScore(career.id, profile);
    score += exposureScore * 15;
    if (exposureScore > 0.5) {
      matchReasons.push('You enjoyed this before');
    }

    // 4. Skill alignment based on past performance
    const skillScore = Math.random() * 0.5 + 0.3; // Simulated for now
    score += skillScore * 15;
    if (skillScore > 0.6) {
      matchReasons.push('Uses your strong skills');
    }

    // 5. Peer success (careers popular with similar students)
    const peerScore = Math.random() * 0.4 + 0.3; // Simulated
    score += peerScore * 10;
    
    // 6. Add randomization factor for variety (5-15 points)
    const randomFactor = Math.random() * 10 + 5;
    score += randomFactor;

    // 7. Market demand and future relevance
    const marketScore = this.getMarketDemandScore(career.category);
    score += marketScore * 10;
    if (marketScore > 0.7) {
      matchReasons.push('High demand career');
    }

    // 8. Variety bonus (encourage exploring different categories)
    const varietyScore = this.calculateVarietyScore(career.category, profile);
    score += varietyScore * 10;
    if (varietyScore > 0.5) {
      matchReasons.push('Try something new!');
    }

    // Ensure score is within bounds
    score = Math.min(100, Math.max(0, score));

    return {
      careerId: career.id,
      name: career.name,
      icon: career.icon,
      color: career.color,
      category: career.category,
      description: career.description,
      skills: career.skills,
      level: career.level,
      score: Math.round(score),
      matchReasons,
      skillAlignment: skillScore,
      interestAlignment: interestScore,
      previousExposure: exposureScore,
      peerSuccess: peerScore,
      marketDemand: marketScore
    };
  }

  /**
   * Get careers for a specific grade using progressive reveal system
   * Uses multipliers to control how many careers per category are shown
   */
  private getCareersForGrade(grade: string): any[] {
    console.log(`📚 getCareersForGrade called for grade: ${grade}`);
    console.trace('Call stack for getCareersForGrade');
    const gradeLevelNum = grade === 'K' ? 0 : parseInt(grade);
    const multiplier = this.CAREER_PROGRESSION_CONFIG.GRADE_MULTIPLIERS[grade] || 2;
    const baseCount = this.CAREER_PROGRESSION_CONFIG.BASE_CAREERS_PER_CATEGORY;
    const careersPerCategory = baseCount * multiplier;
    
    // Get available categories for this grade
    const availableCategories = this.CAREER_PROGRESSION_CONFIG.GRADE_CATEGORIES[grade] || ['helpers', 'safety', 'health'];
    console.log(`  Categories config for grade ${grade}:`, availableCategories);
    
    // Get all careers from appropriate grade level pools
    // Using proper grade groupings: PreK-2, 3-5, 6-8, 9-12
    let allCareersPool: any[] = [];
    
    if (gradeLevelNum <= 2) {
      // Early Elementary (PreK-2): Base community helper careers
      // For now using KINDERGARTEN_CAREERS for K and ELEMENTARY_CAREERS for 1-2
      // TODO: Rename KINDERGARTEN_CAREERS to EARLY_ELEMENTARY_CAREERS
      if (gradeLevelNum === 0) {
        allCareersPool = [...this.KINDERGARTEN_CAREERS];
      } else {
        // Grade 1-2: Use kindergarten + some elementary careers
        allCareersPool = [...this.KINDERGARTEN_CAREERS, ...this.ELEMENTARY_CAREERS];
      }
    } else if (gradeLevelNum <= 5) {
      // Elementary (3-5): Early Elementary + new careers (Engineer, Scientist, etc.)
      allCareersPool = [...this.KINDERGARTEN_CAREERS, ...this.ELEMENTARY_CAREERS];
    } else if (gradeLevelNum <= 8) {
      // Middle School (6-8): All previous + Middle School careers
      allCareersPool = [...this.KINDERGARTEN_CAREERS, ...this.ELEMENTARY_CAREERS, ...this.MIDDLE_SCHOOL_CAREERS];
      console.log(`  Grade ${grade} (Middle School) pool size: ${allCareersPool.length} careers`);
    } else {
      // High School (9-12): All careers available
      allCareersPool = [...this.KINDERGARTEN_CAREERS, ...this.ELEMENTARY_CAREERS, ...this.MIDDLE_SCHOOL_CAREERS, ...this.HIGH_SCHOOL_CAREERS];
      console.log(`  Grade ${grade} (High School) pool size: ${allCareersPool.length} careers`);
    }
    
    // Filter careers by available categories and limit per category
    const careersByCategory = new Map<string, any[]>();
    
    // Group careers by category
    allCareersPool.forEach(career => {
      if (!careersByCategory.has(career.category)) {
        careersByCategory.set(career.category, []);
      }
      careersByCategory.get(career.category)!.push(career);
    });
    
    // Select limited careers per category based on grade
    const selectedCareers: any[] = [];
    availableCategories.forEach(categoryId => {
      if (categoryId === 'all') {
        // For higher grades, include all careers
        console.log(`  Including ALL careers (categoryId = 'all')`);
        selectedCareers.push(...allCareersPool);
      } else {
        const categoryCareers = careersByCategory.get(categoryId) || [];
        // Take only the allowed number of careers for this grade
        console.log(`  Category ${categoryId}: selecting ${Math.min(categoryCareers.length, careersPerCategory)} of ${categoryCareers.length} careers`);
        selectedCareers.push(...categoryCareers.slice(0, careersPerCategory));
      }
    });
    
    console.log(`  ✅ Final selected careers count: ${selectedCareers.length}`);
    return selectedCareers;
  }
  
  /**
   * Get random careers selection for K-2 grades
   */
  private getRandomCareersSelection(
    appropriateCareers: any[],
    profile: PathIQProfile,
    gradeLevel: string,
    interests?: string[]
  ): any {
    // Calculate PathIQ scores for all appropriate careers
    const allCareers = appropriateCareers.map(career => 
      this.calculateCareerRating(career, profile, gradeLevel, interests)
    );
    
    // Sort by PathIQ score
    allCareers.sort((a, b) => b.score - a.score);
    
    // Select top 3 for recommendations
    const recommended = allCareers.slice(0, 3);
    const recommendedIds = new Set(recommended.map(c => c.careerId));
    
    // Remaining careers become passion options
    const passionCareers = allCareers.filter(c => !recommendedIds.has(c.careerId));
    
    // Organize passion careers by category for better UX
    const categories = this.getCategoriesForGrade(gradeLevel);
    const passionCategories = categories.map(category => ({
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon
      },
      careers: passionCareers.filter(career => 
        category.careers.includes(career.careerId)
      )
    })).filter(cat => cat.careers.length > 0);
    
    return {
      recommended,
      passionCareers,
      passionCategories,
      selectionMode: 'RANDOM_CAREERS' as const
    };
  }
  
  /**
   * Get 3 careers from 3 different categories
   * This is the core 3+1 implementation ensuring diversity
   */
  private getThreeCareersFromThreeCategories(
    appropriateCareers: any[],
    profile: PathIQProfile,
    gradeLevel: string,
    interests?: string[]
  ): any {
    console.log(`🎯 PathIQ: Getting 3 careers for grade ${gradeLevel}`);
    console.log(`📊 Total careers available: ${appropriateCareers.length}`);
    
    // Group careers by category
    const careersByCategory = new Map<string, any[]>();
    appropriateCareers.forEach(career => {
      if (!careersByCategory.has(career.category)) {
        careersByCategory.set(career.category, []);
      }
      careersByCategory.get(career.category)!.push(career);
    });

    // Get available categories
    const availableCategories = Array.from(careersByCategory.keys());
    console.log(`📂 Available categories (${availableCategories.length}):`, availableCategories);
    
    // Shuffle categories to get random selection
    const shuffledCategories = [...availableCategories].sort(() => Math.random() - 0.5);
    
    // Select 3 random categories (or fewer if less than 3 available)
    const selectedCategories = shuffledCategories.slice(0, Math.min(3, shuffledCategories.length));
    console.log(`✅ Selected categories:`, selectedCategories);
    
    // Pick one career from each selected category
    const recommended: CareerRating[] = [];
    selectedCategories.forEach(category => {
      const careersInCategory = careersByCategory.get(category) || [];
      console.log(`  📁 Category "${category}" has ${careersInCategory.length} careers`);
      if (careersInCategory.length > 0) {
        // Calculate ratings for careers in this category
        const ratedCareers = careersInCategory.map(career => 
          this.calculateCareerRating(career, profile, gradeLevel, interests)
        );
        
        // Sort by score and pick the best one from this category
        ratedCareers.sort((a, b) => b.score - a.score);
        const selectedCareer = ratedCareers[0];
        console.log(`  ➡️ Selected: ${selectedCareer.name} (score: ${selectedCareer.score})`);
        recommended.push(selectedCareer);
      }
    });
    
    console.log(`🎲 Final recommended careers: ${recommended.map(c => c.name).join(', ')}`);
    
    // Calculate ratings for all careers for passion selection
    const allCareers = appropriateCareers.map(career => 
      this.calculateCareerRating(career, profile, gradeLevel, interests)
    );
    
    const recommendedIds = new Set(recommended.map(c => c.careerId));
    const passionCareers = allCareers.filter(c => !recommendedIds.has(c.careerId));
    
    // Organize passion careers by category for "Other" browser
    const categories = this.getCategoriesForGrade(gradeLevel);
    const passionCategories = categories.map(category => ({
      category: {
        id: category.id,
        name: category.name,
        icon: category.icon
      },
      careers: passionCareers.filter(career => 
        category.careers && category.careers.includes(career.careerId)
      )
    })).filter(cat => cat.careers.length > 0);
    
    return {
      recommended,
      passionCareers,
      passionCategories,
      selectionMode: 'RANDOM_CAREERS' as const
    };
  }
  
  /**
   * Get random categories selection for grades 3-5
   */
  private getRandomCategoriesSelection(
    appropriateCareers: any[],
    profile: PathIQProfile,
    gradeLevel: string,
    interests?: string[]
  ): any {
    const categories = this.getCategoriesForGrade(gradeLevel);
    
    // Calculate category scores based on careers within them
    const categoryScores = categories.map(category => {
      const categoryCareers = appropriateCareers.filter(c => 
        category.careers.includes(c.id)
      );
      
      const careerRatings = categoryCareers.map(career => 
        this.calculateCareerRating(career, profile, gradeLevel, interests)
      );
      
      const avgScore = careerRatings.length > 0 
        ? careerRatings.reduce((sum, r) => sum + r.score, 0) / careerRatings.length 
        : 0;
      
      return {
        category: {
          id: category.id,
          name: category.name,
          icon: category.icon,
          description: this.getCategoryDescription(category.id)
        },
        careerCount: categoryCareers.length,
        avgScore
      };
    });
    
    // Sort by score and select top 3 categories
    categoryScores.sort((a, b) => b.avgScore - a.avgScore);
    const recommendedCategories = categoryScores.slice(0, 3);
    
    // All careers available for passion selection
    const allCareers = appropriateCareers.map(career => 
      this.calculateCareerRating(career, profile, gradeLevel, interests)
    );
    
    return {
      recommended: recommendedCategories,
      passionCareers: allCareers,
      passionCategories: categoryScores,
      selectionMode: 'RANDOM_CATEGORIES' as const
    };
  }
  
  /**
   * Get category description for display
   */
  private getCategoryDescription(categoryId: string): string {
    const descriptions: Record<string, string> = {
      'education': 'People who help us learn and grow every day',
      'helpers': 'People who help us learn and grow every day',
      'safety': 'Heroes who keep our community safe',
      'health': 'Caring people who help us stay healthy',
      'creative': 'Artists who make our world beautiful',
      'community': 'Neighbors who make our town work',
      'science': 'Explorers who discover how things work',
      'technology': 'Innovators who build the future',
      'business': 'Leaders who create opportunities'
    };
    
    return descriptions[categoryId] || 'Amazing careers to explore';
  }
  
  /**
   * Get categories for a specific grade
   */
  private getCategoriesForGrade(grade: string): any[] {
    const gradeLevelNum = grade === 'K' ? 0 : parseInt(grade);
    const gradeLevelGroup = gradeLevelNum <= 5 ? 'elementary' :
                           gradeLevelNum <= 8 ? 'middle' : 'high';
    
    return this.CAREER_CATEGORIES[gradeLevelGroup] || [];
  }

  private getGradeLevel(grade: string): 'early_elementary' | 'elementary' | 'middle' | 'high' {
    const gradeNum = grade === 'K' ? 0 : parseInt(grade);
    if (gradeNum <= 2) return 'early_elementary';  // PreK-2
    if (gradeNum <= 5) return 'elementary';        // 3-5
    if (gradeNum <= 8) return 'middle';            // 6-8
    return 'high';                                  // 9-12
  }

  private isAgeAppropriate(category: string, gradeLevel: string): boolean {
    const appropriateCategories = {
      early_elementary: ['education', 'health', 'safety', 'community', 'creative', 'helpers'],
      elementary: ['education', 'health', 'safety', 'community', 'creative', 'science', 'technology'],
      middle: ['technology', 'business', 'creative', 'media', 'stem', 'public-service', 'trades', 'sports', 'performing-arts', 'law'],
      high: ['technology', 'engineering', 'business', 'finance', 'healthcare', 'science', 'fintech', 'design', 'media', 'law', 'trades']
    };
    // More likely to be appropriate if in the right category
    return appropriateCategories[gradeLevel]?.includes(category) ? true : Math.random() > 0.7;
  }

  private calculateInterestAlignment(career: any, interests?: string[]): number {
    if (!interests || interests.length === 0) return 0.5;
    
    // Check if career skills match student interests
    const overlap = career.skills.filter(skill => 
      interests.some(interest => 
        skill.toLowerCase().includes(interest.toLowerCase()) ||
        interest.toLowerCase().includes(skill.toLowerCase())
      )
    );
    
    return overlap.length / career.skills.length;
  }

  private calculateExposureScore(careerId: string, profile: PathIQProfile): number {
    const exposures = profile.careerExposureHistory.filter(e => e.careerId === careerId);
    if (exposures.length === 0) return 0;
    
    // Average engagement from previous exposures
    const avgEngagement = exposures.reduce((sum, e) => sum + e.engagementScore, 0) / exposures.length;
    return avgEngagement / 100;
  }

  private getMarketDemandScore(category: string): number {
    const demandScores = {
      'technology': 0.95,
      'healthcare': 0.90,
      'engineering': 0.85,
      'education': 0.80,
      'stem': 0.85,
      'trades': 0.75,
      'creative': 0.70,
      'public-service': 0.75
    };
    return demandScores[category] || 0.6;
  }

  private calculateVarietyScore(category: string, profile: PathIQProfile): number {
    const recentCategories = profile.careerExposureHistory
      .slice(-5)
      .map(e => {
        // Find the career across all career databases
        const allCareers = [
          ...this.KINDERGARTEN_CAREERS,
          ...this.ELEMENTARY_CAREERS,
          ...this.MIDDLE_SCHOOL_CAREERS,
          ...this.HIGH_SCHOOL_CAREERS
        ];
        const career = allCareers.find(c => c.id === e.careerId);
        return career?.category;
      });
    
    // Higher score if this category hasn't been explored recently
    return recentCategories.includes(category) ? 0.2 : 0.8;
  }

  private getOrCreateProfile(userId: string): PathIQProfile {
    if (!this.profiles.has(userId)) {
      this.profiles.set(userId, {
        userId,
        careerPreferences: new Map(),
        learningPatterns: {
          bestTimeOfDay: 'morning',
          preferredPace: 'medium',
          visualLearner: true,
          audioLearner: false,
          kinestheticLearner: false
        },
        careerExposureHistory: [],
        passionIndicators: []
      });
    }
    return this.profiles.get(userId)!;
  }

  /**
   * Track when a student selects and engages with a career
   */
  trackCareerSelection(userId: string, careerId: string, engagementScore: number, selectionType: 'recommended' | 'passion' = 'recommended') {
    const profile = this.getOrCreateProfile(userId);
    
    // Find the career's category
    const career = [...this.ELEMENTARY_CAREERS, ...this.MIDDLE_SCHOOL_CAREERS, ...this.HIGH_SCHOOL_CAREERS]
      .find(c => c.id === careerId);
    const category = career?.category || 'unknown';
    
    // Update exposure history with category tracking
    profile.careerExposureHistory.push({
      careerId,
      date: new Date(),
      engagementScore,
      completionRate: 0,
      category,
      selectionType
    });

    // Update preference scores
    const currentScore = profile.careerPreferences.get(careerId) || 50;
    profile.careerPreferences.set(careerId, Math.min(100, currentScore + engagementScore / 10));
    
    // Track category exposure for analytics
    this.trackCategoryExposure(userId, category);
  }
  
  /**
   * Track category exposure for analytics dashboard
   */
  private trackCategoryExposure(userId: string, category: string) {
    const key = `pathiq_category_exposure_${userId}`;
    const existing = localStorage.getItem(key);
    const exposure = existing ? JSON.parse(existing) : {};
    
    exposure[category] = (exposure[category] || 0) + 1;
    exposure.lastUpdated = new Date().toISOString();
    
    localStorage.setItem(key, JSON.stringify(exposure));
  }

  /**
   * Update career engagement and completion
   */
  updateCareerEngagement(userId: string, careerId: string, completionRate: number) {
    const profile = this.getOrCreateProfile(userId);
    const latestExposure = profile.careerExposureHistory
      .filter(e => e.careerId === careerId)
      .pop();
    
    if (latestExposure) {
      latestExposure.completionRate = completionRate;
    }
  }
  
  /**
   * Get PathIQ Analytics for Teachers/Parents/Principals/Admins
   */
  getPathIQAnalytics(userId: string): {
    careerExploration: {
      totalCareersExplored: number;
      categoryDistribution: { category: string; count: number; percentage: number }[];
      preferredCategories: string[];
      explorationDiversity: number; // 0-100 score
    };
    engagement: {
      averageEngagementScore: number;
      averageCompletionRate: number;
      highEngagementCareers: { career: string; score: number }[];
      lowEngagementCareers: { career: string; score: number }[];
    };
    recommendations: {
      recommendedVsPassion: { recommended: number; passion: number };
      categoryBalance: boolean;
      emergingInterests: string[];
    };
    insights: string[];
  } {
    const profile = this.getOrCreateProfile(userId);
    
    // Get category exposure data
    const key = `pathiq_category_exposure_${userId}`;
    const categoryData = localStorage.getItem(key);
    const categoryExposure = categoryData ? JSON.parse(categoryData) : {};
    delete categoryExposure.lastUpdated;
    
    // Calculate category distribution
    const totalExposures = Object.values(categoryExposure).reduce((sum: any, count: any) => sum + count, 0) as number;
    const categoryDistribution = Object.entries(categoryExposure)
      .map(([category, count]) => ({
        category,
        count: count as number,
        percentage: Math.round(((count as number) / totalExposures) * 100)
      }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate exploration diversity (higher is better)
    const uniqueCategories = Object.keys(categoryExposure).length;
    const possibleCategories = this.CAREER_CATEGORIES.elementary.length; // Adjust based on grade
    const explorationDiversity = Math.round((uniqueCategories / possibleCategories) * 100);
    
    // Get engagement metrics
    const exposures = profile.careerExposureHistory;
    const avgEngagement = exposures.length > 0
      ? exposures.reduce((sum, e) => sum + e.engagementScore, 0) / exposures.length
      : 0;
    const avgCompletion = exposures.length > 0
      ? exposures.reduce((sum, e) => sum + e.completionRate, 0) / exposures.length
      : 0;
    
    // Get high and low engagement careers
    const careerEngagement = new Map<string, number[]>();
    exposures.forEach(e => {
      if (!careerEngagement.has(e.careerId)) {
        careerEngagement.set(e.careerId, []);
      }
      careerEngagement.get(e.careerId)!.push(e.engagementScore);
    });
    
    const careerScores = Array.from(careerEngagement.entries())
      .map(([career, scores]) => ({
        career,
        score: scores.reduce((sum, s) => sum + s, 0) / scores.length
      }))
      .sort((a, b) => b.score - a.score);
    
    const highEngagementCareers = careerScores.slice(0, 3);
    const lowEngagementCareers = careerScores.slice(-3).reverse();
    
    // Count recommended vs passion selections
    const recommendedCount = exposures.filter((e: any) => e.selectionType === 'recommended').length;
    const passionCount = exposures.filter((e: any) => e.selectionType === 'passion').length;
    
    // Identify preferred categories (top 3)
    const preferredCategories = categoryDistribution.slice(0, 3).map(c => c.category);
    
    // Generate insights
    const insights: string[] = [];
    
    if (explorationDiversity < 50) {
      insights.push('Consider encouraging exploration of more diverse career categories');
    } else if (explorationDiversity > 80) {
      insights.push('Excellent career exploration diversity across multiple fields');
    }
    
    if (avgEngagement > 80) {
      insights.push('High engagement levels - student is very interested in career exploration');
    } else if (avgEngagement < 50) {
      insights.push('Low engagement - consider different career presentation approaches');
    }
    
    if (recommendedCount > passionCount * 2) {
      insights.push('Student primarily follows recommendations - encourage passion exploration');
    } else if (passionCount > recommendedCount * 2) {
      insights.push('Student actively explores passion careers - strong self-direction');
    }
    
    if (preferredCategories.length > 0) {
      insights.push(`Strong interest in ${preferredCategories[0]} careers`);
    }
    
    // Check for emerging interests (recent different from historical)
    const recentExposures = exposures.slice(-5);
    const recentCategories = new Set(recentExposures.map((e: any) => e.category));
    const historicalCategories = new Set(exposures.slice(0, -5).map((e: any) => e.category));
    const emergingInterests = Array.from(recentCategories).filter(c => !historicalCategories.has(c));
    
    if (emergingInterests.length > 0) {
      insights.push(`Emerging interest in ${emergingInterests.join(', ')} careers`);
    }
    
    return {
      careerExploration: {
        totalCareersExplored: new Set(exposures.map(e => e.careerId)).size,
        categoryDistribution,
        preferredCategories,
        explorationDiversity
      },
      engagement: {
        averageEngagementScore: Math.round(avgEngagement),
        averageCompletionRate: Math.round(avgCompletion),
        highEngagementCareers,
        lowEngagementCareers
      },
      recommendations: {
        recommendedVsPassion: { recommended: recommendedCount, passion: passionCount },
        categoryBalance: explorationDiversity > 60,
        emergingInterests
      },
      insights
    };
  }
}

export const pathIQService = PathIQService.getInstance();
export type { CareerRating, PathIQProfile };