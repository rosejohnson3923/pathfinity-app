// Updated AI Content Generator with 3-Phase Educational Flow
// Ensures proper INSTRUCTION → PRACTICE → ASSESSMENT sequence

export interface ThreePhaseContent {
  metadata: {
    title: string;
    subject: string;
    gradeLevel: string;
    skillCode: string;
    duration: string;
    difficulty: string;
    studentName: string;
  };
  
  instruction: {
    title: string;
    content: string;
    concept: string;
    examples: Array<{
      type: string;
      text: string;
      explanation: string;
    }>;
    keyPoints: string[];
  };
  
  practice: {
    title: string;
    description: string;
    examples: Array<{
      scenario: string;
      answer: string;
      feedback: string;
    }>;
  };
  
  assessment: {
    title: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    encouragement: string;
  };
}

export class UpdatedAIContentGenerator {
  private apiKey: string;
  private apiUrl: string;
  private contentCache: Map<string, ThreePhaseContent> = new Map();
  private generationQueue: Map<string, Promise<ThreePhaseContent>> = new Map();
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

  // Get cache key for skill content
  private getCacheKey(skill: any, studentName: string, gradeLevel: string): string {
    // For demo users, include student name to match pre-generated content
    if (this.isDemoUser(studentName)) {
      const demoName = this.extractDemoName(studentName);
      const key = `${skill.skillCode}-${gradeLevel}-${skill.subject}-${demoName}`;
      console.log(`🔑 Generated cache key for demo user: ${key}`);
      return key;
    }
    const key = `${skill.skillCode}-${gradeLevel}-${skill.subject}`;
    console.log(`🔑 Generated cache key for regular user: ${key}`);
    return key;
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

  // Check if content is cached
  getCachedContent(skill: any, studentName: string, gradeLevel: string): ThreePhaseContent | null {
    const cacheKey = this.getCacheKey(skill, studentName, gradeLevel);
    const cached = this.contentCache.get(cacheKey);
    if (cached && this.isDemoUser(studentName)) {
      console.log(`🎯 Using cached intelligent testbed data for ${studentName}: ${skill.skillCode}`);
    }
    return cached || null;
  }

  // Load intelligent testbed data for demo users
  private async loadIntelligentTestbedData(): Promise<void> {
    try {
      console.log('📚 Loading intelligent testbed data for demo users...');
      console.log('🔍 Current cache size before loading:', this.contentCache.size);
      
      // Load the testbed data
      const response = await fetch('/generated-testbed-samples/intelligent-testbed-samples.json');
      if (!response.ok) {
        console.warn('Intelligent testbed data not found, demo users will use fallback content');
        return;
      }
      
      const testbedData = await response.json();
      console.log(`📦 Loaded ${testbedData.length} intelligent testbed items`);
      
      // Group testbed data by grade and subject for easier mapping
      const testbedByGrade: { [key: string]: any[] } = {};
      testbedData.forEach((item: any) => {
        const key = `${item.grade}-${item.subject}`;
        if (!testbedByGrade[key]) testbedByGrade[key] = [];
        testbedByGrade[key].push(item);
      });
      
      // Create content for each demo user
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
        
        // Process math content
        if (testbedByGrade[mathKey]) {
          this.processTestbedDataForUser(testbedByGrade[mathKey], user.name, user.grade, 'Math');
        }
        
        // Process ELA content
        if (testbedByGrade[elaKey]) {
          this.processTestbedDataForUser(testbedByGrade[elaKey], user.name, user.grade, 'ELA');
        }
        
        // Process Science content  
        if (testbedByGrade[scienceKey]) {
          this.processTestbedDataForUser(testbedByGrade[scienceKey], user.name, user.grade, 'Science');
        }
      }
      
      console.log(`✅ Intelligent testbed data loaded! Cache now contains ${this.contentCache.size} items`);
      
    } catch (error) {
      console.error('Failed to load intelligent testbed data:', error);
      console.warn('Demo users will fall back to generated content');
    }
  }

