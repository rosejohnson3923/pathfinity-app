/**
 * Static career basic information for display purposes
 * This data is used for the career selection grid WITHOUT making API calls
 * Enriched data is only fetched when user previews or selects a career
 */

export interface CareerBasic {
  id: string;
  name: string;
  icon: string;
  color: string;
  quickDesc: string;
  category: string;
  subjects: string[];
  gradeRange: {
    min: number; // 0 = K, 1-12 for grades
    max: number;
  };
}

// Career categories for grouping
export const CAREER_CATEGORIES = {
  HEALTHCARE: 'Healthcare',
  EDUCATION: 'Education',
  STEM: 'Science & Technology',
  ARTS_CREATIVE: 'Arts & Creative',
  BUSINESS: 'Business & Finance',
  PUBLIC_SERVICE: 'Public Service',
  SPORTS_FITNESS: 'Sports & Fitness',
  ENVIRONMENT: 'Environment & Agriculture',
  MEDIA_COMMUNICATION: 'Media & Communication',
  ENGINEERING: 'Engineering',
  HOSPITALITY: 'Hospitality & Service',
  SKILLED_TRADES: 'Skilled Trades',
  COMMUNITY_HELPERS: 'Community Helpers',
  DIGITAL_MEDIA: 'Digital & Media'
};

