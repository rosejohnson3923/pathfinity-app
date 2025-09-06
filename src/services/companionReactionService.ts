/**
 * Companion Reaction Service
 * AI companions react to student learning metrics in real-time
 */

interface CompanionReaction {
  message: string;
  emotion: 'happy' | 'encouraging' | 'proud' | 'supportive' | 'excited';
  animation?: string;
  voiceSpeed?: number; // 0.8 = slower, 1.2 = faster
}

export class CompanionReactionService {
  private static instance: CompanionReactionService;
  
  // Companion personalities affect their reactions
  private companionPersonalities = {
    'finn-expert': {
      style: 'professional',
      encouragementLevel: 'moderate',
      celebrationStyle: 'achievement-focused'
    },
    'finn': {  // Playful explorer for young learners
      style: 'playful',
      encouragementLevel: 'high',
      celebrationStyle: 'party-mode'
    },
    'sage': {  // Wise mentor for middle grades
      style: 'calm',
      encouragementLevel: 'gentle',
      celebrationStyle: 'wisdom-sharing'
    },
    'spark': {  // Energetic innovator for teens
      style: 'energetic',
      encouragementLevel: 'intense',
      celebrationStyle: 'mission-complete'
    },
    'harmony': {  // Professional guide for high school
      style: 'professional',
      encouragementLevel: 'moderate',
      celebrationStyle: 'achievement-focused'
    },
    // Legacy aliases for backward compatibility
    'luna': {  // Old name, redirect to sage
      style: 'calm',
      encouragementLevel: 'gentle',
      celebrationStyle: 'wisdom-sharing'
    },
    'max': {  // Old name, redirect to spark
      style: 'energetic',
      encouragementLevel: 'intense',
      celebrationStyle: 'mission-complete'
    },
    'zara': {  // Old name, redirect to spark
      style: 'energetic',
      encouragementLevel: 'intense',
      celebrationStyle: 'mission-complete'
    },
    'friendly-helper': {
      style: 'playful',
      encouragementLevel: 'high',
      celebrationStyle: 'party-mode'
    },
    'wise-mentor': {
      style: 'calm',
      encouragementLevel: 'gentle',
      celebrationStyle: 'wisdom-sharing'
    },
    'adventure-guide': {
      style: 'energetic',
      encouragementLevel: 'intense',
      celebrationStyle: 'mission-complete'
    }
  };

  static getInstance(): CompanionReactionService {
    if (!CompanionReactionService.instance) {
      CompanionReactionService.instance = new CompanionReactionService();
    }
    return CompanionReactionService.instance;
  }

  /**
   * Get companion's reaction based on learning event
   */
  getCompanionReaction(
    eventType: string,
    companionId: string = 'finn-expert',
    context?: any
  ): CompanionReaction {
    const personality = this.companionPersonalities[companionId] || this.companionPersonalities['finn-expert'];
    
    switch (eventType) {
      case 'streak_3':
        return this.getStreakReaction(3, personality, context);
      
      case 'streak_5':
        return this.getStreakReaction(5, personality, context);
      
      case 'streak_10':
        return this.getStreakReaction(10, personality, context);
      
      case 'struggling':
        return this.getStrugglingReaction(personality, context);
      
      case 'fast_pace':
        return this.getFastPaceReaction(personality, context);
      
      case 'slow_pace':
        return this.getSlowPaceReaction(personality, context);
      
      case 'correct_answer':
        return this.getCorrectAnswerReaction(personality, context);
      
      case 'incorrect_answer':
        return this.getIncorrectAnswerReaction(personality, context);
      
      case 'hint_used':
        return this.getHintReaction(personality, context);
      
      default:
        return this.getDefaultReaction(personality);
    }
  }

