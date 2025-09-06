#!/usr/bin/env node
/**
 * Systematic Form Label Fixer for Pathfinity Components
 * Adds proper htmlFor/id associations to input elements
 */

const fs = require('fs');
const path = require('path');

class FormLabelFixer {
  constructor() {
    this.fixedFiles = [];
    this.totalFixes = 0;
  }

  // Fix form labels in a specific file
  fixFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf8');
      const originalContent = content;
      let fixes = 0;

      // Pattern 1: <label><text></label><input> - Add id to input and htmlFor to label
      const labelInputPattern = /<label\s+className="([^"]*)">\s*([^<]+)\s*<\/label>\s*<input([^>]+)>/gi;
      content = content.replace(labelInputPattern, (match, className, labelText, inputAttrs) => {
        const id = this.generateId(labelText);
        if (!inputAttrs.includes('id=') && !inputAttrs.includes('aria-label')) {
          fixes++;
          return `<label htmlFor="${id}" className="${className}">${labelText}</label><input id="${id}"${inputAttrs}>`;
        }
        return match;
      });

      // Pattern 2: <label className="...">...<input...> (input inside label) - Add proper id/htmlFor
      const nestedInputPattern = /<label\s+className="([^"]*)"([^>]*)>\s*([^<]*(?:<[^>]+>[^<]*)*?)<input([^>]+)>/gi;
      content = content.replace(nestedInputPattern, (match, className, labelAttrs, innerContent, inputAttrs) => {
        const id = this.generateIdFromContent(innerContent);
        if (!inputAttrs.includes('id=') && !inputAttrs.includes('aria-label') && !labelAttrs.includes('htmlFor=')) {
          fixes++;
          return `<label htmlFor="${id}" className="${className}"${labelAttrs}>${innerContent}<input id="${id}"${inputAttrs}>`;
        }
        return match;
      });

      // Pattern 3: Standalone inputs without labels - Add aria-label based on placeholder or nearby text
      const standaloneInputPattern = /<input([^>]*type="(?:text|email|password|search|tel|url|number)"[^>]*(?:placeholder="([^"]*)")?[^>]*)>/gi;
      content = content.replace(standaloneInputPattern, (match, inputAttrs, placeholder) => {
        if (!inputAttrs.includes('aria-label') && !inputAttrs.includes('id=')) {
          const ariaLabel = placeholder || this.guessLabelFromContext(match, content);
          if (ariaLabel) {
            fixes++;
            return `<input${inputAttrs} aria-label="${ariaLabel}">`;
          }
        }
        return match;
      });

      // Pattern 4: textarea elements
      const textareaPattern = /<textarea([^>]*)>/gi;
      content = content.replace(textareaPattern, (match, attrs) => {
        if (!attrs.includes('aria-label') && !attrs.includes('id=')) {
          const placeholder = attrs.match(/placeholder="([^"]*)"/);
          if (placeholder) {
            fixes++;
            return `<textarea${attrs} aria-label="${placeholder[1]}">`;
          }
        }
        return match;
      });

      // Pattern 5: select elements
      const selectPattern = /<select([^>]*)>/gi;
      content = content.replace(selectPattern, (match, attrs) => {
        if (!attrs.includes('aria-label') && !attrs.includes('id=')) {
          // Look for a preceding label or nearby text
          const ariaLabel = this.guessSelectLabel(match, content);
          if (ariaLabel) {
            fixes++;
            return `<select${attrs} aria-label="${ariaLabel}">`;
          }
        }
        return match;
      });

      if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        this.fixedFiles.push({
          file: path.relative(process.cwd(), filePath),
          fixes: fixes
        });
        this.totalFixes += fixes;
        console.log(`✅ Fixed ${fixes} label issues in ${path.relative(process.cwd(), filePath)}`);
      }

    } catch (error) {
      console.error(`❌ Error fixing file ${filePath}:`, error.message);
    }
  }

  generateId(labelText) {
    return labelText
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);
  }

  generateIdFromContent(content) {
    // Extract meaningful text from content
    const textMatch = content.match(/>\s*([A-Za-z][A-Za-z\s]*?)\s*[<*]/);
    if (textMatch) {
      return this.generateId(textMatch[1]);
    }
    return 'input' + Math.random().toString(36).substring(7);
  }

  guessLabelFromContext(match, fullContent) {
    const index = fullContent.indexOf(match);
    const before = fullContent.substring(Math.max(0, index - 200), index);
    
    // Look for nearby label text
    const labelMatch = before.match(/<label[^>]*>([^<]+)<\/label>/);
    if (labelMatch) return labelMatch[1].trim();
    
    const headingMatch = before.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/);
    if (headingMatch) return headingMatch[1].trim();
    
    // Look for placeholder
    const placeholderMatch = match.match(/placeholder="([^"]*)"/);
    if (placeholderMatch) return placeholderMatch[1];
    
    return null;
  }

  guessSelectLabel(match, fullContent) {
    const index = fullContent.indexOf(match);
    const before = fullContent.substring(Math.max(0, index - 100), index);
    
    const labelMatch = before.match(/>([^<]*(?:Select|Choose|Pick)[^<]*)</gi);
    if (labelMatch) return labelMatch[0].replace('>', '').trim();
    
    return 'Select option';
  }

  // Find all tsx files
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
    console.log('🔧 Starting systematic form label fixes...\n');
    
    const srcDir = path.join(__dirname, 'src');
    const files = this.findTsxFiles(srcDir);
    
    // Focus on high-priority files first
    const priorityPatterns = [
      /admin.*Modal/,
      /.*Form\.tsx$/,
      /Header\.tsx$/,
      /.*Input.*\.tsx$/,
      /.*Settings.*\.tsx$/
    ];
    
    const priorityFiles = files.filter(file => 
      priorityPatterns.some(pattern => pattern.test(file))
    );
    
    console.log(`🎯 Processing ${priorityFiles.length} priority files...`);
    
    for (const file of priorityFiles) {
      this.fixFile(file);
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`   Files processed: ${this.fixedFiles.length}`);
    console.log(`   Total fixes applied: ${this.totalFixes}`);
    
    if (this.fixedFiles.length > 0) {
      console.log(`\n✅ Fixed files:`);
      this.fixedFiles.forEach(file => {
        console.log(`   ${file.file}: ${file.fixes} fixes`);
      });
    }
    
    console.log('\n🎉 Form label fixing complete!');
    console.log('💡 Remember to test with screen readers and run the audit again.');
  }
}

// Run the fixer
const fixer = new FormLabelFixer();
fixer.run().catch(console.error);