  // Process testbed data for a specific user
  private processTestbedDataForUser(testbedItems: any[], userName: string, grade: string, subject: string): void {
    // Find instruction, practice, and assessment items for this subject
    const instruction = testbedItems.find(item => item.contentType === 'instruction');
    const practice = testbedItems.find(item => item.contentType === 'practice');  
    const assessment = testbedItems.find(item => item.contentType === 'assessment');
    
    if (instruction && practice && assessment) {
      // Create multiple cache entries for common skill codes that might be requested
      const commonSkills = this.getCommonSkillCodesForGrade(grade, subject);
      
      for (const skillCode of commonSkills) {
        const content: ThreePhaseContent = this.convertTestbedToThreePhase(
          instruction, practice, assessment, userName, grade, subject, skillCode
        );
        
        const skill = { skillCode: skillCode, subject: subject };
        const cacheKey = this.getCacheKey(skill, userName, grade);
        this.contentCache.set(cacheKey, content);
        
        console.log(`📝 Cached content for ${userName} (${grade}): ${cacheKey}`);
      }
    }
  }

  // Get common skill codes that might be requested for each grade/subject
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

  // Convert testbed data to ThreePhaseContent format
  private convertTestbedToThreePhase(
    instruction: any, 
    practice: any, 
    assessment: any, 
    studentName: string, 
    grade: string, 
    subject: string,
    skillCode: string
  ): ThreePhaseContent {
    return {
      metadata: {
        title: instruction.title || `Learning ${subject}`,
        subject: subject,
        gradeLevel: grade,
        skillCode: skillCode,
        duration: instruction.estimated_time || '20 min',
        difficulty: instruction.difficulty_level || `Grade ${grade}`,
        studentName: studentName
      },
      instruction: {
        title: instruction.title,
        content: `Hi ${studentName}! ${instruction.content}`,
        concept: instruction.content.split('.')[0] + '.',
        examples: instruction.activities?.map((activity: string, index: number) => ({
          type: index === 0 ? 'Example' : 'Practice',
          text: activity,
          explanation: `This helps us understand ${subject} concepts better.`
        })) || [],
        keyPoints: instruction.learning_objectives || []
      },
      practice: {
        title: practice.title || "Let's Practice!",
        description: `Now ${studentName}, let's practice what we just learned!`,
        examples: practice.activities?.map((activity: string) => ({
          scenario: activity,
          answer: "Practice this concept step by step",
          feedback: "Great job working through this!"
        })) || []
      },
      assessment: {
        title: assessment.title || "Show What You Know!",
        question: assessment.content || `Which example best shows what we learned about ${subject}?`,
        options: assessment.options || [
          'Option A - Correct example',
          'Option B - Incorrect example', 
          'Option C - Another incorrect example',
          'Option D - Also incorrect'
        ],
        correctAnswer: assessment.correct_answer || 'Option A - Correct example',
        explanation: assessment.explanation || `That's right! This demonstrates the concept perfectly.`,
        encouragement: `Excellent work, ${studentName}! You're doing amazing!`
      }
    };
  }

  // Pre-generate content for multiple skills
  async preGenerateContent(
    skills: any[], 
    studentName: string, 
    gradeLevel: string,
    progressCallback?: (completed: number, total: number) => void
  ): Promise<void> {
    console.log(`🚀 Pre-generating content for ${skills.length} skills...`);
    
    const generationPromises = skills.map(async (skill, index) => {
      const cacheKey = this.getCacheKey(skill, studentName, gradeLevel);
      
      // Skip if already cached or being generated
      if (this.contentCache.has(cacheKey) || this.generationQueue.has(cacheKey)) {
        return;
      }

      // Add to generation queue to prevent duplicates
      const generationPromise = this.generateThreePhaseContentInternal(skill, studentName, gradeLevel);
      this.generationQueue.set(cacheKey, generationPromise);

      try {
        const content = await generationPromise;
        this.contentCache.set(cacheKey, content);
        console.log(`✅ Pre-generated content for ${skill.skillCode}`);
        
        if (progressCallback) {
          progressCallback(index + 1, skills.length);
        }
      } catch (error) {
        console.error(`❌ Failed to pre-generate content for ${skill.skillCode}:`, error);
      } finally {
        this.generationQueue.delete(cacheKey);
      }
    });

    await Promise.all(generationPromises);
    console.log(`🎯 Pre-generation complete! Cached ${this.contentCache.size} content items.`);
  }

