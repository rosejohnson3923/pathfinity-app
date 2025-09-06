/**
 * Demo Content Cache Service
 * 
 * Generates and caches AI content for demo users to avoid repeated AI generation costs.
 * Uses emoji-based content for K-8 and DALL-E enhanced content for grades 9-12.
 */

import { imageGenerationService } from './imageGenerationService';

interface DemoUser {
  id: string;
  name: string;
  grade: string;
  gradeLevel: number;
  useDallE: boolean;
}

interface SkillContent {
  skillCode: string;
  subject: string;
  skillName: string;
  gradeLevel: number;
  career: string;
  content: {
    question: string;
    visualContent: string | { type: 'emoji' | 'dalle', content: string };
    answer?: string | number;
    explanation?: string;
  };
}

interface CachedContent {
  userId: string;
  skillCode: string;
  subject: string;
  content: SkillContent;
  generatedAt: string;
  imageUrl?: string;
}

export class DemoContentCacheService {
  private static instance: DemoContentCacheService;
  private cache: Map<string, CachedContent> = new Map();
  private readonly CACHE_KEY = 'pathfinity-demo-content-cache';

  // Demo users configuration
  private readonly demoUsers: DemoUser[] = [
    { id: 'sam-k', name: 'Sam Brown', grade: 'Kindergarten', gradeLevel: 0, useDallE: false },
    { id: 'alex-1', name: 'Alex Davis', grade: 'Grade 1', gradeLevel: 1, useDallE: false },
    { id: 'jordan-7', name: 'Jordan Smith', grade: 'Grade 7', gradeLevel: 7, useDallE: false },
    { id: 'taylor-10', name: 'Taylor Johnson', grade: 'Grade 10', gradeLevel: 10, useDallE: true }
  ];

  // A.1 Skills for each subject
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

  // Career contexts for each grade level
  private readonly careerContexts = {
    Kindergarten: ['Chef', 'Artist', 'Teacher'],
    'Grade 1': ['Veterinarian', 'Builder', 'Scientist'],
    'Grade 7': ['Engineer', 'Doctor', 'Game Developer'],
    'Grade 10': ['Data Scientist', 'Entrepreneur', 'Aerospace Engineer']
  };

  private constructor() {
    this.loadCache();
  }

