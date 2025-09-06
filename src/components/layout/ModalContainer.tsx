/**
 * Modal Container Component
 * Central mounting point for all modals in the application
 */

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useModalState } from '../../state/modalState';
import { modalFactory } from '../../frontend/modal-factory';
import { AIContentResponseV2 } from '../../ai-engine/types';
import './ModalContainer.css';

export interface ModalContainerProps {
  maxModals?: number;
  allowMultiple?: boolean;
  enableQueue?: boolean;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  maxModals = 1,
  allowMultiple = false,
  enableQueue = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const {
    activeModals,
    modalQueue,
    currentFocus,
    openModal,
    closeModal,
    processQueue
  } = useModalState();

  // Create portal root on mount
  useEffect(() => {
    let root = document.getElementById('modal-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'modal-root';
      root.className = 'modal-root';
      document.body.appendChild(root);
    }
    setPortalRoot(root);

    return () => {
      // Cleanup on unmount
      if (root && root.childNodes.length === 0) {
        root.remove();
      }
    };
  }, []);

  // Process queue when modal closes
  useEffect(() => {
    if (enableQueue && activeModals.size < maxModals && modalQueue.length > 0) {
      processQueue();
    }
  }, [activeModals.size, modalQueue.length, enableQueue, maxModals, processQueue]);

  // Handle ESC key globally
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeModals.size > 0) {
        const lastModal = Array.from(activeModals.keys()).pop();
        if (lastModal) {
          closeModal(lastModal);
        }
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [activeModals, closeModal]);

  // Handle focus management
  useEffect(() => {
    if (currentFocus && containerRef.current) {
      const focusElement = containerRef.current.querySelector(
        `[data-modal-id="${currentFocus}"]`
      ) as HTMLElement;
      
      if (focusElement) {
        const firstFocusable = focusElement.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        ) as HTMLElement;
        
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }
  }, [currentFocus]);

  // Create modal elements
  const renderModals = () => {
    if (!portalRoot) return null;

    const modals = Array.from(activeModals.entries()).map(([id, config], index) => {
      const isActive = index === activeModals.size - 1;
      
      return (
        <div
          key={id}
          data-modal-id={id}
          className={`modal-wrapper ${isActive ? 'active' : 'inactive'}`}
          style={{
            zIndex: 1000 + index
          }}
        >
          {/* Backdrop */}
          {(index === 0 || !allowMultiple) && (
            <div
              className="modal-backdrop"
              onClick={() => config.closeOnBackdrop !== false && closeModal(id)}
              aria-hidden="true"
            />
          )}
          
          {/* Modal Content */}
          <div
            className="modal-content-wrapper"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`modal-${id}-title`}
          >
            <ModalRenderer
              response={config.response}
              onClose={() => closeModal(id)}
              isActive={isActive}
            />
          </div>
        </div>
      );
    });

    return createPortal(modals, portalRoot);
  };

  // Show queue indicator
  const renderQueueIndicator = () => {
    if (!enableQueue || modalQueue.length === 0) return null;

    return (
      <div className="modal-queue-indicator">
        <span className="queue-count">{modalQueue.length}</span>
        <span className="queue-label">modals queued</span>
      </div>
    );
  };

  return (
    <>
      <div ref={containerRef} className="modal-container" />
      {renderModals()}
      {renderQueueIndicator()}
    </>
  );
};

/**
 * Modal Renderer Component
 * Renders individual modal using the modal factory
 */
interface ModalRendererProps {
  response: AIContentResponseV2;
  onClose: () => void;
  isActive: boolean;
}

const ModalRenderer: React.FC<ModalRendererProps> = ({
  response,
  onClose,
  isActive
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!modalRef.current) return;

    try {
      setIsLoading(true);
      setError(null);

      // Create modal using factory
      const modalElement = modalFactory.createModal(response);
      
      // Clear container and append new modal
      modalRef.current.innerHTML = '';
      modalRef.current.appendChild(modalElement);

      // Add close handler
      const closeBtn = modalElement.querySelector('.modal-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', onClose);
      }

      // Add submit handler
      const submitBtn = modalElement.querySelector('[data-action="submit"]');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          // Collect and submit data
          const modalId = response.contentId;
          const data = collectModalData(modalElement, response.modalType);
          submitModalData(modalId, data);
          onClose();
        });
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error rendering modal:', err);
      setError(err instanceof Error ? err.message : 'Failed to render modal');
      setIsLoading(false);
    }

    // Cleanup
    return () => {
      if (modalRef.current) {
        modalRef.current.innerHTML = '';
      }
    };
  }, [response, onClose]);

  // Apply active/inactive states
  useEffect(() => {
    if (modalRef.current) {
      const modal = modalRef.current.querySelector('.pathfinity-modal');
      if (modal) {
        if (isActive) {
          modal.classList.add('modal-active');
          modal.classList.remove('modal-inactive');
        } else {
          modal.classList.add('modal-inactive');
          modal.classList.remove('modal-active');
        }
      }
    }
  }, [isActive]);

  if (isLoading) {
    return (
      <div className="modal-loading">
        <div className="loading-spinner" />
        <p>Loading content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modal-error">
        <h3>Error Loading Content</h3>
        <p>{error}</p>
        <button onClick={onClose} className="btn btn-primary">
          Close
        </button>
      </div>
    );
  }

  return <div ref={modalRef} className="modal-renderer" />;
};

/**
 * Helper function to collect modal data
 */
function collectModalData(modalElement: HTMLElement, modalType: string): any {
  const data: any = {};

  // Collect based on modal type
  switch (modalType) {
    case 'SingleSelectModal':
      const selected = modalElement.querySelector('input[type="radio"]:checked') as HTMLInputElement;
      data.selection = selected?.value;
      break;

    case 'MultiSelectModal':
      const selections = modalElement.querySelectorAll('input[type="checkbox"]:checked');
      data.selections = Array.from(selections).map((cb: any) => cb.value);
      break;

    case 'ShortAnswerModal':
    case 'EssayModal':
      const textarea = modalElement.querySelector('textarea') as HTMLTextAreaElement;
      data.answer = textarea?.value;
      break;

    case 'FillBlankModal':
      const blanks = modalElement.querySelectorAll('.fill-blank-input');
      data.answers = Array.from(blanks).map((input: any) => input.value);
      break;

    default:
      // Collect all form data
      const formData = new FormData(modalElement.querySelector('form') as HTMLFormElement);
      formData.forEach((value, key) => {
        data[key] = value;
      });
  }

  return data;
}

/**
 * Helper function to submit modal data
 */
async function submitModalData(modalId: string, data: any): Promise<void> {
  try {
    const response = await fetch('/api/modal/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        modalId,
        data,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to submit modal data');
    }

    // Track analytics
    if (window.analytics) {
      window.analytics.track('modal_submitted', {
        modalId,
        success: true
      });
    }
  } catch (error) {
    console.error('Error submitting modal data:', error);
    
    // Track error
    if (window.analytics) {
      window.analytics.track('modal_submit_error', {
        modalId,
        error: error.message
      });
    }
  }
}

// Type augmentation for window
declare global {
  interface Window {
    analytics: any;
  }
}

export default ModalContainer;