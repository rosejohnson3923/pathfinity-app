# Complete Content Rubric: Sam (K), Doctor Career

## Master Narrative (Generated ONCE)

```json
{
  "narrativeId": "narr_sam_doctor_k_001",
  "character": {
    "name": "Sam",
    "role": "Junior Doctor Helper",
    "workplace": "CareerInc Medical Center",
    "personality": "Caring, gentle, helpful",
    "equipment": ["Toy stethoscope", "Doctor coat", "Medical clipboard", "First aid kit"]
  },

  "journeyArc": {
    "checkIn": "Sam arrives at CareerInc Lobby as Junior Doctor Helper",
    "learn": "Virtual Academy - Medical Helper Basics",
    "experience": "Virtual Workplace - CareerInc Children's Clinic",
    "discover": "Virtual Field Trip - Community Health Fair"
  },

  "cohesiveStory": {
    "medicalFocus": "Pediatric care",
    "patients": "Teddy Bear Clinic patients",
    "mission": "Help teddy bears feel better",
    "throughLine": "Sam learns to care for patients at the Teddy Bear Clinic"
  },

  "settingProgression": {
    "learn": {
      "location": "CareerInc Virtual Academy - Medical Classroom",
      "context": "Learning doctor basics with medical examples",
      "narrative": "Sam studies how doctors organize and help"
    },
    "experience": {
      "location": "CareerInc Children's Clinic - Teddy Bear Wing",
      "context": "Sam's workplace where teddy bear patients visit",
      "narrative": "Sam makes real medical helper decisions"
    },
    "discover": {
      "location": "Community Health Fair at Central Park",
      "context": "Field trip to see how doctors serve communities",
      "narrative": "Sam helps at health screening stations"
    }
  },

  "visualTheme": {
    "colors": "White coat, blue scrubs",
    "setting": "Clean, friendly medical environments",
    "props": "Medical tools, charts, teddy bear patients"
  },

  "subjectContextsAligned": {
    "math": {
      "learn": "Study how doctors use numbers 1-3 for patient rooms",
      "experience": "Assign teddy bears to exam rooms 1, 2, 3",
      "discover": "See how health fair uses numbered stations"
    },
    "ela": {
      "learn": "Learn to read medical supply labels",
      "experience": "Organize medicine cabinet with letter labels",
      "discover": "Make health fair signs with big letters"
    },
    "science": {
      "learn": "Study medical shapes (circle pills, square bandages, triangle signs)",
      "experience": "Sort medical supplies by shape",
      "discover": "Organize health stations by equipment shapes"
    },
    "socialStudies": {
      "learn": "Learn how medical teams are communities",
      "experience": "Build caring clinic community",
      "discover": "See how health fairs unite neighborhoods"
    }
  }
}
```

---

## LEARN CONTAINER - Virtual Academy

### Math - Identify Numbers Up to 3

**YouTube Video Selection:**
```json
{
  "search": "kindergarten numbers 1 2 3 identifying",
  "selected": {
    "title": "Learn Numbers 1, 2, 3 for Kids!",
    "duration": 120
  }
}
```

