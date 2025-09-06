// ================================================================
// CONTAINER-SPECIFIC CONTENT GENERATORS
// Optimized generators for Learn, Experience, and Discover containers
// ================================================================

export interface LearnContent {
  metadata: {
    title: string;
    subject: string;
    gradeLevel: string;
    skill_number: string;
    duration: string;
    studentName: string;
  };
  instruction: {
    title: string;
    content: string;
    concept: string;
    examples: Array<{
      question: string;
      answer: string;
      explanation: string;
    }>;
    keyPoints: string[];
  };
  practice: {
    title: string;
    exercises: Array<{
      question: string;
      hint?: string;
      expectedAnswer: string;
      feedback: string;
    }>;
  };
  assessment: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    feedback: {
      correct: string;
      incorrect: string;
    };
  };
}

export interface ExperienceContent {
  metadata: {
    title: string;
    careerContext: string;
    gradeLevel: string;
    skill_number: string;
    duration: string;
    studentName: string;
  };
  instruction: {
    title: string;
    roleDescription: string;
    challenge: string;
    context: string;
  };
  practice: {
    title: string;
    scenarios: Array<{
      situation: string;
      task: string;
      expectedOutcome: string;
      feedback: string;
    }>;
  };
  assessment: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    feedback: {
      correct: string;
      incorrect: string;
    };
  };
}

export interface DiscoverContent {
  metadata: {
    title: string;
    storyTheme: string;
    gradeLevel: string;
    skill_number: string;
    duration: string;
    studentName: string;
  };
  instruction: {
    title: string;
    setting: string;
    characters: string[];
    plot: string;
    skillConnection: string;
  };
  practice: {
    title: string;
    storyEvents: Array<{
      event: string;
      choice: string;
      outcome: string;
      skillApplication: string;
    }>;
  };
  assessment: {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    storyConclusion: string;
    feedback: {
      correct: string;
      incorrect: string;
    };
  };
}

export class ContainerContentGenerator {
  private apiKey: string;
  private apiUrl: string;
  private learnCache: Map<string, LearnContent> = new Map();
  private experienceCache: Map<string, ExperienceContent> = new Map();
  private discoverCache: Map<string, DiscoverContent> = new Map();
  private isDemoMode: boolean = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey || '';
    
    // Check if we have valid API configuration
    const azureEndpoint = import.meta.env.VITE_AZURE_OPENAI_ENDPOINT;
    const azureDeployment = import.meta.env.VITE_AZURE_GPT4_DEPLOYMENT;
    
    if (azureEndpoint && azureDeployment && apiKey) {
      this.apiUrl = `${azureEndpoint}openai/deployments/${azureDeployment}/chat/completions?api-version=2024-02-01`;
    } else if (apiKey) {
      console.warn('Azure OpenAI config missing, falling back to regular OpenAI');
      this.apiUrl = 'https://api.openai.com/v1/chat/completions';
    } else {
      console.warn('No API key available, running in demo mode');
      this.isDemoMode = true;
      this.apiUrl = '';
    }

    // Load intelligent testbed data for demo users
    this.loadIntelligentTestbedData();
  }

  // Check if this is a demo user
  private isDemoUser(studentName: string): boolean {
    const demoUsers = ['Alex', 'Sam', 'Jordan', 'Taylor'];
    return demoUsers.some(name => 
      studentName.includes(name) || 
      studentName.toLowerCase().includes(name.toLowerCase())
    );
  }

  // Extract the core demo name (Alex, Sam, Jordan, Taylor)
  private extractDemoName(studentName: string): string {
    const demoUsers = ['Alex', 'Sam', 'Jordan', 'Taylor'];
    for (const name of demoUsers) {
      if (studentName.includes(name) || studentName.toLowerCase().includes(name.toLowerCase())) {
        return name;
      }
    }
    return studentName;
  }

  // Get cache key for container-specific content
  private getCacheKey(skill: any, studentName: string, gradeLevel: string, containerType: string): string {
    if (this.isDemoUser(studentName)) {
      const demoName = this.extractDemoName(studentName);
      return `${skill.skill_number}-${gradeLevel}-${skill.subject}-${demoName}-${containerType}`;
    }
    return `${skill.skill_number}-${gradeLevel}-${skill.subject}-${containerType}`;
  }

  // ================================================================
  // LEARN CONTAINER CONTENT GENERATION
  // ================================================================

  async generateLearnContent(
    skill: any,
    studentName: string,
    gradeLevel: string
  ): Promise<LearnContent> {
    const cacheKey = this.getCacheKey(skill, studentName, gradeLevel, 'learn');
    
    // Check cache first
    if (this.isDemoUser(studentName)) {
      const cached = this.learnCache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Demo user ${studentName}: Using cached LEARN content for ${skill.skill_number}`);
        return cached;
      }
    }

    const cached = this.learnCache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Using cached LEARN content for ${skill.skill_number}`);
      return cached;
    }

    // Generate new content
    console.log(`📚 Generating LEARN content for ${skill.skill_number}...`);
    const startTime = Date.now();

    if (this.isDemoMode || !this.apiKey) {
      console.log(`🔧 Using fallback demo content for ${skill.skill_number} (no API key)`);
      const content = this.getDemoLearnContent(skill, studentName, gradeLevel);
      this.learnCache.set(cacheKey, content);
      return content;
    }

    const content = await this.generateLearnContentInternal(skill, studentName, gradeLevel);
    this.learnCache.set(cacheKey, content);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ LEARN generation took ${duration}ms for ${skill.skill_number}`);
    
    return content;
  }

  private async generateLearnContentInternal(skill: any, studentName: string, gradeLevel: string): Promise<LearnContent> {
    // Get grade-specific content guidelines
    const guidelines = this.getGradeSpecificGuidelines(gradeLevel);
    
    const skillName = skill.skillName || skill.skill_name || skill.title || `${skill.subject} Fundamentals`;
    const subject = skill.subject || 'General';
    
    const prompt = `Generate complete 3-step learning content for teaching ${skillName} to a ${gradeLevel} student named ${studentName}.

Subject: ${subject}
Skill: ${skillName}
Grade: ${gradeLevel}
Student: ${studentName}

IMPORTANT GRADE-SPECIFIC GUIDELINES FOR ${gradeLevel.toUpperCase()}:
${guidelines}

Create a complete learning sequence with:
1. INSTRUCTION: Clear concept explanation with examples
2. PRACTICE: Interactive exercises to apply the concept  
3. ASSESSMENT: Multiple choice question to test understanding

