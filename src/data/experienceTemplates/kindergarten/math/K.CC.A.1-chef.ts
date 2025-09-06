// Experience Template: Kindergarten Math Counting - Chef Career
// Skill: K.CC.A.1 - Count to 10 by ones

export const chefCountingKTemplate = {
  metadata: {
    career: 'chef',
    careerTitle: 'Chef',
    subject: 'Math',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Counting to 10',
    commonCoreStandard: 'K.CC.A.1', // Common Core alignment preserved as metadata
    difficulty: 1,
    interactionType: 'click-counting'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 🍳 Chefs count food every day!",
    challenge: "Chefs count all day! 🍽️ People need right food!",
    yourRole: "You are chef! 👨‍🍳 Chefs count food daily!",
    actionPlan: [
      {
        step: "See recipe daily",
        icon: "📋"
      },
      {
        step: "Count food all day",
        icon: "🔢"
      },
      {
        step: "Pick right amounts",
        icon: "✅"
      },
      {
        step: "Make good food",
        icon: "🍳"
      }
    ],
    encouragement: "Real chefs count every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Mrs. Garcia",
      customerEmoji: "👩",
      order: "Need 4 cheese! 🧀",
      instruction: "Find 4 cheese!",
      visual: ["🧀", "🧀", "🧀", "🧀", "🧀", "🧀"],
      correctAnswer: 4,
      feedbackCorrect: "Good! 4 cheese! 🧀",
      feedbackIncorrect: "Try again! Count 4!",
      hint: "Count: 1, 2, 3, 4!"
    },
    {
      id: 'scenario-2',
      customer: "Little Timmy",
      customerEmoji: "👦",
      order: "Need 3 pepperoni! 🔴",
      instruction: "Find 3 pepperoni!",
      visual: ["🔴", "🔴", "🔴", "🔴", "🔴"],
      correctAnswer: 3,
      feedbackCorrect: "Good! 3 pepperoni! 🍕",
      feedbackIncorrect: "Try again! Count 3!",
      hint: "Count: 1, 2, 3!"
    },
    {
      id: 'scenario-3',
      customer: "Coach Johnson",
      customerEmoji: "👨",
      order: "Need 6 strawberries! 🍓",
      instruction: "Find 6 strawberries!",
      visual: ["🍓", "🍓", "🍓", "🍓", "🍓", "🍓", "🍓", "🍓"],
      correctAnswer: 6,
      feedbackCorrect: "Good! 6 strawberries! 🍓",
      feedbackIncorrect: "Try again! Count 6!",
      hint: "Count: 1, 2, 3, 4, 5, 6!"
    },
    {
      id: 'scenario-4',
      customer: "Baby Emma's Mom",
      customerEmoji: "👶",
      order: "Need 2 banana slices! 🍌",
      instruction: "Find 2 bananas!",
      visual: ["🍌", "🍌", "🍌", "🍌"],
      correctAnswer: 2,
      feedbackCorrect: "Good! 2 bananas! 🍌",
      feedbackIncorrect: "Try again! Count 2!",
      hint: "Count: 1, 2!"
    }
  ],

  assessmentChallenge: {
    setup: "Customer needs 5 apples! 🍎",
    question: "How count good?",
    options: [
      "Count slow: 1, 2, 3, 4, 5",
      "Grab lots apples",
      "Give all apples",
      "Ask friend count"
    ],
    correctAnswer: "Count slow: 1, 2, 3, 4, 5",
    explanation: "Good job! Count slow! Food good! 👍"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'counting-interactive',
    instructions: "Count food! Click right!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};