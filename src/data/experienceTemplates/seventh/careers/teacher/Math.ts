// Experience Template: Teacher Career - Math Activities (7th Grade)
// How teachers use integers in their daily classroom work

export const seventhGradeTeacherMathTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Math',
    gradeLevel: '7',
    skillCode: '7.NS.A.1',
    skillName: 'Understanding integers',
    commonCoreStandard: '7.NS.A.1',
    difficulty: 4,
    interactionType: 'basic-calculator'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 👨‍🏫 Teachers help students understand positive and negative numbers!",
    challenge: "Your students need help with integers! ➕➖ Show them how to work with positive and negative numbers!",
    yourRole: "You're the math teacher! 👨‍🏫 Help students master integer operations!",
    actionPlan: [
      {
        step: "Explain positive and negative",
        icon: "➕➖"
      },
      {
        step: "Show real-world examples", 
        icon: "🌡️"
      },
      {
        step: "Practice integer operations",
        icon: "🔢"
      },
      {
        step: "Check calculations",
        icon: "✅"
      }
    ],
    encouragement: "Real teachers make integers meaningful! 👨‍🏫 You help students understand negative numbers!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Temperature Student",
      customerEmoji: "🌡️",
      order: "Teacher, what's the temperature change from -5°C to 8°C? 🤔",
      instruction: "Help your student calculate temperature changes!",
      problem: "8 - (-5)",
      question: "Calculate: 8 - (-5)",
      correctAnswer: "13",
      operationType: "integer_subtraction",
      steps: [
        "Subtracting a negative is like adding: 8 - (-5) = 8 + 5",
        "Calculate: 8 + 5 = 13"
      ],
      feedbackCorrect: "Excellent teaching! You showed how subtracting negatives works! 🌡️",
      feedbackIncorrect: "Try again! Remember that subtracting a negative number is the same as adding.",
      hint: "Subtracting -5 is the same as adding 5!"
    },
    {
      id: 'scenario-2',
      customer: "Study Group",
      customerEmoji: "👥",
      order: "We're confused about -3 × -4. Is it positive or negative? 📝",
      instruction: "Show your students how to multiply integers!",
      problem: "-3 × -4",
      question: "Calculate: -3 × -4",
      correctAnswer: "12",
      operationType: "integer_multiplication",
      steps: [
        "When multiplying two negative numbers, the result is positive",
        "Calculate: -3 × -4 = 12"
      ],
      feedbackCorrect: "Perfect! You explained the sign rules clearly! 🎯",
      feedbackIncorrect: "Try again! Remember: negative times negative equals positive.",
      hint: "Two negatives make a positive when multiplying!"
    },
    {
      id: 'scenario-3',
      customer: "Math Team",
      customerEmoji: "🏆",
      order: "What's -15 + 7? We need this for our score calculation! 🏁",
      instruction: "Coach your math team with integer addition!",
      problem: "-15 + 7",
      question: "Calculate: -15 + 7",
      correctAnswer: "-8",
      operationType: "integer_addition",
      steps: [
        "Start at -15 on the number line",
        "Move 7 units to the right (positive direction)",
        "Result: -15 + 7 = -8"
      ],
      feedbackCorrect: "Outstanding coaching! Your team understood integer addition! 🏆",
      feedbackIncorrect: "Try again! Think about moving on a number line.",
      hint: "Start at -15 and move 7 steps toward positive!"
    },
    {
      id: 'scenario-4',
      customer: "Homework Helper",
      customerEmoji: "📖",
      order: "Can you show me -20 ÷ -5? I want to help other students! 🤝",
      instruction: "Teach the helper integer division!",
      problem: "-20 ÷ -5",
      question: "Calculate: -20 ÷ -5",
      correctAnswer: "4",
      operationType: "integer_division",
      steps: [
        "When dividing two negative numbers, the result is positive",
        "Calculate: -20 ÷ -5 = 4"
      ],
      feedbackCorrect: "Excellent mentoring! Now they can help other students with integers! 🤝",
      feedbackIncorrect: "Try again! Remember the sign rules for division.",
      hint: "Negative divided by negative equals positive!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real 7th grade math teacher! The principal asks about your integer instruction! 👨‍🏫",
    question: "How do teachers help 7th graders understand integers?",
    options: [
      "Use real-world examples and number lines to show how positive and negative numbers work",
      "Just tell students to memorize rules",
      "Skip negative numbers entirely", 
      "Only work with positive numbers"
    ],
    correctAnswer: "Use real-world examples and number lines to show how positive and negative numbers work",
    explanation: "Excellent! Real teachers make integers meaningful with real examples! You think like a math teacher! 🔢"
  },

  toolConfiguration: {
    toolType: 'basic-calculator',
    instructions: "Help your students calculate with integers! Use the calculator to work with positive and negative numbers!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      allowNegatives: true,
      showSteps: true,
      integerMode: true
    }
  }
};