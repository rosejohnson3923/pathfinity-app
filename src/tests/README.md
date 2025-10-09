# Rubric System Integration Tests

Comprehensive test suite for the rubric-based architecture (Phases 1-6).

## Overview

Tests all components of the rubric system:
- **Phase 1**: Foundation (MasterNarrativeGenerator, DataRubricTemplateService, Validation)
- **Phase 2**: Azure Storage (RubricStorageService, caching)
- **Phase 3**: JIT Content Generation (RubricBasedJITService)
- **Phase 4**: Cross-Device Sessions (SessionStateService)
- **Phase 5**: Adaptive Content (AdaptiveContentService)
- **End-to-End**: Full integration from narrative to adaptive content

## Running Tests

### Run All Tests

```bash
npm run test:rubrics
```

**Total: 18 tests across 6 test suites**

## Expected Output

All tests should pass with green checkmarks. Total duration: ~60-90 seconds.

See full documentation in rubricSystemTests.ts for details.