// Grade-appropriate career definitions
export const CAREER_BASICS: Record<string, CareerBasic> = {
  // Healthcare Careers
  'doctor': {
    id: 'doctor',
    name: 'Doctor',
    icon: '👩‍⚕️',
    color: '#10B981',
    quickDesc: 'Doctors help people feel better when they are sick',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 0, max: 12 }
  },
  'nurse': {
    id: 'nurse',
    name: 'Nurse',
    icon: '👩‍⚕️',
    color: '#E11D48',
    quickDesc: 'Nurses care for patients and help them heal',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'veterinarian': {
    id: 'veterinarian',
    name: 'Veterinarian',
    icon: '🐾',
    color: '#84CC16',
    quickDesc: 'Veterinarians help animals stay healthy',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'surgeon': {
    id: 'surgeon',
    name: 'Surgeon',
    icon: '🏥',
    color: '#DC2626',
    quickDesc: 'Surgeons perform operations to save lives',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'psychologist': {
    id: 'psychologist',
    name: 'Psychologist',
    icon: '🧠',
    color: '#9333EA',
    quickDesc: 'Psychologists help people understand their thoughts and feelings',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'social', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },

  // Education Careers
  'teacher': {
    id: 'teacher',
    name: 'Teacher',
    icon: '📚',
    color: '#6366F1',
    quickDesc: 'Teachers help students learn new things',
    category: CAREER_CATEGORIES.EDUCATION,
    subjects: ['ela', 'math', 'science', 'social'],
    gradeRange: { min: 0, max: 12 }
  },

  // Science & Technology Careers
  'scientist': {
    id: 'scientist',
    name: 'Scientist',
    icon: '🔬',
    color: '#10B981',
    quickDesc: 'Scientists make discoveries about our world',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'programmer': {
    id: 'programmer',
    name: 'Programmer',
    icon: '💻',
    color: '#7C3AED',
    quickDesc: 'Programmers create computer programs',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: '📊',
    color: '#0891B2',
    quickDesc: 'Data scientists analyze information to solve problems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'marine-biologist': {
    id: 'marine-biologist',
    name: 'Marine Biologist',
    icon: '🐠',
    color: '#0D9488',
    quickDesc: 'Marine biologists study ocean life',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'ai-ml-engineer': {
    id: 'ai-ml-engineer',
    name: 'AI/ML Engineer',
    icon: '🤖',
    color: '#8B5CF6',
    quickDesc: 'AI engineers create smart computer systems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'cybersecurity-specialist': {
    id: 'cybersecurity-specialist',
    name: 'Cybersecurity Specialist',
    icon: '🔒',
    color: '#DC2626',
    quickDesc: 'Cybersecurity experts protect computers from hackers',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'software-engineer': {
    id: 'software-engineer',
    name: 'Software Engineer',
    icon: '💾',
    color: '#6366F1',
    quickDesc: 'Software engineers build computer programs and apps',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'mobile-app-developer': {
    id: 'mobile-app-developer',
    name: 'Mobile App Developer',
    icon: '📱',
    color: '#F97316',
    quickDesc: 'App developers create apps for phones and tablets',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'biotech-researcher': {
    id: 'biotech-researcher',
    name: 'Biotech Researcher',
    icon: '🧬',
    color: '#7C3AED',
    quickDesc: 'Biotechnology researchers develop new medical treatments',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'blockchain-developer': {
    id: 'blockchain-developer',
    name: 'Blockchain Developer',
    icon: '🔗',
    color: '#F59E0B',
    quickDesc: 'Blockchain developers build secure digital systems',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },

  // Arts & Creative Careers
  'artist': {
    id: 'artist',
    name: 'Artist',
    icon: '🎨',
    color: '#F59E0B',
    quickDesc: 'Artists create beautiful paintings and drawings',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 0, max: 12 }
  },
  'musician': {
    id: 'musician',
    name: 'Musician',
    icon: '🎵',
    color: '#6366F1',
    quickDesc: 'Musicians create and perform music',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'writer': {
    id: 'writer',
    name: 'Writer',
    icon: '✍️',
    color: '#D97706',
    quickDesc: 'Writers tell stories through books',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 6, max: 12 }
  },
  'photographer': {
    id: 'photographer',
    name: 'Photographer',
    icon: '📷',
    color: '#7E22CE',
    quickDesc: 'Photographers capture special moments with cameras',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'dancer': {
    id: 'dancer',
    name: 'Dancer',
    icon: '💃',
    color: '#BE185D',
    quickDesc: 'Dancers express feelings through movement',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['ela', 'science'],
    gradeRange: { min: 6, max: 12 }
  },
  'game-designer': {
    id: 'game-designer',
    name: 'Game Designer',
    icon: '🎮',
    color: '#F97316',
    quickDesc: 'Game designers create fun video games',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },

  // Business & Finance Careers
  'entrepreneur': {
    id: 'entrepreneur',
    name: 'Entrepreneur',
    icon: '💼',
    color: '#EA580C',
    quickDesc: 'Entrepreneurs start new businesses',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },
  'investment-banker': {
    id: 'investment-banker',
    name: 'Investment Banker',
    icon: '💰',
    color: '#10B981',
    quickDesc: 'Investment bankers help companies manage money',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },
  'marketing-director': {
    id: 'marketing-director',
    name: 'Marketing Director',
    icon: '📈',
    color: '#EC4899',
    quickDesc: 'Marketing directors create strategies to sell products',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['ela', 'social', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'financial-analyst': {
    id: 'financial-analyst',
    name: 'Financial Analyst',
    icon: '📊',
    color: '#14B8A6',
    quickDesc: 'Financial analysts study money and investments',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },
  'ceo': {
    id: 'ceo',
    name: 'Chief Executive Officer',
    icon: '👔',
    color: '#1E40AF',
    quickDesc: 'CEOs lead companies and make big decisions',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['ela', 'math', 'social'],
    gradeRange: { min: 9, max: 12 }
  },

  // Public Service Careers
  'police-officer': {
    id: 'police-officer',
    name: 'Police Officer',
    icon: '👮',
    color: '#1E40AF',
    quickDesc: 'Police officers protect people and keep communities safe',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'firefighter': {
    id: 'firefighter',
    name: 'Firefighter',
    icon: '🚒',
    color: '#DC2626',
    quickDesc: 'Firefighters save lives and put out fires',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['science', 'math'],
    gradeRange: { min: 6, max: 12 }
  },
  'social-worker': {
    id: 'social-worker',
    name: 'Social Worker',
    icon: '🤝',
    color: '#7C3AED',
    quickDesc: 'Social workers help people and families in need',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'lawyer': {
    id: 'lawyer',
    name: 'Lawyer',
    icon: '⚖️',
    color: '#991B1B',
    quickDesc: 'Lawyers help people with legal problems',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['ela', 'social'],
    gradeRange: { min: 9, max: 12 }
  },

  // Sports & Fitness Careers
  'athlete': {
    id: 'athlete',
    name: 'Athlete',
    icon: '⚽',
    color: '#EF4444',
    quickDesc: 'Athletes play sports and compete in games',
    category: CAREER_CATEGORIES.SPORTS_FITNESS,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },
  'professional-athlete': {
    id: 'professional-athlete',
    name: 'Professional Athlete',
    icon: '🏆',
    color: '#F59E0B',
    quickDesc: 'Professional gamers compete in video game tournaments',
    category: CAREER_CATEGORIES.SPORTS_FITNESS,
    subjects: ['science', 'math'],
    gradeRange: { min: 6, max: 12 }
  },

  // Environment & Agriculture Careers
  'farmer': {
    id: 'farmer',
    name: 'Farmer',
    icon: '🌾',
    color: '#65A30D',
    quickDesc: 'Farmers grow food for people to eat',
    category: CAREER_CATEGORIES.ENVIRONMENT,
    subjects: ['science', 'math'],
    gradeRange: { min: 0, max: 12 }
  },

  // Media & Communication Careers
  'youtuber': {
    id: 'youtuber',
    name: 'YouTuber',
    icon: '📹',
    color: '#EF4444',
    quickDesc: 'YouTubers create videos for the internet',
    category: CAREER_CATEGORIES.MEDIA_COMMUNICATION,
    subjects: ['ela', 'social'],
    gradeRange: { min: 6, max: 12 }
  },

  // Engineering Careers
  'engineer': {
    id: 'engineer',
    name: 'Engineer',
    icon: '⚙️',
    color: '#059669',
    quickDesc: 'Engineers design solutions to problems',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'builder': {
    id: 'builder',
    name: 'Builder',
    icon: '🏗️',
    color: '#8B5CF6',
    quickDesc: 'Civil engineers build roads and bridges',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 0, max: 12 }
  },
  'architect': {
    id: 'architect',
    name: 'Architect',
    icon: '🏛️',
    color: '#4338CA',
    quickDesc: 'Architects design buildings and homes',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },
  'robotics-engineer': {
    id: 'robotics-engineer',
    name: 'Robotics Engineer',
    icon: '🤖',
    color: '#6366F1',
    quickDesc: 'Robotics engineers build robots that help people',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'aerospace-engineer': {
    id: 'aerospace-engineer',
    name: 'Aerospace Engineer',
    icon: '🚀',
    color: '#0EA5E9',
    quickDesc: 'Aerospace engineers design airplanes and spacecraft',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'renewable-energy-engineer': {
    id: 'renewable-energy-engineer',
    name: 'Renewable Energy Engineer',
    icon: '⚡',
    color: '#10B981',
    quickDesc: 'Energy engineers develop clean power systems',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'cloud-architect': {
    id: 'cloud-architect',
    name: 'Cloud Architect',
    icon: '☁️',
    color: '#0EA5E9',
    quickDesc: 'Cloud architects design internet storage systems',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },
  'astronaut': {
    id: 'astronaut',
    name: 'Astronaut',
    icon: '🚀',
    color: '#0EA5E9',
    quickDesc: 'Astronauts explore space and conduct experiments',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['science', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'pilot': {
    id: 'pilot',
    name: 'Pilot',
    icon: '✈️',
    color: '#0284C7',
    quickDesc: 'Pilots fly airplanes to transport people safely',
    category: CAREER_CATEGORIES.ENGINEERING,
    subjects: ['math', 'science'],
    gradeRange: { min: 9, max: 12 }
  },

  // Hospitality & Service Careers
  'chef': {
    id: 'chef',
    name: 'Chef',
    icon: '👨‍🍳',
    color: '#EC4899',
    quickDesc: 'Chefs cook delicious meals in restaurants',
    category: CAREER_CATEGORIES.HOSPITALITY,
    subjects: ['math', 'science', 'ela'],
    gradeRange: { min: 0, max: 12 }
  },

  // Community Helpers (Elementary-focused)
  'cafeteria-worker': {
    id: 'cafeteria-worker',
    name: 'Cafeteria Worker',
    icon: '🍽️',
    color: '#EA580C',
    quickDesc: 'Cafeteria workers serve nutritious meals to students',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['math', 'science', 'social'],
    gradeRange: { min: 0, max: 8 }
  },
  'bus-driver': {
    id: 'bus-driver',
    name: 'Bus Driver',
    icon: '🚌',
    color: '#EAB308',
    quickDesc: 'School bus drivers safely transport students to school',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 0, max: 8 }
  },
  'crossing-guard': {
    id: 'crossing-guard',
    name: 'Crossing Guard',
    icon: '🛑',
    color: '#DC2626',
    quickDesc: 'Crossing guards keep students safe crossing streets',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['social', 'ela'],
    gradeRange: { min: 0, max: 5 }
  },
  'grocery-store-worker': {
    id: 'grocery-store-worker',
    name: 'Grocery Store Worker',
    icon: '🛒',
    color: '#059669',
    quickDesc: 'Store clerks help people find and buy things',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 0, max: 8 }
  },
  'janitor': {
    id: 'janitor',
    name: 'Janitor',
    icon: '🧹',
    color: '#78716C',
    quickDesc: 'Janitors keep buildings clean and safe',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['science', 'math', 'social'],
    gradeRange: { min: 0, max: 8 }
  },
  'librarian': {
    id: 'librarian',
    name: 'Librarian',
    icon: '📚',
    color: '#7C3AED',
    quickDesc: 'Librarians help people find books and information',
    category: CAREER_CATEGORIES.EDUCATION,
    subjects: ['ela', 'social', 'science'],
    gradeRange: { min: 0, max: 12 }
  },
  'mail-carrier': {
    id: 'mail-carrier',
    name: 'Mail Carrier',
    icon: '📬',
    color: '#8B5CF6',
    quickDesc: 'Mail carriers deliver mail to homes and businesses',
    category: CAREER_CATEGORIES.COMMUNITY_HELPERS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 0, max: 8 }
  },
  'park-ranger': {
    id: 'park-ranger',
    name: 'Park Ranger',
    icon: '🌲',
    color: '#10B981',
    quickDesc: 'Park rangers protect nature and help visitors',
    category: CAREER_CATEGORIES.ENVIRONMENT,
    subjects: ['science', 'social', 'ela'],
    gradeRange: { min: 0, max: 12 }
  },

  // Skilled Trades
  'carpenter': {
    id: 'carpenter',
    name: 'Carpenter',
    icon: '🔨',
    color: '#92400E',
    quickDesc: 'Carpenters build things with wood',
    category: CAREER_CATEGORIES.SKILLED_TRADES,
    subjects: ['math', 'science', 'art'],
    gradeRange: { min: 3, max: 12 }
  },
  'electrician': {
    id: 'electrician',
    name: 'Electrician',
    icon: '⚡',
    color: '#FCD34D',
    quickDesc: 'Electricians install and fix electrical systems',
    category: CAREER_CATEGORIES.SKILLED_TRADES,
    subjects: ['science', 'math'],
    gradeRange: { min: 6, max: 12 }
  },
  'plumber': {
    id: 'plumber',
    name: 'Plumber',
    icon: '🔧',
    color: '#3B82F6',
    quickDesc: 'Plumbers fix pipes and water systems',
    category: CAREER_CATEGORIES.SKILLED_TRADES,
    subjects: ['math', 'science'],
    gradeRange: { min: 6, max: 12 }
  },

  // Healthcare Specialists
  'dentist': {
    id: 'dentist',
    name: 'Dentist',
    icon: '🦷',
    color: '#F0F9FF',
    quickDesc: 'Dentists keep teeth healthy and clean',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 0, max: 12 }
  },
  'mental-health-counselor': {
    id: 'mental-health-counselor',
    name: 'Mental Health Counselor',
    icon: '💚',
    color: '#86EFAC',
    quickDesc: 'Therapists help people understand their feelings',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'pharmacist': {
    id: 'pharmacist',
    name: 'Pharmacist',
    icon: '💊',
    color: '#C084FC',
    quickDesc: 'Pharmacists prepare and provide medicine',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'psychiatrist': {
    id: 'psychiatrist',
    name: 'Psychiatrist',
    icon: '🧠',
    color: '#F472B6',
    quickDesc: 'Psychiatrists help people with mental health',
    category: CAREER_CATEGORIES.HEALTHCARE,
    subjects: ['science', 'social', 'ela'],
    gradeRange: { min: 9, max: 12 }
  },

  // Modern/Digital Careers
  'drone-operator': {
    id: 'drone-operator',
    name: 'Drone Operator',
    icon: '🚁',
    color: '#0EA5E9',
    quickDesc: 'Drone pilots fly drones for photography and delivery',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math', 'technology'],
    gradeRange: { min: 3, max: 12 }
  },
  'game-developer': {
    id: 'game-developer',
    name: 'Game Developer',
    icon: '🎮',
    color: '#8B5CF6',
    quickDesc: 'Game developers create video games',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['math', 'science', 'art', 'technology'],
    gradeRange: { min: 3, max: 12 }
  },
  'podcast-producer': {
    id: 'podcast-producer',
    name: 'Podcast Producer',
    icon: '🎙️',
    color: '#EC4899',
    quickDesc: 'Podcasters create audio shows and interviews',
    category: CAREER_CATEGORIES.MEDIA_COMMUNICATION,
    subjects: ['ela', 'social', 'technology'],
    gradeRange: { min: 6, max: 12 }
  },
  'social-media-strategist': {
    id: 'social-media-strategist',
    name: 'Social Media Strategist',
    icon: '📱',
    color: '#06B6D4',
    quickDesc: 'Social media managers run online accounts for businesses',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['ela', 'art', 'social', 'technology'],
    gradeRange: { min: 6, max: 12 }
  },
  'ux-ui-designer': {
    id: 'ux-ui-designer',
    name: 'UX/UI Designer',
    icon: '🎨',
    color: '#F59E0B',
    quickDesc: 'UX designers make apps and websites easy to use',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['art', 'technology', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'video-game-designer': {
    id: 'video-game-designer',
    name: 'Video Game Designer',
    icon: '🕹️',
    color: '#10B981',
    quickDesc: 'Game designers create fun game experiences',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['art', 'math', 'ela', 'technology'],
    gradeRange: { min: 3, max: 12 }
  },
  'web-designer': {
    id: 'web-designer',
    name: 'Web Designer',
    icon: '🌐',
    color: '#6366F1',
    quickDesc: 'Web developers create websites',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['art', 'technology', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'youtuber-content-creator': {
    id: 'youtuber-content-creator',
    name: 'YouTuber/Content Creator',
    icon: '📹',
    color: '#EF4444',
    quickDesc: 'Content creators make videos for the internet',
    category: CAREER_CATEGORIES.DIGITAL_MEDIA,
    subjects: ['ela', 'art', 'technology', 'social'],
    gradeRange: { min: 3, max: 12 }
  },

  // Business/Finance
  'bank-teller': {
    id: 'bank-teller',
    name: 'Bank Teller',
    icon: '🏦',
    color: '#059669',
    quickDesc: 'Accountants help people manage money',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'corporate-lawyer': {
    id: 'corporate-lawyer',
    name: 'Corporate Lawyer',
    icon: '⚖️',
    color: '#1F2937',
    quickDesc: 'Corporate lawyers help businesses with legal matters',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['ela', 'social', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'real-estate-agent': {
    id: 'real-estate-agent',
    name: 'Real Estate Agent',
    icon: '🏡',
    color: '#7C2D12',
    quickDesc: 'Real estate agents help people buy and sell homes',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['math', 'social', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },

  // Additional Professional Careers
  'coach': {
    id: 'coach',
    name: 'Coach',
    icon: '🏅',
    color: '#DC2626',
    quickDesc: 'Coaches train athletes and teams',
    category: CAREER_CATEGORIES.SPORTS_FITNESS,
    subjects: ['physical-education', 'science', 'social'],
    gradeRange: { min: 0, max: 12 }
  },
  'environmental-scientist': {
    id: 'environmental-scientist',
    name: 'Environmental Scientist',
    icon: '🌍',
    color: '#059669',
    quickDesc: 'Environmental scientists protect our planet',
    category: CAREER_CATEGORIES.ENVIRONMENT,
    subjects: ['science', 'math', 'social'],
    gradeRange: { min: 6, max: 12 }
  },
  'graphic-designer': {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    icon: '🎨',
    color: '#EC4899',
    quickDesc: 'Graphic designers create visual designs',
    category: CAREER_CATEGORIES.ARTS_CREATIVE,
    subjects: ['art', 'technology', 'ela'],
    gradeRange: { min: 3, max: 12 }
  },
  'journalist': {
    id: 'journalist',
    name: 'Journalist',
    icon: '📰',
    color: '#6B7280',
    quickDesc: 'Journalists report news and tell stories',
    category: CAREER_CATEGORIES.MEDIA_COMMUNICATION,
    subjects: ['ela', 'social', 'technology'],
    gradeRange: { min: 6, max: 12 }
  },
  'policy-advisor': {
    id: 'policy-advisor',
    name: 'Policy Advisor',
    icon: '📋',
    color: '#4B5563',
    quickDesc: 'Policy makers create rules for communities',
    category: CAREER_CATEGORIES.PUBLIC_SERVICE,
    subjects: ['social', 'ela', 'math'],
    gradeRange: { min: 9, max: 12 }
  },
  'research-scientist': {
    id: 'research-scientist',
    name: 'Research Scientist',
    icon: '🔬',
    color: '#7C3AED',
    quickDesc: 'Researchers discover new knowledge',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math', 'ela'],
    gradeRange: { min: 6, max: 12 }
  },
  'space-industry-professional': {
    id: 'space-industry-professional',
    name: 'Space Industry Professional',
    icon: '🚀',
    color: '#1E40AF',
    quickDesc: 'Space scientists study planets and stars',
    category: CAREER_CATEGORIES.STEM,
    subjects: ['science', 'math', 'technology'],
    gradeRange: { min: 3, max: 12 }
  },
  'sustainability-consultant': {
    id: 'sustainability-consultant',
    name: 'Sustainability Consultant',
    icon: '♻️',
    color: '#16A34A',
    quickDesc: 'Sustainability consultants help organizations protect the environment',
    category: CAREER_CATEGORIES.ENVIRONMENT,
    subjects: ['science', 'social', 'math'],
    gradeRange: { min: 6, max: 12 }
  },
  'team-manager': {
    id: 'team-manager',
    name: 'Team Manager',
    icon: '👥',
    color: '#0891B2',
    quickDesc: 'Leaders guide teams and organizations',
    category: CAREER_CATEGORIES.BUSINESS,
    subjects: ['social', 'ela', 'math'],
    gradeRange: { min: 6, max: 12 }
  }
};

/**
 * Get careers appropriate for a specific grade level
 */
export function getCareersForGrade(gradeLevel: number): CareerBasic[] {
  return Object.values(CAREER_BASICS).filter(career => 
    gradeLevel >= career.gradeRange.min && gradeLevel <= career.gradeRange.max
  );
}

/**
 * Get careers grouped by category for a specific grade
 */
export function getCareersByCategory(gradeLevel: number): Map<string, CareerBasic[]> {
  const careers = getCareersForGrade(gradeLevel);
  const grouped = new Map<string, CareerBasic[]>();
  
  careers.forEach(career => {
    if (!grouped.has(career.category)) {
      grouped.set(career.category, []);
    }
    grouped.get(career.category)!.push(career);
  });
  
  // Sort categories by number of careers (most careers first)
  return new Map(
    Array.from(grouped.entries())
      .sort((a, b) => b[1].length - a[1].length)
  );
}

/**
 * Get recommended careers based on grade and interests
 * Returns 3 careers for quick selection
 */
export function getRecommendedCareers(gradeLevel: number, interests?: string[]): CareerBasic[] {
  const availableCareers = getCareersForGrade(gradeLevel);
  
  // For now, return first 3 appropriate careers from different categories
  const defaultRecommendations = ['teacher', 'doctor', 'artist'];
  
  return defaultRecommendations
    .map(id => CAREER_BASICS[id])
    .filter(career => career && 
      gradeLevel >= career.gradeRange.min && 
      gradeLevel <= career.gradeRange.max
    )
    .slice(0, 3);
}

/**
 * Parse grade string to grade number
 */
export function parseGradeToNumber(grade: string): number {
  if (grade === 'K' || grade === 'k') return 0;
  const num = parseInt(grade);
  return isNaN(num) ? 0 : num;
}