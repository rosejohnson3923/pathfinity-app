const XLSX = require('xlsx');

// Read the original file
const wb = XLSX.readFile('./Skills Area By Grade_Categorized_PK_K_1_3_7_10.xlsx');
const ws = wb.Sheets['Sheet1'];
const data = XLSX.utils.sheet_to_json(ws);

// Filter out grade 10 (stored as number)
const filteredData = data.filter(row => row.Grade !== 10 && row.Grade !== '10');

console.log('Original skills:', data.length);
console.log('After filtering out grade 10:', filteredData.length);

// Show grade distribution
const gradeStats = {};
filteredData.forEach(row => {
  const grade = row.Grade;
  gradeStats[grade] = (gradeStats[grade] || 0) + 1;
});

console.log('Grade distribution after filtering:');
Object.entries(gradeStats).sort().forEach(([grade, count]) => {
  console.log(`  ${grade}: ${count} skills`);
});

// Create new workbook with filtered data
const newWb = XLSX.utils.book_new();
const newWs = XLSX.utils.json_to_sheet(filteredData);
XLSX.utils.book_append_sheet(newWb, newWs, 'Sheet1');

// Write the filtered file
XLSX.writeFile(newWb, './Skills_Area_Filtered_No_Grade10.xlsx');
console.log('Created filtered file: Skills_Area_Filtered_No_Grade10.xlsx');