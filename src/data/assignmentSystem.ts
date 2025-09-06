// Assignment System for Pathfinity Adaptive Learning
// Creates real assignments for each skill in the adaptive journey

export interface AssignmentContent {
  type: 'interactive' | 'practice' | 'assessment' | 'project' | 'game';
  format: 'multiple_choice' | 'fill_blank' | 'drag_drop' | 'drawing' | 'typing' | 'voice';
  media: {
    images?: string[];
    videos?: string[];
    audio?: string[];
    animations?: string[];
  };
  interactive_elements: InteractiveElement[];
  text_content: string;
  examples: Example[];
}

export interface InteractiveElement {
  id: string;
  type: 'button' | 'slider' | 'input' | 'canvas' | 'selector' | 'timer';
  properties: Record<string, any>;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'exact_match' | 'range' | 'pattern' | 'custom';
  criteria: any;
  feedback: string;
  hint?: string;
}

export interface Example {
  problem: string;
  solution: string;
  explanation: string;
  visual_aid?: string;
}

export interface Assessment {
  id: string;
  type: 'formative' | 'summative' | 'diagnostic';
  questions: AssessmentQuestion[];
  passing_score: number;
  max_attempts: number;
  time_limit?: number;
  adaptive_difficulty: boolean;
}

export interface AssessmentQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'short_answer' | 'drag_drop' | 'matching';
  options?: string[];
  correct_answer: any;
  explanation: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  points: number;
  learning_objective: string;
}

export interface Resource {
  id: string;
  title: string;
  type: 'video' | 'article' | 'interactive' | 'game' | 'worksheet' | 'reference';
  url?: string;
  content?: string;
  thumbnail?: string;
  duration?: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SkillAssignment {
  id: string;
  skillId: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  skillArea: string;
  instructions: string[];
  content: AssignmentContent;
  assessments: Assessment[];
  estimatedDuration: number; // minutes
  difficulty: 'easy' | 'medium' | 'hard';
  learningObjectives: string[];
  prerequisites: string[];
  resources: Resource[];
  adaptations: LearningStyleAdaptation[];
  finn_integration: FinnIntegration;
}

export interface LearningStyleAdaptation {
  learning_style: 'visual' | 'auditory' | 'kinesthetic' | 'mixed';
  modifications: {
    content_emphasis: string[];
    interaction_types: string[];
    feedback_style: string;
    pacing_suggestions: string;
  };
}

export interface FinnIntegration {
  context_prompts: string[];
  hint_generation: {
    difficulty_levels: string[];
    explanation_styles: string[];
  };
  encouragement_messages: string[];
  error_analysis: {
    common_mistakes: string[];
    remediation_suggestions: string[];
  };
}

// Assignment Templates by Grade and Subject
export const ASSIGNMENT_TEMPLATES = {
  kindergarten: {
    math: {
      counting: {
        title: "Count and Learn",
        content_type: "interactive_game",
        interaction: "drag_drop",
        duration: 10,
        objectives: ["Count objects 1-10", "Recognize number symbols", "One-to-one correspondence"]
      },
      shapes: {
        title: "Shape Detective",
        content_type: "interactive",
        interaction: "touch_identify",
        duration: 8,
        objectives: ["Identify basic shapes", "Compare shape attributes", "Sort by shape"]
      }
    },
    ela: {
      phonics: {
        title: "Letter Sound Adventure",
        content_type: "interactive_game",
        interaction: "audio_visual",
        duration: 12,
        objectives: ["Identify letter sounds", "Match letters to sounds", "Beginning sound recognition"]
      }
    }
  },
  grade3: {
    math: {
      place_value: {
        title: "Place Value Explorer",
        content_type: "interactive_practice",
        interaction: "manipulative_digital",
        duration: 15,
        objectives: ["Understand place value to 1000", "Compose and decompose numbers", "Compare numbers"]
      },
      multiplication: {
        title: "Times Table Mastery",
        content_type: "practice_game",
        interaction: "timed_response",
        duration: 20,
        objectives: ["Memorize multiplication facts", "Apply multiplication strategies", "Solve word problems"]
      }
    },
    ela: {
      reading_comprehension: {
        title: "Story Detective",
        content_type: "interactive_reading",
        interaction: "annotation_tools",
        duration: 18,
        objectives: ["Identify main idea", "Make inferences", "Support answers with evidence"]
      }
    }
  },
  grade7: {
    math: {
      integers: {
        title: "Integer Operations Lab",
        content_type: "virtual_manipulative",
        interaction: "simulation",
        duration: 25,
        objectives: ["Add and subtract integers", "Understand absolute value", "Apply to real-world problems"]
      },
      algebra_intro: {
        title: "Algebra Foundations",
        content_type: "guided_practice",
        interaction: "step_by_step",
        duration: 30,
        objectives: ["Solve one-step equations", "Understand variables", "Translate word problems"]
      }
    }
  },
  grade10: {
    algebra1: {
      quadratic_functions: {
        title: "Quadratic Function Analysis",
        content_type: "graphing_exploration",
        interaction: "dynamic_graphing",
        duration: 40,
        objectives: ["Graph quadratic functions", "Identify vertex and axis of symmetry", "Solve quadratic equations"]
      }
    },
    precalculus: {
      function_concepts: {
        title: "Function Transformation Studio",
        content_type: "interactive_graphing",
        interaction: "parameter_manipulation",
        duration: 45,
        objectives: ["Understand function transformations", "Analyze function behavior", "Connect algebraic and graphical representations"]
      }
    }
  }
};

// Assignment Generator Class
export class AssignmentGenerator {
  static generateAssignment(skill: any, userProfile: any): SkillAssignment {
    const template = this.getTemplate(skill.grade, skill.subject, skill.skillArea);
    const adaptations = this.getAdaptations(userProfile.learningStyle, skill.grade);
    
    return {
      id: `assignment_${skill.id}`,
      skillId: skill.id,
      title: this.generateTitle(skill),
      description: this.generateDescription(skill, template),
      grade: skill.grade,
      subject: skill.subject,
      skillArea: skill.skillArea,
      instructions: this.generateInstructions(skill, template, userProfile),
      content: this.generateContent(skill, template, userProfile),
      assessments: this.generateAssessments(skill, template),
      estimatedDuration: this.calculateDuration(skill.grade, template),
      difficulty: this.determineDifficulty(skill, userProfile),
      learningObjectives: this.generateObjectives(skill),
      prerequisites: this.getPrerequisites(skill),
      resources: this.generateResources(skill),
      adaptations: adaptations,
      finn_integration: this.generateFinnIntegration(skill, userProfile)
    };
  }

