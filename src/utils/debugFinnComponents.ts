// Debug utilities for Finn Orchestration Engine
export const debugFinnComponents = () => {
  console.group('🧠 Finn Orchestration Engine Debug');
  
  // Check if React DevTools is available
  const hasReactDevTools = !!(window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__;
  console.log('React DevTools available:', hasReactDevTools);
  
  // Check React root element
  const rootElement = document.querySelector('#root');
  console.log('React root element:', rootElement ? '✅ Found' : '❌ Not found');
  
  // Check for React Fiber (modern React internal structure)
  const reactFiber = (rootElement as any)?._reactInternalFiber || 
                     (rootElement as any)?._reactInternalInstance ||
                     (rootElement as any)?.__reactInternalInstance;
  console.log('React Fiber:', reactFiber ? '✅ Found' : '❌ Not found');
  
  // Check if context providers are in the DOM
  const checkProvider = (name: string, selector: string) => {
    const elements = document.querySelectorAll(selector);
    console.log(`${name} elements:`, elements.length > 0 ? `✅ ${elements.length} found` : '❌ Not found');
    return elements.length > 0;
  };
  
  // Check for Finn-related elements
  checkProvider('Finn Suggestions', '[class*="finn"], [class*="suggestion"], [class*="orchestration"]');
  checkProvider('Tool Manifestation', '[class*="tool"], [class*="manifest"]');
  checkProvider('AI Components', '[class*="ai"], [class*="intelligent"]');
  checkProvider('Test Components', '[class*="test"], [class*="debug"]');
  
  // Check for error boundaries
  const errorElements = document.querySelectorAll('[class*="error"], [class*="fallback"]');
  console.log('Error boundaries:', errorElements.length > 0 ? `⚠️ ${errorElements.length} found` : '✅ None');
  
  // Check React version
  const React = (window as any).React;
  if (React) {
    console.log('React version:', React.version || 'Unknown');
  }
  
  // Check for context providers in window (development only)
  if (process.env.NODE_ENV === 'development') {
    const contextNames = [
      'FinnOrchestrationContext',
      'ToolManifestationContext',
      'AuthContext',
      'ThemeContext'
    ];
    
    contextNames.forEach(name => {
      const context = (window as any)[name];
      console.log(`${name}:`, context ? '✅ Available' : '❌ Not found');
    });
  }
  
  console.groupEnd();
};

// Enhanced React component tree inspection
export const inspectReactTree = () => {
  console.group('🔍 React Component Tree Inspection');
  
  const root = document.querySelector('#root');
  if (!root) {
    console.error('❌ React root not found');
    console.groupEnd();
    return;
  }
  
  // Modern React Fiber inspection
  const fiberRoot = (root as any)._reactRootContainer?.current || 
                    (root as any)._reactInternalFiber?.child ||
                    (root as any).__reactInternalInstance;
  
  if (!fiberRoot) {
    console.error('❌ React Fiber root not found');
    console.groupEnd();
    return;
  }
  
  // Walk the component tree
  const walkFiber = (fiber: any, depth = 0): any[] => {
    const components: any[] = [];
    if (!fiber) return components;
    
    const indent = '  '.repeat(depth);
    const componentName = fiber.type?.name || fiber.type?.displayName || fiber.type || 'Unknown';
    
    if (typeof componentName === 'string') {
      console.log(`${indent}📦 ${componentName}`);
      components.push({
        name: componentName,
        depth,
        props: fiber.memoizedProps,
        state: fiber.memoizedState
      });
      
      // Check for Finn-related components
      if (componentName.toLowerCase().includes('finn') || 
          componentName.toLowerCase().includes('orchestration') ||
          componentName.toLowerCase().includes('manifestation')) {
        console.log(`${indent}🧠 FINN COMPONENT DETECTED:`, componentName);
      }
    }
    
    // Walk children
    if (fiber.child) {
      components.push(...walkFiber(fiber.child, depth + 1));
    }
    
    // Walk siblings
    if (fiber.sibling) {
      components.push(...walkFiber(fiber.sibling, depth));
    }
    
    return components;
  };
  
  try {
    const components = walkFiber(fiberRoot);
    console.log(`\n📊 Total components found: ${components.length}`);
    
    // Summary of Finn components
    const finnComponents = components.filter(c => 
      c.name.toLowerCase().includes('finn') ||
      c.name.toLowerCase().includes('orchestration') ||
      c.name.toLowerCase().includes('manifestation') ||
      c.name.toLowerCase().includes('intelligent')
    );
    
    if (finnComponents.length > 0) {
      console.log('🧠 Finn AI Components:');
      finnComponents.forEach(comp => {
        console.log(`  ✅ ${comp.name} (depth: ${comp.depth})`);
      });
    } else {
      console.log('❌ No Finn AI components found in tree');
    }
    
  } catch (error) {
    console.error('❌ Error walking React tree:', error);
  }
  
  console.groupEnd();
};

// Context state inspector
export const inspectFinnState = () => {
  console.group('🧠 Finn Orchestration State');
  
  // Try to access contexts from global (development only)
  if (process.env.NODE_ENV === 'development') {
    try {
      // These would be set by the contexts in development mode
      const finnState = (window as any).__FINN_DEBUG_STATE__;
      const toolState = (window as any).__TOOL_DEBUG_STATE__;
      
      if (finnState) {
        console.log('🧠 Finn Orchestration State:', finnState);
      } else {
        console.log('❌ Finn state not available (context may not be initialized)');
      }
      
      if (toolState) {
        console.log('🛠️ Tool Manifestation State:', toolState);
      } else {
        console.log('❌ Tool state not available (context may not be initialized)');
      }
      
    } catch (error) {
      console.error('❌ Error accessing context state:', error);
    }
  } else {
    console.log('ℹ️ State inspection only available in development mode');
  }
  
  console.groupEnd();
};

// Complete debug suite
export const runFinnDebugSuite = () => {
  console.clear();
  console.log('🚀 Finn Orchestration Engine Debug Suite');
  console.log('=====================================\n');
  
  debugFinnComponents();
  console.log('\n');
  inspectReactTree();
  console.log('\n');
  inspectFinnState();
  
  console.log('\n🔧 Debug Suite Complete');
  console.log('To run individual checks, use:');
  console.log('- debugFinnComponents()');
  console.log('- inspectReactTree()');
  console.log('- inspectFinnState()');
};

// Make functions available globally in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).debugFinn = {
    debugFinnComponents,
    inspectReactTree,
    inspectFinnState,
    runFinnDebugSuite
  };
  
  console.log('🔧 Finn debug tools available at window.debugFinn');
  console.log('Run: window.debugFinn.runFinnDebugSuite() to check everything');
}