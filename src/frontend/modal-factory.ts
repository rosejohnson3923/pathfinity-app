/**
 * Frontend Modal Factory
 * Consumes v2.0 AI response format and renders appropriate modals
 */

import { 
  AIContentResponseV2,
  ModalTypeEnum,
  DimensionalHints,
  UICompliance,
  ValidationRules,
  ResponsiveBreakpoint
} from '../ai-engine/types';

export interface ModalConfig {
  id: string;
  type: ModalTypeEnum;
  dimensions: DimensionalHints;
  uiCompliance: UICompliance;
  validation: ValidationRules;
  content: any;
  container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
}

export class ModalFactory {
  private activeModals: Map<string, ModalConfig> = new Map();
  private modalContainer: HTMLElement | null = null;
  private currentBreakpoint: string = 'md';
  
  constructor(containerId: string = 'modal-container') {
    this.modalContainer = document.getElementById(containerId);
    this.setupResponsiveListener();
    this.setupAccessibilityHandlers();
  }

  /**
   * Create modal from v2.0 AI response
   */
  public createModal(response: AIContentResponseV2): HTMLElement {
    const config: ModalConfig = {
      id: response.contentId,
      type: response.modalType,
      dimensions: response.dimensions,
      uiCompliance: response.uiCompliance,
      validation: response.content.validation,
      content: response.content.data,
      container: response.uiCompliance.container
    };

    // Store config for later reference
    this.activeModals.set(config.id, config);

    // Create modal based on type
    const modal = this.buildModal(config);
    
    // Apply dimensions
    this.applyDimensions(modal, config.dimensions);
    
    // Apply UI compliance theming
    this.applyUICompliance(modal, config.uiCompliance);
    
    // Setup validation
    this.setupValidation(modal, config.validation, config.type);
    
    // Handle overflow if predicted
    if (config.dimensions.overflow.predicted) {
      this.handleOverflow(modal, config.dimensions.overflow);
    }
    
    return modal;
  }

  /**
   * Build modal structure based on type
   */
  private buildModal(config: ModalConfig): HTMLElement {
    const modal = document.createElement('div');
    modal.className = 'pathfinity-modal';
    modal.id = config.id;
    modal.setAttribute('data-modal-type', config.type);
    modal.setAttribute('data-container', config.container);
    
    // Add ARIA attributes
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-labelledby', `${config.id}-title`);
    modal.setAttribute('aria-describedby', `${config.id}-content`);
    
    // Create modal structure
    modal.innerHTML = `
      <div class="modal-header">
        <h2 id="${config.id}-title" class="modal-title"></h2>
        <button class="modal-close" aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
      <div id="${config.id}-content" class="modal-content">
        ${this.renderModalContent(config)}
      </div>
      <div class="modal-footer">
        ${this.renderModalFooter(config)}
      </div>
    `;
    
    // Add event listeners
    this.attachModalEventListeners(modal, config);
    
    return modal;
  }

  /**
   * Render modal content based on type
   */
  private renderModalContent(config: ModalConfig): string {
    switch (config.type) {
      case ModalTypeEnum.FILL_BLANK:
        return this.renderFillBlankContent(config.content);
        
      case ModalTypeEnum.SINGLE_SELECT:
        return this.renderSingleSelectContent(config.content);
        
      case ModalTypeEnum.MULTI_SELECT:
        return this.renderMultiSelectContent(config.content);
        
      case ModalTypeEnum.SHORT_ANSWER:
        return this.renderShortAnswerContent(config.content);
        
      case ModalTypeEnum.ESSAY:
        return this.renderEssayContent(config.content);
        
      case ModalTypeEnum.DRAG_DROP:
        return this.renderDragDropContent(config.content);
        
      case ModalTypeEnum.CODE_EDITOR:
        return this.renderCodeEditorContent(config.content);
        
      case ModalTypeEnum.MATH_INPUT:
        return this.renderMathInputContent(config.content);
        
      case ModalTypeEnum.GRAPH_CHART:
        return this.renderGraphChartContent(config.content);
        
      case ModalTypeEnum.DRAWING:
        return this.renderDrawingContent(config.content);
        
      default:
        return this.renderDefaultContent(config.content);
    }
  }