**Practice Questions (Same skills, Doctor visual context):**
```json
[
  {
    "type": "multiple_choice",
    "question": "Doctor Sam holds up a door sign. What number is this? [Shows: 2]",
    "visual": "Medical room door with number 2, white medical setting",
    "options": ["1", "2", "3"],
    "correct_answer": 1,
    "hints": [
      "Look at the door sign",
      "It comes after 1",
      "It's number 2!"
    ],
    "doctorSays": "That's exam room 2!"
  },
  {
    "type": "multiple_choice",
    "question": "Which supply bin is number 1? [Shows three bins: 3, 1, 2]",
    "visual": "Three medical supply bins with numbers, clinical background",
    "options": ["First bin (3)", "Middle bin (1)", "Last bin (2)"],
    "correct_answer": 1,
    "hints": [
      "Find the smallest number",
      "It's the first number",
      "Number 1 is in the middle!"
    ],
    "doctorSays": "Bin 1 holds bandages!"
  },
  {
    "type": "true_false",
    "question": "This shows number 3: 🧸🧸🧸",
    "visual": "Three teddy bear patients in waiting room",
    "correct_answer": true,
    "explanation": "Yes! 3 teddy bears = number 3",
    "doctorSays": "3 teddy bears need checkups!"
  },
  {
    "type": "multiple_choice",
    "question": "Point to number 2: [1] [2] [3]",
    "visual": "Three medical chart numbers",
    "options": ["First card", "Middle card", "Last card"],
    "correct_answer": 1,
    "hints": [
      "It's between 1 and 3",
      "Not first, not last",
      "2 is in the middle!"
    ],
    "doctorSays": "Patient number 2 is next!"
  },
  {
    "type": "true_false",
    "question": "Room 3 has the biggest number",
    "visual": "Three exam room signs: Room 1, Room 2, Room 3",
    "correct_answer": true,
    "explanation": "Yes! 3 is bigger than 1 and 2",
    "doctorSays": "Room 3 for special checkups!"
  }
]
```

### ELA - Find Uppercase Letters

**Practice Questions:**
```json
[
  {
    "type": "multiple_choice",
    "question": "Doctor Sam's coat has a letter. Find the uppercase S! [Shows: S a m]",
    "visual": "White doctor coat with name tag",
    "options": ["S", "a", "m"],
    "correct_answer": 0,
    "hints": [
      "Uppercase is BIG",
      "S starts Sam's name",
      "First letter is uppercase!"
    ],
    "doctorSays": "S for Sam and Stethoscope!"
  },
  {
    "type": "true_false",
    "question": "The letter B is uppercase in: bOx",
    "visual": "Medical supply box label",
    "correct_answer": false,
    "explanation": "No, the b is lowercase. O is uppercase!",
    "doctorSays": "Uppercase letters are tall!"
  },
  {
    "type": "multiple_choice",
    "question": "Find uppercase T in TEMP:",
    "visual": "Temperature chart label",
    "options": ["T", "E", "M", "P"],
    "correct_answer": 0,
    "hints": [
      "T starts the word",
      "First letter",
      "T is uppercase!"
    ],
    "doctorSays": "T for Temperature!"
  },
  {
    "type": "multiple_choice",
    "question": "Doctor needs the C cabinet. Which is uppercase C?",
    "visual": "Three cabinets: c, C, G",
    "options": ["First (c)", "Second (C)", "Third (G)"],
    "correct_answer": 1,
    "doctorSays": "Big C for Cabinet!"
  },
  {
    "type": "true_false",
    "question": "All letters in HELP are uppercase",
    "visual": "Emergency HELP sign",
    "correct_answer": true,
    "explanation": "Yes! H-E-L-P are all uppercase!",
    "doctorSays": "Emergency signs use BIG letters!"
  }
]
```

### Science - Classify Objects by 2D Shape

