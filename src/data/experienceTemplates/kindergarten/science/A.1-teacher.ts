// Experience Template: Kindergarten Science Classification - Teacher Career
// Skill: A.1 - Classify objects by observable properties

export const teacherScienceKTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Science',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Classify Objects',
    commonCoreStandard: 'K.PS.1', // NGSS Science standard preserved as metadata
    difficulty: 1,
    interactionType: 'click-sorting'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 🔬 Teachers sort things every day!",
    challenge: "Teachers organize classroom! 📦 Kids need things sorted right!",
    yourRole: "You teach! 👨‍🏫 Teachers sort and classify all day long!",
    actionPlan: [
      {
        step: "Look at objects daily",
        icon: "👀"
      },
      {
        step: "Sort by what you see", 
        icon: "🔍"
      },
      {
        step: "Put like things together",
        icon: "📦"
      },
      {
        step: "Kids learn to sort",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers sort every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Science Class",
      customerEmoji: "🔬",
      order: "Nature walk! Sort these by color! 🌈",
      instruction: "Teachers help kids sort by color! Put red things together!",
      visual: ["🍎", "🌹", "🟢", "🍃", "🔵", "💙"],
      correctAnswer: ["🍎", "🌹"],
      feedbackCorrect: "Good! Teachers help kids sort by color! 🍎🌹",
      feedbackIncorrect: "Try again! Teachers help kids look at colors!",
      hint: "Which things are red?"
    },
    {
      id: 'scenario-2',
      customer: "Lab Time",
      customerEmoji: "🥼",
      order: "Science sorting! Group these by size! 📏",
      instruction: "Teachers help kids sort by size! Put big things together!",
      visual: ["🐘", "🐭", "🏠", "🏰", "🌸", "🌳"],
      correctAnswer: ["🐘", "🏠", "🏰", "🌳"],
      feedbackCorrect: "Good! Teachers help kids sort by size! 🐘🏰",
      feedbackIncorrect: "Try again! Teachers help kids compare sizes!",
      hint: "Which things are big?"
    },
    {
      id: 'scenario-3',
      customer: "Discovery Station",
      customerEmoji: "🔍",
      order: "Object sorting! Group by what they're made of! 🪨",
      instruction: "Teachers help kids sort by material! Put hard things together!",
      visual: ["🪨", "🧸", "🔨", "🦴", "🧽", "⚽"],
      correctAnswer: ["🪨", "🔨", "🦴"],
      feedbackCorrect: "Good! Teachers help kids sort by what things are made of! 🪨🔨",
      feedbackIncorrected: "Try again! Teachers help kids feel materials!",
      hint: "Which things are hard?"
    },
    {
      id: 'scenario-4',
      customer: "Exploration Time",
      customerEmoji: "🌟",
      order: "Shape sorting! Group by how many sides! △",
      instruction: "Teachers help kids sort by shape! Put triangles together!",
      visual: ["△", "⭐", "⚫", "🔺", "🟩", "🔶"],
      correctAnswer: ["△", "🔺"],
      feedbackCorrect: "Good! Teachers help kids sort by shape! △🔺",
      feedbackIncorrect: "Try again! Teachers help kids count sides!",
      hint: "Which shapes have three sides?"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real teacher! Student needs help sorting objects! 🔬",
    question: "How do teachers help kids classify objects?",
    options: [
      "Look at how objects are the same and different",
      "Just put them anywhere",
      "Only use one way to sort", 
      "Don't let kids touch objects"
    ],
    correctAnswer: "Look at how objects are the same and different",
    explanation: "Great! Real teachers help kids observe and classify! You think like a teacher! 👍"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'click-sorting',
    instructions: "Sort objects! Put same things together!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};