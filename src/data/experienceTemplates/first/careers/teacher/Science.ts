// Experience Template: Teacher Career - Science Activities (1st Grade)
// How teachers use science classification skills in their daily classroom work

export const firstGradeTeacherScienceTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Science',
    gradeLevel: '1',
    skillCode: '1.PS.A.1',
    skillName: 'Classify objects by two-dimensional shape',
    commonCoreStandard: '1.PS.A.1',
    difficulty: 2,
    interactionType: 'click-sorting'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 🔬 Teachers help students learn science every day!",
    challenge: "Your science class needs help! 📐 Students need to sort shapes for experiments!",
    yourRole: "You're the teacher! 👨‍🏫 Help your students classify objects by shape!",
    actionPlan: [
      {
        step: "Look at science materials",
        icon: "🔬"
      },
      {
        step: "Identify the shapes", 
        icon: "📐"
      },
      {
        step: "Sort into groups",
        icon: "📊"
      },
      {
        step: "Make science discoveries",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers make science exciting! 👨‍🏫 You help students explore shapes!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Science Student",
      customerEmoji: "👧",
      order: "Teacher, help me sort these petri dishes! Find all the circles! ⭕",
      instruction: "Help your student! Click all the circular petri dishes!",
      correctAnswer: "circle",
      targetShape: "circle",
      questionType: "shape_classification",
      feedbackCorrect: "Excellent teaching! You helped identify circular petri dishes! 🔬",
      feedbackIncorrect: "Try again! Look for the round petri dishes.",
      hint: "Circles are perfectly round with no corners!"
    },
    {
      id: 'scenario-2',
      customer: "Lab Partner",
      customerEmoji: "👦",
      order: "We need square tiles for our experiment! Find all squares! ⬜",
      instruction: "Help with the science project! Click all the square tiles!",
      correctAnswer: "square",
      targetShape: "square",
      questionType: "shape_classification",
      feedbackCorrect: "Perfect! You found all the square tiles for science! 📐",
      feedbackIncorrect: "Try again! Squares have 4 equal sides.",
      hint: "Squares have 4 corners and all sides are the same length!"
    },
    {
      id: 'scenario-3',
      customer: "Plant Study Group",
      customerEmoji: "🌱",
      order: "Our plant markers are triangles! Help us find them! 🔺",
      instruction: "Help the plant study! Click all the triangle markers!",
      correctAnswer: "triangle",
      targetShape: "triangle",
      questionType: "shape_classification",
      feedbackCorrect: "Wonderful! You sorted the triangle plant markers! 🌱",
      feedbackIncorrect: "Try again! Triangles have 3 sides.",
      hint: "Triangles have 3 corners and 3 sides!"
    },
    {
      id: 'scenario-4',
      customer: "Weather Station",
      customerEmoji: "☁️",
      order: "Sort these weather cards! Find all the rectangles! ▭",
      instruction: "Help organize weather data! Click all the rectangle cards!",
      correctAnswer: "rectangle",
      targetShape: "rectangle",
      questionType: "shape_classification",
      feedbackCorrect: "Amazing! You classified the rectangle weather cards! ☁️",
      feedbackIncorrect: "Try again! Rectangles have 4 corners.",
      hint: "Rectangles have 4 corners and opposite sides are equal!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real 1st grade teacher! The principal asks about your science lessons! 👨‍🏫",
    question: "How do teachers help 1st graders classify objects by shape in science?",
    options: [
      "Use real science materials and sort them by shape to explore patterns",
      "Only draw shapes on the board",
      "Skip shape sorting in science class", 
      "Let students guess without guidance"
    ],
    correctAnswer: "Use real science materials and sort them by shape to explore patterns",
    explanation: "Excellent! Real teachers connect shapes to science discoveries! You think like a teacher! 🔬"
  },

  toolConfiguration: {
    toolType: 'click-sorting',
    instructions: "Help your science students! Click all shapes that match!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      shapeTypes: ['circle', 'square', 'triangle', 'rectangle'],
      mixedShapes: true,
      scienceTheme: true
    }
  }
};