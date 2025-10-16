/**
 * Verify All Generated Content
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyAllContent() {
    console.log('🔍 Verifying All Career Challenge Content\n');
    console.log('=' .repeat(60));

    // Get all industries
    const { data: industries } = await supabase
        .from('cc_industries')
        .select('*')
        .order('name');

    for (const industry of industries) {
        console.log(`\n🏢 ${industry.name} Industry ${industry.icon}`);
        console.log('-'.repeat(40));

        // Role Cards
        const { data: roles } = await supabase
            .from('cc_role_cards')
            .select('role_name, base_power, rarity')
            .eq('industry_id', industry.id)
            .order('base_power');

        console.log(`\n📋 Role Cards (${roles.length}):`);
        if (roles.length > 0) {
            roles.forEach(role => {
                console.log(`   • ${role.role_name}: Power ${role.base_power} (${role.rarity})`);
            });
        } else {
            console.log('   No role cards');
        }

        // Challenges
        const { data: challenges } = await supabase
            .from('cc_challenges')
            .select('title, difficulty, category')
            .eq('industry_id', industry.id)
            .order('difficulty');

        console.log(`\n🎮 Challenges (${challenges.length}):`);
        if (challenges.length > 0) {
            challenges.forEach(challenge => {
                console.log(`   • ${challenge.title} - ${challenge.difficulty} (${challenge.category})`);
            });
        } else {
            console.log('   No challenges');
        }

        // Synergies
        const { data: synergies } = await supabase
            .from('cc_synergies')
            .select('synergy_name, power_bonus, required_roles')
            .eq('industry_id', industry.id)
            .order('power_bonus');

        console.log(`\n🤝 Synergies (${synergies.length}):`);
        if (synergies.length > 0) {
            synergies.forEach(synergy => {
                console.log(`   • ${synergy.synergy_name} (+${synergy.power_bonus})`);
                console.log(`     Requires: ${synergy.required_roles.join(' + ')}`);
            });
        } else {
            console.log('   No synergies');
        }
    }

    // Overall statistics
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 OVERALL STATISTICS:\n');

    const { count: totalRoles } = await supabase
        .from('cc_role_cards')
        .select('*', { count: 'exact', head: true });

    const { count: totalChallenges } = await supabase
        .from('cc_challenges')
        .select('*', { count: 'exact', head: true });

    const { count: totalSynergies } = await supabase
        .from('cc_synergies')
        .select('*', { count: 'exact', head: true });

    const { count: totalIndustries } = await supabase
        .from('cc_industries')
        .select('*', { count: 'exact', head: true });

    console.log(`   📦 Industries: ${totalIndustries}`);
    console.log(`   🎴 Role Cards: ${totalRoles}`);
    console.log(`   🎯 Challenges: ${totalChallenges}`);
    console.log(`   ⚡ Synergies: ${totalSynergies}`);

    // AI Generation Stats
    const { data: aiCache } = await supabase
        .from('cc_ai_content_cache')
        .select('industry_code, content_type')
        .order('created_at', { ascending: false });

    if (aiCache && aiCache.length > 0) {
        console.log(`\n   🤖 AI Generated Content:`);
        const aiStats = {};
        aiCache.forEach(item => {
            const key = `${item.industry_code}_${item.content_type}`;
            aiStats[key] = (aiStats[key] || 0) + 1;
        });

        Object.entries(aiStats).forEach(([key, count]) => {
            const [industry, type] = key.split('_');
            console.log(`      • ${industry} ${type}: ${count} generated`);
        });
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✨ Content verification complete!');
    console.log('\n🎮 Ready to play Career Challenge with:');
    console.log('   - Healthcare: Medical professionals and emergency teams');
    console.log('   - Technology: Software developers and tech leaders');
    console.log('   - Finance: Investment professionals and executives');
}

verifyAllContent();