/**
 * Run Career Path Progression migrations
 * This script applies the career progression database schema and data
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Get Supabase credentials from environment
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration(filename) {
  console.log(`\n📄 Running migration: ${filename}`);

  try {
    const filePath = path.join(__dirname, '..', 'migrations', filename);
    const sql = await fs.readFile(filePath, 'utf8');

    // Execute the SQL
    const { error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error(`❌ Error running ${filename}:`, error);
      return false;
    }

    console.log(`✅ Successfully ran ${filename}`);
    return true;
  } catch (error) {
    console.error(`❌ Error reading/running ${filename}:`, error);
    return false;
  }
}

async function main() {
  console.log('🚀 Starting Career Path Progression migrations...\n');

  const migrations = [
    '011_career_path_progression.sql',
    '012_career_data_complete.sql'
  ];

  let success = true;

  for (const migration of migrations) {
    const result = await runMigration(migration);
    if (!result) {
      success = false;
      console.log('\n⚠️  Stopping due to error');
      break;
    }
  }

  if (success) {
    console.log('\n✨ All migrations completed successfully!');

    // Verify the data
    const { data: careers, error: careerError } = await supabase
      .from('careers')
      .select('count', { count: 'exact' });

    const { data: progressions, error: progError } = await supabase
      .from('career_path_progressions')
      .select('count', { count: 'exact' });

    const { data: fields, error: fieldError } = await supabase
      .from('career_fields')
      .select('count', { count: 'exact' });

    console.log('\n📊 Database Statistics:');
    console.log(`   - Careers: ${careers?.length || 0} records`);
    console.log(`   - Progressions: ${progressions?.length || 0} records`);
    console.log(`   - Fields: ${fields?.length || 0} records`);
  }
}

main().catch(console.error);