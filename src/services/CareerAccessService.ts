/**
 * Career Access Service
 * Handles all career access logic including grade levels and subscription tiers
 */

import { supabase } from '../lib/supabase';
import { subscriptionService } from './subscriptionService';
import type {
  CareerCore,
  CareerAttributes,
  CareerWithAttributes,
  FrequencyIndicator
} from '../types/CareerTypes';

export interface CareerAccessFilters {
  gradeLevel: string;
  subscriptionTier?: 'all' | 'basic' | 'premium';
  includeAttributes?: boolean;
  minStudentEngagement?: number;
  interactionFrequency?: FrequencyIndicator[];
  searchQuery?: string;
}

export interface CareerAccessResult {
  careers: CareerWithAttributes[];
  stats: {
    total: number;
    basic: number;
    premium: number;
    elementary: number;
    middle: number;
    high: number;
  };
}

class CareerAccessService {
  private static instance: CareerAccessService;
  private careersCache: Map<string, CareerCore[]> = new Map();
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheTime = 0;

  private constructor() {}

  static getInstance(): CareerAccessService {
    if (!CareerAccessService.instance) {
      CareerAccessService.instance = new CareerAccessService();
    }
    return CareerAccessService.instance;
  }

  /**
   * Convert grade string to number
   */
  private gradeToNumber(grade: string): number {
    return grade === 'K' ? 0 : parseInt(grade);
  }

  /**
   * Determine which grade categories a student can access
   * This is the KEY logic for grade-based access
   */
  private getAccessibleCategories(gradeLevel: string): string[] {
    const gradeNum = this.gradeToNumber(gradeLevel);
    const categories: string[] = [];

    // Elementary (K-5): Always accessible if you're in K or above
    if (gradeNum >= 0) {
      categories.push('elementary');
    }

    // Middle (6-8): Accessible if you're in grade 6 or above
    if (gradeNum >= 6) {
      categories.push('middle');
    }

    // High (9-12): Accessible if you're in grade 9 or above
    if (gradeNum >= 9) {
      categories.push('high');
    }

    console.log(`Grade ${gradeLevel} (${gradeNum}) can access categories:`, categories);
    return categories;
  }

  /**
   * Load all careers from database (with caching)
   */
  private async loadAllCareers(): Promise<CareerCore[]> {
    // Check cache
    if (this.careersCache.has('all') && Date.now() - this.lastCacheTime < this.cacheExpiry) {
      console.log('Using cached careers');
      return this.careersCache.get('all')!;
    }

    try {
      const supabaseClient = await supabase();

      const { data: careers, error } = await supabaseClient
        .from('career_paths')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .order('career_name');

      if (error) {
        console.error('Error loading careers:', error);
        return [];
      }

      const careerCores: CareerCore[] = careers?.map(c => ({
        career_code: c.career_code,
        career_name: c.career_name,
        icon: c.icon || '💼',
        color: c.color || '#6B7280',
        grade_category: c.grade_category,
        min_grade_level: c.min_grade_level,
        max_grade_level: c.max_grade_level,
        min_grade_level_num: c.min_grade_level_num,
        max_grade_level_num: c.max_grade_level_num,
        access_tier: c.access_tier,
        career_category: c.career_category,
        description: c.description,
        is_active: c.is_active,
        display_order: c.display_order,
        is_featured: c.is_featured,
        tags: c.tags
      })) || [];

      // Cache the results
      this.careersCache.set('all', careerCores);
      this.lastCacheTime = Date.now();

      console.log(`Loaded ${careerCores.length} careers from database`);
      return careerCores;
    } catch (error) {
      console.error('Failed to load careers:', error);
      return [];
    }
  }

  /**
   * Load career attributes for specific careers
   */
  private async loadCareerAttributes(careerCodes: string[]): Promise<Map<string, CareerAttributes>> {
    if (careerCodes.length === 0) return new Map();

    try {
      const supabaseClient = await supabase();

      const { data: attributes, error } = await supabaseClient
        .from('career_attributes')
        .select('*')
        .in('career_code', careerCodes);

      if (error) {
        console.error('Error loading career attributes:', error);
        return new Map();
      }

      const attributeMap = new Map<string, CareerAttributes>();
      attributes?.forEach(attr => {
        attributeMap.set(attr.career_code, attr);
      });

      return attributeMap;
    } catch (error) {
      console.error('Failed to load career attributes:', error);
      return new Map();
    }
  }

