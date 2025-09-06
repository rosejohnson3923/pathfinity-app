import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { getCurrentUser } from '../../services/authService';
import { Building, ChevronDown, Search, Check, LogOut } from 'lucide-react';
import { isDemoUser, getLogoutRedirectPath, logDemoUserDetection } from '../../utils/demoUserDetection';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { voiceManagerService } from '../../services/voiceManagerService';

export function TenantSelector() {
  const { user, tenants, selectTenant, signOut, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  useEffect(() => {
    // Debug logging
    console.log('TenantSelector: Current state', {
      user,
      tenants,
      authLoading,
      tenantsLength: tenants?.length
    });
    
    setDebugInfo(`User: ${user?.email || 'none'}, Tenants: ${tenants?.length || 0}, AuthLoading: ${authLoading}`);
    
    // If there's only one tenant, auto-select it
    if (tenants && tenants.length === 1) {
      setSelectedTenant(tenants[0]);
    }
  }, [tenants, user, authLoading]);

  const handleTenantSelect = async (tenant: any) => {
    setSelectedTenant(tenant);
    setIsDropdownOpen(false);
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await selectTenant(tenant.id);
      
      if (error) {
        setError(error.message || 'Failed to select tenant');
        return;
      }
      
      // Navigate to the dashboard or the original requested page
      navigate(from, { replace: true });
    } catch (err) {
      console.error('Error selecting tenant:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Stop all speech immediately when logging out
      companionVoiceoverService.stopCurrent();
      voiceManagerService.stopSpeaking();
      
      console.log('🔍 TenantSelector logout triggered');
      
      // Check if the current user is a demo user
      const demoUserEmails = [
        'alex.davis@sandview.plainviewisd.edu',
        'sam.brown@sandview.plainviewisd.edu',
        'jordan.smith@oceanview.plainviewisd.edu',
        'taylor.johnson@cityview.plainviewisd.edu',
        'jenna.grain@sandview.plainviewisd.edu',
        'brenda.sea@oceanview.plainviewisd.edu',
        'john.land@cityview.plainviewisd.edu',
        'lisa.johnson@cityview.plainviewisd.edu',
        'principal@plainviewisd.edu',
        'superintendent@plainviewisd.edu',
        'sarah.davis@family.pathfinity.edu',
        'mike.brown@family.pathfinity.edu'
      ];

      const demoUserNames = [
        'Sam Brown',
        'Alex Davis', 
        'Jordan Smith',
        'Taylor Johnson',
        'Jenna Grain',
        'Brenda Sea',
        'John Land',
        'Lisa Johnson',
        'Dr. Maria Rodriguez',
        'Dr. James Wilson',
        'Sarah Davis',
        'Mike Brown'
      ];

      const demoUserIds = [
        '18eb6e8c-eb5b-433f-9ed0-f9599c2c7c01', // Alex Davis
        'd472ea4d-4174-432f-a273-ea213f2ebae4', // Sam Brown
        'e56af6a7-4eb8-4c68-b99e-2dadad0ccca3', // Jordan Smith
        'c7518a53-36e7-459d-a41a-43d413b02230'  // Taylor Johnson
      ];

      const userEmail = user?.email;
      const userFullName = user?.full_name;
      const userId = user?.id;
      
      const isDemoUser = 
        (userEmail && demoUserEmails.includes(userEmail)) ||
        (userFullName && demoUserNames.includes(userFullName)) ||
        (userId && demoUserIds.includes(userId)) ||
        (userId && userId.includes('demo'));

      console.log('🔍 TenantSelector logout - User email:', userEmail);
      console.log('🔍 TenantSelector logout - User full_name:', userFullName);
      console.log('🔍 TenantSelector logout - User id:', userId);
      console.log('🔍 TenantSelector logout - Is demo user:', isDemoUser);

      await signOut();
      
      // Redirect demo users to demo page, regular users to login
      if (isDemoUser) {
        console.log('🔄 TenantSelector redirecting demo user to /demo');
        navigate('/demo');
      } else {
        console.log('🔄 TenantSelector redirecting regular user to /login');
        navigate('/login');
      }
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const filteredTenants = tenants.filter(tenant => 
    tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show loading state if auth is still loading (timeout disabled)
  if (authLoading) {
    console.log('🔍 TenantSelector: Auth loading state detected, but timeout disabled to prevent logout delays');
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading authentication...</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm"
          >
            Skip to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Show error if no user
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">No user found. Please log in again.</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Back to Login
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Try Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // If no tenants but user exists, create a default tenant scenario
  if (!tenants || tenants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-yellow-600 dark:text-yellow-400 mb-4">No organizations found for your account.</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Continue to Dashboard
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div>
          <div className="flex justify-center">
            <img 
              src="/images/pathfinity-logo-metallic-dark.png" 
              alt="Pathfinity Logo" 
              className="h-12 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to gradient logo
                const fallback = document.createElement('div');
                fallback.className = 'h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-xl">P∞</span>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Select your organization
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Choose the organization you want to access
          </p>
          
          {user && (
            <div className="mt-4 flex items-center justify-center space-x-2">
              <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                <p className="text-xs text-blue-800 dark:text-blue-300">
                  Signed in as <span className="font-medium">{user.email}</span>
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 flex items-center"
              >
                <LogOut className="w-3 h-3 mr-1" />
                Sign Out
              </button>
            </div>
          )}
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-sm text-red-600 dark:text-red-400">
            {error}
          </div>
        )}
        
        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 text-xs text-yellow-600 dark:text-yellow-400">
            <p>Debug: {debugInfo}</p>
            <p>Tenants available: {JSON.stringify(tenants?.map(t => ({id: t.id, name: t.name})) || [])}</p>
          </div>
        )}
        
        <div className="mt-8 relative">
          <button
            type="button"
            className="relative w-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm pl-3 pr-10 py-3 text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-3"></div>
                <span>Loading organizations...</span>
              </div>
            ) : selectedTenant ? (
              <div className="flex items-center">
                {selectedTenant.logo ? (
                  <img 
                    src={selectedTenant.logo} 
                    alt={selectedTenant.name} 
                    className="h-6 w-6 rounded-md mr-3 object-cover"
                  />
                ) : (
                  <Building className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                )}
                <span className="block truncate text-gray-900 dark:text-white">{selectedTenant.name}</span>
              </div>
            ) : (
              <span className="block truncate text-gray-500 dark:text-gray-400">Select an organization</span>
            )}
            <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </span>
          </button>

          {isDropdownOpen && (
            <div className="absolute mt-1 w-full rounded-md bg-white dark:bg-gray-700 shadow-lg z-10 border border-gray-200 dark:border-gray-600">
              <div className="p-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                    placeholder="Search organizations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <ul className="max-h-60 overflow-auto py-1 text-base sm:text-sm">
                {filteredTenants && filteredTenants.length > 0 ? (
                  filteredTenants.map((tenant) => (
                    <li
                      key={tenant.id}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100 dark:hover:bg-gray-600"
                      onClick={() => handleTenantSelect(tenant)}
                    >
                      <div className="flex items-center">
                        {tenant.logo ? (
                          <img 
                            src={tenant.logo} 
                            alt={tenant.name} 
                            className="h-6 w-6 rounded-md mr-3 object-cover"
                          />
                        ) : (
                          <Building className="h-5 w-5 text-gray-400 dark:text-gray-300 mr-3" />
                        )}
                        <span className={`block truncate ${selectedTenant?.id === tenant.id ? 'font-medium text-blue-600 dark:text-blue-400' : 'font-normal text-gray-900 dark:text-white'}`}>
                          {tenant.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                          {tenant.subscription_tier}
                        </span>
                      </div>

                      {selectedTenant?.id === tenant.id && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600 dark:text-blue-400">
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="text-center py-3 text-gray-500 dark:text-gray-400">
                    {tenants && tenants.length === 0 ? 'No organizations assigned to your account' : 'No organizations found'}
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
        
        <div className="mt-6">
          <button
            type="button"
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!selectedTenant || loading}
            onClick={() => selectedTenant && handleTenantSelect(selectedTenant)}
          >
            {loading ? 'Please wait...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}