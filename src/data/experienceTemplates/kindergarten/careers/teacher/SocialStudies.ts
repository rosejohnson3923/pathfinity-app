// Experience Template: Teacher Career - Social Studies Activities
// How teachers use social studies skills in their daily work

export const teacherSocialStudiesTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'SocialStudies',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Community Helpers',
    commonCoreStandard: 'K.SS.1',
    difficulty: 1,
    interactionType: 'click-matching'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 🏫 Teachers teach about community every day!",
    challenge: "Teachers help kids learn about helpers! 👥 Kids need to know who helps them!",
    yourRole: "You teach! 👨‍🏫 Teachers teach about community helpers all day!",
    actionPlan: [
      {
        step: "Show helper pictures daily",
        icon: "📸"
      },
      {
        step: "Tell kids what helpers do", 
        icon: "💬"
      },
      {
        step: "Help kids match helpers to jobs",
        icon: "🔗"
      },
      {
        step: "Kids learn about community",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers teach community every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Social Studies Class",
      customerEmoji: "🏫",
      order: "Community lesson! Who puts out fires? 🔥",
      instruction: "Teachers help kids learn about fire safety! Pick the right helper!",
      visual: ["🚒", "👨‍⚕️", "👮", "👨‍🏫"],
      correctAnswer: "🚒",
      feedbackCorrect: "Good! Teachers help kids learn firefighters put out fires! 🚒",
      feedbackIncorrect: "Try again! Teachers help kids learn about safety helpers!",
      hint: "Who rides the big red truck?"
    },
    {
      id: 'scenario-2',
      customer: "Community Circle",
      customerEmoji: "👨‍👩‍👧‍👦",
      order: "Helper matching! Who helps when you're sick? 🏥",
      instruction: "Teachers help kids learn about health helpers! Pick who helps sick people!",
      visual: ["👨‍⚕️", "👨‍🍳", "👷", "📚"],
      correctAnswer: "👨‍⚕️",
      feedbackCorrect: "Good! Teachers help kids learn doctors help sick people! 👨‍⚕️",
      feedbackIncorrect: "Try again! Teachers help kids learn about health!",
      hint: "Who wears a white coat in the hospital?"
    },
    {
      id: 'scenario-3',
      customer: "Learning Station",
      customerEmoji: "📚",
      order: "Job matching! Who keeps our community safe? 👮",
      instruction: "Teachers help kids learn about safety! Pick who keeps us safe!",
      visual: ["👮", "👨‍🎨", "🧑‍🌾", "👨‍🔧"],
      correctAnswer: "👮",
      feedbackCorrect: "Good! Teachers help kids learn police keep us safe! 👮",
      feedbackIncorrect: "Try again! Teachers help kids learn about safety!",
      hint: "Who wears a badge and helps keep us safe?"
    },
    {
      id: 'scenario-4',
      customer: "Community Helpers Unit",
      customerEmoji: "🏘️",
      order: "Helper roles! Who delivers our mail? 📮",
      instruction: "Teachers help kids learn about mail service! Pick who brings mail!",
      visual: ["👨‍💼", "📮", "🚚", "✈️"],
      correctAnswer: "📮",
      feedbackCorrect: "Good! Teachers help kids learn mail carriers deliver mail! 📮",
      feedbackIncorrected: "Try again! Teachers help kids learn about mail service!",
      hint: "Who brings letters to your house?"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real teacher! Student asks about community helpers! 🏘️",
    question: "How do teachers help kids learn about community?",
    options: [
      "Show kids who helps in their neighborhood",
      "Only talk about one helper",
      "Don't explain what helpers do", 
      "Tell kids helpers aren't important"
    ],
    correctAnswer: "Show kids who helps in their neighborhood",
    explanation: "Great! Real teachers help kids understand their community! You teach like a teacher! 👍"
  },

  toolConfiguration: {
    toolType: 'community-helper',
    instructions: "Pick the right community helper for each job!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};