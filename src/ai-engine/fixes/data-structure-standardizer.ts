/**
 * Data Structure Standardizer - P0 Critical Fix
 * Ensures all content follows standardized schema per modal type
 */

import { 
  ModalTypeEnum,
  StandardizedContent,
  ValidationError 
} from '../types';

export class DataStructureStandardizer {
  private schemas: Map<ModalTypeEnum, any> = new Map();

  constructor() {
    this.initializeSchemas();
  }

  /**
   * Initialize schemas for each modal type
   */
  private initializeSchemas(): void {
    // Fill-in-blank schema
    this.schemas.set(ModalTypeEnum.FILL_BLANK, {
      required: ['text', 'blanks'],
      structure: {
        text: 'string',
        blanks: {
          type: 'array',
          items: {
            id: 'string',
            position: 'number',
            answer: 'string|array',
            placeholder: 'string',
            hint: 'string?',
            maxLength: 'number?'
          }
        }
      }
    });

    // Single selection schema
    this.schemas.set(ModalTypeEnum.SINGLE_SELECT, {
      required: ['question', 'options', 'correctOptionId'],
      structure: {
        question: 'string',
        options: {
          type: 'array',
          minItems: 2,
          items: {
            id: 'string',
            content: 'string',
            isCorrect: 'boolean',
            feedback: 'string?'
          }
        },
        correctOptionId: 'string'
      }
    });

    // Multiple selection schema
    this.schemas.set(ModalTypeEnum.MULTI_SELECT, {
      required: ['question', 'options', 'correctOptionIds'],
      structure: {
        question: 'string',
        options: {
          type: 'array',
          minItems: 2,
          items: {
            id: 'string',
            content: 'string',
            isCorrect: 'boolean',
            feedback: 'string?'
          }
        },
        correctOptionIds: 'array',
        minSelections: 'number?',
        maxSelections: 'number?'
      }
    });

    // Drag and drop schema
    this.schemas.set(ModalTypeEnum.DRAG_DROP, {
      required: ['instruction', 'sources', 'targets'],
      structure: {
        instruction: 'string',
        sources: {
          type: 'array',
          items: {
            id: 'string',
            content: 'string',
            category: 'string?'
          }
        },
        targets: {
          type: 'array',
          items: {
            id: 'string',
            label: 'string',
            acceptsIds: 'array',
            maxItems: 'number?'
          }
        }
      }
    });

    // Code editor schema
    this.schemas.set(ModalTypeEnum.CODE_EDITOR, {
      required: ['language', 'problem'],
      structure: {
        language: 'string',
        problem: 'string',
        starterCode: 'string?',
        testCases: {
          type: 'array',
          items: {
            id: 'string',
            input: 'any',
            expectedOutput: 'any',
            visible: 'boolean'
          }
        },
        hiddenCode: 'string?'
      }
    });

    // Add more schemas for other modal types...
  }

  /**
   * Standardize content to match modal schema
   */
  public standardize(
    content: any,
    modalType: ModalTypeEnum
  ): StandardizedContent {
    const schema = this.schemas.get(modalType);
    if (!schema) {
      throw new Error(`No schema defined for modal type: ${modalType}`);
    }

    // Transform content to match schema
    const standardized = this.transformToSchema(content, schema, modalType);

    // Validate standardized content
    const validation = this.validateAgainstSchema(standardized, schema);
    if (!validation.valid) {
      // Attempt auto-fix
      const fixed = this.autoFixContent(standardized, validation.errors, schema);
      
      // Re-validate
      const revalidation = this.validateAgainstSchema(fixed, schema);
      if (!revalidation.valid) {
        throw new ValidationError(
          `Content does not match schema for ${modalType}`,
          revalidation.errors
        );
      }
      
      return fixed;
    }

    return standardized;
  }

  /**
   * Transform content to match schema structure
   */
  private transformToSchema(
    content: any,
    schema: any,
    modalType: ModalTypeEnum
  ): any {
    const transformed: any = {
      modalType,
      data: {}
    };

    switch (modalType) {
      case ModalTypeEnum.FILL_BLANK:
        transformed.data = this.transformFillBlank(content);
        break;
      
      case ModalTypeEnum.SINGLE_SELECT:
        transformed.data = this.transformSingleSelect(content);
        break;
      
      case ModalTypeEnum.MULTI_SELECT:
        transformed.data = this.transformMultiSelect(content);
        break;
      
      case ModalTypeEnum.DRAG_DROP:
        transformed.data = this.transformDragDrop(content);
        break;
      
      case ModalTypeEnum.CODE_EDITOR:
        transformed.data = this.transformCodeEditor(content);
        break;
      
      default:
        transformed.data = this.transformGeneric(content, schema);
    }

    return transformed;
  }

