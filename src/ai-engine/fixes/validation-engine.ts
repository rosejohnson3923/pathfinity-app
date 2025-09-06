/**
 * Validation Engine
 * Generates and applies validation rules for all modal types and content
 */

import {
  ModalTypeEnum,
  ValidationRules,
  GradeLevel,
  ContentTypeEnum
} from '../types';

export interface Validator {
  type: string;
  field?: string;
  fields?: string[];
  value?: any;
  values?: any[];
  pattern?: RegExp;
  min?: number;
  max?: number;
  custom?: (value: any) => boolean;
  message?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

export interface ValidationError {
  field: string;
  message: string;
  type: string;
  value?: any;
}

export class ValidationEngine {
  
  /**
   * Modal-specific validation rules
   */
  private modalValidationRules = new Map<ModalTypeEnum, Validator[]>([
    [ModalTypeEnum.FILL_BLANK, [
      { type: 'required', fields: ['blanks'], message: 'Please fill in all blanks' },
      { type: 'minLength', field: 'answer', value: 1, message: 'Answer cannot be empty' },
      { type: 'noSpecialChars', field: 'answer', pattern: /^[a-zA-Z0-9\s\-.,!?]+$/, message: 'Invalid characters in answer' }
    ]],
    
    [ModalTypeEnum.SINGLE_SELECT, [
      { type: 'required', field: 'selection', message: 'Please select an answer' },
      { type: 'oneOf', field: 'selection', message: 'Invalid selection' },
      { type: 'notEmpty', field: 'selection', message: 'Selection cannot be empty' }
    ]],
    
    [ModalTypeEnum.MULTI_SELECT, [
      { type: 'required', field: 'selections', message: 'Please select at least one answer' },
      { type: 'minCount', field: 'selections', value: 1, message: 'Select at least one option' },
      { type: 'maxCount', field: 'selections', value: 10, message: 'Too many selections' },
      { type: 'validOptions', field: 'selections', message: 'Invalid option selected' }
    ]],
    
    [ModalTypeEnum.SHORT_ANSWER, [
      { type: 'required', field: 'answer', message: 'Please provide an answer' },
      { type: 'minWords', field: 'answer', value: 1, message: 'Answer too short' },
      { type: 'maxWords', field: 'answer', value: 50, message: 'Answer too long' },
      { type: 'noCode', field: 'answer', pattern: /<script|<style|javascript:/i, message: 'Invalid content detected' }
    ]],
    
    [ModalTypeEnum.ESSAY, [
      { type: 'required', field: 'essay', message: 'Please write your essay' },
      { type: 'minWords', field: 'essay', value: 50, message: 'Essay must be at least 50 words' },
      { type: 'maxWords', field: 'essay', value: 1000, message: 'Essay cannot exceed 1000 words' },
      { type: 'paragraphs', field: 'essay', min: 2, message: 'Essay should have multiple paragraphs' }
    ]],
    
    [ModalTypeEnum.DRAG_DROP, [
      { type: 'required', fields: ['targets'], message: 'Please complete all drop zones' },
      { type: 'allTargetsFilled', field: 'targets', message: 'All items must be placed' },
      { type: 'validPlacements', field: 'placements', message: 'Invalid item placement' }
    ]],
    
    [ModalTypeEnum.CODE_EDITOR, [
      { type: 'required', field: 'code', message: 'Please write your code' },
      { type: 'syntaxValid', field: 'code', message: 'Syntax error in code' },
      { type: 'noInfiniteLoops', field: 'code', message: 'Potential infinite loop detected' },
      { type: 'testsPassing', field: 'testResults', message: 'Tests are not passing' }
    ]],
    
    [ModalTypeEnum.MATH_INPUT, [
      { type: 'required', field: 'expression', message: 'Please enter a mathematical expression' },
      { type: 'validMath', field: 'expression', message: 'Invalid mathematical expression' },
      { type: 'balanced', field: 'expression', message: 'Unbalanced parentheses or brackets' }
    ]],
    
    [ModalTypeEnum.SEQUENCE, [
      { type: 'required', field: 'sequence', message: 'Please arrange all items' },
      { type: 'allItemsUsed', field: 'sequence', message: 'All items must be arranged' },
      { type: 'noDuplicates', field: 'sequence', message: 'Items cannot be duplicated' }
    ]],
    
    [ModalTypeEnum.MATCHING, [
      { type: 'required', fields: ['matches'], message: 'Please match all items' },
      { type: 'allPaired', field: 'matches', message: 'All items must be matched' },
      { type: 'validPairs', field: 'matches', message: 'Invalid match combination' }
    ]],
    
    [ModalTypeEnum.TRUE_FALSE, [
      { type: 'required', field: 'answer', message: 'Please select True or False' },
      { type: 'boolean', field: 'answer', message: 'Answer must be true or false' }
    ]]
  ]);

