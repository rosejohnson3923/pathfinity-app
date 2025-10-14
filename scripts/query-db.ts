/**
 * Quick Database Query Script
 * Run with: npx tsx scripts/query-db.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zohdmprtfyijneqnwjsu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGRtcHJ0Znlpam5lcW53anN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI2MzU4NCwiZXhwIjoyMDY1ODM5NTg0fQ.aecsTt4HYBR8mQe_UwcyBXH_QoZb9uyAjeNfcHjTxbc';

const supabase = createClient(supabaseUrl, supabaseKey);

async function listTables() {
  console.log('📋 Listing all tables in public schema...\n');

  const { data, error } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .order('table_name');

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log('Tables found:', data?.length);
  data?.forEach((table: any) => {
    console.log(`  - ${table.table_name}`);
  });
}

async function queryTable(tableName: string, limit: number = 5) {
  console.log(`\n🔍 Querying ${tableName} (limit ${limit})...\n`);

  const { data, error, count } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .limit(limit);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Total rows in ${tableName}: ${count}`);
  console.log('Sample data:');
  console.table(data);
}

async function checkDiscoveredLiveTables() {
  console.log('\n🎮 Checking Discovered Live! tables...\n');

  const tables = [
    'dl_clues',
    'dl_perpetual_rooms',
    'dl_game_sessions',
    'dl_session_participants',
    'dl_spectators',
    'dl_click_events'
  ];

  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.log(`  ❌ ${table}: Table not found`);
    } else {
      console.log(`  ✅ ${table}: ${count} rows`);
    }
  }
}

async function getCareers() {
  console.log('\n💼 Getting careers...\n');

  const { data, error } = await supabase
    .from('careers')
    .select('id, code, name')
    .limit(20);

  if (error) {
    console.error('❌ Error:', error);
    return;
  }

  console.log(`Found ${data?.length} careers:`);
  console.table(data);
}

// Run queries
async function main() {
  console.log('🚀 Pathfinity Database Query Tool\n');
  console.log('='.repeat(50));

  await checkDiscoveredLiveTables();
  await getCareers();

  console.log('\n' + '='.repeat(50));
  console.log('✅ Done!');
}

main().catch(console.error);
