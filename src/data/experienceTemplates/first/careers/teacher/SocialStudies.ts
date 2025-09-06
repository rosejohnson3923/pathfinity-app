// Experience Template: Teacher Career - Social Studies Activities (1st Grade)
// How teachers use rules and laws concepts in their daily classroom work

export const firstGradeTeacherSocialStudiesTemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'SocialStudies',
    gradeLevel: '1',
    skillCode: '1.SS.A.1',
    skillName: 'Rules and Laws',
    commonCoreStandard: '1.SS.A.1',
    difficulty: 2,
    interactionType: 'click-matching'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 👨‍🏫 Teachers help students understand rules every day!",
    challenge: "Your classroom needs clear rules! 📋 Help students follow school laws!",
    yourRole: "You're the teacher! 👨‍🏫 Help your students understand why we have rules!",
    actionPlan: [
      {
        step: "Explain classroom rules",
        icon: "📋"
      },
      {
        step: "Show why rules help us", 
        icon: "🤝"
      },
      {
        step: "Practice following rules",
        icon: "✅"
      },
      {
        step: "Create a safe classroom",
        icon: "🏫"
      }
    ],
    encouragement: "Real teachers make rules clear and fair! 👨‍🏫 You help students learn together!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Morning Class",
      customerEmoji: "🌅",
      order: "Teacher, what's our rule about raising hands? 🙋",
      instruction: "Help your class! Match the situation with the right rule!",
      situation: "A student wants to speak",
      correctAnswer: "Raise your hand and wait",
      options: [
        "Raise your hand and wait",
        "Shout out loud",
        "Stand on your chair",
        "Leave the room"
      ],
      ruleCategory: "classroom",
      feedbackCorrect: "Excellent teaching! You showed why we raise hands - so everyone gets a turn! 🙋",
      feedbackIncorrect: "Try again! Think about how everyone can share ideas fairly.",
      hint: "This rule helps everyone get a chance to speak!"
    },
    {
      id: 'scenario-2',
      customer: "Playground Time",
      customerEmoji: "🏃",
      order: "What's the safety rule for running? Help us remember! 🏃‍♀️",
      instruction: "Teach playground safety! Match the activity with the safety rule!",
      situation: "Running during recess",
      correctAnswer: "Run only in open areas",
      options: [
        "Run only in open areas",
        "Run in the hallways",
        "Run with scissors",
        "Never run at all"
      ],
      ruleCategory: "safety",
      feedbackCorrect: "Perfect! You taught why we have safe running areas - to prevent accidents! 🏃",
      feedbackIncorrect: "Try again! Think about keeping everyone safe.",
      hint: "Safety rules protect us from getting hurt!"
    },
    {
      id: 'scenario-3',
      customer: "Library Visit",
      customerEmoji: "📚",
      order: "Teacher, why do we whisper in the library? 🤫",
      instruction: "Explain library rules! Match the place with the right behavior!",
      situation: "Being in the library",
      correctAnswer: "Use quiet voices",
      options: [
        "Use quiet voices",
        "Talk very loudly",
        "Play music",
        "Run around"
      ],
      ruleCategory: "respect",
      feedbackCorrect: "Wonderful! You explained that quiet voices help everyone read and learn! 📚",
      feedbackIncorrect: "Try again! Think about helping others concentrate.",
      hint: "This rule helps create a good learning environment!"
    },
    {
      id: 'scenario-4',
      customer: "Clean-up Time",
      customerEmoji: "🧹",
      order: "What's our rule about cleaning up? Show us! 🧹",
      instruction: "Teach responsibility! Match the task with the rule!",
      situation: "After using materials",
      correctAnswer: "Put things back where they belong",
      options: [
        "Put things back where they belong",
        "Leave everything out",
        "Hide the mess",
        "Make someone else do it"
      ],
      ruleCategory: "responsibility",
      feedbackCorrect: "Amazing! You taught that cleaning up helps everyone find things next time! 🧹",
      feedbackIncorrect: "Try again! Think about being responsible.",
      hint: "This rule helps keep our classroom organized!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real 1st grade teacher! The principal asks about your classroom rules! 👨‍🏫",
    question: "How do teachers help 1st graders understand why we have rules?",
    options: [
      "Explain that rules keep us safe, help us learn together, and show respect",
      "Just punish students who break rules",
      "Let students do whatever they want", 
      "Never explain why rules exist"
    ],
    correctAnswer: "Explain that rules keep us safe, help us learn together, and show respect",
    explanation: "Excellent! Real teachers help students understand that rules make school better for everyone! You think like a teacher! 🏫"
  },

  toolConfiguration: {
    toolType: 'click-matching',
    instructions: "Help your students understand rules! Match each situation with the right rule!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      matchingType: 'situation-to-rule',
      showImages: true,
      ruleCategories: ['classroom', 'safety', 'respect', 'responsibility']
    }
  }
};