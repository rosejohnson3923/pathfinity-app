#!/bin/bash

# Archive Obsolete Files Script
# This script moves obsolete files to the Archive directory

echo "Starting code cleanup and archiving process..."

# Create Archive structure if not exists
mkdir -p Archive/components/ai-containers
mkdir -p Archive/services/obsolete
mkdir -p Archive/services/replaced  
mkdir -p Archive/services/demo
mkdir -p Archive/pages
mkdir -p Archive/data

# Counter for moved files
moved_count=0
error_count=0

# Function to safely move files
move_file() {
    source=$1
    destination=$2
    
    if [ -f "$source" ]; then
        mv "$source" "$destination"
        echo "✓ Archived: $source"
        ((moved_count++))
    else
        echo "⚠ Not found: $source"
        ((error_count++))
    fi
}

echo ""
echo "=== Archiving Obsolete AI Containers ==="

# Obsolete containers (replaced by V2 versions)
move_file "src/components/ai-containers/AILearnContainer.tsx" "Archive/components/ai-containers/"
move_file "src/components/ai-containers/MultiSubjectContainer.tsx" "Archive/components/ai-containers/"
move_file "src/components/ai-containers/AIThreeContainerJourney.tsx" "Archive/components/ai-containers/"
move_file "src/components/ai-containers/AssessmentContainer.tsx" "Archive/components/ai-containers/"
move_file "src/components/ai-containers/ReviewContainer.tsx" "Archive/components/ai-containers/"
move_file "src/components/ai-containers/SkillProgressionContainer.tsx" "Archive/components/ai-containers/"

echo ""
echo "=== Archiving Obsolete PathIQ Services ==="

# PathIQ services (replaced by rules engines)
move_file "src/services/pathIQService.ts" "Archive/services/replaced/"
move_file "src/services/pathIQIntegration.ts" "Archive/services/replaced/"
move_file "src/services/pathIQIntelligenceSystem.ts" "Archive/services/replaced/"
move_file "src/services/pathIQGamificationService.ts" "Archive/services/replaced/"

echo ""
echo "=== Archiving Obsolete Learning Services ==="

# Learning services (replaced by LearnAIRulesEngine)
move_file "src/services/learningService.ts" "Archive/services/replaced/"
move_file "src/services/enhanced-skillsService.ts" "Archive/services/replaced/"
move_file "src/services/personalizationEngine.ts" "Archive/services/replaced/"
move_file "src/services/hybridAIService.ts" "Archive/services/replaced/"

echo ""
echo "=== Archiving Obsolete Companion Services ==="

# Companion services (replaced by CompanionRulesEngine)
move_file "src/services/FinnOrchestrator.ts" "Archive/services/replaced/"
move_file "src/services/ConversationManager.ts" "Archive/services/replaced/"
move_file "src/services/AgentCoordination.ts" "Archive/services/replaced/"
move_file "src/services/MCPToolDiscovery.ts" "Archive/services/obsolete/"
move_file "src/services/finnIntegrationHooks.ts" "Archive/services/obsolete/"
move_file "src/services/pattyService.ts" "Archive/services/obsolete/"
move_file "src/services/companionReactionService.ts" "Archive/services/replaced/"
move_file "src/services/companionVoiceoverService.ts" "Archive/services/obsolete/"
move_file "src/services/voiceManagerService.ts" "Archive/services/obsolete/"

echo ""
echo "=== Archiving Obsolete Content Services ==="

# Content generation services
move_file "src/services/contentGenerationService.ts" "Archive/services/replaced/"
move_file "src/services/experienceTemplateService.ts" "Archive/services/obsolete/"
move_file "src/services/projectService.ts" "Archive/services/obsolete/"
move_file "src/services/practiceSupportService.ts" "Archive/services/replaced/"
move_file "src/services/lightweightPracticeSupportService.ts" "Archive/services/obsolete/"

echo ""
echo "=== Archiving Obsolete Image Services ==="

