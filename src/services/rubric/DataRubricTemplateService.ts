/**
 * Data Rubric Template Service
 *
 * Generates initial Data Rubrics for each container/subject combination.
 * Data Rubrics define what JIT must generate and how to generate it.
 *
 * Phase 1.3 Implementation
 */

import type {
  DataRubric,
  SkillReference,
  StoryContext,
  DataRequirements,
  LEARNDataRequirements,
  EXPERIENCEDataRequirements,
  DISCOVERDataRequirements,
  JITPrompt,
  StoryRubric
} from '../../types/RubricTypes';
import type {
  Subject,
  ContainerType,
  EnrichedMasterNarrative
} from '../../types/MasterNarrativeTypes';

/**
 * Data Rubric Template Service
 * Creates initial Data Rubrics for JIT consumption
 */
export class DataRubricTemplateService {

  /**
   * Generate all Data Rubrics for a session
   * Creates rubrics for all container/subject combinations
   *
   * @param enrichedNarrative - The enriched master narrative
   * @param storyRubric - The story rubric with narrative context
   * @param skills - Skills to be taught (one per subject)
   * @returns Array of Data Rubrics (12 total: 3 containers × 4 subjects)
   */
  generateAllDataRubrics(
    enrichedNarrative: EnrichedMasterNarrative,
    storyRubric: StoryRubric,
    skills: Record<Subject, SkillReference>
  ): DataRubric[] {
    console.log('📋 Generating all Data Rubrics for session');

    const containers: ContainerType[] = ['LEARN', 'EXPERIENCE', 'DISCOVER'];
    const subjects: Subject[] = ['Math', 'ELA', 'Science', 'Social Studies'];

    const rubrics: DataRubric[] = [];

    for (const container of containers) {
      for (const subject of subjects) {
        const rubric = this.generateDataRubric(
          enrichedNarrative,
          storyRubric,
          container,
          subject,
          skills[subject]
        );
        rubrics.push(rubric);
      }
    }

    console.log(`✅ Generated ${rubrics.length} Data Rubrics`);

    return rubrics;
  }

  /**
   * Generate a single Data Rubric
   * Creates rubric for specific container/subject combination
   *
   * @param enrichedNarrative - The enriched master narrative
   * @param storyRubric - The story rubric with narrative context
   * @param container - Container type (LEARN/EXPERIENCE/DISCOVER)
   * @param subject - Subject (Math/ELA/Science/Social Studies)
   * @param skill - Skill to be taught
   * @returns Data Rubric for JIT consumption
   */
  generateDataRubric(
    enrichedNarrative: EnrichedMasterNarrative,
    storyRubric: StoryRubric,
    container: ContainerType,
    subject: Subject,
    skill: SkillReference
  ): DataRubric {

    // Extract story context for this container/subject
    const storyContext = this.extractStoryContext(storyRubric, container, subject);

    // Define data requirements based on container type
    const dataRequirements = this.getDataRequirements(container);

    // Generate JIT prompt for this container/subject/skill
    const jitPrompt = this.generateJITPrompt(
      container,
      subject,
      skill,
      storyContext,
      enrichedNarrative
    );

    // Construct Data Rubric
    const dataRubric: DataRubric = {
      sessionId: enrichedNarrative.sessionId,
      container,
      subject,
      skill,

      storyContext,
      dataRequirements,
      jitPrompt,

      // No adaptation data for LEARN (first container)
      // Will be populated after LEARN completes for EXPERIENCE
      // Will be populated after EXPERIENCE completes for DISCOVER
      adaptationData: container === 'LEARN' ? null : {
        performanceFromPreviousContainer: null,
        adaptationRules: null,
        lastUpdated: null
      },

      // Generated content will be populated by JIT
      generatedContent: null,
      completedAt: null,
      performance: null
    };

    return dataRubric;
  }

