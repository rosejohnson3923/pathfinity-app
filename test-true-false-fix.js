/**
 * Test script to verify True/False detection fix
 * This tests the detection logic directly without needing full app setup
 */

// Simulate the detection logic from AILearningJourneyService.ts
function detectQuestionType(assessment, skill, student) {
  // FIXED LOGIC - True/False checked FIRST
  if (!assessment.type) {
    // PRIORITY 1: Check for True/False patterns FIRST
    const questionLower = assessment.question.toLowerCase();
    if (questionLower.includes('true or false') || 
        questionLower.includes('true/false') || 
        questionLower.includes('t or f') ||
        (assessment.options && assessment.options.length === 2 && 
         (assessment.options.includes('True') || assessment.options.includes('true')))) {
      assessment.type = 'true_false';
    } 
    // PRIORITY 2: Fill in the blank
    else if (assessment.question.includes('_____') || assessment.question.includes('___')) {
      assessment.type = 'fill_blank';
    } 
    // PRIORITY 3: Multiple choice (must have options)
    else if (assessment.options && assessment.options.length > 2) {
      assessment.type = 'multiple_choice';
    } 
    // PRIORITY 4: Counting (for young grades with visuals and counting keywords)
    else if (assessment.visual && skill.subject === 'Math' && student.grade_level <= '2' &&
             (questionLower.includes('count') || questionLower.includes('how many'))) {
      assessment.type = 'counting';
    } 
    // PRIORITY 5: Numeric answers
    else if (skill.subject === 'Math' && !isNaN(Number(assessment.correct_answer))) {
      assessment.type = 'numeric';
    } 
    // DEFAULT: Short answer
    else {
      assessment.type = 'short_answer';
    }
  }
  return assessment.type;
}

// Test cases for Grade 10 True/False questions
const testCases = [
  {
    name: "True/False with 'True or False:' prefix",
    assessment: {
      question: "True or False: The Earth revolves around the Sun.",
      options: ["True", "False"],
      correct_answer: "True"
    },
    skill: { subject: "Science" },
    student: { grade_level: "10" },
    expected: "true_false"
  },
  {
    name: "True/False with 'True/False:' prefix",
    assessment: {
      question: "True/False: A quadratic equation always has two real roots.",
      options: ["True", "False"],
      correct_answer: "False"
    },
    skill: { subject: "Math" },
    student: { grade_level: "10" },
    expected: "true_false"
  },
  {
    name: "True/False with options only",
    assessment: {
      question: "Plants perform photosynthesis at night.",
      options: ["True", "False"],
      correct_answer: "False"
    },
    skill: { subject: "Science" },
    student: { grade_level: "10" },
    expected: "true_false"
  },
  {
    name: "True/False with visual (should NOT be counting for Grade 10)",
    assessment: {
      question: "True or False: There are 5 molecules shown.",
      options: ["True", "False"],
      visual: "🧬🧬🧬🧬",
      correct_answer: "False"
    },
    skill: { subject: "Science" },
    student: { grade_level: "10" },
    expected: "true_false"
  },
  {
    name: "Counting question for Grade 1 (should be detected as counting)",
    assessment: {
      question: "Count the apples",
      visual: "🍎🍎🍎",
      correct_answer: "3"
    },
    skill: { subject: "Math" },
    student: { grade_level: "1" },
    expected: "counting"
  },
  {
    name: "Multiple choice with more than 2 options",
    assessment: {
      question: "What is the capital of France?",
      options: ["London", "Paris", "Berlin", "Madrid"],
      correct_answer: "Paris"
    },
    skill: { subject: "Social Studies" },
    student: { grade_level: "10" },
    expected: "multiple_choice"
  }
];

// Run tests
console.log("Testing True/False Detection Fix\n" + "=".repeat(50));
let passed = 0;
let failed = 0;

testCases.forEach((testCase, index) => {
  const result = detectQuestionType(
    { ...testCase.assessment }, // Clone to avoid mutation
    testCase.skill,
    testCase.student
  );
  
  const success = result === testCase.expected;
  if (success) {
    passed++;
    console.log(`✅ Test ${index + 1}: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
  } else {
    failed++;
    console.log(`❌ Test ${index + 1}: ${testCase.name}`);
    console.log(`   Expected: ${testCase.expected}, Got: ${result}`);
    console.log(`   Question: "${testCase.assessment.question}"`);
  }
  console.log("");
});

console.log("=".repeat(50));
console.log(`Results: ${passed} passed, ${failed} failed`);

if (failed === 0) {
  console.log("🎉 All tests passed! True/False detection is working correctly.");
} else {
  console.log("⚠️ Some tests failed. Please review the detection logic.");
}

// Test the old buggy logic for comparison
function detectQuestionTypeBuggy(assessment, skill, student) {
  // BUGGY LOGIC - Counting checked before True/False
  if (!assessment.type) {
    if (assessment.visual && skill.subject === 'Math' && student.grade_level <= '2') {
      assessment.type = 'counting';
    } else if (assessment.question.includes('_____') || assessment.question.includes('___')) {
      assessment.type = 'fill_blank';
    } else if (assessment.options && assessment.options.length === 2 && 
               (assessment.options.includes('True') || assessment.options.includes('true'))) {
      assessment.type = 'true_false';
    } else if (assessment.options && assessment.options.length > 0) {
      assessment.type = 'multiple_choice';
    } else if (skill.subject === 'Math' && !isNaN(Number(assessment.correct_answer))) {
      assessment.type = 'numeric';
    } else {
      assessment.type = 'short_answer';
    }
  }
  return assessment.type;
}

console.log("\n" + "=".repeat(50));
console.log("Comparison with BUGGY logic (before fix):");
console.log("=".repeat(50));

testCases.slice(0, 4).forEach((testCase, index) => {
  const buggyResult = detectQuestionTypeBuggy(
    { ...testCase.assessment },
    testCase.skill,
    testCase.student
  );
  
  const fixedResult = detectQuestionType(
    { ...testCase.assessment },
    testCase.skill,
    testCase.student
  );
  
  if (buggyResult !== fixedResult) {
    console.log(`Test ${index + 1}: ${testCase.name}`);
    console.log(`   Buggy: ${buggyResult} ❌`);
    console.log(`   Fixed: ${fixedResult} ✅`);
    console.log("");
  }
});