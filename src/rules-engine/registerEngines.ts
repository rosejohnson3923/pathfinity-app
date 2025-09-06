/**
 * Engine Registration Module
 * Registers all rules engines with the Master AI Rules Engine
 */

import { MasterAIRulesEngine } from './MasterAIRulesEngine';
import { CompanionRulesEngine } from './companions/CompanionRulesEngine';
import { ThemeRulesEngine } from './theme/ThemeRulesEngine';
import { GamificationRulesEngine } from './gamification/GamificationRulesEngine';
import { LearnAIRulesEngine } from './containers/LearnAIRulesEngine';
import { ExperienceAIRulesEngine } from './containers/ExperienceAIRulesEngine';
import { DiscoverAIRulesEngine } from './containers/DiscoverAIRulesEngine';
import { CareerAIRulesEngine } from './career/CareerAIRulesEngine';
import { CareerProgressionSystem } from './career/CareerProgressionSystem';
import { AISkillsMappingEngine } from './skills/AISkillsMappingEngine';

/**
 * Register all rules engines with the master orchestrator
 */
export async function registerAllEngines(): Promise<void> {
  const master = MasterAIRulesEngine.getInstance();
  
  console.log('🚀 Registering all rules engines...');
  
  // Register cross-cutting engines (high priority)
  await master.registerEngine('ThemeRulesEngine', ThemeRulesEngine.getInstance(), {
    priority: 1,
    enabled: true,
    tags: ['theme', 'ui', 'cross-cutting']
  });
  
  await master.registerEngine('CompanionRulesEngine', CompanionRulesEngine.getInstance(), {
    priority: 2,
    enabled: true,
    tags: ['companion', 'personality', 'cross-cutting']
  });
  
  await master.registerEngine('GamificationRulesEngine', GamificationRulesEngine.getInstance(), {
    priority: 3,
    enabled: true,
    tags: ['gamification', 'rewards', 'progress']
  });
  
  // Register career engines
  await master.registerEngine('CareerAIRulesEngine', CareerAIRulesEngine.getInstance(), {
    priority: 4,
    enabled: true,
    tags: ['career', 'adaptation', 'content']
  });
  
  await master.registerEngine('CareerProgressionSystem', CareerProgressionSystem.getInstance(), {
    priority: 5,
    enabled: true,
    tags: ['career', 'progression', 'levels']
  });
  
  // Register skills mapping engine (NEW)
  await master.registerEngine('AISkillsMappingEngine', AISkillsMappingEngine.getInstance(), {
    priority: 6,
    enabled: true,
    tags: ['skills', 'mapping', 'progression', 'search']
  });
  
  // Register container engines (lower priority)
  await master.registerEngine('LearnAIRulesEngine', LearnAIRulesEngine.getInstance(), {
    priority: 10,
    enabled: true,
    tags: ['learn', 'container', 'validation']
  });
  
  await master.registerEngine('ExperienceAIRulesEngine', ExperienceAIRulesEngine.getInstance(), {
    priority: 11,
    enabled: true,
    tags: ['experience', 'container', 'engagement']
  });
  
  await master.registerEngine('DiscoverAIRulesEngine', DiscoverAIRulesEngine.getInstance(), {
    priority: 12,
    enabled: true,
    tags: ['discover', 'container', 'exploration']
  });
  
  console.log('✅ All rules engines registered successfully');
  
  // Get registration summary
  const summary = await master.getRegisteredEngines();
  console.log(`📊 Total engines registered: ${summary.length}`);
  console.log('📋 Registered engines:', summary.map(e => e.engineId).join(', '));
}

/**
 * Initialize and prepare all engines
 */
export async function initializeEngines(): Promise<void> {
  console.log('🔧 Initializing rules engines...');
  
  // Register all engines
  await registerAllEngines();
  
  // Preload critical data for skills engine
  const skillsEngine = AISkillsMappingEngine.getInstance();
  await skillsEngine.preloadGrades(['Kindergarten', 'Grade 3', 'Grade 7', 'Grade 10']);
  
  console.log('✅ All engines initialized and ready');
}

/**
 * Get engine status
 */
export async function getEngineStatus(): Promise<any> {
  const master = MasterAIRulesEngine.getInstance();
  const engines = await master.getRegisteredEngines();
  
  const status = {
    masterEngine: 'active',
    registeredEngines: engines.length,
    engines: engines.map(e => ({
      id: e.engineId,
      enabled: e.enabled,
      priority: e.priority,
      tags: e.tags
    })),
    skillsEngineMetrics: AISkillsMappingEngine.getInstance().getPerformanceMetrics()
  };
  
  return status;
}

/**
 * Execute master orchestration with context
 */
export async function executeMasterOrchestration(context: any): Promise<any> {
  const master = MasterAIRulesEngine.getInstance();
  
  try {
    const result = await master.orchestrate(context);
    
    // Check if skills mapping was involved
    if (result.results.has('AISkillsMappingEngine')) {
      const skillsResults = result.results.get('AISkillsMappingEngine');
      console.log(`📚 Skills mapping executed: ${skillsResults?.length} results`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Master orchestration failed:', error);
    throw error;
  }
}

// Export for convenience
export { MasterAIRulesEngine, AISkillsMappingEngine };