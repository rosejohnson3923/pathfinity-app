// Experience Template Service
// Loads and manages career-specific educational templates

// Career-first template imports
import { teacherMathTemplate } from '../data/experienceTemplates/kindergarten/careers/teacher/Math';
import { teacherELATemplate } from '../data/experienceTemplates/kindergarten/careers/teacher/ELA';
import { teacherScienceTemplate } from '../data/experienceTemplates/kindergarten/careers/teacher/Science';
import { teacherSocialStudiesTemplate } from '../data/experienceTemplates/kindergarten/careers/teacher/SocialStudies';
import { librarianMathTemplate } from '../data/experienceTemplates/kindergarten/careers/librarian/Math';
import { librarianELATemplate } from '../data/experienceTemplates/kindergarten/careers/librarian/ELA';
import { librarianScienceTemplate } from '../data/experienceTemplates/kindergarten/careers/librarian/Science';
import { chefMathTemplate } from '../data/experienceTemplates/kindergarten/careers/chef/Math';
import { libraryCountingFirstTemplate } from '../data/experienceTemplates/first/math/1.NBT.A.1-librarian';
import { firstGradeTeacherMathTemplate } from '../data/experienceTemplates/first/careers/teacher/Math';
import { firstGradeTeacherELATemplate } from '../data/experienceTemplates/first/careers/teacher/ELA';
import { firstGradeTeacherScienceTemplate } from '../data/experienceTemplates/first/careers/teacher/Science';
import { firstGradeTeacherSocialStudiesTemplate } from '../data/experienceTemplates/first/careers/teacher/SocialStudies';
import { firstGradeLibrarianELATemplate } from '../data/experienceTemplates/first/careers/librarian/ELA';
import { firstGradeLibrarianScienceTemplate } from '../data/experienceTemplates/first/careers/librarian/Science';
import { firstGradeLibrarianSocialStudiesTemplate } from '../data/experienceTemplates/first/careers/librarian/SocialStudies';
import { seventhGradeTeacherMathTemplate } from '../data/experienceTemplates/seventh/careers/teacher/Math';
import { seventhGradeLibrarianMathTemplate } from '../data/experienceTemplates/seventh/careers/librarian/Math';
import { tenthGradeTeacherMathTemplate } from '../data/experienceTemplates/tenth/careers/teacher/Math';
import { tenthGradeLibrarianMathTemplate } from '../data/experienceTemplates/tenth/careers/librarian/Math';

export interface ExperienceTemplate {
  metadata: {
    career: string;
    careerTitle: string;
    subject: string;
    gradeLevel: string;
    skillCode: string;
    skillName: string;
    difficulty: number;
    interactionType: string;
  };
  roleSetup: {
    congratulations: string;
    challenge: string;
    yourRole: string;
    actionPlan: Array<{ step: string; icon: string }>;
    encouragement: string;
  };
  practiceScenarios: Array<{
    id: string;
    customer: string;
    customerEmoji: string;
    order: string;
    instruction: string;
    visual: any;
    correctAnswer: number;
    feedbackCorrect: string;
    feedbackIncorrect: string;
    hint: string;
    [key: string]: any; // Allow additional scenario-specific fields
  }>;
  assessmentChallenge: {
    setup: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  };
  toolConfiguration: {
    toolType: string;
    instructions: string;
    showProgressBar: boolean;
    allowHints: boolean;
    celebrateCorrect: boolean;
    maxAttempts: number;
    features?: any;
  };
}

