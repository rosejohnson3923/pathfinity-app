/**
 * Apply Career Path Progression migrations directly
 * This script executes the SQL migrations for the career progression system
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// Get Supabase credentials
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.log('Please ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

console.log('🔗 Connecting to Supabase...');
console.log('   URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executeSQLFile(filename) {
  console.log(`\n📄 Executing: ${filename}`);

  try {
    const filePath = path.join(__dirname, '..', 'migrations', filename);
    const sqlContent = await fs.readFile(filePath, 'utf8');

    // Split SQL into individual statements (basic split by semicolon + newline)
    const statements = sqlContent
      .split(/;\s*\n/)
      .filter(stmt => stmt.trim().length > 0)
      .map(stmt => stmt.trim() + ';');

    console.log(`   Found ${statements.length} SQL statements to execute`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (!statement || statement.startsWith('--') || statement.trim() === ';') {
        continue;
      }

      // For now, we'll need to use raw SQL through Supabase RPC
      // This is a limitation - we need to execute these manually or through a database admin tool
      console.log(`   ⚠️  Statement ${i + 1}: Manual execution required`);
      errorCount++;
    }

    if (errorCount > 0) {
      console.log(`\n⚠️  ${filename} requires manual execution`);
      console.log('   Please run the following SQL files directly in your Supabase SQL editor:');
      console.log(`   1. database/migrations/011_career_path_progression.sql`);
      console.log(`   2. database/migrations/012_career_data_complete.sql`);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filename}:`, error.message);
    return false;
  }
}

async function verifyTables() {
  console.log('\n🔍 Verifying database tables...');

  try {
    // Check if careers table exists and has data
    const { data: careers, error: careerError } = await supabase
      .from('careers')
      .select('id, career_name, tier')
      .limit(5);

    if (careerError) {
      console.log('❌ Careers table not found or not accessible:', careerError.message);
      return false;
    }

    console.log(`✅ Careers table found with ${careers?.length || 0} sample records`);

    // Check if career_path_progressions table exists
    const { data: progressions, error: progError } = await supabase
      .from('career_path_progressions')
      .select('id, progression_type')
      .limit(5);

    if (progError) {
      console.log('❌ Career progressions table not found or not accessible:', progError.message);
      return false;
    }

    console.log(`✅ Career progressions table found with ${progressions?.length || 0} sample records`);

    // Check if booster_types table exists
    const { data: boosters, error: boostError } = await supabase
      .from('booster_types')
      .select('id, booster_name')
      .limit(5);

    if (boostError) {
      console.log('❌ Booster types table not found or not accessible:', boostError.message);
      return false;
    }

    console.log(`✅ Booster types table found with ${boosters?.length || 0} sample records`);

    // Get counts
    const { count: careerCount } = await supabase
      .from('careers')
      .select('*', { count: 'exact', head: true });

    const { count: progCount } = await supabase
      .from('career_path_progressions')
      .select('*', { count: 'exact', head: true });

    console.log('\n📊 Database Statistics:');
    console.log(`   Total careers: ${careerCount || 0}`);
    console.log(`   Total progressions: ${progCount || 0}`);

    if (careerCount === 0) {
      console.log('\n⚠️  No careers found in database');
      console.log('   Please run the migration scripts in your Supabase SQL editor');
      return false;
    }

    return true;
  } catch (error) {
    console.error('❌ Error verifying tables:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Career Path Progression Migration Helper\n');

  // First verify if tables exist
  const tablesExist = await verifyTables();

  if (!tablesExist) {
    console.log('\n📝 Instructions for manual migration:');
    console.log('1. Go to your Supabase dashboard: ' + supabaseUrl);
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the contents of these files:');
    console.log('   - database/migrations/011_career_path_progression.sql');
    console.log('   - database/migrations/012_career_data_complete.sql');
    console.log('4. Execute each file in order');
    console.log('5. Run this script again to verify');
  } else {
    console.log('\n✨ Database is properly configured!');
    console.log('   You can now test the dashboard at: http://localhost:5173/test/career-database');
  }
}

main().catch(console.error);