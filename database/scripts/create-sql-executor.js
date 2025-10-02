/**
 * Create a SQL executor function in Supabase
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSQLExecutor() {
  console.log('\n🔧 Creating SQL executor function...\n');

  try {
    // Check if function already exists
    const { data: existingFunctions } = await supabase
      .rpc('exec_sql', { sql_query: 'SELECT 1' })
      .then(() => ({ data: 'exists' }))
      .catch(() => ({ data: null }));

    if (existingFunctions) {
      console.log('✅ SQL executor function already exists');
      return;
    }

    // The function needs to be created directly in the database
    // We'll use a simple approach instead
    console.log('❌ Cannot create SQL function through client');
    console.log('');
    console.log('Please run this SQL command in your Supabase SQL editor:');
    console.log('');
    console.log('```sql');
    console.log('CREATE OR REPLACE FUNCTION exec_sql(sql_query text)');
    console.log('RETURNS text');
    console.log('LANGUAGE plpgsql');
    console.log('SECURITY DEFINER');
    console.log('AS $$');
    console.log('BEGIN');
    console.log('  EXECUTE sql_query;');
    console.log('  RETURN \\'OK\\';');
    console.log('END;');
    console.log('$$;');
    console.log('```');
    console.log('');
    console.log('Then run the career code update script again.');

  } catch (error) {
    console.error('Error:', error.message);
  }
}

createSQLExecutor()
  .then(() => {
    console.log('\n✅ Check complete!\n');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });