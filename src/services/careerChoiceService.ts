// ================================================================
// CAREER CHOICE GENERATION SERVICE
// Generates 3 diverse career options based on completed skills
// ================================================================

import { AssessmentResults } from '../types/LearningTypes';
import { getLobbyConfigByGrade } from '../config/lobbyConfigs';

export interface CareerChoice {
  id: string;
  name: string;
  emoji: string;
  department: string;
  description: string;
  skillApplications: { [subject: string]: SkillApplication };
  subjectIntegration: string[];
  difficulty: number;
  gradeAppropriate: boolean;
}

export interface SkillApplication {
  skill: string;
  application: string;
  realWorldExample: string;
}

interface StudentProfile {
  gradeLevel: string;
  id: string;
}

// Career database organized by grade level and department
const careerDatabase = {
  'prek-5': {
    'school': [
      { id: 'teacher', name: 'Teacher', emoji: '👨‍🏫', skills: ['Math', 'ELA'] },
      { id: 'librarian', name: 'Librarian', emoji: '📚', skills: ['ELA', 'Science'] }
    ],
    'safety': [
      { id: 'firefighter', name: 'Firefighter', emoji: '🚒', skills: ['Math', 'Science'] },
      { id: 'police-officer', name: 'Police Officer', emoji: '👮', skills: ['Math', 'ELA'] }
    ],
    'health': [
      { id: 'doctor', name: 'Doctor', emoji: '👩‍⚕️', skills: ['Science', 'Math'] },
      { id: 'nurse', name: 'Nurse', emoji: '👨‍⚕️', skills: ['Science', 'ELA'] }
    ],
    'community': [
      { id: 'chef', name: 'Chef', emoji: '👨‍🍳', skills: ['Math', 'Science'] },
      { id: 'park-ranger', name: 'Park Ranger', emoji: '🌲', skills: ['Science', 'Math'] }
    ],
    'creative': [
      { id: 'artist', name: 'Artist', emoji: '🎨', skills: ['ELA', 'Math'] },
      { id: 'musician', name: 'Musician', emoji: '🎵', skills: ['Math', 'ELA'] }
    ]
  },
  '6-8': {
    'business': [
      { id: 'manager', name: 'Team Manager', emoji: '💼', skills: ['Math', 'ELA'] },
      { id: 'entrepreneur', name: 'Entrepreneur', emoji: '🚀', skills: ['Math', 'SocialStudies'] }
    ],
    'technology': [
      { id: 'programmer', name: 'Programmer', emoji: '💻', skills: ['Math', 'Science'] },
      { id: 'engineer', name: 'Engineer', emoji: '⚙️', skills: ['Math', 'Science'] }
    ],
    'marketing': [
      { id: 'designer', name: 'Graphic Designer', emoji: '🎯', skills: ['ELA', 'Math'] },
      { id: 'social-media', name: 'Social Media Manager', emoji: '📱', skills: ['ELA', 'Math'] }
    ],
    'science': [
      { id: 'scientist', name: 'Research Scientist', emoji: '🔬', skills: ['Science', 'Math'] },
      { id: 'environmental', name: 'Environmental Scientist', emoji: '🌍', skills: ['Science', 'SocialStudies'] }
    ],
    'government': [
      { id: 'lawyer', name: 'Lawyer', emoji: '⚖️', skills: ['ELA', 'SocialStudies'] },
      { id: 'politician', name: 'Public Official', emoji: '🏛️', skills: ['ELA', 'SocialStudies'] }
    ]
  },
  '9-12': {
    'c-suite': [
      { id: 'ceo', name: 'Chief Executive', emoji: '👔', skills: ['Math', 'ELA'] },
      { id: 'director', name: 'Operations Director', emoji: '📋', skills: ['Math', 'SocialStudies'] }
    ],
    'operations': [
      { id: 'project-manager', name: 'Project Manager', emoji: '⚙️', skills: ['Math', 'ELA'] },
      { id: 'analyst', name: 'Business Analyst', emoji: '📊', skills: ['Math', 'Science'] }
    ],
    'technology': [
      { id: 'software-engineer', name: 'Software Engineer', emoji: '🖥️', skills: ['Math', 'Science'] },
      { id: 'data-scientist', name: 'Data Scientist', emoji: '📈', skills: ['Math', 'Science'] }
    ],
    'finance': [
      { id: 'financial-analyst', name: 'Financial Analyst', emoji: '📊', skills: ['Math', 'ELA'] },
      { id: 'investment-banker', name: 'Investment Banker', emoji: '💰', skills: ['Math', 'SocialStudies'] }
    ],
    'marketing': [
      { id: 'marketing-director', name: 'Marketing Director', emoji: '📈', skills: ['ELA', 'Math'] },
      { id: 'brand-manager', name: 'Brand Manager', emoji: '🎯', skills: ['ELA', 'SocialStudies'] }
    ]
  }
};

