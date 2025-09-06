// ================================================================
// MULTI-SUBJECT ASSIGNMENT DATA
// Sample assignments for testing the three-container system
// ================================================================

import { MultiSubjectAssignment } from '../types/LearningTypes';

// Kindergarten Multi-Subject Assignments
export const kindergartenAssignments: MultiSubjectAssignment[] = [
  {
    id: 'k-kitchen-adventure',
    type: 'multi-subject',
    title: 'Kitchen Adventure',
    description: 'Help Chef Alex prepare a special meal using counting, reading, and science!',
    duration: '45 min',
    gradeLevel: 'Kindergarten',
    careerContext: 'chef',
    priority: 'required',
    skills: [
      {
        subject: 'Math',
        skill_number: 'A.1',
        skill_name: 'Identify numbers - up to 3',
        gradeLevel: 'Kindergarten',
        difficulty: 1
      },
      {
        subject: 'Science',
        skill_number: 'A.1',
        skill_name: 'Classify objects by two-dimensional shape',
        gradeLevel: 'Kindergarten',
        difficulty: 1
      },
      {
        subject: 'ELA',
        skill_number: 'A.1',
        skill_name: 'Find the letter in the alphabet: uppercase',
        gradeLevel: 'Kindergarten',
        difficulty: 1
      }
    ]
  },
  {
    id: 'k-nature-explorer',
    type: 'multi-subject',
    title: 'Nature Explorer',
    description: 'Join Ranger Alex on a nature adventure using counting and observation!',
    duration: '35 min',
    gradeLevel: 'Kindergarten',
    careerContext: 'park-ranger',
    priority: 'recommended',
    skills: [
      {
        subject: 'Math',
        skill_number: 'A.2',
        skill_name: 'Choose the number that you hear - up to 3',
        gradeLevel: 'Kindergarten',
        difficulty: 1
      },
      {
        subject: 'Science',
        skill_number: 'A.2',
        skill_name: 'Sort objects by two-dimensional shape',
        gradeLevel: 'Kindergarten',
        difficulty: 1
      }
    ]
  }
];

// 3rd Grade Multi-Subject Assignments
export const thirdGradeAssignments: MultiSubjectAssignment[] = [
  {
    id: 'g3-multiplication-chef',
    type: 'multi-subject',
    title: 'Master Chef Mathematics',
    description: 'Use multiplication and measurement to create the perfect recipes!',
    duration: '50 min',
    gradeLevel: '3rd',
    careerContext: 'chef',
    priority: 'required',
    skills: [
      {
        subject: 'Math',
        skill_number: 'B.1',
        skill_name: 'Compare numbers',
        gradeLevel: '3rd',
        difficulty: 2
      },
      {
        subject: 'Math',
        skill_number: 'B.2',
        skill_name: 'Which number is greatest/least?',
        gradeLevel: '3rd',
        difficulty: 2
      },
      {
        subject: 'ELA',
        skill_number: 'A.1',
        skill_name: 'Use spelling patterns to sort long and short vowel words',
        gradeLevel: '3rd',
        difficulty: 2
      }
    ]
  },
  {
    id: 'g3-science-detective',
    type: 'multi-subject',
    title: 'Science Detective',
    description: 'Solve mysteries using data analysis and scientific thinking!',
    duration: '55 min',
    gradeLevel: '3rd',
    careerContext: 'scientist',
    priority: 'required',
    skills: [
      {
        subject: 'Math',
        skill_number: 'C.1',
        skill_name: 'Round to the nearest ten or hundred using a number line',
        gradeLevel: '3rd',
        difficulty: 2
      },
      {
        subject: 'Science',
        skill_number: 'A.1',
        skill_name: 'Identify properties of an object',
        gradeLevel: '3rd',
        difficulty: 2
      },
      {
        subject: 'ELA',
        skill_number: 'A.2',
        skill_name: 'Spell rhyming words to answer riddles',
        gradeLevel: '3rd',
        difficulty: 2
      }
    ]
  }
];

// 7th Grade Multi-Subject Assignments
export const seventhGradeAssignments: MultiSubjectAssignment[] = [
  {
    id: 'g7-engineering-challenge',
    type: 'multi-subject',
    title: 'Engineering Challenge',
    description: 'Design solutions using algebra, physics, and technical writing!',
    duration: '60 min',
    gradeLevel: '7th',
    careerContext: 'engineer',
    priority: 'required',
    skills: [
      {
        skill_number: 'A.1',
        skill_name: 'Linear Equations',
        subject: 'Math',
        gradeLevel: '7th',
        difficulty: 3
      },
      {
        skill_number: 'A.1',
        skill_name: 'Energy and Matter',
        subject: 'Science',
        gradeLevel: '7th',
        difficulty: 3
      },
      {
        skill_number: 'A.1',
        skill_name: 'Argumentative Writing',
        subject: 'ELA',
        gradeLevel: '7th',
        difficulty: 3
      }
    ]
  },
  {
    id: 'g7-data-analyst',
    type: 'multi-subject',
    title: 'Data Analyst Challenge',
    description: 'Analyze real-world data using statistics and communication skills!',
    duration: '50 min',
    gradeLevel: '7th',
    careerContext: 'data-analyst',
    priority: 'recommended',
    skills: [
      {
        skill_number: 'B.1',
        skill_name: 'Statistics',
        subject: 'Math',
        gradeLevel: '7th',
        difficulty: 3
      },
      {
        skill_number: 'A.2',
        skill_name: 'Technical Reading',
        subject: 'ELA',
        gradeLevel: '7th',
        difficulty: 3
      }
    ]
  }
];

