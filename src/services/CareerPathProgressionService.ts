/**
 * Career Path Progression Service
 * Manages career progressions across subscription tiers and booster enhancements
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Career {
  id: string;
  career_code: string;
  career_name: string;
  emoji?: string;
  career_category: string;
  description?: string;
  access_tier: 'select' | 'premium';
  grade_category?: 'elementary' | 'middle' | 'high' | 'all';
  min_grade_level?: string;
  max_grade_level?: string;
  field_name?: string;
}

export interface CareerProgression {
  progression_type: 'boost_trade' | 'boost_corporate' | 'boost_business' | 'boost_ai_first';
  enhanced_career_name: string;
  enhanced_description: string;
  additional_skills: string[];
  booster_name?: string;
  booster_icon?: string;
}

export interface CareerWithProgressions extends Career {
  progressions: CareerProgression[];
}

export interface BoosterType {
  id: string;
  booster_code: string;
  booster_name: string;
  icon: string;
  description: string;
  skills_framework: any;
}

class CareerPathProgressionService {
  /**
   * Get all careers by subscription tier
   */
  async getCareersByTier(
    tier: 'select' | 'premium' | 'all' = 'all',
    gradeCategory?: 'elementary' | 'middle' | 'high' | 'all'
  ): Promise<Career[]> {
    try {
      let query = supabase
        .from('career_paths')
        .select(`
          *,
          career_fields(field_name)
        `)
        .eq('is_active', true)
        .order('career_name');

      if (tier !== 'all') {
        query = query.eq('access_tier', tier);
      }

      if (gradeCategory && gradeCategory !== 'all') {
        query = query.or(`grade_category.eq.${gradeCategory},grade_category.eq.all`);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(career => ({
        ...career,
        field_name: career.career_fields?.field_name
      }));
    } catch (error) {
      console.error('Error fetching careers:', error);
      return [];
    }
  }

  /**
   * Get careers grouped by field with grade and tier filtering
   */
  async getCareersByField(
    gradeLevel?: string,
    tier?: 'select' | 'premium'
  ): Promise<Record<string, Career[]>> {
    try {
      // First get all careers with proper filtering
      const allCareers = gradeLevel && tier
        ? await this.getCareersByGradeLevel(gradeLevel, tier)
        : await this.getCareersByTier('all');

      // Get field information
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('career_fields')
        .select('field_name, id')
        .order('display_order');

      if (fieldsError) throw fieldsError;

      // Group careers by field
      const grouped: Record<string, Career[]> = {};

      // Initialize all fields with empty arrays
      (fieldsData || []).forEach(field => {
        grouped[field.field_name] = [];
      });

      // Group careers by their career_category (which maps to field_name)
      allCareers.forEach(career => {
        const fieldName = career.career_category || 'other';
        if (!grouped[fieldName]) {
          grouped[fieldName] = [];
        }
        grouped[fieldName].push(career);
      });

      // Remove empty fields
      Object.keys(grouped).forEach(fieldName => {
        if (grouped[fieldName].length === 0) {
          delete grouped[fieldName];
        }
      });

      return grouped;
    } catch (error) {
      console.error('Error fetching careers by field:', error);
      return {};
    }
  }

  /**
   * Get a specific career with all its progressions
   */
  async getCareerWithProgressions(careerId: string): Promise<CareerWithProgressions | null> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select(`
          *,
          career_fields(field_name),
          career_path_progressions!career_path_progressions_base_career_path_id_fkey(
            *,
            booster_types(booster_name, icon)
          )
        `)
        .eq('id', careerId)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        ...data,
        field_name: data.career_fields?.field_name,
        progressions: (data.career_path_progressions || []).map((prog: any) => ({
          progression_type: prog.progression_type,
          enhanced_career_name: prog.enhanced_career_name,
          enhanced_description: prog.enhanced_description,
          additional_skills: prog.additional_skills || [],
          booster_name: prog.booster_types?.booster_name,
          booster_icon: prog.booster_types?.icon
        }))
      };
    } catch (error) {
      console.error('Error fetching career with progressions:', error);
      return null;
    }
  }

  /**
   * Get all booster types
   */
  async getBoosterTypes(): Promise<BoosterType[]> {
    try {
      const { data, error } = await supabase
        .from('booster_types')
        .select('*')
        .eq('is_active', true)
        .order('price_tier');

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching booster types:', error);
      return [];
    }
  }

  /**
   * Get careers available for a specific subscription
   */
  async getCareersForSubscription(
    subscriptionTier: 'select' | 'premium',
    includeProgressions: boolean = false
  ): Promise<Career[] | CareerWithProgressions[]> {
    try {
      // Select tier includes only select careers
      // Premium tier includes both select and premium
      const tiers = subscriptionTier === 'select' ? ['select'] : ['select', 'premium'];

      let query = supabase
        .from('career_paths')
        .select(includeProgressions ? `
          *,
          career_fields(field_name),
          career_path_progressions!career_path_progressions_base_career_path_id_fkey(
            *,
            booster_types(booster_name, icon)
          )
        ` : `
          *,
          career_fields(field_name)
        `)
        .in('access_tier', tiers)
        .eq('is_active', true)
        .order('career_name');

      const { data, error } = await query;

      if (error) throw error;

      if (!includeProgressions) {
        return (data || []).map(career => ({
          ...career,
          field_name: career.career_fields?.field_name
        }));
      }

      return (data || []).map(career => ({
        ...career,
        field_name: career.career_fields?.field_name,
        progressions: (career.career_path_progressions || []).map((prog: any) => ({
          progression_type: prog.progression_type,
          enhanced_career_name: prog.enhanced_career_name,
          enhanced_description: prog.enhanced_description,
          additional_skills: prog.additional_skills || [],
          booster_name: prog.booster_types?.booster_name,
          booster_icon: prog.booster_types?.icon
        }))
      }));
    } catch (error) {
      console.error('Error fetching careers for subscription:', error);
      return [];
    }
  }

  /**
   * Get careers filtered by grade level
   */
  async getCareersByGradeLevel(
    gradeLevel: string,
    subscriptionTier: 'select' | 'premium' = 'select'
  ): Promise<Career[]> {
    try {
      // Convert grade level to numeric value for comparison
      let gradeLevelNum: number;
      if (gradeLevel === 'K' || gradeLevel === 'PK' || gradeLevel === 'PRE-K') {
        gradeLevelNum = 0;
      } else {
        gradeLevelNum = parseInt(gradeLevel);
        if (isNaN(gradeLevelNum)) gradeLevelNum = 0;
      }

      const tiers = subscriptionTier === 'select' ? ['select'] : ['select', 'premium'];

      let query = supabase
        .from('career_paths')
        .select(`
          *,
          career_fields(field_name)
        `)
        .in('access_tier', tiers)
        .eq('is_active', true);

      // Implement dual progression system
      if (gradeLevelNum <= 5) {
        // K-5: Elementary students see only elementary careers that have unlocked
        // This is INTRA-category progression
        query = query
          .eq('grade_category', 'elementary')
          .lte('min_grade_level_num', gradeLevelNum);
      } else if (gradeLevelNum <= 8) {
        // 6-8: Middle school students see ALL elementary + ALL middle school careers
        // This is INTER-category progression (no intra-category for middle)
        query = query
          .in('grade_category', ['elementary', 'middle']);
      } else {
        // 9-12: High school students see ALL careers
        // Full INTER-category progression
        // No additional filter needed - they see everything
      }

      const { data, error } = await query.order('career_name');

      if (error) throw error;

      return (data || []).map(career => ({
        ...career,
        field_name: career.career_fields?.field_name
      }));
    } catch (error) {
      console.error('Error fetching careers by grade level:', error);
      return [];
    }
  }

  /**
   * Helper to determine grade category from grade level
   */
  private getGradeCategoryFromLevel(gradeLevel: string): 'elementary' | 'middle' | 'high' {
    const grade = gradeLevel.toUpperCase();
    if (grade === 'K' || grade === 'PK' || grade === 'PRE-K') return 'elementary';

    const gradeNum = parseInt(grade);
    if (isNaN(gradeNum)) return 'elementary';

    if (gradeNum <= 5) return 'elementary';
    if (gradeNum <= 8) return 'middle';
    return 'high';
  }

  /**
   * Search careers by name or category
   */
  async searchCareers(searchTerm: string): Promise<Career[]> {
    try {
      const { data, error } = await supabase
        .from('career_paths')
        .select(`
          *,
          career_fields(field_name)
        `)
        .eq('is_active', true)
        .or(`career_name.ilike.%${searchTerm}%,career_category.ilike.%${searchTerm}%`)
        .order('career_name');

      if (error) throw error;

      return (data || []).map(career => ({
        ...career,
        field_name: career.career_fields?.field_name
      }));
    } catch (error) {
      console.error('Error searching careers:', error);
      return [];
    }
  }

  /**
   * Get career progression for a specific booster type
   */
  async getProgressionByBooster(
    careerId: string,
    boosterType: 'boost_trade' | 'boost_corporate' | 'boost_business' | 'boost_ai_first'
  ): Promise<CareerProgression | null> {
    try {
      const { data, error } = await supabase
        .from('career_path_progressions')
        .select(`
          *,
          booster_types(booster_name, icon)
        `)
        .eq('base_career_path_id', careerId)
        .eq('progression_type', boosterType)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        progression_type: data.progression_type,
        enhanced_career_name: data.enhanced_career_name,
        enhanced_description: data.enhanced_description,
        additional_skills: data.additional_skills || [],
        booster_name: data.booster_types?.booster_name,
        booster_icon: data.booster_types?.icon
      };
    } catch (error) {
      console.error('Error fetching progression by booster:', error);
      return null;
    }
  }

  /**
   * Get recommended career progressions based on field
   */
  async getFieldProgressions(fieldCode: string): Promise<{
    select: Career[];
    premium: Career[];
    progressions: Record<string, CareerProgression[]>;
  }> {
    try {
      const { data, error } = await supabase
        .from('career_fields')
        .select(`
          *,
          career_paths(
            *,
            career_path_progressions!career_path_progressions_base_career_path_id_fkey(
              *,
              booster_types(booster_name, icon)
            )
          )
        `)
        .eq('field_code', fieldCode)
        .single();

      if (error) throw error;

      if (!data || !data.career_paths) {
        return { select: [], premium: [], progressions: {} };
      }

      const select = data.career_paths.filter((c: any) => c.access_tier === 'select');
      const premium = data.career_paths.filter((c: any) => c.access_tier === 'premium');

      const progressions: Record<string, CareerProgression[]> = {};
      data.career_paths.forEach((career: any) => {
        if (career.career_path_progressions && career.career_path_progressions.length > 0) {
          progressions[career.id] = career.career_path_progressions.map((prog: any) => ({
            progression_type: prog.progression_type,
            enhanced_career_name: prog.enhanced_career_name,
            enhanced_description: prog.enhanced_description,
            additional_skills: prog.additional_skills || [],
            booster_name: prog.booster_types?.booster_name,
            booster_icon: prog.booster_types?.icon
          }));
        }
      });

      return { select, premium, progressions };
    } catch (error) {
      console.error('Error fetching field progressions:', error);
      return { select: [], premium: [], progressions: {} };
    }
  }
}

// Export singleton instance
export const careerProgressionService = new CareerPathProgressionService();

// Export types
export type { Career, CareerProgression, CareerWithProgressions, BoosterType };