  /**
   * Transform fill-in-blank content
   */
  private transformFillBlank(content: any): any {
    const transformed: any = {
      text: '',
      blanks: []
    };

    // Extract text
    transformed.text = content.text || 
                      content.passage || 
                      content.content || 
                      '';

    // Extract blanks
    if (content.blanks) {
      transformed.blanks = content.blanks;
    } else if (content.gaps) {
      transformed.blanks = content.gaps.map((gap: any, index: number) => ({
        id: gap.id || `blank-${index}`,
        position: gap.position || index,
        answer: gap.answer || gap.correct || '',
        placeholder: gap.placeholder || '[blank]',
        hint: gap.hint
      }));
    } else {
      // Try to extract blanks from text
      transformed.blanks = this.extractBlanksFromText(transformed.text);
    }

    return transformed;
  }

  /**
   * Transform single select content
   */
  private transformSingleSelect(content: any): any {
    const transformed: any = {
      question: '',
      options: [],
      correctOptionId: ''
    };

    // Extract question
    transformed.question = content.question || 
                          content.prompt || 
                          content.instructions || 
                          '';

    // Extract options
    const sourceOptions = content.options || 
                          content.choices || 
                          content.answers || 
                          [];

    transformed.options = sourceOptions.map((option: any, index: number) => {
      const id = option.id || `option-${index}`;
      const isCorrect = option.isCorrect || 
                       option.correct || 
                       option.value === content.correctAnswer;
      
      if (isCorrect) {
        transformed.correctOptionId = id;
      }

      return {
        id,
        content: option.content || option.text || option.value || '',
        isCorrect,
        feedback: option.feedback || option.explanation
      };
    });

    // Ensure we have a correct option
    if (!transformed.correctOptionId && transformed.options.length > 0) {
      // If no correct option marked, mark first as correct
      transformed.options[0].isCorrect = true;
      transformed.correctOptionId = transformed.options[0].id;
    }

    return transformed;
  }

  /**
   * Transform multiple select content
   */
  private transformMultiSelect(content: any): any {
    const transformed: any = {
      question: '',
      options: [],
      correctOptionIds: [],
      minSelections: 1,
      maxSelections: null
    };

    // Extract question
    transformed.question = content.question || 
                          content.prompt || 
                          content.instructions || 
                          '';

    // Extract options
    const sourceOptions = content.options || 
                          content.choices || 
                          content.answers || 
                          [];

    transformed.options = sourceOptions.map((option: any, index: number) => {
      const id = option.id || `option-${index}`;
      const isCorrect = option.isCorrect || 
                       option.correct || 
                       (Array.isArray(content.correctAnswers) && 
                        content.correctAnswers.includes(option.value));
      
      if (isCorrect) {
        transformed.correctOptionIds.push(id);
      }

      return {
        id,
        content: option.content || option.text || option.value || '',
        isCorrect,
        feedback: option.feedback || option.explanation
      };
    });

    // Set selection limits
    transformed.minSelections = content.minSelections || 
                                content.minRequired || 
                                1;
    transformed.maxSelections = content.maxSelections || 
                                content.maxAllowed || 
                                transformed.correctOptionIds.length;

    return transformed;
  }

  /**
   * Transform drag and drop content
   */
  private transformDragDrop(content: any): any {
    const transformed: any = {
      instruction: '',
      sources: [],
      targets: []
    };

    // Extract instruction
    transformed.instruction = content.instruction || 
                             content.prompt || 
                             content.directions || 
                             'Drag items to their correct locations';

    // Extract sources
    const sourcesArray = content.sources || 
                        content.draggables || 
                        content.items || 
                        [];

    transformed.sources = sourcesArray.map((source: any, index: number) => ({
      id: source.id || `source-${index}`,
      content: source.content || source.text || source.label || '',
      category: source.category || source.type
    }));

    // Extract targets
    const targetsArray = content.targets || 
                        content.droppables || 
                        content.zones || 
                        [];

    transformed.targets = targetsArray.map((target: any, index: number) => ({
      id: target.id || `target-${index}`,
      label: target.label || target.name || `Zone ${index + 1}`,
      acceptsIds: target.acceptsIds || 
                  target.accepts || 
                  target.correctItems || 
                  [],
      maxItems: target.maxItems || target.capacity
    }));

    return transformed;
  }

  /**
   * Transform code editor content
   */
  private transformCodeEditor(content: any): any {
    const transformed: any = {
      language: '',
      problem: '',
      starterCode: '',
      testCases: []
    };

    // Extract language
    transformed.language = content.language || 
                          content.programmingLanguage || 
                          content.lang || 
                          'javascript';

    // Extract problem
    transformed.problem = content.problem || 
                         content.instructions || 
                         content.prompt || 
                         '';

    // Extract starter code
    transformed.starterCode = content.starterCode || 
                             content.template || 
                             content.boilerplate || 
                             '';

    // Extract test cases
    const testCases = content.testCases || 
                      content.tests || 
                      content.examples || 
                      [];

    transformed.testCases = testCases.map((test: any, index: number) => ({
      id: test.id || `test-${index}`,
      input: test.input || test.inputs || null,
      expectedOutput: test.expectedOutput || 
                      test.expected || 
                      test.output || 
                      null,
      visible: test.visible !== false,
      description: test.description || test.name
    }));

    return transformed;
  }

