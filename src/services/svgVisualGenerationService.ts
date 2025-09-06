/**
 * SVG Visual Generation Service
 * 
 * Generates career-specific SVG visuals using GPT for counting exercises.
 * A cost-effective alternative to DALL-E that provides clean, simple graphics
 * tailored to each student's chosen career path.
 * 
 * Cost comparison:
 * - DALL-E image: $0.040 per image
 * - GPT SVG generation: ~$0.001 per request (40x cheaper!)
 */

import { azureOpenAIService } from './azureOpenAIService';

interface CareerVisualConfig {
  items: Record<string, {
    name: string;
    description: string;
    defaultColor: string;
  }>;
  theme: {
    primaryColor: string;
    secondaryColor: string;
  };
}

class SVGVisualGenerationService {
  private static instance: SVGVisualGenerationService;
  private svgCache = new Map<string, string>();
  
  // Career-specific visual configurations
  private careerConfigs: Record<string, CareerVisualConfig> = {
    'Athlete': {
      items: {
        'basketball': { name: 'basketball', description: 'orange ball with black lines', defaultColor: '#FF6B35' },
        'soccer_ball': { name: 'soccer ball', description: 'white and black hexagon pattern', defaultColor: '#FFFFFF' },
        'tennis_ball': { name: 'tennis ball', description: 'yellow-green fuzzy ball', defaultColor: '#CCFF00' },
        'water_bottle': { name: 'sports water bottle', description: 'blue athletic water bottle', defaultColor: '#3B82F6' },
        'trophy': { name: 'trophy', description: 'golden trophy cup', defaultColor: '#FFD700' },
        'medal': { name: 'medal', description: 'gold medal with ribbon', defaultColor: '#FFD700' },
        'running_shoe': { name: 'running shoe', description: 'athletic sneaker', defaultColor: '#DC2626' },
        'cone': { name: 'training cone', description: 'orange traffic cone', defaultColor: '#FF6B35' }
      },
      theme: { primaryColor: '#FF6B35', secondaryColor: '#3B82F6' }
    },
    'Chef': {
      items: {
        'cupcake': { name: 'cupcake', description: 'cupcake with pink frosting', defaultColor: '#EC4899' },
        'apple': { name: 'apple', description: 'red apple with green leaf', defaultColor: '#EF4444' },
        'carrot': { name: 'carrot', description: 'orange carrot with green top', defaultColor: '#FB923C' },
        'spoon': { name: 'spoon', description: 'silver kitchen spoon', defaultColor: '#9CA3AF' },
        'plate': { name: 'plate', description: 'white dinner plate', defaultColor: '#F3F4F6' },
        'chef_hat': { name: 'chef hat', description: 'white tall chef hat', defaultColor: '#FFFFFF' },
        'pot': { name: 'cooking pot', description: 'silver cooking pot', defaultColor: '#9CA3AF' },
        'whisk': { name: 'whisk', description: 'metal kitchen whisk', defaultColor: '#9CA3AF' }
      },
      theme: { primaryColor: '#EC4899', secondaryColor: '#FB923C' }
    },
    'Doctor': {
      items: {
        'stethoscope': { name: 'stethoscope', description: 'medical stethoscope', defaultColor: '#6B7280' },
        'bandage': { name: 'bandage', description: 'adhesive bandage', defaultColor: '#FEF3C7' },
        'thermometer': { name: 'thermometer', description: 'medical thermometer', defaultColor: '#3B82F6' },
        'medicine': { name: 'medicine bottle', description: 'medicine bottle with pills', defaultColor: '#10B981' },
        'syringe': { name: 'syringe', description: 'medical syringe', defaultColor: '#6B7280' },
        'heart': { name: 'heart', description: 'red heart symbol', defaultColor: '#EF4444' },
        'clipboard': { name: 'medical clipboard', description: 'clipboard with checklist', defaultColor: '#8B5CF6' },
        'mask': { name: 'medical mask', description: 'blue surgical mask', defaultColor: '#3B82F6' }
      },
      theme: { primaryColor: '#3B82F6', secondaryColor: '#10B981' }
    },
    'Teacher': {
      items: {
        'book': { name: 'book', description: 'colorful textbook', defaultColor: '#8B5CF6' },
        'pencil': { name: 'pencil', description: 'yellow pencil', defaultColor: '#FCD34D' },
        'apple': { name: 'apple', description: 'red apple for teacher', defaultColor: '#EF4444' },
        'ruler': { name: 'ruler', description: 'wooden ruler', defaultColor: '#92400E' },
        'globe': { name: 'globe', description: 'world globe', defaultColor: '#3B82F6' },
        'eraser': { name: 'eraser', description: 'pink eraser', defaultColor: '#EC4899' },
        'chalk': { name: 'chalk', description: 'white chalk', defaultColor: '#FFFFFF' },
        'backpack': { name: 'backpack', description: 'school backpack', defaultColor: '#DC2626' }
      },
      theme: { primaryColor: '#8B5CF6', secondaryColor: '#FCD34D' }
    }
  };

