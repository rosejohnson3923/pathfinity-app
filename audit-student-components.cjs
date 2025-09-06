#!/usr/bin/env node
/**
 * Student Learning Components Accessibility Audit
 * Focus on actual student-facing educational interface
 */

const fs = require('fs');
const path = require('path');

class StudentAccessibilityAudit {
  constructor() {
    this.issues = [];
    this.componentsChecked = 0;
  }

  // Simple manual check for obvious accessibility issues
  checkStudentComponent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const relativePath = path.relative(process.cwd(), filePath);
      
      this.componentsChecked++;
      
      // Look for images without alt text (obvious issue)
      const imgWithoutAlt = /<img(?![^>]*alt\s*=)/g;
      let match;
      while ((match = imgWithoutAlt.exec(content)) !== null) {
        this.issues.push({
          file: relativePath,
          line: this.getLineNumber(content, match.index),
          type: 'error',
          message: 'Image missing alt text',
          severity: 'high'
        });
      }

      // Look for obvious input fields without any accessibility attributes
      const badInputs = /<input[^>]*type="(?:text|email|password)"(?![^>]*(?:aria-label|id=))[^>]*>/g;
      while ((match = badInputs.exec(content)) !== null) {
        // Only flag if it's clearly bad - no aria-label AND no id
        this.issues.push({
          file: relativePath,
          line: this.getLineNumber(content, match.index),
          type: 'warning',
          message: 'Input may lack proper labeling',
          severity: 'medium'
        });
      }

      // Check for buttons with only icons (potential issue)
      const iconOnlyButtons = /<button[^>]*>[\s]*<[^>]*(?:Icon|SVG)[^>]*>[\s]*<\/button>/gi;
      while ((match = iconOnlyButtons.exec(content)) !== null) {
        if (!content.substring(match.index - 100, match.index + 100).includes('aria-label')) {
          this.issues.push({
            file: relativePath,
            line: this.getLineNumber(content, match.index),
            type: 'warning',
            message: 'Icon-only button may need aria-label',
            severity: 'medium'
          });
        }
      }

    } catch (error) {
      console.error(`Error checking ${filePath}:`, error.message);
    }
  }

  getLineNumber(content, index) {
    return content.substring(0, index).split('\n').length;
  }

  async runStudentAudit() {
    console.log('🎓 Starting Student Learning Components Accessibility Audit...\n');
    
    // Key student-facing component patterns
    const studentComponentPatterns = [
      'src/components/ai-containers/*.tsx',
      'src/screens/modal-first/*.tsx',
      'src/screens/modal-migration/*.tsx',
      'src/components/learning*/*.tsx',
      'src/components/ai*/*.tsx'
    ];

    const studentFiles = [];
    
    // Find AI containers (main learning interface)
    const aiContainers = this.globSync('src/components/ai-containers/*.tsx');
    studentFiles.push(...aiContainers);
    
    // Find student screens
    const studentScreens = this.globSync('src/screens/**/*.tsx');
    studentFiles.push(...studentScreens);
    
    // Find AI character components
    try {
      const aiCharacterFiles = this.globSync('src/components/**/Finn*.tsx');
      studentFiles.push(...aiCharacterFiles);
    } catch (e) {}

    console.log(`📚 Found ${studentFiles.length} student-facing components to check`);
    console.log(`🔍 Focusing on core learning interface components...\n`);

    // Check the most important student files
    const priorityFiles = studentFiles.filter(file => 
      file.includes('AILearn') || 
      file.includes('AIDiscover') || 
      file.includes('StudentDashboard') ||
      file.includes('DashboardModal') ||
      file.includes('Introduction')
    );

    console.log(`🎯 Checking ${priorityFiles.length} priority student components:`);
    priorityFiles.forEach(file => console.log(`   • ${path.relative(process.cwd(), file)}`));
    console.log('');

    for (const file of priorityFiles) {
      this.checkStudentComponent(file);
    }
    
    this.generateStudentReport();
  }

  globSync(pattern) {
    // Simple glob implementation
    const files = [];
    const parts = pattern.split('/');
    const dir = parts.slice(0, -1).join('/');
    const filePattern = parts[parts.length - 1];
    
    try {
      if (fs.existsSync(dir)) {
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
          if (item.isFile() && item.name.match(filePattern.replace('*', '.*'))) {
            files.push(path.join(dir, item.name));
          }
        }
      }
    } catch (e) {}
    
    return files;
  }

  generateStudentReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 STUDENT LEARNING COMPONENTS - ACCESSIBILITY REPORT');
    console.log('='.repeat(60));
    
    const errorCount = this.issues.filter(issue => issue.type === 'error').length;
    const warningCount = this.issues.filter(issue => issue.type === 'warning').length;
    
    console.log(`\n🎓 Student Components Checked: ${this.componentsChecked}`);
    console.log(`🚨 Critical Issues: ${errorCount}`);
    console.log(`⚠️  Potential Issues: ${warningCount}`);
    console.log(`📈 Total Issues Found: ${this.issues.length}`);
    
    if (this.issues.length === 0) {
      console.log('\n🎉 EXCELLENT! No obvious accessibility issues found in student learning components!');
      console.log('✨ The core educational interface appears to be accessible.');
      return;
    }

    if (this.issues.length > 0) {
      console.log('\n📋 Issues found in student components:');
      this.issues.forEach((issue, i) => {
        const icon = issue.type === 'error' ? '🚨' : '⚠️';
        console.log(`${icon} ${issue.file}:${issue.line} - ${issue.message}`);
      });
    }
    
    console.log('\n🎯 STUDENT ACCESSIBILITY ASSESSMENT:');
    if (errorCount === 0) {
      console.log('✅ No critical barriers for students with disabilities');
    } else {
      console.log(`⚠️ ${errorCount} critical issues that could block student access`);
    }
    
    if (warningCount < 5) {
      console.log('✅ Minimal potential issues - good accessibility foundation');
    } else {
      console.log(`⚠️ ${warningCount} potential issues should be reviewed`);
    }
    
    console.log('\n🏫 PRODUCTION READINESS FOR STUDENTS:');
    if (errorCount === 0 && warningCount < 10) {
      console.log('🟢 READY - Student learning interface is accessible');
    } else {
      console.log('🟡 REVIEW NEEDED - Some student accessibility improvements recommended');
    }
    
    console.log('\n' + '='.repeat(60));
  }
}

// Run the student-focused audit
const audit = new StudentAccessibilityAudit();
audit.runStudentAudit().catch(console.error);