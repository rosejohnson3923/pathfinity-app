const fs = require('fs');
const path = require('path');

// Read the Grade 1 text file
const grade1Data = fs.readFileSync(
  path.join(__dirname, 'src/data/skillsDataComplete_Grade1.txt'), 
  'utf8'
);

// Parse the tab-separated data
const lines = grade1Data.split('\n');
const headers = lines[0].split('\t');

// Group skills by subject
const skillsBySubject = {
  Math: [],
  ELA: [],
  Science: [],
  'Social Studies': []
};

let idCounter = {
  Math: 1,
  ELA: 1,
  Science: 1,
  'Social Studies': 1
};

// Process each line (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const values = line.split('\t');
  if (values.length < 6) continue;
  
  const [subject, grade, skillsArea, skillCluster, skillNumber, skillName] = values;
  
  // Normalize subject name for ID generation
  const subjectKey = subject === 'Social Studies' ? 'SocialStudies' : subject;
  
  // Create skill object
  const skill = {
    id: `${subjectKey}_1_${idCounter[subject]}`,
    subject: subject,
    grade: 1,
    skillsArea: skillsArea || `${subject} Foundations`,
    skillCluster: skillCluster,
    skillNumber: skillNumber,
    skillName: skillName,
    description: `${skillCluster} ${skillNumber}: ${skillName}`
  };
  
  if (skillsBySubject[subject]) {
    skillsBySubject[subject].push(skill);
    idCounter[subject]++;
  }
}

// Create the Grade 1 structure
const grade1Structure = {
  "Grade 1": skillsBySubject
};

// Read existing skillsDataComplete.ts
const skillsDataPath = path.join(__dirname, 'src/data/skillsDataComplete.ts');
let existingContent = fs.readFileSync(skillsDataPath, 'utf8');

// Find where to insert Grade 1 (after Kindergarten, before Grade 3)
const grade3Index = existingContent.indexOf('"Grade 3": {');
if (grade3Index === -1) {
  console.error('Could not find Grade 3 in skillsDataComplete.ts');
  process.exit(1);
}

// Find the end of Kindergarten section
const kindergartenIndex = existingContent.indexOf('"Kindergarten": {');
const kindergartenEndIndex = existingContent.lastIndexOf(']', grade3Index);
const insertPosition = existingContent.indexOf('},', kindergartenEndIndex) + 2;

// Format Grade 1 data as string
const grade1String = JSON.stringify(grade1Structure, null, 2)
  .replace(/"Grade 1"/, '  "Grade 1"')
  .slice(1, -1) + ',';

// Insert Grade 1 data
const newContent = 
  existingContent.slice(0, insertPosition) + 
  '\n' + grade1String + '\n' +
  existingContent.slice(insertPosition);

// Write the updated file
fs.writeFileSync(skillsDataPath, newContent);

console.log('✅ Grade 1 skills added successfully!');
console.log(`   - Math: ${skillsBySubject.Math.length} skills`);
console.log(`   - ELA: ${skillsBySubject.ELA.length} skills`);
console.log(`   - Science: ${skillsBySubject.Science.length} skills`);
console.log(`   - SocialStudies: ${skillsBySubject.SocialStudies.length} skills`);