#!/usr/bin/env node

/**
 * INTELLIGENT TESTBED GENERATOR
 * Uses Claude.ai to generate comprehensive educational content for development testing
 * 
 * Usage:
 * node scripts/generate-testbed.js --start-grade=Pre-K --end-grade=2 --subjects=Math,Science
 * node scripts/generate-testbed.js --grade=K --subject=Math --container=learn
 * node scripts/generate-testbed.js --full-testbed  # Generate everything
 */

import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import ProgressBar from 'progress';

// Load environment variables
dotenv.config();

// Configuration
const CONFIG = {
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    key: process.env.VITE_SUPABASE_ANON_KEY
  },
  anthropic: {
    apiKey: process.env.VITE_ANTHROPIC_API_KEY
  },
  generation: {
    batchSize: 5,
    rateLimitMs: 2000, // 2 seconds between calls to respect rate limits
    maxRetries: 3,
    outputDir: './generated-testbed',
    saveToFiles: true
  }
};

// Constants
const GRADE_LEVELS = ['Pre-K', 'K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const SUBJECTS = ['Math', 'Science', 'ELA', 'Social Studies'];
const LEARNING_CONTAINERS = ['learn', 'experience', 'discover'];

// Skills mapping for realistic content
const SKILLS_BY_GRADE = {
  'Pre-K': {
    'Math': ['counting-1-5', 'shapes-basic', 'patterns-simple', 'size-comparison'],
    'Science': ['living-nonliving', 'weather-basic', 'senses', 'animals-habitats'],
    'ELA': ['letter-recognition', 'phonics-beginning', 'story-listening', 'vocabulary-basic']
  },
  'K': {
    'Math': ['counting-1-10', 'addition-basic', 'subtraction-basic', 'measurement-nonstandard'],
    'Science': ['states-matter', 'plants-animals', 'earth-sky', 'push-pull'],
    'ELA': ['sight-words', 'reading-comprehension', 'writing-letters', 'storytelling']
  },
  '1': {
    'Math': ['place-value-tens', 'addition-within-20', 'subtraction-within-20', 'time-hour'],
    'Science': ['sound-vibrations', 'light-shadows', 'animal-parents', 'seasonal-changes'],
    'ELA': ['reading-fluency', 'writing-sentences', 'grammar-basic', 'research-simple']
  }
  // Add more grades as needed
};

// Career mappings for Experience container
const CAREERS_BY_SUBJECT = {
  'Math': ['engineer', 'architect', 'chef', 'banker', 'carpenter', 'scientist'],
  'Science': ['doctor', 'veterinarian', 'environmental-scientist', 'pharmacist', 'meteorologist'],
  'ELA': ['journalist', 'teacher', 'librarian', 'author', 'editor', 'translator'],
  'Social Studies': ['historian', 'diplomat', 'social-worker', 'politician', 'archaeologist']
};

class TestbedGenerator {
  constructor() {
    this.supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.key);
    this.anthropic = new Anthropic({ 
      apiKey: CONFIG.anthropic.apiKey 
    });
    this.generatedContent = {
      learn: [],
      experience: [],
      discover: [],
      questions: []
    };
    this.progressBar = null;
  }

  /**
   * Generate complete testbed for specified parameters
   */
  async generateTestbed(options = {}) {
    console.log(chalk.blue('🚀 Starting Intelligent Testbed Generation with Claude.ai\n'));
    
    const {
      startGrade = 'Pre-K',
      endGrade = '2',
      subjects = ['Math', 'Science', 'ELA'],
      containers = ['learn', 'experience', 'discover']
    } = options;

    // Calculate scope
    const gradeRange = this.getGradeRange(startGrade, endGrade);
    const totalCombinations = gradeRange.length * subjects.length * containers.length;
    
    console.log(chalk.yellow(`📋 Generation Scope:`));
    console.log(chalk.white(`   Grades: ${gradeRange.join(', ')}`));
    console.log(chalk.white(`   Subjects: ${subjects.join(', ')}`));
    console.log(chalk.white(`   Containers: ${containers.join(', ')}`));
    console.log(chalk.white(`   Total Combinations: ${totalCombinations}\n`));

    // Initialize progress tracking
    this.progressBar = new ProgressBar(
      'Generating content [:bar] :current/:total (:percent) :etas remaining', 
      { 
        complete: '█', 
        incomplete: '░', 
        width: 40, 
        total: totalCombinations 
      }
    );

    let generationCount = 0;

    // Generate content for each combination
    for (const grade of gradeRange) {
      for (const subject of subjects) {
        for (const container of containers) {
          try {
            await this.generateContainerContent(grade, subject, container);
            generationCount++;
            this.progressBar.tick();
            
            // Rate limiting
            await this.delay(CONFIG.generation.rateLimitMs);
            
          } catch (error) {
            console.log(chalk.red(`\n❌ Failed to generate ${container} content for ${grade} ${subject}: ${error.message}`));
            this.progressBar.tick();
          }
        }
      }
    }

    console.log(chalk.green(`\n✅ Content generation complete! Generated ${generationCount} content sets.`));
    
    // Generate assessment questions for all content
    await this.generateAllAssessmentQuestions();
    
    // Save to database and files
    await this.saveAllContent();
    
    return this.generatedContent;
  }

  /**
   * Generate content for a specific container
   */
  async generateContainerContent(grade, subject, container) {
    const skills = SKILLS_BY_GRADE[grade]?.[subject] || [`${subject.toLowerCase()}-skill-1`, `${subject.toLowerCase()}-skill-2`];
    
    let content;
    switch (container) {
      case 'learn':
        content = await this.generateLearnContent(grade, subject, skills);
        break;
      case 'experience':
        content = await this.generateExperienceContent(grade, subject, skills);
        break;
      case 'discover':
        content = await this.generateDiscoverContent(grade, subject, skills);
        break;
    }

    if (content && content.length > 0) {
      this.generatedContent[container].push(...content);
    }
  }

  /**
   * Generate Learn Container content (Instruction, Practice, Assessment)
   */
  async generateLearnContent(grade, subject, skills) {
    const prompt = `You are an expert educational content creator. Generate comprehensive Learn Container content for ${grade} grade ${subject}.

CONTEXT:
- Grade Level: ${grade}
- Subject: ${subject}  
- Skills Focus: ${skills.join(', ')}
- Container: Learn (Abstract/Traditional Learning)

REQUIREMENTS:
Create exactly 3 pieces of content:

1. INSTRUCTION Content - Teaching/explanation focused
2. PRACTICE Content - Guided practice and exercises  
3. ASSESSMENT Content - Skill evaluation and testing

For each content piece, ensure:
- Age-appropriate language for ${grade} students
- Clear learning objectives
- Step-by-step progression
- Different learning styles support (visual, auditory, kinesthetic)
- Realistic time estimates
- Engaging but educational tone

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "content": [
    {
      "content_type": "instruction",
      "title": "Understanding Basic Addition",
      "skill_code": "addition-basic",
      "difficulty_level": 3,
      "estimated_duration_minutes": 15,
      "content_data": {
        "learning_objectives": ["Students will identify addition as combining groups", "Students will solve addition problems with sums to 10"],
        "instruction_steps": ["Show physical objects", "Demonstrate combining groups", "Practice with manipulatives"],
        "key_concepts": ["Addition means combining", "Plus sign (+) shows adding", "Sum is the total"],
        "visual_aids": ["Number line", "Counting bears", "Addition chart"],
        "assessment_criteria": ["Correctly identifies addition scenarios", "Solves basic addition problems"]
      },
      "tags": ["foundational", "hands-on", "visual"]
    },
    {
      "content_type": "practice", 
      "title": "Addition Practice Activities",
      "skill_code": "addition-basic",
      "difficulty_level": 4,
      "estimated_duration_minutes": 20,
      "content_data": {
        "learning_objectives": ["Students will practice addition with concrete objects", "Students will solve 10 addition problems independently"],
        "activities": [
          {
            "activity_name": "Counting Bears Addition",
            "description": "Use counting bears to solve addition problems",
            "materials": ["Counting bears", "Addition worksheets"],
            "steps": ["Count first group", "Count second group", "Combine and count total"]
          }
        ],
        "practice_problems": ["2 + 3 = ?", "1 + 4 = ?", "3 + 2 = ?"],
        "success_criteria": ["Solves 8/10 problems correctly", "Uses manipulatives appropriately"]
      },
      "tags": ["practice", "interactive", "manipulatives"]
    },
    {
      "content_type": "assessment",
      "title": "Basic Addition Assessment", 
      "skill_code": "addition-basic",
      "difficulty_level": 4,
      "estimated_duration_minutes": 10,
      "content_data": {
        "learning_objectives": ["Demonstrate mastery of basic addition facts", "Apply addition skills to word problems"],
        "assessment_format": "mixed",
        "questions_preview": ["Show 3 + 2 using pictures", "Solve: 4 + 1 = ?", "Word problem: Sam has 2 apples, gets 3 more"],
        "rubric": {
          "mastery": "Correctly solves 9/10 problems independently",
          "proficient": "Correctly solves 7/10 problems with minimal support", 
          "developing": "Correctly solves 5/10 problems with support"
        }
      },
      "tags": ["assessment", "mastery-check", "word-problems"]
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    return this.processContentResponse(response, grade, subject, 'learn');
  }

  /**
   * Generate Experience Container content (Career-based scenarios)
   */
  async generateExperienceContent(grade, subject, skills) {
    const careers = CAREERS_BY_SUBJECT[subject] || ['professional', 'specialist'];
    const selectedCareers = careers.slice(0, 2); // Generate 2 career scenarios

    const prompt = `You are an expert educational content creator. Generate Experience Container career-based content for ${grade} grade ${subject}.

CONTEXT:
- Grade Level: ${grade}
- Subject: ${subject}
- Skills Focus: ${skills.join(', ')}
- Container: Experience (Applied/Career-based Learning)
- Relevant Careers: ${selectedCareers.join(', ')}

REQUIREMENTS:
Create exactly 2 career scenarios that apply ${subject} skills in real-world professional contexts.

For each scenario, ensure:
- Realistic career connection appropriate for ${grade} understanding
- Clear real-world problem that requires ${subject} skills
- Step-by-step tasks that build on each other
- Age-appropriate professional context
- Engaging storytelling with authentic career details
- Collaborative opportunities where appropriate

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "scenarios": [
    {
      "career_id": "chef",
      "career_name": "Restaurant Chef",
      "department": "Food Service",
      "scenario_title": "Planning the Perfect Recipe",
      "scenario_description": "Help Chef Maria plan portions for the school lunch program using math skills",
      "real_world_context": "Restaurant chefs use math every day to calculate ingredient amounts, plan portions, and manage food costs",
      "tasks": [
        {
          "task_title": "Count Students",
          "description": "Count how many students will eat lunch today",
          "skills_used": ["counting", "data-collection"],
          "estimated_minutes": 5,
          "collaboration": false
        },
        {
          "task_title": "Calculate Ingredients", 
          "description": "Figure out how many apples needed for everyone",
          "skills_used": ["multiplication", "problem-solving"],
          "estimated_minutes": 10,
          "collaboration": true
        }
      ],
      "applicable_skills": ["counting", "basic-math", "problem-solving"],
      "primary_subject": "Math",
      "cross_curricular_subjects": ["Science"],
      "engagement_level": "high",
      "collaboration_required": true,
      "estimated_completion_minutes": 25
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    return this.processContentResponse(response, grade, subject, 'experience');
  }

  /**
   * Generate Discover Container content (Narrative-based scenarios)
   */
  async generateDiscoverContent(grade, subject, skills) {
    const prompt = `You are an expert educational content creator. Generate Discover Container narrative-based content for ${grade} grade ${subject}.

CONTEXT:
- Grade Level: ${grade}
- Subject: ${subject}
- Skills Focus: ${skills.join(', ')}
- Container: Discover (Narrative/Story-based Learning)

REQUIREMENTS:
Create exactly 2 engaging stories that naturally integrate ${subject} skills into adventure narratives.

For each story, ensure:
- Compelling, age-appropriate storyline for ${grade} students
- Natural integration of ${subject} skills into plot progression
- Multiple decision/interaction points requiring skill application
- Diverse characters and inclusive representation
- Exciting but educational tone
- Clear story structure (beginning, middle, end)
- Skills reinforcement through narrative choices

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "narratives": [
    {
      "title": "The Mystery of the Missing Math",
      "theme": "mystery",
      "story_elements": {
        "introduction": "Detective Sam discovers that all the numbers have disappeared from the classroom! Without numbers, no one can solve any math problems.",
        "main_story": "Sam must search the school to find clues about where the numbers went. Each clue requires solving a math puzzle to unlock the next location.",
        "climax": "Sam discovers the Number Goblin has hidden all the numbers in the school garden. To get them back, Sam must solve the biggest math challenge yet!",
        "resolution": "With clever thinking and math skills, Sam retrieves all the numbers and saves math class. Everyone celebrates Sam's problem-solving abilities!"
      },
      "embedded_skills": ["counting", "number-recognition", "problem-solving"],
      "interaction_points": [
        {
          "story_moment": "Finding the first clue in the library",
          "decision_required": "Count the books on the mystery shelf",
          "skill_application": "counting-1-10"
        },
        {
          "story_moment": "Unlocking the garden gate",
          "decision_required": "Solve the number pattern on the lock",
          "skill_application": "patterns"
        }
      ],
      "estimated_duration_minutes": 20,
      "engagement_factors": ["mystery", "adventure", "problem-solving", "heroic-character"]
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    return this.processContentResponse(response, grade, subject, 'discover');
  }

  /**
   * Generate assessment questions for all content
   */
  async generateAllAssessmentQuestions() {
    console.log(chalk.blue('\n📝 Generating assessment questions for all content...'));
    
    const allContent = [
      ...this.generatedContent.learn,
      ...this.generatedContent.experience, 
      ...this.generatedContent.discover
    ];

    const questionsProgress = new ProgressBar(
      'Questions [:bar] :current/:total (:percent)', 
      { 
        complete: '█', 
        incomplete: '░', 
        width: 30, 
        total: allContent.length 
      }
    );

    for (const content of allContent) {
      try {
        const questions = await this.generateQuestionsForContent(content);
        if (questions && questions.length > 0) {
          this.generatedContent.questions.push(...questions);
        }
        questionsProgress.tick();
        await this.delay(CONFIG.generation.rateLimitMs);
      } catch (error) {
        console.log(chalk.red(`\n❌ Failed to generate questions for ${content.title}: ${error.message}`));
        questionsProgress.tick();
      }
    }

    console.log(chalk.green(`\n✅ Generated ${this.generatedContent.questions.length} assessment questions`));
  }

  /**
   * Generate questions for specific content
   */
  async generateQuestionsForContent(content) {
    const prompt = `Generate assessment questions for this educational content:

CONTENT DETAILS:
- Title: ${content.title}
- Grade: ${content.grade_level}
- Subject: ${content.subject}
- Container: ${content.learning_container}
- Type: ${content.content_type || 'scenario'}

REQUIREMENTS:
Create exactly 3 assessment questions that test understanding of this content:
- 2 multiple choice questions with 4 options each
- 1 true/false question
- Questions should test comprehension, application, and analysis
- Use age-appropriate language for ${content.grade_level}
- Include realistic distractors (wrong answers students might choose)
- Provide clear explanations for correct answers

IMPORTANT: Return ONLY valid JSON in this exact format:
{
  "questions": [
    {
      "question_text": "What is 2 + 3?",
      "question_type": "multiple_choice",
      "answer_options": ["4", "5", "6", "7"],
      "correct_answer": "5",
      "explanation": "When we add 2 and 3 together, we get 5. You can count 2 objects, then 3 more objects, and count them all to get 5 total.",
      "difficulty_estimate": 0.7,
      "estimated_time_seconds": 30
    },
    {
      "question_text": "Addition means taking numbers away.",
      "question_type": "true_false", 
      "answer_options": ["True", "False"],
      "correct_answer": "False",
      "explanation": "Addition means combining or putting numbers together to make a larger number. Subtraction means taking numbers away.",
      "difficulty_estimate": 0.6,
      "estimated_time_seconds": 20
    }
  ]
}`;

    const response = await this.callClaudeAPI(prompt);
    
    if (response && response.questions) {
      return response.questions.map(question => ({
        id: `question_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...question,
        content_id: content.id,
        learning_container: content.learning_container,
        skill_code: content.skill_code,
        grade_level: content.grade_level,
        subject: content.subject,
        created_at: new Date().toISOString()
      }));
    }
    
    return [];
  }

  /**
   * Call Claude API with retry logic
   */
  async callClaudeAPI(prompt, retries = 0) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const content = response.content[0].text;
      
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in Claude response');
      }

      return JSON.parse(jsonMatch[0]);
      
    } catch (error) {
      if (retries < CONFIG.generation.maxRetries) {
        await this.delay(CONFIG.generation.rateLimitMs * (retries + 1));
        return this.callClaudeAPI(prompt, retries + 1);
      }
      throw new Error(`Claude API call failed after ${CONFIG.generation.maxRetries} retries: ${error.message}`);
    }
  }

  /**
   * Process Claude API response and add metadata
   */
  processContentResponse(response, grade, subject, container) {
    if (!response) return [];

    const contentArray = response.content || response.scenarios || response.narratives || [];
    const timestamp = new Date().toISOString();
    
    return contentArray.map((item, index) => ({
      id: `${container}_${grade}_${subject}_${timestamp}_${index}`,
      ...item,
      learning_container: container,
      grade_level: grade,
      subject: subject,
      created_at: timestamp,
      is_active: true
    }));
  }

  /**
   * Save all generated content to database and files
   */
  async saveAllContent() {
    console.log(chalk.blue('\n💾 Saving all generated content...'));
    
    // Save to database
    await this.saveToDatabase();
    
    // Save to files if enabled
    if (CONFIG.generation.saveToFiles) {
      await this.saveToFiles();
    }
    
    // Print summary
    this.printGenerationSummary();
  }

  /**
   * Save content to Supabase database
   */
  async saveToDatabase() {
    try {
      // Save learning content (learn + discover containers)
      const learningContent = [
        ...this.generatedContent.learn.map(item => ({
          content_type: item.content_type,
          subject: item.subject,
          grade_level: item.grade_level,
          skill_code: item.skill_code,
          learning_container: item.learning_container,
          title: item.title,
          content_data: item.content_data,
          difficulty_level: item.difficulty_level,
          estimated_duration_minutes: item.estimated_duration_minutes,
          tags: item.tags,
          is_active: item.is_active,
          created_at: item.created_at
        })),
        ...this.generatedContent.discover.map(item => ({
          content_type: 'narrative',
          subject: item.subject,
          grade_level: item.grade_level,
          skill_code: item.embedded_skills?.[0] || 'general',
          learning_container: item.learning_container,
          title: item.title,
          content_data: {
            theme: item.theme,
            story_elements: item.story_elements,
            embedded_skills: item.embedded_skills,
            interaction_points: item.interaction_points,
            engagement_factors: item.engagement_factors
          },
          estimated_duration_minutes: item.estimated_duration_minutes,
          tags: item.engagement_factors,
          is_active: item.is_active,
          created_at: item.created_at
        }))
      ];

      if (learningContent.length > 0) {
        const { error: contentError } = await this.supabase
          .from('learning_content')
          .insert(learningContent);
        if (contentError) throw contentError;
        console.log(chalk.green(`✅ Saved ${learningContent.length} learning content items`));
      }

      // Save career scenarios (experience container)
      if (this.generatedContent.experience.length > 0) {
        const careerScenarios = this.generatedContent.experience.map(item => ({
          career_id: item.career_id,
          career_name: item.career_name,
          department: item.department,
          grade_level: item.grade_level,
          scenario_title: item.scenario_title,
          scenario_description: item.scenario_description,
          real_world_context: item.real_world_context,
          tasks: item.tasks,
          applicable_skills: item.applicable_skills,
          primary_subject: item.primary_subject,
          cross_curricular_subjects: item.cross_curricular_subjects,
          engagement_level: item.engagement_level,
          collaboration_required: item.collaboration_required,
          estimated_completion_minutes: item.estimated_completion_minutes,
          created_at: item.created_at
        }));

        const { error: scenarioError } = await this.supabase
          .from('career_scenarios')
          .insert(careerScenarios);
        if (scenarioError) throw scenarioError;
        console.log(chalk.green(`✅ Saved ${careerScenarios.length} career scenarios`));
      }

      // Save assessment questions
      if (this.generatedContent.questions.length > 0) {
        const { error: questionError } = await this.supabase
          .from('assessment_questions')
          .insert(this.generatedContent.questions);
        if (questionError) throw questionError;
        console.log(chalk.green(`✅ Saved ${this.generatedContent.questions.length} assessment questions`));
      }

    } catch (error) {
      console.error(chalk.red(`❌ Database save failed: ${error.message}`));
      throw error;
    }
  }

  /**
   * Save content to local files for backup
   */
  async saveToFiles() {
    try {
      await fs.mkdir(CONFIG.generation.outputDir, { recursive: true });
      
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      for (const [type, content] of Object.entries(this.generatedContent)) {
        if (content.length > 0) {
          const filename = `testbed_${type}_${timestamp}.json`;
          const filepath = path.join(CONFIG.generation.outputDir, filename);
          await fs.writeFile(filepath, JSON.stringify(content, null, 2));
          console.log(chalk.green(`✅ Saved ${content.length} ${type} items to ${filename}`));
        }
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ File save failed: ${error.message}`));
    }
  }

  /**
   * Print generation summary
   */
  printGenerationSummary() {
    const totalItems = Object.values(this.generatedContent).reduce((sum, items) => sum + items.length, 0);
    
    console.log(chalk.blue('\n📊 GENERATION SUMMARY'));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.green(`📚 Learn Content: ${this.generatedContent.learn.length} items`));
    console.log(chalk.green(`💼 Experience Content: ${this.generatedContent.experience.length} items`));
    console.log(chalk.green(`📖 Discover Content: ${this.generatedContent.discover.length} items`));
    console.log(chalk.green(`❓ Assessment Questions: ${this.generatedContent.questions.length} items`));
    console.log(chalk.white('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'));
    console.log(chalk.yellow(`🎯 Total Generated: ${totalItems} items`));
    console.log(chalk.blue(`💾 Saved to database and files\n`));
  }

  /**
   * Utility functions
   */
  getGradeRange(startGrade, endGrade) {
    const startIndex = GRADE_LEVELS.indexOf(startGrade);
    const endIndex = GRADE_LEVELS.indexOf(endGrade);
    
    if (startIndex === -1 || endIndex === -1) {
      throw new Error(`Invalid grade range: ${startGrade} to ${endGrade}`);
    }
    
    return GRADE_LEVELS.slice(startIndex, endIndex + 1);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// CLI Interface
const program = new Command();

program
  .name('generate-testbed')
  .description('Generate intelligent testbed using Claude.ai')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate testbed content')
  .option('--start-grade <grade>', 'Starting grade level', 'Pre-K')
  .option('--end-grade <grade>', 'Ending grade level', '2') 
  .option('--subjects <subjects>', 'Comma-separated subjects', 'Math,Science,ELA')
  .option('--containers <containers>', 'Comma-separated containers', 'learn,experience,discover')
  .option('--full-testbed', 'Generate complete testbed (Pre-K through 12th)')
  .action(async (options) => {
    try {
      const generator = new TestbedGenerator();
      
      const config = {
        startGrade: options.fullTestbed ? 'Pre-K' : options.startGrade,
        endGrade: options.fullTestbed ? '12' : options.endGrade,
        subjects: options.subjects.split(','),
        containers: options.containers.split(',')
      };

      await generator.generateTestbed(config);
      
    } catch (error) {
      console.error(chalk.red(`❌ Generation failed: ${error.message}`));
      process.exit(1);
    }
  });

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  program.parse();
}

export { TestbedGenerator };