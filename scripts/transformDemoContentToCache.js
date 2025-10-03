/**
 * Transform DemoLessonContent.ts data to demoUserCache.json format
 *
 * This script converts the existing comprehensive demo content from DemoLessonContent.ts
 * into the cache format used by demoUserCache.json for fast demo loading.
 */

const fs = require('fs');
const path = require('path');

// Import the demo lesson content
// Note: We'll load this dynamically since it's a .ts file

// User mapping: cache key -> DemoLessonContent key + metadata
const USER_MAPPINGS = {
  // Phase 1 Users (Microschool - immediate deployment)
  'Zara Jones': {
    contentKey: 'zara_k_doctor',
    grade: 'K',
    gradeLevel: 'Kindergarten',
    email: 'zara.jones@newfrontier.pathfinity.edu'
  },
  'Alexis Martin': {
    contentKey: 'alexis_1st_teacher',
    grade: '1',
    gradeLevel: 'Grade 1',
    email: 'alexis.martin@newfrontier.pathfinity.edu'
  },
  'David Brown': {
    contentKey: 'david_7th_talent_agent',
    grade: '7',
    gradeLevel: 'Grade 7',
    email: 'david.brown@newfrontier.pathfinity.edu'
  },
  'Mike Johnson': {
    contentKey: 'mike_10th_football_player',
    grade: '10',
    gradeLevel: 'Grade 10',
    email: 'mike.johnson@newfrontier.pathfinity.edu'
  },

  // Phase 3 Users (Live Demo transition - future)
  'Sam Brown': {
    contentKey: 'sam_k_chef',
    grade: 'K',
    gradeLevel: 'Kindergarten',
    email: 'sam.brown@sandview.plainviewisd.edu'
  },
  'Alex Davis': {
    contentKey: 'alex_1st_doctor',
    grade: '1',
    gradeLevel: 'Grade 1',
    email: 'alex.davis@sandview.plainviewisd.edu'
  },
  'Jordan Smith': {
    contentKey: 'jordan_7th_game_designer',
    grade: '7',
    gradeLevel: 'Grade 7',
    email: 'jordan.smith@oceanview.plainviewisd.edu'
  },
  'Taylor Johnson': {
    contentKey: 'taylor_10th_sports_agent',
    grade: '10',
    gradeLevel: 'Grade 10',
    email: 'taylor.johnson@cityview.plainviewisd.edu'
  }
};

// Subject mapping
const SUBJECT_MAPPING = {
  'math': 'Math',
  'ela': 'ELA',
  'science': 'Science',
  'social_studies': 'SocialStudies'
};

/**
 * Transform DemoLessonContent format to cache format
 */
