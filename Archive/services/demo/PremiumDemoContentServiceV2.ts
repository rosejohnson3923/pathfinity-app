/**
 * Premium Demo Content Service V2 - Optimized
 * 
 * Handles rate limiting and storage optimization for DALL-E content
 */

import { imageGenerationService } from './imageGenerationService';

interface DemoUser {
  id: string;
  name: string;
  grade: string;
  gradeLevel: number;
}

interface ContainerContent {
  type: 'learn' | 'experience' | 'discover' | 'practice' | 'assessment';
  content: any;
  visualContent?: { type: 'dalle-url', url: string } | { type: 'dalle-cached', url: string };
  duration?: string;
}

interface PremiumLessonContent {
  userId: string;
  subject: string;
  skillCode: string;
  skillName: string;
  career: string;
  gradeLevel: number;
  containers: {
    learn: ContainerContent;
    experience: ContainerContent;
    discover: ContainerContent;
    practice: ContainerContent[];
    assessment: ContainerContent;
  };
  generatedAt: string;
  totalImages: number;
  estimatedCost: number;
}

export class PremiumDemoContentServiceV2 {
  private static instance: PremiumDemoContentServiceV2;
  private cache: Map<string, PremiumLessonContent> = new Map();
  private readonly CACHE_KEY = 'pathfinity-demo-urls';
  private readonly IMAGE_COST = 0.040;
  private imageUrlCache: Map<string, string> = new Map();
  private rateLimitDelay = 3000; // Start with 3 seconds
  private consecutiveErrors = 0;

  private readonly demoUsers: DemoUser[] = [
    { id: 'sam-k', name: 'Sam Brown', grade: 'Kindergarten', gradeLevel: 0 },
    { id: 'alex-1', name: 'Alex Davis', grade: 'Grade 1', gradeLevel: 1 },
    { id: 'jordan-7', name: 'Jordan Smith', grade: 'Grade 7', gradeLevel: 7 },
    { id: 'taylor-10', name: 'Taylor Johnson', grade: 'Grade 10', gradeLevel: 10 }
  ];

  private readonly skillDefinitions = {
    Math: {
      Kindergarten: { code: 'A.1', name: 'Count to 10' },
      'Grade 1': { code: 'A.1', name: 'Addition within 20' },
      'Grade 7': { code: 'A.1', name: 'Algebraic expressions' },
      'Grade 10': { code: 'A.1', name: 'Quadratic functions' }
    },
    ELA: {
      Kindergarten: { code: 'A.1', name: 'Letter recognition' },
      'Grade 1': { code: 'A.1', name: 'Short vowel sounds' },
      'Grade 7': { code: 'A.1', name: 'Theme analysis' },
      'Grade 10': { code: 'A.1', name: 'Literary criticism' }
    },
    Science: {
      Kindergarten: { code: 'A.1', name: 'Living vs non-living' },
      'Grade 1': { code: 'A.1', name: 'Plant parts' },
      'Grade 7': { code: 'A.1', name: 'Cell structure' },
      'Grade 10': { code: 'A.1', name: 'Chemical reactions' }
    },
    SocialStudies: {
      Kindergarten: { code: 'A.1', name: 'Community helpers' },
      'Grade 1': { code: 'A.1', name: 'Maps and globes' },
      'Grade 7': { code: 'A.1', name: 'Ancient civilizations' },
      'Grade 10': { code: 'A.1', name: 'Economic systems' }
    }
  };

  private readonly careerContexts = {
    Kindergarten: ['Pastry Chef', 'Digital Artist', 'Music Teacher'],
    'Grade 1': ['Wildlife Veterinarian', 'Architect', 'Marine Biologist'],
    'Grade 7': ['Software Engineer', 'Surgeon', 'Game Designer'],
    'Grade 10': ['AI Researcher', 'CEO', 'SpaceX Engineer']
  };

  private constructor() {
    this.loadCache();
  }

  static getInstance(): PremiumDemoContentServiceV2 {
    if (!PremiumDemoContentServiceV2.instance) {
      PremiumDemoContentServiceV2.instance = new PremiumDemoContentServiceV2();
    }
    return PremiumDemoContentServiceV2.instance;
  }

