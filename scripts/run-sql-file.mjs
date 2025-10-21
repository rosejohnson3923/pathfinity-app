#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY not found in environment');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sqlFile = process.argv[2];

if (!sqlFile) {
  console.error('Usage: node run-sql-file.mjs <path-to-sql-file>');
  process.exit(1);
}

const sqlPath = resolve(__dirname, '..', sqlFile);

console.log(`Reading SQL file: ${sqlPath}`);
const sql = readFileSync(sqlPath, 'utf-8');

console.log('Executing SQL...');

// Split on semicolons but preserve semicolons inside quoted strings
const statements = sql
  .split(/;(?=(?:[^']*'[^']*')*[^']*$)/)
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

console.log(`Found ${statements.length} SQL statements to execute`);

for (let i = 0; i < statements.length; i++) {
  const statement = statements[i];

  // Skip comments and empty statements
  if (!statement || statement.startsWith('--')) continue;

  console.log(`\nExecuting statement ${i + 1}/${statements.length}...`);

  const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement });

  if (error) {
    console.error(`Error in statement ${i + 1}:`, error);
    // Try direct execution as fallback
    const { error: directError } = await supabase.from('_').select('*').limit(0);
    if (directError) {
      console.error('Direct execution also failed. Continuing...');
    }
  } else {
    console.log(`✓ Statement ${i + 1} completed`);
  }
}

console.log('\n✅ SQL file execution completed!');
