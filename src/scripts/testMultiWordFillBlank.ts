import { FillBlankGeneratorService } from '../services/FillBlankGeneratorService';

// Test multi-word answer handling
const testCases = [
  {
    statement: "Blockchain Developers use scientific inquiry to systematically investigate and solve problems in their systems.",
    expectedAnswer: "scientific inquiry",
    description: "Two-word scientific term"
  },
  {
    statement: "The main idea of the passage is understanding complex systems.",
    expectedAnswer: "main idea",
    description: "Two-word ELA term"
  },
  {
    statement: "The central message conveyed by the author is perseverance.",
    expectedAnswer: "central message",
    description: "Two-word theme term"
  },
  {
    statement: "Scientists use the scientific method to conduct experiments.",
    expectedAnswer: "scientific method",
    description: "Two-word methodology term"
  },
  {
    statement: "The answer is climate change impacts our environment.",
    expectedAnswer: "climate change",
    description: "Two-word environmental term"
  }
];

console.log('🧪 Testing Multi-Word Fill Blank Answer Handling\n');
console.log('='.repeat(60));

const generator = FillBlankGeneratorService.getInstance();

testCases.forEach((testCase, index) => {
  console.log(`\n📝 Test Case ${index + 1}: ${testCase.description}`);
  console.log(`Original: "${testCase.statement}"`);
  
  const result = generator.generateFillBlank(testCase.statement);
  
  console.log(`Question: "${result.question}"`);
  console.log(`Extracted Answer: "${result.correct_answer}"`);
  console.log(`Expected Answer: "${testCase.expectedAnswer}"`);
  
  // Check if the answer matches expected
  const isCorrect = result.correct_answer.toLowerCase() === testCase.expectedAnswer.toLowerCase();
  console.log(`Result: ${isCorrect ? '✅ PASS' : '❌ FAIL'}`);
  
  // Test reconstruction
  const reconstructed = result.question.replace('_____', result.correct_answer);
  const reconstructionMatch = reconstructed.toLowerCase().trim() === testCase.statement.toLowerCase().trim();
  console.log(`Reconstruction: ${reconstructionMatch ? '✅ Valid' : '⚠️ Mismatch'}`);
  
  if (!reconstructionMatch) {
    console.log(`  Reconstructed: "${reconstructed}"`);
  }
  
  // Show answer variations
  console.log(`Answer Variations: [${result.blanks[0].correctAnswers.slice(0, 5).join(', ')}${result.blanks[0].correctAnswers.length > 5 ? '...' : ''}]`);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Multi-word fill blank testing complete!\n');