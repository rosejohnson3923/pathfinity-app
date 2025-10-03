/**
 * Demo Cache Service - Phase 1 Implementation
 *
 * Provides direct access to cached demo user content,
 * bypassing all content generation for fast, reliable demos.
 */

import demoUserCache from '../../data/demoCache/demoUserCache.json';
import { getCacheKeyForUser, logCacheDetection } from '../../utils/cacheUserDetection';

export interface CachedLessonPlan {
  student: {
    name: string;
    grade: string;
    gradeLevel: string;
  };
  career: {
    careerName: string;
    icon?: string;
    color?: string;
  };
  subjects: CachedSubject[];
  lessonSummary: string;
  generatedAt: string;
  source: 'cached_content';
  cached: true;
  estimatedDuration?: string;
  tierFeatures?: any;
  content?: any;
}

export interface CachedSubject {
  subject: string;
  title: string;
  description: string;
  skillNumber: string;
  content?: any;
  cached: true;
}

export interface CachedUserContent {
  user: {
    name: string;
    grade: string;
    gradeLevel: string;
  };
  dashboardCards: any[];
  skills: Record<string, any>;
  [key: string]: any;
}

export class DemoCacheService {

  /**
   * Load user content directly from cache
   */
  static loadUserContent(cacheKey: string): CachedUserContent | null {
    try {
      const userContent = (demoUserCache as any)[cacheKey];

      if (!userContent) {
        console.warn(`No cached content found for user: ${cacheKey}`);
        return null;
      }

      console.log(`✅ Successfully loaded cached content for: ${cacheKey}`);
      return userContent;

    } catch (error) {
      console.error(`Failed to load cached content for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Generate lesson plan from cached content
   */
  static generateCachedLessonPlan(
    userEmail?: string,
    userName?: string,
    careerName?: string
  ): CachedLessonPlan | null {

    // Get cache key for this user
    const cacheKey = getCacheKeyForUser(userEmail, userName);

    if (!cacheKey) {
      console.warn('No cache key found for user:', { userEmail, userName });
      return null;
    }

    // Log cache detection for debugging
    logCacheDetection(userEmail, userName);

    // Load user content from cache
    const userContent = this.loadUserContent(cacheKey);

    if (!userContent) {
      return null;
    }

    try {
      // Transform cached content into lesson plan format
      const lessonPlan: CachedLessonPlan = {
        student: {
          name: userContent.user.name,
          grade: userContent.user.grade,
          gradeLevel: userContent.user.gradeLevel || `Grade ${userContent.user.grade}`
        },
        career: {
          careerName: careerName || 'Default Career',
          icon: '🎯',
          color: '#007AFF'
        },
        subjects: this.transformSubjectsFromCache(userContent),
        lessonSummary: `Cached lesson plan for ${userContent.user.name} exploring ${careerName || 'career skills'} using grade ${userContent.user.grade} activities.`,
        generatedAt: new Date().toISOString(),
        source: 'cached_content',
        cached: true,
        estimatedDuration: '45-60 minutes',
        content: this.transformContentForPDF(userContent)
      };

      console.log(`✅ Generated cached lesson plan for: ${userContent.user.name}`);
      return lessonPlan;

    } catch (error) {
      console.error(`Failed to generate lesson plan for ${cacheKey}:`, error);
      return null;
    }
  }

  /**
   * Transform cached skills into subjects array
   */
  private static transformSubjectsFromCache(userContent: CachedUserContent): CachedSubject[] {
    const subjects: CachedSubject[] = [];

    // Use dashboard cards as primary source for subjects
    if (userContent.dashboardCards) {
      userContent.dashboardCards.forEach(card => {
        subjects.push({
          subject: card.subject,
          title: card.title,
          description: card.description,
          skillNumber: card.skillNumber,
          content: userContent.skills?.[card.subject] || {},
          cached: true
        });
      });
    }

    // Fallback: use skills object directly
    if (subjects.length === 0 && userContent.skills) {
      Object.keys(userContent.skills).forEach(subjectKey => {
        const skillData = userContent.skills[subjectKey];
        const firstSkill = Object.values(skillData)[0] as any;

        if (firstSkill) {
          subjects.push({
            subject: subjectKey,
            title: firstSkill.skill_name || `${subjectKey} Skills`,
            description: firstSkill.skill_description || `Learn ${subjectKey} fundamentals`,
            skillNumber: firstSkill.skill_number || 'A.0',
            content: skillData,
            cached: true
          });
        }
      });
    }

    return subjects;
  }

  /**
   * Transform content for PDF compatibility
   */
  private static transformContentForPDF(userContent: CachedUserContent): any {
    const subjectContents: Record<string, any> = {};

    // Transform each subject's content for PDF generation
    if (userContent.skills) {
      Object.keys(userContent.skills).forEach(subject => {
        const skillData = userContent.skills[subject];

        subjectContents[subject] = {
          challenges: this.extractChallengesFromSkills(skillData),
          setup: `Interactive ${subject} activities using grade ${userContent.user.grade} skills`,
          narrative: `Engaging ${subject} content designed for ${userContent.user.name}`,
          source: 'cached_content'
        };
      });
    }

    return {
      subjectContents,
      cached: true,
      generatedFrom: 'demoUserCache'
    };
  }

  /**
   * Extract challenges from skills data for PDF
   */
  private static extractChallengesFromSkills(skillData: any): any[] {
    const challenges: any[] = [];

    Object.values(skillData).forEach((skill: any) => {
      if (skill && typeof skill === 'object') {
        challenges.push({
          fullChallenge: {
            description: skill.skill_description || 'Practice activity',
            question: `How would you apply ${skill.skill_name || 'this skill'} in real-world scenarios?`,
            difficulty: skill.difficulty_level || 3,
            estimatedTime: skill.estimated_time_minutes || 25
          },
          hasDescription: true,
          description: skill.skill_description || 'Practice activity',
          hasQuestion: true,
          question: `How would you apply ${skill.skill_name || 'this skill'} in real-world scenarios?`,
          cached: true
        });
      }
    });

    // Ensure at least one challenge exists
    if (challenges.length === 0) {
      challenges.push({
        fullChallenge: {
          description: 'Interactive learning activity',
          question: 'How would you use these skills in your future career?',
          difficulty: 3,
          estimatedTime: 25
        },
        hasDescription: true,
        description: 'Interactive learning activity',
        hasQuestion: true,
        question: 'How would you use these skills in your future career?',
        cached: true
      });
    }

    return challenges;
  }

  /**
   * Validate that cache contains expected users
   */
  static validateCacheContent(): boolean {
    const requiredUsers = ['Zara Jones', 'Alexis Martin', 'David Brown', 'Mike Johnson'];
    const missingUsers: string[] = [];

    requiredUsers.forEach(userName => {
      const userContent = this.loadUserContent(userName);
      if (!userContent) {
        missingUsers.push(userName);
      }
    });

    if (missingUsers.length > 0) {
      console.error('Missing cached content for users:', missingUsers);
      return false;
    }

    console.log('✅ Cache validation successful - all required users present');
    return true;
  }

  /**
   * Get available cached users
   */
  static getAvailableCachedUsers(): string[] {
    try {
      return Object.keys(demoUserCache as any).filter(key => !key.startsWith('_'));
    } catch (error) {
      console.error('Failed to get cached users:', error);
      return [];
    }
  }

  /**
   * Debug function to inspect cached content
   */
  static debugCacheContent(cacheKey: string): void {
    const content = this.loadUserContent(cacheKey);

    if (content) {
      console.log(`🔍 Cache Debug for ${cacheKey}:`, {
        hasUser: !!content.user,
        hasDashboardCards: !!content.dashboardCards,
        dashboardCardCount: content.dashboardCards?.length || 0,
        hasSkills: !!content.skills,
        skillSubjects: content.skills ? Object.keys(content.skills) : [],
        userGrade: content.user?.grade,
        userName: content.user?.name
      });
    } else {
      console.log(`❌ No cached content found for: ${cacheKey}`);
    }
  }
}