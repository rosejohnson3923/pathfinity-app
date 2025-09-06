// Experience Template: Teacher Career - ELA Activities (1st Grade)
// How teachers use reading and language skills in their daily classroom work

export const firstGradeTeacherELATemplate = {
  metadata: {
    career: 'teacher',
    careerTitle: 'Teacher',
    subject: 'ELA',
    gradeLevel: '1',
    skillCode: '1.RF.A.1',
    skillName: 'Demonstrate understanding of the organization and basic features of print',
    commonCoreStandard: '1.RF.A.1',
    difficulty: 2,
    interactionType: 'reading-comprehension'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Teachers help students learn to read every day!",
    challenge: "Your classroom needs reading help! 📖 Students need to understand how books work!",
    yourRole: "You're the teacher! 👨‍🏫 Help your students learn about books and reading!",
    actionPlan: [
      {
        step: "Show students how to hold books",
        icon: "📖"
      },
      {
        step: "Teach about book parts", 
        icon: "📝"
      },
      {
        step: "Practice reading together",
        icon: "👥"
      },
      {
        step: "Make reading fun and exciting",
        icon: "🌟"
      }
    ],
    encouragement: "Real teachers make reading magical! 👨‍🏫 You help students love books!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Reading Student",
      customerEmoji: "👧",
      order: "Teacher, I need help! Which way do I hold my book? 📖",
      instruction: "Help your student! Show them the right way to hold a book!",
      passage: "Books have a front cover and a back cover. We hold books right-side up and read from left to right.",
      question: "How should we hold a book when reading?",
      options: [
        "Right-side up with the front cover facing us",
        "Upside down",
        "Sideways",
        "With the back cover facing us"
      ],
      correctAnswer: "Right-side up with the front cover facing us",
      feedbackCorrect: "Excellent teaching! You showed your student how to hold books properly! 📚",
      feedbackIncorrect: "Try again! Help your student learn the right way to hold books.",
      hint: "Think about how you see words best - right-side up!"
    },
    {
      id: 'scenario-2',
      customer: "Story Time Group",
      customerEmoji: "📚",
      order: "Teacher, where do we start reading on a page? 📄",
      instruction: "Help your story group! Show them where to start reading!",
      passage: "When we read English, we start at the top left of the page. We read across to the right, then move down to the next line.",
      question: "Where do we start reading on a page?",
      options: [
        "Top left corner",
        "Bottom right corner", 
        "Middle of the page",
        "Top right corner"
      ],
      correctAnswer: "Top left corner",
      feedbackCorrect: "Perfect! You taught your students where to start reading! 📖",
      feedbackIncorrect: "Try again! Show your students the starting point for reading.",
      hint: "We start where the first word begins - at the top left!"
    },
    {
      id: 'scenario-3',
      customer: "Library Visit",
      customerEmoji: "📖",
      order: "Teacher, what are the parts of a book called? 📚",
      instruction: "Help during library time! Teach about book parts!",
      passage: "Books have many parts. The front cover shows the title and author. Inside are pages with words and pictures. The back cover tells us about the book.",
      question: "What do we call the first page that shows the title?",
      options: [
        "Front cover",
        "Back cover",
        "Index",
        "Table of contents"
      ],
      correctAnswer: "Front cover",
      feedbackCorrect: "Wonderful! You taught your students about book parts! 📚",
      feedbackIncorrect: "Try again! Help your students identify book parts.",
      hint: "The title is on the very first thing we see - the front!"
    },
    {
      id: 'scenario-4',
      customer: "Reading Circle",
      customerEmoji: "👥",
      order: "Teacher, which direction do we read words? ➡️",
      instruction: "Help your reading circle! Show them reading direction!",
      passage: "In English, we read from left to right across the page. When we finish a line, we move down and start at the left side of the next line.",
      question: "Which direction do we read words in English?",
      options: [
        "From left to right",
        "From right to left",
        "From bottom to top",
        "In circles"
      ],
      correctAnswer: "From left to right",
      feedbackCorrect: "Excellent! You taught reading direction perfectly! 👨‍🏫",
      feedbackIncorrect: "Try again! Show your students which way to read.",
      hint: "Follow your finger from the beginning to the end of this sentence!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real 1st grade teacher! A parent asks about their child's reading basics! 👨‍🏫",
    question: "How do teachers help 1st graders understand how books work?",
    options: [
      "Teach book orientation, reading direction, and book parts so students can read independently",
      "Only read to students without teaching book skills",
      "Skip book basics and go straight to hard words", 
      "Let students figure out books on their own"
    ],
    correctAnswer: "Teach book orientation, reading direction, and book parts so students can read independently",
    explanation: "Excellent! Real teachers help students understand book basics first! You think like a teacher! 📚"
  },

  toolConfiguration: {
    toolType: 'reading-comprehension',
    instructions: "Help your students learn about books! Answer questions about reading basics!",
    showProgressBar: true,
    allowHints: true,
    celebrateCorrect: true,
    maxAttempts: 3,
    features: {
      showPassage: true,
      multipleChoice: true,
      bookBasics: true
    }
  }
};