  /**
   * Streak celebrations - personality-based
   */
  private getStreakReaction(streak: number, personality: any, context?: any): CompanionReaction {
    const career = context?.career || 'Explorer';
    
    if (personality.style === 'playful') {
      const messages = {
        3: `WOW! 3 in a row! You're becoming a super ${career}! Let's keep this party going! 🎉`,
        5: `AMAZING! 5 correct! You're unstoppable! The ${career} world needs heroes like you! 🌟`,
        10: `INCREDIBLE! 10 IN A ROW! You're a ${career} LEGEND in the making! 🚀🎆🏆`
      };
      return {
        message: messages[streak as keyof typeof messages] || `${streak} streak! Awesome!`,
        emotion: 'excited',
        animation: 'jump',
        voiceSpeed: 1.2
      };
    }
    
    if (personality.style === 'calm') {
      const messages = {
        3: `Three correct answers. Your understanding of ${career} concepts is growing steadily.`,
        5: `Five in a row. You're demonstrating excellent ${career} thinking patterns.`,
        10: `Ten consecutive correct answers. Your mastery is truly impressive.`
      };
      return {
        message: messages[streak as keyof typeof messages] || `${streak} correct. Well done.`,
        emotion: 'proud',
        animation: 'nod',
        voiceSpeed: 0.9
      };
    }
    
    if (personality.style === 'energetic') {
      const messages = {
        3: `Mission update: 3 objectives complete! ${career} training progressing perfectly!`,
        5: `Alert! 5 successful missions! You're ready for advanced ${career} operations!`,
        10: `MISSION ACCOMPLISHED! 10 perfect executions! Elite ${career} status achieved!`
      };
      return {
        message: messages[streak as keyof typeof messages] || `${streak} missions complete!`,
        emotion: 'excited',
        animation: 'salute',
        voiceSpeed: 1.1
      };
    }
    
    // Default professional
    const messages = {
      3: `Excellent work! Three correct answers shows you're grasping ${career} fundamentals.`,
      5: `Outstanding! Five in a row demonstrates strong ${career} aptitude.`,
      10: `Exceptional performance! Ten correct shows mastery of these ${career} concepts.`
    };
    return {
      message: messages[streak as keyof typeof messages] || `${streak} correct. Excellent progress.`,
      emotion: 'proud',
      animation: 'thumbsup',
      voiceSpeed: 1.0
    };
  }

  /**
   * Struggling support - extra gentle
   */
  private getStrugglingReaction(personality: any, context?: any): CompanionReaction {
    const skill = context?.skill || 'this concept';
    
    const messages = {
      'playful': `Hey, ${skill} can be tricky! Let's try a different way - I know you can do this! Want me to show you a fun trick?`,
      'calm': `${skill} takes time to understand. Let's break it down into smaller pieces together.`,
      'energetic': `Mission challenge detected! Don't worry, every hero faces tough missions. Let's tackle ${skill} step by step!`,
      'professional': `I see ${skill} is challenging. That's perfectly normal. Let me explain it differently.`
    };
    
    return {
      message: messages[personality.style] || messages['professional'],
      emotion: 'supportive',
      animation: 'comfort',
      voiceSpeed: 0.85 // Slower when explaining
    };
  }

  /**
   * Fast pace recognition
   */
  private getFastPaceReaction(personality: any, context?: any): CompanionReaction {
    const messages = {
      'playful': `Zoom zoom! You're super fast! Ready for something more challenging? 🚀`,
      'calm': `You're working efficiently. Shall we explore more advanced concepts?`,
      'energetic': `Lightning speed detected! Time for ADVANCED MISSIONS!`,
      'professional': `Excellent pace. You might be ready for more challenging material.`
    };
    
    return {
      message: messages[personality.style] || messages['professional'],
      emotion: 'excited',
      animation: 'sparkle',
      voiceSpeed: 1.1
    };
  }

  /**
   * Slow pace support
   */
  private getSlowPaceReaction(personality: any, context?: any): CompanionReaction {
    const messages = {
      'playful': `Take all the time you need! Learning isn't a race - it's an adventure! 🌈`,
      'calm': `There's no rush. Understanding deeply is more important than speed.`,
      'energetic': `Strategic thinking detected! Good agents think before they act!`,
      'professional': `Taking time to think carefully is a sign of thorough learning.`
    };
    
    return {
      message: messages[personality.style] || messages['professional'],
      emotion: 'encouraging',
      animation: 'patient',
      voiceSpeed: 0.9
    };
  }

