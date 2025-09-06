// ================================================================
// DOMAIN WELCOME BANNER
// Shows personalized welcome based on referring domain
// ================================================================

import React, { useState, useEffect } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { getWelcomeMessage, getRedirectInfo } from '../utils/domainRedirects';

export const DomainWelcomeBanner: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    // Check if user came from one of our other domains
    const welcomeMsg = getWelcomeMessage();
    if (welcomeMsg) {
      setMessage(welcomeMsg);
      setIsVisible(true);
      
      // Get redirect path if any
      const referrer = document.referrer;
      const redirectInfo = getRedirectInfo(referrer);
      if (redirectInfo?.redirectPath) {
        setRedirectPath(redirectInfo.redirectPath);
      }
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 10000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isVisible || !message) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-4 max-w-md">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
          {redirectPath && (
            <a 
              href={redirectPath}
              className="text-xs text-purple-200 hover:text-white flex items-center mt-1"
            >
              <span>Go to recommended page</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-purple-200 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default DomainWelcomeBanner;