  private constructor() {}

  static getInstance(): SVGVisualGenerationService {
    if (!SVGVisualGenerationService.instance) {
      SVGVisualGenerationService.instance = new SVGVisualGenerationService();
    }
    return SVGVisualGenerationService.instance;
  }

  /**
   * Generate an SVG visual for a counting exercise
   */
  async generateCountingVisual(
    career: string,
    itemType: string,
    count: number,
    options?: {
      size?: number;
      spacing?: number;
      arrangement?: 'horizontal' | 'grid';
    }
  ): Promise<string> {
    const cacheKey = `${career}-${itemType}-${count}`;
    
    // Check cache first
    if (this.svgCache.has(cacheKey)) {
      console.log(`📦 Using cached SVG for ${cacheKey}`);
      return this.svgCache.get(cacheKey)!;
    }

    try {
      console.log(`🎨 Generating SVG for ${count} ${itemType}(s) for ${career}`);
      
      // Get career configuration
      const careerConfig = this.careerConfigs[career] || this.careerConfigs['Teacher'];
      const itemConfig = careerConfig.items[itemType] || careerConfig.items[Object.keys(careerConfig.items)[0]];
      
      console.log(`📋 Item config:`, {
        name: itemConfig.name,
        description: itemConfig.description,
        color: itemConfig.defaultColor
      });
      
      // Generate SVG using GPT
      const svgCode = await this.generateSVGWithGPT(
        itemConfig.name,
        itemConfig.description,
        count,
        itemConfig.defaultColor,
        options
      );
      
      console.log(`🔍 Generated SVG (first 200 chars):`, svgCode.substring(0, 200));
      
      // Validate and clean SVG
      const cleanedSVG = this.validateAndCleanSVG(svgCode);
      
      // Cache the result
      this.svgCache.set(cacheKey, cleanedSVG);
      
      console.log(`✅ SVG generated and cached successfully`);
      return cleanedSVG;
    } catch (error) {
      console.error('❌ Failed to generate SVG, using fallback:', error);
      // Return fallback SVG
      return this.generateFallbackSVG(itemType, count);
    }
  }

  /**
   * Generate SVG code using GPT
   */
  private async generateSVGWithGPT(
    itemName: string,
    itemDescription: string,
    count: number,
    defaultColor: string,
    options?: any
  ): Promise<string> {
    // Standardized sizing for consistency
    const size = 60; // Fixed size for all items
    const spacing = 30; // Fixed spacing
    const arrangement = options?.arrangement || 'horizontal';
    
    // Calculate canvas dimensions based on standardized sizes
    const totalWidth = arrangement === 'horizontal' 
      ? (size * count + spacing * (count - 1) + 40) // Add padding
      : Math.min(count, 3) * (size + spacing) + 40;
    
    const totalHeight = arrangement === 'horizontal'
      ? size + 40 // Add padding
      : Math.ceil(count / 3) * (size + spacing) + 40;

    const prompt = `Generate a simple, clean SVG image showing exactly ${count} ${itemName}(s).

CRITICAL REQUIREMENTS:
- Item description: ${itemDescription}
- Main color: ${defaultColor}
- EXACT SIZE: Each item MUST be ${size}x${size} pixels (not larger, not smaller)
- Items must fit within their allocated ${size}x${size} space
- Arrange items ${arrangement === 'horizontal' ? 'in a horizontal row' : 'in a grid (max 3 per row)'}
- Use basic geometric shapes only (circles, rectangles, paths)
- Child-friendly, simple design
- SVG viewBox MUST be exactly "0 0 ${totalWidth} ${totalHeight}"
- Start first item at position (20, 20) for proper padding
- Space items exactly ${spacing} pixels apart
- Make sure all ${count} items are clearly visible, countable, and SAME SIZE

IMPORTANT SIZING RULES:
- Tennis balls, basketballs, soccer balls: Use circles with radius 25 pixels (diameter 50px)
- Water bottles, cups: Use rectangles 30 pixels wide x 50 pixels tall
- Trophies, medals: Use appropriate size within 50x50 pixel bounds
- Books, pencils: Use rectangles 40 pixels wide x 50 pixels tall
- All items must be centered within their ${size}x${size} allocation

Return ONLY the complete SVG code starting with <svg and ending with </svg>.
No explanations, no markdown, just the SVG code.

Example positioning for ${count} items:
<svg viewBox="0 0 ${totalWidth} ${totalHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="${totalWidth}" height="${totalHeight}" fill="#fafafa"/>
  ${Array.from({ length: count }, (_, i) => {
    const x = arrangement === 'horizontal' 
      ? 20 + i * (size + spacing) + size/2  // Center X position
      : 20 + (i % 3) * (size + spacing) + size/2;
    const y = arrangement === 'horizontal'
      ? 20 + size/2  // Center Y position
      : 20 + Math.floor(i / 3) * (size + spacing) + size/2;
    return `<!-- Item ${i + 1} centered at (${x}, ${y}) -->`;
  }).join('\n  ')}
</svg>`;

    try {
      const response = await azureOpenAIService.generateWithModel(
        'gpt4o', // Use GPT-4o for creative SVG generation
        prompt,
        'You are an expert SVG designer. Generate clean, simple SVG code for educational counting exercises. Return only valid SVG code, no explanations.',
        {
          temperature: 0.3, // Lower temperature for more consistent output
          maxTokens: 2000,
          jsonMode: false // We want plain text SVG, not JSON
        }
      );
      
      return response;
    } catch (error) {
      console.error('GPT SVG generation failed:', error);
      throw error;
    }
  }

