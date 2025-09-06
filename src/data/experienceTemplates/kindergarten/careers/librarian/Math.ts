// Experience Template: Librarian Career - Math Activities
// How librarians use math skills in their daily work

export const librarianMathTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'Math',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Counting to 10',
    commonCoreStandard: 'K.CC.A.1',
    difficulty: 1,
    interactionType: 'click-counting'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 📚 Librarians count books every day!",
    challenge: "Librarians count all day! 📖 People need right books!",
    yourRole: "You are librarian! 📚 Librarians count books daily!",
    actionPlan: [
      {
        step: "Listen to people daily",
        icon: "👂"
      },
      {
        step: "Count books all day",
        icon: "🔢"
      },
      {
        step: "Check count right",
        icon: "✅"
      },
      {
        step: "Give people books",
        icon: "📚"
      }
    ],
    encouragement: "Real librarians count every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Mr. Smith",
      customerEmoji: "👨",
      order: "Family needs 3 books! 📚",
      instruction: "Librarians count books daily! Find 3 books!",
      visual: ["📕", "📗", "📘", "📙", "📔"],
      correctAnswer: 3,
      feedbackCorrect: "Good! Librarians count books every day! 📚",
      feedbackIncorrect: "Try again! Librarians count careful!",
      hint: "Count: 1, 2, 3!"
    },
    {
      id: 'scenario-2',
      customer: "Ms. Jones",
      customerEmoji: "👩",
      order: "Kid wants 2 animal books! 🐻",
      instruction: "Librarians help kids daily! Find 2 books!",
      visual: ["🐻", "🦁", "🐘", "🦒"],
      correctAnswer: 2,
      feedbackCorrect: "Good! Librarians help kids every day! 🐻",
      feedbackIncorrect: "Try again! Librarians count right!",
      hint: "Count: 1, 2!"
    },
    {
      id: 'scenario-3',
      customer: "Grandma Rose",
      customerEmoji: "👵",
      order: "Grandma needs 5 books for kids! 📖",
      instruction: "Librarians help families daily! Find 5 books!",
      visual: ["📖", "📚", "📖", "📚", "📖", "📚", "📖"],
      correctAnswer: 5,
      feedbackCorrect: "Good! Librarians help families every day! 📖",
      feedbackIncorrect: "Try again! Librarians count careful!",
      hint: "Count: 1, 2, 3, 4, 5!"
    },
    {
      id: 'scenario-4',
      customer: "Tommy",
      customerEmoji: "👦",
      order: "Boy wants 1 dinosaur book! 🦕",
      instruction: "Librarians help kids daily! Find 1 book!",
      visual: ["🦕", "🦖", "🦕"],
      correctAnswer: 1,
      feedbackCorrect: "Good! Librarians help kids every day! 🦕",
      feedbackIncorrect: "Try again! Librarians count right!",
      hint: "Count: 1!"
    }
  ],

  assessmentChallenge: {
    setup: "You are real librarian! Family needs 4 books! 📚",
    question: "How do librarians count every day?",
    options: [
      "Count slow: 1, 2, 3, 4",
      "Grab fast books",
      "Give lots books",
      "Ask friend count"
    ],
    correctAnswer: "Count slow: 1, 2, 3, 4",
    explanation: "Great! Real librarians count all day! You count like librarian! 👍"
  },

  toolConfiguration: {
    toolType: 'counting-interactive',
    instructions: "Count books! Click right!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};