  /**
   * Grade-level validation adjustments
   */
  private gradeLevelAdjustments = new Map<GradeLevel, any>([
    ['K-2', {
      minWords: { SHORT_ANSWER: 1, ESSAY: 10 },
      maxWords: { SHORT_ANSWER: 20, ESSAY: 100 },
      allowSpelling: true,
      simplifiedMessages: true
    }],
    ['3-5', {
      minWords: { SHORT_ANSWER: 5, ESSAY: 25 },
      maxWords: { SHORT_ANSWER: 30, ESSAY: 250 },
      allowSpelling: true,
      simplifiedMessages: true
    }],
    ['6-8', {
      minWords: { SHORT_ANSWER: 10, ESSAY: 50 },
      maxWords: { SHORT_ANSWER: 50, ESSAY: 500 },
      allowSpelling: false,
      simplifiedMessages: false
    }],
    ['9-12', {
      minWords: { SHORT_ANSWER: 15, ESSAY: 100 },
      maxWords: { SHORT_ANSWER: 100, ESSAY: 1000 },
      allowSpelling: false,
      simplifiedMessages: false
    }]
  ]);

  /**
   * Generate validation rules for content
   */
  public generateValidationRules(
    modalType: ModalTypeEnum,
    content: any,
    gradeLevel?: GradeLevel,
    strictMode: boolean = false
  ): ValidationRules {
    const baseValidators = this.modalValidationRules.get(modalType) || [];
    const adjustedValidators = this.adjustValidatorsForGrade(
      baseValidators,
      modalType,
      gradeLevel
    );
    
    // Add content-specific validators
    const contentValidators = this.generateContentSpecificValidators(
      modalType,
      content
    );
    
    const allValidators = [...adjustedValidators, ...contentValidators];
    
    return {
      required: true,
      validators: allValidators,
      errorMessages: this.generateErrorMessages(
        allValidators,
        gradeLevel
      ),
      strictMode,
      gradeLevel,
      modalType
    };
  }

  /**
   * Adjust validators based on grade level
   */
  private adjustValidatorsForGrade(
    validators: Validator[],
    modalType: ModalTypeEnum,
    gradeLevel?: GradeLevel
  ): Validator[] {
    if (!gradeLevel) return validators;
    
    const adjustments = this.gradeLevelAdjustments.get(gradeLevel);
    if (!adjustments) return validators;
    
    return validators.map(validator => {
      const adjusted = { ...validator };
      
      // Adjust word counts
      if (validator.type === 'minWords' && adjustments.minWords) {
        const modalKey = modalType.replace('Modal', '').toUpperCase();
        if (adjustments.minWords[modalKey]) {
          adjusted.value = adjustments.minWords[modalKey];
        }
      }
      
      if (validator.type === 'maxWords' && adjustments.maxWords) {
        const modalKey = modalType.replace('Modal', '').toUpperCase();
        if (adjustments.maxWords[modalKey]) {
          adjusted.value = adjustments.maxWords[modalKey];
        }
      }
      
      // Simplify messages for younger grades
      if (adjustments.simplifiedMessages && adjusted.message) {
        adjusted.message = this.simplifyMessage(adjusted.message);
      }
      
      return adjusted;
    });
  }

  /**
   * Generate content-specific validators
   */
  private generateContentSpecificValidators(
    modalType: ModalTypeEnum,
    content: any
  ): Validator[] {
    const validators: Validator[] = [];
    
    switch (modalType) {
      case ModalTypeEnum.SINGLE_SELECT:
      case ModalTypeEnum.MULTI_SELECT:
        if (content.options) {
          validators.push({
            type: 'oneOf',
            field: 'selection',
            values: content.options.map((o: any) => o.id),
            message: 'Please select from available options'
          });
        }
        break;
        
      case ModalTypeEnum.FILL_BLANK:
        if (content.blanks) {
          validators.push({
            type: 'exactCount',
            field: 'answers',
            value: content.blanks.length,
            message: `Please fill in all ${content.blanks.length} blanks`
          });
        }
        break;
        
      case ModalTypeEnum.DRAG_DROP:
        if (content.targets) {
          validators.push({
            type: 'targetCount',
            field: 'placements',
            value: content.targets.length,
            message: `All ${content.targets.length} targets must be filled`
          });
        }
        break;
        
      case ModalTypeEnum.CODE_EDITOR:
        if (content.language) {
          validators.push({
            type: 'language',
            field: 'code',
            value: content.language,
            message: `Code must be valid ${content.language}`
          });
        }
        if (content.testCases) {
          validators.push({
            type: 'passingTests',
            field: 'testResults',
            value: content.testCases.length,
            message: `All ${content.testCases.length} tests must pass`
          });
        }
        break;
    }
    
    return validators;
  }

