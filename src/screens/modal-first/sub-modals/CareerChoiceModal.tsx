/**
 * Career Choice Selection Sub-Modal
 * Choose your career adventure for the day
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useStudentProfile } from '../../../hooks/useStudentProfile';
import { personalizationEngine } from '../../../services/personalizationEngine';
import { contentGenerationService } from '../../../services/contentGenerationService';
import { pathIQService, CareerRating } from '../../../services/pathIQService';
import { voiceManagerService } from '../../../services/voiceManagerService';
import { careerContentService } from '../../../services/careerContentService';
import './CareerChoiceModal.css';

interface CareerChoiceModalProps {
  theme: 'light' | 'dark';
  onClose: (result?: any) => void;
  user?: any;
  profile?: any;
}

interface Career {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  dailyTasks: string[];
  skillsUsed: {
    math: boolean;
    science: boolean;
    ela: boolean;
    social: boolean;
  };
  realWorldConnection: string;
  funFact: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  pathIQScore?: number;
  matchReasons?: string[];
}

export const CareerChoiceModal: React.FC<CareerChoiceModalProps> = ({ 
  theme, 
  onClose,
  user: propsUser,
  profile: propsProfile 
}) => {
  const authContext = useAuth();
  // Pass user ID and email to useStudentProfile so it can load the profile
  const profileContext = useStudentProfile(authContext?.user?.id, authContext?.user?.email);
  
  console.log('🔍 CareerChoiceModal Auth/Profile:', {
    authUserId: authContext?.user?.id,
    authUserEmail: authContext?.user?.email,
    authUserGradeLevel: authContext?.user?.grade_level,
    profileFromContext: profileContext?.profile,
    profileLoading: profileContext?.loading,
    propsProfile: propsProfile,
    propsUser: propsUser
  });
  
  // Use props if provided, otherwise fall back to context
  const user = propsUser || authContext?.user;
  const profile = propsProfile || profileContext?.profile;
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [showMoreCareers, setShowMoreCareers] = useState(false);
  const [recommendedCareers, setRecommendedCareers] = useState<Career[]>([]);
  const [passionCareers, setPassionCareers] = useState<Career[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [speakingCareerId, setSpeakingCareerId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // Theme colors based on UI guidelines
  const colors = theme === 'dark' ? {
    background: '#1A202C',
    text: '#F7FAFC',
    subtext: '#94A3B8',
    border: '#334155',
    cardBg: '#1E293B',
    selectedBg: '#334155',
    hover: '#2D3748',
    badgeBg: '#334155'
  } : {
    background: '#FFFFFF',
    text: '#1A202C',
    subtext: '#718096',
    border: '#E2E8F0',
    cardBg: '#F7FAFC',
    selectedBg: '#EDF2F7',
    hover: '#F0F4F8',
    badgeBg: '#E2E8F0'
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop any ongoing speech when component unmounts
      voiceManagerService.stopSpeaking();
    };
  }, []);

  // Generate PathIQ-powered career selections (3+1 pattern)
  useEffect(() => {
    // Log full user object to understand its structure
    console.log('CareerChoice: Full user object:', user);
    console.log('CareerChoice: User keys:', user ? Object.keys(user) : 'no user');
    console.log('CareerChoice: Profile object:', profile);
    
    // Get grade from profile (grade_level is the correct field per StudentProfile interface)
    // Also check user.grade_level directly (from mock auth data)
    const gradeLevel = profile?.grade_level || (user as any)?.grade_level || 'K';
    
    console.log('CareerChoice: useEffect triggered', { 
      profile: profile, 
      user: user, 
      grade: gradeLevel,
      userGradeLevel: (user as any)?.grade_level,
      profileGradeLevel: profile?.grade_level,
      profileKeys: profile ? Object.keys(profile) : 'no profile',
      hasUser: !!user,
      hasProfile: !!profile
    });
    
    const generateCareerContent = async () => {
      // Wait for user to be available (user loads first, profile may be null)
      if (!user) {
        console.log('CareerChoice: Waiting for user to load...');
        return;
      }
      
      // Only use fallback if we have a user but no grade information at all
      if (!gradeLevel || (gradeLevel === 'K' && !(user as any)?.grade_level && !profile?.grade_level)) {
        console.log('CareerChoice: No grade level found, using fallback');
        setError('Grade level not found - using fallback careers');
        
        // Generate grade-appropriate fallback careers
        const fallbackGrade = gradeLevel || 'K';
        const teacherContent = careerContentService.getEnrichedCareerData('Teacher', fallbackGrade);
        
        const fallbackCareers = [
          {
            id: 'teacher',
            name: 'Teacher',
            icon: teacherContent?.icon || '📚',
            color: teacherContent?.color || '#3B82F6',
            description: teacherContent?.description || 'Help kids learn new things every day',
            dailyTasks: teacherContent?.dailyActivities || ['Teach friends', 'Read stories', 'Help with homework', 'Be kind'],
            skillsUsed: { math: true, science: true, ela: true, social: true },
            realWorldConnection: teacherContent?.realWorldConnection || 'Teachers help kids grow and learn!',
            funFact: teacherContent?.funFact || 'Teachers are everyday heroes!',
            level: 'beginner' as const,
            pathIQScore: 85,
            matchReasons: ['Great for beginners', 'Learn by teaching']
          },
          (() => {
            const doctorContent = careerContentService.getEnrichedCareerData('Doctor', fallbackGrade);
            return {
              id: 'doctor',
              name: 'Doctor',
              icon: doctorContent?.icon || '👩‍⚕️',
              color: doctorContent?.color || '#14B8A6',
              description: doctorContent?.description || 'Help people feel better when they are sick',
              dailyTasks: doctorContent?.dailyActivities || ['Check if people are healthy', 'Give medicine', 'Help heal boo-boos', 'Make people smile'],
              skillsUsed: { math: true, science: true, ela: true, social: true },
              realWorldConnection: doctorContent?.realWorldConnection || 'Doctors help people stay healthy!',
              funFact: doctorContent?.funFact || 'Doctors help people feel better every day!',
              level: 'beginner' as const,
              pathIQScore: 80,
              matchReasons: ['Helps others', 'Uses science']
            };
          })(),
          (() => {
            const artistContent = careerContentService.getEnrichedCareerData('Artist', fallbackGrade);
            return {
              id: 'artist',
              name: 'Artist',
              icon: artistContent?.icon || '🎨',
              color: artistContent?.color || '#F59E0B',
              description: artistContent?.description || 'Create beautiful pictures and art',
              dailyTasks: artistContent?.dailyActivities || ['Draw pictures', 'Paint with colors', 'Make sculptures', 'Share art with friends'],
              skillsUsed: { math: false, science: false, ela: true, social: true },
              realWorldConnection: artistContent?.realWorldConnection || 'Artists make the world more beautiful!',
              funFact: artistContent?.funFact || 'Art helps people express their feelings!',
              level: 'beginner' as const,
              pathIQScore: 75,
              matchReasons: ['Express creativity', 'Make beauty']
            };
          })()
        ];
        
        setRecommendedCareers(fallbackCareers);
        
        const chefContent = careerContentService.getEnrichedCareerData('Chef', fallbackGrade);
        setPassionCareers([
          {
            id: 'chef',
            name: 'Chef',
            icon: chefContent?.icon || '👨‍🍳',
            color: chefContent?.color || '#EC4899',
            description: chefContent?.description || 'Create delicious meals',
            dailyTasks: chefContent?.dailyActivities || ['Cook yummy food', 'Try new recipes', 'Make people happy'],
            skillsUsed: { math: true, science: true, ela: false, social: true },
            realWorldConnection: chefContent?.realWorldConnection || 'Chefs bring joy through food!',
            funFact: chefContent?.funFact || 'Cooking is both art and science!',
            level: 'beginner' as const,
            pathIQScore: 70,
            matchReasons: ['Creative cooking', 'Share with others']
          },
          (() => {
            const scientistContent = careerContentService.getEnrichedCareerData('Scientist', fallbackGrade);
            return {
              id: 'scientist',
              name: 'Scientist',
              icon: scientistContent?.icon || '🔬',
              color: scientistContent?.color || '#10B981',
              description: scientistContent?.description || 'Discover amazing things',
              dailyTasks: scientistContent?.dailyActivities || ['Do experiments', 'Ask questions', 'Find answers'],
              skillsUsed: { math: true, science: true, ela: true, social: false },
              realWorldConnection: scientistContent?.realWorldConnection || 'Scientists solve mysteries!',
              funFact: scientistContent?.funFact || 'Science is everywhere!',
              level: 'beginner' as const,
              pathIQScore: 68,
              matchReasons: ['Explore and discover', 'Learn how things work']
            };
          })(),
          (() => {
            const builderContent = careerContentService.getEnrichedCareerData('Builder', fallbackGrade);
            return {
              id: 'builder',
              name: 'Builder',
              icon: builderContent?.icon || '🏗️',
              color: builderContent?.color || '#8B5CF6',
              description: builderContent?.description || 'Build amazing structures',
              dailyTasks: builderContent?.dailyActivities || ['Design buildings', 'Use tools', 'Create things'],
              skillsUsed: { math: true, science: true, ela: false, social: true },
              realWorldConnection: builderContent?.realWorldConnection || 'Builders create our world!',
              funFact: builderContent?.funFact || 'Buildings start as ideas!',
              level: 'beginner' as const,
              pathIQScore: 65,
              matchReasons: ['Build with your hands', 'See your creations']
            };
          })(),
          (() => {
            const musicianContent = careerContentService.getEnrichedCareerData('Musician', fallbackGrade);
            return {
              id: 'musician',
              name: 'Musician',
              icon: musicianContent?.icon || '🎵',
              color: musicianContent?.color || '#6366F1',
              description: musicianContent?.description || 'Make beautiful music',
              dailyTasks: musicianContent?.dailyActivities || ['Play instruments', 'Write songs', 'Perform for others'],
              skillsUsed: { math: true, science: false, ela: true, social: true },
              realWorldConnection: musicianContent?.realWorldConnection || 'Music brings joy to everyone!',
              funFact: musicianContent?.funFact || 'Music is a universal language!',
              level: 'beginner' as const,
              pathIQScore: 63,
              matchReasons: ['Express through music', 'Share your talent']
            };
          })(),
          (() => {
            const athleteContent = careerContentService.getEnrichedCareerData('Athlete', fallbackGrade);
            return {
              id: 'athlete',
              name: 'Athlete',
              icon: athleteContent?.icon || '⚽',
              color: athleteContent?.color || '#EF4444',
              description: athleteContent?.description || 'Play sports and stay active',
              dailyTasks: athleteContent?.dailyActivities || ['Practice sports', 'Work as a team', 'Stay healthy'],
              skillsUsed: { math: false, science: false, ela: false, social: true },
              realWorldConnection: athleteContent?.realWorldConnection || 'Athletes inspire others!',
              funFact: athleteContent?.funFact || 'Sports teach teamwork!',
              level: 'beginner' as const,
              pathIQScore: 60,
              matchReasons: ['Stay active', 'Be part of a team']
            };
          })(),
          (() => {
            const vetContent = careerContentService.getEnrichedCareerData('Veterinarian', fallbackGrade);
            return {
              id: 'veterinarian',
              name: 'Veterinarian',
              icon: vetContent?.icon || '🐾',
              color: vetContent?.color || '#84CC16',
              description: vetContent?.description || 'Help animals stay healthy',
              dailyTasks: vetContent?.dailyActivities || ['Care for pets', 'Help sick animals', 'Learn about animals'],
              skillsUsed: { math: false, science: true, ela: false, social: true },
              realWorldConnection: vetContent?.realWorldConnection || 'Vets are animal heroes!',
              funFact: vetContent?.funFact || 'Animals need doctors too!',
              level: 'beginner' as const,
              pathIQScore: 58,
              matchReasons: ['Love animals', 'Help furry friends']
            };
          })(),
          (() => {
            const farmerContent = careerContentService.getEnrichedCareerData('Farmer', fallbackGrade);
            return {
              id: 'farmer',
              name: 'Farmer',
              icon: farmerContent?.icon || '🌾',
              color: farmerContent?.color || '#65A30D',
              description: farmerContent?.description || 'Grow food for everyone',
              dailyTasks: farmerContent?.dailyActivities || ['Plant seeds', 'Care for crops', 'Feed animals'],
              skillsUsed: { math: true, science: true, ela: false, social: false },
              realWorldConnection: farmerContent?.realWorldConnection || 'Farmers feed the world!',
              funFact: farmerContent?.funFact || 'Food comes from farms!',
              level: 'beginner' as const,
              pathIQScore: 55,
              matchReasons: ['Work with nature', 'Grow things']
            };
          })()
        ]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        console.log('CareerChoice: Starting PathIQ career selection for grade:', gradeLevel);

        // Get PathIQ career selections (3 recommended + passion options)
        const { recommended, passionCareers: passionOptions } = pathIQService.getCareerSelections(
          user?.id || 'default',
          gradeLevel,
          profile?.interests || []
        );

        console.log('PathIQ Selections:', { recommended, passionOptions });

        // Generate AI content for recommended careers
        const recommendedPromises = recommended.map(async (careerRating: CareerRating) => {
          try {
            // Use the same grade level that was used to fetch careers
            const gradeForContent = gradeLevel;
            
            // First try to get enriched data from CareerAIRulesEngine
            console.log(`🎯 Getting content for ${careerRating.name} - Grade for content: ${gradeForContent}, Profile grade: ${profile?.grade_level}, Base grade: ${gradeLevel}`);
            const enrichedData = careerContentService.getEnrichedCareerData(
              careerRating.name,
              gradeForContent
            );
            
            if (enrichedData) {
              console.log(`📚 Using CareerEngine content for ${careerRating.name} at grade ${gradeForContent}`);
              return {
                id: careerRating.careerId,
                name: careerRating.name,
                icon: enrichedData.icon || careerRating.icon,
                color: enrichedData.color || careerRating.color,
                description: enrichedData.description,
                dailyTasks: enrichedData.dailyActivities,
                skillsUsed: {
                  math: careerRating.skillAlignment > 0.5,
                  science: careerRating.name.includes('Scientist') || careerRating.name.includes('Doctor'),
                  ela: true,
                  social: careerRating.interestAlignment > 0.5
                },
                realWorldConnection: enrichedData.realWorldConnection,
                funFact: enrichedData.funFact,
                roleModel: enrichedData.roleModel,
                tools: enrichedData.tools,
                skills: enrichedData.skills,
                challenges: enrichedData.challenges,
                rewards: enrichedData.rewards,
                level: careerRating.level || (gradeForContent === 'K' ? 'beginner' : 
                       gradeForContent <= '2' ? 'beginner' : 
                       gradeForContent <= '5' ? 'intermediate' : 'advanced'),
                category: careerRating.category || enrichedData.category,
                pathIQScore: careerRating.score,
                matchReasons: careerRating.matchReasons
              };
            }
            
            // Fallback to content generation service if not in CareerEngine
            console.log(`⚠️ CareerEngine doesn't have ${careerRating.name}, using content generation service`);
            const content = await contentGenerationService.generateContent({
              contentType: 'career_scenario',
              grade: gradeForContent,
              subject: 'Career Exploration',
              skill: careerRating.name.toLowerCase(),
              difficulty: 'medium',
              personalizedFor: user?.id,
              useFinnAgents: true
            });

            const gradeDisplay = gradeForContent?.toUpperCase();
            return {
              id: careerRating.careerId,
              name: careerRating.name,
              icon: careerRating.icon,
              color: careerRating.color,
              description: careerRating.description || content.content?.description || `Learn about being a ${careerRating.name} in grade ${gradeDisplay}`,
              dailyTasks: careerRating.dailyTasks || content.content?.activities || [
                `Help others as a ${careerRating.name}`,
                'Use important tools',
                'Solve problems',
                'Make people happy'
              ],
              skillsUsed: {
                math: careerRating.skillAlignment > 0.5,
                science: careerRating.name.includes('Scientist') || careerRating.name.includes('Doctor'),
                ela: true,
                social: careerRating.interestAlignment > 0.5
              },
              realWorldConnection: content.content?.realWorldConnection || `${careerRating.name}s help make the world better!`,
              funFact: content.content?.funFact || `Being a ${careerRating.name} is amazing!`,
              level: careerRating.level || (gradeForContent === 'K' ? 'beginner' : 
                     gradeForContent <= '2' ? 'beginner' : 
                     gradeForContent <= '5' ? 'intermediate' : 'advanced'),
              category: careerRating.category,
              pathIQScore: careerRating.score,
              matchReasons: careerRating.matchReasons
            };
          } catch (error) {
            console.error(`Error generating content for ${careerRating.name}:`, error);
            // Grade-appropriate fallback
            const gradeDisplay = (profile?.grade_level || gradeLevel)?.toUpperCase();
            return {
              id: careerRating.careerId,
              name: careerRating.name,
              icon: careerRating.icon,
              color: careerRating.color,
              description: careerRating.description || `Learn about being a ${careerRating.name}`,
              category: careerRating.category,
              dailyTasks: careerRating.dailyTasks || [
                `Help others as a ${careerRating.name}`,
                'Use special tools',
                'Solve problems',
                'Be helpful and kind'
              ],
              skillsUsed: { math: true, science: true, ela: true, social: true },
              realWorldConnection: `${careerRating.name}s help people every day!`,
              funFact: `${careerRating.name}s are very important helpers!`,
              level: 'beginner',
              pathIQScore: careerRating.score,
              matchReasons: careerRating.matchReasons
            };
          }
        });

        // Generate enriched content for ALL remaining passion careers using CareerEngine
        const passionPromises = passionOptions.map(async (careerRating: CareerRating) => {
          try {
            // Use the same grade level that was used to fetch careers
            const gradeForContent = gradeLevel;
            
            // First try to get enriched data from CareerAIRulesEngine
            const enrichedData = careerContentService.getEnrichedCareerData(
              careerRating.name,
              gradeForContent
            );
            
            if (enrichedData) {
              console.log(`📚 Using CareerEngine content for passion career ${careerRating.name} at grade ${gradeForContent}`);
              return {
                id: careerRating.careerId,
                name: careerRating.name,
                icon: enrichedData.icon || careerRating.icon,
                color: enrichedData.color || careerRating.color,
                description: enrichedData.description,
                category: careerRating.category || enrichedData.category,
                dailyTasks: enrichedData.dailyActivities,
                skillsUsed: { math: true, science: true, ela: true, social: true },
                realWorldConnection: enrichedData.realWorldConnection,
                funFact: enrichedData.funFact,
                roleModel: enrichedData.roleModel,
                tools: enrichedData.tools,
                skills: enrichedData.skills,
                challenges: enrichedData.challenges,
                rewards: enrichedData.rewards,
                level: 'beginner' as const,
                pathIQScore: careerRating.score,
                matchReasons: careerRating.matchReasons || ['Worth exploring!', 'Follow your passion!']
              };
            }
            
            // Fallback to content generation service with timeout
            console.log(`⚠️ CareerEngine doesn't have passion career ${careerRating.name}, using content generation service`);
            const content = await Promise.race([
              contentGenerationService.generateContent({
                contentType: 'career_scenario',
                grade: gradeForContent,
                subject: 'Career Exploration',
                skill: careerRating.name.toLowerCase(),
                difficulty: 'medium',
                personalizedFor: user?.id,
                useFinnAgents: false // Faster without Finn for passion careers
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('timeout')), 2000)
              )
            ]);
            
            return {
              id: careerRating.careerId,
              name: careerRating.name,
              icon: careerRating.icon,
              color: careerRating.color,
              description: careerRating.description || content.content?.description || `Explore your passion for ${careerRating.name}`,
              category: careerRating.category,
              dailyTasks: careerRating.dailyTasks || content.content?.activities?.slice(0, 3) || [
                `Discover ${careerRating.name} activities`,
                'Learn new skills',
                'Follow your interests'
              ],
              skillsUsed: { math: true, science: true, ela: true, social: true },
              realWorldConnection: content.content?.realWorldConnection || `${careerRating.name}s make a difference!`,
              funFact: content.content?.funFact || `You might love being a ${careerRating.name}!`,
              level: 'beginner' as const,
              pathIQScore: careerRating.score,
              matchReasons: careerRating.matchReasons || ['Worth exploring!', 'Follow your passion!']
            };
          } catch (error) {
            // Fallback for timeout or error
            const gradeForContent = profile?.grade_level || gradeLevel;
            
            // Still try CareerEngine even in error case
            const enrichedData = careerContentService.getEnrichedCareerData(
              careerRating.name,
              gradeForContent
            );
            
            if (enrichedData) {
              return {
                id: careerRating.careerId,
                name: careerRating.name,
                icon: enrichedData.icon || careerRating.icon,
                color: enrichedData.color || careerRating.color,
                description: enrichedData.description,
                category: careerRating.category || enrichedData.category,
                dailyTasks: enrichedData.dailyActivities,
                skillsUsed: { math: true, science: true, ela: true, social: true },
                realWorldConnection: enrichedData.realWorldConnection,
                funFact: enrichedData.funFact,
                roleModel: enrichedData.roleModel,
                tools: enrichedData.tools,
                skills: enrichedData.skills,
                challenges: enrichedData.challenges,
                rewards: enrichedData.rewards,
                level: 'beginner' as const,
                pathIQScore: careerRating.score,
                matchReasons: careerRating.matchReasons || ['Worth exploring!', 'Follow your passion!']
              };
            }
            
            return {
              id: careerRating.careerId,
              name: careerRating.name,
              icon: careerRating.icon,
              color: careerRating.color,
              description: careerRating.description || `Explore your passion for ${careerRating.name}`,
              category: careerRating.category,
              dailyTasks: careerRating.dailyTasks || [
                `Discover ${careerRating.name} activities`,
                'Learn new skills',
                'Follow your interests'
              ],
              skillsUsed: { math: true, science: true, ela: true, social: true },
              realWorldConnection: `${careerRating.name}s make a difference!`,
              funFact: `You might love being a ${careerRating.name}!`,
              level: 'beginner' as const,
              pathIQScore: careerRating.score,
              matchReasons: ['Worth exploring!', 'Follow your passion!']
            };
          }
        });

        const [generatedRecommended, generatedPassion] = await Promise.all([
          Promise.all(recommendedPromises),
          Promise.all(passionPromises)
        ]);
        
        setRecommendedCareers(generatedRecommended);
        setPassionCareers(generatedPassion);
      } catch (error) {
        console.error('Error generating career content:', error);
        setError('Failed to generate career options');
        
        // Fallback careers for the grade level
        const fallbackGrade = gradeLevel || 'K';
        const gradeNum = fallbackGrade === 'K' ? 0 : parseInt(fallbackGrade);
        
        // Always include these 3 as recommended
        setRecommendedCareers([
          {
            id: 'teacher',
            name: 'Teacher',
            icon: '📚',
            color: '#3B82F6',
            description: 'Help kids learn new things every day',
            dailyTasks: ['Teach friends', 'Read stories', 'Help with homework', 'Be kind'],
            skillsUsed: { math: true, science: true, ela: true, social: true },
            realWorldConnection: 'Teachers help kids grow and learn!',
            funFact: 'Teachers are everyday heroes!',
            level: 'beginner' as const,
            pathIQScore: 85,
            matchReasons: ['Great career to explore']
          },
          {
            id: 'doctor',
            name: 'Doctor',
            icon: '👩‍⚕️',
            color: '#14B8A6',
            description: 'Help people feel better when they are sick',
            dailyTasks: ['Check if people are healthy', 'Give medicine', 'Help heal boo-boos', 'Make people smile'],
            skillsUsed: { math: true, science: true, ela: true, social: true },
            realWorldConnection: 'Doctors help people stay healthy!',
            funFact: 'Doctors help people feel better every day!',
            level: 'beginner' as const,
            pathIQScore: 80,
            matchReasons: ['Help others feel better']
          },
          {
            id: 'artist',
            name: 'Artist',
            icon: '🎨',
            color: '#F59E0B',
            description: 'Create beautiful art',
            dailyTasks: ['Draw and paint', 'Express creativity', 'Share your art'],
            skillsUsed: { math: false, science: false, ela: true, social: true },
            realWorldConnection: 'Artists make the world beautiful!',
            funFact: 'Art is everywhere around us!',
            level: 'beginner' as const,
            pathIQScore: 75,
            matchReasons: ['Express yourself creatively']
          }
        ]);
        
        // Build passion careers based on grade level
        const elementaryPassion = [
          { id: 'chef', name: 'Chef', icon: '👨‍🍳', color: '#EC4899', description: 'Create amazing meals' },
          { id: 'scientist', name: 'Scientist', icon: '🔬', color: '#10B981', description: 'Make discoveries' },
          { id: 'builder', name: 'Builder', icon: '🏗️', color: '#8B5CF6', description: 'Build structures' },
          { id: 'musician', name: 'Musician', icon: '🎵', color: '#6366F1', description: 'Make music' },
          { id: 'athlete', name: 'Athlete', icon: '⚽', color: '#EF4444', description: 'Play sports' },
          { id: 'veterinarian', name: 'Veterinarian', icon: '🐾', color: '#84CC16', description: 'Help animals' },
          { id: 'farmer', name: 'Farmer', icon: '🌾', color: '#65A30D', description: 'Grow food' }
        ];
        
        const middleSchoolPassion = [
          ...elementaryPassion,
          { id: 'programmer', name: 'Programmer', icon: '💻', color: '#7C3AED', description: 'Create software' },
          { id: 'nurse', name: 'Nurse', icon: '👩‍⚕️', color: '#E11D48', description: 'Care for patients' },
          { id: 'police', name: 'Police Officer', icon: '👮', color: '#1E40AF', description: 'Protect and serve' },
          { id: 'firefighter', name: 'Firefighter', icon: '🚒', color: '#DC2626', description: 'Save lives' },
          { id: 'writer', name: 'Writer', icon: '✍️', color: '#D97706', description: 'Tell stories' },
          { id: 'photographer', name: 'Photographer', icon: '📷', color: '#7E22CE', description: 'Capture moments' },
          { id: 'dancer', name: 'Dancer', icon: '💃', color: '#BE185D', description: 'Express through movement' },
          { id: 'game-designer', name: 'Game Designer', icon: '🎮', color: '#F97316', description: 'Create games' },
          { id: 'youtuber', name: 'YouTuber', icon: '📹', color: '#EF4444', description: 'Create content' }
        ];
        
        const highSchoolPassion = [
          ...middleSchoolPassion,
          { id: 'engineer', name: 'Engineer', icon: '⚙️', color: '#059669', description: 'Design solutions' },
          { id: 'astronaut', name: 'Astronaut', icon: '🚀', color: '#0EA5E9', description: 'Explore space' },
          { id: 'pilot', name: 'Pilot', icon: '✈️', color: '#0284C7', description: 'Fly aircraft' },
          { id: 'lawyer', name: 'Lawyer', icon: '⚖️', color: '#991B1B', description: 'Fight for justice' },
          { id: 'architect', name: 'Architect', icon: '🏛️', color: '#4338CA', description: 'Design buildings' },
          { id: 'entrepreneur', name: 'Entrepreneur', icon: '💼', color: '#EA580C', description: 'Start businesses' },
          { id: 'data-scientist', name: 'Data Scientist', icon: '📊', color: '#0891B2', description: 'Analyze data' },
          { id: 'psychologist', name: 'Psychologist', icon: '🧠', color: '#9333EA', description: 'Understand minds' },
          { id: 'marine-biologist', name: 'Marine Biologist', icon: '🐠', color: '#0D9488', description: 'Study ocean life' },
          { id: 'robotics-engineer', name: 'Robotics Engineer', icon: '🤖', color: '#6366F1', description: 'Build robots' }
        ];
        
        // Select appropriate passion careers based on grade level
        let passionList = elementaryPassion;
        if (gradeNum > 5 && gradeNum <= 8) {
          passionList = middleSchoolPassion;
        } else if (gradeNum > 8) {
          passionList = highSchoolPassion;
        }
        
        // Convert to full career objects
        setPassionCareers(passionList.map((career, index) => ({
          ...career,
          dailyTasks: ['Explore activities', 'Learn new skills', 'Follow interests'],
          skillsUsed: { math: true, science: true, ela: true, social: true },
          realWorldConnection: `${career.name}s make a difference!`,
          funFact: `${career.name} is an exciting career!`,
          level: 'beginner' as const,
          pathIQScore: 70 - index * 2,
          matchReasons: ['Worth exploring']
        })));
      } finally {
        setIsLoading(false);
      }
    };

    generateCareerContent();
  }, [profile?.grade_level, user?.id, profile, user]);

  // Show either recommended careers or all careers (when More Careers is clicked)
  // Filter out duplicates when combining careers
  const displayedCareers = useMemo(() => {
    if (!showMoreCareers) {
      return recommendedCareers;
    }
    
    // Combine and remove duplicates based on career id
    const combinedMap = new Map();
    recommendedCareers.forEach(career => combinedMap.set(career.id, career));
    passionCareers.forEach(career => {
      if (!combinedMap.has(career.id)) {
        combinedMap.set(career.id, career);
      }
    });
    
    return Array.from(combinedMap.values());
  }, [showMoreCareers, recommendedCareers, passionCareers]);
  
  // Group careers by category when showing all careers
  const careersByCategory = useMemo(() => {
    if (!showMoreCareers) return null;
    
    const grouped = new Map<string, typeof displayedCareers>();
    displayedCareers.forEach(career => {
      const category = (career as any).category || 'Other';
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(career);
    });
    
    // Sort categories for consistent display
    const categoryOrder = ['education', 'health', 'safety', 'community', 'creative', 'technology', 'science', 'business', 'Other'];
    const sortedCategories = Array.from(grouped.keys()).sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    
    const result = new Map<string, typeof displayedCareers>();
    sortedCategories.forEach(cat => {
      result.set(cat, grouped.get(cat)!);
    });
    
    return result;
  }, [showMoreCareers, displayedCareers]);

  const handleCareerSelect = (careerId: string) => {
    setSelectedCareer(careerId);
    // Track selection in PathIQ
    pathIQService.trackCareerSelection(
      user?.id || 'default',
      careerId,
      85 // Initial engagement score
    );
  };

  const handleConfirmSelection = () => {
    if (selectedCareer) {
      const allCareers = [...recommendedCareers, ...passionCareers];
      const career = allCareers.find(c => c.id === selectedCareer);
      onClose({
        career: career?.name,
        careerId: selectedCareer,
        careerData: career
      });
    }
  };


  const toggleCardExpansion = (careerId: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(careerId)) {
      newExpanded.delete(careerId);
    } else {
      newExpanded.add(careerId);
    }
    setExpandedCards(newExpanded);
  };

  const getSubjectIcon = (subject: string) => {
    const icons: { [key: string]: string } = {
      math: '🔢',
      science: '🔬',
      ela: '📚',
      social: '🗺️'
    };
    return icons[subject] || '📖';
  };

  const getLevelColor = (level: string) => {
    const levelColors: { [key: string]: string } = {
      beginner: '#10B981',
      intermediate: '#F59E0B',
      advanced: '#EF4444'
    };
    return levelColors[level] || colors.border;
  };

  // Handle audio playback for career cards
  const handleCareerAudio = async (career: Career, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking audio button
    
    if (speakingCareerId === career.id) {
      // Stop current speech
      voiceManagerService.stopSpeaking();
      setSpeakingCareerId(null);
    } else {
      // Stop any current speech
      voiceManagerService.stopSpeaking();
      
      // Create text to speak
      const speechText = `
        ${career.name}. ${career.description}. 
        Today you'll: ${career.dailyTasks.join(', ')}.
        ${career.funFact}
      `;
      
      // Start speaking
      setSpeakingCareerId(career.id);
      
      try {
        await voiceManagerService.generateAndSpeak('finn', speechText, profile?.grade_level || gradeLevel);
      } finally {
        setSpeakingCareerId(null);
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
          right: 0,
          bottom: 0,
          backgroundColor: theme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998
        }}
      />
      <div className={`career-choice-modal theme-${theme}`}>
      {/* Header */}
      <div className="modal-header">
        <button 
          className="back-btn" 
          onClick={() => onClose()}
          style={{ color: colors.text }}
        >
          ← Back
        </button>
        <div className="header-content">
          <h2 style={{ color: colors.text }}>Choose Today's Career Adventure</h2>
          <p style={{ color: colors.subtext }}>
            {isLoading ? 'Generating personalized career options...' : 
             'Pick a career to explore - all your lessons will connect to this role!'}
          </p>
        </div>
      </div>

      {/* PathIQ Recommendation Badge */}
      <div className="pathiq-badge" style={{ 
        backgroundColor: colors.cardBg,
        padding: '1rem 2rem',
        margin: '0 2rem 1rem',
        borderRadius: '0.75rem',
        border: `1px solid ${colors.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🧠</span>
          <div>
            <span style={{ color: colors.text, fontWeight: 'bold' }}>
              {showMoreCareers ? 'Choose Your Passion Career' : 'PathIQ Recommendations'}
            </span>
            <p style={{ color: colors.subtext, fontSize: '0.875rem', margin: '0.25rem 0 0' }}>
              {showMoreCareers 
                ? `Select from ${displayedCareers.length} career${displayedCareers.length > 1 ? 's' : ''} to follow your passion`
                : 'Top 3 careers selected just for you based on your learning journey'}
            </p>
          </div>
        </div>
        {!showMoreCareers && passionCareers.length > 0 && (
          <button
            className="more-careers-btn"
            onClick={() => setShowMoreCareers(true)}
            style={{
              padding: '0.5rem 1.5rem',
              backgroundColor: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.9rem',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span>+ More Careers</span>
            <span style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.2)', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '0.25rem',
              fontSize: '0.8rem'
            }}>
              {passionCareers.length}
            </span>
          </button>
        )}
        {showMoreCareers && (
          <button
            className="back-to-recommended"
            onClick={() => setShowMoreCareers(false)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: colors.text,
              border: `1px solid ${colors.border}`,
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.875rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = colors.border;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← Back to Top 3
          </button>
        )}
      </div>

      {/* Career Grid */}
      <div className="careers-grid">
        {!showMoreCareers ? (
          // Show recommended careers without categorization
          displayedCareers.map((career, index) => (
          <div
            key={career.id}
            className={`career-card ${selectedCareer === career.id ? 'selected' : ''}`}
            style={{ 
              backgroundColor: colors.cardBg,
              borderColor: selectedCareer === career.id ? career.color : colors.border,
              animationDelay: `${index * 0.1}s`
            }}
            onClick={() => handleCareerSelect(career.id)}
          >
            {/* Header */}
            <div className="career-header" style={{ position: 'relative' }}>
              <div 
                className="career-icon"
                style={{ 
                  backgroundColor: career.color + '20',
                  borderColor: career.color
                }}
              >
                {career.icon}
              </div>
              <div className="career-title">
                <h3 style={{ color: colors.text }}>{career.name}</h3>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {!showMoreCareers && (
                    <span 
                      className="pathiq-badge"
                      style={{ 
                        backgroundColor: '#8B5CF6',
                        color: 'white',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                      }}
                    >
                      <span>Top</span>
                      <span style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        padding: '0 0.3rem',
                        borderRadius: '0.25rem'
                      }}>
                        {index + 1}
                      </span>
                    </span>
                  )}
                  {showMoreCareers && (
                    <span 
                      className="passion-badge"
                      style={{ 
                        backgroundColor: '#EC4899',
                        color: 'white',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '1rem',
                        fontSize: '0.65rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Passion Option
                    </span>
                  )}
                  <span 
                    className="level-badge"
                    style={{ 
                      backgroundColor: getLevelColor(career.level) + '20',
                      color: getLevelColor(career.level)
                    }}
                  >
                    {career.level}
                  </span>
                </div>
              </div>
              
              {/* Audio Button - Bottom Right */}
              <button
                onClick={(e) => handleCareerAudio(career, e)}
                style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  padding: '0.5rem',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: speakingCareerId === career.id ? career.color : colors.cardBg,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  boxShadow: theme === 'dark' ? '0 2px 4px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  if (speakingCareerId !== career.id) {
                    e.currentTarget.style.backgroundColor = career.color + '20';
                  }
                }}
                onMouseLeave={(e) => {
                  if (speakingCareerId !== career.id) {
                    e.currentTarget.style.backgroundColor = colors.cardBg;
                  }
                }}
                aria-label={speakingCareerId === career.id ? 'Stop audio' : 'Play audio description'}
              >
                {speakingCareerId === career.id ? (
                  <VolumeX 
                    size={18} 
                    color={theme === 'dark' ? '#fff' : '#fff'}
                    style={{ animation: 'pulse 1s infinite' }}
                  />
                ) : (
                  <Volume2 
                    size={18} 
                    color={theme === 'dark' ? colors.text : colors.subtext}
                  />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="career-description" style={{ color: colors.subtext }}>
              {career.description}
            </p>

            {/* Daily Tasks */}
            <div className="daily-tasks">
              <h4 style={{ color: colors.text }}>Today you'll:</h4>
              <ul>
                {career.dailyTasks.slice(0, 3).map((task, i) => (
                  <li key={i} style={{ color: colors.subtext }}>
                    <span style={{ color: career.color }}>•</span> {task}
                  </li>
                ))}
              </ul>
            </div>

            {/* PathIQ Match Reasons - Only show for top 3 */}
            {!showMoreCareers && career.matchReasons && career.matchReasons.length > 0 && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: colors.background,
                borderRadius: '0.5rem',
                border: `1px solid ${colors.border}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#8B5CF6' }}>✨</span>
                  <span style={{ fontSize: '0.7rem', color: colors.subtext, fontWeight: '600' }}>WHY THIS CAREER:</span>
                </div>
                {career.matchReasons.slice(0, 2).map((reason, i) => (
                  <div key={i} style={{ fontSize: '0.75rem', color: colors.subtext, marginLeft: '1rem' }}>
                    • {reason}
                  </div>
                ))}
              </div>
            )}
            
            {/* Passion Career Indicator - Show for all careers when More Careers is open */}
            {showMoreCareers && (
              <div style={{ 
                marginTop: '0.75rem',
                padding: '0.5rem',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                borderRadius: '0.5rem',
                border: `1px solid rgba(236, 72, 153, 0.3)`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem' }}>💖</span>
                  <span style={{ fontSize: '0.75rem', color: colors.subtext }}>
                    {career.pathIQScore && career.pathIQScore > 60 
                      ? 'Strong match for your interests!'
                      : 'Follow your passion - explore what interests you!'}
                  </span>
                </div>
              </div>
            )}

            {/* Subjects Used */}
            <div className="subjects-used">
              <span style={{ color: colors.subtext, fontSize: '0.75rem' }}>USES:</span>
              <div className="subject-badges">
                {Object.entries(career.skillsUsed).map(([subject, used]) => (
                  used && (
                    <span
                      key={subject}
                      className="subject-badge"
                      style={{ 
                        backgroundColor: colors.badgeBg,
                        color: colors.text
                      }}
                    >
                      {getSubjectIcon(subject)}
                    </span>
                  )
                ))}
              </div>
            </div>

            {/* Fun Fact (shown on selection) */}
            {selectedCareer === career.id && (
              <div className="career-details">
                <div className="fun-fact" style={{ 
                  backgroundColor: colors.background,
                  borderColor: career.color 
                }}>
                  <span className="fact-icon">💡</span>
                  <p style={{ color: colors.subtext }}>{career.funFact}</p>
                </div>
                <div className="real-world" style={{ color: colors.subtext }}>
                  <span className="world-icon">🌍</span> {career.realWorldConnection}
                </div>
              </div>
            )}

            {/* Selection Indicator */}
            {selectedCareer === career.id && (
              <div className="selection-indicator" style={{ backgroundColor: career.color }}>
                <span>✓ Selected</span>
              </div>
            )}
          </div>
        ))
        ) : (
          // Show categorized careers when "More Careers" is selected
          <>
            {Array.from(careersByCategory?.entries() || []).map(([category, careers]) => (
              <div key={category} style={{ gridColumn: '1 / -1' }}>
                <h3 style={{
                  color: colors.text,
                  fontSize: '1rem',
                  fontWeight: '600',
                  marginBottom: '0.75rem',
                  marginTop: '1rem',
                  textTransform: 'capitalize',
                  paddingLeft: '0.5rem',
                  borderLeft: `3px solid ${colors.border}`
                }}>
                  {category} Careers
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1rem'
                }}>
                  {careers.map((career, index) => (
                    <div
                      key={`${category}-${career.id}`}
                      className={`career-card ${selectedCareer === career.id ? 'selected' : ''}`}
                      style={{ 
                        backgroundColor: colors.cardBg,
                        borderColor: selectedCareer === career.id ? career.color : colors.border,
                        animationDelay: `${index * 0.05}s`
                      }}
                      onClick={() => handleCareerSelect(career.id)}
                    >
                      {/* Header */}
                      <div className="career-header" style={{ position: 'relative' }}>
                        <div 
                          className="career-icon"
                          style={{ 
                            backgroundColor: career.color + '20',
                            borderColor: career.color
                          }}
                        >
                          {career.icon}
                        </div>
                        <div className="career-title">
                          <h3 style={{ color: colors.text }}>{career.name}</h3>
                          <span 
                            className="level-badge"
                            style={{ 
                              backgroundColor: getLevelColor(career.level) + '20',
                              color: getLevelColor(career.level),
                              padding: '0.15rem 0.5rem',
                              borderRadius: '1rem',
                              fontSize: '0.65rem',
                              fontWeight: 'bold',
                              textTransform: 'capitalize'
                            }}
                          >
                            {career.level}
                          </span>
                        </div>
                      </div>

                      {/* Body */}
                      <div className="career-body">
                        <p style={{ 
                          color: colors.subtext, 
                          fontSize: '0.8rem', 
                          marginBottom: '0.5rem',
                          display: expandedCards.has(career.id) ? 'block' : '-webkit-box',
                          WebkitLineClamp: expandedCards.has(career.id) ? 'none' : 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: expandedCards.has(career.id) ? 'visible' : 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {career.description}
                        </p>
                        
                        {/* Expand/Collapse Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleCardExpansion(career.id);
                          }}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: career.color,
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            padding: '0.25rem 0',
                            fontWeight: '600'
                          }}
                        >
                          {expandedCards.has(career.id) ? '▼ Show Less' : '▶ Show More'}
                        </button>
                        
                        {/* Show additional details when expanded */}
                        {expandedCards.has(career.id) && (
                          <div style={{ marginTop: '0.5rem' }}>
                            {career.funFact && (
                              <p style={{ color: colors.subtext, fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                                <strong>Fun Fact:</strong> {career.funFact}
                              </p>
                            )}
                            {career.dailyTasks && career.dailyTasks.length > 0 && (
                              <div>
                                <p style={{ color: colors.subtext, fontSize: '0.75rem', fontWeight: '600', marginBottom: '0.25rem' }}>
                                  Daily Tasks:
                                </p>
                                <ul style={{ margin: '0', paddingLeft: '1.25rem' }}>
                                  {career.dailyTasks.map((task, idx) => (
                                    <li key={idx} style={{ color: colors.subtext, fontSize: '0.7rem' }}>
                                      {task}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {career.realWorldConnection && (
                              <p style={{ color: colors.subtext, fontSize: '0.75rem', marginTop: '0.5rem' }}>
                                <strong>Real World:</strong> {career.realWorldConnection}
                              </p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Selection Indicator */}
                      {selectedCareer === career.id && (
                        <div className="selection-indicator">
                          <span>✓ Selected</span>
                        </div>
                      )}
                      
                      {/* Audio Button - Bottom Right */}
                      <button
                        onClick={(e) => handleCareerAudio(career, e)}
                        style={{
                          position: 'absolute',
                          bottom: '0.5rem',
                          right: '0.5rem',
                          padding: '0.5rem',
                          borderRadius: '50%',
                          border: 'none',
                          backgroundColor: speakingCareerId === career.id ? career.color : colors.cardBg,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          transition: 'all 0.2s',
                          zIndex: 10
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                        title={speakingCareerId === career.id ? 'Stop audio' : 'Hear about this career'}
                      >
                        {speakingCareerId === career.id ? (
                          <VolumeX
                            size={18}
                            color="white"
                          />
                        ) : (
                          <Volume2 
                            size={18} 
                            color={theme === 'dark' ? colors.text : colors.subtext}
                          />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="modal-footer">
        <button
          className="confirm-btn"
          onClick={handleConfirmSelection}
          disabled={!selectedCareer}
          style={{
            background: selectedCareer 
              ? `linear-gradient(135deg, ${[...recommendedCareers, ...passionCareers].find(c => c.id === selectedCareer)?.color} 0%, ${[...recommendedCareers, ...passionCareers].find(c => c.id === selectedCareer)?.color}dd 100%)`
              : colors.border,
            opacity: selectedCareer ? 1 : 0.5
          }}
        >
          {selectedCareer 
            ? `Start as ${[...recommendedCareers, ...passionCareers].find(c => c.id === selectedCareer)?.name}` 
            : 'Select a Career'}
        </button>
      </div>
    </div>
    </>
  );
};