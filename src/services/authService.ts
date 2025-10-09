import { mockUsers, mockTenants, findUserByEmail, createUser, getUserTenants } from '../data/mockAuthData';
import { supabase, initializeSupabase, getCurrentUser as getSupabaseUser, isAuthenticated } from '../lib/supabase';
import { initializeDataService } from './dataService';

// Types
export interface AuthUser {
  id: string;
  email: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  grade_level?: string | null;
}

export interface UserProfile extends AuthUser {
  tenant_id: string;
  grade_level: string | null;
  subjects?: string[];
  preferences?: Record<string, any>;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  subscription_tier: string;
  logo?: string;
}

export interface AuthResponse {
  user: AuthUser | null;
  error: Error | null;
}

export interface TenantResponse {
  tenants: Tenant[];
  error: Error | null;
}

// Mock localStorage keys
const AUTH_TOKEN_KEY = 'pathfinity_auth_token';
const USER_KEY = 'pathfinity_user';
const SELECTED_TENANT_KEY = 'pathfinity_selected_tenant';

// Feature flag for real authentication
const USE_REAL_AUTH = import.meta.env.VITE_ENABLE_MOCK_DATA !== 'true';

// Helper to simulate token generation
const generateToken = (userId: string): string => {
  return `mock_token_${userId}_${Date.now()}`;
};

// Helper to store auth data in localStorage
const storeAuthData = (user: AuthUser, token: string): void => {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('storeAuthData: Stored user in localStorage:', user.email);
  } catch (error) {
    console.error('Error storing auth data:', error);
  }
};

// Helper to clear auth data from localStorage
const clearAuthData = (): void => {
  try {
    // Get current user to clear their specific data
    const currentUser = getCurrentUser();

    // Clear auth tokens
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SELECTED_TENANT_KEY);

    // Clear user-specific data if we have a user ID
    if (currentUser?.id) {
      localStorage.removeItem(`pathfinity-intro-${currentUser.id}`);
      localStorage.removeItem(`pathfinity-selections-${currentUser.id}`);
      console.log('Cleared user-specific data for:', currentUser.email);
    }

    // Clear session storage items (companion, career selections)
    sessionStorage.removeItem('selectedCompanion');
    sessionStorage.removeItem('selectedCareer');
    sessionStorage.removeItem('selectedAiCompanion');

    // Clear any other user-specific keys
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('pathfinity-intro-') || key.includes('pathfinity-selections-'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Clear the browser console to reset logs
    if (typeof console.clear === 'function') {
      console.clear();
      console.log('🔄 Console cleared for new session');
    }

  } catch (error) {
    console.error('Error clearing auth data:', error);
  }
};

