#!/usr/bin/env node

/**
 * Career Challenge Multiplayer (CCM) - Schema Verification
 * Verifies all CCM tables were created successfully
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

config({ path: join(PROJECT_ROOT, '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { persistSession: false }
});

async function verifySchema() {
  console.log(chalk.bold.blue('🔍 Verifying CCM Schema\n'));

  const expectedTables = [
    'ccm_perpetual_rooms',
    'ccm_game_sessions',
    'ccm_session_participants',
    'ccm_role_cards',
    'ccm_synergy_cards',
    'ccm_challenge_cards',
    'ccm_soft_skills_matrix',
    'ccm_round_plays',
    'ccm_mvp_selections',
    'ccm_achievements',
    'ccm_player_achievements'
  ];

  console.log(chalk.yellow('Checking tables...\n'));

  let allGood = true;

  for (const table of expectedTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(chalk.red(`  ✗ ${table} - Error: ${error.message}`));
        allGood = false;
      } else {
        console.log(chalk.green(`  ✓ ${table} (${count || 0} rows)`));
      }
    } catch (err) {
      console.log(chalk.red(`  ✗ ${table} - Exception: ${err.message}`));
      allGood = false;
    }
  }

  // Check featured rooms
  console.log(chalk.yellow('\n📍 Checking featured perpetual rooms...\n'));
  const { data: rooms, error: roomError } = await supabase
    .from('ccm_perpetual_rooms')
    .select('room_code, room_name, is_featured')
    .eq('is_featured', true)
    .order('feature_order', { ascending: true });

  if (!roomError && rooms) {
    rooms.forEach(room => {
      console.log(chalk.cyan(`  ⭐ ${room.room_code}: ${room.room_name}`));
    });
  }

  // Summary
  console.log(chalk.bold.blue('\n📊 Summary:\n'));
  if (allGood) {
    console.log(chalk.green('✅ All 11 CCM tables created successfully!'));
    console.log(chalk.green(`✅ ${rooms?.length || 0} featured rooms seeded`));
    console.log(chalk.white('\n🚀 Ready for next steps:'));
    console.log(chalk.white('  1. Generate content (Role cards, Synergy cards, Challenge cards)'));
    console.log(chalk.white('  2. Build CCM services'));
    console.log(chalk.white('  3. Create API endpoints'));
    console.log(chalk.white('  4. Build UI components\n'));
  } else {
    console.log(chalk.red('❌ Some tables are missing or inaccessible'));
  }
}

verifySchema();
