// ================================================================
// CAREER, INC. LOBBY COMPONENT
// Corporate office lobby for career selection in EXPERIENCE Container
// ================================================================

import React, { useState, useEffect, useRef } from 'react';
import { Building2, Users, Star, ArrowRight, Clock, ChevronLeft, Play, Volume2, UserCheck, Briefcase, MessageCircle, Sparkles, Coffee } from 'lucide-react';
import SimpleParticlesBackground from '../SimpleParticlesBackground';
import { getLobbyConfigByGrade, LobbyConfig } from '../../config/lobbyConfigs';
import { generateCareerChoices, CareerChoice } from '../../services/careerChoiceService';
import { AssessmentResults } from '../../types/LearningTypes';
import { azureAIFoundryService } from '../../services/azureAIFoundryService';
import { careerBadgeService } from '../../services/careerBadgeService';
import { CareerBadge } from '../../types/CareerTypes';
import { PATTY_AVATAR_BASE64 } from '../../assets/pattyAvatar';
import { azureAudioService } from '../../services/azureAudioService';
import { MasterNarrative } from '../../services/narrative/MasterNarrativeGenerator';

// Helper function to get skill group name from skill number and result index
const getSkillGroupDisplayName = (skillNumber: string, subject: string, resultIndex: number): string => {
  // Since subjects may be undefined, use the result index to determine which subject this is
  // Based on the pattern: Math, ELA, Science, Social Studies
  const subjectsByIndex = ['Math', 'ELA', 'Science', 'Social Studies'];
  const detectedSubject = subject && subject !== 'General' ? subject : subjectsByIndex[resultIndex % 4];
  
  const skillGroupMappings: { [key: string]: { [subject: string]: string } } = {
    'A.0': {
      'Math': 'A.0 Integers',
      'ELA': 'A.0 Main Idea', 
      'Science': 'A.0 Science practices and tools',
      'Social Studies': 'A.0 Read maps'
    }
    // Add more skill groups as needed
  };
  
  return skillGroupMappings[skillNumber]?.[detectedSubject] || `${skillNumber} ${detectedSubject}`;
};

interface CareerIncLobbyProps {
  studentId: string;
  studentName: string;
  gradeLevel: string;
  learnResults: AssessmentResults[];
  skillGroups?: { [subject: string]: { skill_number: string; skill_name: string } }; // A.0 skill group data from cache
  masterNarrative?: MasterNarrative; // Optional Master Narrative for audio
  companionId?: string; // Current companion for voice
  onCareerSelected: (career: CareerChoice, badge?: CareerBadge) => void;
  onExit: () => void;
}

interface StudentProfile {
  gradeLevel: string;
  id: string;
}

