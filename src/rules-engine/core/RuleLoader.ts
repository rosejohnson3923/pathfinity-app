/**
 * Rule Loader
 * Loads and saves rules from various sources (files, database, API)
 */

import {
  Rule,
  RuleSource,
  IRuleLoader,
  RuleValidationResult,
  ValidationError,
  ValidationWarning,
  RuleContext
} from './types';
import * as fs from 'fs/promises';
import * as path from 'path';

/**
 * Rule loader implementation
 */
export class RuleLoader implements IRuleLoader {
  private validators: Map<string, (rule: any) => ValidationError | ValidationWarning | null> = new Map();

  constructor() {
    this.registerDefaultValidators();
  }

  /**
   * Load rules from a source
   */
  public async load(source: RuleSource): Promise<Rule[]> {
    switch (source.type) {
      case 'file':
        return this.loadFromFile(source);
      case 'memory':
        return this.loadFromMemory(source);
      case 'database':
        return this.loadFromDatabase(source);
      case 'api':
        return this.loadFromAPI(source);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  /**
   * Save rules to a destination
   */
  public async save(rules: Rule[], destination: RuleSource): Promise<void> {
    switch (destination.type) {
      case 'file':
        return this.saveToFile(rules, destination);
      case 'memory':
        return this.saveToMemory(rules, destination);
      case 'database':
        return this.saveToDatabase(rules, destination);
      case 'api':
        return this.saveToAPI(rules, destination);
      default:
        throw new Error(`Unsupported destination type: ${destination.type}`);
    }
  }

  /**
   * Load rules from a file
   */
  private async loadFromFile(source: RuleSource): Promise<Rule[]> {
    try {
      const filePath = path.resolve(source.location);
      const fileContent = await fs.readFile(filePath, 'utf-8');

      let rulesData: any[];

      switch (source.format) {
        case 'json':
          rulesData = JSON.parse(fileContent);
          break;
        case 'typescript':
          // For TypeScript files, we'd need to compile/import them
          // This is a simplified version
          const module = await import(filePath);
          rulesData = module.default || module.rules;
          break;
        case 'yaml':
          // Would need a YAML parser like js-yaml
          throw new Error('YAML format not yet implemented');
        default:
          rulesData = JSON.parse(fileContent);
      }

      // Convert raw data to Rule objects
      const rules = this.parseRules(rulesData);
      
      console.log(`📂 Loaded ${rules.length} rules from ${source.location}`);
      return rules;

    } catch (error) {
      throw new Error(`Failed to load rules from file: ${error}`);
    }
  }

  /**
   * Save rules to a file
   */
  private async saveToFile(rules: Rule[], destination: RuleSource): Promise<void> {
    try {
      const filePath = path.resolve(destination.location);
      
      // Serialize rules (remove functions for JSON)
      const serializedRules = rules.map(rule => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        priority: rule.priority,
        enabled: rule.enabled,
        tags: rule.tags,
        version: rule.version,
        // Functions can't be serialized to JSON
        // In a real implementation, we'd save function references or code strings
        condition: '__function__',
        action: '__function__'
      }));

      let fileContent: string;

      switch (destination.format) {
        case 'json':
          fileContent = JSON.stringify(serializedRules, null, 2);
          break;
        case 'typescript':
          fileContent = this.generateTypeScriptFile(rules);
          break;
        default:
          fileContent = JSON.stringify(serializedRules, null, 2);
      }

      await fs.writeFile(filePath, fileContent, 'utf-8');
      console.log(`💾 Saved ${rules.length} rules to ${destination.location}`);

    } catch (error) {
      throw new Error(`Failed to save rules to file: ${error}`);
    }
  }

  /**
   * Load rules from memory (for testing)
   */
  private async loadFromMemory(source: RuleSource): Promise<Rule[]> {
    const rulesData = source.options?.rules || [];
    return this.parseRules(rulesData);
  }

  /**
   * Save rules to memory (for testing)
   */
  private async saveToMemory(rules: Rule[], destination: RuleSource): Promise<void> {
    if (destination.options) {
      destination.options.rules = rules;
    }
  }

