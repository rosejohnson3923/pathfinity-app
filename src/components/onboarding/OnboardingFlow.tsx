import React, { useState } from 'react';
import { RolePreferenceSelection } from './RolePreferenceSelection';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../contexts/AuthContext';

interface OnboardingFlowProps {
  userType?: 'individual' | 'school' | 'district';
  onComplete?: (role: 'teacher' | 'parent') => void;
}

type OnboardingStep = 'welcome' | 'role_selection' | 'complete';

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  userType = 'individual',
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role_selection');
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'parent' | null>(null);
  const navigate = useNavigate();
  const { user, updateUserProfile } = useAuthContext();

  const handleRoleSelection = async (role: 'teacher' | 'parent') => {
    setSelectedRole(role);
    
    try {
      // Update user profile with role preference
      if (user) {
        await updateUserProfile({
          ...user,
          role: role === 'teacher' ? 'educator' : 'parent'
        });
      }
      
      // Complete onboarding
      if (onComplete) {
        onComplete(role);
      } else {
        // Navigate to appropriate dashboard
        navigate('/teacher-dashboard'); // Same dashboard for both, just different labels
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleBack = () => {
    // Navigate back to registration or previous step
    navigate('/register');
  };

  return (
    <div>
      {currentStep === 'role_selection' && (
        <RolePreferenceSelection
          onRoleSelected={handleRoleSelection}
          onBack={handleBack}
          userType={userType}
        />
      )}
    </div>
  );
};