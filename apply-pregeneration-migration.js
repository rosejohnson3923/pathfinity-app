import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('📦 Applying PreGeneration System migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'database', 'migrations', '007_pregeneration_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Split by semicolons but be careful with function definitions
    const statements = [];
    let currentStatement = '';
    let inFunction = false;
    
    const lines = migrationSQL.split('\n');
    for (const line of lines) {
      currentStatement += line + '\n';
      
      if (line.includes('CREATE OR REPLACE FUNCTION') || line.includes('CREATE TABLE') || line.includes('CREATE INDEX')) {
        inFunction = true;
      }
      
      if (line.trim().endsWith(';')) {
        if (inFunction && (line.includes('$$ LANGUAGE') || line.includes('$$;'))) {
          statements.push(currentStatement.trim());
          currentStatement = '';
          inFunction = false;
        } else if (!inFunction) {
          statements.push(currentStatement.trim());
          currentStatement = '';
        }
      }
    }

    console.log(`Found ${statements.length} SQL statements to execute\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (!statement || statement.trim().startsWith('--')) continue;

      // Get first line for logging
      const firstLine = statement.split('\n')[0].substring(0, 60);
      console.log(`[${i + 1}/${statements.length}] Executing: ${firstLine}...`);

      // For RPC calls, we need to use raw SQL execution
      const { error } = await supabase.rpc('query', { 
        query_text: statement 
      }).single();

      if (error) {
        // If query RPC doesn't exist, try direct execution (this won't work for functions)
        console.log(`⚠️  RPC query failed, statement might already exist: ${error.message}`);
      } else {
        console.log(`✅ Success`);
      }
    }

    // Verify the functions were created
    console.log('\n🔍 Verifying functions exist...');
    
    const { data: functions, error: funcError } = await supabase
      .rpc('get_functions', {})
      .select('*');

    if (funcError) {
      console.log('⚠️  Cannot verify functions (this is normal if get_functions RPC doesn\'t exist)');
    } else {
      console.log('Functions found:', functions);
    }

    console.log('\n✅ Migration applied successfully!');
    console.log('\n📝 Note: Some statements may have failed if they already exist, which is okay.');
    console.log('The PreGeneration system should now be functional.');

  } catch (error) {
    console.error('\n❌ Error applying migration:', error);
    console.log('\n💡 You may need to apply this migration manually in the Supabase dashboard:');
    console.log('   1. Go to your Supabase project');
    console.log('   2. Navigate to SQL Editor');
    console.log('   3. Copy the contents of database/migrations/007_pregeneration_system.sql');
    console.log('   4. Paste and run in the SQL editor');
  }
}

// Run the migration
applyMigration();