/**
 * Narrative Introduction Modal - Clean Version
 * Uses only CSS modules, no inline styles
 */

import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Sparkles, ChevronRight, Zap, Compass, ArrowLeft } from 'lucide-react';
import { ProgressHeader } from '../../components/navigation/ProgressHeader';
import { azureAudioService } from '../../services/azureAudioService';
import styles from './NarrativeIntroductionModal.module.css';

// Generate subject-specific career connection intro
const getSubjectCareerIntro = (subject: string, career: string, skillName: string, firstName: string, isFirstSubject: boolean): string => {
  const xpReminder = isFirstSubject
    ? " Remember, you'll earn XP points for everything you do!"
    : "";

  switch (subject.toLowerCase()) {
    case 'math':
      return `${isFirstSubject ? 'Alright' : 'Great job!'} ${firstName}! ${isFirstSubject ? "Let's start with Math!" : "Now for Math!"} As a ${career}, you use math every single day! Today, you'll learn ${skillName}. This skill helps ${career}s ${getCareerMathConnection(career)}.${xpReminder} Click Begin Your Adventure when you're ready!`;

    case 'ela':
      return `Awesome work, ${firstName}! Now let's learn ELA - that's reading and writing! As a ${career}, you need to ${getCareerELAConnection(career)}. Today, you'll learn ${skillName}. This helps you understand important information!${xpReminder} Click Begin Your Adventure!`;

    case 'science':
      return `You're doing amazing, ${firstName}! Time for Science! Every ${career} uses science to ${getCareerScienceConnection(career)}. Today, you'll learn ${skillName}. This helps you discover how things work!${xpReminder} Click Begin Your Adventure!`;

    case 'social studies':
      return `Almost done, ${firstName}! Last subject - Social Studies! As a ${career}, you need to ${getCareerSocialStudiesConnection(career)}. Today, you'll learn ${skillName}. This helps you understand people and the world!${xpReminder} Click Begin Your Adventure!`;

    default:
      return `Hi ${firstName}! Today you'll learn ${skillName} as a ${career}!${xpReminder} Click Begin Your Adventure!`;
  }
};

// Career-specific connections for each subject
const getCareerMathConnection = (career: string): string => {
  const connections: Record<string, string> = {
    'Scientist': 'measure experiments and analyze data',
    'Doctor': 'calculate medicine doses and track patient vitals',
    'Engineer': 'design buildings and calculate measurements',
    'Teacher': 'plan lessons and track student progress',
    'Chef': 'measure ingredients and calculate cooking times',
    'default': 'solve problems and make important decisions'
  };
  return connections[career] || connections.default;
};

const getCareerELAConnection = (career: string): string => {
  const connections: Record<string, string> = {
    'Scientist': 'read research papers and write about discoveries',
    'Doctor': 'read patient charts and write medical notes',
    'Engineer': 'read blueprints and write project reports',
    'Teacher': 'read books and write lesson plans',
    'Chef': 'read recipes and write new menu ideas',
    'default': 'read information and communicate clearly'
  };
  return connections[career] || connections.default;
};

const getCareerScienceConnection = (career: string): string => {
  const connections: Record<string, string> = {
    'Scientist': 'conduct experiments and make discoveries',
    'Doctor': 'understand how the body works and heal patients',
    'Engineer': 'understand materials and how things work',
    'Teacher': 'explain how the world works to students',
    'Chef': 'understand how ingredients change when cooked',
    'default': 'understand how things work'
  };
  return connections[career] || connections.default;
};

const getCareerSocialStudiesConnection = (career: string): string => {
  const connections: Record<string, string> = {
    'Scientist': 'understand the history of discoveries and work with people worldwide',
    'Doctor': 'understand different cultures and care for diverse patients',
    'Engineer': 'work with teams and understand community needs',
    'Teacher': 'teach students about history and different cultures',
    'Chef': 'learn about foods from different countries and cultures',
    'default': 'work with people and understand communities'
  };
  return connections[career] || connections.default;
};

