// ================================================================
// CAREERTOWN COMPONENT
// Career selection and badge generation between Learn and Experience phases
// ================================================================

import React, { useState, useEffect } from 'react';
import { Star, Sparkles, ArrowRight, Trophy, Briefcase, Users, Book } from 'lucide-react';
import SimpleParticlesBackground from './SimpleParticlesBackground';
import { careerBadgeService } from '../services/careerBadgeService';
import { CareerBadge } from '../types/CareerTypes';
import { AssessmentResults } from '../types/LearningTypes';

interface CareerTownProps {
  studentName: string;
  gradeLevel: string;
  learnResults: AssessmentResults[];
  onCareerSelected: (career: string, badge: CareerBadge) => void;
  onSkip?: () => void;
}

// Calculate XP for Learn container results
const calculateLearnXP = (assessment: AssessmentResults): number => {
  if (!assessment || !assessment.score) return 0;

  const score = assessment.score;
  
  // Learn container base XP: instruction (10) + practice (15) + assessment (20) = 45
  const baseXP = 45;
  
  // Score-based multiplier for Learn container
  let scoreMultiplier = 1;
  if (score >= 90) {
    scoreMultiplier = 1.5;
  } else if (score >= 80) {
    scoreMultiplier = 1.3;
  } else if (score >= 70) {
    scoreMultiplier = 1.1;
  }
  
  return Math.round(baseXP * scoreMultiplier);
};

interface CareerOption {
  id: string;
  name: string;
  emoji: string;
  description: string;
  skills: string[];
  colors: string[];
}

// Helper function to convert skill numbers to readable names
const getSkillDisplayName = (skillNumber: string, subject: string, gradeLevel?: string): string => {
  // For demo skills, we can provide readable names based on subject and skill patterns
  const skillNameMap: { [key: string]: string } = {
    // Kindergarten skills - matching Dashboard assignments
    'A.1-Math-K': 'Identify Numbers - Up to 3',
    'A.1-ELA-K': 'Find Letters in the Alphabet',
    'A.1-Science-K': 'Classify Objects by Shape',
    'A.1-SocialStudies-K': 'What is a Community?',
    
    // 1st Grade skills
    'A.1-Math-1': 'Counting to 10',
    'A.1-ELA-1': 'Consonants & Vowels',
    'A.1-Science-1': 'Shape Classification',
    'A.1-SocialStudies-1': 'Rules & Laws',
    
    // 7th Grade skills
    'A.1-Math-7': 'Understanding Integers',
    'A.1-ELA-7': 'Main Ideas',
    'A.1-Science-7': 'Scientific Inquiry',
    'A.1-SocialStudies-7': 'Maps & Geography',
    
    // 10th Grade skills
    'A.1-Algebra1': 'Integer Operations',
    'A.1-Precalculus': 'Domain & Range'
  };
  
  // Try specific subject-skill-grade combination first
  const keyWithGrade = `${skillNumber}-${subject}-${gradeLevel}`;
  if (skillNameMap[keyWithGrade]) {
    return skillNameMap[keyWithGrade];
  }
  
  // Try subject-skill combination
  const key = `${skillNumber}-${subject}`;
  if (skillNameMap[key]) {
    return skillNameMap[key];
  }
  
  // Fallback to general subject-based names for K
  if (skillNumber === 'A.1' && gradeLevel === 'K') {
    switch (subject) {
      case 'Math': return 'Identify Numbers - Up to 3';
      case 'ELA': return 'Find Letters in the Alphabet';
      case 'Science': return 'Classify Objects by Shape';
      case 'SocialStudies': return 'What is a Community?';
      default: return skillNumber;
    }
  }
  
  // Final fallback
  return skillNumber;
};

