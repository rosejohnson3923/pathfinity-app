/**
 * Pathfinity™ Security Protection Module
 * Copyright © 2024 Pathfinity Inc. All Rights Reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This source code is the property of Pathfinity Inc. and is protected
 * by copyright law and international treaties. Unauthorized reproduction,
 * distribution, or disclosure of this material is strictly prohibited.
 */

export class SecurityProtection {
  private static instance: SecurityProtection;
  private devToolsOpen = false;
  private lastHeartbeat = Date.now();
  private violations: string[] = [];

  private constructor() {
    if (process.env.NODE_ENV === 'production') {
      this.initializeProtection();
    }
  }

  static getInstance(): SecurityProtection {
    if (!SecurityProtection.instance) {
      SecurityProtection.instance = new SecurityProtection();
    }
    return SecurityProtection.instance;
  }

  private initializeProtection() {
    // Console warning
    this.addConsoleWarning();
    
    // DevTools detection
    this.detectDevTools();
    
    // Disable right-click
    this.disableRightClick();
    
    // Disable text selection on sensitive elements
    this.disableTextSelection();
    
    // Keyboard shortcuts protection
    this.protectKeyboardShortcuts();
    
    // Monitor for tampering
    this.monitorTampering();
    
    // Heartbeat check
    this.startHeartbeat();
  }

  private addConsoleWarning() {
    const warningStyles = [
      'color: red',
      'font-size: 50px',
      'font-weight: bold',
      'text-shadow: 2px 2px 4px rgba(0,0,0,0.5)'
    ].join(';');

    const textStyles = [
      'color: black',
      'font-size: 16px',
      'line-height: 1.5'
    ].join(';');

    console.clear();
    console.log('%cSTOP!', warningStyles);
    console.log(
      '%cThis is a browser feature intended for developers.\n\n' +
      '⚠️ WARNING: Pasting or entering code here could:\n' +
      '• Compromise your account\n' +
      '• Violate Pathfinity\'s Terms of Service\n' +
      '• Result in legal action\n\n' +
      '🔒 Pathfinity™ and PathIQ™ are protected by copyright law.\n' +
      'Unauthorized copying or reverse engineering is prohibited.\n\n' +
      '© 2024 Pathfinity Inc. All Rights Reserved.',
      textStyles
    );

    // Override console methods to prevent clearing
    const noop = () => {};
    const methods = ['clear'];
    methods.forEach(method => {
      const original = (console as any)[method];
      (console as any)[method] = (...args: any[]) => {
        if (this.isAuthorized()) {
          original.apply(console, args);
        } else {
          noop();
        }
      };
    });
  }

