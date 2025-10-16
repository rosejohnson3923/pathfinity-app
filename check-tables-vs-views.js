/**
 * Check if these are tables or views
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTablesVsViews() {
    console.log('🔍 Checking Tables vs Views\n');
    console.log('=' .repeat(60));

    // Query to check information schema
    const checkQuery = `
        SELECT
            table_name,
            table_type
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND (
            table_name LIKE 'cc_trad%'
            OR table_name LIKE 'cc_synerg%'
            OR table_name = 'cc_marketplace'
        )
        ORDER BY table_name;
    `;

    // Since we can't run raw SQL directly via Supabase client,
    // let's test each one to see behavior
    const itemsToCheck = [
        'cc_synergies',
        'cc_synergy_definitions',
        'cc_trading_market',
        'cc_trading_post',
        'cc_trades',
        'cc_trading',
        'cc_trade_history',
        'cc_marketplace'
    ];

    console.log('Testing each item to determine if it\'s a table or view:\n');

    for (const item of itemsToCheck) {
        try {
            // Try to select from it
            const { data, error, count } = await supabase
                .from(item)
                .select('*', { count: 'exact', head: true });

            if (!error) {
                // Try to get more info by attempting an insert (will fail but error message is informative)
                const { error: insertError } = await supabase
                    .from(item)
                    .insert({ test: 'test' });

                let type = 'TABLE';
                if (insertError?.message?.includes('cannot insert into view')) {
                    type = 'VIEW';
                } else if (insertError?.message?.includes('view')) {
                    type = 'VIEW';
                }

                console.log(`✅ ${item.padEnd(25)} - ${type} (${count || 0} rows)`);

                if (insertError) {
                    // Check error message for clues
                    if (insertError.message.includes('does not exist')) {
                        console.log(`   Note: Column 'test' doesn't exist (expected)`);
                    } else if (insertError.message.includes('view')) {
                        console.log(`   Note: This is a VIEW`);
                    }
                }
            } else {
                console.log(`❌ ${item.padEnd(25)} - DOES NOT EXIST`);
            }
        } catch (e) {
            console.log(`❌ ${item.padEnd(25)} - ERROR accessing`);
        }
    }

    console.log('\n' + '=' .repeat(60));
    console.log('📊 ANALYSIS:\n');

    console.log('If items show 0 rows but exist, they might be:');
    console.log('  • Empty tables');
    console.log('  • Views with no underlying data');
    console.log('  • Views with filters that exclude all data');

    console.log('\n🔧 TO CHECK IN SUPABASE SQL EDITOR:');
    console.log('\n-- Run this query to see what they really are:');
    console.log(`SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND (
    table_name LIKE 'cc_trad%'
    OR table_name LIKE 'cc_synerg%'
    OR table_name = 'cc_marketplace'
)
ORDER BY table_name;`);

    console.log('\n-- To check view definitions:');
    console.log(`SELECT
    table_name,
    view_definition
FROM information_schema.views
WHERE table_schema = 'public'
AND (
    table_name LIKE 'cc_trad%'
    OR table_name LIKE 'cc_synerg%'
);`);
}

checkTablesVsViews();