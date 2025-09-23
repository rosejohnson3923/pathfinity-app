/**
 * Career Choice Selection Modal V2 - Progressive Disclosure Pattern
 * 
 * This version only fetches enriched career data when needed:
 * - 3 recommended careers on mount
 * - Individual career data when previewed
 * - NO eager loading of all careers
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, Info, Volume2, VolumeX, Sparkles, Search, X } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { careerContentService, EnrichedCareerData } from '../../../services/careerContentService';
import { voiceManagerService } from '../../../services/voiceManagerService';
import { pathIQService } from '../../../services/pathIQService';
import { azureAudioService } from '../../../services/AzureAudioService';
import './CareerChoiceModal.css';

// Career basic data structure matching PathIQ
interface CareerBasic {
  id: string;
  careerId?: string;
  name: string;
  icon: string;
  color: string;
  description?: string; // PathIQ uses 'description' instead of 'quickDesc'
  quickDesc?: string; // Keep for compatibility
  category: string;
  skills?: string[];
  level?: string;
}

// View modes for progressive disclosure
type ViewMode = 'initial' | 'recommended-detail' | 'all-careers' | 'preview';

interface CareerChoiceModalV2Props {
  theme: 'light' | 'dark';
  onClose: (selectedCareer?: any) => void;
  user?: any;
  profile?: any;
}

export const CareerChoiceModalV2: React.FC<CareerChoiceModalV2Props> = ({
  theme,
  onClose,
  user: propsUser,
  profile: propsProfile
}) => {
  const authContext = useAuth();
  const profileContext = useStudentProfile(authContext?.user?.id, authContext?.user?.email);
  
  // Use props if provided, otherwise fall back to context
  const user = propsUser || authContext?.user;
  const profile = propsProfile || profileContext?.profile;
  
  // View state management
  const [viewMode, setViewMode] = useState<ViewMode>('initial');
  const [selectedCareerForPreview, setSelectedCareerForPreview] = useState<string | null>(null);
  const [selectedCareerForFinal, setSelectedCareerForFinal] = useState<string | null>(null);
  
  // Career data - only store what we've fetched
  const [recommendedCareers, setRecommendedCareers] = useState<any[]>([]);
  const [enrichedData, setEnrichedData] = useState<Map<string, EnrichedCareerData>>(new Map());
  const [allCareers, setAllCareers] = useState<any[]>([]);
  const [careersByCategory, setCareersByCategory] = useState<any[]>([]);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Audio refs
  const initialAudioPlayedRef = useRef(false);
  const detailAudioPlayedRef = useRef<Set<string>>(new Set());
  const audioTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get grade level
  const gradeLevel = profile?.grade_level || (user as any)?.grade_level || 'K';
  const gradeNum = gradeLevel === 'K' || gradeLevel === 'k' ? 0 : parseInt(gradeLevel) || 0;

  // Wrapper for onClose to ensure audio cleanup
  const handleClose = useCallback((selectedCareer?: any) => {
    console.log('🔊 CareerChoiceModalV2: Closing modal, stopping audio');

    // Clear any pending audio timeout
    if (audioTimeoutRef.current) {
      clearTimeout(audioTimeoutRef.current);
      audioTimeoutRef.current = null;
    }

    // Stop any playing audio
    azureAudioService.stop();

    // Call the original onClose
    onClose(selectedCareer);
  }, [onClose]);
  
  // Theme colors
  const colors = theme === 'dark' ? {
    background: '#1A202C',
    text: '#F7FAFC',
    subtext: '#94A3B8',
    border: '#334155',
    cardBg: '#1E293B',
    selectedBg: '#334155',
    hover: '#2D3748',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B'
  } : {
    background: '#FFFFFF',
    text: '#1A202C',
    subtext: '#718096',
    border: '#E2E8F0',
    cardBg: '#F7FAFC',
    selectedBg: '#EDF2F7',
    hover: '#F0F4F8',
    accent: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B'
  };
  
  // Clean up audio when component unmounts
  useEffect(() => {
    return () => {
      console.log('🔊 CareerChoiceModalV2: Stopping audio on unmount');

      // Clear any pending audio timeout
      if (audioTimeoutRef.current) {
        clearTimeout(audioTimeoutRef.current);
        audioTimeoutRef.current = null;
      }

      // Stop Azure TTS audio
      azureAudioService.stop();
    };
  }, []);

  // Play initial narration when modal opens (2.1)
  useEffect(() => {
    if (!initialAudioPlayedRef.current && !isLoading) {
      initialAudioPlayedRef.current = true;
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';
      const narrationText = `Let's have some fun with friends and choose the Top Match for your grade level or click More Options to choose your personal favorite.`;

      // Check for previously selected companion in sessionStorage, use Pat if none
      const previousCompanion = sessionStorage.getItem('selectedCompanion');
      const voiceToUse = previousCompanion || 'pat';

      console.log('🔊 CareerChoiceModalV2: Playing initial narration with voice:', voiceToUse);

      setTimeout(() => {
        azureAudioService.playText(narrationText, voiceToUse, {
          scriptId: 'career.selection_prompt',
          variables: {},
          onStart: () => console.log('🔊 Career choice initial narration started'),
          onEnd: () => console.log('🔊 Career choice initial narration ended')
        });
      }, 500);
    }
  }, [isLoading, profile, user]);

  // Initialize on mount - ONLY fetch 3 recommended careers
  useEffect(() => {
    const initializeCareers = async () => {
      setIsLoading(true);

      try {
        // Get recommended careers from PathIQ
        const recommendations = pathIQService.getCareerSelections(user?.id || 'default', gradeLevel);
        console.log('🎯 PathIQ Recommendations:', recommendations);
        setRecommendedCareers(recommendations.recommended || []);
        
        // Get all available careers for this grade from PathIQ
        const categorizedCareers = pathIQService.getCareersByCategory(gradeLevel);
        console.log(`🎯 CareerChoiceModalV2: Got ${categorizedCareers.length} categories for grade ${gradeLevel}`);
        console.log('📚 Categories:', categorizedCareers.map(c => `${c.category.name}: ${c.careers.length} careers`));
        setCareersByCategory(categorizedCareers);

        const available: any[] = [];
        categorizedCareers.forEach(({ careers }) => {
          available.push(...careers);
        });
        console.log(`✅ Total careers available in More Options: ${available.length}`);
        console.log('🔍 Career names:', available.map(c => c.name));
        setAllCareers(available);
        
        // ONLY fetch enriched data for the 3 recommended careers
        console.log('📚 Fetching enriched data for recommended careers only:', recommendations.recommended.map(c => c.name));
        
        for (const career of recommendations.recommended) {
          try {
            const enriched = careerContentService.getEnrichedCareerData(career.name, gradeLevel);
            if (enriched) {
              setEnrichedData(prev => {
                const newMap = new Map(prev);
                newMap.set(career.careerId || career.id, enriched);
                return newMap;
              });
            }
          } catch (err) {
            console.warn(`Failed to fetch enriched data for ${career.name}:`, err);
          }
        }
      } catch (error) {
        console.error('Error initializing careers:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      initializeCareers();
    }
  }, [user, gradeLevel, gradeNum]);
  
  // Handle career preview - fetch enriched data on demand
  const handleCareerPreview = useCallback(async (careerId: string) => {
    setSelectedCareerForPreview(careerId);

    // Check if we already have enriched data
    if (!enrichedData.has(careerId)) {
      setIsLoadingPreview(true);

      const career = allCareers.find(c => c.careerId === careerId || c.id === careerId);
      if (career) {
        try {
          console.log(`🔍 Fetching enriched data for preview: ${career.name}`);
          const enriched = careerContentService.getEnrichedCareerData(career.name, gradeLevel);

          if (enriched) {
            setEnrichedData(prev => {
              const newMap = new Map(prev);
              newMap.set(careerId, enriched);
              return newMap;
            });

            // Play narration for detailed career card (2.2)
            if (!detailAudioPlayedRef.current.has(careerId)) {
              detailAudioPlayedRef.current.add(careerId);
              const description = enriched.description || career.description || 'Explore this amazing career';
              const skills = enriched.skills?.join(', ') || '';

              // Simply narrate the card content directly
              const narrationText = skills ? `${description}. Skills: ${skills}.` : description;

              console.log(`🔊 CareerChoiceModalV2: Playing career detail narration for ${career.name}`);

              // Clear any existing timeout
              if (audioTimeoutRef.current) {
                clearTimeout(audioTimeoutRef.current);
              }

              audioTimeoutRef.current = setTimeout(() => {
                // Use selected companion voice, or Pat if none selected yet
                const voiceToUse = sessionStorage.getItem('selectedCompanion') || 'pat';
                azureAudioService.playText(narrationText, voiceToUse, {
                  scriptId: 'career.preview',
                  variables: {
                    careerName: career.name,
                    description: enriched.description || career.description || 'you will have amazing adventures',
                    skills: enriched.skills?.join(', ') || ''
                  },
                  onStart: () => console.log(`🔊 ${career.name} detail narration started`),
                  onEnd: () => console.log(`🔊 ${career.name} detail narration ended`)
                });
              }, 500);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch enriched data for ${career.name}:`, err);
        }
      }

      setIsLoadingPreview(false);
    } else {
      // Play narration if we already have data but haven't played audio yet
      const career = allCareers.find(c => c.careerId === careerId || c.id === careerId);
      const enriched = enrichedData.get(careerId);

      if (career && enriched && !detailAudioPlayedRef.current.has(careerId)) {
        detailAudioPlayedRef.current.add(careerId);
        const description = enriched.description || career.description || 'Explore this amazing career';
        const skills = enriched.skills?.join(', ') || '';

        // Simply narrate the card content directly
        const narrationText = skills ? `${description}. Skills: ${skills}.` : description;

        console.log(`🔊 CareerChoiceModalV2: Playing career detail narration for ${career.name}`);

        // Clear any existing timeout
        if (audioTimeoutRef.current) {
          clearTimeout(audioTimeoutRef.current);
        }

        audioTimeoutRef.current = setTimeout(() => {
          // Use selected companion voice, or Pat if none selected yet
          const voiceToUse = sessionStorage.getItem('selectedCompanion') || 'pat';
          azureAudioService.playText(narrationText, voiceToUse, {
            scriptId: 'career.preview',
            variables: {
              careerName: career.name,
              description: enriched.description || career.description || 'you will have amazing adventures',
              skills: enriched.skills?.join(', ') || ''
            },
            onStart: () => console.log(`🔊 ${career.name} detail narration started`),
            onEnd: () => console.log(`🔊 ${career.name} detail narration ended`)
          });
        }, 500);
      }
    }

    setViewMode('preview');
  }, [enrichedData, gradeLevel, allCareers]);
  
  // Handle final career selection
  const handleCareerSelection = (careerId: string) => {
    setSelectedCareerForFinal(careerId);
    const career = allCareers.find(c => c.careerId === careerId || c.id === careerId);
    const enriched = enrichedData.get(careerId);

    // Play confirmation narration (2.3)
    if (career) {
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';
      const narrationText = `Excellent choice! Let's have some fun as a ${career.name}, ${firstName}!`;

      console.log(`🔊 CareerChoiceModalV2: Playing career selection confirmation for ${career.name}`);

      // Use selected companion voice, or Pat if none selected yet
      const voiceToUse = sessionStorage.getItem('selectedCompanion') || 'pat';
      azureAudioService.playText(narrationText, voiceToUse, {
        scriptId: 'intro.career_selected',
        variables: {
          careerName: career.name,
          firstName: firstName
        },
        onStart: () => console.log('🔊 Career selection confirmation started'),
        onEnd: () => console.log('🔊 Career selection confirmation ended')
      });
    }

    // Pass back the selected career with any enriched data we have
    setTimeout(() => {
      handleClose({
        id: careerId,
        name: career?.name,
        icon: career?.icon,
        color: career?.color,
        enrichedData: enriched
      });
    }, 5000); // 5 seconds to ensure Finn finishes speaking completely
  };
  
  // Handle search
  const filteredCareers = allCareers.filter(career =>
    career.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (career.description || career.quickDesc || '').toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Render career card (basic info only)
  const renderCareerCard = (career: any, isRecommended: boolean = false) => {
    const careerIdToUse = career.careerId || career.id;
    const hasEnrichedData = enrichedData.has(careerIdToUse);
    
    return (
      <div
        key={careerIdToUse}
        onClick={() => handleCareerPreview(careerIdToUse)}
        style={{
          backgroundColor: colors.cardBg,
          border: `2px solid ${colors.border}`,
          borderRadius: '12px',
          padding: '16px',
          cursor: 'pointer',
          transition: 'all 0.2s',
          position: 'relative',
          minHeight: '120px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = colors.hover;
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = colors.cardBg;
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {isRecommended && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '8px',
            backgroundColor: colors.accent,
            color: '#FFFFFF',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Sparkles size={12} />
            Recommended
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{
            fontSize: '32px',
            backgroundColor: career.color + '20',
            borderRadius: '8px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '48px',
            minHeight: '48px'
          }}>
            {career.icon}
          </div>
          
          <div style={{ flex: 1 }}>
            <h3 style={{
              color: colors.text,
              fontSize: '18px',
              fontWeight: 'bold',
              margin: '0 0 4px 0'
            }}>
              {career.name}
            </h3>
            
            <p style={{
              color: colors.subtext,
              fontSize: '14px',
              margin: '0'
            }}>
              {career.description || career.quickDesc || 'Explore this career'}
            </p>
          </div>
        </div>
      </div>
    );
  };
  
  // Render preview modal
  const renderPreviewModal = () => {
    if (!selectedCareerForPreview) return null;
    
    const career = allCareers.find(c => c.careerId === selectedCareerForPreview || c.id === selectedCareerForPreview);
    const enriched = enrichedData.get(selectedCareerForPreview);
    
    if (!career) return null;
    
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
      }}>
        <div style={{
          backgroundColor: colors.background,
          borderRadius: '16px',
          padding: '24px',
          maxWidth: '1200px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          position: 'relative'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px'
          }}>
            <button
              onClick={() => {
                setViewMode('all-careers');
                setSelectedCareerForPreview(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: colors.text,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px'
              }}
            >
              <ChevronLeft size={20} />
              Back to careers
            </button>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Audio Button */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                style={{
                  background: soundEnabled ? colors.accent : 'transparent',
                  border: `2px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: soundEnabled ? '#FFFFFF' : colors.text,
                  cursor: 'pointer',
                  padding: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s'
                }}
                title={soundEnabled ? 'Turn off audio' : 'Turn on audio'}
              >
                {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              
              {/* Close Button */}
              <button
                onClick={() => {
                  setViewMode('all-careers');
                  setSelectedCareerForPreview(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.subtext,
                  cursor: 'pointer',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>
          </div>
          
          {/* Career Icon and Name */}
          <div style={{
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            <div style={{
              fontSize: '64px',
              backgroundColor: career.color + '20',
              borderRadius: '16px',
              padding: '16px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px'
            }}>
              {career.icon}
            </div>
            
            <h2 style={{
              color: colors.text,
              fontSize: '24px',
              fontWeight: 'bold',
              margin: '0'
            }}>
              {career.name}
            </h2>
          </div>
          
          {isLoadingPreview ? (
            <div style={{ textAlign: 'center', color: colors.subtext }}>
              Loading career details...
            </div>
          ) : enriched ? (
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
              
              {/* Fun Fact */}
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
              
              {/* Real World Connection */}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: '16px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
                  Real World Impact
                </h3>
                <p style={{
                  color: colors.subtext,
                  fontSize: '14px',
                  lineHeight: '1.5'
                }}>
                  {enriched.realWorldConnection}
                </p>
              </div>
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
      backgroundColor: colors.background,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{
          color: colors.text,
          fontSize: '28px',
          fontWeight: 'bold',
          margin: 0
        }}>
          Choose Your Career Adventure
        </h1>
        
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text,
            cursor: 'pointer'
          }}
        >
          {soundEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>
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
          {/* Recommended Careers */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{
              color: colors.text,
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '12px'
            }}>
              Recommended for You
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '16px'
            }}>
              {recommendedCareers.map(career => renderCareerCard(career, true))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {/* Quick Start with Top Match */}
            <button
              onClick={() => {
                if (recommendedCareers.length > 0) {
                  const topMatch = recommendedCareers[0];
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
            
            {/* More Options Button - Goes directly to all careers */}
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
              More Options
            </button>
          </div>
        </>
      ) : viewMode === 'all-careers' ? (
        <>
          {/* Back to Recommended */}
          <button
            onClick={() => setViewMode('initial')}
            style={{
              background: 'none',
              border: 'none',
              color: colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              marginBottom: '16px'
            }}
          >
            <ChevronLeft size={20} />
            Back to recommended
          </button>
          
          {/* Search Bar */}
          <div style={{
            position: 'relative',
            marginBottom: '20px'
          }}>
            <Search size={20} style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: colors.subtext
            }} />
            
            <input
              type="text"
              placeholder="Search careers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 40px',
                backgroundColor: colors.cardBg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                color: colors.text,
                fontSize: '16px'
              }}
            />
            
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: colors.subtext,
                  cursor: 'pointer'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
          
          {/* Careers Grouped by Category */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            marginRight: '-8px',
            paddingRight: '8px'
          }}>
            {searchTerm ? (
              // Show filtered results when searching
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                gap: '16px'
              }}>
                {filteredCareers.map(career => renderCareerCard(career, false))}
              </div>
            ) : (
              // Show grouped by category when not searching
              <>
                {careersByCategory.map(({ category, careers }) => (
                  <div key={category.id} style={{ marginBottom: '32px' }}>
                    <h3 style={{
                      color: colors.text,
                      fontSize: '18px',
                      fontWeight: 'bold',
                      marginBottom: '12px',
                      paddingBottom: '8px',
                      borderBottom: `2px solid ${colors.border}`
                    }}>
                      {category.name}
                      <span style={{
                        color: colors.subtext,
                        fontSize: '14px',
                        fontWeight: 'normal',
                        marginLeft: '8px'
                      }}>
                        ({careers.length} careers)
                      </span>
                    </h3>
                    
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                      gap: '16px'
                    }}>
                      {careers.map(career => renderCareerCard(career, false))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </>
      ) : null}
      
      {/* Preview Modal */}
      {viewMode === 'preview' && renderPreviewModal()}
    </div>
  );
};