  /**
   * Render fill-in-blank content
   */
  private renderFillBlankContent(content: any): string {
    let html = '<div class="fill-blank-container">';
    
    if (content.text) {
      // Replace blanks with input fields
      let processedText = content.text;
      if (content.blanks) {
        content.blanks.forEach((blank: any, index: number) => {
          const input = `<input type="text" 
            class="fill-blank-input" 
            data-blank-index="${index}"
            aria-label="Blank ${index + 1}"
            placeholder="___">`;
          processedText = processedText.replace('___', input);
        });
      }
      html += `<p class="fill-blank-text">${processedText}</p>`;
    }
    
    // Add word bank if present
    if (content.wordBank) {
      html += '<div class="word-bank">';
      html += '<h3>Word Bank</h3>';
      html += '<div class="word-bank-items">';
      content.wordBank.forEach((word: string) => {
        html += `<span class="word-bank-item" draggable="true">${word}</span>`;
      });
      html += '</div></div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render single select content
   */
  private renderSingleSelectContent(content: any): string {
    let html = '<div class="single-select-container">';
    
    if (content.question) {
      html += `<p class="question-text">${content.question}</p>`;
    }
    
    if (content.options) {
      html += '<div class="options-container" role="radiogroup">';
      content.options.forEach((option: any, index: number) => {
        const optionId = `option-${Date.now()}-${index}`;
        html += `
          <label class="option-item" for="${optionId}">
            <input type="radio" 
              id="${optionId}"
              name="single-select-${content.id || 'default'}" 
              value="${option.id}"
              class="option-input">
            <span class="option-content">
              ${option.image ? `<img src="${option.image}" alt="${option.content}" class="option-image">` : ''}
              <span class="option-text">${option.content}</span>
            </span>
          </label>
        `;
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render multi select content
   */
  private renderMultiSelectContent(content: any): string {
    let html = '<div class="multi-select-container">';
    
    if (content.question) {
      html += `<p class="question-text">${content.question}</p>`;
    }
    
    if (content.instruction) {
      html += `<p class="instruction-text">${content.instruction}</p>`;
    }
    
    if (content.options) {
      html += '<div class="options-container" role="group">';
      content.options.forEach((option: any, index: number) => {
        const optionId = `option-${Date.now()}-${index}`;
        html += `
          <label class="option-item" for="${optionId}">
            <input type="checkbox" 
              id="${optionId}"
              value="${option.id}"
              class="option-input">
            <span class="option-content">
              ${option.image ? `<img src="${option.image}" alt="${option.content}" class="option-image">` : ''}
              <span class="option-text">${option.content}</span>
            </span>
          </label>
        `;
      });
      html += '</div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render short answer content
   */
  private renderShortAnswerContent(content: any): string {
    return `
      <div class="short-answer-container">
        ${content.prompt ? `<p class="prompt-text">${content.prompt}</p>` : ''}
        <textarea 
          class="short-answer-input"
          placeholder="Type your answer here..."
          rows="4"
          aria-label="Short answer input"
          data-min-words="${content.minWords || 1}"
          data-max-words="${content.maxWords || 50}">
        </textarea>
        <div class="answer-meta">
          <span class="word-count">0 words</span>
          ${content.expectedWords ? `<span class="expected">Expected: ${content.expectedWords} words</span>` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Render essay content
   */
  private renderEssayContent(content: any): string {
    return `
      <div class="essay-container">
        ${content.prompt ? `<p class="prompt-text">${content.prompt}</p>` : ''}
        ${content.rubric ? this.renderRubric(content.rubric) : ''}
        <textarea 
          class="essay-input"
          placeholder="Write your essay here..."
          rows="12"
          aria-label="Essay input"
          data-min-words="${content.minWords || 50}"
          data-max-words="${content.maxWords || 1000}">
        </textarea>
        <div class="essay-meta">
          <span class="word-count">0 words</span>
          <span class="paragraph-count">0 paragraphs</span>
          ${content.expectedWords ? `<span class="expected">Expected: ${content.expectedWords} words</span>` : ''}
        </div>
        ${content.sentenceStarters ? this.renderSentenceStarters(content.sentenceStarters) : ''}
      </div>
    `;
  }

  /**
   * Render drag and drop content
   */
  private renderDragDropContent(content: any): string {
    let html = '<div class="drag-drop-container">';
    
    if (content.instruction) {
      html += `<p class="instruction-text">${content.instruction}</p>`;
    }
    
    // Render source items
    if (content.sources) {
      html += '<div class="drag-sources">';
      html += '<h3>Items</h3>';
      html += '<div class="source-items">';
      content.sources.forEach((item: any) => {
        html += `
          <div class="drag-item" 
            draggable="true" 
            data-item-id="${item.id}"
            aria-label="Draggable item: ${item.content}">
            ${item.image ? `<img src="${item.image}" alt="${item.content}">` : ''}
            <span>${item.content}</span>
          </div>
        `;
      });
      html += '</div></div>';
    }
    
    // Render drop targets
    if (content.targets) {
      html += '<div class="drop-targets">';
      html += '<h3>Drop Zones</h3>';
      html += '<div class="target-zones">';
      content.targets.forEach((target: any) => {
        html += `
          <div class="drop-zone" 
            data-target-id="${target.id}"
            aria-label="Drop zone: ${target.label}">
            <span class="zone-label">${target.label}</span>
            <div class="dropped-items"></div>
          </div>
        `;
      });
      html += '</div></div>';
    }
    
    html += '</div>';
    return html;
  }

  /**
   * Render code editor content
   */
  private renderCodeEditorContent(content: any): string {
    const editorId = `editor-${Date.now()}`;
    return `
      <div class="code-editor-container">
        ${content.problem ? `<div class="problem-statement">${content.problem}</div>` : ''}
        <div class="editor-wrapper">
          <div class="editor-header">
            <span class="language-label">${content.language || 'JavaScript'}</span>
            <button class="run-code-btn">Run Code</button>
          </div>
          <div id="${editorId}" class="code-editor" data-language="${content.language || 'javascript'}">
            <pre><code>${content.starterCode || '// Write your code here'}</code></pre>
          </div>
        </div>
        ${content.testCases ? this.renderTestCases(content.testCases) : ''}
        <div class="output-panel">
          <h4>Output</h4>
          <pre class="code-output"></pre>
        </div>
      </div>
    `;
  }

  /**
   * Render math input content
   */
  private renderMathInputContent(content: any): string {
    return `
      <div class="math-input-container">
        ${content.problem ? `<div class="math-problem">${content.problem}</div>` : ''}
        <div class="math-editor">
          <input type="text" 
            class="math-input" 
            placeholder="Enter mathematical expression"
            aria-label="Math expression input">
          <div class="math-preview"></div>
        </div>
        <div class="math-toolbar">
          <button data-insert="^">x²</button>
          <button data-insert="√">√</button>
          <button data-insert="π">π</button>
          <button data-insert="∫">∫</button>
          <button data-insert="Σ">Σ</button>
          <button data-insert="±">±</button>
          <button data-insert="÷">÷</button>
          <button data-insert="×">×</button>
        </div>
      </div>
    `;
  }

  /**
   * Render graph/chart content
   */
  private renderGraphChartContent(content: any): string {
    const canvasId = `graph-${Date.now()}`;
    return `
      <div class="graph-chart-container">
        ${content.instruction ? `<p class="instruction-text">${content.instruction}</p>` : ''}
        <canvas id="${canvasId}" class="graph-canvas"></canvas>
        <div class="graph-controls">
          <button class="zoom-in">Zoom In</button>
          <button class="zoom-out">Zoom Out</button>
          <button class="reset-view">Reset</button>
        </div>
        ${content.data ? `<script>window.graphData['${canvasId}'] = ${JSON.stringify(content.data)}</script>` : ''}
      </div>
    `;
  }

  /**
   * Render drawing content
   */
  private renderDrawingContent(content: any): string {
    const canvasId = `drawing-${Date.now()}`;
    return `
      <div class="drawing-container">
        ${content.instruction ? `<p class="instruction-text">${content.instruction}</p>` : ''}
        <div class="drawing-toolbar">
          <button class="tool-pen active" data-tool="pen">Pen</button>
          <button class="tool-eraser" data-tool="eraser">Eraser</button>
          <button class="tool-line" data-tool="line">Line</button>
          <button class="tool-circle" data-tool="circle">Circle</button>
          <button class="tool-rect" data-tool="rect">Rectangle</button>
          <input type="color" class="color-picker" value="#000000">
          <input type="range" class="brush-size" min="1" max="20" value="3">
          <button class="clear-canvas">Clear</button>
        </div>
        <canvas id="${canvasId}" class="drawing-canvas"></canvas>
      </div>
    `;
  }

  /**
   * Render default content
   */
  private renderDefaultContent(content: any): string {
    return `
      <div class="default-content">
        ${content.question ? `<p class="question-text">${content.question}</p>` : ''}
        ${content.content ? `<div class="content-body">${content.content}</div>` : ''}
      </div>
    `;
  }

  /**
   * Render modal footer
   */
  private renderModalFooter(config: ModalConfig): string {
    return `
      <button class="btn btn-secondary" data-action="skip">Skip</button>
      <button class="btn btn-primary" data-action="submit">Submit</button>
    `;
  }

  /**
   * Apply dimensions from AI response
   */
  private applyDimensions(modal: HTMLElement, dimensions: DimensionalHints): void {
    const recommended = dimensions.recommended;
    
    // Apply base dimensions
    modal.style.width = typeof recommended.width === 'number' 
      ? `${recommended.width}px` 
      : recommended.width;
    
    modal.style.height = typeof recommended.height === 'number'
      ? `${recommended.height}px`
      : recommended.height;
    
    // Apply constraints
    if (dimensions.constraints) {
      modal.style.minWidth = `${dimensions.constraints.minWidth}px`;
      modal.style.maxWidth = typeof dimensions.constraints.maxWidth === 'number'
        ? `${dimensions.constraints.maxWidth}px`
        : dimensions.constraints.maxWidth;
      
      modal.style.minHeight = `${dimensions.constraints.minHeight}px`;
      modal.style.maxHeight = typeof dimensions.constraints.maxHeight === 'number'
        ? `${dimensions.constraints.maxHeight}px`
        : dimensions.constraints.maxHeight;
    }
    
    // Store responsive breakpoints for later use
    modal.dataset.breakpoints = JSON.stringify(dimensions.responsive.breakpoints);
  }

  /**
   * Apply UI compliance theming
   */
  private applyUICompliance(modal: HTMLElement, compliance: UICompliance): void {
    // Apply color scheme
    const theme = compliance.theme.colorScheme;
    if (theme) {
      modal.style.setProperty('--primary-color', theme.primary);
      modal.style.setProperty('--secondary-color', theme.secondary);
      modal.style.setProperty('--accent-color', theme.accent);
      modal.style.setProperty('--bg-color', theme.background);
      modal.style.setProperty('--text-color', theme.text);
    }
    
    // Apply typography
    const typography = compliance.typography;
    modal.style.setProperty('--base-font-size', `${typography.baseSize}px`);
    modal.style.setProperty('--line-height', `${typography.lineHeight}`);
    
    // Apply container-specific gradient
    if (compliance.branding.containerSpecific?.gradient) {
      modal.style.setProperty('--container-gradient', compliance.branding.containerSpecific.gradient);
    }
    
    // Apply accessibility settings
    if (compliance.accessibility.touchOptimized) {
      modal.classList.add('touch-optimized');
    }
    
    if (compliance.accessibility.screenReaderReady) {
      this.enhanceScreenReaderSupport(modal);
    }
  }

  /**
   * Setup validation for modal
   */
  private setupValidation(
    modal: HTMLElement, 
    validation: ValidationRules,
    modalType: ModalTypeEnum
  ): void {
    const form = modal.querySelector('form') || modal;
    
    // Add validation attributes
    form.setAttribute('data-validation', 'true');
    form.setAttribute('data-strict-mode', String(validation.strictMode || false));
    
    // Setup real-time validation for text inputs
    const textInputs = modal.querySelectorAll('input[type="text"], textarea');
    textInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input as HTMLInputElement, validation));
      
      // Add word count for textareas
      if (input.tagName === 'TEXTAREA') {
        input.addEventListener('input', () => this.updateWordCount(input as HTMLTextAreaElement));
      }
    });
    
    // Setup validation for selections
    const radioInputs = modal.querySelectorAll('input[type="radio"]');
    const checkboxInputs = modal.querySelectorAll('input[type="checkbox"]');
    
    radioInputs.forEach(input => {
      input.addEventListener('change', () => this.validateSelection(modal, validation));
    });
    
    checkboxInputs.forEach(input => {
      input.addEventListener('change', () => this.validateMultiSelection(modal, validation));
    });
  }

  /**
   * Handle overflow strategies
   */
  private handleOverflow(modal: HTMLElement, overflow: any): void {
    const content = modal.querySelector('.modal-content');
    if (!content) return;
    
    switch (overflow.strategy) {
      case 'scroll':
        content.classList.add('scrollable');
        content.style.overflowY = 'auto';
        content.style.maxHeight = '70vh';
        break;
        
      case 'paginate':
        this.setupPagination(modal, overflow.threshold);
        break;
        
      case 'accordion':
        this.setupAccordion(modal);
        break;
        
      case 'tabs':
        this.setupTabs(modal);
        break;
        
      case 'horizontal-scroll':
        content.style.overflowX = 'auto';
        content.classList.add('horizontal-scroll');
        break;
    }
  }

  /**
   * Setup pagination for overflow content
   */
  private setupPagination(modal: HTMLElement, threshold: any): void {
    const content = modal.querySelector('.modal-content');
    if (!content) return;
    
    const itemsPerPage = threshold.itemsPerPage || 5;
    const items = content.querySelectorAll('.option-item, .drag-item');
    
    if (items.length <= itemsPerPage) return;
    
    // Create pagination wrapper
    const paginationWrapper = document.createElement('div');
    paginationWrapper.className = 'pagination-wrapper';
    
    // Create pages
    const pages: HTMLElement[] = [];
    let currentPage = document.createElement('div');
    currentPage.className = 'page active';
    
    items.forEach((item, index) => {
      if (index > 0 && index % itemsPerPage === 0) {
        pages.push(currentPage);
        currentPage = document.createElement('div');
        currentPage.className = 'page';
      }
      currentPage.appendChild(item);
    });
    
    if (currentPage.children.length > 0) {
      pages.push(currentPage);
    }
    
    // Add pages to wrapper
    pages.forEach(page => paginationWrapper.appendChild(page));
    
    // Create pagination controls
    const controls = document.createElement('div');
    controls.className = 'pagination-controls';
    controls.innerHTML = `
      <button class="prev-page" disabled>Previous</button>
      <span class="page-indicator">Page 1 of ${pages.length}</span>
      <button class="next-page">Next</button>
    `;
    
    // Replace content
    content.innerHTML = '';
    content.appendChild(paginationWrapper);
    content.appendChild(controls);
    
    // Setup pagination events
    this.setupPaginationEvents(modal, pages.length);
  }

  /**
   * Setup accordion for overflow content
   */
  private setupAccordion(modal: HTMLElement): void {
    const sections = modal.querySelectorAll('.content-section');
    
    sections.forEach((section, index) => {
      const header = document.createElement('button');
      header.className = 'accordion-header';
      header.textContent = section.getAttribute('data-title') || `Section ${index + 1}`;
      header.setAttribute('aria-expanded', index === 0 ? 'true' : 'false');
      
      const content = document.createElement('div');
      content.className = `accordion-content ${index === 0 ? 'active' : ''}`;
      content.appendChild(section);
      
      header.addEventListener('click', () => {
        const isActive = content.classList.contains('active');
        
        // Close all sections
        modal.querySelectorAll('.accordion-content').forEach(c => {
          c.classList.remove('active');
        });
        modal.querySelectorAll('.accordion-header').forEach(h => {
          h.setAttribute('aria-expanded', 'false');
        });
        
        // Open clicked section
        if (!isActive) {
          content.classList.add('active');
          header.setAttribute('aria-expanded', 'true');
        }
      });
      
      section.parentElement?.insertBefore(header, section);
      section.parentElement?.insertBefore(content, section.nextSibling);
    });
  }

  /**
   * Setup tabs for overflow content
   */
  private setupTabs(modal: HTMLElement): void {
    // Implementation for tab-based overflow
    console.log('Tab overflow not yet implemented');
  }

  /**
   * Attach event listeners to modal
   */
  private attachModalEventListeners(modal: HTMLElement, config: ModalConfig): void {
    // Close button
    const closeBtn = modal.querySelector('.modal-close');
    closeBtn?.addEventListener('click', () => this.closeModal(config.id));
    
    // Submit button
    const submitBtn = modal.querySelector('[data-action="submit"]');
    submitBtn?.addEventListener('click', () => this.submitModal(config.id));
    
    // Skip button
    const skipBtn = modal.querySelector('[data-action="skip"]');
    skipBtn?.addEventListener('click', () => this.skipModal(config.id));
    
    // ESC key to close
    modal.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closeModal(config.id);
      }
    });
  }

  /**
   * Setup responsive listener
   */
  private setupResponsiveListener(): void {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      
      if (width < 480) {
        this.currentBreakpoint = 'xs';
      } else if (width < 768) {
        this.currentBreakpoint = 'sm';
      } else if (width < 1024) {
        this.currentBreakpoint = 'md';
      } else if (width < 1280) {
        this.currentBreakpoint = 'lg';
      } else {
        this.currentBreakpoint = 'xl';
      }
      
      this.updateModalDimensions();
    };
    
    window.addEventListener('resize', checkBreakpoint);
    checkBreakpoint();
  }

  /**
   * Update modal dimensions based on breakpoint
   */
  private updateModalDimensions(): void {
    this.activeModals.forEach((config, id) => {
      const modal = document.getElementById(id);
      if (!modal) return;
      
      const breakpoints = JSON.parse(modal.dataset.breakpoints || '[]');
      const currentBreakpointConfig = breakpoints.find(
        (b: ResponsiveBreakpoint) => b.breakpoint === this.currentBreakpoint
      );
      
      if (currentBreakpointConfig) {
        modal.style.width = typeof currentBreakpointConfig.dimensions.width === 'number'
          ? `${currentBreakpointConfig.dimensions.width}px`
          : currentBreakpointConfig.dimensions.width;
        
        modal.style.height = typeof currentBreakpointConfig.dimensions.height === 'number'
          ? `${currentBreakpointConfig.dimensions.height}px`
          : currentBreakpointConfig.dimensions.height;
      }
    });
  }

  /**
   * Setup accessibility handlers
   */
  private setupAccessibilityHandlers(): void {
    // Focus trap for modals
    document.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Tab' && this.activeModals.size > 0) {
        const activeModal = document.querySelector('.pathfinity-modal:last-child') as HTMLElement;
        if (activeModal) {
          this.trapFocus(activeModal, e);
        }
      }
    });
  }

  /**
   * Trap focus within modal
   */
  private trapFocus(modal: HTMLElement, event: KeyboardEvent): void {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey && document.activeElement === firstFocusable) {
      lastFocusable.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastFocusable) {
      firstFocusable.focus();
      event.preventDefault();
    }
  }

  /**
   * Enhance screen reader support
   */
  private enhanceScreenReaderSupport(modal: HTMLElement): void {
    // Add live region for updates
    const liveRegion = document.createElement('div');
    liveRegion.className = 'sr-only';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    modal.appendChild(liveRegion);
    
    // Add skip links
    const skipLink = document.createElement('a');
    skipLink.className = 'sr-only skip-link';
    skipLink.href = '#modal-footer';
    skipLink.textContent = 'Skip to modal actions';
    modal.insertBefore(skipLink, modal.firstChild);
  }

  /**
   * Validate field
   */
  private validateField(input: HTMLInputElement, validation: ValidationRules): void {
    // Implementation would use validation engine
    const value = input.value;
    const fieldName = input.name || input.id;
    
    // Show validation feedback
    const feedback = input.parentElement?.querySelector('.validation-feedback') ||
      document.createElement('div');
    feedback.className = 'validation-feedback';
    
    if (!value && validation.required) {
      feedback.textContent = validation.errorMessages[`required_${fieldName}`] || 'This field is required';
      feedback.classList.add('error');
      input.classList.add('invalid');
    } else {
      feedback.textContent = '';
      input.classList.remove('invalid');
    }
    
    if (!input.parentElement?.querySelector('.validation-feedback')) {
      input.parentElement?.appendChild(feedback);
    }
  }

  /**
   * Validate selection
   */
  private validateSelection(modal: HTMLElement, validation: ValidationRules): void {
    const selected = modal.querySelector('input[type="radio"]:checked');
    const feedback = modal.querySelector('.selection-feedback');
    
    if (!selected && validation.required) {
      if (feedback) {
        feedback.textContent = 'Please select an option';
        feedback.classList.add('error');
      }
    } else if (feedback) {
      feedback.textContent = '';
      feedback.classList.remove('error');
    }
  }

  /**
   * Validate multi-selection
   */
  private validateMultiSelection(modal: HTMLElement, validation: ValidationRules): void {
    const selected = modal.querySelectorAll('input[type="checkbox"]:checked');
    const feedback = modal.querySelector('.selection-feedback');
    
    // Check for minimum selection
    const minCount = validation.validators?.find(v => v.type === 'minCount')?.value || 1;
    
    if (selected.length < minCount && validation.required) {
      if (feedback) {
        feedback.textContent = `Please select at least ${minCount} option(s)`;
        feedback.classList.add('error');
      }
    } else if (feedback) {
      feedback.textContent = '';
      feedback.classList.remove('error');
    }
  }

  /**
   * Update word count for textareas
   */
  private updateWordCount(textarea: HTMLTextAreaElement): void {
    const words = textarea.value.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    
    const counter = textarea.parentElement?.querySelector('.word-count');
    if (counter) {
      counter.textContent = `${wordCount} words`;
      
      // Check limits
      const minWords = parseInt(textarea.dataset.minWords || '0');
      const maxWords = parseInt(textarea.dataset.maxWords || '999999');
      
      if (wordCount < minWords) {
        counter.classList.add('below-min');
        counter.classList.remove('above-max');
      } else if (wordCount > maxWords) {
        counter.classList.add('above-max');
        counter.classList.remove('below-min');
      } else {
        counter.classList.remove('below-min', 'above-max');
      }
    }
    
    // Update paragraph count for essays
    if (textarea.classList.contains('essay-input')) {
      const paragraphs = textarea.value.split(/\n\n+/).filter(p => p.trim().length > 0);
      const paragraphCounter = textarea.parentElement?.querySelector('.paragraph-count');
      if (paragraphCounter) {
        paragraphCounter.textContent = `${paragraphs.length} paragraphs`;
      }
    }
  }

  /**
   * Setup pagination events
   */
  private setupPaginationEvents(modal: HTMLElement, totalPages: number): void {
    let currentPage = 1;
    const pages = modal.querySelectorAll('.page');
    const prevBtn = modal.querySelector('.prev-page') as HTMLButtonElement;
    const nextBtn = modal.querySelector('.next-page') as HTMLButtonElement;
    const indicator = modal.querySelector('.page-indicator');
    
    const updatePagination = () => {
      pages.forEach((page, index) => {
        if (index === currentPage - 1) {
          page.classList.add('active');
        } else {
          page.classList.remove('active');
        }
      });
      
      if (prevBtn) prevBtn.disabled = currentPage === 1;
      if (nextBtn) nextBtn.disabled = currentPage === totalPages;
      if (indicator) indicator.textContent = `Page ${currentPage} of ${totalPages}`;
    };
    
    prevBtn?.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
      }
    });
    
    nextBtn?.addEventListener('click', () => {
      if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
      }
    });
  }

  /**
   * Helper methods for rendering components
   */
  private renderRubric(rubric: any): string {
    let html = '<div class="rubric">';
    html += '<h4>Rubric</h4>';
    html += '<ul>';
    rubric.criteria?.forEach((criterion: any) => {
      html += `<li>${criterion.name}: ${criterion.description} (${criterion.points} points)</li>`;
    });
    html += '</ul>';
    html += '</div>';
    return html;
  }

  private renderSentenceStarters(starters: string[]): string {
    let html = '<div class="sentence-starters">';
    html += '<h4>Sentence Starters</h4>';
    html += '<ul>';
    starters.forEach((starter: string) => {
      html += `<li>${starter}</li>`;
    });
    html += '</ul>';
    html += '</div>';
    return html;
  }

  private renderTestCases(testCases: any[]): string {
    let html = '<div class="test-cases">';
    html += '<h4>Test Cases</h4>';
    html += '<ul>';
    testCases.forEach((test: any, index: number) => {
      html += `
        <li class="test-case" data-test-id="${index}">
          <span class="test-status pending">⏳</span>
          Input: ${JSON.stringify(test.input)} → Expected: ${JSON.stringify(test.expectedOutput)}
        </li>
      `;
    });
    html += '</ul>';
    html += '</div>';
    return html;
  }

  /**
   * Modal actions
   */
  private closeModal(modalId: string): void {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
      this.activeModals.delete(modalId);
    }
  }

  private submitModal(modalId: string): void {
    const config = this.activeModals.get(modalId);
    if (!config) return;
    
    // Collect response data based on modal type
    const responseData = this.collectResponseData(modalId, config.type);
    
    // Validate response
    // This would integrate with validation engine
    
    // Submit response
    this.submitResponse(modalId, responseData);
  }

  private skipModal(modalId: string): void {
    // Handle skip action
    this.closeModal(modalId);
  }

  private collectResponseData(modalId: string, type: ModalTypeEnum): any {
    const modal = document.getElementById(modalId);
    if (!modal) return null;
    
    const data: any = {};
    
    switch (type) {
      case ModalTypeEnum.SINGLE_SELECT:
        const selected = modal.querySelector('input[type="radio"]:checked') as HTMLInputElement;
        data.selection = selected?.value;
        break;
        
      case ModalTypeEnum.MULTI_SELECT:
        const selections = modal.querySelectorAll('input[type="checkbox"]:checked');
        data.selections = Array.from(selections).map((cb: any) => cb.value);
        break;
        
      case ModalTypeEnum.SHORT_ANSWER:
      case ModalTypeEnum.ESSAY:
        const textarea = modal.querySelector('textarea') as HTMLTextAreaElement;
        data.answer = textarea?.value;
        break;
        
      case ModalTypeEnum.FILL_BLANK:
        const blanks = modal.querySelectorAll('.fill-blank-input');
        data.answers = Array.from(blanks).map((input: any) => input.value);
        break;
    }
    
    return data;
  }

  private submitResponse(modalId: string, data: any): void {
    // This would send response to backend
    console.log('Submitting response:', { modalId, data });
    
    // Close modal after submission
    this.closeModal(modalId);
  }
}

// Export for use
export const modalFactory = new ModalFactory();