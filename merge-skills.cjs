// Step 1: Load and process BOTH Excel files
const fs = require('fs');
const XLSX = require('xlsx');

console.log('=== MERGING SKILLS DATA FROM BOTH FILES ===');

// First, let's process the original MVP file (Pre-K & K)
const processMVPFile = async () => {
  try {
    const mvpResponse = fs.readFileSync('Skill Area By Grade_Categorized_MVP.xlsx');
    const mvpWorkbook = XLSX.read(mvpResponse, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });
    
    console.log('MVP File sheets:', mvpWorkbook.SheetNames);
    return mvpWorkbook;
  } catch (error) {
    console.log('❌ MVP file not found, will use MVP2 only');
    return null;
  }
};

// Process MVP2 file (3rd, 7th, 10th)
const processMVP2File = async () => {
  try {
    // Try different possible names for MVP2 file
    const possibleNames = [
      'Skill Area By Grade_Categorized_MVP2.xlsx',
      'MVP2.xlsx',
      'Skills_MVP2.xlsx'
    ];
    
    let mvp2Response = null;
    let foundFile = null;
    
    for (const fileName of possibleNames) {
      try {
        mvp2Response = fs.readFileSync(fileName);
        foundFile = fileName;
        break;
      } catch (e) {
        // Continue trying other names
      }
    }
    
    if (!mvp2Response) {
      console.log('❌ MVP2 file not found. Tried:', possibleNames);
      return null;
    }
    
    const mvp2Workbook = XLSX.read(mvp2Response, {
      cellStyles: true,
      cellFormulas: true,
      cellDates: true,
      cellNF: true,
      sheetStubs: true
    });
    
    console.log(`MVP2 File found: ${foundFile}`);
    console.log('MVP2 File sheets:', mvp2Workbook.SheetNames);
    return mvp2Workbook;
  } catch (error) {
    console.log('❌ MVP2 file processing error:', error.message);
    return null;
  }
};

// Enhanced processor for both files
class CombinedSkillsProcessor {
  static async processAllSkillsFiles() {
    const mvpWorkbook = await processMVPFile();
    const mvp2Workbook = await processMVP2File();
    
    const combinedSkills = {
      'Kindergarten': {},
      'Grade 3': {},
      'Grade 7': {},
      'Grade 10': {}
    };
    
    // Process MVP file (Pre-K & K)
    if (mvpWorkbook) {
      console.log('Processing MVP file...');
      const mvpData = this.processMVPWorkbook(mvpWorkbook);
      Object.assign(combinedSkills, mvpData);
    }
    
    // Process MVP2 file (3rd, 7th, 10th)
    if (mvp2Workbook) {
      console.log('Processing MVP2 file...');
      const mvp2Data = this.processMVP2Workbook(mvp2Workbook);
      Object.assign(combinedSkills, mvp2Data);
    }
    
    return combinedSkills;
  }
  
  static processMVPWorkbook(workbook) {
    const gradeSkills = {};
    
    // Target sheets for MVP (Pre-K & K)
    const mvpTargetSheets = {
      'Kindergarten': ['Math_K', 'ELA_K', 'Science_K', 'SocialStudies_K']
    };
    
    Object.entries(mvpTargetSheets).forEach(([gradeName, sheetNames]) => {
      const gradeSkillsData = {};
      
      sheetNames.forEach(sheetName => {
        if (workbook.Sheets[sheetName]) {
          const skills = this.processSheet(workbook.Sheets[sheetName], sheetName);
          if (skills.length > 0) {
            const subject = skills[0].subject;
            gradeSkillsData[subject] = skills;
          }
        }
      });
      
      if (Object.keys(gradeSkillsData).length > 0) {
        gradeSkills[gradeName] = gradeSkillsData;
      }
    });
    
    return gradeSkills;
  }
  
