/**
 * Demo Content Cache Service V2
 * 
 * Generates and caches AI content for demo users across all containers:
 * - LEARN: Core lesson content
 * - EXPERIENCE: Interactive scenarios  
 * - DISCOVER: Exploration and creativity
 * - PRACTICE: 5 practice questions
 * - ASSESSMENT: Final evaluation
 * 
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

interface ContainerContent {
  type: 'learn' | 'experience' | 'discover' | 'practice' | 'assessment';
  content: any;
  visualContent?: string | { type: 'emoji' | 'dalle', content: string };
  duration?: string;
}

interface FullLessonContent {
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
}

export class DemoContentCacheServiceV2 {
  private static instance: DemoContentCacheServiceV2;
  private cache: Map<string, FullLessonContent> = new Map();
  private readonly CACHE_KEY = 'pathfinity-demo-content-cache-v2';

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

  static getInstance(): DemoContentCacheServiceV2 {
    if (!DemoContentCacheServiceV2.instance) {
      DemoContentCacheServiceV2.instance = new DemoContentCacheServiceV2();
    }
    return DemoContentCacheServiceV2.instance;
  }

  private loadCache(): void {
    try {
      const cached = localStorage.getItem(this.CACHE_KEY);
      if (cached) {
        const data = JSON.parse(cached);
        Object.entries(data).forEach(([key, value]) => {
          this.cache.set(key, value as FullLessonContent);
        });
        console.log(`📦 Loaded ${this.cache.size} cached demo lessons`);
      }
    } catch (error) {
      console.error('Failed to load demo content cache:', error);
    }
  }

  private saveCache(): void {
    try {
      const data: Record<string, FullLessonContent> = {};
      this.cache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.CACHE_KEY, JSON.stringify(data));
      console.log(`💾 Saved ${this.cache.size} demo lessons to cache`);
    } catch (error) {
      console.error('Failed to save demo content cache:', error);
    }
  }

  private getCacheKey(userId: string, subject: string, skillCode: string): string {
    return `${userId}-${subject}-${skillCode}`;
  }

  /**
   * Generate full lesson content for Kindergarten (Sam)
   */
  private generateKindergartenContent(subject: string, skill: any, career: string): FullLessonContent['containers'] {
    const contents: Record<string, FullLessonContent['containers']> = {
      Math: {
        learn: {
          type: 'learn',
          content: {
            title: `🧑‍🍳 Chef's Counting Kitchen!`,
            introduction: `Today, Chef Sam will learn to count to 10 by counting ingredients!`,
            mainContent: `Let's count cookies for our customers:
            
            🍪 = 1 cookie
            🍪🍪 = 2 cookies
            🍪🍪🍪 = 3 cookies
            
            Can you help Chef Sam count all the way to 10?`,
            visualContent: { type: 'emoji', content: '🍪🍪🍪🍪🍪🍪🍪🍪🍪🍪' },
            keyPoint: 'Chefs count ingredients to make perfect recipes!'
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience',
          content: {
            scenario: `🍳 The breakfast rush is here! Count the eggs:`,
            challenge: `How many eggs does Chef need? Count them:`,
            visualContent: { type: 'emoji', content: '🥚🥚🥚🥚🥚🥚' },
            interaction: 'Tap each egg as you count!',
            feedback: 'Great counting! That's 6 eggs for our omelets!'
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: {
            exploration: `🎨 Create your own counting recipe!`,
            prompt: `Draw your favorite food and count how many you need:`,
            visualContent: { type: 'emoji', content: '🍕➕🍕➕🍕 = ?' },
            creative: 'Make a counting book for the restaurant!',
            sharing: 'Show your recipe to the class!'
          },
          duration: '25 minutes'
        },
        practice: [
          {
            type: 'practice',
            content: {
              question: 'Count the apples: 🍎🍎🍎🍎',
              answer: 4,
              visualContent: { type: 'emoji', content: '🍎🍎🍎🍎' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'How many carrots? 🥕🥕🥕🥕🥕🥕🥕',
              answer: 7,
              visualContent: { type: 'emoji', content: '🥕🥕🥕🥕🥕🥕🥕' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Count the cupcakes: 🧁🧁🧁',
              answer: 3,
              visualContent: { type: 'emoji', content: '🧁🧁🧁' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'How many spoons? 🥄🥄🥄🥄🥄',
              answer: 5,
              visualContent: { type: 'emoji', content: '🥄🥄🥄🥄🥄' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Count all the plates: 🍽️🍽️🍽️🍽️🍽️🍽️🍽️🍽️',
              answer: 8,
              visualContent: { type: 'emoji', content: '🍽️🍽️🍽️🍽️🍽️🍽️🍽️🍽️' }
            }
          }
        ],
        assessment: {
          type: 'assessment',
          content: {
            title: 'Chef Sam's Counting Challenge!',
            task: 'Count all ingredients for the special recipe:',
            visualContent: { type: 'emoji', content: '🍅🍅🍅 🧀🧀🧀🧀 🍞🍞' },
            questions: [
              'How many tomatoes? (3)',
              'How many cheese slices? (4)', 
              'How many bread slices? (2)',
              'How many total ingredients? (9)'
            ],
            success: '🌟 You're a counting chef superstar!'
          }
        }
      },
      ELA: {
        learn: {
          type: 'learn',
          content: {
            title: `🧑‍🍳 Chef's Letter Kitchen!`,
            introduction: `Chef Sam is learning letters to read recipes!`,
            mainContent: `Let's find the letter C in our kitchen:
            
            C is for 🥕 Carrot
            C is for 🧀 Cheese  
            C is for 🍪 Cookie
            
            The letter C makes a 'kuh' sound!`,
            visualContent: { type: 'emoji', content: 'C c 🥕 🧀 🍪' },
            keyPoint: 'Chefs read recipes using letters!'
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience',
          content: {
            scenario: `🔤 Help Chef label the food containers!`,
            challenge: `Which foods start with letter C?`,
            visualContent: { type: 'emoji', content: '🥕 🍎 🧀 🍌 🍪 🍓' },
            interaction: 'Circle all the C foods!',
            feedback: 'Yes! Carrot, Cheese, and Cookie start with C!'
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: {
            exploration: `📝 Create your own menu with letters!`,
            prompt: `Draw foods that start with your favorite letter:`,
            visualContent: { type: 'emoji', content: 'A🍎 B🍌 C🥕' },
            creative: 'Make an ABC cookbook!',
            sharing: 'Read your menu to a friend!'
          },
          duration: '25 minutes'
        },
        practice: [
          {
            type: 'practice',
            content: {
              question: 'Find the letter C: A B C D',
              answer: 'C',
              visualContent: { type: 'emoji', content: 'A B C D' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Which starts with C? 🍎 or 🥕?',
              answer: '🥕 Carrot',
              visualContent: { type: 'emoji', content: '🍎 🥕' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Find lowercase c: a b c d',
              answer: 'c',
              visualContent: { type: 'emoji', content: 'a b c d' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Which starts with C? 🧀 or 🍓?',
              answer: '🧀 Cheese',
              visualContent: { type: 'emoji', content: '🧀 🍓' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Match: C goes with 🍪 or 🍌?',
              answer: '🍪 Cookie',
              visualContent: { type: 'emoji', content: 'C = ? 🍪 🍌' }
            }
          }
        ],
        assessment: {
          type: 'assessment',
          content: {
            title: 'Chef's Letter Challenge!',
            task: 'Show what you learned about letters:',
            visualContent: { type: 'emoji', content: 'C c 🥕 🧀 🍪' },
            questions: [
              'Point to uppercase C',
              'Point to lowercase c',
              'Name a food that starts with C',
              'What sound does C make?'
            ],
            success: '🌟 You're a letter expert chef!'
          }
        }
      },
      Science: {
        learn: {
          type: 'learn',
          content: {
            title: `🧑‍🍳 Chef's Living Kitchen Garden!`,
            introduction: `Chef Sam learns what's living and non-living in the kitchen!`,
            mainContent: `Living things grow and need food:
            
            LIVING: 🌿 Herbs, 🍅 Tomato plants, 🐟 Fish
            They grow, eat, and change!
            
            NON-LIVING: 🥄 Spoons, 🍳 Pans, 🧊 Ice
            They don't grow or need food!`,
            visualContent: { type: 'emoji', content: '🌿🍅 vs 🥄🍳' },
            keyPoint: 'Chefs use both living and non-living things!'
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience',
          content: {
            scenario: `🌱 Chef's garden needs sorting!`,
            challenge: `Which things are LIVING?`,
            visualContent: { type: 'emoji', content: '🌿 🥄 🐟 🍳 🌻 🧊' },
            interaction: 'Put living things in the garden!',
            feedback: 'Yes! Plants and fish are living!'
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: {
            exploration: `🔬 Be a kitchen scientist!`,
            prompt: `Find 3 living and 3 non-living things:`,
            visualContent: { type: 'emoji', content: '✅ Living | ❌ Non-living' },
            creative: 'Draw your discoveries!',
            sharing: 'Teach someone else!'
          },
          duration: '25 minutes'
        },
        practice: [
          {
            type: 'practice',
            content: {
              question: 'Is 🌿 herb living?',
              answer: 'Yes, living',
              visualContent: { type: 'emoji', content: '🌿' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Is 🥄 spoon living?',
              answer: 'No, non-living',
              visualContent: { type: 'emoji', content: '🥄' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Is 🐟 fish living?',
              answer: 'Yes, living',
              visualContent: { type: 'emoji', content: '🐟' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Is 🍳 pan living?',
              answer: 'No, non-living',
              visualContent: { type: 'emoji', content: '🍳' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Which is living? 🌻 or 🧊?',
              answer: '🌻 Sunflower',
              visualContent: { type: 'emoji', content: '🌻 🧊' }
            }
          }
        ],
        assessment: {
          type: 'assessment',
          content: {
            title: 'Chef's Science Test!',
            task: 'Sort the kitchen items:',
            visualContent: { type: 'emoji', content: '🌿 🥄 🍅 🍳 🐟 🧊' },
            questions: [
              'Name 2 living things',
              'Name 2 non-living things',
              'Do living things grow?',
              'Do spoons need food?'
            ],
            success: '🌟 You're a science chef!'
          }
        }
      },
      SocialStudies: {
        learn: {
          type: 'learn',
          content: {
            title: `🧑‍🍳 Chef's Community Helpers!`,
            introduction: `Chef Sam learns who helps in our community!`,
            mainContent: `Community helpers keep us safe and healthy:
            
            👨‍🌾 Farmers grow our food
            🚚 Delivery drivers bring ingredients
            👮 Police keep us safe
            👨‍⚕️ Doctors keep us healthy`,
            visualContent: { type: 'emoji', content: '👨‍🌾 🚚 👮 👨‍⚕️' },
            keyPoint: 'Chefs work with many community helpers!'
          },
          duration: '15 minutes'
        },
        experience: {
          type: 'experience', 
          content: {
            scenario: `🏪 Chef needs help from the community!`,
            challenge: `Who brings food to the restaurant?`,
            visualContent: { type: 'emoji', content: '👨‍🌾 🚚 👮 👨‍⚕️' },
            interaction: 'Match helpers to their jobs!',
            feedback: 'Farmers grow it, drivers deliver it!'
          },
          duration: '20 minutes'
        },
        discover: {
          type: 'discover',
          content: {
            exploration: `🌍 Explore your community!`,
            prompt: `Draw your favorite community helper:`,
            visualContent: { type: 'emoji', content: '👥 Community Map 🗺️' },
            creative: 'Make a thank you card!',
            sharing: 'Tell why they're important!'
          },
          duration: '25 minutes'
        },
        practice: [
          {
            type: 'practice',
            content: {
              question: 'Who grows food? 👨‍🌾 or 👮?',
              answer: '👨‍🌾 Farmer',
              visualContent: { type: 'emoji', content: '👨‍🌾 👮' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Who keeps us safe? 👮 or 🚚?',
              answer: '👮 Police',
              visualContent: { type: 'emoji', content: '👮 🚚' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Who delivers packages? 🚚 or 👨‍⚕️?',
              answer: '🚚 Delivery driver',
              visualContent: { type: 'emoji', content: '🚚 👨‍⚕️' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Who helps when sick? 👨‍⚕️ or 👨‍🌾?',
              answer: '👨‍⚕️ Doctor',
              visualContent: { type: 'emoji', content: '👨‍⚕️ 👨‍🌾' }
            }
          },
          {
            type: 'practice',
            content: {
              question: 'Who teaches us? 👩‍🏫 or 🚚?',
              answer: '👩‍🏫 Teacher',
              visualContent: { type: 'emoji', content: '👩‍🏫 🚚' }
            }
          }
        ],
        assessment: {
          type: 'assessment',
          content: {
            title: 'Community Helper Match!',
            task: 'Match helpers to their tools:',
            visualContent: { type: 'emoji', content: '👨‍🌾🚜 👮🚔 👨‍⚕️🏥 🚚📦' },
            questions: [
              'Farmer uses? (Tractor)',
              'Police uses? (Police car)',
              'Doctor works at? (Hospital)',
              'Driver delivers? (Packages)'
            ],
            success: '🌟 You know your community!'
          }
        }
      }
    };

    return contents[subject as keyof typeof contents] || contents.Math;
  }

  /**
   * Generate full lesson content for Grade 10 (Taylor) with DALL-E
   */
  private async generateGrade10Content(subject: string, skill: any, career: string): Promise<FullLessonContent['containers']> {
    const contents: Record<string, any> = {
      Math: {
        learn: {
          dallePrompt: 'Modern data science workspace with multiple monitors showing quadratic function graphs, professional office setting, photorealistic',
          content: {
            title: `📊 Data Scientist: Quadratic Functions in Market Analysis`,
            introduction: `As a Data Scientist at Tesla, you'll use quadratic functions to model market trends and optimize pricing strategies.`,
            mainContent: `Quadratic functions f(x) = ax² + bx + c model parabolic relationships:
            
            • Vertex form: f(x) = a(x-h)² + k reveals the maximum/minimum
            • Factored form: f(x) = a(x-r₁)(x-r₂) shows x-intercepts
            • Standard form: f(x) = ax² + bx + c for general calculations
            
            Real application: Tesla's battery degradation follows a quadratic model`,
            keyPoint: 'Quadratics predict optimal pricing and demand curves in business'
          }
        },
        experience: {
          dallePrompt: 'Interactive dashboard showing Tesla stock price quadratic regression model with profit optimization curves, dark theme, modern UI',
          content: {
            scenario: `Tesla's new Model Y pricing strategy needs optimization`,
            challenge: `Given demand function D(p) = -2p² + 180p - 3200, find optimal price`,
            interaction: 'Manipulate the interactive graph to find the vertex',
            feedback: 'Optimal price at $45k maximizes revenue at $850k!'
          }
        },
        discover: {
          dallePrompt: 'Creative workspace with AI-generated business models, quadratic curves forming art patterns, futuristic holographic displays',
          content: {
            exploration: `Design your own product pricing model`,
            prompt: `Create a quadratic model for a new tech product launch`,
            creative: 'Build an interactive pricing simulator',
            sharing: 'Present your model to the virtual board'
          }
        },
        practice: [
          {
            dallePrompt: 'Graph showing parabola with vertex at (3,4)',
            question: 'Find the vertex of f(x) = x² - 6x + 13',
            answer: '(3, 4)'
          },
          {
            dallePrompt: 'Revenue curve intersecting x-axis at 20 and 60',
            question: 'Find zeros of R(x) = -x² + 80x - 1200',
            answer: 'x = 20 and x = 60'
          },
          {
            dallePrompt: 'Profit maximization graph with maximum at x=25',
            question: 'Maximize P(x) = -2x² + 100x - 800',
            answer: 'x = 25, Max profit = 450'
          },
          {
            dallePrompt: 'Supply and demand curves intersecting',
            question: 'Where do y = x² and y = 4x - 3 intersect?',
            answer: '(1, 1) and (3, 9)'
          },
          {
            dallePrompt: 'Tesla battery degradation curve over time',
            question: 'Model: B(t) = -0.1t² + 100. Battery at t=10?',
            answer: '90% capacity'
          }
        ],
        assessment: {
          dallePrompt: 'Professional presentation screen showing complete quadratic analysis with all forms, Tesla conference room',
          content: {
            title: 'Tesla Quarterly Analysis Presentation',
            task: 'Analyze profit function P(x) = -3x² + 120x - 900',
            questions: [
              'Find the break-even points',
              'Determine maximum profit',
              'Calculate profit at x = 15',
              'Recommend optimal production level'
            ],
            success: '🎯 Ready for Tesla's data science team!'
          }
        }
      },
      ELA: {
        learn: {
          dallePrompt: 'Modern conference room with presentation on literary criticism, books and tablets, professional setting',
          content: {
            title: `✍️ Entrepreneur: Literary Criticism for Business Communication`,
            introduction: `As an Entrepreneur, master literary criticism to craft compelling narratives for investors and customers.`,
            mainContent: `Literary criticism frameworks for business storytelling:
            
            • Formalist: Structure and style of your pitch
            • Marxist: Economic and class considerations
            • Feminist: Gender representation in marketing
            • Postcolonial: Global market perspectives
            
            Apply these lenses to analyze competitor messaging`,
            keyPoint: 'Critical analysis shapes powerful business narratives'
          }
        },
        experience: {
          dallePrompt: 'Startup pitch deck being analyzed with literary criticism annotations, modern office',
          content: {
            scenario: `Analyze Apple's "Think Different" campaign`,
            challenge: `Apply three critical lenses to decode its success`,
            interaction: 'Annotate the campaign with critical insights',
            feedback: 'Your analysis reveals the power of counterculture messaging!'
          }
        },
        discover: {
          dallePrompt: 'Creative workspace with brand storytelling boards, literary theory books, startup atmosphere',
          content: {
            exploration: `Create your startup's origin story`,
            prompt: `Craft a narrative using hero's journey structure`,
            creative: 'Design a pitch deck with literary techniques',
            sharing: 'Present to virtual investors'
          }
        },
        practice: [
          {
            dallePrompt: 'Text analysis interface highlighting themes',
            question: 'Identify the primary theme in this mission statement',
            answer: 'Innovation through disruption'
          },
          {
            dallePrompt: 'Comparison of two advertising campaigns',
            question: 'Which critical lens best analyzes Nike's "Just Do It"?',
            answer: 'Feminist - empowerment narrative'
          },
          {
            dallePrompt: 'Literary devices in business writing',
            question: 'What device is used in "Failing fast, winning faster"?',
            answer: 'Antithesis and alliteration'
          },
          {
            dallePrompt: 'Brand story structure diagram',
            question: 'Map Airbnb's story to the hero's journey',
            answer: 'Call: Travel differently, Transformation: Belonging'
          },
          {
            dallePrompt: 'Critical review of business memoir',
            question: 'Analyze Elon Musk's biography through Marxist lens',
            answer: 'Critique of wealth concentration vs innovation narrative'
          }
        ],
        assessment: {
          dallePrompt: 'Professional presentation of literary criticism applied to business case study',
          content: {
            title: 'Startup Story Analysis',
            task: 'Critically analyze a unicorn startup's narrative',
            questions: [
              'Identify three literary devices used',
              'Apply formalist criticism to structure',
              'Evaluate cultural impact through postcolonial lens',
              'Propose alternative narrative strategy'
            ],
            success: '🚀 Master storyteller entrepreneur!'
          }
        }
      },
      Science: {
        learn: {
          dallePrompt: 'Modern chemistry lab with molecular models, chemical equations on smart boards, safety equipment visible',
          content: {
            title: `⚗️ Aerospace Engineer: Chemical Reactions in Rocket Fuel`,
            introduction: `As an Aerospace Engineer at SpaceX, understand chemical reactions that power rockets to Mars.`,
            mainContent: `Chemical reactions in rocket propulsion:
            
            • Combustion: 2H₂ + O₂ → 2H₂O + Energy
            • Redox: Electron transfer drives thrust
            • Endothermic/Exothermic: Energy management
            • Stoichiometry: Precise fuel ratios
            
            SpaceX's Raptor engine: CH₄ + 2O₂ → CO₂ + 2H₂O`,
            keyPoint: 'Chemical reactions provide 9.8 km/s escape velocity'
          }
        },
        experience: {
          dallePrompt: 'SpaceX mission control with fuel mixture calculations, rocket engine diagrams, real-time monitoring',
          content: {
            scenario: `Calculate fuel for Mars mission`,
            challenge: `Balance: RP-1 (C₁₂H₂₆) + O₂ → CO₂ + H₂O`,
            interaction: 'Adjust fuel ratios in the simulator',
            feedback: 'Perfect ratio achieves maximum specific impulse!'
          }
        },
        discover: {
          dallePrompt: 'Futuristic rocket design lab with alternative fuel experiments, holographic chemical models',
          content: {
            exploration: `Design eco-friendly rocket fuel`,
            prompt: `Research green propellant alternatives`,
            creative: 'Model your chemical reaction',
            sharing: 'Present to SpaceX engineers'
          }
        },
        practice: [
          {
            dallePrompt: 'Balanced equation for hydrogen combustion',
            question: 'Balance: H₂ + O₂ → H₂O',
            answer: '2H₂ + O₂ → 2H₂O'
          },
          {
            dallePrompt: 'Methane combustion in Raptor engine',
            question: 'Products of CH₄ + 2O₂?',
            answer: 'CO₂ + 2H₂O'
          },
          {
            dallePrompt: 'Exothermic reaction energy diagram',
            question: 'Is rocket combustion exothermic or endothermic?',
            answer: 'Exothermic - releases energy'
          },
          {
            dallePrompt: 'Stoichiometry calculation workspace',
            question: 'Moles of O₂ needed for 10 mol H₂?',
            answer: '5 moles O₂'
          },
          {
            dallePrompt: 'Redox reaction in fuel cell',
            question: 'What is oxidized in 2H₂ + O₂ → 2H₂O?',
            answer: 'Hydrogen (H₂)'
          }
        ],
        assessment: {
          dallePrompt: 'SpaceX engineering review with complete chemical analysis of new fuel system',
          content: {
            title: 'Starship Fuel System Analysis',
            task: 'Analyze new methalox propulsion system',
            questions: [
              'Balance the combustion equation',
              'Calculate energy released per mole',
              'Determine optimal fuel mixture ratio',
              'Assess environmental impact'
            ],
            success: '🚀 SpaceX ready aerospace engineer!'
          }
        }
      },
      SocialStudies: {
        learn: {
          dallePrompt: 'Modern economics classroom with graphs comparing economic systems, world map, professional setting',
          content: {
            title: `💼 Entrepreneur: Economic Systems for Global Business`,
            introduction: `As an Entrepreneur expanding globally, understand how different economic systems affect your business strategy.`,
            mainContent: `Economic systems shape business opportunities:
            
            • Capitalism: Free market, private ownership (USA)
            • Socialism: Government control, social welfare (Nordic)
            • Mixed Economy: Balanced approach (Germany)
            • Command Economy: Central planning (China)
            
            Each system offers unique challenges and opportunities`,
            keyPoint: 'Successful entrepreneurs adapt to any economic system'
          }
        },
        experience: {
          dallePrompt: 'Business strategy war room with global market analysis, economic system comparisons',
          content: {
            scenario: `Launch your startup in 3 different economies`,
            challenge: `Adapt your business model for USA, Sweden, and China`,
            interaction: 'Customize strategy for each market',
            feedback: 'Your adaptive strategy captures 3 billion consumers!'
          }
        },
        discover: {
          dallePrompt: 'Innovation lab with economic system simulations, future society designs',
          content: {
            exploration: `Design the ideal economic system`,
            prompt: `Combine best elements from each system`,
            creative: 'Create a new economic model for Mars colony',
            sharing: 'Debate with classmates'
          }
        },
        practice: [
          {
            dallePrompt: 'USA vs China economic comparison chart',
            question: 'Which system emphasizes private ownership?',
            answer: 'Capitalism (USA)'
          },
          {
            dallePrompt: 'Nordic model infographic',
            question: 'What combines capitalism with strong welfare?',
            answer: 'Mixed economy (Nordic model)'
          },
          {
            dallePrompt: 'Supply and demand curves',
            question: 'Who sets prices in pure capitalism?',
            answer: 'Market forces (supply/demand)'
          },
          {
            dallePrompt: 'Global business expansion map',
            question: 'Best system for tech startup?',
            answer: 'Capitalism - venture capital access'
          },
          {
            dallePrompt: 'Economic freedom index map',
            question: 'Trade-off in socialism?',
            answer: 'Less economic freedom for more equality'
          }
        ],
        assessment: {
          dallePrompt: 'Global business presentation comparing strategies across economic systems',
          content: {
            title: 'Global Expansion Strategy',
            task: 'Plan expansion into 3 economic systems',
            questions: [
              'Compare market entry strategies',
              'Analyze regulatory differences',
              'Assess profit potential',
              'Recommend optimal approach'
            ],
            success: '🌍 Global entrepreneur ready!'
          }
        }
      }
    };

    const subjectContent = contents[subject as keyof typeof contents];
    if (!subjectContent) return this.generateDefaultContent(subject, skill, career);

    // Generate DALL-E images for each container
    const containers: FullLessonContent['containers'] = {
      learn: { type: 'learn', content: subjectContent.learn.content, duration: '15 minutes' },
      experience: { type: 'experience', content: subjectContent.experience.content, duration: '20 minutes' },
      discover: { type: 'discover', content: subjectContent.discover.content, duration: '25 minutes' },
      practice: [],
      assessment: { type: 'assessment', content: subjectContent.assessment.content }
    };

    try {
      // Generate DALL-E images with rate limiting
      console.log(`🎨 Generating DALL-E images for Taylor - ${subject}...`);

      // Learn container image
      if (subjectContent.learn.dallePrompt) {
        const learnImage = await this.generateDallEImage(subjectContent.learn.dallePrompt);
        containers.learn.visualContent = { type: 'dalle', content: learnImage };
        await this.rateLimitDelay();
      }

      // Experience container image
      if (subjectContent.experience.dallePrompt) {
        const experienceImage = await this.generateDallEImage(subjectContent.experience.dallePrompt);
        containers.experience.visualContent = { type: 'dalle', content: experienceImage };
        await this.rateLimitDelay();
      }

      // Discover container image
      if (subjectContent.discover.dallePrompt) {
        const discoverImage = await this.generateDallEImage(subjectContent.discover.dallePrompt);
        containers.discover.visualContent = { type: 'dalle', content: discoverImage };
        await this.rateLimitDelay();
      }

      // Practice questions (generate 2-3 images to save costs)
      for (let i = 0; i < subjectContent.practice.length; i++) {
        const practice = subjectContent.practice[i];
        const practiceContent: ContainerContent = {
          type: 'practice',
          content: {
            question: practice.question,
            answer: practice.answer
          }
        };

        // Only generate images for first 3 practice questions
        if (i < 3 && practice.dallePrompt) {
          const practiceImage = await this.generateDallEImage(practice.dallePrompt);
          practiceContent.visualContent = { type: 'dalle', content: practiceImage };
          await this.rateLimitDelay();
        } else {
          // Use emoji fallback for remaining questions
          practiceContent.visualContent = { type: 'emoji', content: '📊 📈 📉' };
        }

        containers.practice.push(practiceContent);
      }

      // Assessment image
      if (subjectContent.assessment.dallePrompt) {
        const assessmentImage = await this.generateDallEImage(subjectContent.assessment.dallePrompt);
        containers.assessment.visualContent = { type: 'dalle', content: assessmentImage };
      }

    } catch (error) {
      console.error(`Failed to generate DALL-E images for ${subject}:`, error);
      // Fall back to emoji on error
      return this.generateDefaultContent(subject, skill, career);
    }

    return containers;
  }

  private async generateDallEImage(prompt: string): Promise<string> {
    try {
      const imageUrl = await imageGenerationService.generateEducationalImage(
        prompt,
        'Grade 10',
        {
          size: '1024x1024',
          quality: 'standard',
          style: 'vivid'
        }
      );
      return await this.convertToBase64(imageUrl);
    } catch (error) {
      console.error('DALL-E generation failed:', error);
      throw error;
    }
  }

  private async rateLimitDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private generateDefaultContent(subject: string, skill: any, career: string): FullLessonContent['containers'] {
    // Fallback content structure with emojis
    return {
      learn: {
        type: 'learn',
        content: {
          title: `Learning ${skill.name}`,
          introduction: `Let's explore ${skill.name} as a ${career}`,
          mainContent: 'Content loading...',
          visualContent: { type: 'emoji', content: '📚 ✨ 🎯' }
        },
        duration: '15 minutes'
      },
      experience: {
        type: 'experience',
        content: {
          scenario: 'Practice scenario',
          challenge: 'Apply what you learned',
          visualContent: { type: 'emoji', content: '🎮 🎯 ✅' }
        },
        duration: '20 minutes'
      },
      discover: {
        type: 'discover',
        content: {
          exploration: 'Explore and create',
          prompt: 'Be creative!',
          visualContent: { type: 'emoji', content: '🎨 💡 🚀' }
        },
        duration: '25 minutes'
      },
      practice: Array(5).fill(null).map((_, i) => ({
        type: 'practice' as const,
        content: {
          question: `Practice question ${i + 1}`,
          answer: 'Answer',
          visualContent: { type: 'emoji' as const, content: '❓ 💭 ✅' }
        }
      })),
      assessment: {
        type: 'assessment',
        content: {
          title: 'Assessment',
          task: 'Show what you learned',
          visualContent: { type: 'emoji', content: '🎯 📊 🏆' }
        }
      }
    };
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
      return imageUrl;
    }
  }

  /**
   * Get or generate full lesson content for a demo user
   */
  async getFullLesson(userId: string, subject: string): Promise<FullLessonContent | null> {
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
      console.log(`📦 Using cached lesson for ${userId} - ${subject}`);
      return this.cache.get(cacheKey)!;
    }

    // Generate new content
    console.log(`🔄 Generating new lesson for ${userId} - ${subject}`);
    
    const careers = this.careerContexts[user.grade as keyof typeof this.careerContexts];
    const career = careers[Math.floor(Math.random() * careers.length)];

    let containers: FullLessonContent['containers'];
    
    // Generate content based on grade level
    switch (user.id) {
      case 'sam-k':
        containers = this.generateKindergartenContent(subject, skill, career);
        break;
      case 'alex-1':
        // Similar structure to Kindergarten with Grade 1 content
        containers = this.generateKindergartenContent(subject, skill, career);
        break;
      case 'jordan-7':
        // Similar structure with Grade 7 content
        containers = this.generateKindergartenContent(subject, skill, career);
        break;
      case 'taylor-10':
        containers = await this.generateGrade10Content(subject, skill, career);
        break;
      default:
        containers = this.generateDefaultContent(subject, skill, career);
    }

    const fullLesson: FullLessonContent = {
      userId,
      subject,
      skillCode: skill.code,
      skillName: skill.name,
      career,
      gradeLevel: user.gradeLevel,
      containers,
      generatedAt: new Date().toISOString()
    };

    // Cache the content
    this.cache.set(cacheKey, fullLesson);
    this.saveCache();

    return fullLesson;
  }

  /**
   * Pre-generate all content for demo users
   */
  async preGenerateAllContent(): Promise<void> {
    console.log('🚀 Pre-generating full lessons for all demo users...');
    
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
          await this.getFullLesson(user.id, subject);
          generated++;
          console.log(`✨ Generated: ${user.name} - ${subject}`);
          
          // Add longer delay for DALL-E generation
          if (user.useDallE) {
            await new Promise(resolve => setTimeout(resolve, 5000));
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
  getCacheStats(): { 
    total: number; 
    byUser: Record<string, number>; 
    bySubject: Record<string, number>;
    estimatedCost: number;
  } {
    const stats = {
      total: this.cache.size,
      byUser: {} as Record<string, number>,
      bySubject: {} as Record<string, number>,
      estimatedCost: 0
    };

    this.cache.forEach((value) => {
      stats.byUser[value.userId] = (stats.byUser[value.userId] || 0) + 1;
      stats.bySubject[value.subject] = (stats.bySubject[value.subject] || 0) + 1;
      
      // Estimate cost based on DALL-E usage
      if (value.gradeLevel >= 9) {
        // Approximately 6-8 DALL-E images per lesson
        stats.estimatedCost += 0.040 * 7; // $0.28 per lesson
      }
    });

    return stats;
  }
}

// Export singleton instance
export const demoContentCacheV2 = DemoContentCacheServiceV2.getInstance();