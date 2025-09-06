// Experience Template: Librarian Career - Social Studies Activities (1st Grade)
// How librarians use rules and laws concepts in their library work

export const firstGradeLibrarianSocialStudiesTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'SocialStudies',
    gradeLevel: '1',
    skillCode: '1.SS.A.1',
    skillName: 'Rules and Laws',
    commonCoreStandard: '1.SS.A.1',
    difficulty: 2,
    interactionType: 'click-matching'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians help everyone follow library rules!",
    challenge: "The library needs your help! 📋 Show visitors our important rules!",
    yourRole: "You're the librarian! 📚 Help library visitors understand our rules!",
    actionPlan: [
      {
        step: "Post library rules clearly",
        icon: "📋"
      },
      {
        step: "Explain why rules matter", 
        icon: "💭"
      },
      {
        step: "Guide visitors kindly",
        icon: "🤝"
      },
      {
        step: "Keep library welcoming",
        icon: "📖"
      }
    ],
    encouragement: "Real librarians make rules friendly! 📚 You help everyone enjoy the library!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Young Reader",
      customerEmoji: "👧",
      order: "Librarian, can I take this book home? What's the rule? 📖",
      instruction: "Help your visitor! Match the library situation with the right rule!",
      situation: "Borrowing a book",
      correctAnswer: "Check out with library card",
      options: [
        "Check out with library card",
        "Just take it without asking",
        "Hide it in your bag",
        "Never borrow books"
      ],
      ruleCategory: "borrowing",
      feedbackCorrect: "Excellent library service! You explained the checkout rule clearly! 📚",
      feedbackIncorrect: "Try again! Think about the proper way to borrow books.",
      hint: "Library cards help us track who has which book!"
    },
    {
      id: 'scenario-2',
      customer: "Study Group",
      customerEmoji: "👥",
      order: "How loud can we talk in the library? What's allowed? 🗣️",
      instruction: "Guide your visitors! Match the library area with the noise rule!",
      situation: "Talking in the library",
      correctAnswer: "Whisper in quiet areas",
      options: [
        "Whisper in quiet areas",
        "Shout across the room",
        "Play loud music",
        "Never speak at all"
      ],
      ruleCategory: "noise",
      feedbackCorrect: "Perfect! You showed them how quiet voices help everyone focus! 🤫",
      feedbackIncorrect: "Try again! Think about helping all visitors concentrate.",
      hint: "Different library areas have different noise levels!"
    },
    {
      id: 'scenario-3',
      customer: "Snack Question",
      customerEmoji: "🍎",
      order: "Can I eat my apple while reading? What's the food rule? 🍎",
      instruction: "Explain library policies! Match the activity with the rule!",
      situation: "Eating in the library",
      correctAnswer: "Food only in designated areas",
      options: [
        "Food only in designated areas",
        "Eat anywhere you want",
        "Hide food in books",
        "Throw food around"
      ],
      ruleCategory: "cleanliness",
      feedbackCorrect: "Wonderful! You explained why we protect books from spills! 📚",
      feedbackIncorrect: "Try again! Think about keeping books clean.",
      hint: "This rule protects our books and computers!"
    },
    {
      id: 'scenario-4',
      customer: "Computer User",
      customerEmoji: "💻",
      order: "How long can I use the computer? Is there a rule? ⏰",
      instruction: "Share library policies! Match the resource with its rule!",
      situation: "Using library computers",
      correctAnswer: "30-minute turns when others wait",
      options: [
        "30-minute turns when others wait",
        "Use it all day long",
        "Never let others use it",
        "Break the computer"
      ],
      ruleCategory: "sharing",
      feedbackCorrect: "Amazing! You taught fair sharing so everyone gets a turn! 💻",
      feedbackIncorrect: "Try again! Think about being fair to all visitors.",
      hint: "Sharing rules help everyone get computer time!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! A parent asks why libraries have rules! 📚",
    question: "How do librarians help visitors understand library rules?",
    options: [
      "Explain rules kindly and show how they help everyone enjoy the library",
      "Just post signs everywhere",
      "Yell at rule breakers", 
      "Let people do whatever they want"
    ],
    correctAnswer: "Explain rules kindly and show how they help everyone enjoy the library",
    explanation: "Excellent! Real librarians make rules welcoming and clear! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'click-matching',
    instructions: "Help library visitors understand rules! Match each situation with the right library rule!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      matchingType: 'situation-to-rule',
      showImages: true,
      ruleCategories: ['borrowing', 'noise', 'cleanliness', 'sharing']
    }
  }
};