/**
 * Get the complete list of ALL columns in each table
 * This will show us any fields we might have missed
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAllTableColumns() {
    console.log('🔍 Checking ALL columns in Career Challenge tables\n');
    console.log('=' .repeat(80));

    // Get sample data from each table to see all columns
    const tables = [
        'cc_industries',
        'cc_role_cards',
        'cc_challenges',
        'cc_synergies'
    ];

    for (const tableName of tables) {
        console.log(`\n📋 TABLE: ${tableName}`);
        console.log('-'.repeat(60));

        // Get one row to see all columns
        const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1);

        if (error) {
            console.log(`❌ Error fetching from ${tableName}:`, error.message);
            continue;
        }

        if (data && data.length > 0) {
            const columns = Object.keys(data[0]);
            console.log(`\nTotal columns: ${columns.length}`);
            console.log('\nAll columns in table:');

            columns.forEach(column => {
                const value = data[0][column];
                const valueType = Array.isArray(value) ? 'array' :
                                typeof value === 'object' && value !== null ? 'object' :
                                value === null ? 'null' :
                                typeof value;

                console.log(`   • ${column} (${valueType})`);
            });

            // Show non-null values for context
            console.log('\nNon-null values in sample row:');
            columns.forEach(column => {
                const value = data[0][column];
                if (value !== null && value !== undefined &&
                    !(Array.isArray(value) && value.length === 0) &&
                    !(typeof value === 'object' && Object.keys(value).length === 0)) {
                    const displayValue = typeof value === 'object' ?
                        JSON.stringify(value).substring(0, 50) + '...' :
                        String(value).substring(0, 50);
                    console.log(`   ✓ ${column}: ${displayValue}`);
                }
            });
        } else {
            console.log('   No data in table');
        }
    }

    // Now specifically check cc_challenges for recommended_roles
    console.log('\n\n' + '=' .repeat(80));
    console.log('🎯 CHECKING FOR recommended_roles in cc_challenges');
    console.log('=' .repeat(80));

    const { data: challenges } = await supabase
        .from('cc_challenges')
        .select('title, recommended_roles')
        .limit(5);

    if (challenges) {
        console.log('\nSample challenges:');
        challenges.forEach(challenge => {
            console.log(`\n${challenge.title}:`);
            console.log(`   recommended_roles: ${challenge.recommended_roles ? JSON.stringify(challenge.recommended_roles) : 'null'}`);
        });
    }

    // List fields we're NOT currently generating
    console.log('\n\n' + '=' .repeat(80));
    console.log('⚠️  FIELDS WE NEED TO ADD TO AI GENERATION');
    console.log('=' .repeat(80));

    console.log('\ncc_challenges missing fields:');
    console.log('   • recommended_roles (array of role names that work well)');
    console.log('   • time_limit_seconds (optional, for timed challenges)');
    console.log('   • success_criteria (what defines success)');

    console.log('\ncc_role_cards optional fields to consider:');
    console.log('   • related_career_code (links to career exploration)');
    console.log('   • synergy_partners (computed from synergies)');

    console.log('\ncc_synergies complete fields:');
    console.log('   • special_conditions (when synergy applies)');
}

checkAllTableColumns();