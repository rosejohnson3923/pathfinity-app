// Experience Template: Librarian Career - ELA Activities
// How librarians use ELA skills in their daily work

export const librarianELATemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'ELA',
    gradeLevel: 'K',
    skillCode: 'A.1',
    skillName: 'Find Letter in Alphabet: Uppercase',
    commonCoreStandard: 'K.RF.1',
    difficulty: 1,
    interactionType: 'letter-identification'
  },

  roleSetup: {
    congratulations: "🎉 Good job! 📚 Librarians help with letters every day!",
    challenge: "Librarians help people find books! 🔤 Books have letters on them!",
    yourRole: "You are librarian! 📚 Librarians know letters all day!",
    actionPlan: [
      {
        step: "Look at book titles daily",
        icon: "👀"
      },
      {
        step: "Find letters on books", 
        icon: "🔍"
      },
      {
        step: "Help people read titles",
        icon: "📖"
      },
      {
        step: "People find right books",
        icon: "🌟"
      }
    ],
    encouragement: "Real librarians use letters every day! 👍 You do too!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Book Finder",
      customerEmoji: "🔍",
      order: "Looking for book starting with 'C'! 📚",
      instruction: "Librarians find books by first letter! Find uppercase 'C'!",
      visual: ["A", "B", "C", "D"],
      correctAnswer: "C",
      feedbackCorrect: "Good! Librarians find books by letters! 📚",
      feedbackIncorrect: "Try again! Librarians know their letters!",
      hint: "Look for the letter that comes after 'B'!"
    },
    {
      id: 'scenario-2',
      customer: "Story Seeker",
      customerEmoji: "📖",
      order: "Need book with title starting with 'H'! 📝",
      instruction: "Librarians organize books by letters! Pick uppercase 'H'!",
      visual: ["F", "G", "H", "I"],
      correctAnswer: "H",
      feedbackCorrect: "Good! Librarians organize books by letters! 📝",
      feedbackIncorrect: "Try again! Librarians sort books by alphabet!",
      hint: "Look for the letter that comes after 'G'!"
    },
    {
      id: 'scenario-3',
      customer: "Reading Helper",
      customerEmoji: "👓",
      order: "Author's name starts with 'P'! ✍️",
      instruction: "Librarians know author names! Find uppercase 'P'!",
      visual: ["M", "N", "O", "P"],
      correctAnswer: "P",
      feedbackCorrect: "Good! Librarians know authors by letters! ✍️",
      feedbackIncorrect: "Try again! Librarians organize by alphabet!",
      hint: "Look for the letter that comes after 'O'!"
    },
    {
      id: 'scenario-4',
      customer: "Library Card User",
      customerEmoji: "💳",
      order: "Last name starts with 'W'! 🎯",
      instruction: "Librarians file cards by letter! Find uppercase 'W'!",
      visual: ["T", "U", "V", "W"],
      correctAnswer: "W",
      feedbackCorrect: "Good! Librarians organize cards by letters! 🎯",
      feedbackIncorrect: "Try again! Librarians use alphabet order!",
      hint: "Look for the letter that comes after 'V'!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! Person needs book starting with 'B'! 📚",
    question: "How do librarians use letters every day?",
    options: [
      "Organize books and cards by alphabet letters",
      "Just guess where books are",
      "Don't worry about letters", 
      "Put books anywhere"
    ],
    correctAnswer: "Organize books and cards by alphabet letters",
    explanation: "Great! Real librarians use letters to organize everything! You work like a librarian! 👍"
  },

  toolConfiguration: {
    toolType: 'letter-identification',
    instructions: "Find letters! Help people find books!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3
  }
};