/**
 * Diagnostic script to check company room industry associations
 * Run with: npx ts-node src/scripts/checkCompanyRoomIndustries.ts
 */

import { supabase } from '../lib/supabase';

async function checkCompanyRoomIndustries() {
  console.log('🔍 Checking company room industry associations...\n');

  const client = await supabase();

  // 1. Check what industries exist
  const { data: industries, error: indError } = await client
    .from('dd_industries')
    .select('id, code, name')
    .order('name');

  if (indError) {
    console.error('❌ Error fetching industries:', indError);
    return;
  }

  console.log('📋 Available Industries:');
  industries?.forEach((ind: any) => {
    console.log(`  - ${ind.name} (code: ${ind.code}, id: ${ind.id})`);
  });
  console.log('');

  // 2. Check company rooms and their industry associations
  const { data: rooms, error: roomError } = await client
    .from('dd_company_rooms')
    .select(`
      id,
      code,
      name,
      industry_id
    `)
    .order('name');

  if (roomError) {
    console.error('❌ Error fetching company rooms:', roomError);
    return;
  }

  console.log('🏢 Company Rooms:');
  let nullCount = 0;
  rooms?.forEach((room: any) => {
    const status = room.industry_id ? '✅' : '❌ NULL';
    console.log(`  ${status} ${room.name} (${room.code}) - industry_id: ${room.industry_id || 'NULL'}`);
    if (!room.industry_id) nullCount++;
  });
  console.log('');

  if (nullCount > 0) {
    console.log(`⚠️  Found ${nullCount} company rooms with NULL industry_id`);
    console.log('');
    console.log('💡 Suggested fix: Update company rooms with first available industry');

    if (industries && industries.length > 0) {
      const defaultIndustryId = industries[0].id;
      console.log(`   Default industry: ${industries[0].name} (${defaultIndustryId})`);

      // Update rooms with NULL industry_id
      const roomsToUpdate = rooms.filter((r: any) => !r.industry_id);

      for (const room of roomsToUpdate) {
        const { error: updateError } = await client
          .from('dd_company_rooms')
          .update({ industry_id: defaultIndustryId })
          .eq('id', room.id);

        if (updateError) {
          console.log(`   ❌ Failed to update ${room.code}: ${updateError.message}`);
        } else {
          console.log(`   ✅ Updated ${room.code} with industry ${industries[0].name}`);
        }
      }
    }
  } else {
    console.log('✅ All company rooms have valid industry associations');
  }

  // 3. Test the join query that's failing
  console.log('\n🧪 Testing JOIN query (same as startExecutiveDecisionSession)...');

  const testRoomId = rooms && rooms.length > 0 ? rooms[0].id : null;

  if (testRoomId) {
    const { data: testRoom, error: joinError } = await client
      .from('dd_company_rooms')
      .select(`
        *,
        cc_industries (*)
      `)
      .eq('id', testRoomId)
      .single();

    if (joinError) {
      console.error('❌ JOIN query failed:', joinError);
    } else {
      console.log('✅ JOIN query successful');
      console.log(`   Room: ${testRoom?.name}`);
      console.log(`   Industry: ${testRoom?.cc_industries?.name || 'NULL - THIS IS THE PROBLEM!'}`);
      if (!testRoom?.cc_industries) {
        console.log('   ⚠️  The cc_industries join returned NULL - this causes the error!');
      }
    }
  }

  console.log('\n✨ Diagnostic complete!');
}

checkCompanyRoomIndustries().catch(console.error);
