# Pathfinity Documentation

This directory contains comprehensive documentation for the Pathfinity learning platform.

## Documentation Files

### [Journey Flow](./JOURNEY_FLOW.md)
Complete documentation of the student learning journey from login to completion, including:
- Phase-by-phase flow breakdown
- Master Container structure (Learn → CareerTown → Experience → Discover)
- Finn transition messages and timing
- Error handling and fallback strategies
- Performance expectations and journey duration

### [Cache Flow](./CACHE_FLOW.md)  
Technical documentation of the two-phase caching system, including:
- Phase 1: Learn content caching during "Start Journey"
- Phase 2: Experience/Discover caching after career selection
- Cache architecture and data structures
- Performance optimization and memory usage
- Debug information and monitoring

## Quick Reference

### Key Components
- **ThreeContainerOrchestrator**: Main journey orchestration and caching coordination
- **JourneyCacheManager**: Two-phase content caching system
- **ContainerContentGenerator**: AI-powered content generation for all phases
- **CareerTown**: Career selection and badge generation between Learn and Experience
- **Master Containers**: Learn, Experience, and Discover containers with Subject → Assignment → Step structure

### Journey Phases
1. **Learn Phase**: Traditional instruction → practice → assessment (Purple theme)
2. **CareerTown Phase**: Career selection and badge generation (Green theme)  
3. **Experience Phase**: Real-world career application (Orange theme)
4. **Discover Phase**: Story-based adventures (Pink theme)

### Caching Strategy
- **Phase 1**: Cache Learn content during initial "Start Journey" click
- **Phase 2**: Cache Experience/Discover content after career selection
- **Fallbacks**: Graceful degradation to old containers if caching fails
- **Performance**: 3-8 seconds for Phase 1, 5-12 seconds for Phase 2

## Testing Guidelines

### Key Test Scenarios
1. **Complete Journey Flow**: Login → Learn → CareerTown → Experience → Discover → Dashboard
2. **Cache Performance**: Verify timing and progress indicators during caching phases
3. **Career Selection**: Test all career options and badge generation (including fallbacks)
4. **Error Handling**: Test with network issues, API failures, and partial cache failures
5. **Grade Level Variations**: Test with different grade levels (K, 3rd, 7th, 10th)

### Debug Console Commands
```javascript
// Check journey cache status
console.log('Journey Cache:', journeyCacheManager.getCacheStats());

// Verify Master Container data
console.log('Learn Container:', !!journeyCache?.learnMasterContainer);
console.log('Experience Container:', !!journeyCache?.experienceMasterContainer);
console.log('Discover Container:', !!journeyCache?.discoverMasterContainer);

// Monitor cache generation
// Look for console logs: 🎯 📦 ✅ 🎭 📚 💼 📖
```

### Expected Performance
- **Learn Caching**: 3-8 seconds with progress indicator
- **Experience/Discover Caching**: 5-12 seconds with career-specific messaging
- **Badge Generation**: 2-5 seconds (DALL-E) or instant (emoji fallback)
- **Total Journey**: 60-150 minutes depending on grade level

## Architecture Notes

### Master Container Structure
```
Master Container
└── Subject Cards (Math, Science, ELA)
    └── Assignment Cards (1-3 per subject)
        └── 3 Steps per Assignment
            ├── Instruction Step
            ├── Practice Step
            └── Assessment Step
```

### Content Generation
- **Learn**: Academic instruction with concepts, examples, and key points
- **Experience**: Career-specific scenarios with role descriptions and challenges
- **Discover**: Story-based adventures with characters, plot, and skill connections

### State Management
- **Journey Phase**: 'learn' | 'careertown' | 'experience' | 'discover' | 'complete'
- **Cache Status**: Partial (Learn only) → Full (Learn + Experience + Discover)
- **Loading States**: Pre-generation, Career caching, Finn transitions