  static getInstance(): DemoContentCacheService {
    if (!DemoContentCacheService.instance) {
      DemoContentCacheService.instance = new DemoContentCacheService();
    }
    return DemoContentCacheService.instance;
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as CachedContent);
        });
        console.log(`📦 Loaded ${this.cache.size} cached demo content items`);
      }
    } catch (error) {
      console.error('Failed to load demo content cache:', error);
    }
  }

  private saveCache(): void {
    try {
      const data: Record<string, CachedContent> = {};
      this.cache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      console.log(`💾 Saved ${this.cache.size} demo content items to cache`);
    } catch (error) {
      console.error('Failed to save demo content cache:', error);
    }
  }

  private getCacheKey(userId: string, subject: string, skillCode: string): string {
    return `${userId}-${subject}-${skillCode}`;
  }

  /**
   * Generate emoji-based content for K-8 students
   */
  private generateEmojiContent(user: DemoUser, subject: string, skill: any, career: string): SkillContent {
    const contents: Record<string, any> = {
      // Kindergarten Content
      'sam-k-Math': {
        question: `🧑‍🍳 Chef ${user.name} is making cookies! Count the chocolate chips:`,
        visualContent: { type: 'emoji', content: '🍪 🍪 🍪 🍪 🍪' },
        answer: 5,
        explanation: 'We counted 5 cookies! Great job counting with Chef!'
      },
      'sam-k-ELA': {
        question: `🧑‍🍳 Chef needs to find ingredients that start with the letter "C". Which one?`,
        visualContent: { type: 'emoji', content: '🥕 🍎 🧀 🍌' },
        answer: 'Carrot and Cheese',
        explanation: 'Carrot (🥕) and Cheese (🧀) both start with C!'
      },
      'sam-k-Science': {
        question: `🧑‍🍳 Chef wants to know: Which things in the kitchen are LIVING?`,
        visualContent: { type: 'emoji', content: '🌿 🥄 🐟 🍳' },
        answer: 'Plant and Fish',
        explanation: 'The herb plant (🌿) and fish (🐟) are living things!'
      },
      'sam-k-SocialStudies': {
        question: `🧑‍🍳 Who helps Chef in the community?`,
        visualContent: { type: 'emoji', content: '👨‍🌾 (Farmer) 🚚 (Delivery) 👮 (Police) 🏪 (Store)' },
        answer: 'Farmer and Delivery Driver',
        explanation: 'Farmers grow food and delivery drivers bring ingredients!'
      },

      // Grade 1 Content
      'alex-1-Math': {
        question: `🐕 Veterinarian ${user.name} has 7 dogs and 5 cats. How many pets total?`,
        visualContent: { type: 'emoji', content: '🐕🐕🐕🐕🐕🐕🐕 + 🐈🐈🐈🐈🐈 = ?' },
        answer: 12,
        explanation: '7 dogs + 5 cats = 12 pets at the vet clinic!'
      },
      'alex-1-ELA': {
        question: `🐕 Help Vet ${user.name} find the word with a short "a" sound:`,
        visualContent: { type: 'emoji', content: 'cat 🐈 | bone 🦴 | fish 🐟 | treat 🍖' },
        answer: 'cat',
        explanation: 'Cat has the short "a" sound like in "bat" and "hat"!'
      },
      'alex-1-Science': {
        question: `🌱 Vet ${user.name} is growing plants for pets. Label the parts:`,
        visualContent: { type: 'emoji', content: '🌸 (?) 🌿 (?) 🫘 (?) 🌱 (?)' },
        answer: 'Flower, Leaves, Seeds, Roots',
        explanation: 'Plants have flowers 🌸, leaves 🌿, seeds 🫘, and roots 🌱!'
      },
      'alex-1-SocialStudies': {
        question: `🗺️ Vet ${user.name} needs to find the ocean on the map. Which symbol?`,
        visualContent: { type: 'emoji', content: '🏔️ (Mountains) 🌊 (Ocean) 🏜️ (Desert) 🌲 (Forest)' },
        answer: 'Ocean 🌊',
        explanation: 'The wave symbol 🌊 shows oceans on maps!'
      },

      // Grade 7 Content  
      'jordan-7-Math': {
        question: `💻 Game Developer ${user.name}: Simplify this expression for game physics: 3x + 5x - 2x`,
        visualContent: { type: 'emoji', content: '🎮 Position = 3x ➡️ + 5x ➡️ - 2x ⬅️' },
        answer: '6x',
        explanation: 'Combine like terms: 3x + 5x - 2x = 6x pixels of movement!'
      },
      'jordan-7-ELA': {
        question: `💻 Analyze the theme in this game narrative: "The hero's greatest enemy was himself"`,
        visualContent: { type: 'emoji', content: '🦸 vs 👤 (Shadow Self) = 💭 Internal Conflict' },
        answer: 'Internal conflict/Self-discovery',
        explanation: 'The theme explores how we must overcome our own doubts and fears!'
      },
      'jordan-7-Science': {
        question: `💻 Game Dev ${user.name} is coding cell division. What are the main parts of a cell?`,
        visualContent: { type: 'emoji', content: '🔵 Nucleus | 🟢 Cytoplasm | 🔴 Membrane | ⚡ Mitochondria' },
        answer: 'Nucleus (control), Membrane (boundary), Cytoplasm (fluid), Mitochondria (energy)',
        explanation: 'Cells in your game need these parts to function, just like real cells!'
      },
      'jordan-7-SocialStudies': {
        question: `💻 Your game is set in Ancient Rome. What were their main achievements?`,
        visualContent: { type: 'emoji', content: '🏛️ Architecture | ⚖️ Laws | 🛣️ Roads | 🗡️ Military' },
        answer: 'Architecture, Legal system, Road networks, Military organization',
        explanation: 'Rome built lasting structures and systems we still use today!'
      }
    };

    const key = `${user.id}-${subject}`;
    const content = contents[key] || {
      question: `${career} ${user.name} is learning about ${skill.name}`,
      visualContent: { type: 'emoji', content: '📚 ✨ 🎯' },
      answer: 'Practice makes perfect!',
      explanation: 'Keep learning and growing!'
    };

    return {
      skillCode: skill.code,
      subject,
      skillName: skill.name,
      gradeLevel: user.gradeLevel,
      career,
      content
    };
  }

  /**
   * Generate DALL-E enhanced content for grades 9-12
   */
  private async generateDallEContent(user: DemoUser, subject: string, skill: any, career: string): Promise<SkillContent> {
    // Taylor (Grade 10) DALL-E prompts
    const prompts: Record<string, any> = {
      'taylor-10-Math': {
        question: `As a Data Scientist at ${career}, analyze this quadratic function for market predictions:`,
        dallePrompt: 'Professional data visualization dashboard showing a quadratic function graph y=x²-4x+3 with market trend analysis, clean modern UI, dark theme with neon accents, photorealistic computer screen',
        answer: 'Vertex at (2, -1), roots at x=1 and x=3',
        explanation: 'This parabola models market volatility with minimum at x=2!'
      },
      'taylor-10-ELA': {
        question: `As a ${career} preparing a presentation, critique this statement: "AI will replace human creativity"`,
        dallePrompt: 'Split screen showing human artist painting on left and AI generating art on right, professional presentation slide, modern corporate style, photorealistic',
        answer: 'AI augments rather than replaces human creativity',
        explanation: 'AI is a tool that enhances human creative capabilities!'
      },
      'taylor-10-Science': {
        question: `${career} ${user.name}, balance this chemical equation for battery technology: Li + O₂ → ?`,
        dallePrompt: 'Modern chemistry lab with lithium battery components, molecular diagrams floating as holograms, professional scientific workspace, photorealistic, clean and bright',
        answer: '4Li + O₂ → 2Li₂O',
        explanation: 'Lithium oxide formation is key to battery technology!'
      },
      'taylor-10-SocialStudies': {
        question: `As an ${career}, compare capitalism vs socialism for your global expansion strategy`,
        dallePrompt: 'Modern infographic comparing economic systems with world map background, professional business presentation style, clean data visualization, corporate colors',
        answer: 'Mixed economies combine both systems benefits',
        explanation: 'Most modern economies blend market freedom with social safety nets!'
      }
    };

    const key = `${user.id}-${subject}`;
    const promptData = prompts[key];

    if (!promptData) {
      // Fallback to emoji if no DALL-E prompt defined
      return this.generateEmojiContent(user, subject, skill, career);
    }

    try {
      console.log(`🎨 Generating DALL-E image for ${user.name} - ${subject}...`);
      
      // Generate image using DALL-E
      const imageUrl = await imageGenerationService.generateEducationalImage(
        promptData.dallePrompt,
        user.grade,
        {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }
      );

      // Convert to base64 for permanent storage
      const base64Image = await this.convertToBase64(imageUrl);

      return {
        skillCode: skill.code,
        subject,
        skillName: skill.name,
        gradeLevel: user.gradeLevel,
        career,
        content: {
          question: promptData.question,
          visualContent: { type: 'dalle', content: base64Image },
          answer: promptData.answer,
          explanation: promptData.explanation
        }
      };
    } catch (error) {
      console.error(`Failed to generate DALL-E content for ${user.name}:`, error);
      // Fallback to emoji on error
      return this.generateEmojiContent(user, subject, skill, career);
    }
  }

  private async convertToBase64(imageUrl: string): Promise<string> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to convert image to base64:', error);
      return imageUrl; // Return original URL as fallback
    }
  }

  /**
   * Get or generate content for a demo user
   */
  async getContent(userId: string, subject: string): Promise<SkillContent | null> {
    const user = this.demoUsers.find(u => u.id === userId);
    if (!user) {
      console.error(`Demo user ${userId} not found`);
      return null;
    }

    const skill = this.skillDefinitions[subject as keyof typeof this.skillDefinitions]?.[user.grade];
    if (!skill) {
      console.error(`No skill definition for ${subject} - ${user.grade}`);
      return null;
    }

    const cacheKey = this.getCacheKey(userId, subject, skill.code);
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`📦 Using cached content for ${userId} - ${subject}`);
      return this.cache.get(cacheKey)!.content;
    }

    // Generate new content
    console.log(`🔄 Generating new content for ${userId} - ${subject}`);
    
    const careers = this.careerContexts[user.grade as keyof typeof this.careerContexts];
    const career = careers[Math.floor(Math.random() * careers.length)];

    let content: SkillContent;
    
    if (user.useDallE) {
      content = await this.generateDallEContent(user, subject, skill, career);
    } else {
      content = this.generateEmojiContent(user, subject, skill, career);
    }

    // Cache the content
    const cached: CachedContent = {
      userId,
      skillCode: skill.code,
      subject,
      content,
      generatedAt: new Date().toISOString()
    };

    this.cache.set(cacheKey, cached);
    this.saveCache();

    return content;
  }

  /**
   * Pre-generate all content for demo users
   */
  async preGenerateAllContent(): Promise<void> {
    console.log('🚀 Pre-generating content for all demo users...');
    
    const subjects = ['Math', 'ELA', 'Science', 'SocialStudies'];
    let generated = 0;
    let cached = 0;

    for (const user of this.demoUsers) {
      for (const subject of subjects) {
        const cacheKey = this.getCacheKey(
          user.id, 
          subject, 
          this.skillDefinitions[subject as keyof typeof this.skillDefinitions]?.[user.grade]?.code || 'A.1'
        );
        
        if (this.cache.has(cacheKey)) {
          cached++;
          console.log(`✅ Already cached: ${user.name} - ${subject}`);
        } else {
          await this.getContent(user.id, subject);
          generated++;
          console.log(`✨ Generated: ${user.name} - ${subject}`);
          
          // Add delay to avoid rate limiting for DALL-E
          if (user.useDallE) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
    }

    console.log(`📊 Pre-generation complete: ${generated} new, ${cached} cached`);
  }

  /**
   * Clear all cached content
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
    console.log('🗑️ Demo content cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { total: number; byUser: Record<string, number>; bySubject: Record<string, number> } {
    const stats = {
      total: this.cache.size,
      byUser: {} as Record<string, number>,
      bySubject: {} as Record<string, number>
    };

    this.cache.forEach((value) => {
      stats.byUser[value.userId] = (stats.byUser[value.userId] || 0) + 1;
      stats.bySubject[value.subject] = (stats.bySubject[value.subject] || 0) + 1;
    });

    return stats;
  }
}

// Export singleton instance
export const demoContentCache = DemoContentCacheService.getInstance();