/**
 * Modal System Integration Hook
 * Combines modal state, routing, and analytics into a single interface
 */

import { useCallback, useEffect, useRef } from 'react';
import { useModalState, useModalFactory } from '../state/modalState';
import { useModalRouter } from '../routing/modalRouter';
import { useModalAnalytics } from '../analytics/modalAnalytics';
import { AIContentResponseV2, ModalTypeEnum, ContainerType } from '../ai-engine/types';
import { modalRouter } from '../routing/modalRouter';

export interface ModalSystemOptions {
  autoTrack?: boolean;
  deepLinking?: boolean;
  queueMode?: 'immediate' | 'sequential' | 'manual';
  maxConcurrent?: number;
  gradeLevel?: string;
}

export function useModalSystem(options: ModalSystemOptions = {}) {
  const {
    autoTrack = true,
    deepLinking = true,
    queueMode = 'sequential',
    maxConcurrent = 1,
    gradeLevel
  } = options;

  const modalState = useModalState();
  const modalFactory = useModalFactory();
  const router = useModalRouter();
  const analytics = useModalAnalytics();
  
  const openTimestamps = useRef<Map<string, number>>(new Map());

  /**
   * Open a modal with full integration
   */
  const openModal = useCallback(async (
    response: AIContentResponseV2,
    options?: {
      route?: string;
      priority?: number;
      onClose?: () => void;
      onSubmit?: (data: any) => void;
    }
  ) => {
    const modalId = response.contentId;
    
    // Check if should queue
    if (modalState.activeModals.size >= maxConcurrent && queueMode !== 'manual') {
      modalState.queueModal({
        id: modalId,
        response,
        priority: options?.priority,
        onClose: options?.onClose,
        onSubmit: options?.onSubmit
      });
      return;
    }

    // Track opening
    if (autoTrack) {
      openTimestamps.current.set(modalId, Date.now());
      analytics.trackOpen(
        modalId,
        response.modalType,
        response.uiCompliance.container,
        {
          gradeLevel: gradeLevel || response.context.gradeLevel,
          subject: response.context.subject,
          difficulty: response.context.difficulty
        }
      );
    }

    // Update route if deep linking enabled
    if (deepLinking && options?.route) {
      router.navigate(options.route, { id: modalId });
    }

    // Open the modal
    modalState.openModal({
      id: modalId,
      response,
      priority: options?.priority,
      onClose: () => {
        // Track closing
        if (autoTrack) {
          const openTime = openTimestamps.current.get(modalId);
          const duration = openTime ? Date.now() - openTime : 0;
          analytics.trackClose(modalId, false, {
            modalType: response.modalType,
            container: response.uiCompliance.container,
            duration
          });
          openTimestamps.current.delete(modalId);
        }
        
        // Call custom onClose
        options?.onClose?.();
        
        // Process queue if needed
        if (queueMode === 'sequential') {
          modalState.processQueue();
        }
      },
      onSubmit: (data: any) => {
        // Track submission
        if (autoTrack) {
          analytics.trackSubmit(
            modalId,
            response.modalType,
            data,
            data.score
          );
        }
        
        // Call custom onSubmit
        options?.onSubmit?.(data);
      }
    });
  }, [modalState, analytics, router, autoTrack, deepLinking, queueMode, maxConcurrent, gradeLevel]);

  /**
   * Open modal from URL path
   */
  const openModalFromPath = useCallback(async (path: string, params?: any) => {
    try {
      await router.navigate(path, params);
    } catch (error) {
      console.error('Failed to open modal from path:', error);
      
      if (autoTrack) {
        analytics.trackError(
          'system',
          'navigation',
          error.message || 'Navigation failed',
          { path, params }
        );
      }
    }
  }, [router, analytics, autoTrack]);

  /**
   * Close specific modal
   */
  const closeModal = useCallback((modalId: string, completed: boolean = false) => {
    if (autoTrack) {
      const openTime = openTimestamps.current.get(modalId);
      const duration = openTime ? Date.now() - openTime : 0;
      
      analytics.trackClose(modalId, completed, {
        duration
      });
      openTimestamps.current.delete(modalId);
    }
    
    modalState.closeModal(modalId);
    
    if (queueMode === 'sequential') {
      modalState.processQueue();
    }
  }, [modalState, analytics, autoTrack, queueMode]);

  /**
   * Close all modals
   */
  const closeAllModals = useCallback(() => {
    // Track all closures
    if (autoTrack) {
      modalState.activeModals.forEach((config, id) => {
        const openTime = openTimestamps.current.get(id);
        const duration = openTime ? Date.now() - openTime : 0;
        
        analytics.trackClose(id, false, {
          modalType: config.response.modalType,
          container: config.response.uiCompliance.container,
          duration,
          reason: 'close_all'
        });
      });
      openTimestamps.current.clear();
    }
    
    modalState.closeAllModals();
  }, [modalState, analytics, autoTrack]);

  /**
   * Skip current modal
   */
  const skipModal = useCallback((modalId: string, reason?: string) => {
    const config = modalState.activeModals.get(modalId);
    if (!config) return;
    
    if (autoTrack) {
      analytics.trackSkip(
        modalId,
        config.response.modalType,
        reason
      );
    }
    
    closeModal(modalId, false);
  }, [modalState, analytics, autoTrack, closeModal]);

  /**
   * Submit modal data
   */
  const submitModal = useCallback((modalId: string, data: any) => {
    const config = modalState.activeModals.get(modalId);
    if (!config) return;
    
    // Call onSubmit handler
    config.onSubmit?.(data);
    
    // Track submission
    if (autoTrack) {
      analytics.trackSubmit(
        modalId,
        config.response.modalType,
        data,
        data.score
      );
    }
    
    // Close as completed
    closeModal(modalId, true);
  }, [modalState, analytics, autoTrack, closeModal]);

  /**
   * Track interaction within modal
   */
  const trackInteraction = useCallback((
    modalId: string,
    interactionType: string,
    metadata?: any
  ) => {
    if (!autoTrack) return;
    
    analytics.trackInteraction(modalId, interactionType, metadata);
  }, [analytics, autoTrack]);

  /**
   * Track error within modal
   */
  const trackError = useCallback((
    modalId: string,
    errorType: string,
    errorMessage: string,
    metadata?: any
  ) => {
    if (!autoTrack) return;
    
    analytics.trackError(modalId, errorType, errorMessage, metadata);
  }, [analytics, autoTrack]);

  /**
   * Get current metrics
   */
  const getMetrics = useCallback(() => {
    return {
      session: analytics.getSessionMetrics(),
      aggregate: analytics.getMetrics(),
      activeModals: modalState.activeModals.size,
      queueLength: modalState.modalQueue.length
    };
  }, [analytics, modalState]);

  /**
   * Navigate back in modal history
   */
  const goBack = useCallback(() => {
    if (modalState.history.length > 1) {
      const currentModalId = modalState.currentFocus;
      if (currentModalId) {
        closeModal(currentModalId, false);
      }
      router.back();
    }
  }, [modalState, router, closeModal]);

  /**
   * Process modal queue manually
   */
  const processQueue = useCallback(() => {
    if (queueMode === 'manual') {
      modalState.processQueue();
    }
  }, [modalState, queueMode]);

  /**
   * Setup route listener
   */
  useEffect(() => {
    if (!deepLinking) return;

    const unsubscribe = modalRouter.subscribe((route, params, response) => {
      openModal(response, {
        route: route.path
      });
    });

    return unsubscribe;
  }, [deepLinking, openModal]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      // Track any open modals as abandoned
      if (autoTrack) {
        openTimestamps.current.forEach((timestamp, modalId) => {
          analytics.trackClose(modalId, false, {
            duration: Date.now() - timestamp,
            reason: 'unmount'
          });
        });
      }
    };
  }, [analytics, autoTrack]);

  /**
   * Simplified openModal for StudentDashboard compatibility
   */
  const openModalSimple = useCallback((config: {
    id: string;
    type: ModalTypeEnum;
    container: ContainerType;
    content?: any;
    size?: string;
    duration?: number;
    onClose?: () => void;
    onComplete?: (result: any) => void;
  }) => {
    // Create a mock AIContentResponseV2 for compatibility
    const response: AIContentResponseV2 = {
      contentId: config.id,
      modalType: config.type,
      modalContent: config.content || {},
      dimensions: {
        width: config.size === 'xl' ? 1200 : config.size === 'lg' ? 900 : 600,
        height: 'auto',
        minHeight: 400,
        maxHeight: '80vh'
      },
      uiCompliance: {
        container: config.container,
        theme: {
          primary: '#8B5CF6',
          secondary: '#6366F1',
          accent: '#10B981'
        },
        accessibility: {
          wcagLevel: 'AA',
          keyboardNav: true,
          screenReader: true
        },
        responsive: true
      },
      validation: {
        rules: [],
        clientSide: true
      },
      context: {
        gradeLevel: 'universal',
        subject: 'general',
        difficulty: 3
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        version: '2.0'
      }
    };

    openModal(response, {
      onClose: config.onClose,
      onSubmit: config.onComplete
    });
  }, [openModal]);

  /**
   * Preload modal (stub for now - actual preloading to be implemented)
   */
  const preloadModal = useCallback(async (config: {
    id: string;
    type: ModalTypeEnum;
    container: ContainerType;
  }) => {
    // For now, just log that we would preload
    console.log('Preloading modal:', config);
    // In the future, this could fetch and cache modal content
    return Promise.resolve();
  }, []);

  return {
    // State
    activeModals: modalState.activeModals,
    modalQueue: modalState.modalQueue,
    currentFocus: modalState.currentFocus,
    isLoading: modalState.isLoading,
    modalHistory: modalState.history,
    
    // Actions
    openModal: openModalSimple, // Use simplified version for compatibility
    openModalFromResponse: openModal, // Keep original for AI responses
    openModalFromPath,
    closeModal,
    closeAllModals,
    skipModal,
    submitModal,
    goBack,
    processQueue,
    preloadModal, // Add preloadModal
    
    // Analytics
    trackInteraction,
    trackError,
    getMetrics,
    
    // Utils
    isModalOpen: (modalId: string) => modalState.activeModals.has(modalId),
    getModalCount: () => modalState.activeModals.size,
    getQueueLength: () => modalState.modalQueue.length
  };
}

/**
 * Hook for modal-based navigation
 */
export function useModalNavigation() {
  const router = useModalRouter();
  const analytics = useModalAnalytics();
  
  const navigateTo = useCallback((path: string, params?: any) => {
    analytics.trackInteraction('navigation', 'navigate', {
      path,
      params
    });
    
    return router.navigate(path, params);
  }, [router, analytics]);
  
  const goBack = useCallback(() => {
    analytics.trackInteraction('navigation', 'back', {});
    router.back();
  }, [router, analytics]);
  
  return {
    navigateTo,
    goBack,
    register: router.register
  };
}

/**
 * Hook for modal content generation
 */
export function useModalContent() {
  const modalFactory = useModalFactory();
  const { openModal } = useModalSystem();
  
  const generateAndOpen = useCallback(async (
    contentType: string,
    params: any
  ) => {
    try {
      // This would call the AI pipeline
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          contentType,
          ...params
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate content');
      }
      
      const aiResponse: AIContentResponseV2 = await response.json();
      openModal(aiResponse);
      
    } catch (error) {
      console.error('Failed to generate modal content:', error);
    }
  }, [modalFactory, openModal]);
  
  return {
    generateAndOpen
  };
}