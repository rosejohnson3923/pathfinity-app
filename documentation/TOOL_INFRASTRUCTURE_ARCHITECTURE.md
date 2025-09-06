# Tool Infrastructure Architecture
## tools.pathfinity.com Hosting Platform

### Overview
This document outlines the architecture for hosting real educational tools at `tools.pathfinity.com`, replacing the current mock tool system with actual interactive educational content.

## Current State Analysis

### What We Have ✅
- **MCP Discovery Service**: HTTP-based tool discovery system
- **Built-in Calculators**: SimpleCalculator (PreK-8) and GeoAlgebraCalculator (9-12)
- **Grade-based Selection**: Automatic tool selection based on student grade
- **Finn Integration**: Full feedback and validation system
- **Agent Architecture**: 6-agent system with FinnTool for dynamic discovery

### What We Need 🎯
- **Real Educational Tools**: Interactive HTML/JavaScript tools for A.0-E.0 categories
- **Hosting Infrastructure**: tools.pathfinity.com subdomain with tool hosting
- **Tool Management**: Deployment, versioning, and quality control
- **MCP Server**: Real tool URLs instead of mock responses

## Skill Categories & Tool Requirements

### A.0 - Basic Math (PreK-2)
**Target Skills**: Number recognition, basic counting, simple addition/subtraction
**Tools Needed**:
- **Number Line Interactive**: Drag-and-drop number sequencing
- **Counting Manipulatives**: Visual counting with objects
- **Basic Addition Game**: Interactive addition with visual aids
- **Shape Recognition**: Geometric shape matching and identification

### B.0 - Elementary Math (3-5)
**Target Skills**: Multi-digit operations, fractions, basic geometry
**Tools Needed**:
- **Fraction Visualizer**: Interactive fraction bars and pie charts
- **Multiplication Table**: Interactive multiplication practice
- **Geometry Builder**: Shape creation and measurement tools
- **Word Problem Solver**: Step-by-step problem breakdown

### C.0 - Middle School Math (6-8)
**Target Skills**: Algebra basics, ratios, proportions, integers
**Tools Needed**:
- **Equation Balancer**: Visual algebra with balance scales
- **Ratio & Proportion**: Interactive ratio exploration
- **Integer Operations**: Number line with positive/negative operations
- **Data Analysis**: Chart and graph creation tools

### D.0 - High School Math (9-12)
**Target Skills**: Advanced algebra, geometry, trigonometry, calculus
**Tools Needed**:
- **Function Grapher**: Interactive function plotting and analysis
- **Trigonometry Unit Circle**: Interactive unit circle exploration
- **3D Geometry**: Three-dimensional shape manipulation
- **Calculus Visualizer**: Derivative and integral visualization

### E.0 - Advanced/AP Math (11-12)
**Target Skills**: AP Calculus, Statistics, Advanced Functions
**Tools Needed**:
- **Statistical Analysis**: Data analysis and hypothesis testing
- **AP Calculus Toolkit**: Comprehensive calculus problem solving
- **Advanced Functions**: Complex function analysis and graphing
- **Mathematical Modeling**: Real-world problem modeling tools

## Tool Infrastructure Architecture

### Domain Structure
```
tools.pathfinity.com/
├── a0/                    # Basic Math (PreK-2)
│   ├── number-line/
│   ├── counting-game/
│   ├── addition-visual/
│   └── shape-match/
├── b0/                    # Elementary Math (3-5)
│   ├── fraction-viz/
│   ├── multiplication/
│   ├── geometry-builder/
│   └── word-problems/
├── c0/                    # Middle School Math (6-8)
│   ├── equation-balance/
│   ├── ratio-explorer/
│   ├── integer-ops/
│   └── data-analysis/
├── d0/                    # High School Math (9-12)
│   ├── function-grapher/
│   ├── trig-circle/
│   ├── 3d-geometry/
│   └── calculus-viz/
└── e0/                    # Advanced/AP Math (11-12)
    ├── statistics/
    ├── ap-calculus/
    ├── advanced-functions/
    └── math-modeling/
```

### Technology Stack

#### Frontend Tools
- **HTML5/CSS3/JavaScript**: Core interactive tools
- **Canvas API**: For mathematical visualizations and graphics
- **WebGL**: For 3D geometry and complex visualizations
- **D3.js**: For data visualization and interactive charts
- **Math.js**: For mathematical computations and parsing

#### Framework Options
- **React**: Component-based tool development
- **Vue.js**: Lightweight interactive interfaces
- **P5.js**: Creative coding for mathematical art and visualization
- **GeoGebra Applet**: Embed GeoGebra for advanced math tools

#### Backend Infrastructure
- **Node.js/Express**: Tool hosting and API services
- **Static Hosting**: CDN for fast tool delivery
- **Database**: Tool metadata and usage analytics
- **Redis**: Caching for tool responses

### Tool Development Standards

#### Interactive Features Required
- **Responsive Design**: Works on tablets and desktops
- **Accessibility**: WCAG 2.1 AA compliance
- **Touch Support**: Mobile-friendly interactions
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA labels and descriptions