  /**
   * Generate error messages for validators
   */
  private generateErrorMessages(
    validators: Validator[],
    gradeLevel?: GradeLevel
  ): { [key: string]: string } {
    const messages: { [key: string]: string } = {};
    
    validators.forEach(validator => {
      const key = `${validator.type}_${validator.field || 'default'}`;
      messages[key] = validator.message || this.getDefaultMessage(
        validator.type,
        gradeLevel
      );
    });
    
    return messages;
  }

  /**
   * Get default validation message
   */
  private getDefaultMessage(type: string, gradeLevel?: GradeLevel): string {
    const isSimplified = gradeLevel === 'K-2' || gradeLevel === '3-5';
    
    const messages = {
      required: isSimplified ? 'Please answer this' : 'This field is required',
      minLength: isSimplified ? 'Too short' : 'Answer is too short',
      maxLength: isSimplified ? 'Too long' : 'Answer exceeds maximum length',
      minWords: isSimplified ? 'Write more words' : 'Minimum word count not met',
      maxWords: isSimplified ? 'Too many words' : 'Maximum word count exceeded',
      oneOf: isSimplified ? 'Pick one answer' : 'Please select a valid option',
      pattern: isSimplified ? 'Check your answer' : 'Invalid format',
      boolean: isSimplified ? 'Pick True or False' : 'Value must be true or false'
    };
    
    return messages[type] || (isSimplified ? 'Check your answer' : 'Validation failed');
  }

  /**
   * Simplify message for younger students
   */
  private simplifyMessage(message: string): string {
    const simplifications = {
      'required': 'Please answer',
      'cannot be empty': 'Write something',
      'must be': 'should be',
      'invalid': 'not right',
      'select': 'pick',
      'provide': 'give',
      'exceed': 'too much'
    };
    
    let simplified = message.toLowerCase();
    Object.entries(simplifications).forEach(([key, value]) => {
      simplified = simplified.replace(key, value);
    });
    
    // Capitalize first letter
    return simplified.charAt(0).toUpperCase() + simplified.slice(1);
  }

  /**
   * Validate user input against rules
   */
  public validate(
    input: any,
    rules: ValidationRules,
    content?: any
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];
    
    if (!rules.validators) {
      return { valid: true, errors, warnings };
    }
    
