/**
 * PathIQ Intelligence Service V2
 * Database-driven career selection with premium tier support
 */

import { supabase } from '../lib/supabase';
import { subscriptionService } from './subscriptionService';

interface CareerData {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: string;
  description?: string;
  skills?: string[];
  dailyTasks?: string[];
  level?: string;
  accessTier?: 'basic' | 'premium';
  salaryRange?: string;
  growthOutlook?: string;
  educationRequired?: string;
}

interface CareerRating {
  careerId: string;
  name: string;
  icon: string;
  color: string;
  score: number;
  matchReasons: string[];
  skillAlignment: number;
  interestAlignment: number;
  previousExposure: number;
  peerSuccess: number;
  marketDemand: number;
  isPremium?: boolean;
}

interface PathIQProfile {
  userId: string;
  careerPreferences: Map<string, number>;
  learningPatterns: {
    bestTimeOfDay: string;
    preferredPace: 'slow' | 'medium' | 'fast';
    visualLearner: boolean;
    audioLearner: boolean;
    kinestheticLearner: boolean;
  };
  careerExposureHistory: {
    careerId: string;
    date: Date;
    engagementScore: number;
    completionRate: number;
    category?: string;
    selectionType?: 'recommended' | 'passion';
  }[];
  passionIndicators: {
    topic: string;
    score: number;
  }[];
}

class PathIQServiceV2 {
  private static instance: PathIQServiceV2;
  private profiles: Map<string, PathIQProfile> = new Map();
  private careersCache: Map<string, CareerData[]> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime = 0;

  private constructor() {}

  static getInstance(): PathIQServiceV2 {
    if (!PathIQServiceV2.instance) {
      PathIQServiceV2.instance = new PathIQServiceV2();
    }
    return PathIQServiceV2.instance;
  }

  /**
   * Load careers from database based on grade level and premium status
   */
  private async loadCareersFromDatabase(gradeLevel: string): Promise<CareerData[]> {
    try {
      // Check cache first
      const cacheKey = `careers_${gradeLevel}`;
      if (this.careersCache.has(cacheKey) && Date.now() - this.lastCacheTime < this.cacheExpiry) {
        return this.careersCache.get(cacheKey)!;
      }

      const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

      // Get supabase client
      const supabaseClient = await supabase();

      console.log(`🔍 Querying careers for grade ${gradeLevel} (numeric: ${gradeNum})`);

      // First, let's check what's actually in the database
      const { count: totalCount, error: countError } = await supabaseClient
        .from('career_paths')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('❌ Error counting careers:', countError);
        console.error('Details:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint,
          code: countError.code
        });
      }

      console.log(`📊 Total careers in database: ${totalCount || 0}`);

      // Query database for careers appropriate for this grade level
      // A career is appropriate if the student's grade falls within or above the career's range
      // E.g., Grade 6 student (gradeNum=6) should see:
      //   - Elementary careers: min=0, max=5 (6 >= 0, so include)
      //   - Middle school careers: min=6, max=8 (6 >= 6 AND 6 <= 8, so include)
      //   - NOT high school careers: min=9, max=12 (6 < 9, so exclude)
      const { data: careers, error } = await supabaseClient
        .from('career_paths')
        .select('*')
        .lte('min_grade_level_num', gradeNum)  // Career starts at or before student's grade
        .order('access_tier', { ascending: false }) // Premium first
        .order('sort_order')
        .order('career_name');