// Template registry
const templateRegistry: { [key: string]: ExperienceTemplate } = {
  // Kindergarten career-first templates (Format: K-career-subject-skill)
  'K-teacher-Math-A.1': teacherMathTemplate,
  'K-teacher-ELA-A.1': teacherELATemplate,
  'K-teacher-Science-A.1': teacherScienceTemplate,
  'K-teacher-SocialStudies-A.1': teacherSocialStudiesTemplate,
  'K-librarian-Math-A.1': librarianMathTemplate,
  'K-librarian-ELA-A.1': librarianELATemplate,
  'K-librarian-Science-A.1': librarianScienceTemplate,
  'K-chef-Math-A.1': chefMathTemplate,
  
  // First grade templates (legacy structure for now)
  '1-Math-1.NBT.A.1-librarian': libraryCountingFirstTemplate,
  
  // First grade career-first templates with Common Core format
  '1-teacher-Math-1.NBT.A.1': firstGradeTeacherMathTemplate,
  '1-teacher-ELA-1.RF.A.1': firstGradeTeacherELATemplate,
  '1-teacher-Science-1.PS.A.1': firstGradeTeacherScienceTemplate,
  '1-teacher-SocialStudies-1.SS.A.1': firstGradeTeacherSocialStudiesTemplate,
  '1-librarian-ELA-1.RF.A.1': firstGradeLibrarianELATemplate,
  '1-librarian-Science-1.PS.A.1': firstGradeLibrarianScienceTemplate,
  '1-librarian-SocialStudies-1.SS.A.1': firstGradeLibrarianSocialStudiesTemplate,
  
  // Same templates with simple A.1 format for consistency with Kindergarten
  '1-teacher-Math-A.1': firstGradeTeacherMathTemplate,
  '1-teacher-ELA-A.1': firstGradeTeacherELATemplate,
  '1-teacher-Science-A.1': firstGradeTeacherScienceTemplate,
  '1-teacher-SocialStudies-A.1': firstGradeTeacherSocialStudiesTemplate,
  '1-librarian-ELA-A.1': firstGradeLibrarianELATemplate,
  '1-librarian-Science-A.1': firstGradeLibrarianScienceTemplate,
  '1-librarian-SocialStudies-A.1': firstGradeLibrarianSocialStudiesTemplate,
  
  
  // Seventh grade career-first templates with Common Core format
  '7-teacher-Math-7.NS.A.1': seventhGradeTeacherMathTemplate,
  '7-librarian-Math-7.NS.A.1': seventhGradeLibrarianMathTemplate,
  
  // Same templates with simple A.1 format for consistency
  '7-teacher-Math-A.1': seventhGradeTeacherMathTemplate,
  '7-librarian-Math-A.1': seventhGradeLibrarianMathTemplate,
  
  // Tenth grade career-first templates with Common Core format
  '10-teacher-Math-A.SSE.A.1': tenthGradeTeacherMathTemplate,
  '10-librarian-Math-A.SSE.A.1': tenthGradeLibrarianMathTemplate,
  
  // Same templates with simple A.1 format for consistency
  '10-teacher-Math-A.1': tenthGradeTeacherMathTemplate,
  '10-librarian-Math-A.1': tenthGradeLibrarianMathTemplate,

  // Add more career-subject combinations as they're created
};

export class ExperienceTemplateService {
  /**
   * Get a specific template by grade, subject, skill, and career
   */
  static getTemplate(
    gradeLevel: string, 
    subject: string, 
    skillCode: string, 
    career: string
  ): ExperienceTemplate | null {
    // Normalize grade level (handle Kindergarten -> K)
    const normalizedGrade = gradeLevel.toLowerCase() === 'kindergarten' ? 'K' : gradeLevel;
    
    // Normalize subject (remove spaces for consistency with template keys)
    let normalizedSubject = subject.replace(/\s+/g, '');
    
    // Map high school math subjects to Math for template lookup
    if (normalizedGrade === '10' && (normalizedSubject === 'Algebra1' || normalizedSubject === 'Precalculus')) {
      normalizedSubject = 'Math';
    }
    
    // Map skill codes from A.x format to full standard format
    const normalizedSkillCode = ExperienceTemplateService.normalizeSkillCode(skillCode, normalizedGrade, normalizedSubject);
    
    const key = `${normalizedGrade}-${career}-${normalizedSubject}-${normalizedSkillCode}`;
    
    console.log('🔍 Looking for template:', {
      grade: gradeLevel,
      normalizedGrade,
      subject,
      normalizedSubject,
      skillCode,
      normalizedSkillCode,
      career,
      key,
      exists: key in templateRegistry
    });
    console.log('🔍 Available template keys:', Object.keys(templateRegistry));
    
    const exactTemplate = templateRegistry[key];
    if (exactTemplate) {
      console.log('✅ Found exact template:', key);
      return exactTemplate;
    }
    
    // Try fallback logic: first try same grade/subject/career with different skill, then different career
    console.log('🔄 Exact template not found, trying fallback...');
    
    // First: try to find same career with different skill (new format: K-career-subject-skill)
    const sameCareeFallbackKey = Object.keys(templateRegistry).find(registryKey => {
      const parts = registryKey.split('-');
      return parts[0] === normalizedGrade && parts[1] === career && parts[2] === normalizedSubject;
    });
    
    if (sameCareeFallbackKey) {
      console.log('✅ Using same career fallback template:', sameCareeFallbackKey);
      return templateRegistry[sameCareeFallbackKey];
    }
    
    // Second: try any template with same grade/subject (different career)
    console.log('🔄 No same career template found, trying different career fallback...');
    const differentCareerFallbackKey = Object.keys(templateRegistry).find(registryKey => {
      const parts = registryKey.split('-');
      return parts[0] === normalizedGrade && parts[2] === normalizedSubject;
    });
    
    if (differentCareerFallbackKey) {
      console.log('⚠️ Using different career fallback template:', differentCareerFallbackKey);
      return templateRegistry[differentCareerFallbackKey];
    }
    
    console.log('❌ No template found, using default content');
    return null;
  }

