/**
 * Supabase Client Initialization
 * Provides connection to Supabase for session persistence
 */

const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables');
  console.warn('   Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Create public client for general operations
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create admin client for service operations (if service role key is available)
const supabaseAdmin = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Middleware to ensure Supabase is configured
const requireSupabase = (req, res, next) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Database service unavailable',
      message: 'Supabase is not configured. Please check server environment variables.'
    });
  }
  req.supabase = supabase;
  req.supabaseAdmin = supabaseAdmin || supabase; // Fall back to regular client if no admin
  next();
};

module.exports = {
  supabase,
  supabaseAdmin,
  requireSupabase
};