  /**
   * Generic transformation for other types
   */
  private transformGeneric(content: any, schema: any): any {
    const transformed: any = {};

    // Copy required fields
    for (const field of schema.required) {
      transformed[field] = content[field] || this.getDefaultValue(schema.structure[field]);
    }

    // Copy optional fields if present
    for (const [field, type] of Object.entries(schema.structure)) {
      if (!schema.required.includes(field) && content[field] !== undefined) {
        transformed[field] = content[field];
      }
    }

    return transformed;
  }

  /**
   * Extract blanks from text with markers
   */
  private extractBlanksFromText(text: string): any[] {
    const blanks: any[] = [];
    const blankPattern = /___+|\[blank\]|\{\{(.+?)\}\}/g;
    let match;
    let index = 0;

    while ((match = blankPattern.exec(text)) !== null) {
      blanks.push({
        id: `blank-${index}`,
        position: match.index,
        answer: match[1] || '',
        placeholder: '[blank]',
        hint: ''
      });
      index++;
    }

    return blanks;
  }

  /**
   * Validate content against schema
   */
  private validateAgainstSchema(content: any, schema: any): any {
    const errors: any[] = [];

    // Check required fields
    for (const field of schema.required) {
      if (!content.data || content.data[field] === undefined) {
        errors.push({
          field,
          message: `Required field '${field}' is missing`
        });
      }
    }

    // Validate structure types
    if (content.data) {
      for (const [field, expectedType] of Object.entries(schema.structure)) {
        const value = content.data[field];
        if (value !== undefined && !this.validateType(value, expectedType)) {
          errors.push({
            field,
            message: `Field '${field}' has incorrect type. Expected: ${expectedType}`
          });
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate value type
   */
  private validateType(value: any, expectedType: any): boolean {
    if (typeof expectedType === 'string') {
      // Handle optional types (ending with ?)
      if (expectedType.endsWith('?')) {
        if (value === null || value === undefined) return true;
        expectedType = expectedType.slice(0, -1);
      }

      // Handle union types (type1|type2)
      if (expectedType.includes('|')) {
        const types = expectedType.split('|');
        return types.some(type => this.validateType(value, type));
      }

      // Basic type checking
      switch (expectedType) {
        case 'string':
          return typeof value === 'string';
        case 'number':
          return typeof value === 'number';
        case 'boolean':
          return typeof value === 'boolean';
        case 'array':
          return Array.isArray(value);
        case 'object':
          return typeof value === 'object' && !Array.isArray(value);
        case 'any':
          return true;
        default:
          return true;
      }
    }

    // Complex type checking
    if (typeof expectedType === 'object') {
      if (expectedType.type === 'array') {
        if (!Array.isArray(value)) return false;
        // Additional array validation could go here
        return true;
      }
    }

    return true;
  }

  /**
   * Auto-fix common content issues
   */
  private autoFixContent(content: any, errors: any[], schema: any): any {
    const fixed = { ...content };

    if (!fixed.data) {
      fixed.data = {};
    }

    for (const error of errors) {
      if (error.message.includes('missing')) {
        // Add missing required fields with defaults
        fixed.data[error.field] = this.getDefaultValue(schema.structure[error.field]);
      } else if (error.message.includes('incorrect type')) {
        // Try to convert to correct type
        fixed.data[error.field] = this.convertToType(
          fixed.data[error.field],
          schema.structure[error.field]
        );
      }
    }

    return fixed;
  }

  /**
   * Get default value for a type
   */
  private getDefaultValue(type: any): any {
    if (typeof type === 'string') {
      switch (type.replace('?', '')) {
        case 'string':
          return '';
        case 'number':
          return 0;
        case 'boolean':
          return false;
        case 'array':
          return [];
        case 'object':
          return {};
        default:
          return null;
      }
    }

    if (typeof type === 'object' && type.type === 'array') {
      return [];
    }

    return null;
  }

  /**
   * Convert value to expected type
   */
  private convertToType(value: any, expectedType: any): any {
    const type = expectedType.replace('?', '');

    switch (type) {
      case 'string':
        return String(value);
      case 'number':
        return Number(value) || 0;
      case 'boolean':
        return Boolean(value);
      case 'array':
        return Array.isArray(value) ? value : [value];
      default:
        return value;
    }
  }
}

// Singleton export
export const dataStructureStandardizer = new DataStructureStandardizer();