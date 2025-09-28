/**
 * AI Companion Modal V2 - Extracted from DashboardModal
 *
 * Displays 4 AI companions in a grid layout with voice preview
 * Used by both new user flow and dashboard modal
 */

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { azureAudioService } from '../../../services/azureAudioService';
import { getCompanionImageUrl } from '../../../services/aiCompanionImages';
import { SCRIPT_IDS } from '../../../constants/scriptRegistry';

interface Companion {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  specialty: string;
  teachingStyle: string;
  color: string;
  traits: string[];
  quote: string;
  voiceStyle: string;
  sampleAudio?: string;
}

const companionsWithDetails: Companion[] = [
  {
    id: 'finn',
    name: 'Finn',
    avatar: '🤖',
    personality: 'Friendly & Encouraging',
    specialty: 'Step-by-step guidance',
    teachingStyle: 'Patient and supportive, breaks down complex topics into simple steps',
    color: '#8B5CF6',
    traits: ['Patient', 'Encouraging', 'Clear', 'Supportive'],
    quote: "Let's learn together, one step at a time!",
    voiceStyle: 'Warm and friendly',
    sampleAudio: '/audio/finn-sample.mp3'
  },
  {
    id: 'sage',
    name: 'Sage',
    avatar: '🦉',
    personality: 'Wise & Thoughtful',
    specialty: 'Deep understanding',
    teachingStyle: 'Asks thought-provoking questions to help you discover answers',
    color: '#10B981',
    traits: ['Wise', 'Insightful', 'Curious', 'Philosophical'],
    quote: "The best learning comes from asking the right questions.",
    voiceStyle: 'Calm and wise',
    sampleAudio: '/audio/sage-sample.mp3'
  },
  {
    id: 'spark',
    name: 'Spark',
    avatar: '⚡',
    personality: 'Creative & Energetic',
    specialty: 'Fun and games',
    teachingStyle: 'Makes learning fun with games, jokes, and exciting challenges',
    color: '#F59E0B',
    traits: ['Creative', 'Fun', 'Energetic', 'Playful'],
    quote: "Learning is the best adventure ever!",
    voiceStyle: 'Upbeat and enthusiastic',
    sampleAudio: '/audio/spark-sample.mp3'
  },
  {
    id: 'harmony',
    name: 'Harmony',
    avatar: '🌸',
    personality: 'Calm & Supportive',
    specialty: 'Mindful learning',
    teachingStyle: 'Creates a peaceful, stress-free environment for confident learning',
    color: '#EC4899',
    traits: ['Gentle', 'Empathetic', 'Mindful', 'Nurturing'],
    quote: "Every mistake is a chance to grow stronger.",
    voiceStyle: 'Soothing and gentle',
    sampleAudio: '/audio/harmony-sample.mp3'
  }
];

interface AICompanionModalV2Props {
  theme?: 'light' | 'dark';
  onClose: (result?: { companion: string; companionId: string; companionData: Companion }) => void;
  user?: any;
  profile?: any;
}

