# Archive - September 28, 2025 Cleanup

## Reason for Archival
These files were identified as obsolete during the modal architecture refactoring and cleanup process. They have been replaced by newer V2/UNIFIED implementations or are no longer part of the active codebase.

## Archived Items

### 1. Obsolete Container Components (`containers/`)
- **ThreeContainerOrchestrator.tsx** - Replaced by MultiSubjectContainerV2
- **AIThreeContainerOrchestrator.tsx** - Replaced by V2 containers
- **LearnContainer.tsx** - Replaced by AILearnContainerV2-UNIFIED
- **LearnPlayer.tsx** - Replaced by V2 implementations
- **NarrativeLearnContainer.tsx** - Replaced by newer narrative components
- **DiscoverContainer.tsx** - Replaced by AIDiscoverContainerV2
- **InstructionalVideoComponent.tsx** - Legacy video component
- **InstructionalVideoComponent-old.tsx** - Backup of old video component
- **FallbackVideoContent.tsx** - Legacy fallback content

### 2. Test Files (from src root)
- **test-azure-config.tsx** - Test file for Azure configuration
- **test-bento-enhanced.tsx** - Test file for Bento components
- **test-full-system.tsx** - Full system test
- **test-learn-container.tsx** - Learn container tests
- **test-learn-micro.tsx** - Micro learning tests
- **test-narrative.tsx** - Narrative component tests
- **test-youtube.tsx** - YouTube integration tests

### 3. Obsolete Utilities
- **ContainerContentGenerators.ts** - Old content generation utility
- **ThreePhaseContentGenerator.ts** - Three-phase content generator

### 4. Test Data
- **generated-testbed-samples/** - Directory containing GPT test samples
  - gpt35-samples.json
  - gpt4-samples.json
  - gpt4o-samples.json
  - intelligent-testbed-samples.json

## Migration Notes
- All container functionality has been migrated to `src/components/ai-containers/` with V2-UNIFIED versions
- Test files should be in proper test directories, not in src root
- Content generation is now handled by newer services in the ai-containers

## Files Restored (Still in use)
**September 28, 2025**: The following files were restored as they're still being used:
- `InstructionalVideoComponent.tsx` - Used by AILearnContainerV2-UNIFIED
- `InstructionalVideoComponent.module.css` - Styles for video component

## Deletion Schedule
**Planned deletion date: October 5, 2025** (1 week from archival)

If no issues are encountered and these files are not needed, they can be permanently deleted after this date.