# MCP Diff Validation System

## Overview
The MCP (Model Context Protocol) Diff Validation System is a persistent, cross-conversation tool for analyzing architectural changes across the Pathfinity platform. It ensures compatibility between and across LearnMasterContainer, ExperienceMasterContainer, and DiscoverMasterContainer.

## Purpose
- **Cross-conversation persistence**: Analysis results are saved and can be referenced in future conversations
- **Comprehensive impact analysis**: Evaluates changes across all Grade/Subject/Skill combinations  
- **Risk assessment**: Provides detailed risk analysis with migration and rollback plans
- **Container compatibility**: Ensures changes work across the three-phase learning system

## Directory Structure
```
mcp/
├── README.md                           # This documentation
├── context/                            # Conversation context storage
│   └── {changeId}-request.json         # Analysis request details
├── diff-validator/                     # Core validation system
│   ├── MCPDiffValidator.ts             # Main validation engine
│   ├── MCPDiffService.ts               # Service interface
│   └── results/                        # Analysis results storage
│       └── {changeId}-result.json      # Validation results
```

## Usage

### Running a New Analysis
```typescript
import { mcpDiffService } from './mcp/diff-validator/MCPDiffService';

// Run the skill code format analysis
const result = await mcpDiffService.analyzeSkillCodeFormatChange();
console.log(`Risk Level: ${result.overallRisk}`);
console.log(`Recommendation: ${result.recommendation}`);
```

### Loading Previous Analysis
```typescript
import MCPDiffService from './mcp/diff-validator/MCPDiffService';

// Load a previous analysis
const previousResult = MCPDiffService.loadPreviousAnalysis('skill-code-format-standardization-v1');

// List all previous analyses
const allAnalyses = MCPDiffService.listPreviousAnalyses();
```

### Quick Validation
```typescript
const quickCheck = await mcpDiffService.quickValidation('skill-code-format-standardization-v1');
console.log(`Quick Check: ${quickCheck.recommendation} (Risk: ${quickCheck.riskLevel})`);
```

## Analysis Components

### 1. Component Impact Analysis
Evaluates impact on each system component:
- **LearnMasterContainer**: A.1 format compatibility
- **ExperienceMasterContainer**: Template resolution changes  
- **DiscoverMasterContainer**: Skill data flow compatibility
- **TemplateSystem**: Registry and file structure changes
- **SkillProgressTracking**: Cross-container data consistency
- **CrossContainerDataFlow**: End-to-end flow validation

### 2. Risk Assessment Levels
- **🟢 Low**: Minor changes, no breaking changes
- **🟡 Medium**: Some impact, manageable with proper testing
- **⚠️ High**: Significant changes requiring careful migration
- **🚨 Critical**: Major architectural changes with high risk

### 3. Recommendations
- **PROCEED**: Safe to implement immediately
- **PROCEED WITH CAUTION**: Implement with enhanced testing
- **REQUIRES MODIFICATIONS**: Changes needed before implementation
- **DO NOT PROCEED**: Too risky without major modifications

### 4. Cross-Container Effects
Analyzes data flow between containers:
- Learn → Experience skill progression
- Experience → Discover career application
- Learn → Discover direct skill utilization

## Migration Planning

### Migration Steps
Each analysis provides ordered migration steps with:
- **Order**: Execution sequence
- **Description**: What needs to be done
- **Component**: Which system component
- **Estimated Time**: How long it should take
- **Dependencies**: What must be completed first
- **Validation Criteria**: How to verify success

### Testing Plan
Comprehensive testing requirements:
- **Unit Tests**: Individual component functionality
- **Integration Tests**: Component interaction
- **Cross-Container Tests**: Full system flow
- **Regression Tests**: Ensure existing functionality

### Rollback Plan
Complete rollback procedures:
- **Order**: Reverse execution sequence
- **Description**: How to undo changes
- **Files**: What files need restoration
- **Backup Required**: Whether backups are needed

## File Persistence

### Request Context (`context/{changeId}-request.json`)
```json
{
  "changeId": "skill-code-format-standardization-v1",
  "title": "Standardize Skill Code Format",
  "description": "Change to consistent A.1 format",
  "proposedChanges": [...],
  "affectedComponents": [...],
  "riskThreshold": "high"
}
```

### Analysis Results (`diff-validator/results/{changeId}-result.json`)
```json
{
  "changeId": "skill-code-format-standardization-v1",
  "timestamp": "2025-01-22T...",
  "overallRisk": "high",
  "recommendation": "proceed_with_caution",
  "summary": "Analysis summary...",
  "componentImpacts": [...],
  "crossContainerAnalysis": [...],
  "migrationPlan": [...],
  "testingPlan": [...],
  "rollbackPlan": [...]
}
```

## Key Features

### 1. Conversation Persistence
- Analysis results are saved to disk
- Can be accessed across different conversation sessions
- Maintains full context and recommendations

### 2. Comprehensive Analysis
- Evaluates all affected components
- Identifies cross-container dependencies
- Provides detailed risk assessment

### 3. Actionable Recommendations
- Clear proceed/don't proceed guidance
- Detailed migration steps with time estimates
- Complete testing and rollback plans

### 4. Educational Platform Specific
- Understands Grade/Subject/Skill relationships
- Analyzes educational content flow
- Considers pedagogical implications

## Example: Skill Code Format Analysis

The current analysis addresses the inconsistency between:
- **LearnMasterContainer**: Uses A.1 format ✅
- **ExperienceMasterContainer**: Uses A.1 → K.RL.1 conversion ❌
- **DiscoverMasterContainer**: Unknown format expectations ❓

**Goal**: Standardize all containers to use A.1 format while preserving Common Core standards as metadata.

## Best Practices

1. **Always run analysis before major changes**
2. **Review cross-container effects carefully**  
3. **Follow migration steps in order**
4. **Complete testing plan before production deployment**
5. **Keep rollback plan readily available**
6. **Document any deviations from recommended approach**

## Integration with Development Workflow

1. **Planning Phase**: Run MCP Diff analysis
2. **Review Phase**: Evaluate recommendations and risks
3. **Implementation Phase**: Follow migration plan
4. **Testing Phase**: Execute testing plan  
5. **Deployment Phase**: Monitor for issues
6. **Rollback Phase**: Use rollback plan if needed

This system ensures that architectural changes are thoroughly analyzed and safely implemented across the complex multi-container learning platform.