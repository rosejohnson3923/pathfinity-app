/**
 * Toast Notification Service
 * Integrated with CompanionRulesEngine for career-contextualized messages
 * Part of Phase 4 Integration
 */

import { companionRulesEngine, CompanionContext } from '../rules-engine/companions/CompanionRulesEngine';
import { careerAIRulesEngine } from '../rules-engine/career/CareerAIRulesEngine';
import { themeRulesEngine } from '../rules-engine/theme/ThemeRulesEngine';

// ============================================================================
// TOAST TYPES AND INTERFACES
// ============================================================================

export type ToastType = 'success' | 'info' | 'warning' | 'error' | 'achievement' | 'companion';
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
export type ToastDuration = 'short' | 'medium' | 'long' | 'persistent';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  companionId?: string;
  companionEmotion?: string;
  careerId?: string;
  icon?: string;
  duration?: number;
  position?: ToastPosition;
  actions?: ToastAction[];
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface ToastConfig {
  position: ToastPosition;
  duration: {
    short: number;
    medium: number;
    long: number;
  };
  maxToasts: number;
  animation: {
    enter: string;
    exit: string;
  };
  theme: 'light' | 'dark' | 'auto';
  sound: boolean;
  stackBehavior: 'stack' | 'replace' | 'queue';
}

export interface ToastContext {
  studentId: string;
  grade: string;
  companionId: string;
  careerId: string;
  subject?: string;
  triggerType: string;
  achievement?: string;
  progress?: number;
  theme?: 'light' | 'dark';
}

// ============================================================================
// TOAST NOTIFICATION SERVICE
// ============================================================================

class ToastNotificationService {
  private static instance: ToastNotificationService;
  private toasts: Map<string, ToastMessage> = new Map();
  private config: ToastConfig;
  private listeners: Set<(toasts: ToastMessage[]) => void> = new Set();
  private toastQueue: ToastMessage[] = [];
  private isProcessingQueue = false;
  private soundEnabled = true;
  private audioContext: AudioContext | null = null;
  
  private constructor() {
    this.config = this.getDefaultConfig();
    this.initializeAudio();
  }
  
  public static getInstance(): ToastNotificationService {
    if (!ToastNotificationService.instance) {
      ToastNotificationService.instance = new ToastNotificationService();
    }
    return ToastNotificationService.instance;
  }
  
  /**
   * Get default configuration
   */
  private getDefaultConfig(): ToastConfig {
    return {
      position: 'top-right',
      duration: {
        short: 3000,
        medium: 5000,
        long: 8000
      },
      maxToasts: 3,
      animation: {
        enter: 'slideInRight',
        exit: 'slideOutRight'
      },
      theme: 'auto',
      sound: true,
      stackBehavior: 'stack'
    };
  }
  
  /**
   * Initialize audio for toast sounds
   */
  private initializeAudio(): void {
    if (typeof window !== 'undefined' && window.AudioContext) {
      this.audioContext = new AudioContext();
    }
  }
  
  // ============================================================================
  // RULES ENGINE INTEGRATION
  // ============================================================================
  
  /**
   * Show career-contextualized toast message
   * This is the PRIMARY method that integrates with rules engines
   */
  public async showCareerToast(context: ToastContext): Promise<void> {
    try {
      // Get companion message from rules engine
      const companionContext: CompanionContext = {
        userId: context.studentId,
        timestamp: new Date(),
        metadata: {},
        companionId: context.companionId,
        career: {
          id: context.careerId.toLowerCase(),
          name: context.careerId as any
        },
        trigger: {
          type: context.triggerType,
          context: {
            subject: context.subject,
            achievement: context.achievement,
            progress: context.progress
          }
        },
        student: {
          grade: context.grade,
          level: 1
        }
      };
      
      // Execute companion rules to get message
      const results = await companionRulesEngine.execute(companionContext);
      const messageResult = results.find(r => r.data?.message);
      
      if (messageResult?.data) {
        // Get career visual theme
        const careerProfile = careerAIRulesEngine.getCareerProfile(context.careerId as any);
        
        // Get theme configuration
        const themeConfig = await this.getThemeConfig(context.theme || 'light');
        
        // Create toast message
        const toast: ToastMessage = {
          id: this.generateId(),
          type: this.getToastType(context.triggerType),
          title: this.getToastTitle(context),
          message: messageResult.data.message,
          companionId: context.companionId,
          companionEmotion: messageResult.data.emotion,
          careerId: context.careerId,
          icon: careerProfile?.visualTheme.icon || '🎯',
          duration: this.getDuration(context.triggerType),
          position: this.config.position,
          metadata: {
            grade: context.grade,
            trigger: context.triggerType,
            careerColor: careerProfile?.visualTheme.primaryColor
          },
          timestamp: new Date()
        };
        
        // Add actions for certain triggers
        if (context.triggerType === 'achievement') {
          toast.actions = [{
            label: 'View Badge',
            action: () => this.handleViewBadge(context.achievement),
            style: 'primary'
          }];
        }
        
        // Show the toast
        this.show(toast);
      }
    } catch (error) {
      console.error('Failed to show career toast:', error);
      // Fallback to generic toast
      this.showGeneric({
        type: 'info',
        message: 'Keep up the great work!'
      });
    }
  }
  
