// ================================================================
// CAREER TYPES
// Simplified badge generation without DALL-E dependency
// ================================================================

export interface CareerBadge {
  id: string;
  careerId: string;
  gradeLevel: string;
  imageUrl?: string; // Optional for future DALL-E integration
  emoji: string;
  title: string;
  description: string;
  colors: string[]; // Gradient colors for badge background
  createdAt: Date;
  isFallback?: boolean; // Always true for in-app generated badges
}

export interface CareerOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skills: string[];
  colors: string[];
}