  // Generate complete 3-phase educational content with caching
  async generateThreePhaseContent(
    skill: any, 
    studentName: string, 
    gradeLevel: string
  ): Promise<ThreePhaseContent> {
    const cacheKey = this.getCacheKey(skill, studentName, gradeLevel);
    
    // Special handling for demo users - prioritize cached intelligent testbed data
    if (this.isDemoUser(studentName)) {
      const cached = this.contentCache.get(cacheKey);
      if (cached) {
        console.log(`🎯 Demo user ${studentName}: Using cached intelligent testbed data for ${skill.skillCode}`);
        return cached;
      } else {
        console.warn(`⚠️ Demo user ${studentName}: No cached data found for ${skill.skillCode}, falling back to generation`);
        console.log(`Cache key used: ${cacheKey}`);
        console.log(`Available cache keys:`, Array.from(this.contentCache.keys()));
      }
    }
    
    // Return cached content if available (for non-demo users)
    const cached = this.contentCache.get(cacheKey);
    if (cached) {
      console.log(`⚡ Using cached content for ${skill.skillCode}`);
      return cached;
    }

    // Return existing generation promise if in progress
    const existingPromise = this.generationQueue.get(cacheKey);
    if (existingPromise) {
      console.log(`⏳ Waiting for in-progress generation of ${skill.skillCode}`);
      return existingPromise;
    }

    // Start new generation
    const generationPromise = this.generateThreePhaseContentInternal(skill, studentName, gradeLevel);
    this.generationQueue.set(cacheKey, generationPromise);

    try {
      console.log(`🎯 Generating fresh content for ${skill.skillCode}...`);
      const content = await generationPromise;
      this.contentCache.set(cacheKey, content);
      console.log(`✅ Generated and cached content for ${skill.skillCode}`);
      return content;
    } finally {
      this.generationQueue.delete(cacheKey);
    }
  }