export const AICompanionModalV2: React.FC<AICompanionModalV2Props> = ({
  theme = 'light',
  onClose,
  user: propsUser,
  profile: propsProfile
}) => {
  const authContext = useAuth();
  const profileContext = useStudentProfile(authContext?.user?.id, authContext?.user?.email);

  // Use props if provided, otherwise fall back to context
  const user = propsUser || authContext?.user;
  const profile = propsProfile || profileContext?.profile;

  const [selectedCompanionTemp, setSelectedCompanionTemp] = useState<string | null>(null);
  const [hoveredCompanion, setHoveredCompanion] = useState<string | null>(null);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const companionAudioPlayedRef = useRef(false);

  // Theme colors
  const themeColors = {
    light: {
      background: 'linear-gradient(135deg, #F0F4F8 0%, #E2E8F0 100%)',
      cardBg: '#FFFFFF',
      text: '#1A202C',
      subtext: '#718096',
      border: '#E2E8F0',
      primary: '#8B5CF6'
    },
    dark: {
      background: 'linear-gradient(135deg, #0F1419 0%, #1A202C 100%)',
      cardBg: '#1E293B',
      text: '#F7FAFC',
      subtext: '#94A3B8',
      border: '#334155',
      primary: '#8B5CF6'
    }
  };

  const colors = themeColors[theme];

  // Play introductory audio when modal opens
  useEffect(() => {
    if (!companionAudioPlayedRef.current) {
      companionAudioPlayedRef.current = true;
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';
      const companionText = `You have an important decision to make, ${firstName}. Which companion would you like to guide you on your journey today? You can click the Hear Voice button to hear them speak.`;

      console.log('🔊 AICompanionModalV2: Playing companion selection audio');

      setTimeout(() => {
        azureAudioService.playText(companionText, 'pat', {
          scriptId: 'companion.selection.intro',
          onStart: () => console.log('🔊 Companion selection audio started'),
          onEnd: () => console.log('🔊 Companion selection audio ended')
        });
      }, 500);
    }
  }, [profile, user]);

  const handlePlayAudio = async (companionId: string) => {
    // Stop any currently playing audio
    azureAudioService.stop();

    // Get the companion's greeting message
    const greetings: { [key: string]: string } = {
      finn: "Hi! I'm Finn the Explorer! Ready for an epic learning adventure? I love discovering new things and I'm excited to help you learn!",
      sage: "Greetings! I'm Sage, your wise learning guide. With patience and wisdom, we'll unlock the secrets of knowledge together!",
      spark: "Hey there! I'm Spark, full of energy and excitement! Let's power up your learning with fun and enthusiasm!",
      harmony: "Hello, friend! I'm Harmony, your calm and supportive companion. Together we'll create a peaceful and joyful learning experience!"
    };

    const greeting = greetings[companionId] || "Hello! I'm your learning companion!";

    // Play the greeting using Azure TTS with the companion's actual voice
    setPlayingAudio(companionId);
    azureAudioService.playText(greeting, companionId, {
      scriptId: 'companion.preview',
      onStart: () => setPlayingAudio(companionId),
      onEnd: () => setPlayingAudio(null)
    });
  };

  const stopAudio = () => {
    azureAudioService.stop();
    setPlayingAudio(null);
  };

  const handleCompanionConfirm = () => {
    if (selectedCompanionTemp) {
      const companion = companionsWithDetails.find(c => c.id === selectedCompanionTemp);
      const firstName = profile?.first_name || user?.full_name?.split(' ')[0] || 'friend';

      // Play confirmation from the companion's perspective
      const confirmText = `Hi ${firstName}! I'm ${companion?.name}, and I'm so excited to be your learning companion today! Let's have an amazing adventure together!`;

      console.log('🔊 AICompanionModalV2: Playing companion selection confirmation');

      // Use the SELECTED companion's voice!
      const companionVoice = selectedCompanionTemp || 'finn';

      azureAudioService.playText(confirmText, companionVoice, {
        scriptId: 'companion.selected',
        variables: {
          firstName,
          companionName: companion?.name || 'your companion'
        },
        onStart: () => console.log(`🔊 Companion confirmation audio started with ${companionVoice}'s voice`),
        onEnd: () => console.log('🔊 Companion confirmation audio ended')
      });

      // Close the modal with the companion selection
      if (companion) {
        onClose({
          companion: selectedCompanionTemp,
          companionId: selectedCompanionTemp,
          companionData: companion
        });
      }
    }
  };

  return (
    <>
      {/* Modal Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
      />

      <div
        className={`ai-companion-modal theme-${theme}`}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90vw',
          maxWidth: '1200px',
          height: '90vh',
          maxHeight: '800px',
          boxSizing: 'border-box',
          backgroundColor: colors.cardBg,
          borderRadius: '1rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Modal Header */}
        <div className="modal-header" style={{
          padding: '1.5rem 2rem',
          borderBottom: `1px solid ${colors.border}`,
          backgroundColor: colors.cardBg,
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{
              color: colors.text,
              margin: 0,
              fontSize: '1.5rem',
              fontWeight: 600
            }}>
              Choose Your AI Companion
            </h2>
            <p style={{
              color: colors.subtext,
              margin: '0.5rem 0 0',
              fontSize: '0.875rem'
            }}>
              Select a learning companion to guide you through today's activities
            </p>
          </div>
        </div>

        {/* Scrollable Content Container */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
          {/* Companion Grid - 4 Cards in a Row */}
          <div className="companions-grid" style={{
            padding: '2rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
            gap: '0.75rem',
            maxWidth: '1100px',
            margin: '0 auto'
          }}>
            {companionsWithDetails.map((companion, index) => (
              <div
                key={companion.id}
                className={`companion-card ${selectedCompanionTemp === companion.id ? 'selected' : ''}`}
                role="button"
                tabIndex={0}
                aria-label={`Select ${companion.name} as your AI companion`}
                aria-pressed={selectedCompanionTemp === companion.id}
                style={{
                  backgroundColor: colors.cardBg,
                  border: `2px solid ${selectedCompanionTemp === companion.id ? companion.color : colors.border}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  animationDelay: `${index * 0.1}s`,
                  position: 'relative',
                  width: '100%',
                  minHeight: '500px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onClick={() => setSelectedCompanionTemp(companion.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedCompanionTemp(companion.id);
                  }
                }}
                onMouseEnter={() => setHoveredCompanion(companion.id)}
                onMouseLeave={() => setHoveredCompanion(null)}
              >
                {/* Avatar & Name */}
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    margin: '0 auto 0.75rem',
                    backgroundColor: companion.color + '20',
                    border: `2px solid ${companion.color}`,
                    borderRadius: '50%',
                    overflow: 'hidden'
                  }}>
                    <img
                      src={getCompanionImageUrl(companion.id, 'default')}
                      alt={companion.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <h3 style={{ color: colors.text, margin: '0.25rem 0', fontSize: '1.1rem' }}>{companion.name}</h3>
                  <p style={{ color: companion.color, fontSize: '0.8rem', margin: 0 }}>
                    {companion.personality}
                  </p>
                </div>

                {/* Description */}
                <p style={{
                  color: colors.subtext,
                  fontSize: '0.8rem',
                  marginBottom: '0.75rem',
                  lineHeight: '1.4',
                  textAlign: 'center',
                  minHeight: '3.5em'
                }}>
                  {companion.teachingStyle}
                </p>

                {/* Traits */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '0.3rem',
                  marginBottom: '0.75rem',
                  justifyItems: 'center'
                }}>
                  {companion.traits.map((trait, i) => (
                    <span
                      key={i}
                      style={{
                        backgroundColor: companion.color + '15',
                        color: companion.color,
                        border: `1px solid ${companion.color}30`,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.7rem',
                        textAlign: 'center',
                        width: 'fit-content'
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>

                {/* Quote */}
                <div style={{
                  backgroundColor: colors.background,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '0.5rem',
                  padding: '0.5rem',
                  marginBottom: '0.75rem'
                }}>
                  <p style={{
                    color: colors.subtext,
                    fontStyle: 'italic',
                    fontSize: '1rem',
                    margin: 0,
                    lineHeight: '1.4',
                    textAlign: 'center',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    <span style={{ color: companion.color, fontSize: '1.2rem', marginRight: '0.25rem' }}>"</span>
                    {companion.quote}
                  </p>
                </div>

                {/* Voice Style with Audio Preview */}
                <div style={{ marginTop: '1.5rem' }}>
                  <div style={{ color: colors.subtext, fontSize: '0.8rem', marginBottom: '1.2rem' }}>
                    <span>🎙️</span> {companion.voiceStyle}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (playingAudio === companion.id) {
                        stopAudio();
                      } else {
                        handlePlayAudio(companion.id);
                      }
                    }}
                    style={{
                      padding: '0.4rem 0.8rem',
                      backgroundColor: playingAudio === companion.id ? companion.color : 'transparent',
                      color: playingAudio === companion.id ? 'white' : companion.color,
                      border: `2px solid ${companion.color}`,
                      borderRadius: '0.5rem',
                      cursor: 'pointer',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      maxWidth: '160px',
                      margin: '0 auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <span>{playingAudio === companion.id ? '⏸️' : '▶️'}</span>
                    <span>{playingAudio === companion.id ? 'Stop' : 'Hear Voice'}</span>
                  </button>
                </div>

                {/* Selection Indicator */}
                {selectedCompanionTemp === companion.id && (
                  <div style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    backgroundColor: companion.color,
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.25rem',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    ✓ Selected
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Selection Info */}
          {selectedCompanionTemp && (
            <div style={{
              backgroundColor: colors.cardBg,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              width: 'calc(100% - 4rem)',
              maxWidth: '800px',
              margin: '1rem auto',
              padding: '1rem 2rem'
            }}>
              <p style={{ color: colors.text, margin: '0 0 0.5rem' }}>
                Great choice! {companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.name} will be your companion today.
              </p>
              <p style={{ color: colors.subtext, fontSize: '0.875rem', margin: 0 }}>
                You can change your companion anytime from the settings menu.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '1.5rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.cardBg,
          flexShrink: 0
        }}>
          <button
            onClick={handleCompanionConfirm}
            disabled={!selectedCompanionTemp}
            style={{
              background: selectedCompanionTemp
                ? `linear-gradient(135deg, ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.color} 0%, ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.color}dd 100%)`
                : colors.border,
              color: 'white',
              border: 'none',
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: selectedCompanionTemp ? 'pointer' : 'not-allowed',
              opacity: selectedCompanionTemp ? 1 : 0.5,
              minWidth: '200px'
            }}
          >
            {selectedCompanionTemp
              ? `Continue with ${companionsWithDetails.find(c => c.id === selectedCompanionTemp)?.name}`
              : 'Select a Companion'}
          </button>
        </div>
      </div>
    </>
  );
};