  static processMVP2Workbook(workbook) {
    const gradeSkills = {};
    
    // Target sheets for MVP2 (3rd, 7th, 10th)
    const mvp2TargetSheets = {
      'Grade 3': ['Math_3', 'ELA_3', 'Science_3', 'SocialStudies_3'],
      'Grade 7': ['Math_7', 'ELA_7', 'Science_7', 'SocialStudies_7'],
      'Grade 10': ['Algebra1', 'Precalculus']
    };
    
    Object.entries(mvp2TargetSheets).forEach(([gradeName, sheetNames]) => {
      const gradeSkillsData = {};
      
      sheetNames.forEach(sheetName => {
        if (workbook.Sheets[sheetName]) {
          const skills = this.processSheet(workbook.Sheets[sheetName], sheetName);
          if (skills.length > 0) {
            const subject = skills[0].subject;
            gradeSkillsData[subject] = skills;
          }
        }
      });
      
      if (Object.keys(gradeSkillsData).length > 0) {
        gradeSkills[gradeName] = gradeSkillsData;
      }
    });
    
    return gradeSkills;
  }
  
  static processSheet(sheet, sheetName) {
    const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const skills = [];
    
    // Skip header row (row 0) and process data rows
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      if (!row || row.length < 6 || !row[5]) continue;
      
      const skill = {
        id: `${sheetName}_${i}`,
        subject: this.normalizeSubject(row[0]),
        grade: row[1],
        skillsArea: row[2] || '',
        skillCluster: row[3] || '',
        skillNumber: row[4] || '',
        skillName: row[5] || '',
        description: `${row[3]} ${row[4]}: ${row[5]}`
      };
      
      if (skill.skillName.trim()) {
        skills.push(skill);
      }
    }
    
    return skills;
  }
  
  static normalizeSubject(subject) {
    if (!subject) return 'Unknown';
    
    const subjectMap = {
      'Math': 'Math',
      'ELA': 'ELA', 
      'Science': 'Science',
      'Social Studies': 'Social Studies',
      'Algebra1': 'Algebra I',
      'Precalculus': 'Pre-Calculus'
    };
    
    return subjectMap[subject] || subject;
  }
  
  static generateDataSummary(gradeSkills) {
    const summary = {
      totalSkills: 0,
      gradeBreakdown: {}
    };
    
    Object.entries(gradeSkills).forEach(([grade, subjects]) => {
      const gradeData = {
        totalSkills: 0,
        subjects: {}
      };
      
      Object.entries(subjects).forEach(([subject, skills]) => {
        const skillCount = skills.length;
        gradeData.subjects[subject] = skillCount;
        gradeData.totalSkills += skillCount;
        summary.totalSkills += skillCount;
      });
      
      summary.gradeBreakdown[grade] = gradeData;
    });
    
    return summary;
  }
}

// Execute the merge
const executeSkillsMerge = async () => {
  console.log('🔄 Starting skills data merge...');
  
  const combinedSkillsData = await CombinedSkillsProcessor.processAllSkillsFiles();
  const summary = CombinedSkillsProcessor.generateDataSummary(combinedSkillsData);
  
  console.log('✅ MERGE COMPLETE!');
  console.log('📊 Combined Skills Summary:');
  console.log(`Total Skills: ${summary.totalSkills}`);
  
  Object.entries(summary.gradeBreakdown).forEach(([grade, data]) => {
    console.log(`\n${grade}: ${data.totalSkills} skills`);
    Object.entries(data.subjects).forEach(([subject, count]) => {
      console.log(`  ${subject}: ${count} skills`);
    });
  });
  
  // Generate the complete TypeScript file
  const completeSkillsFile = `// Complete Skills Data - Merged from MVP and MVP2
// Generated on: ${new Date().toISOString()}
// Total Skills: ${summary.totalSkills}

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

export const skillsData: GradeSkills = ${JSON.stringify(combinedSkillsData, null, 2)};

export default skillsData;`;
  
  fs.writeFileSync('src/data/skillsDataComplete.ts', completeSkillsFile);
  
  console.log('✅ Generated complete skills data file: src/data/skillsDataComplete.ts');
  
  return combinedSkillsData;
};

// Run the merge
executeSkillsMerge().catch(console.error);