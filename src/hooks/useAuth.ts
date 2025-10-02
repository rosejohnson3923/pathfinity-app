import { useState, useEffect } from 'react';
import { 
  signInWithEmailPassword, 
  signUpWithEmailPassword, 
  signOut, 
  getCurrentUser, 
  getSelectedTenant,
  getUserTenantsList,
  selectTenant,
  signInWithGoogle,
  signInWithMicrosoft,
  signInWithSAML,
  AuthUser,
  UserProfile,
  Tenant
} from '../services/authService';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<Tenant[]>([]);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      // Removed debug log
      setLoading(true);
      try {
        const currentUser = getCurrentUser();
        const selectedTenant = getSelectedTenant();
        
      // Removed debug log
      // Removed debug log
        
        setUser(currentUser);
        setTenant(selectedTenant);
        
        if (currentUser) {
          
          // Fetch user tenants
      // Removed debug log
          const { tenants: userTenants, error } = await getUserTenantsList(currentUser.id);
          
          if (error) {
            console.error('useAuth: Error fetching tenants:', error);
            setTenants([]);
          } else {
      // Removed debug log
            setTenants(userTenants || []);
            
            // Auto-select first tenant if no tenant is selected (bypass tenant selector)
            if (!selectedTenant && userTenants && userTenants.length > 0) {
              const firstTenant = userTenants[0];
      // Removed debug log
              
              // Store the selected tenant
              localStorage.setItem('pathfinity_selected_tenant', JSON.stringify(firstTenant));
              setTenant(firstTenant);
              
              // Create profile with auto-selected tenant
              setProfile({
                ...currentUser,
                tenant_id: firstTenant.id
              });
            } else if (selectedTenant) {
              // Create profile with existing selected tenant
              setProfile({
                ...currentUser,
                tenant_id: selectedTenant.id
              });
            }
          }
        } else {
      // Removed debug log
          setTenants([]);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setTenants([]);
      } finally {
      // Removed debug log
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: authUser, error } = await signInWithEmailPassword(email, password);
      
      if (error) {
        return { error };
      }
      
      setUser(authUser);
      
      
      // Fetch user tenants
      if (authUser) {
        const { tenants: userTenants } = await getUserTenantsList(authUser.id);
        setTenants(userTenants);
        
        // Auto-select first tenant (bypass tenant selector)
        if (userTenants && userTenants.length > 0) {
          const { tenant: selectedTenant } = await selectTenant(userTenants[0].id);
          setTenant(selectedTenant);
          
          if (selectedTenant) {
            setProfile({
              ...authUser,
              tenant_id: selectedTenant.id
            });
          }
        }
      }
      
      return { data: authUser, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: { full_name: string; role?: string }) => {
    setLoading(true);
    try {
      const { user: authUser, error } = await signUpWithEmailPassword(
        email, 
        password, 
        userData.full_name,
        userData.role || 'student'
      );
      
      if (error) {
        return { error };
      }
      
      // Don't set user here - in a real app, they would need to verify email first
      // For demo purposes, we'll set the user anyway
      setUser(authUser);
      
      return { data: authUser, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
      // Removed debug log
      // Removed debug log
    setLoading(true);
    try {
      // Removed debug log
      const { error } = await signOut();
      // Removed debug log
      
      if (error) {
      // Removed debug log
        return { error };
      }
      
      // Removed debug log
      setUser(null);
      setProfile(null);
      setTenant(null);
      setTenants([]);
      
      // Removed debug log
      return { error: null };
    } catch (error) {
      console.error('🔴 DEBUG: Sign out error:', error);
      return { error };
    } finally {
      // Removed debug log
      setLoading(false);
    }
  };

  const handleSelectTenant = async (tenantId: string) => {
    setLoading(true);
    try {
      const { tenant: selectedTenant, error } = await selectTenant(tenantId);
      
      if (error || !selectedTenant) {
        return { error: error || new Error('Failed to select tenant') };
      }
      
      setTenant(selectedTenant);
      
      // Update profile with selected tenant
      if (user) {
        setProfile({
          ...user,
          tenant_id: selectedTenant.id
        });
      }
      
      return { data: selectedTenant, error: null };
    } catch (error) {
      console.error('Select tenant error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // SSO methods
  const signInWithGoogleSSO = async () => {
    setLoading(true);
    try {
      const { user: authUser, error } = await signInWithGoogle();
      
      if (error) {
        return { error };
      }
      
      setUser(authUser);
      
      // Fetch user tenants
      if (authUser) {
        const { tenants: userTenants } = await getUserTenantsList(authUser.id);
        setTenants(userTenants);
        
        // Auto-select first tenant (bypass tenant selector)
        if (userTenants && userTenants.length > 0) {
          const { tenant: selectedTenant } = await selectTenant(userTenants[0].id);
          setTenant(selectedTenant);
          
          if (selectedTenant) {
            setProfile({
              ...authUser,
              tenant_id: selectedTenant.id
            });
          }
        }
      }
      
      return { data: authUser, error: null };
    } catch (error) {
      console.error('Google SSO error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithMicrosoftSSO = async () => {
    setLoading(true);
    try {
      const { user: authUser, error } = await signInWithMicrosoft();
      
      if (error) {
        return { error };
      }
      
      setUser(authUser);
      
      // Fetch user tenants
      if (authUser) {
        const { tenants: userTenants } = await getUserTenantsList(authUser.id);
        setTenants(userTenants);
        
        // Auto-select first tenant (bypass tenant selector)
        if (userTenants && userTenants.length > 0) {
          const { tenant: selectedTenant } = await selectTenant(userTenants[0].id);
          setTenant(selectedTenant);
          
          if (selectedTenant) {
            setProfile({
              ...authUser,
              tenant_id: selectedTenant.id
            });
          }
        }
      }
      
      return { data: authUser, error: null };
    } catch (error) {
      console.error('Microsoft SSO error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signInWithSAMLSSO = async (entityId?: string) => {
    setLoading(true);
    try {
      const { user: authUser, error } = await signInWithSAML(entityId);
      
      if (error) {
        return { error };
      }
      
      setUser(authUser);
      
      // Fetch user tenants
      if (authUser) {
        const { tenants: userTenants } = await getUserTenantsList(authUser.id);
        setTenants(userTenants);
        
        // Auto-select first tenant (bypass tenant selector)
        if (userTenants && userTenants.length > 0) {
          const { tenant: selectedTenant } = await selectTenant(userTenants[0].id);
          setTenant(selectedTenant);
          
          if (selectedTenant) {
            setProfile({
              ...authUser,
              tenant_id: selectedTenant.id
            });
          }
        }
      }
      
      return { data: authUser, error: null };
    } catch (error) {
      console.error('SAML SSO error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    profile,
    tenant,
    tenants,
    loading,
    signIn,
    signUp,
    signOut: handleSignOut,
    selectTenant: handleSelectTenant,
    signInWithGoogle: signInWithGoogleSSO,
    signInWithMicrosoft: signInWithMicrosoftSSO,
    signInWithSAML: signInWithSAMLSSO
  };
}