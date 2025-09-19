import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { getSecureConfig } from '../services/azureSecureConfig';

// Singleton pattern to prevent multiple Supabase client instances
let supabaseInstance: SupabaseClient | null = null;
let isInitialized = false;

// Initialize Supabase with secure keys from Azure Key Vault
export const initializeSupabase = async (): Promise<SupabaseClient> => {
  if (supabaseInstance && isInitialized) {
    return supabaseInstance;
  }

  try {
    // Initialize Supabase with secure configuration
    const config = await getSecureConfig.getSupabaseConfig();
    
    if (!config.anonKey) {
      throw new Error('Supabase anon key not found in secure configuration');
    }

    // Create new instance with secure keys
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storage: window?.localStorage,
        storageKey: 'pathfinity-auth-token'
      }
    });

    isInitialized = true;
    return supabaseInstance;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase with secure keys:', error);
    
    // Fall back to environment variables if available
    const fallbackUrl = import.meta.env.VITE_SUPABASE_URL;
    const fallbackKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (fallbackUrl && fallbackKey) {
      console.log('⚠️ Using fallback environment variables for Supabase');
      supabaseInstance = createClient(fallbackUrl, fallbackKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          storage: window?.localStorage,
          storageKey: 'pathfinity-auth-token'
        }
      });
      isInitialized = true;
      return supabaseInstance;
    }
    
    throw new Error('Supabase configuration not available');
  }
};

// Get Supabase client (initializes if not already done)
export const supabase = async (): Promise<SupabaseClient> => {
  if (!supabaseInstance || !isInitialized) {
    return await initializeSupabase();
  }
  return supabaseInstance;
};

// Legacy export for backward compatibility (will be deprecated)
export const getSupabaseClient = supabase;

// Helper function to get the current user's ID
export const getCurrentUserId = async () => {
  try {
    const client = await supabase();
    const { data: { user } } = await client.auth.getUser();
    return user?.id || '550e8400-e29b-41d4-a716-446655440000'; // Fallback to demo user ID
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return '550e8400-e29b-41d4-a716-446655440000'; // Fallback ID
  }
};

// Helper function to get the current user's tenant ID
export const getCurrentTenantId = async () => {
  try {
    // In a real app, this would fetch from user_profiles or session storage
    // For demo purposes, we'll use the hardcoded tenant ID from our seed data
    return '550e8400-e29b-41d4-a716-446655440000';
  } catch (error) {
    console.error('Error getting current tenant ID:', error);
    return '550e8400-e29b-41d4-a716-446655440000'; // Fallback ID
  }
};

// Helper function to get current user profile
export const getCurrentUser = async () => {
  try {
    const client = await supabase();
    const { data: { user }, error } = await client.auth.getUser();
    
    if (error) {
      console.error('Error getting current user:', error);
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  try {
    const user = await getCurrentUser();
    return !!user;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any, defaultMessage: string = 'An error occurred') => {
  if (!error) {
    return { error: { message: defaultMessage } };
  }
  
  console.error('Supabase error:', error);
  return {
    error: {
      message: error?.message || error?.error_description || defaultMessage
    }
  };
};