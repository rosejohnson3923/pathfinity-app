// ================================================================
// CAREER EMOJI SERVICE
// Manages career icons using hybrid emoji + Lucide icon approach
// ================================================================

import { 
  ChefHat, GraduationCap, Stethoscope, Microscope, Paintbrush, 
  Wrench, Code, Calculator, Camera, Music, Gavel, Plane,
  BarChart3, Gamepad2, Palette, Shield, Bot, Rocket,
  Building, Truck, Scissors, Hammer, Book, Heart,
  Users, Globe, Briefcase, Star, Target, Award
} from 'lucide-react';
import React from 'react';

// Career definition with visual representation
export interface CareerEmoji {
  id: string;
  name: string;
  emoji?: string;           // Unicode emoji (if available)
  icon?: React.ComponentType<any>; // Lucide icon component
  color: string;            // Theme color for career
  gradeAppropriate: string[]; // Which grades this career appears for
  category: 'stem' | 'arts' | 'service' | 'business' | 'trades' | 'emerging';
}

// Comprehensive career emoji mapping
export const CAREER_EMOJIS: Record<string, CareerEmoji> = {
  // ================================================================
  // KINDERGARTEN CAREERS (Simple, recognizable)
  // ================================================================
  'chef': {
    id: 'chef',
    name: 'Chef',
    emoji: '👨‍🍳',
    color: '#FF6B6B',
    gradeAppropriate: ['K', '3rd', '7th', '10th'],
    category: 'service'
  },
  
  'teacher': {
    id: 'teacher', 
    name: 'Teacher',
    emoji: '👩‍🏫',
    color: '#4ECDC4',
    gradeAppropriate: ['K', '3rd', '7th', '10th'],
    category: 'service'
  },
  
  'doctor': {
    id: 'doctor',
    name: 'Doctor', 
    emoji: '👩‍⚕️',
    color: '#45B7D1',
    gradeAppropriate: ['K', '3rd', '7th', '10th'],
    category: 'service'
  },
  
  'firefighter': {
    id: 'firefighter',
    name: 'Firefighter',
    emoji: '👨‍🚒',
    color: '#E74C3C',
    gradeAppropriate: ['K', '3rd'],
    category: 'service'
  },
  
  'artist': {
    id: 'artist',
    name: 'Artist',
    emoji: '👩‍🎨',
    color: '#9B59B6',
    gradeAppropriate: ['K', '3rd', '7th', '10th'],
    category: 'arts'
  },
  
  'farmer': {
    id: 'farmer',
    name: 'Farmer',
    emoji: '👨‍🌾',
    color: '#27AE60',
    gradeAppropriate: ['K', '3rd'],
    category: 'service'
  },
  
  // ================================================================
  // 3RD GRADE+ CAREERS (More detailed understanding)
  // ================================================================
  'scientist': {
    id: 'scientist',
    name: 'Scientist',
    emoji: '👩‍🔬',
    color: '#3498DB',
    gradeAppropriate: ['3rd', '7th', '10th'],
    category: 'stem'
  },
  
  'engineer': {
    id: 'engineer',
    name: 'Engineer',
    emoji: '👷‍♀️',
    color: '#F39C12',
    gradeAppropriate: ['3rd', '7th', '10th'],
    category: 'stem'
  },
  
  'musician': {
    id: 'musician',
    name: 'Musician',
    icon: Music,
    color: '#8E44AD',
    gradeAppropriate: ['3rd', '7th', '10th'],
    category: 'arts'
  },
  
  'photographer': {
    id: 'photographer',
    name: 'Photographer',
    icon: Camera,
    color: '#34495E',
    gradeAppropriate: ['3rd', '7th', '10th'],
    category: 'arts'
  },
  
  // ================================================================
  // 7TH GRADE+ CAREERS (Complex careers)
  // ================================================================
  'programmer': {
    id: 'programmer',
    name: 'Software Developer',
    icon: Code,
    color: '#2ECC71',
    gradeAppropriate: ['7th', '10th'],
    category: 'stem'
  },
  
  'accountant': {
    id: 'accountant',
    name: 'Accountant',
    icon: Calculator,
    color: '#16A085',
    gradeAppropriate: ['7th', '10th'],
    category: 'business'
  },
  
  'lawyer': {
    id: 'lawyer',
    name: 'Lawyer',
    icon: Gavel,
    color: '#8E44AD',
    gradeAppropriate: ['7th', '10th'],
    category: 'service'
  },
  
  'pilot': {
    id: 'pilot',
    name: 'Pilot',
    emoji: '👨‍✈️',
    color: '#3498DB',
    gradeAppropriate: ['7th', '10th'],
    category: 'service'
  },
  
  // ================================================================
  // 10TH GRADE+ CAREERS (Advanced/Emerging careers)
  // ================================================================
  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    icon: BarChart3,
    color: '#E67E22',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  },
  
  'game-designer': {
    id: 'game-designer',
    name: 'Game Designer',
    icon: Gamepad2,
    color: '#9B59B6',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  },
  
  'ux-designer': {
    id: 'ux-designer',
    name: 'UX Designer',
    icon: Palette,
    color: '#E74C3C',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  },
  
  'cybersecurity': {
    id: 'cybersecurity',
    name: 'Cybersecurity Expert',
    icon: Shield,
    color: '#34495E',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  },
  
  'robotics-engineer': {
    id: 'robotics-engineer',
    name: 'Robotics Engineer',
    icon: Bot,
    color: '#95A5A6',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  },
  
  'space-engineer': {
    id: 'space-engineer',
    name: 'Aerospace Engineer',
    icon: Rocket,
    color: '#2C3E50',
    gradeAppropriate: ['10th'],
    category: 'emerging'
  }
};

