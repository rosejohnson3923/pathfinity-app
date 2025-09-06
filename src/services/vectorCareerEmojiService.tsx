// ================================================================
// VECTOR CAREER EMOJI SERVICE
// Enhanced career icons with vector emojis for gamification
// ================================================================

import React from 'react';
import { 
  ChefHat, GraduationCap, Stethoscope, Microscope, Paintbrush, 
  Wrench, Code, Calculator, Camera, Music, Gavel, Plane,
  BarChart3, Gamepad2, Palette, Shield, Bot, Rocket,
  Building, Truck, Scissors, Hammer, Book, Heart,
  Users, Globe, Briefcase, Star, Target, Award,
  Trees, BookOpen
} from 'lucide-react';

// Enhanced career definition with vector emoji support
export interface VectorCareerEmoji {
  id: string;
  name: string;
  
  // Multiple representation options for different contexts
  representations: {
    // Fallback unicode emoji (for basic compatibility)
    unicode?: string;
    
    // Lucide icon (for clean, professional look)
    icon?: React.ComponentType<any>;
    
    // Vector emoji paths (OpenMoji, Microsoft Fluent, etc.)
    vectors: {
      openmoji?: string;      // OpenMoji SVG path
      fluent?: string;        // Microsoft Fluent emoji path  
      streamline?: string;    // Streamline vector path
    };
    
    // Animated variants for gamification
    animations?: {
      idle?: string;          // Subtle idle animation
      success?: string;       // Celebration animation
      thinking?: string;      // Problem-solving animation
      excited?: string;       // High engagement animation
    };
  };
  
  // Visual styling
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    gradientColors?: string[];
  };
  
  // Educational metadata
  gradeAppropriate: string[];
  category: 'stem' | 'arts' | 'service' | 'business' | 'trades' | 'emerging';
  skillsAssociated: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Gamification properties
  gamification: {
    unlockLevel: number;        // What level unlocks this career
    xpValue: number;           // XP points for completing career activities
    badges: string[];          // Associated badge IDs
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    prestige: boolean;         // Is this a prestige career?
  };
}

// Vector emoji configuration
export const VECTOR_EMOJI_CONFIG = {
  // OpenMoji SVG base path (you would host these locally or use CDN)
  openmojiBasePath: '/emojis/openmoji/',
  
  // Microsoft Fluent emoji base path
  fluentBasePath: '/emojis/fluent/',
  
  // Animation base path
  animationBasePath: '/animations/career/',
  
  // Preferred rendering order for different grade levels
  renderPreferences: {
    'K': ['unicode', 'openmoji', 'icon'],           // Kindergarten: familiar emojis
    '3rd': ['openmoji', 'fluent', 'unicode'],       // 3rd: colorful vectors
    '7th': ['fluent', 'openmoji', 'icon'],          // 7th: modern design
    '10th': ['fluent', 'animated', 'openmoji']      // 10th: sophisticated + animations
  }
};

