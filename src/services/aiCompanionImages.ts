/**
 * AI Companion Images Service
 * Provides image URLs and assets for the 4 AI companions
 */

export interface CompanionImage {
  id: string;
  name: string;
  defaultImage: string;
  happyImage?: string;
  thinkingImage?: string;
  encouragingImage?: string;
  celebratingImage?: string;
}

export const companionImages: Record<string, CompanionImage> = {
  finn: {
    id: 'finn',
    name: 'Finn',
    defaultImage: '/images/companions/finn-light.png',
    happyImage: '/images/companions/finn-light.png',
    thinkingImage: '/images/companions/finn-light.png',
    encouragingImage: '/images/companions/finn-light.png',
    celebratingImage: '/images/companions/finn-light.png'
  },
  spark: {
    id: 'spark',
    name: 'Spark',
    defaultImage: '/images/companions/spark-light.png',
    happyImage: '/images/companions/spark-light.png',
    thinkingImage: '/images/companions/spark-light.png',
    encouragingImage: '/images/companions/spark-light.png',
    celebratingImage: '/images/companions/spark-light.png'
  },
  harmony: {
    id: 'harmony',
    name: 'Harmony',
    defaultImage: '/images/companions/harmony-light.png',
    happyImage: '/images/companions/harmony-light.png',
    thinkingImage: '/images/companions/harmony-light.png',
    encouragingImage: '/images/companions/harmony-light.png',
    celebratingImage: '/images/companions/harmony-light.png'
  },
  sage: {
    id: 'sage',
    name: 'Sage',
    defaultImage: '/images/companions/sage-light.png',
    happyImage: '/images/companions/sage-light.png',
    thinkingImage: '/images/companions/sage-light.png',
    encouragingImage: '/images/companions/sage-light.png',
    celebratingImage: '/images/companions/sage-light.png'
  }
};

/**
 * Get companion image by ID and mood (theme-aware)
 */
export function getCompanionImage(
  companionId: string, 
  mood: 'default' | 'happy' | 'thinking' | 'encouraging' | 'celebrating' = 'default',
  theme?: 'light' | 'dark'
): string {
  const companion = companionImages[companionId.toLowerCase()];
  if (!companion) {
    console.warn(`Companion ${companionId} not found, using Finn as default`);
    return getThemeAwareImage('finn', theme);
  }
  
  // For now, all moods use the same base image (theme-aware)
  return getThemeAwareImage(companionId.toLowerCase(), theme);
}

/**
 * Get theme-aware image path
 */
function getThemeAwareImage(companionId: string, theme?: 'light' | 'dark'): string {
  // Auto-detect theme if not provided
  if (!theme) {
    const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark' || 
                      document.body.classList.contains('theme-dark');
    theme = isDarkMode ? 'dark' : 'light';
  }
  
  return `/images/companions/${companionId}-${theme}.png`;
}

/**
 * Get all companion images
 */
export function getAllCompanions(): CompanionImage[] {
  return Object.values(companionImages);
}

/**
 * Check if companion exists
 */
export function companionExists(companionId: string): boolean {
  return companionId.toLowerCase() in companionImages;
}

/**
 * Get companion image URL (alias for getCompanionImage for backward compatibility)
 */
export function getCompanionImageUrl(
  companionId: string, 
  mood: 'default' | 'happy' | 'thinking' | 'encouraging' | 'celebrating' = 'default',
  theme?: 'light' | 'dark'
): string {
  return getCompanionImage(companionId, mood, theme);
}

// Export default for backward compatibility
export default companionImages;