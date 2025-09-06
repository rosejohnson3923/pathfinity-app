// Adaptive System Integration - Simple wrapper for deployment
import React, { ReactNode } from 'react';
import { AdaptiveDataProvider } from './AdaptiveDataProvider';
import AdaptiveDashboard from './AdaptiveDashboard';

interface AdaptiveSystemIntegrationProps {
  children?: ReactNode;
  showFullDashboard?: boolean;
}

const AdaptiveSystemIntegration: React.FC<AdaptiveSystemIntegrationProps> = ({
  children,
  showFullDashboard = true
}) => {
  return (
    <AdaptiveDataProvider>
      {showFullDashboard ? <AdaptiveDashboard /> : children}
    </AdaptiveDataProvider>
  );
};

export default AdaptiveSystemIntegration;
export { AdaptiveDataProvider, AdaptiveDashboard };