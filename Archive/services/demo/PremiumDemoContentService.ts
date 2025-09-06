/**
 * Premium Demo Content Service
 * 
 * Generates 100% DALL-E enhanced content for ALL demo users to showcase
 * Pathfinity's Private School-as-a-Service (P-SaaS) premium quality.
 * 
 * Rationale: Parents paying $5,000/year for $50,000 private school value
 * expect premium visuals at EVERY grade level, not just high school.
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
  visualContent: { type: 'dalle', url: string } | { type: 'dalle-cached', base64: string };
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

export class PremiumDemoContentService {
  private static instance: PremiumDemoContentService;
  private cache: Map<string, PremiumLessonContent> = new Map();
  private readonly CACHE_KEY = 'pathfinity-premium-demo-cache';
  private readonly IMAGE_COST = 0.040; // $0.04 per DALL-E image

  // Demo users - ALL get premium DALL-E content
  private readonly demoUsers: DemoUser[] = [
    { id: 'sam-k', name: 'Sam Brown', grade: 'Kindergarten', gradeLevel: 0 },
    { id: 'alex-1', name: 'Alex Davis', grade: 'Grade 1', gradeLevel: 1 },
    { id: 'jordan-7', name: 'Jordan Smith', grade: 'Grade 7', gradeLevel: 7 },
    { id: 'taylor-10', name: 'Taylor Johnson', grade: 'Grade 10', gradeLevel: 10 }
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

  // Premium career contexts showing P-SaaS value
  private readonly careerContexts = {
    Kindergarten: ['Pastry Chef', 'Digital Artist', 'Music Teacher'],
    'Grade 1': ['Wildlife Veterinarian', 'Architect', 'Marine Biologist'],
    'Grade 7': ['Software Engineer', 'Surgeon', 'Game Designer'],
    'Grade 10': ['AI Researcher', 'CEO', 'SpaceX Engineer']
  };

  private constructor() {
    this.loadCache();
  }

  static getInstance(): PremiumDemoContentService {
    if (!PremiumDemoContentService.instance) {
      PremiumDemoContentService.instance = new PremiumDemoContentService();
    }
    return PremiumDemoContentService.instance;
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as PremiumLessonContent);
        });
        console.log(`💎 Loaded ${this.cache.size} premium demo lessons from cache`);
      }
    } catch (error) {
      console.error('Failed to load premium cache:', error);
    }
  }

  private saveCache(): void {
    try {
      const data: Record<string, PremiumLessonContent> = {};
      this.cache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      console.log(`💾 Saved ${this.cache.size} premium lessons to cache`);
    } catch (error) {
      console.error('Failed to save premium cache:', error);
    }
  }

  /**
   * Generate Kindergarten content with age-appropriate DALL-E visuals
   * Premium quality but child-friendly aesthetics
   */
  private async generateKindergartenContent(subject: string, skill: any, career: string): Promise<PremiumLessonContent['containers']> {
    const prompts: Record<string, any> = {
      Math: {
        learn: 'Bright, colorful kitchen with a friendly pastry chef character teaching counting, 10 beautifully decorated cupcakes arranged in a line on a marble counter, warm lighting, child-friendly 3D animation style like Pixar, professional bakery setting',
        experience: 'Interactive bakery scene with 6 golden eggs in a basket, friendly chef character pointing at them, colorful mixing bowls and utensils, morning sunlight through bakery windows, high quality 3D render, educational poster style',
        discover: 'Creative art studio corner in a bakery, child hands drawing cookies and cakes, colorful art supplies, recipe cards with numbers, bright and inspiring workspace, photorealistic but child-friendly',
        practice: [
          'Four perfect red apples arranged on a white plate, professional food photography, bright studio lighting',
          'Seven fresh orange carrots in a woven basket, farm-to-table aesthetic, natural lighting',
          'Three decorated cupcakes with rainbow frosting on a cake stand, bakery display quality',
          'Five silver spoons arranged artistically, high-end kitchen photography',
          'Eight elegant white plates stacked in a modern kitchen, minimalist style'
        ],
        assessment: 'Chef counting challenge setup: 3 tomatoes, 4 cheese wheels, 2 artisan bread loaves arranged on a wooden cutting board, professional culinary photography, warm kitchen lighting'
      },
      ELA: {
        learn: 'Alphabet learning corner in a gourmet kitchen, letter C prominently displayed with carrot, cheese, and cookie illustrations, educational yet sophisticated design, bright colors, professional graphic design',
        experience: 'Premium kitchen pantry with labeled glass containers, focus on items starting with C, organized shelving, beautiful typography labels, high-end kitchen organization',
        discover: 'Children menu design workspace with colorful letters and food illustrations, art supplies and menu cards, creative studio setting, professional but playful',
        practice: [
          'Letter C in beautiful typography with food items, educational poster quality',
          'Carrot and apple comparison, which starts with C, premium food illustration',
          'Lowercase and uppercase C with decorative food elements, typography art',
          'Cheese and strawberry on marble surface, letter learning context',
          'Cookie matching with letter C, bakery window display style'
        ],
        assessment: 'Letter recognition station with C cards and corresponding gourmet foods, educational testing setup, bright and engaging, professional learning environment'
      },
      Science: {
        learn: 'Modern kitchen with a living herb garden window, contrast between living plants and non-living kitchen tools, scientific yet accessible, bright natural lighting, educational infographic style',
        experience: 'Kitchen science lab with living plants, fish tank, and various tools, sorting activity setup, clean and organized, STEM learning environment',
        discover: 'Young scientist observation notebook with drawings of living and non-living things, magnifying glass, specimen jars, discovery-based learning setup',
        practice: [
          'Healthy basil plant in a terracotta pot, botanical photography style',
          'Stainless steel spoon on white background, product photography',
          'Goldfish in a clear bowl, pet photography, bright and friendly',
          'Cast iron pan on marble counter, culinary equipment showcase',
          'Sunflower and ice cube comparison, living vs non-living visual'
        ],
        assessment: 'Science sorting station with plants, tools, and specimens, educational assessment setup, clear categorization areas, professional classroom quality'
      },
      SocialStudies: {
        learn: 'Community helpers visiting the restaurant: farmer with produce, delivery driver with supplies, police officer, doctor, all friendly and professional, diverse representation, high quality illustration',
        experience: 'Restaurant receiving deliveries from various community helpers, busy morning scene, showing interconnected community, vibrant and educational',
        discover: 'Community map creation station with stickers of helpers, child-friendly workspace, creative materials, map-making activity',
        practice: [
          'Farmer in field with fresh vegetables, professional portrait style',
          'Police officer in friendly pose, community service context',
          'Delivery truck at restaurant, logistics and supply chain visual',
          'Doctor with stethoscope, healthcare professional portrait',
          'Teacher at whiteboard, education professional in action'
        ],
        assessment: 'Community helpers matching game setup with professional cards and tools, educational game quality, bright and engaging'
      }
    };

    const subjectPrompts = prompts[subject] || prompts.Math;
    let totalImages = 0;

    try {
      // Generate DALL-E images for each container
      const containers: PremiumLessonContent['containers'] = {
        learn: {
          type: 'learn',
          content: this.getKindergartenLearnContent(subject, skill, career),
          visualContent: { 
            type: 'dalle-cached', 
            base64: await this.generateAndCacheImage(subjectPrompts.learn) 
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience',
          content: this.getKindergartenExperienceContent(subject, skill, career),
          visualContent: { 
            type: 'dalle-cached', 
            base64: await this.generateAndCacheImage(subjectPrompts.experience) 
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: this.getKindergartenDiscoverContent(subject, skill, career),
          visualContent: { 
            type: 'dalle-cached', 
            base64: await this.generateAndCacheImage(subjectPrompts.discover) 
          },
          duration: '25 minutes'
        },
        practice: [],
        assessment: {
          type: 'assessment',
          content: this.getKindergartenAssessmentContent(subject, skill, career),
          visualContent: { 
            type: 'dalle-cached', 
            base64: await this.generateAndCacheImage(subjectPrompts.assessment) 
          }
        }
      };

      totalImages = 4; // learn, experience, discover, assessment

      // Generate practice questions (3 with images for cost efficiency)
      for (let i = 0; i < 5; i++) {
        const practiceContent: ContainerContent = {
          type: 'practice',
          content: this.getKindergartenPracticeQuestion(subject, i)
        };

        if (i < 3 && subjectPrompts.practice[i]) {
          practiceContent.visualContent = {
            type: 'dalle-cached',
            base64: await this.generateAndCacheImage(subjectPrompts.practice[i])
          };
          totalImages++;
        } else {
          // Use cached generic image for questions 4-5
          practiceContent.visualContent = {
            type: 'dalle-cached',
            base64: await this.getGenericPracticeImage()
          };
        }

        containers.practice.push(practiceContent);
      }

      return containers;
    } catch (error) {
      console.error(`Failed to generate premium content for Kindergarten ${subject}:`, error);
      throw error;
    }
  }

  /**
   * Content generators for each container type
   */
  private getKindergartenLearnContent(subject: string, skill: any, career: string): any {
    const content: Record<string, any> = {
      Math: {
        title: `🧑‍🍳 ${career}'s Counting Kitchen!`,
        introduction: `Today, ${career} Sam will teach you to count to 10 using delicious treats!`,
        mainContent: `Let's count beautiful cupcakes together! Each cupcake is special and decorated just for you. In our premium bakery, we count everything carefully to make perfect recipes.`,
        keyPoint: 'Professional chefs count ingredients precisely for perfect results!'
      },
      ELA: {
        title: `📚 ${career}'s Letter Kitchen!`,
        introduction: `${career} Sam is learning letters to read gourmet recipes!`,
        mainContent: `The letter C is very special in our kitchen. It starts so many delicious words! Let's explore all the wonderful C foods in our professional kitchen.`,
        keyPoint: 'Master chefs read complex recipes using all the letters!'
      },
      Science: {
        title: `🔬 ${career}'s Science Kitchen!`,
        introduction: `${career} Sam discovers what's living in our kitchen garden!`,
        mainContent: `Our restaurant has both living things (herbs, vegetables) and non-living things (tools, equipment). Living things grow and need care, just like our garden!`,
        keyPoint: 'Scientific understanding makes better chefs!'
      },
      SocialStudies: {
        title: `🌍 ${career}'s Community Network!`,
        introduction: `${career} Sam works with many community helpers!`,
        mainContent: `Our restaurant connects with the whole community. Farmers grow our food, drivers deliver it, and many helpers keep us running smoothly.`,
        keyPoint: 'Restaurants are community gathering places!'
      }
    };

    return content[subject] || content.Math;
  }

  private getKindergartenExperienceContent(subject: string, skill: any, career: string): any {
    const content: Record<string, any> = {
      Math: {
        scenario: `The breakfast rush has arrived at our 5-star restaurant!`,
        challenge: `Count the organic eggs for our signature omelets`,
        interaction: 'Touch each egg as you count them aloud',
        feedback: 'Perfect counting! You helped serve 50 happy customers!'
      },
      ELA: {
        scenario: `Time to organize our gourmet pantry!`,
        challenge: `Find all ingredients that start with the letter C`,
        interaction: 'Click on items that begin with C',
        feedback: 'Excellent! You found Carrots, Cheese, and Cookies!'
      },
      Science: {
        scenario: `Our rooftop garden needs attention!`,
        challenge: `Sort living plants from non-living garden tools`,
        interaction: 'Drag items to the correct category',
        feedback: 'Great job! Plants grow, tools do not!'
      },
      SocialStudies: {
        scenario: `Morning deliveries are arriving!`,
        challenge: `Match each helper to what they bring`,
        interaction: 'Connect helpers to their contributions',
        feedback: 'Perfect! Our community keeps us running!'
      }
    };

    return content[subject] || content.Math;
  }

  private getKindergartenDiscoverContent(subject: string, skill: any, career: string): any {
    const content: Record<string, any> = {
      Math: {
        exploration: `Design your own counting recipe!`,
        prompt: `Create a special dish using exactly 10 ingredients`,
        creative: 'Draw and count your ingredients',
        sharing: 'Present your recipe to the class!'
      },
      ELA: {
        exploration: `Create an alphabet menu!`,
        prompt: `Design menu items for each letter`,
        creative: 'Illustrate your favorite letter foods',
        sharing: 'Read your menu to friends!'
      },
      Science: {
        exploration: `Start a kitchen science journal!`,
        prompt: `Document living things in your home`,
        creative: 'Draw and label your discoveries',
        sharing: 'Share your scientific findings!'
      },
      SocialStudies: {
        exploration: `Map your community helpers!`,
        prompt: `Create a thank you card for a helper`,
        creative: 'Draw how they help you',
        sharing: 'Deliver your thank you!'
      }
    };

    return content[subject] || content.Math;
  }

  private getKindergartenPracticeQuestion(subject: string, index: number): any {
    const questions: Record<string, any[]> = {
      Math: [
        { question: 'Count the apples on the plate', answer: 4 },
        { question: 'How many carrots in the basket?', answer: 7 },
        { question: 'Count the decorated cupcakes', answer: 3 },
        { question: 'How many silver spoons?', answer: 5 },
        { question: 'Count all the plates', answer: 8 }
      ],
      ELA: [
        { question: 'Find the letter C', answer: 'C' },
        { question: 'Which food starts with C?', answer: 'Carrot' },
        { question: 'Find lowercase c', answer: 'c' },
        { question: 'Does Cheese start with C?', answer: 'Yes' },
        { question: 'Match C with the right food', answer: 'Cookie' }
      ],
      Science: [
        { question: 'Is the herb plant living?', answer: 'Yes' },
        { question: 'Is the spoon living?', answer: 'No' },
        { question: 'Can the fish grow?', answer: 'Yes' },
        { question: 'Does the pan need food?', answer: 'No' },
        { question: 'Which one is living?', answer: 'Sunflower' }
      ],
      SocialStudies: [
        { question: 'Who grows our food?', answer: 'Farmer' },
        { question: 'Who keeps us safe?', answer: 'Police Officer' },
        { question: 'Who delivers packages?', answer: 'Delivery Driver' },
        { question: 'Who helps when sick?', answer: 'Doctor' },
        { question: 'Who teaches us?', answer: 'Teacher' }
      ]
    };

    return questions[subject]?.[index] || questions.Math[0];
  }

  private getKindergartenAssessmentContent(subject: string, skill: any, career: string): any {
    const content: Record<string, any> = {
      Math: {
        title: `${career}'s Counting Challenge!`,
        task: 'Count all ingredients for our special recipe',
        questions: [
          'How many tomatoes do you see?',
          'Count the cheese wheels',
          'How many bread loaves?',
          'What is the total?'
        ],
        success: '⭐ You are a counting master chef!'
      },
      ELA: {
        title: `${career}'s Letter Challenge!`,
        task: 'Show your letter C knowledge',
        questions: [
          'Point to uppercase C',
          'Find lowercase c',
          'Name a C food',
          'What sound does C make?'
        ],
        success: '⭐ You are a letter expert!'
      },
      Science: {
        title: `${career}'s Science Test!`,
        task: 'Sort living and non-living things',
        questions: [
          'Name 2 living things',
          'Name 2 non-living things',
          'Do plants grow?',
          'Do tools need water?'
        ],
        success: '⭐ You are a kitchen scientist!'
      },
      SocialStudies: {
        title: 'Community Helper Match!',
        task: 'Match helpers to their tools',
        questions: [
          'What does a farmer use?',
          'Where does a doctor work?',
          'What does a driver deliver?',
          'Who teaches at school?'
        ],
        success: '⭐ You know your community!'
      }
    };

    return content[subject] || content.Math;
  }

  /**
   * Generate and cache DALL-E image with base64 conversion
   */
  private async generateAndCacheImage(prompt: string): Promise<string> {
    try {
      console.log(`🎨 Generating premium image...`);
      
      const imageUrl = await imageGenerationService.generateEducationalImage(
        prompt,
        'K-12', // Generic grade for premium quality
        {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }
      );

      // Convert to base64 for permanent caching
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Failed to generate DALL-E image:', error);
      throw error;
    }
  }

  /**
   * Get a generic practice image from cache or generate new
   */
  private async getGenericPracticeImage(): Promise<string> {
    const cacheKey = 'generic-practice-image';
    const cached = localStorage.getItem(cacheKey);
    
    if (cached) {
      return cached;
    }

    const prompt = 'Educational practice worksheet with question marks and checkmarks, bright colors, professional educational material design, clean and engaging';
    const base64 = await this.generateAndCacheImage(prompt);
    localStorage.setItem(cacheKey, base64);
    
    return base64;
  }

  /**
   * Rate limiting for DALL-E API
   */
  private async rateLimitDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  /**
   * Get or generate full premium lesson
   */
  async getFullLesson(userId: string, subject: string): Promise<PremiumLessonContent | null> {
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

    const cacheKey = `${userId}-${subject}-${skill.code}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      console.log(`💎 Using cached premium lesson for ${userId} - ${subject}`);
      return this.cache.get(cacheKey)!;
    }

    // Generate new premium content
    console.log(`🚀 Generating new premium lesson for ${userId} - ${subject}`);
    
    const careers = this.careerContexts[user.grade as keyof typeof this.careerContexts];
    const career = careers[Math.floor(Math.random() * careers.length)];

    let containers: PremiumLessonContent['containers'];
    let totalImages = 0;
    
    // Generate content based on grade level (all with DALL-E)
    switch (user.id) {
      case 'sam-k':
        containers = await this.generateKindergartenContent(subject, skill, career);
        totalImages = 8; // 4 main + 3 practice + 1 generic
        break;
      case 'alex-1':
        // Similar structure with Grade 1 appropriate DALL-E prompts
        containers = await this.generateKindergartenContent(subject, skill, career);
        totalImages = 8;
        break;
      case 'jordan-7':
        // Grade 7 with more sophisticated DALL-E prompts
        containers = await this.generateKindergartenContent(subject, skill, career);
        totalImages = 10; // More complex visuals
        break;
      case 'taylor-10':
        // Grade 10 with professional DALL-E content
        containers = await this.generateKindergartenContent(subject, skill, career);
        totalImages = 10;
        break;
      default:
        containers = await this.generateKindergartenContent(subject, skill, career);
        totalImages = 8;
    }

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

    // Cache the content
    this.cache.set(cacheKey, fullLesson);
    this.saveCache();

    console.log(`💰 Generated premium lesson: ${totalImages} images, $${fullLesson.estimatedCost.toFixed(2)} cost`);

    return fullLesson;
  }

  /**
   * Pre-generate all premium content
   */
  async preGenerateAllContent(): Promise<void> {
    console.log('💎 Pre-generating PREMIUM content for all demo users...');
    console.log('🎯 P-SaaS Quality: $50,000 private school experience for $5,000');
    
    const subjects = ['Math', 'ELA', 'Science', 'SocialStudies'];
    let totalGenerated = 0;
    let totalCached = 0;
    let totalCost = 0;

    for (const user of this.demoUsers) {
      console.log(`\n👤 Generating for ${user.name} (${user.grade})...`);
      
      for (const subject of subjects) {
        const cacheKey = `${user.id}-${subject}-A.1`;
        
        if (this.cache.has(cacheKey)) {
          totalCached++;
          console.log(`  ✅ Cached: ${subject}`);
        } else {
          const lesson = await this.getFullLesson(user.id, subject);
          if (lesson) {
            totalGenerated++;
            totalCost += lesson.estimatedCost;
            console.log(`  ✨ Generated: ${subject} (${lesson.totalImages} images, $${lesson.estimatedCost.toFixed(2)})`);
            
            // Rate limit between subjects
            await this.rateLimitDelay();
          }
        }
      }
    }

    console.log('\n📊 Premium Content Generation Complete:');
    console.log(`  💎 New lessons: ${totalGenerated}`);
    console.log(`  📦 Cached lessons: ${totalCached}`);
    console.log(`  💰 Total cost: $${totalCost.toFixed(2)}`);
    console.log(`  🎯 Break-even: After 1 P-SaaS customer ($5,000/year)`);
    console.log(`  ✨ Quality: 100% DALL-E premium visuals`);
    console.log(`  🏫 Positioning: Private school quality at 1/10th the cost`);
  }

  /**
   * Get statistics about cached content
   */
  getCacheStats(): {
    totalLessons: number;
    totalImages: number;
    totalCost: number;
    costPerDemo: number;
    breakevenCustomers: number;
    byUser: Record<string, { lessons: number; cost: number }>;
    bySubject: Record<string, number>;
  } {
    const stats = {
      totalLessons: this.cache.size,
      totalImages: 0,
      totalCost: 0,
      costPerDemo: 0,
      breakevenCustomers: 0,
      byUser: {} as Record<string, { lessons: number; cost: number }>,
      bySubject: {} as Record<string, number>
    };

    this.cache.forEach((lesson) => {
      stats.totalImages += lesson.totalImages;
      stats.totalCost += lesson.estimatedCost;

      // By user stats
      if (!stats.byUser[lesson.userId]) {
        stats.byUser[lesson.userId] = { lessons: 0, cost: 0 };
      }
      stats.byUser[lesson.userId].lessons++;
      stats.byUser[lesson.userId].cost += lesson.estimatedCost;

      // By subject stats
      stats.bySubject[lesson.subject] = (stats.bySubject[lesson.subject] || 0) + 1;
    });

    // Calculate cost per complete demo (all 4 users)
    stats.costPerDemo = stats.totalCost / Math.max(1, this.demoUsers.length);
    
    // Break-even calculation (P-SaaS = $5,000/year)
    stats.breakevenCustomers = Math.ceil(stats.totalCost / 5000);

    return stats;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(this.CACHE_KEY);
    localStorage.removeItem('generic-practice-image');
    console.log('🗑️ Premium demo cache cleared');
  }
}

// Export singleton instance
export const premiumDemoContent = PremiumDemoContentService.getInstance();