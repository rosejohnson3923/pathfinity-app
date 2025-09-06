/**
 * Mock Learning Container Component
 * Simulates the learning experience for demonstration purposes
 */

import React, { useState, useEffect } from 'react';
import { companionVoiceoverService } from '../services/companionVoiceoverService';
import { contentGenerationService } from '../services/contentGenerationService';
import { useAuth } from '../hooks/useAuth';
import { useStudentProfile } from '../hooks/useStudentProfile';
import { skillsData } from '../data/skillsDataComplete';
import { personalizationEngine } from '../services/personalizationEngine';

interface MockLearningContainerProps {
  containerId: 'LEARN' | 'EXPERIENCE' | 'DISCOVER';
  objectives: string[];
  career: string;
  companion: string;
  theme?: 'light' | 'dark';
  onComplete: () => void;
}

// Academic content with career-specific context
const getAcademicContentWithCareerLens = (
  subject: string,
  career: string,
  grade: string,
  skill?: string
) => {
  // Map various grade formats to a common key
  const normalizedGrade = grade === 'K' || grade === 'Kindergarten' || grade === 'K-2' ? 'K-2' :
                          grade === '3-5' || grade === 'Grade 3' ? '3-5' :
                          grade === '6-8' || grade === 'Grade 6' ? '6-8' :
                          grade === '9-12' || grade === 'Grade 9' ? '9-12' : 'K-2';
  
  // Grade-specific academic skills mapped to careers
  const gradeSkillsMap: Record<string, Record<string, any>> = {
    'K-2': {
      'Mathematics': {
        'Artist': {
          title: 'Counting with Art Supplies',
          content: 'Artists use math every day! Let\'s count paintbrushes, mix colors, and measure our artwork.',
          activities: [
            'Count 1-10 paintbrushes 🎨',
            'Sort art supplies by size',
            'Measure paper with hand spans',
            'Create patterns with shapes'
          ],
          skills: ['Count to 20', 'Identify shapes', 'Compare sizes', 'Create patterns'],
          realWorld: 'Artists count their supplies, measure canvases, and use shapes to create beautiful artwork!'
        },
        'Teacher': {
          title: 'Counting Classroom Objects',
          content: 'Teachers use numbers to organize their classroom. Let\'s practice counting students, books, and supplies!',
          activities: [
            'Count students in class',
            'Organize books by number',
            'Distribute supplies equally',
            'Create number charts'
          ],
          skills: ['Count to 20', 'One-to-one correspondence', 'Number recognition', 'Simple addition'],
          realWorld: 'Teachers count students for attendance, organize materials, and use math to plan lessons!'
        },
        'Doctor': {
          title: 'Numbers Keep Us Healthy',
          content: 'Doctors use numbers to help people feel better. Let\'s count heartbeats, measure height, and learn about healthy habits!',
          activities: [
            'Count heartbeats in 10 seconds',
            'Measure with a toy stethoscope',
            'Count healthy foods',
            'Track daily water glasses'
          ],
          skills: ['Count to 20', 'Basic measurement', 'Comparing numbers', 'Tally marks'],
          realWorld: 'Doctors count heartbeats, measure temperature, and track medicine doses to keep patients healthy!'
        },
        'default': {
          title: 'Numbers in Your Future Career',
          content: `Every ${career} uses math! Let\'s explore counting, measuring, and patterns.`,
          activities: [
            'Count objects to 20',
            'Sort and classify items',
            'Identify patterns',
            'Practice measuring'
          ],
          skills: ['Counting', 'Sorting', 'Patterns', 'Basic measurement'],
          realWorld: `${career} professionals use math every day in their work!`
        }
      },
      'Science': {
        'Artist': {
          title: 'Color Science for Artists',
          content: 'Artists are scientists too! Let\'s explore how colors mix, how paint dries, and what makes art materials work.',
          activities: [
            'Mix primary colors 🎨',
            'Observe paint drying',
            'Test different papers',
            'Create color experiments'
          ],
          skills: ['Observation', 'Color mixing', 'Cause and effect', 'Recording findings'],
          realWorld: 'Artists use science to understand how materials work and create amazing effects!'
        },
        'default': {
          title: `Science in ${career}`,
          content: `${career} professionals use science to understand the world. Let\'s explore and discover!`,
          activities: [
            'Observe and describe',
            'Ask questions',
            'Simple experiments',
            'Record findings'
          ],
          skills: ['Observation', 'Questioning', 'Experimenting', 'Recording'],
          realWorld: `${career} professionals use scientific thinking every day!`
        }
      },
      'English Language Arts': {
        'Artist': {
          title: 'Stories Through Art',
          content: 'Artists tell stories with pictures! Let\'s learn letters, words, and how to share our artistic ideas.',
          activities: [
            'Label artwork with words',
            'Tell stories about paintings',
            'Write artist statements',
            'Read art picture books'
          ],
          skills: ['Letter recognition', 'Beginning writing', 'Storytelling', 'Vocabulary'],
          realWorld: 'Artists write about their work, create picture books, and use words to share their vision!'
        },
        'default': {
          title: `Reading and Writing for Future ${career}s`,
          content: `${career} professionals read and write every day. Let\'s practice our letters and words!`,
          activities: [
            'Practice letter formation',
            'Build vocabulary',
            'Tell stories',
            'Read together'
          ],
          skills: ['Letters', 'Words', 'Sentences', 'Stories'],
          realWorld: `${career} professionals communicate through reading and writing!`
        }
      },
      'Social Studies': {
        'Artist': {
          title: 'Art Around the World',
          content: 'Artists live everywhere! Let\'s explore art from different countries and cultures.',
          activities: [
            'Explore world art styles',
            'Learn about famous artists',
            'Create cultural artwork',
            'Map art museums'
          ],
          skills: ['Cultural awareness', 'Geography basics', 'Community', 'History'],
          realWorld: 'Artists learn from cultures around the world and share their own culture through art!'
        },
        'default': {
          title: `${career}s in Our Community`,
          content: `${career} professionals help our community. Let\'s learn about people and places!`,
          activities: [
            'Explore community helpers',
            'Learn about different places',
            'Understand cultures',
            'Practice good citizenship'
          ],
          skills: ['Community', 'Geography', 'Culture', 'Citizenship'],
          realWorld: `${career} professionals work in communities around the world!`
        }
      }
    },
    '3-5': {
      'Mathematics': {
        'Artist': {
          title: 'Mathematical Art: Fractions and Geometry',
          content: 'Professional artists use fractions to mix paint colors and geometry to create compositions!',
          activities: [
            'Mix paint using fractions (1/2 blue + 1/2 yellow)',
            'Create geometric art patterns',
            'Calculate canvas proportions',
            'Design symmetrical artwork'
          ],
          skills: ['Fractions', 'Multiplication', 'Geometry', 'Measurement'],
          realWorld: 'Artists use fractions for color mixing, multiplication for pricing artwork, and geometry for composition!'
        },
        'default': {
          title: `Math Skills for ${career}s`,
          content: `${career} professionals use advanced math skills every day!`,
          activities: [
            'Practice multiplication',
            'Work with fractions',
            'Solve word problems',
            'Explore geometry'
          ],
          skills: ['Multiplication', 'Division', 'Fractions', 'Geometry'],
          realWorld: `${career} professionals use these math skills daily!`
        }
      }
    }
  };

  // Get content for specific grade, subject, and career
  const gradeContent = gradeSkillsMap[normalizedGrade] || gradeSkillsMap['K-2'];
  const subjectContent = gradeContent[subject] || gradeContent['Mathematics'];
  const careerSpecificContent = subjectContent[career] || subjectContent['default'];
  
  return careerSpecificContent;
};

