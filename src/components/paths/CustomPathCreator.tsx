import React, { useState } from 'react';
import { Header } from '../Header';
import { useAuthContext } from '../../contexts/AuthContext';
import { 
  Plus, 
  BookOpen, 
  Target, 
  Users, 
  Zap, 
  ArrowRight, 
  ArrowLeft,
  Brain,
  Lightbulb,
  CheckCircle,
  Settings,
  Search,
  Filter,
  Sparkles
} from 'lucide-react';

interface Skill {
  id: string;
  code: string; // A.1, A.2, etc.
  title: string;
  description: string;
  estimatedHours: number;
  prerequisites: string[];
  careerApplications: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface CustomPath {
  id: string;
  code: string; // A.0, B.0, etc.
  title: string;
  description: string;
  category: string;
  gradeLevel: string;
  totalHours: number;
  skills: Skill[];
  careerOutcomes: string[];
  createdBy: string;
  isPublic: boolean;
  tags: string[];
}

const predefinedCategories = [
  // Wolfram Everyday Life Categories
  { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: 'bg-purple-500' },
  { id: 'hobbies', name: 'Hobbies', icon: '🎨', color: 'bg-pink-500' },
  { id: 'household-science', name: 'Household Science', icon: '🧪', color: 'bg-blue-500' },
  { id: 'personal-finance', name: 'Personal Finance', icon: '💰', color: 'bg-green-500' },
  { id: 'household-math', name: 'Household Math', icon: '🔢', color: 'bg-yellow-500' },
  { id: 'personal-health', name: 'Personal Health', icon: '💪', color: 'bg-red-500' },
  { id: 'todays-world', name: "Today's World", icon: '🌍', color: 'bg-indigo-500' },
  { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-cyan-500' },
  { id: 'esports', name: 'Esports', icon: '🎮', color: 'bg-purple-600' },
  
  // Additional Categories
  { id: 'trades', name: 'Trades & Technical', icon: '🔧', color: 'bg-gray-500' },
  { id: 'faith', name: 'Faith & Philosophy', icon: '✨', color: 'bg-violet-500' },
  { id: 'technology', name: 'Technology', icon: '💻', color: 'bg-slate-500' },
  { id: 'agriculture', name: 'Agriculture & Environment', icon: '🌱', color: 'bg-emerald-500' }
];

const samplePaths: CustomPath[] = [
  {
    id: 'personal-finance-mastery',
    code: 'A.0',
    title: 'Personal Finance Mastery',
    description: 'Master personal finance management, budgeting, and investment fundamentals',
    category: 'personal-finance',
    gradeLevel: '6-12',
    totalHours: 24,
    skills: [
      {
        id: 'understanding-money',
        code: 'A.1',
        title: 'Understanding Money & Banking',
        description: 'Learn currency, banking systems, interest rates, and financial institutions',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Bank Teller', 'Financial Advisor', 'Accountant'],
        difficulty: 'Beginner'
      },
      {
        id: 'budgeting-planning',
        code: 'A.2',
        title: 'Budgeting & Financial Planning',
        description: 'Master budget creation, expense tracking, and financial goal setting',
        estimatedHours: 8,
        prerequisites: ['A.1'],
        careerApplications: ['Financial Planner', 'Budget Analyst', 'Personal Finance Coach'],
        difficulty: 'Intermediate'
      },
      {
        id: 'credit-debt-management',
        code: 'A.3',
        title: 'Credit & Debt Management',
        description: 'Understand credit scores, loans, debt management, and responsible borrowing',
        estimatedHours: 6,
        prerequisites: ['A.1', 'A.2'],
        careerApplications: ['Credit Counselor', 'Loan Officer', 'Financial Advisor'],
        difficulty: 'Intermediate'
      },
      {
        id: 'investment-wealth-building',
        code: 'A.4',
        title: 'Investment & Wealth Building',
        description: 'Introduction to investing, retirement planning, and wealth accumulation strategies',
        estimatedHours: 4,
        prerequisites: ['A.1', 'A.2', 'A.3'],
        careerApplications: ['Investment Advisor', 'Financial Analyst', 'Wealth Manager'],
        difficulty: 'Advanced'
      }
    ],
    careerOutcomes: ['Personal Finance Advisor', 'Financial Planner', 'Investment Counselor'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['finance', 'budgeting', 'investing', 'money-management', 'wolfram-everyday-life']
  },
  {
    id: 'household-science-fundamentals',
    code: 'B.0',
    title: 'Household Science Fundamentals',
    description: 'Apply scientific principles to everyday household tasks and problem-solving',
    category: 'household-science',
    gradeLevel: '6-12',
    totalHours: 20,
    skills: [
      {
        id: 'kitchen-chemistry',
        code: 'B.1',
        title: 'Kitchen Chemistry',
        description: 'Understanding chemical reactions in cooking, cleaning, and food preservation',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Food Scientist', 'Chef', 'Nutritionist'],
        difficulty: 'Beginner'
      },
      {
        id: 'home-energy-efficiency',
        code: 'B.2',
        title: 'Home Energy & Efficiency',
        description: 'Physics of heating, cooling, insulation, and energy conservation',
        estimatedHours: 5,
        prerequisites: ['B.1'],
        careerApplications: ['Energy Auditor', 'HVAC Technician', 'Environmental Consultant'],
        difficulty: 'Intermediate'
      },
      {
        id: 'cleaning-science',
        code: 'B.3',
        title: 'Cleaning Science',
        description: 'Chemistry of soaps, detergents, and effective cleaning methods',
        estimatedHours: 4,
        prerequisites: ['B.1'],
        careerApplications: ['Cleaning Professional', 'Janitorial Supervisor', 'Product Developer'],
        difficulty: 'Beginner'
      },
      {
        id: 'home-safety-science',
        code: 'B.4',
        title: 'Home Safety Science',
        description: 'Understanding fire safety, water quality, air quality, and hazard prevention',
        estimatedHours: 5,
        prerequisites: ['B.1', 'B.2'],
        careerApplications: ['Safety Inspector', 'Environmental Health Specialist', 'Home Inspector'],
        difficulty: 'Intermediate'
      }
    ],
    careerOutcomes: ['Home Inspector', 'Environmental Specialist', 'Food Safety Coordinator'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['science', 'household', 'chemistry', 'physics', 'wolfram-everyday-life']
  },
  {
    id: 'household-math-mastery',
    code: 'C.0',
    title: 'Household Math Mastery',
    description: 'Apply mathematical concepts to real-world household calculations and decisions',
    category: 'household-math',
    gradeLevel: '3-12',
    totalHours: 18,
    skills: [
      {
        id: 'measurement-conversion',
        code: 'C.1',
        title: 'Measurement & Conversion',
        description: 'Master units, conversions, and measurement for cooking, building, and shopping',
        estimatedHours: 4,
        prerequisites: [],
        careerApplications: ['Chef', 'Contractor', 'Retail Manager'],
        difficulty: 'Beginner'
      },
      {
        id: 'home-geometry',
        code: 'C.2',
        title: 'Home Geometry & Area Calculations',
        description: 'Calculate areas, volumes, and spaces for home improvement projects',
        estimatedHours: 6,
        prerequisites: ['C.1'],
        careerApplications: ['Interior Designer', 'Contractor', 'Landscaper'],
        difficulty: 'Intermediate'
      },
      {
        id: 'household-statistics',
        code: 'C.3',
        title: 'Household Statistics & Data',
        description: 'Analyze utility bills, compare prices, and make data-driven household decisions',
        estimatedHours: 5,
        prerequisites: ['C.1'],
        careerApplications: ['Data Analyst', 'Financial Planner', 'Operations Manager'],
        difficulty: 'Intermediate'
      },
      {
        id: 'home-economics-math',
        code: 'C.4',
        title: 'Home Economics Mathematics',
        description: 'Calculate costs, savings, efficiency ratios, and return on investment for home decisions',
        estimatedHours: 3,
        prerequisites: ['C.1', 'C.3'],
        careerApplications: ['Financial Advisor', 'Real Estate Agent', 'Home Economics Teacher'],
        difficulty: 'Advanced'
      }
    ],
    careerOutcomes: ['Home Economics Specialist', 'Cost Analyst', 'Home Improvement Consultant'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['math', 'measurement', 'geometry', 'statistics', 'wolfram-everyday-life']
  },
  {
    id: 'personal-health-wellness',
    code: 'D.0',
    title: 'Personal Health & Wellness',
    description: 'Comprehensive understanding of personal health management and wellness practices',
    category: 'personal-health',
    gradeLevel: '6-12',
    totalHours: 22,
    skills: [
      {
        id: 'nutrition-science',
        code: 'D.1',
        title: 'Nutrition Science',
        description: 'Understanding macronutrients, micronutrients, and healthy eating principles',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Nutritionist', 'Dietitian', 'Health Coach'],
        difficulty: 'Beginner'
      },
      {
        id: 'fitness-exercise-science',
        code: 'D.2',
        title: 'Fitness & Exercise Science',
        description: 'Exercise physiology, workout planning, and physical fitness principles',
        estimatedHours: 6,
        prerequisites: ['D.1'],
        careerApplications: ['Personal Trainer', 'Physical Therapist', 'Fitness Instructor'],
        difficulty: 'Intermediate'
      },
      {
        id: 'mental-health-wellness',
        code: 'D.3',
        title: 'Mental Health & Wellness',
        description: 'Stress management, mindfulness, and emotional health strategies',
        estimatedHours: 5,
        prerequisites: [],
        careerApplications: ['Counselor', 'Wellness Coach', 'Mental Health Advocate'],
        difficulty: 'Beginner'
      },
      {
        id: 'preventive-health',
        code: 'D.4',
        title: 'Preventive Health Care',
        description: 'Understanding healthcare systems, preventive care, and health monitoring',
        estimatedHours: 5,
        prerequisites: ['D.1', 'D.3'],
        careerApplications: ['Health Educator', 'Public Health Worker', 'Healthcare Navigator'],
        difficulty: 'Intermediate'
      }
    ],
    careerOutcomes: ['Health & Wellness Coach', 'Public Health Educator', 'Preventive Care Specialist'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['health', 'nutrition', 'fitness', 'wellness', 'wolfram-everyday-life']
  },
  {
    id: 'entertainment-mastery',
    code: 'E.0',
    title: 'Entertainment Industry Mastery',
    description: 'Comprehensive understanding of music, movies, games, and entertainment industries',
    category: 'entertainment',
    gradeLevel: '6-12',
    totalHours: 28,
    skills: [
      {
        id: 'music-theory-fundamentals',
        code: 'E.1',
        title: 'Music Theory & Musical Instruments',
        description: 'Understanding music theory, composition, and mastering various musical instruments',
        estimatedHours: 8,
        prerequisites: [],
        careerApplications: ['Musician', 'Music Teacher', 'Sound Engineer', 'Music Producer'],
        difficulty: 'Beginner'
      },
      {
        id: 'film-movie-industry',
        code: 'E.2',
        title: 'Film & Movie Industry',
        description: 'Movie production, ratings systems, Academy Awards, and cinema analysis',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Film Critic', 'Movie Producer', 'Film Editor', 'Entertainment Journalist'],
        difficulty: 'Intermediate'
      },
      {
        id: 'gaming-video-games',
        code: 'E.3',
        title: 'Gaming & Video Games',
        description: 'Video game design, game development, and interactive entertainment creation',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Game Designer', 'Game Developer', 'Level Designer', 'Game Tester', 'UI/UX Designer'],
        difficulty: 'Intermediate'
      },
      {
        id: 'creative-hobbies',
        code: 'E.4',
        title: 'Creative Hobbies & Photography',
        description: 'Photography techniques, genealogy research, board games, and word puzzles',
        estimatedHours: 5,
        prerequisites: [],
        careerApplications: ['Photographer', 'Genealogist', 'Game Designer', 'Creative Director'],
        difficulty: 'Beginner'
      },
      {
        id: 'sports-entertainment',
        code: 'E.5',
        title: 'Sports Entertainment',
        description: 'Understanding NFL, MLB, NBA, Olympic Games, and sports stadium management',
        estimatedHours: 3,
        prerequisites: [],
        careerApplications: ['Sports Analyst', 'Sports Journalist', 'Stadium Manager', 'Athletic Director'],
        difficulty: 'Beginner'
      }
    ],
    careerOutcomes: ['Entertainment Industry Professional', 'Creative Content Producer', 'Sports Media Specialist'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['entertainment', 'music', 'movies', 'gaming', 'sports', 'wolfram-everyday-life']
  },
  {
    id: 'travel-exploration',
    code: 'F.0',
    title: 'Travel & World Exploration',
    description: 'Master travel planning, cultural exploration, and global navigation skills',
    category: 'travel',
    gradeLevel: '6-12',
    totalHours: 24,
    skills: [
      {
        id: 'travel-planning-economics',
        code: 'F.1',
        title: 'Travel Planning & Cost Analysis',
        description: 'Understanding cost of living, travel budgeting, and economic planning for trips',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Travel Agent', 'Tour Guide', 'Travel Blogger', 'Hospitality Manager'],
        difficulty: 'Beginner'
      },
      {
        id: 'transportation-systems',
        code: 'F.2',
        title: 'Transportation & Infrastructure',
        description: 'Airports, bridges, tunnels, dams, and global transportation networks',
        estimatedHours: 6,
        prerequisites: ['F.1'],
        careerApplications: ['Transportation Planner', 'Infrastructure Engineer', 'Airport Manager', 'Logistics Coordinator'],
        difficulty: 'Intermediate'
      },
      {
        id: 'cultural-attractions',
        code: 'F.3',
        title: 'Cultural Attractions & Points of Interest',
        description: 'Museums, castles, parks, amusement parks, and historical landmarks',
        estimatedHours: 6,
        prerequisites: ['F.1'],
        careerApplications: ['Museum Curator', 'Park Ranger', 'Tourism Director', 'Cultural Historian'],
        difficulty: 'Intermediate'
      },
      {
        id: 'global-navigation',
        code: 'F.4',
        title: 'Global Navigation & Geography',
        description: 'International travel, cultural awareness, and global geographic knowledge',
        estimatedHours: 6,
        prerequisites: ['F.1', 'F.2', 'F.3'],
        careerApplications: ['International Tour Guide', 'Cultural Liaison', 'Global Business Consultant', 'Diplomat'],
        difficulty: 'Advanced'
      }
    ],
    careerOutcomes: ['Travel Industry Professional', 'Tourism Manager', 'Cultural Heritage Specialist'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['travel', 'tourism', 'culture', 'geography', 'infrastructure', 'wolfram-everyday-life']
  },
  {
    id: 'trades-technical-careers',
    code: 'G.0',
    title: 'Trades & Technical Career Preparation',
    description: 'Comprehensive preparation for skilled trades and technical career paths',
    category: 'trades',
    gradeLevel: '9-12',
    totalHours: 36,
    skills: [
      {
        id: 'construction-trades',
        code: 'G.1',
        title: 'Construction & Building Trades',
        description: 'Electrician, plumber, carpenter, HVAC technician, and construction management skills',
        estimatedHours: 12,
        prerequisites: [],
        careerApplications: ['Electrician', 'Plumber', 'Carpenter', 'HVAC Technician', 'Construction Manager'],
        difficulty: 'Intermediate'
      },
      {
        id: 'healthcare-technical',
        code: 'G.2',
        title: 'Healthcare Technical Specialties',
        description: 'Dental hygienist, ultrasonographer, respiratory therapist, and licensed practical nurse training',
        estimatedHours: 10,
        prerequisites: [],
        careerApplications: ['Dental Hygienist', 'Ultrasonographer', 'Respiratory Therapist', 'Licensed Practical Nurse'],
        difficulty: 'Advanced'
      },
      {
        id: 'mechanical-technical',
        code: 'G.3',
        title: 'Mechanical & Technical Services',
        description: 'Aircraft mechanic, solar installer, cable technician, and specialized technical roles',
        estimatedHours: 8,
        prerequisites: ['G.1'],
        careerApplications: ['Aircraft Mechanic', 'Solar Installer', 'Cable Technician', 'Technical Specialist'],
        difficulty: 'Advanced'
      },
      {
        id: 'business-service-trades',
        code: 'G.4',
        title: 'Business & Service Trades',
        description: 'Real estate agent and other service-oriented trade professions',
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Real Estate Agent', 'Service Business Owner', 'Trade Consultant'],
        difficulty: 'Intermediate'
      }
    ],
    careerOutcomes: ['Skilled Trade Professional', 'Technical Specialist', 'Healthcare Technician'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['trades', 'technical', 'construction', 'healthcare', 'mechanical', 'wolfram-everyday-life']
  },
  {
    id: 'esports-professional-pathway',
    code: 'H.0',
    title: 'Esports Professional Pathway',
    description: 'Complete preparation for professional esports careers, content creation, and gaming industry roles',
    category: 'esports',
    gradeLevel: '9-12',
    totalHours: 32,
    skills: [
      {
        id: 'competitive-gaming',
        code: 'H.1',
        title: 'Competitive Gaming & Strategy',
        description: 'Master competitive gameplay, strategy development, and professional gaming skills',
        estimatedHours: 8,
        prerequisites: [],
        careerApplications: ['Professional Gamer', 'Esports Coach', 'Strategy Analyst', 'Team Captain'],
        difficulty: 'Intermediate'
      },
      {
        id: 'content-creation-streaming',
        code: 'H.2',
        title: 'Content Creation & Streaming',
        description: 'Build audience through streaming, video creation, and social media presence',
        estimatedHours: 8,
        prerequisites: [],
        careerApplications: ['Esports Influencer', 'Content Creator', 'Streamer', 'Social Media Manager'],
        difficulty: 'Intermediate'
      },
      {
        id: 'broadcast-production',
        code: 'H.3',
        title: 'Broadcast & Production',
        description: 'Professional esports broadcasting, commentary, and event production',
        estimatedHours: 8,
        prerequisites: ['H.1'],
        careerApplications: ['Shoutcaster', 'Videographer', 'Production Engineer', 'Sound Engineer'],
        difficulty: 'Advanced'
      },
      {
        id: 'esports-business-tech',
        code: 'H.4',
        title: 'Esports Business & Technology',
        description: 'Team management, talent scouting, and cutting-edge gaming technology',
        estimatedHours: 8,
        prerequisites: ['H.1', 'H.2'],
        careerApplications: [
          'Talent Scout', 'Team Manager', 'Gameplay Designer', 'Animation Engineer',
          'AI Design Engineer', 'AI Prompt Engineer', 'Photographer', 'Event Coordinator'
        ],
        difficulty: 'Advanced'
      }
    ],
    careerOutcomes: ['Professional Esports Player', 'Esports Content Creator', 'Gaming Industry Professional'],
    createdBy: 'Curated by Finn',
    isPublic: true,
    tags: ['esports', 'gaming', 'competitive', 'streaming', 'content-creation', 'professional-gaming']
  }
];

export function CustomPathCreator() {
  const { user } = useAuthContext();
  const [currentView, setCurrentView] = useState<'browse' | 'create' | 'edit'>('browse');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPath, setSelectedPath] = useState<CustomPath | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New path creation state
  const [newPath, setNewPath] = useState<Partial<CustomPath>>({
    title: '',
    description: '',
    category: '',
    gradeLevel: '6-12',
    skills: [],
    tags: [],
    isPublic: false
  });

  const filteredPaths = samplePaths.filter(path => {
    const matchesCategory = selectedCategory === 'all' || path.category === selectedCategory;
    const matchesSearch = path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleCreatePath = () => {
    setCurrentView('create');
    setIsCreatingNew(true);
    setNewPath({
      title: '',
      description: '',
      category: '',
      gradeLevel: '6-12',
      skills: [],
      tags: [],
      isPublic: false
    });
  };

  const handleGenerateWithAI = async () => {
    if (!newPath.title || !newPath.category) {
      alert('Please enter a path title and select a category first.');
      return;
    }

    // Simulate AI generation
    const generatedSkills: Skill[] = [
      {
        id: `${newPath.title?.toLowerCase().replace(/\s+/g, '-')}-basics`,
        code: 'X.1',
        title: `${newPath.title} Basics`,
        description: `Introduction to fundamental concepts of ${newPath.title}`,
        estimatedHours: 6,
        prerequisites: [],
        careerApplications: ['Entry Level Position', 'Assistant Role'],
        difficulty: 'Beginner'
      },
      {
        id: `${newPath.title?.toLowerCase().replace(/\s+/g, '-')}-intermediate`,
        code: 'X.2',
        title: `Intermediate ${newPath.title}`,
        description: `Building on basics with practical applications`,
        estimatedHours: 8,
        prerequisites: ['X.1'],
        careerApplications: ['Technician', 'Specialist'],
        difficulty: 'Intermediate'
      },
      {
        id: `${newPath.title?.toLowerCase().replace(/\s+/g, '-')}-advanced`,
        code: 'X.3',
        title: `Advanced ${newPath.title}`,
        description: `Master-level skills and professional applications`,
        estimatedHours: 10,
        prerequisites: ['X.1', 'X.2'],
        careerApplications: ['Expert', 'Consultant', 'Manager'],
        difficulty: 'Advanced'
      }
    ];

    setNewPath(prev => ({
      ...prev,
      skills: generatedSkills,
      totalHours: generatedSkills.reduce((sum, skill) => sum + skill.estimatedHours, 0)
    }));
  };

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header showBackButton={true} backButtonDestination="/app/dashboard" />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Create Custom Learning Path
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Design a personalized curriculum for any subject with AI assistance
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            {/* Path Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Path Title *
                </label>
                <input
                  type="text"
                  value={newPath.title || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Household Finance, Basic Plumbing, Christianity Studies"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  value={newPath.category || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newPath.description || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe what students will learn and achieve in this path"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade Level
                </label>
                <select
                  value={newPath.gradeLevel || '6-12'}
                  onChange={(e) => setNewPath(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="K-2">Kindergarten - 2nd Grade</option>
                  <option value="3-5">3rd - 5th Grade</option>
                  <option value="6-8">6th - 8th Grade</option>
                  <option value="9-12">9th - 12th Grade</option>
                  <option value="6-12">6th - 12th Grade</option>
                  <option value="K-12">All Grades</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPath.isPublic || false}
                  onChange={(e) => setNewPath(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Share with community
                </label>
              </div>
            </div>

            {/* AI Generation */}
            <div className="mb-8 p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Path Generator
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Let AI create a complete learning path with skills and career connections
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={!newPath.title || !newPath.category}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Brain className="w-4 h-4" />
                  <span>Generate Path</span>
                </button>
              </div>
              
              {newPath.skills && newPath.skills.length > 0 && (
                <div className="text-sm text-green-700 dark:text-green-400 flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Generated {newPath.skills.length} skills • Total: {newPath.totalHours} hours</span>
                </div>
              )}
            </div>

            {/* Generated Skills Preview */}
            {newPath.skills && newPath.skills.length > 0 && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Generated Learning Skills
                </h3>
                <div className="space-y-4">
                  {newPath.skills.map((skill, index) => (
                    <div key={skill.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                              {skill.code}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              skill.difficulty === 'Beginner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                              skill.difficulty === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                              'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                            }`}>
                              {skill.difficulty}
                            </span>
                          </div>
                          <h4 className="font-medium text-gray-900 dark:text-white">{skill.title}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{skill.description}</p>
                        </div>
                        <div className="text-right text-sm">
                          <div className="text-gray-600 dark:text-gray-400">{skill.estimatedHours}h</div>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Career Applications:</div>
                        <div className="flex flex-wrap gap-1">
                          {skill.careerApplications.map((career, idx) => (
                            <span key={idx} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                              {career}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentView('browse')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Browse</span>
              </button>
              
              <div className="flex space-x-3">
                <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
                  Save as Draft
                </button>
                <button 
                  disabled={!newPath.title || !newPath.category || !newPath.skills?.length}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Create Path</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header showBackButton={true} backButtonDestination="/app/dashboard" />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Custom Learning Paths
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Create personalized curricula for any subject with AI assistance
            </p>
          </div>
          <button
            onClick={handleCreatePath}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Path</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paths by title, description, or tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          >
            <option value="all">All Categories</option>
            {predefinedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            All Paths
          </button>
          {predefinedCategories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPaths.map(path => (
            <div key={path.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${predefinedCategories.find(c => c.id === path.category)?.color || 'bg-gray-500'}`}>
                    <span className="text-white text-lg">
                      {predefinedCategories.find(c => c.id === path.category)?.icon || '📚'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded">
                        {path.code}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">{path.gradeLevel}</span>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{path.title}</h3>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{path.description}</p>
              
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                  <span>{path.skills.length} Skills</span>
                  <span>{path.totalHours} Hours</span>
                </div>
                <div className="space-y-1">
                  {path.skills.slice(0, 2).map(skill => (
                    <div key={skill.id} className="text-xs text-gray-600 dark:text-gray-400">
                      {skill.code} {skill.title}
                    </div>
                  ))}
                  {path.skills.length > 2 && (
                    <div className="text-xs text-blue-600 dark:text-blue-400">
                      +{path.skills.length - 2} more skills
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {path.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  by {path.createdBy}
                </div>
                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 flex items-center space-x-1">
                  <span>Use Path</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPaths.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No paths found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Try adjusting your search criteria or create a new custom path
            </p>
            <button
              onClick={handleCreatePath}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Create Custom Path</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}