  /**
   * Main method to get careers based on filters
   */
  async getAvailableCareers(filters: CareerAccessFilters): Promise<CareerAccessResult> {
    console.log('🎯 Getting available careers with filters:', filters);

    // Step 1: Load all careers
    const allCareers = await this.loadAllCareers();

    // Step 2: Filter by grade level (which categories are accessible)
    const accessibleCategories = this.getAccessibleCategories(filters.gradeLevel);
    let filteredCareers = allCareers.filter(career =>
      accessibleCategories.includes(career.grade_category)
    );

    console.log(`After grade filter: ${filteredCareers.length} careers`);

    // Step 3: Filter by subscription tier
    if (filters.subscriptionTier && filters.subscriptionTier !== 'all') {
      if (filters.subscriptionTier === 'basic') {
        filteredCareers = filteredCareers.filter(c => c.access_tier === 'basic');
      } else if (filters.subscriptionTier === 'premium') {
        filteredCareers = filteredCareers.filter(c => c.access_tier === 'premium');
      }
      console.log(`After subscription filter (${filters.subscriptionTier}): ${filteredCareers.length} careers`);
    }

    // Step 4: Load attributes if needed (for engagement/frequency filtering)
    let careerMap: Map<string, CareerWithAttributes> = new Map();

    if (filters.includeAttributes ||
        filters.minStudentEngagement ||
        filters.interactionFrequency) {

      const careerCodes = filteredCareers.map(c => c.career_code);
      const attributesMap = await this.loadCareerAttributes(careerCodes);

      // Combine careers with their attributes
      filteredCareers.forEach(career => {
        const withAttrs: CareerWithAttributes = {
          ...career,
          attributes: attributesMap.get(career.career_code)
        };
        careerMap.set(career.career_code, withAttrs);
      });

      // Filter by student engagement if specified
      if (filters.minStudentEngagement) {
        const filtered = Array.from(careerMap.values()).filter(c =>
          (c.attributes?.ers_student_engagement || 0) >= filters.minStudentEngagement!
        );
        careerMap = new Map(filtered.map(c => [c.career_code, c]));
        console.log(`After engagement filter (>=${filters.minStudentEngagement}): ${careerMap.size} careers`);
      }

      // Filter by interaction frequency if specified
      if (filters.interactionFrequency && filters.interactionFrequency.length > 0) {
        const filtered = Array.from(careerMap.values()).filter(c =>
          c.attributes?.interaction_frequency &&
          filters.interactionFrequency!.includes(c.attributes.interaction_frequency)
        );
        careerMap = new Map(filtered.map(c => [c.career_code, c]));
        console.log(`After frequency filter: ${careerMap.size} careers`);
      }
    } else {
      // No attributes needed, just convert to map
      filteredCareers.forEach(career => {
        careerMap.set(career.career_code, { ...career });
      });
    }

    // Step 5: Search query filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const filtered = Array.from(careerMap.values()).filter(c =>
        c.career_name.toLowerCase().includes(query) ||
        c.description?.toLowerCase().includes(query) ||
        c.tags?.some(tag => tag.toLowerCase().includes(query))
      );
      careerMap = new Map(filtered.map(c => [c.career_code, c]));
      console.log(`After search filter: ${careerMap.size} careers`);
    }

    // Convert map to array for final result
    const finalCareers = Array.from(careerMap.values());

    // Calculate stats
    const stats = {
      total: finalCareers.length,
      basic: finalCareers.filter(c => c.access_tier === 'basic').length,
      premium: finalCareers.filter(c => c.access_tier === 'premium').length,
      elementary: finalCareers.filter(c => c.grade_category === 'elementary').length,
      middle: finalCareers.filter(c => c.grade_category === 'middle').length,
      high: finalCareers.filter(c => c.grade_category === 'high').length
    };

    console.log('📊 Final stats:', stats);

    return {
      careers: finalCareers,
      stats
    };
  }

  /**
   * Check if a user can access a specific career
   */
  async checkCareerAccess(careerId: string, userId?: string): Promise<{
    allowed: boolean;
    career?: CareerWithAttributes;
    message?: string;
  }> {
    try {
      const supabaseClient = await supabase();

      // Get the career
      const { data: career, error } = await supabaseClient
        .from('career_paths')
        .select('*')
        .eq('career_code', careerId)
        .single();

      if (error || !career) {
        return { allowed: false, message: 'Career not found' };
      }

      // Check subscription access if it's premium
      if (career.access_tier === 'premium') {
        const hasAccess = await subscriptionService.hasPremiumAccess();
        if (!hasAccess) {
          return {
            allowed: false,
            career: career,
            message: 'Premium subscription required'
          };
        }
      }

      // Get attributes if available
      const { data: attributes } = await supabaseClient
        .from('career_attributes')
        .select('*')
        .eq('career_code', careerId)
        .single();

      return {
        allowed: true,
        career: {
          ...career,
          attributes: attributes || undefined
        }
      };
    } catch (error) {
      console.error('Error checking career access:', error);
      return { allowed: false, message: 'Error checking access' };
    }
  }

  /**
   * Get careers organized by category for display
   */
  async getCareersByCategory(gradeLevel: string, subscriptionTier?: 'all' | 'basic' | 'premium') {
    const result = await this.getAvailableCareers({
      gradeLevel,
      subscriptionTier,
      includeAttributes: true
    });

    // Group by category
    const grouped = new Map<string, CareerWithAttributes[]>();

    result.careers.forEach(career => {
      const category = career.grade_category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(career);
    });

    // Convert to array with category info
    const categories = [
      { id: 'elementary', name: 'Elementary School', icon: '🎒' },
      { id: 'middle', name: 'Middle School', icon: '📚' },
      { id: 'high', name: 'High School', icon: '🎓' }
    ];

    return categories
      .filter(cat => grouped.has(cat.id))
      .map(cat => ({
        category: cat,
        careers: grouped.get(cat.id)!
      }));
  }

  /**
   * Clear the cache
   */
  clearCache(): void {
    this.careersCache.clear();
    this.lastCacheTime = 0;
  }
}

export const careerAccessService = CareerAccessService.getInstance();
export default careerAccessService;