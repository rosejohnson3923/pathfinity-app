/**
 * Modal State Management
 * Centralized state for modal system using React Context and hooks
 */

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { AIContentResponseV2, ModalTypeEnum } from '../ai-engine/types';

// Modal configuration
export interface ModalConfig {
  id: string;
  response: AIContentResponseV2;
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  priority?: number;
  onClose?: () => void;
  onSubmit?: (data: any) => void;
}

// Modal state interface
export interface ModalState {
  activeModals: Map<string, ModalConfig>;
  modalQueue: ModalConfig[];
  currentFocus: string | null;
  history: string[];
  isLoading: boolean;
  error: string | null;
}

// Action types
export type ModalAction =
  | { type: 'OPEN_MODAL'; payload: ModalConfig }
  | { type: 'CLOSE_MODAL'; payload: string }
  | { type: 'CLOSE_ALL_MODALS' }
  | { type: 'QUEUE_MODAL'; payload: ModalConfig }
  | { type: 'PROCESS_QUEUE' }
  | { type: 'SET_FOCUS'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_HISTORY' };

// Initial state
const initialState: ModalState = {
  activeModals: new Map(),
  modalQueue: [],
  currentFocus: null,
  history: [],
  isLoading: false,
  error: null
};

// Reducer
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case 'OPEN_MODAL': {
      const newModals = new Map(state.activeModals);
      newModals.set(action.payload.id, action.payload);
      
      return {
        ...state,
        activeModals: newModals,
        currentFocus: action.payload.id,
        history: [...state.history, action.payload.id]
      };
    }

    case 'CLOSE_MODAL': {
      const newModals = new Map(state.activeModals);
      const config = newModals.get(action.payload);
      
      if (config?.onClose) {
        config.onClose();
      }
      
      newModals.delete(action.payload);
      
      // Update focus to previous modal if exists
      const remainingModals = Array.from(newModals.keys());
      const newFocus = remainingModals[remainingModals.length - 1] || null;
      
      return {
        ...state,
        activeModals: newModals,
        currentFocus: newFocus
      };
    }

    case 'CLOSE_ALL_MODALS': {
      // Call onClose for all modals
      state.activeModals.forEach(config => {
        if (config.onClose) {
          config.onClose();
        }
      });
      
      return {
        ...state,
        activeModals: new Map(),
        currentFocus: null
      };
    }

    case 'QUEUE_MODAL': {
      // Add to queue with priority sorting
      const newQueue = [...state.modalQueue, action.payload];
      newQueue.sort((a, b) => (b.priority || 0) - (a.priority || 0));
      
      return {
        ...state,
        modalQueue: newQueue
      };
    }

    case 'PROCESS_QUEUE': {
      if (state.modalQueue.length === 0) {
        return state;
      }
      
      const [nextModal, ...remainingQueue] = state.modalQueue;
      const newModals = new Map(state.activeModals);
      newModals.set(nextModal.id, nextModal);
      
      return {
        ...state,
        activeModals: newModals,
        modalQueue: remainingQueue,
        currentFocus: nextModal.id,
        history: [...state.history, nextModal.id]
      };
    }

    case 'SET_FOCUS': {
      if (!state.activeModals.has(action.payload)) {
        return state;
      }
      
      return {
        ...state,
        currentFocus: action.payload
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload
      };
    }

    case 'SET_ERROR': {
      return {
        ...state,
        error: action.payload
      };
    }

    case 'CLEAR_HISTORY': {
      return {
        ...state,
        history: []
      };
    }

    default:
      return state;
  }
}

// Context
interface ModalContextValue {
  state: ModalState;
  dispatch: React.Dispatch<ModalAction>;
  openModal: (config: ModalConfig) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  queueModal: (config: ModalConfig) => void;
  processQueue: () => void;
  setFocus: (id: string) => void;
  openModalFromResponse: (response: AIContentResponseV2, options?: Partial<ModalConfig>) => void;
}