  /**
   * Validate and clean SVG code
   */
  private validateAndCleanSVG(svgCode: string): string {
    // Remove any markdown or explanation text
    let cleanedSVG = svgCode;
    
    // Extract just the SVG if it's wrapped in markdown
    const svgMatch = svgCode.match(/<svg[^>]*>[\s\S]*?<\/svg>/i);
    if (svgMatch) {
      cleanedSVG = svgMatch[0];
    }
    
    // Ensure it starts with <svg and ends with </svg>
    if (!cleanedSVG.startsWith('<svg')) {
      throw new Error('Invalid SVG: does not start with <svg tag');
    }
    
    if (!cleanedSVG.endsWith('</svg>')) {
      throw new Error('Invalid SVG: does not end with </svg> tag');
    }
    
    // Add default attributes if missing
    if (!cleanedSVG.includes('xmlns')) {
      cleanedSVG = cleanedSVG.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    
    return cleanedSVG;
  }

  /**
   * Generate a simple fallback SVG if GPT fails
   */
  private generateFallbackSVG(itemType: string, count: number): string {
    const size = 60;
    const spacing = 20;
    const totalWidth = size * count + spacing * (count - 1);
    
    let circles = '';
    for (let i = 0; i < count; i++) {
      const x = i * (size + spacing) + size / 2;
      circles += `
        <circle cx="${x}" cy="40" r="25" fill="#8B5CF6" stroke="#6B21A8" stroke-width="2"/>
        <text x="${x}" y="45" text-anchor="middle" fill="white" font-size="20" font-weight="bold">${i + 1}</text>
      `;
    }
    
    return `<svg viewBox="0 0 ${totalWidth} 80" xmlns="http://www.w3.org/2000/svg">
      ${circles}
    </svg>`;
  }

  /**
   * Get a random item type for a career
   */
  getRandomItemForCareer(career: string): string {
    const config = this.careerConfigs[career];
    if (!config) return 'book'; // Default fallback
    
    const items = Object.keys(config.items);
    return items[Math.floor(Math.random() * items.length)];
  }

  /**
   * Get appropriate items for counting based on career and number
   */
  getCountingItemsForCareer(career: string, maxCount: number = 10): string[] {
    const config = this.careerConfigs[career];
    if (!config) return ['book', 'pencil', 'apple']; // Default fallback
    
    // Return first few items that work well for counting
    const countingItems = Object.keys(config.items).slice(0, Math.min(5, maxCount));
    return countingItems;
  }

  /**
   * Clear the SVG cache
   */
  clearCache(): void {
    this.svgCache.clear();
    console.log('🗑️ SVG cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; items: string[] } {
    return {
      size: this.svgCache.size,
      items: Array.from(this.svgCache.keys())
    };
  }
}

export const svgVisualService = SVGVisualGenerationService.getInstance();