  private loadCache(): void {
    try {
      // Load URL mappings only (much smaller than base64)
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        // Store lesson metadata, not full content
        Object.entries(data.lessons || {}).forEach(([key, value]) => {
          this.cache.set(key, value as PremiumLessonContent);
        });
        // Store image URLs
        Object.entries(data.images || {}).forEach(([key, value]) => {
          this.imageUrlCache.set(key, value as string);
        });
        console.log(`💎 Loaded ${this.cache.size} lessons, ${this.imageUrlCache.size} image URLs`);
      }
    } catch (error) {
      console.error('Failed to load cache:', error);
    }
  }

  private saveCache(): void {
    try {
      // Save only URLs and metadata, not base64 data
      const lessons: Record<string, any> = {};
      this.cache.forEach((value, key) => {
        // Store lesson without base64 images
        const lessonCopy = { ...value };
        // Keep only URL references
        lessons[key] = lessonCopy;
      });

      const images: Record<string, string> = {};
      this.imageUrlCache.forEach((value, key) => {
        images[key] = value;
      });

      const data = { lessons, images };
      const dataStr = JSON.stringify(data);
      
      // Check size before saving
      const sizeInMB = new Blob([dataStr]).size / (1024 * 1024);
      console.log(`💾 Cache size: ${sizeInMB.toFixed(2)}MB`);
      
      if (sizeInMB > 5) {
        console.warn('⚠️ Cache too large, clearing old entries...');
        this.cleanupOldCache();
      }
      
      localStorage.setItem(this.CACHE_KEY, dataStr);
    } catch (error) {
      console.error('Failed to save cache:', error);
      // If quota exceeded, clear and try again
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.log('📦 Clearing old cache data...');
        this.cleanupOldCache();
        try {
          localStorage.setItem(this.CACHE_KEY, JSON.stringify({ lessons: {}, images: {} }));
        } catch (e) {
          console.error('Still failed after cleanup:', e);
        }
      }
    }
  }

  private cleanupOldCache(): void {
    // Remove other large items from localStorage
    const keysToCheck = Object.keys(localStorage);
    keysToCheck.forEach(key => {
      if (key.includes('pathfinity') && !key.includes('demo-urls')) {
        localStorage.removeItem(key);
      }
    });
  }

  private async generateAndCacheImage(prompt: string, retries = 3): Promise<string> {
    // Check if we already have this image
    const promptKey = prompt.substring(0, 50); // Use first 50 chars as key
    if (this.imageUrlCache.has(promptKey)) {
      console.log('📦 Using cached image URL');
      return this.imageUrlCache.get(promptKey)!;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        console.log(`🎨 Generating image (attempt ${attempt}/${retries})...`);
        
        // Add delay to avoid rate limiting
        if (attempt > 1 || this.consecutiveErrors > 0) {
          const delay = this.rateLimitDelay * attempt;
          console.log(`⏳ Waiting ${delay}ms to avoid rate limit...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const imageUrl = await imageGenerationService.generateEducationalImage(
          prompt,
          'K-12',
          {
            size: '1024x1024',
            quality: 'standard',
            style: 'vivid'
          }
        );

        // Store URL only, not base64
        this.imageUrlCache.set(promptKey, imageUrl);
        this.consecutiveErrors = 0; // Reset on success
        this.rateLimitDelay = Math.max(3000, this.rateLimitDelay - 500); // Gradually reduce delay
        
        return imageUrl;
      } catch (error: any) {
        console.error(`Attempt ${attempt} failed:`, error);
        this.consecutiveErrors++;
        
        if (error?.status === 429 || error?.message?.includes('429')) {
          // Rate limited - increase delay
          this.rateLimitDelay = Math.min(30000, this.rateLimitDelay * 2);
          console.log(`🚨 Rate limited! Increasing delay to ${this.rateLimitDelay}ms`);
          
          if (attempt === retries) {
            // Use placeholder on final failure
            return this.getPlaceholderImage();
          }
        } else if (attempt === retries) {
          throw error;
        }
      }
    }

    return this.getPlaceholderImage();
  }

  private getPlaceholderImage(): string {
    // Return a data URL for a simple placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIGZpbGw9IiM4YjVjZjYiLz48dGV4dCB4PSI1MTIiIHk9IjUxMiIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+UHJlbWl1bSBDb250ZW50PC90ZXh0Pjwvc3ZnPg==';
  }

  private async generateKindergartenContent(subject: string, skill: any, career: string): Promise<PremiumLessonContent['containers']> {
    const prompts: Record<string, any> = {
      Math: {
        learn: 'Colorful classroom with friendly teacher and counting blocks, bright and cheerful, educational poster style',
        experience: 'Interactive math game scene with numbers and shapes, playful design',
        discover: 'Creative math exploration with art supplies and numbers',
        practice: [
          'Exactly 4 red apples arranged in a row on invisible surface, photorealistic, white background, high quality 3D render',
          'Exactly 7 orange carrots arranged horizontally on invisible surface, photorealistic, white background, high quality 3D render',
          'Exactly 3 decorated cupcakes with colorful frosting in a row, photorealistic, white background',
          'Exactly 5 silver spoons arranged horizontally, photorealistic, white background',
          'Exactly 8 white plates stacked, photorealistic, side view, white background'
        ],
        assessment: 'Exactly 2 silver spoons side by side on invisible surface, photorealistic, white background, high quality 3D render'
      },
      ELA: {
        learn: 'Alphabet learning scene with letters and pictures, educational design',
        experience: 'Letter recognition game with colorful graphics',
        discover: 'Creative writing corner with alphabet decorations',
        practice: [
          'Large 3D letter C in bright blue color, centered on white background, high quality render',
          'The word CARROT spelled out in colorful 3D letters on white background, educational style'
        ],
        assessment: 'Three lowercase letter c in a row, 3D rendered, blue color, white background'
      },
      Science: {
        learn: 'Science discovery area with plants and tools, educational setting',
        experience: 'Hands-on science experiment setup for kids',
        discover: 'Nature exploration scene with magnifying glass',
        practice: [
          'One healthy green potted plant with leaves, photorealistic, white background',
          'One silver metal spoon, photorealistic, white background, high quality'
        ],
        assessment: 'Three colorful butterflies in a row, photorealistic, white background'
      },
      SocialStudies: {
        learn: 'Community helpers scene with various professions illustrated',
        experience: 'Interactive community map with helpers',
        discover: 'Community exploration activity setup',
        practice: [
          'One friendly farmer character in overalls holding vegetables, cartoon style, white background',
          'One police officer in uniform, friendly cartoon style, white background'
        ],
        assessment: 'Two delivery trucks side by side, simple 3D render, white background'
      }
    };

    const subjectPrompts = prompts[subject] || prompts.Math;
    let totalImages = 0;

    try {
      const containers: PremiumLessonContent['containers'] = {
        learn: {
          type: 'learn',
          content: this.getKindergartenContent(subject, 'learn', career),
          visualContent: { 
            type: 'dalle-url', 
            url: await this.generateAndCacheImage(subjectPrompts.learn) 
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience',
          content: this.getKindergartenContent(subject, 'experience', career),
          visualContent: { 
            type: 'dalle-url', 
            url: await this.generateAndCacheImage(subjectPrompts.experience) 
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: this.getKindergartenContent(subject, 'discover', career),
          visualContent: { 
            type: 'dalle-url', 
            url: await this.generateAndCacheImage(subjectPrompts.discover) 
          },
          duration: '25 minutes'
        },
        practice: [],
        assessment: {
          type: 'assessment',
          content: this.getKindergartenContent(subject, 'assessment', career),
          visualContent: { 
            type: 'dalle-url', 
            url: await this.generateAndCacheImage(subjectPrompts.assessment) 
          }
        }
      };

      totalImages = 4;

      // Generate images for all 5 practice questions for Math (counting exercises)
      for (let i = 0; i < 5; i++) {
        const practiceContent: ContainerContent = {
          type: 'practice',
          content: this.getKindergartenPracticeQuestion(subject, i)
        };

        // For Math, generate all 5 images since they're counting exercises
        // For other subjects, use first 2 only to save costs
        const shouldGenerateImage = subject === 'Math' ? i < 5 : i < 2;
        
        if (shouldGenerateImage && subjectPrompts.practice[i]) {
          practiceContent.visualContent = {
            type: 'dalle-url',
            url: await this.generateAndCacheImage(subjectPrompts.practice[i])
          };
          totalImages++;
        } else {
          practiceContent.visualContent = {
            type: 'dalle-url',
            url: this.getPlaceholderImage()
          };
        }

        containers.practice.push(practiceContent);
      }

      return containers;
    } catch (error) {
      console.error(`Failed to generate content for ${subject}:`, error);
      throw error;
    }
  }

  private getKindergartenContent(subject: string, type: string, career: string): any {
    // Simplified content generation
    return {
      title: `${career} ${type} Activity`,
      content: `Premium ${subject} content for ${type}`,
      instructions: 'Follow along with the visual guide'
    };
  }

  private getKindergartenPracticeQuestion(subject: string, index: number): any {
    const questions: Record<string, any[]> = {
      Math: [
        { 
          question: 'How many apples do you see?', 
          answer: 4,
          options: ['2', '3', '4', '5'],
          hint: 'Count each apple carefully'
        },
        { 
          question: 'How many carrots are there?', 
          answer: 7,
          options: ['5', '6', '7', '8'],
          hint: 'Count all the carrots'
        },
        { 
          question: 'Count the decorated cupcakes', 
          answer: 3,
          options: ['1', '2', '3', '4'],
          hint: 'Count the cupcakes one by one'
        },
        { 
          question: 'How many silver spoons?', 
          answer: 5,
          options: ['3', '4', '5', '6'],
          hint: 'Count all the spoons'
        },
        { 
          question: 'Count all the plates', 
          answer: 8,
          options: ['6', '7', '8', '9'],
          hint: 'Look at every plate'
        }
      ],
      ELA: [
        { 
          question: 'Find the letter C', 
          answer: 'C',
          options: ['A', 'B', 'C', 'D'],
          hint: 'Look for the round letter'
        },
        { 
          question: 'Which food starts with C?', 
          answer: 'Carrot',
          options: ['Apple', 'Banana', 'Carrot', 'Donut'],
          hint: 'Think about the first sound'
        },
        { 
          question: 'Find lowercase c', 
          answer: 'c',
          options: ['a', 'b', 'c', 'd'],
          hint: 'Look for the small round letter'
        },
        { 
          question: 'Does Cheese start with C?', 
          answer: 'Yes',
          options: ['Yes', 'No'],
          hint: 'What sound does Cheese start with?'
        },
        { 
          question: 'Match C with the right food', 
          answer: 'Cookie',
          options: ['Apple', 'Banana', 'Cookie', 'Donut'],
          hint: 'Cookie starts with C'
        }
      ],
      Science: [
        { 
          question: 'Is the herb plant living?', 
          answer: 'Yes',
          options: ['Yes', 'No'],
          hint: 'Plants grow and need water'
        },
        { 
          question: 'Is the spoon living?', 
          answer: 'No',
          options: ['Yes', 'No'],
          hint: 'Does a spoon grow?'
        },
        { 
          question: 'Can the fish grow?', 
          answer: 'Yes',
          options: ['Yes', 'No'],
          hint: 'Fish are living things'
        },
        { 
          question: 'Does the pan need food?', 
          answer: 'No',
          options: ['Yes', 'No'],
          hint: 'Pans are not alive'
        },
        { 
          question: 'Which one is living?', 
          answer: 'Sunflower',
          options: ['Rock', 'Spoon', 'Sunflower', 'Pan'],
          hint: 'Which one grows?'
        }
      ],
      SocialStudies: [
        { 
          question: 'Who grows our food?', 
          answer: 'Farmer',
          options: ['Doctor', 'Farmer', 'Teacher', 'Driver'],
          hint: 'They work on farms'
        },
        { 
          question: 'Who keeps us safe?', 
          answer: 'Police Officer',
          options: ['Baker', 'Artist', 'Police Officer', 'Chef'],
          hint: 'They wear a badge'
        },
        { 
          question: 'Who delivers packages?', 
          answer: 'Delivery Driver',
          options: ['Teacher', 'Doctor', 'Delivery Driver', 'Nurse'],
          hint: 'They drive a truck'
        },
        { 
          question: 'Who helps when sick?', 
          answer: 'Doctor',
          options: ['Farmer', 'Driver', 'Doctor', 'Baker'],
          hint: 'They work at hospitals'
        },
        { 
          question: 'Who teaches us?', 
          answer: 'Teacher',
          options: ['Chef', 'Artist', 'Driver', 'Teacher'],
          hint: 'They work at schools'
        }
      ]
    };

    return questions[subject]?.[index] || questions.Math[0];
  }

  async getFullLesson(userId: string, subject: string): Promise<PremiumLessonContent | null> {
    const user = this.demoUsers.find(u => u.id === userId);
    if (!user) return null;

    const skill = this.skillDefinitions[subject as keyof typeof this.skillDefinitions]?.[user.grade];
    if (!skill) return null;

    const cacheKey = `${userId}-${subject}-${skill.code}`;
    
    if (this.cache.has(cacheKey)) {
      console.log(`💎 Using cached lesson for ${userId} - ${subject}`);
      return this.cache.get(cacheKey)!;
    }

    console.log(`🚀 Generating new lesson for ${userId} - ${subject}`);
    
    const careers = this.careerContexts[user.grade as keyof typeof this.careerContexts];
    const career = careers[Math.floor(Math.random() * careers.length)];

    const containers = await this.generateKindergartenContent(subject, skill, career);
    const totalImages = 6; // Reduced from 8-10

    const fullLesson: PremiumLessonContent = {
      userId,
      subject,
      skillCode: skill.code,
      skillName: skill.name,
      career,
      gradeLevel: user.gradeLevel,
      containers,
      generatedAt: new Date().toISOString(),
      totalImages,
      estimatedCost: totalImages * this.IMAGE_COST
    };

    this.cache.set(cacheKey, fullLesson);
    this.saveCache();

    return fullLesson;
  }

  getCacheStats(): any {
    return {
      totalLessons: this.cache.size,
      totalImages: this.imageUrlCache.size,
      totalCost: this.cache.size * 6 * this.IMAGE_COST,
      costPerDemo: this.cache.size * 6 * this.IMAGE_COST / 4,
      breakevenCustomers: 1
    };
  }

  clearCache(): void {
    this.cache.clear();
    this.imageUrlCache.clear();
    localStorage.removeItem(this.CACHE_KEY);
    // Clean up old cache items
    this.cleanupOldCache();
    console.log('🗑️ Cache cleared');
  }
}

export const premiumDemoContentV2 = PremiumDemoContentServiceV2.getInstance();