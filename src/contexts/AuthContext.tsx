import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthUser, UserProfile, Tenant } from '../services/authService';

interface AuthContextType {
  user: AuthUser | null;
  profile: UserProfile | null;
  tenant: Tenant | null;
  tenants: Tenant[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, userData: any) => Promise<any>;
  signOut: () => Promise<any>;
  selectTenant: (tenantId: string) => Promise<any>;
  signInWithGoogle: () => Promise<any>;
  signInWithMicrosoft: () => Promise<any>;
  signInWithSAML: (entityId?: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  
  // Add timeout for loading state to prevent infinite loading
  const [showTimeout, setShowTimeout] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (auth.loading) {
        console.warn('Auth loading timeout - forcing render');
        setShowTimeout(true);
      }
    }, 5000); // 5 second timeout
    
    return () => clearTimeout(timer);
  }, [auth.loading]);
  
  // Track previous auth state for logging
  const prevUser = React.useRef(auth.user);
  const prevLoading = React.useRef(auth.loading);

  // Log only significant auth state changes
  React.useEffect(() => {
    if (prevUser.current !== auth.user || (prevLoading.current && !auth.loading)) {
      if (process.env.NODE_ENV === 'development') {
        console.log('Auth state:', {
          user: auth.user ? 'authenticated' : 'unauthenticated',
          loading: auth.loading
        });
      }
    }

    prevUser.current = auth.user;
    prevLoading.current = auth.loading;
  }, [auth.loading, auth.user]);

  return (
    <AuthContext.Provider value={auth}>
      {/* Loading screen disabled to prevent logout delays */}
      {false && auth.loading && !showTimeout ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
            {process.env.NODE_ENV === 'development' && (
              <p className="text-xs text-gray-500 mt-2">Debug: Auth loading = {String(auth.loading)}</p>
            )}
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}