function transformUserContent(userName, userMapping) {
  const contentKey = userMapping.contentKey;

  // For now, we'll create a basic structure that matches the cache format
  // The actual DemoLessonContent will be integrated when the cache is loaded
  console.log(`Creating cache structure for ${userName} (${contentKey})`);

  // We know the content exists in DemoLessonContent.ts, so create the structure

  // Create user object
  const user = {
    name: userName,
    grade: userMapping.grade,
    gradeLevel: userMapping.gradeLevel
  };

  // Create dashboard cards (using role1 as primary display)
  const dashboardCards = Object.keys(SUBJECT_MAPPING).map(subjectKey => {
    const subjectName = SUBJECT_MAPPING[subjectKey];
    const role1Content = demoContent.role1[subjectKey];

    return {
      subject: subjectName,
      title: extractSkillTitle(role1Content, subjectName, userMapping.grade),
      description: `Learn ${subjectName} fundamentals`,
      skillNumber: 'A.1' // Standard skill number for cache format
    };
  });

  // Create skills object (all roles + subjects)
  const skills = {};

  Object.keys(SUBJECT_MAPPING).forEach(subjectKey => {
    const subjectName = SUBJECT_MAPPING[subjectKey];
    skills[subjectName] = {};

    // Add all 4 roles (tiers) for this subject
    ['role1', 'role2', 'role3', 'role4'].forEach((role, index) => {
      const roleContent = demoContent[role][subjectKey];
      const skillId = `A.${index + 1}`;

      skills[subjectName][skillId] = {
        id: generateSkillId(),
        subject: subjectName,
        grade: userMapping.grade,
        skills_area: `${subjectName} Foundations`,
        skills_cluster: 'A.',
        skill_number: skillId,
        skill_name: extractSkillTitle(roleContent, subjectName, userMapping.grade),
        skill_description: roleContent.learningOutcome,
        difficulty_level: index + 1, // 1-4 based on role
        estimated_time_minutes: 25,
        prerequisites: index === 0 ? null : `A.${index}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Store the full role content for lesson generation
        roleContent: roleContent,
        tier: getTierName(index)
      };
    });
  });

  return {
    user,
    dashboardCards,
    skills,
    // Metadata
    _metadata: {
      source: 'DemoLessonContent.ts',
      contentKey: contentKey,
      transformedAt: new Date().toISOString(),
      email: userMapping.email,
      phase: userName.includes('Jones') || userName.includes('Martin') || userName.includes('Brown') || userName.includes('Johnson') ?
             (userMapping.email.includes('newfrontier') ? 'phase1' : 'phase3') : 'unknown'
    }
  };
}

/**
 * Extract a meaningful skill title from role content
 */
function extractSkillTitle(roleContent, subject, grade) {
  // Generate age-appropriate titles based on subject and grade
  const titleTemplates = {
    'Math': {
      'K': 'Numbers to 3',
      '1': 'Counting to 10',
      '7': 'Understanding integers',
      '10': 'Advanced number concepts'
    },
    'ELA': {
      'K': 'Letter identification',
      '1': 'Consonants and vowels',
      '7': 'Reading comprehension',
      '10': 'Advanced text analysis'
    },
    'Science': {
      'K': 'Shapes and colors',
      '1': 'Classification skills',
      '7': 'Scientific inquiry',
      '10': 'Advanced research methods'
    },
    'SocialStudies': {
      'K': 'Community',
      '1': 'Rules and laws',
      '7': 'Geography skills',
      '10': 'Government systems'
    }
  };

  return titleTemplates[subject]?.[grade] || `${subject} Skills`;
}

/**
 * Get tier name from role index
 */
function getTierName(roleIndex) {
  const tiers = ['select', 'premium', 'booster', 'aifirst'];
  return tiers[roleIndex] || 'select';
}

/**
 * Generate a unique skill ID
 */
function generateSkillId() {
  return 'skill_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Main transformation function
 */
function transformDemoContentToCache(usersToTransform = 'phase1') {
  console.log(`🔄 Starting transformation for ${usersToTransform} users...`);

  // Load existing cache
  const cacheFilePath = path.join(__dirname, '../src/data/demoCache/demoUserCache.json');
  let existingCache = {};

  try {
    const existingContent = fs.readFileSync(cacheFilePath, 'utf8');
    existingCache = JSON.parse(existingContent);
    console.log('✅ Loaded existing cache file');
  } catch (error) {
    console.log('⚠️ Could not load existing cache, starting fresh');
  }

  // Determine which users to transform
  let usersToProcess = [];

  if (usersToTransform === 'phase1') {
    usersToProcess = ['Zara Jones', 'Alexis Martin', 'David Brown', 'Mike Johnson'];
  } else if (usersToTransform === 'phase3') {
    usersToProcess = ['Sam Brown', 'Alex Davis', 'Jordan Smith', 'Taylor Johnson'];
  } else if (usersToTransform === 'all') {
    usersToProcess = Object.keys(USER_MAPPINGS);
  }

  console.log(`📝 Processing users: ${usersToProcess.join(', ')}`);

  // Transform each user
  let transformedCount = 0;
  usersToProcess.forEach(userName => {
    const userMapping = USER_MAPPINGS[userName];

    if (!userMapping) {
      console.error(`❌ No mapping found for user: ${userName}`);
      return;
    }

    console.log(`  🔄 Transforming: ${userName} (${userMapping.contentKey})`);

    const transformedContent = transformUserContent(userName, userMapping);

    if (transformedContent) {
      existingCache[userName] = transformedContent;
      transformedCount++;
      console.log(`    ✅ Successfully transformed ${userName}`);
    } else {
      console.error(`    ❌ Failed to transform ${userName}`);
    }
  });

  // Save updated cache
  try {
    const updatedCacheContent = JSON.stringify(existingCache, null, 2);
    fs.writeFileSync(cacheFilePath, updatedCacheContent, 'utf8');
    console.log(`\n🎉 Successfully updated cache file!`);
    console.log(`📊 Transformed ${transformedCount} users`);
    console.log(`📁 Cache file: ${cacheFilePath}`);
  } catch (error) {
    console.error('❌ Failed to save cache file:', error);
    process.exit(1);
  }
}

// CLI interface
const args = process.argv.slice(2);
const mode = args[0] || 'phase1';

if (!['phase1', 'phase3', 'all'].includes(mode)) {
  console.error('Usage: node transformDemoContentToCache.js [phase1|phase3|all]');
  console.error('  phase1: Transform Zara/Alexis/David/Mike (immediate deployment)');
  console.error('  phase3: Transform Sam/Alex/Jordan/Taylor (future deployment)');
  console.error('  all: Transform all users');
  process.exit(1);
}

// Run transformation
transformDemoContentToCache(mode);