      if (error) {
        console.error('❌ Error loading careers from database:', error);
        console.error('Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return [];
      }

      console.log(`✅ Retrieved ${careers?.length || 0} careers from database`);

      // Debug: Log grade level distribution
      if (careers && careers.length > 0) {
        const gradeBreakdown = {
          elementary: careers.filter(c => c.grade_category === 'elementary').length,
          middle: careers.filter(c => c.grade_category === 'middle').length,
          high: careers.filter(c => c.grade_category === 'high').length
        };
        console.log('Grade category breakdown:', gradeBreakdown);

        // Log a few sample careers to see their grade ranges
        console.log('Sample careers with grade ranges:');
        careers.slice(0, 3).forEach(c => {
          console.log(`  ${c.career_name}: min=${c.min_grade_level}(${c.min_grade_level_num}), max=${c.max_grade_level}(${c.max_grade_level_num}), category=${c.grade_category}`);
        });
      }

      // Now filter based on grade level if min_grade_level_num exists
      const filteredCareers = careers?.filter(career => {
        // If min_grade_level_num is null, include the career
        if (career.min_grade_level_num === null || career.min_grade_level_num === undefined) {
          console.log(`⚠️ Career ${career.career_name} has no min_grade_level_num, including it`);
          return true;
        }
        // Otherwise check if grade level is appropriate
        return career.min_grade_level_num <= gradeNum;
      }) || [];

      console.log(`📝 After grade filtering: ${filteredCareers.length} careers for grade ${gradeLevel}`);

      // Transform database records to CareerData format
      const transformedCareers = filteredCareers?.map(career => ({
        id: career.career_code,
        name: career.career_name,
        icon: career.icon || '💼',
        color: career.color || '#6B7280',
        category: career.career_category || career.grade_category,
        description: career.description,
        skills: career.required_skills || [],
        dailyTasks: career.daily_tasks || [],
        level: this.getGradeLevelCategory(gradeNum),
        accessTier: career.access_tier,
        salaryRange: career.salary_range,
        growthOutlook: career.growth_outlook,
        educationRequired: career.education_required
      })) || [];

      // Cache the results
      this.careersCache.set(cacheKey, transformedCareers);
      this.lastCacheTime = Date.now();

      return transformedCareers;
    } catch (error) {
      console.error('Failed to load careers from database:', error);
      return [];
    }
  }

  /**
   * Get grade level category
   */
  private getGradeLevelCategory(gradeNum: number): string {
    if (gradeNum === 0) return 'kindergarten';
    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  }

  /**
   * Get careers organized by category for a grade level
   * Checks premium access and filters accordingly
   */
  async getCareersByCategory(gradeLevel: string): Promise<{
    category: { id: string; name: string; icon: string };
    careers: CareerRating[]
  }[]> {
    console.log(`📚 Loading careers for grade ${gradeLevel} from database...`);

    // Load all careers for this grade level
    const allCareers = await this.loadCareersFromDatabase(gradeLevel);

    // Check premium access
    const hasPremiumAccess = await subscriptionService.hasPremiumAccess();

    // Filter careers based on premium access
    const availableCareers = hasPremiumAccess
      ? allCareers
      : allCareers.filter(career => career.accessTier !== 'premium');

    console.log(`Found ${allCareers.length} careers, ${availableCareers.length} available with current access`);

    // Group careers by category
    const categories = this.getCategoriesForGrade(gradeLevel);
    const categorizedCareers = [];

    for (const category of categories) {
      const careersInCategory = availableCareers
        .filter(career => career.category === category.id)
        .map(career => this.convertToCareerRating(career));

      if (careersInCategory.length > 0) {
        categorizedCareers.push({
          category,
          careers: careersInCategory
        });
      }
    }

    // Also include careers marked as premium for display (with lock icons)
    if (!hasPremiumAccess) {
      // Add premium careers back for display purposes (they'll be locked)
      const premiumCareers = allCareers.filter(career => career.accessTier === 'premium');

      for (const category of categories) {
        const premiumInCategory = premiumCareers
          .filter(career => career.category === category.id)
          .map(career => ({
            ...this.convertToCareerRating(career),
            isPremium: true
          }));

        const existingCategory = categorizedCareers.find(c => c.category.id === category.id);
        if (existingCategory && premiumInCategory.length > 0) {
          existingCategory.careers.push(...premiumInCategory);
        } else if (premiumInCategory.length > 0) {
          categorizedCareers.push({
            category,
            careers: premiumInCategory
          });
        }
      }
    }

    return categorizedCareers;
  }

  /**
   * Convert CareerData to CareerRating for compatibility
   */
  private convertToCareerRating(career: CareerData): CareerRating {
    return {
      careerId: career.id,
      name: career.name,
      icon: career.icon,
      color: career.color,
      score: Math.floor(Math.random() * 30) + 70, // Mock score for now
      matchReasons: this.generateMatchReasons(career),
      skillAlignment: Math.random() * 100,
      interestAlignment: Math.random() * 100,
      previousExposure: 0,
      peerSuccess: Math.random() * 100,
      marketDemand: Math.random() * 100,
      isPremium: career.accessTier === 'premium'
    };
  }

  /**
   * Generate match reasons for a career
   */
  private generateMatchReasons(career: CareerData): string[] {
    const reasons = [];

    if (career.growthOutlook === 'High' || career.growthOutlook === 'Growing') {
      reasons.push('High growth field');
    }

    if (career.skills && career.skills.length > 0) {
      reasons.push(`Builds ${career.skills.length} key skills`);
    }

    if (career.salaryRange) {
      reasons.push('Strong earning potential');
    }

    if (reasons.length === 0) {
      reasons.push('Interesting career path');
    }

    return reasons;
  }

  /**
   * Get 3 random careers for PathIQ recommendations
   */
  async get3RandomCareers(gradeLevel: string): Promise<CareerRating[]> {
    const allCareers = await this.loadCareersFromDatabase(gradeLevel);
    const hasPremiumAccess = await subscriptionService.hasPremiumAccess();

    // Filter based on premium access
    const availableCareers = hasPremiumAccess
      ? allCareers
      : allCareers.filter(career => career.accessTier !== 'premium');

    // Shuffle and pick 3
    const shuffled = [...availableCareers].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);

    return selected.map(career => this.convertToCareerRating(career));
  }

  /**
   * Check if user can access a specific career
   */
  async checkCareerAccess(careerId: string, userId?: string): Promise<{
    allowed: boolean;
    career?: CareerData;
    isPremium?: boolean;
    message?: string;
  }> {
    try {
      // Get supabase client
      const supabaseClient = await supabase();

      // Get career from database
      const { data: career, error } = await supabaseClient
        .from('career_paths')
        .select('*')
        .eq('career_code', careerId)
        .single();

      if (error || !career) {
        return { allowed: false, message: 'Career not found' };
      }

      const careerData: CareerData = {
        id: career.career_code,
        name: career.career_name,
        icon: career.icon,
        color: career.color,
        category: career.career_category,
        description: career.description,
        accessTier: career.access_tier
      };

      // Check access
      const accessResult = await subscriptionService.checkCareerAccess(
        careerId,
        career.access_tier
      );

      // Track the selection
      if (userId) {
        await subscriptionService.trackCareerSelection(
          careerId,
          career.access_tier,
          'select'
        );
      }

      return {
        allowed: accessResult.allowed,
        career: careerData,
        isPremium: career.access_tier === 'premium',
        message: accessResult.message
      };
    } catch (error) {
      console.error('Error checking career access:', error);
      return { allowed: false, message: 'Error checking access' };
    }
  }

  /**
   * Get categories for a grade level
   */
  private getCategoriesForGrade(gradeLevel: string): { id: string; name: string; icon: string }[] {
    const gradeNum = gradeLevel === 'K' ? 0 : parseInt(gradeLevel);

    if (gradeNum <= 5) {
      // Elementary categories
      return [
        { id: 'education', name: 'School Helpers', icon: '🏫' },
        { id: 'safety', name: 'Safety Heroes', icon: '🦸' },
        { id: 'health', name: 'Health Helpers', icon: '🏥' },
        { id: 'community', name: 'Community Helpers', icon: '🏘️' },
        { id: 'creative', name: 'Creative People', icon: '🎭' }
      ];
    } else if (gradeNum <= 8) {
      // Middle school categories
      return [
        { id: 'technology', name: 'Tech & Digital', icon: '💻' },
        { id: 'business', name: 'Business & Money', icon: '💼' },
        { id: 'creative', name: 'Creative & Media', icon: '🎨' },
        { id: 'science', name: 'Science & Engineering', icon: '🔬' },
        { id: 'trades', name: 'Skilled Trades', icon: '🔧' },
        { id: 'sports', name: 'Sports & Performance', icon: '🏆' },
        { id: 'service', name: 'Public Service', icon: '⚖️' }
      ];
    } else {
      // High school categories
      return [
        { id: 'technology', name: 'AI & Emerging Tech', icon: '🤖' },
        { id: 'engineering', name: 'Engineering', icon: '⚙️' },
        { id: 'science', name: 'Science & Research', icon: '🧬' },
        { id: 'design', name: 'Design & Creative', icon: '🎨' },
        { id: 'business', name: 'Business Leadership', icon: '👔' },
        { id: 'finance', name: 'Finance', icon: '💰' },
        { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
        { id: 'media', name: 'Media & Gaming', icon: '📱' },
        { id: 'environment', name: 'Future Careers', icon: '🚀' },
        { id: 'government', name: 'Law & Government', icon: '⚖️' }
      ];
    }
  }

  /**
   * Clear cache to force reload from database
   */
  clearCache(): void {
    this.careersCache.clear();
    this.lastCacheTime = 0;
  }
}

export const pathIQServiceV2 = PathIQServiceV2.getInstance();
export default pathIQServiceV2;