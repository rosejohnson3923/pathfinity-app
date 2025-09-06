# Career Database Schema & Initial Content

## Database Schema

### 1. Careers Table
**File:** `database/schemas/careers.sql`

```sql
CREATE TABLE careers (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  department_id VARCHAR(50) NOT NULL,
  min_grade INTEGER NOT NULL,
  max_grade INTEGER NOT NULL,
  difficulty_level INTEGER NOT NULL, -- 1-5 scale
  description_short TEXT NOT NULL,
  description_detailed TEXT,
  skills_required JSON, -- array of skill areas
  real_world_tasks JSON, -- examples of what this career does
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (department_id) REFERENCES departments(id)
);

CREATE INDEX idx_careers_grade_range ON careers (min_grade, max_grade);
CREATE INDEX idx_careers_department ON careers (department_id);
```

### 2. Departments Table
**File:** `database/schemas/departments.sql`

```sql
CREATE TABLE departments (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(10) NOT NULL,
  color VARCHAR(7) NOT NULL, -- hex color
  grade_band VARCHAR(20) NOT NULL, -- 'prek-5', '6-8', '9-12'
  display_order INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. Career Scenarios Table
**File:** `database/schemas/career_scenarios.sql`

```sql
CREATE TABLE career_scenarios (
  id VARCHAR(50) PRIMARY KEY,
  career_id VARCHAR(50) NOT NULL,
  scenario_title VARCHAR(200) NOT NULL,
  scenario_description TEXT NOT NULL,
  task_objective TEXT NOT NULL,
  primary_subject VARCHAR(50) NOT NULL, -- main subject focus
  secondary_subjects JSON, -- array of additional subjects integrated
  skill_applications JSON, -- how each subject's skills are applied
  grade_level INTEGER NOT NULL,
  success_criteria JSON, -- what constitutes completion
  difficulty_adjustments JSON, -- how to make easier/harder
  estimated_duration INTEGER, -- minutes
  cross_subject_connections TEXT, -- how subjects connect in this scenario
  real_world_relevance TEXT, -- why this combination matters in the career
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (career_id) REFERENCES careers(id)
);