// Enhanced career emoji definitions with vector support
export const VECTOR_CAREER_EMOJIS: Record<string, VectorCareerEmoji> = {
  'chef': {
    id: 'chef',
    name: 'Chef',
    representations: {
      unicode: '👨‍🍳',
      icon: ChefHat,
      vectors: {
        openmoji: 'chef-cooking.svg',
        fluent: 'chef-3d.svg',
        streamline: 'chef-custom.svg'
      },
      animations: {
        idle: 'chef-stirring.lottie',
        success: 'chef-celebrating.lottie',
        thinking: 'chef-tasting.lottie',
        excited: 'chef-flame.lottie'
      }
    },
    theme: {
      primaryColor: '#FF6B6B',
      secondaryColor: '#FFE5CC',
      accentColor: '#FFA500',
      gradientColors: ['#FF6B6B', '#FF8E53', '#FF8E53']
    },
    gradeAppropriate: ['K', '1st', '3rd', '7th', '10th'],
    category: 'service',
    skillsAssociated: ['Math-Fractions', 'Science-Chemistry', 'Reading-Instructions'],
    difficulty: 'beginner',
    gamification: {
      unlockLevel: 1,
      xpValue: 100,
      badges: ['master-chef', 'recipe-reader', 'kitchen-scientist'],
      rarity: 'common',
      prestige: false
    }
  },

  'data-scientist': {
    id: 'data-scientist',
    name: 'Data Scientist',
    representations: {
      icon: BarChart3,
      vectors: {
        openmoji: 'data-analyst.svg',
        fluent: 'data-scientist-3d.svg',
        streamline: 'analytics-custom.svg'
      },
      animations: {
        idle: 'data-analyzing.lottie',
        success: 'data-insight.lottie', 
        thinking: 'data-processing.lottie',
        excited: 'data-breakthrough.lottie'
      }
    },
    theme: {
      primaryColor: '#4A90E2',
      secondaryColor: '#7ED321',
      accentColor: '#F5A623',
      gradientColors: ['#667eea', '#764ba2']
    },
    gradeAppropriate: ['7th', '10th'],
    category: 'emerging',
    skillsAssociated: ['Math-Statistics', 'Math-Algebra', 'Science-Analysis'],
    difficulty: 'expert',
    gamification: {
      unlockLevel: 15,
      xpValue: 500,
      badges: ['data-wizard', 'pattern-finder', 'insight-master'],
      rarity: 'legendary',
      prestige: true
    }
  },

  'game-designer': {
    id: 'game-designer',
    name: 'Game Designer',
    representations: {
      icon: Gamepad2,
      vectors: {
        openmoji: 'game-controller.svg',
        fluent: 'gaming-3d.svg',
        streamline: 'game-design-custom.svg'
      },
      animations: {
        idle: 'controller-glow.lottie',
        success: 'level-up.lottie',
        thinking: 'designing-level.lottie',
        excited: 'epic-win.lottie'
      }
    },
    theme: {
      primaryColor: '#9B59B6',
      secondaryColor: '#3498DB',
      accentColor: '#E74C3C',
      gradientColors: ['#8360c3', '#2ebf91']
    },
    gradeAppropriate: ['7th', '10th'],
    category: 'emerging',
    skillsAssociated: ['Math-Logic', 'Art-Design', 'Technology-Programming'],
    difficulty: 'advanced',
    gamification: {
      unlockLevel: 12,
      xpValue: 400,
      badges: ['level-architect', 'story-weaver', 'fun-creator'],
      rarity: 'epic',
      prestige: true
    }
  },

  'robotics-engineer': {
    id: 'robotics-engineer',
    name: 'Robotics Engineer',
    representations: {
      icon: Bot,
      vectors: {
        openmoji: 'robot-face.svg',
        fluent: 'robot-3d.svg',
        streamline: 'robotics-custom.svg'
      },
      animations: {
        idle: 'robot-processing.lottie',
        success: 'robot-dance.lottie',
        thinking: 'robot-calculating.lottie',
        excited: 'robot-transform.lottie'
      }
    },
    theme: {
      primaryColor: '#95A5A6',
      secondaryColor: '#3498DB',
      accentColor: '#E74C3C',
      gradientColors: ['#74b9ff', '#0984e3']
    },
    gradeAppropriate: ['10th'],
    category: 'emerging',
    skillsAssociated: ['Math-Engineering', 'Science-Physics', 'Technology-AI'],
    difficulty: 'expert',
    gamification: {
      unlockLevel: 20,
      xpValue: 600,
      badges: ['robot-builder', 'ai-trainer', 'future-creator'],
      rarity: 'legendary',
      prestige: true
    }
  },

  'park-ranger': {
    id: 'park-ranger',
    name: 'Park Ranger',
    representations: {
      unicode: '🌲',
      icon: Trees,
      vectors: {
        openmoji: 'park-ranger.svg',
        fluent: 'park-ranger-3d.svg',
        streamline: 'ranger-custom.svg'
      },
      animations: {
        idle: 'ranger-hiking.lottie',
        success: 'ranger-celebrating.lottie',
        thinking: 'ranger-observing.lottie',
        excited: 'ranger-discovery.lottie'
      }
    },
    theme: {
      primaryColor: '#2E7D32',
      secondaryColor: '#A5D6A7',
      accentColor: '#8BC34A',
      gradientColors: ['#2E7D32', '#4CAF50', '#8BC34A']
    },
    gradeAppropriate: ['K', '1st', '3rd', '7th', '10th'],
    category: 'service',
    skillsAssociated: ['Science-Nature', 'Math-Measurement', 'Reading-Instructions'],
    difficulty: 'beginner',
    gamification: {
      unlockLevel: 1,
      xpValue: 100,
      badges: ['nature-guardian', 'wildlife-protector', 'environmental-steward'],
      rarity: 'common',
      prestige: false
    }
  },

  'librarian': {
    id: 'librarian',
    name: 'Librarian',
    representations: {
      unicode: '📚',
      icon: BookOpen,
      vectors: {
        openmoji: 'librarian.svg',
        fluent: 'librarian-3d.svg',
        streamline: 'librarian-custom.svg'
      },
      animations: {
        idle: 'librarian-reading.lottie',
        success: 'librarian-celebrating.lottie',
        thinking: 'librarian-researching.lottie',
        excited: 'librarian-discovery.lottie'
      }
    },
    theme: {
      primaryColor: '#7B1FA2',
      secondaryColor: '#E1BEE7',
      accentColor: '#BA68C8',
      gradientColors: ['#7B1FA2', '#9C27B0', '#BA68C8']
    },
    gradeAppropriate: ['K', '1st', '3rd', '7th', '10th'],
    category: 'service',
    skillsAssociated: ['Reading-Comprehension', 'Writing-Organization', 'Research-Skills'],
    difficulty: 'beginner',
    gamification: {
      unlockLevel: 1,
      xpValue: 100,
      badges: ['book-keeper', 'knowledge-seeker', 'story-teller'],
      rarity: 'common',
      prestige: false
    }
  }
};

