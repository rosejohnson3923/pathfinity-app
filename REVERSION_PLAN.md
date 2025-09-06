# Reversion Plan - PathFinity Revolutionary

## Current State Analysis
- **Baseline**: v1.0.0-master-containers (commit: 4428f36)
- **Current**: 160 commits ahead with cascading issues
- **Stash**: Work in progress saved as `stash@{0}`

## Issues Identified
1. **Container Re-rendering**: Infinite loops in Experience, Discover, MultiSubject containers
2. **State Management**: Missing dependencies, improper useEffect hooks
3. **Cascading Fixes**: 15+ recent fix attempts creating new problems
4. **Performance**: Excessive debug logging, unnecessary re-renders

## Essential Fixes to Keep (Cherry-pick)

### Critical Infrastructure
- `10185d0` - Fix blank page for subjects without curriculum (Grade 10)
- `eb2dbb0` - Fix Grade 10 Science and Social Studies mapping
- Database schema updates for skills_master_v2

### Question Type Handling
- Question type validation improvements
- Fill-in-blank functionality
- Counting questions for K-2

### Core Services
- GradeContentAdapter service
- StaticDataService improvements
- AILearningJourneyService prompt builder

## Problematic Changes to Exclude

### UI/Navigation Changes
- Multiple PathIQ navigation attempts (causing scroll issues)
- Recent container "standardization" that broke re-rendering
- Excessive debug logging

### Recent Container Changes
- AIExperienceContainerV2-UNIFIED (infinite loops)
- AIDiscoverContainerV2-UNIFIED (path index issues)
- MultiSubjectContainerV2-UNIFIED (parent re-renders)

## Reversion Strategy

### Phase 1: Create Clean Branch
```bash
# Create new branch from stable baseline
git checkout -b feature/stable-rebuild v1.0.0-master-containers

# Verify clean state
npm install
npm run dev
```

### Phase 2: Cherry-pick Essential Fixes
```bash
# Grade 10 fixes
git cherry-pick 10185d0 eb2dbb0

# Database/Service improvements (selective)
git cherry-pick --no-commit <commit-hash>
# Manually review and keep only service files

# Question type improvements
# Manually port from current branch
```

### Phase 3: Manual Ports
1. Copy over improved services:
   - GradeContentAdapter.ts
   - Improved PromptBuilder.ts
   - Question validation logic

2. Skip problematic changes:
   - Recent container UNIFIED versions
   - Debug logging
   - Navigation "fixes"

### Phase 4: Testing
1. Test each container individually
2. Verify no re-rendering issues
3. Check Grade 10 functionality
4. Validate question generation

## Recovery Commands

### If Needed to Restore Current State
```bash
# Current work is saved in:
# 1. Stash: stash@{0}
# 2. Backup branch: backup/pre-reversion-YYYYMMDD-HHMMSS
# 3. Main branch at commit 990657d

# To restore:
git checkout main
git stash pop
```

## Next Steps
1. Execute Phase 1 - Create clean branch
2. Test baseline functionality
3. Selectively add essential fixes
4. Incrementally test each addition
5. Document what works before adding more

## Success Criteria
- [ ] No infinite re-renders
- [ ] All containers load properly
- [ ] Grade 10 content works
- [ ] Question generation functional
- [ ] Clean console (minimal logging)
- [ ] Stable performance