  // Internal method for actual content generation
  private async generateThreePhaseContentInternal(
    skill: any, 
    studentName: string, 
    gradeLevel: string
  ): Promise<ThreePhaseContent> {
    const startTime = Date.now();
    
    // If in demo mode or no API key, return demo content
    if (this.isDemoMode || !this.apiKey) {
      console.log(`🎭 Using demo content for ${skill.skillCode} (no API key available)`);
      return this.getDemoContent(skill, studentName, gradeLevel);
    }
    
    const prompt = this.buildEducationalPrompt(skill, studentName, gradeLevel);
    
    try {
      const isAzure = this.apiUrl.includes('azure.com');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (isAzure) {
        headers['api-key'] = this.apiKey;
      } else {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: isAzure ? import.meta.env.VITE_AZURE_GPT4_DEPLOYMENT : 'gpt-4-1106-preview',
          messages: [
            {
              role: 'system',
              content: `You are an expert educational content creator who follows proper pedagogical principles. You ALWAYS create content with three phases: INSTRUCTION (teach the concept), PRACTICE (guided examples), and ASSESSMENT (test understanding). Never test students on concepts you haven't taught them first.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 1200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      // Clean markdown formatting if present
      const cleanContent = generatedContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const content = JSON.parse(cleanContent);
      const duration = Date.now() - startTime;
      console.log(`⏱️ Generation took ${duration}ms for ${skill.skillCode}`);
      
      return content;
    } catch (error) {
      console.error('Error generating 3-phase content:', error);
      throw error;
    }
  }

  // Generate demo content when API is not available
  private getDemoContent(skill: any, studentName: string, gradeLevel: string): ThreePhaseContent {
    return {
      metadata: {
        title: `${skill.skillName || skill.skillCode} - Demo Mode`,
        subject: skill.subject || 'General',
        gradeLevel: gradeLevel,
        skillCode: skill.skillCode,
        duration: '15 min',
        difficulty: 'Easy',
        studentName: studentName
      },
      
      instruction: {
        title: `Learning About ${skill.skillName || skill.skillCode}`,
        content: `Hi ${studentName}! Today we're going to learn about ${skill.skillName || skill.skillCode}. This is an important skill that will help you in your learning journey.`,
        concept: skill.skillName || skill.skillCode,
        examples: [
          {
            type: 'visual',
            text: 'This is a basic example to help you understand the concept.',
            explanation: 'Remember to take your time and think carefully about each step.'
          }
        ],
        keyPoints: [
          'Take your time to understand',
          'Practice makes perfect',
          'Ask questions if you need help'
        ]
      },
      
      practice: {
        title: 'Let\'s Practice Together!',
        description: `Now let's practice what we learned about ${skill.skillName || skill.skillCode}.`,
        examples: [
          {
            scenario: `Here's a practice example for ${studentName} to try.`,
            answer: 'This is the practice answer.',
            feedback: 'Great job working through this practice problem!'
          }
        ]
      },
      
      assessment: {
        title: 'Show What You Know!',
        question: `${studentName}, can you show what you learned about ${skill.skillName || skill.skillCode}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: 'Excellent work! You understand this concept well.',
        encouragement: `${studentName}, you're doing great! Keep up the excellent work!`
      }
    };
  }

  // Build comprehensive educational prompt
  private buildEducationalPrompt(skill: any, studentName: string, gradeLevel: string): string {
    return `Create a complete 3-phase educational experience for ${studentName}, a ${gradeLevel} student.

SKILL INFORMATION:
- Skill Code: ${skill.skillCode}
- Skill Name: ${skill.skillName || skill.description}
- Subject: ${skill.subject}
- Grade Level: ${gradeLevel}

CRITICAL REQUIREMENTS:
1. ALWAYS follow the 3-phase educational model: INSTRUCTION → PRACTICE → ASSESSMENT
2. NEVER test concepts that weren't taught in the instruction phase
3. Ensure assessment questions directly relate to what was taught
4. Use age-appropriate language for ${gradeLevel}
5. Make content engaging and encouraging for ${studentName}

Generate content in this EXACT JSON format:

{
  "metadata": {
    "title": "Engaging title for the learning experience",
    "subject": "${skill.subject}",
    "gradeLevel": "${gradeLevel}",
    "skillCode": "${skill.skillCode}",
    "duration": "estimated time (e.g., '30 min')",
    "difficulty": "easy/medium/hard based on grade level",
    "studentName": "${studentName}"
  },
  "instruction": {
    "title": "Clear learning phase title",
    "content": "Friendly introduction explaining what ${studentName} will learn",
    "concept": "Main concept explained in age-appropriate language",
    "examples": [
      {
        "type": "category or type name",
        "text": "concrete example",
        "explanation": "why this example demonstrates the concept"
      },
      {
        "type": "category or type name", 
        "text": "contrasting example",
        "explanation": "why this example is different"
      }
    ],
    "keyPoints": [
      "Key takeaway 1",
      "Key takeaway 2",
      "Key takeaway 3"
    ]
  },
  "practice": {
    "title": "Practice phase title",
    "description": "Explanation of what ${studentName} will practice",
    "examples": [
      {
        "scenario": "practice example that reinforces the instruction",
        "answer": "correct response",
        "feedback": "encouraging explanation of why this is correct"
      },
      {
        "scenario": "second practice example",
        "answer": "correct response", 
        "feedback": "encouraging explanation"
      }
    ]
  },
  "assessment": {
    "title": "Assessment phase title",
    "question": "Question that tests EXACTLY what was taught in instruction",
    "options": [
      "Option that relates to instruction content",
      "Option that relates to instruction content",
      "Option that relates to instruction content", 
      "Option that relates to instruction content"
    ],
    "correctAnswer": "The correct option from above",
    "explanation": "Why this answer is correct, referencing the instruction",
    "encouragement": "Positive message for ${studentName} regardless of result"
  }
}

GRADE-SPECIFIC GUIDELINES:
${this.getGradeSpecificGuidelines(gradeLevel)}

ENSURE CONTENT COHERENCE:
- Instruction examples should prepare students for the assessment
- Practice examples should bridge instruction and assessment  
- Assessment question should test concepts from instruction
- All phases should feel connected and purposeful`;
  }

  // Grade-specific content guidelines
  private getGradeSpecificGuidelines(gradeLevel: string): string {
    switch (gradeLevel.toLowerCase()) {
      case 'kindergarten':
        return `
- Use simple, concrete examples from daily life
- Include visual and sensory concepts
- Keep instruction short and engaging
- Use repetition for reinforcement
- Make examples relatable to a 5-6 year old
- Assessment should be straightforward with clear right/wrong answers`;
      
      case '3rd grade':
        return `
- Use intermediate vocabulary but explain new terms
- Include problem-solving elements
- Connect to real-world applications
- Encourage logical thinking
- Assessment can include multi-step reasoning
- Examples should be age-appropriate for 8-9 year olds`;
      
      case '7th grade':
        return `
- Use grade-appropriate academic vocabulary
- Include abstract concepts with concrete examples
- Encourage critical thinking and analysis
- Connect to broader academic contexts
- Assessment should test understanding, not just memorization
- Examples should relate to middle school experiences`;
      
      case '10th grade':
        return `
- Use sophisticated vocabulary and concepts
- Include analytical and evaluative thinking
- Connect to real-world applications and current events
- Encourage deep understanding and synthesis
- Assessment should test higher-order thinking skills
- Examples should be relevant to high school students`;
      
      default:
        return `
- Adapt vocabulary and concepts to the specified grade level
- Ensure age-appropriate examples and contexts
- Match cognitive complexity to developmental stage`;
    }
  }

  // Validate that content follows proper educational flow
  validateEducationalFlow(content: ThreePhaseContent): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const validation = {
      isValid: true,
      errors: [] as string[],
      warnings: [] as string[]
    };

    // Check required structure
    if (!content.instruction || !content.practice || !content.assessment) {
      validation.errors.push('Missing required phases (instruction, practice, or assessment)');
      validation.isValid = false;
    }

    // Check instruction completeness
    if (!content.instruction?.concept || !content.instruction?.examples || content.instruction.examples.length < 2) {
      validation.errors.push('Instruction phase must include concept and at least 2 examples');
      validation.isValid = false;
    }

    // Check practice examples
    if (!content.practice?.examples || content.practice.examples.length < 2) {
      validation.errors.push('Practice phase must include at least 2 guided examples');
      validation.isValid = false;
    }

    // Check assessment alignment
    if (content.assessment?.options && content.assessment.options.length < 3) {
      validation.errors.push('Assessment must have at least 3 options');
      validation.isValid = false;
    }

    // Check if assessment relates to instruction (basic keyword check)
    if (content.instruction?.concept && content.assessment?.question) {
      const instructionWords = content.instruction.concept.toLowerCase().split(' ');
      const questionWords = content.assessment.question.toLowerCase();
      
      const hasSharedConcepts = instructionWords.some(word => 
        word.length > 4 && questionWords.includes(word)
      );
      
      if (!hasSharedConcepts) {
        validation.warnings.push('Assessment question may not align with instruction content');
      }
    }

    return validation;
  }
  
  // Generate mock content for demo mode
  private generateMockThreePhaseContent(skill: any, studentName: string, gradeLevel: string): ThreePhaseContent {
    const skillName = skill.name || skill.skill_name || 'Learning Skill';
    
    return {
      instruction: {
        title: `Learn ${skillName}`,
        content: `Welcome ${studentName}! Today we're going to explore ${skillName}. This is an important concept for ${gradeLevel} students.\n\nLet's start with the basics and build your understanding step by step. Pay attention to the key concepts as we go through this together.`,
        examples: [
          `Here's a simple example to get us started with ${skillName}.`,
          `Let's look at another way to think about ${skillName}.`,
          `Now you try applying what you've learned about ${skillName}.`
        ]
      },
      practice: {
        title: `Practice ${skillName}`,
        content: `Great job learning about ${skillName}, ${studentName}! Now let's practice what you've learned.\n\nRemember the key concepts we just covered and apply them to these practice problems.`,
        exercises: [
          {
            question: `Apply your knowledge of ${skillName} to solve this problem.`,
            hint: `Remember what we learned about ${skillName} in the instruction phase.`,
            solution: `The solution involves applying the ${skillName} concept we just learned.`
          },
          {
            question: `Here's another ${skillName} challenge for you to try.`,
            hint: `Think about the examples we saw earlier.`,
            solution: `This demonstrates another application of ${skillName}.`
          }
        ]
      },
      assessment: {
        title: `Show What You Know: ${skillName}`,
        content: `Excellent work practicing ${skillName}, ${studentName}! Now let's see how well you understand this concept.\n\nTake your time and think through each question carefully.`,
        questions: [
          {
            question: `How would you apply ${skillName} in this situation?`,
            options: [
              'Apply the first method we learned',
              'Apply the second method we learned', 
              'Combine both methods',
              'Use a different approach'
            ],
            correct: 0,
            explanation: `The correct answer demonstrates your understanding of ${skillName}.`
          },
          {
            question: `What is the most important thing to remember about ${skillName}?`,
            options: [
              'The basic definition',
              'The practical applications',
              'The step-by-step process',
              'All of the above'
            ],
            correct: 3,
            explanation: `All aspects of ${skillName} are important for a complete understanding.`
          }
        ]
      }
    };
  }
}

// Updated Finn Maestro Agent to use 3-phase content
export class UpdatedFinnMaestroAgent {
  private student: Student;
  private contentGenerator: UpdatedAIContentGenerator;
  private dailyContent: ThreePhaseContent[] = [];

