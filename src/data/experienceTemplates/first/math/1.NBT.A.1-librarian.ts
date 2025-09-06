// Experience Template: First Grade Math - Librarian Career
// Skill: 1.NBT.A.1 - Count to 120, starting at any number

export const libraryCountingFirstTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Math',
    gradeLevel: '1',
    skillCode: '1.NBT.A.1',
    skillName: 'Count to 120',
    difficulty: 2,
    interactionType: 'drag-drop'
  },

  roleSetup: {
    congratulations: "🎉 Great job! Library needs your help! 📚",
    challenge: "We need to organize books for sale! 📦",
    yourRole: "You help count books and make groups! 🔢",
    actionPlan: [
      {
        step: "Count books from different numbers",
        icon: "🔢"
      },
      {
        step: "Put books into groups of 10",
        icon: "📦"
      },
      {
        step: "Keep track of the total",
        icon: "📊"
      },
      {
        step: "Label boxes with right numbers",
        icon: "🏷️"
      }
    ],
    encouragement: "Remember: When you get 10, start new group!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Mrs. Park",
      customerEmoji: "👩‍🏫",
      order: "We have 23 books. Add 7 more.",
      instruction: "Drag books to count from 23",
      startingNumber: 23,
      booksToAdd: 7,
      visual: {
        books: ["📘", "📘", "📘", "📘", "📘", "📘", "📘"],
        boxes: ["📦", "📦", "📦"],
        currentCount: "23"
      },
      correctAnswer: 30,
      feedbackCorrect: "Great! 23 + 7 = 30 books!",
      feedbackIncorrected: "Let's count from 23: 24, 25, 26...",
      hint: "Count from 23: 24, 25, 26, 27, 28, 29, 30!"
    },
    {
      id: 'scenario-2',
      customer: "Sale Helper",
      customerEmoji: "👨",
      order: "Box 4 has 40. Box 5 needs 10 more.",
      instruction: "Drag 10 books to Box 5",
      startingNumber: 40,
      booksToAdd: 10,
      visual: {
        books: ["📕", "📕", "📕", "📕", "📕", "📕", "📕", "📕", "📕", "📕"],
        boxes: ["📦", "📦", "📦", "📦", "📦"],
        labels: ["10", "20", "30", "40", "?"]
      },
      correctAnswer: 50,
      feedbackCorrect: "Great! Box 5 has books 41-50!",
      feedbackIncorrect: "Each box holds 10 books. What comes after 40?",
      hint: "Box 4 ends at 40. Box 5 goes to..."
    },
    {
      id: 'scenario-3',
      customer: "Kids Book Team",
      customerEmoji: "👥",
      order: "We have 78 books. Need to reach 85.",
      instruction: "Drag books to reach 85",
      startingNumber: 78,
      targetNumber: 85,
      visual: {
        books: ["📗", "📗", "📗", "📗", "📗", "📗", "📗", "📗", "📗", "📗"],
        counter: "78",
        target: "85"
      },
      correctAnswer: 7,
      feedbackCorrect: "Great! You added 7 books! 78 to 85!",
      feedbackIncorrect: "Count from 78 to 85. How many?",
      hint: "78, 79, 80, 81, 82, 83, 84, 85. Count!"
    },
    {
      id: 'scenario-4',
      customer: "Mr. Director",
      customerEmoji: "👨‍💼",
      order: "Goal is 100 books. We have 89. Need more?",
      instruction: "Drag books to make 100",
      startingNumber: 89,
      targetNumber: 100,
      visual: {
        books: ["📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙", "📙"],
        counter: "89",
        target: "100"
      },
      correctAnswer: 11,
      feedbackCorrect: "Great! 89 + 11 = 100! Goal reached!",
      feedbackIncorrect: "Think: What plus 89 equals 100?",
      hint: "89 + ? = 100. Count up from 89!"
    }
  ],

  assessmentChallenge: {
    setup: "Library got new books. We counted to 95 yesterday.",
    question: "Count from 95. Add 15 more. What number?",
    options: [
      "110",
      "100", 
      "105",
      "115"
    ],
    correctAnswer: "110",
    explanation: "Great counting! 95 + 15 = 110. You counted past 100 perfectly!"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'drag-drop-counting',
    instructions: "Help organize books by dragging and counting!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      dragAndDrop: true,
      numberLine: true,
      groupingBoxes: true
    }
  }
};