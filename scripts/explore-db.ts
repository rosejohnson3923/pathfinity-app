/**
 * Explore Database Schema
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://zohdmprtfyijneqnwjsu.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpvaGRtcHJ0Znlpam5lcW53anN1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MDI2MzU4NCwiZXhwIjoyMDY1ODM5NTg0fQ.aecsTt4HYBR8mQe_UwcyBXH_QoZb9uyAjeNfcHjTxbc'
);

async function main() {
  console.log('📊 Pathfinity Database Exploration\n');

  // 1. Check Discovered Live clues
  console.log('🎯 Discovered Live Clues Sample:');
  const { data: clues } = await supabase
    .from('dl_clues')
    .select('*')
    .limit(3);
  console.table(clues);

  // 2. Check perpetual rooms
  console.log('\n🎮 Perpetual Rooms:');
  const { data: rooms } = await supabase
    .from('dl_perpetual_rooms')
    .select('*');
  console.table(rooms);

  // 3. Check if careers table exists
  console.log('\n💼 Checking careers table...');
  const { data: careerSample, error: careerError } = await supabase
    .from('careers')
    .select('*')
    .limit(5);

  if (careerError) {
    console.log('  ❌ Careers table error:', careerError.message);
  } else {
    console.log('  ✅ Careers found:');
    console.table(careerSample);
  }

  // 4. Get table list
  console.log('\n📋 All tables starting with "dl_":');
  const { data: tables } = await supabase.rpc('exec', {
    query: `
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'dl_%'
      ORDER BY table_name
    `
  });

  if (tables) {
    tables.forEach((t: any) => console.log(`  - ${t.table_name}`));
  }

  // 5. Check dl_clues structure
  console.log('\n🔍 dl_clues table structure:');
  if (clues && clues.length > 0) {
    console.log('Columns:', Object.keys(clues[0]).join(', '));
  }
}

main().catch(console.error);