// Helper to get current user from localStorage
export const getCurrentUser = (): AuthUser | null => {
  // Check for demo mode override first - clear existing auth if switching demo users
  const urlParams = new URLSearchParams(window.location.search);
  const isDemoMode = urlParams.get('demo') === 'true';
  const demoUser = urlParams.get('user');

  if (isDemoMode && demoUser) {
    console.log('🔄 Demo mode detected - switching to demo user:', demoUser);
    // Clear existing auth storage
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(SELECTED_TENANT_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(SELECTED_TENANT_KEY);
    // Return null to force fresh login
    return null;
  }

  // First try to get user from mock auth (prioritize mock auth for demo)
  try {
    const userJson = localStorage.getItem(USER_KEY);
    if (userJson) {
      const user = JSON.parse(userJson);
      if (user && user.id) {
        // Found mock auth user
        
        // If grade_level is missing, try to get it from mockUsers
        if (!user.grade_level && user.email) {
          const mockUser = findUserByEmail(user.email);
          if (mockUser && mockUser.grade_level) {
            user.grade_level = mockUser.grade_level;
            // Update localStorage with the enriched user data
            localStorage.setItem(USER_KEY, JSON.stringify(user));
            // Added grade_level from mock data
          }
        }
        
        return user;
      }
    }
  } catch (error) {
    console.warn('Error parsing mock auth user:', error);
  }
  
  // Fall back to Supabase auth
  try {
    const session = JSON.parse(localStorage.getItem('sb-auth-token') || '{}');
    if (session?.user) {
      // Found Supabase user
      return {
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata?.full_name || 'User',
        role: session.user.user_metadata?.role || 'student',
        avatar_url: session.user.user_metadata?.avatar_url || null
      };
    }
  } catch (error) {
    console.warn('Error parsing Supabase session:', error);
  }
  
  // No user found in either auth system
  return null;
};

// Helper to get selected tenant from localStorage
export const getSelectedTenant = (): Tenant | null => {
  // First try to get tenant from Supabase
  try {
    const tenantJson = localStorage.getItem('sb-tenant');
    if (tenantJson) {
      return JSON.parse(tenantJson);
    }
  } catch (error) {
    console.warn('Error parsing Supabase tenant, falling back to mock tenant:', error);
  }
  
  // Fall back to mock tenant
  try {
    const tenantJson = localStorage.getItem(SELECTED_TENANT_KEY);
    return tenantJson ? JSON.parse(tenantJson) : null;
  } catch (error) {
    console.error('Error getting selected tenant:', error);
    return null;
  }
};

// Email/Password Sign In
export const signInWithEmailPassword = async (email: string, password: string): Promise<AuthResponse> => {
  // Clear any existing user data before signing in a new user
  const existingUser = getCurrentUser();
  if (existingUser && existingUser.email !== email) {
    console.log('Switching users from', existingUser.email, 'to', email);
    clearAuthData();
    // Extra console clear for user switch to ensure fresh start
    if (typeof console.clear === 'function') {
      console.clear();
      console.log('🔄 Starting fresh session for:', email);
    }
  }
  
  // First try to sign in with Supabase
  try {
    console.log('🔐 Attempting Supabase authentication for:', email);
    
    // Initialize Supabase with secure configuration
    await initializeSupabase();
    const client = await supabase();
    
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password
    });
    
    if (!error && data?.user) {
      console.log('✅ Supabase authentication successful for:', email);
      
      const authUser = {
        id: data.user.id,
        email: data.user.email || email,
        full_name: data.user.user_metadata?.full_name || 'User',
        role: data.user.user_metadata?.role || 'student',
        avatar_url: data.user.user_metadata?.avatar_url || null
      };
      
      // Store auth data
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      
      return { user: authUser, error: null };
    } else if (error) {
      console.warn('Supabase auth error:', error.message);
    }
  } catch (supabaseError) {
    console.warn('Supabase auth error, falling back to mock auth:', supabaseError);
  }
  
  // Fall back to mock auth
  try {
    console.log('signInWithEmailPassword: Falling back to mock auth for:', email);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    let user = findUserByEmail(email);
    console.log('signInWithEmailPassword: findUserByEmail result:', user ? user.email : 'null');

    // Special handling for Samantha Johnson (micro school teacher)
    if (!user && email.toLowerCase() === 'samantha.johnson@newfrontier.pathfinity.edu') {
      console.log('🔧 Creating Samantha Johnson user object directly');
      user = {
        id: '30eb6e8c-eb5b-433f-9ed0-f9599c2c7c30',
        email: 'samantha.johnson@newfrontier.pathfinity.edu',
        password: 'password123',
        full_name: 'Samantha Johnson',
        role: 'educator',
        avatar_url: 'https://images.pexels.com/photos/3769021/pexels-photo-3769021.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&dpr=2',
        grade_level: null,
        subjects: ['Math', 'ELA', 'Science', 'Social Studies'],
        school: 'New Frontier Micro School',
        district: null,
        tenant_ids: ['new-frontier-micro-school-001'],
        sso_provider: null
      };
    }

    if (!user) {
      console.log('signInWithEmailPassword: User not found in mock data');
      return { user: null, error: new Error('User not found') };
    }
    
    if (user.password !== password) {
      console.log('signInWithEmailPassword: Password mismatch');
      return { user: null, error: new Error('Invalid login credentials') };
    }
    
    // Create auth user object (without password and tenant_ids)
    const { password: _, tenant_ids: __, sso_provider: ___, ...authUser } = user;
    console.log('signInWithEmailPassword: Created auth user object:', authUser.email);
    
    // Generate and store token
    const token = generateToken(user.id);
    storeAuthData(authUser, token);
    
    // Auto-select tenant for district admins
    if (user.role === 'district_admin') {
      console.log('signInWithEmailPassword: Auto-selecting district tenant for district admin');
      const districtTenant = mockTenants.find(t => t.id === 'plainview-isd-district-001');
      if (districtTenant) {
        localStorage.setItem(SELECTED_TENANT_KEY, JSON.stringify(districtTenant));
        console.log('signInWithEmailPassword: Selected district tenant:', districtTenant.name);
      } else {
        // Fallback to first available tenant for district admin
        const firstTenant = mockTenants.find(t => user.tenant_ids.includes(t.id));
        if (firstTenant) {
          localStorage.setItem(SELECTED_TENANT_KEY, JSON.stringify(firstTenant));
          console.log('signInWithEmailPassword: Selected fallback tenant:', firstTenant.name);
        }
      }
    }
    
    console.log('signInWithEmailPassword: Mock auth successful for:', authUser.email);
    
    // Re-initialize data service for the new user  
    // Use the first tenant if available, or empty string
    const tenantId = user.tenant_ids && user.tenant_ids.length > 0 ? user.tenant_ids[0] : '';
    try {
      await initializeDataService(authUser.email, tenantId);
      console.log('✅ Data service initialized for new user:', authUser.email);
    } catch (error) {
      console.warn('Warning: Could not initialize data service:', error);
    }
    
    return { user: authUser, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, error: error as Error };
  }
};

