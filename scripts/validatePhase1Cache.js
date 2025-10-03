/**
 * Validate Phase 1 Cache Implementation
 *
 * This script validates that all Phase 1 components are working correctly:
 * - Cache user detection
 * - Cache content loading
 * - Lesson plan generation
 */

import { DemoCacheService } from '../src/services/cache/DemoCacheService.js';
import { shouldUseCachedContent, getCacheKeyForUser, detectUserCacheType } from '../src/utils/cacheUserDetection.js';

const PHASE1_USERS = [
  { name: 'Zara Jones', email: 'zara.jones@newfrontier.pathfinity.edu' },
  { name: 'Alexis Martin', email: 'alexis.martin@newfrontier.pathfinity.edu' },
  { name: 'David Brown', email: 'david.brown@newfrontier.pathfinity.edu' },
  { name: 'Mike Johnson', email: 'mike.johnson@newfrontier.pathfinity.edu' }
];

function validatePhase1Cache() {
  console.log('🔍 Validating Phase 1 Cache Implementation...\n');

  let allTestsPassed = true;

  // Test 1: Cache detection
  console.log('Test 1: User cache detection');
  PHASE1_USERS.forEach(user => {
    const shouldUseCache = shouldUseCachedContent(user.email, user.name);
    const cacheKey = getCacheKeyForUser(user.email, user.name);
    const cacheType = detectUserCacheType(user.email, user.name);

    console.log(`  ${user.name}:`);
    console.log(`    - Should use cache: ${shouldUseCache}`);
    console.log(`    - Cache key: ${cacheKey}`);
    console.log(`    - Cache type: ${cacheType.userType}`);

    if (!shouldUseCache || cacheKey !== user.name || cacheType.userType !== 'cached_demo') {
      console.log(`    ❌ FAILED: Cache detection not working properly`);
      allTestsPassed = false;
    } else {
      console.log(`    ✅ PASSED`);
    }
  });

  // Test 2: Cache content loading
  console.log('\nTest 2: Cache content loading');
  PHASE1_USERS.forEach(user => {
    const userContent = DemoCacheService.loadUserContent(user.name);

    console.log(`  ${user.name}:`);
    if (!userContent) {
      console.log(`    ❌ FAILED: No cached content found`);
      allTestsPassed = false;
    } else {
      console.log(`    - Has user data: ${!!userContent.user}`);
      console.log(`    - Has dashboard cards: ${!!userContent.dashboardCards} (${userContent.dashboardCards?.length || 0})`);
      console.log(`    - Has skills: ${!!userContent.skills} (${Object.keys(userContent.skills || {}).length} subjects)`);
      console.log(`    - Grade: ${userContent.user?.grade}`);

      if (userContent.user && userContent.dashboardCards && userContent.skills) {
        console.log(`    ✅ PASSED`);
      } else {
        console.log(`    ❌ FAILED: Missing required content structure`);
        allTestsPassed = false;
      }
    }
  });

  // Test 3: Lesson plan generation
  console.log('\nTest 3: Lesson plan generation');
  PHASE1_USERS.forEach(user => {
    const lessonPlan = DemoCacheService.generateCachedLessonPlan(
      user.email,
      user.name,
      'Test Career'
    );

    console.log(`  ${user.name}:`);
    if (!lessonPlan) {
      console.log(`    ❌ FAILED: Could not generate lesson plan`);
      allTestsPassed = false;
    } else {
      console.log(`    - Student name: ${lessonPlan.student?.name}`);
      console.log(`    - Grade: ${lessonPlan.student?.grade}`);
      console.log(`    - Subjects: ${lessonPlan.subjects?.length || 0}`);
      console.log(`    - Source: ${lessonPlan.source}`);
      console.log(`    - Cached: ${lessonPlan.cached}`);

      if (lessonPlan.student && lessonPlan.subjects && lessonPlan.source === 'cached_content' && lessonPlan.cached) {
        console.log(`    ✅ PASSED`);
      } else {
        console.log(`    ❌ FAILED: Invalid lesson plan structure`);
        allTestsPassed = false;
      }
    }
  });

  // Test 4: Cache validation service
  console.log('\nTest 4: Cache validation service');
  const cacheValid = DemoCacheService.validateCacheContent();
  console.log(`  Cache validation: ${cacheValid ? '✅ PASSED' : '❌ FAILED'}`);
  if (!cacheValid) {
    allTestsPassed = false;
  }

  // Test 5: Available users
  console.log('\nTest 5: Available cached users');
  const availableUsers = DemoCacheService.getAvailableCachedUsers();
  console.log(`  Available users: ${availableUsers.join(', ')}`);

  const expectedUsers = PHASE1_USERS.map(u => u.name);
  const hasAllPhase1Users = expectedUsers.every(userName => availableUsers.includes(userName));

  console.log(`  Has all Phase 1 users: ${hasAllPhase1Users ? '✅ PASSED' : '❌ FAILED'}`);
  if (!hasAllPhase1Users) {
    allTestsPassed = false;
  }

  // Final result
  console.log('\n' + '='.repeat(50));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - Phase 1 cache implementation is ready!');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Phase 1 cache implementation needs fixes');
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  validatePhase1Cache();
}

export { validatePhase1Cache };