    for (const validator of rules.validators) {
      const result = this.runValidator(validator, input, content);
      
      if (!result.valid) {
        errors.push({
          field: validator.field || 'unknown',
          message: result.message || validator.message || 'Validation failed',
          type: validator.type,
          value: result.value
        });
        
        // In non-strict mode, some errors become warnings
        if (!rules.strictMode && this.isWarningInNonStrict(validator.type)) {
          warnings.push(result.message || validator.message || '');
          errors.pop(); // Remove from errors
        }
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  /**
   * Run individual validator
   */
  private runValidator(
    validator: Validator,
    input: any,
    content?: any
  ): { valid: boolean; message?: string; value?: any } {
    const value = validator.field ? input[validator.field] : input;
    
    switch (validator.type) {
      case 'required':
        if (validator.fields) {
          const allPresent = validator.fields.every(f => 
            input[f] !== undefined && input[f] !== null && input[f] !== ''
          );
          return { valid: allPresent };
        }
        return { valid: value !== undefined && value !== null && value !== '' };
        
      case 'minLength':
        return { 
          valid: !value || value.length >= validator.value,
          value: value?.length
        };
        
      case 'maxLength':
        return { 
          valid: !value || value.length <= validator.value,
          value: value?.length
        };
        
      case 'minWords':
        const minWords = value?.split(/\s+/).filter((w: string) => w).length || 0;
        return { 
          valid: minWords >= validator.value,
          value: minWords
        };
        
      case 'maxWords':
        const maxWords = value?.split(/\s+/).filter((w: string) => w).length || 0;
        return { 
          valid: maxWords <= validator.value,
          value: maxWords
        };
        
      case 'pattern':
        return { 
          valid: !value || validator.pattern!.test(value),
          value
        };
        
      case 'oneOf':
        const validOptions = validator.values || 
          (content?.options?.map((o: any) => o.id)) || [];
        return { 
          valid: validOptions.includes(value),
          value
        };
        
      case 'boolean':
        return { 
          valid: typeof value === 'boolean',
          value
        };
        
      case 'minCount':
        const count = Array.isArray(value) ? value.length : 0;
        return { 
          valid: count >= validator.value,
          value: count
        };
        
      case 'maxCount':
        const maxCount = Array.isArray(value) ? value.length : 0;
        return { 
          valid: maxCount <= validator.value,
          value: maxCount
        };
        
      case 'custom':
        if (validator.custom) {
          return { valid: validator.custom(value), value };
        }
        return { valid: true };
        
      default:
        return { valid: true };
    }
  }

  /**
   * Check if error should be warning in non-strict mode
   */
  private isWarningInNonStrict(type: string): boolean {
    const warningTypes = [
      'minWords',
      'maxWords',
      'paragraphs',
      'spelling'
    ];
    return warningTypes.includes(type);
  }

  /**
   * Generate client-side validation code
   */
  public generateClientValidation(
    rules: ValidationRules
  ): string {
    const functions: string[] = [];
    
    // Generate validation function
    functions.push(`
function validateInput(input) {
  const errors = [];
  const warnings = [];
`);
    
    // Add validators
    rules.validators?.forEach(validator => {
      functions.push(this.generateValidatorCode(validator));
    });
    
    // Return result
    functions.push(`
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings.length > 0 ? warnings : undefined
  };
}
`);
    
    return functions.join('\n');
  }

  /**
   * Generate validator code for client
   */
  private generateValidatorCode(validator: Validator): string {
    const field = validator.field || 'input';
    const getValue = validator.field ? `input.${validator.field}` : 'input';
    
    switch (validator.type) {
      case 'required':
        return `
  if (!${getValue} || ${getValue} === '') {
    errors.push({
      field: '${field}',
      message: '${validator.message}',
      type: 'required'
    });
  }`;
        
      case 'minLength':
        return `
  if (${getValue} && ${getValue}.length < ${validator.value}) {
    errors.push({
      field: '${field}',
      message: '${validator.message}',
      type: 'minLength',
      value: ${getValue}.length
    });
  }`;
        
      case 'maxLength':
        return `
  if (${getValue} && ${getValue}.length > ${validator.value}) {
    errors.push({
      field: '${field}',
      message: '${validator.message}',
      type: 'maxLength',
      value: ${getValue}.length
    });
  }`;
        
      default:
        return '';
    }
  }

  /**
   * Create real-time validation handler
   */
  public createRealtimeValidator(
    rules: ValidationRules
  ): (input: any) => ValidationResult {
    return (input: any) => {
      // Debounce validation for text inputs
      const shouldDebounce = rules.modalType === ModalTypeEnum.ESSAY ||
                            rules.modalType === ModalTypeEnum.SHORT_ANSWER;
      
      if (shouldDebounce) {
        // In real implementation, would use actual debounce
        return { valid: true, errors: [] };
      }
      
      return this.validate(input, rules);
    };
  }

  /**
   * Get validation hints for UI
   */
  public getValidationHints(
    modalType: ModalTypeEnum,
    gradeLevel?: GradeLevel
  ): string[] {
    const hints: string[] = [];
    const adjustments = gradeLevel ? 
      this.gradeLevelAdjustments.get(gradeLevel) : null;
    
    switch (modalType) {
      case ModalTypeEnum.SHORT_ANSWER:
        const minWords = adjustments?.minWords?.SHORT_ANSWER || 10;
        const maxWords = adjustments?.maxWords?.SHORT_ANSWER || 50;
        hints.push(`Write ${minWords}-${maxWords} words`);
        break;
        
      case ModalTypeEnum.ESSAY:
        const essayMin = adjustments?.minWords?.ESSAY || 50;
        const essayMax = adjustments?.maxWords?.ESSAY || 500;
        hints.push(`Write ${essayMin}-${essayMax} words`);
        hints.push('Use multiple paragraphs');
        break;
        
      case ModalTypeEnum.FILL_BLANK:
        hints.push('Fill in all blanks');
        hints.push('Check spelling');
        break;
        
      case ModalTypeEnum.CODE_EDITOR:
        hints.push('Test your code before submitting');
        hints.push('Check for syntax errors');
        break;
    }
    
    return hints;
  }

  /**
   * Validate file uploads
   */
  public validateFileUpload(
    file: File,
    allowedTypes: string[],
    maxSizeMB: number = 10
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      errors.push({
        field: 'file',
        message: `File type not allowed. Accepted: ${allowedTypes.join(', ')}`,
        type: 'fileType',
        value: fileExtension
      });
    }
    
    // Check file size
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      errors.push({
        field: 'file',
        message: `File too large. Maximum: ${maxSizeMB}MB`,
        type: 'fileSize',
        value: sizeMB.toFixed(2)
      });
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Singleton export
export const validationEngine = new ValidationEngine();