  private detectDevTools() {
    const threshold = 160;
    let checkInterval: NodeJS.Timeout;

    const check = () => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!this.devToolsOpen) {
          this.devToolsOpen = true;
          this.handleDevToolsOpen();
        }
      } else {
        this.devToolsOpen = false;
      }
    };

    // Check using multiple methods
    checkInterval = setInterval(check, 500);

    // Detect debugger
    const detectDebugger = () => {
      const start = Date.now();
      debugger;
      const end = Date.now();
      if (end - start > 100) {
        this.handleDebuggerDetected();
      }
    };

    // Run debugger detection periodically
    setInterval(detectDebugger, 5000);

    // Detect if console is opened using toString
    const element = new Image();
    Object.defineProperty(element, 'id', {
      get: () => {
        this.handleDevToolsOpen();
        return 'detected';
      }
    });

    // Log element to trigger getter if console is open
    console.log('%c', element);
  }

  private disableRightClick() {
    document.addEventListener('contextmenu', (e) => {
      if (!this.isAuthorized()) {
        e.preventDefault();
        this.showSecurityWarning('Right-click is disabled for security reasons.');
        return false;
      }
    });
  }

  private disableTextSelection() {
    // Add CSS to prevent selection
    const style = document.createElement('style');
    style.innerHTML = `
      .security-protected {
        -webkit-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
      }
      
      .security-protected::selection {
        background: transparent !important;
      }
      
      .security-protected::-moz-selection {
        background: transparent !important;
      }
    `;
    document.head.appendChild(style);

    // Prevent selection on sensitive elements
    document.addEventListener('selectstart', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.pathiq-content, .proprietary-content')) {
        e.preventDefault();
        return false;
      }
    });

    // Prevent copy
    document.addEventListener('copy', (e) => {
      if (!this.isAuthorized()) {
        e.clipboardData?.setData('text/plain', 'Copying is disabled for security reasons.');
        e.preventDefault();
        this.logViolation('copy_attempt');
      }
    });
  }

  private protectKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Disable F12 (DevTools)
      if (e.key === 'F12') {
        e.preventDefault();
        this.showSecurityWarning('Developer tools are disabled.');
        return false;
      }

      // Disable Ctrl+Shift+I (DevTools)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+Shift+J (Console)
      if (e.ctrlKey && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }

      // Disable Ctrl+U (View Source)
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.showSecurityWarning('View source is disabled.');
        return false;
      }

      // Disable Ctrl+S (Save Page)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        this.showSecurityWarning('Saving page is disabled.');
        return false;
      }

      // Disable Ctrl+A on sensitive content
      if (e.ctrlKey && e.key === 'a') {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
          const range = selection.getRangeAt(0);
          const container = range.commonAncestorContainer as HTMLElement;
          if (container.closest?.('.pathiq-content, .proprietary-content')) {
            e.preventDefault();
            selection.removeAllRanges();
          }
        }
      }
    });
  }

  private monitorTampering() {
    // Monitor for script injection
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeName === 'SCRIPT') {
              const script = node as HTMLScriptElement;
              if (!this.isAuthorizedScript(script)) {
                script.remove();
                this.logViolation('script_injection');
              }
            }
          });
        }
      });
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true
    });

    // Monitor for window.fetch override
    const originalFetch = window.fetch;
    Object.defineProperty(window, 'fetch', {
      get: () => originalFetch,
      set: (value) => {
        if (value !== originalFetch) {
          this.logViolation('fetch_override');
          return originalFetch;
        }
      }
    });
  }

  private startHeartbeat() {
    setInterval(() => {
      const now = Date.now();
      if (now - this.lastHeartbeat > 10000) {
        // Possible time manipulation
        this.logViolation('time_manipulation');
      }
      this.lastHeartbeat = now;

      // Send heartbeat to server
      this.sendHeartbeat();
    }, 5000);
  }

  private handleDevToolsOpen() {
    this.logViolation('devtools_open');
    
    // Show warning overlay
    this.showSecurityOverlay(
      '🔒 Security Alert',
      'Developer tools detected. This action has been logged.'
    );

    // Optional: Redirect after warning
    if (this.violations.filter(v => v === 'devtools_open').length > 3) {
      setTimeout(() => {
        window.location.href = '/security-violation';
      }, 3000);
    }
  }

  private handleDebuggerDetected() {
    this.logViolation('debugger_detected');
    console.warn('⚠️ Debugger detected. This is a violation of Terms of Service.');
  }

  private showSecurityWarning(message: string) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'security-toast';
    toast.innerHTML = `
      <style>
        .security-toast {
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #ff6b6b, #ff4444);
          color: white;
          padding: 15px 20px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          z-index: 999999;
          animation: slideIn 0.3s ease;
          font-family: system-ui, -apple-system, sans-serif;
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      </style>
      <div>⚠️ ${message}</div>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  private showSecurityOverlay(title: string, message: string) {
    const overlay = document.createElement('div');
    overlay.className = 'security-overlay';
    overlay.innerHTML = `
      <style>
        .security-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999999;
          animation: fadeIn 0.3s ease;
        }
        .security-overlay-content {
          background: white;
          padding: 40px;
          border-radius: 12px;
          max-width: 500px;
          text-align: center;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .security-overlay-title {
          font-size: 24px;
          font-weight: bold;
          color: #e74c3c;
          margin-bottom: 15px;
        }
        .security-overlay-message {
          color: #333;
          line-height: 1.6;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      </style>
      <div class="security-overlay-content">
        <div class="security-overlay-title">${title}</div>
        <div class="security-overlay-message">${message}</div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    setTimeout(() => {
      overlay.style.animation = 'fadeOut 0.3s ease forwards';
      setTimeout(() => overlay.remove(), 300);
    }, 5000);
  }

  private isAuthorized(): boolean {
    // Check if current user has developer privileges
    const isDev = localStorage.getItem('pathfinity_dev_mode') === 'true';
    const isAdmin = localStorage.getItem('pathfinity_admin') === 'true';
    return isDev || isAdmin || process.env.NODE_ENV === 'development';
  }

  private isAuthorizedScript(script: HTMLScriptElement): boolean {
    // Whitelist known scripts
    const whitelist = [
      'pathfinity.com',
      'googleapis.com',
      'gstatic.com',
      'cloudflare.com'
    ];
    
    const src = script.src || '';
    return whitelist.some(domain => src.includes(domain));
  }

  private logViolation(type: string) {
    this.violations.push(type);
    
    // Send to server (implement backend endpoint)
    const violation = {
      type,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      fingerprint: this.getFingerprint()
    };
    
    // Log locally for now
    console.warn('Security violation logged:', violation);
    
    // TODO: Send to backend
    // fetch('/api/security/violation', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(violation)
    // });
  }

  private sendHeartbeat() {
    // TODO: Implement heartbeat endpoint
    // fetch('/api/security/heartbeat', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     timestamp: Date.now(),
    //     fingerprint: this.getFingerprint()
    //   })
    // });
  }

  private getFingerprint(): string {
    // Simple fingerprinting (enhance with library like FingerprintJS)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.textBaseline = 'top';
      ctx.font = '14px Arial';
      ctx.fillText('Pathfinity', 2, 2);
    }
    
    return canvas.toDataURL();
  }

  // Public methods
  public protectElement(element: HTMLElement) {
    element.classList.add('security-protected');
    element.classList.add('proprietary-content');
  }

  public getViolationCount(): number {
    return this.violations.length;
  }

  public clearViolations() {
    this.violations = [];
  }
}

// Auto-initialize in production
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  const security = SecurityProtection.getInstance();
  (window as any).pathfinitySecurity = security;
}

export default SecurityProtection.getInstance();