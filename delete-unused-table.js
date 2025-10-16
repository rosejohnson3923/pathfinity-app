/**
 * Delete unused cc_synergy_definitions table
 * This table is a duplicate/leftover that's not used by our system
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function deleteUnusedTable() {
    console.log('🗑️  Cleaning Up Unused Table\n');
    console.log('=' .repeat(60));

    // First, verify what we're dealing with
    console.log('1️⃣ Checking table contents...\n');

    // Check cc_synergy_definitions
    try {
        const { data: definitions, count } = await supabase
            .from('cc_synergy_definitions')
            .select('*', { count: 'exact' });

        console.log(`📋 cc_synergy_definitions:`);
        console.log(`   Rows: ${count || 0}`);

        if (definitions && definitions.length > 0) {
            console.log('   ⚠️  Table has data - reviewing before deletion');
            console.log('   Sample data:', definitions[0]);
        } else {
            console.log('   ✅ Table is empty');
        }
    } catch (error) {
        console.log('   ❌ Table might not exist or is inaccessible');
    }

    // Check cc_synergies (the real table we use)
    const { count: synergyCount } = await supabase
        .from('cc_synergies')
        .select('*', { count: 'exact', head: true });

    console.log(`\n📋 cc_synergies (active table):`);
    console.log(`   Rows: ${synergyCount || 0}`);
    console.log('   ✅ This is the table our system uses\n');

    console.log('=' .repeat(60));
    console.log('\n2️⃣ Deleting cc_synergy_definitions...\n');

    // Since we can't directly DROP TABLE via Supabase client,
    // we'll document the SQL command needed
    console.log('⚠️  To delete the table, run this SQL in Supabase SQL editor:\n');
    console.log('   DROP TABLE IF EXISTS cc_synergy_definitions CASCADE;');
    console.log('\nOr if you want to be extra safe:\n');
    console.log('   -- First check if it has any data');
    console.log('   SELECT COUNT(*) FROM cc_synergy_definitions;');
    console.log('   ');
    console.log('   -- If empty, drop it');
    console.log('   DROP TABLE cc_synergy_definitions CASCADE;');

    console.log('\n' + '=' .repeat(60));
    console.log('💡 EXPLANATION:');
    console.log('   • cc_synergy_definitions is NOT used by our system');
    console.log('   • cc_synergies is the active table for synergy data');
    console.log('   • Removing cc_synergy_definitions will prevent confusion');
    console.log('   • No functionality will be affected by this deletion');
    console.log('\n✅ Copy the SQL command above and run it in Supabase dashboard');
}

deleteUnusedTable();