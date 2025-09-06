const XLSX = require('xlsx');

// Read the original file
const wb = XLSX.readFile('./Skills Area By Grade_Categorized_PK_K_1_3_7_10.xlsx');
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws);

// Find first few grade 10 records
const grade10Records = data.filter(row => row.Grade === 10).slice(0, 3);

console.log('First 3 grade 10 records:');
grade10Records.forEach((row, i) => {
  console.log(`Record ${i+1}:`);
  console.log('  Grade:', JSON.stringify(row.Grade), '(type:', typeof row.Grade, ')');
  console.log('  Subject:', JSON.stringify(row.Subject));
  console.log('  SkillName:', JSON.stringify(row.SkillName));
  console.log('  SkillsArea:', JSON.stringify(row.SkillsArea));
  console.log('');
});

// Test our grade mapping
const GRADE_MAPPING = {
  'Pre-K': 'Pre-K',
  'PreK': 'Pre-K',
  'K': 'K',
  'Kindergarten': 'K',
  '1': '1',
  'Grade1': '1',
  'First': '1',
  '3': '3',
  'Grade3': '3',
  'Third': '3',
  '7': '7',
  'Grade7': '7',
  'Seventh': '7',
  '10': '10',
  'Grade10': '10',
  'Tenth': '10',
  'Algebra1': 'Algebra1',
  'Algebra 1': 'Algebra1',
  'Precalculus': 'Precalculus',
  'Pre-calculus': 'Precalculus',
  'PreCalculus': 'Precalculus'
};

console.log('Grade mapping test:');
console.log('String "10":', GRADE_MAPPING['10']);
console.log('Number 10 as string:', GRADE_MAPPING[String(10)]);

// Test validation
const validGrades = ['Pre-K', 'K', '1', '3', '7', '10', 'Algebra1', 'Precalculus'];
console.log('Grade "10" in validGrades:', validGrades.includes('10'));
console.log('Grade 10 as string in validGrades:', validGrades.includes(String(10)));