export const CareerIncLobby: React.FC<CareerIncLobbyProps> = ({
  studentId,
  studentName,
  gradeLevel,
  learnResults,
  skillGroups,
  masterNarrative,
  companionId = 'finn',
  onCareerSelected,
  onExit
}) => {
  // Production debug - log component mount
  if (typeof window !== 'undefined') {
    console.warn('🏢 CareerIncLobby MOUNTED in production - studentName:', studentName);
  }
  const [careerChoices, setCareerChoices] = useState<CareerChoice[]>([]);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Enhanced lobby experience state
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [receptionistMessage, setReceptionistMessage] = useState('');
  const [isReceptionistSpeaking, setIsReceptionistSpeaking] = useState(false);
  const [showCareerStories, setShowCareerStories] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [pattyAvatarUrl, setPattyAvatarUrl] = useState<string | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [animationStarted, setAnimationStarted] = useState(false);
  
  // Global flag to prevent duplicate avatar generation across component instances
  const avatarGenerationRef = useRef(false);
  
  // Refs to store timer IDs and audio objects for cleanup
  const welcomeTimersRef = useRef<NodeJS.Timeout[]>([]);
  const activeAudioRef = useRef<HTMLAudioElement[]>([]);

  const lobbyConfig = getLobbyConfigByGrade(gradeLevel);
  
  // Function to skip Patty's introduction and clear all timers and audio
  const skipPattyIntro = () => {
    console.log('🏃‍♀️ skipPattyIntro called - Stack trace:');
    console.trace();
    
    // Clear all active timers
    welcomeTimersRef.current.forEach(timer => clearTimeout(timer));
    welcomeTimersRef.current = [];
    
    // Stop all active audio
    activeAudioRef.current.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    activeAudioRef.current = [];
    
    // Update state to skip to career stories
    setShowWelcomeAnimation(false);
    setShowCareerStories(true);
    setIsReceptionistSpeaking(false);
    
    console.log('🏃‍♀️ Skipped Patty\'s introduction - all timers and audio cleared');
  };
  
  // Enhanced career storylines with departmental needs
  const getDailyStoryline = (career: CareerChoice) => {
    if (!career) {
      return {
        department: 'Special Projects',
        urgency: 'medium',
        story: 'We have an exciting opportunity available that matches your skills perfectly.',
        dailyMission: 'Apply your knowledge in a real-world scenario.',
        skillsNeeded: ['Critical thinking', 'Problem solving', 'Communication'],
        timeFrame: 'Today'
      };
    }
    const storylines = {
      'police-officer': {
        department: 'Public Safety & Marketing',
        urgency: 'high',
        story: 'The Marketing Department needs a Police Officer to consult on a new Crosswalk Safety campaign. Local schools have reported increased traffic during pickup times.',
        dailyMission: 'Design safer crosswalk protocols and create educational materials for students and drivers.',
        skillsNeeded: ['Problem solving', 'Communication', 'Data analysis'],
        timeFrame: 'Today'
      },
      'teacher': {
        department: 'Education & Human Resources',
        urgency: 'medium', 
        story: 'HR is developing a new employee training program and needs an experienced Teacher to create engaging curriculum modules.',
        dailyMission: 'Develop interactive learning materials for adult workplace education.',
        skillsNeeded: ['Curriculum design', 'Adult learning', 'Assessment'],
        timeFrame: 'This morning'
      },
      'doctor': {
        department: 'Health & Wellness',
        urgency: 'high',
        story: 'The company wellness program needs a Doctor to evaluate our employee health initiatives and recommend improvements.',
        dailyMission: 'Review current health programs and design preventive care strategies.',
        skillsNeeded: ['Health assessment', 'Data interpretation', 'Program design'],
        timeFrame: 'Urgent - Today'
      },
      'engineer': {
        department: 'Technology & Innovation',
        urgency: 'medium',
        story: 'Our IT department is upgrading the office building systems and needs an Engineer to optimize energy efficiency.',
        dailyMission: 'Design sustainable solutions for office infrastructure and technology integration.',
        skillsNeeded: ['System design', 'Mathematical modeling', 'Environmental analysis'],
        timeFrame: 'This week'
      }
    };
    
    return storylines[career.careerId as keyof typeof storylines] || {
      department: 'Special Projects',
      urgency: 'medium',
      story: `The ${career.careerName || 'Career'} department has an exciting opportunity that matches your skills perfectly.`,
      dailyMission: `Apply your knowledge in a real-world ${(career.careerName || 'career').toLowerCase()} scenario.`,
      skillsNeeded: ['Critical thinking', 'Problem solving', 'Communication'],
      timeFrame: 'Today'
    };
  };

  // Play TTS audio for Patty
  const playReceptionistSpeech = async (text: string) => {
    try {
      console.log('🗣️ Attempting to generate speech for:', text.substring(0, 50) + '...');
      const audioBuffer = await azureAIFoundryService.generateReceptionistSpeech(text);
      const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Track this audio object for cleanup
      activeAudioRef.current.push(audio);
      
      console.log('🔊 Playing generated speech audio');
      audio.play();
      
      // Clean up the URL and remove from tracking when audio ends
      audio.addEventListener('ended', () => {
        URL.revokeObjectURL(audioUrl);
        // Remove this audio from the active list
        activeAudioRef.current = activeAudioRef.current.filter(a => a !== audio);
      });
      
      // Also clean up if audio errors
      audio.addEventListener('error', () => {
        URL.revokeObjectURL(audioUrl);
        activeAudioRef.current = activeAudioRef.current.filter(a => a !== audio);
      });
      
    } catch (error) {
      console.error('❌ Failed to play receptionist speech:', error);
      console.log('💬 Continuing without audio - Patty\'s visual messages still work');
      // Fallback to visual-only if TTS fails
    }
  };

  // Initialize companion audio and play narrative audio
  useEffect(() => {
    // Play introduction audio if Master Narrative is available
    if (masterNarrative && !isLoading && showWelcomeAnimation) {
      console.log('🎵 CareerIncLobby: Playing companion introduction audio', {
        companionId,
        hasIntroduction: !!masterNarrative.cohesiveStory?.introduction
      });

      // Play the career introduction from Master Narrative
      if (masterNarrative.cohesiveStory?.introduction) {
        azureAudioService.playText(
          masterNarrative.cohesiveStory.introduction,
          companionId,
          {
            scriptId: 'career.lobby.introduction',
            variables: {
              studentName,
              careerRole: masterNarrative.character?.role || 'Career Explorer'
            },
            onStart: () => {
              console.log('🔊 CareerIncLobby: Companion introduction started');
            },
            onEnd: () => {
              console.log('🔊 CareerIncLobby: Companion introduction completed');
            }
          }
        );
      }
    }

    return () => {
      // Clean up audio on unmount
      azureAudioService.stop();
    };
  }, [masterNarrative, companionId, studentName, isLoading, showWelcomeAnimation]);

  // Virtual receptionist welcome sequence - start only after page loads
  useEffect(() => {
    console.log('🎭 Welcome useEffect triggered:', {
      isLoading,
      showWelcomeAnimation,
      animationStarted
    });
    
    if (!isLoading && showWelcomeAnimation && !animationStarted) {
      console.log('🎭 Starting Patty\'s welcome sequence...');
      setAnimationStarted(true); // Prevent multiple animation starts
      
      // Minimal delay - start Patty's intro almost immediately
      const startDelay = 300;
      
      const welcomeSequence = [
        { delay: startDelay, message: `Hello ${studentName}! I'm Patty, your virtual receptionist here at Career, Inc.`, step: 1 },
        { delay: startDelay + 8000, message: `I see you've mastered some amazing skills today. Let me show you the exciting career opportunities we have available!`, step: 2 },
        { delay: startDelay + 15000, message: `Each position comes with a real departmental challenge that needs your unique skills. Ready to see what's available?`, step: 3 }
      ];
      
      welcomeSequence.forEach(({ delay, message, step }) => {
        const messageTimer = setTimeout(() => {
          setReceptionistMessage(message);
          setIsReceptionistSpeaking(true);
          setAnimationStep(step);
          
          // Play TTS audio
          playReceptionistSpeech(message);
          
          // Calculate speaking duration based on message length (roughly 150 words per minute)
          const wordCount = message.split(' ').length;
          const speakingDuration = Math.max(4000, (wordCount / 150) * 60 * 1000); // minimum 4 seconds
          
          // Stop speaking animation after message completes
          const speakingTimer = setTimeout(() => setIsReceptionistSpeaking(false), speakingDuration);
          welcomeTimersRef.current.push(speakingTimer);
        }, delay);
        welcomeTimersRef.current.push(messageTimer);
      });
      
      // End welcome sequence and show career options - extended time to see Patty
      const endSequenceTimer = setTimeout(() => {
        setShowWelcomeAnimation(false);
        setShowCareerStories(true);
      }, startDelay + 23000); // Added 2 seconds after message 3 completes
      welcomeTimersRef.current.push(endSequenceTimer);
    }
  }, [studentName, showWelcomeAnimation, isLoading, animationStarted]);
  
  // Cleanup timers and audio when component unmounts or showWelcomeAnimation changes to false
  useEffect(() => {
    return () => {
      if (!showWelcomeAnimation) {
        welcomeTimersRef.current.forEach(timer => clearTimeout(timer));
        welcomeTimersRef.current = [];
        
        // Stop all active audio
        activeAudioRef.current.forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
        activeAudioRef.current = [];
      }
    };
  }, [showWelcomeAnimation]);

  // Critical cleanup on component unmount - stop all audio regardless of state
  useEffect(() => {
    return () => {
      // Always stop all audio when component unmounts
      activeAudioRef.current.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      activeAudioRef.current = [];
      
      // Clear all timers
      welcomeTimersRef.current.forEach(timer => clearTimeout(timer));
      welcomeTimersRef.current = [];
    };
  }, []); // Empty dependency array - only runs on mount/unmount

  // Generate Patty's avatar when component loads with permanent local caching
  useEffect(() => {
    console.warn('🎨 Avatar generation useEffect triggered');
    const generatePattyAvatar = async () => {
      // Prevent multiple calls and regeneration using ref
      if (avatarGenerationRef.current) {
        console.log('🔄 Avatar generation already in progress globally, skipping...');
        return;
      }
      if (avatarLoading) {
        console.log('🔄 Avatar generation already in progress, skipping...');
        return;
      }
      if (pattyAvatarUrl) {
        console.log('✅ Avatar already loaded, skipping generation...');
        return;
      }
      
      // Set global flag to prevent duplicate generation
      avatarGenerationRef.current = true;
      
      // Check for permanently cached avatar (base64 data URL) - check multiple versions
      const cacheKeys = [
        'patty-receptionist-avatar-base64-v2', // Previous working version
        'patty-receptionist-avatar-base64-v3', // Current version
        'patty-receptionist-avatar-base64'     // Original version
      ];
      
      try {
        // Check localStorage for any cached version
        for (const cachedAvatarKey of cacheKeys) {
          const cachedAvatar = localStorage.getItem(cachedAvatarKey);
          
          if (cachedAvatar && cachedAvatar.startsWith('data:image/')) {
            console.log(`✅ Using permanently cached Patty avatar from ${cachedAvatarKey} (no API calls needed)`);
            setPattyAvatarUrl(cachedAvatar);
            avatarGenerationRef.current = false; // Reset flag since we're done
            return;
          }
        }
        
        // No cached avatar found
        console.warn('📭 No cached Patty avatar found in localStorage, will attempt generation');
        
        // Check if we have the embedded avatar as immediate fallback
        if (PATTY_AVATAR_BASE64 && PATTY_AVATAR_BASE64 !== 'data:image/jpeg;base64,PASTE_YOUR_AVATAR_DATA_HERE') {
          console.log('✅ Using embedded Patty avatar fallback');
          setPattyAvatarUrl(PATTY_AVATAR_BASE64);
          avatarGenerationRef.current = false;
          return;
        }
        
        // Skip session cache in production to avoid stale URLs - only use permanent base64 cache
        console.log('🚫 Skipping session cache to avoid stale URLs in production');
      } catch (error) {
        console.log('⚠️ Cache check failed, proceeding with generation');
      }
      
      setAvatarLoading(true);
      try {
        console.log('🎨 Generating Patty\'s avatar with DALL-E...');
        const avatarUrl = await azureAIFoundryService.generateReceptionistAvatar();
        if (avatarUrl) {
          console.log('📥 Downloading and caching avatar locally...');
          
          // Download the image and convert to base64 for permanent local storage
          try {
            const response = await fetch(avatarUrl);
            const blob = await response.blob();
            
            // Try to create a compressed version for caching
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
              // Resize for caching (smaller = fits in localStorage)
              canvas.width = 200;  // Smaller for caching
              canvas.height = 200;
              ctx?.drawImage(img, 0, 0, 200, 200);
              
              try {
                // Get compressed version
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
                const sizeInMB = (compressedDataUrl.length * 3) / 4 / 1024 / 1024;
                
                if (sizeInMB > 2) {
                  console.log(`⚠️ Even compressed avatar too large (${sizeInMB.toFixed(1)}MB), using URL directly`);
                  setPattyAvatarUrl(avatarUrl);
                } else {
                  // Use v2 key for new saves to maintain compatibility
                  const saveKey = 'patty-receptionist-avatar-base64-v2';
                  localStorage.setItem(saveKey, compressedDataUrl);
                  console.log(`✅ Patty's avatar cached as compressed JPEG (${sizeInMB.toFixed(1)}MB)!`);
                  setPattyAvatarUrl(compressedDataUrl);
                }
              } catch (cacheError) {
                console.log('⚠️ Failed to cache compressed avatar:', cacheError);
                console.log('💡 Falling back to session storage for this session');
                
                // Try session storage as fallback (clears on tab close, but works for current session)
                try {
                  sessionStorage.setItem(cachedAvatarKey, avatarUrl);
                  console.log('✅ Avatar URL cached in session storage for current session');
                } catch (sessionError) {
                  console.log('⚠️ Session storage also failed, using URL directly');
                }
                
                setPattyAvatarUrl(avatarUrl);
              }
            };
            
            img.onerror = () => {
              console.log('⚠️ Failed to load image for compression, using URL directly');
              setPattyAvatarUrl(avatarUrl);
            };
            
            // Enable CORS to prevent tainted canvas
            img.crossOrigin = 'anonymous';
            img.src = avatarUrl;
            
          } catch (downloadError) {
            console.log('⚠️ Failed to download avatar for caching, using URL directly');
            setPattyAvatarUrl(avatarUrl);
          }
          
        } else {
          console.log('⚠️ Avatar generation returned empty URL, using embedded fallback');
          // Use embedded avatar if available, otherwise show icon
          if (PATTY_AVATAR_BASE64 && PATTY_AVATAR_BASE64 !== 'data:image/jpeg;base64,PASTE_YOUR_AVATAR_DATA_HERE') {
            setPattyAvatarUrl(PATTY_AVATAR_BASE64);
          } else {
            setPattyAvatarUrl(null); // Show fallback icon
          }
        }
      } catch (error) {
        console.error('❌ Failed to generate Patty\'s avatar:', error);
        // Use embedded avatar if available, otherwise show icon
        if (PATTY_AVATAR_BASE64 && PATTY_AVATAR_BASE64 !== 'data:image/jpeg;base64,PASTE_YOUR_AVATAR_DATA_HERE') {
          setPattyAvatarUrl(PATTY_AVATAR_BASE64);
        } else {
          setPattyAvatarUrl(null); // Show fallback icon
        }
      } finally {
        setAvatarLoading(false);
        avatarGenerationRef.current = false; // Reset flag when done
      }
    };

    generatePattyAvatar();
  }, []); // Run once when component mounts
  
  useEffect(() => {
    const initializeLobby = async () => {
      const profile: StudentProfile = {
        gradeLevel,
        id: studentId
      };
      
      setStudentProfile(profile);
      
      try {
        console.log('🏢 Initializing Career, Inc. lobby for:', studentName);
        console.log('🏢 Learn results:', learnResults);
        
        const choices = await generateCareerChoices(profile, learnResults);
        console.log('🏢 Generated career choices:', choices);
        
        setCareerChoices(choices);
      } catch (error) {
        console.error('❌ Failed to generate career choices:', error);
        // Fallback careers
        setCareerChoices([
          {
            id: 'chef',
            name: 'Chef',
            emoji: '👨‍🍳',
            department: 'Creative Corner',
            description: 'Create delicious meals using your math and science skills!',
            skillApplications: {},
            subjectIntegration: ['Math'],
            difficulty: 1,
            gradeAppropriate: true
          },
          {
            id: 'teacher',
            name: 'Teacher',
            emoji: '👨‍🏫',
            department: 'School',
            description: 'Help other students learn and practice your teaching skills!',
            skillApplications: {},
            subjectIntegration: ['ELA'],
            difficulty: 1,
            gradeAppropriate: true
          },
          {
            id: 'park-ranger',
            name: 'Park Ranger',
            emoji: '🌲',
            department: 'Community Workers',
            description: 'Protect nature using your science and math knowledge!',
            skillApplications: {},
            subjectIntegration: ['Science'],
            difficulty: 1,
            gradeAppropriate: true
          }
        ]);
      }
      
      setIsLoading(false);
    };

    initializeLobby();
  }, [studentId, gradeLevel, learnResults, studentName]);

  const handleCareerSelect = async (career: CareerChoice) => {
    setSelectedCareer(career.id);
    console.log('🏢 Career selected at Career, Inc.:', career.name);
    
    try {
      // Generate career badge
      console.log('🎨 Generating badge for career:', career.name);
      const badge = await careerBadgeService.generateCareerBadge({
        careerId: career.id,
        careerName: career.name,
        department: career.department,
        gradeLevel: gradeLevel,
        studentName: studentName,
        description: career.description
      });
      
      console.log('✅ Badge generated successfully:', badge);
      
      // Brief delay for selection feedback, then proceed with badge
      setTimeout(() => {
        onCareerSelected(career, badge);
      }, 500);
      
    } catch (error) {
      console.error('❌ Badge generation failed:', error);
      
      // Proceed without badge if generation fails
      setTimeout(() => {
        onCareerSelected(career);
      }, 500);
    }
  };

  const getFinnGreeting = (): string => {
    const baseGreeting = `Welcome to Career, Inc., ${studentName}!`;
    
    switch (lobbyConfig.finnTone) {
      case 'friendly-simple':
        return `${baseGreeting} You've learned some amazing things today. Now let's put them to work in a fun job!`;
      case 'encouraging-guide':
        return `${baseGreeting} You've completed your learning journey beautifully. Now discover how your new skills apply in the real world of work!`;
      case 'executive-mentor':
        return `${baseGreeting} Congratulations on completing your professional development. Let's explore how to apply your expertise in a leadership role.`;
      default:
        return `${baseGreeting} Great job learning today. Choose your career adventure!`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Preparing Your Career Options...
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Finn is setting up your personalized career choices
          </p>
          <div className="flex justify-center mt-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative">
      <SimpleParticlesBackground theme="experience" particleCount={60} />
      {/* Corporate Header */}
      <div className="relative z-10 pt-12 pb-12">
        <div className="bg-white dark:bg-gray-800 shadow-lg border-b-4 border-blue-600">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <button
                onClick={onExit}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </button>
              
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Career, Inc.
                  </h1>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Professional Development Division
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <Clock className="w-4 h-4" />
                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Lobby Content */}
      <div className="relative z-10 pb-8">
        <div className="max-w-4xl mx-auto px-4">
        
        {/* Virtual Receptionist Welcome Animation */}
        {showWelcomeAnimation && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 relative overflow-hidden">
            {console.log('🎭 Rendering welcome animation div - State:', {
              showWelcomeAnimation,
              showCareerStories,
              animationStep,
              receptionistMessage,
              isReceptionistSpeaking,
              pattyAvatarUrl
            })}
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 to-purple-50/30 dark:from-blue-900/10 dark:to-purple-900/10"></div>
            
            {/* Skip Button for Testing */}
            <button
              onClick={skipPattyIntro}
              className="absolute top-4 right-4 z-20 bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-1"
              title="Skip Patty's introduction"
            >
              <span>Skip</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <div className="absolute top-4 right-20 opacity-20">
              <Sparkles className="w-8 h-8 text-blue-500 animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20">
              <Coffee className="w-6 h-6 text-blue-400 animate-bounce" />
            </div>
            
            <div className="relative z-10 text-center">
              {/* Virtual Receptionist Avatar - Larger Size */}
              <div className={`w-36 h-36 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center transform transition-all duration-1000 ${
                animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
              } relative overflow-hidden shadow-xl`}>
                {pattyAvatarUrl ? (
                  // Use DALL-E generated avatar
                  <img 
                    src={pattyAvatarUrl}
                    alt="Patty - Virtual Receptionist"
                    className={`w-full h-full object-cover rounded-full transform transition-all duration-500 ${
                      isReceptionistSpeaking ? 'animate-pulse' : ''
                    }`}
                    onError={() => {
                      console.log('❌ Avatar image failed to load, falling back to icon');
                      setPattyAvatarUrl(null); // Fallback to icon if image fails
                    }}
                  />
                ) : (
                  // Enhanced fallback avatar - professional and elegant  
                  <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-white to-blue-50 border-2 border-blue-200 flex items-center justify-center transform transition-all duration-500 ${
                    isReceptionistSpeaking ? 'animate-pulse scale-110' : 'scale-100'
                  } shadow-lg`}>
                    {avatarLoading ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mb-1"></div>
                        <div className="text-xs text-blue-600 font-medium">Generating...</div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        {/* Professional receptionist icon with suit */}
                        <div className="relative">
                          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mb-1">
                            <UserCheck className="w-8 h-8 text-white" />
                          </div>
                          {/* Professional badge/name tag */}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">P</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {isReceptionistSpeaking && (
                  <div className="absolute -top-2 -right-2">
                    <MessageCircle className="w-6 h-6 text-green-500 animate-bounce" />
                  </div>
                )}
              </div>
              
              {/* Receptionist Name Tag */}
              <div className={`inline-block bg-blue-100 dark:bg-blue-900/30 rounded-lg px-4 py-2 mb-6 transform transition-all duration-1000 delay-500 ${
                animationStep >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
              }`}>
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  👋 Patty - Virtual Receptionist
                </p>
                {/* Debug: Show cache status */}
                {pattyAvatarUrl && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✅ {pattyAvatarUrl.startsWith('data:') ? 'Cached Avatar' : 'Generated Avatar'}
                  </p>
                )}
              </div>
              
              {/* Animated Welcome Message */}
              {receptionistMessage && (
                <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 transform transition-all duration-1000 ${
                  animationStep >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}>
                  <div className="flex items-center justify-center mb-4">
                    <Volume2 className={`w-5 h-5 text-blue-600 mr-2 ${
                      isReceptionistSpeaking ? 'animate-pulse' : ''
                    }`} />
                    {isReceptionistSpeaking && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    )}
                  </div>
                  <p className="text-lg text-gray-700 dark:text-gray-200 leading-relaxed">
                    {receptionistMessage}
                  </p>
                </div>
              )}
              
              {/* Loading Career Opportunities */}
              {animationStep >= 3 && (
                <div className="mt-8 transform transition-all duration-1000 delay-1000">
                  <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                    <Briefcase className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-medium">Loading today's career opportunities...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Enhanced Career Stories Section */}
        {showCareerStories && (
          <div className="space-y-6">
            {/* Today's Opportunities Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                🏢 Today's Career Opportunities
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Each position comes with a real departmental challenge that needs your skills!
              </p>
            </div>
            
            {/* Career Story Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {careerChoices.map((career, index) => {
                const storyline = getDailyStoryline(career);
                const urgencyColors = {
                  high: 'border-red-200 bg-red-50 dark:bg-red-900/10',
                  medium: 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/10',
                  low: 'border-green-200 bg-green-50 dark:bg-green-900/10'
                };
                
                return (
                  <div
                    key={career.id || `career-${index}`}
                    className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer transform p-6 pt-12 relative ${
                      selectedCareer === career.id ? 'ring-4 ring-blue-500 scale-105' : ''
                    }`}
                    onClick={() => setSelectedCareer(career.id)}
                  >
                    {/* Start Today Badge */}
                    <div className="absolute top-4 right-4">
                      <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold">
                        Start Today
                      </span>
                    </div>
                      {/* Career Header */}
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-2xl">{career.emoji}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                            {career.name}
                          </h3>
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                            {career.department}
                          </p>
                        </div>
                      </div>
                      
                      {/* Career Description */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                          {career.description}
                        </p>
                      </div>
                      
                      {/* Skills Applied */}
                      {career.subjectIntegration && career.subjectIntegration.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-200 mb-2">
                            You'll use your:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {career.subjectIntegration.map((subject, idx) => (
                              <span
                                key={idx}
                                className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Apply Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCareerSelect(career);
                        }}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center space-x-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>Apply for Position</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Original Welcome Section - DISABLED while we use Patty's animation */}
        {false && !showWelcomeAnimation && !showCareerStories && !isLoading && !animationStarted && (
          <>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {lobbyConfig.title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {lobbyConfig.description}
            </p>
            
            {/* Finn's Greeting */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                    Finn, Your Learning Guide
                  </p>
                  <p className="text-blue-700 dark:text-blue-300">
                    {getFinnGreeting()}
                  </p>
                </div>
              </div>
            </div>

            {/* Skills Summary */}
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                🎯 Skills You've Mastered Today:
              </h3>
              <div className="flex flex-wrap gap-2 justify-center">
                {(() => {
                  // Use cached skill groups if available, otherwise fallback to previous logic
                  if (skillGroups) {
                    // Display skill groups from cache
                    return Object.entries(skillGroups).map(([subject, skillGroup], index) => {
                      // Find if this subject has results in learnResults
                      const hasResults = learnResults.some(result => 
                        result.subject === subject || 
                        (subject === 'SocialStudies' && result.subject === 'Social Studies')
                      );
                      
                      // Only show skill groups that have corresponding results
                      if (!hasResults) return null;
                      
                      // Find the best result for this subject
                      const subjectResult = learnResults.find(result => 
                        result.subject === subject || 
                        (subject === 'SocialStudies' && result.subject === 'Social Studies')
                      ) || learnResults[index] || { correct: true }; // fallback
                      
                      const displayName = `${skillGroup.skill_number} ${skillGroup.skill_name}`;
                      
                      return (
                        <span
                          key={subject}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            subjectResult.correct 
                              ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
                          }`}
                        >
                          {displayName} {subjectResult.correct ? '✓' : '⚡'}
                        </span>
                      );
                    }).filter(Boolean);
                  }
                  
                  // Fallback to previous logic if no skillGroups cache
                  const skillGroupsMap = new Map();
                  
                  learnResults.forEach((result, index) => {
                    // Extract the skill group from skill number (e.g., A.1 becomes A.0)
                    const skillGroup = result.skill_number ? 
                      result.skill_number.split('.').slice(0, -1).join('.') + '.0' : 
                      result.skill_number;
                    
                    // Get the skill group name with subject context and index
                    const skillName = getSkillGroupDisplayName(skillGroup || result.skill_number || 'Learning Skill', result.subject, index);
                    
                    // Keep track of the best result for this skill group
                    if (!skillGroupsMap.has(skillName) || result.correct) {
                      skillGroupsMap.set(skillName, result);
                    }
                  });
                  
                  return Array.from(skillGroupsMap.entries()).map(([skillName, result], index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        result.correct 
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200'
                      }`}
                    >
                      {skillName} {result.correct ? '✓' : '⚡'}
                    </span>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
          </>
        )}

        {/* Original Career Choice Grid - Hidden to avoid duplication with enhanced stories */}
        {false && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {careerChoices.map((career, index) => (
              <CareerChoiceCard
                key={career.id || career.careerId || `fallback-career-${index}`}
                career={career}
                lobbyConfig={lobbyConfig}
                isSelected={selectedCareer === career.id}
                onSelect={() => handleCareerSelect(career)}
              />
            ))}
          </div>
        )}

        {/* Department Legend */}
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 text-center">
            Our Departments
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {lobbyConfig.departments.map((dept) => (
              <div key={dept.id} className="text-center">
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                  style={{ backgroundColor: dept.color + '20' }}
                >
                  <span className="text-2xl">{dept.icon}</span>
                </div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {dept.name}
                </p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

// Career Choice Card Component
const CareerChoiceCard: React.FC<{
  career: CareerChoice;
  lobbyConfig: LobbyConfig;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ career, lobbyConfig, isSelected, onSelect }) => {
  return (
    <div
      onClick={onSelect}
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
        isSelected ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
      }`}
    >
      <div className="text-center">
        {/* Career Icon */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">{career.emoji}</span>
        </div>
        
        {/* Career Info */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {career.name}
        </h3>
        
        <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-3">
          {career.department}
        </p>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {career.description}
        </p>
        
        {/* Skills Applied */}
        {career.subjectIntegration.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              You'll use your:
            </p>
            <div className="flex flex-wrap gap-1 justify-center">
              {career.subjectIntegration.map((subject, idx) => (
                <span
                  key={idx}
                  className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded-full text-xs font-medium"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Select Button */}
        <button
          className={`w-full py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${
            isSelected
              ? 'bg-blue-600 text-white'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg'
          }`}
        >
          <span>{isSelected ? 'Selected!' : `Start as ${career.name}`}</span>
          {!isSelected && <ArrowRight className="w-4 h-4" />}
          {isSelected && <Star className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};

// Helper function to get background gradient by config
const getGradientByConfig = (config: LobbyConfig): string => {
  switch (config.styleClass) {
    case 'lobby-elementary':
      return 'from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20';
    case 'lobby-middle':
      return 'from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-indigo-900/20';
    case 'lobby-high':
      return 'from-slate-50 via-gray-50 to-blue-50 dark:from-gray-900 dark:via-slate-800 dark:to-gray-800';
    default:
      return 'from-blue-50 to-purple-50 dark:from-gray-900 dark:to-blue-900/20';
  }
};

export default CareerIncLobby;