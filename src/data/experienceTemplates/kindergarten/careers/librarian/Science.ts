// Experience Template: Librarian Career - Science Activities
// How librarians use science skills in their daily work

export const librarianScienceTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Science',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Classify objects by two-dimensional shape',
    commonCoreStandard: 'K.PS.1',
    difficulty: 1,
    interactionType: 'click-sorting'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians organize shape books for kids!",
    challenge: "Library needs organizing! 🔺 Shape books need sorting by type!",
    yourRole: "You're the librarian! 📚 Sort shape books by their shapes!",
    actionPlan: [
      {
        step: "Look at shape stickers",
        icon: "👀"
      },
      {
        step: "Identify the shapes", 
        icon: "🔍"
      },
      {
        step: "Group same shapes together",
        icon: "📚"
      },
      {
        step: "Help kids find shapes",
        icon: "🌟"
      }
    ],
    encouragement: "Real librarians organize shape books! 📚 You help kids learn geometry!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Book Display",
      customerEmoji: "📚",
      order: "Science books have shape stickers! Find all triangles! 🔺",
      instruction: "Librarians organize by shapes! Click all the triangles!",
      correctAnswer: "triangle",
      targetShape: "triangle",
      questionType: "shape_classification",
      feedbackCorrect: "Perfect! You found all the triangles! 🔺",
      feedbackIncorrect: "Try again! Look for shapes with 3 sides!",
      hint: "Triangles have 3 corners and 3 sides!"
    },
    {
      id: 'scenario-2',
      customer: "Reading Corner",
      customerEmoji: "📖",
      order: "Shape books need organizing! Find all circles! ⭕",
      instruction: "Librarians sort by shapes! Click all the circles!",
      correctAnswer: "circle",
      targetShape: "circle",
      questionType: "shape_classification",
      feedbackCorrect: "Excellent! You found all the circles! ⭕",
      feedbackIncorrect: "Try again! Look for round shapes!",
      hint: "Circles are perfectly round with no corners!"
    },
    {
      id: 'scenario-3',
      customer: "Science Display",
      customerEmoji: "🔬",
      order: "Shape posters need sorting! Find all squares! ⬜",
      instruction: "Librarians organize shapes! Click all the squares!",
      correctAnswer: "square",
      targetShape: "square",
      questionType: "shape_classification",
      feedbackCorrect: "Great job! You found all the squares! ⬜",
      feedbackIncorrect: "Try again! Look for shapes with 4 equal sides!",
      hint: "Squares have 4 corners and 4 equal sides!"
    },
    {
      id: 'scenario-4',
      customer: "Math Books",
      customerEmoji: "📐",
      order: "Geometry books need labels! Find all rectangles! ▭",
      instruction: "Librarians classify shapes! Click all the rectangles!",
      correctAnswer: "rectangle",
      targetShape: "rectangle",
      questionType: "shape_classification",
      feedbackCorrect: "Wonderful! You found all the rectangles! ▭",
      feedbackIncorrect: "Try again! Look for shapes with 4 sides and corners!",
      hint: "Rectangles have 4 corners and opposite sides are equal!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! A child needs help finding shape books! 📚",
    question: "How do librarians help kids find books about specific shapes?",
    options: [
      "Organize shape books by type so circles, triangles, and squares are grouped together",
      "Put all books in one big pile",
      "Hide the shape books", 
      "Only let teachers see shape books"
    ],
    correctAnswer: "Organize shape books by type so circles, triangles, and squares are grouped together",
    explanation: "Excellent! Real librarians organize shape books by type! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'click-sorting',
    instructions: "Sort the shapes! Click all the shapes that match!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};