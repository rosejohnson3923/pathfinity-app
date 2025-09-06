/**
 * AI Companion Images Service
 * Centralized management of AI Companion avatars
 * Now using actual DALL-E generated PNG images
 */

export interface CompanionImage {
  id: string;
  name: string;
  imageUrl: string;
  lightImageUrl: string;
  darkImageUrl: string;
  fallbackEmoji?: string; // Only for emergency fallback
  color: string;
}

// Define the actual AI Companion images using local PNG files
export const AI_COMPANION_IMAGES: Record<string, CompanionImage> = {
  finn: {
    id: 'finn',
    name: 'Finn',
    imageUrl: '/images/companions/finn-light.png', // Default to light theme
    lightImageUrl: '/images/companions/finn-light.png',
    darkImageUrl: '/images/companions/finn-dark.png',
    fallbackEmoji: '🦉',
    color: '#8B5CF6'
  },
  sage: {
    id: 'sage', 
    name: 'Sage',
    imageUrl: '/images/companions/sage-light.png',
    lightImageUrl: '/images/companions/sage-light.png',
    darkImageUrl: '/images/companions/sage-dark.png',
    fallbackEmoji: '🧙',
    color: '#10B981'
  },
  spark: {
    id: 'spark',
    name: 'Spark',
    imageUrl: '/images/companions/spark-light.png',
    lightImageUrl: '/images/companions/spark-light.png',
    darkImageUrl: '/images/companions/spark-dark.png',
    fallbackEmoji: '⚡',
    color: '#F59E0B'
  },
  harmony: {
    id: 'harmony',
    name: 'Harmony',
    imageUrl: '/images/companions/harmony-light.png',
    lightImageUrl: '/images/companions/harmony-light.png',
    darkImageUrl: '/images/companions/harmony-dark.png',
    fallbackEmoji: '🌸',
    color: '#EC4899'
  }
};

/**
 * Get companion image by ID
 */
export function getCompanionImage(companionId: string): CompanionImage {
  const id = companionId.toLowerCase();
  return AI_COMPANION_IMAGES[id] || AI_COMPANION_IMAGES.finn;
}

/**
 * Get companion image URL with theme support
 * @param companionId - The companion ID
 * @param theme - Optional theme ('light' or 'dark'), defaults to 'light'
 */
export function getCompanionImageUrl(companionId: string, theme?: 'light' | 'dark'): string {
  const companion = getCompanionImage(companionId);
  
  // Auto-detect theme if not provided
  if (!theme) {
    const isDarkMode = window.matchMedia?.('(prefers-color-scheme: dark)').matches || 
                       document.documentElement.classList.contains('dark');
    theme = isDarkMode ? 'dark' : 'light';
  }
  
  return theme === 'dark' ? companion.darkImageUrl : companion.lightImageUrl;
}

/**
 * Get companion name
 */
export function getCompanionName(companionId: string): string {
  const companion = getCompanionImage(companionId);
  return companion.name;
}

// Export for backward compatibility during migration
export const COMPANION_IMAGES = AI_COMPANION_IMAGES;