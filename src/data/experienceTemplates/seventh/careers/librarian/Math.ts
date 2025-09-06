// Experience Template: Librarian Career - Math Activities (7th Grade)
// How librarians use integers in their library organization work

export const seventhGradeLibrarianMathTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Math',
    gradeLevel: '7',
    skillCode: '7.NS.A.1',
    skillName: 'Understanding integers',
    commonCoreStandard: '7.NS.A.1',
    difficulty: 4,
    interactionType: 'basic-calculator'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians use integers to track inventory changes!",
    challenge: "The library needs help tracking books! 📊 Use integers for check-ins and check-outs!",
    yourRole: "You're the librarian! 📚 Use positive and negative numbers to track library changes!",
    actionPlan: [
      {
        step: "Track books checked out",
        icon: "➖"
      },
      {
        step: "Record books returned", 
        icon: "➕"
      },
      {
        step: "Calculate inventory changes",
        icon: "🔢"
      },
      {
        step: "Update library records",
        icon: "📚"
      }
    ],
    encouragement: "Real librarians use integers daily! 📚 You track library changes with positive and negative numbers!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Book Inventory",
      customerEmoji: "📚",
      order: "We checked out 12 books and returned 7. What's our net change? 📐",
      instruction: "Help track the library's book inventory changes!",
      problem: "-12 + 7",
      question: "Calculate: -12 + 7",
      correctAnswer: "-5",
      operationType: "integer_addition",
      steps: [
        "Checked out means negative: -12",
        "Returned means positive: +7",
        "Net change: -12 + 7 = -5 books"
      ],
      feedbackCorrect: "Excellent inventory tracking! The library has 5 fewer books out! 📚",
      feedbackIncorrect: "Try again! Checked out is negative, returned is positive.",
      hint: "Think of checked out as -12 and returned as +7!"
    },
    {
      id: 'scenario-2',
      customer: "Reading Program",
      customerEmoji: "👥",
      order: "The basement storage is at -3°C. Main floor is 22°C. What's the difference? 📖",
      instruction: "Calculate temperature differences in the library!",
      problem: "22 - (-3)",
      question: "Calculate: 22 - (-3)",
      correctAnswer: "25",
      operationType: "integer_subtraction",
      steps: [
        "Subtracting negative is adding: 22 - (-3) = 22 + 3",
        "Calculate: 22 + 3 = 25°C difference"
      ],
      feedbackCorrect: "Perfect calculation! 25 degree difference between floors! 🌡️",
      feedbackIncorrect: "Try again! Remember subtracting negative means adding.",
      hint: "22 - (-3) is the same as 22 + 3!"
    },
    {
      id: 'scenario-3',
      customer: "Computer Lab",
      customerEmoji: "💻",
      order: "We lost 4 computers each month for 3 months. What's the total loss? ⚡",
      instruction: "Calculate total computer inventory loss!",
      problem: "-4 × 3",
      question: "Calculate: -4 × 3",
      correctAnswer: "-12",
      operationType: "integer_multiplication",
      steps: [
        "Loss is negative: -4 per month",
        "For 3 months: -4 × 3 = -12",
        "Total loss: 12 computers"
      ],
      feedbackCorrect: "Great tracking! You calculated the total loss correctly! 💻",
      feedbackIncorrect: "Try again! Negative times positive equals negative.",
      hint: "Loss (-4) multiplied by 3 months gives negative result!"
    },
    {
      id: 'scenario-4',
      customer: "Study Rooms",
      customerEmoji: "🏢",
      order: "We had -$15 in late fees. Collected $45. Split among 6 students? 🪑",
      instruction: "Calculate fee distribution with integers!",
      problem: "(-15 + 45) ÷ 6",
      question: "Calculate: (-15 + 45) ÷ 6",
      correctAnswer: "5",
      operationType: "integer_mixed",
      steps: [
        "First add: -15 + 45 = 30",
        "Then divide: 30 ÷ 6 = 5",
        "Each student gets $5"
      ],
      feedbackCorrect: "Excellent calculation! Each student gets $5! 💰",
      feedbackIncorrect: "Try again! First add the integers, then divide.",
      hint: "Calculate -15 + 45 first, then divide by 6!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! The head librarian asks about tracking inventory changes! 📚",
    question: "How do librarians use integers in their work?",
    options: [
      "Use positive and negative numbers to track books checked out, returned, and inventory changes",
      "Only count books going out",
      "Ignore book returns", 
      "Never use negative numbers"
    ],
    correctAnswer: "Use positive and negative numbers to track books checked out, returned, and inventory changes",
    explanation: "Excellent! Real librarians use integers to track library inventory changes! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'basic-calculator',
    instructions: "Help track library changes! Use the calculator to work with positive and negative numbers!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      allowNegatives: true,
      showSteps: true,
      libraryContext: true
    }
  }
};