// ================================================================
// DOMAIN REDIRECT HANDLER
// Manages incoming traffic from multiple domains
// ================================================================

export interface DomainRedirect {
  domain: string;
  redirectPath?: string;
  trackingTag?: string;
  message?: string;
}

export const domainRedirects: DomainRedirect[] = [
  {
    domain: 'esposure.org',
    trackingTag: 'org-domain',
    message: 'Welcome from our non-profit initiative'
  },
  {
    domain: 'esposure.info',
    trackingTag: 'info-domain',
    message: 'Discover comprehensive information about our platform'
  },
  {
    domain: 'esposure.live',
    trackingTag: 'live-domain',
    redirectPath: '/demo',
    message: 'Experience our live demo'
  },
  {
    domain: 'esposure.net',
    trackingTag: 'net-domain'
  },
  {
    domain: 'esposure.tech',
    trackingTag: 'tech-domain',
    redirectPath: '/technology',
    message: 'Explore our technology stack'
  },
  {
    domain: 'esposure.biz',
    trackingTag: 'biz-domain',
    redirectPath: '/enterprise',
    message: 'Business solutions for education'
  },
  {
    domain: 'esposure.store',
    trackingTag: 'store-domain',
    redirectPath: '/pricing',
    message: 'View our pricing and packages'
  },
  {
    domain: 'esposure.education',
    trackingTag: 'education-domain',
    redirectPath: '/educators',
    message: 'Resources for educators'
  }
];

// Get redirect info based on referrer
export const getRedirectInfo = (referrer: string): DomainRedirect | null => {
  if (!referrer) return null;
  
  const redirect = domainRedirects.find(r => 
    referrer.includes(r.domain)
  );
  
  return redirect || null;
};

// Track domain source for analytics
export const trackDomainSource = (domain: string): void => {
  // Track in analytics (Google Analytics, Mixpanel, etc.)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'domain_redirect', {
      event_category: 'traffic_source',
      event_label: domain,
      value: 1
    });
  }
  
  // Store in session for personalization
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('traffic_source_domain', domain);
  }
};

// Get welcome message based on source domain
export const getWelcomeMessage = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const referrer = document.referrer;
  const redirect = getRedirectInfo(referrer);
  
  if (redirect?.message) {
    trackDomainSource(redirect.domain);
    return redirect.message;
  }
  
  return null;
};