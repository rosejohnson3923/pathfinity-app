# Code Cleanup Plan
## Archiving Obsolete Code

### Overview
Before declaring the system production-ready, we need to archive all obsolete code that has been replaced by the new AIRulesEngine architecture.

---

## 📁 Archive Structure

```
/Archive/
├── components/
│   ├── ai-containers/
│   ├── pages/
│   └── other/
├── services/
│   ├── obsolete/
│   ├── replaced/
│   └── demo/
├── data/
└── README.md
```

---

## 🔍 Files to Archive

### Obsolete AI Containers (Replaced by V2 versions)
**Location**: `src/components/ai-containers/`

#### To Archive:
1. **AILearnContainer.tsx** - Replaced by AILearnContainerV2.tsx
2. **MultiSubjectContainer.tsx** - Replaced by MultiSubjectContainerV2.tsx
3. **AIThreeContainerJourney.tsx** - Old journey system
4. **AssessmentContainer.tsx** - Old assessment system
5. **ReviewContainer.tsx** - Old review system
6. **SkillProgressionContainer.tsx** - Replaced by rules engine

#### Keep Active:
- ✅ AILearnContainerV2.tsx
- ✅ MultiSubjectContainerV2.tsx
- ✅ AIExperienceContainer.tsx (still in use)
- ✅ AIDiscoverContainer.tsx (still in use)
- ✅ ContainerNavigationHeader.tsx
- ✅ EnhancedLoadingScreen.tsx
- ✅ VisualRenderer.tsx

### Obsolete Services (Replaced by Rules Engines)
**Location**: `src/services/`

#### To Archive - AI/Learning Services:
1. **pathIQService.ts** - Replaced by LearnAIRulesEngine
2. **pathIQIntegrationService.ts** - Replaced by rules engines
3. **pathIQIntelligenceSystem.ts** - Replaced by MasterRulesEngine
4. **pathIQGamificationService.ts** - Replaced by GamificationRulesEngine
5. **learningService.ts** - Old learning logic
6. **enhanced-skillsService.ts** - Replaced by skill progression in rules
7. **personalizationEngine.ts** - Replaced by companion/career rules
8. **hybridAIService.ts** - Old AI service

#### To Archive - Companion Services:
9. **FinnOrchestrator.ts** - Replaced by CompanionRulesEngine
10. **ConversationManager.ts** - Replaced by chatbotService integration
11. **AgentCoordination.ts** - Old coordination system
12. **MCPToolDiscovery.ts** - Not needed with new architecture
13. **finnIntegrationHooks.ts** - Old hooks system
14. **pattyService.ts** - Old companion service
15. **companionReactionService.ts** - Replaced by CompanionRulesEngine
16. **companionVoiceoverService.ts** - Old voiceover system
17. **voiceManagerService.ts** - Old voice system

#### To Archive - Content Generation:
18. **contentGenerationService.ts** - Replaced by career scenarios
19. **experienceTemplateService.ts** - Old template system
20. **projectService.ts** - Old project system
21. **practiceSupportService.ts** - Replaced by LearnAIRulesEngine
22. **lightweightPracticeSupportService.ts** - Old practice system

#### To Archive - Image Services:
23. **companionImageGenerator.ts** - Old image generator
24. **companionImageService.ts** - Duplicate service
25. **aiCompanionImages.ts** - Static images, replaced by dynamic

#### To Archive - Demo Services:
26. **DemoContentCacheService.ts** - Old demo v1
27. **PremiumDemoContentService.ts** - Old premium v1
28. **DemoContentCacheServiceV2.ts** - Replaced by new cache
29. **PremiumDemoContentServiceV2.ts** - Replaced by new premium

#### To Archive - Analytics (Old):
30. **learningMetricsService.ts** - Old metrics
31. **unifiedLearningAnalyticsService.ts** - Old analytics
32. **studentProgressService.ts** - Replaced by gamification rules
33. **teacherAnalyticsService.ts** - Old teacher analytics

