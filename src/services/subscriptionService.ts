/**
 * Subscription Service
 * Manages premium tier subscriptions and access control
 */

import { supabase } from '../lib/supabase';

export interface SubscriptionTier {
  id: string;
  tierCode: 'basic' | 'premium' | 'premium_plus' | 'enterprise';
  tierName: string;
  includesPremiumCareers: boolean;
  customCareerSlots: number;
  monthlyPrice: number;
  annualPrice: number;
}

export interface TenantSubscription {
  id: string;
  tenantId: string;
  tierId: string;
  tier?: SubscriptionTier;
  status: 'active' | 'cancelled' | 'expired' | 'trial' | 'pending' | 'past_due';
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  isTrial: boolean;
  trialEndDate?: Date;
}

export interface CareerAccessResult {
  allowed: boolean;
  showUpgrade?: boolean;
  message?: string;
  previewData?: any;
  tier?: 'basic' | 'premium';
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: TenantSubscription | null = null;
  private subscriptionTiers: Map<string, SubscriptionTier> = new Map();

  private constructor() {
    this.loadSubscriptionTiers();
  }

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  private async loadSubscriptionTiers() {
    try {
      const supabaseClient = await supabase();
      const { data, error } = await supabaseClient
        .from('subscription_tiers')
        .select('*')
        .eq('is_active', true);

      if (!error && data) {
        data.forEach(tier => {
          this.subscriptionTiers.set(tier.tier_code, {
            id: tier.id,
            tierCode: tier.tier_code,
            tierName: tier.tier_name,
            includesPremiumCareers: tier.includes_premium_careers,
            customCareerSlots: tier.custom_career_slots,
            monthlyPrice: tier.monthly_price,
            annualPrice: tier.annual_price,
          });
        });
      }
    } catch (error) {
      console.error('Failed to load subscription tiers:', error);
      // Set default tiers as fallback
      this.setDefaultTiers();
    }
  }

  private setDefaultTiers() {
    this.subscriptionTiers.set('basic', {
      id: 'default-basic',
      tierCode: 'basic',
      tierName: 'Basic',
      includesPremiumCareers: false,
      customCareerSlots: 0,
      monthlyPrice: 0,
      annualPrice: 0,
    });

    this.subscriptionTiers.set('premium', {
      id: 'default-premium',
      tierCode: 'premium',
      tierName: 'Premium',
      includesPremiumCareers: true,
      customCareerSlots: 0,
      monthlyPrice: 49,
      annualPrice: 490,
    });
  }

  async getCurrentSubscription(): Promise<TenantSubscription | null> {
    // Check cached subscription first
    if (this.currentSubscription) {
      return this.currentSubscription;
    }

    try {
      // Get tenant ID from auth service or session
      const tenantId = this.getCurrentTenantId();
      if (!tenantId) {
        return null;
      }

      const supabaseClient = await supabase();
      const { data, error } = await supabaseClient
        .from('tenant_subscriptions')
        .select(`
          *,
          subscription_tiers (*)
        `)
        .eq('tenant_id', tenantId)
        .eq('status', 'active')
        .single();

      if (!error && data) {
        this.currentSubscription = {
          id: data.id,
          tenantId: data.tenant_id,
          tierId: data.tier_id,
          tier: data.subscription_tiers ? {
            id: data.subscription_tiers.id,
            tierCode: data.subscription_tiers.tier_code,
            tierName: data.subscription_tiers.tier_name,
            includesPremiumCareers: data.subscription_tiers.includes_premium_careers,
            customCareerSlots: data.subscription_tiers.custom_career_slots,
            monthlyPrice: data.subscription_tiers.monthly_price,
            annualPrice: data.subscription_tiers.annual_price,
          } : undefined,
          status: data.status,
          currentPeriodStart: new Date(data.current_period_start),
          currentPeriodEnd: new Date(data.current_period_end),
          isTrial: data.is_trial || false,
          trialEndDate: data.trial_end_date ? new Date(data.trial_end_date) : undefined,
        };

        return this.currentSubscription;
      }
    } catch (error) {
      console.error('Failed to get current subscription:', error);
    }

    return null;
  }

  async hasPremiumAccess(): Promise<boolean> {
    const subscription = await this.getCurrentSubscription();
    return subscription?.tier?.includesPremiumCareers || false;
  }

