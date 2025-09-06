/**
 * Modal Router
 * Handles deep linking and URL-based modal navigation
 */

import { AIContentResponseV2, ModalTypeEnum, ContainerType } from '../ai-engine/types';
import { contentPipelineOrchestrator } from '../ai-engine/content-pipeline-orchestrator';

export interface ModalRoute {
  path: string;
  container: ContainerType;
  modalType: ModalTypeEnum;
  loader: (params: RouteParams) => Promise<AIContentResponseV2>;
  metadata?: {
    requiresAuth?: boolean;
    gradeLevel?: string;
    preload?: boolean;
  };
}

export interface RouteParams {
  id?: string;
  [key: string]: any;
}

export class ModalRouter {
  private routes: Map<string, ModalRoute> = new Map();
  private currentPath: string = '';
  private history: string[] = [];
  private listeners: Set<(route: ModalRoute, params: RouteParams) => void> = new Set();

  constructor() {
    this.setupDefaultRoutes();
    this.setupURLListener();
    this.setupPopstateListener();
  }

  /**
   * Setup default modal routes
   */
  private setupDefaultRoutes(): void {
    // LEARN Container Routes
    this.register({
      path: '/learn/lesson/:id',
      container: 'LEARN',
      modalType: ModalTypeEnum.LESSON,
      loader: async (params) => this.loadLesson(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/learn/quiz/:id',
      container: 'LEARN',
      modalType: ModalTypeEnum.SINGLE_SELECT,
      loader: async (params) => this.loadQuiz(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/learn/practice/:id',
      container: 'LEARN',
      modalType: ModalTypeEnum.FILL_BLANK,
      loader: async (params) => this.loadPractice(params.id),
      metadata: { requiresAuth: true }
    });

    // EXPERIENCE Container Routes
    this.register({
      path: '/experience/project/:id',
      container: 'EXPERIENCE',
      modalType: ModalTypeEnum.PROJECT,
      loader: async (params) => this.loadProject(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/experience/collab/:id',
      container: 'EXPERIENCE',
      modalType: ModalTypeEnum.COLLAB_DOC,
      loader: async (params) => this.loadCollabDoc(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/experience/review/:id',
      container: 'EXPERIENCE',
      modalType: ModalTypeEnum.PEER_REVIEW,
      loader: async (params) => this.loadPeerReview(params.id),
      metadata: { requiresAuth: true }
    });

    // DISCOVER Container Routes
    this.register({
      path: '/discover/game/:id',
      container: 'DISCOVER',
      modalType: ModalTypeEnum.GAME,
      loader: async (params) => this.loadGame(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/discover/simulation/:id',
      container: 'DISCOVER',
      modalType: ModalTypeEnum.SIMULATION,
      loader: async (params) => this.loadSimulation(params.id),
      metadata: { requiresAuth: true }
    });

    this.register({
      path: '/discover/scenario/:id',
      container: 'DISCOVER',
      modalType: ModalTypeEnum.SCENARIO,
      loader: async (params) => this.loadScenario(params.id),
      metadata: { requiresAuth: true }
    });

    // Assessment Routes (can be in any container)
    this.register({
      path: '/assess/short/:id',
      container: 'LEARN',
      modalType: ModalTypeEnum.SHORT_ANSWER,
      loader: async (params) => this.loadShortAnswer(params.id)
    });

    this.register({
      path: '/assess/essay/:id',
      container: 'LEARN',
      modalType: ModalTypeEnum.ESSAY,
      loader: async (params) => this.loadEssay(params.id)
    });

    this.register({
      path: '/assess/code/:id',
      container: 'EXPERIENCE',
      modalType: ModalTypeEnum.CODE_EDITOR,
      loader: async (params) => this.loadCodeChallenge(params.id)
    });

    // System Routes
    this.register({
      path: '/onboarding/:step',
      container: 'LEARN',
      modalType: ModalTypeEnum.ONBOARDING,
      loader: async (params) => this.loadOnboarding(params.step),
      metadata: { requiresAuth: false }
    });

    this.register({
      path: '/help/:topic',
      container: 'LEARN',
      modalType: ModalTypeEnum.HELP,
      loader: async (params) => this.loadHelp(params.topic),
      metadata: { requiresAuth: false }
    });
  }

  /**
   * Register a modal route
   */
  public register(route: ModalRoute): void {
    this.routes.set(route.path, route);
    
    // Preload if specified
    if (route.metadata?.preload) {
      this.preloadRoute(route);
    }
  }

  /**
   * Navigate to a modal route
   */
  public async navigate(path: string, params?: RouteParams): Promise<void> {
    const route = this.matchRoute(path);
    
    if (!route) {
      console.error(`No route found for path: ${path}`);
      return;
    }

    // Check authentication if required
    if (route.metadata?.requiresAuth && !this.isAuthenticated()) {
      this.navigate('/auth/login', { redirect: path });
      return;
    }

    // Update browser URL
    this.updateURL(path);
    
    // Add to history
    this.history.push(path);
    this.currentPath = path;

    // Load modal content
    try {
      const response = await route.loader(params || {});
      
      // Notify listeners
      this.notifyListeners(route, params || {}, response);
    } catch (error) {
      console.error(`Failed to load modal for path: ${path}`, error);
      this.handleLoadError(error, route, params);
    }
  }

  /**
   * Go back in history
   */
  public back(): void {
    if (this.history.length > 1) {
      this.history.pop();
      const previousPath = this.history[this.history.length - 1];
      this.navigate(previousPath);
    }
  }

  /**
   * Match a path to a route
   */
  private matchRoute(path: string): ModalRoute | null {
    for (const [pattern, route] of this.routes) {
      const regex = this.pathToRegex(pattern);
      if (regex.test(path)) {
        return route;
      }
    }
    return null;
  }

  /**
   * Convert route pattern to regex
   */
  private pathToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/\//g, '\\/')
      .replace(/:(\w+)/g, '([^/]+)');
    return new RegExp(`^${escaped}$`);
  }

  /**
   * Extract params from path
   */
  public extractParams(pattern: string, path: string): RouteParams {
    const params: RouteParams = {};
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');

    patternParts.forEach((part, index) => {
      if (part.startsWith(':')) {
        const paramName = part.substring(1);
        params[paramName] = pathParts[index];
      }
    });

    return params;
  }

  /**
   * Update browser URL without navigation
   */
  private updateURL(path: string): void {
    if (window.history && window.history.pushState) {
      window.history.pushState({ path }, '', `#modal${path}`);
    }
  }

  /**
   * Setup URL change listener
   */
  private setupURLListener(): void {
    // Handle initial load
    if (window.location.hash.startsWith('#modal')) {
      const path = window.location.hash.substring(6);
      this.navigate(path);
    }
  }

  /**
   * Setup popstate listener for browser back/forward
   */
  private setupPopstateListener(): void {
    window.addEventListener('popstate', (event) => {
      if (event.state?.path) {
        this.navigate(event.state.path);
      }
    });
  }

  /**
   * Subscribe to route changes
   */
  public subscribe(listener: (route: ModalRoute, params: RouteParams, response: AIContentResponseV2) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify listeners of route change
   */
  private notifyListeners(route: ModalRoute, params: RouteParams, response: AIContentResponseV2): void {
    this.listeners.forEach(listener => listener(route, params, response));
  }

  /**
   * Check if user is authenticated
   */
  private isAuthenticated(): boolean {
    // This would check actual auth state
    return !!window.localStorage.getItem('auth_token');
  }

  /**
   * Preload route content
   */
  private async preloadRoute(route: ModalRoute): Promise<void> {
    try {
      const response = await route.loader({});
      // Cache the response
      this.cacheResponse(route.path, response);
    } catch (error) {
      console.warn(`Failed to preload route: ${route.path}`, error);
    }
  }

  /**
   * Cache modal response
   */
  private cacheResponse(path: string, response: AIContentResponseV2): void {
    // Simple in-memory cache, could be enhanced with localStorage
    if (!window.modalCache) {
      window.modalCache = new Map();
    }
    window.modalCache.set(path, {
      response,
      timestamp: Date.now()
    });
  }

  /**
   * Get cached response
   */
  private getCachedResponse(path: string): AIContentResponseV2 | null {
    if (!window.modalCache) return null;
    
    const cached = window.modalCache.get(path);
    if (!cached) return null;
    
    // Check if cache is still valid (5 minutes)
    if (Date.now() - cached.timestamp > 300000) {
      window.modalCache.delete(path);
      return null;
    }
    
    return cached.response;
  }

  /**
   * Handle load errors
   */
  private handleLoadError(error: any, route: ModalRoute, params?: RouteParams): void {
    // Create error modal response
    const errorResponse: AIContentResponseV2 = {
      contentId: `error-${Date.now()}`,
      modalType: ModalTypeEnum.ERROR,
      contentType: 'error',
      version: '2.0',
      timestamp: new Date().toISOString(),
      error: {
        code: 'LOAD_ERROR',
        message: error.message || 'Failed to load content',
        fallback: true
      },
      content: {
        data: {
          title: 'Loading Error',
          message: `Failed to load ${route.path}`,
          actions: [
            { label: 'Retry', action: 'retry' },
            { label: 'Go Back', action: 'back' }
          ]
        }
      },
      // ... other required fields with defaults
    } as AIContentResponseV2;

    this.notifyListeners(route, params || {}, errorResponse);
  }

  // Content Loaders (these would fetch from API)
  private async loadLesson(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('lesson', id);
  }

  private async loadQuiz(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('quiz', id);
  }

  private async loadPractice(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('practice', id);
  }

  private async loadProject(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('project', id);
  }

  private async loadCollabDoc(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('collab', id);
  }

  private async loadPeerReview(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('review', id);
  }

  private async loadGame(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('game', id);
  }

  private async loadSimulation(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('simulation', id);
  }

  private async loadScenario(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('scenario', id);
  }

  private async loadShortAnswer(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('short-answer', id);
  }

  private async loadEssay(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('essay', id);
  }

  private async loadCodeChallenge(id: string): Promise<AIContentResponseV2> {
    return this.fetchContent('code', id);
  }

  private async loadOnboarding(step: string): Promise<AIContentResponseV2> {
    return this.fetchContent('onboarding', step);
  }

  private async loadHelp(topic: string): Promise<AIContentResponseV2> {
    return this.fetchContent('help', topic);
  }

  /**
   * Generic content fetcher
   */
  private async fetchContent(type: string, id: string): Promise<AIContentResponseV2> {
    // Check cache first
    const cacheKey = `${type}/${id}`;
    const cached = this.getCachedResponse(cacheKey);
    if (cached) return cached;

    // Fetch from API
    const response = await fetch(`/api/content/${type}/${id}`, {
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Cache response
    this.cacheResponse(cacheKey, data);
    
    return data;
  }
}

// Singleton instance
export const modalRouter = new ModalRouter();

// React hook for modal routing
export function useModalRouter() {
  const navigate = (path: string, params?: RouteParams) => {
    return modalRouter.navigate(path, params);
  };

  const back = () => {
    modalRouter.back();
  };

  const register = (route: ModalRoute) => {
    modalRouter.register(route);
  };

  return {
    navigate,
    back,
    register
  };
}

// Type augmentation for window
declare global {
  interface Window {
    modalCache: Map<string, { response: AIContentResponseV2; timestamp: number }>;
  }
}

// Add missing modal types to enum if needed
declare module '../ai-engine/types' {
  export enum ModalTypeEnum {
    LESSON = 'LessonModal',
    PROJECT = 'ProjectModal',
    GAME = 'GameModal',
    ONBOARDING = 'OnboardingModal',
    HELP = 'HelpModal',
    ERROR = 'ErrorModal'
  }
}