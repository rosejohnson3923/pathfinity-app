/**
 * PathIQ™ License Validation System
 * Copyright (c) 2024 Esposure Inc. All rights reserved.
 * 
 * This module implements client-side license validation and fingerprinting
 * for IP protection. Server-side validation required for production.
 */

import CryptoJS from 'crypto-js';

interface LicenseData {
  domain: string;
  expiresAt: string;
  features: string[];
  fingerprint: string;
}

class LicenseValidator {
  private static instance: LicenseValidator;
  private licenseKey: string | null = null;
  private validationCache: Map<string, boolean> = new Map();
  private readonly VALIDATION_ENDPOINT = import.meta.env.VITE_LICENSE_ENDPOINT || '/api/validate-license';
  private readonly PUBLIC_KEY = import.meta.env.VITE_LICENSE_PUBLIC_KEY || '';
  
  private constructor() {
    this.initializeProtection();
  }

  static getInstance(): LicenseValidator {
    if (!LicenseValidator.instance) {
      LicenseValidator.instance = new LicenseValidator();
    }
    return LicenseValidator.instance;
  }

  /**
   * Initialize protection mechanisms
   */
  private initializeProtection(): void {
    // Detect developer tools
    this.detectDevTools();
    
    // Prevent right-click
    document.addEventListener('contextmenu', (e) => {
      if (import.meta.env.PROD) {
        e.preventDefault();
      }
    });

    // Prevent text selection on sensitive elements
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      if (target && target.classList && target.classList.contains('protected') && import.meta.env.PROD) {
        e.preventDefault();
      }
    });

    // Prevent keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (import.meta.env.PROD) {
        // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
        }
      }
    });

    // Monitor for tampering
    this.monitorIntegrity();
  }

  /**
   * Detect if developer tools are open
   */
  private detectDevTools(): void {
    if (!import.meta.env.PROD) return;

    const threshold = 160;
    const devtools = { open: false, orientation: '' };

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true;
          this.handleDevToolsOpen();
        }
      } else {
        devtools.open = false;
      }
    }, 500);

    // Console detection
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        devtools.open = true;
        this.handleDevToolsOpen();
      },
    });
    console.dir(element);
  }

  /**
   * Handle developer tools detection
   */
  private handleDevToolsOpen(): void {
    if (import.meta.env.PROD) {
      console.clear();
      console.log(
        '%cSTOP!',
        'color: red; font-size: 50px; font-weight: bold;'
      );
      console.log(
        '%cThis is a browser feature intended for developers. ' +
        'Content here is protected by copyright and proprietary to Esposure Inc.',
        'color: red; font-size: 16px;'
      );
      
      // Log security event
      this.logSecurityEvent('devtools_opened');
    }
  }

  /**
   * Generate browser fingerprint
   */
  private generateFingerprint(): string {
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      plugins: Array.from(navigator.plugins).map(p => p.name).join(','),
      canvas: this.getCanvasFingerprint(),
    };

    return CryptoJS.SHA256(JSON.stringify(fingerprint)).toString();
  }

  /**
   * Canvas fingerprinting for additional security
   */
  private getCanvasFingerprint(): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const text = 'PathIQ™ Protection';
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText(text, 4, 17);

    return canvas.toDataURL();
  }

  /**
   * Validate license with server
   */
  async validateLicense(licenseKey: string): Promise<boolean> {
    // Check cache first
    if (this.validationCache.has(licenseKey)) {
      return this.validationCache.get(licenseKey)!;
    }

    try {
      const fingerprint = this.generateFingerprint();
      const domain = window.location.hostname;

      const response = await fetch(this.VALIDATION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Fingerprint': fingerprint,
        },
        body: JSON.stringify({
          licenseKey,
          domain,
          fingerprint,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('License validation failed');
      }

      const data = await response.json();
      const isValid = data.valid === true;

      // Cache the result for 1 hour
      this.validationCache.set(licenseKey, isValid);
      setTimeout(() => {
        this.validationCache.delete(licenseKey);
      }, 3600000);

      if (isValid) {
        this.licenseKey = licenseKey;
        this.startHeartbeat();
      }

      return isValid;
    } catch (error) {
      console.error('License validation error:', error);
      return false;
    }
  }

  /**
   * Start heartbeat to maintain license validity
   */
  private startHeartbeat(): void {
    setInterval(async () => {
      if (this.licenseKey) {
        const isValid = await this.validateLicense(this.licenseKey);
        if (!isValid) {
          this.handleInvalidLicense();
        }
      }
    }, 300000); // Check every 5 minutes
  }

  /**
   * Handle invalid license
   */
  private handleInvalidLicense(): void {
    // Clear sensitive data
    sessionStorage.clear();
    localStorage.clear();

    // Show error message
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      ">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="font-size: 3rem; margin-bottom: 1rem;">License Invalid</h1>
          <p style="font-size: 1.2rem; margin-bottom: 2rem;">
            Your license for PathIQ™ has expired or is invalid.
          </p>
          <p style="font-size: 1rem;">
            Please contact support at support@esposure.gg
          </p>
        </div>
      </div>
    `;

    // Log security event
    this.logSecurityEvent('invalid_license');
  }

  /**
   * Monitor code integrity
   */
  private monitorIntegrity(): void {
    // Skip integrity monitoring in development
    if (import.meta.env.DEV) {
      return;
    }

    // Check for modifications to critical functions
    const criticalFunctions = [
      'validateLicense',
      'generateFingerprint',
      'handleInvalidLicense',
    ];

    criticalFunctions.forEach((funcName) => {
      const original = (this as any)[funcName];
      if (original) {
        // Store original for comparison
        (this as any)[`_original_${funcName}`] = original;
        Object.defineProperty(this, funcName, {
          value: original,
          writable: false,
          configurable: false,
        });
      }
    });

    // Detect function overwrites
    setInterval(() => {
      criticalFunctions.forEach((funcName) => {
        if ((this as any)[funcName] !== (this as any)[`_original_${funcName}`]) {
          this.handleTampering();
        }
      });
    }, 10000);
  }

  /**
   * Handle tampering detection
   */
  private handleTampering(): void {
    this.logSecurityEvent('tampering_detected');
    this.handleInvalidLicense();
  }

  /**
   * Log security events
   */
  private logSecurityEvent(event: string): void {
    // Skip logging in development
    if (import.meta.env.DEV) {
      console.log('[Security Event]', event);
      return;
    }

    const eventData = {
      event,
      timestamp: new Date().toISOString(),
      fingerprint: this.generateFingerprint(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Only send to logging endpoint if it's configured and not Netlify
    if (!window.location.hostname.includes('netlify')) {
      fetch('/api/security-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      }).catch(() => {
        // Silently fail if logging fails
      });
    }
  }

  /**
   * Check if current domain is allowed
   */
  isDomainAllowed(): boolean {
    const allowedDomains = [
      'pathfinity.ai',
      'www.pathfinity.ai',
      'app.pathfinity.ai',
      'pathfinity.netlify.app', // Netlify deployment
      'localhost', // Remove in production
    ];

    const currentDomain = window.location.hostname;
    
    // Check exact match or Netlify subdomain
    const isAllowed = allowedDomains.includes(currentDomain) || 
                      currentDomain.includes('netlify');
    
    console.log('Domain validation:', {
      currentDomain,
      isAllowed,
      allowedDomains
    });
    
    return isAllowed;
  }

  /**
   * Get license status
   */
  getLicenseStatus(): {
    valid: boolean;
    domain: string;
    fingerprint: string;
  } {
    return {
      valid: this.licenseKey !== null,
      domain: window.location.hostname,
      fingerprint: this.generateFingerprint(),
    };
  }
}

// Export singleton instance
export const licenseValidator = LicenseValidator.getInstance();

// Auto-check domain on load
if (import.meta.env.PROD) {
  const isNetlify = window.location.hostname.includes('netlify');
  
  if (isNetlify) {
    console.log('✅ Netlify deployment detected, bypassing domain restrictions');
  } else if (!licenseValidator.isDomainAllowed()) {
    console.error('Domain check failed:', {
      currentDomain: window.location.hostname,
      isProduction: import.meta.env.PROD,
      isDomainAllowed: licenseValidator.isDomainAllowed()
    });
    
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: #1a1a1a;
        color: white;
        font-family: monospace;
      ">
        <div>
          <h1>Unauthorized Domain</h1>
          <p>This application is not licensed for use on this domain.</p>
          <p style="font-size: 0.8em; margin-top: 20px; color: #888;">
            Domain: ${window.location.hostname}
          </p>
        </div>
      </div>
    `;
  }
}