Format as JSON:
{
  "instruction": {
    "title": "lesson title",
    "content": "Hi ${studentName}! introduction",
    "concept": "main concept explanation",
    "examples": [
      {
        "question": "example problem",
        "answer": "solution", 
        "explanation": "why this works"
      }
    ],
    "keyPoints": ["point 1", "point 2", "point 3"]
  },
  "practice": {
    "title": "Practice ${skill.skillName}",
    "exercises": [
      {
        "question": "practice problem",
        "hint": "helpful hint",
        "expectedAnswer": "correct approach",
        "feedback": "encouraging feedback"
      }
    ]
  },
  "assessment": {
    "question": "assessment question testing ${skill.skillName}",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": "option A",
    "explanation": "why this is correct",
    "feedback": {
      "correct": "Great job! You understand ${skill.skillName}",
      "incorrect": "Let's review the concept and try again"
    }
  }
}`;

    const response = await this.makeAPICall(prompt);
    
    return {
      metadata: {
        title: `Learning ${skill.skillName}`,
        subject: skill.subject,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '15 min',
        studentName: studentName
      },
      instruction: response.instruction,
      practice: response.practice,
      assessment: response.assessment
    };
  }

  // ================================================================
  // EXPERIENCE CONTAINER CONTENT GENERATION
  // ================================================================

  async generateExperienceContent(
    skill: any,
    studentName: string,
    gradeLevel: string,
    careerContext: string
  ): Promise<ExperienceContent> {
    const cacheKey = this.getCacheKey(skill, studentName, gradeLevel, 'experience');
    
    // Check cache first
    if (this.isDemoUser(studentName)) {
      const cached = this.experienceCache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Demo user ${studentName}: Using cached EXPERIENCE content for ${skill.skill_number}`);
        return cached;
      }
    }

    const cached = this.experienceCache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Using cached EXPERIENCE content for ${skill.skill_number}`);
      return cached;
    }

    // Generate new content
    console.log(`💼 Generating EXPERIENCE content for ${skill.skill_number}...`);
    const startTime = Date.now();

    if (this.isDemoMode || !this.apiKey) {
      const content = this.getDemoExperienceContent(skill, studentName, gradeLevel, careerContext);
      this.experienceCache.set(cacheKey, content);
      return content;
    }

    const content = await this.generateExperienceContentInternal(skill, studentName, gradeLevel, careerContext);
    this.experienceCache.set(cacheKey, content);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ EXPERIENCE generation took ${duration}ms for ${skill.skill_number}`);
    
    return content;
  }

  private async generateExperienceContentInternal(skill: any, studentName: string, gradeLevel: string, careerContext: string): Promise<ExperienceContent> {
    // Get grade-specific content guidelines
    const guidelines = this.getGradeSpecificGuidelines(gradeLevel);
    
    const prompt = `Create a career application scenario for ${skill.skillName} in the context of being a ${careerContext}.

Student: ${studentName} (Grade ${gradeLevel})
Skill: ${skill.skillName}
Career: ${careerContext}
Subject: ${skill.subject}

IMPORTANT GRADE-SPECIFIC GUIDELINES FOR ${gradeLevel.toUpperCase()}:
${guidelines}

Create a realistic scenario where ${studentName} works as a ${careerContext} and must use ${skill.skillName} to solve a problem.

Format as JSON:
{
  "scenario": {
    "title": "scenario title",
    "roleDescription": "You are working as a ${careerContext}...",
    "challenge": "real workplace challenge",
    "steps": [
      {
        "step": "step description",
        "action": "what to do",
        "result": "outcome"
      }
    ],
    "assessment": {
      "question": "application question",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "why this is correct"
    }
  }
}`;

    const response = await this.makeAPICall(prompt);
    
    return {
      metadata: {
        title: `${careerContext} Challenge`,
        careerContext: careerContext,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '20 min',
        studentName: studentName
      },
      instruction: {
        title: response.scenario?.title || `${careerContext} Challenge`,
        roleDescription: response.scenario?.roleDescription || `You are working as a ${careerContext}.`,
        challenge: response.scenario?.challenge || `Apply your ${skill.skillName} skills.`,
        context: 'professional workplace'
      },
      practice: {
        title: 'Apply Your Skills',
        scenarios: response.scenario?.steps?.map((step: any) => ({
          situation: step.step || step.action,
          task: `Apply ${skill.skillName} in this context`,
          expectedOutcome: step.result || 'Successful completion',
          feedback: 'Great application of your skills!'
        })) || []
      },
      assessment: response.scenario?.assessment || {
        question: `How would you best apply ${skill.skillName} as a ${careerContext}?`,
        options: ['Apply systematic problem-solving', 'Skip the analysis', 'Guess the solution', 'Ask someone else'],
        correctAnswer: 'Apply systematic problem-solving',
        explanation: `Professional ${careerContext} work requires systematic approaches.`
      }
    };
  }

  // ================================================================
  // DISCOVER CONTAINER CONTENT GENERATION
  // ================================================================

  async generateDiscoverContent(
    skill: any,
    studentName: string,
    gradeLevel: string,
    careerContext: string
  ): Promise<DiscoverContent> {
    const cacheKey = this.getCacheKey(skill, studentName, gradeLevel, 'discover');
    
    // Check cache first
    if (this.isDemoUser(studentName)) {
      const cached = this.discoverCache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Demo user ${studentName}: Using cached DISCOVER content for ${skill.skill_number}`);
        return cached;
      }
    }

    const cached = this.discoverCache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Using cached DISCOVER content for ${skill.skill_number}`);
      return cached;
    }

    // Generate new content
    console.log(`📖 Generating DISCOVER content for ${skill.skill_number}...`);
    const startTime = Date.now();

    if (this.isDemoMode || !this.apiKey) {
      const content = this.getDemoDiscoverContent(skill, studentName, gradeLevel, careerContext);
      this.discoverCache.set(cacheKey, content);
      return content;
    }

    const content = await this.generateDiscoverContentInternal(skill, studentName, gradeLevel, careerContext);
    this.discoverCache.set(cacheKey, content);
    
    const duration = Date.now() - startTime;
    console.log(`⏱️ DISCOVER generation took ${duration}ms for ${skill.skill_number}`);
    
    return content;
  }

  private async generateDiscoverContentInternal(skill: any, studentName: string, gradeLevel: string, careerContext: string): Promise<DiscoverContent> {
    // Get grade-specific content guidelines
    const guidelines = this.getGradeSpecificGuidelines(gradeLevel);
    
    const prompt = `Create an engaging story that reinforces ${skill.skillName} learning through narrative.

Student: ${studentName} (Grade ${gradeLevel})
Skill: ${skill.skillName}
Career Theme: ${careerContext}
Subject: ${skill.subject}

IMPORTANT GRADE-SPECIFIC GUIDELINES FOR ${gradeLevel.toUpperCase()}:
${guidelines}

Create a story where ${studentName} goes on an adventure and must use ${skill.skillName} to help characters and solve problems.

Format as JSON:
{
  "story": {
    "title": "story title",
    "setting": "where story takes place",
    "characters": ["character1", "character2"],
    "plot": "story narrative",
    "challenge": {
      "question": "story problem to solve",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "solution explanation",
      "storyConclusion": "how story ends"
    }
  }
}`;

    const response = await this.makeAPICall(prompt);
    
    return {
      metadata: {
        title: response.story?.title || `${studentName}'s Adventure`,
        storyTheme: careerContext,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '25 min',
        studentName: studentName
      },
      instruction: {
        title: response.story?.title || `${studentName}'s Adventure`,
        setting: response.story?.setting || `A magical world where ${skill.skillName} knowledge helps save the day`,
        characters: response.story?.characters || [studentName, 'Wise Guide', 'Helpful Friend'],
        plot: response.story?.plot || `${studentName} discovers a world where ${skill.skillName} skills are needed to help others.`,
        skillConnection: `This story helps us practice ${skill.skillName}`
      },
      practice: {
        title: 'Story Adventure',
        storyEvents: [{
          event: `In the story, you encounter a situation requiring ${skill.skillName}`,
          choice: 'How would you help the characters solve this problem?',
          outcome: 'Your knowledge saves the day!',
          skillApplication: `You successfully used ${skill.skillName} to help everyone!`
        }]
      },
      assessment: response.story?.challenge || {
        question: `In the story, how did ${studentName} use ${skill.skillName} to help others?`,
        options: ['By applying what they learned', 'By avoiding the challenge', 'By asking others for answers', 'By giving up quickly'],
        correctAnswer: 'By applying what they learned',
        explanation: `Using our knowledge to help others makes learning meaningful!`,
        storyConclusion: `Thanks to ${studentName}'s ${skill.skillName} skills, the quest was successful and everyone was helped!`
      }
    };
  }

  // ================================================================
  // API CALL HELPER
  // ================================================================

  private async makeAPICall(prompt: string): Promise<any> {
    const headers = this.apiUrl.includes('azure') 
      ? { 'Content-Type': 'application/json', 'api-key': this.apiKey }
      : { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` };

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: this.apiUrl.includes('azure') ? undefined : 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log('🔍 Raw API response content (first 500 chars):', content.substring(0, 500));
    
    // Clean and parse JSON response with enhanced error handling
    let cleanContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Remove any text before the first {
    const firstBrace = cleanContent.indexOf('{');
    if (firstBrace > 0) {
      cleanContent = cleanContent.substring(firstBrace);
    }
    
    // Remove any text after the last }
    const lastBrace = cleanContent.lastIndexOf('}');
    if (lastBrace > 0 && lastBrace < cleanContent.length - 1) {
      cleanContent = cleanContent.substring(0, lastBrace + 1);
    }
    
    console.log('🧹 Cleaned content (first 500 chars):', cleanContent.substring(0, 500));
    
    try {
      return JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('❌ JSON Parse Error:', parseError);
      console.error('📄 Content that failed to parse:', cleanContent);
      throw new Error(`Failed to parse API response as JSON: ${parseError.message}`);
    }
  }

  // ================================================================
  // GRADE-SPECIFIC CONTENT GUIDELINES
  // ================================================================

  private getGradeSpecificGuidelines(gradeLevel: string): string {
    const grade = gradeLevel.toLowerCase();
    
    if (grade.includes('pre-k') || grade.includes('prek')) {
      return `
PRE-K (Ages 3-4) GUIDELINES:
- Use ONLY 1-2 syllable words (big, fun, red, cat, play)
- Maximum 3 words per sentence
- No abstract concepts - use only concrete, touchable things
- Duration: 3-5 minutes maximum
- Use lots of "Look!" "See!" "Touch!" 
- Include colors, shapes, animals, toys
- No reading required - audio/visual only
- Single-step instructions only
- Use repetition and rhymes`;
    }
    
    if (grade.includes('kindergarten') || grade === 'k') {
      return `
KINDERGARTEN (Ages 4-5) ULTRA-SIMPLE GUIDELINES:
- Use ONLY 1 syllable words (go, see, big, cat, car, fun)
- Maximum 2-3 words per sentence (preferably 2)
- Use concrete objects only: toy, cat, car, ball, cup
- Duration: 3-5 minutes maximum (attention span limit)
- NEVER use: "together," "explanation," "instruction," "question"
- ONLY use: "go," "see," "look," "find," "good," "yes," "no"
- Include movement with 1-word commands: "Point!" "Touch!" "Clap!"
- Examples about immediate surroundings: pets, toys, food you eat
- Assessment with BIG emojis only, minimal text
- Single-word directions only: "Count!" "Find!" "Pick!"
- Simple praise: "Good!" "Yes!" "Yay!"
- CRITICAL: Never reference missing images
- ALWAYS use emojis: 🚗 for cars, 🐱 for cats, 🏀 for balls
- For counting: show emojis in a row: 🚗 🚗 🚗
- For letters: use emoji letters 🅰️ 🅱️ 🆂 
- For numbers: use emoji numbers 1️⃣ 2️⃣ 3️⃣
- Make everything visual, minimal reading required
- Repeat same words multiple times for familiarity
- Use exclamation points for excitement: "Good!" "Fun!" "Yes!"`;
    }
    
    if (grade.includes('1st') || grade.includes('first') || grade === '1') {
      return `
1ST GRADE (Ages 5-6) GUIDELINES:
- Use mostly 1-2 syllable words, some 3-syllable if familiar
- Maximum 6-8 words per sentence
- Can introduce simple abstract ideas with concrete examples
- Duration: 8-12 minutes maximum
- Can use: "learn," "practice," "remember," "try"
- Include hands-on activities and movement
- Examples from school, home, playground experiences
- Can handle 2-step instructions
- Reading support still needed`;
    }
    
    if (grade.includes('7th') || grade.includes('seventh') || grade === '7') {
      return `
7TH GRADE (Ages 12-13) GUIDELINES:
- Can handle complex vocabulary and abstract concepts
- Sentences can be 12-15 words
- Duration: 15-20 minutes
- Use academic language appropriately
- Include real-world applications and career connections
- Can handle multi-step problems and reasoning
- Encourage critical thinking and analysis
- Connect to current interests and technology`;
    }
    
    if (grade.includes('10th') || grade.includes('tenth') || grade === '10') {
      return `
10TH GRADE (Ages 15-16) GUIDELINES:
- Full vocabulary and complex sentence structures
- Duration: 20-25 minutes
- Use sophisticated academic language
- Include college and career preparation
- Encourage independent thinking and problem-solving
- Connect to real-world issues and current events
- Prepare for standardized tests and assessments
- Include research and analysis opportunities`;
    }
    
    // Default guidelines for other grades
    return `
GENERAL GUIDELINES:
- Adjust vocabulary and complexity for grade level
- Use age-appropriate examples and contexts
- Include hands-on activities when possible
- Provide clear, step-by-step instructions
- Offer encouragement and positive feedback`;
  }

  // ================================================================
  // DEMO CONTENT (FALLBACKS)
  // ================================================================

  private getDemoLearnContent(skill: any, studentName: string, gradeLevel: string): LearnContent {
    const grade = gradeLevel.toLowerCase();
    
    // Kindergarten-specific content
    if (grade.includes('kindergarten') || grade === 'k') {
      return this.getKindergartenDemoContent(skill, studentName);
    }
    
    // 1st Grade content
    if (grade.includes('1st') || grade.includes('first') || grade === '1') {
      return this.getFirstGradeDemoContent(skill, studentName);
    }
    
    // 7th Grade content  
    if (grade.includes('7th') || grade.includes('seventh') || grade === '7') {
      return this.getSeventhGradeDemoContent(skill, studentName);
    }
    
    // 10th Grade content
    if (grade.includes('10th') || grade.includes('tenth') || grade === '10') {
      return this.getTenthGradeDemoContent(skill, studentName);
    }
    
    // Default fallback (current generic content)
    return {
      metadata: {
        title: `Learning ${skill.skillName}`,
        subject: skill.subject,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '15 min',
        studentName: studentName
      },
      instruction: {
        title: `Let's Learn ${skill.skillName}!`,
        content: `Hi ${studentName}! Today we're going to learn about ${skill.skillName}. This is going to be fun and helpful!`,
        concept: `${skill.skillName} is an important skill that helps us understand ${skill.subject} better.`,
        examples: [
          {
            question: `Here's how we use ${skill.skillName} in everyday life`,
            answer: 'We can apply this concept step by step',
            explanation: 'This helps us solve problems more easily'
          }
        ],
        keyPoints: [
          'Remember the main concept',
          'Practice regularly to improve',
          'Ask questions when you need help'
        ]
      },
      practice: {
        title: `Practice ${skill.skillName}`,
        exercises: [
          {
            question: `Let's practice what we learned about ${skill.skillName}`,
            hint: 'Remember the examples we just saw',
            expectedAnswer: 'Apply the concept step by step',
            feedback: 'Great work! You\'re getting the hang of this!'
          }
        ]
      },
      assessment: {
        question: `Which best describes how to apply ${skill.skillName}?`,
        options: [
          'Apply the concept step by step',
          'Skip the thinking and guess',
          'Only use it sometimes',
          'Ignore the examples'
        ],
        correctAnswer: 'Apply the concept step by step',
        explanation: `That's right! ${skill.skillName} works best when we apply it systematically.`,
        feedback: {
          correct: `Excellent work, ${studentName}! You really understand ${skill.skillName}!`,
          incorrect: `Good try, ${studentName}! Let's review the concept and practice more.`
        }
      }
    };
  }

  // ================================================================
  // GRADE-SPECIFIC DEMO CONTENT
  // ================================================================
  
  private getKindergartenDemoContent(skill: any, studentName: string): LearnContent {
    // Simplify skill name for 4-5 year olds
    const simpleSkillName = this.simplifySkillNameForKindergarten(skill.skillName);
    
    // Get skill-specific content with emojis
    const skillContent = this.getKindergartenSkillContent(skill, studentName, simpleSkillName);
    
    return {
      metadata: {
        title: `Let's ${simpleSkillName}!`,
        subject: skill.subject,
        gradeLevel: 'Kindergarten',
        skill_number: skill.skill_number,
        duration: '5 min',
        studentName: studentName
      },
      instruction: skillContent.instruction,
      practice: skillContent.practice,
      assessment: skillContent.assessment || {
        question: `Which one shows ${simpleSkillName}?`,
        options: [
          '🔵 This one!',
          '❌ Not this',
          '❌ Not this', 
          '❌ Not this'
        ],
        correctAnswer: '🔵 This one!',
        explanation: `Yes! That's ${simpleSkillName}!`,
        feedback: {
          correct: `You did it, ${studentName}! You're amazing!`,
          incorrect: `Good try, ${studentName}! Let's look again!`
        }
      }
    };
  }

  private simplifySkillNameForKindergarten(skillName: string): string {
    // Convert complex skill names to simple kindergarten-friendly language
    const simplifications: { [key: string]: string } = {
      'Count to 10': 'count',
      'Count to 3': 'count to 3',
      'Numbers to 3': 'find numbers',
      'Identify numbers': 'find numbers',
      'Choose the number': 'pick the number',
      'Learn to count': 'count',
      'States of Matter': 'see what things are like',
      'Reading Instructions': 'look at words',
      'Letter Recognition': 'find letters',
      'Phonics': 'say sounds',
      'Sight Words': 'know words'
    };
    
    return simplifications[skillName] || skillName.toLowerCase();
  }

  private getKindergartenSkillContent(skill: any, studentName: string, simpleSkillName: string): any {
    // Counting skills
    if (skill.skillName.toLowerCase().includes('count') || skill.skillCode.includes('CC')) {
      return {
        instruction: {
          title: `Hi ${studentName}!`,
          content: `Hi ${studentName}! Let's count!`,
          concept: `Count is fun!`,
          examples: [
            {
              question: `See cars! 🚗 🚗 🚗`,
              answer: 'Three cars!',
              explanation: 'Good!'
            },
            {
              question: `See cats! 🐱 🐱`,
              answer: 'Two cats!',
              explanation: 'Yes!'
            }
          ],
          keyPoints: [
            'Point!',
            'Count!',
            'Good!'
          ]
        },
        practice: {
          title: `Count!`,
          exercises: [
            {
              question: `Count cars! 🚗 🚗 🚗`,
              hint: 'Point!',
              expectedAnswer: '3',
              feedback: 'Good!'
            },
            {
              question: `Count balls! ⚽ ⚽`,
              hint: 'Point!',
              expectedAnswer: '2',
              feedback: 'Yes!'
            }
          ]
        },
        assessment: {
          question: `How many? 🍎 🍎 🍎`,
          options: [
            '1',
            '2', 
            '3',
            '4'
          ],
          correctAnswer: '3',
          explanation: `Yes! Three!`,
          feedback: {
            correct: `Good, ${studentName}!`,
            incorrect: `Try again, ${studentName}!`
          }
        }
      };
    }

    // Number recognition skills
    if (skill.skillName.toLowerCase().includes('number') || skill.skillName.toLowerCase().includes('identify')) {
      return {
        instruction: {
          title: `Hi ${studentName}!`,
          content: `Hi ${studentName}! Find numbers!`,
          concept: `Find numbers!`,
          examples: [
            {
              question: `Find 2! 1️⃣ 2️⃣ 3️⃣`,
              answer: 'Found 2️⃣!',
              explanation: 'Good!'
            },
            {
              question: `Find 1! 2️⃣ 1️⃣ 3️⃣`,
              answer: 'Found 1️⃣!',
              explanation: 'Yes!'
            }
          ],
          keyPoints: [
            'Look!',
            'Point!',
            'Good!'
          ]
        },
        practice: {
          title: `Find Numbers!`,
          exercises: [
            {
              question: `Find the number 3: 1️⃣ 2️⃣ 3️⃣ 4️⃣\nPoint to the 3!`,
              hint: 'Look for the number that comes after 2!',
              expectedAnswer: '3️⃣',
              feedback: 'Awesome! You found 3!'
            },
            {
              question: `Which number is 1? 🔵 1️⃣ 🔴 2️⃣\nPick the 1!`,
              hint: 'Find the first number!',
              expectedAnswer: '1️⃣',
              feedback: 'Perfect! You picked 1!'
            }
          ]
        },
        assessment: {
          question: `Which number is 2?`,
          options: [
            '1️⃣',
            '2️⃣',
            '3️⃣',
            '4️⃣'
          ],
          correctAnswer: '2️⃣',
          explanation: `Yes! 2️⃣ is the number 2!`,
          feedback: {
            correct: `Wonderful, ${studentName}! You found 2!`,
            incorrect: `Let's look again, ${studentName}! Find the 2️⃣`
          }
        }
      };
    }

    // Science or movement-based skills (like States of Matter)
    if (skill.skillName.toLowerCase().includes('matter') || skill.skillCode.includes('PS')) {
      return {
        instruction: {
          title: `Hi ${studentName}! Let's Move and Learn!`,
          content: `Hi ${studentName}! Let's learn with our bodies!`,
          concept: `We can move and learn!`,
          examples: [
            {
              question: `When water freezes, it gets hard! Touch something hard!`,
              answer: 'Touch the table!',
              explanation: 'Ice is hard like that!'
            },
            {
              question: `When water flows, it moves! Wave your hands!`,
              answer: 'Wave like water!',
              explanation: 'Water moves like that!'
            }
          ],
          keyPoints: [
            'Move your body',
            'Feel things',
            'Have fun learning'
          ]
        },
        practice: {
          title: `Move and Learn!`,
          exercises: [
            {
              question: `Show me solid! Stand like a statue! 🗿`,
              hint: 'Stand very still!',
              expectedAnswer: 'Stand still',
              feedback: 'Great! You are solid like ice!'
            },
            {
              question: `Show me liquid! Move like water! 💧`,
              hint: 'Flow with your arms!',
              expectedAnswer: 'Move flowing',
              feedback: 'Wonderful! You flow like water!'
            }
          ]
        },
        assessment: {
          question: `What should ${studentName} do when Finn says "Clap your hands"?`,
          options: [
            'Clap your hands 👏',
            'Touch the cat 🐱',
            'Look at the car 🚗',
            'Eat the cookie 🍪'
          ],
          correctAnswer: 'Clap your hands 👏',
          explanation: `Yes! When Finn says "Clap your hands", you clap! 👏`,
          feedback: {
            correct: `Perfect, ${studentName}! You're a great listener!`,
            incorrect: `Let's listen again, ${studentName}! When Finn says "Clap", we clap our hands!`
          }
        }
      };
    }

    // Letter recognition skills
    if (skill.skillName.toLowerCase().includes('letter') || skill.skillCode.includes('RL')) {
      return {
        instruction: {
          title: `Hi ${studentName}! Let's Find Letters!`,
          content: `Hi ${studentName}! Let's look for letters!`,
          concept: `Letters make words!`,
          examples: [
            {
              question: `Find the letter A: 🅰️ 🅱️ 🆎`,
              answer: 'I found 🅰️!',
              explanation: 'Great! That\'s A!'
            },
            {
              question: `Look for B: 🅰️ 🅱️ ℹ️`,
              answer: 'I found 🅱️!',
              explanation: 'Yes! That\'s B!'
            }
          ],
          keyPoints: [
            'Look at letters',
            'Point to them',
            'Say the letter name'
          ]
        },
        practice: {
          title: `Letter Hunt!`,
          exercises: [
            {
              question: `Find the letter A: 🅱️ 🅰️ 🆎\nPoint to A!`,
              hint: 'A comes first in the alphabet!',
              expectedAnswer: '🅰️',
              feedback: 'Great! You found A!'
            },
            {
              question: `Which is the letter S? 🅰️ 🅱️ 🆂\nFind S!`,
              hint: 'S looks curvy!',
              expectedAnswer: '🆂',
              feedback: 'Perfect! You found S!'
            }
          ]
        },
        assessment: {
          question: `Which letter is A?`,
          options: [
            '🅰️',
            '🅱️',
            '🆂',
            'ℹ️'
          ],
          correctAnswer: '🅰️',
          explanation: `Yes! 🅰️ is the letter A!`,
          feedback: {
            correct: `Excellent, ${studentName}! You know your letters!`,
            incorrect: `Let's try again, ${studentName}! A is the first letter!`
          }
        }
      };
    }

    // Default fallback for other skills
    return {
      instruction: {
        title: `Hi ${studentName}! Let's Play!`,
        content: `Hi ${studentName}! Let's ${simpleSkillName} today!`,
        concept: `We can ${simpleSkillName}. It's fun!`,
        examples: [
          {
            question: `Look! Here we ${simpleSkillName}.`,
            answer: 'See how we do it!',
            explanation: 'You can do it too!'
          },
          {
            question: `Now you try to ${simpleSkillName}!`,
            answer: 'Point and say it!',
            explanation: 'Great job!'
          }
        ],
        keyPoints: [
          'Look and see',
          'Point and say',
          'You can do it!'
        ]
      },
      practice: {
        title: `Let's Try!`,
        exercises: [
          {
            question: `Can you ${simpleSkillName} here? 🎯`,
            hint: 'Look for it!',
            expectedAnswer: 'Point to it',
            feedback: 'You did it! Great!'
          },
          {
            question: `Find more! ${simpleSkillName} again! 🔍`,
            hint: 'Look around!',
            expectedAnswer: 'Point and say',
            feedback: 'Awesome! You rock!'
          }
        ]
      }
    };
  }

  private getFirstGradeDemoContent(skill: any, studentName: string): LearnContent {
    // TODO: Implement 1st grade specific content
    return this.getKindergartenDemoContent(skill, studentName); // Temporary fallback
  }

  private getSeventhGradeDemoContent(skill: any, studentName: string): LearnContent {
    // TODO: Implement 7th grade specific content  
    return this.getKindergartenDemoContent(skill, studentName); // Temporary fallback
  }

  private getTenthGradeDemoContent(skill: any, studentName: string): LearnContent {
    // TODO: Implement 10th grade specific content
    return this.getKindergartenDemoContent(skill, studentName); // Temporary fallback
  }

  private getKindergartenExperienceContent(skill: any, studentName: string, careerContext: string): ExperienceContent {
    // Convert career context to kindergarten-friendly
    const simpleCareer = this.simplifyCareerForKindergarten(careerContext);
    const simpleSkillName = this.simplifySkillNameForKindergarten(skill.skillName);
    
    return {
      metadata: {
        title: `Help ${simpleCareer}!`,
        careerContext: simpleCareer,
        gradeLevel: 'Kindergarten',
        skill_number: skill.skill_number,
        duration: '5 min',
        studentName: studentName
      },
      scenario: {
        title: `Be a ${simpleCareer} Helper!`,
        roleDescription: `${studentName}, you help ${simpleCareer}! You can ${simpleSkillName}!`,
        challenge: `${simpleCareer} needs help to ${simpleSkillName}!`,
        steps: [
          {
            step: 'Look and see',
            action: `Help ${simpleCareer} ${simpleSkillName}`,
            result: 'You help!'
          },
          {
            step: 'Try it',
            action: `Show how to ${simpleSkillName}`,
            result: 'You did it!'
          }
        ],
        assessment: {
          question: `How do you help ${simpleCareer}?`,
          options: [
            `I ${simpleSkillName}! 🙂`,
            'I run away 😢',
            'I do nothing 😐', 
            'I say no 😞'
          ],
          correctAnswer: `I ${simpleSkillName}! 🙂`,
          explanation: `Yes! You help by ${simpleSkillName}!`
        }
      }
    };
  }

  private simplifyCareerForKindergarten(careerContext: string): string {
    const simplifications: { [key: string]: string } = {
      'chef': 'the cook',
      'librarian': 'the book helper',
      'park-ranger': 'the park helper',
      'park ranger': 'the park helper',
      'engineer': 'the builder',
      'scientist': 'the science helper',
      'doctor': 'the doctor',
      'teacher': 'the teacher'
    };
    
    return simplifications[careerContext.toLowerCase()] || 'the helper';
  }

  private getDemoExperienceContent(skill: any, studentName: string, gradeLevel: string, careerContext: string): ExperienceContent {
    const grade = gradeLevel.toLowerCase();
    
    // Kindergarten-specific Experience content
    if (grade.includes('kindergarten') || grade === 'k') {
      return this.getKindergartenExperienceContent(skill, studentName, careerContext);
    }
    
    // Default Experience content for other grades
    return {
      metadata: {
        title: `${careerContext} Challenge`,
        careerContext: careerContext,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '20 min',
        studentName: studentName
      },
      scenario: {
        title: `Working as a ${careerContext}`,
        roleDescription: `You are working as a ${careerContext} and need to use your ${skill.skillName} skills!`,
        challenge: `A situation has come up where you need to apply ${skill.skillName} to help solve a real workplace problem.`,
        steps: [
          {
            step: 'Identify the problem',
            action: `Use ${skill.skillName} to analyze the situation`,
            result: 'You understand what needs to be done'
          },
          {
            step: 'Apply your knowledge',
            action: `Put your ${skill.skillName} skills into practice`,
            result: 'You make progress toward the solution'
          },
          {
            step: 'Complete the task',
            action: 'Finish applying your skills',
            result: 'Success! You solved the workplace challenge'
          }
        ],
        assessment: {
          question: `Which step is most important when using ${skill.skillName} as a ${careerContext}?`,
          options: [
            'Understanding the problem first',
            'Skipping to the solution',
            'Asking someone else to do it',
            'Guessing the answer'
          ],
          correctAnswer: 'Understanding the problem first',
          explanation: 'Taking time to understand the problem helps us apply our skills more effectively!'
        }
      }
    };
  }

  private getDemoDiscoverContent(skill: any, studentName: string, gradeLevel: string, careerContext: string): DiscoverContent {
    const grade = gradeLevel.toLowerCase();
    
    // Kindergarten-specific Discover content
    if (grade.includes('kindergarten') || grade === 'k') {
      return this.getKindergartenDiscoverContent(skill, studentName, careerContext);
    }
    
    // Default Discover content for other grades
    return {
      metadata: {
        title: `${studentName}'s Adventure`,
        storyTheme: careerContext,
        gradeLevel: gradeLevel,
        skill_number: skill.skill_number,
        duration: '25 min',
        studentName: studentName
      },
      story: {
        title: `${studentName} and the ${careerContext} Adventure`,
        setting: `A magical land where ${skill.skillName} skills are needed to help others`,
        characters: [studentName, `Wise ${careerContext}`, 'Helpful Friend'],
        plot: `${studentName} discovers a place where people need help with ${skill.skillName}. Working alongside a wise ${careerContext}, ${studentName} must use their learning to save the day and help everyone succeed.`,
        challenge: {
          question: `In the story, how did ${studentName} use ${skill.skillName} to help others?`,
          options: [
            'By applying what they learned in school',
            'By asking others to solve it',
            'By avoiding the problem',
            'By giving up quickly'
          ],
          correctAnswer: 'By applying what they learned in school',
          explanation: 'Using our knowledge to help others is one of the best ways to strengthen our learning!',
          storyConclusion: `Thanks to ${studentName}'s knowledge of ${skill.skillName}, everyone was helped and the adventure ended happily. ${studentName} felt proud of using their learning to make a difference!`
        }
      }
    };
  }

  private getKindergartenDiscoverContent(skill: any, studentName: string, careerContext: string): DiscoverContent {
    const simpleCareer = this.simplifyCareerForKindergarten(careerContext);
    const simpleSkillName = this.simplifySkillNameForKindergarten(skill.skillName);
    
    return {
      metadata: {
        title: `${studentName}'s Fun Story!`,
        storyTheme: simpleCareer,
        gradeLevel: 'Kindergarten',
        skill_number: skill.skill_number,
        duration: '5 min',
        studentName: studentName
      },
      story: {
        title: `${studentName} Helps ${simpleCareer}!`,
        setting: `A fun place with ${simpleCareer}`,
        characters: [studentName, simpleCareer, 'a friendly cat'],
        plot: `${studentName} meets ${simpleCareer}. ${simpleCareer} needs help! ${studentName} can ${simpleSkillName} to help!`,
        challenge: {
          question: `How does ${studentName} help?`,
          options: [
            `${studentName} can ${simpleSkillName}! 😊`,
            'Run away fast 😰',
            'Do nothing 😐',
            'Say bye bye 👋'
          ],
          correctAnswer: `${studentName} can ${simpleSkillName}! 😊`,
          explanation: `Yes! ${studentName} helps by ${simpleSkillName}!`,
          storyConclusion: `${studentName} helped ${simpleCareer}! Everyone is happy! ${studentName} is a great helper! The end! 🎉`
        }
      }
    };
  }

  // ================================================================
  // INTELLIGENT TESTBED DATA LOADING
  // ================================================================

  private async loadIntelligentTestbedData(): Promise<void> {
    try {
      console.log('📚 Loading intelligent testbed data for container-specific content...');
      
      const response = await fetch('/generated-testbed-samples/intelligent-testbed-samples.json');
      if (!response.ok) {
        console.warn('Intelligent testbed data not found, demo users will use fallback content');
        return;
      }
      
      const testbedData = await response.json();
      console.log(`📦 Loaded ${testbedData.length} intelligent testbed items for containers`);
      
      // Process testbed data for each container type
      this.processTestbedForContainers(testbedData);
      
      console.log(`✅ Container-specific testbed data loaded!`);
      console.log(`Learn cache: ${this.learnCache.size}, Experience cache: ${this.experienceCache.size}, Discover cache: ${this.discoverCache.size}`);
      
    } catch (error) {
      console.error('Failed to load intelligent testbed data:', error);
      console.warn('Demo users will fall back to generated content');
    }
  }

  private processTestbedForContainers(testbedData: any[]): void {
    // Group testbed data by grade and subject
    const testbedByGrade: { [key: string]: any[] } = {};
    testbedData.forEach((item: any) => {
      const key = `${item.grade}-${item.subject}`;
      if (!testbedByGrade[key]) testbedByGrade[key] = [];
      testbedByGrade[key].push(item);
    });
    
    // Create content for each demo user and container
    const demoUsers = [
      { name: 'Alex', grade: 'K' },
      { name: 'Sam', grade: '3' },
      { name: 'Jordan', grade: '7' },
      { name: 'Taylor', grade: '10' }
    ];
    
    for (const user of demoUsers) {
      const mathKey = `${user.grade}-Mathematics`;
      const elaKey = `${user.grade}-English Language Arts`;
      const scienceKey = `${user.grade}-Science`;
      
      // Process each subject for each container type
      [mathKey, elaKey, scienceKey].forEach(subjectKey => {
        if (testbedByGrade[subjectKey]) {
          this.processTestbedForUserAndContainers(testbedByGrade[subjectKey], user.name, user.grade);
        }
      });
    }
  }

  private processTestbedForUserAndContainers(testbedItems: any[], userName: string, grade: string): void {
    const instruction = testbedItems.find(item => item.contentType === 'instruction');
    const practice = testbedItems.find(item => item.contentType === 'practice');
    const assessment = testbedItems.find(item => item.contentType === 'assessment');
    
    if (instruction && practice && assessment) {
      // Get common skill codes for this grade
      const subject = instruction.subject === 'Mathematics' ? 'Math' : 
                     instruction.subject === 'English Language Arts' ? 'ELA' : 
                     instruction.subject;
                     
      const commonSkills = this.getCommonSkillCodesForGrade(grade, subject);
      
      for (const skillCode of commonSkills) {
        // Create LEARN content
        const learnContent = this.convertTestbedToLearnContent(instruction, userName, grade, subject, skillCode);
        const learnKey = this.getCacheKey({ skill_number: skillCode, subject }, userName, grade, 'learn');
        this.learnCache.set(learnKey, learnContent);
        
        // Create EXPERIENCE content
        const experienceContent = this.convertTestbedToExperienceContent(practice, userName, grade, subject, skillCode);
        const experienceKey = this.getCacheKey({ skill_number: skillCode, subject }, userName, grade, 'experience');
        this.experienceCache.set(experienceKey, experienceContent);
        
        // Create DISCOVER content
        const discoverContent = this.convertTestbedToDiscoverContent(assessment, userName, grade, subject, skillCode);
        const discoverKey = this.getCacheKey({ skill_number: skillCode, subject }, userName, grade, 'discover');
        this.discoverCache.set(discoverKey, discoverContent);
        
        console.log(`📝 Cached container content for ${userName} (${grade}): ${skillCode}`);
      }
    }
  }

  private getCommonSkillCodesForGrade(grade: string, subject: string): string[] {
    const skillMap: { [key: string]: { [subject: string]: string[] } } = {
      'K': {
        'Math': ['K.CC.A.1', 'K.CC.A.2', 'K.CC.B.4'],
        'Science': ['K.PS.1', 'K.LS.1'],
        'ELA': ['K.RL.1', 'K.RF.1']
      },
      '3': {
        'Math': ['3.NF.A.1', '3.NF.A.2', '3.OA.A.1'],
        'Science': ['3.PS.1', '3.LS.1'],
        'ELA': ['3.RL.1', '3.RF.3']
      },
      '7': {
        'Math': ['7.RP.A.1', '7.EE.A.1', '7.G.A.1'],
        'Science': ['7.PS.1', '7.LS.1'],
        'ELA': ['7.RL.1', '7.SL.1']
      },
      '10': {
        'Math': ['A-APR.A.1', 'A-SSE.A.1', 'G-CO.A.1'],
        'Science': ['HS-PS1-1', 'HS-LS1-1'],
        'ELA': ['RL.9-10.1', 'W.9-10.1']
      }
    };
    
    return skillMap[grade]?.[subject] || [`${grade}.GENERIC.1`];
  }

  private convertTestbedToLearnContent(instruction: any, studentName: string, grade: string, subject: string, skillCode: string): LearnContent {
    return {
      metadata: {
        title: instruction.title || `Learning ${subject}`,
        subject: subject,
        gradeLevel: grade,
        skill_number: skillCode,
        duration: instruction.estimated_time || '15 min',
        studentName: studentName
      },
      instruction: {
        title: instruction.title,
        content: `Hi ${studentName}! ${instruction.content}`,
        concept: instruction.content.split('.')[0] + '.',
        examples: instruction.activities?.slice(0, 2).map((activity: string, index: number) => ({
          question: `Example ${index + 1}: ${activity}`,
          answer: "Let's work through this step by step",
          explanation: `This helps us understand ${subject} concepts better.`
        })) || [],
        keyPoints: instruction.learning_objectives || []
      }
    };
  }

  private convertTestbedToExperienceContent(practice: any, studentName: string, grade: string, subject: string, skillCode: string): ExperienceContent {
    return {
      metadata: {
        title: practice.title || `Career Challenge`,
        careerContext: 'professional',
        gradeLevel: grade,
        skill_number: skillCode,
        duration: practice.estimated_time || '20 min',
        studentName: studentName
      },
      scenario: {
        title: practice.title || 'Workplace Application',
        roleDescription: `You are working as a professional who uses ${subject} skills every day.`,
        challenge: practice.content || `Apply your ${subject} knowledge to solve a real workplace problem.`,
        steps: practice.activities?.map((activity: string, index: number) => ({
          step: `Step ${index + 1}`,
          action: activity,
          result: `You successfully complete this part of the challenge.`
        })) || [],
        assessment: {
          question: practice.content || `How would you apply ${subject} skills in this situation?`,
          options: practice.options || [
            'Apply systematic problem-solving',
            'Skip the analysis',
            'Guess the solution',
            'Ask someone else to do it'
          ],
          correctAnswer: practice.correct_answer || 'Apply systematic problem-solving',
          explanation: practice.explanation || `Using systematic approaches helps us solve problems effectively!`
        }
      }
    };
  }

  private convertTestbedToDiscoverContent(assessment: any, studentName: string, grade: string, subject: string, skillCode: string): DiscoverContent {
    return {
      metadata: {
        title: `${studentName}'s Adventure`,
        storyTheme: 'adventure',
        gradeLevel: grade,
        skill_number: skillCode,
        duration: assessment.estimated_time || '25 min',
        studentName: studentName
      },
      story: {
        title: `${studentName} and the ${subject} Quest`,
        setting: `A magical world where ${subject} knowledge helps save the day`,
        characters: [studentName, 'Wise Guide', 'Helpful Companion'],
        plot: assessment.content || `${studentName} discovers a world where ${subject} skills are needed to help others and solve important challenges.`,
        challenge: {
          question: assessment.content || `In the story, how does ${studentName} use ${subject} knowledge?`,
          options: assessment.options || [
            'By applying what they learned',
            'By avoiding the challenge',
            'By asking others for answers',
            'By giving up quickly'
          ],
          correctAnswer: assessment.correct_answer || 'By applying what they learned',
          explanation: assessment.explanation || `Using our knowledge to help others makes learning meaningful!`,
          storyConclusion: `Thanks to ${studentName}'s ${subject} skills, the quest was successful and everyone was helped!`
        }
      }
    };
  }

  // ================================================================
  // LEGACY COMPATIBILITY FOR OLD CONTAINERS
  // ================================================================

  getCachedContent(skill: any, studentName: string, gradeLevel: string): any {
    // This method is called by old ThreePhaseAssignmentPlayer
    // Return null so it falls back to live generation
    console.log(`⚠️ Legacy getCachedContent called for ${skill.skill_number} - falling back to live generation`);
    return null;
  }

  async generateThreePhaseContent(skill: any, studentName: string, gradeLevel: string, context?: string): Promise<any> {
    // This method is called by old ThreePhaseAssignmentPlayer
    console.log(`⚠️ Legacy generateThreePhaseContent called for ${skill.skill_number} - redirecting to appropriate generator`);
    
    try {
      if (context === 'experience' || skill.skill_number?.includes('application')) {
        // Generate Experience content
        const experienceContent = await this.generateExperienceContent(skill, studentName, gradeLevel, 'professional');
        
        // Convert to old ThreePhaseContent format
        return {
          metadata: experienceContent.metadata,
          instruction: {
            title: experienceContent.scenario.title,
            content: experienceContent.scenario.roleDescription,
            concept: experienceContent.scenario.challenge
          },
          practice: {
            title: 'Apply Your Skills',
            exercises: experienceContent.scenario.steps.map(step => ({
              question: step.action,
              solution: step.result
            }))
          },
          assessment: experienceContent.scenario.assessment
        };
      } else if (context === 'discover' || skill.skill_number?.includes('story')) {
        // Generate Discover content
        const discoverContent = await this.generateDiscoverContent(skill, studentName, gradeLevel, 'adventure');
        
        // Convert to old ThreePhaseContent format
        return {
          metadata: discoverContent.metadata,
          instruction: {
            title: discoverContent.story.title,
            content: discoverContent.story.plot,
            concept: `This story helps us practice skills`
          },
          practice: {
            title: 'Story Interaction',
            exercises: [{
              question: 'How can you help the characters?',
              solution: 'Use your knowledge to solve problems'
            }]
          },
          assessment: discoverContent.story.challenge
        };
      } else {
        // Default to Learn content
        const learnContent = await this.generateLearnContent(skill, studentName, gradeLevel);
        
        // Convert to old ThreePhaseContent format
        return {
          metadata: learnContent.metadata,
          instruction: learnContent.instruction,
          practice: learnContent.practice,
          assessment: learnContent.assessment
        };
      }
    } catch (error) {
      console.error(`❌ Legacy content generation failed for ${skill.skill_number}:`, error);
      
      // Return basic fallback content
      return {
        metadata: {
          title: `Learning ${skill.skillName || skill.skill_number}`,
          subject: skill.subject || 'General',
          gradeLevel: gradeLevel,
          skill_number: skill.skill_number,
          duration: '15 min',
          studentName: studentName
        },
        instruction: {
          title: `Let's Learn ${skill.skillName || skill.skill_number}`,
          content: `Hi ${studentName}! Let's work on this skill.`,
          concept: 'This is an important skill to learn.'
        },
        practice: {
          title: 'Practice Time',
          exercises: [{
            question: 'Let\'s practice this skill',
            solution: 'Apply what you learned'
          }]
        },
        assessment: {
          question: 'Which approach works best?',
          options: ['Apply the concept', 'Skip the steps', 'Guess randomly', 'Ask for help'],
          correctAnswer: 'Apply the concept',
          explanation: 'Using what you learned is the best approach!'
        }
      };
    }
  }
}