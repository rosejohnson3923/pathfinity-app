// Experience Template: Teacher Career - Math Activities (10th Grade)
// How teachers use algebra in their daily classroom work

export const tenthGradeTeacherMathTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Math',
    gradeLevel: '10',
    skillCode: 'A.SSE.A.1',
    skillName: 'Add, subtract, multiply, and divide integers',
    commonCoreStandard: 'A.SSE.A.1',
    difficulty: 6,
    interactionType: 'algebra-tiles'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 👨‍🏫 Teachers help students master algebra!",
    challenge: "Your algebra students need help solving equations! 🔢 Show them how to use algebra tiles!",
    yourRole: "You're the algebra teacher! 👨‍🏫 Help students understand equation solving!",
    actionPlan: [
      {
        step: "Set up algebra tiles",
        icon: "🔲"
      },
      {
        step: "Model the equation", 
        icon: "⚖️"
      },
      {
        step: "Balance both sides",
        icon: "🟰"
      },
      {
        step: "Isolate the variable",
        icon: "❌"
      }
    ],
    encouragement: "Real teachers make algebra visual! 👨‍🏫 You help students see equation solving!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Algebra Student",
      customerEmoji: "🤔",
      order: "Teacher, can you help me solve x + 3 = 7? 🤔",
      instruction: "Help your student solve this equation using algebra tiles!",
      expression: "x + 3 = 7",
      equation: "x + 3 = 7",
      correctAnswer: "4",
      operationType: "linear_equation",
      steps: [
        "Start with x + 3 = 7",
        "Subtract 3 from both sides",
        "x = 4"
      ],
      feedbackCorrect: "Excellent teaching! You showed equation solving clearly! 🎯",
      feedbackIncorrect: "Try again! Use algebra tiles to balance the equation.",
      hint: "Remove 3 unit tiles from both sides to isolate x!"
    },
    {
      id: 'scenario-2',
      customer: "Study Group",
      customerEmoji: "👥",
      order: "We're stuck on 2x = 8. Can you show us the steps? 📝",
      instruction: "Guide your students through solving this equation!",
      expression: "2x = 8",
      equation: "2x = 8",
      correctAnswer: "4",
      operationType: "linear_equation",
      steps: [
        "Start with 2x = 8",
        "Divide both sides by 2",
        "x = 4"
      ],
      feedbackCorrect: "Perfect! You demonstrated division to isolate the variable! 🏆",
      feedbackIncorrect: "Try again! Think about undoing multiplication.",
      hint: "Two x-tiles equal 8 unit tiles. What does one x-tile equal?"
    },
    {
      id: 'scenario-3',
      customer: "Homework Help",
      customerEmoji: "📖",
      order: "I need help with x - 2 = 5. What's the first step? 🤝",
      instruction: "Show your student how to solve this step by step!",
      expression: "x - 2 = 5",
      equation: "x - 2 = 5",
      correctAnswer: "7",
      operationType: "linear_equation",
      steps: [
        "Start with x - 2 = 5",
        "Add 2 to both sides",
        "x = 7"
      ],
      feedbackCorrect: "Outstanding! You showed how to undo subtraction! 🌟",
      feedbackIncorrect: "Try again! What's the opposite of subtracting 2?",
      hint: "Add 2 unit tiles to both sides to balance the equation!"
    },
    {
      id: 'scenario-4',
      customer: "Math Tutor",
      customerEmoji: "🎓",
      order: "Can you help me explain x/2 = 3 to my students? 📚",
      instruction: "Demonstrate solving this division equation!",
      expression: "x/2 = 3",
      equation: "x/2 = 3",
      correctAnswer: "6",
      operationType: "linear_equation",
      steps: [
        "Start with x/2 = 3",
        "Multiply both sides by 2",
        "x = 6"
      ],
      feedbackCorrect: "Excellent mentoring! You showed how to undo division! 🎯",
      feedbackIncorrect: "Try again! What's the opposite of dividing by 2?",
      hint: "Multiply both sides by 2 to isolate x!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real algebra teacher! The principal asks about your equation-solving methods! 👨‍🏫",
    question: "How do teachers help students understand algebra equations?",
    options: [
      "Use visual tools like algebra tiles to show balance and equation solving steps",
      "Just give students the answers",
      "Skip the visual models entirely", 
      "Only use abstract symbols"
    ],
    correctAnswer: "Use visual tools like algebra tiles to show balance and equation solving steps",
    explanation: "Excellent! Real teachers make algebra visual and meaningful! You think like an algebra teacher! 🔢"
  },

  toolConfiguration: {
    toolType: 'algebra-tiles',
    instructions: "Help your students solve equations! Use algebra tiles to show each step clearly!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      showBalance: true,
      stepByStep: true,
      teachingMode: true
    }
  }
};