  /**
   * Get theme configuration from rules engine
   */
  private async getThemeConfig(mode: 'light' | 'dark'): Promise<any> {
    const results = await themeRulesEngine.execute({
      userId: 'system',
      timestamp: new Date(),
      metadata: {},
      mode,
      component: 'toast'
    });
    
    return results[0]?.data || {};
  }
  
  /**
   * Determine toast type from trigger
   */
  private getToastType(triggerType: string): ToastType {
    const typeMap: Record<string, ToastType> = {
      'achievement': 'achievement',
      'correct_answer': 'success',
      'incorrect_answer': 'info',
      'hint': 'info',
      'encouragement': 'companion',
      'milestone': 'achievement',
      'error': 'error',
      'warning': 'warning'
    };
    
    return typeMap[triggerType] || 'info';
  }
  
  /**
   * Generate toast title based on context
   */
  private getToastTitle(context: ToastContext): string {
    const titles: Record<string, string> = {
      'achievement': '🏆 Achievement Unlocked!',
      'correct_answer': '✅ Correct!',
      'incorrect_answer': '💡 Try Again',
      'hint': '💡 Hint',
      'encouragement': `${context.companionId} says...`,
      'milestone': '⭐ Milestone Reached!',
      'level_up': '🎉 Level Up!',
      'streak': '🔥 Streak!'
    };
    
    return titles[context.triggerType] || '';
  }
  
  /**
   * Get duration based on trigger type
   */
  private getDuration(triggerType: string): number {
    const durations: Record<string, keyof typeof this.config.duration> = {
      'achievement': 'long',
      'correct_answer': 'short',
      'incorrect_answer': 'medium',
      'hint': 'medium',
      'encouragement': 'medium',
      'milestone': 'long'
    };
    
    const durationType = durations[triggerType] || 'medium';
    return this.config.duration[durationType];
  }
  
  // ============================================================================
  // CORE TOAST METHODS
  // ============================================================================
  
  /**
   * Show a toast message
   */
  public show(toast: ToastMessage): void {
    // Apply stack behavior
    if (this.config.stackBehavior === 'replace') {
      this.clearAll();
    } else if (this.config.stackBehavior === 'queue') {
      this.toastQueue.push(toast);
      this.processQueue();
      return;
    }
    
    // Check max toasts
    if (this.toasts.size >= this.config.maxToasts) {
      const oldestToast = Array.from(this.toasts.values())
        .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())[0];
      if (oldestToast) {
        this.dismiss(oldestToast.id);
      }
    }
    
    // Add toast
    this.toasts.set(toast.id, toast);
    
    // Play sound
    if (this.soundEnabled && this.config.sound) {
      this.playSound(toast.type);
    }
    
    // Notify listeners
    this.notifyListeners();
    