# Image services
move_file "src/services/companionImageGenerator.ts" "Archive/services/obsolete/"
move_file "src/services/companionImageService.ts" "Archive/services/obsolete/"
move_file "src/services/aiCompanionImages.ts" "Archive/services/obsolete/"

echo ""
echo "=== Archiving Demo Services ==="

# Demo services (old versions)
move_file "src/services/DemoContentCacheService.ts" "Archive/services/demo/"
move_file "src/services/PremiumDemoContentService.ts" "Archive/services/demo/"
move_file "src/services/DemoContentCacheServiceV2.ts" "Archive/services/demo/"
move_file "src/services/PremiumDemoContentServiceV2.ts" "Archive/services/demo/"

echo ""
echo "=== Archiving Obsolete Analytics Services ==="

# Analytics services (old)
move_file "src/services/learningMetricsService.ts" "Archive/services/obsolete/"
move_file "src/services/unifiedLearningAnalyticsService.ts" "Archive/services/obsolete/"
move_file "src/services/studentProgressService.ts" "Archive/services/replaced/"
move_file "src/services/teacherAnalyticsService.ts" "Archive/services/obsolete/"

echo ""
echo "=== Creating Archive Documentation ==="

# Create README for Archive
cat > Archive/README.md << 'EOF'
# Archived Code

This directory contains obsolete code that has been replaced by the AIRulesEngine architecture v2.0.

## Archive Information
- **Archive Date**: $(date +"%Y-%m-%d")
- **Reason**: Implementation of AIRulesEngine v2.0 - Complete architectural refactor
- **Can be deleted after**: $(date -d "+3 months" +"%Y-%m-%d") (3 months retention)

## Why These Files Were Archived

### Replaced by Rules Engines:
- **PathIQ Services** → Replaced by modular rules engines
- **Learning Services** → Replaced by LearnAIRulesEngine
- **Companion Services** → Replaced by CompanionRulesEngine
- **Gamification Services** → Replaced by GamificationRulesEngine
- **Content Services** → Replaced by CareerAIRulesEngine scenarios

### Replaced by V2 Components:
- **AILearnContainer** → AILearnContainerV2
- **MultiSubjectContainer** → MultiSubjectContainerV2
- **Assessment/Review Containers** → Integrated into V2 containers

## Directory Structure

```
Archive/
├── components/
│   └── ai-containers/      # Old container components
├── services/
│   ├── obsolete/           # Completely obsolete services
│   ├── replaced/           # Services replaced by rules engines
│   └── demo/               # Old demo services
├── pages/                  # Obsolete pages
└── data/                   # Old data files
```

## Recovery Instructions

If any of these files need to be restored:

1. Identify the file needed
2. Move it back: `mv Archive/path/to/file src/path/to/file`
3. Update imports as necessary
4. Run tests to ensure compatibility

## Files Archived

### Components (6 files)
- AILearnContainer.tsx
- MultiSubjectContainer.tsx
- AIThreeContainerJourney.tsx
- AssessmentContainer.tsx
- ReviewContainer.tsx
- SkillProgressionContainer.tsx

### Services (33 files)
- PathIQ services (4 files)
- Learning services (4 files)
- Companion services (9 files)
- Content services (5 files)
- Image services (3 files)
- Demo services (4 files)
- Analytics services (4 files)

## Notes
- All files are preserved, not deleted
- Git history remains intact
- Can be recovered if needed
- Review before permanent deletion
EOF

echo ""
echo "=== Archive Summary ==="
echo "Files successfully archived: $moved_count"
echo "Files not found: $error_count"
echo ""
echo "Archive documentation created at: Archive/README.md"
echo ""
echo "Next steps:"
echo "1. Review Archive/README.md"
echo "2. Check for broken imports: grep -r 'import.*pathIQ' src/"
echo "3. Run tests: npm run test:rules"
echo "4. Build project: npm run build"