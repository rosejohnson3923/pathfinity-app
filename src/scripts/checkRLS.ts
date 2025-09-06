/**
 * Check RLS and permissions on skills_master_v2
 */

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
// Use service role key if available, otherwise fall back to anon key
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Checking RLS and permissions...\n');
console.log('Project URL:', supabaseUrl);
console.log('Key starts with:', supabaseServiceKey?.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkRLS() {
  try {
    // Try to check if we can see the table structure
    console.log('\n📊 Checking table access...');
    
    // Check both tables for comparison
    console.log('\n📊 Comparing both tables:');
    
    // Check skills_master
    const { count: count1, error: error1 } = await supabase
      .from('skills_master')
      .select('*', { count: 'exact', head: true });
    
    console.log(`skills_master: ${error1 ? `Error - ${error1.message}` : `${count1} records`}`);
    
    // Check skills_master_v2
    const { count: count2, error: error2 } = await supabase
      .from('skills_master_v2')
      .select('*', { count: 'exact', head: true });
    
    console.log(`skills_master_v2: ${error2 ? `Error - ${error2.message}` : `${count2} records`}`);
    
    // Try to access with service role explicitly
    console.log('\n📊 Testing with explicit service role...');
    
    // Create client with service role key if we have it
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;
    if (serviceKey && serviceKey !== supabaseServiceKey) {
      console.log('Using SUPABASE_SERVICE_KEY explicitly...');
      const serviceSupabase = createClient(supabaseUrl, serviceKey);
      
      const { count: serviceCount, error: serviceError } = await serviceSupabase
        .from('skills_master_v2')
        .select('*', { count: 'exact', head: true });
      
      console.log(`With service key: ${serviceError ? `Error - ${serviceError.message}` : `${serviceCount} records`}`);
    } else {
      console.log('Already using service key or not available');
    }
    
    // Check what key type we're using
    console.log('\n🔑 Key Analysis:');
    if (supabaseServiceKey?.startsWith('eyJ')) {
      // It's a JWT, let's decode the payload (base64)
      const parts = supabaseServiceKey.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('JWT Role:', payload.role);
        console.log('JWT Issued:', new Date(payload.iat * 1000).toISOString());
        console.log('JWT Expires:', payload.exp ? new Date(payload.exp * 1000).toISOString() : 'Never');
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkRLS().catch(console.error);