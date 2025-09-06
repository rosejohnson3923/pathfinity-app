import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DashboardViewContextType {
  showFullDashboard: boolean;
  toggleDashboardView: () => void;
}

const DashboardViewContext = createContext<DashboardViewContextType | undefined>(undefined);

export function DashboardViewProvider({ children }: { children: ReactNode }) {
  const [showFullDashboard, setShowFullDashboard] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      try {
        const savedView = localStorage.getItem('dashboardView');
        return savedView === 'full';
      } catch (error) {
        console.error('Error accessing localStorage:', error);
        return false;
      }
    }
    return false; // Default to collapsed view
  });

  // Save to localStorage whenever the state changes
  useEffect(() => {
    try {
      localStorage.setItem('dashboardView', showFullDashboard ? 'full' : 'collapsed');
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [showFullDashboard]);

  const toggleDashboardView = () => {
    setShowFullDashboard(prev => !prev);
  };

  return (
    <DashboardViewContext.Provider value={{ showFullDashboard, toggleDashboardView }}>
      {children}
    </DashboardViewContext.Provider>
  );
}

export function useDashboardView() {
  const context = useContext(DashboardViewContext);
  if (context === undefined) {
    throw new Error('useDashboardView must be used within a DashboardViewProvider');
  }
  return context;
}