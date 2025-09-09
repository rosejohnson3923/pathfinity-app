/**
 * AI Content Responsive Utility
 * ==============================
 * Runtime utilities to ensure AI-generated content is responsive
 * Marks content from OpenAI API calls for proper CSS targeting
 */

/**
 * Mark an element as containing AI-generated content
 */
export const markAsAIContent = (element: HTMLElement | null): void => {
  if (!element) return;
  
  element.setAttribute('data-ai-generated', 'true');
  element.classList.add('ai-content');
  
  // Also mark all child elements
  const children = element.querySelectorAll('*');
  children.forEach(child => {
    child.setAttribute('data-ai-child', 'true');
  });
};

/**
 * Process AI-generated content for responsiveness
 */
export const processAIContent = (content: any, container: HTMLElement | null): void => {
  if (!container) return;
  
  // Mark container as AI content
  markAsAIContent(container);
  
  // Handle window resize events
  enableResponsiveResize(container);
  
  // Process specific content types
  if (typeof content === 'object' && content !== null) {
    // Process question text
    if (content.questionText || content.question) {
      const questionElements = container.querySelectorAll('[class*="question"]');
      questionElements.forEach(el => {
        (el as HTMLElement).style.maxWidth = '100%';
        (el as HTMLElement).style.wordWrap = 'break-word';
      });
    }
    
    // Process emoji content
    if (content.visual?.type === 'emoji' || content.emojis) {
      const emojiElements = container.querySelectorAll('[class*="emoji"]');
      emojiElements.forEach(el => {
        (el as HTMLElement).style.display = 'flex';
        (el as HTMLElement).style.flexWrap = 'wrap';
        (el as HTMLElement).style.justifyContent = 'center';
      });
    }
    
    // Process grid layouts
    if (content.answers || content.options || content.choices) {
      const gridElements = container.querySelectorAll('[class*="grid"], [class*="Grid"]');
      gridElements.forEach(el => {
        (el as HTMLElement).style.width = '100%';
        (el as HTMLElement).style.boxSizing = 'border-box';
      });
    }
  }
};

/**
 * Enable responsive behavior on resize
 */
const enableResponsiveResize = (container: HTMLElement): void => {
  let resizeTimer: NodeJS.Timeout;
  
  const handleResize = () => {
    // Add resizing class to disable transitions
    container.classList.add('resizing');
    
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      // Remove resizing class after resize ends
      container.classList.remove('resizing');
    }, 100);
  };
  
  // Use ResizeObserver for container-based responsiveness
  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    
    // Clean up observer when container is removed
    const mutationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.removedNodes.forEach((node) => {
          if (node === container) {
            resizeObserver.disconnect();
            mutationObserver.disconnect();
          }
        });
      });
    });
    
    if (container.parentNode) {
      mutationObserver.observe(container.parentNode, { childList: true });
    }
  }
};

/**
 * Apply responsive classes based on container size
 */
export const applyResponsiveClasses = (container: HTMLElement): void => {
  if (!container) return;
  
  const width = container.offsetWidth;
  
  // Remove all responsive classes
  container.classList.remove('ai-xs', 'ai-sm', 'ai-md', 'ai-lg', 'ai-xl');
  
  // Apply appropriate class based on width
  if (width < 360) {
    container.classList.add('ai-xs');
  } else if (width < 480) {
    container.classList.add('ai-sm');
  } else if (width < 768) {
    container.classList.add('ai-md');
  } else if (width < 1024) {
    container.classList.add('ai-lg');
  } else {
    container.classList.add('ai-xl');
  }
};

/**
 * Initialize AI content responsive system on app load
 */
export const initializeAIResponsive = (): void => {
  // Mark all existing AI content
  document.querySelectorAll('[class*="question"], [class*="answer"], [class*="practice"], [class*="assessment"]').forEach(element => {
    markAsAIContent(element as HTMLElement);
  });
  
  // Set up mutation observer for future AI content
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          const element = node as HTMLElement;
          
          // Check if this might be AI content
          const className = typeof element.className === 'string' ? element.className : '';
          if (className && (
              className.includes('question') || 
              className.includes('answer') || 
              className.includes('practice') ||
              className.includes('assessment')) ||
              element.hasAttribute('data-dynamic-content')) {
            markAsAIContent(element);
            applyResponsiveClasses(element);
          }
        }
      });
    });
  });
  
  // Observe entire document for changes
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
  // Handle viewport changes
  let viewportTimer: NodeJS.Timeout;
  const handleViewportChange = () => {
    clearTimeout(viewportTimer);
    viewportTimer = setTimeout(() => {
      document.querySelectorAll('.ai-content').forEach(element => {
        applyResponsiveClasses(element as HTMLElement);
      });
    }, 100);
  };
  
  window.addEventListener('resize', handleViewportChange);
  window.addEventListener('orientationchange', handleViewportChange);
};

/**
 * Hook to use in React components that render AI content
 */
export const useAIContentResponsive = (ref: React.RefObject<HTMLElement>, content: any): void => {
  React.useEffect(() => {
    if (ref.current && content) {
      processAIContent(content, ref.current);
      applyResponsiveClasses(ref.current);
    }
  }, [ref, content]);
};

// Re-export for convenience
import * as React from 'react';