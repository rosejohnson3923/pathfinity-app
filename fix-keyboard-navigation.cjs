#!/usr/bin/env node
/**
 * Keyboard Navigation Fixer for Pathfinity Components
 * Adds keyboard event handlers to clickable non-interactive elements
 */

const fs = require('fs');
const path = require('path');

class KeyboardNavigationFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixes = 0;

      // Pattern 1: onClick on div/span without keyboard handlers - Add onKeyDown
      const clickOnlyPattern = /<(div|span)([^>]*onClick\s*=\s*{[^}]+}[^>]*)>/gi;
      content = content.replace(clickOnlyPattern, (match, element, attrs) => {
        // Skip if already has keyboard handler
        if (attrs.includes('onKeyDown') || attrs.includes('onKeyPress') || attrs.includes('onKeyUp')) {
          return match;
        }
        
        // Skip if has role="button" (handled separately)
        if (attrs.includes('role="button"')) {
          return match;
        }
        
        fixes++;
        // Add keyboard support and make it focusable
        const keyboardHandler = ' onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ' + 
          this.extractClickHandler(attrs) + ' } }}';
        const tabIndex = attrs.includes('tabIndex') ? '' : ' tabIndex={0}';
        const role = attrs.includes('role=') ? '' : ' role="button"';
        
        return `<${element}${attrs}${tabIndex}${role}${keyboardHandler}>`;
      });

      // Pattern 2: role="button" without keyboard handlers
      const roleButtonPattern = /<(div|span|a)([^>]*role\s*=\s*["']button["'][^>]*)>/gi;
      content = content.replace(roleButtonPattern, (match, element, attrs) => {
        if (attrs.includes('onKeyDown') || attrs.includes('onKeyPress')) {
          return match;
        }
        
        fixes++;
        const keyboardHandler = ' onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ' + 
          this.extractClickHandler(attrs) + ' } }}';
        const tabIndex = attrs.includes('tabIndex') ? '' : ' tabIndex={0}';
        
        return `<${element}${attrs}${tabIndex}${keyboardHandler}>`;
      });

      // Pattern 3: Cards or containers with click handlers - make them proper interactive elements
      const cardClickPattern = /<div([^>]*className="[^"]*(?:card|container|item)[^"]*"[^>]*onClick\s*=\s*{[^}]+}[^>]*)>/gi;
      content = content.replace(cardClickPattern, (match, attrs) => {
        if (attrs.includes('onKeyDown') || attrs.includes('role="button"')) {
          return match;
        }
        
        fixes++;
        const keyboardHandler = ' onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ' + 
          this.extractClickHandler(attrs) + ' } }}';
        const tabIndex = attrs.includes('tabIndex') ? '' : ' tabIndex={0}';
        const role = ' role="button"';
        
        return `<div${attrs}${tabIndex}${role}${keyboardHandler}>`;
      });

      // Pattern 4: List items with click handlers
      const listItemPattern = /<(li|tr)([^>]*onClick\s*=\s*{[^}]+}[^>]*)>/gi;
      content = content.replace(listItemPattern, (match, element, attrs) => {
        if (attrs.includes('onKeyDown')) {
          return match;
        }
        
        fixes++;
        const keyboardHandler = ' onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ' + 
          this.extractClickHandler(attrs) + ' } }}';
        const tabIndex = attrs.includes('tabIndex') ? '' : ' tabIndex={0}';
        const role = attrs.includes('role=') ? '' : ' role="button"';
        
        return `<${element}${attrs}${tabIndex}${role}${keyboardHandler}>`;
      });

      // Pattern 5: Icons or buttons that should be properly interactive
      const iconClickPattern = /<([^>]+)([^>]*className="[^"]*(?:icon|btn|button)[^"]*"[^>]*onClick\s*=\s*{[^}]+}[^>]*)>/gi;
      content = content.replace(iconClickPattern, (match, elementStart, attrs) => {
        const element = elementStart.split(/\s+/)[0].replace('<', '');
        if (element === 'button' || attrs.includes('onKeyDown')) {
          return match;
        }
        
        fixes++;
        const keyboardHandler = ' onKeyDown={(e) => { if (e.key === \'Enter\' || e.key === \' \') { e.preventDefault(); ' + 
          this.extractClickHandler(attrs) + ' } }}';
        const tabIndex = attrs.includes('tabIndex') ? '' : ' tabIndex={0}';
        const role = attrs.includes('role=') ? '' : ' role="button"';
        
        return `<${element}${attrs}${tabIndex}${role}${keyboardHandler}>`;
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.push({
          file: path.relative(process.cwd(), filePath),
          fixes: fixes
        });
        this.totalFixes += fixes;
        console.log(`⌨️ Fixed ${fixes} keyboard navigation issues in ${path.relative(process.cwd(), filePath)}`);
      }

    } catch (error) {
      console.error(`❌ Error fixing file ${filePath}:`, error.message);
    }
  }

  extractClickHandler(attrs) {
    const onClickMatch = attrs.match(/onClick\s*=\s*{([^}]+)}/);
    if (onClickMatch) {
      return onClickMatch[1];
    }
    return '/* onClick handler */';
  }

  // Find all tsx files in key directories
  findTsxFiles(dir) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
          files = files.concat(this.findTsxFiles(fullPath));
        } else if (stat.isFile() && item.endsWith('.tsx')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  async run() {
    console.log('⌨️ Starting keyboard navigation fixes...\n');
    
    const srcDir = path.join(__dirname, 'src');
    const files = this.findTsxFiles(srcDir);
    
    // Focus on high-impact components first
    const priorityPatterns = [
      /components\/(admin|dashboards|containers)/,
      /Header\.tsx$/,
      /Menu\.tsx$/,
      /Modal\.tsx$/,
      /Card\.tsx$/,
      /Button.*\.tsx$/
    ];
    
    const priorityFiles = files.filter(file => 
      priorityPatterns.some(pattern => pattern.test(file))
    ).slice(0, 20); // Limit to first 20 to avoid overwhelming changes
    
    console.log(`🎯 Processing ${priorityFiles.length} high-priority files for keyboard navigation...`);
    
    for (const file of priorityFiles) {
      this.fixFile(file);
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Files processed: ${this.fixedFiles.length}`);
    console.log(`   Total keyboard fixes applied: ${this.totalFixes}`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`\n✅ Fixed files:`);
      this.fixedFiles.forEach(file => {
        console.log(`   ${file.file}: ${file.fixes} fixes`);
      });
      
      console.log(`\n💡 NOTES:`);
      console.log(`   • Added tabIndex={0} to make elements focusable`);
      console.log(`   • Added role="button" for semantic meaning`);
      console.log(`   • Added onKeyDown handlers for Enter and Space keys`);
      console.log(`   • Elements now work with screen readers and keyboard navigation`);
    }
    
    console.log('\n🎉 Keyboard navigation fixing complete!');
    console.log('🧪 Test by navigating with Tab key and pressing Enter/Space on interactive elements.');
  }
}

// Run the fixer
const fixer = new KeyboardNavigationFixer();
fixer.run().catch(console.error);