// ================================================================
// CAREER EMOJI SERVICE
// ================================================================

export class CareerEmojiService {
  private static instance: CareerEmojiService;
  
  static getInstance(): CareerEmojiService {
    if (!CareerEmojiService.instance) {
      CareerEmojiService.instance = new CareerEmojiService();
    }
    return CareerEmojiService.instance;
  }

  /**
   * Get careers appropriate for a specific grade level
   */
  getCareersForGrade(gradeLevel: string): CareerEmoji[] {
    const normalizedGrade = this.normalizeGradeLevel(gradeLevel);
    
    return Object.values(CAREER_EMOJIS).filter(career => 
      career.gradeAppropriate.includes(normalizedGrade)
    );
  }

  /**
   * Get a specific career by ID
   */
  getCareer(careerId: string): CareerEmoji | undefined {
    return CAREER_EMOJIS[careerId];
  }

  /**
   * Get careers by category
   */
  getCareersByCategory(category: CareerEmoji['category']): CareerEmoji[] {
    return Object.values(CAREER_EMOJIS).filter(career => 
      career.category === category
    );
  }

  /**
   * Render career icon (emoji or Lucide icon)
   */
  renderCareerIcon(
    careerId: string, 
    size: number = 24,
    className: string = ''
  ): React.ReactNode {
    const career = this.getCareer(careerId);
    if (!career) return null;

    // Use emoji if available
    if (career.emoji) {
      return (
        <span 
          className={`inline-block ${className}`}
          style={{ fontSize: `${size}px` }}
        >
          {career.emoji}
        </span>
      );
    }

    // Use Lucide icon
    if (career.icon) {
      const IconComponent = career.icon;
      return (
        <IconComponent 
          size={size}
          className={className}
          style={{ color: career.color }}
        />
      );
    }

    return null;
  }

  /**
   * Get random career for grade level
   */
  getRandomCareerForGrade(gradeLevel: string): CareerEmoji {
    const careers = this.getCareersForGrade(gradeLevel);
    return careers[Math.floor(Math.random() * careers.length)];
  }

  /**
   * Search careers by name
   */
  searchCareers(query: string): CareerEmoji[] {
    const lowercaseQuery = query.toLowerCase();
    return Object.values(CAREER_EMOJIS).filter(career =>
      career.name.toLowerCase().includes(lowercaseQuery) ||
      career.id.toLowerCase().includes(lowercaseQuery)
    );
  }

  /**
   * Get career progression (simpler → more complex versions)
   */
  getCareerProgression(baseCareer: string): CareerEmoji[] {
    // This could map related careers across grade levels
    const progressions: Record<string, string[]> = {
      'artist': ['artist', 'photographer', 'ux-designer'],
      'engineer': ['engineer', 'programmer', 'robotics-engineer'],
      'scientist': ['scientist', 'data-scientist', 'space-engineer'],
      'teacher': ['teacher', 'programmer', 'data-scientist'] // Teaching → EdTech
    };

    const progression = progressions[baseCareer];
    if (!progression) return [CAREER_EMOJIS[baseCareer]].filter(Boolean);

    return progression.map(id => CAREER_EMOJIS[id]).filter(Boolean);
  }

  /**
   * Normalize grade level format
   */
  private normalizeGradeLevel(gradeLevel: string): string {
    const grade = gradeLevel.toLowerCase();
    if (grade.includes('k') || grade.includes('kindergarten')) return 'K';
    if (grade.includes('3')) return '3rd';
    if (grade.includes('7')) return '7th';
    if (grade.includes('10')) return '10th';
    return gradeLevel;
  }

  /**
   * Get themed career set for assignment
   */
  getThemedCareerSet(theme: string, gradeLevel: string): CareerEmoji[] {
    const gradeAppropriate = this.getCareersForGrade(gradeLevel);
    
    const themes: Record<string, string[]> = {
      'cooking': ['chef', 'farmer', 'scientist'],
      'building': ['engineer', 'architect', 'carpenter'],
      'helping': ['doctor', 'teacher', 'firefighter'],
      'creating': ['artist', 'musician', 'game-designer'],
      'technology': ['programmer', 'robotics-engineer', 'cybersecurity'],
      'nature': ['farmer', 'scientist', 'park-ranger']
    };

    const themeIds = themes[theme] || [];
    return themeIds
      .map(id => CAREER_EMOJIS[id])
      .filter(career => career && career.gradeAppropriate.includes(this.normalizeGradeLevel(gradeLevel)));
  }
}

// Export singleton instance
export const careerEmojiService = CareerEmojiService.getInstance();

// React hook for easy usage
export const useCareerEmoji = (careerId: string) => {
  const career = careerEmojiService.getCareer(careerId);
  
  return {
    career,
    icon: career ? careerEmojiService.renderCareerIcon(careerId) : null,
    color: career?.color,
    name: career?.name
  };
};

// Helper component for rendering career icons
export const CareerIcon: React.FC<{
  careerId: string;
  size?: number;
  className?: string;
}> = ({ careerId, size = 24, className = '' }) => {
  return (
    <>
      {careerEmojiService.renderCareerIcon(careerId, size, className)}
    </>
  );
};

export default careerEmojiService;