const ModalContext = createContext<ModalContextValue | undefined>(undefined);

// Provider component
export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(modalReducer, initialState);

  // Helper functions
  const openModal = useCallback((config: ModalConfig) => {
    // Generate ID if not provided
    if (!config.id) {
      config.id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    dispatch({ type: 'OPEN_MODAL', payload: config });
  }, []);

  const closeModal = useCallback((id: string) => {
    dispatch({ type: 'CLOSE_MODAL', payload: id });
  }, []);

  const closeAllModals = useCallback(() => {
    dispatch({ type: 'CLOSE_ALL_MODALS' });
  }, []);

  const queueModal = useCallback((config: ModalConfig) => {
    if (!config.id) {
      config.id = `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    dispatch({ type: 'QUEUE_MODAL', payload: config });
  }, []);

  const processQueue = useCallback(() => {
    dispatch({ type: 'PROCESS_QUEUE' });
  }, []);

  const setFocus = useCallback((id: string) => {
    dispatch({ type: 'SET_FOCUS', payload: id });
  }, []);

  const openModalFromResponse = useCallback((
    response: AIContentResponseV2,
    options?: Partial<ModalConfig>
  ) => {
    const config: ModalConfig = {
      id: response.contentId,
      response,
      closeOnBackdrop: true,
      closeOnEscape: true,
      ...options
    };
    
    openModal(config);
  }, [openModal]);

  const value: ModalContextValue = {
    state,
    dispatch,
    openModal,
    closeModal,
    closeAllModals,
    queueModal,
    processQueue,
    setFocus,
    openModalFromResponse
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};

// Hook to use modal state
export function useModalState() {
  const context = useContext(ModalContext);
  
  if (!context) {
    throw new Error('useModalState must be used within a ModalProvider');
  }
  
  return {
    activeModals: context.state.activeModals,
    modalQueue: context.state.modalQueue,
    currentFocus: context.state.currentFocus,
    history: context.state.history,
    isLoading: context.state.isLoading,
    error: context.state.error,
    openModal: context.openModal,
    closeModal: context.closeModal,
    closeAllModals: context.closeAllModals,
    queueModal: context.queueModal,
    processQueue: context.processQueue,
    setFocus: context.setFocus,
    openModalFromResponse: context.openModalFromResponse
  };
}

// Hook to open modal from AI response
export function useModalFactory() {
  const { openModalFromResponse, queueModal } = useModalState();
  
  return {
    openModal: openModalFromResponse,
    queueModal: (response: AIContentResponseV2, options?: Partial<ModalConfig>) => {
      const config: ModalConfig = {
        id: response.contentId,
        response,
        ...options
      };
      queueModal(config);
    }
  };
}

// Hook for modal analytics
export function useModalAnalytics() {
  const { history, activeModals } = useModalState();
  
  const trackModalOpen = useCallback((modalId: string, modalType: ModalTypeEnum) => {
    if (window.analytics) {
      window.analytics.track('modal_opened', {
        modalId,
        modalType,
        timestamp: new Date().toISOString()
      });
    }
  }, []);
  
  const trackModalClose = useCallback((modalId: string, duration: number) => {
    if (window.analytics) {
      window.analytics.track('modal_closed', {
        modalId,
        duration,
        timestamp: new Date().toISOString()
      });
    }
  }, []);
  
  const getModalMetrics = useCallback(() => {
    return {
      totalOpened: history.length,
      currentlyOpen: activeModals.size,
      averageOpenTime: calculateAverageOpenTime(history)
    };
  }, [history, activeModals]);
  
  return {
    trackModalOpen,
    trackModalClose,
    getModalMetrics
  };
}

// Helper function to calculate average open time
function calculateAverageOpenTime(history: string[]): number {
  // This would need actual timing data stored with each modal
  // For now, return a placeholder
  return 0;
}

// Type augmentation for window
declare global {
  interface Window {
    analytics: any;
  }
}