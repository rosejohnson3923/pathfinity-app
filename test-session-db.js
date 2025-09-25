/**
 * Test Session Database Connection
 * Checks if the learning_sessions table exists
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Get credentials from environment
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

console.log('Connecting to Supabase...');
console.log('URL:', SUPABASE_URL);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testConnection() {
  try {
    // Try to query the learning_sessions table
    console.log('\nTesting learning_sessions table...');
    const { data, error } = await supabase
      .from('learning_sessions')
      .select('*')
      .limit(1);

    if (error) {
      console.log('❌ Table does not exist or error:', error.message);
      console.log('\n⚠️  The learning_sessions table needs to be created.');
      console.log('Please run the migration file: database/migrations/008_learning_sessions.sql');
      console.log('\nYou can do this by:');
      console.log('1. Going to your Supabase dashboard');
      console.log('2. Navigate to SQL Editor');
      console.log('3. Copy and paste the contents of 008_learning_sessions.sql');
      console.log('4. Click "Run"');
    } else {
      console.log('✅ Table exists! Found', data?.length || 0, 'sessions');

      // Check other tables
      console.log('\nChecking related tables...');

      const { error: analyticsError } = await supabase
        .from('session_analytics')
        .select('*')
        .limit(1);

      if (analyticsError) {
        console.log('❌ session_analytics table missing');
      } else {
        console.log('✅ session_analytics table exists');
      }

      const { error: achievementsError } = await supabase
        .from('session_achievements')
        .select('*')
        .limit(1);

      if (achievementsError) {
        console.log('❌ session_achievements table missing');
      } else {
        console.log('✅ session_achievements table exists');
      }
    }
  } catch (err) {
    console.error('Error testing connection:', err);
  }
}

testConnection();