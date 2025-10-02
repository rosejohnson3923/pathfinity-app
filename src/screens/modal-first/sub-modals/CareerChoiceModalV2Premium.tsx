/**
 * CareerChoiceModalV2 with Premium Support
 * Integrates database-driven careers and premium upgrade flow
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, Info, Sparkles, Star, Volume2, VolumeX, ChevronRight, Lock } from 'lucide-react';
import { pathIQServiceV2 } from '../../../services/pathIQServiceV2';
import { subscriptionService } from '../../../services/subscriptionService';
import { careerContentService, EnrichedCareerData } from '../../../services/careerContentService';
import { audioService } from '../../../services/audioService';
import { azureAudioService } from '../../../services/AzureAudioService';
import { PremiumUpgradeModal } from '../../../components/modals/PremiumUpgradeModal';
import { CAREER_CATEGORIES } from '../../../data/careerCategories';

interface CareerData {
  careerId: string;
  id?: string;
  name: string;
  description?: string;
  quickDesc?: string;
  icon?: string;
  color?: string;
  skills?: string[];
  score?: number;
  matchReasons?: string[];
  category?: string;
  isPremium?: boolean;
}

interface CareerChoiceModalV2Props {
  theme?: 'light' | 'dark';
  onClose: (result: any) => void;
  user: any;
  profile: any;
}

type ViewMode = 'initial' | 'all-careers' | 'preview';

export const CareerChoiceModalV2Premium: React.FC<CareerChoiceModalV2Props> = ({
  theme = 'light',
  onClose: handleClose,
  user,
  profile
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [selectedCareer, setSelectedCareer] = useState<CareerData | null>(null);
  const [previewCareer, setPreviewCareer] = useState<CareerData | null>(null);
  const [carouselCareers, setCarouselCareers] = useState<CareerData[]>([]);
  const [allCareers, setAllCareers] = useState<CareerData[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [enrichedContent, setEnrichedContent] = useState<EnrichedCareerData | null>(null);

  // Premium modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [premiumCareerSelected, setPremiumCareerSelected] = useState<CareerData | null>(null);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mounted = useRef(true);

  // Load careers on mount
  useEffect(() => {
    const initializeCareers = async () => {
      try {
        setIsLoading(true);
        const gradeLevel = user?.grade || profile?.grade || '3';
        console.log(`🎓 Loading careers for grade ${gradeLevel}...`);

        // Get database-driven careers with premium filtering
        const careersByCategory = await pathIQServiceV2.getCareersByCategory(gradeLevel);
        console.log(`📚 Loaded ${careersByCategory?.length || 0} categories from database`);

        // Flatten all careers
        const allCareersFlat: CareerData[] = [];
        careersByCategory.forEach(category => {
          category.careers.forEach(career => {
            allCareersFlat.push({
              careerId: career.careerId,
              id: career.careerId,
              name: career.name,
              icon: career.icon,
              color: career.color,
              score: career.score,
              matchReasons: career.matchReasons,
              category: category.category.id,
              isPremium: career.isPremium
            });
          });
        });

        setAllCareers(allCareersFlat);
        setCategories(careersByCategory.map(c => c.category));

        // Get top 3 for carousel (PathIQ recommendations)
        const topCareers = await pathIQServiceV2.get3RandomCareers(gradeLevel);
        const carouselData = topCareers.map(career => ({
          careerId: career.careerId,
          id: career.careerId,
          name: career.name,
          icon: career.icon,
          color: career.color,
          score: career.score,
          matchReasons: career.matchReasons,
          isPremium: career.isPremium
        }));

        setCarouselCareers(carouselData);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load careers:', error);
        setIsLoading(false);
      }
    };

    initializeCareers();

    return () => {
      mounted.current = false;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [user, profile]);

  // Handle career selection with premium check
  const handleCareerSelect = async (career: CareerData) => {
    console.log('🎯 Career selected:', career);

    // Check if career requires premium access
    const accessCheck = await pathIQServiceV2.checkCareerAccess(
      career.careerId || career.id!,
      user?.id
    );

    if (!accessCheck.allowed) {
      // Show premium upgrade modal
      setPremiumCareerSelected(career);
      setShowPremiumModal(true);
      return;
    }

    // Proceed with normal selection
    setSelectedCareer(career);

    // Play selection sound
    audioService.playSystemSound('careerSelect');

    // Transition to companion selection
    setTimeout(() => {
      if (mounted.current) {
        handleClose({
          careerChoice: {
            careerId: career.careerId || career.id,
            careerName: career.name,
            careerIcon: career.icon,
            careerColor: career.color
          }
        });
      }
    }, 500);
  };

  // Handle premium modal close
  const handlePremiumModalClose = () => {
    setShowPremiumModal(false);
    setPremiumCareerSelected(null);
  };

  // Carousel navigation
  const nextCareer = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselCareers.length);
  };

  const previousCareer = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselCareers.length) % carouselCareers.length);
  };

  // Filter careers for "all careers" view
  const filteredCareers = allCareers.filter(career => {
    if (searchQuery) {
      return career.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    if (activeCategory !== 'all') {
      return career.category === activeCategory;
    }
    return true;
  });

  // Render career card with premium indicator
  const renderCareerCard = (career: CareerData, index?: number) => (
    <div
      key={career.careerId || career.id}
      onClick={() => handleCareerSelect(career)}
      className={`
        career-card
        ${career.isPremium ? 'premium-career' : ''}
        ${selectedCareer?.id === career.id ? 'selected' : ''}
      `}
      style={{
        backgroundColor: career.isPremium ? '#F3F4F6' : (career.color || '#E5E7EB') + '20',
        borderColor: career.isPremium ? '#9333EA' : career.color || '#E5E7EB',
        cursor: 'pointer'
      }}
    >
      {/* Premium Badge */}
      {career.isPremium && (
        <div className="premium-badge">
          <Lock size={12} />
          <span>Premium</span>
        </div>
      )}

      {/* Career Icon */}
      <div className="career-icon" style={{ fontSize: '3rem' }}>
        {career.icon || '💼'}
      </div>

      {/* Career Name */}
      <h3 className="career-name">{career.name}</h3>

      {/* Match Score (if available) */}
      {career.score && (
        <div className="match-score">
          <div className="score-bar">
            <div
              className="score-fill"
              style={{
                width: `${career.score}%`,
                backgroundColor: career.isPremium ? '#9333EA' : career.color
              }}
            />
          </div>
          <span className="score-text">{career.score}% Match</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="career-actions">
        {career.isPremium ? (
          <button className="preview-button premium">
            <Lock size={16} />
            <span>Unlock</span>
          </button>
        ) : (
          <button className="preview-button">
            <Info size={16} />
            <span>Learn More</span>
          </button>
        )}
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="modal-overlay">
        <div className="modal-content loading">
          <Sparkles className="loading-icon spinning" size={48} />
          <p>Loading amazing careers just for you...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`modal-overlay ${theme}`}>
        <div className={`modal-content career-choice-v2 ${viewMode}`}>
          {/* Initial Carousel View */}
          {viewMode === 'initial' && (
            <div className="carousel-view">
              <h2 className="modal-title">
                <Sparkles size={24} />
                Your Top Career Matches
              </h2>

              <div className="carousel-container">
                <button onClick={previousCareer} className="carousel-nav prev">
                  <ChevronLeft size={24} />
                </button>

                <div className="carousel-track">
                  {carouselCareers.map((career, index) => (
                    <div
                      key={career.id}
                      className={`carousel-slide ${index === currentIndex ? 'active' : ''}`}
                      style={{ transform: `translateX(${(index - currentIndex) * 100}%)` }}
                    >
                      {renderCareerCard(career, index)}
                    </div>
                  ))}
                </div>

                <button onClick={nextCareer} className="carousel-nav next">
                  <ChevronRight size={24} />
                </button>
              </div>

              <button
                onClick={() => setViewMode('all-careers')}
                className="browse-all-button"
              >
                Browse All Careers
              </button>
            </div>
          )}

          {/* All Careers View */}
          {viewMode === 'all-careers' && (
            <div className="all-careers-view">
              <div className="view-header">
                <button onClick={() => setViewMode('initial')} className="back-button">
                  <ChevronLeft size={20} />
                  Back
                </button>
                <h2>All Career Options</h2>
              </div>

              <div className="search-section">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search careers..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div className="category-tabs">
                <button
                  className={activeCategory === 'all' ? 'active' : ''}
                  onClick={() => setActiveCategory('all')}
                >
                  All
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    className={activeCategory === cat.id ? 'active' : ''}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

              <div className="careers-grid">
                {filteredCareers.map(career => renderCareerCard(career))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Premium Upgrade Modal */}
      {showPremiumModal && premiumCareerSelected && (
        <PremiumUpgradeModal
          isOpen={showPremiumModal}
          onClose={handlePremiumModalClose}
          careerData={{
            id: premiumCareerSelected.careerId || premiumCareerSelected.id!,
            name: premiumCareerSelected.name,
            icon: premiumCareerSelected.icon || '💼',
            color: premiumCareerSelected.color || '#6B7280',
            description: premiumCareerSelected.description
          }}
          gradeLevel={user?.grade || profile?.grade || '3'}
        />
      )}
    </>
  );
};

// Add styles for premium indicators
const premiumStyles = `
  .premium-career {
    position: relative;
    border: 2px solid #9333EA !important;
    background: linear-gradient(135deg, #F3F4F6 0%, #EDE9FE 100%) !important;
  }

  .premium-badge {
    position: absolute;
    top: 8px;
    right: 8px;
    background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
    color: white;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 4px;
    box-shadow: 0 2px 4px rgba(147, 51, 234, 0.3);
  }

  .preview-button.premium {
    background: linear-gradient(135deg, #9333EA 0%, #7C3AED 100%);
    color: white;
  }

  .preview-button.premium:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(147, 51, 234, 0.3);
  }
`;

// Inject styles
if (typeof document !== 'undefined' && !document.getElementById('premium-career-styles')) {
  const style = document.createElement('style');
  style.id = 'premium-career-styles';
  style.innerHTML = premiumStyles;
  document.head.appendChild(style);
}

export default CareerChoiceModalV2Premium;