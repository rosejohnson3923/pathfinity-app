// ================================================================
// MAP READING INTERACTIVE - 7th Grade Social Studies Tool (A.1)
// Interactive tool for understanding how to read maps
// Assignment: Read maps
// ================================================================

import React, { useState, useEffect } from 'react';
import { MapPin, Compass, Globe, RotateCcw, HelpCircle, BookOpen, Navigation } from 'lucide-react';

interface MapReadingInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    mapContext?: string;
  };
}

interface MapReadingProblem {
  mapContext: string;
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation: string;
  mapSkill: 'scale' | 'legend' | 'compass' | 'coordinates' | 'elevation' | 'symbols';
}

export const MapReadingInteractive: React.FC<MapReadingInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🗺️ MapReadingInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<MapReadingProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 7th Grade Map Reading scenarios - understanding map elements and interpretation
  const mapScenarios = [
    {
      mapContext: "You're looking at a topographic map of Mount Rainier National Park. The map scale shows 1 inch = 1 mile. You measure the distance between the visitor center and Paradise Lodge as 3.5 inches on the map.",
      mapSkill: 'scale' as const,
      question: "What is the actual distance between these two locations?",
      correctAnswer: "3.5 miles",
      options: [
        "3.5 miles",
        "35 miles",
        "0.35 miles"
      ],
      hint: "Use the map scale to convert map distance to real distance.",
      explanation: "With a scale of 1 inch = 1 mile, a 3.5-inch distance on the map equals 3.5 miles in reality. Map scales help us understand real-world distances."
    },
    {
      mapContext: "On a political map of Europe, you see a small star symbol next to the city of Paris. The map legend shows that a star symbol represents a national capital.",
      mapSkill: 'legend' as const,
      question: "What does the star symbol tell you about Paris?",
      correctAnswer: "Paris is the capital city of France",
      options: [
        "Paris is the capital city of France",
        "Paris is a major tourist destination",
        "Paris has an international airport"
      ],
      hint: "Check what the map legend says about star symbols.",
      explanation: "Map legends explain what symbols mean. Since stars represent national capitals and Paris has a star, we know Paris is France's capital city."
    },
    {
      mapContext: "You're using a street map that shows a compass rose in the corner. The compass indicates that north points toward the top of the map. You need to travel from the library to the museum, which is directly to the right of the library on the map.",
      mapSkill: 'compass' as const,
      question: "In which cardinal direction will you travel?",
      correctAnswer: "East",
      options: [
        "East",
        "West",
        "North"
      ],
      hint: "If north is at the top of the map, which direction is to the right?",
      explanation: "On maps with north at the top, east is to the right, west is to the left, and south is at the bottom. Since the museum is to the right of the library, you'll travel east."
    },
    {
      mapContext: "A world map shows latitude and longitude lines. You find Tokyo, Japan located at approximately 36°N latitude and 140°E longitude. You need to find another city at a similar latitude.",
      mapSkill: 'coordinates' as const,
      question: "Which city would be at approximately the same latitude as Tokyo?",
      correctAnswer: "Las Vegas, USA (36°N)",
      options: [
        "Las Vegas, USA (36°N)",
        "Sydney, Australia (34°S)",
        "London, UK (51°N)"
      ],
      hint: "Look for cities with latitude close to 36°N.",
      explanation: "Cities at the same latitude are at the same distance north or south of the equator. Las Vegas at 36°N shares Tokyo's latitude, while Sydney is in the Southern Hemisphere and London is much farther north."
    },
    {
      mapContext: "On a physical map of Colorado, you see concentric lines very close together forming circular patterns around mountain peaks. The map key indicates these are contour lines showing elevation.",
      mapSkill: 'elevation' as const,
      question: "What do closely spaced contour lines indicate?",
      correctAnswer: "A steep slope or cliff",
      options: [
        "A steep slope or cliff",
        "A flat plain or valley",
        "A river or stream"
      ],
      hint: "Think about how elevation changes when lines are close together.",
      explanation: "Contour lines connect points of equal elevation. When they're close together, elevation changes rapidly over a short distance, indicating a steep slope. Widely spaced lines show gradual slopes."
    },
    {
      mapContext: "You're examining a road map that uses different colored lines for highways. According to the legend: thick red lines = interstate highways, yellow lines = state highways, thin gray lines = local roads. You see a thick red line labeled 'I-95'.",
      mapSkill: 'symbols' as const,
      question: "What type of road is I-95?",
      correctAnswer: "An interstate highway",
      options: [
        "An interstate highway",
        "A state highway",
        "A local road"
      ],
      hint: "Match the line color and thickness to the legend.",
      explanation: "Map symbols use colors, thickness, and patterns to represent different features. The thick red line matches the legend's symbol for interstate highways, and the 'I' in I-95 confirms it's an interstate."
    },
    {
      mapContext: "A climate map of the United States uses different colors to show average annual rainfall. The legend shows: dark blue = over 50 inches, light blue = 30-50 inches, green = 20-30 inches, yellow = 10-20 inches. Seattle is colored dark blue.",
      mapSkill: 'legend' as const,
      question: "What is Seattle's average annual rainfall?",
      correctAnswer: "Over 50 inches per year",
      options: [
        "Over 50 inches per year",
        "30-50 inches per year",
        "20-30 inches per year"
      ],
      hint: "Match Seattle's color to the rainfall amounts in the legend.",
      explanation: "Thematic maps use colors to show data patterns. Since Seattle is dark blue and the legend shows dark blue means over 50 inches of rain, we know Seattle receives more than 50 inches annually."
    },
    {
      mapContext: "You're planning a hiking trip using a trail map. The map scale is 1:24,000, meaning 1 unit on the map equals 24,000 of the same units in reality. The trail appears to be 4 inches long on the map.",
      mapSkill: 'scale' as const,
      question: "Approximately how long is the actual trail?",
      correctAnswer: "About 1.5 miles",
      options: [
        "About 1.5 miles",
        "About 4 miles",
        "About 24 miles"
      ],
      hint: "Convert: 4 inches × 24,000 = 96,000 inches. How many miles is that?",
      explanation: "With a 1:24,000 scale, 4 map inches = 96,000 real inches. Since 1 mile = 63,360 inches, the trail is 96,000 ÷ 63,360 ≈ 1.5 miles long. This scale is common for detailed topographic maps."
    }
  ];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🗺️ Map Reading: currentQuestion useEffect triggered');
    console.log('🗺️ Map Reading: currentQuestion value:', currentQuestion);
    console.log('🗺️ Map Reading: currentQuestion type:', typeof currentQuestion);
    console.log('🗺️ Map Reading: currentQuestion keys:', currentQuestion ? Object.keys(currentQuestion) : 'null/undefined');
    
    if (currentQuestion && (currentQuestion.question || currentQuestion.mapContext)) {
      console.log('🗺️ Map Reading received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('🗺️ Map Reading: No valid external question, generating internal problem');
      console.log('🗺️ Map Reading: Reason - currentQuestion:', !!currentQuestion, 'has question:', !!currentQuestion?.question, 'has mapContext:', !!currentQuestion?.mapContext);
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    console.log('🗺️ Map Reading: Processing external question data:', question);
    
    // Use external question data directly (synchronized with Practice Questions)
    const problem: MapReadingProblem = {
      mapContext: question.mapContext || 'Map reading context from Practice Questions',
      question: question.question || 'Question from Practice Questions',
      correctAnswer: question.answer || question.correctAnswer || 'Unknown',
      options: question.options || ['Option A', 'Option B', 'Option C'],
      hint: question.hint || 'Think about the map elements',
      explanation: question.explanation || 'This helps understand map reading concepts',
      mapSkill: 'legend' // Default map skill type
    };
    
    console.log('🗺️ Map Reading: Generated problem from external data:', problem);
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const randomScenario = mapScenarios[Math.floor(Math.random() * mapScenarios.length)];
    
    const problem: MapReadingProblem = {
      mapContext: randomScenario.mapContext,
      question: randomScenario.question,
      correctAnswer: randomScenario.correctAnswer,
      options: randomScenario.options,
      hint: randomScenario.hint,
      explanation: randomScenario.explanation,
      mapSkill: randomScenario.mapSkill
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Handle answer selection
  const handleAnswerSelect = (selectedLetter: string) => {
    if (isCorrect === true) return;
    
    setSelectedAnswer(selectedLetter);
    setAttempts(prev => prev + 1);
    
    // Find the correct letter by finding the index of the correct answer in options
    const correctOptionIndex = currentProblem?.options.findIndex(option => option === currentProblem?.correctAnswer);
    const correctLetter = correctOptionIndex !== -1 ? String.fromCharCode(65 + correctOptionIndex) : 'A';
    
    const correct = selectedLetter === correctLetter;
    setIsCorrect(correct);
    
    if (correct) {
      console.log('🗺️ Map Reading: Correct answer! Calling onResult with letter:', selectedLetter);
      setShowExplanation(true);
      if (onResult) {
        onResult(selectedLetter);
      }
    } else {
      console.log('❌ Map Reading: Wrong answer. Expected letter:', correctLetter, 'Got letter:', selectedLetter);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      console.log('🗺️ Map Reading Interactive cleared');
      // If we have an external question, use it; otherwise generate a new one
      if (currentQuestion && (currentQuestion.question || currentQuestion.mapContext)) {
        console.log('🗺️ Map Reading: Using external question after clear:', currentQuestion);
        generateProblemFromQuestion(currentQuestion);
      } else {
        console.log('🗺️ Map Reading: No external question after clear, generating internal problem');
        generateNewProblem();
      }
    }
  }, [clearTrigger, currentQuestion]);

  const Button: React.FC<{ onClick: () => void; className?: string; children: React.ReactNode; disabled?: boolean }> = ({
    onClick,
    className = '',
    children,
    disabled = false
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-lg font-medium transition-colors text-sm ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  // Get skill icon based on map skill type
  const getSkillIcon = () => {
    switch (currentProblem?.mapSkill) {
      case 'scale': return <Navigation className="w-5 h-5 text-blue-600" />;
      case 'legend': return <BookOpen className="w-5 h-5 text-green-600" />;
      case 'compass': return <Compass className="w-5 h-5 text-red-600" />;
      case 'coordinates': return <Globe className="w-5 h-5 text-purple-600" />;
      case 'elevation': return <MapPin className="w-5 h-5 text-orange-600" />;
      case 'symbols': return <HelpCircle className="w-5 h-5 text-indigo-600" />;
      default: return <MapPin className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-2">
          {getSkillIcon()}
          Map Reading Skills (A.1)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Understanding maps and their elements
        </p>
      </div>


      {/* Answer Options */}
      <div className="flex flex-col space-y-2 mb-3">
        {currentProblem?.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C
          return (
            <button
              key={index}
              onClick={() => handleAnswerSelect(letter)}
              className={`px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 border-2 text-left ${ 
                selectedAnswer === letter
                  ? isCorrect === true
                    ? 'bg-green-500 text-white border-green-600'
                    : isCorrect === false
                    ? 'bg-red-500 text-white border-red-600'
                    : 'bg-orange-500 text-white border-orange-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-amber-300 dark:border-amber-600 hover:bg-amber-100 dark:hover:bg-amber-800'
              }`}
              disabled={isCorrect === true}
            >
              <span className="font-bold text-amber-600 dark:text-amber-400 mr-2">{letter}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg max-h-20 overflow-y-auto">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            💡 Hint: {currentProblem?.hint}
          </p>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && currentProblem?.explanation && (
        <div className="mb-2 p-2 bg-green-100 dark:bg-green-900/30 rounded-lg max-h-20 overflow-y-auto">
          <p className="text-xs text-green-800 dark:text-green-200">
            ✅ {currentProblem.explanation}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center space-x-2 mt-auto">
        <Button
          onClick={() => setShowHint(true)}
          className="bg-yellow-500 hover:bg-yellow-600 text-white flex items-center space-x-1"
          disabled={isCorrect === true || showHint}
        >
          <HelpCircle className="w-3 h-3" />
          <span>Hint</span>
        </Button>

        <Button
          onClick={() => setShowExplanation(true)}
          className="bg-purple-500 hover:bg-purple-600 text-white flex items-center space-x-1"
          disabled={!isCorrect || showExplanation}
        >
          <BookOpen className="w-3 h-3" />
          <span>Explain</span>
        </Button>
      </div>
    </div>
  );
};