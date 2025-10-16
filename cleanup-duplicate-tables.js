/**
 * Identify and prepare cleanup of duplicate tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupDuplicateTables() {
    console.log('🧹 DUPLICATE TABLE CLEANUP ANALYSIS\n');
    console.log('=' .repeat(60));

    const duplicateTables = [];
    const sqlCommands = [];

    // 1. Check synergy-related tables
    console.log('📋 SYNERGY TABLES:\n');

    // cc_synergies (KEEP THIS ONE)
    try {
        const { count } = await supabase
            .from('cc_synergies')
            .select('*', { count: 'exact', head: true });
        console.log(`✅ cc_synergies (ACTIVE): ${count || 0} rows - KEEP THIS`);
    } catch (e) {}

    // cc_synergy_definitions (DUPLICATE)
    try {
        const { count } = await supabase
            .from('cc_synergy_definitions')
            .select('*', { count: 'exact', head: true });
        console.log(`❌ cc_synergy_definitions (DUPLICATE): ${count || 0} rows - DELETE`);
        if (count === 0) {
            duplicateTables.push('cc_synergy_definitions');
            sqlCommands.push('DROP TABLE IF EXISTS cc_synergy_definitions CASCADE;');
        }
    } catch (e) {}

    // 2. Check trading-related tables
    console.log('\n📋 TRADING TABLES:\n');

    // cc_trading_market (KEEP THIS ONE)
    try {
        const { count } = await supabase
            .from('cc_trading_market')
            .select('*', { count: 'exact', head: true });
        console.log(`✅ cc_trading_market (ACTIVE): ${count || 0} rows - KEEP THIS`);
    } catch (e) {}

    // Check potential duplicates
    const tradingDuplicates = [
        'cc_trading_post',
        'cc_trades',
        'cc_trading',
        'cc_trade_history',
        'cc_marketplace'
    ];

    for (const table of tradingDuplicates) {
        try {
            const { count, error } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                console.log(`❌ ${table} (DUPLICATE): ${count || 0} rows - DELETE`);
                if (count === 0) {
                    duplicateTables.push(table);
                    sqlCommands.push(`DROP TABLE IF EXISTS ${table} CASCADE;`);
                } else {
                    console.log(`   ⚠️  Has data - review before deleting`);
                }
            }
        } catch (e) {
            // Table doesn't exist
        }
    }

    // 3. Summary and SQL commands
    console.log('\n' + '=' .repeat(60));
    console.log('📊 SUMMARY:\n');

    console.log('✅ TABLES TO KEEP (Our Active Schema):');
    console.log('   • cc_industries');
    console.log('   • cc_role_cards');
    console.log('   • cc_challenges');
    console.log('   • cc_synergies');
    console.log('   • cc_trading_market');
    console.log('   • cc_game_sessions');
    console.log('   • cc_game_session_players');
    console.log('   • cc_challenge_progress');
    console.log('   • cc_ai_content_cache');

    if (duplicateTables.length > 0) {
        console.log('\n❌ TABLES TO DELETE (Empty Duplicates):');
        duplicateTables.forEach(table => {
            console.log(`   • ${table}`);
        });

        console.log('\n' + '=' .repeat(60));
        console.log('🗑️  SQL CLEANUP COMMANDS:\n');
        console.log('-- Run these commands in Supabase SQL editor:\n');
        sqlCommands.forEach(cmd => {
            console.log(cmd);
        });
    } else {
        console.log('\n✨ No duplicate tables found to delete!');
    }

    console.log('\n' + '=' .repeat(60));
    console.log('💡 After cleanup, your schema will be clean and consistent!');
}

cleanupDuplicateTables();