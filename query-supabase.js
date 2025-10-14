#!/usr/bin/env node
/**
 * Simple Supabase Query Script
 * Usage: node query-supabase.js "SELECT * FROM careers LIMIT 5"
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function query(sql) {
  try {
    console.log('🔍 Querying Supabase...\n');
    console.log('Query:', sql, '\n');

    const { data, error } = await supabase.rpc('exec_sql', { query: sql });

    if (error) {
      console.error('❌ Query Error:', error);
      return;
    }

    console.log('✅ Results:');
    console.table(data);
    console.log(`\n📊 Rows returned: ${data?.length || 0}`);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

// Get SQL from command line argument
const sql = process.argv[2];

if (!sql) {
  console.log('Usage: node query-supabase.js "SELECT * FROM table_name LIMIT 5"');
  console.log('\nExamples:');
  console.log('  node query-supabase.js "SELECT * FROM careers LIMIT 10"');
  console.log('  node query-supabase.js "SELECT COUNT(*) FROM students"');
  console.log('  node query-supabase.js "SHOW TABLES"');
  process.exit(1);
}

query(sql);
