/**
 * Companion Image Service
 * Returns the local companion images instead of generating them
 */

export interface CompanionImageConfig {
  id: string;
  name: string;
  color: string;
  emoji: string;
  lightImage: string;
  darkImage: string;
}

class CompanionImageService {
  private companions: Record<string, CompanionImageConfig> = {
    finn: {
      id: 'finn',
      name: 'Finn',
      color: '#8B5CF6',
      emoji: '🦉',
      lightImage: '/images/companions/finn-light.png',
      darkImage: '/images/companions/finn-dark.png'
    },
    sage: {
      id: 'sage',
      name: 'Sage',
      color: '#10B981',
      emoji: '🧙',
      lightImage: '/images/companions/sage-light.png',
      darkImage: '/images/companions/sage-dark.png'
    },
    spark: {
      id: 'spark',
      name: 'Spark',
      color: '#F59E0B',
      emoji: '⚡',
      lightImage: '/images/companions/spark-light.png',
      darkImage: '/images/companions/spark-dark.png'
    },
    harmony: {
      id: 'harmony',
      name: 'Harmony',
      color: '#EC4899',
      emoji: '🌸',
      lightImage: '/images/companions/harmony-light.png',
      darkImage: '/images/companions/harmony-dark.png'
    }
  };

  /**
   * Get companion image URL based on theme
   */
  getCompanionImage(companionId: string, theme: 'light' | 'dark' = 'light'): string {
    const companion = this.companions[companionId];
    if (!companion) {
      console.warn(`Companion ${companionId} not found, using fallback`);
      return '/images/companions/finn-light.png'; // Default fallback
    }
    
    return theme === 'dark' ? companion.darkImage : companion.lightImage;
  }

  /**
   * Get all companion configurations
   */
  getAllCompanions(): CompanionImageConfig[] {
    return Object.values(this.companions);
  }

  /**
   * Get companion configuration by ID
   */
  getCompanion(companionId: string): CompanionImageConfig | undefined {
    return this.companions[companionId];
  }

  /**
   * Check if companion exists
   */
  hasCompanion(companionId: string): boolean {
    return companionId in this.companions;
  }
}

export const companionImageService = new CompanionImageService();