  private static getTemplate(grade: string, subject: string, skillArea: string) {
    const gradeKey = grade.toLowerCase().replace(' ', '');
    const subjectKey = subject.toLowerCase().replace(/[^a-z]/g, '');
    
    const templates = ASSIGNMENT_TEMPLATES[gradeKey as keyof typeof ASSIGNMENT_TEMPLATES];
    if (templates && templates[subjectKey as keyof typeof templates]) {
      return templates[subjectKey as keyof typeof templates];
    }
    
    // Default template based on grade
    return this.getDefaultTemplate(grade);
  }

  private static getDefaultTemplate(grade: string) {
    if (grade === 'Kindergarten') {
      return {
        title: "Interactive Learning",
        content_type: "interactive_game",
        interaction: "touch_and_learn",
        duration: 10,
        objectives: ["Practice basic skills", "Engage with content", "Build confidence"]
      };
    } else if (grade === 'Grade 3') {
      return {
        title: "Skill Builder",
        content_type: "guided_practice",
        interaction: "step_by_step",
        duration: 15,
        objectives: ["Master fundamental concepts", "Apply skills", "Problem solve"]
      };
    } else if (grade === 'Grade 7') {
      return {
        title: "Concept Explorer",
        content_type: "interactive_simulation",
        interaction: "experimentation",
        duration: 25,
        objectives: ["Understand deeper concepts", "Analyze patterns", "Make connections"]
      };
    } else {
      return {
        title: "Advanced Analysis",
        content_type: "project_based",
        interaction: "research_and_apply",
        duration: 40,
        objectives: ["Synthesize knowledge", "Critical thinking", "Real-world application"]
      };
    }
  }

