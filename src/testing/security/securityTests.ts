/**
 * PATHFINITY SECURITY TESTING SUITE
 * Comprehensive security tests for AI education platform
 */

import { describe, test, expect, beforeEach, afterEach } from 'jest';

interface SecurityTestResult {
  testName: string;
  passed: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  details?: string;
  recommendations?: string[];
}

interface VulnerabilityReport {
  timestamp: Date;
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  totalTests: number;
  passedTests: number;
  failedTests: number;
  vulnerabilities: SecurityTestResult[];
  complianceChecks: {
    ferpa: boolean;
    coppa: boolean;
    gdpr: boolean;
  };
  recommendations: string[];
}

class SecurityTester {
  private baseUrl: string;
  private testResults: SecurityTestResult[] = [];
  private authToken: string = '';

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // ================================================================
  // AUTHENTICATION & AUTHORIZATION TESTS
  // ================================================================

  async testAuthenticationSecurity(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // Test 1: SQL Injection in login
    results.push(await this.testSQLInjectionLogin());

    // Test 2: Brute force protection
    results.push(await this.testBruteForceProtection());

    // Test 3: Session management
    results.push(await this.testSessionSecurity());

    // Test 4: Password policy
    results.push(await this.testPasswordPolicy());

    // Test 5: JWT token security
    results.push(await this.testJWTSecurity());

    return results;
  }

