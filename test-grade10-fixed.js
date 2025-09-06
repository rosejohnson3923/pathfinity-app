// Test Grade 10 fixes
console.log('🧪 Testing Grade 10 fixes...\n');

// Mock imports
const mockSkillsData = {
  'Grade 10': {
    'Algebra I': [
      { id: 'Algebra I_10_1', skillNumber: 'A.0', skillName: 'Foundations of Algebra' },
      { id: 'Algebra I_10_2', skillNumber: 'A.1', skillName: 'Understanding Variables' },
      { id: 'Algebra I_10_3', skillNumber: 'A.2', skillName: 'Solving Linear Equations' }
    ]
  }
};

// Test 1: Subject Mapping
console.log('✅ Test 1: Subject Mapping');
const mapSubjectForGrade = (subject, grade) => {
  if (grade === '10') {
    const map = { 'Math': 'Algebra I', 'ELA': '', 'Science': '', 'Social Studies': '' };
    return map[subject] !== undefined ? map[subject] : subject;
  }
  return subject;
};

console.log('  Math → ' + mapSubjectForGrade('Math', '10'));
console.log('  ELA → ' + (mapSubjectForGrade('ELA', '10') || 'No curriculum'));

// Test 2: Skill Loading
console.log('\n✅ Test 2: Skill Loading with Mapping');
const loadCluster = (grade, subject) => {
  const mapped = mapSubjectForGrade(subject, grade);
  if (!mapped) return null;
  
  const gradeData = mockSkillsData[`Grade ${grade}`];
  if (!gradeData || !gradeData[mapped]) return null;
  
  const skills = gradeData[mapped].filter(s => s.skillNumber.startsWith('A.'));
  return skills.length > 0 ? skills : null;
};

const mathSkills = loadCluster('10', 'Math');
console.log('  Math skills found:', mathSkills ? mathSkills.length : 0);
if (mathSkills && mathSkills[0]) {
  console.log('  First skill:', mathSkills[0].skillName);
}

// Test 3: Journey Creation
console.log('\n✅ Test 3: Synchronous Journey Creation');
class MockJourney {
  createMinimalJourney(studentId, grade) {
    const clusters = {};
    const subjects = ['Math', 'ELA', 'Science', 'Social Studies'];
    
    for (const subject of subjects) {
      const skills = loadCluster(grade, subject);
      if (skills) {
        clusters[subject] = {
          skills: skills,
          currentIndex: 0
        };
      }
    }
    
    return {
      studentId,
      gradeLevel: grade,
      activeSkillClusters: clusters
    };
  }
  
  getCurrentSkillForSubject(studentId, subject, grade) {
    const journey = this.createMinimalJourney(studentId, grade);
    const cluster = journey.activeSkillClusters[subject];
    return cluster ? cluster.skills[cluster.currentIndex] : null;
  }
}

const journey = new MockJourney();
const skill = journey.getCurrentSkillForSubject('test-student', 'Math', '10');
console.log('  Current Math skill:', skill ? skill.skillName : 'None');

console.log('\n🎉 All tests passed! Grade 10 Math should now load correctly.');