/**
 * Check synergy-related tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSynergyTables() {
    console.log('🔍 Checking Synergy Tables\n');
    console.log('=' .repeat(60));

    // Check cc_synergies
    const { data: synergies, count: synergyCount } = await supabase
        .from('cc_synergies')
        .select('*', { count: 'exact' });

    console.log(`\n📋 cc_synergies table:`);
    console.log(`   Total rows: ${synergyCount || 0}`);

    if (synergies && synergies.length > 0) {
        console.log('\n   Sample synergies:');
        synergies.slice(0, 3).forEach(s => {
            console.log(`   • ${s.synergy_name}: +${s.power_bonus}`);
            console.log(`     Required: ${s.required_roles.join(', ')}`);
        });
    }

    // Try to check if cc_synergy_definitions exists
    try {
        const { data: definitions, error, count } = await supabase
            .from('cc_synergy_definitions')
            .select('*', { count: 'exact' });

        if (!error) {
            console.log(`\n📋 cc_synergy_definitions table:`);
            console.log(`   Total rows: ${count || 0}`);
            console.log('   ⚠️  This table exists but may not be used by our system');
            console.log('   ℹ️  Our system uses cc_synergies table for synergy data');
        }
    } catch (e) {
        console.log('\n📋 cc_synergy_definitions: Table does not exist or is not accessible');
    }

    // Show the tables we're actually using
    console.log('\n' + '=' .repeat(60));
    console.log('📌 TABLES USED BY OUR SYSTEM:');
    console.log('   • cc_industries - Industry definitions');
    console.log('   • cc_role_cards - Role/character cards');
    console.log('   • cc_challenges - Game challenges');
    console.log('   • cc_synergies - Synergy bonuses (THIS IS WHERE SYNERGIES ARE STORED)');
    console.log('   • cc_game_sessions - Multiplayer sessions');
    console.log('   • cc_game_session_players - Players in sessions');
    console.log('   • cc_challenge_progress - Progress tracking');
    console.log('   • cc_trading_market - Card trading');
    console.log('   • cc_ai_content_cache - AI generation cache');

    console.log('\n💡 NOTE: cc_synergy_definitions may be from an older schema.');
    console.log('   The active synergy data is in cc_synergies table.');
}

checkSynergyTables();