/**
 * Comprehensive Question Type Testing Framework
 * ==============================================
 * Tests all 15 question types through the entire pipeline:
 * AI Generation → Content Converter → Question Renderer → Validation
 * 
 * Created: 2025-08-31
 */

import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import OpenAI from 'openai';
import { AIContentConverter } from '../services/content/AIContentConverter';
import { questionTypeValidator } from '../services/questionTypeValidator';
import { QuestionValidator } from '../services/content/QuestionValidator';
import { ALL_TYPE_IDS } from '../types/questionTypes';
import * as fs from 'fs/promises';
import * as path from 'path';

// Load environment variables
config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface TestResult {
  questionType: string;
  success: boolean;
  aiRequest?: any;
  aiResponse?: any;
  converted?: any;
  validationResult?: any;
  errors: string[];
  warnings: string[];
  pipeline: {
    aiGeneration: boolean;
    contentConversion: boolean;
    typeValidation: boolean;
    answerValidation: boolean;
  };
}

/**
 * Comprehensive question type specifications for AI generation
 */
const QUESTION_TYPE_SPECS = {
  multiple_choice: {
    description: "Multiple choice question with exactly 4 options",
    request: {
      type: "multiple_choice",
      requirements: "Generate a multiple choice question with exactly 4 options labeled A, B, C, D",
      format: {
        question: "string",
        options: ["option A", "option B", "option C", "option D"],
        correct_answer: "index of correct option (0-3)"
      }
    },
    validation: {
      expectedFields: ['question', 'options', 'correct_answer'],
      answerFormat: 'number (0-3)'
    }
  },
  
  true_false: {
    description: "True/False question",
    request: {
      type: "true_false",
      requirements: "Generate a true/false question",
      format: {
        question: "True or False: [statement]",
        correct_answer: "true or false (string)"
      }
    },
    validation: {
      expectedFields: ['question', 'correct_answer'],
      answerFormat: 'string ("true" or "false")'
    }
  },
  
  fill_blank: {
    description: "Fill in the blank question",
    request: {
      type: "fill_blank",
      requirements: "Generate a fill-in-the-blank question with blanks marked as _____",
      format: {
        template: "The _____ is the largest planet in our solar system",
        blanks: [{
          id: "blank_0",
          correctAnswers: ["Jupiter"]
        }],
        correct_answer: "Jupiter"
      }
    },
    validation: {
      expectedFields: ['template', 'blanks', 'correct_answer'],
      answerFormat: 'string or array of strings'
    }
  },
  
  numeric: {
    description: "Numeric answer question",
    request: {
      type: "numeric",
      requirements: "Generate a question requiring a numeric answer",
      format: {
        question: "What is 15 + 27?",
        correct_answer: 42,
        unit: "optional unit string"
      }
    },
    validation: {
      expectedFields: ['question', 'correct_answer'],
      answerFormat: 'number'
    }
  },
  
  counting: {
    description: "Counting question with visual elements",
    request: {
      type: "counting",
      requirements: "Generate a counting question with visual elements (emojis)",
      format: {
        question: "How many stars are there?",
        visual: "⭐ ⭐ ⭐ ⭐ ⭐",
        correct_answer: 5
      }
    },
    validation: {
      expectedFields: ['question', 'visual', 'correct_answer'],
      answerFormat: 'number matching emoji count'
    }
  },
  
  short_answer: {
    description: "Short text answer question",
    request: {
      type: "short_answer",
      requirements: "Generate a short answer question (1-2 words expected)",
      format: {
        question: "What is the capital of France?",
        correct_answer: "Paris",
        acceptable_answers: ["Paris", "paris", "PARIS"]
      }
    },
    validation: {
      expectedFields: ['question', 'correct_answer'],
      answerFormat: 'string'
    }
  },
  
  long_answer: {
    description: "Extended text answer question",
    request: {
      type: "long_answer",
      requirements: "Generate a question requiring a paragraph response",
      format: {
        question: "Explain why...",
        sample_answer: "A model answer paragraph",
        grading_rubric: ["key point 1", "key point 2"]
      }
    },
    validation: {
      expectedFields: ['question', 'sample_answer'],
      answerFormat: 'text paragraph'
    }
  },
  
  matching: {
    description: "Match items from two columns",
    request: {
      type: "matching",
      requirements: "Generate a matching question with items and matches",
      format: {
        question: "Match the following",
        items: ["Item 1", "Item 2", "Item 3"],
        matches: ["Match A", "Match B", "Match C"],
        correct_pairs: [[0, 0], [1, 1], [2, 2]]
      }
    },
    validation: {
      expectedFields: ['question', 'items', 'matches', 'correct_pairs'],
      answerFormat: 'array of [itemIndex, matchIndex] pairs'
    }
  },
  
  ordering: {
    description: "Put items in correct order",
    request: {
      type: "ordering",
      requirements: "Generate an ordering/sequencing question",
      format: {
        question: "Put these in chronological order",
        items: ["Event 1", "Event 2", "Event 3"],
        correct_order: [0, 1, 2]
      }
    },
    validation: {
      expectedFields: ['question', 'items', 'correct_order'],
      answerFormat: 'array of indices'
    }
  },
  
  classification: {
    description: "Classify items into categories",
    request: {
      type: "classification",
      requirements: "Generate a classification question",
      format: {
        question: "Classify these animals",
        items: ["Dog", "Eagle", "Salmon"],
        categories: ["Mammal", "Bird", "Fish"],
        correct_classification: {"Dog": "Mammal", "Eagle": "Bird", "Salmon": "Fish"}
      }
    },
    validation: {
      expectedFields: ['question', 'items', 'categories', 'correct_classification'],
      answerFormat: 'object mapping items to categories'
    }
  },
  
  visual_identification: {
    description: "Identify objects in images",
    request: {
      type: "visual_identification",
      requirements: "Generate a visual identification question",
      format: {
        question: "What shape is this?",
        visual_description: "A red circle",
        correct_answer: "circle",
        options: ["circle", "square", "triangle"]
      }
    },
    validation: {
      expectedFields: ['question', 'visual_description', 'correct_answer'],
      answerFormat: 'string'
    }
  },
  
  pattern_recognition: {
    description: "Identify patterns in sequences",
    request: {
      type: "pattern_recognition",
      requirements: "Generate a pattern recognition question",
      format: {
        question: "What comes next?",
        pattern: ["2", "4", "6", "8", "?"],
        correct_answer: "10"
      }
    },
    validation: {
      expectedFields: ['question', 'pattern', 'correct_answer'],
      answerFormat: 'string or number'
    }
  },
  
  code_completion: {
    description: "Complete code snippets",
    request: {
      type: "code_completion",
      requirements: "Generate a code completion question",
      format: {
        question: "Complete the function",
        code_template: "function add(a, b) { return _____ }",
        correct_answer: "a + b"
      }
    },
    validation: {
      expectedFields: ['question', 'code_template', 'correct_answer'],
      answerFormat: 'string'
    }
  },
  
  diagram_labeling: {
    description: "Label parts of a diagram",
    request: {
      type: "diagram_labeling",
      requirements: "Generate a diagram labeling question",
      format: {
        question: "Label the parts",
        diagram_description: "A cell with nucleus, membrane, cytoplasm",
        labels: ["nucleus", "membrane", "cytoplasm"],
        correct_positions: [[50, 50], [10, 10], [30, 30]]
      }
    },
    validation: {
      expectedFields: ['question', 'diagram_description', 'labels'],
      answerFormat: 'array of labels with positions'
    }
  },
  
  open_ended: {
    description: "Open-ended creative question",
    request: {
      type: "open_ended",
      requirements: "Generate an open-ended question for creative thinking",
      format: {
        question: "If you could invent anything, what would it be and why?",
        sample_response: "Example creative response",
        evaluation_criteria: ["creativity", "explanation", "feasibility"]
      }
    },
    validation: {
      expectedFields: ['question'],
      answerFormat: 'free text'
    }
  }
};

