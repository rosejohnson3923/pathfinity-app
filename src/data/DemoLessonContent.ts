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
    // TODO: Implement Alex's Doctor progression
    // role1_medical_assistant, role2_nurse_helper, role3_junior_doctor, role4_ai_medical_consultant
  } as CareerProgression,

  // ===================================
  // TAYLOR (10th) - SPORTS TALENT AGENT PROGRESSION
  // ===================================
  taylor_10th_sports_agent: {
    // TODO: Implement Taylor's Sports Agent progression
    // role1_team_helper, role2_player_scout, role3_contract_negotiator, role4_ai_sports_analyst
  } as CareerProgression,

  // ===================================
  // JORDAN (12th) - GAME DESIGNER PROGRESSION
  // ===================================
  jordan_12th_game_designer: {
    // TODO: Implement Jordan's Game Designer progression
    // role1_game_tester, role2_level_designer, role3_character_creator, role4_ai_game_master
  } as CareerProgression
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