  constructor(student: Student, apiKey: string) {
    this.student = student;
    this.contentGenerator = new UpdatedAIContentGenerator(apiKey);
  }

  // Generate daily content with proper educational flow
  async generateDailyContent(): Promise<ThreePhaseContent[]> {
    console.log(`🎯 Finn generating 3-phase daily content for ${this.student.name} (${this.student.gradeLevel})`);
    
    const todaysSkills = await this.getAssignedSkills();
    const generatedContent: ThreePhaseContent[] = [];
    
    for (const skill of todaysSkills) {
      try {
        console.log(`📚 Generating content for skill ${skill.skillCode}: ${skill.skillName}`);
        
        const content = await this.contentGenerator.generateThreePhaseContent(
          skill,
          this.student.name,
          this.student.gradeLevel
        );
        
        // Validate educational flow
        const validation = this.contentGenerator.validateEducationalFlow(content);
        
        if (!validation.isValid) {
          console.error(`❌ Content validation failed for ${skill.skillCode}:`, validation.errors);
          // Could retry generation or use fallback content
          continue;
        }
        
        if (validation.warnings.length > 0) {
          console.warn(`⚠️ Content warnings for ${skill.skillCode}:`, validation.warnings);
        }
        
        generatedContent.push(content);
        console.log(`✅ Generated 3-phase content for ${skill.skillCode}`);
        
      } catch (error) {
        console.error(`❌ Error generating content for skill ${skill.skillCode}:`, error);
      }
    }
    
    this.dailyContent = generatedContent;
    console.log(`🎓 Generated ${generatedContent.length} complete learning experiences`);
    
    return generatedContent;
  }