  /**
   * Load rules from database
   */
  private async loadFromDatabase(source: RuleSource): Promise<Rule[]> {
    // This would connect to a database and load rules
    // For now, this is a placeholder
    console.log(`🗄️ Loading rules from database: ${source.location}`);
    
    // Mock implementation
    const mockRules: Rule[] = [];
    
    // In a real implementation:
    // 1. Connect to database using source.location (connection string)
    // 2. Query rules table
    // 3. Transform database records to Rule objects
    // 4. Return rules
    
    return mockRules;
  }

  /**
   * Save rules to database
   */
  private async saveToDatabase(rules: Rule[], destination: RuleSource): Promise<void> {
    // This would connect to a database and save rules
    console.log(`🗄️ Saving ${rules.length} rules to database: ${destination.location}`);
    
    // In a real implementation:
    // 1. Connect to database
    // 2. Begin transaction
    // 3. Upsert rules
    // 4. Commit transaction
  }

  /**
   * Load rules from API
   */
  private async loadFromAPI(source: RuleSource): Promise<Rule[]> {
    // This would make an HTTP request to load rules
    console.log(`🌐 Loading rules from API: ${source.location}`);
    
    try {
      const response = await fetch(source.location, {
        method: 'GET',
        headers: source.options?.headers || {},
        ...source.options?.requestOptions
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const rulesData = await response.json();
      return this.parseRules(rulesData);

    } catch (error) {
      throw new Error(`Failed to load rules from API: ${error}`);
    }
  }

  /**
   * Save rules to API
   */
  private async saveToAPI(rules: Rule[], destination: RuleSource): Promise<void> {
    console.log(`🌐 Saving ${rules.length} rules to API: ${destination.location}`);
    
    try {
      const response = await fetch(destination.location, {
        method: destination.options?.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...destination.options?.headers
        },
        body: JSON.stringify(rules),
        ...destination.options?.requestOptions
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

    } catch (error) {
      throw new Error(`Failed to save rules to API: ${error}`);
    }
  }

  /**
   * Parse raw rule data into Rule objects
   */
  private parseRules(rulesData: any[]): Rule[] {
    if (!Array.isArray(rulesData)) {
      throw new Error('Rules data must be an array');
    }

    return rulesData.map((ruleData, index) => {
      // Create base rule structure
      const rule: Rule = {
        id: ruleData.id || `rule_${index}`,
        name: ruleData.name || `Rule ${index}`,
        description: ruleData.description,
        priority: ruleData.priority || 100,
        enabled: ruleData.enabled !== false,
        tags: ruleData.tags || [],
        version: ruleData.version || '1.0.0',
        condition: this.parseFunction(ruleData.condition, 'condition'),
        action: this.parseFunction(ruleData.action, 'action')
      };

      return rule;
    });
  }

  /**
   * Parse a function from various formats
   */
  private parseFunction(fnData: any, type: 'condition' | 'action'): Function {
    // If it's already a function, return it
    if (typeof fnData === 'function') {
      return fnData;
    }

    // If it's a string, try to evaluate it (careful with security!)
    if (typeof fnData === 'string') {
      if (fnData === '__function__') {
        // Placeholder for serialized functions
        return type === 'condition' 
          ? () => true 
          : () => ({ success: true });
      }
      
      // In production, you'd want to use a safe evaluator
      // This is just for demonstration
      try {
        return new Function('context', fnData);
      } catch (error) {
        console.warn(`Failed to parse function: ${error}`);
        return type === 'condition' 
          ? () => true 
          : () => ({ success: true });
      }
    }

    // If it's an object with properties, create appropriate function
    if (typeof fnData === 'object' && fnData !== null) {
      if (fnData.type === 'always') {
        return type === 'condition' 
          ? () => true 
          : () => ({ success: true, data: fnData.data });
      }
      if (fnData.type === 'never') {
        return type === 'condition' 
          ? () => false 
          : () => ({ success: false, error: 'Never action' });
      }
    }

    // Default functions
    return type === 'condition' 
      ? () => true 
      : () => ({ success: true });
  }

  /**
   * Generate TypeScript file content
   */
  private generateTypeScriptFile(rules: Rule[]): string {
    const imports = `import { Rule, RuleContext, RuleResult } from './types';\n\n`;
    
    const rulesCode = rules.map(rule => `
  {
    id: '${rule.id}',
    name: '${rule.name}',
    description: '${rule.description || ''}',
    priority: ${rule.priority},
    enabled: ${rule.enabled},
    tags: ${JSON.stringify(rule.tags)},
    version: '${rule.version}',
    condition: (context: RuleContext) => {
      // TODO: Implement condition logic
      return true;
    },
    action: (context: RuleContext): RuleResult => {
      // TODO: Implement action logic
      return { success: true };
    }
  }`).join(',\n');

    return `${imports}export const rules: Rule[] = [${rulesCode}\n];\n`;
  }

  /**
   * Validate rules
   */
  public validate(rules: Rule[]): RuleValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    rules.forEach(rule => {
      // Check required fields
      if (!rule.id) {
        errors.push({
          ruleId: 'unknown',
          field: 'id',
          message: 'Rule ID is required',
          severity: 'critical'
        });
      }

      if (!rule.name) {
        errors.push({
          ruleId: rule.id || 'unknown',
          field: 'name',
          message: 'Rule name is required',
          severity: 'error'
        });
      }

      // Check for duplicate IDs
      const duplicates = rules.filter(r => r.id === rule.id);
      if (duplicates.length > 1) {
        errors.push({
          ruleId: rule.id,
          field: 'id',
          message: `Duplicate rule ID found: ${rule.id}`,
          severity: 'critical'
        });
      }

      // Run custom validators
      this.validators.forEach((validator, name) => {
        const result = validator(rule);
        if (result) {
          if ('severity' in result) {
            errors.push(result as ValidationError);
          } else {
            warnings.push(result as ValidationWarning);
          }
        }
      });

      // Warnings
      if (!rule.description) {
        warnings.push({
          ruleId: rule.id || 'unknown',
          field: 'description',
          message: 'Rule description is recommended',
          suggestion: 'Add a description to explain the rule purpose'
        });
      }

      if (rule.priority === undefined) {
        warnings.push({
          ruleId: rule.id || 'unknown',
          field: 'priority',
          message: 'Rule priority not set',
          suggestion: 'Set priority to control execution order (default: 100)'
        });
      }
    });

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Register default validators
   */
  private registerDefaultValidators(): void {
    // Priority range validator
    this.validators.set('priority-range', (rule) => {
      if (rule.priority !== undefined && (rule.priority < 0 || rule.priority > 1000)) {
        return {
          ruleId: rule.id,
          field: 'priority',
          message: 'Priority should be between 0 and 1000',
          suggestion: 'Use values between 0 (highest) and 1000 (lowest)'
        };
      }
      return null;
    });

    // Version format validator
    this.validators.set('version-format', (rule) => {
      if (rule.version && !/^\d+\.\d+\.\d+$/.test(rule.version)) {
        return {
          ruleId: rule.id,
          field: 'version',
          message: 'Version should follow semantic versioning (x.y.z)',
          suggestion: 'Use format like 1.0.0'
        };
      }
      return null;
    });

    // Tag format validator
    this.validators.set('tag-format', (rule) => {
      if (rule.tags && rule.tags.some(tag => typeof tag !== 'string')) {
        return {
          ruleId: rule.id,
          field: 'tags',
          message: 'All tags must be strings',
          severity: 'error' as const
        };
      }
      return null;
    });
  }

  /**
   * Add custom validator
   */
  public addValidator(name: string, validator: (rule: any) => ValidationError | ValidationWarning | null): void {
    this.validators.set(name, validator);
  }

  /**
   * Remove custom validator
   */
  public removeValidator(name: string): boolean {
    return this.validators.delete(name);
  }
}

// Export singleton instance
export const ruleLoader = new RuleLoader();