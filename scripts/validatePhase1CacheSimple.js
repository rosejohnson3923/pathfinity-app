/**
 * Simple Phase 1 Cache Validation
 *
 * This script validates that the Phase 1 users were properly added to the cache
 * by directly checking the JSON structure.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CACHE_PATH = path.join(__dirname, '../src/data/demoCache/demoUserCache.json');

const PHASE1_USERS = ['Zara Jones', 'Alexis Martin', 'David Brown', 'Mike Johnson'];
const REQUIRED_SUBJECTS = ['Math', 'ELA', 'Science', 'SocialStudies'];

function validateCache() {
  console.log('🔍 Validating Phase 1 Cache Structure...\n');

  // Load cache file
  let cache = {};
  try {
    const cacheContent = fs.readFileSync(CACHE_PATH, 'utf8');
    cache = JSON.parse(cacheContent);
    console.log('✅ Successfully loaded cache file');
  } catch (error) {
    console.error('❌ Failed to load cache file:', error);
    process.exit(1);
  }

  let allTestsPassed = true;

  // Check if all Phase 1 users exist
  console.log('\nTest 1: Phase 1 user presence');
  PHASE1_USERS.forEach(userName => {
    const exists = !!cache[userName];
    console.log(`  ${userName}: ${exists ? '✅ Present' : '❌ Missing'}`);
    if (!exists) allTestsPassed = false;
  });

  // Check user structure for each Phase 1 user
  console.log('\nTest 2: User content structure');
  PHASE1_USERS.forEach(userName => {
    const user = cache[userName];
    console.log(`\n  ${userName}:`);

    if (!user) {
      console.log('    ❌ User not found');
      allTestsPassed = false;
      return;
    }

    // Check basic structure
    const hasUser = !!user.user;
    const hasDashboardCards = !!user.dashboardCards;
    const hasSkills = !!user.skills;

    console.log(`    - User data: ${hasUser ? '✅' : '❌'}`);
    console.log(`    - Dashboard cards: ${hasDashboardCards ? '✅' : '❌'} (${user.dashboardCards?.length || 0})`);
    console.log(`    - Skills: ${hasSkills ? '✅' : '❌'} (${Object.keys(user.skills || {}).length} subjects)`);

    if (!hasUser || !hasDashboardCards || !hasSkills) {
      allTestsPassed = false;
    }

    // Check user details
    if (user.user) {
      console.log(`    - Name: ${user.user.name}`);
      console.log(`    - Grade: ${user.user.grade}`);
      console.log(`    - Grade level: ${user.user.gradeLevel}`);
    }

    // Check subjects coverage
    if (user.skills) {
      const availableSubjects = Object.keys(user.skills);
      const missingSubjects = REQUIRED_SUBJECTS.filter(subject => !availableSubjects.includes(subject));

      if (missingSubjects.length === 0) {
        console.log(`    - Subject coverage: ✅ All subjects present (${availableSubjects.join(', ')})`);
      } else {
        console.log(`    - Subject coverage: ❌ Missing subjects: ${missingSubjects.join(', ')}`);
        allTestsPassed = false;
      }

      // Check skills structure for each subject
      availableSubjects.forEach(subject => {
        const subjectSkills = user.skills[subject];
        const skillCount = Object.keys(subjectSkills || {}).length;
        console.log(`      - ${subject}: ${skillCount} skills`);

        // Check if at least one skill exists
        if (skillCount === 0) {
          console.log(`        ❌ No skills found for ${subject}`);
          allTestsPassed = false;
        }
      });
    }
  });

  // Check total users in cache
  console.log('\nTest 3: Total cache users');
  const allUsers = Object.keys(cache).filter(key => !key.startsWith('_'));
  console.log(`  Total users in cache: ${allUsers.length}`);
  console.log(`  Users: ${allUsers.join(', ')}`);

  const expectedCount = 8; // 4 Phase 1 + 4 Phase 3
  if (allUsers.length >= expectedCount) {
    console.log('  ✅ Expected user count');
  } else {
    console.log(`  ⚠️ Expected at least ${expectedCount} users, found ${allUsers.length}`);
  }

  // Final result
  console.log('\n' + '='.repeat(60));
  if (allTestsPassed) {
    console.log('🎉 ALL TESTS PASSED - Phase 1 cache structure is valid!');
    console.log('✅ Ready for Phase 1 deployment');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED - Phase 1 cache needs fixes');
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  validateCache();
}

export { validateCache };