export const CareerTown: React.FC<CareerTownProps> = ({
  studentName,
  gradeLevel,
  learnResults,
  onCareerSelected,
  onSkip
}) => {
  // Debug logging to understand learn results structure
  console.log('🏙️ CareerTown learnResults:', learnResults);
  console.log('🏙️ CareerTown learnResults length:', learnResults?.length);
  if (learnResults?.length > 0) {
    console.log('🏙️ First result structure:', learnResults[0]);
  }
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const [generatingBadge, setGeneratingBadge] = useState(false);
  const [generatedBadge, setGeneratedBadge] = useState<CareerBadge | null>(null);
  const [showBadge, setShowBadge] = useState(false);

  // Define career options based on grade level
  const getCareerOptions = (): CareerOption[] => {
    const baseOptions: CareerOption[] = [
      {
        id: 'chef',
        name: 'Chef',
        emoji: '👨‍🍳',
        description: 'Create delicious meals and learn about measurements, recipes, and nutrition!',
        skills: ['Counting', 'Measuring', 'Following Instructions'],
        colors: ['#FF6B6B', '#4ECDC4']
      },
      {
        id: 'librarian',
        name: 'Librarian',
        emoji: '📚',
        description: 'Help people find books and organize information in the library!',
        skills: ['Reading', 'Organization', 'Helping Others'],
        colors: ['#6C63FF', '#3F3D56']
      },
      {
        id: 'park-ranger',
        name: 'Park Ranger',
        emoji: '🌲',
        description: 'Protect nature and teach people about the environment!',
        skills: ['Science', 'Nature Knowledge', 'Problem Solving'],
        colors: ['#2ECC71', '#27AE60']
      }
    ];

    // Add more advanced careers for higher grades
    if (parseInt(gradeLevel) >= 7) {
      baseOptions.push(
        {
          id: 'engineer',
          name: 'Engineer',
          emoji: '⚙️',
          description: 'Design and build amazing things that help people!',
          skills: ['Math', 'Problem Solving', 'Creative Thinking'],
          colors: ['#3498DB', '#2980B9']
        },
        {
          id: 'scientist',
          name: 'Scientist',
          emoji: '🔬',
          description: 'Discover new things and solve mysteries about our world!',
          skills: ['Investigation', 'Analysis', 'Experimentation'],
          colors: ['#1ABC9C', '#16A085']
        }
      );
    }

    return baseOptions;
  };

  const careerOptions = getCareerOptions();

  // Calculate recommended career based on Learn performance
  const getRecommendedCareer = (): string => {
    const mathSkills = learnResults.filter(r => r.subject?.toLowerCase().includes('math'));
    const scienceSkills = learnResults.filter(r => r.subject?.toLowerCase().includes('science'));
    const elaSkills = learnResults.filter(r => r.subject?.toLowerCase().includes('english') || r.subject?.toLowerCase().includes('language'));

    const mathAvg = mathSkills.length > 0 ? mathSkills.reduce((sum, r) => sum + r.score, 0) / mathSkills.length : 0;
    const scienceAvg = scienceSkills.length > 0 ? scienceSkills.reduce((sum, r) => sum + r.score, 0) / scienceSkills.length : 0;
    const elaAvg = elaSkills.length > 0 ? elaSkills.reduce((sum, r) => sum + r.score, 0) / elaSkills.length : 0;

    if (mathAvg >= scienceAvg && mathAvg >= elaAvg) {
      return parseInt(gradeLevel) >= 7 ? 'engineer' : 'chef';
    } else if (scienceAvg >= elaAvg) {
      return parseInt(gradeLevel) >= 7 ? 'scientist' : 'park-ranger';
    } else {
      return 'librarian';
    }
  };

  const recommendedCareer = getRecommendedCareer();

  const handleCareerSelect = async (careerId: string) => {
    setSelectedCareer(careerId);
    setGeneratingBadge(true);

    try {
      console.log(`🎯 Generating badge for career: ${careerId}`);
      
      // Generate career badge
      const badge = await careerBadgeService.generateCareerBadge({
        careerId,
        careerName: careerOptions.find(c => c.id === careerId)?.name || careerId,
        department: 'Student Achievement',
        gradeLevel,
        description: `Completed Learn phase and chose ${careerId} career path`,
        studentName,
        achievements: learnResults.map(r => r.skillCode)
      });

      setGeneratedBadge(badge);
      setGeneratingBadge(false);
      setShowBadge(true);

      // Auto-continue after showing badge for 3 seconds
      setTimeout(() => {
        onCareerSelected(careerId, badge);
      }, 3000);

    } catch (error) {
      console.error('❌ Badge generation failed:', error);
      setGeneratingBadge(false);
      
      // Create fallback badge
      const fallbackBadge: CareerBadge = {
        id: `fallback-${careerId}-${gradeLevel}`,
        careerId,
        gradeLevel,
        imageUrl: '',
        emoji: careerOptions.find(c => c.id === careerId)?.emoji || '🏆',
        title: careerOptions.find(c => c.id === careerId)?.name || careerId,
        description: `${studentName}'s Career Badge`,
        colors: careerOptions.find(c => c.id === careerId)?.colors || ['#95A5A6', '#7F8C8D'],
        createdAt: new Date(),
        isFallback: true
      };

      setGeneratedBadge(fallbackBadge);
      setShowBadge(true);

      setTimeout(() => {
        onCareerSelected(careerId, fallbackBadge);
      }, 3000);
    }
  };

  if (showBadge && generatedBadge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="celebration" particleCount={100} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center relative z-10 shadow-2xl">
          <div className="mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              🎉 Congratulations, {studentName}!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You've earned your {generatedBadge.title} badge!
            </p>
            
            {/* Badge Display */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 mb-4">
              {generatedBadge.imageUrl ? (
                <img 
                  src={generatedBadge.imageUrl} 
                  alt={generatedBadge.title}
                  className="w-24 h-24 mx-auto rounded-lg mb-3"
                />
              ) : (
                <div 
                  className="w-24 h-24 mx-auto rounded-lg mb-3 flex items-center justify-center text-4xl"
                  style={{
                    background: `linear-gradient(135deg, ${generatedBadge.colors[0]}, ${generatedBadge.colors[1]})`
                  }}
                >
                  {generatedBadge.emoji}
                </div>
              )}
              <h3 className="font-bold text-gray-900 dark:text-white">{generatedBadge.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{generatedBadge.description}</p>
            </div>
            
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              🚀 Get ready for your career adventure!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (generatingBadge) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center relative">
        <SimpleParticlesBackground theme="creation" particleCount={80} />
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md mx-4 text-center relative z-10">
          <div className="mb-6">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              ✨ Creating Your Career Badge...
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Finn is designing a special badge just for you!
            </p>
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <SimpleParticlesBackground theme="careertown" particleCount={70} />
      
      {/* Header */}
      <div className="relative z-10 pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <Briefcase className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              🏙️ Welcome to CareerTown, {studentName}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Great job completing your learning! Now choose your career adventure.
            </p>
          </div>
        </div>
      </div>

      {/* Achievement Summary */}
      <div className="relative z-10 mb-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-2" />
              Your Learning Achievements
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Your assessment scores by subject: 🌟 (90%+), ⭐ (80-89%), 💫 (Below 80%)
            </p>
            
            {/* Total XP Summary */}
            {learnResults && learnResults.length > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                    Total Learn XP Earned: {learnResults.reduce((total, result) => total + calculateLearnXP(result), 0)} XP
                  </span>
                </div>
              </div>
            )}
            
            {learnResults && learnResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  // Debug: Log the actual structure of learnResults
                  console.log('🔍 Debug learnResults structure:', learnResults);
                  if (learnResults.length > 0) {
                    console.log('🔍 First result keys:', Object.keys(learnResults[0]));
                    console.log('🔍 First result:', learnResults[0]);
                  }
                  
                  // Function to determine subject from skill or other data
                  const getSubjectFromResult = (result: any, index: number): string => {
                    // First try the subject field
                    if (result.subject && result.subject !== '') return result.subject;
                    if (result.Subject && result.Subject !== '') return result.Subject;
                    
                    // If no subject field, try to infer from skill_number, skill_name, or other fields
                    const skillInfo = (result.skill_number || result.skill_name || result.skillCode || '').toLowerCase();
                    const contextInfo = (result.context || '').toLowerCase();
                    
                    console.log(`🔍 Analyzing result ${index}:`, {
                      skill_number: result.skill_number,
                      skill_name: result.skill_name,
                      subject: result.subject,
                      allFields: Object.keys(result),
                      fullResult: result
                    });
                    
                    // Check for subject keywords in skill info
                    if (skillInfo.includes('math') || skillInfo.includes('number') || skillInfo.includes('count') || skillInfo.includes('addition')) return 'Math';
                    if (skillInfo.includes('ela') || skillInfo.includes('letter') || skillInfo.includes('read') || skillInfo.includes('alphabet')) return 'ELA';
                    if (skillInfo.includes('science') || skillInfo.includes('shape') || skillInfo.includes('matter') || skillInfo.includes('classify')) return 'Science';
                    if (skillInfo.includes('social') || skillInfo.includes('community') || skillInfo.includes('studies')) return 'Social Studies';
                    
                    // For Kindergarten, use position-based fallback for A.1 skills
                    if (result.skill_number === 'A.1') {
                      const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
                      return subjects[index % 4] || 'Unknown Subject';
                    }
                    
                    return `Subject ${index + 1}`; // Fallback with index
                  };
                  
                  // Create individual badges for each result, but group by subject if needed
                  const allBadges = learnResults.map((result, index) => {
                    const subject = getSubjectFromResult(result, index);
                    const xpEarned = calculateLearnXP(result);
                    console.log(`🔍 Creating badge for: skill=${result.skill_number}, subject=${subject}, score=${result.score}, XP=${xpEarned}`);
                    
                    return (
                      <div key={`${subject}-${index}`} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="text-center">
                          <div className="text-3xl mb-2">
                            {result.score >= 90 ? '🌟' : result.score >= 80 ? '⭐' : '💫'}
                          </div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-1">
                            {subject}
                          </h3>
                          <div className="flex items-center justify-center space-x-1 mb-2">
                            <p className="text-green-600 dark:text-green-400 font-bold text-xl">{result.score}%</p>
                          </div>
                          <div className="flex items-center justify-center space-x-1 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-1 rounded-full">
                            <Star className="w-3 h-3 text-yellow-600 dark:text-yellow-400" />
                            <span className="text-xs font-bold text-yellow-800 dark:text-yellow-200">
                              +{xpEarned} XP
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  });
                  
                  return allBadges;
                })()}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">📚</div>
                <p className="text-gray-600 dark:text-gray-400">
                  No learning achievements to display yet. Complete some lessons first!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Career Selection */}
      <div className="relative z-10 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-6">
            Choose Your Career Adventure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careerOptions.map((career) => (
              <div
                key={career.id}
                className={`relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg cursor-pointer transition-all hover:shadow-xl hover:scale-105 ${
                  career.id === recommendedCareer ? 'ring-2 ring-green-500' : ''
                }`}
                onClick={() => handleCareerSelect(career.id)}
              >
                {career.id === recommendedCareer && (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    Recommended!
                  </div>
                )}
                
                <div className="text-center">
                  <div className="text-6xl mb-4">{career.emoji}</div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{career.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{career.description}</p>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm">Skills You'll Use:</h4>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {career.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <button className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition-all">
                    Choose {career.name}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {onSkip && (
            <div className="text-center mt-8">
              <button
                onClick={onSkip}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-sm"
              >
                Skip career selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CareerTown;