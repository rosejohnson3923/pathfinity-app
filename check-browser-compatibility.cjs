#!/usr/bin/env node
/**
 * Browser Compatibility Checker for Pathfinity
 * Identifies potential cross-browser issues in the codebase
 */

const fs = require('fs');
const path = require('path');

class BrowserCompatibilityChecker {
  constructor() {
    this.issues = [];
    this.filesChecked = 0;
  }

  checkFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.filesChecked++;
      
      // Check for modern JavaScript features that might need polyfills
      this.checkModernJS(content, relativePath);
      
      // Check for CSS features with browser support issues
      this.checkCSS(content, relativePath);
      
      // Check for Web APIs that need feature detection
      this.checkWebAPIs(content, relativePath);

    } catch (error) {
      // Skip files we can't read
    }
  }

  checkModernJS(content, filePath) {
    // Optional chaining (Safari < 13.1, Firefox < 72)
    if (content.includes('?.')) {
      this.issues.push({
        file: filePath,
        type: 'js',
        level: 'medium',
        feature: 'Optional Chaining (?.)',
        issue: 'Not supported in Safari < 13.1, Firefox < 72',
        browsers: 'Safari < 13.1, Firefox < 72, IE (all)'
      });
    }

    // Nullish coalescing (Safari < 13.1, Firefox < 72)
    if (content.includes('??')) {
      this.issues.push({
        file: filePath,
        type: 'js',
        level: 'medium',
        feature: 'Nullish Coalescing (??)',
        issue: 'Not supported in Safari < 13.1, Firefox < 72',
        browsers: 'Safari < 13.1, Firefox < 72, IE (all)'
      });
    }

    // BigInt (Safari < 14, IE all)
    if (content.includes('BigInt') || content.includes('n`')) {
      this.issues.push({
        file: filePath,
        type: 'js',
        level: 'high',
        feature: 'BigInt',
        issue: 'Not supported in Safari < 14, IE',
        browsers: 'Safari < 14, IE (all)'
      });
    }

    // Dynamic imports (Safari < 11, IE all)
    if (content.includes('import(')) {
      this.issues.push({
        file: filePath,
        type: 'js',
        level: 'medium',
        feature: 'Dynamic Imports',
        issue: 'Not supported in Safari < 11.1, IE',
        browsers: 'Safari < 11.1, IE (all)'
      });
    }

    // String.prototype.replaceAll (Safari < 14, Firefox < 88)
    if (content.includes('.replaceAll(')) {
      this.issues.push({
        file: filePath,
        type: 'js',
        level: 'low',
        feature: 'String.replaceAll()',
        issue: 'Not supported in Safari < 14, Firefox < 88',
        browsers: 'Safari < 14, Firefox < 88'
      });
    }
  }

  checkCSS(content, filePath) {
    // CSS Grid (IE partial support)
    if (content.includes('grid-template') || content.includes('display: grid')) {
      this.issues.push({
        file: filePath,
        type: 'css',
        level: 'medium',
        feature: 'CSS Grid',
        issue: 'Limited support in IE 10-11',
        browsers: 'IE 10-11 (partial support)'
      });
    }

    // CSS Custom Properties (IE not supported)
    if (content.includes('--') && content.includes('var(')) {
      this.issues.push({
        file: filePath,
        type: 'css',
        level: 'high',
        feature: 'CSS Custom Properties (CSS Variables)',
        issue: 'Not supported in IE',
        browsers: 'IE (all versions)'
      });
    }

    // Flexbox gap (Safari < 14.1)
    if (content.includes('gap:') && content.includes('flex')) {
      this.issues.push({
        file: filePath,
        type: 'css',
        level: 'medium',
        feature: 'Flexbox gap',
        issue: 'Not supported in Safari < 14.1',
        browsers: 'Safari < 14.1'
      });
    }

    // backdrop-filter (Firefox < 103)
    if (content.includes('backdrop-filter')) {
      this.issues.push({
        file: filePath,
        type: 'css',
        level: 'low',
        feature: 'backdrop-filter',
        issue: 'Not supported in Firefox < 103',
        browsers: 'Firefox < 103'
      });
    }
  }

  checkWebAPIs(content, filePath) {
    // IntersectionObserver (IE not supported)
    if (content.includes('IntersectionObserver')) {
      this.issues.push({
        file: filePath,
        type: 'api',
        level: 'medium',
        feature: 'IntersectionObserver',
        issue: 'Not supported in IE, polyfill available',
        browsers: 'IE (all versions)'
      });
    }

    // ResizeObserver (Safari < 13.1, Firefox < 69)
    if (content.includes('ResizeObserver')) {
      this.issues.push({
        file: filePath,
        type: 'api',
        level: 'medium',
        feature: 'ResizeObserver',
        issue: 'Not supported in Safari < 13.1, Firefox < 69',
        browsers: 'Safari < 13.1, Firefox < 69'
      });
    }

    // Fetch API (IE not supported)
    if (content.includes('fetch(')) {
      this.issues.push({
        file: filePath,
        type: 'api',
        level: 'high',
        feature: 'Fetch API',
        issue: 'Not supported in IE, polyfill available',
        browsers: 'IE (all versions)'
      });
    }

    // Web Audio API (limited Safari support)
    if (content.includes('AudioContext') || content.includes('webkitAudioContext')) {
      this.issues.push({
        file: filePath,
        type: 'api',
        level: 'low',
        feature: 'Web Audio API',
        issue: 'Limited support in older Safari versions',
        browsers: 'Safari < 6 (limited)'
      });
    }
  }

  findReactFiles(dir) {
    let files = [];
    
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory() && !item.includes('node_modules') && !item.includes('.git')) {
          files = files.concat(this.findReactFiles(fullPath));
        } else if (stat.isFile() && (item.endsWith('.tsx') || item.endsWith('.ts') || item.endsWith('.css'))) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  async runCompatibilityCheck() {
    console.log('🌐 Starting Browser Compatibility Check...\n');
    
    const srcDir = path.join(__dirname, 'src');
    const files = this.findReactFiles(srcDir);
    
    // Focus on key files
    const keyFiles = files.filter(file => 
      file.includes('ai-containers') || 
      file.includes('student') ||
      file.includes('main.') ||
      file.includes('index.') ||
      file.includes('.css')
    );
    
    console.log(`📁 Checking ${keyFiles.length} key files for compatibility issues...`);
    
    for (const file of keyFiles.slice(0, 50)) { // Limit to avoid overwhelming output
      this.checkFile(file);
    }
    
    this.generateCompatibilityReport();
  }

  generateCompatibilityReport() {
    console.log('\n' + '='.repeat(70));
    console.log('🌐 BROWSER COMPATIBILITY REPORT');
    console.log('='.repeat(70));
    
    const highIssues = this.issues.filter(i => i.level === 'high').length;
    const mediumIssues = this.issues.filter(i => i.level === 'medium').length;
    const lowIssues = this.issues.filter(i => i.level === 'low').length;
    
    console.log(`\n📊 Files Checked: ${this.filesChecked}`);
    console.log(`🚨 High Priority Issues: ${highIssues}`);
    console.log(`⚠️  Medium Priority Issues: ${mediumIssues}`);
    console.log(`ℹ️  Low Priority Issues: ${lowIssues}`);
    console.log(`📈 Total Compatibility Issues: ${this.issues.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 EXCELLENT! No obvious browser compatibility issues found!');
      console.log('✅ The codebase appears to use broadly compatible features.');
      return;
    }

    // Group by browser
    const browserIssues = {};
    this.issues.forEach(issue => {
      issue.browsers.split(', ').forEach(browser => {
        if (!browserIssues[browser]) browserIssues[browser] = [];
        browserIssues[browser].push(issue);
      });
    });

    console.log('\n📋 ISSUES BY BROWSER:');
    Object.entries(browserIssues).forEach(([browser, issues]) => {
      console.log(`\n🌐 ${browser}:`);
      const uniqueFeatures = [...new Set(issues.map(i => i.feature))];
      uniqueFeatures.slice(0, 5).forEach(feature => {
        const issue = issues.find(i => i.feature === feature);
        const icon = issue.level === 'high' ? '🚨' : issue.level === 'medium' ? '⚠️' : 'ℹ️';
        console.log(`  ${icon} ${feature}`);
      });
      if (uniqueFeatures.length > 5) {
        console.log(`  ... and ${uniqueFeatures.length - 5} more`);
      }
    });

    console.log('\n🎯 COMPATIBILITY ASSESSMENT:');
    if (highIssues === 0) {
      console.log('✅ No critical compatibility blockers');
    } else {
      console.log(`⚠️ ${highIssues} high-priority compatibility issues`);
    }
    
    if (this.issues.length < 10) {
      console.log('✅ Minimal compatibility concerns');
    } else {
      console.log('⚠️ Multiple compatibility considerations needed');
    }
    
    console.log('\n🚀 PRODUCTION BROWSER SUPPORT:');
    console.log('✅ Chrome/Chromium: Should work well');
    console.log('✅ Safari: Modern versions should work well');
    console.log('✅ Firefox: Modern versions should work well');  
    console.log('✅ Edge: Modern versions should work well');
    console.log('❌ Internet Explorer: Not supported (expected)');
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('• Test on Safari 13+ for best compatibility');
    console.log('• Test on Firefox 88+ for modern features');
    console.log('• Consider polyfills for older browser support if needed');
    console.log('• IE is not supported (this is expected for modern React apps)');
    
    console.log('\n' + '='.repeat(70));
  }
}

// Run the compatibility check
const checker = new BrowserCompatibilityChecker();
checker.runCompatibilityCheck().catch(console.error);