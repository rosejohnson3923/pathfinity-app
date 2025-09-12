/**
 * Grade-Specific Interaction Configuration
 * Defines interaction modes, sizes, and behaviors for different grade levels
 */

export interface InteractionConfig {
  mode: 'tap-only' | 'drag-drop' | 'multi-select' | 'professional';
  targetSize: number; // Minimum touch target size in pixels
  fontSize: number; // Base font size in pixels
  feedback: 'immediate' | 'on-drop' | 'on-submit';
  hints: 'automatic' | 'on-request' | 'disabled';
  animations: 'playful' | 'smooth' | 'subtle' | 'professional';
  audioFeedback: boolean;
  visualCues: boolean;
  maxOptions: number;
  requireConfirmation: boolean;
  allowMultipleAttempts: boolean;
  showProgress: boolean;
}

/**
 * Get interaction configuration based on grade level
 */
export const getInteractionConfig = (gradeLevel: string): InteractionConfig => {
  // K-2: Young learners need large targets and immediate feedback
  if (['K', '1', '2'].includes(gradeLevel)) {
    return {
      mode: 'tap-only',
      targetSize: 64, // Extra large touch targets
      fontSize: 24, // Large, readable text
      feedback: 'immediate',
      hints: 'automatic', // Show hints automatically after delay
      animations: 'playful', // Fun, engaging animations
      audioFeedback: true, // Sound effects for actions
      visualCues: true, // Visual indicators for interactive elements
      maxOptions: 4, // Limit cognitive load
      requireConfirmation: false, // Single tap to select
      allowMultipleAttempts: true, // Can retry without penalty
      showProgress: true // Always show progress indicators
    };
  }
  
  // 3-5: Elementary students can handle drag-drop
  if (['3', '4', '5'].includes(gradeLevel)) {
    return {
      mode: 'drag-drop',
      targetSize: 48, // Large touch targets
      fontSize: 18, // Readable text
      feedback: 'on-drop',
      hints: 'on-request', // Show hints when requested
      animations: 'smooth', // Smooth, less distracting
      audioFeedback: true, // Optional sound effects
      visualCues: true, // Visual feedback
      maxOptions: 6, // More options available
      requireConfirmation: false, // Direct interaction
      allowMultipleAttempts: true, // Can retry
      showProgress: true // Show progress
    };
  }
  
  // 6-8: Middle school students need less guidance
  if (['6', '7', '8'].includes(gradeLevel)) {
    return {
      mode: 'multi-select',
      targetSize: 44, // Standard touch targets
      fontSize: 16, // Standard text size
      feedback: 'on-submit',
      hints: 'on-request', // Hints available if needed
      animations: 'subtle', // Subtle animations
      audioFeedback: false, // No sound by default
      visualCues: false, // Minimal visual cues
      maxOptions: 8, // Full range of options
      requireConfirmation: true, // Confirm before submit
      allowMultipleAttempts: true, // Limited retries
      showProgress: true // Progress available
    };
  }
  
  // 9-12: High school students - professional interface
  return {
    mode: 'professional',
    targetSize: 40, // Minimum accessible size
    fontSize: 14, // Compact text
    feedback: 'on-submit',
    hints: 'disabled', // No hints by default
    animations: 'professional', // Minimal animations
    audioFeedback: false, // No sound
    visualCues: false, // No extra visual cues
    maxOptions: 10, // Many options possible
    requireConfirmation: true, // Must confirm choices
    allowMultipleAttempts: false, // One attempt
    showProgress: false // Progress on demand
  };
};

/**
 * Get touch target size for grade level
 */
export const getTouchTargetSize = (gradeLevel: string): string => {
  const config = getInteractionConfig(gradeLevel);
  return `${config.targetSize}px`;
};

/**
 * Check if grade level needs visual options
 */
export const needsVisualOptions = (gradeLevel: string): boolean => {
  return ['K', '1', '2'].includes(gradeLevel);
};

/**
 * Check if grade level supports drag and drop
 */
export const supportsDragDrop = (gradeLevel: string): boolean => {
  const config = getInteractionConfig(gradeLevel);
  return config.mode === 'drag-drop' || config.mode === 'multi-select';
};

/**
 * Get maximum number of options for grade level
 */
export const getMaxOptions = (gradeLevel: string): number => {
  const config = getInteractionConfig(gradeLevel);
  return config.maxOptions;
};

/**
 * Get animation style for grade level
 */
export const getAnimationStyle = (gradeLevel: string): string => {
  const config = getInteractionConfig(gradeLevel);
  return config.animations;
};

/**
 * Check if audio feedback should be enabled
 */
export const shouldEnableAudio = (gradeLevel: string): boolean => {
  const config = getInteractionConfig(gradeLevel);
  return config.audioFeedback;
};

/**
 * Get hint display mode for grade level
 */
export const getHintMode = (gradeLevel: string): 'automatic' | 'on-request' | 'disabled' => {
  const config = getInteractionConfig(gradeLevel);
  return config.hints;
};

/**
 * Get feedback timing for grade level
 */
export const getFeedbackTiming = (gradeLevel: string): 'immediate' | 'on-drop' | 'on-submit' => {
  const config = getInteractionConfig(gradeLevel);
  return config.feedback;
};

/**
 * Accessibility configuration for different grades
 */
export const getAccessibilityConfig = (gradeLevel: string) => {
  const config = getInteractionConfig(gradeLevel);
  
  return {
    minTargetSize: config.targetSize,
    fontSize: config.fontSize,
    highContrast: ['K', '1', '2'].includes(gradeLevel),
    reduceMotion: false,
    screenReaderVerbosity: ['K', '1', '2'].includes(gradeLevel) ? 'verbose' : 'normal',
    keyboardNavigation: !['K', '1', '2'].includes(gradeLevel),
    focusIndicatorSize: ['K', '1', '2'].includes(gradeLevel) ? 'large' : 'normal'
  };
};