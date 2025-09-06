// Experience Template: Librarian Career - Science Activities (1st Grade)
// How librarians use science classification skills in their library work

export const firstGradeLibrarianScienceTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Science',
    gradeLevel: '1',
    skillCode: '1.PS.A.1',
    skillName: 'Classify objects by two-dimensional shape',
    commonCoreStandard: '1.PS.A.1',
    difficulty: 2,
    interactionType: 'click-sorting'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians organize science books by shape!",
    challenge: "The science section needs organizing! 📐 Sort books by shape labels!",
    yourRole: "You're the librarian! 📚 Help organize science materials by shape!",
    actionPlan: [
      {
        step: "Check shape labels on books",
        icon: "📖"
      },
      {
        step: "Identify each shape", 
        icon: "📐"
      },
      {
        step: "Sort into shelf sections",
        icon: "📚"
      },
      {
        step: "Help readers find books",
        icon: "🌟"
      }
    ],
    encouragement: "Real librarians organize by shapes! 📚 You make science books easy to find!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Science Reader",
      customerEmoji: "👧",
      order: "Librarian, I need books with circle stickers! Help me find them! ⭕",
      instruction: "Help your library visitor! Click all books with circle stickers!",
      correctAnswer: "circle",
      targetShape: "circle",
      questionType: "shape_classification",
      feedbackCorrect: "Excellent library service! You found all the circle-labeled books! 📚",
      feedbackIncorrect: "Try again! Look for books with round stickers.",
      hint: "Circle stickers are perfectly round!"
    },
    {
      id: 'scenario-2',
      customer: "Teacher Visit",
      customerEmoji: "👨‍🏫",
      order: "I need all the square-labeled experiment books! Can you help? ⬜",
      instruction: "Help the visiting teacher! Click all books with square labels!",
      correctAnswer: "square",
      targetShape: "square",
      questionType: "shape_classification",
      feedbackCorrect: "Perfect library help! You found the square-labeled books! 📐",
      feedbackIncorrect: "Try again! Square labels have 4 equal sides.",
      hint: "Squares have 4 corners and equal sides!"
    },
    {
      id: 'scenario-3',
      customer: "Nature Club",
      customerEmoji: "🌿",
      order: "We need triangle-marked nature guides! Where are they? 🔺",
      instruction: "Help the nature club! Click all books with triangle markers!",
      correctAnswer: "triangle",
      targetShape: "triangle",
      questionType: "shape_classification",
      feedbackCorrect: "Wonderful! You located all triangle-marked guides! 🌿",
      feedbackIncorrect: "Try again! Triangle markers have 3 sides.",
      hint: "Triangles have 3 points!"
    },
    {
      id: 'scenario-4',
      customer: "STEM Group",
      customerEmoji: "🔬",
      order: "Find all rectangle-tagged science journals please! ▭",
      instruction: "Help the STEM group! Click all journals with rectangle tags!",
      correctAnswer: "rectangle",
      targetShape: "rectangle",
      questionType: "shape_classification",
      feedbackCorrect: "Amazing library skills! You found the rectangle-tagged journals! 🔬",
      feedbackIncorrect: "Try again! Rectangle tags have 4 corners.",
      hint: "Rectangles are longer than they are tall!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! A parent asks about science book organization! 📚",
    question: "How do librarians help children find science books using shapes?",
    options: [
      "Use shape labels to organize books so children can easily find topics",
      "Mix all science books together",
      "Hide shape labels from children", 
      "Only let teachers find science books"
    ],
    correctAnswer: "Use shape labels to organize books so children can easily find topics",
    explanation: "Excellent! Real librarians use shapes to organize science resources! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'click-sorting',
    instructions: "Help library visitors find books! Click all items with matching shape labels!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      shapeTypes: ['circle', 'square', 'triangle', 'rectangle'],
      mixedShapes: true,
      libraryTheme: true
    }
  }
};