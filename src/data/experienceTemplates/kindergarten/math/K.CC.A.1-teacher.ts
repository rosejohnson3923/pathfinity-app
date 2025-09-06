// Experience Template: Kindergarten Math Counting - Teacher Career
// Skill: K.CC.A.1 - Count to 10 by ones

export const teacherCountingKTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'Math',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Counting to 10',
    commonCoreStandard: 'K.CC.A.1', // Common Core alignment preserved as metadata
    difficulty: 1,
    interactionType: 'click-counting'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 📚 Teachers count every day!",
    challenge: "Teachers count supplies! 🔢 Kids need right amounts!",
    yourRole: "You teach! 👨‍🏫 Teachers count all day long!",
    actionPlan: [
      {
        step: "Count supplies daily",
        icon: "📚"
      },
      {
        step: "Give kids right amounts", 
        icon: "🔢"
      },
      {
        step: "Check count good",
        icon: "✅"
      },
      {
        step: "Kids learn happy",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers count every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Mrs. Johnson",
      customerEmoji: "👩‍🏫",
      order: "Art time! Each kid needs 4 crayons! 🖍️",
      instruction: "Teachers count supplies! Find 4 crayons!",
      visual: ["🖍️", "🖍️", "🖍️", "🖍️", "🖍️", "🖍️"],
      correctAnswer: 4,
      feedbackCorrect: "Good! Teachers count supplies every day! 🎨",
      feedbackIncorrected: "Try again! Teachers must count right!",
      hint: "Count: 1, 2, 3, 4!"
    },
    {
      id: 'scenario-2',
      customer: "Sarah",
      customerEmoji: "👧",
      order: "Math time! Need 3 blocks for tower! 🧱",
      instruction: "Teachers count math tools! Find 3 blocks!",
      visual: ["🧱", "🧱", "🧱", "🧱", "🧱"],
      correctAnswer: 3,
      feedbackCorrect: "Good! Teachers count math tools daily! 🏗️",
      feedbackIncorrect: "Try again! Teachers count careful!",
      hint: "Count: 1, 2, 3!"
    },
    {
      id: 'scenario-3',
      customer: "Reading Group",
      customerEmoji: "📖",
      order: "Story time! Need 6 books for kids! 📚",
      instruction: "Teachers count books daily! Find 6 books!",
      visual: ["📘", "📗", "📙", "📕", "📔", "📒", "📓", "📖"],
      correctAnswer: 6,
      feedbackCorrect: "Good! Teachers count books every day! 📚",
      feedbackIncorrect: "Try again! Teachers count careful!",
      hint: "Count: 1, 2, 3, 4, 5, 6!"
    },
    {
      id: 'scenario-4',
      customer: "Snack Helper",
      customerEmoji: "🍎",
      order: "Snack time! Each kid gets 2 apples! 🍎",
      instruction: "Teachers count snacks daily! Find 2 apples!",
      visual: ["🍎", "🍎", "🍎", "🍎"],
      correctAnswer: 2,
      feedbackCorrect: "Good! Teachers count snacks every day! 🍎",
      feedbackIncorrect: "Try again! Teachers count right!",
      hint: "Count: 1, 2!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real teacher! Kid needs 5 pencils! ✏️",
    question: "How do teachers count every day?",
    options: [
      "Count slow: 1, 2, 3, 4, 5",
      "Give lots pencils",
      "Say guess", 
      "Ask friend"
    ],
    correctAnswer: "Count slow: 1, 2, 3, 4, 5",
    explanation: "Great! Real teachers count all day! You count like a teacher! 👍"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'counting-interactive',
    instructions: "Count good! Click right!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};