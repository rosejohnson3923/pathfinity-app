# Session Restart TODO - Master Tool Integration

## 🚨 WSL Permission Issues Resolution

### Current Problem
- WSL cannot install npm dependencies due to permission errors with binary files
- Error: `EPERM: operation not permitted, chmod` on various CLI binaries
- Vite development server cannot start

### Solution Options (Pick One)

#### Option 1: Reinstall Kali Linux (Recommended)
- [ ] Back up any personal files outside the project
- [ ] Reinstall Kali Linux from scratch
- [ ] Clone project fresh: `git clone [repository-url]`
- [ ] Install Node.js and npm
- [ ] Run `npm install` (should work cleanly)
- [ ] Run `npm run dev` to start server

#### Option 2: Copy to Linux Native Directory
- [ ] `cp -r /mnt/c/Users/rosej/Documents/Projects/pathfinity-revolutionary ~/pathfinity-revolutionary`
- [ ] `cd ~/pathfinity-revolutionary`
- [ ] `rm -rf node_modules package-lock.json`
- [ ] `npm install`
- [ ] `npm run dev`

#### Option 3: Use Docker Development Environment
- [ ] Create Dockerfile for Node.js development
- [ ] Mount project directory as volume
- [ ] Run npm install and dev server inside container

---

## 📋 Master Tool Integration Status

### ✅ COMPLETED
- [x] **Architecture Clean-up**: Removed unnecessary code from ThreePhaseAssignmentPlayer
- [x] **Dashboard Refactor**: Removed "Try Master Tool" button, made assignment cards non-clickable
- [x] **Learn Container Integration**: Added tool integration to LearnMasterContainer Practice step
- [x] **Documentation**: Created `MASTER_TOOL_INTEGRATION_ARCHITECTURE.md`

### 🔄 IN PROGRESS
- [ ] **Experience Container Integration**: Add tools to ExperienceMasterContainer Apply Skills step
- [ ] **Discover Container Integration**: Add tools to DiscoverMasterContainer Adventure step

### ⏳ PENDING
- [ ] **End-to-End Testing**: Test complete flow through all three containers
- [ ] **Experience Container Testing**: Test tools in career scenarios
- [ ] **Discover Container Testing**: Test tools in story adventures

---

## 🧪 Testing Instructions

### Current Working Features
1. **Login as Taylor Johnson (Grade 10)**
   - Email: `taylor.johnson@cityview.plainviewisd.edu`
   - Password: `password123`

2. **Test Learn Container Tool Integration**
   - Click "Start Adventure" (only entry point)
   - Complete Instruction phase
   - In Practice phase, should see "🔧 Time for Interactive Practice!" 
   - Click "Start Interactive Practice" button
   - Tool should launch (Algebra Tiles, Graphing Calculator, Virtual Lab, or Writing Studio)
   - After tool completion, should proceed to Assessment

### Debug Information
- Console shows: `🔍 Checking if should use tool:` with grade/subject analysis
- Tool integration only for: Math, Science, ELA, Physics subjects
- Only for grades 9-12 (high school)

---

## 📁 Key Files Modified

### Main Integration Files
- `src/components/mastercontainers/LearnMasterContainer.tsx` - **COMPLETED** tool integration
- `src/components/mastercontainers/ExperienceMasterContainer.tsx` - **NEEDS INTEGRATION**
- `src/components/mastercontainers/DiscoverMasterContainer.tsx` - **NEEDS INTEGRATION**

### Dashboard Changes
- `src/components/Dashboard.tsx` - Removed "Try Master Tool" button, made cards non-clickable
- `src/components/Header.tsx` - Fixed back button navigation

### Tool System
- `src/components/tools/MasterToolInterface.tsx` - Unified tool interface
- `src/services/FinnOrchestrator.ts` - Tool selection logic
- `src/hooks/useMasterTool.ts` - Tool management hook

### Documentation
- `MASTER_TOOL_INTEGRATION_ARCHITECTURE.md` - Complete architecture overview
- `SESSION_RESTART_TODO.md` - This file

---

## 🎯 Next Steps After WSL Resolution

1. **Test Learn Container Integration**
   - Verify tool appears in Practice phase for Grade 10 Math
   - Test tool functionality and progression to Assessment

2. **Integrate Experience Container**
   - Add MasterToolInterface to ExperienceMasterContainer
   - Integrate at "Apply Skills" step
   - Test with career scenarios

3. **Integrate Discover Container**
   - Add MasterToolInterface to DiscoverMasterContainer  
   - Integrate at "Adventure" step
   - Test with story scenarios

4. **End-to-End Testing**
   - Complete journey: Learn → Experience → Discover
   - Verify tools work in all three containers
   - Test with different subjects and grade levels

---

## 🔧 Integration Pattern (for Experience/Discover)

Each Master Container follows this pattern:
```typescript
// 1. Add imports
import { MasterToolInterface, AssignmentContext } from '../tools/MasterToolInterface';
import { useMasterTool } from '../../hooks/useMasterTool';

// 2. Add tool state to component
const [showTool, setShowTool] = useState(false);
const masterTool = useMasterTool({ /* config */ });

// 3. Add helper functions
const shouldUseTool = () => {
  const gradeNum = parseInt(gradeLevel);
  const isHighSchool = gradeNum >= 9 && gradeNum <= 12;
  const isAcademicSubject = ['Math', 'Science', 'ELA', 'Physics'].includes(subject);
  return isHighSchool && isAcademicSubject;
};

// 4. Add tool UI to appropriate step
{shouldUseTool() ? (
  <ToolIntegrationUI />
) : (
  <StandardContent />
)}

// 5. Add MasterToolInterface component at end
{showTool && <MasterToolInterface {...props} />}
```

---

## 🎨 Design Philosophy

**Single Entry Point**: Only "Start Adventure" button launches learning
**Contextual Tools**: Tools appear when needed during practice/application
**Grade-Appropriate**: Advanced tools only for high school students
**Finn-Guided**: Tools introduced by Finn as part of natural learning flow

---

## 📞 Contact Context

This session focused on integrating Master Tool Interface into the Three-Container learning journey, replacing the old clickable assignment cards and "Try Master Tool" button with a clean, contextual approach where tools appear naturally during practice phases.