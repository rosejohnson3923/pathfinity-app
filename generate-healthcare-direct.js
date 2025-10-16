/**
 * Direct Healthcare Content Generation using Azure OpenAI
 * This script directly creates content in the database without going through the API
 */

import { createClient } from '@supabase/supabase-js';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function generateHealthcareContent() {
    console.log('🏥 Generating Healthcare Content Directly...\n');

    try {
        // Get Healthcare industry ID
        const { data: industry, error: industryError } = await supabase
            .from('cc_industries')
            .select('id')
            .eq('code', 'healthcare')
            .single();

        if (industryError || !industry) {
            console.log('❌ Healthcare industry not found. Creating it...');

            const { data: newIndustry, error: createError } = await supabase
                .from('cc_industries')
                .insert({
                    code: 'healthcare',
                    name: 'Healthcare',
                    icon: '🏥',
                    description: 'Healthcare and medical professionals'
                })
                .select()
                .single();

            if (createError) {
                console.error('Failed to create industry:', createError);
                return;
            }

            industry.id = newIndustry.id;
            console.log('✅ Created Healthcare industry');
        }

        const industryId = industry.id;
        console.log(`✅ Using Healthcare industry: ${industryId}\n`);

        // 1. Create Emergency Physician role
        console.log('1️⃣ Creating Emergency Physician...');
        const { data: physician, error: physicianError } = await supabase
            .from('cc_role_cards')
            .insert({
                industry_id: industryId,
                role_code: 'EMERG_PHYS_001',
                role_name: 'Emergency Physician',
                role_title: 'Dr. Alex Chen - Emergency Medicine Specialist',
                description: 'Leads emergency response teams and makes critical decisions under pressure',
                rarity: 'rare',
                base_power: 7,
                category_bonuses: {
                    'Patient Care': 3,
                    'Emergency Response': 4,
                    'Medical Diagnosis': 3
                },
                special_abilities: [
                    'Critical Decision: +2 power when time is limited',
                    'Team Leader: Boosts adjacent medical staff by +1 power'
                ],
                flavor_text: '"Every second counts when lives are on the line."',
                backstory: 'After completing residency at Johns Hopkins, Dr. Chen specialized in emergency medicine and now leads the trauma team.',
                key_skills: ['Emergency Medicine', 'Trauma Care', 'Quick Decision Making', 'Team Leadership'],
                education_requirements: ['Medical Degree (MD/DO)', 'Emergency Medicine Residency', 'Board Certification'],
                salary_range: '$250,000 - $450,000'
            })
            .select()
            .single();

        if (physicianError) {
            console.log('❌ Failed to create Emergency Physician:', physicianError.message);
        } else {
            console.log('✅ Created:', physician.role_name);
            console.log('   Power:', physician.base_power);
            console.log('   Rarity:', physician.rarity);
        }

        // 2. Create Trauma Nurse role
        console.log('\n2️⃣ Creating Trauma Nurse...');
        const { data: nurse, error: nurseError } = await supabase
            .from('cc_role_cards')
            .insert({
                industry_id: industryId,
                role_code: 'TRAUMA_NURSE_001',
                role_name: 'Trauma Nurse',
                role_title: 'Sarah Martinez RN - Critical Care Specialist',
                description: 'Provides critical patient care and supports emergency procedures',
                rarity: 'uncommon',
                base_power: 5,
                category_bonuses: {
                    'Patient Care': 3,
                    'Emergency Response': 2,
                    'Medical Support': 2
                },
                special_abilities: [
                    'Rapid Response: +1 power during emergency challenges',
                    'Patient Advocate: Prevents one failure per game'
                ],
                flavor_text: '"Compassion and competence save lives."',
                backstory: 'With 10 years in the ER, Sarah has seen it all and remains calm under the most intense pressure.',
                key_skills: ['Emergency Nursing', 'Patient Assessment', 'IV Therapy', 'Crisis Management'],
                education_requirements: ['Bachelor of Science in Nursing', 'RN License', 'TNCC Certification'],
                salary_range: '$75,000 - $120,000'
            })
            .select()
            .single();

        if (nurseError) {
            console.log('❌ Failed to create Trauma Nurse:', nurseError.message);
        } else {
            console.log('✅ Created:', nurse.role_name);
            console.log('   Power:', nurse.base_power);
            console.log('   Rarity:', nurse.rarity);
        }

        // 3. Create Medical Researcher role
        console.log('\n3️⃣ Creating Medical Researcher...');
        const { data: researcher, error: researcherError } = await supabase
            .from('cc_role_cards')
            .insert({
                industry_id: industryId,
                role_code: 'MED_RESEARCHER_001',
                role_name: 'Medical Researcher',
                role_title: 'Dr. Kim Park - Clinical Research Lead',
                description: 'Conducts groundbreaking research to advance medical treatments',
                rarity: 'epic',
                base_power: 8,
                category_bonuses: {
                    'Research & Development': 4,
                    'Data Analysis': 3,
                    'Innovation': 3
                },
                special_abilities: [
                    'Breakthrough Discovery: Once per game, double your power',
                    'Evidence-Based: +2 power when paired with data analyst'
                ],
                flavor_text: '"Today\'s research is tomorrow\'s cure."',
                backstory: 'Dr. Park leads a team developing innovative treatments for rare diseases at the National Institutes of Health.',
                key_skills: ['Clinical Research', 'Data Analysis', 'Grant Writing', 'Publication'],
                education_requirements: ['PhD in Medical Sciences', 'Post-doctoral Fellowship', 'Research Publications'],
                salary_range: '$90,000 - $180,000'
            })
            .select()
            .single();

        if (researcherError) {
            console.log('❌ Failed to create Medical Researcher:', researcherError.message);
        } else {
            console.log('✅ Created:', researcher.role_name);
            console.log('   Power:', researcher.base_power);
            console.log('   Rarity:', researcher.rarity);
        }

        // 4. Create Healthcare Challenge
        console.log('\n4️⃣ Creating Healthcare Challenge...');
        const { data: challenge, error: challengeError } = await supabase
            .from('cc_challenges')
            .insert({
                industry_id: industryId,
                challenge_code: 'HC_EMERGENCY_001',
                title: 'Mass Casualty Incident',
                scenario_text: 'A major accident has brought 15 critical patients to your emergency department simultaneously. Your team must triage, treat, and stabilize patients while managing limited resources. Every decision affects patient outcomes.',
                category: 'Emergency Response',
                difficulty: 'hard',
                min_roles_required: 3,
                max_roles_allowed: 5,
                base_difficulty_score: 18,
                perfect_score: 25,
                failure_threshold: 12,
                skill_connections: ['Triage', 'Resource Management', 'Team Coordination', 'Quick Decision Making'],
                learning_outcomes: [
                    'Understanding triage protocols',
                    'Resource allocation in crisis',
                    'Importance of team communication',
                    'Emergency response procedures'
                ],
                real_world_example: 'Based on actual mass casualty protocols used in hospitals during natural disasters and major accidents.'
            })
            .select()
            .single();

        if (challengeError) {
            console.log('❌ Failed to create challenge:', challengeError.message);
        } else {
            console.log('✅ Created Challenge:', challenge.title);
            console.log('   Difficulty:', challenge.difficulty);
            console.log('   Min Roles:', challenge.min_roles_required);
        }

        // 5. Verify/Update Emergency Response Team synergy
        console.log('\n5️⃣ Checking Emergency Response Team Synergy...');

        // First check if it exists
        const { data: existingSynergy, error: checkError } = await supabase
            .from('cc_synergies')
            .select('*')
            .eq('industry_id', industryId)
            .eq('synergy_name', 'Emergency Response Team')
            .single();

        if (existingSynergy) {
            console.log('✅ Synergy already exists:', existingSynergy.synergy_name);
            console.log('   Required Roles:', existingSynergy.required_roles);
            console.log('   Power Bonus:', existingSynergy.power_bonus);
        } else {
            // Create the synergy
            const { data: synergy, error: synergyError } = await supabase
                .from('cc_synergies')
                .insert({
                    industry_id: industryId,
                    synergy_name: 'Emergency Response Team',
                    synergy_type: 'additive',
                    required_roles: ['Emergency Physician', 'Trauma Nurse'],
                    power_bonus: 8,
                    power_multiplier: 1.0,
                    description: 'When emergency medical professionals work together, their coordinated response saves lives',
                    explanation: 'The physician provides medical expertise and leadership while the nurse delivers critical patient care, creating a powerful emergency response team.',
                    real_world_example: 'Emergency departments rely on the seamless coordination between physicians and nurses to handle critical situations effectively.',
                    activation_message: '🚨 Emergency Response Team Activated! The physician and nurse work in perfect sync!',
                    visual_effect: 'medical_emergency'
                })
                .select()
                .single();

            if (synergyError) {
                console.log('❌ Failed to create synergy:', synergyError.message);
            } else {
                console.log('✅ Created Synergy:', synergy.synergy_name);
                console.log('   Required Roles:', synergy.required_roles);
                console.log('   Power Bonus:', synergy.power_bonus);
            }
        }

        console.log('\n✨ Healthcare content generation complete!');
        console.log('\n📊 Summary:');
        console.log('- Created Emergency Physician (Power: 7)');
        console.log('- Created Trauma Nurse (Power: 5)');
        console.log('- Created Medical Researcher (Power: 8)');
        console.log('- Created Mass Casualty Incident challenge');
        console.log('- Emergency Response Team synergy ready (+8 bonus)');
        console.log('\n🎮 Run test-career-challenge.html to see everything working!');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run the generation
generateHealthcareContent();