// Extract skills from Learn results
export const extractSkillsFromLearnResults = (learnResults: AssessmentResults[]): string[] => {
  const subjects = new Set<string>();
  
  console.log('🔍 Extracting skills from learn results:', learnResults);
  
  learnResults.forEach((result, index) => {
    console.log(`🔍 Processing result ${index}:`, { 
      skill_number: result.skill_number, 
      subject: result.subject,
      hasSubject: !!result.subject
    });
    
    if (result.subject && result.subject !== 'General') {
      console.log(`✅ Using existing subject: ${result.subject}`);
      subjects.add(result.subject);
    } else {
      // Enhanced fallback subject detection
      const skillCode = result.skill_number || '';
      console.log(`🔍 Analyzing skill code: "${skillCode}"`);
      
      if (skillCode.includes('Math') || skillCode.toLowerCase().includes('math') || 
          skillCode.includes('CC') || skillCode.includes('NF') || skillCode.includes('NBT')) {
        console.log('📊 Detected Math skill');
        subjects.add('Math');
      } else if (skillCode.includes('ELA') || skillCode.toLowerCase().includes('ela') || 
                 skillCode.includes('RL') || skillCode.includes('RI') || skillCode.includes('RF')) {
        console.log('📚 Detected ELA skill');
        subjects.add('ELA');
      } else if (skillCode.includes('Science') || skillCode.toLowerCase().includes('science') || 
                 skillCode.includes('PS') || skillCode.includes('LS') || skillCode.includes('ESS')) {
        console.log('🔬 Detected Science skill');
        subjects.add('Science');
      } else if (skillCode.includes('Social') || skillCode.toLowerCase().includes('social') || 
                 skillCode.includes('SS') || skillCode.includes('NCSS')) {
        console.log('🌍 Detected Social Studies skill');
        subjects.add('SocialStudies');
      } else {
        // If we can't determine subject, add a default set to ensure careers appear
        console.log('❓ Could not determine subject, using defaults');
        subjects.add('Math');
        subjects.add('ELA');
      }
    }
  });
  
  // Ensure we always have at least one subject for career generation
  if (subjects.size === 0) {
    console.log('⚠️ No subjects detected, adding defaults');
    subjects.add('Math');
    subjects.add('ELA');
    subjects.add('Science');
  }
  
  const finalSubjects = Array.from(subjects);
  console.log('✅ Final extracted subjects:', finalSubjects);
  return finalSubjects;
};

// Filter careers that can apply learned skills
export const filterCareersBySkillApplicability = (careers: any[], skillsLearned: string[]): any[] => {
  return careers.filter(career => {
    const applicableSkills = career.skills.filter((skill: string) => 
      skillsLearned.includes(skill)
    );
    return applicableSkills.length >= 1; // Career must apply at least 1 learned skill
  });
};

// Select 3 diverse careers across different departments
export const selectDiverseRandomCareers = (availableCareers: any[], count: number = 3): any[] => {
  const departmentGroups: { [key: string]: any[] } = {};
  
  // Group careers by department
  availableCareers.forEach(career => {
    if (!departmentGroups[career.department]) {
      departmentGroups[career.department] = [];
    }
    departmentGroups[career.department].push(career);
  });
  
  const departments = Object.keys(departmentGroups);
  const selectedCareers: any[] = [];
  
  // Select one career from each department, up to count
  for (let i = 0; i < Math.min(count, departments.length); i++) {
    const department = departments[i];
    const careersInDept = departmentGroups[department];
    const randomCareer = careersInDept[Math.floor(Math.random() * careersInDept.length)];
    selectedCareers.push({ ...randomCareer, department });
  }
  
  // If we need more careers and have fewer departments, add more from existing departments
  while (selectedCareers.length < count && availableCareers.length > selectedCareers.length) {
    const remainingCareers = availableCareers.filter(career => 
      !selectedCareers.some(selected => selected.id === career.id)
    );
    
    if (remainingCareers.length > 0) {
      const randomCareer = remainingCareers[Math.floor(Math.random() * remainingCareers.length)];
      selectedCareers.push(randomCareer);
    } else {
      break;
    }
  }
  
  return selectedCareers;
};

// Generate skill applications for a career
export const generateSkillConnections = (career: any, skillsLearned: string[]): { [subject: string]: SkillApplication } => {
  const connections: { [subject: string]: SkillApplication } = {};
  
  skillsLearned.forEach(skill => {
    if (career.skills.includes(skill)) {
      connections[skill] = getSkillApplicationForCareer(career.id, skill);
    }
  });
  
  return connections;
};