  /**
   * Normalize skill codes from A.x format to full standard format
   */
  private static normalizeSkillCode(skillCode: string, grade: string, subject: string): string {
    // Handle A.1 style codes
    if (skillCode.startsWith('A.')) {
      const skillNumber = skillCode.split('.')[1];
      
      // Keep Math skills in A.x format for consistency with other subjects
      if (grade === 'K' && subject === 'Math') {
        if (skillNumber === '1') return 'A.1';
        if (skillNumber === '2') return 'A.2';
        if (skillNumber === '3') return 'A.3';
      }
      
      // Keep ELA skills in A.x format for consistency
      if (grade === 'K' && subject === 'ELA') {
        if (skillNumber === '1') return 'A.1';
        if (skillNumber === '2') return 'A.2';
        if (skillNumber === '3') return 'A.3';
      }
      
      if (grade === '1' && subject === 'Math') {
        // Map 1st Grade Math A.1 to 1.NBT.A.1 (number and base ten)
        if (skillNumber === '1') return '1.NBT.A.1';
        if (skillNumber === '2') return '1.NBT.A.2';
        if (skillNumber === '3') return '1.NBT.A.3';
      }
      
      if (grade === '1' && subject === 'ELA') {
        // Map 1st Grade ELA A.1 to 1.RF.A.1 (reading foundation)
        if (skillNumber === '1') return '1.RF.A.1';
        if (skillNumber === '2') return '1.RF.A.2';
        if (skillNumber === '3') return '1.RF.A.3';
      }
      
      if (grade === '1' && subject === 'Science') {
        // Map 1st Grade Science A.1 to 1.PS.A.1 (physical science)
        if (skillNumber === '1') return '1.PS.A.1';
        if (skillNumber === '2') return '1.PS.A.2';
        if (skillNumber === '3') return '1.PS.A.3';
      }
      
      if (grade === '1' && subject === 'SocialStudies') {
        // Map 1st Grade Social Studies A.1 to 1.SS.A.1 (social studies)
        if (skillNumber === '1') return '1.SS.A.1';
        if (skillNumber === '2') return '1.SS.A.2';
        if (skillNumber === '3') return '1.SS.A.3';
      }
      
      if (grade === '7' && subject === 'Math') {
        // Map 7th Grade Math A.1 to 7.NS.A.1 (number system - integers)
        if (skillNumber === '1') return '7.NS.A.1';
        if (skillNumber === '2') return '7.NS.A.2';
        if (skillNumber === '3') return '7.NS.A.3';
      }
      
      if (grade === '10' && subject === 'Math') {
        // Map 10th Grade Math A.1 to A.SSE.A.1 (algebra - expressions)
        if (skillNumber === '1') return 'A.SSE.A.1';
        if (skillNumber === '2') return 'A.SSE.A.2';
        if (skillNumber === '3') return 'A.SSE.A.3';
      }
    }
    
    // Return original if no mapping found
    return skillCode;
  }

  /**
   * Get all available templates for a grade level
   */
  static getTemplatesForGrade(gradeLevel: string): ExperienceTemplate[] {
    return Object.entries(templateRegistry)
      .filter(([key]) => key.startsWith(`${gradeLevel}-`))
      .map(([_, template]) => template);
  }

