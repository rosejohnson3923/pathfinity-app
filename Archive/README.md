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