  /**
   * Extract Story Context from Story Rubric
   * Provides narrative framing for this specific container/subject
   */
  private extractStoryContext(
    storyRubric: StoryRubric,
    container: ContainerType,
    subject: Subject
  ): StoryContext {
    const { narrativeArc, careerNarrative, companionVoice, subjectNarratives, containerTransitions } = storyRubric.storyContext;

    // Get container-specific transition
    let narrativeSetup: string;
    switch (container) {
      case 'LEARN':
        narrativeSetup = containerTransitions.toLEARN;
        break;
      case 'EXPERIENCE':
        narrativeSetup = containerTransitions.toEXPERIENCE;
        break;
      case 'DISCOVER':
        narrativeSetup = containerTransitions.toDISCOVER;
        break;
    }

    // Get subject narrative
    const subjectNarrative = subjectNarratives[subject];

    return {
      narrativeSetup,
      careerContext: subjectNarrative.narrativeBridge,
      workplaceSetting: careerNarrative.workplaceSettings[container],
      companionVoice: companionVoice.teachingVoice
    };
  }

  /**
   * Get Data Requirements for Container Type
   * Defines the structure JIT must generate
   */
  private getDataRequirements(container: ContainerType): DataRequirements {
    switch (container) {
      case 'LEARN':
        return this.getLEARNRequirements();
      case 'EXPERIENCE':
        return this.getEXPERIENCERequirements();
      case 'DISCOVER':
        return this.getDISCOVERRequirements();
    }
  }

  /**
   * LEARN Container Data Requirements
   * Video + 3 practice questions + 1 assessment question
   */
  private getLEARNRequirements(): LEARNDataRequirements {
    return {
      containerType: 'LEARN',

      video: {
        required: true,
        structure: {
          title: 'string',
          videoUrl: 'string | null',
          videoId: 'string | null',
          duration: 'number',
          thumbnailUrl: 'string',
          channelTitle: 'string',
          fallbackMessage: 'string'
        }
      },

      practice: {
        count: 3,
        structure: {
          type: "'counting' | 'multiple_choice' | 'true_false' | 'fill_blank'",
          question: 'string',
          visual: 'string (emoji or description)',
          options: 'string[] (if multiple_choice)',
          correct_answer: 'number | string',
          hint: 'string',
          explanation: 'string',
          practiceSupport: 'PracticeSupportStructure (only for practice, not assessment)'
        }
      },

      assessment: {
        count: 1,
        structure: {
          type: "'counting' | 'multiple_choice' | 'true_false' | 'fill_blank'",
          question: 'string',
          visual: 'string (emoji or description)',
          options: 'string[] (if multiple_choice)',
          correct_answer: 'number | string',
          hint: 'string',
          explanation: 'string',
          practiceSupport: 'PracticeSupportStructure (only for practice, not assessment)'
        }
      }
    };
  }

  /**
   * EXPERIENCE Container Data Requirements
   * 3 example scenarios + 2 practice scenarios + 1 assessment scenario
   */
  private getEXPERIENCERequirements(): EXPERIENCEDataRequirements {
    return {
      containerType: 'EXPERIENCE',

      scenarios: {
        examples: {
          count: 3,
          structure: {
            scenarioType: "'example' | 'practice' | 'assessment'",
            title: 'string',
            narrativeSetup: 'string',
            situation: 'string',
            decision: 'string',
            options: 'string[] (4 options)',
            correct_answer: 'number (index)',
            explanation: 'string',
            consequences: {
              chosen: 'string',
              alternative: 'string'
            },
            practiceSupport: 'PracticeSupportStructure (not for assessment)'
          }
        },
        practice: {
          count: 2,
          structure: {
            scenarioType: "'example' | 'practice' | 'assessment'",
            title: 'string',
            narrativeSetup: 'string',
            situation: 'string',
            decision: 'string',
            options: 'string[] (4 options)',
            correct_answer: 'number (index)',
            explanation: 'string',
            consequences: {
              chosen: 'string',
              alternative: 'string'
            },
            practiceSupport: 'PracticeSupportStructure (not for assessment)'
          }
        },
        assessment: {
          count: 1,
          structure: {
            scenarioType: "'example' | 'practice' | 'assessment'",
            title: 'string',
            narrativeSetup: 'string',
            situation: 'string',
            decision: 'string',
            options: 'string[] (4 options)',
            correct_answer: 'number (index)',
            explanation: 'string',
            consequences: {
              chosen: 'string',
              alternative: 'string'
            },
            practiceSupport: 'PracticeSupportStructure (not for assessment)'
          }
        }
      }
    };
  }