// Age-appropriate gamification messaging
const getGamificationContent = (gradeLevel: string) => {
  const grade = gradeLevel.toUpperCase();

  if (grade === 'K' || parseInt(grade) <= 2) {
    // K-2: Very simple language but still XP
    return {
      pathIQIntro: "🎮 Let's Play and Learn!",
      pathIQMessage: "Get XP points for doing great! Your friend will help you learn!",
      earnTitle: "🌟 Get XP Points!",
      earnItems: [
        { icon: "📺", name: "Watch", desc: "+10 XP", badge: "Fun!" },
        { icon: "✅", name: "Try", desc: "+15 XP", badge: "Good job!" },
        { icon: "🎯", name: "Finish", desc: "+50 XP", badge: "Awesome!" }
      ],
      spendTitle: "✨ Use Your XP",
      spendItems: ["💡 Get Help (-5 XP)", "🔄 Try Again (-10 XP)", "🎁 Save XP"],
      spendTip: "💫 Save your XP points to level up!",
      pathIQTitle: "Your Learning Friend!",
      pathIQFeatures: [
        "🎈 I help you learn!",
        "🎮 You get XP points!",
        "🌈 You get prizes!"
      ],
      pathIQBadge: "Your Special Helper",
      pathIQTagline: "Learning is fun!"
    };
  } else if (parseInt(grade) <= 5) {
    // 3-5: Simple gaming language
    return {
      pathIQIntro: "🎮 Welcome to Your Learning Game!",
      pathIQMessage: "Earn XP points like your favorite game and level up!",
      earnTitle: "🎯 How to Earn XP Points",
      earnItems: [
        { icon: "📺", name: "Watch Videos", desc: "+10 XP", badge: "Easy!" },
        { icon: "✅", name: "Right Answers", desc: "+15 XP", badge: "Smart!" },
        { icon: "🏆", name: "Complete", desc: "+50 XP", badge: "Winner!" }
      ],
      spendTitle: "💡 Use Your XP",
      spendItems: ["💭 Hints (-5 XP)", "🔄 Retry (-10 XP)", "⭐ Save Up"],
      spendTip: "💰 Pro tip: Save XP to level up faster!",
      pathIQTitle: "PathIQ - Your Smart Helper!",
      pathIQFeatures: [
        "🎮 Makes learning like a game",
        "🏆 Gives you rewards",
        "📈 Shows your progress",
        "⭐ Helps you be a star!"
      ],
      pathIQBadge: "PathIQ Power",
      pathIQTagline: "Smart learning just for you!"
    };
  } else if (parseInt(grade) <= 8) {
    // 6-8: Gaming with career focus
    return {
      pathIQIntro: "🎮 Welcome to PathIQ - Your Personal Learning System!",
      pathIQMessage: "Earn XP, unlock achievements, and build skills for your future!",
      earnTitle: "🎯 How to Earn XP",
      earnItems: [
        { icon: "📺", name: "Watch Videos", desc: "+10-20 XP", badge: "Participate" },
        { icon: "✅", name: "Correct Answers", desc: "+15-35 XP", badge: "Accuracy" },
        { icon: "🏆", name: "Complete Tasks", desc: "+50-100 XP", badge: "Achievement" }
      ],
      spendTitle: "💡 Strategic XP Use",
      spendItems: ["💭 Get Hints (-5 XP)", "🔄 Try Again (-10 XP)", "⭐ Save for Rewards"],
      spendTip: "💰 Strategy: Balance hint usage with XP conservation for maximum level gain!",
      pathIQTitle: "PathIQ Knows You!",
      pathIQFeatures: [
        "🧠 Adapts to your learning style",
        "🎯 Connects to real careers",
        "📊 Tracks your growth",
        "🏅 Unlocks achievements"
      ],
      pathIQBadge: "Powered by PathIQ™",
      pathIQTagline: "AI that learns how you learn"
    };
  } else {
    // 9-12: Professional development focus
    return {
      pathIQIntro: "🎓 PathIQ - Professional Skill Development Platform",
      pathIQMessage: "Build career-ready skills with adaptive AI and measurable progress tracking.",
      earnTitle: "📊 XP Earning Structure",
      earnItems: [
        { icon: "📺", name: "Content Review", desc: "+10-20 XP", badge: "Engagement" },
        { icon: "✅", name: "Skill Mastery", desc: "+15-35 XP", badge: "Competency" },
        { icon: "🏆", name: "Module Completion", desc: "+50-100 XP", badge: "Milestone" }
      ],
      spendTitle: "💼 XP Investment Options",
      spendItems: ["💭 Guidance (-5 XP)", "🔄 Reattempt (-10 XP)", "📈 Bank for Growth"],
      spendTip: "💡 Investment Strategy: XP directly correlates to your professional readiness score.",
      pathIQTitle: "PathIQ Professional Development",
      pathIQFeatures: [
        "🧠 Personalized learning pathways",
        "💼 Industry-aligned curriculum",
        "📈 Performance analytics",
        "🎓 Certification preparation"
      ],
      pathIQBadge: "PathIQ Professional™",
      pathIQTagline: "Career-ready skill development"
    };
  }
};

// Helper to get companion avatar
const getCompanionAvatar = (companion: string, theme: string) => {
  const companionLower = companion.toLowerCase();
  const themeSuffix = theme === 'dark' ? 'dark' : 'light';
  return `/images/companions/${companionLower}-${themeSuffix}.png`;
};

