/**
 * Accessibility Audit Tool
 * WCAG 2.1 Level AA compliance checker
 */

export interface AccessibilityIssue {
  type: 'error' | 'warning' | 'info';
  category: 'contrast' | 'keyboard' | 'aria' | 'structure' | 'focus' | 'alt-text';
  element?: HTMLElement;
  selector?: string;
  message: string;
  wcagCriteria?: string;
  howToFix?: string;
}

export class AccessibilityAudit {
  private issues: AccessibilityIssue[] = [];
  
  /**
   * Run complete accessibility audit
   */
  async runFullAudit(): Promise<AccessibilityIssue[]> {
    this.issues = [];
    
    console.log('🔍 Starting WCAG 2.1 Level AA Accessibility Audit...');
    
    // Run all checks
    await this.checkColorContrast();
    this.checkKeyboardNavigation();
    this.checkAriaLabels();
    this.checkHeadingStructure();
    this.checkFocusIndicators();
    this.checkAltText();
    this.checkFormLabels();
    this.checkLinkPurpose();
    this.checkErrorIdentification();
    this.checkLanguageAttributes();
    
    // Generate report
    this.generateReport();
    
    return this.issues;
  }
  
  /**
   * Check color contrast ratios
   * WCAG 2.1 Level AA requires:
   * - Normal text: 4.5:1
   * - Large text (18pt or 14pt bold): 3:1
   */
  private async checkColorContrast(): Promise<void> {
    const elements = document.querySelectorAll('*');
    
    elements.forEach(element => {
      const el = element as HTMLElement;
      const style = window.getComputedStyle(el);
      
      if (style.color && style.backgroundColor) {
        const contrast = this.calculateContrast(style.color, style.backgroundColor);
        const fontSize = parseFloat(style.fontSize);
        const isBold = style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 700;
        
        const requiredRatio = (fontSize >= 18 || (fontSize >= 14 && isBold)) ? 3 : 4.5;
        
        if (contrast < requiredRatio) {
          this.issues.push({
            type: 'error',
            category: 'contrast',
            element: el,
            selector: this.getSelectorForElement(el),
            message: `Insufficient color contrast: ${contrast.toFixed(2)}:1 (required: ${requiredRatio}:1)`,
            wcagCriteria: '1.4.3 Contrast (Minimum)',
            howToFix: `Adjust colors to meet minimum contrast ratio of ${requiredRatio}:1`
          });
        }
      }
    });
  }
  
