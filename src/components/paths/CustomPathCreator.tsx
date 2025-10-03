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

// Design System Imports
import '../../design-system/tokens/colors.css';
import '../../design-system/tokens/spacing.css';
import '../../design-system/tokens/borders.css';
import '../../design-system/tokens/typography.css';
import '../../design-system/tokens/shadows.css';
import '../../design-system/tokens/dashboard.css';

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
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--dashboard-bg-primary)' }}>
        <Header showBackButton={true} backButtonDestination="/app/dashboard" />
        
        <main style={{ maxWidth: '56rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
              Create Custom Learning Path
            </h1>
            <p style={{ color: 'var(--dashboard-text-secondary)' }}>
              Design a personalized curriculum for any subject with AI assistance
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--dashboard-bg-elevated)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--dashboard-shadow-card)', border: '1px solid var(--dashboard-border)', padding: 'var(--space-6)' }}>
            {/* Path Basic Info */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--space-6)', marginBottom: 'var(--space-8)' }}>
              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Path Title *
                </label>
                <input
                  type="text"
                  value={newPath.title || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
                  placeholder="e.g., Household Finance, Basic Plumbing, Christianity Studies"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Category *
                </label>
                <select
                  value={newPath.category || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, category: e.target.value }))}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
                >
                  <option value="">Select a category</option>
                  {predefinedCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Description
                </label>
                <textarea
                  value={newPath.description || ''}
                  onChange={(e) => setNewPath(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
                  placeholder="Describe what students will learn and achieve in this path"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 'var(--text-sm)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
                  Grade Level
                </label>
                <select
                  value={newPath.gradeLevel || '6-12'}
                  onChange={(e) => setNewPath(prev => ({ ...prev, gradeLevel: e.target.value }))}
                  style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
                >
                  <option value="K-2">Kindergarten - 2nd Grade</option>
                  <option value="3-5">3rd - 5th Grade</option>
                  <option value="6-8">6th - 8th Grade</option>
                  <option value="9-12">9th - 12th Grade</option>
                  <option value="6-12">6th - 12th Grade</option>
                  <option value="K-12">All Grades</option>
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={newPath.isPublic || false}
                  onChange={(e) => setNewPath(prev => ({ ...prev, isPublic: e.target.checked }))}
                  style={{
                    height: '1rem',
                    width: '1rem',
                    accentColor: 'var(--blue-600)',
                    cursor: 'pointer'
                  }}
                />
                <label
                  htmlFor="isPublic"
                  style={{
                    marginLeft: 'var(--space-2)',
                    display: 'block',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--dashboard-text-primary)',
                    cursor: 'pointer'
                  }}
                >
                  Share with community
                </label>
              </div>
            </div>

            {/* AI Generation */}
            <div style={{ marginBottom: 'var(--space-8)', padding: 'var(--space-6)', background: 'linear-gradient(to right, #F5F3FF, #EFF6FF)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--purple-200)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div style={{ padding: 'var(--space-2)', backgroundColor: 'var(--purple-500)', borderRadius: 'var(--radius-lg)' }}>
                    <Sparkles style={{ width: '1.25rem', height: '1.25rem', color: 'white' }} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>
                      AI Path Generator
                    </h3>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)' }}>
                      Let AI create a complete learning path with skills and career connections
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleGenerateWithAI}
                  disabled={!newPath.title || !newPath.category}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: 'var(--purple-600)',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    cursor: newPath.title && newPath.category ? 'pointer' : 'not-allowed',
                    opacity: newPath.title && newPath.category ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    transition: 'background-color 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (newPath.title && newPath.category) {
                      e.currentTarget.style.backgroundColor = 'var(--purple-700)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--purple-600)';
                  }}
                >
                  <Brain style={{ width: '1rem', height: '1rem' }} />
                  <span>Generate Path</span>
                </button>
              </div>

              {newPath.skills && newPath.skills.length > 0 && (
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <CheckCircle style={{ width: '1rem', height: '1rem' }} />
                  <span>Generated {newPath.skills.length} skills • Total: {newPath.totalHours} hours</span>
                </div>
              )}
            </div>

            {/* Generated Skills Preview */}
            {newPath.skills && newPath.skills.length > 0 && (
              <div style={{ marginBottom: 'var(--space-8)' }}>
                <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-4)' }}>
                  Generated Learning Skills
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  {newPath.skills.map((skill, index) => (
                    <div
                      key={skill.id}
                      style={{
                        border: '1px solid var(--dashboard-border)',
                        borderRadius: 'var(--radius-lg)',
                        padding: 'var(--space-4)',
                        backgroundColor: 'var(--dashboard-bg-elevated)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 'var(--space-2)' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                            <span style={{
                              padding: 'var(--space-1) var(--space-2)',
                              backgroundColor: '#DBEAFE',
                              color: '#1E40AF',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 'var(--font-medium)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {skill.code}
                            </span>
                            <span style={{
                              padding: 'var(--space-1) var(--space-2)',
                              backgroundColor: skill.difficulty === 'Beginner' ? '#D1FAE5' : skill.difficulty === 'Intermediate' ? '#FEF3C7' : '#FEE2E2',
                              color: skill.difficulty === 'Beginner' ? '#065F46' : skill.difficulty === 'Intermediate' ? '#92400E' : '#991B1B',
                              fontSize: 'var(--text-xs)',
                              fontWeight: 'var(--font-medium)',
                              borderRadius: 'var(--radius-sm)'
                            }}>
                              {skill.difficulty}
                            </span>
                          </div>
                          <h4 style={{ fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)' }}>{skill.title}</h4>
                          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', marginTop: 'var(--space-1)' }}>{skill.description}</p>
                        </div>
                        <div style={{ textAlign: 'right', fontSize: 'var(--text-sm)' }}>
                          <div style={{ color: 'var(--dashboard-text-secondary)' }}>{skill.estimatedHours}h</div>
                        </div>
                      </div>

                      <div style={{ marginTop: 'var(--space-3)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)', marginBottom: 'var(--space-1)' }}>Career Applications:</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                          {skill.careerApplications.map((career, idx) => (
                            <span
                              key={idx}
                              style={{
                                padding: 'var(--space-1) var(--space-2)',
                                backgroundColor: 'var(--dashboard-bg-secondary)',
                                color: 'var(--dashboard-text-secondary)',
                                fontSize: 'var(--text-xs)',
                                borderRadius: 'var(--radius-sm)'
                              }}
                            >
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
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                onClick={() => setCurrentView('browse')}
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  border: '1px solid var(--dashboard-border-strong)',
                  color: 'var(--dashboard-text-primary)',
                  backgroundColor: 'transparent',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  transition: 'background-color 200ms ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-secondary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <ArrowLeft style={{ width: '1rem', height: '1rem' }} />
                <span>Back to Browse</span>
              </button>

              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    border: '1px solid var(--dashboard-border-strong)',
                    color: 'var(--dashboard-text-primary)',
                    backgroundColor: 'transparent',
                    borderRadius: 'var(--radius-lg)',
                    cursor: 'pointer',
                    transition: 'background-color 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--dashboard-bg-secondary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Save as Draft
                </button>
                <button
                  disabled={!newPath.title || !newPath.category || !newPath.skills?.length}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    backgroundColor: 'var(--blue-600)',
                    color: 'white',
                    borderRadius: 'var(--radius-lg)',
                    border: 'none',
                    cursor: newPath.title && newPath.category && newPath.skills?.length ? 'pointer' : 'not-allowed',
                    opacity: newPath.title && newPath.category && newPath.skills?.length ? 1 : 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-2)',
                    transition: 'background-color 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (newPath.title && newPath.category && newPath.skills?.length) {
                      e.currentTarget.style.backgroundColor = 'var(--blue-700)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--blue-600)';
                  }}
                >
                  <CheckCircle style={{ width: '1rem', height: '1rem' }} />
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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--dashboard-bg-primary)' }}>
      <Header showBackButton={true} backButtonDestination="/app/dashboard" />
      
      <main style={{ maxWidth: '80rem', margin: '0 auto', padding: 'var(--space-8) var(--space-4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-8)' }}>
          <div>
            <h1 style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--font-bold)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>
              Custom Learning Paths
            </h1>
            <p style={{ color: 'var(--dashboard-text-secondary)' }}>
              Create personalized curricula for any subject with AI assistance
            </p>
          </div>
          <button
            onClick={handleCreatePath}
            style={{
              padding: 'var(--space-2) var(--space-4)',
              backgroundColor: 'var(--blue-600)',
              color: 'white',
              borderRadius: 'var(--radius-lg)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              cursor: 'pointer',
              transition: 'background-color 200ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-700)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--blue-600)';
            }}
          >
            <Plus style={{ width: '1rem', height: '1rem' }} />
            <span>Create Custom Path</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div style={{ marginBottom: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }} data-responsive="sm:flex-row">
          <div style={{ flex: '1', position: 'relative' }}>
            <Search style={{ position: 'absolute', left: 'var(--space-3)', top: '50%', transform: 'translateY(-50%)', color: 'var(--dashboard-text-tertiary)', width: '1rem', height: '1rem' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search paths by title, description, or tags..."
              style={{ width: '100%', paddingLeft: '2.5rem', paddingRight: 'var(--space-4)', paddingTop: 'var(--space-2)', paddingBottom: 'var(--space-2)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
            />
          </div>
          
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: 'var(--space-2) var(--space-3)', border: '1px solid var(--dashboard-border)', borderRadius: 'var(--radius-lg)', backgroundColor: 'var(--dashboard-bg-elevated)', color: 'var(--dashboard-text-primary)' }}
          >
            <option value="all">All Categories</option>
            {predefinedCategories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div style={{ marginBottom: 'var(--space-8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-6)' }}>
          {filteredPaths.map(path => (
            <div
              key={path.id}
              style={{
                backgroundColor: 'var(--dashboard-bg-elevated)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: 'var(--dashboard-shadow-sm)',
                border: '1px solid var(--dashboard-border)',
                padding: 'var(--space-6)',
                transition: 'box-shadow 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = 'var(--dashboard-shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'var(--dashboard-shadow-sm)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <div className={`p-2 rounded-lg ${predefinedCategories.find(c => c.id === path.category)?.color || 'bg-gray-500'}`}>
                    <span style={{ color: 'white', fontSize: 'var(--text-lg)' }}>
                      {predefinedCategories.find(c => c.id === path.category)?.icon || '📚'}
                    </span>
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-1)' }}>
                      <span style={{
                        padding: 'var(--space-1) var(--space-2)',
                        backgroundColor: '#DBEAFE',
                        color: '#1E40AF',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 'var(--font-medium)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        {path.code}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>{path.gradeLevel}</span>
                    </div>
                    <h3 style={{ fontWeight: 'var(--font-semibold)', color: 'var(--dashboard-text-primary)' }}>{path.title}</h3>
                  </div>
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-4)' }}>{path.description}</p>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--text-sm)', color: 'var(--dashboard-text-tertiary)', marginBottom: 'var(--space-2)' }}>
                  <span>{path.skills.length} Skills</span>
                  <span>{path.totalHours} Hours</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  {path.skills.slice(0, 2).map(skill => (
                    <div key={skill.id} style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-secondary)' }}>
                      {skill.code} {skill.title}
                    </div>
                  ))}
                  {path.skills.length > 2 && (
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--blue-600)' }}>
                      +{path.skills.length - 2} more skills
                    </div>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: 'var(--space-4)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                  {path.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      style={{
                        padding: 'var(--space-1) var(--space-2)',
                        backgroundColor: 'var(--dashboard-bg-secondary)',
                        color: 'var(--dashboard-text-secondary)',
                        fontSize: 'var(--text-xs)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--dashboard-text-tertiary)' }}>
                  by {path.createdBy}
                </div>
                <button
                  style={{
                    padding: 'var(--space-1) var(--space-3)',
                    backgroundColor: 'var(--blue-600)',
                    color: 'white',
                    fontSize: 'var(--text-sm)',
                    borderRadius: 'var(--radius-md)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-1)',
                    cursor: 'pointer',
                    transition: 'background-color 200ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--blue-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--blue-600)';
                  }}
                >
                  <span>Use Path</span>
                  <ArrowRight style={{ width: '0.75rem', height: '0.75rem' }} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPaths.length === 0 && (
          <div style={{ textAlign: 'center', padding: 'var(--space-12) 0' }}>
            <BookOpen style={{ width: '3rem', height: '3rem', color: 'var(--dashboard-text-tertiary)', margin: '0 auto var(--space-4)' }} />
            <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-medium)', color: 'var(--dashboard-text-primary)', marginBottom: 'var(--space-2)' }}>No paths found</h3>
            <p style={{ color: 'var(--dashboard-text-secondary)', marginBottom: 'var(--space-4)' }}>
              Try adjusting your search criteria or create a new custom path
            </p>
            <button
              onClick={handleCreatePath}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                backgroundColor: 'var(--blue-600)',
                color: 'white',
                borderRadius: 'var(--radius-lg)',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                cursor: 'pointer',
                transition: 'background-color 200ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-700)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--blue-600)';
              }}
            >
              <Plus style={{ width: '1rem', height: '1rem' }} />
              <span>Create Custom Path</span>
            </button>
          </div>
        )}
      </main>
    </div>
  );
}