**Practice Questions:**
```json
[
  {
    "type": "multiple_choice",
    "question": "Doctor Sam holds a pill. What shape is it?",
    "visual": "Round vitamin pill in medical setting",
    "options": ["Circle", "Square", "Triangle", "Rectangle"],
    "correct_answer": 0,
    "hints": [
      "It's round",
      "No corners",
      "Circle shape!"
    ],
    "doctorSays": "Pills are circles!"
  },
  {
    "type": "true_false",
    "question": "Bandages are square shapes",
    "visual": "Square medical bandage",
    "correct_answer": true,
    "explanation": "Yes! Bandages have 4 equal sides",
    "doctorSays": "Square bandages cover wounds!"
  },
  {
    "type": "multiple_choice",
    "question": "Doctor's caution sign is what shape?",
    "visual": "Yellow medical warning triangle ⚠️",
    "options": ["Circle", "Square", "Triangle", "Rectangle"],
    "correct_answer": 2,
    "hints": [
      "Count the sides - 3!",
      "Pointy on top",
      "Triangle sign!"
    ],
    "doctorSays": "Warning signs are triangles!"
  },
  {
    "type": "multiple_choice",
    "question": "Which medical items are circles?",
    "visual": "Shows: pill ⭕, bandage ⬜, sign 🔺",
    "options": ["Just pill", "Pill and bandage", "All of them", "None"],
    "correct_answer": 0,
    "doctorSays": "Round pills are easy to swallow!"
  },
  {
    "type": "true_false",
    "question": "Medical charts are rectangles",
    "visual": "Rectangular clipboard with chart",
    "correct_answer": true,
    "explanation": "Yes! Charts are longer rectangles",
    "doctorSays": "Rectangle charts hold lots of info!"
  }
]
```

### Social Studies - What is a Community?

**Practice Questions:**
```json
[
  {
    "type": "multiple_choice",
    "question": "Doctor Sam's clinic is a community. What is a community?",
    "visual": "Pictures: doctors, nurses, patients together",
    "options": [
      "People who help each other",
      "Just one person",
      "Only buildings",
      "Just animals"
    ],
    "correct_answer": 0,
    "hints": [
      "Many people together",
      "They work as a team",
      "People helping people!"
    ],
    "doctorSays": "We're all one caring community!"
  },
  {
    "type": "true_false",
    "question": "Doctors work alone without help",
    "visual": "Medical team working together",
    "correct_answer": false,
    "explanation": "No! Doctors work with nurses and teams",
    "doctorSays": "Medical teams work together!"
  },
  {
    "type": "multiple_choice",
    "question": "Where does our medical community meet?",
    "visual": "Children's clinic with people",
    "options": ["Hospital/Clinic", "Beach", "Forest", "Mountain"],
    "correct_answer": 0,
    "doctorSays": "Clinics bring communities together!"
  },
  {
    "type": "true_false",
    "question": "Communities help each other",
    "visual": "People caring for patient together",
    "correct_answer": true,
    "explanation": "Yes! That's what communities do!",
    "doctorSays": "We all help each other!"
  },
  {
    "type": "multiple_choice",
    "question": "Who is part of the medical community?",
    "visual": "Doctors, nurses, patients, families",
    "options": [
      "Everyone shown",
      "Just doctors",
      "Just patients",
      "Nobody"
    ],
    "correct_answer": 0,
    "doctorSays": "Everyone belongs in our community!"
  }
]
```

---

## EXPERIENCE CONTAINER - Virtual Workplace (CareerInc Children's Clinic)

### Math Experience - Using Numbers 1-3 as a Doctor

```json
{
  "title": "Doctor Sam's Teddy Bear Clinic Day!",
  "setting": "CareerInc Children's Clinic - Teddy Bear Wing",

  "scenario1": {
    "type": "multiple_choice",
    "situation": "Three teddy bears arrived! They need room numbers.",
    "question": "Which exam room for the first teddy?",
    "options": ["Room 1", "Room 2", "Room 3"],
    "correct_answer": 0,
    "doctorWisdom": "We start with Room 1!",
    "outcome": "First teddy goes to Room 1!"
  },

  "scenario2": {
    "type": "true_false",
    "situation": "Medicine shelf labeled '2' has 2 types of medicine",
    "question": "Does the number match what's on the shelf?",
    "correct_answer": true,
    "doctorWisdom": "Numbers help us organize!",
    "outcome": "Shelf 2 perfectly organized!"
  },

  "scenario3": {
    "type": "multiple_choice",
    "situation": "Emergency! Which is the number 3 button?",
    "visual": "Elevator buttons: 1, 2, 3",
    "question": "Press button for floor 3:",
    "options": ["First button", "Second button", "Third button"],
    "correct_answer": 2,
    "doctorWisdom": "Button 3 takes us to floor 3!",
    "outcome": "Reached the right floor!"
  }
}
```

