import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';
import { usePageCategory } from '../../hooks/usePageCategory';
import { 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Lock, 
  AlertCircle, 
  LogIn,
  UserPlus,
  ArrowLeft
} from 'lucide-react';

export function Login() {
  // Set page category for proper width management
  usePageCategory('auth');
  
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [ssoLoading, setSsoLoading] = useState<string | null>(null);
  // Removed demo tab - Login page is now subscriber-only
  // const [activeTab, setActiveTab] = useState<'subscriber' | 'demo'>('subscriber');
  
  const { 
    signIn, 
    signUp, 
    signInWithGoogle, 
    signInWithMicrosoft, 
    signInWithSAML 
  } = useAuthContext();
  
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Get the redirect path from location state or default to dashboard
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // Demo user mapping
  const demoUsers = {
    // Student users
    'alex-1st': { email: 'alex.davis@sandview.plainviewisd.edu', password: 'password123', name: 'Alex Davis (1st Grade)', role: 'Student' },
    'sam-k': { email: 'sam.brown@sandview.plainviewisd.edu', password: 'password123', name: 'Sam Brown (Kindergarten)', role: 'Student' },
    'jordan-7th': { email: 'jordan.smith@oceanview.plainviewisd.edu', password: 'password123', name: 'Jordan Smith (7th Grade)', role: 'Student' },
    'taylor-10th': { email: 'taylor.johnson@cityview.plainviewisd.edu', password: 'password123', name: 'Taylor Johnson (10th Grade)', role: 'Student' },
    
    // Teacher view (consolidated)
    'teacher-view': { email: 'jenna.grain@sandview.plainviewisd.edu', password: 'password123', name: 'Ms. Jenna Grain', role: 'Teacher' },
    'jenna-teacher': { email: 'jenna.grain@sandview.plainviewisd.edu', password: 'password123', name: 'Ms. Jenna Grain', role: 'Teacher' },
    'brenda-teacher': { email: 'brenda.sea@oceanview.plainviewisd.edu', password: 'password123', name: 'Ms. Brenda Sea', role: 'Teacher' },
    'john-teacher': { email: 'john.land@cityview.plainviewisd.edu', password: 'password123', name: 'Mr. John Land', role: 'Teacher' },
    'lisa-teacher': { email: 'lisa.johnson@cityview.plainviewisd.edu', password: 'password123', name: 'Ms. Lisa Johnson', role: 'Teacher' },
    
    // Admin view (school level)
    'admin-view': { email: 'principal@plainviewisd.edu', password: 'password123', name: 'Dr. Maria Rodriguez', role: 'Principal' },
    'principal': { email: 'principal@plainviewisd.edu', password: 'password123', name: 'Dr. Maria Rodriguez', role: 'Principal' },
    
    // District view (district level)
    'district-view': { email: 'superintendent@plainviewisd.edu', password: 'password123', name: 'Dr. James Wilson', role: 'Superintendent' },
    'superintendent': { email: 'superintendent@plainviewisd.edu', password: 'password123', name: 'Dr. James Wilson', role: 'Superintendent' },
    
    // Parent users
    'sarah-parent': { email: 'sarah.davis@family.pathfinity.edu', password: 'password123', name: 'Sarah Davis', role: 'Parent' },
    'mike-parent': { email: 'mike.brown@family.pathfinity.edu', password: 'password123', name: 'Mike Brown', role: 'Parent' }
  };

  // Check for demo mode on component mount
  useEffect(() => {
    const isDemoMode = searchParams.get('demo') === 'true';
    const demoUser = searchParams.get('user');
    
    if (isDemoMode && demoUser && demoUsers[demoUser as keyof typeof demoUsers]) {
      const user = demoUsers[demoUser as keyof typeof demoUsers];
      setEmail(user.email);
      setPassword(user.password);
      
      // Set demo mode flag in localStorage for TenantSelector timeout detection
      localStorage.setItem('demo_mode', 'true');
      console.log('🎯 Demo mode flag set in localStorage');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔴 DEBUG: Login form submitted');
    console.log('🔴 DEBUG: Email:', email);
    console.log('🔴 DEBUG: Password:', password ? '***' : 'empty');
    console.log('🔴 DEBUG: isLogin:', isLogin);
    
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        console.log('🔴 DEBUG: Calling signIn()');
        const { error } = await signIn(email, password);
        console.log('🔴 DEBUG: signIn() result:', { error: error?.message || 'no error' });
        if (error) {
          if (error.message && error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please check your credentials and try again.');
          } else {
            setError(error.message || 'An error occurred during sign in');
          }
        } else {
          console.log('🔴 DEBUG: Login successful, processing...');
          
          // Check if this is a demo user (regardless of URL params)
          const isDemoMode = searchParams.get('demo') === 'true';
          const isDemoUserEmail = [
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
          ].includes(email.toLowerCase());
          
          // Keep demo mode flag for demo users, clear it for regular users
          if (isDemoUserEmail) {
            localStorage.setItem('demo_mode', 'true');
            console.log('🎯 Demo mode flag set for demo user:', email);
          } else if (!isDemoMode) {
            localStorage.removeItem('demo_mode');
            console.log('🎯 Demo mode flag cleared for regular user');
          }
          
          console.log('🔴 DEBUG: Login successful, navigating to dashboard');
          console.log('🔴 DEBUG: Email used for login:', email);
          console.log('🔴 DEBUG: Is demo mode:', isDemoMode);
          console.log('🔴 DEBUG: Is demo user email:', isDemoUserEmail);
          
          
          console.log('🔴 DEBUG: About to call navigate()');
          navigate('/app/dashboard', { replace: true });
          console.log('🔴 DEBUG: navigate() call completed');
        }
      } else {
        // Ensure userData is passed as an object, not a string
        const userData = { full_name: fullName };
        const { error } = await signUp(email, password, userData);
        if (error) {
          setError(error.message || 'An error occurred during sign up');
        } else {
          setError('');
          // In a real app, we would show a verification message
          // For demo purposes, we'll just switch to login view
          alert('Registration successful! In a real app, you would need to verify your email.');
          setIsLogin(true);
          setPassword('');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('An unexpected error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = async (provider: 'google' | 'microsoft' | 'saml') => {
    setError('');
    setSsoLoading(provider);
    
    try {
      let result;
      
      switch (provider) {
        case 'google':
          result = await signInWithGoogle();
          break;
        case 'microsoft':
          result = await signInWithMicrosoft();
          break;
        case 'saml':
          result = await signInWithSAML();
          break;
      }
      
      if (result.error) {
        setError(result.error.message || `Error signing in with ${provider}`);
      } else {
        navigate('/app/dashboard', { replace: true });
      }
    } catch (err) {
      console.error(`${provider} SSO error:`, err);
      setError(`An error occurred during ${provider} sign in`);
    } finally {
      setSsoLoading(null);
    }
  };

  // Demo credentials helper with proper Plainview ISD testbed assignments
  const fillDemoCredentials = (userType: 'alex' | 'sam' | 'jordan' | 'taylor' | 'jenna' | 'brenda' | 'john' | 'principal' | 'superintendent' | 'sarah' | 'mike' | 'lisa') => {
    switch (userType) {
      case 'alex':
        setEmail('alex.davis@sandview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'sam':
        setEmail('sam.brown@sandview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'jordan':
        setEmail('jordan.smith@oceanview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'taylor':
        setEmail('taylor.johnson@cityview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'jenna':
        setEmail('jenna.grain@sandview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'brenda':
        setEmail('brenda.sea@oceanview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'john':
        setEmail('john.land@cityview.plainviewisd.edu');
        setPassword('password123');
        break;
      case 'principal':
        setEmail('principal@plainviewisd.edu');
        setPassword('password123');
        break;
      case 'superintendent':
        setEmail('superintendent@plainviewisd.edu');
        setPassword('password123');
        break;
      case 'sarah':
        setEmail('sarah.davis@family.pathfinity.edu');
        setPassword('password123');
        break;
      case 'mike':
        setEmail('mike.brown@family.pathfinity.edu');
        setPassword('password123');
        break;
      case 'lisa':
        setEmail('lisa.johnson@cityview.plainviewisd.edu');
        setPassword('password123');
        break;
    }
  };

  // Check if we're in demo mode from URL params
  const isDemoMode = searchParams.get('demo') === 'true';
  const demoUser = searchParams.get('user');
  const isStreamlinedDemo = isDemoMode && demoUser && demoUsers[demoUser as keyof typeof demoUsers];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header - Hidden in streamlined demo mode */}
        {!isStreamlinedDemo && (
          <div className="text-center">
            <img
              src="/images/pathfinity-logo-metallic-dark.png"
              alt="Pathfinity"
              className="mx-auto h-24 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to gradient logo
                const fallback = document.createElement('div');
                fallback.className = 'mx-auto h-24 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-4xl">P∞</span>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {isLogin ? 'Sign in to your Pathfinity account' : 'Join Pathfinity today'}
            </p>
          </div>
        )}

        {/* Streamlined Demo Header */}
        {isStreamlinedDemo && (
          <div className="text-center">
            <img
              src="/images/pathfinity-logo-metallic-dark.png"
              alt="Pathfinity"
              className="mx-auto h-20 w-auto object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                // Fallback to gradient logo
                const fallback = document.createElement('div');
                fallback.className = 'mx-auto h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center';
                fallback.innerHTML = '<span class="text-white font-bold text-xl">P</span>';
                target.parentNode?.insertBefore(fallback, target);
              }}
            />
            <h2 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
              Demo Access
            </h2>
            <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              {demoUsers[demoUser as keyof typeof demoUsers]?.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {demoUsers[demoUser as keyof typeof demoUsers]?.role}
            </p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
            {/* Removed tabs - Login page is now subscriber-only */}

            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Subscriber Access - Always show unless in streamlined demo mode */}
            {!isStreamlinedDemo && (
              <>
                {!isLogin && (
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        required={!isLogin}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      placeholder={isLogin ? 'Enter your password' : 'Create a password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
              </>
            )}

            {/* Demo Access - Only in streamlined demo mode */}
            {isStreamlinedDemo && (
              <>
                {/* Demo credentials display */}
                <div>
                  <label htmlFor="demo-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Demo Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="demo-email"
                      name="demo-email"
                      type="email"
                      value={email}
                      readOnly
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="demo-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Demo Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      id="demo-password"
                      name="demo-password"
                      type="text"
                      value="••••••••••••"
                      readOnly
                      className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Please wait...' : 'Enter Demo Dashboard'}
                </button>

                {/* Option to go back to demo selection */}
                {isStreamlinedDemo && (
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => navigate('/demo')}
                      className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      Choose different demo
                    </button>
                  </div>
                )}
              </>
            )}

            {/* SSO Options - Only for regular login */}
            {isLogin && !isStreamlinedDemo && (
              <div className="mt-4">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('google')}
                    disabled={!!ssoLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ssoLoading === 'google' ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    ) : (
                      <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('microsoft')}
                    disabled={!!ssoLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ssoLoading === 'microsoft' ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    ) : (
                      <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSSOLogin('saml')}
                    disabled={!!ssoLoading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {ssoLoading === 'saml' ? (
                      <div className="animate-spin h-5 w-5 border-2 border-gray-500 rounded-full border-t-transparent"></div>
                    ) : (
                      <svg className="h-5 w-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sign up/Sign in toggle - Only for regular login */}
          {!isStreamlinedDemo && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setPassword('');
                  setFullName('');
                }}
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          )}

          {/* Demo selection buttons removed - demo access now handled by /demo page */}
          {false && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                🎯 Quick Demo Access
              </h3>
              
              {/* Student Grade Levels for Theme Testing - Plainview ISD Testbed */}
              <div className="mb-3">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Plainview ISD Students:</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('sam')}
                    className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-800"
                  >
                    🧒 Sam Brown (Grade K)<br />Sand View Elementary
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('alex')}
                    className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded border border-yellow-300 dark:border-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-800"
                  >
                    🌟 Alex Davis (Grade 1)<br />Sand View Elementary
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('jordan')}
                    className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded border border-green-300 dark:border-green-700 hover:bg-green-200 dark:hover:bg-green-800"
                  >
                    🌊 Jordan (Grade 6-8)<br />Ocean View Middle
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('taylor')}
                    className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded border border-purple-300 dark:border-purple-700 hover:bg-purple-200 dark:hover:bg-purple-800"
                  >
                    🏙️ Taylor (Grade 9-12)<br />City View High
                  </button>
                </div>
              </div>

              {/* Teacher Access */}
              <div className="mb-2">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Teacher Access:</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('jenna')}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    👩‍🏫 Ms. Jenna Grain<br />Sand View Elementary
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('brenda')}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    👩‍🏫 Ms. Brenda Sea<br />Ocean View Middle
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('john')}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    👨‍🏫 Mr. John Land<br />City View High
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('lisa')}
                    className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-800"
                  >
                    👩‍🏫 Ms. Lisa Johnson<br />City View High
                  </button>
                </div>
              </div>

              {/* Parent Access */}
              <div className="mb-2">
                <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Parent Access:</p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('sarah')}
                    className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800"
                  >
                    👩‍👧 Sarah Davis<br />Parent Dashboard
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('mike')}
                    className="text-xs bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded border border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-800"
                  >
                    👨‍👦 Mike Brown<br />Parent Dashboard
                  </button>
                </div>
              </div>

              {/* School & District Administration */}
              <div className="mb-2">
                <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">School & District Administration:</p>
                <div className="grid grid-cols-1 gap-1">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('principal')}
                    className="text-xs bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2 py-1 rounded border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
                  >
                    🏫 Dr. Maria Rodriguez - Principal<br />Sand View Elementary
                  </button>
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('superintendent')}
                    className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 px-2 py-1 rounded border border-indigo-300 dark:border-indigo-700 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                  >
                    🎓 Dr. James Wilson - Superintendent<br />Plainview ISD
                  </button>
                </div>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                <strong>Note:</strong> This is a demo application. No real authentication is performed.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}