  /**
   * DISCOVER Container Data Requirements
   * Unified scenario + 4 discovery stations (one per subject)
   */
  private getDISCOVERRequirements(): DISCOVERDataRequirements {
    return {
      containerType: 'DISCOVER',

      unifiedScenario: {
        required: true,
        structure: {
          title: 'string',
          narrativeSetup: 'string',
          challenge: 'string',
          careerConnection: 'string'
        }
      },

      discoveryStations: {
        count: 4,
        structure: {
          subject: 'Subject',
          stationTitle: 'string',
          question: 'string',
          options: 'string[]',
          correct_answer: 'number',
          explanation: 'string',
          hint: 'string',
          activity: {
            type: 'string',
            description: 'string',
            prompt: 'string',
            supportingData: 'string'
          }
        }
      }
    };
  }

  /**
   * Generate JIT Prompt for content generation
   * Creates the prompt template AI will use to generate content
   */
  private generateJITPrompt(
    container: ContainerType,
    subject: Subject,
    skill: SkillReference,
    storyContext: StoryContext,
    enrichedNarrative: EnrichedMasterNarrative
  ): JITPrompt {

    const systemPrompt = this.buildSystemPrompt(container, subject, storyContext);
    const userPrompt = this.buildUserPrompt(container, subject, skill, storyContext, enrichedNarrative);
    const variables = this.buildVariables(container, subject, skill, enrichedNarrative);

    return {
      systemPrompt,
      userPrompt,
      variables
    };
  }

  /**
   * Build System Prompt for JIT
   * Defines AI's role and constraints
   */
  private buildSystemPrompt(
    container: ContainerType,
    subject: Subject,
    storyContext: StoryContext
  ): string {
    return `You are an expert educational content generator for the ${container} container.

Your role is to create engaging, age-appropriate content that:
1. Teaches ${subject} skills through career-based narratives
2. Maintains story consistency with the narrative arc
3. Uses the companion's teaching voice: "${storyContext.companionVoice}"
4. Sets activities in the workplace: "${storyContext.workplaceSetting}"
5. Connects learning to career context: "${storyContext.careerContext}"

IMPORTANT: Follow the companion's voice and maintain story consistency with the narrative arc.

Generate content that matches the exact data structure requirements provided.
Ensure all questions, hints, and explanations align with each other (intra-rubric consistency).`;
  }

