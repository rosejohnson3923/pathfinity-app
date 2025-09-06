/**
 * Companion Image Generator
 * Generates character avatars for AI companions using DALL-E
 */

import { imageGenerationService } from './imageGenerationService';
import fs from 'fs';
import path from 'path';

interface CompanionCharacter {
  id: string;
  name: string;
  color: string;
  description: string;
  personality: string;
}

const companions: CompanionCharacter[] = [
  {
    id: 'finn',
    name: 'Finn',
    color: '#8B5CF6',
    description: 'A friendly purple robot superhero with a cape and mask',
    personality: 'Energetic, enthusiastic, supportive cheerleader'
  },
  {
    id: 'sage',
    name: 'Sage',
    color: '#10B981',
    description: 'A wise green owl wearing glasses and a graduation cap',
    personality: 'Knowledgeable, patient, thoughtful mentor'
  },
  {
    id: 'spark',
    name: 'Spark',
    color: '#F59E0B',
    description: 'An energetic yellow-orange lightning bolt character with a smiling face',
    personality: 'Creative, innovative, exciting explorer'
  },
  {
    id: 'harmony',
    name: 'Harmony',
    color: '#EC4899',
    description: 'A gentle pink flower fairy with petals and butterfly wings',
    personality: 'Calm, empathetic, peaceful mediator'
  }
];

class CompanionImageGenerator {
  /**
   * Generate all companion images
   */
  async generateAllCompanions(): Promise<void> {
    console.log('🎨 Starting companion image generation...');
    
    for (const companion of companions) {
      try {
        await this.generateCompanionImage(companion);
        console.log(`✅ Generated image for ${companion.name}`);
      } catch (error) {
        console.error(`❌ Failed to generate ${companion.name}:`, error);
      }
    }
    
    console.log('🎉 Companion image generation complete!');
  }

  /**
   * Generate a single companion image
   */
  private async generateCompanionImage(companion: CompanionCharacter): Promise<void> {
    // Create the DALL-E prompt
    const prompt = this.createCompanionPrompt(companion);
    
    console.log(`🖼️ Generating ${companion.name} with prompt:`, prompt);
    
    // Generate the image
    const imageUrl = await imageGenerationService.generateEducationalImage(
      prompt,
      'K', // Use K grade for most friendly, cartoon style
      {
        size: '1024x1024',
        style: 'vivid',
        quality: 'hd'
      }
    );
    
    // Save the image URL to a JSON file for now
    // In production, this would download and save as PNG
    await this.saveImageReference(companion.id, imageUrl);
  }

  /**
   * Create an optimized DALL-E prompt for companion characters
   */
  private createCompanionPrompt(companion: CompanionCharacter): string {
    const baseStyle = `
      Create a friendly, cartoon-style character avatar for children's education app.
      Square format, centered character, white or transparent background.
      Simple, clean design with bold colors and clear features.
      Appropriate for K-12 students, non-scary, approachable.
    `.trim();

    const characterPrompts = {
      finn: `
        ${baseStyle}
        Character: ${companion.description}
        Color scheme: Vibrant purple (#8B5CF6) as primary color
        Style: Superhero robot, friendly face with LED eyes, metallic purple body,
        flowing purple cape, small mask around eyes, heroic pose.
        Expression: Big smile, enthusiastic, ready to help.
        No text or letters in the image.
      `,
      sage: `
        ${baseStyle}
        Character: ${companion.description}
        Color scheme: Forest green (#10B981) as primary color
        Style: Wise owl professor, round glasses, graduation cap with tassel,
        feathered wings holding a book, standing on a branch.
        Expression: Warm, intelligent eyes, gentle smile, welcoming.
        No text or letters in the image.
      `,
      spark: `
        ${baseStyle}
        Character: ${companion.description}
        Color scheme: Bright orange-yellow (#F59E0B) as primary color
        Style: Living lightning bolt with arms and legs, electric energy aura,
        sparkling effects around the character, dynamic pose.
        Expression: Excited face, wide eyes, big grin, radiating energy.
        No text or letters in the image.
      `,
      harmony: `
        ${baseStyle}
        Character: ${companion.description}
        Color scheme: Soft pink (#EC4899) as primary color
        Style: Flower fairy with petal dress, delicate butterfly wings,
        flower crown, holding a small wand with a heart or star.
        Expression: Peaceful, kind eyes, gentle smile, calming presence.
        No text or letters in the image.
      `
    };

    return characterPrompts[companion.id as keyof typeof characterPrompts] || baseStyle;
  }

  /**
   * Save image reference (URL) to a JSON file
   * In production, this would download and save the actual image
   */
  private async saveImageReference(companionId: string, imageUrl: string): Promise<void> {
    const references = await this.loadImageReferences();
    references[companionId] = {
      url: imageUrl,
      generated: new Date().toISOString()
    };
    
    // Save to localStorage for browser environment
    if (typeof window !== 'undefined') {
      localStorage.setItem('companion-images', JSON.stringify(references));
    }
    
    console.log(`💾 Saved image reference for ${companionId}`);
  }

  /**
   * Load existing image references
   */
  private async loadImageReferences(): Promise<Record<string, any>> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('companion-images');
      return stored ? JSON.parse(stored) : {};
    }
    return {};
  }

  /**
   * Get image URL for a specific companion
   */
  async getCompanionImage(companionId: string): Promise<string | null> {
    const references = await this.loadImageReferences();
    return references[companionId]?.url || null;
  }

  /**
   * Check if all companions have images
   */
  async hasAllImages(): Promise<boolean> {
    const references = await this.loadImageReferences();
    return companions.every(c => references[c.id]?.url);
  }
}

export const companionImageGenerator = new CompanionImageGenerator();

// Export companion data for use in other components
export { companions };