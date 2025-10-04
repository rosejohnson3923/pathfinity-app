/**
 * Centralized demo user detection utility
 * Used across all logout implementations to ensure consistent behavior
 */

export interface User {
  id?: string;
  email?: string;
  full_name?: string;
  [key: string]: any;
}

const DEMO_USER_EMAILS = [
  'alex.davis@sandview.plainviewisd.edu',
  'sam.brown@sandview.plainviewisd.edu',
  'jordan.smith@oceanview.plainviewisd.edu',
  'taylor.johnson@cityview.plainviewisd.edu',
  'jenna.grain@sandview.plainviewisd.edu',
  'brenda.sea@oceanview.plainviewisd.edu',
  'john.land@cityview.plainviewisd.edu',
  'lisa.johnson@cityview.plainviewisd.edu',
  'samantha.johnson@newfrontier.pathfinity.edu',
  'principal@plainviewisd.edu',
  'superintendent@plainviewisd.edu',
  'sarah.davis@family.pathfinity.edu',
  'mike.brown@family.pathfinity.edu'
];

const DEMO_USER_NAMES = [
  'Sam Brown',
  'Alex Davis',
  'Jordan Smith',
  'Taylor Johnson',
  'Jenna Grain',
  'Brenda Sea',
  'John Land',
  'Lisa Johnson',
  'Samantha Johnson',
  'Dr. Maria Rodriguez',
  'Dr. James Wilson',
  'Sarah Davis',
  'Mike Brown'
];

const DEMO_USER_IDS = [
  '18eb6e8c-eb5b-433f-9ed0-f9599c2c7c01', // Alex Davis
  'd472ea4d-4174-432f-a273-ea213f2ebae4', // Sam Brown
  'e56af6a7-4eb8-4c68-b99e-2dadad0ccca3', // Jordan Smith
  'c7518a53-36e7-459d-a41a-43d413b02230'  // Taylor Johnson
];

/**
 * Detects if a user is a demo user based on multiple criteria
 * @param user - User object with id, email, and full_name
 * @returns boolean - true if user is a demo user
 */
export function isDemoUser(user: User | null | undefined): boolean {
  if (!user) return false;

  const userEmail = user.email;
  const userFullName = user.full_name;
  const userId = user.id;
  
  return (
    (userEmail && DEMO_USER_EMAILS.includes(userEmail)) ||
    (userFullName && DEMO_USER_NAMES.includes(userFullName)) ||
    (userId && DEMO_USER_IDS.includes(userId)) ||
    (userId && userId.includes('demo'))
  );
}

/**
 * Gets the appropriate logout redirect path for a user
 * @param user - User object
 * @returns string - redirect path ('https://pathfinity.ai' for demo users in production, '/login' for regular users or localhost)
 */
export function getLogoutRedirectPath(user: User | null | undefined): string {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // If on localhost, always redirect to /login
  if (isLocalhost) {
    return '/login';
  }

  // In production, demo users go to pathfinity.ai, regular users to /login
  return isDemoUser(user) ? 'https://pathfinity.ai' : '/login';
}

/**
 * Logs demo user detection information for debugging
 * @param user - User object
 * @param context - Context string (e.g., 'Dashboard', 'Header')
 */
export function logDemoUserDetection(user: User | null | undefined, context: string): void {
  const userEmail = user?.email;
  const userFullName = user?.full_name;
  const userId = user?.id;
  const isDemo = isDemoUser(user);
  
  console.log(`🔍 ${context} logout - User email:`, userEmail);
  console.log(`🔍 ${context} logout - User full_name:`, userFullName);
  console.log(`🔍 ${context} logout - User id:`, userId);
  console.log(`🔍 ${context} logout - Is demo user:`, isDemo);
}