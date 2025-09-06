const fs = require('fs');
const path = require('path');

// Read existing skillsDataComplete.ts
const skillsDataPath = path.join(__dirname, 'src/data/skillsDataComplete.ts');
let content = fs.readFileSync(skillsDataPath, 'utf8');

// Find and remove the existing Grade 1 section
const grade1Start = content.indexOf('"Grade 1": {');
const grade3Start = content.indexOf('"Grade 3": {');

if (grade1Start !== -1 && grade3Start !== -1) {
  // Find the end of Grade 1 section (just before Grade 3)
  let braceCount = 0;
  let i = grade1Start;
  let foundStart = false;
  
  while (i < grade3Start) {
    if (content[i] === '{') {
      braceCount++;
      foundStart = true;
    } else if (content[i] === '}' && foundStart) {
      braceCount--;
      if (braceCount === 0) {
        // Found the closing brace for Grade 1
        // Remove from Grade 1 start to the comma after the closing brace
        let endPos = i + 1;
        while (endPos < content.length && content[endPos] !== ',') endPos++;
        if (content[endPos] === ',') endPos++;
        
        // Remove Grade 1 section
        content = content.slice(0, grade1Start - 2) + content.slice(endPos);
        break;
      }
    }
    i++;
  }
  
  // Write the cleaned file
  fs.writeFileSync(skillsDataPath, content);
  console.log('✅ Removed incomplete Grade 1 data');
} else {
  console.log('Grade 1 section not found or already clean');
}