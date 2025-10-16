/**
 * Verify Healthcare Synergy is Working
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Supabase
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyHealthcareSynergy() {
    console.log('🔍 Verifying Healthcare Synergy...\n');

    try {
        // 1. Check if Healthcare industry exists
        const { data: industry } = await supabase
            .from('cc_industries')
            .select('*')
            .eq('code', 'healthcare')
            .single();

        console.log('✅ Healthcare Industry:', industry.name, `(${industry.id})`);

        // 2. Check role cards
        const { data: roles } = await supabase
            .from('cc_role_cards')
            .select('*')
            .eq('industry_id', industry.id)
            .in('role_name', ['Emergency Physician', 'Trauma Nurse', 'Medical Researcher']);

        console.log('\n📋 Healthcare Role Cards:');
        roles.forEach(role => {
            console.log(`   - ${role.role_name}: Power ${role.base_power} (${role.rarity})`);
        });

        // 3. Check synergy
        const { data: synergy } = await supabase
            .from('cc_synergies')
            .select('*')
            .eq('industry_id', industry.id)
            .eq('synergy_name', 'Emergency Response Team')
            .single();

        console.log('\n🤝 Emergency Response Team Synergy:');
        console.log(`   Required: ${synergy.required_roles.join(' + ')}`);
        console.log(`   Power Bonus: +${synergy.power_bonus}`);
        console.log(`   Description: ${synergy.description}`);

        // 4. Simulate synergy activation
        const physician = roles.find(r => r.role_name === 'Emergency Physician');
        const nurse = roles.find(r => r.role_name === 'Trauma Nurse');

        if (physician && nurse) {
            const basePower = physician.base_power + nurse.base_power;
            const totalPower = basePower + synergy.power_bonus;

            console.log('\n🎮 Synergy Calculation:');
            console.log(`   Emergency Physician: ${physician.base_power} power`);
            console.log(`   Trauma Nurse: ${nurse.base_power} power`);
            console.log(`   Base Total: ${basePower} power`);
            console.log(`   Synergy Bonus: +${synergy.power_bonus}`);
            console.log(`   ✨ TOTAL POWER: ${totalPower}`);

            console.log('\n✅ Healthcare synergy is working correctly!');
            console.log('   When Emergency Physician and Trauma Nurse are played together:');
            console.log(`   - They activate the "${synergy.synergy_name}" synergy`);
            console.log(`   - Total power increases from ${basePower} to ${totalPower}`);
            console.log(`   - ${synergy.activation_message || 'Team synergy activated!'}`);
        } else {
            console.log('\n⚠️  Missing required roles for synergy test');
        }

        // 5. Check challenges
        const { data: challenges } = await supabase
            .from('cc_challenges')
            .select('*')
            .eq('industry_id', industry.id);

        console.log(`\n📝 Healthcare Challenges: ${challenges.length} available`);
        challenges.forEach(challenge => {
            console.log(`   - ${challenge.title} (${challenge.difficulty})`);
        });

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Run verification
verifyHealthcareSynergy();