/**
 * ConsistencyValidator
 * 
 * Validates that all generated content maintains consistency with the daily
 * learning context (career, skill, companion) across all subjects and containers.
 */

import { Skill, Career, Subject, Grade } from '../../types';
import { DailyLearningContext } from './DailyLearningContextManager';
import { SkillAdaptation } from './SkillAdaptationService';

/**
 * Violation detected in content consistency
 */
export interface ConsistencyViolation {
  type: 'career_drift' | 'skill_dilution' | 'companion_mismatch' | 'grade_inappropriate' | 'subject_misalignment';
  severity: 'critical' | 'major' | 'minor';
  location: string;
  expected: string;
  actual: string;
  suggestion: string;
}

/**
 * Consistency analysis report
 */
export interface ConsistencyReport {
  isConsistent: boolean;
  careerAlignment: number;  // 0-100%
  skillAlignment: number;   // 0-100%
  companionAlignment: number; // 0-100%
  overallScore: number;     // 0-100%
  violations: ConsistencyViolation[];
  suggestions: string[];
  timestamp: Date;
}

/**
 * Content correction suggestion
 */
export interface ContentCorrection {
  field: string;
  original: any;
  corrected: any;
  reason: string;
}

/**
 * Content structure for validation
 */
export interface ValidatableContent {
  type: 'question' | 'instruction' | 'feedback' | 'hint' | 'scenario';
  subject: Subject;
  text: string;
  metadata?: {
    career?: string;
    skill?: string;
    companion?: string;
    grade?: Grade;
  };
  [key: string]: any;
}

/**
 * Service for validating content consistency
 */
export class ConsistencyValidator {
  private static instance: ConsistencyValidator;
  private validationHistory: ConsistencyReport[] = [];
  private violationPatterns: Map<string, number> = new Map();

  // Threshold configurations
  private readonly ALIGNMENT_THRESHOLDS = {
    critical: 90,  // Must have >90% alignment
    acceptable: 70, // Should have >70% alignment
    minimum: 50    // Absolute minimum alignment
  };

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ConsistencyValidator {
    if (!ConsistencyValidator.instance) {
      ConsistencyValidator.instance = new ConsistencyValidator();
    }
    return ConsistencyValidator.instance;
  }

  /**
   * Validate single content item
   */
  public validateContent(
    content: ValidatableContent,
    context: DailyLearningContext
  ): ConsistencyReport {
    const violations: ConsistencyViolation[] = [];
    
    // Perform various validation checks
    const careerCheck = this.validateCareerContext(content, context.career);
    const skillCheck = this.validateSkillFocus(content, context.primarySkill);
    const companionCheck = this.validateCompanionVoice(content, context.companion);
    const gradeCheck = this.validateGradeAppropriateness(content, context.grade);
    const subjectCheck = this.validateSubjectAlignment(content);

    // Collect violations
    if (!careerCheck.valid) violations.push(...careerCheck.violations);
    if (!skillCheck.valid) violations.push(...skillCheck.violations);
    if (!companionCheck.valid) violations.push(...companionCheck.violations);
    if (!gradeCheck.valid) violations.push(...gradeCheck.violations);
    if (!subjectCheck.valid) violations.push(...subjectCheck.violations);

    // Calculate alignment scores
    const careerAlignment = this.calculateCareerAlignment(content, context.career);
    const skillAlignment = this.calculateSkillAlignment(content, context.primarySkill);
    const companionAlignment = this.calculateCompanionAlignment(content, context.companion);
    
    // Overall consistency score
    const overallScore = (careerAlignment + skillAlignment + companionAlignment) / 3;

    // Generate report
    const report: ConsistencyReport = {
      isConsistent: violations.filter(v => v.severity === 'critical').length === 0 &&
                   overallScore >= this.ALIGNMENT_THRESHOLDS.acceptable,
      careerAlignment,
      skillAlignment,
      companionAlignment,
      overallScore,
      violations,
      suggestions: this.generateSuggestions(violations, content, context),
      timestamp: new Date()
    };

    // Track history
    this.validationHistory.push(report);
    this.trackViolationPatterns(violations);

    return report;
  }

