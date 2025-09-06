# Revised Code Cleanup Plan
## Preserving PathIQ While Archiving Obsolete Code

### ⚠️ IMPORTANT: PathIQ is CORE functionality
PathIQ is the career pathways system and must be preserved. It works alongside the AIRulesEngine architecture.

---

## ✅ What to KEEP (Active Core Systems)

### PathIQ System (Career Pathways) - KEEP ALL
- ✅ `pathIQService.ts` - Core career pathway service
- ✅ `pathIQIntegration.ts` - Integration layer
- ✅ `pathIQIntelligenceSystem.ts` - Intelligence system
- ✅ `pathIQGamificationService.ts` - Gamification for PathIQ
- ✅ All components using PathIQ services
- ✅ All hooks for PathIQ (`usePathIQGamification.ts`)

### AIRulesEngine System - KEEP ALL
- ✅ All files in `/src/rules-engine/`
- ✅ `LearnAIRulesEngine.ts`
- ✅ `CompanionRulesEngine.ts`
- ✅ `ThemeRulesEngine.ts`
- ✅ `GamificationRulesEngine.ts`
- ✅ `CareerAIRulesEngine.ts`
- ✅ `MasterRulesEngine.ts`

### Active V2 Components - KEEP
- ✅ `AILearnContainerV2.tsx`
- ✅ `MultiSubjectContainerV2.tsx`
- ✅ `AIExperienceContainer.tsx` (still in use)
- ✅ `AIDiscoverContainer.tsx` (still in use)

### Core Services - KEEP
- ✅ `toastNotificationService.ts`
- ✅ `chatbotService.ts`
- ✅ `skillProgressionService.ts`
- ✅ `authService.ts`
- ✅ `studentProfileService.ts`
- ✅ `careerChoiceService.ts`
- ✅ `gamificationService.ts` (base gamification)
- ✅ `leaderboardService.ts`

---

## 🗑️ What to ARCHIVE (True Duplicates/Obsolete)

### Duplicate Container Versions (Archive these)
1. **AILearnContainer.tsx** - Old version (V2 is active)
2. **MultiSubjectContainer.tsx** - Old version (V2 is active)
3. **AIThreeContainerJourney.tsx** - Old journey system
4. **AssessmentContainer.tsx** - Old assessment
5. **ReviewContainer.tsx** - Old review
6. **SkillProgressionContainer.tsx** - Old skill progression

### Obsolete Services (NOT PathIQ)
These are services that were experimental or replaced:

1. **FinnOrchestrator.ts** - Replaced by CompanionRulesEngine
2. **ConversationManager.ts** - Replaced by chatbotService
3. **AgentCoordination.ts** - Old coordination
4. **MCPToolDiscovery.ts** - Not needed
5. **pattyService.ts** - Old companion service
6. **companionReactionService.ts** - Replaced by CompanionRulesEngine
7. **companionVoiceoverService.ts** - Old voiceover
8. **voiceManagerService.ts** - Old voice system

### Old Demo Services (Archive)
1. **DemoContentCacheService.ts** - V1 demo
2. **PremiumDemoContentService.ts** - V1 premium
3. **DemoContentCacheServiceV2.ts** - Old V2
4. **PremiumDemoContentServiceV2.ts** - Old V2

### Duplicate Image Services (Archive)
1. **companionImageGenerator.ts** - Old generator
2. **companionImageService.ts** - Duplicate
3. **aiCompanionImages.ts** - Static images

### Services That Might Be Obsolete (VERIFY FIRST)
Before archiving these, check if they're used:
- `hybridAIService.ts` - Check if used
- `enhanced-skillsService.ts` - Check if used
- `contentGenerationService.ts` - Check if used
- `experienceTemplateService.ts` - Check if used
- `practiceSupportService.ts` - Check if used
- `lightweightPracticeSupportService.ts` - Check if used

---

## 🔄 Correct Integration Pattern

### PathIQ + AIRulesEngine Work Together:

```typescript
// PathIQ handles career pathways and progression
import { pathIQService } from './services/pathIQService';
import { pathIQGamificationService } from './services/pathIQGamificationService';

// AIRulesEngine handles learning rules and adaptations
import { learnAIRulesEngine } from './rules-engine/containers/LearnAIRulesEngine';
import { careerAIRulesEngine } from './rules-engine/career/CareerAIRulesEngine';

// They work together:
const careerPath = await pathIQService.getCareerPath(studentId);
const careerContent = await careerAIRulesEngine.getCareerScenario(
  careerPath.careerId,
  subject,
  grade
);
```

---

## 📋 Safe Cleanup Checklist

### Before Archiving ANY File:
1. ✅ Verify it's not imported by active components
2. ✅ Check it's not part of PathIQ system
3. ✅ Ensure it's truly a duplicate/obsolete
4. ✅ Confirm V2 version exists if applicable
5. ✅ Check routing doesn't reference it

### Files That Are SAFE to Archive:
- Old V1 containers (where V2 exists)
- Demo services (old versions)
- Duplicate image services
- Old companion services (NOT PathIQ)
- Experimental services that were never integrated

---

## 🚨 DO NOT ARCHIVE:
- ❌ Any PathIQ service
- ❌ Any component using PathIQ
- ❌ Active V2 components
- ❌ Rules engine files
- ❌ Core authentication/profile services
- ❌ Active gamification services
- ❌ Services without clear replacements

---

## 📊 Expected Results After Correct Cleanup

### What Should Remain:
- All PathIQ services (4 files)
- All rules engines (15+ files)
- All V2 components
- All core services
- All active pages

### What Should Be Archived:
- Old V1 containers (6 files)
- Duplicate services (~10 files)
- Old demo services (4 files)
- Experimental services (~5 files)
- **Total: ~25 files** (not 50+)

---

## ✅ Integration Validation

After cleanup, these should all work:
1. PathIQ career selection
2. PathIQ gamification
3. AIRulesEngine adaptations
4. V2 containers
5. Toast notifications
6. Chat service
7. All active pages

---

## 🔧 Restoration Commands

If PathIQ was accidentally archived:
```bash
# Restore all PathIQ services
mv Archive/services/replaced/pathIQ*.ts src/services/

# Restore PathIQ hooks
mv Archive/hooks/usePathIQ*.ts src/hooks/

# Restore PathIQ components
find Archive -name "*PathIQ*" -o -name "*pathIQ*" | while read f; do
  # Restore each file to original location
  echo "Restoring $f"
done
```