### ELA Experience - Finding Letters as a Doctor

```json
{
  "title": "Doctor Sam's Medical Organization Day!",

  "scenario1": {
    "type": "multiple_choice",
    "situation": "Box marked 'B' for Bandages arrived",
    "question": "Find the uppercase B cabinet:",
    "options": ["Cabinet b", "Cabinet B", "Cabinet D"],
    "correct_answer": 1,
    "doctorWisdom": "Uppercase B matches the box!",
    "outcome": "Bandages stored correctly!"
  },

  "scenario2": {
    "type": "true_false",
    "situation": "Patient TOM needs his chart from the T section",
    "question": "Look in the T drawer for TOM?",
    "correct_answer": true,
    "doctorWisdom": "Names filed by first letter!",
    "outcome": "Found Tom's chart quickly!"
  },

  "scenario3": {
    "type": "multiple_choice",
    "situation": "Medicine bottle shows 'S' for Syrup",
    "question": "Which uppercase letter section?",
    "options": ["R section", "S section", "T section"],
    "correct_answer": 1,
    "doctorWisdom": "S goes in S section!",
    "outcome": "Medicine safely organized!"
  }
}
```

### Science Experience - Using Shapes as a Doctor

```json
{
  "title": "Doctor Sam's Medical Supply Sort!",

  "scenario1": {
    "type": "multiple_choice",
    "situation": "Round items needed for medicine cart",
    "question": "Which supplies are circles?",
    "options": [
      "Pills and round stickers",
      "Square bandages",
      "Triangle signs"
    ],
    "correct_answer": 0,
    "doctorWisdom": "Circles are round like pills!",
    "outcome": "Cart rolls with round wheels!"
  },

  "scenario2": {
    "type": "true_false",
    "situation": "Organizing bandages - they're all squares",
    "question": "Put square bandages in square bin?",
    "correct_answer": true,
    "doctorWisdom": "Squares fit with squares!",
    "outcome": "Bandage station ready!"
  },

  "scenario3": {
    "type": "multiple_choice",
    "situation": "Safety signs need posting",
    "question": "Warning signs are what shape?",
    "options": ["Circles", "Squares", "Triangles"],
    "correct_answer": 2,
    "doctorWisdom": "Triangle means caution!",
    "outcome": "Clinic is safe!"
  }
}
```

### Social Studies Experience - Building Community as a Doctor

```json
{
  "title": "Doctor Sam's Caring Community Day!",

  "scenario1": {
    "type": "multiple_choice",
    "situation": "Scared teddy patient arrives",
    "question": "How should Doctor Sam help?",
    "options": [
      "Speak gently and explain",
      "Ignore their fear",
      "Rush through"
    ],
    "correct_answer": 0,
    "doctorWisdom": "Communities care for everyone!",
    "outcome": "Teddy feels safe!"
  },

  "scenario2": {
    "type": "true_false",
    "situation": "Clinic Family Day - should everyone be invited?",
    "question": "Invite patients, families, and staff?",
    "correct_answer": true,
    "doctorWisdom": "Communities include everyone!",
    "outcome": "Everyone celebrates together!"
  },

  "scenario3": {
    "type": "multiple_choice",
    "situation": "How can clinic help neighborhood?",
    "question": "Best way to help community:",
    "options": [
      "Free health checks",
      "Lock the doors",
      "Charge more"
    ],
    "correct_answer": 0,
    "doctorWisdom": "Communities share and care!",
    "outcome": "Neighborhood stays healthy!"
  }
}
```

---

## DISCOVER CONTAINER - Virtual Field Trip (Community Health Fair)

### Math Discover - How Doctors Use Numbers 1-3