  /**
   * Correct answer celebration
   */
  private getCorrectAnswerReaction(personality: any, context?: any): CompanionReaction {
    const skill = context?.skill || 'that';
    const career = context?.career || 'learning';
    
    // ALWAYS include career context in messages
    const messages = {
      'playful': [
        `YES! Perfect ${career} thinking! 🎉`,
        `Woohoo! You're an amazing ${career}!`,
        `Perfect! Just like a real ${career}!`,
        `Nailed it! Great ${career} skills! ✋`
      ],
      'calm': [
        `Correct. Excellent ${career} work.`,
        `That's right. Good ${career} thinking.`,
        `Exactly. A true ${career} understands ${skill}.`,
        `Perfect ${career} answer.`
      ],
      'energetic': [
        `${career.toUpperCase()} MISSION SUCCESS!`,
        `Target hit! Great ${career} shot!`,
        `${career} objective complete!`,
        `${career} excellence achieved!`
      ],
      'professional': [
        `Correct! Excellent ${career} work.`,
        `That's right. Good ${career} thinking.`,
        `Perfect. A ${career} masters ${skill}.`,
        `Exactly right, future ${career}.`
      ]
    };
    
    const styleMessages = messages[personality.style] || messages['professional'];
    const randomMessage = styleMessages[Math.floor(Math.random() * styleMessages.length)];
    
    return {
      message: randomMessage,
      emotion: 'happy',
      animation: 'celebrate',
      voiceSpeed: 1.0
    };
  }

  /**
   * Incorrect answer support
   */
  private getIncorrectAnswerReaction(personality: any, context?: any): CompanionReaction {
    const attempts = context?.attempts || 1;
    const career = context?.career || 'learner';
    
    const messages = {
      'playful': [
        `Oops! Not quite, but ${career}s learn from tries! Try again!`,
        `Almost! Let's think like a ${career}...`,
        `Good ${career} effort! Want a hint? I'm here to help!`
      ],
      'calm': [
        `Not quite. ${career}s reconsider and try again.`,
        `That's not it, but ${career}s learn from mistakes.`,
        `Let's think through this like a ${career}.`
      ],
      'energetic': [
        `${career} mission retry! Every ${career} needs practice!`,
        `Not the target, but ${career}s don't give up!`,
        `Recalculating ${career} approach... Try again!`
      ],
      'professional': [
        `That's not correct. ${career}s review and retry.`,
        `Not quite right. Let's use ${career} thinking...`,
        `Let's work through this like a ${career}.`
      ]
    };
    
    const styleMessages = messages[personality.style] || messages['professional'];
    const messageIndex = Math.min(attempts - 1, styleMessages.length - 1);
    
    return {
      message: styleMessages[messageIndex],
      emotion: 'encouraging',
      animation: 'thinking',
      voiceSpeed: 0.95
    };
  }

  /**
   * Hint usage acknowledgment
   */
  private getHintReaction(personality: any, context?: any): CompanionReaction {
    const messages = {
      'playful': `Good idea using a hint! Smart learners know when to ask for help! 💡`,
      'calm': `Using hints is a wise learning strategy. Let me guide you.`,
      'energetic': `Tactical support requested! Here's your intel, agent!`,
      'professional': `Here's a hint to help you understand better.`
    };
    
    return {
      message: messages[personality.style] || messages['professional'],
      emotion: 'supportive',
      animation: 'hint',
      voiceSpeed: 0.95
    };
  }

  /**
   * Default reaction
   */
  private getDefaultReaction(personality: any): CompanionReaction {
    return {
      message: `Keep going! You're doing great!`,
      emotion: 'encouraging',
      animation: 'idle',
      voiceSpeed: 1.0
    };
  }

  /**
   * Get dynamic encouragement based on progress
   */
  getDynamicEncouragement(
    accuracy: number,
    streak: number,
    companionId: string,
    career: string
  ): string {
    const personality = this.companionPersonalities[companionId];
    
    if (accuracy >= 80 && streak >= 3) {
      return `You're mastering ${career} skills like a pro! Keep this momentum going!`;
    } else if (accuracy >= 60) {
      return `Good progress on your ${career} journey! Let's keep practicing!`;
    } else if (accuracy < 40) {
      return `Learning ${career} skills takes time. I'm here to help every step of the way!`;
    } else {
      return `You're building strong ${career} foundations. Every expert started here!`;
    }
  }
}

export const companionReactionService = CompanionReactionService.getInstance();