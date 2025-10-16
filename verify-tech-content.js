/**
 * Verify Technology Content Generation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyTechContent() {
    console.log('🔍 Verifying Technology Industry Content...\n');

    // Get Technology industry
    const { data: industry } = await supabase
        .from('cc_industries')
        .select('*')
        .eq('code', 'technology')
        .single();

    if (!industry) {
        console.log('❌ Technology industry not found');
        return;
    }

    console.log(`✅ Technology Industry: ${industry.name} (${industry.id})`);

    // Check role cards
    const { data: roles } = await supabase
        .from('cc_role_cards')
        .select('*')
        .eq('industry_id', industry.id)
        .order('base_power');

    console.log(`\n📋 Technology Role Cards (${roles.length} total):`);
    roles.forEach(role => {
        console.log(`   - ${role.role_name}: Power ${role.base_power} (${role.rarity})`);
        if (role.special_abilities && role.special_abilities.length > 0) {
            console.log(`     Abilities: ${role.special_abilities.join(', ')}`);
        }
    });

    // Check challenges
    const { data: challenges } = await supabase
        .from('cc_challenges')
        .select('*')
        .eq('industry_id', industry.id);

    console.log(`\n🎮 Technology Challenges (${challenges.length} total):`);
    challenges.forEach(challenge => {
        console.log(`   - ${challenge.title} (${challenge.difficulty})`);
        console.log(`     Category: ${challenge.category}`);
    });

    // Check synergies
    const { data: synergies } = await supabase
        .from('cc_synergies')
        .select('*')
        .eq('industry_id', industry.id);

    console.log(`\n🤝 Technology Synergies (${synergies.length} total):`);
    synergies.forEach(synergy => {
        console.log(`   - ${synergy.synergy_name}: +${synergy.power_bonus}`);
        console.log(`     Required: ${synergy.required_roles.join(' + ')}`);
    });

    // Check AI cache
    const { data: cacheEntries } = await supabase
        .from('cc_ai_content_cache')
        .select('content_type, content_key, created_at')
        .eq('industry_code', 'technology')
        .order('created_at', { ascending: false })
        .limit(5);

    console.log(`\n💾 AI Cache Entries (${cacheEntries?.length || 0} recent):`);
    cacheEntries?.forEach(entry => {
        console.log(`   - ${entry.content_type}: ${new Date(entry.created_at).toLocaleString()}`);
    });

    console.log('\n✨ Technology content verification complete!');
}

verifyTechContent();