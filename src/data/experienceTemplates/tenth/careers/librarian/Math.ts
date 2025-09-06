// Experience Template: Librarian Career - Math Activities (10th Grade)
// How librarians use algebra in their library organization work

export const tenthGradeLibrarianMathTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Math',
    gradeLevel: '10',
    skillCode: 'A.SSE.A.1',
    skillName: 'Add, subtract, multiply, and divide integers',
    commonCoreStandard: 'A.SSE.A.1',
    difficulty: 6,
    interactionType: 'algebra-tiles'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians use algebra to solve library problems!",
    challenge: "The library needs algebraic solutions! 📊 Use equations to organize resources!",
    yourRole: "You're the librarian! 📚 Use algebra to solve library management challenges!",
    actionPlan: [
      {
        step: "Set up the equation",
        icon: "📝"
      },
      {
        step: "Model with algebra tiles", 
        icon: "🔲"
      },
      {
        step: "Balance the equation",
        icon: "⚖️"
      },
      {
        step: "Find the solution",
        icon: "✅"
      }
    ],
    encouragement: "Real librarians use algebra for planning! 📚 You solve problems with equations!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Book Order",
      customerEmoji: "📚",
      order: "We ordered x books plus 12 returns, totaling 19 books. How many did we order? 📐",
      instruction: "Help solve this library inventory equation!",
      expression: "x + 12 = 19",
      equation: "x + 12 = 19",
      correctAnswer: "7",
      operationType: "linear_equation",
      steps: [
        "Start with x + 12 = 19",
        "Subtract 12 from both sides",
        "x = 7 books ordered"
      ],
      feedbackCorrect: "Excellent! You calculated the book order perfectly! 📚",
      feedbackIncorrect: "Try again! Use algebra tiles to balance the equation.",
      hint: "Remove 12 unit tiles from both sides to find x!"
    },
    {
      id: 'scenario-2',
      customer: "Reading Program",
      customerEmoji: "👥",
      order: "Each student reads 2x books. With 16 total books read, how many students? 📖",
      instruction: "Calculate student participation with algebra!",
      expression: "2x = 16",
      equation: "2x = 16",
      correctAnswer: "8",
      operationType: "linear_equation",
      steps: [
        "Start with 2x = 16",
        "Divide both sides by 2",
        "x = 8 students"
      ],
      feedbackCorrect: "Perfect calculation! 8 students in the reading program! 👥",
      feedbackIncorrect: "Try again! Think about dividing the total by books per student.",
      hint: "Two books per student, 16 total books. How many students?"
    },
    {
      id: 'scenario-3',
      customer: "Computer Lab",
      customerEmoji: "💻",
      order: "We lost x computers, leaving 5 working ones from 12 total. How many broke? ⚡",
      instruction: "Calculate equipment loss with algebra!",
      expression: "x + 5 = 12",
      equation: "x + 5 = 12",
      correctAnswer: "7",
      operationType: "linear_equation",
      steps: [
        "Start with x + 5 = 12",
        "Subtract 5 from both sides",
        "x = 7 computers broke"
      ],
      feedbackCorrect: "Great problem solving! 7 computers need replacement! 💻",
      feedbackIncorrect: "Try again! Working plus broken equals total.",
      hint: "Remove 5 unit tiles from both sides to find broken computers!"
    },
    {
      id: 'scenario-4',
      customer: "Study Rooms",
      customerEmoji: "🏢",
      order: "Study rooms hold x/3 students each. With 6 students total, what's room capacity? 🪑",
      instruction: "Calculate room capacity with algebra!",
      expression: "x/3 = 6",
      equation: "x/3 = 6",
      correctAnswer: "18",
      operationType: "linear_equation",
      steps: [
        "Start with x/3 = 6",
        "Multiply both sides by 3",
        "x = 18 student capacity"
      ],
      feedbackCorrect: "Excellent! Each study room holds 18 students maximum! 🏢",
      feedbackIncorrect: "Try again! What's the opposite of dividing by 3?",
      hint: "Multiply both sides by 3 to find total capacity!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! The head librarian asks about using algebra in library work! 📚",
    question: "How do librarians use algebra in their work?",
    options: [
      "Create equations to solve inventory, capacity, and resource allocation problems",
      "Only count books manually",
      "Avoid math entirely", 
      "Never use equations"
    ],
    correctAnswer: "Create equations to solve inventory, capacity, and resource allocation problems",
    explanation: "Excellent! Real librarians use algebra for efficient library management! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'algebra-tiles',
    instructions: "Help solve library problems! Use algebra tiles to work through each equation step by step!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      showBalance: true,
      stepByStep: true,
      libraryContext: true
    }
  }
};