// Sign Up with Email/Password
export const signUpWithEmailPassword = async (
  email: string, 
  password: string, 
  fullName: string,
  role: string = 'student'
): Promise<AuthResponse> => {
  try {
    // Reduced delay for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return { user: null, error: new Error('User already exists') };
    }
    
    // Create new user
    const newUser = createUser(email, password, fullName, role);
    
    // Create auth user object (without password and tenant_ids)
    const { password: _, tenant_ids: __, sso_provider: ___, ...authUser } = newUser;
    
    // In a real app, we would send a verification email here
    console.log('Verification email would be sent to:', email);
    
    // For demo purposes, we'll auto-verify and log in the user
    const token = generateToken(newUser.id);
    storeAuthData(authUser, token);
    
    return { user: authUser, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, error: error as Error };
  }
};

// Sign Out
export const signOut = async (): Promise<{ error: Error | null }> => {
  try {
    // Clear console at the start of sign out
    if (typeof console.clear === 'function') {
      console.clear();
      console.log('🔄 Signing out...');
    }

    // Reduced delay for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    clearAuthData();

    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error: error as Error };
  }
};

// Get User Tenants
export const getUserTenantsList = async (userId: string): Promise<TenantResponse> => {
  try {
    // Reduced delay for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const tenants = getUserTenants(userId);
    
    if (!tenants.length) {
      return { tenants: [], error: new Error('No tenants found for user') };
    }
    
    return { tenants, error: null };
  } catch (error) {
    console.error('Get user tenants error:', error);
    return { tenants: [], error: error as Error };
  }
};

// Select Tenant
export const selectTenant = async (tenantId: string): Promise<{ tenant: Tenant | null; error: Error | null }> => {
  try {
    // Reduced delay for demo
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const tenant = mockTenants.find(t => t.id === tenantId);
    
    if (!tenant) {
      return { tenant: null, error: new Error('Tenant not found') };
    }
    
    // Store selected tenant in localStorage
    localStorage.setItem(SELECTED_TENANT_KEY, JSON.stringify(tenant));
    
    return { tenant, error: null };
  } catch (error) {
    console.error('Select tenant error:', error);
    return { tenant: null, error: error as Error };
  }
};

// SSO Authentication Methods

// Google SSO
export const signInWithGoogle = async (): Promise<AuthResponse> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Find a mock user with Google SSO
    const user = mockUsers.find(u => u.sso_provider === 'google');
    
    if (!user) {
      return { user: null, error: new Error('No Google SSO user found') };
    }
    
    // Create auth user object (without password and tenant_ids)
    const { password: _, tenant_ids: __, sso_provider: ___, ...authUser } = user;
    
    // Generate and store token
    const token = generateToken(user.id);
    storeAuthData(authUser, token);
    
    console.log('Signed in with Google SSO:', authUser.email);
    
    return { user: authUser, error: null };
  } catch (error) {
    console.error('Google SSO error:', error);
    return { user: null, error: error as Error };
  }
};

// Microsoft SSO
export const signInWithMicrosoft = async (): Promise<AuthResponse> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Find a mock user with Microsoft SSO
    const user = mockUsers.find(u => u.sso_provider === 'microsoft');
    
    if (!user) {
      return { user: null, error: new Error('No Microsoft SSO user found') };
    }
    
    // Create auth user object (without password and tenant_ids)
    const { password: _, tenant_ids: __, sso_provider: ___, ...authUser } = user;
    
    // Generate and store token
    const token = generateToken(user.id);
    storeAuthData(authUser, token);
    
    console.log('Signed in with Microsoft SSO:', authUser.email);
    
    return { user: authUser, error: null };
  } catch (error) {
    console.error('Microsoft SSO error:', error);
    return { user: null, error: error as Error };
  }
};

// SAML SSO
export const signInWithSAML = async (entityId?: string): Promise<AuthResponse> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Find a mock user with SAML SSO
    const user = mockUsers.find(u => u.sso_provider === 'saml');
    
    if (!user) {
      return { user: null, error: new Error('No SAML SSO user found') };
    }
    
    // Create auth user object (without password and tenant_ids)
    const { password: _, tenant_ids: __, sso_provider: ___, ...authUser } = user;
    
    // Generate and store token
    const token = generateToken(user.id);
    storeAuthData(authUser, token);
    
    console.log('Signed in with SAML SSO:', authUser.email, 'Entity ID:', entityId || 'default');
    
    return { user: authUser, error: null };
  } catch (error) {
    console.error('SAML SSO error:', error);
    return { user: null, error: error as Error };
  }
};

// Initialize authentication system
export const initializeAuth = async (): Promise<void> => {
  try {
    if (USE_REAL_AUTH) {
      console.log('🔐 Initializing real authentication with Supabase...');
      await initializeSupabase();
      console.log('✅ Supabase authentication initialized');
    } else {
      // Using mock authentication for development
    }
  } catch (error) {
    console.error('❌ Failed to initialize authentication:', error);
    console.warn('Falling back to mock authentication');
  }
};

// Check if user is authenticated (works with both Supabase and mock)
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    if (USE_REAL_AUTH) {
      return await isAuthenticated();
    } else {
      // Check mock authentication
      const user = getCurrentUser();
      return !!user;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};