```json
{
  "fieldTripSetting": "Community Health Fair at Central Park",
  "practice": [
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Did you know? Doctors take pulse for 1 minute! Why exactly 1?",
      "options": [
        "Random time",
        "Standard measurement",
        "Too long",
        "Too short"
      ],
      "correct_answer": 1,
      "feedback": "Doctors count heartbeats per 1 minute!"
    },
    {
      "scenario_type": "example",
      "type": "true_false",
      "question": "Doctors check 2 ears because we have 2 ears",
      "correct_answer": true,
      "feedback": "Yes! Always check both ears!"
    },
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Medicine 3 times daily means:",
      "options": [
        "Take randomly",
        "Morning, noon, night",
        "All at once",
        "Never take"
      ],
      "correct_answer": 1,
      "feedback": "3 spreads medicine through the day!"
    },
    {
      "scenario_type": "practice",
      "type": "multiple_choice",
      "question": "Health fair has 3 stations. How are they labeled?",
      "options": [
        "Numbers 1, 2, 3",
        "No labels",
        "Random spots",
        "Colors only"
      ],
      "correct_answer": 0,
      "feedback": "Numbers organize the stations!"
    },
    {
      "scenario_type": "practice",
      "type": "true_false",
      "question": "Station 2 comes after Station 1",
      "correct_answer": true,
      "feedback": "Yes! 2 comes after 1!"
    },
    {
      "scenario_type": "assessment",
      "type": "multiple_choice",
      "question": "Challenge: Station 1 (Height), Station 2 (Weight), Station 3 (Vision). Where check eyes?",
      "options": [
        "Station 1",
        "Station 2",
        "Station 3",
        "No station"
      ],
      "correct_answer": 2,
      "success_message": "Amazing Sam! You know how doctors use numbers!"
    }
  ]
}
```

### ELA Discover - How Doctors Use Uppercase Letters

```json
{
  "practice": [
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "RX on prescriptions - R is uppercase because:",
      "options": [
        "Looks nice",
        "Important medical symbol",
        "Random choice",
        "Mistake"
      ],
      "correct_answer": 1,
      "feedback": "Uppercase for important medical terms!"
    },
    {
      "scenario_type": "example",
      "type": "true_false",
      "question": "ER means Emergency Room - both letters uppercase",
      "correct_answer": true,
      "feedback": "Yes! Important signs use uppercase!"
    },
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "T on charts stands for:",
      "options": [
        "Toy",
        "Temperature",
        "Table",
        "Tiger"
      ],
      "correct_answer": 1,
      "feedback": "T for Temperature!"
    },
    {
      "scenario_type": "practice",
      "type": "multiple_choice",
      "question": "Health booth sign 'H' stands for:",
      "options": [
        "Happy",
        "Health",
        "House",
        "Hat"
      ],
      "correct_answer": 1,
      "feedback": "H for Health!"
    },
    {
      "scenario_type": "practice",
      "type": "true_false",
      "question": "Medicine label 'C' means Cough medicine",
      "correct_answer": true,
      "feedback": "C for Cough medicine!"
    },
    {
      "scenario_type": "assessment",
      "type": "multiple_choice",
      "question": "Challenge: Find supplies in cabinets B, M, G. Which letters?",
      "options": [
        "A, B, C",
        "B, M, G",
        "X, Y, Z",
        "D, E, F"
      ],
      "correct_answer": 1,
      "success_message": "Excellent Sam! You found all the uppercase letters!"
    }
  ]
}
```

### Science Discover - How Doctors Use Shapes