CREATE INDEX idx_scenarios_career_subject ON career_scenarios (career_id, primary_subject);
CREATE INDEX idx_scenarios_grade ON career_scenarios (grade_level);
CREATE INDEX idx_scenarios_multi_subject ON career_scenarios USING GIN (secondary_subjects);
```

## Multi-Subject Scenario Examples

### Elementary Cross-Subject Scenarios
**File:** `database/seeds/scenarios_elementary_multi.js`

```javascript
export const elementaryMultiSubjectScenarios = [
  // Chef scenario integrating Math + Science + ELA
  {
    career_id: 'chef',
    scenario_title: 'The Great Recipe Rescue',
    scenario_description: 'Chef Maria\'s recipe book got wet in the rain! Help her recreate her famous apple pie recipe using math, science, and reading skills.',
    task_objective: 'Recreate the apple pie recipe by reading clues, calculating ingredient amounts, and understanding why each ingredient is important.',
    primary_subject: 'math',
    secondary_subjects: ['science', 'ela'],
    skill_applications: {
      'math': {
        skill: 'adding-fractions',
        application: 'Scale recipe ingredients from 8 servings to 12 servings',
        real_world_context: 'Restaurant needs to serve more customers than expected'
      },
      'science': {
        skill: 'states-of-matter',
        application: 'Understand why butter must be room temperature and how heat changes ingredients',
        real_world_context: 'Proper ingredient preparation affects cooking success'
      },
      'ela': {
        skill: 'reading-comprehension',
        application: 'Read and interpret recipe instructions and cooking terminology',
        real_world_context: 'Following directions precisely is critical in professional cooking'
      }
    },
    grade_level: 4,
    success_criteria: {
      math_accuracy: 0.8,
      science_understanding: 0.75,
      ela_comprehension: 0.8,
      overall_completion: true
    },
    cross_subject_connections: 'Students see how math (measurements) connects to science (chemical reactions) and ELA (following complex instructions) in real cooking.',
    real_world_relevance: 'Professional chefs must be skilled in precise measurements, understand food science, and communicate clearly with kitchen staff.'
  },
  
  // Veterinarian scenario integrating Math + Science + ELA
  {
    career_id: 'veterinarian',
    scenario_title: 'Animal Health Detective',
    scenario_description: 'Dr. Kim needs help analyzing data about sick pets in the neighborhood to find patterns and communicate findings to pet owners.',
    task_objective: 'Analyze pet health data, understand animal biology, and write clear recommendations for pet owners.',
    primary_subject: 'science',
    secondary_subjects: ['math', 'ela'],
    skill_applications: {
      'science': {
        skill: 'animal-habitats-and-needs',
        application: 'Understand what different animals need to stay healthy',
        real_world_context: 'Veterinarians must know biology of many different animals'
      },
      'math': {
        skill: 'data-analysis-graphs',
        application: 'Read charts showing pet weights, temperatures, and appointment frequency',
        real_world_context: 'Veterinarians track animal health data to identify problems'
      },
      'ela': {
        skill: 'persuasive-writing',
        application: 'Write clear instructions to help pet owners care for their animals',
        real_world_context: 'Veterinarians must communicate medical advice clearly to non-experts'
      }
    },
    grade_level: 5,
    success_criteria: {
      science_accuracy: 0.85,
      math_analysis: 0.75,
      ela_communication: 0.8,
      overall_completion: true
    },
    cross_subject_connections: 'Students learn how scientific knowledge combines with mathematical analysis and clear communication in healthcare careers.',
    real_world_relevance: 'Veterinarians use science to understand animal health, math to analyze patterns, and writing skills to help pet owners.'
  },
  
  // Firefighter scenario integrating Math + Social Studies + Science
  {
    career_id: 'firefighter',
    scenario_title: 'Community Safety Planning',
    scenario_description: 'Captain Johnson is creating a fire safety plan for the neighborhood and needs help with calculations, community research, and understanding fire science.',
    task_objective: 'Help plan fire safety for the community using math calculations, community knowledge, and fire science.',
    primary_subject: 'social-studies',
    secondary_subjects: ['math', 'science'],
    skill_applications: {
      'social-studies': {
        skill: 'community-helpers-and-services',
        application: 'Understand how fire departments serve different neighborhoods and community needs',
        real_world_context: 'Fire departments must plan coverage based on community characteristics'
      },
      'math': {
        skill: 'measurement-and-estimation',
        application: 'Calculate distances between fire stations and response times',
        real_world_context: 'Emergency response depends on accurate distance and time calculations'
      },
      'science': {
        skill: 'matter-and-energy',
        application: 'Understand how fires start, spread, and can be stopped',
        real_world_context: 'Firefighters must understand fire science to fight fires safely and effectively'
      }
    },
    grade_level: 3,
    success_criteria: {
      social_studies_understanding: 0.8,
      math_calculations: 0.75,
      science_concepts: 0.75,
      overall_completion: true
    },
    cross_subject_connections: 'Students see how community service careers require understanding people (social studies), precise calculations (math), and scientific principles (science).',
    real_world_relevance: 'Firefighters must understand community needs, calculate response logistics, and apply scientific knowledge about fire behavior.'
  }
];
```

### PreK-5 Careers (Community Helpers)
**File:** `database/seeds/careers_elementary.js`

```javascript
export const elementaryCareers = [
  // School Helpers Department
  {
    id: 'teacher',
    name: 'Teacher',
    emoji: '👩‍🏫',
    department_id: 'school-helpers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 2,
    description_short: 'Helps students learn new things every day',
    description_detailed: 'Teachers create fun lessons, help students understand new concepts, and make learning exciting!',
    skills_required: ['communication', 'patience', 'creativity', 'organization'],
    real_world_tasks: [
      'Plan daily lessons for students',
      'Grade homework and tests', 
      'Help students who need extra support',
      'Create fun educational activities'
    ]
  },
  {
    id: 'librarian',
    name: 'Librarian',
    emoji: '📚',
    department_id: 'school-helpers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 1,
    description_short: 'Helps people find books and organizes the library',
    description_detailed: 'Librarians help students find the perfect books, organize the library, and teach about research!',
    skills_required: ['organization', 'reading', 'helping-others'],
    real_world_tasks: [
      'Help students find books they will enjoy',
      'Organize books on shelves by categories',
      'Read stories to children during story time',
      'Teach students how to use the library'
    ]
  },
  
  // Safety Heroes Department
  {
    id: 'firefighter',
    name: 'Firefighter', 
    emoji: '👨‍🚒',
    department_id: 'safety-heroes',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 3,
    description_short: 'Puts out fires and helps keep people safe',
    description_detailed: 'Firefighters rescue people from dangerous situations, put out fires, and teach fire safety!',
    skills_required: ['bravery', 'physical-fitness', 'teamwork', 'problem-solving'],
    real_world_tasks: [
      'Put out fires in buildings and forests',
      'Rescue people and animals from danger',
      'Check fire equipment to make sure it works',
      'Visit schools to teach fire safety'
    ]
  },
  {
    id: 'police-officer',
    name: 'Police Officer',
    emoji: '👮‍♀️',
    department_id: 'safety-heroes', 
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 3,
    description_short: 'Keeps the community safe and helps people',
    description_detailed: 'Police officers protect people, solve problems in the community, and make sure everyone follows the rules!',
    skills_required: ['problem-solving', 'communication', 'fairness', 'bravery'],
    real_world_tasks: [
      'Help people who are lost or in trouble',
      'Direct traffic to keep roads safe',
      'Investigate when something goes wrong',
      'Visit schools to teach about safety'
    ]
  },
  
  // Health Helpers Department
  {
    id: 'doctor',
    name: 'Doctor',
    emoji: '👩‍⚕️',
    department_id: 'health-helpers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 4,
    description_short: 'Helps people feel better when they are sick',
    description_detailed: 'Doctors examine patients, figure out what is making them sick, and help them get healthy again!',
    skills_required: ['science', 'caring', 'problem-solving', 'learning'],
    real_world_tasks: [
      'Listen to patients and ask about their symptoms',
      'Use special tools to check how patients are feeling',
      'Give medicine to help people get better',
      'Teach people how to stay healthy'
    ]
  },
  {
    id: 'veterinarian',
    name: 'Veterinarian',
    emoji: '👩‍⚕️',
    department_id: 'health-helpers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 4,
    description_short: 'Takes care of sick and injured animals',
    description_detailed: 'Veterinarians help animals feel better, give them medicine, and teach pet owners how to care for their animals!',
    skills_required: ['animal-care', 'science', 'gentleness', 'problem-solving'],
    real_world_tasks: [
      'Check animals to see if they are healthy',
      'Give animals medicine and shots',
      'Perform surgery on sick animals',
      'Teach pet owners how to care for their pets'
    ]
  },
  
  // Community Workers Department
  {
    id: 'chef',
    name: 'Chef',
    emoji: '👨‍🍳',
    department_id: 'community-workers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 2,
    description_short: 'Cooks delicious food for people to enjoy',
    description_detailed: 'Chefs plan menus, prepare ingredients, and cook meals that make people happy!',
    skills_required: ['creativity', 'measuring', 'following-directions', 'time-management'],
    real_world_tasks: [
      'Plan what meals to cook each day',
      'Measure ingredients for recipes',
      'Cook food safely and deliciously',
      'Make sure the kitchen is clean'
    ]
  },
  {
    id: 'mail-carrier',
    name: 'Mail Carrier',
    emoji: '📮',
    department_id: 'community-workers',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 1,
    description_short: 'Delivers mail and packages to people',
    description_detailed: 'Mail carriers make sure everyone gets their letters and packages by delivering them to the right address!',
    skills_required: ['organization', 'walking', 'reading-addresses', 'responsibility'],
    real_world_tasks: [
      'Sort mail by address and neighborhood',
      'Drive or walk to deliver mail to houses',
      'Make sure packages go to the right person',
      'Keep track of special delivery items'
    ]
  },
  
  // Creative Corner Department
  {
    id: 'artist',
    name: 'Artist',
    emoji: '🎨',
    department_id: 'creative-corner',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 2,
    description_short: 'Creates beautiful paintings, drawings, and sculptures',
    description_detailed: 'Artists use their imagination to create artwork that tells stories and makes people feel emotions!',
    skills_required: ['creativity', 'imagination', 'patience', 'observation'],
    real_world_tasks: [
      'Draw and paint pictures of people, places, and things',
      'Create sculptures using clay or other materials',
      'Design artwork for books and magazines',
      'Teach art classes to other people'
    ]
  },
  {
    id: 'musician',
    name: 'Musician',
    emoji: '🎵',
    department_id: 'creative-corner',
    min_grade: 0,
    max_grade: 5,
    difficulty_level: 3,
    description_short: 'Plays instruments and creates music for people to enjoy',
    description_detailed: 'Musicians practice instruments, write songs, and perform music that makes people dance and sing!',
    skills_required: ['rhythm', 'practice', 'creativity', 'listening'],
    real_world_tasks: [
      'Practice playing instruments every day',
      'Write new songs and melodies',
      'Perform music for audiences',
      'Teach other people how to play instruments'
    ]
  }
];
```

### 6-8 Careers (Exploration Phase)
**File:** `database/seeds/careers_middle.js`

```javascript
export const middleSchoolCareers = [
  // Business & Leadership Department
  {
    id: 'business-owner',
    name: 'Business Owner',
    emoji: '👔',
    department_id: 'business-leadership',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 4,
    description_short: 'Starts and runs their own company',
    description_detailed: 'Business owners create companies, make important decisions, and work to make their business successful while helping customers!',
    skills_required: ['leadership', 'decision-making', 'math', 'communication', 'planning'],
    real_world_tasks: [
      'Decide what products or services to offer',
      'Hire and manage employees',
      'Track money coming in and going out',
      'Market the business to attract customers'
    ]
  },
  {
    id: 'project-manager',
    name: 'Project Manager',
    emoji: '📋',
    department_id: 'business-leadership',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 3,
    description_short: 'Organizes teams to complete important projects',
    description_detailed: 'Project managers plan timelines, coordinate team members, and make sure projects are completed successfully and on time!',
    skills_required: ['organization', 'time-management', 'communication', 'problem-solving'],
    real_world_tasks: [
      'Create schedules and deadlines for projects',
      'Coordinate different team members and their tasks',
      'Solve problems when they arise during projects',
      'Track progress and report to leadership'
    ]
  },
  
  // Technology & Innovation Department
  {
    id: 'software-developer',
    name: 'Software Developer',
    emoji: '💻',
    department_id: 'technology-innovation',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 4,
    description_short: 'Creates apps and computer programs',
    description_detailed: 'Software developers write code to build apps, websites, and programs that help people solve problems and have fun!',
    skills_required: ['logical-thinking', 'math', 'problem-solving', 'patience', 'creativity'],
    real_world_tasks: [
      'Write code to create new apps and programs',
      'Test software to find and fix bugs',
      'Work with designers to make apps user-friendly',
      'Update existing programs to add new features'
    ]
  },
  {
    id: 'game-designer',
    name: 'Game Designer',
    emoji: '🎮',
    department_id: 'technology-innovation',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 4,
    description_short: 'Creates fun and engaging video games',
    description_detailed: 'Game designers imagine new game worlds, create characters, and design gameplay that is challenging and entertaining!',
    skills_required: ['creativity', 'storytelling', 'logical-thinking', 'art', 'programming'],
    real_world_tasks: [
      'Design game characters, worlds, and storylines',
      'Create rules and objectives for gameplay',
      'Test games to make sure they are fun and balanced',
      'Work with programmers and artists to build games'
    ]
  },
  
  // Marketing & Communications Department
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    emoji: '📱',
    department_id: 'marketing-communications',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 3,
    description_short: 'Creates content for social media platforms',
    description_detailed: 'Social media managers create posts, videos, and campaigns that help brands connect with their audience online!',
    skills_required: ['creativity', 'writing', 'digital-literacy', 'communication', 'trend-awareness'],
    real_world_tasks: [
      'Create engaging posts and videos for social platforms',
      'Respond to comments and messages from followers',
      'Plan social media campaigns for special events',
      'Analyze which posts get the most engagement'
    ]
  },
  {
    id: 'graphic-designer',
    name: 'Graphic Designer',
    emoji: '🎨',
    department_id: 'marketing-communications',
    min_grade: 6,
    max_grade: 8,
    difficulty_level: 3,
    description_short: 'Creates visual designs for brands and products',
    description_detailed: 'Graphic designers use art and technology to create logos, posters, websites, and other visual materials that communicate messages!',
    skills_required: ['artistic-ability', 'computer-skills', 'creativity', 'attention-to-detail'],
    real_world_tasks: [
      'Design logos and branding materials for companies',
      'Create posters and advertisements',
      'Design layouts for websites and apps',
      'Choose colors, fonts, and images that work well together'
    ]
  }
];
```

### 9-12 Careers (Professional Preparation)
**File:** `database/seeds/careers_high.js`

```javascript
export const highSchoolCareers = [
  // Executive Leadership (C-Suite)
  {
    id: 'ceo',
    name: 'Chief Executive Officer',
    emoji: '👨‍💼',
    department_id: 'executive-leadership',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 5,
    description_short: 'Leads the entire company and makes strategic decisions',
    description_detailed: 'CEOs set the vision for their company, make major strategic decisions, and lead teams to achieve ambitious business goals!',
    skills_required: ['leadership', 'strategic-thinking', 'communication', 'decision-making', 'financial-literacy'],
    real_world_tasks: [
      'Set long-term strategy and vision for the company',
      'Lead board meetings and investor presentations',
      'Make critical decisions about company direction',
      'Build and maintain relationships with key stakeholders'
    ]
  },
  {
    id: 'cfo',
    name: 'Chief Financial Officer',
    emoji: '📊',
    department_id: 'executive-leadership',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 5,
    description_short: 'Manages all financial aspects of the company',
    description_detailed: 'CFOs oversee budgets, financial planning, and ensure the company maintains strong financial health and growth!',
    skills_required: ['advanced-math', 'financial-analysis', 'strategic-thinking', 'attention-to-detail'],
    real_world_tasks: [
      'Create and manage company budgets and forecasts',
      'Analyze financial performance and identify trends',
      'Lead financial planning for major business decisions',
      'Ensure compliance with financial regulations'
    ]
  },
  
  // Technology & Engineering Department
  {
    id: 'software-engineer',
    name: 'Software Engineer',
    emoji: '⌨️',
    department_id: 'technology-engineering',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 4,
    description_short: 'Builds complex software systems and applications',
    description_detailed: 'Software engineers design and develop sophisticated software systems that power everything from mobile apps to space missions!',
    skills_required: ['advanced-programming', 'system-design', 'mathematics', 'problem-solving', 'collaboration'],
    real_world_tasks: [
      'Design and implement complex software architectures',
      'Write efficient, scalable code for large systems',
      'Collaborate with cross-functional teams on projects',
      'Debug and optimize existing software systems'
    ]
  },
  {
    id: 'data-scientist',
    name: 'Data Scientist',
    emoji: '📈',
    department_id: 'technology-engineering',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 5,
    description_short: 'Analyzes large datasets to find insights and patterns',
    description_detailed: 'Data scientists use statistics, programming, and machine learning to extract valuable insights from data that help companies make better decisions!',
    skills_required: ['statistics', 'programming', 'critical-thinking', 'mathematics', 'communication'],
    real_world_tasks: [
      'Collect and clean large datasets from multiple sources',
      'Use statistical methods to find patterns in data',
      'Build predictive models using machine learning',
      'Present findings to business stakeholders'
    ]
  },
  
  // Marketing & Business Development Department
  {
    id: 'marketing-director',
    name: 'Marketing Director',
    emoji: '🎯',
    department_id: 'marketing-business-dev',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 4,
    description_short: 'Develops marketing strategies to grow the business',
    description_detailed: 'Marketing directors create comprehensive campaigns, analyze market trends, and lead teams to build brand awareness and drive sales!',
    skills_required: ['strategic-thinking', 'creativity', 'data-analysis', 'leadership', 'communication'],
    real_world_tasks: [
      'Develop comprehensive marketing strategies and campaigns',
      'Analyze market research and customer behavior data',
      'Lead and coordinate marketing teams across channels',
      'Measure campaign effectiveness and ROI'
    ]
  },
  {
    id: 'ux-designer',
    name: 'UX Designer',
    emoji: '🎨',
    department_id: 'marketing-business-dev',
    min_grade: 9,
    max_grade: 12,
    difficulty_level: 4,
    description_short: 'Designs user experiences for digital products',
    description_detailed: 'UX designers research user needs, create wireframes and prototypes, and design intuitive interfaces that make technology easy and enjoyable to use!',
    skills_required: ['design-thinking', 'user-research', 'prototyping', 'psychology', 'collaboration'],
    real_world_tasks: [
      'Conduct user research to understand needs and behaviors',
      'Create wireframes and prototypes for new features',
      'Design intuitive user interfaces and experiences',
      'Test designs with users and iterate based on feedback'
    ]
  }
];
```

## Career Scenario Templates

### Elementary Scenario Examples
**File:** `database/seeds/scenarios_elementary.js`

```javascript
export const elementaryScenarios = [
  // Math - Counting scenarios
  {
    career_id: 'firefighter',
    skill_area: 'math',
    skill_subarea: 'counting',
    grade_level: 2,
    scenario_title: 'Fire Station Inventory Check',
    scenario_description: 'Help Captain Johnson count the emergency equipment to make sure the fire station is ready for any emergency!',
    task_objective: 'Count all the fire helmets, oxygen tanks, and fire hoses to complete the daily safety checklist.',
    success_criteria: {
      correct_counts: 3,
      time_limit_minutes: 10,
      accuracy_required: 0.8
    },
    difficulty_adjustments: {
      easier: 'Show pictures of items while counting',
      harder: 'Count items that are partially hidden or mixed together'
    },
    estimated_duration: 8
  },
  {
    career_id: 'chef',
    skill_area: 'math',
    skill_subarea: 'adding-fractions',
    grade_level: 4,
    scenario_title: 'Recipe Rescue Mission',
    scenario_description: 'The restaurant is busy and Chef Maria needs help combining ingredients for her famous apple pie!',
    task_objective: 'Help combine different measurements of ingredients by adding fractions to create the perfect recipe.',
    success_criteria: {
      fraction_problems_correct: 5,
      recipe_completed: true,
      accuracy_required: 0.75
    },
    difficulty_adjustments: {
      easier: 'Use visual fraction models with the ingredients',
      harder: 'Include mixed numbers and unlike denominators'
    },
    estimated_duration: 12
  }
];
```

### Career Selection API (Updated for Multi-Subject)
**File:** `api/careerSelection.js`

```javascript
// GET /api/careers/choices
export const getCareerChoices = async (req, res) => {
  const { studentId, learnResults, gradeLevel } = req.query;
  
  try {
    // Get student's career profile
    const careerProfile = await getCareerAnalytics(studentId);
    
    // Generate career choices based on multi-subject learning
    const choices = await generateCareerChoices({
      gradeLevel: parseInt(gradeLevel),
      learnResults: JSON.parse(learnResults),
      careerProfile: careerProfile
    });
    
    res.json({
      success: true,
      choices: choices,
      metadata: {
        generated_at: new Date().toISOString(),
        personalization_applied: careerProfile.hasStrongPreferences,
        subjects_integrated: extractSubjectsFromChoices(choices),
        skills_applicable: extractSkillsFromChoices(choices)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// POST /api/careers/choice-selected
export const trackCareerChoice = async (req, res) => {
  const { studentId, presentedChoices, selectedCareer, selectionTime, learnResults } = req.body;
  
  try {
    // Track the multi-subject choice event
    await trackMultiSubjectCareerChoiceEvent({
      studentId,
      presentedChoices,
      selectedCareer,
      selectionTime,
      learnResults,
      timestamp: new Date().toISOString()
    });
    
    // Generate multi-subject scenario for selected career
    const scenario = await generateMultiSubjectCareerScenario(selectedCareer, learnResults);
    
    res.json({
      success: true,
      scenario: scenario,
      analytics_updated: true,
      subjects_integrated: scenario.subjectsIntegrated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper functions for multi-subject integration
export const extractSubjectsFromChoices = (choices) => {
  const subjects = new Set();
  choices.forEach(choice => {
    if (choice.subjectIntegration) {
      Object.keys(choice.subjectIntegration).forEach(subject => subjects.add(subject));
    }
  });
  return Array.from(subjects);
};

export const extractSkillsFromChoices = (choices) => {
  const skills = [];
  choices.forEach(choice => {
    if (choice.skillApplications) {
      Object.values(choice.skillApplications).forEach(app => {
        skills.push(`${app.skill} (${choice.name})`);
      });
    }
  });
  return skills;
};
```

## Implementation Steps

1. **Database Setup**: Run migration scripts to create tables
2. **Seed Data**: Load initial career content for all grade levels
3. **API Development**: Build career selection and tracking endpoints
4. **Integration Testing**: Test career choice flow end-to-end
5. **Content Expansion**: Add more careers and scenarios based on testing feedback

This provides Claude Code with a complete database foundation and initial content to build the career selection system!