class ComprehensiveQuestionTypeTester {
  private converter: AIContentConverter;
  private validator: QuestionValidator;
  private results: TestResult[] = [];
  
  constructor() {
    this.converter = new AIContentConverter();
    this.validator = new QuestionValidator();
  }
  
  /**
   * Generate a question using OpenAI
   */
  async generateQuestionFromAI(
    questionType: string,
    subject: string = 'Math',
    grade: string = '5',
    skill: string = 'Basic Arithmetic'
  ): Promise<{ request: any; response: any }> {
    const spec = QUESTION_TYPE_SPECS[questionType as keyof typeof QUESTION_TYPE_SPECS];
    if (!spec) {
      throw new Error(`Unknown question type: ${questionType}`);
    }
    
    const prompt = `Generate a ${grade}th grade ${subject} question about "${skill}".
    
Question Type: ${spec.description}
Requirements: ${spec.request.requirements}

IMPORTANT: Return ONLY valid JSON in this exact format:
${JSON.stringify(spec.request.format, null, 2)}

The response must be a single ${questionType} question following the format exactly.`;

    try {
      console.log(`\n📤 Requesting ${questionType} from AI...`);
      
      const response = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an educational content generator. Always return valid JSON only, no markdown or explanations.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      });
      
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error('No content received from AI');
      }
      
      // Clean up the response
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const parsed = JSON.parse(cleanContent);
      
      return {
        request: spec.request,
        response: parsed
      };
    } catch (error) {
      console.error(`❌ AI generation failed for ${questionType}:`, error);
      throw error;
    }
  }
  
  /**
   * Test a single question type through the entire pipeline
   */
  async testQuestionType(questionType: string): Promise<TestResult> {
    const result: TestResult = {
      questionType,
      success: false,
      errors: [],
      warnings: [],
      pipeline: {
        aiGeneration: false,
        contentConversion: false,
        typeValidation: false,
        answerValidation: false
      }
    };
    
    try {
      // Step 1: Generate from AI
      console.log(`\n🧪 Testing ${questionType}...`);
      
      const { request, response } = await this.generateQuestionFromAI(
        questionType,
        'Math',
        '5',
        'Problem Solving'
      );
      
      result.aiRequest = request;
      result.aiResponse = response;
      result.pipeline.aiGeneration = true;
      
      console.log(`✅ AI generated ${questionType} successfully`);
      console.log('   Response:', JSON.stringify(response, null, 2));
      
      // Step 2: Convert using AIContentConverter
      const skillInfo = {
        skill_name: 'Problem Solving',
        subject: 'Math',
        grade: '5'
      };
      
      // Add type field if not present
      const assessmentData = { ...response, type: questionType };
      
      const converted = this.converter.convertToQuestion(assessmentData, skillInfo);
      result.converted = converted;
      result.pipeline.contentConversion = true;
      
      console.log(`✅ Content converted successfully`);
      console.log('   Type:', converted.type);
      
      // Step 3: Validate type
      const typeValidation = questionTypeValidator.validate(converted, '5');
      
      if (typeValidation.errors) {
        result.errors.push(...typeValidation.errors);
      }
      if (typeValidation.warnings) {
        result.warnings.push(...typeValidation.warnings);
      }
      
      result.pipeline.typeValidation = !typeValidation.errors || typeValidation.errors.length === 0;
      
      if (result.pipeline.typeValidation) {
        console.log(`✅ Type validation passed`);
      } else {
        console.log(`⚠️ Type validation issues:`, typeValidation.errors);
      }
      
      // Step 4: Test answer validation
      // Create a mock answer based on the correct answer
      let mockAnswer: any;
      
      switch (questionType) {
        case 'multiple_choice':
          mockAnswer = converted.options?.[0]?.id || '0';
          break;
        case 'true_false':
          mockAnswer = 'true';
          break;
        case 'numeric':
        case 'counting':
          mockAnswer = (converted as any).correctAnswer || 
                      (converted as any).correctCount || 
                      response.correct_answer || 
                      5;
          break;
        case 'fill_blank':
          mockAnswer = (converted as any).blanks?.[0]?.correctAnswers?.[0] || 'answer';
          break;
        default:
          mockAnswer = response.correct_answer || 'test answer';
      }
      
      const validationResult = this.validator.validateAnswer(converted, mockAnswer);
      result.validationResult = validationResult;
      result.pipeline.answerValidation = validationResult.isValid;
      
      if (result.pipeline.answerValidation) {
        console.log(`✅ Answer validation successful`);
      } else {
        console.log(`❌ Answer validation failed:`, validationResult.errors);
        if (validationResult.errors) {
          result.errors.push(...validationResult.errors);
        }
      }
      
      // Overall success
      result.success = Object.values(result.pipeline).every(v => v === true);
      
      if (result.success) {
        console.log(`✨ ${questionType} PASSED all pipeline stages`);
      } else {
        console.log(`❌ ${questionType} FAILED some pipeline stages`);
      }
      
    } catch (error) {
      console.error(`❌ Error testing ${questionType}:`, error);
      result.errors.push(error instanceof Error ? error.message : String(error));
    }
    
    return result;
  }
  
  /**
   * Test all question types
   */
  async testAllQuestionTypes(): Promise<void> {
    console.log('=====================================');
    console.log('COMPREHENSIVE QUESTION TYPE TESTING');
    console.log('=====================================\n');
    
    const typesToTest = Object.keys(QUESTION_TYPE_SPECS);
    
    for (const type of typesToTest) {
      const result = await this.testQuestionType(type);
      this.results.push(result);
      
      // Add delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generate report
    await this.generateReport();
  }
  
  /**
   * Generate comprehensive test report
   */
  async generateReport(): Promise<void> {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.length,
        passed: this.results.filter(r => r.success).length,
        failed: this.results.filter(r => !r.success).length
      },
      details: this.results,
      pipelineAnalysis: {
        aiGeneration: this.results.filter(r => r.pipeline.aiGeneration).length,
        contentConversion: this.results.filter(r => r.pipeline.contentConversion).length,
        typeValidation: this.results.filter(r => r.pipeline.typeValidation).length,
        answerValidation: this.results.filter(r => r.pipeline.answerValidation).length
      },
      failureAnalysis: this.results
        .filter(r => !r.success)
        .map(r => ({
          type: r.questionType,
          failedStages: Object.entries(r.pipeline)
            .filter(([_, passed]) => !passed)
            .map(([stage]) => stage),
          errors: r.errors
        }))
    };
    
    // Save report
    const reportPath = path.join(process.cwd(), 'question-type-test-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
    
    // Print summary
    console.log('\n=====================================');
    console.log('TEST RESULTS SUMMARY');
    console.log('=====================================');
    console.log(`Total Types Tested: ${report.summary.total}`);
    console.log(`✅ Passed: ${report.summary.passed}`);
    console.log(`❌ Failed: ${report.summary.failed}`);
    console.log('\nPipeline Analysis:');
    console.log(`  AI Generation: ${report.pipelineAnalysis.aiGeneration}/${report.summary.total}`);
    console.log(`  Content Conversion: ${report.pipelineAnalysis.contentConversion}/${report.summary.total}`);
    console.log(`  Type Validation: ${report.pipelineAnalysis.typeValidation}/${report.summary.total}`);
    console.log(`  Answer Validation: ${report.pipelineAnalysis.answerValidation}/${report.summary.total}`);
    
    if (report.failureAnalysis.length > 0) {
      console.log('\n❌ Failed Types:');
      report.failureAnalysis.forEach(failure => {
        console.log(`  ${failure.type}:`);
        console.log(`    Failed stages: ${failure.failedStages.join(', ')}`);
        if (failure.errors.length > 0) {
          console.log(`    Errors: ${failure.errors.join('; ')}`);
        }
      });
    }
    
    console.log(`\n📄 Full report saved to: ${reportPath}`);
  }
  
  /**
   * Test specific question type with custom data
   */
  async testSpecificType(
    questionType: string,
    customData?: any
  ): Promise<TestResult> {
    console.log(`\n🎯 Testing specific type: ${questionType}`);
    
    if (customData) {
      console.log('Using custom data:', JSON.stringify(customData, null, 2));
    }
    
    const result = await this.testQuestionType(questionType);
    
    console.log('\n📊 Test Result:');
    console.log(JSON.stringify(result, null, 2));
    
    return result;
  }
}

// Main execution
async function main() {
  const tester = new ComprehensiveQuestionTypeTester();
  
  // Parse command line arguments
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'all') {
    // Test all question types
    await tester.testAllQuestionTypes();
  } else if (args[0] === 'specific' && args[1]) {
    // Test specific type
    await tester.testSpecificType(args[1]);
  } else if (args[0] === 'counting') {
    // Special test for counting issue
    console.log('\n🔍 Special test for counting question issue...');
    const result = await tester.testSpecificType('counting');
    
    if (result.converted) {
      console.log('\n📋 Converted counting question:');
      console.log('  correctCount:', (result.converted as any).correctCount);
      console.log('  correctAnswer:', (result.converted as any).correctAnswer);
      console.log('  Type:', result.converted.type);
    }
  } else {
    console.log('Usage:');
    console.log('  npm run test:question-types        # Test all types');
    console.log('  npm run test:question-types all    # Test all types');
    console.log('  npm run test:question-types specific [type]  # Test specific type');
    console.log('  npm run test:question-types counting  # Special counting test');
  }
}

// Run the tester
main().catch(console.error);

export { ComprehensiveQuestionTypeTester, QUESTION_TYPE_SPECS };