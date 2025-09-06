/**
 * Image Generation Service
 * Handles AI-powered image generation for educational visuals
 * Integrates with Azure OpenAI DALL-E 3
 */

import { OpenAI } from 'openai';
import { azureKeyVaultConfig } from './azureKeyVaultConfig';

interface ImageGenerationOptions {
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'vivid' | 'natural';
  quality?: 'standard' | 'hd';
  n?: number;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
}

class ImageGenerationService {
  private imageCache: Map<string, GeneratedImage> = new Map();
  private readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
  private openaiClient: OpenAI | null = null;
  private initialized = false;

  /**
   * Initialize the OpenAI client for DALL-E
   */
  private async initialize() {
    if (this.initialized) return;
    
    try {
      // Use the dedicated DALL-E configuration
      const config = await azureKeyVaultConfig.getDalleConfig();
      
      console.log('🔍 DALL-E Config retrieved:', {
        hasApiKey: !!config.apiKey,
        endpoint: config.endpoint,
        deployment: config.deployment
      });
      
      if (!config.apiKey) {
        console.warn('⚠️ No DALL-E API key configured in Key Vault');
        // Try to fall back to OpenAI key
        const openAIConfig = await azureKeyVaultConfig.getOpenAIConfig();
        console.log('🔍 OpenAI Config retrieved:', {
          hasApiKey: !!openAIConfig.apiKey,
          endpoint: openAIConfig.endpoint
        });
        
        if (openAIConfig.apiKey) {
          config.apiKey = openAIConfig.apiKey;
          console.log('📌 Using OpenAI API key for DALL-E');
        } else {
          throw new Error('No API key available for DALL-E');
        }
      }
      
      // Create OpenAI client for DALL-E
      // Remove trailing slash from endpoint if present
      const endpoint = config.endpoint.replace(/\/$/, '');
      const deployment = config.deployment || 'dall-e-3';
      
      console.log(`🎨 Initializing DALL-E with deployment: ${deployment}`);
      console.log(`📍 Endpoint: ${endpoint}`);
      console.log(`🔑 API Key present: ${!!config.apiKey}`);
      console.log(`🔑 API Key length: ${config.apiKey?.length || 0}`);
      console.log(`🔑 API Key starts with: ${config.apiKey?.substring(0, 8)}...`);
      
      this.openaiClient = new OpenAI({
        apiKey: config.apiKey,
        baseURL: `${endpoint}/openai/deployments/${deployment}`,
        defaultQuery: { 'api-version': '2024-02-01' },
        defaultHeaders: { 'api-key': config.apiKey },
        dangerouslyAllowBrowser: true
      });
      
      this.initialized = true;
      console.log('✅ DALL-E service initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize DALL-E:', error);
      // Fall back to using environment variables
      const apiKey = import.meta.env.VITE_AZURE_OPENAI_API_KEY || import.meta.env.VITE_AZURE_DALLE_API_KEY;
      if (apiKey) {
        console.log('📌 Falling back to environment variables for DALL-E');
        this.openaiClient = new OpenAI({
          apiKey: apiKey,
          baseURL: `https://pathfinity-ai.openai.azure.com/openai/deployments/dall-e-3`,
          defaultQuery: { 'api-version': '2024-02-01' },
          defaultHeaders: { 'api-key': apiKey },
          dangerouslyAllowBrowser: true
        });
        this.initialized = true;
      }
    }
  }

  /**
   * Generate an educational image using AI
   */
  async generateEducationalImage(
    description: string,
    gradeLevel: string,
    options: Partial<ImageGenerationOptions> = {}
  ): Promise<string> {
    // Create a cache key
    const cacheKey = `${description}_${gradeLevel}_${JSON.stringify(options)}`;
    
    // Check cache first
    const cached = this.imageCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('🖼️ Using cached image for:', description);
      return cached.url;
    }

    // Create kid-friendly prompt
    const prompt = this.createKidFriendlyPrompt(description, gradeLevel);
    