interface NarrativeIntroductionModalProps {
  studentName: string;
  gradeLevel: string;
  career: string;
  companion: string;
  container: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  completedContainers: Set<string>;
  skill?: any;
  theme?: 'light' | 'dark' | 'cyberpunk';
  onContinue: () => void;
}

export const NarrativeIntroductionModal: React.FC<NarrativeIntroductionModalProps> = ({
  studentName,
  gradeLevel,
  career,
  companion,
  container,
  completedContainers,
  skill,
  theme = 'light',
  onContinue
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const audioPlayedRef = useRef(false);

  // Get age-appropriate content
  const gamificationContent = getGamificationContent(gradeLevel);

  // Capitalize companion name
  const companionName = companion.charAt(0).toUpperCase() + companion.slice(1).toLowerCase();

  // Debug companion image path
  console.log('🖼️ Companion Image Debug:', {
    companion,
    theme,
    imagePath: getCompanionAvatar(companion, theme)
  });

  // Play companion narration when modal appears
  useEffect(() => {
    // Prevent double-playing in React StrictMode
    if (audioPlayedRef.current) {
      console.log('🔇 NarrativeIntroduction: Audio already played, skipping');
      return;
    }
    audioPlayedRef.current = true;

    // Build the narration text based on the container, subject, and skill
    let narrationText = '';
    const firstName = studentName.split(' ')[0] || studentName;
    const subject = skill?.subject || '';
    const skillName = skill?.skill_name || skill?.name || 'new concepts';
    const isFirstSubject = completedContainers.size === 0;

    if (container === 'LEARN') {
      // Subject-specific career connection for Learn container
      narrationText = getSubjectCareerIntro(subject, career, skillName, firstName, isFirstSubject);
      console.log(`🎤 NarrativeIntroduction: Subject-specific intro for ${subject} - ${skillName} (first: ${isFirstSubject})`);
    } else if (container === 'EXPERIENCE') {
      narrationText = `Great job completing Learn Foundations, ${firstName}! Now it's time for hands-on practice in the Experience container. Here you'll apply your ${career} skills through real-world simulations and projects. This is where the fun really begins! Click Begin Your Adventure to dive into your practical ${career} experience!`;
    } else if (container === 'DISCOVER') {
      narrationText = `Wow ${firstName}, you're doing amazing! Welcome to the Discover container, where we'll explore advanced ${career} concepts and create your own projects. This is where you can really let your creativity shine! Click Begin Your Adventure to begin this final exciting phase of today's journey!`;
    }

    console.log('🎤 NarrativeIntroduction: Playing companion narration for', container, 'with', companion);

    // Play the narration using the companion's voice
    const scriptId = container === 'LEARN' ? `learn.${subject.toLowerCase()}.intro` :
                    container === 'EXPERIENCE' ? 'experience.intro' :
                    'discover.intro';

    azureAudioService.playText(narrationText, companion, {
      scriptId: scriptId,
      variables: {
        firstName: firstName,
        careerName: career,
        subject: subject,
        skillName: skillName
      },
      emotion: 'friendly',
      style: 'cheerful'
    });

    // Cleanup function to stop audio when component unmounts
    return () => {
      azureAudioService.stop();
    };
  }, [container, companion, studentName, career, skill, completedContainers]);

  const handleContinue = () => {
    setIsAnimating(true);
    // Stop any playing audio before continuing
    azureAudioService.stop();
    setTimeout(onContinue, 300);
  };

  return (
    <div className={styles.modalOverlay} data-theme={theme}>
      <div className={styles.modalContainer}>
        {/* Top Info Bar (Header) */}
        <div className={styles.topInfo}>
          <p className={styles.topInfoText}>
            📚 Subject: <span className={styles.topInfoHighlight}>{skill?.subject || container}</span> •
            🎯 Skill: <span className={styles.topInfoHighlight}>{skill?.skill_name || skill?.name || 'Learning'}</span> •
            🤖 {companionName} •
            💼 {career}
          </p>
        </div>

        <div className={styles.modalCard}>

          {/* Header */}
          <div className={`${styles.header} ${styles[`header${container}`]}`}>
            <div className={styles.headerContent}>
              <div className={styles.headerLeft}>
                <div className={styles.iconWrapper}>
                  {container === 'LEARN' && <BookOpen className={styles.headerIcon} />}
                  {container === 'EXPERIENCE' && <Zap className={styles.headerIcon} />}
                  {container === 'DISCOVER' && <Compass className={styles.headerIcon} />}
                </div>
                <div>
                  <p className={styles.headerSubtitle}>
                    {skill?.subject ? `${skill.subject} - ${container}` : `Your Learning Journey`}
                  </p>
                  <h1 className={styles.headerTitle}>
                    {skill?.skill_name || skill?.name || `Ready to ${container.charAt(0) + container.slice(1).toLowerCase()}`}
                  </h1>
                </div>
              </div>
              <div className={styles.headerRight}>
                <p className={styles.headerSubtitle}>Grade {gradeLevel}</p>
                <p className={styles.headerGrade}>{career}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>

            {/* Welcome Message */}
            <div className={styles.welcomeSection}>
              <div className={styles.companionAvatar}>
                <img
                  src={getCompanionAvatar(companion, theme)}
                  alt={companionName}
                  className={styles.companionImage}
                  onError={(e) => {
                    const target = e.currentTarget as HTMLImageElement;
                    // Try fallback to default avatar
                    if (!target.src.includes('default-avatar')) {
                      target.src = '/images/companions/default-avatar.png';
                    } else {
                      // If default also fails, hide image and show sparkles icon
                      target.style.display = 'none';
                      const sparklesIcon = document.createElement('div');
                      sparklesIcon.innerHTML = `
                        <svg class="${styles.fallbackIcon}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M12 3l2 7h7l-5.5 4 2 7L12 17l-5.5 4 2-7L3 10h7l2-7z"/>
                        </svg>
                      `;
                      sparklesIcon.className = styles.fallbackIconContainer;
                      target.parentElement?.appendChild(sparklesIcon);
                    }
                  }}
                />
              </div>

              <div className={styles.welcomeText}>
                <h2 className={styles.welcomeHeading}>
                  Hi {studentName}! Let's Learn {skill?.subject || 'Math'}! 👋
                </h2>

                <p className={styles.welcomeMessage}>
                  {companionName} here! Today you'll learn "{skill?.skill_name || skill?.name}" as a {career}!
                </p>

                {/* PathIQ and XP System Introduction */}
                <div className={styles.marketingSection}>
                  <h3 className={styles.marketingHook}>{gamificationContent.pathIQIntro}</h3>
                  <p className={styles.marketingMessage}>{gamificationContent.pathIQMessage}</p>
                </div>
              </div>
            </div>

            {/* XP System Tutorial - Always show */}
            <div className={styles.containerGrid}>
              <h3 className={styles.containerGridTitle}>{gamificationContent.earnTitle}</h3>
              <div className={styles.containers}>
                {gamificationContent.earnItems.map((item, index) => (
                  <div key={index} className={styles.containerCard}>
                    <div className={`${styles.containerIcon} ${
                      index === 0 ? styles.containerIconLearn :
                      index === 1 ? styles.containerIconExperience :
                      styles.containerIconDiscover
                    }`}>
                      <span className={styles.containerItemIcon}>{item.icon}</span>
                    </div>
                    <p className={styles.containerName}>{item.name}</p>
                    <p className={styles.containerDesc}>{item.desc}</p>
                    <div className={styles.containerBadge}>{item.badge}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* How to Use XP Points */}
            <div className={styles.phasesSection}>
              <div className={styles.phasesHeader}>
                <div className={styles.phasesIconWrapper}>
                  <span className={styles.phasesEmoji}>💡</span>
                </div>
                <h4 className={styles.phasesTitle}>{gamificationContent.spendTitle}</h4>
              </div>
              <div className={styles.phasesGrid}>
                {gamificationContent.spendItems.map((item, index) => (
                  <div key={index} className={styles.phaseCard}>{item}</div>
                ))}
              </div>
              <p className={styles.xpTip}>
                {gamificationContent.spendTip}
              </p>
            </div>

            {/* PathIQ Personalization */}
            <div className={styles.careerSection}>
              <div className={styles.careerHeader}>
                <div className={styles.careerIconWrapper}>
                  <Sparkles className={styles.careerIcon} />
                </div>
                <h4 className={styles.careerTitle}>{gamificationContent.pathIQTitle}</h4>
              </div>
              <div className={styles.careerMessage}>
                {gamificationContent.pathIQFeatures.map((feature, index) => (
                  <div key={index}>{feature}</div>
                ))}
              </div>
              <div className={styles.pathIQBadge}>
                <span className={styles.pathIQLabel}>{gamificationContent.pathIQBadge}</span>
                <span className={styles.pathIQTagline}>{gamificationContent.pathIQTagline}</span>
              </div>
            </div>

            {/* Action Button */}
            <div className={styles.actionSection}>
              <button
                onClick={handleContinue}
                disabled={isAnimating}
                className={styles.actionButton}
              >
                <span>Begin Your Adventure</span>
                <ChevronRight className={styles.actionIcon} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NarrativeIntroductionModal;