// Updated function to get content based on container type
const getCareerContent = (career: string, containerId: string, objectiveIndex: number, grade?: string, subject?: string) => {
  console.log('getCareerContent called with:', { career, containerId, objectiveIndex, grade, subject });
  
  if (containerId === 'LEARN') {
    // For LEARN container, show academic subjects with career context
    // Use the subject parameter if provided, otherwise calculate from objective index
    const currentSubject = subject || ['Mathematics', 'Science', 'English Language Arts', 'Social Studies'][objectiveIndex % 4];
    console.log('LEARN container - getting academic content for:', currentSubject, 'with career:', career, 'grade:', grade);
    const result = getAcademicContentWithCareerLens(currentSubject, career, grade || 'K-2');
    console.log('Academic content result:', result);
    return result;
  }
  
  // For EXPERIENCE and DISCOVER, use career-specific content
  console.log('Not LEARN container, using career-specific content');
  const careerContent: Record<string, any> = {
    'Teacher': {
      EXPERIENCE: [
        {
          title: 'Classroom Management Simulation',
          content: 'Creating a positive learning environment starts with clear expectations, consistent routines, and building relationships with students.',
          activities: ['Study classroom layout designs', 'Learn about positive behavior support', 'Practice giving clear instructions'],
          realWorld: 'Effective classroom management helps students feel safe and ready to learn, leading to better academic outcomes.'
        },
        {
          title: 'Lesson Planning Basics',
          content: 'Great lessons have clear objectives, engaging activities, and ways to check if students understood the material.',
          activities: ['Create a simple lesson plan', 'Learn about learning objectives', 'Study assessment strategies'],
          realWorld: 'Teachers spend hours planning lessons to ensure every minute of class time is valuable for student learning.'
        },
        {
          title: 'Communication with Students and Parents',
          content: 'Building strong relationships through effective communication is essential for student success.',
          activities: ['Practice active listening', 'Write a parent newsletter', 'Role-play student conferences'],
          realWorld: 'Teachers communicate daily with students, parents, and colleagues to support student growth.'
        },
        {
          title: 'Design Your First Lesson',
          content: 'Create a 30-minute lesson teaching a topic you love. Include an introduction, main activity, and assessment.',
          activities: ['Choose your topic', 'Write learning objectives', 'Design an interactive activity', 'Create an assessment'],
          realWorld: 'Real teachers create hundreds of lessons each year, always thinking about how to make learning engaging.'
        },
        {
          title: 'Virtual Classroom Simulation',
          content: 'Practice managing a classroom with different student personalities and learning needs.',
          activities: ['Handle classroom disruptions', 'Adapt lessons for different learners', 'Provide feedback to students'],
          realWorld: 'Every day, teachers make split-second decisions to keep students engaged and learning.'
        }
      ],
      DISCOVER: [
        {
          title: 'Educational Technology Innovation',
          content: 'Explore how AI, VR, and other technologies are transforming education.',
          activities: ['Research EdTech tools', 'Design a tech-enhanced lesson', 'Explore virtual field trips'],
          realWorld: 'Modern teachers integrate technology to create immersive, personalized learning experiences.'
        }
      ]
    },
    'Doctor': {
      EXPERIENCE: [
        {
          title: 'The Human Body Systems',
          content: 'Understanding how the circulatory, respiratory, digestive, and nervous systems work together to keep us healthy.',
          activities: ['Explore 3D body models', 'Learn about organ functions', 'Study how systems interact'],
          realWorld: 'Doctors must understand all body systems to diagnose and treat patients effectively.'
        },
        {
          title: 'Patient Care and Empathy',
          content: 'Being a doctor isn\'t just about medicine - it\'s about caring for people and understanding their concerns.',
          activities: ['Practice patient interviews', 'Learn about bedside manner', 'Study medical ethics'],
          realWorld: 'Doctors spend as much time talking with patients as they do examining them.'
        },
        {
          title: 'Diagnostic Thinking',
          content: 'Learn how doctors gather clues from symptoms, tests, and patient history to solve medical mysteries.',
          activities: ['Solve symptom puzzles', 'Interpret basic test results', 'Create diagnostic flowcharts'],
          realWorld: 'Every patient visit is like solving a puzzle - doctors use critical thinking to find the right diagnosis.'
        },
        {
          title: 'Preventive Medicine',
          content: 'Helping people stay healthy through vaccines, healthy habits, and regular check-ups.',
          activities: ['Design a wellness plan', 'Learn about vaccines', 'Study nutrition basics'],
          realWorld: 'Doctors prevent more illness than they cure by helping patients make healthy choices.'
        },
        {
          title: 'Virtual Patient Examination',
          content: 'Practice examining virtual patients, taking their history, and making diagnoses.',
          activities: ['Take patient history', 'Perform basic examination', 'Order appropriate tests', 'Make diagnosis'],
          realWorld: 'Doctors see 20-40 patients daily, each with unique symptoms and stories.'
        },
        {
          title: 'Emergency Room Simulation',
          content: 'Make quick decisions in a fast-paced emergency room setting.',
          activities: ['Triage patients', 'Prioritize treatments', 'Work with medical team', 'Handle time pressure'],
          realWorld: 'ER doctors make life-saving decisions in seconds while managing multiple critical patients.'
        }
      ],
      DISCOVER: [
        {
          title: 'Medical Research and Innovation',
          content: 'Explore how new treatments, medicines, and medical technologies are developed.',
          activities: ['Learn about clinical trials', 'Explore gene therapy', 'Study medical AI'],
          realWorld: 'Doctor-researchers are developing cures for diseases that affect millions of people.'
        }
      ]
    },
    'Engineer': {
      EXPERIENCE: [
        {
          title: 'Problem-Solving Process',
          content: 'Engineers use a systematic approach: Define the problem, brainstorm solutions, design, test, and improve.',
          activities: ['Learn the engineering design process', 'Practice problem definition', 'Study iteration and improvement'],
          realWorld: 'Engineers use this process to design everything from smartphones to skyscrapers.'
        },
        {
          title: 'Mathematics in Engineering',
          content: 'Math is the language of engineering - from calculating forces to optimizing designs.',
          activities: ['Apply geometry to structures', 'Use algebra for problem-solving', 'Explore patterns and sequences'],
          realWorld: 'Engineers use math daily to ensure bridges don\'t collapse and rockets reach space.'
        },
        {
          title: 'Materials and Properties',
          content: 'Different materials have different strengths - choosing the right one is crucial for any design.',
          activities: ['Test material strength', 'Compare properties', 'Design for specific needs'],
          realWorld: 'Engineers select materials carefully - using steel for strength, aluminum for lightness, or plastic for flexibility.'
        },
        {
          title: 'Teamwork and Communication',
          content: 'Engineering projects require collaboration between many specialists working together.',
          activities: ['Practice technical drawing', 'Learn to give presentations', 'Work on team challenges'],
          realWorld: 'Large engineering projects like building airports involve hundreds of engineers working together.'
        },
        {
          title: 'Bridge Building Challenge',
          content: 'Design and test a bridge that can hold the most weight using limited materials.',
          activities: ['Design your bridge', 'Calculate load distribution', 'Build and test', 'Iterate and improve'],
          realWorld: 'Civil engineers design bridges that must safely carry thousands of cars and trucks every day.'
        },
        {
          title: 'Robot Programming',
          content: 'Program a virtual robot to navigate obstacles and complete tasks.',
          activities: ['Learn basic programming', 'Design movement patterns', 'Debug your code', 'Optimize performance'],
          realWorld: 'Robotics engineers create robots for manufacturing, exploration, and even surgery.'
        }
      ],
      DISCOVER: [
        {
          title: 'Sustainable Engineering',
          content: 'Explore how engineers are solving climate change through renewable energy and green technology.',
          activities: ['Design solar solutions', 'Explore wind power', 'Study electric vehicles'],
          realWorld: 'Environmental engineers are creating the technologies that will save our planet.'
        }
      ]
    }
  };

  // Default content for careers not yet defined
  const defaultContent = {
    LEARN: [
      {
        title: `Introduction to ${career}`,
        content: `Discover the fundamental concepts and skills needed in the ${career} profession.`,
        activities: ['Explore core concepts', 'Learn key terminology', 'Study best practices'],
        realWorld: `${career} professionals use these foundations every day in their work.`
      }
    ],
    EXPERIENCE: [
      {
        title: `${career} Simulation`,
        content: `Practice real-world ${career} scenarios and develop practical skills.`,
        activities: ['Complete hands-on tasks', 'Solve problems', 'Apply your knowledge'],
        realWorld: `This is what ${career} professionals do in their daily work.`
      }
    ],
    DISCOVER: [
      {
        title: `Future of ${career}`,
        content: `Explore innovations and emerging trends in the ${career} field.`,
        activities: ['Research new technologies', 'Explore career paths', 'Create something new'],
        realWorld: `The ${career} field is constantly evolving with new discoveries and innovations.`
      }
    ]
  };

  const content = careerContent[career] || defaultContent;
  const containerContent = content[containerId] || content.EXPERIENCE || content.DISCOVER || [];
  
  // If containerContent is an array, return the appropriate index
  if (Array.isArray(containerContent)) {
    const selectedContent = containerContent[Math.min(objectiveIndex, Math.max(0, containerContent.length - 1))];
    console.log('Returning array content:', selectedContent);
    return selectedContent;
  }
  
  // This should never happen for LEARN container
  console.warn('WARNING: No array content found for:', { career, containerId });
  
  // Fallback for non-array content
  return {
    title: `${career} ${containerId} Activity`,
    content: `Practice and apply ${career} skills in this ${containerId.toLowerCase()} activity.`,
    activities: ['Learn', 'Practice', 'Apply', 'Master'],
    realWorld: `This is how ${career} professionals work in the real world.`
  };
};

