/**
 * Emotion Detection Service
 * Analyzes text for emotional indicators and provides appropriate responses
 */

export type EmotionType =
  | 'happy'
  | 'excited'
  | 'confused'
  | 'frustrated'
  | 'sad'
  | 'anxious'
  | 'bored'
  | 'curious'
  | 'proud'
  | 'neutral';

export interface EmotionAnalysis {
  primary: EmotionType;
  confidence: number;
  indicators: string[];
  suggestedResponse: string;
}

class EmotionDetectionService {
  // Emotion keyword patterns
  private emotionPatterns: Record<EmotionType, RegExp[]> = {
    happy: [
      /\b(happy|great|awesome|wonderful|good|nice|love|yay|hooray|yes)\b/i,
      /😊|😃|😄|🙂|😁|👍|❤️/,
      /\b(thank you|thanks|appreciate)\b/i
    ],
    excited: [
      /\b(excited|amazing|wow|cool|fantastic|incredible|can't wait)\b/i,
      /!{2,}/,
      /🎉|🎊|🤩|✨|🔥/
    ],
    confused: [
      /\b(confused|don't understand|what|huh|lost|unclear|confusing)\b/i,
      /\?{2,}/,
      /🤔|😕|🤷|❓/,
      /\b(how does|why does|what is|can you explain)\b/i
    ],
    frustrated: [
      /\b(frustrated|annoying|stupid|hate|ugh|argh|difficult|hard|can't)\b/i,
      /😤|😠|😡|🤬|😾/,
      /\b(this is too|I give up|whatever)\b/i
    ],
    sad: [
      /\b(sad|unhappy|crying|tears|miss|lonely|hurt)\b/i,
      /😢|😭|😔|☹️|💔/,
      /\b(feel bad|feeling down)\b/i
    ],
    anxious: [
      /\b(anxious|worried|nervous|scared|afraid|stress|overwhelmed)\b/i,
      /😰|😨|😱|😟|😬/,
      /\b(what if|might fail|too much)\b/i
    ],
    bored: [
      /\b(bored|boring|dull|whatever|meh|sleepy|tired)\b/i,
      /😴|🥱|😑|😐/,
      /\b(nothing to do|same thing)\b/i
    ],
    curious: [
      /\b(curious|wonder|interesting|tell me more|how|why|what)\b/i,
      /🤓|🧐|💭|💡/,
      /\b(I want to know|can you show|let's explore)\b/i
    ],
    proud: [
      /\b(proud|accomplished|did it|finished|solved|got it|nailed it)\b/i,
      /💪|🏆|🥇|⭐|🌟/,
      /\b(look what I|I figured|I made)\b/i
    ],
    neutral: [
      /\b(ok|okay|sure|alright|fine)\b/i,
      /\./
    ]
  };

  // Response adjustments based on emotions
  private emotionResponses: Record<EmotionType, string> = {
    happy: "I'm so glad you're feeling positive! Let's keep this momentum going. ",
    excited: "Your enthusiasm is wonderful! Let's channel that energy into learning. ",
    confused: "I understand this might be confusing. Let me break it down step by step. ",
    frustrated: "I can see this is challenging. Let's take a different approach. ",
    sad: "I'm here to help and support you. Let's work through this together. ",
    anxious: "No worries at all! We'll take this one step at a time. ",
    bored: "Let's make this more interesting! How about we try a different activity? ",
    curious: "Great question! I love your curiosity. Let's explore this together. ",
    proud: "Fantastic work! You should be proud of yourself! ",
    neutral: ""
  };

  /**
   * Detect emotion from message text
   */
  public detectEmotion(message: string): EmotionAnalysis {
    const scores: Record<EmotionType, number> = {
      happy: 0,
      excited: 0,
      confused: 0,
      frustrated: 0,
      sad: 0,
      anxious: 0,
      bored: 0,
      curious: 0,
      proud: 0,
      neutral: 0
    };

    const indicators: string[] = [];

    // Check each emotion pattern
    for (const [emotion, patterns] of Object.entries(this.emotionPatterns)) {
      for (const pattern of patterns) {
        const matches = message.match(pattern);
        if (matches) {
          scores[emotion as EmotionType] += 1;
          indicators.push(matches[0]);
        }
      }
    }

    // Find primary emotion
    let primary: EmotionType = 'neutral';
    let maxScore = 0;

    for (const [emotion, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        primary = emotion as EmotionType;
      }
    }

    // If no clear emotion detected, check for question marks (curiosity)
    if (primary === 'neutral' && message.includes('?')) {
      primary = 'curious';
      indicators.push('?');
      maxScore = 0.5;
    }

    // Calculate confidence (0-1 scale)
    const confidence = Math.min(maxScore / 3, 1);

    return {
      primary,
      confidence,
      indicators,
      suggestedResponse: this.emotionResponses[primary]
    };
  }

  /**
   * Get emotion-aware prompt enhancement
   */
  public getEmotionPrompt(emotion: EmotionAnalysis): string {
    if (emotion.confidence < 0.3) {
      return ''; // Not confident enough
    }

    const prompts: Record<EmotionType, string> = {
      happy: '\n\nThe student seems happy and engaged. Maintain their positive energy.',
      excited: '\n\nThe student is very excited. Match their enthusiasm while keeping them focused.',
      confused: '\n\nThe student appears confused. Provide clear, step-by-step explanations.',
      frustrated: '\n\nThe student seems frustrated. Be extra patient and encouraging. Offer alternative approaches.',
      sad: '\n\nThe student might be feeling down. Be extra supportive and gentle.',
      anxious: '\n\nThe student seems anxious. Be reassuring and break things into small, manageable steps.',
      bored: '\n\nThe student seems bored. Make the content more engaging with examples or activities.',
      curious: '\n\nThe student is curious and asking questions. Encourage their exploration.',
      proud: '\n\nThe student is proud of their achievement. Celebrate with them and build on their success.',
      neutral: ''
    };

    return prompts[emotion.primary];
  }

  /**
   * Check if emotion indicates need for intervention
   */
  public needsIntervention(emotion: EmotionAnalysis): boolean {
    const concerningEmotions: EmotionType[] = ['frustrated', 'sad', 'anxious'];
    return concerningEmotions.includes(emotion.primary) && emotion.confidence > 0.7;
  }

  /**
   * Get companion-specific emotional response
   */
  public getCompanionResponse(companionId: string, emotion: EmotionAnalysis): string {
    if (emotion.confidence < 0.5) return '';

    const companionResponses: Record<string, Record<EmotionType, string>> = {
      pat: {
        happy: "🧭 Your positive attitude will guide you far! ",
        excited: "🧭 I love your enthusiasm for exploration! ",
        confused: "🧭 Let me help navigate you through this. ",
        frustrated: "🧭 Every explorer faces challenges. We'll find another path. ",
        sad: "🧭 I'm here to guide you through this. ",
        anxious: "🧭 No need to worry, we'll navigate this together. ",
        bored: "🧭 Let's explore something new and exciting! ",
        curious: "🧭 Excellent question! Let's explore that path. ",
        proud: "🧭 You've navigated this brilliantly! ",
        neutral: ""
      },
      finn: {
        happy: "Your adventurous spirit shines bright! ",
        excited: "This is an amazing adventure! ",
        confused: "Every adventure has puzzles to solve. Let's figure this out! ",
        frustrated: "Adventures can be tough, but that's what makes them exciting! ",
        sad: "Even adventurers have tough days. I'm here with you. ",
        anxious: "Every great adventurer feels nervous sometimes. You've got this! ",
        bored: "Time for a new adventure! ",
        curious: "Ah, an explorer's question! Let's discover the answer! ",
        proud: "What an incredible achievement, adventurer! ",
        neutral: ""
      },
      sage: {
        happy: "Your joy in learning is wisdom itself. ",
        excited: "Channel that enthusiasm into deep understanding. ",
        confused: "Confusion is the beginning of wisdom. Let's clarify. ",
        frustrated: "Patience, young scholar. Understanding takes time. ",
        sad: "Even in difficulty, there is learning. ",
        anxious: "Take a breath. Wisdom comes one step at a time. ",
        bored: "Let's find the deeper meaning that engages you. ",
        curious: "An excellent inquiry. Let's examine this thoroughly. ",
        proud: "You've demonstrated true understanding. Well done. ",
        neutral: ""
      },
      spark: {
        happy: "Your creativity is sparkling! ✨ ",
        excited: "Yes! That creative energy is amazing! ",
        confused: "Let's look at this from a creative angle! ",
        frustrated: "Every creator faces blocks. Let's break through! ",
        sad: "Creating can be emotional. Let's channel those feelings. ",
        anxious: "Breathe and create. No pressure, just expression! ",
        bored: "Time to spark some creativity! ",
        curious: "Ooh, I love where your mind is going! ",
        proud: "You created something amazing! ",
        neutral: ""
      },
      harmony: {
        happy: "Your happiness brings such positive energy. ",
        excited: "I feel your excitement! Let's use it mindfully. ",
        confused: "It's okay to be confused. Let's find clarity together. ",
        frustrated: "I understand your frustration. Let's breathe and refocus. ",
        sad: "I'm here for you. Your feelings are valid. ",
        anxious: "Let's take this calmly, one breath at a time. ",
        bored: "Let's find what brings you peace and interest. ",
        curious: "Your thoughtful questions bring balance to learning. ",
        proud: "You've found your rhythm. Beautiful work! ",
        neutral: ""
      }
    };

    const responses = companionResponses[companionId] || companionResponses.pat;
    return responses[emotion.primary] || '';
  }
}

export const emotionDetectionService = new EmotionDetectionService();