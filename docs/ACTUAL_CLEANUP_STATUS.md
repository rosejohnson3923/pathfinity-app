# Actual Cleanup Status

## Current Situation

The `AILearnContainerV2.tsx` is NOT a full V2 rewrite - it still depends on many old services. We have two options:

---

## Option 1: Keep Current Architecture (RECOMMENDED)
Keep both old services AND new rules engines working together:

### What This Means:
- PathIQ remains core (career pathways)
- Old services remain for compatibility  
- Rules engines add new capabilities on top
- Both systems work in parallel

### Services to RESTORE and KEEP:
```bash
# These are used by AILearnContainerV2 and other active components
- unifiedLearningAnalyticsService.ts
- learningMetricsService.ts
- companionReactionService.ts
- voiceManagerService.ts
- companionVoiceoverService.ts
- lightweightPracticeSupportService.ts
- personalizationEngine.ts (if components use it)
- learningService.ts (if pages use it)
```

### What Can Still Be Archived:
```bash
# True duplicates and unused experimental code
- FinnOrchestrator.ts (replaced by companion rules)
- ConversationManager.ts (replaced by chatbot service)
- AgentCoordination.ts (experimental)
- MCPToolDiscovery.ts (not used)
- Old demo services (V1 versions)
- Duplicate image services
```

---

## Option 2: Full V2 Migration (MAJOR EFFORT)
Rewrite AILearnContainerV2 to use ONLY rules engines:

### Required Changes:
1. Remove all old service imports
2. Replace with rules engine calls
3. Update all logic
4. Test extensively
5. Update all pages using the container

### Risk:
- Major refactoring effort
- Could break existing functionality
- Time consuming
- Not necessary if old services work

---

## Reality Check

### What AILearnContainerV2 Actually Uses:
```typescript
// Current imports in V2:
import { unifiedLearningAnalyticsService } from '../../services/unifiedLearningAnalyticsService';
import { learningMetricsService } from '../../services/learningMetricsService';
import { companionReactionService } from '../../services/companionReactionService';
import { voiceManagerService } from '../../services/voiceManagerService';
import { companionVoiceoverService } from '../../services/companionVoiceoverService';
import { lightweightPracticeSupportService } from '../../services/lightweightPracticeSupportService';
import { questionTypeValidator } from '../../services/questionTypeValidator';
import { usePathIQGamification } from '../../hooks/usePathIQGamification';

// PLUS the rules engines:
import { useLearnRules, useCompanionRules, useGamificationRules } from '../../rules-engine/integration/ContainerIntegration';
```

### This is a HYBRID approach - using both old and new!

---

## Recommended Action Plan

### 1. Restore Required Services ✅
```bash
# Already done - restored services V2 needs
```

### 2. Keep PathIQ Intact ✅
```bash
# PathIQ is core - already restored
```

### 3. Archive Only True Obsolete Files
```bash
# Safe to archive:
- FinnOrchestrator.ts
- ConversationManager.ts  
- AgentCoordination.ts
- MCPToolDiscovery.ts
- Old demo services (4 files)
- Duplicate image services (3 files)
- Old containers WITHOUT V2 versions
```

### 4. Document the Hybrid Architecture
Create clear documentation showing:
- PathIQ handles career pathways
- Old services handle legacy features
- Rules engines handle new adaptations
- All work together

---

## Files Status Summary

### ✅ ACTIVE (Keep):
- All PathIQ services (4)
- All rules engines (15+)
- Services used by V2 containers (10+)
- All V2 containers
- All active pages
- questionTypeValidator.ts
- contentCacheService.ts
- Other core services

### 🗑️ ARCHIVED (Safe to remove):
- FinnOrchestrator.ts
- ConversationManager.ts
- AgentCoordination.ts
- MCPToolDiscovery.ts
- Old demo services (4)
- Duplicate image services (3)
- Total: ~15 files

### ⚠️ UNCLEAR (Need verification):
- enhanced-skillsService.ts
- practiceSupportService.ts
- contentGenerationService.ts
- experienceTemplateService.ts
- projectService.ts

---

## Testing Requirements

Before declaring production-ready:
1. Verify all imports resolve
2. Test AILearnContainerV2 functionality
3. Test PathIQ career selection
4. Test rules engine adaptations
5. Build project successfully
6. No console errors

---

## Conclusion

The codebase is using a HYBRID architecture:
- Old services + PathIQ + Rules Engines all working together
- This is OK! Don't force a full migration if not needed
- Only archive truly unused/duplicate code
- Keep everything that's actively imported