    try {
      console.log('🎨 Attempting DALL-E generation for:', prompt);
      
      // Try to use DALL-E first
      await this.initialize();
      
      console.log('🔍 OpenAI client status:', {
        initialized: this.initialized,
        hasClient: !!this.openaiClient
      });
      
      if (this.openaiClient) {
        try {
          console.log('📤 Sending DALL-E request...');
          const response = await this.openaiClient.images.generate({
            model: "dall-e-3",
            prompt: prompt,
            n: 1,
            size: options.size || "1024x1024",
            quality: options.quality || "standard",
            style: options.style || "vivid",
            // Note: Azure DALL-E doesn't support seed parameter for consistency
            // Each generation will be unique
          } as any);
          
          if (response.data && response.data[0]?.url) {
            const imageUrl = response.data[0].url;
            
            // Cache the result
            this.imageCache.set(cacheKey, {
              url: imageUrl,
              prompt: prompt,
              timestamp: Date.now()
            });
            
            console.log('✅ DALL-E image generated successfully');
            return imageUrl;
          }
        } catch (dalleError) {
          console.warn('⚠️ DALL-E generation failed, using fallback:', dalleError);
        }
      }
      
      // Fall back to placeholder SVG images
      console.log('📐 Using SVG placeholder for:', description);
      const imageUrl = await this.generatePlaceholderImage(description, gradeLevel);
      
      // Cache the result
      this.imageCache.set(cacheKey, {
        url: imageUrl,
        prompt: prompt,
        timestamp: Date.now()
      });
      
      return imageUrl;
    } catch (error) {
      console.error('Failed to generate image:', error);
      return this.getFallbackImage(description);
    }
  }

  /**
   * Create a kid-friendly prompt for image generation
   */
  private createKidFriendlyPrompt(description: string, gradeLevel: string): string {
    const isYoung = ['K', '1', '2', '3'].includes(gradeLevel);
    
    let basePrompt = description
      .replace(/Picture of/gi, '')
      .replace(/Image of/gi, '')
      .replace(/Visual:/gi, '')
      .trim();
    
    // Add style modifiers based on grade level
    if (isYoung) {
      return `Colorful, cartoon-style, child-friendly illustration of ${basePrompt}. Simple, clear, educational, bright colors, no scary elements.`;
    } else {
      return `Clean, modern, educational illustration of ${basePrompt}. Professional, clear, engaging for students.`;
    }
  }

  /**
   * Generate placeholder images using SVG
   * Enhanced fallback for when DALL-E is unavailable
   */
  private async generatePlaceholderImage(description: string, gradeLevel: string): Promise<string> {
    // Parse the description to understand what to draw
    const lowerDesc = description.toLowerCase();
    
    // Check if this is a companion character request
    if (lowerDesc.includes('wise purple owl') || lowerDesc.includes('finn')) {
      return this.generateCompanionSVG('finn', lowerDesc.includes('dark gray') || lowerDesc.includes('#1f2937'));
    }
    if (lowerDesc.includes('magical wizard') || lowerDesc.includes('sage')) {
      return this.generateCompanionSVG('sage', lowerDesc.includes('dark gray') || lowerDesc.includes('#1f2937'));
    }
    if (lowerDesc.includes('energetic lightning bolt') || lowerDesc.includes('spark')) {
      return this.generateCompanionSVG('spark', lowerDesc.includes('dark gray') || lowerDesc.includes('#1f2937'));
    }
    if (lowerDesc.includes('gentle flower fairy') || lowerDesc.includes('harmony')) {
      return this.generateCompanionSVG('harmony', lowerDesc.includes('dark gray') || lowerDesc.includes('#1f2937'));
    }
    
    // Handle letter/alphabet visuals
    if (lowerDesc.includes('letter') || lowerDesc.includes('alphabet') || /\b[a-z]\b/i.test(description)) {
      return this.generateLetterVisual(description);
    }
    
    // Handle number-based visuals
    if (lowerDesc.includes('drum') || lowerDesc.includes('number')) {
      return this.generateNumberVisual(description);
    }
    
    // Handle counting visuals
    if (lowerDesc.includes('apple') || lowerDesc.includes('cookie') || lowerDesc.includes('ball')) {
      return this.generateCountingVisual(description);
    }
    
    // Handle shape visuals
    if (lowerDesc.includes('circle') || lowerDesc.includes('square') || lowerDesc.includes('triangle')) {
      return this.generateShapeVisual(description);
    }
    
    // Default educational visual
    return this.generateDefaultEducationalVisual(description);
  }

  /**
   * Generate SVG for letter/alphabet visuals
   */
  private generateLetterVisual(description: string): string {
    // Extract which letter to highlight/circle
    const letterMatch = description.match(/circle\s+([A-Z])|'([A-Z])'|letter\s+([A-Z])/i);
    const targetLetter = letterMatch ? (letterMatch[1] || letterMatch[2] || letterMatch[3]) : 'C';
    
    // Create alphabet sequence
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const displayLetters = alphabet.slice(0, 7); // Show first 7 letters for clarity
    
    const svg = `
      <svg width="600" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="600" height="300" fill="#fef3c7"/>
        
        <!-- Title -->
        <text x="300" y="50" font-family="Arial, sans-serif" font-size="20" text-anchor="middle" fill="#92400e">
          The Alphabet
        </text>
        
        <!-- Letter sequence -->
        ${displayLetters.split('').map((letter, index) => {
          const x = 60 + index * 75;
          const y = 150;
          const isTarget = letter === targetLetter.toUpperCase();
          
          return `
            ${isTarget ? `
              <!-- Circle for target letter -->
              <circle cx="${x}" cy="${y}" r="35" fill="none" stroke="#dc2626" stroke-width="3" stroke-dasharray="5,5">
                <animate attributeName="stroke-dashoffset" from="0" to="10" dur="1s" repeatCount="indefinite"/>
              </circle>
            ` : ''}
            
            <!-- Letter -->
            <text x="${x}" y="${y + 10}" 
                  font-family="Arial, sans-serif" 
                  font-size="${isTarget ? '48' : '40'}" 
                  font-weight="${isTarget ? 'bold' : 'normal'}"
                  text-anchor="middle" 
                  fill="${isTarget ? '#dc2626' : '#1e40af'}">
              ${letter}
            </text>
            
            <!-- Position number -->
            <text x="${x}" y="${y + 50}" 
                  font-family="Arial, sans-serif" 
                  font-size="14" 
                  text-anchor="middle" 
                  fill="#64748b">
              ${index + 1}
            </text>
          `;
        }).join('')}
        
        <!-- Instruction -->
        <text x="300" y="250" font-family="Arial, sans-serif" font-size="18" text-anchor="middle" fill="#475569">
          ${targetLetter} is letter number ${alphabet.indexOf(targetLetter) + 1}
        </text>
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate SVG for number visuals
   */
  private generateNumberVisual(description: string): string {
    // Extract number from description
    const numberMatch = description.match(/\d+/);
    const number = numberMatch ? numberMatch[0] : '1';
    
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="400" height="300" fill="#f0f9ff"/>
        
        <!-- Drum -->
        <g transform="translate(120, 100)">
          <!-- Drum body -->
          <ellipse cx="80" cy="100" rx="70" ry="15" fill="#8b4513"/>
          <rect x="10" y="50" width="140" height="50" fill="#cd853f"/>
          <ellipse cx="80" cy="50" rx="70" ry="15" fill="#daa520"/>
          
          <!-- Drum decorations -->
          <line x1="10" y1="75" x2="150" y2="75" stroke="#8b4513" stroke-width="2"/>
          <circle cx="40" cy="75" r="3" fill="#8b4513"/>
          <circle cx="80" cy="75" r="3" fill="#8b4513"/>
          <circle cx="120" cy="75" r="3" fill="#8b4513"/>
        </g>
        
        <!-- Number -->
        <text x="280" y="170" font-family="Arial, sans-serif" font-size="120" font-weight="bold" fill="#2563eb">${number}</text>
        
        <!-- Label -->
        <text x="200" y="250" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#64748b">Count: ${number} drum</text>
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate SVG for counting visuals
   */
  private generateCountingVisual(description: string): string {
    // Extract count and item type
    const countMatch = description.match(/(\d+)/);
    const count = countMatch ? parseInt(countMatch[0]) : 3;
    
    let itemEmoji = '🍎';
    if (description.toLowerCase().includes('cookie')) itemEmoji = '🍪';
    if (description.toLowerCase().includes('ball')) itemEmoji = '⚽';
    if (description.toLowerCase().includes('book')) itemEmoji = '📚';
    
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="400" height="300" fill="#fef3c7"/>
        
        <!-- Items -->
        ${Array.from({ length: Math.min(count, 10) }, (_, i) => {
          const x = 50 + (i % 5) * 70;
          const y = 100 + Math.floor(i / 5) * 80;
          return `<text x="${x}" y="${y}" font-size="48">${itemEmoji}</text>`;
        }).join('')}
        
        <!-- Count label -->
        <text x="200" y="250" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#92400e">
          Total: ${count}
        </text>
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate SVG for shape visuals
   */
  private generateShapeVisual(description: string): string {
    const lowerDesc = description.toLowerCase();
    let shape = 'circle';
    if (lowerDesc.includes('square')) shape = 'square';
    if (lowerDesc.includes('triangle')) shape = 'triangle';
    
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="400" height="300" fill="#e0f2fe"/>
        
        <!-- Shape -->
        ${shape === 'circle' ? 
          '<circle cx="200" cy="150" r="80" fill="#3b82f6"/>' :
          shape === 'square' ?
          '<rect x="120" y="70" width="160" height="160" fill="#10b981"/>' :
          '<polygon points="200,70 280,210 120,210" fill="#f59e0b"/>'
        }
        
        <!-- Label -->
        <text x="200" y="270" font-family="Arial, sans-serif" font-size="24" text-anchor="middle" fill="#475569">
          ${shape.charAt(0).toUpperCase() + shape.slice(1)}
        </text>
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate default educational visual
   */
  private generateDefaultEducationalVisual(description: string): string {
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <!-- Background gradient -->
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ddd6fe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#fbbf24;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="400" height="300" fill="url(#bg)"/>
        
        <!-- Book icon -->
        <text x="200" y="130" font-size="64" text-anchor="middle">📚</text>
        
        <!-- Description text -->
        <text x="200" y="180" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#1f2937">
          ${description.substring(0, 40)}
        </text>
        ${description.length > 40 ? 
          `<text x="200" y="200" font-family="Arial, sans-serif" font-size="16" text-anchor="middle" fill="#1f2937">
            ${description.substring(40, 80)}
          </text>` : ''
        }
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Generate companion character SVGs with theme support
   */
  private generateCompanionSVG(companion: string, isDark: boolean = false): string {
    const bgColor = isDark ? '#1f2937' : '#ffffff';
    const glowOpacity = isDark ? '0.8' : '0.3';
    
    const companions: Record<string, { color: string; emoji: string; name: string }> = {
      finn: { color: '#8B5CF6', emoji: '🦉', name: 'Finn' },
      sage: { color: '#10B981', emoji: '🧙', name: 'Sage' },
      spark: { color: '#F59E0B', emoji: '⚡', name: 'Spark' },
      harmony: { color: '#EC4899', emoji: '🌸', name: 'Harmony' }
    };
    
    const char = companions[companion];
    if (!char) return this.getFallbackImage(companion);
    
    const svg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="512" height="512" fill="${bgColor}"/>
        
        <!-- Glow effect for dark theme -->
        ${isDark ? `
          <defs>
            <radialGradient id="glow-${companion}">
              <stop offset="0%" stop-color="${char.color}" stop-opacity="${glowOpacity}"/>
              <stop offset="100%" stop-color="${char.color}" stop-opacity="0"/>
            </radialGradient>
          </defs>
          <circle cx="256" cy="256" r="200" fill="url(#glow-${companion})"/>
        ` : ''}
        
        <!-- Character circle -->
        <circle cx="256" cy="256" r="150" fill="${char.color}20" stroke="${char.color}" stroke-width="4"/>
        
        <!-- Inner glow -->
        <circle cx="256" cy="256" r="130" fill="${char.color}20" opacity="0.5"/>
        
        <!-- Character emoji -->
        <text x="256" y="280" font-family="Arial, sans-serif" font-size="120" text-anchor="middle" fill="${char.color}">
          ${char.emoji}
        </text>
        
        <!-- Character name -->
        <text x="256" y="380" font-family="Arial, sans-serif" font-size="36" font-weight="bold" text-anchor="middle" fill="${char.color}">
          ${char.name}
        </text>
        
        <!-- Decorative elements based on character -->
        ${companion === 'finn' ? `
          <!-- Owl glasses -->
          <circle cx="220" cy="240" r="25" fill="none" stroke="${char.color}" stroke-width="3" opacity="0.5"/>
          <circle cx="292" cy="240" r="25" fill="none" stroke="${char.color}" stroke-width="3" opacity="0.5"/>
          <line x1="245" y1="240" x2="267" y2="240" stroke="${char.color}" stroke-width="3" opacity="0.5"/>
        ` : ''}
        
        ${companion === 'sage' ? `
          <!-- Wizard hat -->
          <polygon points="256,100 226,160 286,160" fill="${char.color}"/>
          <rect x="226" y="160" width="60" height="10" fill="${char.color}"/>
          <!-- Stars on hat -->
          <text x="256" y="135" font-family="Arial" font-size="20" text-anchor="middle" fill="${isDark ? '#fbbf24' : '#f59e0b'}">⭐</text>
        ` : ''}
        
        ${companion === 'spark' ? `
          <!-- Lightning bolts -->
          <path d="M 120 120 L 140 160 L 110 160 L 130 200" stroke="${char.color}" stroke-width="3" fill="none" opacity="${isDark ? '0.8' : '0.5'}"/>
          <path d="M 392 120 L 372 160 L 402 160 L 382 200" stroke="${char.color}" stroke-width="3" fill="none" opacity="${isDark ? '0.8' : '0.5'}"/>
          <path d="M 120 312 L 140 352 L 110 352 L 130 392" stroke="${char.color}" stroke-width="3" fill="none" opacity="${isDark ? '0.8' : '0.5'}"/>
          <path d="M 392 312 L 372 352 L 402 352 L 382 392" stroke="${char.color}" stroke-width="3" fill="none" opacity="${isDark ? '0.8' : '0.5'}"/>
        ` : ''}
        
        ${companion === 'harmony' ? `
          <!-- Flower petals -->
          <circle cx="176" cy="176" r="16" fill="${char.color}" opacity="${isDark ? '0.5' : '0.3'}"/>
          <circle cx="336" cy="176" r="16" fill="${char.color}" opacity="${isDark ? '0.5' : '0.3'}"/>
          <circle cx="176" cy="336" r="16" fill="${char.color}" opacity="${isDark ? '0.5' : '0.3'}"/>
          <circle cx="336" cy="336" r="16" fill="${char.color}" opacity="${isDark ? '0.5' : '0.3'}"/>
        ` : ''}
      </svg>`;
    
    // Properly encode the SVG
    const encodedSvg = encodeURIComponent(svg);
    return `data:image/svg+xml,${encodedSvg}`;
  }

  /**
   * Get fallback image for errors
   */
  private getFallbackImage(description: string): string {
    // Return a simple placeholder
    const svg = `
      <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="300" fill="#f3f4f6"/>
        <text x="200" y="150" font-family="Arial" font-size="20" text-anchor="middle" fill="#6b7280">
          Visual Learning Aid
        </text>
      </svg>`;
    
    // Properly encode the SVG
    return `data:image/svg+xml,${encodeURIComponent(svg)}`;
  }

  /**
   * Clear the image cache
   */
  clearCache(): void {
    this.imageCache.clear();
  }
}

export const imageGenerationService = new ImageGenerationService();