/**
 * Generate Finance Industry Content using Azure OpenAI
 * Smaller batches to avoid timeouts
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Azure OpenAI configuration
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
                    content: 'You are a creative game designer creating educational content about Finance careers for students. Always respond with valid JSON only.'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            max_tokens: 600,
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

async function generateFinanceContent() {
    console.log('💰 Generating Finance Industry Content...\n');

    try {
        // Get or create Finance industry
        let { data: industry } = await supabase
            .from('cc_industries')
            .select('id')
            .eq('code', 'finance')
            .single();

        if (!industry) {
            console.log('Creating Finance industry...');
            const { data: newIndustry } = await supabase
                .from('cc_industries')
                .insert({
                    code: 'finance',
                    name: 'Finance',
                    icon: '💰',
                    description: 'Financial services and investment'
                })
                .select()
                .single();
            industry = newIndustry;
        }

        const industryId = industry.id;
        console.log(`✅ Using Finance industry: ${industryId}\n`);

        // Generate 3 Finance Role Cards (smaller batch)
        const rolePrompts = [
            { name: 'Financial Analyst', rarity: 'uncommon', power: { min: 4, max: 6 } },
            { name: 'Investment Banker', rarity: 'rare', power: { min: 6, max: 8 } },
            { name: 'CFO', rarity: 'legendary', power: { min: 9, max: 10 } }
        ];

        console.log('🎯 Generating Role Cards...\n');
        const generatedRoles = [];

        for (const roleData of rolePrompts) {
            console.log(`📋 Generating ${roleData.name}...`);

            const prompt = `Create a Finance industry role card for a ${roleData.name}.
Rarity: ${roleData.rarity}
Power: ${roleData.power.min}-${roleData.power.max}

Generate JSON with these exact fields:
{
  "roleName": "${roleData.name}",
  "roleTitle": "creative title with character name",
  "description": "50-80 word description",
  "rarity": "${roleData.rarity}",
  "basePower": ${roleData.power.min} to ${roleData.power.max},
  "categoryBonuses": {
    "Finance": 2-4,
    "Analysis": 1-3,
    "Strategy": 1-3
  },
  "specialAbilities": ["ability1", "ability2"],
  "flavorText": "finance-related quote",
  "backstory": "brief background",
  "keySkills": ["skill1", "skill2", "skill3"],
  "educationRequirements": ["requirement1", "requirement2"],
  "salaryRange": "$XX,XXX - $XXX,XXX"
}`;

            try {
                const roleCard = await callAzureOpenAI(prompt);

                const { data: savedRole, error } = await supabase
                    .from('cc_role_cards')
                    .insert({
                        industry_id: industryId,
                        role_code: `FIN_${roleData.name.replace(/\s+/g, '_').toUpperCase()}_${Date.now()}`,
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

        // Generate 2 Finance Challenges
        console.log('\n🎮 Generating Challenges...\n');

        const challengePrompts = [
            { difficulty: 'medium', category: 'Investment Strategy', theme: 'Portfolio management' },
            { difficulty: 'hard', category: 'Risk Management', theme: 'Market volatility' }
        ];

        for (const challengeData of challengePrompts) {
            console.log(`📝 Generating ${challengeData.difficulty} challenge...`);

            const prompt = `Create a Finance industry challenge.
Difficulty: ${challengeData.difficulty}
Category: ${challengeData.category}
Theme: ${challengeData.theme}

Generate JSON:
{
  "title": "engaging title (max 50 chars)",
  "scenarioText": "scenario description (80-120 words)",
  "category": "${challengeData.category}",
  "difficulty": "${challengeData.difficulty}",
  "minRolesRequired": ${challengeData.difficulty === 'medium' ? 3 : 4},
  "maxRolesAllowed": ${challengeData.difficulty === 'medium' ? 4 : 5},
  "baseDifficultyScore": ${challengeData.difficulty === 'medium' ? 25 : 40},
  "perfectScore": ${challengeData.difficulty === 'medium' ? 35 : 50},
  "failureThreshold": ${challengeData.difficulty === 'medium' ? 15 : 25},
  "skillConnections": ["skill1", "skill2", "skill3"],
  "learningOutcomes": ["outcome1", "outcome2"],
  "realWorldExample": "real-world connection"
}`;

            try {
                const challenge = await callAzureOpenAI(prompt);

                const { error } = await supabase
                    .from('cc_challenges')
                    .insert({
                        industry_id: industryId,
                        challenge_code: `FIN_${challengeData.difficulty.toUpperCase()}_${Date.now()}`,
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

        // Generate 1 Finance Synergy
        if (generatedRoles.length >= 2) {
            console.log('\n🤝 Generating Synergy...\n');
            console.log(`🔗 Creating synergy for ${generatedRoles[0]} + ${generatedRoles[1]}...`);

            const prompt = `Create a synergy for Finance roles: ${generatedRoles[0]} and ${generatedRoles[1]}

Generate JSON:
{
  "synergyName": "creative finance synergy name",
  "description": "what happens when they work together",
  "explanation": "why this makes sense",
  "powerBonus": 6 to 8,
  "requiredRoles": ${JSON.stringify([generatedRoles[0], generatedRoles[1]])},
  "realWorldExample": "real-world example"
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
                        activation_message: `💰 ${synergy.synergyName} Activated!`,
                        visual_effect: 'finance_synergy'
                    });

                if (error) {
                    console.log(`❌ Failed to save synergy: ${error.message}`);
                } else {
                    console.log(`✅ Created: ${synergy.synergyName} (+${synergy.powerBonus})`);
                }
            } catch (error) {
                console.log(`❌ Failed to generate synergy: ${error.message}`);
            }
        }

        console.log('\n✨ Finance content generation complete!');
        console.log('💰 The Finance industry pack is ready to play!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the generation
console.log('🚀 Starting Finance Industry Content Generation\n');
generateFinanceContent();