  /**
   * Get Age-Appropriate Guidance
   * Provides specific examples and constraints for each grade level
   */
  private getAgeAppropriateGuidance(gradeLevel: string, subject: string): string {
    const grade = gradeLevel.toUpperCase();

    // Grade-specific guidance
    const guidanceMap: Record<string, string> = {
      'K': `AGE-APPROPRIATE CONTENT FOR KINDERGARTEN (Ages 5-6):
- Math: Numbers 1-10, basic counting, simple shapes, comparing sizes (bigger/smaller)
- ELA: Letter recognition, simple 3-4 word sentences, basic rhyming
- Science: Observable properties (color, texture), simple cause-effect, five senses
- Social Studies: Family roles, basic rules, kindness concepts
- Use concrete, visual examples with emojis and pictures
- Questions should have simple, one-concept answers
- Avoid: Multiplication, division, complex calculations, reading comprehension beyond single sentences
- Example Math Question: "How many apples are in this picture? 🍎🍎🍎" (Options: 1, 2, 3, 4)`,

      'PRE-K': `AGE-APPROPRIATE CONTENT FOR PRE-KINDERGARTEN (Ages 4-5):
- Math: Numbers 1-5, basic counting objects, identifying shapes (circle, square)
- ELA: Letter sounds, 2-3 word phrases, picture identification
- Science: Basic observations (hot/cold, wet/dry), simple patterns
- Social Studies: Self-identity, sharing, basic emotions
- Use very simple language and lots of visuals
- Questions should be concrete and observable
- Example: "Which shape is a circle? ⭕ ▢ △"`,

      '1': `AGE-APPROPRIATE CONTENT FOR GRADE 1 (Ages 6-7):
- Math: Addition/subtraction within 20, telling time (hour), counting to 100, basic place value
- ELA: Simple sentences (5-7 words), basic punctuation, sight words
- Science: Life cycles (plants, animals), simple weather patterns, basic materials
- Social Studies: Community helpers, maps (neighborhood), basic history (past/present)
- Use clear, simple language with relatable examples
- Avoid: Fractions beyond halves, complex word problems requiring multiple steps`,

      '2': `AGE-APPROPRIATE CONTENT FOR GRADE 2 (Ages 7-8):
- Math: Addition/subtraction within 100, basic multiplication (2s, 5s, 10s), simple fractions (halves, quarters), money counting
- ELA: Short paragraphs, basic grammar, simple stories with beginning/middle/end
- Science: Simple experiments, basic ecosystems, states of matter
- Social Studies: U.S. symbols, geographic features, community organization
- Use age-appropriate vocabulary with context clues`,

      '3': `AGE-APPROPRIATE CONTENT FOR GRADE 3 (Ages 8-9):
- Math: Multiplication/division, fractions (comparing), area/perimeter, basic graphs
- ELA: Multi-paragraph writing, main idea/details, basic research skills
- Science: Scientific method (simple), ecosystems, simple machines
- Social Studies: Geographic regions, basic economics, historical timelines
- Introduce abstract concepts with concrete examples`,

      '4': `AGE-APPROPRIATE CONTENT FOR GRADE 4 (Ages 9-10):
- Math: Multi-digit multiplication, equivalent fractions, decimals to hundredths, basic geometry
- ELA: Essay structure, literary elements, research with multiple sources
- Science: Energy transfer, life science cycles, earth systems
- Social Studies: State history, U.S. regions, basic government structure`,

      '5': `AGE-APPROPRIATE CONTENT FOR GRADE 5 (Ages 10-11):
- Math: Decimal operations, fraction operations, volume, coordinate planes
- ELA: Argumentative writing, literary analysis, summarizing complex texts
- Science: Scientific inquiry, complex systems, human body systems
- Social Studies: U.S. history periods, economic systems, map skills (latitude/longitude)`,

      '6': `AGE-APPROPRIATE CONTENT FOR GRADE 6 (Ages 11-12):
- Math: Ratios, percentages, basic algebra (variables), statistical graphs
- ELA: Formal essay writing, text structure analysis, citing sources
- Science: Cell biology, physical science principles, Earth's systems
- Social Studies: Ancient civilizations, world geography, cultural studies`,

      '7-8': `AGE-APPROPRIATE CONTENT FOR GRADES 7-8 (Ages 12-14):
- Math: Linear equations, probability, geometry theorems, data analysis
- ELA: Research papers, literary devices, complex argumentative writing
- Science: Chemical reactions, genetics, physics basics, environmental science
- Social Studies: World history, civic participation, economic principles
- Use more abstract reasoning and multi-step problems`,

      '9-10': `AGE-APPROPRIATE CONTENT FOR GRADES 9-10 (Ages 14-16):
- Math: Algebra I/II, geometry proofs, trigonometry basics, functions
- ELA: Literary analysis, research synthesis, formal academic writing
- Science: Chemistry, biology (advanced), physics, scientific method (hypothesis testing)
- Social Studies: World history, U.S. government, economics, global issues
- Encourage critical thinking and real-world application`,

      '11-12': `AGE-APPROPRIATE CONTENT FOR GRADES 11-12 (Ages 16-18):
- Math: Advanced algebra, calculus basics, statistics, mathematical modeling
- ELA: Rhetorical analysis, complex argumentation, college-level writing
- Science: Advanced chemistry/physics, AP-level concepts, research design
- Social Studies: Complex political systems, global economics, historical analysis
- Focus on college/career readiness and independent thinking`
    };

    // Map grade levels to guidance
    if (grade === 'K' || grade === 'KINDERGARTEN') return guidanceMap['K'];
    if (grade === 'PRE-K' || grade === 'PREK') return guidanceMap['PRE-K'];
    if (['1', '2', '3', '4', '5', '6'].includes(grade)) return guidanceMap[grade];
    if (['7', '8'].includes(grade)) return guidanceMap['7-8'];
    if (['9', '10'].includes(grade)) return guidanceMap['9-10'];
    if (['11', '12'].includes(grade)) return guidanceMap['11-12'];

    // Default fallback
    return `AGE-APPROPRIATE CONTENT GUIDANCE:
- Create content suitable for grade ${gradeLevel}
- Use appropriate vocabulary and concepts for this age group
- Ensure questions match developmental capabilities`;
  }

