/**
 * Loading Screen Narration Service
 * Selects and plays appropriate narration from MasterNarrative during loading screens
 */

import { MasterNarrative } from './narrative/MasterNarrativeGenerator';
import { ScriptId } from '../constants/scriptRegistry';

export interface NarrationContent {
  text: string;
  scriptId: ScriptId;
  variables: Record<string, string>;
  duration?: number;
}

export class LoadingNarrationService {
  private lastNarrationKey: string | null = null;
  private narrationHistory: Set<string> = new Set();
  private currentSubject: string | null = null;
  private factIndexMap: Map<string, number> = new Map();

  /**
   * Main method to select appropriate narration for loading screen
   */
  public selectNarration(
    masterNarrative: MasterNarrative | null,
    container: 'learn' | 'experience' | 'discover',
    subject: 'math' | 'ela' | 'science' | 'socialStudies',
    phase: 'instruction' | 'practice' | 'assessment',
    isFirstLoad: boolean,
    studentName: string
  ): NarrationContent | null {
    console.log('🎯 LoadingNarration: Selecting narration', {
      hasMasterNarrative: !!masterNarrative,
      container,
      subject,
      phase,
      isFirstLoad,
      hasFunFacts: !!masterNarrative?.subjectContextsAlignedFacts
    });

    if (!masterNarrative) {
      return null;
    }

    // Check if this is the first time entering a container
    if (isFirstLoad) {
      return this.getContainerIntroduction(masterNarrative, container, subject, studentName);
    }

    // Check if subject changed
    if (this.hasSubjectChanged(subject)) {
      return this.getSubjectTransition(masterNarrative, container, subject, studentName);
    }

    // Get a fun fact for the current subject
    return this.getSubjectFunFact(masterNarrative, subject, phase, studentName);
  }

  /**
   * Get container introduction narration
   */
  private getContainerIntroduction(
    narrative: MasterNarrative,
    container: 'learn' | 'experience' | 'discover',
    subject: string,
    studentName: string
  ): NarrationContent {
    const containerName = container.charAt(0).toUpperCase() + container.slice(1);
    const journeyText = narrative.journeyArc[container];

    // Get a fun fact for the subject
    const fact = this.getRandomFact(narrative, subject);

    // Just return the fun fact without "Loading container..." prefix
    return {
      text: fact || journeyText,
      scriptId: 'loading.funfact',
      variables: {
        factText: fact || journeyText,
        subject: subject,
        container: container
      },
      duration: 5000
    };
  }

  /**
   * Get subject transition narration
   */
  private getSubjectTransition(
    narrative: MasterNarrative,
    container: 'learn' | 'experience' | 'discover',
    subject: string,
    studentName: string
  ): NarrationContent {
    const subjectName = this.formatSubjectName(subject);
    const fact = this.getRandomFact(narrative, subject);

    // If no fact, use the subject context for this container
    const fallback = narrative.subjectContextsAligned?.[subject]?.[container] ||
                    `Time to explore ${subjectName}!`;

    // Just return the fun fact without "Preparing lesson..." prefix
    return {
      text: fact || fallback,
      scriptId: 'loading.subject.funfact',
      variables: {
        subject: subjectName,
        factText: fact || fallback
      },
      duration: 4000
    };
  }

  /**
   * Get subject-specific fun fact
   */
  private getSubjectFunFact(
    narrative: MasterNarrative,
    subject: string,
    phase: string,
    studentName: string
  ): NarrationContent | null {
    const fact = this.getRandomFact(narrative, subject);

    if (!fact) {
      // Use mission reminder as fallback
      return this.getMissionReminder(narrative, studentName);
    }

    const scriptId = `loading.fact.${subject === 'socialStudies' ? 'social_studies' : subject}` as ScriptId;

    return {
      text: fact,
      scriptId,
      variables: {
        factText: fact
      },
      duration: 4000
    };
  }

  /**
   * Get a random fact for the subject
   */
  private getRandomFact(narrative: MasterNarrative, subject: string): string | null {
    if (!narrative.subjectContextsAlignedFacts) {
      console.log('⚠️ LoadingNarration: No subjectContextsAlignedFacts in narrative');
      return null;
    }

    const facts = narrative.subjectContextsAlignedFacts[subject as keyof typeof narrative.subjectContextsAlignedFacts];

    if (!facts || facts.length === 0) {
      console.log('⚠️ LoadingNarration: No facts found for subject:', subject);
      return null;
    }

    // Get the index for this subject, cycling through facts
    const key = `${subject}_facts`;
    let index = this.factIndexMap.get(key) || 0;

    // Get the fact at the current index
    const fact = facts[index % facts.length];

    // Increment index for next time
    this.factIndexMap.set(key, index + 1);

    console.log('✨ LoadingNarration: Selected fun fact:', {
      subject,
      factIndex: index % facts.length,
      fact: fact.substring(0, 50) + '...'
    });

    return fact;
  }

  /**
   * Get mission reminder narration
   */
  private getMissionReminder(
    narrative: MasterNarrative,
    studentName: string
  ): NarrationContent {
    return {
      text: `Remember, ${studentName}, your mission as a ${narrative.character.role} is to ${narrative.cohesiveStory.mission}!`,
      scriptId: 'loading.career.mission',
      variables: {
        firstName: studentName,
        careerRole: narrative.character.role,
        mission: narrative.cohesiveStory.mission
      },
      duration: 5000
    };
  }

  /**
   * Check if subject has changed
   */
  private hasSubjectChanged(subject: string): boolean {
    const changed = this.currentSubject !== subject;
    this.currentSubject = subject;
    return changed;
  }

  /**
   * Format subject name for display
   */
  private formatSubjectName(subject: string): string {
    const names: Record<string, string> = {
      'math': 'Math',
      'ela': 'Language Arts',
      'science': 'Science',
      'socialStudies': 'Social Studies'
    };
    return names[subject] || subject;
  }

  /**
   * Reset the service state
   */
  public reset(): void {
    this.lastNarrationKey = null;
    this.narrationHistory.clear();
    this.currentSubject = null;
    this.factIndexMap.clear();
  }
}

// Export singleton instance
export const loadingNarrationService = new LoadingNarrationService();