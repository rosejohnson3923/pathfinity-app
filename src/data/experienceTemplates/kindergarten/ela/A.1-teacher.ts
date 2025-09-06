// Experience Template: Kindergarten ELA Letter Recognition - Teacher Career
// Skill: A.1 - Find the letter in the alphabet: uppercase

export const teacherReadingKTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'ELA',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Find Letter in Alphabet: Uppercase',
    commonCoreStandard: 'K.RF.1', // Common Core Foundational Skills alignment
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
      customer: "Reading Group",
      customerEmoji: "📚",
      order: "Story time! Who was the main character? 👦",
      instruction: "Teachers help kids answer questions! Pick the right answer!",
      visual: ["👦", "🐻", "🚗", "🌟"],
      correctAnswer: "👦",
      feedbackCorrect: "Good! Teachers help kids find main characters! 👦",
      feedbackIncorrect: "Try again! Teachers help kids read careful!",
      hint: "Who is the story about?"
    },
    {
      id: 'scenario-2',
      customer: "Sarah",
      customerEmoji: "👧",
      order: "Reading test! Where did the story happen? 🏠",
      instruction: "Teachers help kids find story places! Pick the right place!",
      visual: ["🏠", "🏫", "🌳", "🚗"],
      correctAnswer: "🏠",
      feedbackCorrect: "Good! Teachers help kids find story settings! 🏠",
      feedbackIncorrect: "Try again! Teachers help kids think careful!",
      hint: "Where does the story take place?"
    },
    {
      id: 'scenario-3',
      customer: "Reading Circle",
      customerEmoji: "👨‍👩‍👧‍👦",
      order: "Story questions! What happened first in the story? 🌅",
      instruction: "Teachers help kids put events in order! Pick what happened first!",
      visual: ["🌅", "🌞", "🌙", "⭐"],
      correctAnswer: "🌅",
      feedbackCorrect: "Good! Teachers help kids understand story order! 🌅",
      feedbackIncorrect: "Try again! Teachers help kids think about order!",
      hint: "What happens at the beginning?"
    },
    {
      id: 'scenario-4',
      customer: "Book Club",
      customerEmoji: "📖",
      order: "Story understanding! How did the character feel? 😊",
      instruction: "Teachers help kids understand feelings! Pick how the character felt!",
      visual: ["😊", "😢", "😠", "😴"],
      correctAnswer: "😊",
      feedbackCorrect: "Good! Teachers help kids understand feelings! 😊",
      feedbackIncorrect: "Try again! Teachers help kids understand emotions!",
      hint: "Look at the character's face in the story!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real teacher! Student asks about story details! 📖",
    question: "How do teachers help kids understand stories?",
    options: [
      "Ask questions about the story",
      "Just read fast",
      "Skip hard parts", 
      "Let kids guess"
    ],
    correctAnswer: "Ask questions about the story",
    explanation: "Great! Real teachers ask questions to help kids understand! You help like a teacher! 👍"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'click-choosing',
    instructions: "Choose right answer! Click best choice!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};