  /**
   * Check keyboard navigation
   */
  private checkKeyboardNavigation(): void {
    // Check for keyboard traps
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      const el = element as HTMLElement;
      
      // Check if element is visible but not keyboard accessible
      if (this.isVisible(el) && el.tabIndex < 0) {
        this.issues.push({
          type: 'error',
          category: 'keyboard',
          element: el,
          selector: this.getSelectorForElement(el),
          message: 'Interactive element not keyboard accessible',
          wcagCriteria: '2.1.1 Keyboard',
          howToFix: 'Add tabindex="0" or remove tabindex="-1"'
        });
      }
      
      // Check for proper focus order
      if (el.tabIndex > 0) {
        this.issues.push({
          type: 'warning',
          category: 'keyboard',
          element: el,
          selector: this.getSelectorForElement(el),
          message: 'Positive tabindex disrupts natural tab order',
          wcagCriteria: '2.4.3 Focus Order',
          howToFix: 'Use tabindex="0" instead of positive values'
        });
      }
    });
    
    // Check for skip links
    const skipLink = document.querySelector('a[href^="#"]:first-of-type');
    if (!skipLink) {
      this.issues.push({
        type: 'warning',
        category: 'keyboard',
        message: 'No skip navigation link found',
        wcagCriteria: '2.4.1 Bypass Blocks',
        howToFix: 'Add a skip to main content link at the beginning of the page'
      });
    }
  }
  
  /**
   * Check ARIA labels and roles
   */
  private checkAriaLabels(): void {
    // Check buttons without accessible text
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
      const hasText = button.textContent?.trim();
      const hasAriaLabel = button.getAttribute('aria-label');
      const hasAriaLabelledby = button.getAttribute('aria-labelledby');
      
      if (!hasText && !hasAriaLabel && !hasAriaLabelledby) {
        this.issues.push({
          type: 'error',
          category: 'aria',
          element: button,
          selector: this.getSelectorForElement(button),
          message: 'Button without accessible text',
          wcagCriteria: '4.1.2 Name, Role, Value',
          howToFix: 'Add text content or aria-label attribute'
        });
      }
    });
    
    // Check for proper ARIA roles
    const elementsWithRoles = document.querySelectorAll('[role]');
    elementsWithRoles.forEach(element => {
      const role = element.getAttribute('role');
      const validRoles = ['button', 'navigation', 'main', 'banner', 'complementary', 
                         'contentinfo', 'form', 'search', 'region', 'alert', 'dialog',
                         'menu', 'menubar', 'menuitem', 'tab', 'tablist', 'tabpanel'];
      
      if (role && !validRoles.includes(role)) {
        this.issues.push({
          type: 'warning',
          category: 'aria',
          element: element as HTMLElement,
          selector: this.getSelectorForElement(element as HTMLElement),
          message: `Invalid ARIA role: ${role}`,
          wcagCriteria: '4.1.2 Name, Role, Value',
          howToFix: 'Use a valid ARIA role or remove the role attribute'
        });
      }
    });
  }
  
  /**
   * Check heading structure
   */
  private checkHeadingStructure(): void {
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let lastLevel = 0;
    
    // Check for multiple h1s
    const h1s = document.querySelectorAll('h1');
    if (h1s.length > 1) {
      this.issues.push({
        type: 'warning',
        category: 'structure',
        message: `Multiple h1 elements found (${h1s.length})`,
        wcagCriteria: '1.3.1 Info and Relationships',
        howToFix: 'Use only one h1 per page'
      });
    }
    
    // Check heading hierarchy
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName[1]);
      
      if (level - lastLevel > 1 && index > 0) {
        this.issues.push({
          type: 'warning',
          category: 'structure',
          element: heading as HTMLElement,
          selector: this.getSelectorForElement(heading as HTMLElement),
          message: `Heading level skipped from h${lastLevel} to h${level}`,
          wcagCriteria: '1.3.1 Info and Relationships',
          howToFix: 'Use sequential heading levels'
        });
      }
      
      lastLevel = level;
    });
  }
  
  /**
   * Check focus indicators
   */
  private checkFocusIndicators(): void {
    const focusableElements = document.querySelectorAll(
      'a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach(element => {
      const el = element as HTMLElement;
      const style = window.getComputedStyle(el, ':focus');
      
      // Check if focus styles are removed
      if (style.outline === 'none' || style.outline === '0') {
        const hasAlternativeFocus = 
          style.boxShadow !== 'none' ||
          style.border !== window.getComputedStyle(el).border;
        
        if (!hasAlternativeFocus) {
          this.issues.push({
            type: 'error',
            category: 'focus',
            element: el,
            selector: this.getSelectorForElement(el),
            message: 'Focus indicator removed without alternative',
            wcagCriteria: '2.4.7 Focus Visible',
            howToFix: 'Add visible focus styles (outline, border, or box-shadow)'
          });
        }
      }
    });
  }
  
  /**
   * Check alt text for images
   */
  private checkAltText(): void {
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const alt = img.getAttribute('alt');
      const isDecorative = img.getAttribute('role') === 'presentation' || 
                          img.getAttribute('aria-hidden') === 'true';
      
      if (alt === null && !isDecorative) {
        this.issues.push({
          type: 'error',
          category: 'alt-text',
          element: img,
          selector: this.getSelectorForElement(img),
          message: 'Image missing alt text',
          wcagCriteria: '1.1.1 Non-text Content',
          howToFix: 'Add alt="" for decorative images or descriptive alt text for informative images'
        });
      }
      
      if (alt && alt.length > 125) {
        this.issues.push({
          type: 'warning',
          category: 'alt-text',
          element: img,
          selector: this.getSelectorForElement(img),
          message: `Alt text too long (${alt.length} characters)`,
          wcagCriteria: '1.1.1 Non-text Content',
          howToFix: 'Keep alt text concise (under 125 characters)'
        });
      }
    });
  }
  
  /**
   * Check form labels
   */
  private checkFormLabels(): void {
    const inputs = document.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
      const id = input.id;
      const hasLabel = id && document.querySelector(`label[for="${id}"]`);
      const hasAriaLabel = input.getAttribute('aria-label');
      const hasAriaLabelledby = input.getAttribute('aria-labelledby');
      const isHidden = (input as HTMLInputElement).type === 'hidden';
      
      if (!isHidden && !hasLabel && !hasAriaLabel && !hasAriaLabelledby) {
        this.issues.push({
          type: 'error',
          category: 'aria',
          element: input as HTMLElement,
          selector: this.getSelectorForElement(input as HTMLElement),
          message: 'Form input without label',
          wcagCriteria: '3.3.2 Labels or Instructions',
          howToFix: 'Add a <label> element or aria-label attribute'
        });
      }
    });
  }
  
  /**
   * Check link purpose
   */
  private checkLinkPurpose(): void {
    const links = document.querySelectorAll('a[href]');
    
    links.forEach(link => {
      const text = link.textContent?.trim();
      const ariaLabel = link.getAttribute('aria-label');
      
      if (!text && !ariaLabel) {
        this.issues.push({
          type: 'error',
          category: 'aria',
          element: link as HTMLElement,
          selector: this.getSelectorForElement(link as HTMLElement),
          message: 'Link without accessible text',
          wcagCriteria: '2.4.4 Link Purpose',
          howToFix: 'Add link text or aria-label'
        });
      }
      
      if (text && ['click here', 'read more', 'learn more'].includes(text.toLowerCase())) {
        this.issues.push({
          type: 'warning',
          category: 'aria',
          element: link as HTMLElement,
          selector: this.getSelectorForElement(link as HTMLElement),
          message: 'Link text not descriptive',
          wcagCriteria: '2.4.4 Link Purpose',
          howToFix: 'Use descriptive link text that explains the destination'
        });
      }
    });
  }
  
  /**
   * Check error identification
   */
  private checkErrorIdentification(): void {
    const errorMessages = document.querySelectorAll('[role="alert"], .error, .error-message');
    
    errorMessages.forEach(error => {
      const hasAriaLive = error.getAttribute('aria-live');
      const hasRole = error.getAttribute('role') === 'alert';
      
      if (!hasAriaLive && !hasRole) {
        this.issues.push({
          type: 'warning',
          category: 'aria',
          element: error as HTMLElement,
          selector: this.getSelectorForElement(error as HTMLElement),
          message: 'Error message not announced to screen readers',
          wcagCriteria: '3.3.1 Error Identification',
          howToFix: 'Add role="alert" or aria-live="polite"'
        });
      }
    });
  }
  
  /**
   * Check language attributes
   */
  private checkLanguageAttributes(): void {
    if (!document.documentElement.lang) {
      this.issues.push({
        type: 'error',
        category: 'structure',
        message: 'Page language not specified',
        wcagCriteria: '3.1.1 Language of Page',
        howToFix: 'Add lang="en" to the <html> element'
      });
    }
  }
  
  /**
   * Helper: Calculate color contrast ratio
   */
  private calculateContrast(color1: string, color2: string): number {
    // Simplified contrast calculation
    // In production, use a proper library like color-contrast-checker
    const getLuminance = (color: string): number => {
      // Parse RGB values
      const rgb = color.match(/\d+/g)?.map(Number) || [0, 0, 0];
      const [r, g, b] = rgb.map(val => {
        val = val / 255;
        return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    
    const lum1 = getLuminance(color1);
    const lum2 = getLuminance(color2);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    
    return (brightest + 0.05) / (darkest + 0.05);
  }
  
  /**
   * Helper: Check if element is visible
   */
  private isVisible(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetParent !== null;
  }
  
  /**
   * Helper: Get selector for element
   */
  private getSelectorForElement(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }
  
  /**
   * Generate accessibility report
   */
  private generateReport(): void {
    const errors = this.issues.filter(i => i.type === 'error');
    const warnings = this.issues.filter(i => i.type === 'warning');
    const info = this.issues.filter(i => i.type === 'info');
    
    console.group('📊 Accessibility Audit Results');
    console.log(`Total Issues: ${this.issues.length}`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log(`⚠️ Warnings: ${warnings.length}`);
    console.log(`ℹ️ Info: ${info.length}`);
    
    if (errors.length > 0) {
      console.group('❌ Critical Errors (Must Fix)');
      errors.forEach(error => {
        console.error(`${error.message}\n  WCAG: ${error.wcagCriteria}\n  Fix: ${error.howToFix}`);
      });
      console.groupEnd();
    }
    
    if (warnings.length > 0) {
      console.group('⚠️ Warnings (Should Fix)');
      warnings.forEach(warning => {
        console.warn(`${warning.message}\n  WCAG: ${warning.wcagCriteria}\n  Fix: ${warning.howToFix}`);
      });
      console.groupEnd();
    }
    
    console.groupEnd();
    
    // Save report to localStorage for debugging
    localStorage.setItem('accessibility-audit', JSON.stringify({
      timestamp: new Date().toISOString(),
      issues: this.issues,
      summary: {
        total: this.issues.length,
        errors: errors.length,
        warnings: warnings.length,
        info: info.length
      }
    }));
  }
}

// Export singleton instance
export const accessibilityAudit = new AccessibilityAudit();