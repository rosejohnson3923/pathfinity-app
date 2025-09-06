// Experience Template: Teacher Career - ELA Activities
// How teachers use ELA skills in their daily work

export const teacherELATemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'ELA',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Find Letter in Alphabet: Uppercase',
    commonCoreStandard: 'K.RF.1',
    difficulty: 1,
    interactionType: 'letter-identification'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 📚 Teachers help kids learn letters every day!",
    challenge: "Teachers help kids find letters! 🔤 Kids need to know their ABC's!",
    yourRole: "You teach! 👨‍🏫 Teachers teach letters all day long!",
    actionPlan: [
      {
        step: "Show letter cards daily",
        icon: "🔤"
      },
      {
        step: "Point to uppercase letters", 
        icon: "👆"
      },
      {
        step: "Help kids find letters",
        icon: "🔍"
      },
      {
        step: "Kids learn ABC's",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers teach letters every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Kindergarten Class",
      customerEmoji: "👶",
      order: "Letter lesson! Find the letter 'B'! 🔤",
      instruction: "Teachers help kids find uppercase letters! Point to letter 'B'!",
      visual: ["A", "B", "C", "D"],
      correctAnswer: "B",
      feedbackCorrect: "Good! Teachers help kids find letter 'B'! 🔤",
      feedbackIncorrect: "Try again! Teachers help kids learn letters!",
      hint: "Look for the letter that comes after 'A'!"
    },
    {
      id: 'scenario-2',
      customer: "Alphabet Circle",
      customerEmoji: "🔤",
      order: "Letter practice! Show me uppercase 'M'! 📝",
      instruction: "Teachers help kids identify letters! Pick the uppercase 'M'!",
      visual: ["N", "M", "W", "V"],
      correctAnswer: "M",
      feedbackCorrect: "Good! Teachers help kids find letter 'M'! 📝",
      feedbackIncorrect: "Try again! Teachers show kids letter shapes!",
      hint: "Look for the letter with two tall lines!"
    },
    {
      id: 'scenario-3',
      customer: "Letter Station",
      customerEmoji: "✏️",
      order: "Writing practice! Find uppercase 'S'! ✍️",
      instruction: "Teachers help kids write letters! Point to uppercase 'S'!",
      visual: ["R", "S", "P", "Q"],
      correctAnswer: "S",
      feedbackCorrect: "Good! Teachers help kids find letter 'S'! ✍️",
      feedbackIncorrect: "Try again! Teachers help kids see letter shapes!",
      hint: "Look for the letter that looks like a snake!"
    },
    {
      id: 'scenario-4',
      customer: "ABC Group",
      customerEmoji: "📖",
      order: "Letter game! Point to uppercase 'T'! 🎯",
      instruction: "Teachers make letter learning fun! Find the uppercase 'T'!",
      visual: ["F", "E", "T", "L"],
      correctAnswer: "T",
      feedbackCorrect: "Good! Teachers help kids find letter 'T'! 🎯",
      feedbackIncorrect: "Try again! Teachers help kids learn ABC's!",
      hint: "Look for the letter that looks like a cross!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real teacher! Student needs help with letters! 🔤",
    question: "How do teachers help kids learn letters?",
    options: [
      "Show letters and help kids find them",
      "Just say the alphabet fast",
      "Skip hard letters", 
      "Let kids guess letters"
    ],
    correctAnswer: "Show letters and help kids find them",
    explanation: "Great! Real teachers help kids learn letters step by step! You teach like a teacher! 👍"
  },

  toolConfiguration: {
    toolType: 'letter-identification',
    instructions: "Find letters! Click the right uppercase letter!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};