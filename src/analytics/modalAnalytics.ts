/**
 * Modal Analytics Wrapper
 * Comprehensive analytics tracking for modal interactions
 */

import { ModalTypeEnum, ContainerType, GradeLevel } from '../ai-engine/types';

export interface ModalEvent {
  eventType: 'open' | 'close' | 'submit' | 'skip' | 'interact' | 'error';
  modalId: string;
  modalType: ModalTypeEnum;
  container: ContainerType;
  timestamp: string;
  sessionId: string;
  userId: string;
  metadata?: Record<string, any>;
}

export interface ModalMetrics {
  modalId: string;
  openTime: number;
  closeTime?: number;
  duration?: number;
  interactions: number;
  completionRate?: number;
  errorCount: number;
  validationErrors: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  gradeLevel?: GradeLevel;
}

export interface ModalSession {
  sessionId: string;
  userId: string;
  startTime: number;
  modalsOpened: number;
  modalsCompleted: number;
  totalDuration: number;
  averageDuration: number;
  completionRate: number;
  errorRate: number;
}

export class ModalAnalytics {
  private events: ModalEvent[] = [];
  private metrics: Map<string, ModalMetrics> = new Map();
  private sessions: Map<string, ModalSession> = new Map();
  private currentSessionId: string;
  private userId: string;
  private analyticsEndpoint: string = '/api/analytics';
  private batchSize: number = 20;
  private flushInterval: number = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.currentSessionId = this.generateSessionId();
    this.userId = this.getUserId();
    this.startSession();
    this.setupFlushInterval();
    this.setupUnloadHandler();
  }

  /**
   * Track modal open event
   */
  public trackModalOpen(
    modalId: string,
    modalType: ModalTypeEnum,
    container: ContainerType,
    metadata?: Record<string, any>
  ): void {
    const event: ModalEvent = {
      eventType: 'open',
      modalId,
      modalType,
      container,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata
    };

    this.recordEvent(event);

    // Initialize metrics for this modal
    this.metrics.set(modalId, {
      modalId,
      openTime: Date.now(),
      interactions: 0,
      errorCount: 0,
      validationErrors: 0,
      deviceType: this.getDeviceType(),
      gradeLevel: metadata?.gradeLevel
    });

    // Update session
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.modalsOpened++;
    }
  }

  /**
   * Track modal close event
   */
  public trackModalClose(
    modalId: string,
    completed: boolean = false,
    metadata?: Record<string, any>
  ): void {
    const metrics = this.metrics.get(modalId);
    if (!metrics) return;

    const closeTime = Date.now();
    const duration = closeTime - metrics.openTime;

    metrics.closeTime = closeTime;
    metrics.duration = duration;
    metrics.completionRate = completed ? 100 : 0;

    const event: ModalEvent = {
      eventType: 'close',
      modalId,
      modalType: metadata?.modalType,
      container: metadata?.container,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata: {
        ...metadata,
        duration,
        completed
      }
    };

    this.recordEvent(event);

    // Update session
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      if (completed) {
        session.modalsCompleted++;
      }
      session.totalDuration += duration;
      session.averageDuration = session.totalDuration / session.modalsOpened;
      session.completionRate = (session.modalsCompleted / session.modalsOpened) * 100;
    }

    // Send metrics for long sessions
    if (duration > 300000) { // 5 minutes
      this.sendMetrics(modalId, metrics);
    }
  }

  /**
   * Track modal submission
   */
  public trackModalSubmit(
    modalId: string,
    modalType: ModalTypeEnum,
    data: any,
    score?: number
  ): void {
    const event: ModalEvent = {
      eventType: 'submit',
      modalId,
      modalType,
      container: data.container,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata: {
        score,
        answersProvided: Object.keys(data).length,
        timeToSubmit: this.getModalDuration(modalId)
      }
    };

    this.recordEvent(event);
    this.trackModalClose(modalId, true, { modalType, container: data.container });
  }

  /**
   * Track modal skip
   */
  public trackModalSkip(
    modalId: string,
    modalType: ModalTypeEnum,
    reason?: string
  ): void {
    const event: ModalEvent = {
      eventType: 'skip',
      modalId,
      modalType,
      container: 'LEARN', // Default, should be passed
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata: {
        reason,
        timeSpent: this.getModalDuration(modalId)
      }
    };

    this.recordEvent(event);
    this.trackModalClose(modalId, false);
  }

  /**
   * Track modal interaction
   */
  public trackModalInteraction(
    modalId: string,
    interactionType: string,
    metadata?: Record<string, any>
  ): void {
    const metrics = this.metrics.get(modalId);
    if (metrics) {
      metrics.interactions++;
    }

    const event: ModalEvent = {
      eventType: 'interact',
      modalId,
      modalType: metadata?.modalType,
      container: metadata?.container,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata: {
        interactionType,
        ...metadata
      }
    };

    this.recordEvent(event);
  }

  /**
   * Track modal error
   */
  public trackModalError(
    modalId: string,
    errorType: string,
    errorMessage: string,
    metadata?: Record<string, any>
  ): void {
    const metrics = this.metrics.get(modalId);
    if (metrics) {
      metrics.errorCount++;
      if (errorType === 'validation') {
        metrics.validationErrors++;
      }
    }

    const event: ModalEvent = {
      eventType: 'error',
      modalId,
      modalType: metadata?.modalType,
      container: metadata?.container,
      timestamp: new Date().toISOString(),
      sessionId: this.currentSessionId,
      userId: this.userId,
      metadata: {
        errorType,
        errorMessage,
        ...metadata
      }
    };

    this.recordEvent(event);

    // Update session error rate
    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      const totalErrors = Array.from(this.metrics.values())
        .reduce((sum, m) => sum + m.errorCount, 0);
      session.errorRate = (totalErrors / session.modalsOpened) * 100;
    }
  }

  /**
   * Get current session metrics
   */
  public getSessionMetrics(): ModalSession | undefined {
    return this.sessions.get(this.currentSessionId);
  }

  /**
   * Get modal metrics
   */
  public getModalMetrics(modalId: string): ModalMetrics | undefined {
    return this.metrics.get(modalId);
  }

  /**
   * Get aggregate metrics
   */
  public getAggregateMetrics(): {
    totalModals: number;
    averageDuration: number;
    completionRate: number;
    errorRate: number;
    topModalTypes: Array<{ type: ModalTypeEnum; count: number }>;
    deviceBreakdown: Record<string, number>;
    gradeLevelBreakdown: Record<string, number>;
  } {
    const allMetrics = Array.from(this.metrics.values());
    
    const totalModals = allMetrics.length;
    const averageDuration = allMetrics.reduce((sum, m) => sum + (m.duration || 0), 0) / totalModals || 0;
    const completionRate = allMetrics.reduce((sum, m) => sum + (m.completionRate || 0), 0) / totalModals || 0;
    const errorRate = allMetrics.reduce((sum, m) => sum + m.errorCount, 0) / totalModals || 0;

    // Count modal types
    const typeCount = new Map<ModalTypeEnum, number>();
    this.events
      .filter(e => e.eventType === 'open')
      .forEach(e => {
        const count = typeCount.get(e.modalType) || 0;
        typeCount.set(e.modalType, count + 1);
      });
    
    const topModalTypes = Array.from(typeCount.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Device breakdown
    const deviceBreakdown: Record<string, number> = {};
    allMetrics.forEach(m => {
      deviceBreakdown[m.deviceType] = (deviceBreakdown[m.deviceType] || 0) + 1;
    });

    // Grade level breakdown
    const gradeLevelBreakdown: Record<string, number> = {};
    allMetrics.forEach(m => {
      if (m.gradeLevel) {
        gradeLevelBreakdown[m.gradeLevel] = (gradeLevelBreakdown[m.gradeLevel] || 0) + 1;
      }
    });

    return {
      totalModals,
      averageDuration,
      completionRate,
      errorRate,
      topModalTypes,
      deviceBreakdown,
      gradeLevelBreakdown
    };
  }

  /**
   * Generate heatmap data for modal interactions
   */
  public generateHeatmap(): Array<{
    hour: number;
    day: number;
    count: number;
  }> {
    const heatmap: Record<string, number> = {};

    this.events.forEach(event => {
      const date = new Date(event.timestamp);
      const hour = date.getHours();
      const day = date.getDay();
      const key = `${day}-${hour}`;
      heatmap[key] = (heatmap[key] || 0) + 1;
    });

    return Object.entries(heatmap).map(([key, count]) => {
      const [day, hour] = key.split('-').map(Number);
      return { hour, day, count };
    });
  }

  /**
   * Generate funnel analysis
   */
  public generateFunnel(modalSequence: string[]): Array<{
    step: string;
    count: number;
    dropoff: number;
  }> {
    const funnel: Array<{ step: string; count: number; dropoff: number }> = [];
    let previousCount = 0;

    modalSequence.forEach((modalId, index) => {
      const count = this.events.filter(e => 
        e.modalId === modalId && e.eventType === 'open'
      ).length;
      
      const dropoff = index === 0 ? 0 : ((previousCount - count) / previousCount) * 100;
      
      funnel.push({
        step: modalId,
        count,
        dropoff
      });
      
      previousCount = count;
    });

    return funnel;
  }

  // Private helper methods

  private recordEvent(event: ModalEvent): void {
    this.events.push(event);
    
    // Flush if batch size reached
    if (this.events.length >= this.batchSize) {
      this.flush();
    }
  }

  private startSession(): void {
    this.sessions.set(this.currentSessionId, {
      sessionId: this.currentSessionId,
      userId: this.userId,
      startTime: Date.now(),
      modalsOpened: 0,
      modalsCompleted: 0,
      totalDuration: 0,
      averageDuration: 0,
      completionRate: 0,
      errorRate: 0
    });
  }

  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private getUserId(): string {
    // Get from auth or generate anonymous ID
    return window.localStorage.getItem('user_id') || 
           window.localStorage.getItem('anonymous_id') ||
           this.generateAnonymousId();
  }

  private generateAnonymousId(): string {
    const id = `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    window.localStorage.setItem('anonymous_id', id);
    return id;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getModalDuration(modalId: string): number {
    const metrics = this.metrics.get(modalId);
    if (!metrics) return 0;
    return Date.now() - metrics.openTime;
  }

  private setupFlushInterval(): void {
    this.flushTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  private async flush(): Promise<void> {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await this.sendEvents(eventsToSend);
    } catch (error) {
      console.error('Failed to send analytics events:', error);
      // Re-add events for retry
      this.events.unshift(...eventsToSend);
    }
  }

  private async sendEvents(events: ModalEvent[]): Promise<void> {
    const response = await fetch(this.analyticsEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        events,
        sessionId: this.currentSessionId,
        timestamp: new Date().toISOString()
      })
    });

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }
  }

  private async sendMetrics(modalId: string, metrics: ModalMetrics): Promise<void> {
    try {
      await fetch(`${this.analyticsEndpoint}/metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          modalId,
          metrics,
          sessionId: this.currentSessionId,
          timestamp: new Date().toISOString()
        })
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
    }
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flush();
  }
}

