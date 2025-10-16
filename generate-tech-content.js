/**
 * Generate Technology Industry Content using Azure OpenAI
 * Uses environment variables directly (no Key Vault)
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Azure OpenAI configuration from .env
const AZURE_ENDPOINT = process.env.VITE_AZURE_OPENAI_ENDPOINT;
const AZURE_API_KEY = process.env.VITE_AZURE_OPENAI_API_KEY;
const DEPLOYMENT = process.env.VITE_AZURE_OPENAI_DEPLOYMENT || 'gpt-4';

async function callAzureOpenAI(prompt) {
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
                    content: 'You are a creative game designer creating educational content for Career Challenge, a career exploration game for students. Always respond with valid JSON only, no markdown formatting.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 800,
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

async function generateTechnologyContent() {
    console.log('💻 Generating Technology Industry Content...\n');

    try {
        // Get or create Technology industry
        let { data: industry } = await supabase
            .from('cc_industries')
            .select('id')
            .eq('code', 'technology')
            .single();

        if (!industry) {
            console.log('Creating Technology industry...');
            const { data: newIndustry } = await supabase
                .from('cc_industries')
                .insert({
                    code: 'technology',
                    name: 'Technology',
                    icon: '💻',
                    description: 'Software development and tech innovation'
                })
                .select()
                .single();
            industry = newIndustry;
        }

        const industryId = industry.id;
        console.log(`✅ Using Technology industry: ${industryId}\n`);

        // Generate 5 Technology Role Cards
        const rolePrompts = [
            { name: 'Junior Developer', rarity: 'common', power: { min: 3, max: 4 } },
            { name: 'Full-Stack Developer', rarity: 'uncommon', power: { min: 4, max: 6 } },
            { name: 'DevOps Engineer', rarity: 'rare', power: { min: 6, max: 8 } },
            { name: 'Tech Lead', rarity: 'epic', power: { min: 7, max: 9 } },
            { name: 'CTO', rarity: 'legendary', power: { min: 9, max: 10 } }
        ];

        console.log('🎯 Generating Role Cards...\n');
        const generatedRoles = [];

        for (const roleData of rolePrompts) {
            console.log(`📋 Generating ${roleData.name}...`);

            const prompt = `Create a Technology industry role card for a ${roleData.name}.
Rarity: ${roleData.rarity}
Power: ${roleData.power.min}-${roleData.power.max}

Generate a JSON object with:
{
  "roleName": "exact role name",
  "roleTitle": "creative title with name",
  "description": "50-100 word description of the role",
  "rarity": "${roleData.rarity}",
  "basePower": ${roleData.power.min} to ${roleData.power.max},
  "categoryBonuses": {
    "Technical": 0-4,
    "Management": 0-3,
    "Innovation": 0-3
  },
  "specialAbilities": ["ability1", "ability2"],
  "flavorText": "inspirational quote",
  "backstory": "brief character background",
  "keySkills": ["skill1", "skill2", "skill3", "skill4"],
  "educationRequirements": ["requirement1", "requirement2"],
  "salaryRange": "$XX,XXX - $XXX,XXX"
}`;

            try {
                const roleCard = await callAzureOpenAI(prompt);

                // Store in database
                const { data: savedRole, error } = await supabase
                    .from('cc_role_cards')
                    .insert({
                        industry_id: industryId,
                        role_code: `TECH_${roleData.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
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
                        salary_range: roleCard.salaryRange
                    })
                    .select()
                    .single();

                if (error) {
                    console.log(`❌ Failed to save: ${error.message}`);
                } else {
                    console.log(`✅ Created: ${savedRole.role_name} (Power: ${savedRole.base_power})`);
                    generatedRoles.push(savedRole.role_name);
                }
            } catch (error) {
                console.log(`❌ Failed to generate: ${error.message}`);
            }
        }

        // Generate Technology Challenges
        console.log('\n🎮 Generating Challenges...\n');

        const challengePrompts = [
            { difficulty: 'easy', category: 'Bug Fix', theme: 'Debugging code issues' },
            { difficulty: 'medium', category: 'Feature Development', theme: 'Building new features' },
            { difficulty: 'hard', category: 'System Architecture', theme: 'Designing scalable systems' }
        ];

        for (const challengeData of challengePrompts) {
            console.log(`📝 Generating ${challengeData.difficulty} challenge...`);

            const prompt = `Create a Technology industry challenge.
Difficulty: ${challengeData.difficulty}
Category: ${challengeData.category}
Theme: ${challengeData.theme}

Generate a JSON object with:
{
  "title": "engaging title (max 50 chars)",
  "scenarioText": "detailed scenario (100-200 words)",
  "category": "${challengeData.category}",
  "difficulty": "${challengeData.difficulty}",
  "minRolesRequired": ${challengeData.difficulty === 'easy' ? 2 : challengeData.difficulty === 'medium' ? 3 : 4},
  "maxRolesAllowed": ${challengeData.difficulty === 'easy' ? 3 : challengeData.difficulty === 'medium' ? 4 : 5},
  "baseDifficultyScore": ${challengeData.difficulty === 'easy' ? 12 : challengeData.difficulty === 'medium' ? 25 : 40},
  "perfectScore": ${challengeData.difficulty === 'easy' ? 20 : challengeData.difficulty === 'medium' ? 35 : 50},
  "failureThreshold": ${challengeData.difficulty === 'easy' ? 8 : challengeData.difficulty === 'medium' ? 15 : 25},
  "skillConnections": ["skill1", "skill2", "skill3"],
  "learningOutcomes": ["outcome1", "outcome2"],
  "realWorldExample": "brief real-world connection"
}`;

            try {
                const challenge = await callAzureOpenAI(prompt);

                const { error } = await supabase
                    .from('cc_challenges')
                    .insert({
                        industry_id: industryId,
                        challenge_code: `TECH_${challengeData.difficulty.toUpperCase()}_${Date.now()}`,
                        title: challenge.title,
                        scenario_text: challenge.scenarioText,
                        category: challenge.category,
                        difficulty: challenge.difficulty,
                        min_roles_required: challenge.minRolesRequired,
                        max_roles_allowed: challenge.maxRolesAllowed,
                        base_difficulty_score: challenge.baseDifficultyScore,
                        perfect_score: challenge.perfectScore,
                        failure_threshold: challenge.failureThreshold,
                        skill_connections: challenge.skillConnections,
                        learning_outcomes: challenge.learningOutcomes,
                        real_world_example: challenge.realWorldExample
                    });

                if (error) {
                    console.log(`❌ Failed to save: ${error.message}`);
                } else {
                    console.log(`✅ Created: ${challenge.title}`);
                }
            } catch (error) {
                console.log(`❌ Failed to generate: ${error.message}`);
            }
        }

        // Generate Technology Synergies
        console.log('\n🤝 Generating Synergies...\n');

        if (generatedRoles.length >= 2) {
            const synergyPairs = [
                { roles: [generatedRoles[0], generatedRoles[1]], name: 'Agile Development Team' },
                { roles: [generatedRoles[2], generatedRoles[3]], name: 'Infrastructure Excellence' }
            ];

            for (const synergyData of synergyPairs) {
                if (synergyData.roles.every(r => r)) {
                    console.log(`🔗 Generating synergy for ${synergyData.roles.join(' + ')}...`);

                    const prompt = `Create a synergy for these Technology roles: ${synergyData.roles.join(', ')}
Suggested name: ${synergyData.name}

Generate a JSON object with:
{
  "synergyName": "creative synergy name",
  "description": "what happens when these roles work together",
  "explanation": "why this synergy makes sense",
  "powerBonus": 5 to 10,
  "requiredRoles": ${JSON.stringify(synergyData.roles)},
  "realWorldExample": "real-world example of this team dynamic"
}`;

                    try {
                        const synergy = await callAzureOpenAI(prompt);

                        const { error } = await supabase
                            .from('cc_synergies')
                            .insert({
                                industry_id: industryId,
                                synergy_name: synergy.synergyName,
                                synergy_type: 'additive',
                                required_roles: synergy.requiredRoles,
                                power_bonus: synergy.powerBonus,
                                power_multiplier: 1.0,
                                description: synergy.description,
                                explanation: synergy.explanation,
                                real_world_example: synergy.realWorldExample,
                                activation_message: `💻 ${synergy.synergyName} Activated!`,
                                visual_effect: 'tech_synergy'
                            });

                        if (error) {
                            console.log(`❌ Failed to save: ${error.message}`);
                        } else {
                            console.log(`✅ Created: ${synergy.synergyName} (+${synergy.powerBonus})`);
                        }
                    } catch (error) {
                        console.log(`❌ Failed to generate: ${error.message}`);
                    }
                }
            }
        }

        console.log('\n✨ Technology content generation complete!');
        console.log('🎮 The Technology industry pack is ready to play!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the generation
console.log('🚀 Starting Technology Industry Content Generation\n');
console.log('Using Azure OpenAI from environment variables...\n');

if (!AZURE_ENDPOINT || !AZURE_API_KEY) {
    console.error('❌ Missing Azure OpenAI configuration in .env file');
    console.log('Required variables:');
    console.log('  - VITE_AZURE_OPENAI_ENDPOINT');
    console.log('  - VITE_AZURE_OPENAI_API_KEY');
    console.log('  - VITE_AZURE_OPENAI_DEPLOYMENT (optional)');
} else {
    generateTechnologyContent();
}