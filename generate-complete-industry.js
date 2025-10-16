/**
 * Complete Industry Generation with ALL fields
 * This script generates comprehensive content for Career Challenge
 * Including all fields discovered in our analysis
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Azure OpenAI configuration
const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

/**
 * Call Azure OpenAI API
 */
async function callAzureOpenAI(prompt, maxTokens = 800) {
    const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT}/chat/completions?api-version=2024-02-01`;

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'api-key': AZURE_API_KEY,
        },
        body: JSON.stringify({
            messages: [
                {
                    role: 'system',
                    content: 'You are a creative game designer creating comprehensive educational content for Career Challenge, a career exploration game for students. Always respond with valid JSON only, no markdown formatting. Include realistic details and educational value.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: maxTokens,
            temperature: 0.8,
            response_format: { type: 'json_object' }
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

/**
 * Generate a complete industry with all fields
 */
export async function generateCompleteIndustry(industryConfig) {
    const {
        code,
        name,
        icon,
        description,
        theme = 'modern professional'
    } = industryConfig;

    console.log(`\n🏢 Generating Complete ${name} Industry ${icon}\n`);
    console.log('=' .repeat(60));

    try {
        // 1. CREATE OR GET INDUSTRY with ALL fields
        console.log('\n1️⃣ Creating Industry with complete metadata...');

        // Generate industry metadata
        const industryPrompt = `Create comprehensive metadata for a ${name} industry in Career Challenge.

Generate a JSON object with:
{
  "color_scheme": {
    "primary": "#hex color that fits the industry",
    "secondary": "#complementary hex color",
    "accent": "#accent color for highlights"
  },
  "challenge_categories": ["category1", "category2", "category3", "category4", "category5"],
  "learning_objectives": [
    "Educational objective 1 about ${name} careers",
    "Educational objective 2 about skills needed",
    "Educational objective 3 about industry knowledge"
  ],
  "career_connections": [
    "Real career path 1 in ${name}",
    "Real career path 2 in ${name}",
    "Real career path 3 in ${name}"
  ]
}

Make categories specific to ${name} industry, not generic.`;

        const industryMetadata = await callAzureOpenAI(industryPrompt, 400);

        // Check if industry exists
        let { data: existingIndustry } = await supabase
            .from('cc_industries')
            .select('id')
            .eq('code', code)
            .single();

        let industryId;

        if (existingIndustry) {
            // Update existing industry with new metadata
            const { data: updatedIndustry } = await supabase
                .from('cc_industries')
                .update({
                    color_scheme: industryMetadata.color_scheme,
                    challenge_categories: industryMetadata.challenge_categories,
                    learning_objectives: industryMetadata.learning_objectives,
                    career_connections: industryMetadata.career_connections
                })
                .eq('code', code)
                .select()
                .single();

            industryId = updatedIndustry.id;
            console.log('✅ Updated existing industry with complete metadata');
        } else {
            // Create new industry
            const { data: newIndustry, error } = await supabase
                .from('cc_industries')
                .insert({
                    code,
                    name,
                    icon,
                    description,
                    color_scheme: industryMetadata.color_scheme,
                    challenge_categories: industryMetadata.challenge_categories,
                    difficulty_levels: ['easy', 'medium', 'hard', 'expert'],
                    grade_level_min: 'middle',
                    grade_level_max: 'high',
                    learning_objectives: industryMetadata.learning_objectives,
                    career_connections: industryMetadata.career_connections,
                    is_active: true,
                    is_premium: false
                })
                .select()
                .single();

            if (error) throw error;
            industryId = newIndustry.id;
            console.log('✅ Created new industry with complete metadata');
        }

        console.log(`   Categories: ${industryMetadata.challenge_categories.join(', ')}`);
        console.log(`   Color: ${industryMetadata.color_scheme.primary}`);

        // 2. GENERATE ROLE CARDS with ALL fields
        console.log('\n2️⃣ Generating Role Cards with complete data...\n');

        const roleConfigs = [
            { title: 'Entry Level', rarity: 'common', power: { min: 3, max: 4 }, count: 3 },
            { title: 'Specialist', rarity: 'uncommon', power: { min: 4, max: 6 }, count: 3 },
            { title: 'Senior', rarity: 'rare', power: { min: 6, max: 8 }, count: 2 },
            { title: 'Leader', rarity: 'epic', power: { min: 7, max: 9 }, count: 1 },
            { title: 'Executive', rarity: 'legendary', power: { min: 9, max: 10 }, count: 1 }
        ];

        const generatedRoles = [];

        for (const config of roleConfigs) {
            for (let i = 0; i < config.count; i++) {
                console.log(`   Generating ${config.rarity} role (${config.title} level)...`);

                const rolePrompt = `Create a ${config.rarity} ${name} industry role card.
