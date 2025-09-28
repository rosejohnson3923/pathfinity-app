/**
 * SelectionConfirmationScreen Component
 *
 * Celebratory screen confirming both career and companion selection
 * Creates an exciting moment celebrating the user's choices
 * Features:
 * - Career and companion confirmation
 * - Companion reveal animation
 * - Particle celebrations
 * - Voice celebration in companion's voice
 * - Journey preview
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Star, Zap, Heart, CircleDot } from 'lucide-react';
import confetti from 'canvas-confetti';
import { azureAudioService } from '../../services/azureAudioService';
import { useAuthContext } from '../../contexts/AuthContext';
import styles from './SelectionConfirmationScreen.module.css';

interface SelectionConfirmationScreenProps {
  companionName: string;
  companionId: string;
  companionAvatar?: string;
  userName: string;
  careerName: string;
  theme?: string;
  onComplete: () => void;
}

export const SelectionConfirmationScreen: React.FC<SelectionConfirmationScreenProps> = ({
  companionName,
  companionId,
  companionAvatar,
  userName,
  careerName,
  theme,
  onComplete
}) => {
  const { user } = useAuthContext();
  const [phase, setPhase] = useState<'portal' | 'materializing' | 'greeting' | 'ready'>('portal');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const hasPlayedIntro = useRef(false);
  const hasPlayedGreeting = useRef(false);

  // Get companion avatar or emoji
  const renderCompanionAvatar = () => {
    // Only these companions have image files
    const validCompanions = ['finn', 'harmony', 'sage', 'spark'];

    if (companionAvatar) {
      return <img src={companionAvatar} alt={companionName} className={styles.companionAvatarImage} />;
    }

    if (validCompanions.includes(companionId)) {
      return (
        <img
          src={`/images/companions/${companionId}-${theme || 'dark'}.png`}
          alt={companionName}
          className={styles.companionAvatarImage}
        />
      );
    }

    // Pat uses compass emoji
    if (companionId === 'pat') {
      return <span className={styles.companionEmoji}>🧭</span>;
    }

    // Default fallback
    return <span className={styles.companionEmoji}>🎓</span>;
  };

  // Phase 1: Pat's farewell (portal opening)
  useEffect(() => {
    if (phase === 'portal' && !hasPlayedIntro.current) {
      hasPlayedIntro.current = true;

      const playPatFarewell = async () => {
        setIsAudioPlaying(true);

        // Pat's celebratory message
        const farewellText = `Excellent choices, ${userName}! You've chosen to become a ${careerName} with ${companionName} as your learning companion. Let me introduce you to ${companionName}!`;

        try {
          await azureAudioService.playTextToSpeech(
            farewellText,
            'pat', // Pat's voice for farewell
            {
              script_id: 'selection.confirmation.celebration',
              user_id: user?.user_id || 'unknown',
              companion_id: 'pat',
              variables: {
                userName,
                companionName
              }
            }
          );
        } catch (error) {
          console.error('Error playing Pat farewell:', error);
        }

        setIsAudioPlaying(false);

        // Transition to materializing phase
        setTimeout(() => {
          setPhase('materializing');

          // Trigger confetti for the magic moment
          const colors = ['#8B5CF6', '#EC4899', '#3B82F6', '#10B981'];
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.5, y: 0.5 },
            colors: colors
          });
        }, 500);
      };

      playPatFarewell();
    }
  }, [phase, userName, companionName, user]);

  // Phase 2: Companion materializes and introduces themselves
  useEffect(() => {
    if (phase === 'materializing' && !hasPlayedGreeting.current) {
      hasPlayedGreeting.current = true;

      // Wait for materialization animation
      setTimeout(async () => {
        setPhase('greeting');
        setIsAudioPlaying(true);

        // Companion's celebratory introduction in their own voice
        const greetingText = `Hello ${userName}! I'm ${companionName}, and I'm thrilled to be your learning companion for your ${careerName} journey! This is going to be incredible. Together, we'll explore, learn, and have so much fun. Let's make today amazing!`;

        try {
          await azureAudioService.playTextToSpeech(
            greetingText,
            companionId, // Companion's own voice
            {
              script_id: 'selection.confirmation.greeting',
              user_id: user?.user_id || 'unknown',
              companion_id: companionId,
              variables: {
                userName,
                companionName,
                careerName
              }
            }
          );
        } catch (error) {
          console.error('Error playing companion greeting:', error);
        }

        setIsAudioPlaying(false);

        // Transition to ready phase
        setTimeout(() => {
          setPhase('ready');

          // Final celebration
          confetti({
            particleCount: 150,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#FFD700', '#FFA500', '#FF6347']
          });
          confetti({
            particleCount: 150,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#FFD700', '#FFA500', '#FF6347']
          });
        }, 500);
      }, 2000);
    }
  }, [phase, userName, companionName, companionId, careerName, user]);

  // Auto-complete after ready phase
  useEffect(() => {
    if (phase === 'ready') {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div className={styles.container}>
      <AnimatePresence mode="wait">
        {/* Phase 1: Portal Opening */}
        {phase === 'portal' && (
          <motion.div
            key="portal"
            className={styles.portalPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className={styles.portalWrapper}>
              {/* Magical portal effect */}
              <motion.div
                className={styles.magicPortal}
                animate={{
                  rotate: 360,
                  scale: [1, 1.2, 1]
                }}
                transition={{
                  rotate: { duration: 3, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
              >
                <div className={`${styles.portalRing} ${styles.portalRing1}`} />
                <div className={`${styles.portalRing} ${styles.portalRing2}`} />
                <div className={`${styles.portalRing} ${styles.portalRing3}`} />

                <motion.div
                  className={styles.portalCenter}
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.7, 1, 0.7]
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity
                  }}
                >
                  <CircleDot className={styles.portalIcon} />
                </motion.div>
              </motion.div>

              {/* Pat's farewell message */}
              <motion.div
                className={styles.farewellMessage}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h2>Perfect Choices!</h2>
                <p>Let's celebrate your journey as a {careerName}!</p>
              </motion.div>

              {/* Energy particles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.energyParticle}
                  style={{
                    left: `${50 + 30 * Math.cos((i * Math.PI) / 4)}%`,
                    top: `${50 + 30 * Math.sin((i * Math.PI) / 4)}%`
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                >
                  <Sparkles className={styles.particleIcon} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Phase 2: Companion Materializing */}
        {phase === 'materializing' && (
          <motion.div
            key="materializing"
            className={styles.materializingPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.materializationWrapper}>
              {/* Companion avatar materializing */}
              <motion.div
                className={styles.companionMaterializing}
                initial={{ scale: 0, opacity: 0, filter: 'blur(20px)' }}
                animate={{
                  scale: [0, 1.2, 1],
                  opacity: [0, 0.7, 1],
                  filter: ['blur(20px)', 'blur(10px)', 'blur(0px)']
                }}
                transition={{ duration: 2, times: [0, 0.6, 1] }}
              >
                <div className={styles.avatarGlow}>
                  {renderCompanionAvatar()}
                </div>

                {/* Sparkle burst effect */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={styles.sparkleBurst}
                    style={{
                      position: 'absolute',
                      left: '50%',
                      top: '50%'
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: 100 * Math.cos((i * Math.PI) / 6),
                      y: 100 * Math.sin((i * Math.PI) / 6),
                      opacity: [1, 0]
                    }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                  >
                    <Star className={styles.sparkleIcon} />
                  </motion.div>
                ))}
              </motion.div>

              <motion.h2
                className={styles.materializingText}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
              >
                Your {careerName} adventure is beginning...
              </motion.h2>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Companion Greeting */}
        {phase === 'greeting' && (
          <motion.div
            key="greeting"
            className={styles.greetingPhase}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.greetingWrapper}>
              {/* Companion with speaking animation */}
              <motion.div
                className={styles.companionGreeting}
                initial={{ scale: 0.8, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div className={styles.companionAvatarContainer}>
                  {renderCompanionAvatar()}

                  {/* Speaking animation rings */}
                  {isAudioPlaying && (
                    <>
                      <motion.div
                        className={styles.speakingRing}
                        animate={{
                          scale: [1, 1.4, 1.4],
                          opacity: [0.6, 0, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut"
                        }}
                      />
                      <motion.div
                        className={styles.speakingRing}
                        animate={{
                          scale: [1, 1.4, 1.4],
                          opacity: [0.6, 0, 0]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeOut",
                          delay: 0.3
                        }}
                      />
                    </>
                  )}
                </div>

                <motion.div
                  className={styles.greetingContent}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2>Hi {userName}! I'm {companionName}!</h2>
                  <p>Together we'll master {careerName}!</p>

                  {/* Fun companion traits */}
                  <div className={styles.companionTraits}>
                    <motion.div
                      className={styles.traitBadge}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Heart className={styles.traitIcon} />
                      <span>Caring</span>
                    </motion.div>
                    <motion.div
                      className={styles.traitBadge}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Sparkles className={styles.traitIcon} />
                      <span>Fun</span>
                    </motion.div>
                    <motion.div
                      className={styles.traitBadge}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Zap className={styles.traitIcon} />
                      <span>Energetic</span>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Phase 4: Ready to Begin */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            className={styles.readyPhase}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ type: "spring" }}
          >
            <div className={styles.readyWrapper}>
              <motion.div
                className={styles.readyContent}
                animate={{
                  y: [0, -10, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className={styles.companionReady}>
                  {renderCompanionAvatar()}
                </div>

                <h1>Your Journey Begins Now!</h1>
                <p>{companionName} and you, exploring {careerName} together!</p>

                <motion.button
                  className={styles.beginButton}
                  onClick={onComplete}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Start Learning</span>
                  <Sparkles className={styles.buttonIcon} />
                </motion.button>
              </motion.div>

              {/* Celebration particles */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className={styles.celebrationParticle}
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 2}s`
                  }}
                >
                  <Star className={styles.celebrationIcon} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};