  async checkCareerAccess(
    careerId: string,
    careerTier: 'basic' | 'premium'
  ): Promise<CareerAccessResult> {
    // Basic careers are always accessible
    if (careerTier === 'basic') {
      return {
        allowed: true,
        tier: 'basic'
      };
    }

    // Check premium access
    const hasPremium = await this.hasPremiumAccess();

    if (hasPremium) {
      return {
        allowed: true,
        tier: 'premium'
      };
    }

    // No premium access - show upgrade prompt
    await this.trackPremiumInterest(careerId);

    return {
      allowed: false,
      showUpgrade: true,
      tier: 'premium',
      message: "Unlock 65+ premium careers to explore this career path!",
      previewData: await this.getCareerPreview(careerId)
    };
  }

  async trackPremiumInterest(careerId: string) {
    try {
      const tenantId = this.getCurrentTenantId();
      const userId = this.getCurrentUserId();

      if (tenantId && userId) {
        const supabaseClient = await supabase();
        await supabaseClient
          .from('career_access_events')
          .insert({
            tenant_id: tenantId,
            user_id: userId,
            career_code: careerId,
            event_type: 'preview_locked',
            was_premium: true,
            had_access: false,
            showed_upgrade_prompt: true,
            user_grade: this.getCurrentUserGrade(),
            session_id: this.getSessionId()
          });

        // Update upgrade trigger count for the career
        await supabaseClient.rpc('increment_upgrade_trigger_count', {
          career_id: careerId
        });
      }
    } catch (error) {
      console.error('Failed to track premium interest:', error);
    }
  }

  async getCareerPreview(careerId: string): Promise<any> {
    try {
      const supabaseClient = await supabase();
      const { data, error } = await supabaseClient
        .from('career_paths')
        .select('career_name, description, icon, color, salary_range, growth_outlook')
        .eq('career_code', careerId)
        .single();

      return data;
    } catch (error) {
      console.error('Failed to get career preview:', error);
      return null;
    }
  }

  async trackCareerSelection(
    careerId: string,
    careerTier: 'basic' | 'premium',
    eventType: 'view' | 'select' | 'details_view' = 'select'
  ) {
    try {
      const tenantId = this.getCurrentTenantId();
      const userId = this.getCurrentUserId();
      const hasPremium = await this.hasPremiumAccess();

      if (tenantId && userId) {
        const supabaseClient = await supabase();
        await supabaseClient
          .from('career_access_events')
          .insert({
            tenant_id: tenantId,
            user_id: userId,
            career_code: careerId,
            event_type: eventType,
            was_premium: careerTier === 'premium',
            had_access: careerTier === 'basic' || hasPremium,
            user_grade: this.getCurrentUserGrade(),
            session_id: this.getSessionId()
          });

        // Update career selection counts
        const column = careerTier === 'premium' && hasPremium
          ? 'premium_selections'
          : 'basic_selections';

        await supabaseClient.rpc(`increment_${column}`, {
          career_id: careerId
        });
      }
    } catch (error) {
      console.error('Failed to track career selection:', error);
    }
  }

  // Helper methods - these should integrate with your auth/session services
  private getCurrentTenantId(): string | null {
    // TODO: Get from auth service or session
    return localStorage.getItem('tenantId');
  }

  private getCurrentUserId(): string | null {
    // TODO: Get from auth service or session
    return localStorage.getItem('userId');
  }

  private getCurrentUserGrade(): string | null {
    // TODO: Get from user profile
    return localStorage.getItem('userGrade');
  }

  private getSessionId(): string {
    // TODO: Get or generate session ID
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  // Upgrade flow methods
  async initiateUpgrade(): Promise<string | null> {
    try {
      // TODO: Integrate with Stripe or payment processor
      // For now, return a mock upgrade URL
      const tenantId = this.getCurrentTenantId();
      const tier = this.subscriptionTiers.get('premium');

      if (tier && tenantId) {
        // Track upgrade initiation
        const supabaseClient = await supabase();
        await supabaseClient
          .from('premium_conversion_funnel')
          .upsert({
            tenant_id: tenantId,
            clicked_learn_more: true,
            clicked_learn_more_at: new Date().toISOString()
          });

        // Return checkout URL (mock for now)
        return `/upgrade?tier=premium&price=${tier.monthlyPrice}`;
      }
    } catch (error) {
      console.error('Failed to initiate upgrade:', error);
    }

    return null;
  }

  clearCache() {
    this.currentSubscription = null;
  }
}

export const subscriptionService = SubscriptionService.getInstance();