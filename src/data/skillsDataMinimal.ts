export interface Skill {
  id: string;
  subject: string;
  grade: string | number;
  skillsArea: string;
  skillCluster: string;
  skillNumber: string;
  skillName: string;
  description?: string;
}

export interface SubjectSkills {
  [subject: string]: Skill[];
}

export interface GradeSkills {
  [grade: string]: SubjectSkills;
}

export const skillsData: GradeSkills = {
  "Grade 3": {
    "Math": [
      {
        id: "Math_3_1",
        subject: "Math",
        grade: "3",
        skillsArea: "Math Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Place value",
        description: "A. A.1: Place value"
      }
    ],
    "ELA": [
      {
        id: "ELA_3_1",
        subject: "ELA",
        grade: "3",
        skillsArea: "Reading Foundations", 
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Short and long vowels",
        description: "A. A.1: Short and long vowels"
      }
    ],
    "Science": [
      {
        id: "Science_3_1",
        subject: "Science",
        grade: "3",
        skillsArea: "Science Foundations",
        skillCluster: "A.",
        skillNumber: "A.1", 
        skillName: "Materials",
        description: "A. A.1: Materials"
      }
    ],
    "Social Studies": [
      {
        id: "SocialStudies_3_1",
        subject: "Social Studies",
        grade: "3",
        skillsArea: "SS Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Read maps",
        description: "A. A.1: Read maps"
      }
    ]
  },
  "Grade 7": {
    "Math": [
      {
        id: "Math_7_1",
        subject: "Math",
        grade: "7",
        skillsArea: "Math Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Integers",
        description: "A. A.1: Integers"
      }
    ],
    "ELA": [
      {
        id: "ELA_7_1",
        subject: "ELA",
        grade: "7",
        skillsArea: "ELA Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Main idea",
        description: "A. A.1: Main idea"
      }
    ],
    "Science": [
      {
        id: "Science_7_1",
        subject: "Science",
        grade: "7",
        skillsArea: "Science Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Science practices and tools",
        description: "A. A.1: Science practices and tools"
      }
    ],
    "Social Studies": [
      {
        id: "SocialStudies_7_1",
        subject: "Social Studies",
        grade: "7",
        skillsArea: "SS Foundations",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Read maps",
        description: "A. A.1: Read maps"
      }
    ]
  },
  "Grade 10": {
    "Algebra I": [
      {
        id: "Algebra1_1",
        subject: "Algebra I",
        grade: "10",
        skillsArea: "Algebra1",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Numbers and operations",
        description: "A. A.1: Numbers and operations"
      }
    ],
    "Pre-Calculus": [
      {
        id: "Precalculus_1",
        subject: "Pre-Calculus",
        grade: "10",
        skillsArea: "Precalculus",
        skillCluster: "A.",
        skillNumber: "A.1",
        skillName: "Function concepts",
        description: "A. A.1: Function concepts"
      }
    ]
  }
};

export default skillsData;