Level: ${config.title}
Power: ${config.power.min}-${config.power.max}

Generate comprehensive role data:
{
  "roleName": "Professional title appropriate for ${config.title} level",
  "roleTitle": "Character Name - Descriptive Title",
  "description": "50-80 word description of role and responsibilities in ${name}",
  "rarity": "${config.rarity}",
  "basePower": ${config.power.min} to ${config.power.max},
  "categoryBonuses": {
    "${industryMetadata.challenge_categories[0]}": 1-4,
    "${industryMetadata.challenge_categories[1]}": 1-3,
    "${industryMetadata.challenge_categories[2]}": 0-2
  },
  "specialAbilities": [
    "Ability 1: Effect description",
    "Ability 2: Situational bonus"
  ],
  "flavorText": "Inspirational quote or motto for this role",
  "backstory": "30-50 word character background story",
  "keySkills": ["skill1", "skill2", "skill3", "skill4"],
  "educationRequirements": ["requirement1", "requirement2"],
  "salaryRange": "$XX,XXX - $XXX,XXX realistic for ${config.title} level",
  "relatedCareerCode": "career_code_for_exploration"
}`;

                try {
                    const roleCard = await callAzureOpenAI(rolePrompt);

                    const { data: savedRole, error } = await supabase
                        .from('cc_role_cards')
                        .insert({
                            industry_id: industryId,
                            role_code: `${code.toUpperCase()}_${roleCard.roleName.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
                            role_name: roleCard.roleName,
                            role_title: roleCard.roleTitle,
                            description: roleCard.description,
                            rarity: roleCard.rarity,
                            base_power: roleCard.basePower,
                            category_bonuses: roleCard.categoryBonuses,
                            special_abilities: roleCard.specialAbilities,
                            flavor_text: roleCard.flavorText,
                            backstory: roleCard.backstory,
                            key_skills: roleCard.keySkills,
                            education_requirements: roleCard.educationRequirements,
                            salary_range: roleCard.salaryRange,
                            related_career_code: roleCard.relatedCareerCode || null
                        })
                        .select()
                        .single();

                    if (error) {
                        console.log(`     ❌ Failed: ${error.message}`);
                    } else {
                        console.log(`     ✅ Created: ${savedRole.role_name} (Power: ${savedRole.base_power})`);
                        generatedRoles.push(savedRole);
                    }
                } catch (error) {
                    console.log(`     ❌ Generation failed: ${error.message}`);
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // 3. GENERATE CHALLENGES with ALL fields
        console.log('\n3️⃣ Generating Challenges with complete data...\n');

        const challengeConfigs = [
            { difficulty: 'easy', category: industryMetadata.challenge_categories[0] },
            { difficulty: 'easy', category: industryMetadata.challenge_categories[1] },
            { difficulty: 'medium', category: industryMetadata.challenge_categories[1] },
            { difficulty: 'medium', category: industryMetadata.challenge_categories[2] },
            { difficulty: 'hard', category: industryMetadata.challenge_categories[2] },
            { difficulty: 'expert', category: industryMetadata.challenge_categories[3] }
        ];

        const availableRoles = generatedRoles.map(r => r.role_name);

        for (const config of challengeConfigs) {
            console.log(`   Generating ${config.difficulty} ${config.category} challenge...`);

            // Select appropriate roles for recommendations
            const recommendedCount = config.difficulty === 'easy' ? 2 :
                                    config.difficulty === 'medium' ? 3 :
                                    config.difficulty === 'hard' ? 4 : 5;

            const roleSelection = availableRoles.slice(0, Math.min(recommendedCount, availableRoles.length));

            const challengePrompt = `Create a ${config.difficulty} ${name} industry challenge.
Category: ${config.category}
Available roles in industry: ${availableRoles.join(', ')}

Generate comprehensive challenge:
{
  "title": "Engaging title (max 50 chars)",
  "scenarioText": "Detailed scenario (100-150 words) that presents a realistic ${name} industry situation",
  "category": "${config.category}",
  "difficulty": "${config.difficulty}",
  "minRolesRequired": ${config.difficulty === 'easy' ? 2 : config.difficulty === 'medium' ? 3 : 4},
  "maxRolesAllowed": ${config.difficulty === 'easy' ? 3 : config.difficulty === 'medium' ? 4 : 5},
  "timePressureLevel": ${config.difficulty === 'easy' ? 1 : config.difficulty === 'medium' ? 2 : 3},
  "baseDifficultyScore": ${config.difficulty === 'easy' ? 15 : config.difficulty === 'medium' ? 30 : config.difficulty === 'hard' ? 45 : 60},
  "perfectScore": ${config.difficulty === 'easy' ? 25 : config.difficulty === 'medium' ? 40 : config.difficulty === 'hard' ? 55 : 75},
  "failureThreshold": ${config.difficulty === 'easy' ? 10 : config.difficulty === 'medium' ? 20 : config.difficulty === 'hard' ? 30 : 40},
  "requiredRoles": [],
  "recommendedRoles": ${JSON.stringify(roleSelection)},
  "restrictedRoles": [],
  "skillConnections": ["skill1", "skill2", "skill3"],
  "learningOutcomes": [
    "Students will understand...",
    "Students will learn..."
  ],
  "realWorldExample": "This reflects real ${name} industry situations where..."
}`;

            try {
                const challenge = await callAzureOpenAI(challengePrompt, 600);

                const { error } = await supabase
                    .from('cc_challenges')
                    .insert({
                        industry_id: industryId,
                        challenge_code: `${code.toUpperCase()}_${config.difficulty.toUpperCase()}_${Date.now()}`,
                        title: challenge.title,
                        scenario_text: challenge.scenarioText,
                        category: challenge.category,
                        difficulty: challenge.difficulty,
                        min_roles_required: challenge.minRolesRequired,
                        max_roles_allowed: challenge.maxRolesAllowed,
                        time_pressure_level: challenge.timePressureLevel,
                        base_difficulty_score: challenge.baseDifficultyScore,
                        perfect_score: challenge.perfectScore,
                        failure_threshold: challenge.failureThreshold,
                        required_roles: challenge.requiredRoles,
                        recommended_roles: challenge.recommendedRoles,
                        restricted_roles: challenge.restrictedRoles,
                        skill_connections: challenge.skillConnections,
                        learning_outcomes: challenge.learningOutcomes,
                        real_world_example: challenge.realWorldExample,
                        ai_generated: true,
                        human_reviewed: false
                    });

                if (error) {
                    console.log(`     ❌ Failed: ${error.message}`);
                } else {
                    console.log(`     ✅ Created: ${challenge.title}`);
                }
            } catch (error) {
                console.log(`     ❌ Generation failed: ${error.message}`);
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // 4. GENERATE SYNERGIES with complete data
        console.log('\n4️⃣ Generating Synergies with complete data...\n');

        if (generatedRoles.length >= 2) {
            // Create diverse synergies
            const synergyPairs = [
                // Entry + Specialist synergy
                {
                    roles: [
                        generatedRoles.find(r => r.rarity === 'common')?.role_name,
                        generatedRoles.find(r => r.rarity === 'uncommon')?.role_name
                    ].filter(Boolean),
                    type: 'Mentorship'
                },
                // Specialist + Senior synergy
                {
                    roles: [
                        generatedRoles.find(r => r.rarity === 'uncommon')?.role_name,
                        generatedRoles.find(r => r.rarity === 'rare')?.role_name
                    ].filter(Boolean),
                    type: 'Collaboration'
                },
                // Senior + Leader synergy
                {
                    roles: [
                        generatedRoles.find(r => r.rarity === 'rare')?.role_name,
                        generatedRoles.find(r => r.rarity === 'epic')?.role_name
                    ].filter(Boolean),
                    type: 'Leadership'
                },
                // Cross-level team synergy (3 roles)
                {
                    roles: [
                        generatedRoles.find(r => r.rarity === 'common')?.role_name,
                        generatedRoles.find(r => r.rarity === 'uncommon')?.role_name,
                        generatedRoles.find(r => r.rarity === 'rare')?.role_name
                    ].filter(Boolean),
                    type: 'Complete Team'
                }
            ];

            for (const synergyConfig of synergyPairs) {
                if (synergyConfig.roles.length >= 2) {
                    console.log(`   Generating ${synergyConfig.type} synergy for ${synergyConfig.roles.length} roles...`);

                    const synergyPrompt = `Create a ${synergyConfig.type} synergy for ${name} industry.
Roles: ${synergyConfig.roles.join(', ')}

Generate comprehensive synergy:
{
  "synergyName": "Creative name that reflects ${synergyConfig.type}",
  "synergyType": "additive",
  "powerBonus": ${synergyConfig.roles.length === 2 ? '5-8' : '8-12'},
  "powerMultiplier": 1.0,
  "description": "How these roles work together in ${name}",
  "explanation": "Why this synergy makes sense professionally",
  "realWorldExample": "In real ${name} companies, this happens when...",
  "activationMessage": "✨ ${synergyConfig.type} Activated! [exciting message]",
  "visualEffect": "${code}_synergy",
  "categoryBonuses": {
    "${industryMetadata.challenge_categories[0]}": ${synergyConfig.roles.length === 2 ? 2 : 3},
    "${industryMetadata.challenge_categories[1]}": ${synergyConfig.roles.length === 2 ? 1 : 2}
  },
  "activationChance": 1.0
}`;

                    try {
                        const synergy = await callAzureOpenAI(synergyPrompt, 500);

                        const { error } = await supabase
                            .from('cc_synergies')
                            .insert({
                                industry_id: industryId,
                                synergy_name: synergy.synergyName,
                                synergy_type: synergy.synergyType,
                                required_roles: synergyConfig.roles,
                                optional_roles: [],
                                power_bonus: synergy.powerBonus,
                                power_multiplier: synergy.powerMultiplier,
                                category_bonuses: synergy.categoryBonuses || {},
                                description: synergy.description,
                                explanation: synergy.explanation,
                                real_world_example: synergy.realWorldExample,
                                activation_chance: synergy.activationChance || 1.0
                            });

                        if (error) {
                            console.log(`     ❌ Failed: ${error.message}`);
                        } else {
                            console.log(`     ✅ Created: ${synergy.synergyName} (+${synergy.powerBonus})`);
                        }
                    } catch (error) {
                        console.log(`     ❌ Generation failed: ${error.message}`);
                    }

                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        // 5. SUMMARY
        console.log('\n' + '=' .repeat(60));
        console.log(`✅ ${name} Industry Generation Complete!`);
        console.log('=' .repeat(60));

        // Get final counts
        const { count: roleCount } = await supabase
            .from('cc_role_cards')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industryId);

        const { count: challengeCount } = await supabase
            .from('cc_challenges')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industryId);

        const { count: synergyCount } = await supabase
            .from('cc_synergies')
            .select('*', { count: 'exact', head: true })
            .eq('industry_id', industryId);

        console.log(`\n📊 Final Statistics:`);
        console.log(`   • Role Cards: ${roleCount}`);
        console.log(`   • Challenges: ${challengeCount}`);
        console.log(`   • Synergies: ${synergyCount}`);
        console.log(`   • Categories: ${industryMetadata.challenge_categories.length}`);
        console.log(`   • Color Scheme: ${industryMetadata.color_scheme.primary}`);

        return {
            industryId,
            stats: {
                roles: roleCount,
                challenges: challengeCount,
                synergies: synergyCount
            }
        };

    } catch (error) {
        console.error(`\n❌ Error generating ${name} industry:`, error);
        throw error;
    }
}

// Main execution
async function main() {
    console.log('🚀 Complete Industry Generation System\n');
    console.log('This will generate industries with ALL required fields\n');

    if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
        console.error('❌ Missing Azure OpenAI configuration');
        console.log('Required environment variables:');
        console.log('  - VITE_AZURE_OPENAI_ENDPOINT');
        console.log('  - VITE_AZURE_OPENAI_API_KEY');
        console.log('  - VITE_AZURE_OPENAI_DEPLOYMENT');
        return;
    }

    // Define industries to generate
    const industries = [
        {
            code: 'healthcare',
            name: 'Healthcare',
            icon: '🏥',
            description: 'Medical professionals saving lives and advancing health'
        },
        {
            code: 'technology',
            name: 'Technology',
            icon: '💻',
            description: 'Software development and digital innovation'
        },
        {
            code: 'finance',
            name: 'Finance',
            icon: '💰',
            description: 'Financial services, investment, and economic management'
        },
        {
            code: 'education',
            name: 'Education',
            icon: '📚',
            description: 'Teaching, learning, and academic excellence'
        },
        {
            code: 'engineering',
            name: 'Engineering',
            icon: '⚙️',
            description: 'Design, build, and innovate solutions to complex problems'
        }
    ];

    // Generate one industry at a time
    for (const industry of industries) {
        try {
            await generateCompleteIndustry(industry);
            console.log('\n⏳ Waiting before next industry...\n');
            await new Promise(resolve => setTimeout(resolve, 5000));
        } catch (error) {
            console.error(`Failed to generate ${industry.name}:`, error.message);
        }
    }

    console.log('\n🎉 All industries generated successfully!');
}

// Export for use in other scripts
export default generateCompleteIndustry;

// Run if executed directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
    main();
}