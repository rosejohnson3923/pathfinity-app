// Hybrid Data Service - Routes between mock data (demos) and real Supabase data
// Maintains demo functionality while enabling real user accounts

import { supabase } from '../lib/supabase';
import { getSecureConfig } from './azureSecureConfig';

// Demo user detection
const DEMO_DOMAIN = 'plainviewisd.edu';
const DEMO_USERS = [
  'sam.brown@sandview.plainviewisd.edu',
  'alex.davis@sandview.plainviewisd.edu', 
  'jordan.smith@oceanview.plainviewisd.edu',
  'taylor.johnson@cityview.plainviewisd.edu',
  'jenna.grain@sandview.plainviewisd.edu',
  'principal@plainviewisd.edu',
  'superintendent@plainviewisd.edu'
];

// User types
export type UserDataSource = 'mock' | 'supabase';

export interface DataServiceConfig {
  userEmail?: string;
  userRole?: string;
  tenantId?: string;
  useServiceRole?: boolean; // For admin operations
}

class HybridDataService {
  private config: DataServiceConfig = {};
  private supabaseClient: any = null;
  private supabaseServiceClient: any = null;

  // Initialize with user context
  async initialize(config: DataServiceConfig) {
    this.config = config;
    
    // Initialize regular Supabase client
    this.supabaseClient = await supabase();
    
    // Initialize service role client for admin operations
    if (config.useServiceRole) {
      await this.initializeServiceRoleClient();
    }
  }

  // Initialize service role client for admin/bulk operations
  private async initializeServiceRoleClient() {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const secureConfig = await getSecureConfig.getSupabaseConfig();
      
      this.supabaseServiceClient = createClient(
        secureConfig.url,
        secureConfig.serviceRoleKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        }
      );
      
