import { useState, useEffect } from 'react';
import { useAuthContext } from '../contexts/AuthContext';
import { SubscriptionTier, getPlanByTier } from '../types/subscription';

export function useSubscription() {
  const { tenant } = useAuthContext();
  const [tier, setTier] = useState<SubscriptionTier>('basic');
  const [usersCount, setUsersCount] = useState(0);
  const [storageUsed, setStorageUsed] = useState(0);
  const [renewalDate, setRenewalDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSubscriptionData = async () => {
      setLoading(true);
      try {
        // In a real app, this would fetch from an API
        // For now, we'll use the tenant data and generate mock stats
        
        if (tenant) {
          // Set tier from tenant data
          setTier((tenant.subscription_tier as SubscriptionTier) || 'basic');
          
          // Generate mock data based on the tier
          const plan = getPlanByTier((tenant.subscription_tier as SubscriptionTier) || 'basic');
          
          if (plan) {
            // Random user count between 60-90% of max
            const userPercentage = 0.6 + Math.random() * 0.3;
            setUsersCount(Math.floor(plan.maxUsers * userPercentage));
            
            // Random storage used between 40-70% of max
            const storagePercentage = 0.4 + Math.random() * 0.3;
            setStorageUsed(Math.floor(plan.maxStorage * storagePercentage));
            
            // Random renewal date in the next 3-11 months
            const today = new Date();
            const monthsAhead = Math.floor(3 + Math.random() * 8);
            const renewalDay = new Date(today.getFullYear(), today.getMonth() + monthsAhead, 15);
            setRenewalDate(renewalDay.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }));
          }
        }
      } catch (err) {
        console.error('Error loading subscription data:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadSubscriptionData();
  }, [tenant]);

  const upgradeSubscription = async (newTier: SubscriptionTier): Promise<void> => {
    setLoading(true);
    try {
      // In a real app, this would call an API to upgrade the subscription
      console.log(`Upgrading subscription from ${tier} to ${newTier}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      setTier(newTier);
      
      // Update other stats based on new tier
      const plan = getPlanByTier(newTier);
      if (plan) {
        // Keep same percentage of usage but with new limits
        const userPercentage = usersCount / (getPlanByTier(tier)?.maxUsers || 100);
        setUsersCount(Math.floor(plan.maxUsers * userPercentage));
        
        const storagePercentage = storageUsed / (getPlanByTier(tier)?.maxStorage || 50);
        setStorageUsed(Math.floor(plan.maxStorage * storagePercentage));
      }
      
      // Success message would be shown in the UI
    } catch (err) {
      console.error('Error upgrading subscription:', err);
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    tier,
    usersCount,
    storageUsed,
    renewalDate,
    loading,
    error,
    upgradeSubscription
  };
}