// Experience Template: Kindergarten ELA Reading - Librarian Career
// Skill: A.1 - Ask and answer questions about key details in a text

export const libraryReadingKTemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'ELA',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Ask and Answer Questions',
    commonCoreStandard: 'K.RL.1', // Common Core alignment preserved as metadata
    difficulty: 1,
    interactionType: 'click-choosing'
  },

  roleSetup: {
    congratulations: "🎉 Congratulations! Plainview City Library needs your reading skills to solve an urgent problem today!",
    challenge: "Story time is starting soon, but the story cards got mixed up! We need your help to find the right answers about each story so children get the books they want.",
    yourRole: "You're working as a Story Time Helper today! You'll use your reading skills to answer questions about popular children's books.",
    actionPlan: [
      {
        step: "Look at the book cover carefully",
        icon: "👀"
      },
      {
        step: "Listen to the question about the story",
        icon: "👂"
      },
      {
        step: "Think about what you see",
        icon: "🤔"
      },
      {
        step: "Choose the best answer",
        icon: "✅"
      }
    ],
    encouragement: "Remember: Looking at pictures helps us understand stories!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Sarah",
      customerEmoji: "👧",
      order: "I want a book about the bear who lost something",
      bookInfo: {
        title: "Bear's Lost Button",
        cover: "🐻👔",
        detail: "A brown bear is looking sad and pointing at his shirt"
      },
      question: "What did the bear lose?",
      instruction: "Click on what the bear lost",
      visual: ["🍯", "👔", "🏠", "🌳"],
      correctAnswer: 1, // Index of button emoji
      feedbackCorrect: "That's right! The bear lost his button! Sarah will love this story!",
      feedbackIncorrect: "Look again at the bear's shirt. What's missing?",
      hint: "The bear is pointing at his shirt!"
    },
    {
      id: 'scenario-2',
      customer: "Ben",
      customerEmoji: "👦",
      order: "I want the book about the hungry animal",
      bookInfo: {
        title: "The Very Hungry Caterpillar",
        cover: "🐛🍎",
        detail: "A green caterpillar is eating through an apple"
      },
      question: "What animal is hungry in this story?",
      instruction: "Click on the hungry animal",
      visual: ["🐻", "🐛", "🦁", "🐰"],
      correctAnswer: 1, // Index of caterpillar
      feedbackCorrect: "Yes! The caterpillar is very hungry! Ben found his book!",
      feedbackIncorrect: "Look at the book cover again. Which animal do you see?",
      hint: "It's a small, green animal that becomes a butterfly!"
    },
    {
      id: 'scenario-3',
      customer: "Emma",
      customerEmoji: "👧",
      order: "I want to find the book where someone says 'I am not'",
      bookInfo: {
        title: "Green Eggs and Ham",
        cover: "🍳🟢",
        detail: "A character is shaking his head at green eggs"
      },
      question: "What does the character NOT want to eat?",
      instruction: "Click on what he doesn't want",
      visual: ["🍕", "🍳", "🍦", "🍪"],
      correctAnswer: 1, // Index of eggs
      feedbackCorrect: "Excellent! He does not like green eggs and ham! Emma's book is ready!",
      feedbackIncorrect: "Think about the title. What food is green?",
      hint: "The title mentions eggs!"
    },
    {
      id: 'scenario-4',
      customer: "Lily",
      customerEmoji: "👧",
      order: "Where's the book about things that go?",
      bookInfo: {
        title: "Things That Go",
        cover: "🚗🚂✈️",
        detail: "Lots of vehicles on the cover"
      },
      question: "Which one flies in the sky?",
      instruction: "Click on what flies",
      visual: ["🚗", "🚂", "✈️", "🚢"],
      correctAnswer: 2, // Index of airplane
      feedbackCorrect: "Perfect! The airplane flies in the sky! Lily will learn about things that go!",
      feedbackIncorrect: "Which one has wings and goes up high?",
      hint: "Look for wings!"
    }
  ],

  assessmentChallenge: {
    setup: "A parent asks: 'My child loves the book about the mouse who gets a cookie. Do you have it?'",
    question: "How can you best help find this book?",
    options: [
      "Ask: 'Is it about a mouse who wants a cookie?'",
      "Say: 'I don't know that book'",
      "Give them any book with animals",
      "Tell them to look by themselves"
    ],
    correctAnswer: "Ask: 'Is it about a mouse who wants a cookie?'",
    explanation: "Wonderful! Asking questions about story details helps us find the right book. You're thinking like a real librarian!"
  },

  // Configuration for Master Tool Interface
  toolConfiguration: {
    toolType: 'story-question-interactive',
    instructions: "Help each child find their book by answering questions about the stories!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};