      console.log('✅ Service role client initialized for admin operations');
    } catch (error) {
      console.error('❌ Failed to initialize service role client:', error);
    }
  }

  // Determine data source based on user
  getDataSource(userEmail?: string): UserDataSource {
    const email = userEmail || this.config.userEmail;
    
    if (!email) return 'mock'; // Default to mock if no email
    
    // Check if it's a demo user
    if (DEMO_USERS.includes(email) || email.endsWith(DEMO_DOMAIN)) {
      return 'mock';
    }
    
    return 'supabase';
  }

  // Smart data routing - returns appropriate service
  getDataServiceFor(operation: string, userEmail?: string) {
    const dataSource = this.getDataSource(userEmail);
    
    if (dataSource === 'mock') {
      console.log(`🎭 Using mock data for ${operation} (demo user)`);
      return this.getMockDataService();
    } else {
      console.log(`🔌 Using Supabase data for ${operation} (real user)`);
      return this.getSupabaseDataService();
    }
  }

  // Get mock data service (existing implementation)
  private getMockDataService() {
    return {
      // Import and use existing mock data functions
      getUsers: () => import('../data/mockAuthData').then(m => m.mockUsers),
      getTenants: () => import('../data/mockAuthData').then(m => m.mockTenants),
      // Add other mock data operations
    };
  }

  // Get Supabase data service (new implementation)
  private getSupabaseDataService() {
    return {
      getUsers: this.getSupabaseUsers.bind(this),
      getTenants: this.getSupabaseTenants.bind(this),
      getStudentProgress: this.getStudentProgress.bind(this),
      getContentLibrary: this.getContentLibrary.bind(this),
      // Add other Supabase operations
    };
  }

  // Supabase data operations
  private async getSupabaseUsers(filters?: any) {
    try {
      const client = this.supabaseServiceClient || this.supabaseClient;
      let query = client
        .from('user_profiles')
        .select('*');

      // Apply tenant filtering
      if (this.config.tenantId) {
        query = query.eq('tenant_id', this.config.tenantId);
      }

      // Apply additional filters
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching users from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSupabaseUsers:', error);
      return [];
    }
  }

  private async getSupabaseTenants() {
    try {
      const client = this.supabaseServiceClient || this.supabaseClient;
      const { data, error } = await client
        .from('tenants')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching tenants from Supabase:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getSupabaseTenants:', error);
      return [];
    }
  }

  private async getStudentProgress(studentId?: string) {
    try {
      const client = this.supabaseServiceClient || this.supabaseClient;
      let query = client
        .from('student_progress')
        .select(`
          *,
          subjects(name, code),
          user_profiles(full_name, email)
        `);

      if (this.config.tenantId) {
        query = query.eq('tenant_id', this.config.tenantId);
      }

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching student progress:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getStudentProgress:', error);
      return [];
    }
  }

  private async getContentLibrary(filters?: any) {
    try {
      const client = this.supabaseServiceClient || this.supabaseClient;
      let query = client
        .from('content_library')
        .select(`
          *,
          user_profiles(full_name, email)
        `)
        .eq('is_published', true);

      if (this.config.tenantId) {
        query = query.eq('tenant_id', this.config.tenantId);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching content library:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getContentLibrary:', error);
      return [];
    }
  }

  // Admin operations (require service role)
  async createUser(userData: any) {
    const dataSource = this.getDataSource();
    
    if (dataSource === 'mock') {
      console.log('🎭 Mock user creation (demo mode)');
      // Return mock success for demo
      return { success: true, user: { ...userData, id: 'mock-' + Date.now() } };
    }

    // Real user creation via Supabase
    try {
      if (!this.supabaseServiceClient) {
        throw new Error('Service role client required for user creation');
      }

      // Create auth user first
      const { data: authUser, error: authError } = await this.supabaseServiceClient.auth.admin.createUser({
        email: userData.email,
        password: userData.password || this.generateTempPassword(),
        email_confirm: true,
        user_metadata: {
          full_name: userData.full_name,
          role: userData.role
        }
      });

      if (authError) {
        throw new Error(`Auth user creation failed: ${authError.message}`);
      }

      // Create user profile
      const { data: profile, error: profileError } = await this.supabaseServiceClient
        .from('user_profiles')
        .insert({
          id: authUser.user.id,
          tenant_id: this.config.tenantId,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
          grade_level: userData.grade_level,
          subjects: userData.subjects
        })
        .select()
        .single();

      if (profileError) {
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      return { success: true, user: profile };
    } catch (error: any) {
      console.error('Error creating user:', error);
      return { success: false, error: error.message };
    }
  }

  private generateTempPassword(): string {
    return Math.random().toString(36).slice(-12) + 'A1!';
  }

  // Bulk operations for nightly processing
  async getBulkStudentData(tenantId?: string) {
    const effectiveTenantId = tenantId || this.config.tenantId;
    
    try {
      if (!this.supabaseServiceClient) {
        await this.initializeServiceRoleClient();
      }

      const { data, error } = await this.supabaseServiceClient
        .from('user_profiles')
        .select(`
          *,
          student_progress(*),
          assessments(*),
          daily_assignments(*)
        `)
        .eq('tenant_id', effectiveTenantId)
        .eq('role', 'student');

      if (error) {
        throw new Error(`Bulk data fetch failed: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Error in getBulkStudentData:', error);
      return [];
    }
  }
}

// Export singleton instance
export const dataService = new HybridDataService();

// Utility functions
export const isDemoUser = (email: string): boolean => {
  return DEMO_USERS.includes(email) || email.endsWith(DEMO_DOMAIN);
};

export const initializeDataService = async (userEmail?: string, tenantId?: string, useServiceRole: boolean = false) => {
  await dataService.initialize({
    userEmail,
    tenantId,
    useServiceRole
  });
  
  const dataSource = dataService.getDataSource(userEmail);
  console.log(`📊 Data service initialized - Source: ${dataSource} for ${userEmail || 'anonymous'}`);
  
  return dataSource;
};