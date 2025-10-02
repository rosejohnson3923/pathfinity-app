/**
 * Comprehensive Mock Data for Demo Dashboard
 * High-quality, age-appropriate, instructional content that matches AI-generated standards
 *
 * Structure: 4 Users × 4 Roles × 4 Subjects = 64 complete lesson components
 */

interface LessonActivity {
  setup: string;
  activities: string[];
  challenge: string;
  hint: string;
  questions?: string[];
  answers?: string[];
  learningOutcome: string;
}

interface RoleContent {
  math: LessonActivity;
  ela: LessonActivity;
  science: LessonActivity;
  social_studies: LessonActivity;
}

interface CareerProgression {
  role1: RoleContent;
  role2: RoleContent;
  role3: RoleContent;
  role4: RoleContent;
}

export const DEMO_LESSON_CONTENT = {

  // ===================================
  // SAM (K) - CHEF CAREER PROGRESSION
  // ===================================
  sam_k_chef: {
    role1: {
      math: {
        setup: "Welcome to CareerInc Chef Center! You're Sam's kitchen helper today. The head chef needs help counting ingredients for the special recipe.",
        activities: [
          "The recipe needs 3 bowls. Count them!",
          "Put 2 apples in the basket for the pie",
          "Set the table with 1 plate for the taste tester"
        ],
        challenge: "How many eggs do we need for the cake?",
        hint: "Count with me: 1 egg, 2 eggs, 3 eggs. The cake needs 3 eggs!",
        questions: [
          "Point to the number 3 on the recipe card",
          "Show me 2 spoons from the drawer",
          "Count the strawberries: how many do you see?"
        ],
        answers: ["3", "2 spoons", "3 strawberries"],
        learningOutcome: "Sam can identify and count numbers 1-3 in kitchen contexts"
      },
      ela: {
        setup: "Time to read the recipe! Chefs need to find the right letters to understand what ingredients to use.",
        activities: [
          "Find the letter 'E' in 'EGGS' on the recipe card",
          "Point to the 'M' in 'MILK' on the ingredient list",
          "Circle the 'B' in 'BREAD' on the menu board"
        ],
        challenge: "What letter does 'CHEESE' start with?",
        hint: "Look at the first letter. It looks like the letter that makes the 'ch' sound.",
        questions: [
          "Which letter comes first in 'APPLE'?",
          "Find the letter 'S' in 'SUGAR'",
          "What letter do you see at the start of 'TOMATO'?"
        ],
        answers: ["A", "S", "T"],
        learningOutcome: "Sam can identify uppercase letters in food and recipe contexts"
      },
      science: {
        setup: "Chefs are scientists too! We need to sort our ingredients by their shapes before we start cooking.",
        activities: [
          "Sort the round tomatoes from the square crackers",
          "Put all the circular plates in one pile",
          "Group the rectangular bread slices together"
        ],
        challenge: "Look at these pizza slices. What shape are they?",
        hint: "Pizza slices have three sides and look like triangles!",
        questions: [
          "What shape is this dinner plate?",
          "How many sides does this cracker have?",
          "Which fruits are round like circles?"
        ],
        answers: ["Circle", "4 sides (square)", "Apples and oranges"],
        learningOutcome: "Sam can classify kitchen items by basic 2D shapes"
      },
      social_studies: {
        setup: "Chefs work as part of a kitchen community. Everyone helps each other to make delicious food for customers.",
        activities: [
          "Help the head chef by washing the vegetables",
          "Share the cooking tools with other kitchen helpers",
          "Say 'please' and 'thank you' when asking for ingredients"
        ],
        challenge: "A customer asks what's in today's soup. How should you respond?",
        hint: "Be helpful and friendly! Tell them about the healthy vegetables we used.",
        questions: [
          "How do kitchen helpers work together?",
          "What makes a restaurant a good place for the community?",
          "Why do chefs make healthy food choices?"
        ],
        answers: [
          "By sharing tools and helping each other",
          "When everyone feels welcome and gets good food",
          "To keep people in our community healthy and strong"
        ],
        learningOutcome: "Sam understands how chefs contribute to their community through food service"
      }
    },

    role2: {
      math: {
        setup: "Congratulations! You're now Little Chef Sam! The kitchen is busier today, and you need to help with more complex counting tasks.",
        activities: [
          "First count 3 bowls (like before), then add 2 more spoons",
          "Make a sandwich: count 2 bread slices + 1 cheese slice",
          "Soup recipe: add ingredients in order - 1 carrot, then 2 potatoes, then 3 onions"
        ],
        challenge: "The head chef wants you to prepare ingredients for 2 different recipes. How many total items?",
        hint: "Count the items for recipe 1, then count items for recipe 2, then count them all together!",
        questions: [
          "If you make 2 sandwiches, how many bread slices do you need?",
          "Count in order: first 1 apple, then 2 bananas. How many fruits total?",
          "The salad needs 3 tomatoes. Show me by counting to 3."
        ],
        answers: ["4 bread slices (2 for each sandwich)", "3 fruits total", "1, 2, 3 tomatoes"],
        learningOutcome: "Sam can sequence counting tasks and combine simple number operations"
      },
      ela: {
        setup: "Little Chefs need to read more complex recipe instructions! Let's practice reading whole words for ingredients.",
        activities: [
          "Read the word 'EGGS' and find the eggs in the refrigerator",
          "Match the word 'MILK' to the milk carton",
          "Find all ingredients that start with 'C': CHEESE, CARROTS, CRACKERS"
        ],
        challenge: "The recipe says 'MIX'. What should you do?",
        hint: "When you see 'MIX', it means stir the ingredients together with a spoon!",
        questions: [
          "What does the recipe word 'BAKE' mean?",
          "Find two words that start with the same letter",
          "Which ingredient word is the longest: EGG or BUTTER?"
        ],
        answers: [
          "Put the food in the oven to cook",
          "Examples: BREAD and BUTTER both start with B",
          "BUTTER is longer than EGG"
        ],
        learningOutcome: "Sam can read simple cooking words and follow basic recipe instructions"
      },
      science: {
        setup: "Little Chefs learn about cooking science! Different ingredients change when we heat them or mix them together.",
        activities: [
          "Sort ingredients by temperature: cold milk vs. warm soup",
          "Group foods by texture: smooth yogurt vs. bumpy crackers",
          "Observe what happens when we mix oil and water"
        ],
        challenge: "What happens to ice when we put it in hot soup?",
        hint: "Heat makes ice change! It turns from solid ice into liquid water.",
        questions: [
          "Which ingredients are liquids: milk, bread, or juice?",
          "What shape does water take in different containers?",
          "Why do we keep some foods cold in the refrigerator?"
        ],
        answers: [
          "Milk and juice are liquids",
          "Water takes the shape of its container",
          "Cold temperatures keep food fresh and safe to eat"
        ],
        learningOutcome: "Sam understands basic states of matter and food safety in cooking"
      },
      social_studies: {
        setup: "Little Chefs learn about food traditions from different communities around the world!",
        activities: [
          "Learn about pizza from Italy and tacos from Mexico",
          "Discover how families in different places eat meals together",
          "Practice saying 'hello' in different languages: Hola, Bonjour, Ciao"
        ],
        challenge: "Why do different communities have different favorite foods?",
        hint: "Communities use ingredients that grow nearby and recipes passed down from their families!",
        questions: [
          "How do families in your community celebrate with food?",
          "What foods grow in different parts of the world?",
          "Why is it important to try foods from other cultures?"
        ],
        answers: [
          "Examples: birthday cakes, holiday dinners, family barbecues",
          "Tropical fruits grow in warm places, apples grow in cooler places",
          "It helps us learn about and respect other communities"
        ],
        learningOutcome: "Sam appreciates cultural diversity through food traditions and community connections"
      }
    },

    role3: {
      math: {
        setup: "Amazing! Little Chef Sam is now promoted to Bakery Helper! The bakery has many customers, and you need to help serve them correctly.",
        activities: [
          "Customer order: 1 muffin, 2 cupcakes, 3 cookies. Count each type!",
          "Baking tray setup: arrange 3 rows with 1 cookie in each row",
          "Serve the Jones family: they need treats for 3 people. How many total?"
        ],
        challenge: "A customer wants to buy treats for a party. They need 2 dozen items. How many is that?",
        hint: "One dozen equals 12! So 2 dozens means 12 + 12. That's more than we can count to 3, but we can group them!",
        questions: [
          "If each customer wants 2 cookies, how many cookies for 3 customers?",
          "The display case has 3 shelves with 2 pies on each. How many pies total?",
          "Count by 2s: 2 muffins, 4 muffins, 6 muffins. What comes next?"
        ],
        answers: ["6 cookies (2 for each of 3 customers)", "6 pies total", "8 muffins"],
        learningOutcome: "Sam can apply counting skills to real customer service situations and simple multiplication"
      },
      ela: {
        setup: "Bakery Helpers need to read customer orders and write simple labels for baked goods!",
        activities: [
          "Read the order list: 'MUFFINS, COOKIES, BREAD'",
          "Write labels for the display case: 'FRESH BREAD', 'HOT COOKIES'",
          "Take a phone order: customer spells 'P-I-E', write down 'PIE'"
        ],
        challenge: "A customer asks for your bakery's specialty. How do you explain what makes your bread special?",
        hint: "Use describing words! Our bread is 'fresh', 'warm', and 'homemade'!",
        questions: [
          "What words describe how cookies taste?",
          "Write a sign that tells customers about fresh muffins",
          "If someone can't read, how can you help them know what we sell?"
        ],
        answers: [
          "Sweet, crunchy, delicious, warm",
          "Examples: 'FRESH MUFFINS TODAY' or 'HOT MUFFINS'",
          "Point to pictures, describe the foods, let them smell the bakery"
        ],
        learningOutcome: "Sam can use descriptive language for customer communication and basic writing skills"
      },
      science: {
        setup: "Bakery science is amazing! You'll learn how ingredients work together to create delicious baked goods.",
        activities: [
          "Observe how dough rises when we add yeast",
          "Compare raw cookie dough to baked cookies - what changed?",
          "Measure ingredients precisely: 1 cup flour, 2 tablespoons sugar"
        ],
        challenge: "Why do we need to follow the recipe measurements exactly?",
        hint: "Baking is like a science experiment! Too much or too little of ingredients changes how food turns out.",
        questions: [
          "What happens when we put cookie dough in the oven?",
          "Why does bread dough get bigger when it sits?",
          "Which tools help us measure ingredients accurately?"
        ],
        answers: [
          "Heat makes dough become solid cookies and browns them",
          "Yeast creates gas bubbles that make dough rise and get fluffy",
          "Measuring cups, measuring spoons, and scales"
        ],
        learningOutcome: "Sam understands basic baking chemistry and the importance of precise measurement"
      },
      social_studies: {
        setup: "Bakeries are important community gathering places where people come together and share experiences!",
        activities: [
          "Learn how bakeries serve their neighborhoods every day",
          "Understand how bakers wake up early to have fresh bread ready",
          "Discover how special occasions bring communities together through baked goods"
        ],
        challenge: "How does our bakery help make the community stronger?",
        hint: "Think about birthday cakes, wedding cakes, and daily bread - how do these bring people together?",
        questions: [
          "What role do bakeries play during community celebrations?",
          "How do bakers contribute to their neighborhood's daily life?",
          "Why do people choose local bakeries instead of grocery stores?"
        ],
        answers: [
          "They provide special cakes and treats that make celebrations memorable",
          "They provide fresh bread and treats for families every day",
          "Local bakeries offer fresh, personalized service and support community businesses"
        ],
        learningOutcome: "Sam understands how local businesses like bakeries strengthen community connections"
      }
    },

    role4: {
      math: {
        setup: "Incredible! Sam is now an AI Kitchen Friend! You work with smart kitchen technology to help teach counting to other young chefs.",
        activities: [
          "Teach the AI robot: 'Show me 3 ingredients' - guide the robot to count correctly",
          "Help the smart oven: program it to bake for 3 minutes by counting the timer",
          "Train new kitchen helpers using AI tools: demonstrate counting 1, 2, 3 with digital helpers"
        ],
        challenge: "The AI kitchen assistant is confused about counting. How do you teach it the difference between 2 and 3?",
        hint: "Show the AI by example! Count '1, 2' then add one more to make '1, 2, 3'. Repeat until the AI learns!",
        questions: [
          "How can AI help other children learn to count like you did?",
          "If the robot makes a counting mistake, how do you correct it?",
          "What makes you a good teacher for the AI system?"
        ],
        answers: [
          "AI can show pictures, make counting sounds, and give lots of practice",
          "Show the correct way, explain the mistake, and practice together",
          "I learned all the counting steps myself, so I know how to teach them"
        ],
        learningOutcome: "Sam can teach counting concepts to others and understand how AI learning works"
      },
      ela: {
        setup: "AI Kitchen Friends help smart systems learn to read recipes and communicate with people!",
        activities: [
          "Teach the AI to recognize food words: show it 'MILK' and help it learn the letters M-I-L-K",
          "Help the voice assistant understand recipe instructions when people speak them",
          "Program the digital menu display with clear, easy-to-read food names"
        ],
        challenge: "A new AI system can't tell the difference between 'BREAD' and 'BUTTER'. How do you teach it?",
        hint: "Point out the different letters! BREAD starts with B-R, but BUTTER starts with B-U. Show the AI both words!",
        questions: [
          "How can AI help people who are learning to read?",
          "What happens when you speak clearly to voice-controlled kitchen tools?",
          "Why is it important for AI to understand both letters and sounds?"
        ],
        answers: [
          "AI can read words out loud, show pictures, and give reading practice",
          "They understand better and can follow recipe instructions correctly",
          "People communicate with both writing and speaking, so AI needs both skills"
        ],
        learningOutcome: "Sam understands how AI processes language and can help improve AI communication systems"
      },
      science: {
        setup: "AI Kitchen Friends use smart technology to understand cooking science and help optimize recipes!",
        activities: [
          "Use AI sensors to measure exact temperatures for perfect baking",
          "Help smart systems learn what 'mixing well' looks like by showing good and bad examples",
          "Teach AI to recognize when bread dough has risen enough by comparing photos"
        ],
        challenge: "The AI system needs to learn food safety. How do you teach it to keep foods at safe temperatures?",
        hint: "Show the AI the thermometer! Cold foods stay under 40°F, hot foods stay over 140°F. Teach it to watch the numbers!",
        questions: [
          "How does AI help make cooking more precise than humans alone?",
          "What can smart kitchen tools measure that might be hard for people?",
          "Why is it helpful to have AI remember successful recipes?"
        ],
        answers: [
          "AI can measure exact amounts, temperatures, and timing without mistakes",
          "Exact temperatures, precise timing, tiny measurement differences",
          "AI remembers exactly what worked before and can repeat perfect results"
        ],
        learningOutcome: "Sam understands how AI enhances scientific precision in cooking and food safety"
      },
      social_studies: {
        setup: "AI Kitchen Friends help connect cooking communities around the world and preserve cultural food traditions!",
        activities: [
          "Help AI systems learn about food traditions from different cultures",
          "Use smart translation tools to share recipes between communities that speak different languages",
          "Teach AI about special dietary needs so it can help everyone in the community eat safely"
        ],
        challenge: "How can AI help preserve traditional family recipes from different cultures?",
        hint: "AI can record videos, save exact measurements, and translate recipes so they never get lost!",
        questions: [
          "How does AI help people with food allergies stay safe?",
          "What happens when AI connects chefs from different countries?",
          "Why is it important for AI to learn about many different food cultures?"
        ],
        answers: [
          "AI can check ingredients, warn about allergens, and suggest safe alternatives",
          "They can share recipes, learn new techniques, and create fusion foods",
          "So AI can help everyone, no matter their background or food traditions"
        ],
        learningOutcome: "Sam understands how AI can support cultural diversity and global food community connections"
      }
    }
  } as CareerProgression,

  // ===================================
  // ALEX (1st) - DOCTOR CAREER PROGRESSION
  // ===================================
  alex_1st_doctor: {
    role1: {
      math: {
        setup: "Welcome to CareerInc Medical Center! You're Alex's medical assistant helper today. The doctor needs help counting medical supplies using your Grade 1 math skills.",
        activities: [
          "Count the bandages in the medical kit - start with 1, 2, 3... up to 10!",
          "Review counting by organizing 8 cotton swabs in the supply drawer",
          "Practice counting backwards from 10 to 1 while checking thermometers"
        ],
        challenge: "The nurse needs exactly 7 medicine bottles for today's patients. Can you count them?",
        hint: "Use your counting review skills! Start at 1 and count up: 1, 2, 3, 4, 5, 6, 7. That's 7 bottles!",
        questions: [
          "Count these stethoscopes from 1 to 6. What number comes after 5?",
          "If we have 9 tongue depressors, how many is that when we count up to 10?",
          "Count the first aid supplies and tell me which number comes before 8"
        ],
        answers: ["6", "9 is one less than 10", "7 comes before 8"],
        learningOutcome: "Alex can count and review numbers up to 10 in medical contexts using Grade 1 math skills"
      },
      ela: {
        setup: "Medical assistants need to read medicine labels! Let's practice sorting consonants and vowels to help read medical words correctly.",
        activities: [
          "Sort the letters in 'HEART' - which are vowels (E, A) and which are consonants (H, R, T)?",
          "Look at 'MEDICINE' - find the vowels (E, I, I, E) and consonants (M, D, C, N)",
          "Practice with 'BANDAGE' - separate vowels (A, A, E) from consonants (B, N, D, G)"
        ],
        challenge: "The medicine bottle says 'PILLS'. Can you sort the vowels and consonants?",
        hint: "Remember: A, E, I, O, U are vowels. All other letters are consonants. In PILLS, I is the vowel and P, L, L, S are consonants!",
        questions: [
          "In the word 'ARM', which letter is the vowel?",
          "How many consonants are in the word 'LEG'?",
          "Which letters in 'NURSE' are vowels?"
        ],
        answers: ["A", "2 consonants (L, G)", "U and E"],
        learningOutcome: "Alex can sort consonants and vowels in medical vocabulary using Grade 1 ELA skills"
      },
      science: {
        setup: "Medical assistants are scientists too! We need to classify medical objects by their two-dimensional shapes to organize supplies properly.",
        activities: [
          "Sort the round pills (circles) from the square gauze pads",
          "Classify bandages by shape - rectangular bandages in one bin, triangular bandages in another",
          "Group medical charts: circular charts, square forms, and rectangular patient files"
        ],
        challenge: "Look at this medical ID badge. What two-dimensional shape is it?",
        hint: "Look at the edges and corners! A rectangle has 4 sides and 4 corners, with opposite sides the same length.",
        questions: [
          "What shape are most medicine pills?",
          "How many sides does a triangular bandage have?",
          "Which medical supplies are rectangular in shape?"
        ],
        answers: ["Circles", "3 sides", "Clipboards, name tags, some bandages"],
        learningOutcome: "Alex can classify medical objects by two-dimensional shapes using Grade 1 science skills"
      },
      social_studies: {
        setup: "Medical centers have important rules and laws that help keep everyone safe and healthy. Let's learn why these rules matter!",
        activities: [
          "Learn about hand-washing rules in medical offices - why we must wash hands before helping patients",
          "Understand medicine safety laws - only doctors and nurses can give medicine to patients",
          "Practice following waiting room rules - speak quietly, wait your turn, keep the area clean"
        ],
        challenge: "Why do medical centers have a rule that visitors must check in at the front desk?",
        hint: "Rules keep people safe! Checking in helps the medical staff know who is in the building and ensures patients get the right care.",
        questions: [
          "What is one important rule medical helpers must follow?",
          "Why do we have laws about who can give medicine to patients?",
          "How do rules in medical offices help patients feel safe?"
        ],
        answers: [
          "Always wash hands before helping patients",
          "To make sure only trained people give medicine safely",
          "Rules create a calm, safe environment where patients can get proper care"
        ],
        learningOutcome: "Alex understands rules and laws in medical settings using Grade 1 social studies skills"
      }
    },

    role2: {
      math: {
        setup: "Congratulations! You're now Nurse Helper Alex! Today you'll use advanced counting review skills to help with more complex medical tasks.",
        activities: [
          "Count patient charts in order from 1-10, then practice counting backwards from 10-1",
          "Organize medicine schedules: count morning pills (1-5), afternoon pills (6-8), evening pills (9-10)",
          "Review counting by helping inventory supplies - count bandages, then cotton swabs, practicing your 1-10 sequence"
        ],
        challenge: "The head nurse asks you to count all the medical equipment in Room 3. There are 10 different items. Can you count them all?",
        hint: "Use your counting review skills systematically! Count each item once: 1 stethoscope, 2 blood pressure cuff, 3 thermometer... up to 10!",
        questions: [
          "If you count 8 patient files, how many more do you need to reach 10?",
          "When counting medical supplies, what number comes between 6 and 8?",
          "If you count backwards from 10, what number comes after 7?"
        ],
        answers: ["2 more files", "7", "6"],
        learningOutcome: "Alex applies counting review skills in complex medical scenarios using advanced Grade 1 math concepts"
      },
      ela: {
        setup: "Nurse Helpers need to read medical forms! Let's practice advanced consonant and vowel sorting to read longer medical words.",
        activities: [
          "Sort letters in patient names: 'SARAH' - vowels (A, A), consonants (S, R, H)",
          "Analyze medical terms: 'CHECKUP' - identify vowels (E, U) and consonants (C, H, C, K, P)",
          "Practice with medication names: 'VITAMINS' - separate vowels (I, A, I) from consonants (V, T, M, N, S)"
        ],
        challenge: "The patient form says 'TEMPERATURE'. Can you sort all the vowels and consonants?",
        hint: "Break it down: T-E-M-P-E-R-A-T-U-R-E. Vowels are E, E, A, U, E. Consonants are T, M, P, R, T, R!",
        questions: [
          "In 'PATIENT', which letters are vowels?",
          "How many consonants are in 'HEALTHY'?",
          "Sort the vowels in 'MEDICINE'"
        ],
        answers: ["A, I, E", "4 consonants (H, L, T, H, Y)", "E, I, I, E"],
        learningOutcome: "Alex sorts consonants and vowels in complex medical vocabulary using advanced Grade 1 ELA skills"
      },
      science: {
        setup: "Nurse Helpers learn advanced shape classification! Different medical tools have specific shapes that help them work better.",
        activities: [
          "Classify advanced medical shapes: oval pill organizers, hexagonal medical badges, diamond-shaped warning signs",
          "Sort medical equipment by multiple shape properties: round AND flat items, rectangular AND thick items",
          "Analyze medical room layouts: rectangular patient beds, circular medical stools, square supply cabinets"
        ],
        challenge: "The medical tray has items of different shapes. Can you classify them by their two-dimensional shapes AND explain why each shape is useful?",
        hint: "Think about function! Circular pills roll easily, rectangular bandages cover wounds evenly, triangular bandages fit corners!",
        questions: [
          "Why are most medical clipboards rectangular instead of circular?",
          "What advantage does a circular stethoscope have?",
          "How does the triangular shape help emergency bandages work better?"
        ],
        answers: [
          "Rectangles have flat edges that make writing easier",
          "Circles have no corners, making them comfortable for ears",
          "Triangular bandages can wrap around corners and joints easily"
        ],
        learningOutcome: "Alex classifies medical objects by two-dimensional shapes and understands functional design using advanced Grade 1 science skills"
      },
      social_studies: {
        setup: "Nurse Helpers learn about complex rules and laws that protect patients and medical workers in our community!",
        activities: [
          "Study patient privacy laws - why medical information must be kept secret",
          "Learn about medicine storage rules - how different medicines must be kept safely",
          "Understand emergency rules - what to do when someone needs immediate medical help"
        ],
        challenge: "A new nurse asks you to explain why there are so many rules in medical centers. How do these rules and laws help our community?",
        hint: "Medical rules protect everyone! They keep patients safe, help doctors give better care, and make sure medical centers serve the whole community well.",
        questions: [
          "Why is there a law about keeping patient information private?",
          "How do medicine safety rules protect people in our community?",
          "What happens when medical centers follow proper rules and laws?"
        ],
        answers: [
          "Privacy laws protect people's personal information and make them feel safe getting medical care",
          "Safety rules prevent accidents and make sure people get the right medicine",
          "Following rules helps medical centers provide better care and keep the whole community healthy"
        ],
        learningOutcome: "Alex understands complex rules and laws in medical settings and their community impact using advanced Grade 1 social studies skills"
      }
    },

    role3: {
      math: {
        setup: "Amazing! Nurse Helper Alex is now promoted to Junior Doctor! You'll use expert counting review skills to manage patient care and medical procedures.",
        activities: [
          "Count patient appointments: morning slots (1-4), afternoon slots (5-7), evening slots (8-10)",
          "Organize medication dosages using counting patterns: count by 1s for single pills, review sequences for combination medicines",
          "Manage medical inventory: count supplies forwards and backwards to track what's needed"
        ],
        challenge: "As Junior Doctor, you need to schedule 10 patients throughout the day. Each appointment takes different amounts of time. Can you count and organize them efficiently?",
        hint: "Use systematic counting! Organize by time slots and count in order. Start with appointment 1 at 9:00, appointment 2 at 9:30... up to appointment 10!",
        questions: [
          "If 6 patients need morning appointments and you have 10 total slots, how many afternoon slots are available?",
          "When counting patient files, you reach number 8. What are the next two numbers?",
          "If you count backwards from your 10th patient, which patient number comes before patient 3?"
        ],
        answers: ["4 afternoon slots", "9 and 10", "Patient 2"],
        learningOutcome: "Alex applies expert counting review skills in complex medical management using mastery-level Grade 1 math concepts"
      },
      ela: {
        setup: "Junior Doctors must read complex medical documents! Use advanced consonant and vowel sorting to understand medical terminology and patient information.",
        activities: [
          "Analyze patient symptoms: 'HEADACHE' - sort vowels (E, A, A, E) and consonants (H, D, C, H)",
          "Read medical procedures: 'EXAMINATION' - identify vowels (E, A, I, A, I, O) and consonants (X, M, N, T, N)",
          "Study treatment options: 'PRESCRIPTION' - separate vowels (E, I, I, O) from consonants (P, R, S, C, R, P, T, N)"
        ],
        challenge: "The medical report contains the word 'DIAGNOSIS'. As Junior Doctor, can you sort all the vowels and consonants to read it correctly?",
        hint: "Break down D-I-A-G-N-O-S-I-S carefully! Vowels: I, A, O, I. Consonants: D, G, N, S, S. This helps you read complex medical terms!",
        questions: [
          "In the medical term 'TREATMENT', which letters are vowels?",
          "How many consonants are in 'RECOVERY'?",
          "Sort the vowels in 'APPOINTMENT'"
        ],
        answers: ["E, A, E", "4 consonants (R, C, V, R, Y)", "A, O, I, E"],
        learningOutcome: "Alex sorts consonants and vowels in advanced medical terminology using expert-level Grade 1 ELA skills"
      },
      science: {
        setup: "Junior Doctors understand advanced scientific classification! Medical instruments have precise shapes designed for specific medical functions.",
        activities: [
          "Classify complex medical instruments by shape and function: cylindrical syringes, rectangular surgical tools, circular magnifying equipment",
          "Analyze medical diagrams by two-dimensional shapes: circular cell images, rectangular X-ray films, triangular medical symbols",
          "Design medical workspace organization using shape classification: group similar-shaped tools for efficiency"
        ],
        challenge: "As Junior Doctor, you need to organize a medical procedure tray. Each instrument has a specific two-dimensional shape that affects how it's used. Can you classify them by shape AND explain their medical purpose?",
        hint: "Think like a scientist! Rectangular scalpels have straight edges for precise cuts. Circular mirrors show reflections clearly. Each shape serves a medical function!",
        questions: [
          "Why do medical scissors have a specific two-dimensional shape design?",
          "How does the circular shape of a stethoscope help with patient examination?",
          "What makes rectangular medical charts better than circular ones for recording information?"
        ],
        answers: [
          "Scissors have angled shapes that create leverage for clean, precise cutting",
          "Circular shapes have no sharp corners, making them safe and comfortable against skin",
          "Rectangular charts provide organized rows and columns for systematic information recording"
        ],
        learningOutcome: "Alex classifies medical instruments by two-dimensional shapes and understands their scientific design using expert-level Grade 1 science skills"
      },
      social_studies: {
        setup: "Junior Doctors understand how medical rules and laws create a comprehensive healthcare system that serves the entire community!",
        activities: [
          "Study healthcare access laws - how rules ensure everyone can get medical care regardless of background",
          "Learn about medical education requirements - rules about training needed to become a doctor",
          "Understand public health laws - how medical rules protect the whole community from disease"
        ],
        challenge: "A community leader asks you to explain how medical rules and laws help create a fair and healthy society. How do these regulations benefit everyone?",
        hint: "Medical laws create systems that protect everyone! They ensure quality care, prevent discrimination, and help communities stay healthy together.",
        questions: [
          "How do medical licensing laws protect patients in our community?",
          "Why are there rules about medical research and testing new treatments?",
          "What role do healthcare laws play in creating a fair society?"
        ],
        answers: [
          "Licensing laws ensure only properly trained professionals provide medical care, protecting patient safety",
          "Research rules make sure new treatments are safe and effective before being used on patients",
          "Healthcare laws ensure equal access to medical care and prevent discrimination based on personal characteristics"
        ],
        learningOutcome: "Alex understands comprehensive healthcare rules and laws and their community impact using expert-level Grade 1 social studies skills"
      }
    },

    role4: {
      math: {
        setup: "Incredible! Alex is now an AI Medical Consultant! You use expert counting review skills to teach AI systems how to count medical data and help other students learn medical mathematics.",
        activities: [
          "Teach AI to count patient data: demonstrate counting 1-10 for vital sign measurements",
          "Help smart medical systems review counting accuracy: show AI how to count backwards from 10-1 to double-check calculations",
          "Train medical learning AI: guide systems through counting sequences for medication management"
        ],
        challenge: "The AI medical assistant needs to learn counting review for tracking patient recovery. It's confused about counting sequences. How do you teach it to count accurately?",
        hint: "Show the AI step-by-step! Demonstrate counting 1, 2, 3... up to 10, then backwards 10, 9, 8... down to 1. Practice with medical examples!",
        questions: [
          "How can AI help other students learn counting review skills in medical contexts?",
          "If the medical AI makes a counting mistake, how do you correct it using your Grade 1 skills?",
          "What makes you a good teacher for AI medical systems?"
        ],
        answers: [
          "AI can provide unlimited practice with medical counting scenarios, show visual examples, and give instant feedback",
          "Demonstrate the correct counting sequence, explain where the mistake happened, and practice the sequence together",
          "I mastered counting review skills through medical contexts, so I understand both the math and the medical applications"
        ],
        learningOutcome: "Alex teaches AI systems counting review skills and understands medical AI learning using mastery-level Grade 1 math concepts"
      },
      ela: {
        setup: "AI Medical Consultants help smart systems learn to read medical information by teaching consonant and vowel recognition in medical vocabulary!",
        activities: [
          "Teach AI to recognize medical letters: show systems how to identify vowels and consonants in words like 'PATIENT' and 'DOCTOR'",
          "Help voice-controlled medical devices understand spoken medical terms by demonstrating vowel and consonant sounds",
          "Train medical translation AI: show systems how letter patterns help translate medical terms between languages"
        ],
        challenge: "A new AI system can't distinguish between vowels and consonants in medical terminology. It's confused about the word 'HOSPITAL'. How do you teach it?",
        hint: "Break it down for the AI! H-O-S-P-I-T-A-L: vowels are O, I, A; consonants are H, S, P, T, L. Show the pattern clearly!",
        questions: [
          "How can AI help other students learn consonant and vowel sorting in medical vocabulary?",
          "What happens when medical AI systems understand letter patterns correctly?",
          "Why is it important for AI to master vowel and consonant recognition in healthcare?"
        ],
        answers: [
          "AI can provide interactive letter-sorting games, pronunciation practice, and immediate feedback on medical vocabulary",
          "They can read medical records accurately, understand spoken instructions, and communicate clearly with patients",
          "Accurate letter recognition helps AI understand medical terms precisely, ensuring patient safety and clear communication"
        ],
        learningOutcome: "Alex teaches AI systems consonant and vowel recognition in medical contexts using mastery-level Grade 1 ELA skills"
      },
      science: {
        setup: "AI Medical Consultants use advanced shape classification to teach smart systems how to recognize and analyze medical instruments and data patterns!",
        activities: [
          "Train AI to recognize medical instrument shapes: teach systems to classify surgical tools by two-dimensional shapes for inventory management",
          "Help medical imaging AI understand shape patterns: show systems how to identify circular, rectangular, and triangular features in medical scans",
          "Teach diagnostic AI about shape-based medical analysis: demonstrate how different two-dimensional shapes in medical data indicate different conditions"
        ],
        challenge: "The AI medical imaging system needs to learn shape classification for analyzing patient X-rays. It must distinguish between different two-dimensional shapes that indicate various medical conditions. How do you train it?",
        hint: "Show the AI examples! Circular shapes might indicate certain conditions, rectangular shapes others. Train it to classify shapes AND understand their medical significance!",
        questions: [
          "How does AI shape recognition improve medical diagnosis accuracy?",
          "What happens when medical AI can classify two-dimensional shapes in patient data?",
          "Why is shape classification important for AI medical systems?"
        ],
        answers: [
          "AI can spot shape patterns in medical images that humans might miss, leading to earlier and more accurate diagnoses",
          "AI can automatically analyze medical scans, organize medical instruments, and detect shape-based medical indicators",
          "Shape classification helps AI understand medical data visually, improving diagnostic capabilities and medical equipment management"
        ],
        learningOutcome: "Alex teaches AI systems medical shape classification and analysis using mastery-level Grade 1 science skills"
      },
      social_studies: {
        setup: "AI Medical Consultants help smart systems understand medical rules and laws to ensure AI healthcare applications serve communities fairly and safely!",
        activities: [
          "Teach AI about patient privacy laws: show systems how to protect medical information while providing care",
          "Help AI understand healthcare access rules: train systems to ensure equal medical care for all community members",
          "Guide AI in medical ethics: teach systems how rules and laws help create fair healthcare systems"
        ],
        challenge: "A new AI healthcare system needs to learn about medical rules and laws. It must understand how to follow regulations while helping patients. How do you teach it to balance following rules with providing care?",
        hint: "Show the AI that rules help everyone! Privacy laws protect patients, safety rules prevent harm, and access rules ensure fairness. Rules make healthcare better!",
        questions: [
          "How does AI help ensure medical rules and laws are followed consistently?",
          "What happens when AI medical systems understand healthcare regulations?",
          "Why is it important for AI to learn about rules and laws in healthcare?"
        ],
        answers: [
          "AI can monitor compliance automatically, remind healthcare workers of important rules, and ensure consistent application of medical regulations",
          "AI provides more reliable, fair, and safe healthcare services that protect patients and serve communities effectively",
          "AI systems that understand medical rules help create trustworthy healthcare technology that people feel safe using"
        ],
        learningOutcome: "Alex teaches AI systems about medical rules and laws and their community impact using mastery-level Grade 1 social studies skills"
      }
    }
  } as CareerProgression,

  // ===================================
  // TAYLOR (10th) - SPORTS AGENT PROGRESSION
  // ===================================
  taylor_10th_sports_agent: {
    role1: {
      math: {
        setup: "Welcome to CareerInc Sports Agency! You're Taylor's team helper today. Sports agents need to compare and order integers to analyze player statistics and team performance.",
        activities: [
          "Compare player scores: Player A scored +15, Player B scored -3, Player C scored +8. Order them from highest to lowest performance",
          "Analyze team statistics: Order these win/loss records from best to worst: Team X (-5), Team Y (+12), Team Z (+3)",
          "Rank tournament standings: Place teams in order based on point differentials: +25, -8, +15, -12, +3"
        ],
        challenge: "Three athletes have performance ratings: Maria (+18), James (-5), Sarah (+7). A sponsor wants to invest in the top performer. Who should you recommend and why?",
        hint: "Compare and order the integers! +18 > +7 > -5. Maria has the highest positive rating, making her the best investment choice.",
        questions: [
          "If two players have ratings of +12 and -4, which is higher and by how much?",
          "Order these contract values from smallest to largest: -$2M, +$5M, -$1M, +$8M",
          "Why do sports agents need to compare and order integers quickly?"
        ],
        answers: ["+12 is higher by 16 points", "-$2M, -$1M, +$5M, +$8M", "To make fast decisions about player values, team rankings, and investment opportunities"],
        learningOutcome: "Taylor can compare and order integers to analyze sports data and make strategic decisions using Grade 10 math skills"
      },
      ela: {
        setup: "Team helpers need to read scouting reports and sports articles! Let's practice determining the main idea of passages about athletes and team performance.",
        activities: [
          "Read a player scouting report and identify the main assessment: 'Strong defensive skills, needs work on offense...'",
          "Analyze sports news articles: 'The team struggled with injuries this season but showed resilience and teamwork' - what's the central message?",
          "Study contract negotiations: determine the main points in complex agreement documents"
        ],
        challenge: "Read this team analysis: 'The Lakers have exceptional individual talent with LeBron and Davis leading the roster. However, their inconsistent three-point shooting and defensive lapses in crucial moments have cost them several close games. The coaching staff emphasizes ball movement and defensive intensity, but execution varies between games.' What's the main idea?",
        hint: "Look for the central issue! The passage is mainly about a talented team that struggles with consistency in key areas during important moments.",
        questions: [
          "In a scouting report, how do you identify the main evaluation of a player?",
          "What's the difference between specific game statistics and overall player assessment?",
          "Why is determining main ideas crucial for sports agents?"
        ],
        answers: [
          "Look for the overall judgment that summarizes all the specific observations",
          "Statistics are specific numbers; overall assessment is the big picture evaluation",
          "It helps agents understand what clients, teams, and media really think about players and deals"
        ],
        learningOutcome: "Taylor can determine the main idea of sports-related passages and documents using Grade 10 ELA skills"
      },
      science: {
        setup: "Sports agents use scientific inquiry to evaluate athletes and improve team performance! Let's learn the process of scientific inquiry through sports analysis.",
        activities: [
          "Observe athlete performance: systematically watch training sessions and games to collect data",
          "Form hypotheses: 'If this player improves their conditioning, their fourth-quarter performance will increase'",
          "Test through controlled analysis: compare performance data before and after training changes"
        ],
        challenge: "A basketball player's free-throw percentage has dropped from 85% to 65% over the past month. Using scientific inquiry, how would you investigate and address this problem?",
        hint: "Follow the scientific process! Observe the shooting form, ask what changed, hypothesize causes (fatigue? technique? pressure?), then test solutions systematically!",
        questions: [
          "What's the first step in scientific inquiry when analyzing sports performance?",
          "How do sports agents test their hypotheses about player improvement?",
          "Why is scientific inquiry important in sports management?"
        ],
        answers: [
          "Systematic observation - carefully watching and measuring current performance",
          "Through controlled training experiments, data analysis, and performance tracking over time",
          "It provides evidence-based strategies for player development rather than relying on guesswork"
        ],
        learningOutcome: "Taylor understands the process of scientific inquiry in sports analysis and player development using Grade 10 science skills"
      },
      social_studies: {
        setup: "Sports agents work within complex government regulations! Let's learn about the purposes of government and how they affect sports business and athlete representation.",
        activities: [
          "Study sports league regulations: understand how government oversight protects athletes and ensures fair competition",
          "Learn about contract law: explore how government legal systems enable and enforce sports agreements",
          "Analyze international sports governance: examine how different governments regulate professional sports differently"
        ],
        challenge: "A young athlete wants to sign with an overseas team, but there are government regulations about international contracts and work visas. How do the purposes of government affect this sports business decision?",
        hint: "Consider government's protective role! Governments create laws to protect citizens, regulate business, and ensure fair treatment - all crucial for international sports contracts.",
        questions: [
          "How does government regulation protect professional athletes?",
          "What purposes of government are most relevant to sports business?",
          "Why do sports agents need to understand government's role in athletics?"
        ],
        answers: [
          "Through labor laws, contract enforcement, safety regulations, and anti-discrimination protections",
          "Regulation of business, protection of rights, enforcement of contracts, and ensuring fair competition",
          "To navigate legal requirements, protect clients' interests, and operate within regulatory frameworks"
        ],
        learningOutcome: "Taylor understands the purposes of government in sports regulation and athlete protection using Grade 10 social studies skills"
      }
    },

    role2: {
      math: {
        setup: "Congratulations! You're now Player Scout Taylor! Use advanced integer comparison skills to analyze complex player statistics and identify talent for teams.",
        activities: [
          "Compare multi-season performance: Order players by career trajectory using positive/negative trend integers",
          "Analyze salary cap implications: Order contract values and calculate team budget impacts using integer operations",
          "Evaluate trade scenarios: Compare and order multiple player packages using advanced integer analysis"
        ],
        challenge: "You're evaluating three players for a team trade. Player 1: +22 efficiency rating, $8M contract. Player 2: +15 efficiency, $12M contract. Player 3: +28 efficiency, $15M contract. Which offers the best value and how do you justify it mathematically?",
        hint: "Compare efficiency per dollar! Calculate ratios: Player 1 (22/8 = 2.75), Player 2 (15/12 = 1.25), Player 3 (28/15 = 1.87). Player 1 offers the best value!",
        questions: [
          "How do scouts use integer comparison to evaluate player development trajectories?",
          "Why might a scout compare players using multiple integer metrics simultaneously?",
          "How does advanced integer analysis help in complex trade negotiations?"
        ],
        answers: [
          "By comparing year-over-year improvements and decline patterns using positive and negative integers",
          "To get a complete picture of value considering performance, cost, age, and potential",
          "It provides objective mathematical justification for difficult roster decisions"
        ],
        learningOutcome: "Taylor applies advanced integer comparison to complex player evaluation and team building using sophisticated Grade 10 math skills"
      },
      ela: {
        setup: "Player Scouts need to analyze detailed scouting reports and player assessments! Practice determining main ideas in complex sports evaluation documents.",
        activities: [
          "Analyze comprehensive player profiles: identify central strengths and weaknesses across multi-page scout reports",
          "Study team chemistry reports: determine main relationship dynamics from detailed locker room assessments",
          "Review international scouting documents: find main talent themes in global player evaluation reports"
        ],
        challenge: "Read this international prospect evaluation: 'Luka demonstrates exceptional court vision and basketball IQ, consistently making passes that elevate his teammates' performance. His shooting mechanics are fundamentally sound with range extending beyond the three-point line. However, his lateral movement on defense needs improvement, and his conditioning must be enhanced for the longer NBA season. Despite these areas for development, his leadership qualities and clutch performance in pressure situations make him a franchise-altering talent.' What's the main scouting assessment?",
        hint: "Look for the overall evaluation! The report identifies a player with outstanding offensive skills and leadership who needs defensive and conditioning work but has franchise potential.",
        questions: [
          "How do scouts use main idea analysis when evaluating international players?",
          "What's the difference between specific skill assessments and overall player evaluation?",
          "Why is identifying main themes crucial for player scouting decisions?"
        ],
        answers: [
          "To understand the big picture of a player's fit and potential impact rather than getting lost in individual skills",
          "Specific skills are individual abilities; overall evaluation is the comprehensive judgment of total value",
          "Main themes guide major decisions about draft picks, trades, and long-term team building strategy"
        ],
        learningOutcome: "Taylor determines main ideas in complex player evaluation documents using advanced Grade 10 ELA skills"
      },
      science: {
        setup: "Player Scouts use advanced scientific inquiry to systematically evaluate talent and predict player success through comprehensive data analysis!",
        activities: [
          "Design player evaluation protocols: create systematic methods to assess athletic ability across multiple criteria",
          "Conduct comparative talent studies: use controlled analysis to compare prospects against successful professional players",
          "Analyze performance prediction models: apply scientific methods to forecast player development and career trajectories"
        ],
        challenge: "Two prospects have similar college statistics, but scouts disagree about their professional potential. Design a comprehensive scientific inquiry to objectively evaluate which player is more likely to succeed professionally.",
        hint: "Use systematic scientific analysis! Compare physical measurements, skill assessments, character interviews, performance under pressure, and career trajectory data!",
        questions: [
          "How do scouts use scientific inquiry to remove bias from player evaluation?",
          "What types of evidence should be collected for comprehensive talent assessment?",
          "Why is systematic scientific analysis better than intuitive scouting alone?"
        ],
        answers: [
          "By using standardized testing, measurable criteria, and data-driven comparison methods",
          "Physical measurements, skill assessments, psychological profiles, performance analytics, and character evaluation",
          "It provides objective evidence about player potential rather than relying on subjective impressions"
        ],
        learningOutcome: "Taylor applies systematic scientific inquiry to talent evaluation and player assessment using advanced Grade 10 science skills"
      },
      social_studies: {
        setup: "Player Scouts work within complex government and organizational frameworks! Use advanced understanding of government purposes to navigate international recruiting and player rights.",
        activities: [
          "Study international player eligibility: understand how different government systems affect player recruitment and development",
          "Analyze amateur vs. professional regulations: explore how government oversight protects young athletes and educational opportunities",
          "Navigate visa and work permit requirements: understand how government immigration policies affect international talent acquisition"
        ],
        challenge: "You've identified a talented 16-year-old player in Europe who wants to join an American basketball academy. Multiple government purposes are involved: education requirements, child labor protections, immigration policies, and sports regulations. How do you navigate this complex situation?",
        hint: "Consider multiple government purposes! Education laws protect the student's academics, child labor laws ensure appropriate treatment, immigration controls entry, and sports regulations govern eligibility!",
        questions: [
          "How do different government purposes affect international sports recruiting?",
          "Why do scouts need to understand government regulation of amateur athletics?",
          "How does government oversight protect young athletes from exploitation?"
        ],
        answers: [
          "Education, immigration, labor, and sports regulations all create requirements for legal international recruitment",
          "To ensure compliance with eligibility rules, educational requirements, and athlete protection laws",
          "Through age restrictions, educational mandates, contract limitations, and oversight of recruiting practices"
        ],
        learningOutcome: "Taylor understands complex government purposes in international sports recruiting and athlete protection using advanced Grade 10 social studies skills"
      }
    },

    role3: {
      math: {
        setup: "Amazing! Player Scout Taylor is now promoted to Contract Negotiator! Use expert integer comparison skills to structure complex athlete contracts and salary negotiations.",
        activities: [
          "Structure contract escalators: design salary progressions using integer sequences and performance bonuses",
          "Analyze salary cap mathematics: compare and order multiple contract scenarios to maximize team flexibility",
          "Negotiate performance incentives: create integer-based bonus structures that motivate athletes while protecting teams"
        ],
        challenge: "You're negotiating a 5-year contract worth $75M total. The athlete wants front-loaded payments (+$20M, +$18M, +$15M, +$12M, +$10M) but the team prefers back-loaded (+$10M, +$12M, +$15M, +$18M, +$20M). How do you compare these structures and find a compromise?",
        hint: "Compare cash flow impacts! Front-loaded gives athlete early security, back-loaded gives team cap flexibility. A middle structure like +$15M, +$15M, +$15M, +$15M, +$15M might work!",
        questions: [
          "How do contract negotiators use integer analysis for salary cap management?",
          "Why might performance bonuses use both positive and negative integer adjustments?",
          "How does expert integer comparison help in complex multi-party negotiations?"
        ],
        answers: [
          "To calculate exact cap impacts, compare contract values, and structure deals within financial constraints",
          "Positive bonuses reward achievement while negative adjustments (like fines) discourage unwanted behavior",
          "It provides precise mathematical justification for complex financial proposals and trade-offs"
        ],
        learningOutcome: "Taylor applies expert integer comparison to complex contract negotiations and salary cap management using mastery-level Grade 10 math skills"
      },
      ela: {
        setup: "Contract Negotiators must analyze complex legal documents and contract terms! Use expert skills to determine main ideas in sophisticated sports business agreements.",
        activities: [
          "Analyze multi-party contract documents: identify central terms and obligations across complex sports agreements",
          "Study league policy documents: determine main regulatory themes from detailed administrative guidelines",
          "Review arbitration case precedents: find main legal principles that guide contract dispute resolution"
        ],
        challenge: "Read this contract clause: 'Player shall receive base compensation of fifteen million dollars annually, with additional performance incentives based on team success, individual statistical achievements, and postseason participation. However, compensation may be reduced for conduct detrimental to team interests, failure to maintain physical conditioning standards, or violation of league policies. All incentive calculations shall be verified by independent accounting and subject to league salary cap regulations.' What's the main contractual framework?",
        hint: "Look for the central structure! The clause establishes a base salary with upward potential through performance and downward risk through violations, all subject to external oversight.",
        questions: [
          "How do contract negotiators use main idea analysis for complex sports agreements?",
          "What's the difference between specific contract terms and overall deal structure?",
          "Why is identifying main themes crucial for successful contract negotiations?"
        ],
        answers: [
          "To understand the fundamental deal framework without getting lost in detailed legal language",
          "Specific terms are individual clauses; overall structure is the basic relationship and risk allocation",
          "Main themes guide negotiation strategy and help parties focus on the most important deal elements"
        ],
        learningOutcome: "Taylor analyzes complex sports contracts and identifies main legal themes using expert-level Grade 10 ELA skills"
      },
      science: {
        setup: "Contract Negotiators use expert scientific inquiry to analyze market data and negotiate evidence-based athlete compensation packages!",
        activities: [
          "Research market value studies: systematically analyze comparable player contracts and performance data",
          "Design compensation research protocols: create scientific methods to evaluate fair market value for athletic talent",
          "Conduct salary arbitration analysis: apply scientific principles to build evidence-based cases for contract disputes"
        ],
        challenge: "An athlete claims they deserve a $25M annual salary based on their performance, but team executives argue $18M is fair market value. Design a comprehensive scientific inquiry to determine appropriate compensation.",
        hint: "Use systematic market analysis! Compare performance metrics, contract benchmarks, revenue generation, and market factors to build an evidence-based compensation model!",
        questions: [
          "How do contract negotiators use scientific inquiry to determine fair athlete compensation?",
          "What types of evidence support market value arguments in salary negotiations?",
          "Why is systematic market research better than agent intuition in contract talks?"
        ],
        answers: [
          "By systematically analyzing comparable contracts, performance data, revenue impact, and market conditions",
          "Performance statistics, revenue generation data, comparable contracts, market trends, and economic impact analysis",
          "It provides objective evidence that all parties can evaluate rather than relying on subjective opinions"
        ],
        learningOutcome: "Taylor applies comprehensive scientific inquiry to market analysis and contract valuation using expert-level Grade 10 science skills"
      },
      social_studies: {
        setup: "Contract Negotiators operate within sophisticated government and legal frameworks! Use expert knowledge of government purposes to navigate complex sports business regulation.",
        activities: [
          "Study antitrust law applications: understand how government competition policies affect sports business practices",
          "Analyze collective bargaining frameworks: explore how government labor law shapes athlete union negotiations",
          "Navigate international contract regulations: understand how different government systems affect global sports business"
        ],
        challenge: "You're negotiating a contract that involves salary cap rules (government economic regulation), player safety requirements (government worker protection), international transfer rules (government immigration policy), and tax implications (government revenue policy). How do multiple government purposes create this complex regulatory environment?",
        hint: "Recognize overlapping government functions! Economic regulation ensures fair competition, worker protection ensures safety, immigration controls movement, and taxation generates revenue - all affecting sports contracts!",
        questions: [
          "How do different government purposes create the complex legal environment for sports contracts?",
          "Why do contract negotiators need deep understanding of government regulatory frameworks?",
          "How does government oversight ensure fair treatment in professional sports business?"
        ],
        answers: [
          "Economic, labor, immigration, and tax policies all intersect to create comprehensive regulation of sports business",
          "To ensure contract compliance, protect client interests, and navigate complex legal requirements successfully",
          "Through competition rules, labor protections, contract enforcement, and oversight of business practices"
        ],
        learningOutcome: "Taylor understands sophisticated government purposes in sports business regulation using expert-level Grade 10 social studies skills"
      }
    },

    role4: {
      math: {
        setup: "Incredible! Taylor is now an AI Sports Scout! Use mastery-level integer comparison skills to teach AI systems how to analyze sports data and help other students learn through athletic analytics.",
        activities: [
          "Teach AI statistical analysis: show systems how to compare and order player performance metrics accurately",
          "Help sports analytics AI understand data relationships: demonstrate how integer operations reveal performance patterns",
          "Train predictive sports AI: guide systems in using integer comparison for talent evaluation and team building"
        ],
        challenge: "The AI sports analytics system needs to learn how to compare player efficiency across different positions and seasons. It's confused about adjusting raw statistics for context. How do you teach it to make fair comparisons?",
        hint: "Show the AI systematic comparison methods! Demonstrate how to normalize statistics for playing time, opponent strength, and positional differences to make meaningful comparisons!",
        questions: [
          "How can AI help other students learn integer comparison through sports analytics?",
          "If the sports AI makes incorrect statistical comparisons, how do you correct it using your Grade 10 skills?",
          "What makes you an effective teacher for AI sports analysis systems?"
        ],
        answers: [
          "AI can generate unlimited statistical scenarios, provide real-time data analysis, and create interactive sports math learning experiences",
          "Analyze the comparison methodology, identify context factors the AI missed, and demonstrate proper statistical adjustment techniques",
          "I understand both advanced mathematics and sports analysis, so I can teach AI to combine them for accurate insights"
        ],
        learningOutcome: "Taylor teaches AI systems advanced sports analytics and integer comparison using mastery-level Grade 10 math skills"
      },
      ela: {
        setup: "AI Sports Scouts help smart systems analyze sports media and player communications by teaching advanced main idea recognition in sports contexts!",
        activities: [
          "Teach AI to analyze sports journalism: show systems how to identify main themes in game coverage and player interviews",
          "Help scouting AI understand player evaluation reports: demonstrate how to find central assessments in complex scouting documents",
          "Train sports communication AI: guide AI in recognizing main topics in team communications and media coverage"
        ],
        challenge: "A new AI system needs to analyze thousands of sports articles to identify main trends in player development and team building. It's overwhelmed by detailed statistics and individual game reports. How do you teach it to find main themes efficiently?",
        hint: "Show the AI systematic analysis! Teach it to look for recurring themes, overall patterns, and central conclusions rather than getting lost in game-by-game details!",
        questions: [
          "How can AI help other students develop main idea skills through sports analysis?",
          "What happens when sports AI systems can identify main themes in athletic coverage?",
          "Why is main idea recognition crucial for AI sports analysis systems?"
        ],
        answers: [
          "AI can create sports reading comprehension exercises, analyze student sports writing, and provide context-rich practice",
          "They can provide better insights about teams and players, identify important trends, and improve sports decision-making",
          "It helps AI understand what's really important in sports information rather than getting lost in statistical details"
        ],
        learningOutcome: "Taylor teaches AI systems main idea analysis in sports contexts using mastery-level Grade 10 ELA skills"
      },
      science: {
        setup: "AI Sports Scouts use advanced scientific inquiry to teach smart systems how to conduct sports research and improve athletic performance through systematic AI-powered analysis!",
        activities: [
          "Train AI research systems: teach AI how to conduct systematic sports performance studies and data collection",
          "Help AI understand sports science methodology: show systems how to design controlled studies of athletic performance",
          "Guide AI in sports analytics: demonstrate how to interpret performance data and draw valid conclusions about athletes"
        ],
        challenge: "The AI sports research system needs to learn scientific inquiry for automatically identifying performance improvement opportunities for athletes. It can collect data but doesn't know how to form hypotheses or design training experiments. How do you train it?",
        hint: "Teach the AI the complete scientific process! Show it how to observe performance patterns, form testable hypotheses about improvement, design controlled training studies, and analyze results systematically!",
        questions: [
          "How does AI scientific inquiry improve sports performance analysis speed and accuracy?",
          "What happens when AI systems can conduct their own sports research studies?",
          "Why is scientific inquiry important for AI sports development systems?"
        ],
        answers: [
          "AI can analyze vast amounts of performance data quickly, identify optimization opportunities faster, and discover patterns coaches might miss",
          "They can continuously improve training methods, adapt to athlete needs automatically, and optimize performance in real-time",
          "It ensures AI makes evidence-based training recommendations rather than random suggestions, leading to better athletic outcomes"
        ],
        learningOutcome: "Taylor teaches AI systems scientific inquiry for sports research and performance analysis using mastery-level Grade 10 science skills"
      },
      social_studies: {
        setup: "AI Sports Scouts help smart systems understand sports governance and global athletic systems by teaching advanced government purpose analysis!",
        activities: [
          "Teach AI sports governance systems: show AI how government purposes shape international sports regulation and competition",
          "Help AI understand athletic policy frameworks: train systems to recognize how different government approaches affect sports development",
          "Guide AI in sports economics: demonstrate how government purposes influence professional sports business and athlete rights"
        ],
        challenge: "A new AI sports management system needs to understand how government regulation affects international sports competitions and athlete mobility. How do you train it to navigate complex government purposes across different countries?",
        hint: "Show the AI how government purposes vary globally! Teach it that different countries prioritize economic development, citizen welfare, international prestige, and business regulation differently in sports!",
        questions: [
          "How does AI understanding of government purposes improve international sports management?",
          "What happens when AI systems understand global sports governance frameworks?",
          "Why is government purpose analysis important for AI sports business systems?"
        ],
        answers: [
          "AI can better navigate international regulations, understand policy differences, and help athletes and teams comply with various national requirements",
          "They can facilitate international competitions, manage athlete transfers, and ensure compliance with diverse regulatory frameworks",
          "It helps AI understand why sports regulations exist and how to work within government frameworks rather than against them"
        ],
        learningOutcome: "Taylor teaches AI systems government purpose analysis for international sports management using mastery-level Grade 10 social studies skills"
      }
    }
  } as CareerProgression,

  // ===================================
  // JORDAN (7th) - GAME DESIGNER PROGRESSION
  // ===================================
  jordan_7th_game_designer: {
    role1: {
      math: {
        setup: "Welcome to CareerInc Game Studio! You're Jordan's game tester helper today. Game designers need to understand integers to create scoring systems and game mechanics.",
        activities: [
          "Learn about positive integers in game scores: +10 points for collecting coins, +50 for defeating enemies",
          "Understand negative integers in game mechanics: -5 health when hit by enemies, -20 points for wrong moves",
          "Practice with zero as a starting point: games often begin at 0 points, 0 lives remaining means game over"
        ],
        challenge: "The game character has 15 health points, takes 8 damage, then finds a health potion worth +3. What's the final health?",
        hint: "Use your understanding of integers! Start with +15, subtract 8 (15-8=7), then add 3 (7+3=10). Final health: 10 points!",
        questions: [
          "If a player has -5 points and earns +12 points, what's their new score?",
          "In game development, what does the integer 0 usually represent?",
          "Why do game designers use negative integers?"
        ],
        answers: ["+7 points", "Starting point, neutral state, or empty/nothing", "To represent loss, damage, penalties, or decreases in game values"],
        learningOutcome: "Jordan understands integers and their applications in game design using Grade 7 math skills"
      },
      ela: {
        setup: "Game testers need to read game instructions and reviews! Let's practice determining the main idea of passages about games and player feedback.",
        activities: [
          "Read a game review passage and identify the main idea: 'This puzzle game is challenging but fair...'",
          "Analyze player feedback: 'The graphics are beautiful, controls are smooth, but the story needs work' - what's the main point?",
          "Study game instructions: determine the main idea of rule explanations for new players"
        ],
        challenge: "Read this game design document passage: 'Our racing game features realistic physics, detailed car customization, multiple tracks, and weather effects. Players can modify engines, paint jobs, and handling.' What's the main idea?",
        hint: "Look for the central concept! The passage is mainly about the racing game's customization features and realistic elements that make it engaging.",
        questions: [
          "In a passage about game controls, how do you find the main idea?",
          "What's the difference between a detail and the main idea in game reviews?",
          "Why is determining main ideas important for game developers?"
        ],
        answers: [
          "Look for the central topic that all the control explanations support",
          "Details are specific examples; main idea is the overall point or theme",
          "It helps developers understand what players really think about their games"
        ],
        learningOutcome: "Jordan can determine the main idea of game-related passages using Grade 7 ELA skills"
      },
      science: {
        setup: "Game designers use scientific inquiry to test and improve their games! Let's learn the process of scientific inquiry through game development.",
        activities: [
          "Observe player behavior: watch how gamers interact with different game elements",
          "Form hypotheses: 'If we make the controls simpler, players will enjoy the game more'",
          "Test through playtesting: gather data on player reactions and game performance"
        ],
        challenge: "A game designer notices players keep getting stuck at level 3. Using scientific inquiry, how would you investigate and solve this problem?",
        hint: "Follow the scientific process! Observe the problem, ask why players get stuck, hypothesize solutions (easier enemies? better instructions?), then test changes!",
        questions: [
          "What's the first step in scientific inquiry when designing games?",
          "How do game developers test their hypotheses?",
          "Why is scientific inquiry important in game development?"
        ],
        answers: [
          "Observation - watching how players interact with the game",
          "Through playtesting, gathering player feedback, and analyzing game data",
          "It helps developers make evidence-based improvements rather than guessing what players want"
        ],
        learningOutcome: "Jordan understands the process of scientific inquiry in game development using Grade 7 science skills"
      },
      social_studies: {
        setup: "Game designers create worlds with geography! Let's learn to identify lines of latitude and longitude to build realistic game maps and worlds.",
        activities: [
          "Study world maps for game inspiration: identify how latitude lines run east-west (horizontal)",
          "Learn longitude lines run north-south (vertical) to create accurate game world coordinates",
          "Practice using coordinates to place game elements: cities at specific latitude/longitude intersections"
        ],
        challenge: "You're designing a global adventure game. The treasure is hidden at 40°N latitude, 74°W longitude. Using a world map, where would this treasure be located?",
        hint: "Find where 40°N (latitude line) intersects with 74°W (longitude line). This coordinates system helps create realistic game geography!",
        questions: [
          "Which direction do latitude lines run on maps and in games?",
          "How do game developers use longitude and latitude for world-building?",
          "Why is understanding global coordinates important for game designers?"
        ],
        answers: [
          "East to west (horizontally across the map)",
          "To create realistic world layouts, place cities accurately, and build believable geography",
          "It helps create immersive, realistic game worlds that players can relate to real geography"
        ],
        learningOutcome: "Jordan can identify lines of latitude and longitude for game world design using Grade 7 social studies skills"
      }
    },

    role2: {
      math: {
        setup: "Congratulations! You're now Level Designer Jordan! Use advanced integer understanding to create complex game scoring systems and mathematical challenges.",
        activities: [
          "Design integer-based puzzle mechanics: players must balance positive and negative numbers to solve levels",
          "Create scoring algorithms: combine multiple integer operations for complex point calculations",
          "Build difficulty progression using integers: each level increases integer complexity mathematically"
        ],
        challenge: "Design a math puzzle level where players start with 0 points, can gain +15 for correct answers, lose -8 for wrong answers, and need exactly +50 to win. How many moves should you allow?",
        hint: "Think strategically about integers! If perfect play gives +15 each time, they need 4 correct answers (15×4=60), but they only need 50, so allow room for some mistakes!",
        questions: [
          "How do integer operations help create challenging game mechanics?",
          "Why might a level designer use both positive and negative integers?",
          "How can understanding integers help balance game difficulty?"
        ],
        answers: [
          "They create mathematical relationships that require strategic thinking and problem-solving",
          "To create risk/reward systems where players can gain or lose progress",
          "By calculating exact values needed for fair but challenging gameplay progression"
        ],
        learningOutcome: "Jordan applies advanced integer understanding to create complex game mechanics using sophisticated Grade 7 math skills"
      },
      ela: {
        setup: "Level Designers need to analyze complex game narratives! Practice determining main ideas in longer passages about game stories and world-building.",
        activities: [
          "Analyze multi-paragraph game lore: identify main themes across several connected story passages",
          "Study player dialogue trees: determine the main purpose of conversation branches in games",
          "Review game narrative documents: find central story elements that drive level design decisions"
        ],
        challenge: "Read this game world description: 'The kingdom of Eldara has suffered through three wars, leaving its people divided. Northern clans value honor and tradition, while southern merchants prioritize trade and innovation. Ancient magic still flows through sacred groves, but technology advances in the cities. Players must unite these opposing forces against a common threat.' What's the main idea?",
        hint: "Look for the overarching theme! The passage describes a divided kingdom where players must bring together different groups with conflicting values.",
        questions: [
          "How do level designers use main ideas when creating game narratives?",
          "What's the difference between plot details and main story themes?",
          "Why is identifying main ideas crucial for game story development?"
        ],
        answers: [
          "Main ideas guide overall level design and ensure all game elements support the central story",
          "Plot details are specific events; main themes are the underlying messages or concepts",
          "It ensures all game elements work together to deliver a coherent, engaging experience"
        ],
        learningOutcome: "Jordan determines main ideas in complex game narratives and design documents using advanced Grade 7 ELA skills"
      },
      science: {
        setup: "Level Designers use advanced scientific inquiry to test game balance and player engagement through systematic experimentation!",
        activities: [
          "Design controlled experiments: test different level layouts with separate player groups",
          "Collect quantitative data: measure completion times, failure rates, and player satisfaction scores",
          "Analyze results systematically: use scientific methods to interpret playtesting data and draw conclusions"
        ],
        challenge: "Players report that Level 5 is too difficult, but you're not sure why. Design a scientific inquiry process to identify and fix the problem.",
        hint: "Use the full scientific method! Observe player behavior, form specific hypotheses about difficulty causes, design controlled tests, and analyze data to find solutions!",
        questions: [
          "How do level designers use controlled experiments in game development?",
          "What types of data should be collected during game testing?",
          "Why is systematic scientific inquiry better than random changes?"
        ],
        answers: [
          "By testing one variable at a time (like enemy count or jump distance) to see what affects player experience",
          "Completion rates, time spent, error frequency, player feedback, and engagement metrics",
          "It provides reliable evidence about what actually improves games rather than guessing"
        ],
        learningOutcome: "Jordan applies systematic scientific inquiry to game development and testing using advanced Grade 7 science skills"
      },
      social_studies: {
        setup: "Level Designers create game worlds with complex geography! Use advanced latitude and longitude knowledge to build detailed, multi-region game environments.",
        activities: [
          "Design interconnected game regions using coordinate systems: place cities, landmarks, and travel routes logically",
          "Create climate-based level variety: use latitude knowledge to design appropriate environments (tropical, temperate, arctic)",
          "Build realistic travel systems: calculate distances between coordinates for travel time and resource management"
        ],
        challenge: "You're designing a global strategy game with cities at: London (51°N, 0°W), Tokyo (35°N, 139°E), and Sydney (33°S, 151°E). How would understanding these coordinates help you design realistic trade routes and climate effects?",
        hint: "Use coordinate knowledge strategically! Latitude affects climate (London is cold, Sydney is south hemisphere opposite seasons). Longitude affects time zones and travel distances!",
        questions: [
          "How do level designers use latitude and longitude for world-building realism?",
          "Why might a game world include multiple coordinate zones?",
          "How does understanding global coordinates improve game design quality?"
        ],
        answers: [
          "To create believable climates, realistic travel times, and geographically logical world layouts",
          "To provide variety in environments, cultures, and gameplay challenges across different regions",
          "It helps create immersive worlds that feel authentic and educationally valuable to players"
        ],
        learningOutcome: "Jordan uses advanced coordinate systems and geographic knowledge for complex game world design using sophisticated Grade 7 social studies skills"
      }
    },

    role3: {
      math: {
        setup: "Amazing! Level Designer Jordan is now promoted to Character Creator! Use expert integer understanding to design character stats, abilities, and progression systems.",
        activities: [
          "Create character attribute systems: design strength, intelligence, and agility using positive integer scales",
          "Build character progression algorithms: calculate experience points, level-ups, and stat increases using integer mathematics",
          "Design balanced character abilities: use negative integers for costs and cooldowns, positive for benefits"
        ],
        challenge: "Design a character progression system where players start at level 1 with 10 base stats, gain +3 stats per level, but must spend -2 stats to unlock new abilities. What's the optimal strategy for level 10?",
        hint: "Use expert integer calculation! At level 10: base 10 + (9 levels × 3 points) = 37 total stats. Abilities cost 2 each, so plan carefully!",
        questions: [
          "How do character creators use integer mathematics for game balance?",
          "Why might character abilities have both positive and negative integer effects?",
          "How does understanding integers help create fair character progression?"
        ],
        answers: [
          "To create precise, predictable systems where every stat point and ability has calculated value",
          "To create meaningful choices where powerful abilities come with costs or limitations",
          "By ensuring character growth is mathematically balanced and provides consistent advancement"
        ],
        learningOutcome: "Jordan applies expert integer understanding to character design and game balance using mastery-level Grade 7 math skills"
      },
      ela: {
        setup: "Character Creators must analyze complex character narratives and backstories! Use expert skills to determine main ideas in character development documents.",
        activities: [
          "Analyze character biography documents: identify core personality traits and motivations from detailed backstories",
          "Study character dialogue scripts: determine main personality themes across multiple conversation scenarios",
          "Review character development arcs: find central growth themes that drive character progression through the game"
        ],
        challenge: "Read this character profile: 'Captain Maya started as a rebellious street thief who lost her family in the war. She learned leadership through hardship, developed tactical skills in underground resistance, and now struggles between her desire for revenge and her duty to protect others. Her crew looks up to her, but she questions whether she deserves their trust.' What's the character's main internal conflict?",
        hint: "Look for the central tension! Maya's main struggle is between her personal desire for revenge and her responsibility as a leader who protects others.",
        questions: [
          "How do character creators use main idea analysis for character development?",
          "What's the difference between character details and core character themes?",
          "Why is identifying main character motivations crucial for game narratives?"
        ],
        answers: [
          "To ensure all character actions, dialogue, and development support the central character concept",
          "Details are specific traits or events; themes are the underlying drives and conflicts that define the character",
          "Main motivations guide how characters behave in different situations, making them feel consistent and believable"
        ],
        learningOutcome: "Jordan analyzes complex character narratives and identifies main themes using expert-level Grade 7 ELA skills"
      },
      science: {
        setup: "Character Creators use expert scientific inquiry to test character designs and player attachment through comprehensive research methodologies!",
        activities: [
          "Design character testing protocols: create systematic methods to measure player engagement with different character types",
          "Conduct advanced player research: use multiple data collection methods to understand character appeal",
          "Analyze character performance data: apply scientific analysis to determine which character traits create player connection"
        ],
        challenge: "Players prefer Character A over Character B, but you don't know why. Design a comprehensive scientific inquiry to understand character appeal and improve future designs.",
        hint: "Use advanced scientific methods! Survey players about preferences, observe gameplay behavior, test character variations, and analyze data to find patterns!",
        questions: [
          "How do character creators use scientific inquiry to improve character design?",
          "What kinds of evidence help character creators make design decisions?",
          "Why is systematic character research better than designer intuition alone?"
        ],
        answers: [
          "By testing character concepts with players, measuring engagement, and using data to refine designs",
          "Player feedback surveys, gameplay analytics, emotional response data, and comparative testing results",
          "It reveals what actually appeals to players rather than what designers think should appeal to them"
        ],
        learningOutcome: "Jordan applies comprehensive scientific inquiry to character design research using expert-level Grade 7 science skills"
      },
      social_studies: {
        setup: "Character Creators design characters from diverse global backgrounds! Use expert geographic knowledge to create authentic characters with realistic cultural and regional influences.",
        activities: [
          "Research character origin locations: use latitude and longitude to understand how geography shapes character backgrounds",
          "Design culturally authentic characters: apply geographic knowledge to create believable regional influences on character traits",
          "Create character migration stories: use coordinate understanding to build realistic character travel and origin narratives"
        ],
        challenge: "You're creating a character who grew up in the Amazon rainforest (0°S, 60°W) but now lives in northern Canada (65°N, 110°W). How would you use geographic knowledge to make this character's background authentic and compelling?",
        hint: "Use expert geographic understanding! The massive climate difference (equatorial rainforest to arctic) would create fascinating cultural adaptation challenges and character depth!",
        questions: [
          "How do character creators use geographic knowledge for authentic character backgrounds?",
          "Why is understanding global coordinates important for character cultural authenticity?",
          "How does geographic expertise improve character design quality?"
        ],
        answers: [
          "To create believable cultural traits, environmental adaptations, and realistic character origins",
          "It ensures character backgrounds reflect real geographic and cultural influences accurately",
          "It helps create characters that feel authentic and educationally valuable while respecting cultural diversity"
        ],
        learningOutcome: "Jordan uses expert geographic knowledge to create culturally authentic, globally-inspired characters using mastery-level Grade 7 social studies skills"
      }
    },

    role4: {
      math: {
        setup: "Incredible! Jordan is now an AI Game Master! Use mastery-level integer understanding to teach AI systems how to create mathematical game mechanics and help other students learn through gaming.",
        activities: [
          "Teach AI integer game design: show systems how to create balanced scoring and progression systems",
          "Help game AI understand mathematical relationships: demonstrate how integer operations create engaging gameplay",
          "Train educational game AI: guide systems in using integers to create learning-focused game mechanics"
        ],
        challenge: "The AI game system needs to learn how to create fair but challenging integer-based puzzles for educational games. It's confused about balancing positive and negative values. How do you teach it?",
        hint: "Show the AI systematic approaches! Demonstrate how balanced integer problems require strategic thinking while remaining solvable through mathematical reasoning!",
        questions: [
          "How can AI help other students learn integer concepts through game design?",
          "If the game AI creates unbalanced integer mechanics, how do you correct it using your Grade 7 skills?",
          "What makes you an effective teacher for AI game systems?"
        ],
        answers: [
          "AI can generate infinite integer-based challenges, adapt difficulty automatically, and provide immediate feedback on mathematical reasoning",
          "Analyze the mathematical relationships, show why the system is unbalanced, and demonstrate how to recalculate for fairness",
          "I understand both integer mathematics and game design principles, so I can teach AI to combine them effectively"
        ],
        learningOutcome: "Jordan teaches AI systems integer-based game design and understands educational gaming AI using mastery-level Grade 7 math skills"
      },
      ela: {
        setup: "AI Game Masters help smart systems analyze game narratives and player communications by teaching advanced main idea recognition in gaming contexts!",
        activities: [
          "Teach AI to analyze player feedback: show systems how to identify main concerns in game reviews and comments",
          "Help narrative AI understand story structure: demonstrate how to find central themes in complex game narratives",
          "Train dialogue AI systems: guide AI in recognizing main conversational topics in multiplayer game chat"
        ],
        challenge: "A new AI system needs to analyze thousands of player reviews to identify the main issues with a game. It's overwhelmed by all the details. How do you teach it to find main ideas efficiently?",
        hint: "Show the AI systematic analysis! Teach it to look for repeated themes, central complaints, and overall patterns rather than getting lost in individual details!",
        questions: [
          "How can AI help other students develop main idea skills through gaming?",
          "What happens when game AI systems can identify main ideas in player communication?",
          "Why is main idea recognition crucial for AI game systems?"
        ],
        answers: [
          "AI can create reading comprehension games, analyze student writing for main themes, and provide targeted practice",
          "They can respond to player needs more effectively, improve games based on feedback, and facilitate better communication",
          "It helps AI understand what players actually want and need, leading to better game experiences and educational outcomes"
        ],
        learningOutcome: "Jordan teaches AI systems main idea analysis in gaming contexts using mastery-level Grade 7 ELA skills"
      },
      science: {
        setup: "AI Game Masters use advanced scientific inquiry to teach smart systems how to research, test, and improve games through systematic AI-powered experimentation!",
        activities: [
          "Train AI research systems: teach AI how to conduct systematic game testing and data collection",
          "Help AI understand experimental design: show systems how to create controlled tests for game mechanics",
          "Guide AI in scientific analysis: demonstrate how to interpret game testing data and draw valid conclusions"
        ],
        challenge: "The AI game testing system needs to learn scientific inquiry for automatically improving game design. It can collect data but doesn't know how to form hypotheses or design experiments. How do you train it?",
        hint: "Teach the AI the complete scientific process! Show it how to observe patterns, form testable hypotheses, design controlled experiments, and analyze results systematically!",
        questions: [
          "How does AI scientific inquiry improve game development speed and quality?",
          "What happens when AI systems can conduct their own game research?",
          "Why is scientific inquiry important for AI game development systems?"
        ],
        answers: [
          "AI can test thousands of game variations quickly, identify optimal designs faster, and discover patterns humans might miss",
          "They can continuously improve games automatically, adapt to player behavior, and optimize experiences in real-time",
          "It ensures AI makes evidence-based game improvements rather than random changes, leading to better player experiences"
        ],
        learningOutcome: "Jordan teaches AI systems scientific inquiry for game development research using mastery-level Grade 7 science skills"
      },
      social_studies: {
        setup: "AI Game Masters help smart systems create globally diverse, geographically accurate games by teaching advanced coordinate systems and cultural geography!",
        activities: [
          "Teach AI global coordinate systems: show AI how to use latitude and longitude for realistic game world generation",
          "Help AI understand cultural geography: train systems to create authentic regional characters and environments",
          "Guide AI in educational geography: demonstrate how to use coordinate knowledge for location-based learning games"
        ],
        challenge: "A new AI world-building system needs to create educational geography games that teach players about global coordinates and cultural diversity. How do you train it to combine accurate geography with engaging gameplay?",
        hint: "Show the AI how geography knowledge enhances gaming! Teach it to use real coordinates for authentic environments while creating engaging challenges that teach players about global diversity!",
        questions: [
          "How does AI geographic knowledge improve educational game quality?",
          "What happens when AI systems understand global coordinate systems for game design?",
          "Why is geographic accuracy important for AI educational game systems?"
        ],
        answers: [
          "AI can create more authentic, educational game worlds that teach real geography while entertaining players",
          "They can generate realistic environments, accurate cultural representations, and location-based educational content",
          "It helps create games that are both fun and educationally valuable, teaching players real knowledge about the world"
        ],
        learningOutcome: "Jordan teaches AI systems geographic knowledge and global coordinate systems for educational game design using mastery-level Grade 7 social studies skills"
      }
    }
  } as CareerProgression,
};

