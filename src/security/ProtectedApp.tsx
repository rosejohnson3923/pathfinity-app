/**
 * PathIQ™ Protected Application Wrapper
 * Copyright (c) 2024 Esposure Inc. All rights reserved.
 */

import React, { useEffect, useState } from 'react';
import { licenseValidator } from './LicenseValidator';

interface ProtectedAppProps {
  children: React.ReactNode;
  licenseKey?: string;
}

export const ProtectedApp: React.FC<ProtectedAppProps> = ({ children, licenseKey }) => {
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateApp = async () => {
      try {
        // Allow Netlify deployments without any checks
        const isNetlifyDeployment = window.location.hostname.includes('netlify');
        if (isNetlifyDeployment) {
          console.log('✅ Netlify deployment detected, bypassing all license checks');
          setIsValid(true);
          return;
        }

        // Check domain first (only for non-Netlify)
        if (!licenseValidator.isDomainAllowed()) {
          console.error('Domain not allowed:', window.location.hostname);
          setError('This domain is not authorized to run PathIQ™');
          setIsValid(false);
          return;
        }

        // Validate license if provided
        if (licenseKey) {
          const valid = await licenseValidator.validateLicense(licenseKey);
          setIsValid(valid);
          if (!valid) {
            setError('Invalid or expired license');
          }
        } else {
          // In development, allow without license
          if (import.meta.env.DEV) {
            console.log('Development mode - no license required');
            setIsValid(true);
          } else {
            // Allow specific domains without license
            const trustedDomains = ['pathfinity.ai', 'www.pathfinity.ai', 'app.pathfinity.ai'];
            if (trustedDomains.includes(window.location.hostname)) {
              console.log('Trusted domain - allowing without license');
              setIsValid(true);
            } else {
              setError('License key required');
              setIsValid(false);
            }
          }
        }
      } catch (err) {
        console.error('License validation error:', err);
        setError('License validation failed');
        setIsValid(false);
      }
    };

    validateApp();

    // Add anti-debugging measures
    if (import.meta.env.PROD) {
      // Detect debugger statements
      const detectDebugger = () => {
        const start = performance.now();
        // debugger; // This will pause if devtools is open
        const end = performance.now();
        if (end - start > 100) {
          setError('Debugging detected. Application disabled.');
          setIsValid(false);
        }
      };

      const interval = setInterval(detectDebugger, 5000);
      return () => clearInterval(interval);
    }
  }, [licenseKey]);

  // Show loading state
  if (isValid === null) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Initializing PathIQ™ Protection...</h2>
          <p>Validating license and security checks</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (!isValid || error) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        color: 'white',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            ⚠️ Access Denied
          </h1>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            {error || 'Unauthorized access attempt detected'}
          </p>
          <p style={{ fontSize: '1rem' }}>
            Please contact support@esposure.gg for assistance
          </p>
          <div style={{ 
            marginTop: '2rem', 
            padding: '1rem', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}>
            <p>PathIQ™ Intelligence System</p>
            <p>© 2024 Esposure Inc. All rights reserved.</p>
            <p>Protected by U.S. and international copyright laws</p>
          </div>
        </div>
      </div>
    );
  }

  // Render protected application
  return (
    <>
      {/* Anti-copy overlay for production */}
      {import.meta.env.PROD && (
        <style>{`
          * {
            -webkit-user-select: none !important;
            -moz-user-select: none !important;
            -ms-user-select: none !important;
            user-select: none !important;
          }
          
          input, textarea {
            -webkit-user-select: text !important;
            -moz-user-select: text !important;
            -ms-user-select: text !important;
            user-select: text !important;
          }
          
          img {
            pointer-events: none !important;
            -webkit-user-drag: none !important;
          }
          
          ::selection {
            background: transparent !important;
          }
          
          ::-moz-selection {
            background: transparent !important;
          }
        `}</style>
      )}
      {children}
    </>
  );
};