#!/usr/bin/env node
/**
 * Quick Accessibility Audit for Pathfinity Components
 * Checks common accessibility issues in React/JSX files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class AccessibilityAudit {
  constructor() {
    this.issues = [];
    this.componentsChecked = 0;
    this.totalFiles = 0;
  }

  // Check for common accessibility issues in JSX files
  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.componentsChecked++;
      
      // Check for missing alt text on images
      const imgRegex = /<img(?![^>]*alt\s*=)/gi;
      let match;
      while ((match = imgRegex.exec(content)) !== null) {
        this.issues.push({
          file: relativePath,
          line: this.getLineNumber(content, match.index),
          type: 'error',
          category: 'alt-text',
          message: 'Image missing alt attribute',
          wcag: '1.1.1 Non-text Content'
        });
      }

      // Check for buttons without accessible text
      const buttonRegex = /<button(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*title)[^>]*>(?:\s*<[^>]+>\s*)*<\/button>/gi;
      while ((match = buttonRegex.exec(content)) !== null) {
        // Skip if button has text content
        const buttonContent = match[0].replace(/<button[^>]*>/, '').replace(/<\/button>/, '');
        if (!buttonContent.trim() || buttonContent.includes('<') && !buttonContent.includes('>')) {
          this.issues.push({
            file: relativePath,
            line: this.getLineNumber(content, match.index),
            type: 'error',
            category: 'aria',
            message: 'Button without accessible text (no aria-label, aria-labelledby, or text content)',
            wcag: '4.1.2 Name, Role, Value'
          });
        }
      }

      // Check for input elements without labels
      const inputRegex = /<input(?![^>]*aria-label)(?![^>]*aria-labelledby)(?![^>]*id\s*=\s*["'][^"']*["'][^>]*>(?:(?!<label[^>]*for\s*=\s*["'][^"']*["']).)*<)/gi;
      while ((match = inputRegex.exec(content)) !== null) {
        this.issues.push({
          file: relativePath,
          line: this.getLineNumber(content, match.index),
          type: 'error',
          category: 'form-labels',
          message: 'Input element without associated label',
          wcag: '3.3.2 Labels or Instructions'
        });
      }

      // Check for click handlers without keyboard support
      const onClickRegex = /onClick\s*=\s*{[^}]+}/gi;
      while ((match = onClickRegex.exec(content)) !== null) {
        const beforeClick = content.substring(0, match.index);
        const afterClick = content.substring(match.index + match[0].length);
        
        // Check if it's on a div or span without onKeyDown/onKeyPress
        if (beforeClick.includes('<div') || beforeClick.includes('<span')) {
          const hasKeyboardHandler = afterClick.includes('onKeyDown') || afterClick.includes('onKeyPress') || beforeClick.includes('onKeyDown') || beforeClick.includes('onKeyPress');
          if (!hasKeyboardHandler) {
            this.issues.push({
              file: relativePath,
              line: this.getLineNumber(content, match.index),
              type: 'warning',
              category: 'keyboard',
              message: 'Click handler on non-interactive element without keyboard support',
              wcag: '2.1.1 Keyboard'
            });
          }
        }
      }

      // Check for missing heading hierarchy
      const headingRegex = /<h([1-6])[^>]*>/gi;
      const headings = [];
      while ((match = headingRegex.exec(content)) !== null) {
        headings.push({
          level: parseInt(match[1]),
          line: this.getLineNumber(content, match.index)
        });
      }

      // Check for skipped heading levels
      for (let i = 1; i < headings.length; i++) {
        if (headings[i].level > headings[i-1].level + 1) {
          this.issues.push({
            file: relativePath,
            line: headings[i].line,
            type: 'warning',
            category: 'structure',
            message: `Heading level skipped (h${headings[i-1].level} to h${headings[i].level})`,
            wcag: '1.3.1 Info and Relationships'
          });
        }
      }

      // Check for role="button" without proper keyboard handling
      const roleButtonRegex = /role\s*=\s*["']button["'][^>]*>/gi;
      while ((match = roleButtonRegex.exec(content)) !== null) {
        const surroundingContent = content.substring(match.index - 100, match.index + 200);
        if (!surroundingContent.includes('onKeyDown') && !surroundingContent.includes('onKeyPress')) {
          this.issues.push({
            file: relativePath,
            line: this.getLineNumber(content, match.index),
            type: 'error',
            category: 'keyboard',
            message: 'Element with role="button" missing keyboard event handlers',
            wcag: '2.1.1 Keyboard'
          });
        }
      }

    } catch (error) {
      console.error(`Error checking file ${filePath}:`, error.message);
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  // Recursively find all .tsx files
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

  async runAudit() {
    console.log('🔍 Starting Accessibility Audit for Pathfinity...\n');
    
    const srcDir = path.join(__dirname, 'src');
    const files = this.findTsxFiles(srcDir);
    this.totalFiles = files.length;
    
    console.log(`📁 Found ${files.length} React component files to analyze`);
    
    // Check key directories first
    const priorityDirs = ['components', 'screens', 'modals'];
    const priorityFiles = files.filter(file => 
      priorityDirs.some(dir => file.includes(`/${dir}/`))
    );
    
    console.log(`🎯 Checking ${priorityFiles.length} priority component files...\n`);
    
    for (const file of priorityFiles) {
      this.checkFile(file);
    }
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n' + '='.repeat(80));
    console.log('📊 ACCESSIBILITY AUDIT REPORT');
    console.log('='.repeat(80));
    
    const errorCount = this.issues.filter(issue => issue.type === 'error').length;
    const warningCount = this.issues.filter(issue => issue.type === 'warning').length;
    
    console.log(`\n📈 Summary:`);
    console.log(`   Components Checked: ${this.componentsChecked}`);
    console.log(`   🚨 Errors: ${errorCount}`);
    console.log(`   ⚠️  Warnings: ${warningCount}`);
    console.log(`   Total Issues: ${this.issues.length}\n`);
    
    if (this.issues.length === 0) {
      console.log('✅ No accessibility issues found in the checked components!');
      return;
    }

    // Group issues by category
    const issuesByCategory = {};
    this.issues.forEach(issue => {
      if (!issuesByCategory[issue.category]) {
        issuesByCategory[issue.category] = [];
      }
      issuesByCategory[issue.category].push(issue);
    });

    // Display issues by category
    for (const [category, categoryIssues] of Object.entries(issuesByCategory)) {
      console.log(`\n🔍 ${category.toUpperCase()} ISSUES (${categoryIssues.length}):`);
      console.log('-'.repeat(50));
      
      categoryIssues.slice(0, 10).forEach(issue => { // Limit to 10 per category
        const icon = issue.type === 'error' ? '🚨' : '⚠️';
        console.log(`${icon} ${issue.file}:${issue.line}`);
        console.log(`   ${issue.message}`);
        console.log(`   WCAG: ${issue.wcag}\n`);
      });
      
      if (categoryIssues.length > 10) {
        console.log(`   ... and ${categoryIssues.length - 10} more ${category} issues\n`);
      }
    }
    
    console.log('\n📋 RECOMMENDATIONS:');
    console.log('-'.repeat(50));
    
    if (issuesByCategory['alt-text']) {
      console.log('• Add alt attributes to all images');
      console.log('• Use alt="" for decorative images');
    }
    
    if (issuesByCategory['aria']) {
      console.log('• Add aria-label or visible text to buttons');
      console.log('• Ensure all interactive elements have accessible names');
    }
    
    if (issuesByCategory['keyboard']) {
      console.log('• Add keyboard event handlers to interactive elements');
      console.log('• Ensure all functionality is keyboard accessible');
    }
    
    if (issuesByCategory['form-labels']) {
      console.log('• Associate labels with form inputs using htmlFor/id or aria-label');
    }
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Fix critical errors first (missing alt text, labels)');
    console.log('2. Address keyboard navigation issues');
    console.log('3. Test with screen readers');
    console.log('4. Run axe-core for comprehensive testing');
    
    console.log('\n' + '='.repeat(80));
  }
}

// Run the audit
const audit = new AccessibilityAudit();
audit.runAudit().catch(console.error);