// Experience Template: Librarian Career - ELA Activities (1st Grade)
// How librarians use reading and language skills in their daily library work

export const firstGradeLibrarianELATemplate = {
  metadata: {
    career: 'librarian',
    careerTitle: 'Librarian',
    subject: 'ELA',
    gradeLevel: '1',
    skillCode: '1.RF.A.1',
    skillName: 'Demonstrate understanding of the organization and basic features of print',
    commonCoreStandard: '1.RF.A.1',
    difficulty: 2,
    interactionType: 'reading-comprehension'
  },

  roleSetup: {
    congratulations: "🎉 Great job! 📚 Librarians help people read every day!",
    challenge: "Your library needs reading help! 📖 Visitors need to understand how books work!",
    yourRole: "You're the librarian! 📚 Help library visitors learn about books and reading!",
    actionPlan: [
      {
        step: "Show visitors how to hold books",
        icon: "📖"
      },
      {
        step: "Teach about book organization", 
        icon: "📝"
      },
      {
        step: "Help people find information",
        icon: "🔍"
      },
      {
        step: "Make the library welcoming",
        icon: "🌟"
      }
    ],
    encouragement: "Real librarians make reading accessible! 📚 You help everyone love books!"
  },

  practiceScenarios: [
    {
      id: 'scenario-1',
      customer: "Young Reader",
      customerEmoji: "👧",
      order: "Librarian, I'm confused! Which way do I hold this picture book? 📖",
      instruction: "Help your library visitor! Show them the right way to hold a book!",
      passage: "In the library, we teach people that books have a front cover and a back cover. We hold books right-side up and read from left to right.",
      question: "How should library visitors hold a book when reading?",
      options: [
        "Right-side up with the front cover facing them",
        "Upside down",
        "Sideways",
        "With the back cover facing them"
      ],
      correctAnswer: "Right-side up with the front cover facing them",
      feedbackCorrect: "Excellent library service! You showed them how to hold books properly! 📚",
      feedbackIncorrect: "Try again! Help your visitor learn the right way to hold books.",
      hint: "Think about how visitors can see the title and pictures best - right-side up!"
    },
    {
      id: 'scenario-2',
      customer: "Story Time Parent",
      customerEmoji: "👨‍👧",
      order: "Librarian, where should we start reading to my child? 📄",
      instruction: "Help during story time! Show them where to start reading!",
      passage: "At the library, we help families learn that in English books, we start reading at the top left of each page. We read across to the right, then move down to the next line.",
      question: "Where do we start reading on a page?",
      options: [
        "Top left corner",
        "Bottom right corner", 
        "Middle of the page",
        "Top right corner"
      ],
      correctAnswer: "Top left corner",
      feedbackCorrect: "Perfect library guidance! You taught them where to start reading! 📖",
      feedbackIncorrect: "Try again! Show your visitor the starting point for reading.",
      hint: "We start where the first word appears - at the top left!"
    },
    {
      id: 'scenario-3',
      customer: "Book Browser",
      customerEmoji: "📚",
      order: "Librarian, what are these different parts of the book called? 📕",
      instruction: "Help someone explore books! Teach about book parts!",
      passage: "In our library, we help people understand books. The front cover shows the title and author. Inside are pages with words and pictures. The back cover often has a summary.",
      question: "What do we call the first part that shows the book's title?",
      options: [
        "Front cover",
        "Back cover",
        "Index",
        "Table of contents"
      ],
      correctAnswer: "Front cover",
      feedbackCorrect: "Wonderful library help! You taught them about book parts! 📚",
      feedbackIncorrect: "Try again! Help your visitor identify the parts of books.",
      hint: "The title is on the very first thing people see - the front!"
    },
    {
      id: 'scenario-4',
      customer: "Reading Helper",
      customerEmoji: "👥",
      order: "Librarian, which way do we read the words in English books? ➡️",
      instruction: "Help someone learn to read! Show them reading direction!",
      passage: "At our library, we teach that in English, we read from left to right across each page. When we finish a line, we move down and start at the left side of the next line.",
      question: "Which direction do we read words in English?",
      options: [
        "From left to right",
        "From right to left",
        "From bottom to top",
        "In circles"
      ],
      correctAnswer: "From left to right",
      feedbackCorrect: "Excellent library service! You taught reading direction perfectly! 📚",
      feedbackIncorrect: "Try again! Show your visitor which way to read.",
      hint: "Follow your finger from the beginning to the end of this sentence!"
    }
  ],

  assessmentChallenge: {
    setup: "You are a real librarian! A parent asks about helping their 1st grader with reading basics! 📚",
    question: "How do librarians help 1st graders understand how books work?",
    options: [
      "Teach book orientation, reading direction, and book parts so children can read independently",
      "Only read to children without teaching book skills",
      "Skip book basics and recommend advanced books", 
      "Let children figure out books without guidance"
    ],
    correctAnswer: "Teach book orientation, reading direction, and book parts so children can read independently",
    explanation: "Excellent! Real librarians help children understand book basics first! You think like a librarian! 📚"
  },

  toolConfiguration: {
    toolType: 'reading-comprehension',
    instructions: "Help library visitors learn about books! Answer questions about reading basics!",
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