export const MockLearningContainer: React.FC<MockLearningContainerProps> = ({
  containerId,
  objectives,
  career,
  companion,
  theme = 'light',
  onComplete
}) => {
  const { user } = useAuth();
  const { profile } = useStudentProfile();
  
  console.log('MockLearningContainer props:', { containerId, career, companion });
  console.log('Profile data:', profile);
  console.log('User data:', user);
  
  // Determine current subject based on objective index
  const subjects = ['Mathematics', 'Science', 'English Language Arts', 'Social Studies'];
  const [currentObjective, setCurrentObjective] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(0);
  const [aiContent, setAiContent] = useState<any>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);

  const containerColors: Record<string, { primary: string; secondary: string; icon: string }> = {
    LEARN: { primary: '#8B5CF6', secondary: '#A855F7', icon: '📚' },
    EXPERIENCE: { primary: '#059669', secondary: '#10B981', icon: '🛠️' },
    DISCOVER: { primary: '#DC2626', secondary: '#EF4444', icon: '🚀' }
  };

  const colors = containerColors[containerId] || containerColors.LEARN;

  useEffect(() => {
    // Play activity start voiceover
    companionVoiceoverService.playVoiceover('activity-start', { 
      activity: `${containerId} activities for ${career}` 
    }, { delay: 800 });
    
    // Generate AI content
    generateAIContent();
  }, [containerId, career, currentObjective]);

  const generateAIContent = async () => {
    setIsLoadingContent(true);
    try {
      if (containerId === 'LEARN') {
        // For LEARN container, get actual grade-specific skills
        const currentSubject = subjects[currentObjective % subjects.length];
        const gradeKey = mapGradeToDataKey(profile?.grade || 'K-2');
        const subjectSkills = skillsData[gradeKey]?.[currentSubject] || [];
        
        // Get a specific skill for this lesson
        const skillIndex = currentObjective % Math.max(1, subjectSkills.length);
        const currentSkill = subjectSkills[skillIndex];
        
        if (currentSkill) {
          // Generate AI content with career context for the specific skill
          try {
            const generatedContent = await contentGenerationService.generateContent({
              contentType: 'lesson',
              grade: profile?.grade || 'K-2',
              subject: currentSubject,
              skill: currentSkill.skillName,
              difficulty: determineDifficulty(profile?.grade),
              characterId: companion.toLowerCase(),
              useFinnAgents: false, // Disable for now to avoid errors
              personalizedFor: user?.id,
              accessibility: {
                textToSpeech: companionVoiceoverService.isVoiceoverEnabled(),
                simplifiedLanguage: profile?.grade === 'K-2' || profile?.grade === '3-5',
                visualAids: true
              },
              quantity: 1
            });

            // Add career context to the generated content
            const careerEnhancedContent = {
              ...generatedContent,
              title: `${currentSkill.skillName} for ${career}s`,
              description: `Learn ${currentSkill.skillName} through the lens of ${career}!`,
              content: {
                ...generatedContent.content,
                careerContext: getCareerContextForSkill(career, currentSubject, currentSkill.skillName),
                skill: currentSkill
              }
            };
            
            setAiContent(careerEnhancedContent);
          } catch (error) {
            console.log('AI generation failed, using enhanced fallback:', error);
            // Create structured fallback with real skill data
            const fallbackContent = {
              title: `${currentSkill.skillName} for ${career}s`,
              description: currentSkill.description || `Master ${currentSkill.skillName} with ${career} examples!`,
              content: {
                mainContent: {
                  activities: getCareerActivitiesForSkill(career, currentSubject, currentSkill.skillName),
                  realWorldApplication: `${career}s use ${currentSkill.skillName} in their daily work!`
                },
                skill: currentSkill
              }
            };
            setAiContent(fallbackContent);
          }
        } else {
          // No skill found, use generic content
          setAiContent(null);
        }
      } else {
        // EXPERIENCE and DISCOVER containers - career-focused content
        setAiContent(null);
      }
    } catch (error) {
      console.log('Content generation error:', error);
      setAiContent(null);
    } finally {
      setIsLoadingContent(false);
    }
  };

  const mapGradeToDataKey = (grade: string): string => {
    // Map grade formats to skillsData keys
    if (grade === 'K-2' || grade === 'K') return 'Kindergarten';
    if (grade === '3-5') return 'Grade 3';
    if (grade === '6-8') return 'Grade 6';
    if (grade === '9-12') return 'Grade 9';
    return 'Kindergarten'; // Default
  };

  const getCareerContextForSkill = (career: string, subject: string, skill: string): string => {
    const contexts: Record<string, Record<string, Record<string, string>>> = {
      'Artist': {
        'Math': {
          'Count to 3': 'Artists count paintbrushes, mix colors in ratios, and organize their supplies!',
          'Numbers to 3': 'Artists use numbers to create patterns, count art supplies, and price their artwork!',
          'Identify numbers - up to 3': 'Artists label their paint tubes, organize brushes by size, and number their artworks!',
          'default': `Artists use ${skill} when creating and organizing their artwork!`
        },
        'Science': {
          'default': 'Artists use science to understand colors, materials, and how art supplies work!'
        },
        'English Language Arts': {
          'default': 'Artists write about their work, tell stories through pictures, and communicate ideas!'
        },
        'Social Studies': {
          'default': 'Artists learn from different cultures and share their own stories through art!'
        }
      },
      'Teacher': {
        'Math': {
          'Count to 3': 'Teachers count students, organize supplies, and use numbers in lessons!',
          'default': `Teachers use ${skill} to organize classrooms and teach students!`
        },
        'default': {
          'default': `Teachers use ${subject} skills every day in the classroom!`
        }
      }
    };
    
    return contexts[career]?.[subject]?.[skill] || 
           contexts[career]?.[subject]?.['default'] || 
           contexts[career]?.['default']?.['default'] ||
           `${career}s use ${skill} in their professional work!`;
  };

  const getCareerActivitiesForSkill = (career: string, subject: string, skill: string): string[] => {
    const activities: Record<string, Record<string, Record<string, string[]>>> = {
      'Artist': {
        'Math': {
          'Count to 3': [
            'Count 3 paintbrushes 🎨',
            'Mix 2 colors to make a 3rd',
            'Arrange 3 art pieces',
            'Practice counting with art supplies'
          ],
          'Numbers to 3': [
            'Label paint jars 1, 2, 3',
            'Create number art',
            'Sort supplies by number',
            'Make pattern with 3 colors'
          ],
          'default': [
            `Practice ${skill} with art supplies`,
            'Apply math to artwork',
            'Create visual patterns',
            'Organize art materials'
          ]
        }
      }
    };
    
    return activities[career]?.[subject]?.[skill] || 
           activities[career]?.[subject]?.['default'] || 
           [`Learn ${skill}`, 'Practice exercises', 'Apply knowledge', 'Review and master'];
  };

  const determineSubject = (career: string): string => {
    const careerSubjectMap: Record<string, string> = {
      'Teacher': 'Education',
      'Doctor': 'Science',
      'Engineer': 'STEM',
      'Artist': 'Arts',
      'Scientist': 'Science',
      'Chef': 'Life Skills',
      'Athlete': 'Physical Education',
      'Musician': 'Music',
      'Writer': 'English Language Arts',
      'Programmer': 'Computer Science'
    };
    return careerSubjectMap[career] || 'General Studies';
  };

  const determineDifficulty = (grade?: string): 'easy' | 'medium' | 'hard' => {
    if (!grade) return 'easy';
    if (grade === 'K-2' || grade === '3-5') return 'easy';
    if (grade === '6-8') return 'medium';
    return 'hard';
  };

  const handleNextObjective = () => {
    const content = aiContent ? {
      activities: aiContent.content?.mainContent?.activities || ['Activity 1', 'Activity 2']
    } : getCareerContent(career, containerId, currentObjective, profile?.grade, subjects[currentObjective % subjects.length]);
    
    // Check if there are more activities in current objective
    if (currentActivity < (content.activities?.length - 1 || 0)) {
      setCurrentActivity(prev => prev + 1);
      companionVoiceoverService.playVoiceover('encouragement');
    } else if (currentObjective < objectives.length - 1) {
      // Move to next objective/subject
      setCurrentObjective(prev => prev + 1);
      setCurrentActivity(0);
      setProgress((currentObjective + 1) / objectives.length * 100);
      companionVoiceoverService.playVoiceover('encouragement');
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    setIsCompleting(true);
    setProgress(100);
    companionVoiceoverService.playVoiceover('completion', { container: containerId });
    
    // Simulate completion delay
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: theme === 'dark' 
          ? 'linear-gradient(135deg, #1A202C 0%, #2D3748 100%)'
          : 'linear-gradient(135deg, #F7FAFC 0%, #E2E8F0 100%)',
        display: 'flex',
        flexDirection: 'column',
        padding: '2rem',
        animation: 'fadeIn 0.5s ease-out'
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            color: 'white',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            {colors.icon}
          </div>
          <div>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold',
              color: theme === 'dark' ? '#F7FAFC' : '#1A202C',
              margin: 0
            }}>
              {containerId} Container
            </h1>
            <p style={{ 
              color: theme === 'dark' ? '#94A3B8' : '#718096',
              margin: 0
            }}>
              {career} Training with {companion}
            </p>
          </div>
        </div>
        
        {/* Progress Badge */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: theme === 'dark' ? '#374151' : 'white',
          borderRadius: '2rem',
          border: `2px solid ${colors.primary}`,
          fontWeight: '600',
          color: colors.primary
        }}>
          {currentObjective + 1} / {objectives.length} Tasks
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '0.5rem',
          fontSize: '0.9rem',
          color: theme === 'dark' ? '#94A3B8' : '#718096'
        }}>
          <span>Progress</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{
          height: '12px',
          background: theme === 'dark' ? '#374151' : '#E2E8F0',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{
        flex: 1,
        background: theme === 'dark' ? '#2D3748' : 'white',
        borderRadius: '1rem',
        padding: '2rem',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        overflowY: 'auto'
      }}>
        {isLoadingContent ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              border: `4px solid ${colors.primary}`,
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            <p style={{
              fontSize: '1.2rem',
              color: theme === 'dark' ? '#94A3B8' : '#718096'
            }}>
              {companion} is preparing your personalized lesson...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        ) : !isCompleting ? (() => {
          // Determine the current subject for LEARN container
          const currentSubject = containerId === 'LEARN' 
            ? subjects[currentObjective % subjects.length]
            : null;
          
          // Use AI-generated content if available, otherwise fall back to static content
          const content = aiContent ? {
            title: aiContent.title,
            content: aiContent.description,
            activities: aiContent.content?.mainContent?.activities || 
                       aiContent.content?.mainContent?.learningActivities || 
                       ['Interactive Learning', 'Practice Exercise', 'Knowledge Check'],
            realWorld: aiContent.content?.mainContent?.realWorldApplication || 
                      aiContent.content?.conclusion ||
                      `This knowledge is essential for ${career} professionals.`
          } : getCareerContent(career, containerId, currentObjective, profile?.grade, currentSubject);
          
          return (
          <>
            {/* Lesson Title */}
            <h2 style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              color: colors.primary,
              marginBottom: '0.5rem'
            }}>
              {content.title}
            </h2>
            
            {/* Subject and Skills Badge */}
            {containerId === 'LEARN' && (
              <div style={{
                marginBottom: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.75rem'
              }}>
                <div style={{
                  display: 'flex',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <span style={{
                    padding: '0.25rem 0.75rem',
                    background: colors.primary,
                    color: 'white',
                    borderRadius: '1rem',
                    fontSize: '0.9rem',
                    fontWeight: '600'
                  }}>
                    {subjects[currentObjective % subjects.length]}
                  </span>
                  {aiContent?.content?.skill && (
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      background: 'transparent',
                      border: `2px solid ${colors.primary}`,
                      color: colors.primary,
                      borderRadius: '1rem',
                      fontSize: '0.85rem',
                      fontWeight: '600'
                    }}>
                      Skill: {aiContent.content.skill.skillNumber}
                    </span>
                  )}
                </div>
                {aiContent?.content?.careerContext && (
                  <div style={{
                    padding: '0.5rem 1rem',
                    background: theme === 'dark' ? '#374151' : '#FEF3C7',
                    borderRadius: '0.5rem',
                    fontSize: '0.85rem',
                    color: theme === 'dark' ? '#FCD34D' : '#92400E',
                    maxWidth: '500px',
                    textAlign: 'center'
                  }}>
                    🎨 <strong>{career} Connection:</strong> {aiContent.content.careerContext}
                  </div>
                )}
              </div>
            )}
            
            {/* Main Content */}
            <div style={{
              padding: '2rem',
              background: theme === 'dark' ? '#374151' : '#F7FAFC',
              borderRadius: '1rem',
              border: `3px solid ${colors.primary}`,
              marginBottom: '2rem',
              maxWidth: '700px',
              width: '100%'
            }}>
              <p style={{
                fontSize: '1.1rem',
                color: theme === 'dark' ? '#F7FAFC' : '#1A202C',
                lineHeight: '1.8',
                marginBottom: '1.5rem'
              }}>
                {content.content}
              </p>
              
              {/* Real World Connection */}
              <div style={{
                padding: '1rem',
                background: theme === 'dark' ? '#2D3748' : 'white',
                borderRadius: '0.5rem',
                borderLeft: `4px solid ${colors.primary}`,
                textAlign: 'left'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem' }}>🌍</span>
                  <strong style={{ color: colors.primary }}>Real World Application:</strong>
                </div>
                <p style={{
                  fontSize: '0.95rem',
                  color: theme === 'dark' ? '#CBD5E0' : '#4A5568',
                  lineHeight: '1.6'
                }}>
                  {content.realWorld}
                </p>
              </div>
            </div>

            {/* Current Activity */}
            <div style={{
              width: '100%',
              maxWidth: '700px',
              marginBottom: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: theme === 'dark' ? '#F7FAFC' : '#1A202C',
                marginBottom: '1rem'
              }}>
                Learning Activities
              </h3>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {content.activities?.map((activity: string, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem 1.25rem',
                      background: idx < currentActivity ? '#48BB78' : // Completed (green)
                                 idx === currentActivity ? colors.primary : // Current (active)
                                 'transparent', // Not started
                      border: `2px solid ${
                        idx < currentActivity ? '#48BB78' : 
                        idx === currentActivity ? colors.primary : 
                        '#CBD5E0'
                      }`,
                      borderRadius: '0.5rem',
                      color: idx < currentActivity ? 'white' : 
                             idx === currentActivity ? 'white' : 
                             '#718096',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      transition: 'all 0.3s ease',
                      transform: idx === currentActivity ? 'scale(1.05)' : 'scale(1)',
                      boxShadow: idx === currentActivity ? '0 4px 12px rgba(0, 0, 0, 0.2)' : 'none',
                      opacity: idx > currentActivity ? 0.5 : 1,
                      cursor: idx > currentActivity ? 'not-allowed' : 'default'
                    }}
                  >
                    {idx < currentActivity && '✓ '}
                    {idx === currentActivity && '▶ '}
                    {activity}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleNextObjective}
              style={{
                padding: '1rem 3rem',
                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
                color: 'white',
                border: 'none',
                borderRadius: '0.75rem',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              {(() => {
                const content = aiContent ? {
                  activities: aiContent.content?.mainContent?.activities || ['Activity 1', 'Activity 2']
                } : getCareerContent(career, containerId, currentObjective);
                const hasMoreActivities = currentActivity < (content.activities?.length - 1 || 0);
                const hasMoreObjectives = currentObjective < objectives.length - 1;
                
                if (hasMoreActivities) return 'Complete Activity';
                if (hasMoreObjectives) return 'Next Lesson';
                return 'Complete Container';
              })()}
            </button>
          </>
          )
        })() : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2rem',
            animation: 'fadeIn 0.5s ease-out'
          }}>
            <div style={{
              fontSize: '4rem',
              animation: 'pulse 1s ease-in-out infinite'
            }}>
              🎉
            </div>
            <h2 style={{
              fontSize: '2rem',
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              Container Complete!
            </h2>
            <p style={{
              fontSize: '1.2rem',
              color: theme === 'dark' ? '#94A3B8' : '#718096'
            }}>
              Great job completing the {containerId} container!
            </p>
            <div style={{
              padding: '0.5rem 1rem',
              background: theme === 'dark' ? '#374151' : '#F7FAFC',
              borderRadius: '0.5rem',
              color: colors.primary,
              fontWeight: '600'
            }}>
              Returning to CareerInc Lobby...
            </div>
          </div>
        )}
      </div>

      {/* Companion Reminder */}
      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: theme === 'dark' ? '#2D3748' : 'white',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.9rem',
        color: theme === 'dark' ? '#94A3B8' : '#718096'
      }}>
        <span>🤖</span>
        <span>{companion} is here to help you succeed!</span>
      </div>
    </div>
  );
};

export default MockLearningContainer;