// 10th Grade Multi-Subject Assignments
export const tenthGradeAssignments: MultiSubjectAssignment[] = [
  {
    id: 'g10-business-startup',
    type: 'multi-subject',
    title: 'Startup Business Plan',
    description: 'Create a business plan using advanced math, economics, and persuasive writing!',
    duration: '75 min',
    gradeLevel: '10th',
    careerContext: 'entrepreneur',
    priority: 'required',
    skills: [
      {
        skill_number: 'A.1',
        skill_name: 'Systems of Equations',
        subject: 'Math',
        gradeLevel: '10th',
        difficulty: 4
      },
      {
        skill_number: 'A.1',
        skill_name: 'Economic Principles',
        subject: 'Social Studies',
        gradeLevel: '10th',
        difficulty: 4
      },
      {
        skill_number: 'A.1',
        skill_name: 'Research Writing',
        subject: 'ELA',
        gradeLevel: '10th',
        difficulty: 4
      }
    ]
  },
  {
    id: 'g10-research-scientist',
    type: 'multi-subject',
    title: 'Research Scientist Project',
    description: 'Conduct scientific research using calculus concepts and academic writing!',
    duration: '80 min',
    gradeLevel: '10th',
    careerContext: 'scientist',
    priority: 'required',
    skills: [
      {
        skill_number: 'B.1',
        skill_name: 'Function Analysis',
        subject: 'Math',
        gradeLevel: '10th',
        difficulty: 4
      },
      {
        skill_number: 'A.1',
        skill_name: 'Chemical Reactions',
        subject: 'Science',
        gradeLevel: '10th',
        difficulty: 4
      },
      {
        skill_number: 'A.2',
        skill_name: 'Explanatory Writing',
        subject: 'ELA',
        gradeLevel: '10th',
        difficulty: 4
      }
    ]
  }
];

// Assignment Selection Helper Functions
export const getAssignmentsForGrade = (gradeLevel: string): MultiSubjectAssignment[] => {
  switch (gradeLevel) {
    case 'Kindergarten':
    case 'K':
      return kindergartenAssignments;
    case '3rd':
    case 'Grade 3':
      return thirdGradeAssignments;
    case '7th':
    case 'Grade 7':
      return seventhGradeAssignments;
    case '10th':
    case 'Grade 10':
      return tenthGradeAssignments;
    default:
      return kindergartenAssignments; // Fallback
  }
};

export const getAssignmentById = (id: string): MultiSubjectAssignment | undefined => {
  const allAssignments = [
    ...kindergartenAssignments,
    ...thirdGradeAssignments,
    ...seventhGradeAssignments,
    ...tenthGradeAssignments
  ];
  
  return allAssignments.find(assignment => assignment.id === id);
};

export const getRecommendedAssignment = (gradeLevel: string): MultiSubjectAssignment => {
  const assignments = getAssignmentsForGrade(gradeLevel);
  const requiredAssignments = assignments.filter(a => a.priority === 'required');
  
  // Return first required assignment, or first assignment if none are required
  return requiredAssignments[0] || assignments[0];
};

// Finn's Daily Plan Generator
export const generateDailyPlan = (studentId: string, gradeLevel: string) => {
  const assignments = getAssignmentsForGrade(gradeLevel);
  const todaysAssignment = getRecommendedAssignment(gradeLevel);
  
  return {
    planId: `plan-${studentId}-${new Date().toISOString().split('T')[0]}`,
    studentId,
    date: new Date().toISOString().split('T')[0],
    assignments: [todaysAssignment],
    objectives: {
      primary: todaysAssignment.skills.filter(s => s.difficulty <= 2),
      secondary: todaysAssignment.skills.filter(s => s.difficulty > 2),
      review: [] // Could include skills from previous days
    },
    progress: {
      assigned: todaysAssignment.skills.length,
      completed: 0,
      mastered: 0,
      needsReview: 0
    },
    suggestedCareerTheme: todaysAssignment.careerContext,
    recommendedFlow: 'traditional' as const
  };
};