#### Keep Active - Core Services:
- ✅ skillProgressionService.ts (integrated with rules)
- ✅ toastNotificationService.ts (integrated with rules)
- ✅ chatbotService.ts (integrated with rules)
- ✅ authService.ts (authentication)
- ✅ emailService.ts (notifications)
- ✅ dataService.ts (database)
- ✅ azureOpenAIService.ts (AI provider)
- ✅ azureKeyVaultConfig.ts (security)
- ✅ audioService.ts (sound effects)
- ✅ imageGenerationService.ts (visuals)
- ✅ svgVisualGenerationService.ts (SVG visuals)
- ✅ themeService.ts (theming)
- ✅ AILearningJourneyService.ts (journey management)
- ✅ studentProfileService.ts (profiles)
- ✅ careerChoiceService.ts (career selection)
- ✅ careerBadgeService.ts (badges)
- ✅ careerEmojiService.ts (emojis)
- ✅ leaderboardService.ts (rankings)
- ✅ gamificationService.ts (base gamification)
- ✅ questionTypeValidator.ts (validation)
- ✅ assessmentGradingService.ts (grading)
- ✅ contentCacheService.ts (caching)
- ✅ searchService.ts (search)
- ✅ serviceUtils.ts (utilities)
- ✅ ageProvisioningService.ts (age rules)
- ✅ aiCharacterProvider.ts (character data)
- ✅ dailyAssignmentService.ts (assignments)
- ✅ timeBudgetService.ts (time management)
- ✅ skillsService.ts (base skills)

### Obsolete Pages
**Location**: `src/pages/` or `src/components/pages/`

#### To Archive:
1. Old dashboard pages using obsolete containers
2. Old learning pages not using V2 containers
3. Test/demo pages
4. PathIQ specific pages

### Obsolete Data Files
**Location**: `src/data/`

#### To Archive:
1. Old skill progression data (if replaced)
2. Old companion personality data
3. PathIQ configuration files

---

## 🔄 Migration Steps

### Step 1: Create Archive Structure
```bash
mkdir -p Archive/components/ai-containers
mkdir -p Archive/services/obsolete
mkdir -p Archive/services/replaced
mkdir -p Archive/services/demo
mkdir -p Archive/pages
mkdir -p Archive/data
```

### Step 2: Move Obsolete Files
```bash
# Move obsolete containers
mv src/components/ai-containers/AILearnContainer.tsx Archive/components/ai-containers/
mv src/components/ai-containers/MultiSubjectContainer.tsx Archive/components/ai-containers/
# ... continue for all obsolete files
```

### Step 3: Update Imports
- Search for imports of archived files
- Update or remove references
- Fix any broken imports

### Step 4: Clean Package.json
- Remove unused dependencies
- Update scripts if needed

### Step 5: Run Tests
```bash
npm run test:rules
npm run build
```

---

## ⚠️ Critical Checks Before Archiving

### For Each File:
1. **Search for imports**: `grep -r "import.*FileName" src/`
2. **Check for exports**: Ensure no active code depends on it
3. **Review recent commits**: Make sure it's not recently updated
4. **Check routing**: Ensure no routes point to obsolete pages

### Services to Double-Check:
- Any service that might be called by active pages
- Services that might be used in production configs
- Services referenced in environment variables

---

## 📊 Expected Results

### Before Cleanup:
- Total files: ~150+
- Services: 65+
- Components: 50+
- Lines of code: ~50,000+

### After Cleanup:
- Active files: ~80
- Active services: ~30
- Active components: ~25
- Lines of code: ~25,000
- **Reduction**: ~50%

---

## 🚨 Rollback Plan

If anything breaks after archiving:
1. All files are in `/Archive/` - not deleted
2. Can quickly restore: `mv Archive/path/to/file src/path/to/`
3. Git history preserved for recovery
4. Create backup branch before cleanup: `git checkout -b pre-cleanup-backup`

---

## ✅ Validation Checklist

After archiving:
- [ ] All tests pass
- [ ] Build succeeds
- [ ] No console errors
- [ ] All pages load correctly
- [ ] AI containers work
- [ ] Rules engines execute
- [ ] Toast notifications show
- [ ] Chat service works
- [ ] No broken imports
- [ ] No 404 errors

---

## 📝 Archive Documentation

Create `Archive/README.md`:
```markdown
# Archived Code
This directory contains obsolete code replaced by the AIRulesEngine architecture.

## Archive Date: [Date]
## Reason: Implementation of AIRulesEngine v2.0
## Can be deleted after: [Date + 3 months]

### Contents:
- Obsolete PathIQ services
- Old AI containers (pre-V2)
- Legacy companion services
- Old demo content services
```

---

## 🎯 Success Criteria

The cleanup is successful when:
1. All obsolete code is archived
2. No active code references archived files
3. All tests pass
4. Build size reduced by >40%
5. No runtime errors
6. Documentation updated
7. Team notified of changes