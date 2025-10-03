/**
 * Merge Phase 1 users into main demoUserCache.json
 *
 * This script takes the Phase 1 users (Zara, Alexis, David, Mike) from phase1Users.json
 * and merges them into the main demoUserCache.json file for Phase 1 deployment.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MAIN_CACHE_PATH = path.join(__dirname, '../src/data/demoCache/demoUserCache.json');
const PHASE1_CACHE_PATH = path.join(__dirname, '../src/data/demoCache/phase1Users.json');

function mergePhase1Users() {
  console.log('🔄 Starting Phase 1 user merge...');

  // Load existing main cache
  let mainCache = {};
  try {
    const mainCacheContent = fs.readFileSync(MAIN_CACHE_PATH, 'utf8');
    mainCache = JSON.parse(mainCacheContent);
    console.log('✅ Loaded main cache file');
    console.log(`   Current users: ${Object.keys(mainCache).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to load main cache file:', error);
    process.exit(1);
  }

  // Load Phase 1 users
  let phase1Users = {};
  try {
    const phase1Content = fs.readFileSync(PHASE1_CACHE_PATH, 'utf8');
    phase1Users = JSON.parse(phase1Content);
    console.log('✅ Loaded Phase 1 users file');
    console.log(`   Phase 1 users: ${Object.keys(phase1Users).join(', ')}`);
  } catch (error) {
    console.error('❌ Failed to load Phase 1 users file:', error);
    process.exit(1);
  }

  // Merge Phase 1 users into main cache
  const phase1UserNames = Object.keys(phase1Users);
  let addedCount = 0;
  let updatedCount = 0;

  phase1UserNames.forEach(userName => {
    if (mainCache[userName]) {
      console.log(`   🔄 Updating existing user: ${userName}`);
      updatedCount++;
    } else {
      console.log(`   ➕ Adding new user: ${userName}`);
      addedCount++;
    }

    mainCache[userName] = phase1Users[userName];
  });

  // Save updated main cache
  try {
    const updatedCacheContent = JSON.stringify(mainCache, null, 2);
    fs.writeFileSync(MAIN_CACHE_PATH, updatedCacheContent, 'utf8');

    console.log('\n🎉 Successfully merged Phase 1 users!');
    console.log(`📊 Summary:`);
    console.log(`   - Added: ${addedCount} users`);
    console.log(`   - Updated: ${updatedCount} users`);
    console.log(`   - Total users in cache: ${Object.keys(mainCache).length}`);
    console.log(`📁 Updated file: ${MAIN_CACHE_PATH}`);

  } catch (error) {
    console.error('❌ Failed to save updated cache file:', error);
    process.exit(1);
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  mergePhase1Users();
}

export { mergePhase1Users };