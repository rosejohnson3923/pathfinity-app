/**
 * Reset all Career Challenge content
 * This will delete ALL data to prepare for fresh AI generation
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetAllContent() {
    console.log('🗑️  RESETTING ALL CAREER CHALLENGE CONTENT\n');
    console.log('=' .repeat(60));
    console.log('⚠️  This will DELETE all data from:');
    console.log('   • cc_industries');
    console.log('   • cc_role_cards');
    console.log('   • cc_challenges');
    console.log('   • cc_synergies');
    console.log('   • cc_game_sessions');
    console.log('   • cc_game_session_players');
    console.log('   • cc_challenge_progress');
    console.log('   • cc_trading_market');
    console.log('   • cc_ai_content_cache');
    console.log('=' .repeat(60));

    try {
        // Delete in order to respect foreign key constraints
        console.log('\n🔄 Starting deletion process...\n');

        // 1. Delete game session related data
        console.log('Deleting game session players...');
        const { error: playersError } = await supabase
            .from('cc_game_session_players')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (playersError) console.log('   ⚠️', playersError.message);
        else console.log('   ✅ Deleted');

        console.log('Deleting challenge progress...');
        const { error: progressError } = await supabase
            .from('cc_challenge_progress')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (progressError) console.log('   ⚠️', progressError.message);
        else console.log('   ✅ Deleted');

        console.log('Deleting game sessions...');
        const { error: sessionsError } = await supabase
            .from('cc_game_sessions')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (sessionsError) console.log('   ⚠️', sessionsError.message);
        else console.log('   ✅ Deleted');

        // 2. Delete trading market
        console.log('Deleting trading market...');
        const { error: marketError } = await supabase
            .from('cc_trading_market')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (marketError) console.log('   ⚠️', marketError.message);
        else console.log('   ✅ Deleted');

        // 3. Delete content
        console.log('Deleting synergies...');
        const { error: synergiesError } = await supabase
            .from('cc_synergies')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (synergiesError) console.log('   ⚠️', synergiesError.message);
        else console.log('   ✅ Deleted');

        console.log('Deleting challenges...');
        const { error: challengesError } = await supabase
            .from('cc_challenges')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (challengesError) console.log('   ⚠️', challengesError.message);
        else console.log('   ✅ Deleted');

        console.log('Deleting role cards...');
        const { error: rolesError } = await supabase
            .from('cc_role_cards')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (rolesError) console.log('   ⚠️', rolesError.message);
        else console.log('   ✅ Deleted');

        // 4. Delete AI cache
        console.log('Deleting AI content cache...');
        const { error: cacheError } = await supabase
            .from('cc_ai_content_cache')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (cacheError) console.log('   ⚠️', cacheError.message);
        else console.log('   ✅ Deleted');

        // 5. Delete industries
        console.log('Deleting industries...');
        const { error: industriesError } = await supabase
            .from('cc_industries')
            .delete()
            .gte('id', '00000000-0000-0000-0000-000000000000');
        if (industriesError) console.log('   ⚠️', industriesError.message);
        else console.log('   ✅ Deleted');

        // Verify deletion
        console.log('\n📊 Verifying deletion...\n');

        const tables = [
            'cc_industries',
            'cc_role_cards',
            'cc_challenges',
            'cc_synergies',
            'cc_game_sessions',
            'cc_game_session_players',
            'cc_challenge_progress',
            'cc_trading_market',
            'cc_ai_content_cache'
        ];

        let allEmpty = true;
        for (const table of tables) {
            const { count } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            const status = count === 0 ? '✅' : '❌';
            console.log(`   ${status} ${table}: ${count || 0} rows`);
            if (count > 0) allEmpty = false;
        }

        if (allEmpty) {
            console.log('\n' + '=' .repeat(60));
            console.log('✅ SUCCESS: All tables are now empty!');
            console.log('=' .repeat(60));
            console.log('\n📝 Next steps:');
            console.log('   1. Run: node generate-complete-industry.js');
            console.log('   2. This will generate all industries with complete fields');
            console.log('   3. All content will be AI-generated and consistent');
        } else {
            console.log('\n⚠️  WARNING: Some tables still have data');
            console.log('   You may need to run this script again');
        }

    } catch (error) {
        console.error('\n❌ Error during reset:', error);
    }
}

// Main execution with confirmation
console.log('🚨 CAREER CHALLENGE CONTENT RESET 🚨\n');
console.log('This will DELETE ALL existing content!');
console.log('The database will be completely empty.');
console.log('\nStarting in 5 seconds...');
console.log('Press Ctrl+C to cancel\n');

setTimeout(() => {
    resetAllContent();
}, 5000);