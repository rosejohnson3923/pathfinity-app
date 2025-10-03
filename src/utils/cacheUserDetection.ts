/**
 * Cache User Detection - Phase 1 Implementation
 *
 * Determines which users should load content directly from cache
 * instead of attempting live API generation.
 */

// All demo users now use DemoLessonContent.ts for Teacher/Parent dashboards
const CACHED_DEMO_USERS = [
  // Phase 1: Microschool users
  'zara.jones@newfrontier.pathfinity.edu',
  'alexis.martin@newfrontier.pathfinity.edu',
  'david.brown@newfrontier.pathfinity.edu',
  'mike.johnson@newfrontier.pathfinity.edu',
  // Phase 3: Plainview users (Teacher/Parent dashboard only)
  'sam.brown@sandview.plainviewisd.edu',
  'alex.davis@sandview.plainviewisd.edu',
  'jordan.smith@oceanview.plainviewisd.edu',
  'taylor.johnson@cityview.plainviewisd.edu'
];

// No users use live APIs for Teacher/Parent dashboards anymore
const LIVE_DEMO_USERS = [];

// Name-to-email mapping for all demo users
const CACHED_USER_NAME_MAP: Record<string, string> = {
  // Phase 1: Microschool users
  'Zara Jones': 'zara.jones@newfrontier.pathfinity.edu',
  'Alexis Martin': 'alexis.martin@newfrontier.pathfinity.edu',
  'David Brown': 'david.brown@newfrontier.pathfinity.edu',
  'Mike Johnson': 'mike.johnson@newfrontier.pathfinity.edu',
  // Phase 3: Plainview users (Teacher/Parent dashboard only)
  'Sam Brown': 'sam.brown@sandview.plainviewisd.edu',
  'Alex Davis': 'alex.davis@sandview.plainviewisd.edu',
  'Jordan Smith': 'jordan.smith@oceanview.plainviewisd.edu',
  'Taylor Johnson': 'taylor.johnson@cityview.plainviewisd.edu'
};

// No users use live APIs for Teacher/Parent dashboards anymore
const LIVE_USER_NAME_MAP: Record<string, string> = {};

export interface UserCacheType {
  shouldUseCache: boolean;
  shouldUseLive: boolean;
  userType: 'cached_demo' | 'live_demo' | 'production';
  reason: string;
  userName?: string;
  userEmail?: string;
}

/**
 * Primary function to determine if user should use cached content
 */
export function shouldUseCachedContent(userEmail?: string, userName?: string): boolean {
  const cacheType = detectUserCacheType(userEmail, userName);
  return cacheType.shouldUseCache;
}

/**
 * Comprehensive user cache type detection
 */
export function detectUserCacheType(userEmail?: string, userName?: string): UserCacheType {

  // Check for cached demo users by email
  if (userEmail && CACHED_DEMO_USERS.includes(userEmail.toLowerCase())) {
    return {
      shouldUseCache: true,
      shouldUseLive: false,
      userType: 'cached_demo',
      reason: `Email ${userEmail} is configured for cached content`,
      userEmail,
      userName
    };
  }

  // Check for cached demo users by name
  if (userName && CACHED_USER_NAME_MAP[userName]) {
    return {
      shouldUseCache: true,
      shouldUseLive: false,
      userType: 'cached_demo',
      reason: `User ${userName} is configured for cached content`,
      userEmail: CACHED_USER_NAME_MAP[userName],
      userName
    };
  }

  // Check for live demo users by email
  if (userEmail && LIVE_DEMO_USERS.includes(userEmail.toLowerCase())) {
    return {
      shouldUseCache: false,
      shouldUseLive: true,
      userType: 'live_demo',
      reason: `Email ${userEmail} is configured for live API generation`,
      userEmail,
      userName
    };
  }

  // Check for live demo users by name
  if (userName && LIVE_USER_NAME_MAP[userName]) {
    return {
      shouldUseCache: false,
      shouldUseLive: true,
      userType: 'live_demo',
      reason: `User ${userName} is configured for live API generation`,
      userEmail: LIVE_USER_NAME_MAP[userName],
      userName
    };
  }

  // Default: Production user (no special handling)
  return {
    shouldUseCache: false,
    shouldUseLive: false,
    userType: 'production',
    reason: 'Production user - standard content generation',
    userEmail,
    userName
  };
}

/**
 * Get the cache key for a user (their name as it appears in demoUserCache.json)
 */
export function getCacheKeyForUser(userEmail?: string, userName?: string): string | null {
  const cacheType = detectUserCacheType(userEmail, userName);

  if (!cacheType.shouldUseCache) {
    return null;
  }

  // Return the standard name format used in cache
  if (userName && CACHED_USER_NAME_MAP[userName]) {
    return userName;
  }

  // Try to derive name from email
  if (userEmail) {
    const foundName = Object.entries(CACHED_USER_NAME_MAP).find(
      ([_, email]) => email.toLowerCase() === userEmail.toLowerCase()
    )?.[0];

    if (foundName) {
      return foundName;
    }
  }

  return null;
}

/**
 * Logging function for debugging cache detection
 */
export function logCacheDetection(userEmail?: string, userName?: string): void {
  const cacheType = detectUserCacheType(userEmail, userName);
  const cacheKey = getCacheKeyForUser(userEmail, userName);

  console.log('🎯 Phase 1 Cache Detection:', {
    userEmail,
    userName,
    cacheType,
    cacheKey,
    timestamp: new Date().toISOString()
  });
}

/**
 * Phase 1 utility - Check if user is one of the 4 target users
 */
export function isPhase1TargetUser(userEmail?: string, userName?: string): boolean {
  const cacheType = detectUserCacheType(userEmail, userName);
  return cacheType.userType === 'cached_demo';
}

/**
 * Validation function to ensure cache detection is working correctly
 */
export function validateCacheDetection(): boolean {
  const testCases = [
    { email: 'zara.jones@newfrontier.pathfinity.edu', name: 'Zara Jones', expectedCache: true },
    { email: 'sam.brown@sandview.plainviewisd.edu', name: 'Sam Brown', expectedCache: true },
    { email: 'unknown@example.com', name: 'Unknown User', expectedCache: false }
  ];

  return testCases.every(testCase => {
    const result = shouldUseCachedContent(testCase.email, testCase.name);
    const success = result === testCase.expectedCache;

    if (!success) {
      console.error(`Cache detection validation failed for ${testCase.name}:`, {
        expected: testCase.expectedCache,
        actual: result
      });
    }

    return success;
  });
}