// Singleton instance
export const modalAnalytics = new ModalAnalytics();

// React hook for modal analytics
export function useModalAnalytics() {
  return {
    trackOpen: (modalId: string, type: ModalTypeEnum, container: ContainerType, metadata?: any) => 
      modalAnalytics.trackModalOpen(modalId, type, container, metadata),
    
    trackClose: (modalId: string, completed?: boolean, metadata?: any) =>
      modalAnalytics.trackModalClose(modalId, completed, metadata),
    
    trackSubmit: (modalId: string, type: ModalTypeEnum, data: any, score?: number) =>
      modalAnalytics.trackModalSubmit(modalId, type, data, score),
    
    trackSkip: (modalId: string, type: ModalTypeEnum, reason?: string) =>
      modalAnalytics.trackModalSkip(modalId, type, reason),
    
    trackInteraction: (modalId: string, type: string, metadata?: any) =>
      modalAnalytics.trackModalInteraction(modalId, type, metadata),
    
    trackError: (modalId: string, type: string, message: string, metadata?: any) =>
      modalAnalytics.trackModalError(modalId, type, message, metadata),
    
    getMetrics: () => modalAnalytics.getAggregateMetrics(),
    
    getSessionMetrics: () => modalAnalytics.getSessionMetrics(),
    
    generateHeatmap: () => modalAnalytics.generateHeatmap(),
    
    generateFunnel: (sequence: string[]) => modalAnalytics.generateFunnel(sequence)
  };
}