// Get skill application for specific career
const getSkillApplicationForCareer = (careerId: string, skill: string): SkillApplication => {
  const applications: { [key: string]: { [skill: string]: SkillApplication } } = {
    'chef': {
      'Math': {
        skill: 'Counting and Measurement',
        application: 'Measure ingredients and calculate cooking times',
        realWorldExample: 'A chef needs 2 cups of flour for 12 cookies. How much for 24 cookies?'
      },
      'Science': {
        skill: 'States of Matter',
        application: 'Understand how heat changes food from liquid to solid',
        realWorldExample: 'When you heat butter (solid), it melts to liquid, then can become gas as steam'
      }
    },
    'teacher': {
      'Math': {
        skill: 'Number Recognition',
        application: 'Help younger students count and identify numbers',
        realWorldExample: 'Help kindergarten students count blocks and match numbers to quantities'
      },
      'ELA': {
        skill: 'Letter Recognition',
        application: 'Assist with alphabet activities and reading practice',
        realWorldExample: 'Point to letters on a chart and help students sound them out'
      }
    },
    'park-ranger': {
      'Science': {
        skill: 'Classification',
        application: 'Sort and identify different plants and animals',
        realWorldExample: 'Group leaves by shape or identify which animals are mammals vs birds'
      },
      'Math': {
        skill: 'Counting',
        application: 'Count animals and measure park areas',
        realWorldExample: 'Count how many deer visit the meadow or measure trail distances'
      }
    }
  };
  
  return applications[careerId]?.[skill] || {
    skill: skill,
    application: `Apply ${skill} skills in ${careerId} work`,
    realWorldExample: `Use ${skill} to solve real problems in this career`
  };
};

// Generate career recommendations (simplified version for dashboard)
export const generateCareerRecommendations = (
  studentProfile: { gradeLevel: string; id: string }, 
  performance: { skillsCompleted: number }
): CareerChoice[] => {
  const gradeRange = getGradeRangeKey(studentProfile.gradeLevel);
  const defaultSkills = getDefaultSkillsForGrade(studentProfile.gradeLevel);
  
  // Get all careers for this grade level
  let availableCareers: any[] = [];
  const gradeCareerDb = careerDatabase[gradeRange as keyof typeof careerDatabase] || careerDatabase['prek-5'];
  
  // Flatten careers from all departments
  Object.keys(gradeCareerDb).forEach(deptKey => {
    const careers = gradeCareerDb[deptKey as keyof typeof gradeCareerDb];
    careers.forEach(career => {
      availableCareers.push({ ...career, department: deptKey });
    });
  });
  
  // Select 3 diverse careers
  const selectedCareers = selectDiverseRandomCareers(availableCareers, 3);
  
  // Convert to CareerChoice format
  return selectedCareers.map(career => ({
    id: career.id,
    name: career.name,
    emoji: career.emoji,
    department: career.department,
    description: getCareerDescription(career.id, studentProfile.gradeLevel),
    skillApplications: generateSkillConnections(career, defaultSkills),
    subjectIntegration: career.skills.filter((skill: string) => defaultSkills.includes(skill)),
    difficulty: 1,
    gradeAppropriate: true
  }));
};