  // Guide student through 3-phase learning
  async guideStudentThroughLearning(content: ThreePhaseContent): Promise<void> {
    console.log(`\n🎓 Starting 3-phase learning: ${content.metadata.title}`);
    
    // Phase 1: Instruction
    console.log('\n📚 PHASE 1: INSTRUCTION');
    await this.presentInstruction(content.instruction);
    
    // Phase 2: Practice  
    console.log('\n🎯 PHASE 2: PRACTICE');
    await this.guidePractice(content.practice);
    
    // Phase 3: Assessment
    console.log('\n✅ PHASE 3: ASSESSMENT');
    const result = await this.conductAssessment(content.assessment);
    
    // Update performance tracking
    this.updatePerformanceMetrics(content.metadata.skillCode, result);
  }

  private async presentInstruction(instruction: any): Promise<void> {
    console.log(`📖 ${instruction.title}`);
    console.log(`💭 ${instruction.content}`);
    console.log(`🧠 Key Concept: ${instruction.concept}`);
    
    instruction.examples.forEach((example: any, index: number) => {
      console.log(`📝 Example ${index + 1}: ${example.text} - ${example.explanation}`);
    });
    
    console.log('✅ Instruction phase complete');
  }

  private async guidePractice(practice: any): Promise<void> {
    console.log(`🎯 ${practice.title}`);
    console.log(`📝 ${practice.description}`);
    
    practice.examples.forEach((example: any, index: number) => {
      console.log(`🔍 Practice ${index + 1}: ${example.scenario}`);
      console.log(`✅ Answer: ${example.answer}`);
      console.log(`💡 ${example.feedback}`);
    });
    
    console.log('✅ Practice phase complete');
  }

