/**
 * Consolidated CareerChoiceModalV2
 * Combines the beautiful carousel UI from IntroductionModal with detailed exploration from original CareerChoiceModalV2
 *
 * Features:
 * - Initial view: Beautiful carousel with match percentages (from IntroductionModal)
 * - Quick selection: Click career card to go directly to companion selection
 * - More Options: Browse all careers with enriched details (from original)
 * - Preview modal: Detailed career information when needed
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronLeft, Info, Sparkles, Star, Volume2, VolumeX, ChevronRight } from 'lucide-react';
import { pathIQService, CareerOption } from '../../../services/pathIQService';
import { careerContentService, EnrichedCareerData } from '../../../services/careerContentService';
import { audioService } from '../../../services/audioService';
import { azureAudioService } from '../../../services/AzureAudioService';
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
}

interface CareerChoiceModalV2Props {
  theme?: 'light' | 'dark';
  onClose: (result: any) => void;
  user: any;
  profile: any;
}

type ViewMode = 'initial' | 'all-careers' | 'preview';

export const CareerChoiceModalV2: React.FC<CareerChoiceModalV2Props> = ({
  theme = 'light',
  onClose: handleClose,
  user,
  profile
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [recommendedCareers, setRecommendedCareers] = useState<CareerData[]>([]);
  const [allCareers, setAllCareers] = useState<CareerData[]>([]);
  const [enrichedData, setEnrichedData] = useState<Map<string, EnrichedCareerData>>(new Map());
  const [selectedCareerForPreview, setSelectedCareerForPreview] = useState<string | null>(null);
  const [selectedCareerForFinal, setSelectedCareerForFinal] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // UI State for carousel
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [hoveredCareer, setHoveredCareer] = useState<number | null>(null);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Refs
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const detailAudioPlayedRef = useRef(new Set<string>());

  // Theme colors
  const colors = theme === 'dark' ? {
    background: 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)',
    cardBg: '#1E293B',
    text: '#F7FAFC',
    subtext: '#94A3B8',
    border: '#334155',
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#10B981',
    hover: '#2D3748',
    success: '#10B981',
    warning: '#F59E0B'
  } : {
    background: 'linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 100%)',
    cardBg: '#FFFFFF',
    text: '#1A202C',
    subtext: '#718096',
    border: '#E2E8F0',
    primary: '#8B5CF6',
    secondary: '#6366F1',
    accent: '#10B981',
    hover: '#F7FAFC',
    success: '#10B981',
    warning: '#F59E0B'
  };

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper function to get grade key
  const getGradeKey = (grade: string): string => {
    if (grade === 'K' || grade === '1' || grade === '2') return 'Kindergarten';
    if (grade === '3' || grade === '4' || grade === '5' || grade === '6') return 'Grade 3';
    if (grade === '7' || grade === '8' || grade === '9') return 'Grade 7';
    if (grade === '10' || grade === '11' || grade === '12') return 'Grade 10';
    return 'Kindergarten';
  };

  // Get grade level
  const gradeLevel = profile?.grade_level || user?.grade_level || 'K';

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      console.log('🔊 CareerChoiceModalV2: Stopping audio on unmount');
      audioService.stopAll();
      azureAudioService.stop();
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
      }
    };
  }, []);

  // Initialize careers on mount
  useEffect(() => {
    const initializeCareers = async () => {
      try {
        setIsLoading(true);

        const gradeKey = getGradeKey(gradeLevel);
        const careerSelections = pathIQService.getCareerSelections(
          user?.id || 'default',
          gradeLevel,
          profile?.interests || []
        );

        console.log('🎯 PathIQ Recommendations:', careerSelections);

        // Set recommended careers (top 3)
        const recommended = careerSelections.recommended.slice(0, 3);
        setRecommendedCareers(recommended);

        // Get all careers for the grade
        const careersByCategory = pathIQService.getCareersByCategory(gradeLevel);
        console.log(`🎯 CareerChoiceModalV2: Got ${careersByCategory?.length || 0} categories for grade ${gradeLevel}`);

        const allCareersList: CareerData[] = [];
        if (careersByCategory && careersByCategory.length > 0) {
          careersByCategory.forEach(categoryData => {
            const category = categoryData.category;
            categoryData.careers.forEach((career: any) => {
              allCareersList.push({
                careerId: career.careerId || career.id,
                id: career.id,
                name: career.name,
                description: career.description,
                quickDesc: career.quickDesc,
                icon: career.icon,
                color: career.color,
                skills: career.skills,
                score: career.score,
                matchReasons: career.matchReasons,
                category: category.name
              });
            });
          });
        }

        console.log(`✅ Total careers available in More Options: ${allCareersList.length}`);
        setAllCareers(allCareersList);

        // Pre-fetch enriched data for recommended careers only
        console.log(`📚 Fetching enriched data for recommended careers only:`, recommended.map(c => c.name));
        for (const career of recommended) {
          try {
            const enriched = careerContentService.getEnrichedCareerData(career.name, gradeLevel);
            if (enriched) {
              setEnrichedData(prev => {
                const newMap = new Map(prev);
                newMap.set(career.careerId || career.id, enriched);
                return newMap;
              });
            }
          } catch (error) {
            console.warn(`Could not enrich ${career.name}:`, error);
          }
        }
      } catch (error) {
        console.error('❌ Error initializing careers:', error);
        // Set some default values to avoid stuck loading
        setRecommendedCareers([]);
        setAllCareers([]);
      } finally {
        setIsLoading(false);
      }

      // Play initial narration
      if (soundEnabled) {
        setTimeout(() => {
          console.log('🔊 CareerChoiceModalV2: Playing initial narration with voice:', 'pat');
          const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';
          const narrationText = `Let's choose your career adventure, ${firstName}! Pick one that excites you!`;

          azureAudioService.playText(narrationText, 'pat', {
            scriptId: 'career.selection_prompt',
            onStart: () => console.log('🔊 Career choice initial narration started'),
            onEnd: () => console.log('🔊 Career choice initial narration ended')
          });
        }, 500);
      }
    };

    initializeCareers();
  }, [user, profile, gradeLevel, soundEnabled]);

  // Handle career selection (final)
  const handleCareerSelection = (careerId: string) => {
    setSelectedCareerForFinal(careerId);
    const career = [...recommendedCareers, ...allCareers].find(c => c.careerId === careerId || c.id === careerId);
    const enriched = enrichedData.get(careerId);

    // Play confirmation narration
    if (career && soundEnabled) {
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';
      const narrationText = `Excellent choice! Let's have some fun as a ${career.name}, ${firstName}!`;

      console.log(`🔊 CareerChoiceModalV2: Playing career selection confirmation for ${career.name}`);

      azureAudioService.playText(narrationText, 'pat', {
        scriptId: 'intro.career_selected',
        variables: {
          careerName: career.name,
          firstName: firstName
        },
        onStart: () => console.log('🔊 Career selection confirmation started'),
        onEnd: () => console.log('🔊 Career selection confirmation ended')
      });
    }

    // Close with selected career
    setTimeout(() => {
      handleClose({
        career: career?.name,
        careerId: careerId,
        enrichedData: enriched
      });
    }, soundEnabled ? 1500 : 300);
  };

  // Handle career preview
  const handleCareerPreview = useCallback(async (careerId: string) => {
    setSelectedCareerForPreview(careerId);
    setViewMode('preview');

    // Fetch enriched data if not already available
    if (!enrichedData.has(careerId)) {
      setIsLoadingPreview(true);
      const career = allCareers.find(c => c.careerId === careerId || c.id === careerId);
      if (career) {
        try {
          const enriched = careerContentService.getEnrichedCareerData(career.name, gradeLevel);
          if (enriched) {
            setEnrichedData(prev => {
              const newMap = new Map(prev);
              newMap.set(careerId, enriched);
              return newMap;
            });
          }
        } catch (error) {
          console.warn(`Could not enrich ${career.name}:`, error);
        }
      }
      setIsLoadingPreview(false);
    }
  }, [enrichedData, gradeLevel, allCareers]);

  // Render career card for carousel
  const renderCarouselCard = (career: CareerData, index: number) => {
    const displayName = career.name;
    const displayIcon = career.icon || '🎯';
    const careerId = career.careerId || career.id;
    const displayColor = career.color || colors.primary;
    const matchScore = career.score || Math.floor(85 + Math.random() * 15);

    return (
      <div
        key={careerId}
        onClick={() => {
          console.log(`🎯 Career selected from carousel: ${displayName}`);
          handleCareerSelection(careerId);
        }}
        onMouseEnter={() => {
          if (hoverTimeout) clearTimeout(hoverTimeout);
          const timeout = setTimeout(() => setHoveredCareer(index), 200);
          setHoverTimeout(timeout);
        }}
        onMouseLeave={() => {
          if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
          }
          setHoveredCareer(null);
        }}
        style={{
          backgroundColor: colors.cardBg,
          padding: windowWidth <= 768
            ? (index === 1 ? '1.5rem' : '1.25rem')
            : (index === 1 ? '2.5rem' : '2rem'),
          borderRadius: '1.5rem',
          border: `3px solid ${hoveredCareer === index ? displayColor : colors.border}`,
          cursor: 'pointer',
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: windowWidth <= 768
            ? (hoveredCareer === index ? 'translateY(-4px)' : 'translateY(0)')
            : `scale(${index === 1 ? 1.1 : 0.95}) ${hoveredCareer === index ? 'translateY(-8px)' : 'translateY(0)'}`,
          opacity: hoveredCareer !== null && hoveredCareer !== index ? 0.6 : 1,
          width: windowWidth <= 480
            ? '100%'
            : windowWidth <= 768
              ? (index === 1 ? '90%' : '85%')
              : (index === 1 ? '280px' : '220px'),
          boxShadow: hoveredCareer === index
            ? `0 20px 40px ${displayColor}40`
            : '0 4px 12px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden',
          textAlign: 'center'
        }}
      >
        {/* TOP MATCH Badge */}
        {index === 1 && (
          <div style={{
            position: 'absolute',
            top: '0',
            right: '0',
            backgroundColor: colors.accent,
            color: 'white',
            padding: '0.25rem 0.75rem',
            borderRadius: '0 1rem 0 1rem',
            fontSize: '0.75rem',
            fontWeight: '600'
          }}>
            ⭐ TOP MATCH
          </div>
        )}

        {/* Career Icon */}
        <div style={{
          fontSize: index === 1 ? '4rem' : '3rem',
          marginBottom: '1rem',
          transition: 'transform 0.6s ease-in-out',
          transform: hoveredCareer === index ? 'scale(1.1) rotate(5deg)' : 'scale(1)'
        }}>
          {displayIcon}
        </div>

        {/* Career Name */}
        <h3 style={{
          color: colors.text,
          fontSize: windowWidth <= 768
            ? (index === 1 ? '1.2rem' : '1rem')
            : (index === 1 ? '1.5rem' : '1.2rem'),
          marginBottom: '0.5rem',
          fontWeight: '600'
        }}>
          {displayName}
        </h3>

        {/* Match Score Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: colors.border,
          borderRadius: '3px',
          marginBottom: '0.5rem',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${matchScore}%`,
            height: '100%',
            backgroundColor: displayColor,
            transition: 'width 1s ease-out'
          }} />
        </div>

        {/* Match Percentage */}
        <p style={{
          color: colors.subtext,
          fontSize: windowWidth <= 768 ? '0.75rem' : '0.85rem',
          marginBottom: '0.5rem'
        }}>
          Match: {matchScore}%
        </p>

        {/* Match Reason on Hover */}
        <div style={{
          height: hoveredCareer === index || index === 1 ? 'auto' : '0',
          opacity: hoveredCareer === index || index === 1 ? 1 : 0,
          overflow: 'hidden',
          transition: 'all 0.5s ease-in-out',
          marginTop: '0.5rem'
        }}>
          <p style={{
            color: displayColor,
            fontSize: '0.9rem',
            fontWeight: '500',
            padding: '0.5rem',
            backgroundColor: displayColor + '15',
            borderRadius: '0.5rem'
          }}>
            {career.matchReasons?.[0] || 'Perfect for your interests!'}
          </p>
        </div>
      </div>
    );
  };

  // Main render
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: windowWidth <= 768 ? '1rem' : '2rem',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: windowWidth <= 768 ? '1.5rem' : '2rem',
        flexShrink: 0
      }}>
        <div style={{ textAlign: viewMode === 'initial' ? 'center' : 'left', flex: 1 }}>
          <h1 style={{
            color: colors.text,
            fontSize: windowWidth <= 768 ? '1.5rem' : viewMode === 'initial' ? '2.2rem' : '1.8rem',
            fontWeight: '600',
            marginBottom: '0.5rem'
          }}>
            {viewMode === 'initial' ? 'What do you want to be today?' :
             viewMode === 'all-careers' ? 'Explore All Careers' :
             'Career Details'}
          </h1>
          {viewMode === 'initial' && (
            <p style={{
              color: colors.subtext,
              fontSize: windowWidth <= 768 ? '0.9rem' : '1rem',
              opacity: 0.8
            }}>
              Choose your career adventure
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
          </button>

          <button
            onClick={() => {
              console.log('🔊 CareerChoiceModalV2: Closing modal');
              audioService.stopAll();
              azureAudioService.stop();
              handleClose(null);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              fontSize: '24px',
              cursor: 'pointer',
              padding: '4px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Content based on view mode */}
      {isLoading ? (
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.subtext
        }}>
          Loading careers...
        </div>
      ) : viewMode === 'initial' ? (
        <>
          {/* Career Carousel - Beautiful UI from IntroductionModal */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            width: '100%',
            maxWidth: windowWidth <= 768 ? '100%' : '800px',
            margin: '0 auto',
            flex: '1 1 auto'
          }}>
            {/* Featured Career Cards */}
            <div style={{
              display: 'flex',
              flexDirection: windowWidth <= 768 ? 'column' : 'row',
              gap: windowWidth <= 768 ? '1rem' : '2rem',
              width: '100%',
              alignItems: windowWidth <= 768 ? 'stretch' : 'center',
              justifyContent: 'center',
              flexWrap: windowWidth <= 1024 ? 'wrap' : 'nowrap',
              padding: windowWidth <= 768 ? '0 0.5rem' : '0'
            }}>
              {recommendedCareers.map((career, index) => renderCarouselCard(career, index))}
            </div>

            {/* Quick Action Buttons */}
            <div style={{
              display: 'flex',
              flexDirection: windowWidth <= 480 ? 'column' : 'row',
              gap: windowWidth <= 768 ? '1rem' : '1.5rem',
              marginTop: '1rem',
              width: windowWidth <= 480 ? '100%' : 'auto',
              maxWidth: windowWidth <= 480 ? '300px' : 'none'
            }}>
              {/* Quick Start Button */}
              <button
                onClick={() => {
                  if (recommendedCareers.length > 0) {
                    const topMatch = recommendedCareers[1] || recommendedCareers[0];
                    handleCareerSelection(topMatch.careerId || topMatch.id);
                  }
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: colors.success,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                🚀 Quick Start with Top Match
              </button>

              {/* More Options Button */}
              <button
                onClick={() => setViewMode('all-careers')}
                style={{
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: colors.accent,
                  border: `2px solid ${colors.accent}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.accent;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.accent;
                }}
              >
                Browse All Careers →
              </button>
            </div>
          </div>
        </>
      ) : viewMode === 'all-careers' ? (
        <>
          {/* All Careers View - Original detailed exploration */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setViewMode('initial')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '16px',
                marginBottom: '16px'
              }}
            >
              <ChevronLeft size={20} />
              Back to Recommendations
            </button>

            {/* Search and filters */}
            <div style={{
              display: 'flex',
              gap: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                flex: 1,
                position: 'relative'
              }}>
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.subtext
                }} size={20} />
                <input
                  type="text"
                  placeholder="Search careers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 40px',
                    backgroundColor: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    color: colors.text,
                    fontSize: '16px',
                    outline: 'none'
                  }}
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: '10px 16px',
                  backgroundColor: colors.cardBg,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  fontSize: '16px',
                  outline: 'none'
                }}
              >
                <option value="">All Categories</option>
                {[...new Set(allCareers.map(c => c.category))].filter(Boolean).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Careers Grouped by Category */}
          <div style={{
            overflowY: 'auto',
            flex: 1,
            paddingRight: '8px'
          }}>
            {(() => {
              // Group careers by category
              const careersByCategory = allCareers
                .filter(career => {
                  const matchesSearch = !searchTerm ||
                    career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (career.description || '').toLowerCase().includes(searchTerm.toLowerCase());
                  const matchesCategory = !selectedCategory || career.category === selectedCategory;
                  return matchesSearch && matchesCategory;
                })
                .reduce((acc, career) => {
                  const category = career.category || 'Other';
                  if (!acc[category]) {
                    acc[category] = [];
                  }
                  acc[category].push(career);
                  return acc;
                }, {} as Record<string, typeof allCareers>);

              // Sort categories alphabetically
              const sortedCategories = Object.keys(careersByCategory).sort();

              if (sortedCategories.length === 0) {
                return (
                  <div style={{
                    textAlign: 'center',
                    color: colors.subtext,
                    padding: '40px',
                    fontSize: '16px'
                  }}>
                    No careers found matching your search.
                  </div>
                );
              }

              return sortedCategories.map(category => (
                <div key={category} style={{ marginBottom: '32px' }}>
                  {/* Category Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    paddingBottom: '8px',
                    borderBottom: `2px solid ${colors.border}`
                  }}>
                    <h3 style={{
                      color: colors.primary,
                      fontSize: '20px',
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      {category}
                    </h3>
                    <span style={{
                      backgroundColor: colors.primary + '20',
                      color: colors.primary,
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      {careersByCategory[category].length} careers
                    </span>
                  </div>

                  {/* Careers in this Category */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                    gap: '16px'
                  }}>
                    {careersByCategory[category].map(career => (
                      <div
                        key={career.careerId || career.id}
                        onClick={() => handleCareerPreview(career.careerId || career.id)}
                        style={{
                          backgroundColor: colors.cardBg,
                          border: `2px solid ${colors.border}`,
                          borderRadius: '12px',
                          padding: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          position: 'relative'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = colors.hover;
                          e.currentTarget.style.transform = 'scale(1.02)';
                          e.currentTarget.style.borderColor = colors.primary;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = colors.cardBg;
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.borderColor = colors.border;
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                          <div style={{
                            fontSize: '32px',
                            backgroundColor: (career.color || colors.primary) + '20',
                            borderRadius: '8px',
                            padding: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '48px',
                            minHeight: '48px'
                          }}>
                            {career.icon || '🎯'}
                          </div>

                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              color: colors.text,
                              fontSize: '16px',
                              fontWeight: 'bold',
                              margin: '0 0 4px 0'
                            }}>
                              {career.name}
                            </h4>

                            <p style={{
                              color: colors.subtext,
                              fontSize: '13px',
                              margin: '0',
                              lineHeight: '1.4'
                            }}>
                              {career.description || career.quickDesc || 'Explore this career'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ));
            })()}
          </div>
        </>
      ) : viewMode === 'preview' && selectedCareerForPreview ? (
        <>
          {/* Career Preview - Detailed view */}
          <div style={{ marginBottom: '20px' }}>
            <button
              onClick={() => setViewMode('all-careers')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'none',
                border: 'none',
                color: colors.primary,
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              <ChevronLeft size={20} />
              Back to Careers
            </button>
          </div>

          {(() => {
            const career = allCareers.find(c => c.careerId === selectedCareerForPreview || c.id === selectedCareerForPreview);
            const enriched = enrichedData.get(selectedCareerForPreview);

            if (!career) return null;

            return (
              <div style={{
                backgroundColor: colors.cardBg,
                borderRadius: '16px',
                padding: '24px',
                maxWidth: '800px',
                margin: '0 auto',
                width: '100%'
              }}>
                {/* Career Header */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '24px'
                }}>
                  <div style={{
                    fontSize: '48px',
                    backgroundColor: (career.color || colors.primary) + '20',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {career.icon || '🎯'}
                  </div>

                  <div>
                    <h2 style={{
                      color: colors.text,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      margin: '0 0 8px 0'
                    }}>
                      {career.name}
                    </h2>
                    {career.category && (
                      <span style={{
                        backgroundColor: colors.primary + '20',
                        color: colors.primary,
                        padding: '4px 12px',
                        borderRadius: '16px',
                        fontSize: '14px'
                      }}>
                        {career.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Enriched Content if available */}
                {enriched ? (
                  <>
                    {/* Description */}
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{
                        color: colors.text,
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '8px'
                      }}>
                        What does a {career.name} do?
                      </h3>
                      <p style={{
                        color: colors.subtext,
                        fontSize: '14px',
                        lineHeight: '1.5'
                      }}>
                        {enriched.description}
                      </p>
                    </div>

                    {/* Daily Activities */}
                    {enriched.dailyActivities && enriched.dailyActivities.length > 0 && (
                      <div style={{ marginBottom: '20px' }}>
                        <h3 style={{
                          color: colors.text,
                          fontSize: '16px',
                          fontWeight: 'bold',
                          marginBottom: '8px'
                        }}>
                          Daily Activities
                        </h3>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '20px',
                          color: colors.subtext,
                          fontSize: '14px'
                        }}>
                          {enriched.dailyActivities.slice(0, 4).map((activity, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>{activity}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fun Fact */}
                    {enriched.funFact && (
                      <div style={{
                        backgroundColor: colors.warning + '20',
                        borderRadius: '8px',
                        padding: '12px',
                        marginBottom: '20px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          color: colors.warning,
                          fontWeight: 'bold',
                          fontSize: '14px',
                          marginBottom: '4px'
                        }}>
                          <Sparkles size={16} />
                          Fun Fact
                        </div>
                        <p style={{
                          color: colors.text,
                          fontSize: '14px',
                          margin: 0
                        }}>
                          {enriched.funFact}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ marginBottom: '24px' }}>
                    <p style={{
                      color: colors.subtext,
                      fontSize: '14px',
                      lineHeight: '1.5'
                    }}>
                      {career.description || career.quickDesc || 'Explore this career'}
                    </p>
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => handleCareerSelection(career.careerId || career.id)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: colors.accent,
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Select {career.name}
                </button>
              </div>
            );
          })()}
        </>
      ) : null}
    </div>
  );
};