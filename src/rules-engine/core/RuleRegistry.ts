/**
 * Rule Registry
 * Centralized registry for managing rules across all engines
 */

import { Rule, RuleContext, IRuleRegistry, RuleRegistration } from './types';

/**
 * Singleton registry for all rules in the system
 */
export class RuleRegistry implements IRuleRegistry {
  private static instance: RuleRegistry;
  private registry: Map<string, Map<string, RuleRegistration>> = new Map();
  private ruleIndex: Map<string, Set<string>> = new Map(); // ruleId -> engineIds
  
  private constructor() {
    console.log('📚 RuleRegistry initialized');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RuleRegistry {
    if (!RuleRegistry.instance) {
      RuleRegistry.instance = new RuleRegistry();
    }
    return RuleRegistry.instance;
  }

  /**
   * Register a rule with an engine
   */
  public register(rule: Rule, engineId: string, registeredBy?: string): void {
    // Ensure engine map exists
    if (!this.registry.has(engineId)) {
      this.registry.set(engineId, new Map());
    }

    const engineRules = this.registry.get(engineId)!;
    
    // Check for duplicate rule ID within engine
    if (engineRules.has(rule.id)) {
      console.warn(`⚠️ Rule ${rule.id} already registered in engine ${engineId}, overwriting...`);
    }

    // Create registration entry
    const registration: RuleRegistration = {
      rule,
      engineId,
      registeredAt: new Date(),
      registeredBy,
      metadata: {
        version: rule.version || '1.0.0',
        priority: rule.priority || 100,
        tags: rule.tags || []
      }
    };

    // Store in registry
    engineRules.set(rule.id, registration);

    // Update index
    if (!this.ruleIndex.has(rule.id)) {
      this.ruleIndex.set(rule.id, new Set());
    }
    this.ruleIndex.get(rule.id)!.add(engineId);

    console.log(`✅ Rule registered: ${rule.id} in ${engineId}`);
  }

  /**
   * Unregister a rule from an engine
   */
  public unregister(ruleId: string, engineId: string): boolean {
    const engineRules = this.registry.get(engineId);
    if (!engineRules) {
      return false;
    }

    const deleted = engineRules.delete(ruleId);
    
    if (deleted) {
      // Update index
      const engines = this.ruleIndex.get(ruleId);
      if (engines) {
        engines.delete(engineId);
        if (engines.size === 0) {
          this.ruleIndex.delete(ruleId);
        }
      }
      
      console.log(`🗑️ Rule unregistered: ${ruleId} from ${engineId}`);
    }

    return deleted;
  }

  /**
   * Get a specific rule from an engine
   */
  public get(ruleId: string, engineId: string): Rule | undefined {
    const engineRules = this.registry.get(engineId);
    if (!engineRules) {
      return undefined;
    }

    const registration = engineRules.get(ruleId);
    return registration?.rule;
  }

  /**
   * Get all rules for an engine
   */
  public getAll(engineId: string): Rule[] {
    const engineRules = this.registry.get(engineId);
    if (!engineRules) {
      return [];
    }

    return Array.from(engineRules.values()).map(reg => reg.rule);
  }

  /**
   * Check if a rule exists in an engine
   */
  public exists(ruleId: string, engineId: string): boolean {
    const engineRules = this.registry.get(engineId);
    return engineRules?.has(ruleId) || false;
  }

  /**
   * Clear all rules for an engine
   */
  public clear(engineId: string): void {
    const engineRules = this.registry.get(engineId);
    if (engineRules) {
      // Update index for each rule
      engineRules.forEach((_, ruleId) => {
        const engines = this.ruleIndex.get(ruleId);
        if (engines) {
          engines.delete(engineId);
          if (engines.size === 0) {
            this.ruleIndex.delete(ruleId);
          }
        }
      });
      
      engineRules.clear();
      console.log(`🧹 Cleared all rules for engine: ${engineId}`);
    }
  }

  /**
   * Get registration details for a rule
   */
  public getRegistration(ruleId: string, engineId: string): RuleRegistration | undefined {
    const engineRules = this.registry.get(engineId);
    return engineRules?.get(ruleId);
  }

  /**
   * Find all engines that have a specific rule
   */
  public findEnginesByRule(ruleId: string): string[] {
    const engines = this.ruleIndex.get(ruleId);
    return engines ? Array.from(engines) : [];
  }

  /**
   * Get all registered engines
   */
  public getEngines(): string[] {
    return Array.from(this.registry.keys());
  }

  /**
   * Get statistics about the registry
   */
  public getStatistics(): {
    totalEngines: number;
    totalRules: number;
    rulesPerEngine: Map<string, number>;
    duplicateRules: Map<string, string[]>;
  } {
    const stats = {
      totalEngines: this.registry.size,
      totalRules: 0,
      rulesPerEngine: new Map<string, number>(),
      duplicateRules: new Map<string, string[]>()
    };

    // Calculate rules per engine
    this.registry.forEach((rules, engineId) => {
      stats.rulesPerEngine.set(engineId, rules.size);
      stats.totalRules += rules.size;
    });

    // Find duplicate rules across engines
    this.ruleIndex.forEach((engines, ruleId) => {
      if (engines.size > 1) {
        stats.duplicateRules.set(ruleId, Array.from(engines));
      }
    });

    return stats;
  }

  /**
   * Search for rules by criteria
   */
  public search(criteria: {
    engineId?: string;
    tags?: string[];
    priority?: { min?: number; max?: number };
    name?: string | RegExp;
  }): RuleRegistration[] {
    const results: RuleRegistration[] = [];

    // Determine which engines to search
    const enginesToSearch = criteria.engineId 
      ? [criteria.engineId]
      : Array.from(this.registry.keys());

    enginesToSearch.forEach(engineId => {
      const engineRules = this.registry.get(engineId);
      if (!engineRules) return;

      engineRules.forEach(registration => {
        const rule = registration.rule;
        
        // Check tags
        if (criteria.tags && criteria.tags.length > 0) {
          const ruleTags = rule.tags || [];
          const hasAllTags = criteria.tags.every(tag => ruleTags.includes(tag));
          if (!hasAllTags) return;
        }

        // Check priority
        if (criteria.priority) {
          const priority = rule.priority || 100;
          if (criteria.priority.min !== undefined && priority < criteria.priority.min) return;
          if (criteria.priority.max !== undefined && priority > criteria.priority.max) return;
        }

        // Check name
        if (criteria.name) {
          if (typeof criteria.name === 'string') {
            if (!rule.name.includes(criteria.name)) return;
          } else {
            if (!criteria.name.test(rule.name)) return;
          }
        }

        results.push(registration);
      });
    });

    return results;
  }

  /**
   * Export registry to JSON
   */
  public export(): {
    version: string;
    exportedAt: Date;
    engines: Record<string, RuleRegistration[]>;
  } {
    const exportData: Record<string, RuleRegistration[]> = {};

    this.registry.forEach((rules, engineId) => {
      exportData[engineId] = Array.from(rules.values());
    });

    return {
      version: '1.0.0',
      exportedAt: new Date(),
      engines: exportData
    };
  }

  /**
   * Import registry from JSON
   */
  public import(data: {
    engines: Record<string, RuleRegistration[]>;
  }): void {
    Object.entries(data.engines).forEach(([engineId, registrations]) => {
      registrations.forEach(registration => {
        this.register(registration.rule, engineId, registration.registeredBy);
      });
    });

    console.log(`📥 Imported ${Object.keys(data.engines).length} engines`);
  }

  /**
   * Clear entire registry
   */
  public clearAll(): void {
    this.registry.clear();
    this.ruleIndex.clear();
    console.log('🧹 Registry completely cleared');
  }
}

// Export singleton instance
export const ruleRegistry = RuleRegistry.getInstance();