  /**
   * Build User Prompt for JIT
   * Specific instructions for content generation
   */
  private buildUserPrompt(
    container: ContainerType,
    subject: Subject,
    skill: SkillReference,
    storyContext: StoryContext,
    enrichedNarrative: EnrichedMasterNarrative
  ): string {
    // Age-appropriate guidance based on grade level
    const ageGuidance = this.getAgeAppropriateGuidance(skill.gradeLevel, subject);

    const basePrompt = `Generate ${container} container content for ${subject}.

SKILL TO TEACH:
- Skill: ${skill.name} (${skill.id})
- Description: ${skill.description}
- Grade Level: ${skill.gradeLevel}

${ageGuidance}

NARRATIVE CONTEXT:
${storyContext.narrativeSetup}

CAREER CONNECTION:
${storyContext.careerContext}

COMPANION VOICE:
${storyContext.companionVoice}

WORKPLACE SETTING:
${storyContext.workplaceSetting}

STUDENT NAME: ${enrichedNarrative.studentName}
CAREER: ${enrichedNarrative.career}
COMPANION: ${enrichedNarrative.companion}`;

    // Add container-specific instructions
    switch (container) {
      case 'LEARN':
        return `${basePrompt}

GENERATE:
1. Create 3 practice questions with hints and explanations
2. Create 1 assessment question (no practice support)

Return ONLY valid JSON in this EXACT structure (no markdown, no code blocks).
Replace placeholder comments with actual values:
{
  "practice": [
    {
      "type": "counting",
      "question": "How many apples are there?",
      "visual": "🍎🍎🍎",
      "options": ["1", "2", "3", "4"],
      "correct_answer": "3",
      "hint": "Count each apple one by one",
      "explanation": "There are 3 apples shown",
      "practiceSupport": {
        "scaffoldingLevel": "high",
        "hintProgression": ["Point to each apple", "Count aloud: 1, 2, 3"],
        "errorSupport": "Let's count together slowly"
      }
    },
    {
      "type": "multiple_choice",
      "question": "Second practice question here",
      "visual": "emoji or description",
      "options": ["choice1", "choice2", "choice3", "choice4"],
      "correct_answer": 0,
      "hint": "helpful hint",
      "explanation": "why this answer is correct",
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "hintProgression": ["first hint", "second hint"],
        "errorSupport": "guidance for wrong answers"
      }
    },
    {
      "type": "multiple_choice",
      "question": "Third practice question here",
      "visual": "emoji or description",
      "options": ["choice1", "choice2", "choice3", "choice4"],
      "correct_answer": 1,
      "hint": "helpful hint",
      "explanation": "explanation of correct answer",
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "hintProgression": ["hint1", "hint2"],
        "errorSupport": "support text"
      }
    }
  ],
  "assessment": {
    "type": "multiple_choice",
    "question": "Assessment question here (harder, no practice support)",
    "visual": "emoji or description",
    "options": ["choice1", "choice2", "choice3", "choice4"],
    "correct_answer": 2,
    "hint": "subtle hint only",
    "explanation": "detailed explanation of the answer",
    "success_message": "Great work! You've mastered this skill!"
  }
}

CRITICAL FORMAT REQUIREMENTS:
- The "options" array MUST contain ONLY text strings, never objects or images
- DO NOT create picture identification questions like "Which picture shows..."
- DO NOT generate options with {image, description} or any object structure
- The "visual" field is for emojis/descriptions to accompany the QUESTION, not the answer options
- All answer choices must be readable text that students can understand without images
- Example: Good question: "What is a community?" Bad question: "Which picture shows a community?"

MULTIPLE CHOICE ANSWER VALIDATION:
- Each multiple choice question MUST have EXACTLY ONE correct answer
- Carefully check that only ONE option matches the question criteria
- Example INCORRECT: "Find the uppercase letter: 'D', 'd', 'e', 'E'" (both D and E are uppercase - TWO correct answers)
- Example CORRECT: "Find the uppercase letter: 'A', 'b', 'c', 'd'" (only A is uppercase - ONE correct answer)
- For letter recognition: ensure only one letter matches the criteria (uppercase/lowercase/specific letter)
- For number questions: ensure only one option is the correct answer
- Double-check each question before including it in the response

FILL_BLANK QUESTION REQUIREMENTS:
- For type "fill_blank", provide a COMPLETE SENTENCE with one key term to be blanked out
- DO NOT provide incomplete sentences ending with "..." or trailing articles like "the", "a", "an"
- Example INCORRECT: "Doctors work with others in the..." (incomplete - ends with "the...")
- Example CORRECT: "Doctors work with others in the hospital" (complete sentence)
- The system will automatically convert your complete sentence into a fill-in-the-blank question
- CRITICAL: You MUST provide the "options" array with exactly 4 choices
- The "options" array MUST include the correct answer and 3 contextually-appropriate distractors
- DO NOT rely on the system to generate options - YOU must provide them
- Example format:
  {
    "type": "fill_blank",
    "question": "Doctors work with others in the hospital",
    "correct_answer": "hospital",
    "options": ["hospital", "school", "store", "park"],
    "explanation": "Doctors work in hospitals where they care for patients"
  }
- Options should be single words or short phrases that could grammatically fit in the blank
- Make distractors plausible but clearly distinguishable from the correct answer
- Example INCORRECT options: ["answer", "solution", "result", "response"] (too generic)
- Example CORRECT options: ["hospital", "clinic", "pharmacy", "office"] (contextually related)

IMPORTANT: Provide exactly 3 practice questions and 1 assessment question with actual content.`;

      case 'EXPERIENCE':
        return `${basePrompt}

GENERATE:
1. Create 3 example scenarios (with step-by-step guidance)
2. Create 2 practice scenarios (with hints)
3. Create 1 assessment scenario (no practice support)

Return ONLY valid JSON in this EXACT structure (no markdown, no code blocks).
Replace placeholders with actual scenario content:
{
  "scenarios": {
    "examples": [
      {
        "scenarioType": "example",
        "title": "Example 1: Real scenario title",
        "narrativeSetup": "Story introduction for this scenario",
        "situation": "Describe the specific situation",
        "decision": "What decision must be made?",
        "options": ["First option", "Second option", "Third option", "Fourth option"],
        "correct_answer": 0,
        "explanation": "Why this choice is correct and what it demonstrates",
        "consequences": {
          "chosen": "Positive outcome from correct choice",
          "alternative": "What happens with other choices"
        },
        "practiceSupport": {
          "scaffoldingLevel": "high",
          "guidedWalkthrough": "Step 1: ..., Step 2: ..., Step 3: ..."
        }
      },
      {
        "scenarioType": "example",
        "title": "Example 2: Another scenario",
        "narrativeSetup": "story",
        "situation": "situation",
        "decision": "decision",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct_answer": 1,
        "explanation": "explanation",
        "consequences": { "chosen": "result", "alternative": "alternative" },
        "practiceSupport": { "scaffoldingLevel": "high", "guidedWalkthrough": "steps" }
      },
      {
        "scenarioType": "example",
        "title": "Example 3",
        "narrativeSetup": "story",
        "situation": "situation",
        "decision": "decision",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct_answer": 2,
        "explanation": "explanation",
        "consequences": { "chosen": "result", "alternative": "alternative" },
        "practiceSupport": { "scaffoldingLevel": "high", "guidedWalkthrough": "steps" }
      }
    ],
    "practice": [
      {
        "scenarioType": "practice",
        "title": "Practice 1",
        "narrativeSetup": "story",
        "situation": "situation",
        "decision": "decision",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct_answer": 0,
        "explanation": "explanation",
        "consequences": { "chosen": "result", "alternative": "alternative" },
        "practiceSupport": { "scaffoldingLevel": "medium", "hintProgression": ["hint1", "hint2"] }
      },
      {
        "scenarioType": "practice",
        "title": "Practice 2",
        "narrativeSetup": "story",
        "situation": "situation",
        "decision": "decision",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct_answer": 1,
        "explanation": "explanation",
        "consequences": { "chosen": "result", "alternative": "alternative" },
        "practiceSupport": { "scaffoldingLevel": "medium", "hintProgression": ["hint1", "hint2"] }
      }
    ],
    "assessment": [
      {
        "scenarioType": "assessment",
        "title": "Assessment Scenario",
        "narrativeSetup": "story",
        "situation": "challenging situation",
        "decision": "decision to make",
        "options": ["opt1", "opt2", "opt3", "opt4"],
        "correct_answer": 2,
        "explanation": "detailed explanation",
        "consequences": { "chosen": "result", "alternative": "alternative" }
      }
    ]
  }
}

CRITICAL FORMAT REQUIREMENTS:
- The "options" array MUST contain ONLY text strings, never objects or images
- DO NOT create picture identification scenarios like "Which picture shows..."
- DO NOT generate options with {image, description} or any object structure
- All decision choices must be readable text that students can understand without images
- Example: Good decision: "Help a friend who is struggling" Bad decision: "Choose the picture that shows helping"

IMPORTANT: Provide exactly 3 examples, 2 practice, and 1 assessment scenario with actual content.`;

      case 'DISCOVER':
        return `${basePrompt}

CHARACTER ROLES FOR DISCOVER CONTAINER:
- The STUDENT (${enrichedNarrative.studentName}) takes on the role of the CAREER PROFESSIONAL in the narrative
- Example: "Firefighter ${enrichedNarrative.studentName}" where the student IS the firefighter
- The COMPANION (${enrichedNarrative.companion}) is an AI guide who accompanies the student
- There are ONLY 4 companions: Finn, Spark, Sage, Harmony - NEVER invent other companion names
- NEVER combine roles: "Firefighter ${enrichedNarrative.companion}" is WRONG - the companion guides, doesn't become the firefighter
- Correct: "${enrichedNarrative.companion} says, 'As ${enrichedNarrative.career} ${enrichedNarrative.studentName}, you'll need to...'"

GENERATE:
1. Create unified scenario that ties all subjects together
2. Create 4 discovery stations (one per subject: Math, ELA, Science, Social Studies)

Return ONLY valid JSON in this EXACT structure (no markdown, no code blocks).
Replace placeholders with actual discovery content:
{
  "unifiedScenario": {
    "title": "Real scenario title connecting all subjects",
    "narrativeSetup": "Engaging story where the student (${enrichedNarrative.studentName}) takes on the ${enrichedNarrative.career} role, with companion (${enrichedNarrative.companion}) as their guide.",
    "challenge": "The main challenge students will solve across all stations",
    "careerConnection": "How this relates to the career and real-world application"
  },
  "discoveryStations": [
    {
      "subject": "Math",
      "stationTitle": "Math Station Name",
      "question": "The actual quiz question students will answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Why this answer is correct and how it relates to the career",
      "hint": "Helpful hint if student needs guidance",
      "activity": {
        "type": "investigation",
        "description": "Context about what students are discovering",
        "prompt": "Instructions for approaching this discovery",
        "supportingData": "Visual aids, data, or resources provided"
      },
      "deliverable": {
        "type": "solution",
        "description": "What the student will create/present",
        "assessmentCriteria": ["Criterion 1", "Criterion 2", "Criterion 3"]
      },
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "resourcesProvided": ["Resource 1", "Resource 2"]
      }
    },
    {
      "subject": "ELA",
      "stationTitle": "ELA Station Name",
      "question": "The actual quiz question students will answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 1,
      "explanation": "Why this answer is correct and how it relates to the career",
      "hint": "Helpful hint if student needs guidance",
      "activity": {
        "type": "creation",
        "description": "Context about what students are discovering",
        "prompt": "Instructions for approaching this discovery",
        "supportingData": "Visual aids, data, or resources provided"
      },
      "deliverable": {
        "type": "document",
        "description": "what to create",
        "assessmentCriteria": ["criterion1", "criterion2", "criterion3"]
      },
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "resourcesProvided": ["resource1", "resource2"]
      }
    },
    {
      "subject": "Science",
      "stationTitle": "Science Station Name",
      "question": "The actual quiz question students will answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 2,
      "explanation": "Why this answer is correct and how it relates to the career",
      "hint": "Helpful hint if student needs guidance",
      "activity": {
        "type": "exploration",
        "description": "Context about what students are discovering",
        "prompt": "Instructions for approaching this discovery",
        "supportingData": "Visual aids, data, or resources provided"
      },
      "deliverable": {
        "type": "presentation",
        "description": "what to present",
        "assessmentCriteria": ["criterion1", "criterion2", "criterion3"]
      },
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "resourcesProvided": ["resource1", "resource2"]
      }
    },
    {
      "subject": "Social Studies",
      "stationTitle": "Social Studies Station Name",
      "question": "The actual quiz question students will answer",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 3,
      "explanation": "Why this answer is correct and how it relates to the career",
      "hint": "Helpful hint if student needs guidance",
      "activity": {
        "type": "analysis",
        "description": "Context about what students are discovering",
        "prompt": "Instructions for approaching this discovery",
        "supportingData": "Visual aids, data, or resources provided"
      },
      "deliverable": {
        "type": "artifact",
        "description": "what to create",
        "assessmentCriteria": ["criterion1", "criterion2", "criterion3"]
      },
      "practiceSupport": {
        "scaffoldingLevel": "medium",
        "resourcesProvided": ["resource1", "resource2"]
      }
    }
  ]
}

CRITICAL FORMAT REQUIREMENTS:
- The "options" array MUST contain ONLY text strings, never objects or images
- DO NOT create picture identification questions like "Which picture shows..."
- DO NOT generate options with {image, description} or any object structure
- All answer choices must be readable text that students can understand without images
- Example: Good question: "What is a community?" Bad question: "Which picture shows a community?"

SUPPORTING DATA REQUIREMENTS:
- The "supportingData" field MUST contain the ACTUAL CONTENT that students will investigate, NOT descriptions of what could be provided
- DO NOT write meta-text like "Examples of patient notes" or "Visual aids showing..."
- DO provide the complete, real data that answers the question
- Example INCORRECT: "supportingData": "Examples of short patient notes: 1) Patient needs water, 2) Patient needs rest"
- Example CORRECT: "supportingData": "PATIENT NOTE A: Temperature 98.6°F, needs water and rest. PATIENT NOTE B: Temperature 102°F, needs fever medicine. PATIENT NOTE C: Minor cut on hand, needs bandage. PATIENT NOTE D: Upset stomach, needs food and observation."
- For reading tasks: provide the full text passage students must read
- For data analysis: provide the complete dataset or chart information as text
- For investigation tasks: provide all the evidence/clues students need to examine
- Students should be able to read the supportingData and find the answer to the question
- The supportingData is the PRIMARY RESOURCE - questions ask students to analyze this data

IMPORTANT: Provide unified scenario and exactly 4 discoveryStations (one per subject) with actual content.`;

      default:
        return basePrompt;
    }
  }

  /**
   * Build Variables for JIT Prompt
   * Contextual data for prompt substitution
   */
  private buildVariables(
    container: ContainerType,
    subject: Subject,
    skill: SkillReference,
    enrichedNarrative: EnrichedMasterNarrative
  ): Record<string, any> {
    return {
      container,
      subject,
      skillId: skill.id,
      skillName: skill.name,
      skillDescription: skill.description,
      gradeLevel: skill.gradeLevel,
      studentName: enrichedNarrative.studentName,
      career: enrichedNarrative.career,
      companion: enrichedNarrative.companion,
      sessionId: enrichedNarrative.sessionId
    };
  }
}

// Export singleton instance
export const dataRubricTemplateService = new DataRubricTemplateService();