    // Auto dismiss if not persistent
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        this.dismiss(toast.id);
      }, toast.duration);
    }
  }
  
  /**
   * Show generic toast (without rules engine)
   */
  public showGeneric(options: {
    type: ToastType;
    message: string;
    title?: string;
    duration?: 'short' | 'medium' | 'long';
    actions?: ToastAction[];
  }): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      type: options.type,
      title: options.title,
      message: options.message,
      duration: options.duration ? this.config.duration[options.duration] : this.config.duration.medium,
      position: this.config.position,
      actions: options.actions,
      timestamp: new Date()
    };
    
    this.show(toast);
  }
  
  /**
   * Show success toast
   */
  public success(message: string, title?: string): void {
    this.showGeneric({ type: 'success', message, title });
  }
  
  /**
   * Show info toast
   */
  public info(message: string, title?: string): void {
    this.showGeneric({ type: 'info', message, title });
  }
  
  /**
   * Show warning toast
   */
  public warning(message: string, title?: string): void {
    this.showGeneric({ type: 'warning', message, title });
  }
  
  /**
   * Show error toast
   */
  public error(message: string, title?: string): void {
    this.showGeneric({ type: 'error', message, title });
  }
  
  /**
   * Dismiss a toast
   */
  public dismiss(id: string): void {
    this.toasts.delete(id);
    this.notifyListeners();
  }
  
  /**
   * Clear all toasts
   */
  public clearAll(): void {
    this.toasts.clear();
    this.toastQueue = [];
    this.notifyListeners();
  }
  
  /**
   * Process toast queue
   */
  private processQueue(): void {
    if (this.isProcessingQueue || this.toastQueue.length === 0) return;
    
    this.isProcessingQueue = true;
    const toast = this.toastQueue.shift();
    
    if (toast) {
      this.show(toast);
      
      // Process next after duration
      setTimeout(() => {
        this.isProcessingQueue = false;
        this.processQueue();
      }, toast.duration || this.config.duration.medium);
    }
  }
  
  // ============================================================================
  // SOUND EFFECTS
  // ============================================================================
  
  /**
   * Play sound for toast type
   */
  private playSound(type: ToastType): void {
    if (!this.audioContext) return;
    
    const frequencies: Record<ToastType, number[]> = {
      'success': [523, 659, 784], // C, E, G (major chord)
      'info': [440, 554, 659],    // A, C#, E
      'warning': [349, 440, 523], // F, A, C
      'error': [293, 349],         // D, F (minor)
      'achievement': [523, 659, 784, 1047], // C major arpeggio
      'companion': [440, 523, 659] // A, C, E
    };
    
    const notes = frequencies[type] || frequencies.info;
    this.playNotes(notes);
  }
  
  /**
   * Play musical notes
   */
  private playNotes(frequencies: number[]): void {
    if (!this.audioContext) return;
    
    frequencies.forEach((freq, index) => {
      setTimeout(() => {
        const oscillator = this.audioContext!.createOscillator();
        const gainNode = this.audioContext!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext!.destination);
        
        oscillator.frequency.value = freq;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, this.audioContext!.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext!.currentTime + 0.3);
        
        oscillator.start(this.audioContext!.currentTime);
        oscillator.stop(this.audioContext!.currentTime + 0.3);
      }, index * 100);
    });
  }
  
  // ============================================================================
  // LISTENERS AND CONFIGURATION
  // ============================================================================
  
  /**
   * Subscribe to toast changes
   */
  public subscribe(listener: (toasts: ToastMessage[]) => void): () => void {
    this.listeners.add(listener);
    listener(this.getToasts());
    
    return () => {
      this.listeners.delete(listener);
    };
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const toasts = this.getToasts();
    this.listeners.forEach(listener => listener(toasts));
  }
  
  /**
   * Get all current toasts
   */
  public getToasts(): ToastMessage[] {
    return Array.from(this.toasts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  /**
   * Update configuration
   */
  public updateConfig(config: Partial<ToastConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Toggle sound
   */
  public toggleSound(enabled?: boolean): void {
    this.soundEnabled = enabled !== undefined ? enabled : !this.soundEnabled;
  }
  
  // ============================================================================
  // HELPER METHODS
  // ============================================================================
  
  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  /**
   * Handle view badge action
   */
  private handleViewBadge(achievement?: string): void {
    console.log('View badge:', achievement);
    // This would navigate to achievements page
  }
  
  // ============================================================================
  // PRESET MESSAGES
  // ============================================================================
  
  /**
   * Show level up toast
   */
  public async showLevelUp(level: number, context: ToastContext): Promise<void> {
    await this.showCareerToast({
      ...context,
      triggerType: 'level_up',
      metadata: { level }
    });
  }
  
  /**
   * Show streak toast
   */
  public async showStreak(days: number, context: ToastContext): Promise<void> {
    await this.showCareerToast({
      ...context,
      triggerType: 'streak',
      metadata: { days }
    });
  }
  
  /**
   * Show achievement toast
   */
  public async showAchievement(achievement: string, context: ToastContext): Promise<void> {
    await this.showCareerToast({
      ...context,
      triggerType: 'achievement',
      achievement
    });
  }
}

// ============================================================================
// REACT INTEGRATION HOOK
// ============================================================================

/**
 * React hook for using toast notifications
 */
export function useToast() {
  const service = ToastNotificationService.getInstance();
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);
  
  React.useEffect(() => {
    const unsubscribe = service.subscribe(setToasts);
    return unsubscribe;
  }, []);
  
  return {
    toasts,
    showCareerToast: (context: ToastContext) => service.showCareerToast(context),
    success: (message: string, title?: string) => service.success(message, title),
    info: (message: string, title?: string) => service.info(message, title),
    warning: (message: string, title?: string) => service.warning(message, title),
    error: (message: string, title?: string) => service.error(message, title),
    dismiss: (id: string) => service.dismiss(id),
    clearAll: () => service.clearAll()
  };
}

// ============================================================================
// EXPORT
// ============================================================================

export const toastNotificationService = ToastNotificationService.getInstance();

// For React components
import React from 'react';