  /**
   * Validate career context in content
   */
  public validateCareerContext(
    content: ValidatableContent,
    career: Career
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    const contentText = this.extractContentText(content).toLowerCase();
    const careerTerms = this.getCareerTerms(career);
    
    // Check for career references
    const hasCareerReference = careerTerms.some(term => 
      contentText.includes(term.toLowerCase())
    );

    if (!hasCareerReference) {
      violations.push({
        type: 'career_drift',
        severity: 'major',
        location: `${content.type} in ${content.subject}`,
        expected: `Reference to ${career.title}`,
        actual: 'No career reference found',
        suggestion: `Add context about how ${career.title}s use this concept`
      });
    }

    // Check metadata if present
    if (content.metadata?.career && 
        content.metadata.career !== career.id && 
        content.metadata.career !== career.title) {
      violations.push({
        type: 'career_drift',
        severity: 'critical',
        location: 'metadata.career',
        expected: career.title,
        actual: content.metadata.career,
        suggestion: `Update career reference to ${career.title}`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate skill focus in content
   */
  public validateSkillFocus(
    content: ValidatableContent,
    skill: Skill
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    const contentText = this.extractContentText(content).toLowerCase();
    const skillTerms = this.getSkillTerms(skill);
    
    // Check for skill references
    const hasSkillReference = skillTerms.some(term => 
      contentText.includes(term.toLowerCase())
    );

    if (!hasSkillReference) {
      violations.push({
        type: 'skill_dilution',
        severity: 'major',
        location: `${content.type} in ${content.subject}`,
        expected: `Focus on ${skill.name}`,
        actual: 'No skill reference found',
        suggestion: `Emphasize how this practices ${skill.name}`
      });
    }

    // Check if skill is diluted by other skills
    const skillDensity = this.calculateTermDensity(contentText, skillTerms);
    if (skillDensity < 0.01) { // Less than 1% of content relates to skill
      violations.push({
        type: 'skill_dilution',
        severity: 'minor',
        location: `${content.type} content`,
        expected: `Strong focus on ${skill.name}`,
        actual: `Weak skill presence (${(skillDensity * 100).toFixed(1)}%)`,
        suggestion: `Increase emphasis on ${skill.name} throughout the content`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate companion voice consistency
   */
  private validateCompanionVoice(
    content: ValidatableContent,
    companion: { id: string; name: string; personality: string }
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    
    // Check if companion is referenced consistently
    if (content.metadata?.companion && 
        content.metadata.companion !== companion.id && 
        content.metadata.companion !== companion.name) {
      violations.push({
        type: 'companion_mismatch',
        severity: 'major',
        location: 'metadata.companion',
        expected: companion.name,
        actual: content.metadata.companion,
        suggestion: `Use ${companion.name} as the companion`
      });
    }

    // Check personality consistency in feedback/hints
    if (content.type === 'feedback' || content.type === 'hint') {
      const personalityMatch = this.validatePersonalityTone(
        content.text,
        companion.personality
      );
      
      if (!personalityMatch) {
        violations.push({
          type: 'companion_mismatch',
          severity: 'minor',
          location: `${content.type} tone`,
          expected: `${companion.personality} personality`,
          actual: 'Inconsistent tone',
          suggestion: `Adjust tone to match ${companion.name}'s ${companion.personality} personality`
        });
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate grade appropriateness
   */
  private validateGradeAppropriateness(
    content: ValidatableContent,
    grade: Grade
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    const contentText = this.extractContentText(content);
    
    // Check reading level
    const readingLevel = this.calculateReadingLevel(contentText);
    const expectedLevel = this.getExpectedReadingLevel(grade);
    
    if (Math.abs(readingLevel - expectedLevel) > 2) {
      violations.push({
        type: 'grade_inappropriate',
        severity: readingLevel > expectedLevel ? 'major' : 'minor',
        location: `${content.type} text`,
        expected: `Grade ${grade} reading level`,
        actual: `Grade ${readingLevel} level detected`,
        suggestion: readingLevel > expectedLevel ? 
          'Simplify language for grade level' : 
          'Consider more grade-appropriate vocabulary'
      });
    }

    // Check complexity for question types
    if (content.type === 'question') {
      const complexityCheck = this.validateQuestionComplexity(content, grade);
      if (!complexityCheck.valid) {
        violations.push(...complexityCheck.violations);
      }
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate subject alignment
   */
  private validateSubjectAlignment(
    content: ValidatableContent
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    const subjectKeywords = this.getSubjectKeywords(content.subject);
    const contentText = this.extractContentText(content).toLowerCase();
    
    // Check for subject-appropriate terminology
    const hasSubjectContent = subjectKeywords.some(keyword => 
      contentText.includes(keyword)
    );

    if (!hasSubjectContent && content.type === 'question') {
      violations.push({
        type: 'subject_misalignment',
        severity: 'minor',
        location: `${content.type} in ${content.subject}`,
        expected: `${content.subject}-specific content`,
        actual: 'Missing subject-specific elements',
        suggestion: `Include ${content.subject} concepts and terminology`
      });
    }

    return {
      valid: violations.length === 0,
      violations
    };
  }

  /**
   * Validate cross-subject coherence
   */
  public validateCrossSubjectCoherence(
    contents: ValidatableContent[],
    context: DailyLearningContext
  ): ConsistencyReport {
    const violations: ConsistencyViolation[] = [];
    const subjectGroups = this.groupBySubject(contents);
    
    // Check each subject maintains the theme
    let totalCareerAlignment = 0;
    let totalSkillAlignment = 0;
    
    for (const [subject, subjectContents] of subjectGroups) {
      const subjectReport = this.analyzeSubjectConsistency(
        subjectContents,
        context,
        subject as Subject
      );
      
      violations.push(...subjectReport.violations);
      totalCareerAlignment += subjectReport.careerAlignment;
      totalSkillAlignment += subjectReport.skillAlignment;
    }

    const numSubjects = subjectGroups.size || 1;
    const overallCareerAlignment = totalCareerAlignment / numSubjects;
    const overallSkillAlignment = totalSkillAlignment / numSubjects;
    
    // Check for theme drift across subjects
    if (overallCareerAlignment < this.ALIGNMENT_THRESHOLDS.critical) {
      violations.push({
        type: 'career_drift',
        severity: 'critical',
        location: 'Cross-subject content',
        expected: `Consistent ${context.career.title} theme`,
        actual: `Only ${overallCareerAlignment.toFixed(0)}% career alignment`,
        suggestion: 'Strengthen career connections across all subjects'
      });
    }

    if (overallSkillAlignment < this.ALIGNMENT_THRESHOLDS.critical) {
      violations.push({
        type: 'skill_dilution',
        severity: 'critical',
        location: 'Cross-subject content',
        expected: `Consistent ${context.primarySkill.name} focus`,
        actual: `Only ${overallSkillAlignment.toFixed(0)}% skill alignment`,
        suggestion: 'Reinforce skill focus across all subjects'
      });
    }

    return {
      isConsistent: violations.filter(v => v.severity === 'critical').length === 0,
      careerAlignment: overallCareerAlignment,
      skillAlignment: overallSkillAlignment,
      companionAlignment: 100, // Simplified for cross-subject
      overallScore: (overallCareerAlignment + overallSkillAlignment) / 2,
      violations,
      suggestions: this.generateCrossSubjectSuggestions(violations, contents, context),
      timestamp: new Date()
    };
  }

  /**
   * Detect career drift in content set
   */
  public detectCareerDrift(contents: ValidatableContent[]): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const careerReferences = new Map<string, number>();
    
    // Count career references
    contents.forEach(content => {
      const careers = this.extractCareerReferences(content);
      careers.forEach(career => {
        careerReferences.set(career, (careerReferences.get(career) || 0) + 1);
      });
    });

    // Check for multiple careers (drift)
    if (careerReferences.size > 1) {
      const careers = Array.from(careerReferences.keys());
      violations.push({
        type: 'career_drift',
        severity: 'critical',
        location: 'Content set',
        expected: 'Single career focus',
        actual: `Multiple careers detected: ${careers.join(', ')}`,
        suggestion: 'Maintain focus on a single career throughout'
      });
    }

    return violations;
  }

  /**
   * Detect skill dilution in content set
   */
  public detectSkillDilution(contents: ValidatableContent[]): ConsistencyViolation[] {
    const violations: ConsistencyViolation[] = [];
    const skillReferences = new Map<string, number>();
    
    // Count skill references
    contents.forEach(content => {
      const skills = this.extractSkillReferences(content);
      skills.forEach(skill => {
        skillReferences.set(skill, (skillReferences.get(skill) || 0) + 1);
      });
    });

    // Check if primary skill is diluted
    if (skillReferences.size > 3) { // Too many different skills
      const skills = Array.from(skillReferences.keys());
      violations.push({
        type: 'skill_dilution',
        severity: 'major',
        location: 'Content set',
        expected: 'Focus on primary skill',
        actual: `Too many skills: ${skills.slice(0, 5).join(', ')}...`,
        suggestion: 'Reduce focus to primary skill and 1-2 supporting skills'
      });
    }

    return violations;
  }

  /**
   * Validate daily journey consistency
   */
  public validateDailyJourney(
    allContents: ValidatableContent[],
    context: DailyLearningContext
  ): ConsistencyReport {
    // Group by time/container
    const journey = this.constructLearningJourney(allContents);
    const violations: ConsistencyViolation[] = [];
    
    // Check progression consistency
    let previousCareerScore = 100;
    let previousSkillScore = 100;
    
    journey.forEach((segment, index) => {
      const segmentReport = this.validateContent(segment.content, context);
      
      // Check for degradation
      if (segmentReport.careerAlignment < previousCareerScore - 20) {
        violations.push({
          type: 'career_drift',
          severity: 'major',
          location: `Journey segment ${index + 1}`,
          expected: 'Maintained career focus',
          actual: `Career alignment dropped to ${segmentReport.careerAlignment}%`,
          suggestion: 'Reinforce career connection in this segment'
        });
      }
      
      if (segmentReport.skillAlignment < previousSkillScore - 20) {
        violations.push({
          type: 'skill_dilution',
          severity: 'major',
          location: `Journey segment ${index + 1}`,
          expected: 'Maintained skill focus',
          actual: `Skill alignment dropped to ${segmentReport.skillAlignment}%`,
          suggestion: 'Strengthen skill practice in this segment'
        });
      }
      
      previousCareerScore = segmentReport.careerAlignment;
      previousSkillScore = segmentReport.skillAlignment;
    });

    // Calculate overall journey consistency
    const journeyScore = this.calculateJourneyConsistency(journey, context);

    return {
      isConsistent: journeyScore >= this.ALIGNMENT_THRESHOLDS.acceptable,
      careerAlignment: journeyScore,
      skillAlignment: journeyScore,
      companionAlignment: 100,
      overallScore: journeyScore,
      violations,
      suggestions: ['Maintain consistent career and skill focus throughout the day'],
      timestamp: new Date()
    };
  }

  /**
   * Suggest corrections for violations
   */
  public suggestCorrections(
    violations: ConsistencyViolation[]
  ): ContentCorrection[] {
    const corrections: ContentCorrection[] = [];
    
    violations.forEach(violation => {
      switch (violation.type) {
        case 'career_drift':
          corrections.push({
            field: 'content',
            original: violation.actual,
            corrected: this.injectCareerContext(violation.actual, violation.expected),
            reason: 'Add career context to maintain consistency'
          });
          break;
          
        case 'skill_dilution':
          corrections.push({
            field: 'content',
            original: violation.actual,
            corrected: this.reinforceSkillFocus(violation.actual, violation.expected),
            reason: 'Strengthen skill focus in content'
          });
          break;
          
        case 'grade_inappropriate':
          corrections.push({
            field: 'content',
            original: violation.actual,
            corrected: this.adjustGradeLevel(violation.actual, violation.expected),
            reason: 'Adjust language for appropriate grade level'
          });
          break;
      }
    });

    return corrections;
  }

  /**
   * Enforce consistency on content
   */
  public enforceConsistency(
    content: ValidatableContent,
    context: DailyLearningContext
  ): ValidatableContent {
    const report = this.validateContent(content, context);
    
    if (!report.isConsistent) {
      const corrections = this.suggestCorrections(report.violations);
      
      // Apply corrections
      let correctedContent = { ...content };
      corrections.forEach(correction => {
        if (correction.field in correctedContent) {
          correctedContent[correction.field] = correction.corrected;
        }
      });
      
      // Add metadata to ensure consistency
      correctedContent.metadata = {
        ...correctedContent.metadata,
        career: context.career.title,
        skill: context.primarySkill.name,
        companion: context.companion.name,
        grade: context.grade,
        validated: true,
        validationScore: report.overallScore
      };
      
      return correctedContent;
    }

    return content;
  }

  /**
   * Calculate career alignment percentage
   */
  private calculateCareerAlignment(
    content: ValidatableContent,
    career: Career
  ): number {
    const contentText = this.extractContentText(content).toLowerCase();
    const careerTerms = this.getCareerTerms(career);
    
    const termCount = careerTerms.filter(term => 
      contentText.includes(term.toLowerCase())
    ).length;
    
    const maxScore = Math.min(careerTerms.length, 5); // Cap at 5 terms
    const alignment = (termCount / maxScore) * 100;
    
    return Math.min(100, alignment);
  }

  /**
   * Calculate skill alignment percentage
   */
  private calculateSkillAlignment(
    content: ValidatableContent,
    skill: Skill
  ): number {
    const contentText = this.extractContentText(content).toLowerCase();
    const skillTerms = this.getSkillTerms(skill);
    
    const termCount = skillTerms.filter(term => 
      contentText.includes(term.toLowerCase())
    ).length;
    
    const maxScore = Math.min(skillTerms.length, 5);
    const alignment = (termCount / maxScore) * 100;
    
    return Math.min(100, alignment);
  }

  /**
   * Calculate companion alignment percentage
   */
  private calculateCompanionAlignment(
    content: ValidatableContent,
    companion: { id: string; name: string; personality: string }
  ): number {
    // Simplified: Check if companion is mentioned or tone matches
    if (content.metadata?.companion === companion.name || 
        content.metadata?.companion === companion.id) {
      return 100;
    }
    
    const contentText = this.extractContentText(content).toLowerCase();
    if (contentText.includes(companion.name.toLowerCase())) {
      return 80;
    }
    
    // Check personality tone match
    if (this.validatePersonalityTone(contentText, companion.personality)) {
      return 60;
    }
    
    return 40;
  }

  /**
   * Extract text from content
   */
  private extractContentText(content: ValidatableContent): string {
    let text = content.text || '';
    
    // Add other text fields
    if (content.question) text += ' ' + content.question;
    if (content.instruction) text += ' ' + content.instruction;
    if (content.feedback) text += ' ' + content.feedback;
    if (content.hint) text += ' ' + content.hint;
    if (content.description) text += ' ' + content.description;
    
    return text;
  }

  /**
   * Get career-related terms
   */
  private getCareerTerms(career: Career): string[] {
    if (!career || !career.title) {
      return [];
    }
    
    const terms: string[] = [career.title];
    
    // Add skills if they exist and are iterable
    if (Array.isArray(career.skills)) {
      terms.push(...career.skills);
    }
    
    // Split compound titles
    terms.push(...career.title.split(/[\s-]+/));
    
    // Add common variations
    if (career.title.includes('Developer')) {
      terms.push(career.title.replace('Developer', 'Dev'));
    }
    if (career.title.includes('Scientist')) {
      terms.push(career.title.replace('Scientist', 'Science'));
    }
    
    return terms.filter(term => term && term.length > 2);
  }

  /**
   * Get skill-related terms
   */
  private getSkillTerms(skill: Skill): string[] {
    const terms = [
      skill.name,
      ...skill.name.split(/[\s-]+/),
      skill.category
    ];
    
    // Add related terms based on skill
    const relatedTerms: Record<string, string[]> = {
      'problem-solving': ['solve', 'solution', 'figure out', 'work through'],
      'creativity': ['create', 'imagine', 'design', 'invent'],
      'critical-thinking': ['think', 'analyze', 'evaluate', 'reason'],
      'collaboration': ['work together', 'team', 'cooperate', 'share']
    };
    
    if (relatedTerms[skill.id]) {
      terms.push(...relatedTerms[skill.id]);
    }
    
    return terms.filter(term => term.length > 2);
  }

  /**
   * Calculate term density in text
   */
  private calculateTermDensity(text: string, terms: string[]): number {
    const words = text.split(/\s+/);
    const termCount = terms.reduce((count, term) => {
      const regex = new RegExp(term, 'gi');
      const matches = text.match(regex);
      return count + (matches ? matches.length : 0);
    }, 0);
    
    return termCount / words.length;
  }

  /**
   * Validate personality tone
   */
  private validatePersonalityTone(text: string, personality: string): boolean {
    const personalityMarkers: Record<string, string[]> = {
      'encouraging': ['great', 'awesome', 'you can', 'keep going', 'well done'],
      'analytical': ['observe', 'consider', 'analyze', 'think about', 'examine'],
      'creative': ['imagine', 'create', 'design', 'explore', 'discover'],
      'supportive': ['help', 'support', 'together', "let's", 'we can']
    };
    
    const markers = personalityMarkers[personality] || [];
    return markers.some(marker => text.toLowerCase().includes(marker));
  }

  /**
   * Calculate reading level (simplified Flesch-Kincaid)
   */
  private calculateReadingLevel(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = words.reduce((count, word) => 
      count + this.countSyllables(word), 0
    );
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;
    
    // Simplified Flesch-Kincaid Grade Level
    const gradeLevel = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    
    return Math.max(0, Math.min(12, Math.round(gradeLevel)));
  }

  /**
   * Count syllables in a word (simplified)
   */
  private countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    const vowels = word.match(/[aeiou]/g);
    return vowels ? vowels.length : 1;
  }

  /**
   * Get expected reading level for grade
   */
  private getExpectedReadingLevel(grade: Grade): number {
    const gradeLevels: Record<string, number> = {
      'K': 0, '1': 1, '2': 2, '3': 3, '4': 4,
      '5': 5, '6': 6, '7': 7, '8': 8
    };
    return gradeLevels[grade] || 5;
  }

  /**
   * Validate question complexity for grade
   */
  private validateQuestionComplexity(
    content: ValidatableContent,
    grade: Grade
  ): { valid: boolean; violations: ConsistencyViolation[] } {
    const violations: ConsistencyViolation[] = [];
    
    // Check question type appropriateness
    if (content.questionType) {
      const gradeLevel = this.getExpectedReadingLevel(grade);
      
      // K-2 shouldn't have essay questions
      if (gradeLevel <= 2 && content.questionType === 'short_answer') {
        violations.push({
          type: 'grade_inappropriate',
          severity: 'major',
          location: 'Question type',
          expected: 'Simple question types for K-2',
          actual: 'Complex question type',
          suggestion: 'Use multiple choice or true/false for younger grades'
        });
      }
    }
    
    return { valid: violations.length === 0, violations };
  }

  /**
   * Get subject-specific keywords
   */
  private getSubjectKeywords(subject: Subject): string[] {
    const keywords: Record<Subject, string[]> = {
      'Math': ['number', 'count', 'add', 'subtract', 'multiply', 'divide', 'calculate', 'measure'],
      'ELA': ['read', 'write', 'story', 'character', 'sentence', 'paragraph', 'grammar', 'vocabulary'],
      'Science': ['experiment', 'observe', 'hypothesis', 'data', 'discover', 'explore', 'investigate'],
      'Social Studies': ['community', 'history', 'culture', 'society', 'geography', 'people', 'tradition']
    };
    
    return keywords[subject] || [];
  }

  /**
   * Group contents by subject
   */
  private groupBySubject(contents: ValidatableContent[]): Map<string, ValidatableContent[]> {
    const groups = new Map<string, ValidatableContent[]>();
    
    contents.forEach(content => {
      const subject = content.subject || 'Unknown';
      if (!groups.has(subject)) {
        groups.set(subject, []);
      }
      groups.get(subject)!.push(content);
    });
    
    return groups;
  }

  /**
   * Analyze consistency within a subject
   */
  private analyzeSubjectConsistency(
    contents: ValidatableContent[],
    context: DailyLearningContext,
    subject: Subject
  ): ConsistencyReport {
    let totalCareerScore = 0;
    let totalSkillScore = 0;
    const violations: ConsistencyViolation[] = [];
    
    contents.forEach(content => {
      const report = this.validateContent(content, context);
      totalCareerScore += report.careerAlignment;
      totalSkillScore += report.skillAlignment;
      violations.push(...report.violations.filter(v => v.severity === 'critical'));
    });
    
    const count = contents.length || 1;
    
    return {
      isConsistent: violations.length === 0,
      careerAlignment: totalCareerScore / count,
      skillAlignment: totalSkillScore / count,
      companionAlignment: 100,
      overallScore: (totalCareerScore + totalSkillScore) / (2 * count),
      violations,
      suggestions: [],
      timestamp: new Date()
    };
  }

  /**
   * Generate suggestions based on violations
   */
  private generateSuggestions(
    violations: ConsistencyViolation[],
    content: ValidatableContent,
    context: DailyLearningContext
  ): string[] {
    const suggestions: string[] = [];
    
    // Group violations by type
    const violationTypes = new Set(violations.map(v => v.type));
    
    if (violationTypes.has('career_drift')) {
      suggestions.push(`Strengthen connection to ${context.career.title} throughout the content`);
    }
    
    if (violationTypes.has('skill_dilution')) {
      suggestions.push(`Emphasize ${context.primarySkill.name} as the primary learning objective`);
    }
    
    if (violationTypes.has('grade_inappropriate')) {
      suggestions.push(`Adjust language complexity for grade ${context.grade} students`);
    }
    
    return suggestions;
  }

  /**
   * Generate cross-subject suggestions
   */
  private generateCrossSubjectSuggestions(
    violations: ConsistencyViolation[],
    contents: ValidatableContent[],
    context: DailyLearningContext
  ): string[] {
    const suggestions: string[] = [
      `Ensure all subjects reference ${context.career.title} consistently`,
      `Maintain focus on ${context.primarySkill.name} across all content`,
      `Use ${context.companion.name} as the consistent guide throughout`
    ];
    
    if (violations.some(v => v.type === 'career_drift')) {
      suggestions.push('Create a career narrative that spans all subjects');
    }
    
    if (violations.some(v => v.type === 'skill_dilution')) {
      suggestions.push('Develop skill progression that builds across subjects');
    }
    
    return suggestions;
  }

  /**
   * Extract career references from content
   */
  private extractCareerReferences(content: ValidatableContent): string[] {
    const text = this.extractContentText(content).toLowerCase();
    const careers: string[] = [];
    
    // Common career terms to look for
    const careerPatterns = [
      /\b\w+\s?developer\b/gi,
      /\b\w+\s?scientist\b/gi,
      /\b\w+\s?engineer\b/gi,
      /\bchef\b/gi,
      /\bartist\b/gi,
      /\bmusician\b/gi,
      /\bathlete\b/gi,
      /\barchitect\b/gi
    ];
    
    careerPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) careers.push(...matches);
    });
    
    return [...new Set(careers)];
  }

  /**
   * Extract skill references from content
   */
  private extractSkillReferences(content: ValidatableContent): string[] {
    const text = this.extractContentText(content).toLowerCase();
    const skills: string[] = [];
    
    // Common skill terms
    const skillPatterns = [
      /problem[\s-]?solving/gi,
      /critical[\s-]?thinking/gi,
      /creativ\w+/gi,
      /collaborat\w+/gi,
      /communicat\w+/gi,
      /analyz\w+/gi
    ];
    
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) skills.push(...matches);
    });
    
    return [...new Set(skills)];
  }

  /**
   * Construct learning journey from contents
   */
  private constructLearningJourney(
    contents: ValidatableContent[]
  ): Array<{ time: number; content: ValidatableContent }> {
    // Sort by assumed time progression
    const journey = contents.map((content, index) => ({
      time: index,
      content
    }));
    
    return journey;
  }

  /**
   * Calculate journey consistency score
   */
  private calculateJourneyConsistency(
    journey: Array<{ time: number; content: ValidatableContent }>,
    context: DailyLearningContext
  ): number {
    if (journey.length === 0) return 0;
    
    let totalScore = 0;
    journey.forEach(segment => {
      const report = this.validateContent(segment.content, context);
      totalScore += report.overallScore;
    });
    
    return totalScore / journey.length;
  }

  /**
   * Track violation patterns for improvement
   */
  private trackViolationPatterns(violations: ConsistencyViolation[]): void {
    violations.forEach(violation => {
      const key = `${violation.type}-${violation.location}`;
      this.violationPatterns.set(key, (this.violationPatterns.get(key) || 0) + 1);
    });
  }

  /**
   * Inject career context into content
   */
  private injectCareerContext(content: string, career: string): string {
    // Add career reference if missing
    if (!content.toLowerCase().includes(career.toLowerCase())) {
      return `${content} (like a ${career} would)`;
    }
    return content;
  }

  /**
   * Reinforce skill focus in content
   */
  private reinforceSkillFocus(content: string, skill: string): string {
    // Add skill emphasis if weak
    if (!content.toLowerCase().includes(skill.toLowerCase())) {
      return `Using ${skill}: ${content}`;
    }
    return content;
  }

  /**
   * Adjust content for grade level
   */
  private adjustGradeLevel(content: string, targetGrade: string): string {
    // Simplified: This would use more sophisticated text simplification
    return content.replace(/\b\w{10,}\b/g, match => {
      // Replace long words with simpler alternatives
      return match.substring(0, 7) + '...';
    });
  }

  /**
   * Get validation history
   */
  public getValidationHistory(): ConsistencyReport[] {
    return this.validationHistory;
  }

  /**
   * Get violation patterns
   */
  public getViolationPatterns(): Map<string, number> {
    return this.violationPatterns;
  }

  /**
   * Clear validation history
   */
  public clearHistory(): void {
    this.validationHistory = [];
    this.violationPatterns.clear();
  }
}

// Export singleton instance getter
export const getConsistencyValidator = () => ConsistencyValidator.getInstance();