#### Educational Standards
- **Age-Appropriate**: Content suitable for target grade levels
- **Curriculum Aligned**: Matches state education standards
- **Progressive Difficulty**: Scaffolded learning experiences
- **Immediate Feedback**: Real-time validation and guidance
- **Data Export**: Results can be captured by parent application

#### Technical Standards
- **Performance**: Load time < 3 seconds
- **Security**: HTTPS, no external dependencies for core functionality
- **Privacy**: No tracking, COPPA/FERPA compliant
- **Offline Support**: Works without internet connection
- **Cross-Browser**: Chrome, Firefox, Safari, Edge compatibility

## Deployment Architecture

### Hosting Platform
```
tools.pathfinity.com Infrastructure:
├── Load Balancer (CloudFlare)
├── Web Server (Nginx)
├── Application Server (Node.js)
├── Static Assets (CDN)
├── Database (PostgreSQL)
├── Cache (Redis)
└── Analytics (Custom)
```

### Tool Deployment Pipeline
1. **Development**: Local development environment
2. **Testing**: Automated testing for educational standards
3. **Staging**: tools-staging.pathfinity.com for review
4. **Production**: tools.pathfinity.com for live usage
5. **Monitoring**: Performance and usage analytics

### MCP Server Integration
```javascript
// Updated MCP Server Response
{
  "success": true,
  "data": {
    "tools": [{
      "id": "number-line-interactive",
      "name": "Number Line Interactive",
      "description": "Interactive number line for basic counting and sequencing",
      "category": "A.0",
      "source": {
        "type": "pathfinity_hosted",
        "url": "https://tools.pathfinity.com/a0/number-line/",
        "version": "1.0.0",
        "lastUpdated": "2024-01-15"
      },
      "capabilities": {
        "interactive": true,
        "assessment": true,
        "adaptive": false,
        "multiLanguage": true
      },
      "metadata": {
        "gradeLevel": "PreK-2",
        "subject": "Math",
        "duration": "10-15 minutes",
        "standards": ["K.CC.A.1", "K.CC.B.4"]
      }
    }]
  }
}
```

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up tools.pathfinity.com subdomain
- [ ] Create basic hosting infrastructure
- [ ] Develop tool development framework
- [ ] Create first A.0 prototype tool

### Phase 2: Core Tools (Week 3-6)
- [ ] Build A.0 basic math tools (4 tools)
- [ ] Build B.0 elementary math tools (4 tools)
- [ ] Create tool testing and validation system
- [ ] Update MCP server with real URLs

### Phase 3: Advanced Tools (Week 7-10)
- [ ] Build C.0 middle school math tools (4 tools)
- [ ] Build D.0 high school math tools (4 tools)
- [ ] Implement analytics and monitoring
- [ ] Create teacher dashboard for tool usage

### Phase 4: Specialized Tools (Week 11-12)
- [ ] Build E.0 advanced/AP math tools (4 tools)
- [ ] Add multi-language support
- [ ] Performance optimization
- [ ] Full documentation and training materials

## Integration with Existing System

### EmbeddedToolRenderer Updates
```typescript
// Enhanced tool detection
const isHostedTool = configuration.source?.type === 'pathfinity_hosted';
const isBuiltInCalculator = configuration.toolName?.includes('calculator');

if (isBuiltInCalculator) {
  // Use built-in SimpleCalculator or GeoAlgebraCalculator
} else if (isHostedTool) {
  // Use iframe to load hosted tool from tools.pathfinity.com
} else {
  // Fallback to external tool or error state
}
```

### FinnTool Agent Updates
```typescript
// Updated tool discovery to prefer hosted tools
const toolPreference = [
  'pathfinity_hosted',    // First preference: our hosted tools
  'pathfinity_builtin',   // Second preference: built-in tools
  'verified_external',    // Third preference: verified external tools
  'external'              // Last resort: external tools
];
```

## Success Metrics

### Educational Effectiveness
- **Engagement Time**: Average time spent per tool
- **Completion Rate**: Percentage of students completing activities
- **Learning Outcomes**: Pre/post assessment improvements
- **Teacher Feedback**: Educator satisfaction and adoption rates

### Technical Performance
- **Load Time**: < 3 seconds for initial tool load
- **Uptime**: 99.9% availability
- **Error Rate**: < 0.1% tool failures
- **Response Time**: < 500ms for tool interactions

### Business Impact
- **Tool Usage**: Daily active tools and student interactions
- **Cost Efficiency**: Hosting costs vs. educational value
- **Scalability**: Support for growing student population
- **Maintenance**: Time required for tool updates and fixes

## Next Steps

1. **Domain Setup**: Configure tools.pathfinity.com subdomain
2. **Infrastructure**: Set up hosting environment and deployment pipeline
3. **Prototype**: Create first A.0 number line interactive tool
4. **Testing**: Validate tool works with existing MCP integration
5. **Scale**: Expand to full tool catalog based on success of prototype

This architecture provides a solid foundation for transitioning from mock tools to real educational content while maintaining the flexibility and scalability of our MCP-based discovery system.