  /**
   * Get all available templates for a career
   */
  static getTemplatesForCareer(career: string): ExperienceTemplate[] {
    return Object.entries(templateRegistry)
      .filter(([key]) => key.endsWith(`-${career}`))
      .map(([_, template]) => template);
  }

  /**
   * Check if a template exists
   */
  static hasTemplate(
    gradeLevel: string, 
    subject: string, 
    skillCode: string, 
    career: string
  ): boolean {
    const key = `${gradeLevel}-${subject}-${skillCode}-${career}`;
    return key in templateRegistry;
  }

  /**
   * Get fallback template when specific one doesn't exist
   */
  static getFallbackTemplate(
    gradeLevel: string,
    subject: string,
    career: string
  ): ExperienceTemplate | null {
    // Try to find any template matching grade, subject, and career
    const templates = Object.entries(templateRegistry)
      .filter(([key]) => {
        const parts = key.split('-');
        return parts[0] === gradeLevel && 
               parts[1] === subject && 
               parts[parts.length - 1] === career;
      })
      .map(([_, template]) => template);
    
    return templates[0] || null;
  }

  /**
   * Convert template scenarios to Master Tool questions
   */
  static convertToToolQuestions(template: ExperienceTemplate, assignment?: any): any[] {
    // Filter scenarios based on actual learned skill level
    let filteredScenarios = template.practiceScenarios;
    
    if (assignment?.skillName) {
      const maxCount = ExperienceTemplateService.extractMaxCountFromSkillName(assignment.skillName);
      if (maxCount > 0) {
        console.log(`🔢 Filtering scenarios for skill "${assignment.skillName}" - max count: ${maxCount}`);
        filteredScenarios = template.practiceScenarios.filter(scenario => 
          scenario.correctAnswer <= maxCount
        );
        console.log(`🔢 Scenarios filtered: ${template.practiceScenarios.length} → ${filteredScenarios.length}`);
      }
    }
    
    return filteredScenarios.map((scenario, index) => ({
      id: scenario.id,
      type: template.metadata.interactionType,
      // For reading comprehension, use the actual question field, otherwise use order
      question: template.metadata.interactionType === 'reading-comprehension' 
        ? scenario.question 
        : scenario.order,
      order: scenario.order, // Keep the original order field too
      instruction: scenario.instruction,
      visual: scenario.visual,
      correctAnswer: scenario.correctAnswer,
      feedback: {
        correct: scenario.feedbackCorrect,
        incorrect: scenario.feedbackIncorrect
      },
      hint: scenario.hint,
      customerInfo: {
        name: scenario.customer,
        emoji: scenario.customerEmoji
      },
      difficulty: template.metadata.difficulty,
      index: index + 1,
      total: filteredScenarios.length,
      // Include reading comprehension specific fields
      passage: scenario.passage,
      options: scenario.options,
      questionType: scenario.questionType,
      // Include algebra-tiles specific fields
      expression: scenario.expression,
      operationType: scenario.operationType,
      steps: scenario.steps
    }));
  }

  /**
   * Extract maximum count from skill name (e.g., "Counting to 3" → 3)
   */
  static extractMaxCountFromSkillName(skillName: string): number {
    const match = skillName.match(/(?:to|up to)\s+(\d+)/i);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get template content for Experience Container steps
   */
  static getTemplateContent(template: ExperienceTemplate) {
    return {
      instruction: {
        title: template.roleSetup.congratulations,
        roleDescription: template.roleSetup.yourRole,
        challenge: template.roleSetup.challenge,
        steps: template.roleSetup.actionPlan,
        encouragement: template.roleSetup.encouragement
      },
      practice: {
        scenarios: template.practiceScenarios,
        toolConfig: template.toolConfiguration
      },
      assessment: {
        question: template.assessmentChallenge.question,
        options: template.assessmentChallenge.options,
        correctAnswer: template.assessmentChallenge.correctAnswer,
        explanation: template.assessmentChallenge.explanation,
        setup: template.assessmentChallenge.setup
      }
    };
  }
}

// Export convenience functions
export const getExperienceTemplate = ExperienceTemplateService.getTemplate;
export const hasExperienceTemplate = ExperienceTemplateService.hasTemplate;
export const getTemplateContent = ExperienceTemplateService.getTemplateContent;
export const convertToToolQuestions = ExperienceTemplateService.convertToToolQuestions;