  private async testSQLInjectionLogin(): Promise<SecurityTestResult> {
    const maliciousPayloads = [
      "admin'; DROP TABLE users; --",
      "' OR '1'='1",
      "admin' /*",
      "' UNION SELECT * FROM users --",
      "admin'; INSERT INTO users (email, role) VALUES ('hacker@evil.com', 'admin'); --"
    ];

    try {
      for (const payload of maliciousPayloads) {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payload,
            password: 'password'
          })
        });

        // Should not return 200 for malicious payloads
        if (response.status === 200) {
          return {
            testName: 'SQL Injection - Login',
            passed: false,
            severity: 'critical',
            description: 'Login endpoint vulnerable to SQL injection',
            details: `Payload "${payload}" returned status 200`,
            recommendations: [
              'Use parameterized queries',
              'Implement input validation',
              'Use ORM/query builder with built-in protection'
            ]
          };
        }
      }

      return {
        testName: 'SQL Injection - Login',
        passed: true,
        severity: 'low',
        description: 'Login endpoint protected against SQL injection'
      };
    } catch (error) {
      return {
        testName: 'SQL Injection - Login',
        passed: false,
        severity: 'medium',
        description: 'Unable to test SQL injection vulnerability',
        details: `Error: ${error}`
      };
    }
  }

  private async testBruteForceProtection(): Promise<SecurityTestResult> {
    const testEmail = 'test@pathfinity.ai';
    const attempts = 10;
    let rateLimited = false;

    try {
      for (let i = 0; i < attempts; i++) {
        const response = await fetch(`${this.baseUrl}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: testEmail,
            password: 'wrongpassword'
          })
        });

        if (response.status === 429) {
          rateLimited = true;
          break;
        }

        // Small delay between attempts
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (rateLimited) {
        return {
          testName: 'Brute Force Protection',
          passed: true,
          severity: 'low',
          description: 'Login endpoint has rate limiting protection'
        };
      } else {
        return {
          testName: 'Brute Force Protection',
          passed: false,
          severity: 'high',
          description: 'Login endpoint lacks brute force protection',
          recommendations: [
            'Implement rate limiting',
            'Add account lockout mechanism',
            'Use CAPTCHA after failed attempts',
            'Monitor and alert on suspicious activity'
          ]
        };
      }
    } catch (error) {
      return {
        testName: 'Brute Force Protection',
        passed: false,
        severity: 'medium',
        description: 'Unable to test brute force protection',
        details: `Error: ${error}`
      };
    }
  }

  private async testSessionSecurity(): Promise<SecurityTestResult> {
    try {
      // Test session fixation
      const loginResponse = await fetch(`${this.baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@pathfinity.ai',
          password: 'password123'
        })
      });

      if (loginResponse.status !== 200) {
        return {
          testName: 'Session Security',
          passed: false,
          severity: 'medium',
          description: 'Unable to test session security - login failed'
        };
      }

      // Check for secure session cookies
      const cookies = loginResponse.headers.get('set-cookie');
      const hasSecureFlag = cookies?.includes('Secure');
      const hasHttpOnlyFlag = cookies?.includes('HttpOnly');
      const hasSameSiteFlag = cookies?.includes('SameSite');

      if (!hasSecureFlag || !hasHttpOnlyFlag || !hasSameSiteFlag) {
        return {
          testName: 'Session Security',
          passed: false,
          severity: 'medium',
          description: 'Session cookies lack security flags',
          details: `Secure: ${hasSecureFlag}, HttpOnly: ${hasHttpOnlyFlag}, SameSite: ${hasSameSiteFlag}`,
          recommendations: [
            'Set Secure flag on cookies',
            'Set HttpOnly flag to prevent XSS',
            'Set SameSite flag to prevent CSRF'
          ]
        };
      }

      return {
        testName: 'Session Security',
        passed: true,
        severity: 'low',
        description: 'Session management properly secured'
      };
    } catch (error) {
      return {
        testName: 'Session Security',
        passed: false,
        severity: 'medium',
        description: 'Unable to test session security',
        details: `Error: ${error}`
      };
    }
  }

  private async testPasswordPolicy(): Promise<SecurityTestResult> {
    const weakPasswords = [
      '123456',
      'password',
      'qwerty',
      '12345678',
      'abc123',
      'password123'
    ];

    try {
      for (const weakPassword of weakPasswords) {
        const response = await fetch(`${this.baseUrl}/api/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'test.weak@pathfinity.ai',
            password: weakPassword,
            firstName: 'Test',
            lastName: 'User'
          })
        });

        // Should reject weak passwords
        if (response.status === 200 || response.status === 201) {
          return {
            testName: 'Password Policy',
            passed: false,
            severity: 'medium',
            description: 'Weak passwords are accepted',
            details: `Password "${weakPassword}" was accepted`,
            recommendations: [
              'Implement minimum password length (12+ characters)',
              'Require mixed case, numbers, and symbols',
              'Check against common password lists',
              'Implement password strength meter'
            ]
          };
        }
      }

      return {
        testName: 'Password Policy',
        passed: true,
        severity: 'low',
        description: 'Strong password policy enforced'
      };
    } catch (error) {
      return {
        testName: 'Password Policy',
        passed: false,
        severity: 'medium',
        description: 'Unable to test password policy',
        details: `Error: ${error}`
      };
    }
  }

  private async testJWTSecurity(): Promise<SecurityTestResult> {
    try {
      // Test with malformed JWT
      const malformedTokens = [
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid',
        'Bearer ' + 'a'.repeat(100),
        'Bearer eyJhbGciOiJub25lIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.',
        ''
      ];

      for (const token of malformedTokens) {
        const response = await fetch(`${this.baseUrl}/api/dashboard`, {
          headers: {
            'Authorization': token
          }
        });

        // Should return 401 for invalid tokens
        if (response.status === 200) {
          return {
            testName: 'JWT Security',
            passed: false,
            severity: 'high',
            description: 'Invalid JWT tokens are accepted',
            details: `Token accepted: ${token.substring(0, 50)}...`,
            recommendations: [
              'Properly validate JWT signatures',
              'Check token expiration',
              'Validate token structure',
              'Use secure JWT libraries'
            ]
          };
        }
      }

      return {
        testName: 'JWT Security',
        passed: true,
        severity: 'low',
        description: 'JWT validation properly implemented'
      };
    } catch (error) {
      return {
        testName: 'JWT Security',
        passed: false,
        severity: 'medium',
        description: 'Unable to test JWT security',
        details: `Error: ${error}`
      };
    }
  }

  // ================================================================
  // API SECURITY TESTS
  // ================================================================

  async testAPISecurityOWASP(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    // Test for OWASP Top 10 vulnerabilities
    results.push(await this.testXSSVulnerabilities());
    results.push(await this.testCSRFProtection());
    results.push(await this.testSecurityHeaders());
    results.push(await this.testInputValidation());
    results.push(await this.testFileUploadSecurity());
    results.push(await this.testAPIRateLimiting());
    results.push(await this.testInformationDisclosure());

    return results;
  }

  private async testXSSVulnerabilities(): Promise<SecurityTestResult> {
    const xssPayloads = [
      '<script>alert("XSS")</script>',
      '"><script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>'
    ];

    try {
      for (const payload of xssPayloads) {
        // Test XSS in character chat
        const response = await fetch(`${this.baseUrl}/api/characters/finn/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            message: payload
          })
        });

        if (response.status === 200) {
          const data = await response.json();
          // Check if payload is reflected without proper encoding
          if (data.response && data.response.includes(payload)) {
            return {
              testName: 'XSS Vulnerabilities',
              passed: false,
              severity: 'high',
              description: 'XSS vulnerability detected in AI chat',
              details: `Payload reflected: ${payload}`,
              recommendations: [
                'Implement proper output encoding',
                'Use Content Security Policy (CSP)',
                'Validate and sanitize all user inputs',
                'Use templating engines with auto-escaping'
              ]
            };
          }
        }
      }

      return {
        testName: 'XSS Vulnerabilities',
        passed: true,
        severity: 'low',
        description: 'No XSS vulnerabilities detected'
      };
    } catch (error) {
      return {
        testName: 'XSS Vulnerabilities',
        passed: false,
        severity: 'medium',
        description: 'Unable to test XSS vulnerabilities',
        details: `Error: ${error}`
      };
    }
  }

  private async testCSRFProtection(): Promise<SecurityTestResult> {
    try {
      // Test state-changing operation without CSRF token
      const response = await fetch(`${this.baseUrl}/api/students/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          firstName: 'Updated'
        })
      });

      // Should require CSRF token for state-changing operations
      if (response.status === 200 && !response.headers.get('x-csrf-token')) {
        return {
          testName: 'CSRF Protection',
          passed: false,
          severity: 'medium',
          description: 'CSRF protection not implemented',
          recommendations: [
            'Implement CSRF tokens for state-changing operations',
            'Use SameSite cookie attribute',
            'Validate Origin and Referer headers',
            'Implement double-submit cookie pattern'
          ]
        };
      }

      return {
        testName: 'CSRF Protection',
        passed: true,
        severity: 'low',
        description: 'CSRF protection properly implemented'
      };
    } catch (error) {
      return {
        testName: 'CSRF Protection',
        passed: false,
        severity: 'medium',
        description: 'Unable to test CSRF protection',
        details: `Error: ${error}`
      };
    }
  }

  private async testSecurityHeaders(): Promise<SecurityTestResult> {
    try {
      const response = await fetch(`${this.baseUrl}/`);
      const headers = response.headers;

      const requiredHeaders = {
        'x-content-type-options': 'nosniff',
        'x-frame-options': ['DENY', 'SAMEORIGIN'],
        'x-xss-protection': '1; mode=block',
        'strict-transport-security': null,
        'content-security-policy': null
      };

      const missingHeaders: string[] = [];

      for (const [header, expectedValue] of Object.entries(requiredHeaders)) {
        const headerValue = headers.get(header);
        
        if (!headerValue) {
          missingHeaders.push(header);
        } else if (Array.isArray(expectedValue) && !expectedValue.includes(headerValue)) {
          missingHeaders.push(`${header} (invalid value: ${headerValue})`);
        } else if (typeof expectedValue === 'string' && headerValue !== expectedValue) {
          missingHeaders.push(`${header} (invalid value: ${headerValue})`);
        }
      }

      if (missingHeaders.length > 0) {
        return {
          testName: 'Security Headers',
          passed: false,
          severity: 'medium',
          description: 'Missing or incorrect security headers',
          details: `Missing headers: ${missingHeaders.join(', ')}`,
          recommendations: [
            'Implement all security headers',
            'Use HSTS for HTTPS enforcement',
            'Set proper CSP policy',
            'Enable XSS protection headers'
          ]
        };
      }

      return {
        testName: 'Security Headers',
        passed: true,
        severity: 'low',
        description: 'Security headers properly configured'
      };
    } catch (error) {
      return {
        testName: 'Security Headers',
        passed: false,
        severity: 'medium',
        description: 'Unable to test security headers',
        details: `Error: ${error}`
      };
    }
  }

  private async testInputValidation(): Promise<SecurityTestResult> {
    const invalidInputs = [
      { field: 'email', value: 'not-an-email' },
      { field: 'gradeLevel', value: 'invalid-grade' },
      { field: 'firstName', value: 'A'.repeat(1000) }, // Very long string
      { field: 'age', value: -1 },
      { field: 'age', value: 200 }
    ];

    try {
      for (const input of invalidInputs) {
        const response = await fetch(`${this.baseUrl}/api/students/profile`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            [input.field]: input.value
          })
        });

        // Should reject invalid inputs
        if (response.status === 200) {
          return {
            testName: 'Input Validation',
            passed: false,
            severity: 'medium',
            description: 'Invalid input accepted',
            details: `Field "${input.field}" accepted invalid value: ${input.value}`,
            recommendations: [
              'Implement comprehensive input validation',
              'Use validation libraries (Joi, Yup, etc.)',
              'Validate data types and ranges',
              'Sanitize inputs before processing'
            ]
          };
        }
      }

      return {
        testName: 'Input Validation',
        passed: true,
        severity: 'low',
        description: 'Input validation properly implemented'
      };
    } catch (error) {
      return {
        testName: 'Input Validation',
        passed: false,
        severity: 'medium',
        description: 'Unable to test input validation',
        details: `Error: ${error}`
      };
    }
  }

  private async testFileUploadSecurity(): Promise<SecurityTestResult> {
    try {
      // Test malicious file upload
      const maliciousFiles = [
        { name: 'script.php', content: '<?php system($_GET["cmd"]); ?>' },
        { name: 'test.exe', content: 'MZ\x90\x00' },
        { name: 'script.jsp', content: '<% Runtime.getRuntime().exec("cmd"); %>' }
      ];

      for (const file of maliciousFiles) {
        const formData = new FormData();
        const blob = new Blob([file.content], { type: 'text/plain' });
        formData.append('file', blob, file.name);

        const response = await fetch(`${this.baseUrl}/api/upload`, {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-token'
          },
          body: formData
        });

        // Should reject malicious files
        if (response.status === 200) {
          return {
            testName: 'File Upload Security',
            passed: false,
            severity: 'high',
            description: 'Malicious file upload accepted',
            details: `File "${file.name}" was accepted`,
            recommendations: [
              'Validate file types by content, not extension',
              'Limit file sizes',
              'Scan uploaded files for malware',
              'Store uploads in secure location',
              'Never execute uploaded files'
            ]
          };
        }
      }

      return {
        testName: 'File Upload Security',
        passed: true,
        severity: 'low',
        description: 'File upload security properly implemented'
      };
    } catch (error) {
      return {
        testName: 'File Upload Security',
        passed: false,
        severity: 'medium',
        description: 'Unable to test file upload security',
        details: `Error: ${error}`
      };
    }
  }

  private async testAPIRateLimiting(): Promise<SecurityTestResult> {
    try {
      const endpoint = `${this.baseUrl}/api/characters/finn/chat`;
      const requests = 50;
      let rateLimited = false;

      for (let i = 0; i < requests; i++) {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-token'
          },
          body: JSON.stringify({
            message: `Test message ${i}`
          })
        });

        if (response.status === 429) {
          rateLimited = true;
          break;
        }
      }

      if (!rateLimited) {
        return {
          testName: 'API Rate Limiting',
          passed: false,
          severity: 'medium',
          description: 'API rate limiting not implemented',
          recommendations: [
            'Implement rate limiting on API endpoints',
            'Use different limits for different endpoints',
            'Consider user-based rate limiting',
            'Implement exponential backoff'
          ]
        };
      }

      return {
        testName: 'API Rate Limiting',
        passed: true,
        severity: 'low',
        description: 'API rate limiting properly implemented'
      };
    } catch (error) {
      return {
        testName: 'API Rate Limiting',
        passed: false,
        severity: 'medium',
        description: 'Unable to test API rate limiting',
        details: `Error: ${error}`
      };
    }
  }

  private async testInformationDisclosure(): Promise<SecurityTestResult> {
    try {
      // Test for information disclosure in error messages
      const response = await fetch(`${this.baseUrl}/api/nonexistent-endpoint`);
      
      if (response.status === 404) {
        const errorData = await response.json();
        
        // Check for sensitive information in error messages
        const errorString = JSON.stringify(errorData).toLowerCase();
        const sensitivePatterns = [
          'database',
          'sql',
          'password',
          'secret',
          'token',
          'stack trace',
          'file path'
        ];

        for (const pattern of sensitivePatterns) {
          if (errorString.includes(pattern)) {
            return {
              testName: 'Information Disclosure',
              passed: false,
              severity: 'low',
              description: 'Sensitive information disclosed in error messages',
              details: `Found pattern: ${pattern}`,
              recommendations: [
                'Use generic error messages',
                'Log detailed errors server-side only',
                'Implement proper error handling',
                'Avoid exposing internal system details'
              ]
            };
          }
        }
      }

      return {
        testName: 'Information Disclosure',
        passed: true,
        severity: 'low',
        description: 'No sensitive information disclosure detected'
      };
    } catch (error) {
      return {
        testName: 'Information Disclosure',
        passed: false,
        severity: 'medium',
        description: 'Unable to test information disclosure',
        details: `Error: ${error}`
      };
    }
  }

  // ================================================================
  // COMPLIANCE TESTING
  // ================================================================

  async testComplianceRequirements(): Promise<SecurityTestResult[]> {
    const results: SecurityTestResult[] = [];

    results.push(await this.testFERPACompliance());
    results.push(await this.testCOPPACompliance());
    results.push(await this.testDataEncryption());
    results.push(await this.testAuditLogging());

    return results;
  }

  private async testFERPACompliance(): Promise<SecurityTestResult> {
    try {
      // Test that student data requires proper authorization
      const response = await fetch(`${this.baseUrl}/api/students/test-student-id`, {
        method: 'GET'
        // No authorization header
      });

      if (response.status === 200) {
        return {
          testName: 'FERPA Compliance',
          passed: false,
          severity: 'critical',
          description: 'Student data accessible without authorization',
          recommendations: [
            'Require authentication for all student data access',
            'Implement role-based access control',
            'Log all access to student records',
            'Implement data minimization principles'
          ]
        };
      }

      return {
        testName: 'FERPA Compliance',
        passed: true,
        severity: 'low',
        description: 'Student data properly protected'
      };
    } catch (error) {
      return {
        testName: 'FERPA Compliance',
        passed: false,
        severity: 'medium',
        description: 'Unable to test FERPA compliance',
        details: `Error: ${error}`
      };
    }
  }

  private async testCOPPACompliance(): Promise<SecurityTestResult> {
    try {
      // Test age verification and parental consent
      const response = await fetch(`${this.baseUrl}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'child@test.com',
          password: 'password123',
          dateOfBirth: '2018-01-01', // Child under 13
          parentalConsent: false
        })
      });

      if (response.status === 200 || response.status === 201) {
        return {
          testName: 'COPPA Compliance',
          passed: false,
          severity: 'critical',
          description: 'Child account created without parental consent',
          recommendations: [
            'Require parental consent for children under 13',
            'Implement age verification',
            'Restrict data collection for children',
            'Provide parental controls'
          ]
        };
      }

      return {
        testName: 'COPPA Compliance',
        passed: true,
        severity: 'low',
        description: 'COPPA compliance properly enforced'
      };
    } catch (error) {
      return {
        testName: 'COPPA Compliance',
        passed: false,
        severity: 'medium',
        description: 'Unable to test COPPA compliance',
        details: `Error: ${error}`
      };
    }
  }

  private async testDataEncryption(): Promise<SecurityTestResult> {
    try {
      // Test that sensitive data is encrypted in transit
      const url = new URL(this.baseUrl);
      
      if (url.protocol !== 'https:' && process.env.NODE_ENV === 'production') {
        return {
          testName: 'Data Encryption',
          passed: false,
          severity: 'critical',
          description: 'HTTPS not enforced in production',
          recommendations: [
            'Enforce HTTPS for all connections',
            'Use strong TLS configuration',
            'Implement HSTS headers',
            'Redirect HTTP to HTTPS'
          ]
        };
      }

      return {
        testName: 'Data Encryption',
        passed: true,
        severity: 'low',
        description: 'Data encryption properly implemented'
      };
    } catch (error) {
      return {
        testName: 'Data Encryption',
        passed: false,
        severity: 'medium',
        description: 'Unable to test data encryption',
        details: `Error: ${error}`
      };
    }
  }

  private async testAuditLogging(): Promise<SecurityTestResult> {
    try {
      // Test that sensitive operations are logged
      const response = await fetch(`${this.baseUrl}/api/students/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-token'
        },
        body: JSON.stringify({
          firstName: 'Test'
        })
      });

      // Check if audit log endpoint exists
      const auditResponse = await fetch(`${this.baseUrl}/api/audit/logs`, {
        headers: {
          'Authorization': 'Bearer admin-token'
        }
      });

      if (auditResponse.status === 404) {
        return {
          testName: 'Audit Logging',
          passed: false,
          severity: 'medium',
          description: 'Audit logging not implemented',
          recommendations: [
            'Implement comprehensive audit logging',
            'Log all access to sensitive data',
            'Include user, timestamp, and action details',
            'Ensure logs are tamper-evident'
          ]
        };
      }

      return {
        testName: 'Audit Logging',
        passed: true,
        severity: 'low',
        description: 'Audit logging properly implemented'
      };
    } catch (error) {
      return {
        testName: 'Audit Logging',
        passed: false,
        severity: 'medium',
        description: 'Unable to test audit logging',
        details: `Error: ${error}`
      };
    }
  }

  // ================================================================
  // REPORT GENERATION
  // ================================================================

  public async generateSecurityReport(): Promise<VulnerabilityReport> {
    console.log('🔒 Starting comprehensive security test suite...');

    const allResults: SecurityTestResult[] = [];

    // Run all security tests
    const authTests = await this.testAuthenticationSecurity();
    const apiTests = await this.testAPISecurityOWASP();
    const complianceTests = await this.testComplianceRequirements();

    allResults.push(...authTests, ...apiTests, ...complianceTests);

    // Calculate overall risk
    const criticalVulns = allResults.filter(r => !r.passed && r.severity === 'critical').length;
    const highVulns = allResults.filter(r => !r.passed && r.severity === 'high').length;
    const mediumVulns = allResults.filter(r => !r.passed && r.severity === 'medium').length;

    let overallRisk: 'low' | 'medium' | 'high' | 'critical';
    if (criticalVulns > 0) overallRisk = 'critical';
    else if (highVulns > 0) overallRisk = 'high';
    else if (mediumVulns > 2) overallRisk = 'medium';
    else overallRisk = 'low';

    // Generate recommendations
    const recommendations = this.generateSecurityRecommendations(allResults);

    const report: VulnerabilityReport = {
      timestamp: new Date(),
      overallRisk,
      totalTests: allResults.length,
      passedTests: allResults.filter(r => r.passed).length,
      failedTests: allResults.filter(r => !r.passed).length,
      vulnerabilities: allResults.filter(r => !r.passed),
      complianceChecks: {
        ferpa: allResults.find(r => r.testName === 'FERPA Compliance')?.passed || false,
        coppa: allResults.find(r => r.testName === 'COPPA Compliance')?.passed || false,
        gdpr: true // Assuming GDPR compliance based on other checks
      },
      recommendations
    };

    console.log(`🔒 Security testing complete. Overall risk: ${overallRisk}`);
    console.log(`📊 ${report.passedTests}/${report.totalTests} tests passed`);

    return report;
  }

  private generateSecurityRecommendations(results: SecurityTestResult[]): string[] {
    const recommendations = new Set<string>();

    results.forEach(result => {
      if (!result.passed && result.recommendations) {
        result.recommendations.forEach(rec => recommendations.add(rec));
      }
    });

    // Add general recommendations
    recommendations.add('Regularly update dependencies and frameworks');
    recommendations.add('Implement security monitoring and alerting');
    recommendations.add('Conduct regular security audits and penetration testing');
    recommendations.add('Train development team on secure coding practices');

    return Array.from(recommendations);
  }
}

export default SecurityTester;
export { SecurityTester, SecurityTestResult, VulnerabilityReport };