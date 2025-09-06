// ================================================================
// CAREER BADGE SERVICE
// In-app badge generation with emoji and gradients (DALL-E removed)
// ================================================================

import { CareerBadge } from '../types/CareerTypes';

export interface CareerBadgeRequest {
  careerId: string;
  careerName: string;
  department: string;
  gradeLevel: string;
  studentName?: string;
  description?: string;
  achievements?: string[];
}

class CareerBadgeService {
  /**
   * Generate a career badge using in-app emoji and gradients
   */
  async generateCareerBadge(request: CareerBadgeRequest): Promise<CareerBadge> {
    console.log(`🎨 Generating in-app badge for career: ${request.careerId}`);
    
    const emoji = this.getCareerEmoji(request.careerId);
    const gradientColors = this.getGradientColors(request.careerId);
    const title = this.formatCareerTitle(request.careerId);
    
    const badge: CareerBadge = {
      id: `badge-${request.careerId}-${request.gradeLevel}`,
      careerId: request.careerId,
      gradeLevel: request.gradeLevel,
      imageUrl: '', // No image for in-app generation
      emoji: emoji,
      title: title,
      description: request.description || `${title} Badge - ${request.gradeLevel} Level`,
      colors: gradientColors,
      createdAt: new Date(),
      isFallback: true // Always true for in-app generation
    };

    console.log(`✅ Generated in-app badge:`, badge);
    return badge;
  }

  /**
   * Get emoji for career
   */
  private getCareerEmoji(careerId: string): string {
    const emojiMap: { [key: string]: string } = {
      'chef': '👨‍🍳',
      'librarian': '📚',
      'park-ranger': '🌲',
      'teacher': '👩‍🏫',
      'doctor': '👨‍⚕️',
      'engineer': '⚙️',
      'scientist': '🔬',
      'artist': '👨‍🎨',
      'pilot': '👨‍✈️',
      'firefighter': '👨‍🚒',
      'astronaut': '👨‍🚀',
      'musician': '👨‍🎤',
      'athlete': '🏃‍♂️',
      'veterinarian': '👩‍⚕️',
      'architect': '👷‍♂️',
      'professional': '💼'
    };
    return emojiMap[careerId] || '💼';
  }

  /**
   * Get gradient colors for career badge
   */
  private getGradientColors(careerId: string): string[] {
    const colorMap: { [key: string]: string[] } = {
      'chef': ['#FF6B6B', '#4ECDC4'],
      'librarian': ['#6C63FF', '#3F3D56'],
      'park-ranger': ['#2ECC71', '#27AE60'],
      'teacher': ['#F39C12', '#E67E22'],
      'doctor': ['#E74C3C', '#C0392B'],
      'engineer': ['#3498DB', '#2980B9'],
      'scientist': ['#1ABC9C', '#16A085'],
      'artist': ['#9B59B6', '#8E44AD'],
      'pilot': ['#34495E', '#2C3E50'],
      'firefighter': ['#E74C3C', '#F39C12'],
      'astronaut': ['#2C3E50', '#8E44AD'],
      'musician': ['#E67E22', '#D35400'],
      'athlete': ['#27AE60', '#2ECC71'],
      'veterinarian': ['#16A085', '#1ABC9C'],
      'architect': ['#7F8C8D', '#95A5A6'],
      'professional': ['#95A5A6', '#7F8C8D']
    };
    return colorMap[careerId] || ['#95A5A6', '#7F8C8D'];
  }

  /**
   * Format career title for display
   */
  private formatCareerTitle(careerId: string): string {
    return careerId.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}

// Singleton instance
export const careerBadgeService = new CareerBadgeService();