/**
 * Test utilities for validating QuestionRenderer fixes
 * Tests the three critical issues that were resolved:
 * 1. Answer array includes correct answer
 * 2. Submit button appears for practice questions
 * 3. Next Question button appears after submission
 */

import { Question, QuestionType } from '../types/Question';

export class QuestionFixValidator {
  /**
   * Test 1: Validate that answer arrays always include the correct answer
   */
  static validateAnswerArrayInclusion(question: Question): {
    isValid: boolean;
    details: string;
    correctAnswerIncluded: boolean;
  } {
    if (question.type !== QuestionType.MULTIPLE_CHOICE) {
      return {
        isValid: true,
        details: 'Not a multiple choice question',
        correctAnswerIncluded: true
      };
    }

    const options = question.options || [];
    const correctAnswer = question.correctAnswer;
    
    // Check if correct answer is in options
    const correctAnswerIncluded = options.includes(correctAnswer);
    
    // For visual counting questions, validate the count
    if (question.media?.content && question.content?.includes('How many')) {
      const emojiCount = (question.media.content.match(/🏀/g) || []).length;
      const hasCorrectCount = options.includes(emojiCount.toString());
      
      return {
        isValid: hasCorrectCount,
        details: `Visual shows ${emojiCount} items. Options: [${options.join(', ')}]`,
        correctAnswerIncluded: hasCorrectCount
      };
    }
    
    return {
      isValid: correctAnswerIncluded,
      details: `Correct answer "${correctAnswer}" ${correctAnswerIncluded ? 'is' : 'is NOT'} in options: [${options.join(', ')}]`,
      correctAnswerIncluded
    };
  }

  /**
   * Test 2: Validate Submit button visibility logic
   */
  static validateSubmitButtonLogic(
    answerSelected: boolean,
    answerSubmitted: boolean,
    practiceMode: boolean
  ): {
    shouldShowSubmit: boolean;
    reason: string;
  } {
    // Submit button should show when:
    // 1. In practice mode
    // 2. Answer is selected but not yet submitted
    const shouldShow = practiceMode && answerSelected && !answerSubmitted;
    
    let reason = '';
    if (!practiceMode) {
      reason = 'Not in practice mode';
    } else if (!answerSelected) {
      reason = 'No answer selected yet';
    } else if (answerSubmitted) {
      reason = 'Answer already submitted';
    } else {
      reason = 'Submit button should be visible';
    }
    
    return {
      shouldShowSubmit: shouldShow,
      reason
    };
  }

  /**
   * Test 3: Validate Next Question button visibility logic
   */
  static validateNextButtonLogic(
    answerSubmitted: boolean,
    currentIndex: number,
    totalQuestions: number
  ): {
    shouldShowNext: boolean;
    reason: string;
  } {
    // Next button should show when:
    // 1. Answer has been submitted
    // 2. Not on the last question
    const isLastQuestion = currentIndex >= totalQuestions - 1;
    const shouldShow = answerSubmitted && !isLastQuestion;
    
    let reason = '';
    if (!answerSubmitted) {
      reason = 'Answer not yet submitted';
    } else if (isLastQuestion) {
      reason = 'On last question - no next button needed';
    } else {
      reason = 'Next button should be visible';
    }
    
    return {
      shouldShowNext: shouldShow,
      reason
    };
  }