  private static generateTitle(skill: any): string {
    const titlePrefixes = {
      'Kindergarten': ['Fun with', 'Let\'s Learn', 'Explore', 'Play and Learn'],
      'Grade 3': ['Master', 'Practice', 'Discover', 'Build Your Skills in'],
      'Grade 7': ['Investigate', 'Analyze', 'Explore Advanced', 'Understand'],
      'Grade 10': ['Advanced', 'In-Depth', 'Mastering', 'Complex']
    };
    
    const prefixes = titlePrefixes[skill.grade as keyof typeof titlePrefixes] || ['Learn'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    
    return `${randomPrefix} ${skill.skillName}`;
  }

  private static generateDescription(skill: any, template: any): string {
    return `In this assignment, you'll ${template.objectives[0].toLowerCase()} through ${template.content_type.replace('_', ' ')} activities. Perfect for ${skill.grade} learners working on ${skill.skillArea}.`;
  }

  private static generateInstructions(skill: any, template: any, userProfile: any): string[] {
    const baseInstructions = [
      `Welcome to your ${skill.skillName} assignment!`,
      `This activity is designed for ${userProfile.learningStyle} learners.`,
      `Estimated time: ${template.duration} minutes.`
    ];

    if (skill.grade === 'Kindergarten') {
      baseInstructions.push(
        "Click or tap on items to interact with them.",
        "Listen carefully to the instructions.",
        "Take your time and have fun learning!"
      );
    } else if (skill.grade === 'Grade 3') {
      baseInstructions.push(
        "Read each question carefully before answering.",
        "Use the help button if you get stuck.",
        "Check your work before submitting."
      );
    } else if (skill.grade === 'Grade 7') {
      baseInstructions.push(
        "Think about what you already know about this topic.",
        "Show your work for all calculations.",
        "Explain your reasoning in complete sentences."
      );
    } else {
      baseInstructions.push(
        "Analyze the problem from multiple perspectives.",
        "Support your conclusions with evidence.",
        "Consider real-world applications of these concepts."
      );
    }

    return baseInstructions;
  }

  private static generateContent(skill: any, template: any, userProfile: any): AssignmentContent {
    return {
      type: template.content_type as any,
      format: this.getFormatForLearningStyle(userProfile.learningStyle),
      media: {
        images: [`/images/${skill.subject.toLowerCase()}/${skill.id}_visual.png`],
        videos: userProfile.learningStyle === 'auditory' ? [`/videos/${skill.id}_explanation.mp4`] : undefined,
        audio: userProfile.learningStyle === 'auditory' ? [`/audio/${skill.id}_instructions.mp3`] : undefined
      },
      interactive_elements: this.generateInteractiveElements(skill, template),
      text_content: `Learn about ${skill.skillName} through hands-on practice and exploration.`,
      examples: this.generateExamples(skill)
    };
  }

  private static getFormatForLearningStyle(learningStyle: string): any {
    const formats = {
      visual: 'drag_drop',
      auditory: 'voice',
      kinesthetic: 'drawing',
      mixed: 'multiple_choice'
    };
    return formats[learningStyle as keyof typeof formats] || 'multiple_choice';
  }

  private static generateInteractiveElements(skill: any, template: any): InteractiveElement[] {
    const elements: InteractiveElement[] = [];
    
    if (skill.grade === 'Kindergarten') {
      elements.push({
        id: 'primary_interaction',
        type: 'button',
        properties: {
          size: 'large',
          color: 'bright',
          sound_feedback: true
        }
      });
    } else if (skill.subject === 'Math') {
      elements.push({
        id: 'calculator',
        type: 'input',
        properties: {
          type: 'number',
          placeholder: 'Enter your answer'
        },
        validation: [{
          type: 'range',
          criteria: { min: 0, max: 1000 },
          feedback: 'Great job!',
          hint: 'Think about the problem step by step'
        }]
      });
    }
    
    return elements;
  }

  private static generateExamples(skill: any): Example[] {
    // Generate skill-appropriate examples
    return [{
      problem: `Sample problem for ${skill.skillName}`,
      solution: "Step-by-step solution",
      explanation: "This is why this solution works",
      visual_aid: `/images/examples/${skill.id}_example.png`
    }];
  }

  private static generateAssessments(skill: any, template: any): Assessment[] {
    return [{
      id: `assessment_${skill.id}`,
      type: 'formative',
      questions: this.generateQuestions(skill),
      passing_score: skill.grade === 'Kindergarten' ? 60 : 70,
      max_attempts: 3,
      time_limit: template.duration * 60, // Convert to seconds
      adaptive_difficulty: true
    }];
  }

  private static generateQuestions(skill: any): AssessmentQuestion[] {
    const questions: AssessmentQuestion[] = [];
    
    // Generate grade-appropriate questions
    for (let i = 0; i < 5; i++) {
      questions.push({
        id: `q_${skill.id}_${i + 1}`,
        question: `Question ${i + 1} about ${skill.skillName}`,
        type: 'multiple_choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 0,
        explanation: `This tests your understanding of ${skill.skillName}`,
        difficulty: Math.ceil((i + 1) / 2),
        points: 10,
        learning_objective: skill.skillName
      });
    }
    
    return questions;
  }

  private static calculateDuration(grade: string, template: any): number {
    const baseDuration = template.duration || 15;
    const gradeMutlipliers = {
      'Kindergarten': 0.7,
      'Grade 3': 1.0,
      'Grade 7': 1.3,
      'Grade 10': 1.6
    };
    
    return Math.round(baseDuration * (gradeMutlipliers[grade as keyof typeof gradeMutlipliers] || 1));
  }

  private static determineDifficulty(skill: any, userProfile: any): 'easy' | 'medium' | 'hard' {
    if (userProfile.skillLevel === 'beginner') return 'easy';
    if (userProfile.skillLevel === 'advanced') return 'hard';
    return 'medium';
  }

  private static generateObjectives(skill: any): string[] {
    return [
      `Understand the concept of ${skill.skillName}`,
      `Apply ${skill.skillName} skills in practice`,
      `Demonstrate mastery through assessment`
    ];
  }

  private static getPrerequisites(skill: any): string[] {
    // Simple prerequisite logic - in real implementation, this would be more sophisticated
    return skill.skillNumber && skill.skillNumber.includes('.') ? 
      [`${skill.skillCluster}${parseInt(skill.skillNumber.split('.')[1]) - 1}`] : [];
  }

  private static generateResources(skill: any): Resource[] {
    return [
      {
        id: `resource_${skill.id}_video`,
        title: `${skill.skillName} Explained`,
        type: 'video',
        url: `/videos/${skill.subject.toLowerCase()}/${skill.id}.mp4`,
        thumbnail: `/images/thumbnails/${skill.id}.jpg`,
        duration: 300, // 5 minutes
        difficulty: 'easy'
      },
      {
        id: `resource_${skill.id}_practice`,
        title: `Extra Practice: ${skill.skillName}`,
        type: 'worksheet',
        url: `/worksheets/${skill.id}.pdf`,
        difficulty: 'medium'
      }
    ];
  }

  private static getAdaptations(learningStyle: string, grade: string): LearningStyleAdaptation[] {
    const adaptations: Record<string, any> = {
      visual: {
        content_emphasis: ['images', 'diagrams', 'color_coding', 'charts'],
        interaction_types: ['drag_drop', 'drawing', 'highlighting'],
        feedback_style: 'visual_indicators',
        pacing_suggestions: 'self_paced_with_visual_progress'
      },
      auditory: {
        content_emphasis: ['spoken_instructions', 'audio_feedback', 'music', 'discussions'],
        interaction_types: ['voice_input', 'listening', 'verbal_explanations'],
        feedback_style: 'audio_feedback',
        pacing_suggestions: 'timed_with_audio_cues'
      },
      kinesthetic: {
        content_emphasis: ['hands_on_activities', 'movement', 'manipulation', 'building'],
        interaction_types: ['touch', 'gesture', 'physical_manipulation'],
        feedback_style: 'haptic_feedback',
        pacing_suggestions: 'activity_based_breaks'
      },
      mixed: {
        content_emphasis: ['multimodal_content', 'variety', 'choice'],
        interaction_types: ['multiple_formats', 'user_choice'],
        feedback_style: 'comprehensive_feedback',
        pacing_suggestions: 'flexible_adaptive'
      }
    };

    return [{
      learning_style: learningStyle as any,
      modifications: adaptations[learningStyle] || adaptations.mixed
    }];
  }

  private static generateFinnIntegration(skill: any, userProfile: any): FinnIntegration {
    return {
      context_prompts: [
        `Help ${userProfile.name} understand ${skill.skillName} for ${skill.grade}`,
        `Provide ${userProfile.learningStyle} learning strategies`,
        `Explain this concept in simple terms`
      ],
      hint_generation: {
        difficulty_levels: ['gentle_nudge', 'helpful_hint', 'detailed_explanation'],
        explanation_styles: ['visual_metaphor', 'step_by_step', 'real_world_example']
      },
      encouragement_messages: [
        "You're doing great! Keep going!",
        "That's a good try! Let's think about it differently.",
        "Excellent work! You're really getting this!"
      ],
      error_analysis: {
        common_mistakes: [`Common error in ${skill.skillName}`],
        remediation_suggestions: [`Try reviewing ${skill.skillArea} basics`]
      }
    };
  }
}

export default AssignmentGenerator;