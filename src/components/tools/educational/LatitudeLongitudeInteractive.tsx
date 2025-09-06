// ================================================================
// LATITUDE/LONGITUDE INTERACTIVE - 7th Grade Social Studies Tool (A.2)
// Interactive tool for using latitude and longitude coordinates
// Assignment: Use lines of latitude and longitude
// ================================================================

import React, { useState, useEffect } from 'react';
import { Globe, MapPin, Compass, RotateCcw, HelpCircle, BookOpen, Navigation2 } from 'lucide-react';

interface LatitudeLongitudeInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    coordinateContext?: string;
  };
}

interface CoordinateProblem {
  coordinateContext: string;
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation: string;
  skillType: 'find_location' | 'read_coordinates' | 'hemisphere' | 'distance' | 'navigation';
}

export const LatitudeLongitudeInteractive: React.FC<LatitudeLongitudeInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🌍 LatitudeLongitudeInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<CoordinateProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 7th Grade Latitude/Longitude scenarios - practical use of coordinates
  const coordinateScenarios = [
    {
      coordinateContext: "You are planning a trip to Paris, France. Your travel app shows that Paris is located at 48.8566°N, 2.3522°E. You need to find another city at a similar latitude for comparison.",
      skillType: 'find_location' as const,
      question: "Which city would be at approximately the same latitude as Paris?",
      correctAnswer: "Seattle, USA (47.6°N)",
      options: [
        "Seattle, USA (47.6°N)",
        "Cairo, Egypt (30.0°N)",
        "Sydney, Australia (33.9°S)"
      ],
      hint: "Look for cities with latitude close to 48.8°N in the Northern Hemisphere.",
      explanation: "Cities at similar latitudes share similar distances from the equator. Seattle at 47.6°N is closest to Paris at 48.8°N, while Cairo and Sydney are much farther from the equator."
    },
    {
      coordinateContext: "A ship's GPS shows its current position as 25.7617°N, 80.1918°W. The captain needs to identify which major city this coordinate represents for navigation purposes.",
      skillType: 'read_coordinates' as const,
      question: "What major city is located at these coordinates?",
      correctAnswer: "Miami, Florida",
      options: [
        "Miami, Florida",
        "New Orleans, Louisiana",
        "Tampa, Florida"
      ],
      hint: "These coordinates are in southeastern Florida, near the coast.",
      explanation: "The coordinates 25.7617°N, 80.1918°W specifically locate Miami, Florida. The latitude places it in southern Florida, and the longitude puts it on the Atlantic coast."
    },
    {
      coordinateContext: "An earthquake occurred at coordinates 35.6762°N, 139.6503°E. Scientists need to determine which hemisphere this location is in for their global monitoring system.",
      skillType: 'hemisphere' as const,
      question: "In which hemispheres is this earthquake location?",
      correctAnswer: "Northern and Eastern hemispheres",
      options: [
        "Northern and Eastern hemispheres",
        "Southern and Western hemispheres",
        "Northern and Western hemispheres"
      ],
      hint: "Look at the N/S and E/W indicators in the coordinates.",
      explanation: "The 'N' indicates Northern Hemisphere (above the equator) and 'E' indicates Eastern Hemisphere (east of the Prime Meridian). These coordinates are actually Tokyo, Japan."
    },
    {
      coordinateContext: "A weather station in Denver, Colorado (39.7392°N, 104.9903°W) is reporting conditions. A meteorologist needs to find another station at approximately the same longitude for comparison.",
      skillType: 'find_location' as const,
      question: "Which location would be at approximately the same longitude as Denver?",
      correctAnswer: "Santa Fe, New Mexico (105.9°W)",
      options: [
        "Santa Fe, New Mexico (105.9°W)",
        "Chicago, Illinois (87.6°W)",
        "Phoenix, Arizona (112.1°W)"
      ],
      hint: "Look for longitudes close to 104.9°W - they will be in the same north-south line.",
      explanation: "Places at similar longitudes are in the same north-south line. Santa Fe at 105.9°W is closest to Denver's 104.9°W longitude, making them nearly due north-south of each other."
    },
    {
      coordinateContext: "A pilot is flying from New York City (40.7128°N, 74.0060°W) to London (51.5074°N, 0.1278°W). She needs to understand the coordinate differences for her flight plan.",
      skillType: 'navigation' as const,
      question: "What direction will the pilot primarily travel?",
      correctAnswer: "Northeast",
      options: [
        "Northeast",
        "Southeast",
        "Northwest"
      ],
      hint: "Compare the latitude and longitude values to determine the direction.",
      explanation: "London has higher latitude (51.5° vs 40.7°) so it's north, and less negative longitude (0.1° vs -74°) so it's east. Therefore, the direction is northeast."
    },
    {
      coordinateContext: "A research team studying climate change wants to compare data from two locations: one at the equator (0°N, 78.1834°W) and another at 23.5°N, 78.1834°W. Both locations are at the same longitude.",
      skillType: 'distance' as const,
      question: "What is the approximate latitudinal distance between these two locations?",
      correctAnswer: "About 1,600 miles (23.5 degrees difference)",
      options: [
        "About 1,600 miles (23.5 degrees difference)",
        "About 800 miles (11.75 degrees difference)",
        "About 2,400 miles (35.25 degrees difference)"
      ],
      hint: "Each degree of latitude equals approximately 69 miles.",
      explanation: "The latitudinal difference is 23.5 degrees (23.5°N - 0°N). Since each degree of latitude equals about 69 miles, 23.5 × 69 ≈ 1,600 miles."
    },
    {
      coordinateContext: "A GPS treasure hunt gives you coordinates 34.0522°N, 118.2437°W. You need to identify this famous city to find the next clue.",
      skillType: 'read_coordinates' as const,
      question: "What major city do these coordinates locate?",
      correctAnswer: "Los Angeles, California",
      options: [
        "Los Angeles, California",
        "San Diego, California",
        "Las Vegas, Nevada"
      ],
      hint: "These coordinates are in Southern California, near the Pacific coast.",
      explanation: "The coordinates 34.0522°N, 118.2437°W pinpoint Los Angeles, California. The latitude places it in southern California, and the longitude puts it near the Pacific coast."
    },
    {
      coordinateContext: "An international conference is planned at coordinates 55.7558°N, 37.6176°E. Delegates need to know which time zone to expect for scheduling purposes.",
      skillType: 'read_coordinates' as const,
      question: "Which major world capital is located at these coordinates?",
      correctAnswer: "Moscow, Russia",
      options: [
        "Moscow, Russia",
        "Helsinki, Finland",
        "Warsaw, Poland"
      ],
      hint: "These coordinates are in Eastern Europe, at a high northern latitude.",
      explanation: "The coordinates 55.7558°N, 37.6176°E locate Moscow, Russia. The high northern latitude and eastern longitude place it in Eastern Europe, specifically the Russian capital."
    }
  ];

  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🌍 Latitude/Longitude: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('🌍 Latitude/Longitude received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('🌍 Latitude/Longitude: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    // For A.2 latitude/longitude skill, use our curated scenarios
    const randomScenario = coordinateScenarios[Math.floor(Math.random() * coordinateScenarios.length)];
    
    const problem: CoordinateProblem = {
      coordinateContext: question.coordinateContext || randomScenario.coordinateContext,
      question: question.question || randomScenario.question,
      correctAnswer: question.answer || randomScenario.correctAnswer,
      options: question.options || randomScenario.options,
      hint: question.hint || randomScenario.hint,
      explanation: question.explanation || randomScenario.explanation,
      skillType: randomScenario.skillType
    };
    
    setCurrentProblem(problem);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const randomScenario = coordinateScenarios[Math.floor(Math.random() * coordinateScenarios.length)];
    
    const problem: CoordinateProblem = {
      coordinateContext: randomScenario.coordinateContext,
      question: randomScenario.question,
      correctAnswer: randomScenario.correctAnswer,
      options: randomScenario.options,
      hint: randomScenario.hint,
      explanation: randomScenario.explanation,
      skillType: randomScenario.skillType
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
      console.log('🌍 Latitude/Longitude: Correct answer! Calling onResult with letter:', selectedLetter);
      setShowExplanation(true);
      if (onResult) {
        onResult(selectedLetter);
      }
    } else {
      console.log('❌ Latitude/Longitude: Wrong answer. Expected letter:', correctLetter, 'Got letter:', selectedLetter);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      console.log('🌍 Latitude/Longitude Interactive cleared');
      // If we have an external question, use it; otherwise generate a new one
      if (currentQuestion) {
        generateProblemFromQuestion(currentQuestion);
      } else {
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

  // Get skill icon based on coordinate skill type
  const getSkillIcon = () => {
    switch (currentProblem?.skillType) {
      case 'find_location': return <MapPin className="w-5 h-5 text-blue-600" />;
      case 'read_coordinates': return <Globe className="w-5 h-5 text-green-600" />;
      case 'hemisphere': return <Compass className="w-5 h-5 text-purple-600" />;
      case 'distance': return <Navigation2 className="w-5 h-5 text-orange-600" />;
      case 'navigation': return <Navigation2 className="w-5 h-5 text-red-600" />;
      default: return <Globe className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-2">
          {getSkillIcon()}
          Latitude & Longitude Use (A.2)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Using coordinates to find and navigate locations
        </p>
      </div>

      {/* Question Display */}
      {currentProblem && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentProblem.question}
            </span>
          </div>
        </div>
      )}

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
                    : 'bg-cyan-500 text-white border-cyan-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-cyan-300 dark:border-cyan-600 hover:bg-cyan-100 dark:hover:bg-cyan-800'
              }`}
              disabled={isCorrect === true}
            >
              <span className="font-bold text-cyan-600 dark:text-cyan-400 mr-2">{letter}.</span>
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