// ================================================================
// VECTOR CAREER EMOJI SERVICE
// ================================================================

export class VectorCareerEmojiService {
  private static instance: VectorCareerEmojiService;
  
  static getInstance(): VectorCareerEmojiService {
    if (!VectorCareerEmojiService.instance) {
      VectorCareerEmojiService.instance = new VectorCareerEmojiService();
    }
    return VectorCareerEmojiService.instance;
  }

  /**
   * Render career with best representation for grade level
   */
  renderCareerIcon(
    careerId: string,
    gradeLevel: string,
    options: {
      size?: number;
      style?: 'static' | 'animated' | 'interactive';
      theme?: 'light' | 'dark' | 'auto';
      className?: string;
      onClick?: () => void;
    } = {}
  ): React.ReactNode {
    const career = VECTOR_CAREER_EMOJIS[careerId];
    if (!career) return null;

    const {
      size = 48,
      style = 'static',
      theme = 'auto',
      className = '',
      onClick
    } = options;

    const renderOrder = VECTOR_EMOJI_CONFIG.renderPreferences[gradeLevel as keyof typeof VECTOR_EMOJI_CONFIG.renderPreferences] || ['icon'];

    // Try each rendering method in order of preference
    for (const method of renderOrder) {
      const element = this.renderByMethod(career, method, size, style, className);
      if (element) {
        return (
          <div 
            className={`career-icon-wrapper ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onClick={onClick}
            style={{
              '--career-primary': career.theme.primaryColor,
              '--career-secondary': career.theme.secondaryColor,
              '--career-accent': career.theme.accentColor,
            } as React.CSSProperties}
          >
            {element}
          </div>
        );
      }
    }

    return null;
  }

  /**
   * Render career icon by specific method
   */
  private renderByMethod(
    career: VectorCareerEmoji,
    method: string,
    size: number,
    style: string,
    className: string
  ): React.ReactNode {
    switch (method) {
      case 'unicode':
        if (career.representations.unicode) {
          return (
            <span 
              className={`career-emoji ${className}`}
              style={{ fontSize: `${size}px` }}
            >
              {career.representations.unicode}
            </span>
          );
        }
        break;

      case 'icon':
        if (career.representations.icon) {
          const IconComponent = career.representations.icon;
          return (
            <IconComponent
              size={size}
              className={`career-icon ${className}`}
              style={{ color: career.theme.primaryColor }}
            />
          );
        }
        break;

      case 'openmoji':
        if (career.representations.vectors.openmoji) {
          return (
            <img
              src={`${VECTOR_EMOJI_CONFIG.openmojiBasePath}${career.representations.vectors.openmoji}`}
              alt={career.name}
              width={size}
              height={size}
              className={`career-vector ${className}`}
            />
          );
        }
        break;

      case 'fluent':
        if (career.representations.vectors.fluent) {
          return (
            <img
              src={`${VECTOR_EMOJI_CONFIG.fluentBasePath}${career.representations.vectors.fluent}`}
              alt={career.name}
              width={size}
              height={size}
              className={`career-vector ${className}`}
            />
          );
        }
        break;

      case 'animated':
        if (style === 'animated' && career.representations.animations?.idle) {
          return (
            <div 
              className={`career-animation ${className}`}
              style={{ width: size, height: size }}
            >
              {/* Would integrate with Lottie or similar animation library */}
              <div className="lottie-player" data-src={`${VECTOR_EMOJI_CONFIG.animationBasePath}${career.representations.animations.idle}`} />
            </div>
          );
        }
        break;
    }

    return null;
  }

  /**
   * Get careers with gamification data for grade level
   */
  getGameifiedCareersForGrade(gradeLevel: string, studentLevel: number = 1): VectorCareerEmoji[] {
    const normalizedGrade = this.normalizeGradeLevel(gradeLevel);
    
    return Object.values(VECTOR_CAREER_EMOJIS)
      .filter(career => 
        career.gradeAppropriate.includes(normalizedGrade) &&
        career.gamification.unlockLevel <= studentLevel
      )
      .sort((a, b) => {
        // Sort by rarity and unlock level
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        return rarityOrder[a.gamification.rarity] - rarityOrder[b.gamification.rarity];
      });
  }

  /**
   * Get career unlock requirements
   */
  getCareerUnlockInfo(careerId: string): {
    isUnlocked: boolean;
    requiredLevel: number;
    xpReward: number;
    rarity: string;
    badges: string[];
  } {
    const career = VECTOR_CAREER_EMOJIS[careerId];
    if (!career) return {
      isUnlocked: false,
      requiredLevel: 999,
      xpReward: 0,
      rarity: 'common',
      badges: []
    };

    return {
      isUnlocked: true, // Would check actual student level
      requiredLevel: career.gamification.unlockLevel,
      xpReward: career.gamification.xpValue,
      rarity: career.gamification.rarity,
      badges: career.gamification.badges
    };
  }

  /**
   * Trigger career animation
   */
  triggerCareerAnimation(
    careerId: string,
    animationType: 'success' | 'thinking' | 'excited' | 'idle'
  ): void {
    const career = VECTOR_CAREER_EMOJIS[careerId];
    if (!career?.representations.animations?.[animationType]) return;

    // Would trigger Lottie animation or CSS animation
    const animationPath = `${VECTOR_EMOJI_CONFIG.animationBasePath}${career.representations.animations[animationType]}`;
    
    console.log(`🎬 Triggering ${animationType} animation for ${career.name}: ${animationPath}`);
    
    // Implementation would depend on animation library (Lottie, Framer Motion, etc.)
  }

  private normalizeGradeLevel(gradeLevel: string): string {
    const grade = gradeLevel.toLowerCase();
    if (grade.includes('k') || grade.includes('kindergarten')) return 'K';
    if (grade === '1' || grade.includes('1st')) return '1st';
    if (grade === '3' || grade.includes('3rd')) return '3rd';
    if (grade === '7' || grade.includes('7th')) return '7th'; 
    if (grade === '10' || grade.includes('10th')) return '10th';
    return gradeLevel;
  }
}

// Enhanced React hook with gamification
export const useVectorCareerEmoji = (careerId: string, gradeLevel: string, studentLevel: number = 1) => {
  const service = VectorCareerEmojiService.getInstance();
  const career = VECTOR_CAREER_EMOJIS[careerId];
  const unlockInfo = service.getCareerUnlockInfo(careerId);
  
  const renderIcon = (options: any = {}) => service.renderCareerIcon(careerId, gradeLevel, options);
  const triggerAnimation = (type: 'success' | 'thinking' | 'excited' | 'idle') => 
    service.triggerCareerAnimation(careerId, type);

  return {
    career,
    unlockInfo,
    renderIcon,
    triggerAnimation,
    isUnlocked: unlockInfo.isUnlocked,
    theme: career?.theme,
    gamification: career?.gamification
  };
};

export const vectorCareerEmojiService = VectorCareerEmojiService.getInstance();