// Main function to generate career choices
export const generateCareerChoices = async (
  studentProfile: StudentProfile, 
  learnResults: AssessmentResults[] = []
): Promise<CareerChoice[]> => {
  const gradeRange = getGradeRangeKey(studentProfile.gradeLevel);
  const skillsLearned = learnResults.length > 0 
    ? extractSkillsFromLearnResults(learnResults)
    : getDefaultSkillsForGrade(studentProfile.gradeLevel);
  const lobbyConfig = getLobbyConfigByGrade(studentProfile.gradeLevel);
  
  console.log('🏢 Generating careers for grade range:', gradeRange);
  console.log('🏢 Skills learned/predicted:', skillsLearned);
  
  // Get all careers for this grade level
  let availableCareers: any[] = [];
  const gradeCareerDb = careerDatabase[gradeRange as keyof typeof careerDatabase] || careerDatabase['prek-5'];
  
  // Flatten careers from all departments
  Object.keys(gradeCareerDb).forEach(deptKey => {
    const careers = gradeCareerDb[deptKey as keyof typeof gradeCareerDb];
    careers.forEach(career => {
      availableCareers.push({ ...career, department: deptKey });
    });
  });
  
  // Filter careers that can apply learned skills
  const applicableCareers = filterCareersBySkillApplicability(availableCareers, skillsLearned);
  
  // Select 3 diverse careers
  let selectedCareers = selectDiverseRandomCareers(applicableCareers, 3);
  
  // Fallback: if no careers match, provide default grade-appropriate careers
  if (selectedCareers.length === 0) {
    console.log('🏢 No careers matched skills, providing fallback careers');
    const fallbackCareers = gradeRange === 'prek-5' 
      ? [
          { id: 'chef', name: 'Chef', emoji: '👨‍🍳', skills: ['Math', 'Science'], department: 'creative' },
          { id: 'teacher', name: 'Teacher', emoji: '👨‍🏫', skills: ['Math', 'ELA'], department: 'school' },
          { id: 'park-ranger', name: 'Park Ranger', emoji: '🌲', skills: ['Science', 'Math'], department: 'community' }
        ]
      : gradeRange === '6-8'
      ? [
          { id: 'programmer', name: 'Programmer', emoji: '💻', skills: ['Math', 'Science'], department: 'technology' },
          { id: 'designer', name: 'Graphic Designer', emoji: '🎯', skills: ['ELA', 'Math'], department: 'marketing' },
          { id: 'scientist', name: 'Research Scientist', emoji: '🔬', skills: ['Science', 'Math'], department: 'science' }
        ]
      : [
          { id: 'software-engineer', name: 'Software Engineer', emoji: '🖥️', skills: ['Math', 'Science'], department: 'technology' },
          { id: 'marketing-director', name: 'Marketing Director', emoji: '📈', skills: ['ELA', 'Math'], department: 'marketing' },
          { id: 'data-scientist', name: 'Data Scientist', emoji: '📊', skills: ['Math', 'Science'], department: 'technology' }
        ];
    
    selectedCareers = fallbackCareers;
  }
  
  console.log('🏢 Selected careers:', selectedCareers.map(c => c.id));
  
  // Convert to CareerChoice format
  return selectedCareers.map(career => ({
    id: career.id,
    name: career.name,
    emoji: career.emoji,
    department: lobbyConfig.departments.find(dept => dept.id === career.department)?.name || career.department,
    description: getCareerDescription(career.id, studentProfile.gradeLevel),
    skillApplications: generateSkillConnections(career, skillsLearned),
    subjectIntegration: career.skills.filter((skill: string) => skillsLearned.includes(skill)),
    difficulty: 1,
    gradeAppropriate: true
  }));
};

// Get grade-appropriate career descriptions
const getCareerDescription = (careerId: string, gradeLevel: string): string => {
  const descriptions: { [key: string]: { [grade: string]: string } } = {
    'chef': {
      'prek-5': 'Cook yummy food and learn about measuring ingredients!',
      '6-8': 'Create amazing meals while learning about nutrition and business',
      '9-12': 'Manage a restaurant kitchen and develop culinary expertise'
    },
    'teacher': {
      'prek-5': 'Help other kids learn and have fun in school!',
      '6-8': 'Assist teachers and tutor younger students',
      '9-12': 'Lead educational programs and mentor students'
    },
    'park-ranger': {
      'prek-5': 'Take care of animals and plants in the park!',
      '6-8': 'Protect wildlife and teach people about nature',
      '9-12': 'Manage conservation programs and environmental research'
    }
  };
  
  const gradeRange = getGradeRangeKey(gradeLevel);
  return descriptions[careerId]?.[gradeRange] || `Work as a ${careerId.replace('-', ' ')} and apply your skills!`;
};

// Get default skills for grade level (used when no Learn results available)
const getDefaultSkillsForGrade = (gradeLevel: string): string[] => {
  const gradeRange = getGradeRangeKey(gradeLevel);
  
  // Provide default skills based on grade range
  if (gradeRange === 'prek-5') {
    return ['Math', 'ELA', 'Science'];
  } else if (gradeRange === '6-8') {
    return ['Math', 'Science', 'ELA', 'SocialStudies'];
  } else {
    return ['Math', 'Science', 'ELA', 'SocialStudies'];
  }
};

// Helper function to get grade range key (duplicate from lobbyConfigs for independence)
const getGradeRangeKey = (gradeLevel: string): string => {
  const grade = parseInt(gradeLevel);
  
  if (gradeLevel.toLowerCase() === 'k' || gradeLevel.toLowerCase() === 'kindergarten' || grade <= 5) {
    return 'prek-5';
  } else if (grade >= 6 && grade <= 8) {
    return '6-8';
  } else {
    return '9-12';
  }
};

// Export a service object
export const careerChoiceService = {
  generateCareerChoices,
  generateCareerRecommendations,
  extractSkillsFromLearnResults,
  filterCareersBySkillApplicability,
  selectDiverseRandomCareers,
  generateSkillConnections
};