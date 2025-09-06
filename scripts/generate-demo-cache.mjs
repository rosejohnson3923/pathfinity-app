#!/usr/bin/env node

/**
 * Generate Demo Cache for Pathfinity Demo Users
 * Creates cached journey data for Sam (K), Alex (1), Jordan (7), and Taylor (10)
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Demo user configurations - matching mockAuthData.ts pseudonyms
const DEMO_USERS = [
    { name: 'Sam Brown', grade: 'K', gradeLevel: 'Kindergarten' },
    { name: 'Alex Davis', grade: '1', gradeLevel: '1st Grade' },
    { name: 'Jordan Smith', grade: '7', gradeLevel: '7th Grade' },
    { name: 'Taylor Johnson', grade: '10', gradeLevel: '10th Grade' }
];

// Subject requirements per grade
const GRADE_SUBJECTS = {
    'K': ['Math', 'ELA', 'Science', 'SocialStudies'],
    '1': ['Math', 'ELA', 'Science', 'SocialStudies'],
    '7': ['Math', 'ELA', 'Science', 'SocialStudies'],
    '10': ['Algebra1', 'Precalculus']
};

// Career options by grade level
const GRADE_CAREERS = {
    'K': ['Chef', 'Librarian', 'Park Ranger'],
    '1': ['Chef', 'Librarian', 'Park Ranger'],
    '7': ['Engineer', 'Scientist', 'Chef', 'Librarian', 'Park Ranger'],
    '10': ['Engineer', 'Scientist', 'Chef', 'Librarian', 'Park Ranger']
};

async function fetchSkillsByNumber(grade, subject, skillNumber) {
    console.log(`📚 Fetching ${subject} ${skillNumber} for grade ${grade}...`);
    
    const { data, error } = await supabase
        .from('skills_master')
        .select('*')
        .eq('grade', grade)
        .eq('subject', subject)
        .eq('skill_number', skillNumber)
        .single();

    if (error) {
        console.error(`❌ Error fetching ${subject} ${skillNumber}:`, error);
        return null;
    }

    console.log(`✅ Found ${subject} ${skillNumber}: ${data.skill_name}`);
    return data;
}

async function fetchUserSkills(user) {
    const { grade } = user;
    const subjects = GRADE_SUBJECTS[grade];
    const skills = {};

    // Fetch A.0 (dashboard titles) and A.1 (actual lesson content)
    for (const subject of subjects) {
        skills[subject] = {};
        
        // Fetch A.0 (dashboard card title)
        const a0Skill = await fetchSkillsByNumber(grade, subject, 'A.0');
        if (a0Skill) {
            skills[subject]['A.0'] = a0Skill;
        }

        // Fetch A.1 (lesson content)
        const a1Skill = await fetchSkillsByNumber(grade, subject, 'A.1');
        if (a1Skill) {
            skills[subject]['A.1'] = a1Skill;
        }
    }

    return skills;
}

function generateLearnContent(skill, user, subject) {
    const { name, gradeLevel } = user;
    
    // Create subject-specific educational content
    if (subject === 'ELA') {
        return generateELAContent(skill, user);
    } else if (subject === 'Math') {
        return generateMathContent(skill, user);
    } else if (subject === 'Science') {
        return generateScienceContent(skill, user);
    } else if (subject === 'SocialStudies') {
        return generateSocialStudiesContent(skill, user);
    }
    
    // Fallback to generic content
    return {
        instruction: {
            title: `Let's Learn ${skill.skill_name}!`,
            content: `Welcome ${name}! Today we're exploring ${skill.skill_name} in ${subject}.`,
            concept: skill.skill_description || `Understanding ${skill.skill_name}`,
            examples: [
                {
                    question: `What is ${skill.skill_name}?`,
                    answer: `${skill.skill_name} is an important ${subject} concept.`,
                    explanation: `This helps us understand how to use ${skill.skill_name} in real situations.`
                }
            ],
            keyPoints: [
                `${skill.skill_name} is fundamental to ${subject}`,
                `Practice makes perfect with ${skill.skill_name}`,
                `You can use ${skill.skill_name} in many ways`
            ]
        },
        practice: {
            title: `Practice ${skill.skill_name}`,
            exercises: [
                {
                    question: `Try this ${skill.skill_name} activity`,
                    hint: `Remember what we learned about ${skill.skill_name}`,
                    expectedAnswer: 'Various answers possible',
                    feedback: `Great job practicing ${skill.skill_name}!`
                }
            ]
        },
        assessment: {
            question: `Which best describes ${skill.skill_name}?`,
            options: [
                `It helps with ${subject} skills`,
                `It's used in daily life`,
                `It connects to other subjects`,
                `All of the above`
            ],
            correctAnswer: 'All of the above',
            explanation: `${skill.skill_name} is useful in many ways and connects to other learning!`,
            feedback: {
                correct: `Excellent work, ${name}! You understand ${skill.skill_name}!`,
                incorrect: `Not quite, but keep learning! ${skill.skill_name} takes practice.`
            }
        }
    };
}

function generateELAContent(skill, user) {
    const { name, gradeLevel } = user;
    
    // For letter recognition skills, create proper letter activities
    if (skill.skill_name.includes('letter') || skill.skill_name.includes('alphabet')) {
        const letters = ['A', 'B', 'C', 'D', 'E'];
        const targetLetter = letters[Math.floor(Math.random() * letters.length)];
        
        return {
            instruction: {
                title: `Let's Learn About Letters!`,
                content: `Hi ${name}! Today we're learning to find and recognize letters in the alphabet.`,
                concept: `Letters are the building blocks of words. Each letter has a shape and a sound.`,
                examples: [
                    {
                        question: `What does the letter ${targetLetter} look like?`,
                        answer: `The letter ${targetLetter} is an uppercase letter that looks like this: ${targetLetter}`,
                        explanation: `We can find the letter ${targetLetter} in many words, like "Apple" or "Ball".`
                    }
                ],
                keyPoints: [
                    `Every letter has a special shape`,
                    `We can find letters in the alphabet`,
                    `Letters help us read and write words`
                ]
            },
            practice: {
                title: `Practice Finding Letters`,
                exercises: [
                    {
                        question: `Can you find the letter ${targetLetter} in this row? A B C D E`,
                        hint: `Look for the letter that matches: ${targetLetter}`,
                        expectedAnswer: targetLetter,
                        feedback: `Great job finding the letter ${targetLetter}!`
                    }
                ]
            },
            assessment: {
                question: `Which letter comes after ${targetLetter} in the alphabet?`,
                options: [
                    String.fromCharCode(targetLetter.charCodeAt(0) + 1),
                    String.fromCharCode(targetLetter.charCodeAt(0) - 1),
                    String.fromCharCode(targetLetter.charCodeAt(0) + 2),
                    targetLetter
                ],
                correctAnswer: String.fromCharCode(targetLetter.charCodeAt(0) + 1),
                explanation: `The letters go in order: A, B, C, D, E... So ${String.fromCharCode(targetLetter.charCodeAt(0) + 1)} comes after ${targetLetter}!`,
                feedback: {
                    correct: `Perfect ${name}! You know your alphabet order!`,
                    incorrect: `Not quite, but keep practicing! The alphabet has a special order.`
                }
            }
        };
    }
    
    // For other ELA skills, create reading-focused content
    return {
        instruction: {
            title: `Let's Learn About Reading!`,
            content: `Hi ${name}! Today we're building our reading skills.`,
            concept: `Reading helps us understand stories and learn new things.`,
            examples: [
                {
                    question: `Why is reading important?`,
                    answer: `Reading helps us learn about the world and understand stories.`,
                    explanation: `When we read, we can discover new places, meet new characters, and learn amazing facts!`
                }
            ],
            keyPoints: [
                `Reading opens up new worlds`,
                `We can read books, signs, and stories`,
                `Practice makes reading easier and more fun`
            ]
        },
        practice: {
            title: `Practice Reading Skills`,
            exercises: [
                {
                    question: `Read this simple sentence: "The cat sat on the mat." What animal is mentioned?`,
                    hint: `Look for the animal word in the sentence`,
                    expectedAnswer: 'cat',
                    feedback: `Yes! The cat is the animal in the sentence.`
                }
            ]
        },
        assessment: {
            question: `What do good readers do?`,
            options: [
                `They skip words they don't know`,
                `They read too fast to understand`,
                `They think about what they're reading`,
                `They only read short words`
            ],
            correctAnswer: `They think about what they're reading`,
            explanation: `Good readers think about the story and try to understand what's happening!`,
            feedback: {
                correct: `Excellent ${name}! You understand what good reading is!`,
                incorrect: `Keep learning! Good readers take time to understand the story.`
            }
        }
    };
}

function generateMathContent(skill, user) {
    const { name, gradeLevel } = user;
    
    // For counting skills, create number activities
    if (skill.skill_name.includes('number') || skill.skill_name.includes('count')) {
        const numbers = [1, 2, 3];
        const targetNumber = numbers[Math.floor(Math.random() * numbers.length)];
        
        return {
            instruction: {
                title: `Let's Learn About Numbers!`,
                content: `Hi ${name}! Today we're learning to count and recognize numbers.`,
                concept: `Numbers help us count things and understand how many we have.`,
                examples: [
                    {
                        question: `What does the number ${targetNumber} mean?`,
                        answer: `The number ${targetNumber} means we have ${targetNumber} things.`,
                        explanation: `If we have ${targetNumber} apple${'s'.repeat(targetNumber > 1 ? 1 : 0)}, we can count: ${Array.from({length: targetNumber}, (_, i) => i + 1).join(', ')}.`
                    }
                ],
                keyPoints: [
                    `Numbers help us count things`,
                    `We can see numbers all around us`,
                    `Counting helps us understand "how many"`
                ]
            },
            practice: {
                title: `Practice Counting`,
                exercises: [
                    {
                        question: `Count these dots: ${'• '.repeat(targetNumber)}How many dots are there?`,
                        hint: `Count each dot: 1, 2, 3...`,
                        expectedAnswer: targetNumber.toString(),
                        feedback: `Great counting! There are ${targetNumber} dots.`
                    }
                ]
            },
            assessment: {
                question: `Which number comes after ${targetNumber}?`,
                options: [
                    (targetNumber + 1).toString(),
                    (targetNumber - 1).toString(),
                    targetNumber.toString(),
                    '0'
                ],
                correctAnswer: (targetNumber + 1).toString(),
                explanation: `Numbers go in order: 1, 2, 3... So ${targetNumber + 1} comes after ${targetNumber}!`,
                feedback: {
                    correct: `Perfect ${name}! You know your number order!`,
                    incorrect: `Not quite, but keep practicing! Numbers go in order.`
                }
            }
        };
    }
    
    // Fallback for other math skills
    return {
        instruction: {
            title: `Let's Learn Math!`,
            content: `Hi ${name}! Today we're exploring the wonderful world of math.`,
            concept: `Math helps us solve problems and understand the world around us.`,
            examples: [
                {
                    question: `How do we use math every day?`,
                    answer: `We use math to count toys, share snacks, and measure things.`,
                    explanation: `Math is everywhere! We use it for cooking, shopping, and playing games.`
                }
            ],
            keyPoints: [
                `Math helps us solve problems`,
                `We use math every day`,
                `Math can be fun and useful`
            ]
        },
        practice: {
            title: `Practice Math Skills`,
            exercises: [
                {
                    question: `If you have 2 apples and get 1 more, how many apples do you have?`,
                    hint: `Count: 2 + 1 = ?`,
                    expectedAnswer: '3',
                    feedback: `Yes! 2 + 1 = 3 apples.`
                }
            ]
        },
        assessment: {
            question: `What do we use math for?`,
            options: [
                `Only for homework`,
                `Just for tests`,
                `To solve problems and count things`,
                `Nothing important`
            ],
            correctAnswer: `To solve problems and count things`,
            explanation: `Math helps us solve problems and understand numbers in our daily life!`,
            feedback: {
                correct: `Excellent ${name}! You understand why math is important!`,
                incorrect: `Keep learning! Math is useful for many things.`
            }
        }
    };
}

function generateScienceContent(skill, user) {
    const { name, gradeLevel } = user;
    
    return {
        instruction: {
            title: `Let's Explore Science!`,
            content: `Hi ${name}! Today we're discovering the amazing world of science.`,
            concept: `Science helps us understand how things work and why things happen.`,
            examples: [
                {
                    question: `What can we learn from science?`,
                    answer: `Science teaches us about animals, plants, weather, and how things move.`,
                    explanation: `Scientists ask questions and do experiments to learn new things!`
                }
            ],
            keyPoints: [
                `Science helps us understand the world`,
                `We can observe and ask questions`,
                `Science is all around us`
            ]
        },
        practice: {
            title: `Practice Science Skills`,
            exercises: [
                {
                    question: `Look at a leaf. What do you notice about its color and shape?`,
                    hint: `Use your eyes to observe carefully`,
                    expectedAnswer: 'Various observations possible',
                    feedback: `Great observation! Scientists use their senses to learn.`
                }
            ]
        },
        assessment: {
            question: `What do scientists do?`,
            options: [
                `They only read books`,
                `They ask questions and explore`,
                `They stay inside all day`,
                `They don't like learning`
            ],
            correctAnswer: `They ask questions and explore`,
            explanation: `Scientists are curious and love to ask questions about how things work!`,
            feedback: {
                correct: `Perfect ${name}! You think like a scientist!`,
                incorrect: `Keep exploring! Scientists are curious and ask lots of questions.`
            }
        }
    };
}

function generateSocialStudiesContent(skill, user) {
    const { name, gradeLevel } = user;
    
    return {
        instruction: {
            title: `Let's Learn About Our Community!`,
            content: `Hi ${name}! Today we're learning about the people and places around us.`,
            concept: `A community is all the people who live and work together in the same place.`,
            examples: [
                {
                    question: `Who are the helpers in our community?`,
                    answer: `Teachers, firefighters, doctors, and store workers help make our community great.`,
                    explanation: `Everyone in our community has a job that helps other people!`
                }
            ],
            keyPoints: [
                `We are part of a community`,
                `People in our community help each other`,
                `Communities have schools, stores, and parks`
            ]
        },
        practice: {
            title: `Practice Community Skills`,
            exercises: [
                {
                    question: `Name a place in your community where people go to learn.`,
                    hint: `Think about where children go during the day to learn new things`,
                    expectedAnswer: 'school',
                    feedback: `Yes! Schools are where people go to learn in our community.`
                }
            ]
        },
        assessment: {
            question: `What makes a good community?`,
            options: [
                `People who never talk to each other`,
                `People who help and care for each other`,
                `Only one type of person`,
                `No rules or helpers`
            ],
            correctAnswer: `People who help and care for each other`,
            explanation: `Good communities have people who work together and help each other!`,
            feedback: {
                correct: `Wonderful ${name}! You understand what makes communities special!`,
                incorrect: `Keep learning! Good communities have people who care for each other.`
            }
        }
    };
}

function generateExperienceContent(user, career, skills) {
    const { name, gradeLevel } = user;
    const subjects = Object.keys(skills);
    
    // Create career-specific contexts for each subject
    const careerContexts = {
        'Chef': {
            setting: 'restaurant kitchen',
            baseChallenge: 'preparing a special meal',
            tools: 'ingredients, recipes, cooking equipment',
            subjectChallenges: {
                'Math': 'calculating recipe proportions for a large dinner party',
                'ELA': 'writing clear menu descriptions for diverse customers',
                'Science': 'understanding cooking temperatures and food safety',
                'SocialStudies': 'creating culturally diverse menu options for the community'
            }
        },
        'Librarian': {
            setting: 'community library',
            baseChallenge: 'organizing a reading event',
            tools: 'books, computers, display materials',
            subjectChallenges: {
                'Math': 'organizing books by number classification and calculating reading statistics',
                'ELA': 'curating age-appropriate reading materials and leading story sessions',
                'Science': 'setting up a science book display and demonstration area',
                'SocialStudies': 'creating exhibits about diverse cultures and community history'
            }
        },
        'Park Ranger': {
            setting: 'national park',
            baseChallenge: 'leading an educational nature tour',
            tools: 'maps, field guides, safety equipment',
            subjectChallenges: {
                'Math': 'calculating trail distances and visitor capacity for safety',
                'ELA': 'writing informative trail guides and interpretive signs',
                'Science': 'explaining ecosystem relationships and wildlife behaviors',
                'SocialStudies': 'sharing indigenous history and cultural significance of the land'
            }
        },
        'Engineer': {
            setting: 'design workshop',
            baseChallenge: 'solving a community problem',
            tools: 'blueprints, calculations, building materials',
            subjectChallenges: {
                'Math': 'calculating structural loads and material requirements',
                'ELA': 'writing technical specifications and project proposals',
                'Science': 'applying physics principles to design solutions',
                'SocialStudies': 'considering community needs and cultural impacts'
            }
        },
        'Scientist': {
            setting: 'research laboratory',
            baseChallenge: 'conducting an important experiment',
            tools: 'laboratory equipment, data charts, research notes',
            subjectChallenges: {
                'Math': 'analyzing experimental data and calculating statistical significance',
                'ELA': 'writing research reports and presenting findings clearly',
                'Science': 'designing controlled experiments and testing hypotheses',
                'SocialStudies': 'considering ethical implications and societal impact of research'
            }
        }
    };

    const context = careerContexts[career];
    
    // Generate subject-specific experiences
    const subjectExperiences = {};
    
    for (const subject of subjects) {
        const skill = skills[subject]['A.1'];
        if (skill) {
            const subjectChallenge = context.subjectChallenges[subject] || context.baseChallenge;
            
            subjectExperiences[subject] = {
                roleSetup: {
                    title: `Working as a ${career}`,
                    roleDescription: `Today you're a professional ${career} in a ${context.setting}!`,
                    challenge: `Your mission: ${subjectChallenge}`,
                    context: `As a ${career}, you'll use your ${skill.skill_name} skills to help with this ${subject} challenge`,
                    tools: `You have these tools: ${context.tools}`
                },
                applySkills: {
                    title: `${career} Skills in Action`,
                    scenarios: [
                        {
                            situation: `A ${career} needs to apply ${skill.skill_name} skills for ${subject}`,
                            task: `Use your ${skill.skill_name} knowledge to ${subjectChallenge}`,
                            expectedOutcome: `Successfully complete the ${subject}-focused ${career} task`
                        }
                    ],
                    skillConnections: [{
                        skill: skill.skill_name,
                        application: `How a ${career} uses ${skill.skill_name} for ${subject} tasks`
                    }]
                },
                solveChallenge: {
                    question: `How would you use ${skill.skill_name} to complete this ${career} challenge?`,
                    options: [
                        `Apply ${skill.skill_name} step by step`,
                        `Skip the ${subject} part and focus on other things`,
                        `Ask someone else to handle the ${subject} work`,
                        `Use trial and error without applying the skill`
                    ],
                    correctAnswer: `Apply ${skill.skill_name} step by step`,
                    explanation: `Great ${career}s know that applying ${skill.skill_name} systematically leads to the best results in ${subject} tasks!`,
                    success: `Congratulations ${name}! You've successfully used ${skill.skill_name} to complete your ${career} challenge!`
                }
            };
        }
    }
    
    return subjectExperiences;
}

function generateDiscoverContent(user, career, skills) {
    const { name, gradeLevel } = user;
    const subjects = Object.keys(skills);
    const skillList = subjects.map(subject => skills[subject]['A.1']?.skill_name).filter(Boolean);

    // Create story adventure based on career
    const storyThemes = {
        'Chef': {
            setting: 'magical kitchen in the clouds',
            quest: 'save the Kingdom\'s Grand Feast',
            villain: 'the Sour Wizard',
            magical_element: 'golden recipes'
        },
        'Librarian': {
            setting: 'enchanted library with talking books',
            quest: 'restore the lost stories',
            villain: 'the Silent Specter',
            magical_element: 'glowing knowledge crystals'
        },
        'Park Ranger': {
            setting: 'mystical forest with ancient trees',
            quest: 'protect the Sacred Grove',
            villain: 'the Shadow Destroyer',
            magical_element: 'nature\'s harmony stones'
        },
        'Engineer': {
            setting: 'floating city of inventions',
            quest: 'rebuild the Great Machine',
            villain: 'the Chaos Constructor',
            magical_element: 'blueprint gems'
        },
        'Scientist': {
            setting: 'crystal laboratory in space',
            quest: 'discover the formula for peace',
            villain: 'the Discord Doctor',
            magical_element: 'wisdom spheres'
        }
    };

    const theme = storyThemes[career];

    return {
        storySetup: {
            title: `${name}'s ${career} Adventure`,
            setting: `In a ${theme.setting}...`,
            characters: [name, `Master ${career}`, 'Helpful Companion'],
            plot: `The kingdom needs ${name} to ${theme.quest} using ${career} skills!`,
            skillConnection: `This adventure requires: ${skillList.join(', ')}`
        },
        adventure: {
            title: `The ${career} Quest`,
            storyEvents: [
                {
                    event: `${theme.villain} has appeared and threatens the kingdom!`,
                    choice: `Use your ${career} training and learned skills`,
                    outcome: `${name} bravely steps forward to help`,
                    skillApplication: `Time to use: ${skillList.join(', ')}`
                },
                {
                    event: `You must find the ${theme.magical_element} to succeed`,
                    choice: `Combine all your learned skills`,
                    outcome: `The skills work together like magic!`,
                    skillApplication: `Each skill adds power to your quest`
                }
            ]
        },
        herosChoice: {
            question: `How does ${name} save the kingdom?`,
            options: [
                `Use only the strongest skill`,
                `Try each skill one by one`,
                `Combine all skills with wisdom`,
                `Ask others to solve it instead`
            ],
            correctAnswer: 'Combine all skills with wisdom',
            explanation: `True heroes know that all skills working together create the most powerful magic!`,
            ending: `🌟 ${name} becomes the legendary ${career} hero, saving the kingdom with wisdom and skill! The people cheer as ${theme.magical_element} glow brightly once more!`
        }
    };
}

async function generateDemoCache() {
    console.log('🚀 Starting Demo Cache Generation');
    console.log('=====================================\n');

    const demoCache = {};

    for (const user of DEMO_USERS) {
        console.log(`\n👤 Generating cache for ${user.name} (${user.gradeLevel})`);
        console.log('-----------------------------------');

        // Fetch skills for this user
        const skills = await fetchUserSkills(user);
        
        // Check if we have the required skills
        const subjects = GRADE_SUBJECTS[user.grade];
        const hasAllSkills = subjects.every(subject => 
            skills[subject] && skills[subject]['A.0'] && skills[subject]['A.1']
        );

        if (!hasAllSkills) {
            console.error(`❌ Missing required skills for ${user.name}`);
            continue;
        }

        // Generate Learn Container content
        console.log(`  📚 Generating Learn Container content...`);
        const learnContent = {};
        for (const subject of subjects) {
            const skill = skills[subject]['A.1'];
            learnContent[subject] = generateLearnContent(skill, user, subject);
        }

        // Generate content for each career option
        const careers = GRADE_CAREERS[user.grade];
        const careerContent = {};

        for (const career of careers) {
            console.log(`  🎭 Generating ${career} content...`);
            
            careerContent[career] = {
                experience: generateExperienceContent(user, career, skills),
                discover: generateDiscoverContent(user, career, skills)
            };
        }

        // Create dashboard cards (A.0 titles)
        const dashboardCards = subjects.map(subject => ({
            subject: subject,
            title: skills[subject]['A.0'].skill_name,
            description: skills[subject]['A.0'].skill_description || `Learn ${subject} fundamentals`,
            skillNumber: 'A.0'
        }));

        // Store in demo cache
        demoCache[user.name] = {
            user: user,
            dashboardCards: dashboardCards,
            skills: skills,
            learnContent: learnContent,
            careerContent: careerContent,
            generatedAt: new Date().toISOString(),
            subjects: subjects,
            careers: careers
        };

        console.log(`✅ Generated cache for ${user.name}:`);
        console.log(`   📋 ${dashboardCards.length} dashboard cards`);
        console.log(`   📚 ${subjects.length} subjects for Learn Container`);
        console.log(`   🎭 ${careers.length} careers for Experience/Discover`);
    }

    // Save cache to file
    const cacheDir = path.join(__dirname, '..', 'src', 'data', 'demoCache');
    await fs.mkdir(cacheDir, { recursive: true });
    
    const cacheFile = path.join(cacheDir, 'demoUserCache.json');
    await fs.writeFile(cacheFile, JSON.stringify(demoCache, null, 2));
    
    console.log('\n✅ Demo cache saved to:', cacheFile);
    
    // Also save a TypeScript version for type safety
    const tsContent = `// Auto-generated demo cache - DO NOT EDIT MANUALLY
// Generated on: ${new Date().toISOString()}

export const DEMO_USER_CACHE = ${JSON.stringify(demoCache, null, 2)} as const;

export type DemoUserName = keyof typeof DEMO_USER_CACHE;

export type DemoUserData = {
  user: {
    name: string;
    grade: string;
    gradeLevel: string;
  };
  dashboardCards: Array<{
    subject: string;
    title: string;
    description: string;
    skillNumber: string;
  }>;
  skills: Record<string, Record<string, any>>;
  learnContent: Record<string, any>;
  careerContent: Record<string, {
    experience: any;
    discover: any;
  }>;
  generatedAt: string;
  subjects: string[];
  careers: string[];
};
`;

    const tsFile = path.join(cacheDir, 'demoUserCache.ts');
    await fs.writeFile(tsFile, tsContent);
    
    console.log('✅ TypeScript cache saved to:', tsFile);
    
    // Summary
    console.log('\n📊 CACHE GENERATION SUMMARY');
    console.log('=====================================');
    for (const userName of Object.keys(demoCache)) {
        const userCache = demoCache[userName];
        console.log(`${userName} (${userCache.user.gradeLevel}):`);
        console.log(`  📋 ${userCache.dashboardCards.length} dashboard cards`);
        console.log(`  📚 ${userCache.subjects.length} subjects`);
        console.log(`  🎭 ${userCache.careers.length} careers`);
        console.log(`  📖 ${userCache.subjects.length * 3} Learn steps (${userCache.subjects.length} subjects × 3 steps)`);
        console.log(`  🎪 ${userCache.careers.length * 6} Experience/Discover steps (${userCache.careers.length} careers × 6 steps)`);
        console.log('');
    }
    
    console.log('🎉 Demo cache generation complete!');
    console.log('\nDemo users ready:');
    console.log('- Sam Brown (K): Math, ELA, Science, SocialStudies');
    console.log('- Alex Davis (1): Math, ELA, Science, SocialStudies');
    console.log('- Jordan Smith (7): Math, ELA, Science, SocialStudies');
    console.log('- Taylor Johnson (10): Algebra1, Precalculus');
}

// Run the script
generateDemoCache().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});