// Utility function to get lesson content for a specific user, role, and subject
export function getDemoLessonContent(
  userId: string,
  career: string,
  role: number,
  subject: string
): LessonActivity | null {
  // userId already contains the career (e.g., 'sam_k_chef'), so just use userId directly
  const userKey = userId as keyof typeof DEMO_LESSON_CONTENT;
  const roleKey = `role${role}` as keyof CareerProgression;

  console.log(`🔍 getDemoLessonContent: userKey=${userKey}, roleKey=${roleKey}, subject=${subject}`);
  console.log(`📋 Available keys:`, Object.keys(DEMO_LESSON_CONTENT));

  if (!DEMO_LESSON_CONTENT[userKey]) {
    console.log(`❌ No content found for userKey: ${userKey}`);
    return null;
  }

  const careerContent = DEMO_LESSON_CONTENT[userKey];
  console.log(`📚 Career content found:`, !!careerContent);
  console.log(`🔑 Available role keys:`, careerContent ? Object.keys(careerContent) : 'none');

  if (!careerContent[roleKey]) {
    console.log(`❌ No content found for roleKey: ${roleKey}`);
    return null;
  }

  const roleContent = careerContent[roleKey];
  console.log(`🎯 Role content found:`, !!roleContent);
  console.log(`📝 Available subject keys:`, roleContent ? Object.keys(roleContent) : 'none');

  const subjectKey = subject.toLowerCase().replace(' ', '_') as keyof RoleContent;
  console.log(`🔍 Looking for subjectKey: ${subjectKey}`);

  const finalContent = roleContent[subjectKey];
  console.log(`✅ Final content found:`, !!finalContent);

  return finalContent || null;
}

// Function to get all available roles for a tier
export function getRolesForTier(tier: string): number[] {
  switch (tier) {
    case 'select': return [1];
    case 'premium': return [1, 2];
    case 'booster': return [1, 2, 3];
    case 'aifirst': return [1, 2, 3, 4];
    default: return [1];
  }
}