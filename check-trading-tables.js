/**
 * Check for duplicate trading tables
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTradingTables() {
    console.log('🔍 Checking Trading-Related Tables\n');
    console.log('=' .repeat(60));

    // Check cc_trading_market
    console.log('📋 Checking cc_trading_market...');
    try {
        const { data: market, count: marketCount, error: marketError } = await supabase
            .from('cc_trading_market')
            .select('*', { count: 'exact' });

        if (!marketError) {
            console.log(`   ✅ Table exists`);
            console.log(`   Rows: ${marketCount || 0}`);

            if (market && market.length > 0) {
                console.log('   Sample columns:', Object.keys(market[0]).join(', '));
            }
        } else {
            console.log(`   ❌ Error: ${marketError.message}`);
        }
    } catch (e) {
        console.log('   ❌ Table does not exist or error accessing');
    }

    // Check cc_trading_post
    console.log('\n📋 Checking cc_trading_post...');
    try {
        const { data: post, count: postCount, error: postError } = await supabase
            .from('cc_trading_post')
            .select('*', { count: 'exact' });

        if (!postError) {
            console.log(`   ✅ Table exists`);
            console.log(`   Rows: ${postCount || 0}`);

            if (post && post.length > 0) {
                console.log('   Sample columns:', Object.keys(post[0]).join(', '));
            }
        } else {
            console.log(`   ❌ Error: ${postError.message}`);
        }
    } catch (e) {
        console.log('   ❌ Table does not exist or error accessing');
    }

    // Check for any other trading-related tables
    console.log('\n📋 Checking for other trading-related tables...');

    const potentialTables = [
        'cc_trades',
        'cc_trading',
        'cc_trade_history',
        'cc_marketplace'
    ];

    for (const tableName of potentialTables) {
        try {
            const { count, error } = await supabase
                .from(tableName)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                console.log(`   ⚠️  ${tableName} exists (${count || 0} rows)`);
            }
        } catch (e) {
            // Table doesn't exist, which is expected
        }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 ANALYSIS:');

    console.log('\n🎯 Tables in our Career Challenge system:');
    console.log('   • cc_trading_market - The active trading table');

    console.log('\n⚠️  Potentially unused/duplicate tables:');
    console.log('   • cc_trading_post - Check if this is a duplicate');

    console.log('\n💡 RECOMMENDATION:');
    console.log('   If cc_trading_post is empty and unused, it should be deleted');
    console.log('   to avoid confusion, just like cc_synergy_definitions');

    console.log('\n📝 SQL to check and clean up:');
    console.log('   -- Check if cc_trading_post has any data');
    console.log('   SELECT COUNT(*) FROM cc_trading_post;');
    console.log('');
    console.log('   -- If empty and unused, drop it');
    console.log('   DROP TABLE IF EXISTS cc_trading_post CASCADE;');
}

checkTradingTables();