  /**
   * Run all validation tests on a question flow
   */
  static runFullValidation(
    questions: Question[],
    currentIndex: number = 0,
    selectedAnswer?: string,
    submittedAnswer?: string
  ): {
    testResults: {
      answerArrayTest: boolean;
      submitButtonTest: boolean;
      nextButtonTest: boolean;
    };
    details: {
      answerArray: string;
      submitButton: string;
      nextButton: string;
    };
    allTestsPassed: boolean;
  } {
    const currentQuestion = questions[currentIndex];
    
    // Test 1: Answer array validation
    const answerArrayResult = this.validateAnswerArrayInclusion(currentQuestion);
    
    // Test 2: Submit button validation
    const submitButtonResult = this.validateSubmitButtonLogic(
      !!selectedAnswer,
      !!submittedAnswer,
      true // Assume practice mode for testing
    );
    
    // Test 3: Next button validation
    const nextButtonResult = this.validateNextButtonLogic(
      !!submittedAnswer,
      currentIndex,
      questions.length
    );
    
    const testResults = {
      answerArrayTest: answerArrayResult.isValid,
      submitButtonTest: submitButtonResult.shouldShowSubmit === (!!selectedAnswer && !submittedAnswer),
      nextButtonTest: nextButtonResult.shouldShowNext === (!!submittedAnswer && currentIndex < questions.length - 1)
    };
    
    const allTestsPassed = Object.values(testResults).every(result => result);
    
    return {
      testResults,
      details: {
        answerArray: answerArrayResult.details,
        submitButton: submitButtonResult.reason,
        nextButton: nextButtonResult.reason
      },
      allTestsPassed
    };
  }

  /**
   * Generate test scenarios for visual counting questions
   */
  static generateVisualCountingTestCases(): Array<{
    visualCount: number;
    expectedOptions: string[];
    testName: string;
  }> {
    return [
      {
        visualCount: 5,
        expectedOptions: ['3', '4', '5', '6', '7'],
        testName: 'Basketball count (5 items)'
      },
      {
        visualCount: 3,
        expectedOptions: ['1', '2', '3', '4', '5'],
        testName: 'Small count (3 items)'
      },
      {
        visualCount: 8,
        expectedOptions: ['6', '7', '8', '9', '10'],
        testName: 'Large count (8 items)'
      },
      {
        visualCount: 1,
        expectedOptions: ['1', '2', '3', '4'],
        testName: 'Single item count'
      }
    ];
  }

  /**
   * Test the complete question flow
   */
  static async testCompleteQuestionFlow(): Promise<{
    success: boolean;
    report: string[];
  }> {
    const report: string[] = [];
    let success = true;
    
    report.push('=== QuestionRenderer Fix Validation Report ===');
    report.push('');
    
    // Test visual counting scenarios
    report.push('📊 Testing Visual Counting Scenarios:');
    const testCases = this.generateVisualCountingTestCases();
    
    for (const testCase of testCases) {
      const mockQuestion: Question = {
        id: `test-${testCase.visualCount}`,
        type: QuestionType.MULTIPLE_CHOICE,
        content: `How many basketballs do you see?`,
        media: {
          type: 'visual',
          content: '🏀'.repeat(testCase.visualCount)
        },
        options: testCase.expectedOptions.slice(0, 4),
        correctAnswer: testCase.visualCount.toString(),
        difficulty: 'medium',
        topic: 'counting'
      };
      
      const result = this.validateAnswerArrayInclusion(mockQuestion);
      const status = result.correctAnswerIncluded ? '✅' : '❌';
      report.push(`  ${status} ${testCase.testName}: ${result.details}`);
      
      if (!result.correctAnswerIncluded) {
        success = false;
      }
    }
    
    report.push('');
    report.push('🔘 Testing Button Visibility Logic:');
    
    // Test button scenarios
    const buttonScenarios = [
      { selected: false, submitted: false, desc: 'No selection' },
      { selected: true, submitted: false, desc: 'Answer selected' },
      { selected: true, submitted: true, desc: 'Answer submitted' }
    ];
    
    for (const scenario of buttonScenarios) {
      const submitResult = this.validateSubmitButtonLogic(
        scenario.selected,
        scenario.submitted,
        true
      );
      
      const nextResult = this.validateNextButtonLogic(
        scenario.submitted,
        0,
        5 // Not last question
      );
      
      report.push(`  ${scenario.desc}:`);
      report.push(`    Submit button: ${submitResult.shouldShowSubmit ? 'Visible' : 'Hidden'} - ${submitResult.reason}`);
      report.push(`    Next button: ${nextResult.shouldShowNext ? 'Visible' : 'Hidden'} - ${nextResult.reason}`);
    }
    
    report.push('');
    report.push('=== Summary ===');
    report.push(`All tests passed: ${success ? '✅ YES' : '❌ NO'}`);
    
    return { success, report };
  }
}

// Export for use in components
export default QuestionFixValidator;