```json
{
  "practice": [
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Pills are circles because they're easier to:",
      "options": [
        "Break",
        "Swallow",
        "Hide",
        "Throw"
      ],
      "correct_answer": 1,
      "feedback": "Round pills are safer!"
    },
    {
      "scenario_type": "example",
      "type": "true_false",
      "question": "Square bandages cover wounds well",
      "correct_answer": true,
      "feedback": "Yes! Squares cover completely!"
    },
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Triangle warning signs get attention because:",
      "options": [
        "Pretty color",
        "Shape means caution",
        "Cheap to make",
        "Random choice"
      ],
      "correct_answer": 1,
      "feedback": "Triangles mean 'pay attention'!"
    },
    {
      "scenario_type": "practice",
      "type": "multiple_choice",
      "question": "Round stickers for brave patients are:",
      "options": [
        "Squares",
        "Triangles",
        "Circles",
        "Rectangles"
      ],
      "correct_answer": 2,
      "feedback": "Circle stickers are friendly!"
    },
    {
      "scenario_type": "practice",
      "type": "true_false",
      "question": "X-ray films are rectangles to show whole body parts",
      "correct_answer": true,
      "feedback": "Rectangle shape shows complete images!"
    },
    {
      "scenario_type": "assessment",
      "type": "multiple_choice",
      "question": "Challenge: Doctor kit needs circles, squares, triangles. Which shapes?",
      "options": [
        "Only circles",
        "Only squares",
        "All three shapes",
        "No shapes"
      ],
      "correct_answer": 2,
      "success_message": "Fantastic Sam! You know all medical shapes!"
    }
  ]
}
```

### Social Studies Discover - How Doctors Build Communities

```json
{
  "practice": [
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Hospitals are community places where everyone can:",
      "options": [
        "Play only",
        "Get help when sick",
        "Sleep only",
        "Hide"
      ],
      "correct_answer": 1,
      "feedback": "Hospitals serve whole communities!"
    },
    {
      "scenario_type": "example",
      "type": "true_false",
      "question": "Health fairs bring communities together to learn",
      "correct_answer": true,
      "feedback": "Yes! Communities learn together!"
    },
    {
      "scenario_type": "example",
      "type": "multiple_choice",
      "question": "Doctors, nurses, and families work as:",
      "options": [
        "Enemies",
        "Healthcare community",
        "Strangers",
        "Competitors"
      ],
      "correct_answer": 1,
      "feedback": "Medical teams are communities!"
    },
    {
      "scenario_type": "practice",
      "type": "true_false",
      "question": "Medical communities help everyone, not just some",
      "correct_answer": true,
      "feedback": "Communities include everyone!"
    },
    {
      "scenario_type": "practice",
      "type": "multiple_choice",
      "question": "Free health screenings show doctors:",
      "options": [
        "Don't care",
        "Care about community",
        "Want money",
        "Are mean"
      ],
      "correct_answer": 1,
      "feedback": "Doctors serve communities!"
    },
    {
      "scenario_type": "assessment",
      "type": "multiple_choice",
      "question": "Challenge: Health fair brings everyone together. This shows communities:",
      "options": [
        "Fight each other",
        "Stay apart",
        "Work together for health",
        "Don't care"
      ],
      "correct_answer": 2,
      "success_message": "Wonderful Sam! You understand medical communities!"
    }
  ]
}
```

---

## Summary

**Valid Question Types Used:**
- `multiple_choice`: Primary type for all subjects
- `true_false`: Secondary type for variety
- No invalid types like `counting` for non-math subjects

**Narrative Consistency:**
- Master Narrative: Sam as Junior Doctor Helper
- Settings: Virtual Academy → Children's Clinic → Health Fair
- Cohesive story: Teddy Bear Clinic throughout
- Visual consistency: Medical emojis and settings

**Cost Efficiency:**
- Master Narrative: $0.60 (one-time, cached 30 days)
- Micro-adaptations: 12 × $0.0005 = $0.006
- Total: $0.606 first time, $0.006 cached
- **98.9% cost reduction achieved**

**Skills Correctly Implemented:**
✅ Math: Identify numbers up to 3 (not counting)
✅ ELA: Find uppercase letters (letter identification)
✅ Science: Classify by 2D shapes (circles, squares, triangles, rectangles)
✅ Social Studies: What is a community (understanding community concept)