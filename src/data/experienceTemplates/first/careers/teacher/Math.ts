// Experience Template: Teacher Career - Math Activities (1st Grade)
// How teachers use math skills in their daily classroom work

export const firstGradeTeacherMathTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Math',
    gradeLevel: '1',
    skillCode: '1.NBT.A.1',
    skillName: 'Counting objects up to 20',
    commonCoreStandard: '1.NBT.A.1',
    difficulty: 2,
    interactionType: 'counting-interactive'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 👨‍🏫 Teachers help students learn counting every day!",
    challenge: "Your classroom needs help! 📚 Students need counting materials for activities!",
    yourRole: "You're the teacher! 👨‍🏫 Help gather the right number of items for each activity!",
    actionPlan: [
      {
        step: "Listen to what students need",
        icon: "👂"
      },
      {
        step: "Count out the right number", 
        icon: "🔢"
      },
      {
        step: "Help students learn counting",
        icon: "📚"
      },
      {
        step: "Make math fun and engaging",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers make counting exciting! 👨‍🏫 You help students love math!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Math Student",
      customerEmoji: "👧",
      order: "Teacher, I need 10 counting blocks to practice! 🔢",
      instruction: "Help your student! Find exactly 10 counting blocks!",
      correctAnswer: 10,
      visual: ["🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲", "🔲"],
      feedbackCorrect: "Excellent teaching! You counted 10 blocks perfectly! 👨‍🏫",
      feedbackIncorrect: "Try again! Count carefully to get exactly 10.",
      hint: "Count each block: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10!"
    },
    {
      id: 'scenario-2',
      customer: "Reading Group",
      customerEmoji: "📚",
      order: "We need 8 bookmarks for our reading circle! 📖",
      instruction: "Help your reading group! Find exactly 8 bookmarks!",
      correctAnswer: 8,
      visual: ["📑", "📑", "📑", "📑", "📑", "📑", "📑", "📑", "📑", "📑", "📑", "📑"],
      feedbackCorrect: "Perfect! You helped your reading group with 8 bookmarks! 📚",
      feedbackIncorrect: "Try again! Count to get exactly 8 bookmarks.",
      hint: "Count out 8: 1, 2, 3, 4, 5, 6, 7, 8!"
    },
    {
      id: 'scenario-3',
      customer: "PE Class",
      customerEmoji: "⚽",
      order: "We need 12 cones for our obstacle course! 🏃‍♀️",
      instruction: "Help your PE class! Find exactly 12 cones!",
      correctAnswer: 12,
      visual: ["🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺", "🔺"],
      feedbackCorrect: "Amazing! You counted 12 cones for PE class! ⚽",
      feedbackIncorrect: "Try again! Count to get exactly 12 cones.",
      hint: "Count all 12: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12!"
    },
    {
      id: 'scenario-4',
      customer: "Science Class",
      customerEmoji: "🔬",
      order: "We need 15 test tubes for our experiment! 🧪",
      instruction: "Help your science class! Find exactly 15 test tubes!",
      correctAnswer: 15,
      visual: ["🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪", "🧪"],
      feedbackCorrect: "Wonderful! You counted 15 test tubes for science! 🔬",
      feedbackIncorrect: "Try again! Count to get exactly 15 test tubes.",
      hint: "Count to 15: 1, 2, 3... all the way to 15!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real 1st grade teacher! A parent asks about their child's counting skills! 👨‍🏫",
    question: "How do teachers help 1st graders learn to count to 120?",
    options: [
      "Start counting from different numbers and practice counting forward to build confidence",
      "Only count from 1 every time",
      "Skip difficult numbers", 
      "Use only worksheets without hands-on practice"
    ],
    correctAnswer: "Start counting from different numbers and practice counting forward to build confidence",
    explanation: "Excellent! Real teachers help students start counting from any number and build up to 120! You think like a teacher! 👨‍🏫"
  },

  toolConfiguration: {
    toolType: 'counting-interactive',
    instructions: "Help your students count! Start from any number and count forward!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      maxNumber: 120,
      enableStartFromAny: true,
      showNumberLine: true
    }
  }
};