  private async conductAssessment(assessment: any): Promise<boolean> {
    console.log(`❓ ${assessment.question}`);
    assessment.options.forEach((option: string, index: number) => {
      console.log(`${index + 1}. ${option}`);
    });
    
    // In real implementation, this would capture student response
    const correct = Math.random() > 0.3; // Simulate student performance
    
    if (correct) {
      console.log(`🎉 Correct! ${assessment.explanation}`);
    } else {
      console.log(`💪 ${assessment.encouragement}`);
      console.log(`📚 The correct answer was: ${assessment.correctAnswer}`);
      console.log(`💡 ${assessment.explanation}`);
    }
    
    return correct;
  }

  private updatePerformanceMetrics(skillCode: string, correct: boolean): void {
    // Update student performance for future content adaptation
    if (correct) {
      this.student.currentPerformance.currentStreak++;
    } else {
      this.student.currentPerformance.currentStreak = 0;
      if (!this.student.currentPerformance.strugglingAreas.includes(skillCode)) {
        this.student.currentPerformance.strugglingAreas.push(skillCode);
      }
    }
  }

  private async getAssignedSkills() {
    // Get skills for the day
    return [
      { skillCode: 'A.1', skillName: 'Real vs. Make-believe', subject: 'ELA' },
      { skillCode: 'M.1', skillName: 'Counting 1-10', subject: 'Math' },
      { skillCode: 'S.1', skillName: 'Weather Patterns', subject: 'Science' }
    ];
  }
}

// Student interface for TypeScript
interface Student {
  id: string;
  name: string;
  gradeLevel: string;
  currentPerformance: {
    energyLevel: 'low' | 'medium' | 'high';
    currentStreak: number;
    strugglingAreas: string[];
    masteredSkills: string[];
    averageAccuracy: number;
  };
}

// Test function for the updated system
export async function testThreePhaseGeneration() {
  console.log('🧪 Testing 3-Phase Educational Content Generation');
  console.log('=' .repeat(60));
  
  const apiKey = import.meta.env.VITE_AZURE_GPT4_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_API_KEY_HERE';
  
  if (apiKey === 'YOUR_API_KEY_HERE') {
    console.log('⚠️  Please set your OpenAI API key in environment variables');
    return;
  }
  
  const generator = new UpdatedAIContentGenerator(apiKey);
  
  const testSkill = {
    skillCode: 'A.1',
    skillName: 'Real vs. Make-believe',
    subject: 'ELA'
  };
  
  try {
    const content = await generator.generateThreePhaseContent(
      testSkill,
      'Alex',
      'Kindergarten'
    );
    
    console.log('✅ Generated 3-phase content:');
    console.log('📚 Instruction:', content.instruction.title);
    console.log('🎯 Practice:', content.practice.title);
    console.log('✅ Assessment:', content.assessment.title);
    
    const validation = generator.validateEducationalFlow(content);
    console.log('\n🔍 Validation Result:');
    console.log('Valid:', validation.isValid);
    console.log('Errors:', validation.errors);
    console.log('Warnings:', validation.warnings);
    
    return content;
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

console.log('🎓 Updated 3-Phase Educational Content Generator Ready!');
console.log('Key Features:');
console.log('✅ Proper INSTRUCTION → PRACTICE → ASSESSMENT flow');
console.log('✅ Content coherence validation');
console.log('✅ Grade-appropriate guidelines');
console.log('✅ Educational flow enforcement');
console.log('\nRun testThreePhaseGeneration() to test the system!');