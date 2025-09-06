/**
 * Page Category Hook
 * Allows components to declare their category for proper width management
 */

import { useEffect } from 'react';

export type PageCategory = 
  | 'auth'      // Login, signup, password reset
  | 'modal'     // Modal overlays
  | 'dashboard' // Main dashboards
  | 'content'   // AI containers, learning content
  | 'marketing' // Public pages
  | 'utility';  // Settings, analytics, admin

/**
 * Hook to set the page category for proper CSS width management
 * @param category - The category of the current page/component
 */
export function usePageCategory(category: PageCategory) {
  useEffect(() => {
    // Find the closest parent that could be a page container
    // Start with the component's root element, then check parent divs
    const setCategory = () => {
      // Try to find the main content div (usually first child of #root)
      const root = document.getElementById('root');
      if (!root) return;

      // Get the first significant child of root (skip React providers)
      let targetElement = root.firstElementChild as HTMLElement;
      
      // If there's a modal overlay, set it on that instead
      const modalOverlay = document.querySelector('.modal-overlay');
      if (modalOverlay && category === 'modal') {
        targetElement = modalOverlay as HTMLElement;
      }

      if (targetElement) {
        // Remove any existing category
        targetElement.removeAttribute('data-page-category');
        
        // Set the new category
        targetElement.setAttribute('data-page-category', category);
        
        // Also add a class for easier CSS targeting
        targetElement.classList.remove(
          'auth-page',
          'modal-page',
          'dashboard-page',
          'content-page',
          'marketing-page',
          'utility-page'
        );
        targetElement.classList.add(`${category}-page`);
      }
    };

    // Set category immediately
    setCategory();

    // Also set after a small delay to handle React rendering
    const timer = setTimeout(setCategory, 100);

    // Cleanup function
    return () => {
      clearTimeout(timer);
      const root = document.getElementById('root');
      if (root && root.firstElementChild) {
        const targetElement = root.firstElementChild as HTMLElement;
        targetElement.removeAttribute('data-page-category');
        targetElement.classList.remove(
          'auth-page',
          'modal-page',
          'dashboard-page',
          'content-page',
          'marketing-page',
          'utility-page'
        );
      }
    };
  }, [category]);
}

/**
 * Helper to determine category based on component name or path
 */
export function detectPageCategory(
  componentName?: string,
  pathname?: string
): PageCategory {
  // Check pathname first
  if (pathname) {
    if (pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/auth')) {
      return 'auth';
    }
    if (pathname.includes('/dashboard')) {
      return 'dashboard';
    }
    if (pathname.includes('/settings') || pathname.includes('/admin') || pathname.includes('/analytics')) {
      return 'utility';
    }
    if (pathname === '/' || pathname.includes('/about') || pathname.includes('/pricing')) {
      return 'marketing';
    }
  }

  // Check component name
  if (componentName) {
    const lowerName = componentName.toLowerCase();
    
    if (lowerName.includes('login') || lowerName.includes('auth')) {
      return 'auth';
    }
    if (lowerName.includes('modal')) {
      return 'modal';
    }
    if (lowerName.includes('dashboard')) {
      return 'dashboard';
    }
    if (lowerName.includes('container') || lowerName.includes('learn') || lowerName.includes('experience')) {
      return 'content';
    }
    if (lowerName.includes('settings') || lowerName.includes('admin') || lowerName.includes('analytics')) {
      return 'utility';
    }
    if (lowerName.includes('home') || lowerName.includes('landing') || lowerName.includes('marketing')) {
      return 'marketing';
    }
  }

  // Default to dashboard for main app pages
  return 'dashboard';
}