# Component Replacement Map
## What Replaced What in the Architecture

---

## Container Architecture Overview

### Current Container Hierarchy:

```
AIThreeContainerOrchestrator (ACTIVE - coordinates the journey)
    ↓
AIThreeContainerJourney (ACTIVE - manages 3 container types)
    ↓
MultiSubjectContainerV2 (NEW - cycles through 4 subjects per container)
    ↓
[AILearnContainerV2 | AIExperienceContainer | AIDiscoverContainer]
```

---

## Replacement Map

### 1. Journey Orchestration
- **OLD**: Direct page navigation
- **CURRENT**: `AIThreeContainerOrchestrator.tsx` → `AIThreeContainerJourney.tsx`
- **STATUS**: ✅ ACTIVE (Not replaced, still in use)

### 2. Multi-Subject Handling  
- **OLD**: `MultiSubjectContainer.tsx` (single subject at a time)
- **NEW**: `MultiSubjectContainerV2.tsx` (cycles through all 4 subjects)
- **STATUS**: ✅ REPLACED

### 3. Learn Container
- **OLD**: `AILearnContainer.tsx` (uses old services directly)
- **NEW**: `AILearnContainerV2.tsx` (hybrid: uses old services + rules engines)
- **STATUS**: ⚠️ PARTIAL REPLACEMENT (V2 still uses old services)

### 4. Experience Container
- **OLD**: N/A
- **CURRENT**: `AIExperienceContainer.tsx`
- **STATUS**: ✅ ACTIVE (No V2 yet)

### 5. Discover Container
- **OLD**: N/A
- **CURRENT**: `AIDiscoverContainer.tsx`
- **STATUS**: ✅ ACTIVE (No V2 yet)

---

## Service Layer Architecture

### PathIQ System (Career Pathways)
- `pathIQService.ts` - ✅ ACTIVE
- `pathIQIntegration.ts` - ✅ ACTIVE
- `pathIQIntelligenceSystem.ts` - ✅ ACTIVE
- `pathIQGamificationService.ts` - ✅ ACTIVE
- **STATUS**: Core system, NOT replaced

### Rules Engines (New Adaptations)
- `LearnAIRulesEngine.ts` - ✅ NEW
- `CompanionRulesEngine.ts` - ✅ NEW
- `ThemeRulesEngine.ts` - ✅ NEW
- `GamificationRulesEngine.ts` - ✅ NEW
- `CareerAIRulesEngine.ts` - ✅ NEW
- **STATUS**: Adds new capabilities, works WITH PathIQ

### Legacy Services (Still Used by V2)
- `unifiedLearningAnalyticsService.ts` - ✅ ACTIVE
- `learningMetricsService.ts` - ✅ ACTIVE
- `companionReactionService.ts` - ✅ ACTIVE
- `voiceManagerService.ts` - ✅ ACTIVE
- `companionVoiceoverService.ts` - ✅ ACTIVE
- `lightweightPracticeSupportService.ts` - ✅ ACTIVE
- **STATUS**: Used by V2 containers, NOT replaced

---

## What Was Actually Replaced

### Truly Obsolete (Can Archive):
1. **FinnOrchestrator.ts** → Replaced by `CompanionRulesEngine.ts`
2. **ConversationManager.ts** → Replaced by `chatbotService.ts`
3. **AgentCoordination.ts** → Experimental, never fully integrated
4. **MCPToolDiscovery.ts** → Experimental, not needed

### Duplicate Services (Can Archive):
1. **companionImageGenerator.ts** → Duplicate of imageGenerationService
2. **companionImageService.ts** → Duplicate functionality
3. **aiCompanionImages.ts** → Static images, now dynamic

### Old Demo Services (Can Archive):
1. **DemoContentCacheService.ts** → Old V1
2. **PremiumDemoContentService.ts** → Old V1
3. **DemoContentCacheServiceV2.ts** → Replaced by newer version
4. **PremiumDemoContentServiceV2.ts** → Replaced by newer version

---

## What Needs to Stay Active

### Container Components:
- ✅ AIThreeContainerOrchestrator.tsx
- ✅ AIThreeContainerJourney.tsx
- ✅ MultiSubjectContainerV2.tsx
- ✅ AILearnContainerV2.tsx
- ✅ AIExperienceContainer.tsx
- ✅ AIDiscoverContainer.tsx
- ✅ ContainerNavigationHeader.tsx
- ✅ EnhancedLoadingScreen.tsx
- ✅ VisualRenderer.tsx

### Can Archive:
- 🗑️ MultiSubjectContainer.tsx (old version)
- 🗑️ AILearnContainer.tsx (old version)
- 🗑️ AssessmentContainer.tsx (old system)
- 🗑️ ReviewContainer.tsx (old system)
- 🗑️ SkillProgressionContainer.tsx (old system)

---

## Current Flow (How It Works)

1. **User starts learning journey**
   - AIThreeContainerOrchestrator initializes

2. **Journey through 3 container types**
   - AIThreeContainerJourney manages: Learn → Experience → Discover

3. **Each container type cycles through 4 subjects**
   - MultiSubjectContainerV2 handles: Math → ELA → Science → Social Studies

4. **Each subject uses appropriate container**
   - Learn: AILearnContainerV2
   - Experience: AIExperienceContainer
   - Discover: AIDiscoverContainer

5. **Services provide functionality**
   - PathIQ: Career pathways and progression
   - Rules Engines: Adaptations and validations
   - Legacy Services: Analytics, metrics, voice, etc.

---

## Summary

### The Architecture is HYBRID:
- **PathIQ** (career pathways) + 
- **Rules Engines** (new adaptations) + 
- **Legacy Services** (existing functionality)
- All working together!

### Only 10-15 files are truly obsolete:
- FinnOrchestrator and related (4 files)
- Duplicate image services (3 files)
- Old demo services (4 files)
- Experimental services (3-4 files)

### Most services are STILL ACTIVE because:
- V2 containers use them
- Pages depend on them
- PathIQ needs them
- No full rewrite was done

---

## Recommendation

**DO NOT force a full migration to rules-only architecture if the hybrid approach works!**

The current setup where:
- PathIQ handles careers
- Rules engines handle adaptations
- Legacy services handle existing features
- All work together

...is a valid architecture that maintains backward compatibility while adding new capabilities.