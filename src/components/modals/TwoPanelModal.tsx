import React, { useState } from 'react';
import { GamificationSidebar } from '../gamification/GamificationSidebar';
import './TwoPanelModal.css';

interface TwoPanelModalProps {
  children: React.ReactNode;
  showGamification?: boolean;
  sidebarPosition?: 'left' | 'right';
  currentSkill?: string;
  currentCareer?: string;
  userId: string;
  gradeLevel?: string;
  modalTitle?: string;
  onClose?: () => void;
}

/**
 * Two-Panel Modal Layout
 * Main content area + Gamification sidebar
 * Provides social proof and motivation while learning
 */
export const TwoPanelModal: React.FC<TwoPanelModalProps> = ({
  children,
  showGamification = true,
  sidebarPosition = 'right',
  currentSkill,
  currentCareer,
  userId,
  gradeLevel,
  modalTitle,
  onClose
}) => {
  // Start with sidebar collapsed on mobile devices
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    // Check if window is available (client-side) and if screen is mobile
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return false;
  });
  const [showFullLeaderboard, setShowFullLeaderboard] = useState(false);

  // Update sidebar state when window resizes
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768 && !isSidebarCollapsed) {
        setIsSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarCollapsed]);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <div className={`two-panel-modal ${sidebarPosition}-sidebar ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Mobile overlay - clickable to close sidebar */}
      {!isSidebarCollapsed && typeof window !== 'undefined' && window.innerWidth <= 768 && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsSidebarCollapsed(true)}
          aria-label="Close sidebar"
        />
      )}
      
      {/* Single integrated container - no backdrop */}
      <div className="modal-container">
        {/* Main Content - Full screen */}
        <div className="main-content-panel">
          {/* Content area without double modals */}
          {children}
        </div>
        
        {/* Gamification Sidebar - Attached to right */}
        {showGamification && (
          <GamificationSidebar
            position={sidebarPosition}
            currentSkill={currentSkill}
            currentCareer={currentCareer}
            userId={userId}
            gradeLevel={gradeLevel}
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        )}
      </div>
      
      {/* Full Leaderboard Modal (if opened) */}
      {showFullLeaderboard && (
        <FullLeaderboardModal onClose={() => setShowFullLeaderboard(false)} />
      )}
    </div>
  );
};

/**
 * Full Leaderboard Modal
 * Opens when user clicks "View Full Leaderboard" in sidebar
 */
const FullLeaderboardModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'skills' | 'careers' | 'schools'>('skills');
  
  return (
    <div className="full-leaderboard-modal">
      <div className="leaderboard-backdrop" onClick={onClose}></div>
      <div className="leaderboard-content">
        <div className="leaderboard-header">
          <h2>🏆 Global Leaderboard</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>
        
        <div className="leaderboard-tabs">
          <button 
            className={`tab ${activeTab === 'skills' ? 'active' : ''}`}
            onClick={() => setActiveTab('skills')}
          >
            Top Skills
          </button>
          <button 
            className={`tab ${activeTab === 'careers' ? 'active' : ''}`}
            onClick={() => setActiveTab('careers')}
          >
            Popular Careers
          </button>
          <button 
            className={`tab ${activeTab === 'schools' ? 'active' : ''}`}
            onClick={() => setActiveTab('schools')}
          >
            School Rankings
          </button>
        </div>
        
        <div className="leaderboard-body">
          {activeTab === 'skills' && <SkillsLeaderboard />}
          {activeTab === 'careers' && <CareersLeaderboard />}
          {activeTab === 'schools' && <SchoolsLeaderboard />}
        </div>
      </div>
    </div>
  );
};

// Placeholder components for leaderboard tabs
const SkillsLeaderboard = () => (
  <div className="leaderboard-list">
    <div className="leaderboard-item">
      <span className="rank">1</span>
      <span className="name">Addition & Subtraction</span>
      <span className="count">2,341 students</span>
      <span className="trend up">↑ 12%</span>
    </div>
    {/* More items... */}
  </div>
);

const CareersLeaderboard = () => (
  <div className="leaderboard-list">
    <div className="leaderboard-item">
      <span className="rank">1</span>
      <span className="icon">👨‍⚕️</span>
      <span className="name">Doctor</span>
      <span className="count">1,823 explorers</span>
      <span className="trend up">↑ 23%</span>
    </div>
    {/* More items... */}
  </div>
);

const SchoolsLeaderboard = () => (
  <div className="leaderboard-list">
    <div className="leaderboard-item">
      <span className="rank">1</span>
      <span className="name">Riverside Elementary</span>
      <span className="score">94.5</span>
      <span className="students">523 students</span>
    </div>
    {/* More items... */}
  </div>
);

export default TwoPanelModal;