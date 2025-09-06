const XLSX = require('xlsx');

const wb = XLSX.readFile('./Skills Area By Grade_Categorized_PK_K_1_3_7_10.xlsx');
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws);

// Check unique grade values
const uniqueGrades = [...new Set(data.map(row => row.Grade))];
console.log('Unique grades in file:', uniqueGrades);

// Show exact values for first few grade 10 rows
const grade10Rows = data.filter(row => row.Grade === 10 || row.Grade === '10').slice(0, 3);
console.log('Sample grade 10 rows:');
grade10Rows.forEach((row, i) => {
  console.log(`Row ${i+1}:`, JSON.stringify(row.Grade), 'Type:', typeof row.Grade);
});

// Check if grade is numeric
const numericGrade10 = data.filter(row => row.Grade === 10);
const stringGrade10 = data.filter(row => row.Grade === '10');

console.log('Numeric 10:', numericGrade10.length);
console.log('String "10":', stringGrade10.length);