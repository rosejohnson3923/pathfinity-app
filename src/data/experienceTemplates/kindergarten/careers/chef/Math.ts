// Experience Template: Chef Career - Math Activities
// How chefs use math skills in their daily work

export const chefMathTemplate = {
  metadata: {
    career: 'chef',
    careerTitle: 'Chef',
    subject: 'Math',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Counting to 10',
    commonCoreStandard: 'K.CC.A.1',
    difficulty: 1,
    interactionType: 'click-counting'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 🍳 Chefs count food every day!",
    challenge: "Chefs count all day! 🍽️ People need right food!",
    yourRole: "You cook! 👨‍🍳 Chefs count ingredients daily!",
    actionPlan: [
      {
        step: "Read recipes daily",
        icon: "📖"
      },
      {
        step: "Count ingredients right",
        icon: "🔢"
      },
      {
        step: "Make food taste good",
        icon: "😋"
      },
      {
        step: "People eat happy",
        icon: "🌟"
      }
    ],
    encouragement: "Real chefs count every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Hungry Family",
      customerEmoji: "👨‍👩‍👧‍👦",
      order: "Pizza needs 4 slices of cheese! 🧀",
      instruction: "Chefs count ingredients! Find 4 cheese slices!",
      visual: ["🧀", "🧀", "🧀", "🧀", "🧀", "🧀"],
      correctAnswer: 4,
      feedbackCorrect: "Good! Chefs count ingredients every day! 🍕",
      feedbackIncorrect: "Try again! Chefs must count right!",
      hint: "Count: 1, 2, 3, 4!"
    },
    {
      id: 'scenario-2',
      customer: "Breakfast Order",
      customerEmoji: "🍳",
      order: "Pancakes need 3 eggs! 🥚",
      instruction: "Chefs follow recipes! Find 3 eggs!",
      visual: ["🥚", "🥚", "🥚", "🥚", "🥚"],
      correctAnswer: 3,
      feedbackCorrect: "Good! Chefs follow recipes every day! 🥞",
      feedbackIncorrect: "Try again! Chefs count careful!",
      hint: "Count: 1, 2, 3!"
    },
    {
      id: 'scenario-3',
      customer: "Lunch Special",
      customerEmoji: "🍽️",
      order: "Salad needs 6 tomatoes! 🍅",
      instruction: "Chefs make fresh food! Find 6 tomatoes!",
      visual: ["🍅", "🍅", "🍅", "🍅", "🍅", "🍅", "🍅", "🍅"],
      correctAnswer: 6,
      feedbackCorrect: "Good! Chefs make fresh salads every day! 🥗",
      feedbackIncorrect: "Try again! Chefs count ingredients!",
      hint: "Count: 1, 2, 3, 4, 5, 6!"
    },
    {
      id: 'scenario-4',
      customer: "Dessert Lover",
      customerEmoji: "🍰",
      order: "Cake needs 2 strawberries on top! 🍓",
      instruction: "Chefs decorate food! Find 2 strawberries!",
      visual: ["🍓", "🍓", "🍓", "🍓"],
      correctAnswer: 2,
      feedbackCorrect: "Good! Chefs decorate food every day! 🍰",
      feedbackIncorrected: "Try again! Chefs make food pretty!",
      hint: "Count: 1, 2!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real chef! Recipe needs 5 carrots! 🥕",
    question: "How do chefs count every day?",
    options: [
      "Count ingredients to follow recipe right",
      "Just put lots of everything",
      "Don't measure anything",
      "Guess how much to use"
    ],
    correctAnswer: "Count ingredients to follow recipe right",
    explanation: "Great! Real chefs count to make good food! You cook like a chef! 👍"
  },

  toolConfiguration: {
    toolType: 'counting-interactive',
    instructions: "Count ingredients! Make good food!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};