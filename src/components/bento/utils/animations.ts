/**
 * Animation Configuration and Utilities
 * Manages animations and transitions for the Experience container
 */

export interface AnimationConfig {
  duration: number;
  easing: string;
  delay?: number;
  iterations?: number;
}

export interface AnimationSet {
  scenarioTransition: AnimationConfig;
  companionReaction: AnimationConfig;
  successCelebration: AnimationConfig;
  errorShake: AnimationConfig;
  xpCounter: AnimationConfig;
  tileHover: AnimationConfig;
  progressUpdate: AnimationConfig;
  loadingPulse: AnimationConfig;
}

/**
 * Grade-specific animation configurations
 */
export const GRADE_ANIMATIONS: Record<string, AnimationSet> = {
  'K-2': {
    scenarioTransition: {
      duration: 600,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      delay: 100
    },
    companionReaction: {
      duration: 800,
      easing: 'spring(1, 80, 10, 0)',
      iterations: 2
    },
    successCelebration: {
      duration: 1200,
      easing: 'ease-out',
      iterations: 1
    },
    errorShake: {
      duration: 500,
      easing: 'ease-in-out',
      iterations: 2
    },
    xpCounter: {
      duration: 1500,
      easing: 'ease-out'
    },
    tileHover: {
      duration: 200,
      easing: 'ease-out'
    },
    progressUpdate: {
      duration: 800,
      easing: 'ease-in-out'
    },
    loadingPulse: {
      duration: 1500,
      easing: 'ease-in-out',
      iterations: Infinity
    }
  },
  '3-5': {
    scenarioTransition: {
      duration: 500,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
      delay: 50
    },
    companionReaction: {
      duration: 600,
      easing: 'ease-out'
    },
    successCelebration: {
      duration: 800,
      easing: 'ease-out'
    },
    errorShake: {
      duration: 400,
      easing: 'ease-in-out'
    },
    xpCounter: {
      duration: 1000,
      easing: 'ease-out'
    },
    tileHover: {
      duration: 150,
      easing: 'ease-out'
    },
    progressUpdate: {
      duration: 600,
      easing: 'ease-in-out'
    },
    loadingPulse: {
      duration: 1200,
      easing: 'ease-in-out',
      iterations: Infinity
    }
  },
  '6-8': {
    scenarioTransition: {
      duration: 400,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    companionReaction: {
      duration: 400,
      easing: 'ease-out'
    },
    successCelebration: {
      duration: 600,
      easing: 'ease-out'
    },
    errorShake: {
      duration: 300,
      easing: 'ease-in-out'
    },
    xpCounter: {
      duration: 800,
      easing: 'ease-out'
    },
    tileHover: {
      duration: 100,
      easing: 'ease-out'
    },
    progressUpdate: {
      duration: 400,
      easing: 'ease-in-out'
    },
    loadingPulse: {
      duration: 1000,
      easing: 'ease-in-out',
      iterations: Infinity
    }
  },
  '9-12': {
    scenarioTransition: {
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    },
    companionReaction: {
      duration: 200,
      easing: 'ease-out'
    },
    successCelebration: {
      duration: 400,
      easing: 'ease-out'
    },
    errorShake: {
      duration: 200,
      easing: 'ease-in-out'
    },
    xpCounter: {
      duration: 600,
      easing: 'ease-out'
    },
    tileHover: {
      duration: 50,
      easing: 'ease-out'
    },
    progressUpdate: {
      duration: 300,
      easing: 'ease-in-out'
    },
    loadingPulse: {
      duration: 800,
      easing: 'ease-in-out',
      iterations: Infinity
    }
  }
};

/**
 * Get animation configuration for a specific grade
 */
export const getAnimationSet = (gradeLevel: string): AnimationSet => {
  if (['K', '1', '2'].includes(gradeLevel)) {
    return GRADE_ANIMATIONS['K-2'];
  }
  if (['3', '4', '5'].includes(gradeLevel)) {
    return GRADE_ANIMATIONS['3-5'];
  }
  if (['6', '7', '8'].includes(gradeLevel)) {
    return GRADE_ANIMATIONS['6-8'];
  }
  return GRADE_ANIMATIONS['9-12'];
};

/**
 * Companion personality animations
 */
export const COMPANION_ANIMATIONS = {
  finn: {
    idle: 'bounce',
    happy: 'bounce-fast',
    thinking: 'sway',
    celebrating: 'jump',
    encouraging: 'wave'
  },
  sage: {
    idle: 'float',
    happy: 'nod',
    thinking: 'think',
    celebrating: 'wise-nod',
    encouraging: 'gentle-nod'
  },
  spark: {
    idle: 'vibrate',
    happy: 'spin',
    thinking: 'electric',
    celebrating: 'explode',
    encouraging: 'pulse-fast'
  },
  harmony: {
    idle: 'sway-gentle',
    happy: 'bloom',
    thinking: 'meditate',
    celebrating: 'radiate',
    encouraging: 'breathe'
  }
};

/**
 * CSS Keyframe definitions as strings for injection
 */
export const KEYFRAMES = {
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }
  `,
  'bounce-fast': `
    @keyframes bounce-fast {
      0%, 100% { transform: translateY(0); }
      25% { transform: translateY(-15px); }
      75% { transform: translateY(-15px); }
    }
  `,
  float: `
    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(-2deg); }
      50% { transform: translateY(-10px) rotate(2deg); }
    }
  `,
  sway: `
    @keyframes sway {
      0%, 100% { transform: rotate(-5deg); }
      50% { transform: rotate(5deg); }
    }
  `,
  'sway-gentle': `
    @keyframes sway-gentle {
      0%, 100% { transform: rotate(-2deg); }
      50% { transform: rotate(2deg); }
    }
  `,
  vibrate: `
    @keyframes vibrate {
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-2px); }
      75% { transform: translateX(2px); }
    }
  `,
  spin: `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.05); opacity: 0.9; }
    }
  `,
  'pulse-fast': `
    @keyframes pulse-fast {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }
  `,
  jump: `
    @keyframes jump {
      0%, 100% { transform: translateY(0) scaleY(1); }
      30% { transform: translateY(-30px) scaleY(1); }
      50% { transform: translateY(-30px) scaleY(0.8); }
      70% { transform: translateY(0) scaleY(1.2); }
      90% { transform: translateY(0) scaleY(0.9); }
    }
  `,
  confetti: `
    @keyframes confetti {
      0% { transform: translateY(0) rotate(0deg); opacity: 1; }
      100% { transform: translateY(100px) rotate(720deg); opacity: 0; }
    }
  `,
  stars: `
    @keyframes stars {
      0% { transform: scale(0) rotate(0deg); opacity: 0; }
      50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
      100% { transform: scale(1) rotate(360deg); opacity: 1; }
    }
  `,
  slideIn: `
    @keyframes slideIn {
      0% { transform: translateX(-100%); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
  `,
  slideOut: `
    @keyframes slideOut {
      0% { transform: translateX(0); opacity: 1; }
      100% { transform: translateX(100%); opacity: 0; }
    }
  `,
  fadeIn: `
    @keyframes fadeIn {
      0% { opacity: 0; }
      100% { opacity: 1; }
    }
  `,
  fadeOut: `
    @keyframes fadeOut {
      0% { opacity: 1; }
      100% { opacity: 0; }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      0% { transform: scale(0); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
  `,
  shake: `
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
  `,
  typing: `
    @keyframes typing {
      from { width: 0; }
      to { width: 100%; }
    }
  `,
  blink: `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `
};

/**
 * Apply animation to element
 */
export const applyAnimation = (
  element: HTMLElement,
  animationName: string,
  config: AnimationConfig
): void => {
  const { duration, easing, delay = 0, iterations = 1 } = config;
  
  element.style.animation = `${animationName} ${duration}ms ${easing} ${delay}ms ${iterations === Infinity ? 'infinite' : iterations}`;
  
  // Clean up after animation completes (if not infinite)
  if (iterations !== Infinity) {
    setTimeout(() => {
      element.style.animation = '';
    }, duration + delay);
  }
};

/**
 * Create staggered animation delays for multiple elements
 */
export const staggerAnimation = (
  elements: HTMLElement[],
  baseDelay: number = 0,
  staggerDelay: number = 50
): void => {
  elements.forEach((element, index) => {
    element.style.animationDelay = `${baseDelay + (index * staggerDelay)}ms`;
  });
};

/**
 * Transition between screens with animation
 */
export const transitionScreen = async (
  fromElement: HTMLElement | null,
  toElement: HTMLElement | null,
  gradeLevel: string
): Promise<void> => {
  const animations = getAnimationSet(gradeLevel);
  
  return new Promise((resolve) => {
    // Fade out current screen
    if (fromElement) {
      applyAnimation(fromElement, 'fadeOut', {
        ...animations.scenarioTransition,
        duration: animations.scenarioTransition.duration / 2
      });
    }
    
    // Wait for fade out, then fade in new screen
    setTimeout(() => {
      if (fromElement) fromElement.style.display = 'none';
      if (toElement) {
        toElement.style.display = 'block';
        applyAnimation(toElement, 'fadeIn', {
          ...animations.scenarioTransition,
          duration: animations.scenarioTransition.duration / 2
        });
      }
      
      setTimeout(resolve, animations.scenarioTransition.duration / 2);
    }, animations.scenarioTransition.duration / 2);
  });
};

/**
 * Celebration animation for achievements
 */
export const celebrateAchievement = (
  containerElement: HTMLElement,
  gradeLevel: string,
  type: 'confetti' | 'stars' | 'fireworks' = 'confetti'
): void => {
  const animations = getAnimationSet(gradeLevel);
  
  // Create celebration particles
  const particleCount = ['K', '1', '2'].includes(gradeLevel) ? 20 : 10;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = `celebration-particle ${type}`;
    particle.style.position = 'absolute';
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    containerElement.appendChild(particle);
    
    applyAnimation(particle, type, {
      ...animations.successCelebration,
      delay: i * 50
    });
    
    // Remove particle after animation
    setTimeout(() => {
      particle.remove();
    }, animations.successCelebration.duration + (i * 50));
  }
};

/**
 * XP counter animation
 */
export const animateXPCounter = (
  element: HTMLElement,
  startValue: number,
  endValue: number,
  gradeLevel: string
): void => {
  const animations = getAnimationSet(gradeLevel);
  const duration = animations.xpCounter.duration;
  const steps = 30;
  const stepDuration = duration / steps;
  const increment = (endValue - startValue) / steps;
  
  let currentValue = startValue;
  let step = 0;
  
  const interval = setInterval(() => {
    step++;
    currentValue += increment;
    
    if (step >= steps) {
      currentValue = endValue;
      clearInterval(interval);
    }
    
    element.textContent = `+${Math.round(currentValue)} XP`;
  }, stepDuration);
};

/**
 * Loading animation
 */
export const showLoading = (
  element: HTMLElement,
  gradeLevel: string
): () => void => {
  const animations = getAnimationSet(gradeLevel);
  
  applyAnimation(element, 'pulse', animations.loadingPulse);
  
  // Return cleanup function
  return () => {
    element.style.animation = '';
  };
};

/**
 * Error shake animation
 */
export const shakeError = (
  element: HTMLElement,
  gradeLevel: string
): void => {
  const animations = getAnimationSet(gradeLevel);
  applyAnimation(element, 'shake', animations.errorShake);
};

/**
 * Progress bar animation
 */
export const animateProgress = (
  progressBar: HTMLElement,
  fromPercent: number,
  toPercent: number,
  gradeLevel: string
): void => {
  const animations = getAnimationSet(gradeLevel);
  
  progressBar.style.transition = `width ${animations.progressUpdate.duration}ms ${animations.progressUpdate.easing}`;
  progressBar.style.width = `${toPercent}%`;
};

/**
 * Inject keyframes into document
 */
export const injectKeyframes = (): void => {
  const styleElement = document.createElement('style');
  styleElement.id = 'bento-animations';
  
  // Check if already injected
  if (document.getElementById('bento-animations')) return;
  
  styleElement.textContent = Object.values(KEYFRAMES).join('\n');
  document.head.appendChild(styleElement);
};

// Auto-inject keyframes when module loads
if (typeof document !== 'undefined') {
  injectKeyframes();
}

export default {
  getAnimationSet,
  applyAnimation,
  staggerAnimation,
  transitionScreen,
  celebrateAchievement,
  animateXPCounter,
  showLoading,
  shakeError,
  animateProgress,
  injectKeyframes,
  COMPANION_ANIMATIONS,
  GRADE_ANIMATIONS,
  KEYFRAMES
};