// ================================================================
// MAIN IDEA INTERACTIVE - 7th Grade ELA Tool (A.1)
// Interactive main idea identification and analysis
// Assignment: Determine the main idea of a passage
// ================================================================

import React, { useState, useEffect } from 'react';
import { Check, RotateCcw, HelpCircle, BookOpen, Target, Brain } from 'lucide-react';

interface MainIdeaInteractiveProps {
  onResult?: (result: string) => void;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: string;
    hint?: string;
    questionType?: string;
    passage?: string;
  };
}

interface MainIdeaProblem {
  passage: string;
  question: string;
  correctAnswer: string;
  options: string[];
  hint: string;
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

export const MainIdeaInteractive: React.FC<MainIdeaInteractiveProps> = ({
  onResult,
  clearTrigger,
  currentQuestion
}) => {
  console.log('🎯 MainIdeaInteractive rendered with currentQuestion:', currentQuestion);
  
  const [currentProblem, setCurrentProblem] = useState<MainIdeaProblem | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  // 7th Grade Main Idea passages - grade-appropriate topics
  const passages = [
    {
      text: "Social media has fundamentally changed how teenagers communicate and form relationships. Unlike previous generations who primarily interacted face-to-face or through phone calls, today's teens maintain friendships through constant digital connections. Platforms like Instagram, Snapchat, and TikTok allow them to share experiences instantly, creating a sense of continuous social presence. However, this digital communication often lacks the emotional depth of in-person conversations. While social media helps teens stay connected with distant friends and find communities with shared interests, it can also lead to anxiety about online image and fear of missing out. Research shows that balanced use of social media, combined with regular face-to-face interaction, leads to healthier social development.",
      mainIdea: "Social media has transformed teenage communication with both positive and negative effects.",
      wrongOptions: [
        "Teenagers prefer social media over face-to-face communication.",
        "Instagram and TikTok are the most popular social media platforms among teens."
      ],
      hint: "Look for the overall message about social media's impact, not just specific details.",
      explanation: "The passage discusses how social media has changed teen communication and presents both benefits (staying connected, finding communities) and drawbacks (lack of emotional depth, anxiety)."
    },
    {
      text: "Climate change is affecting ecosystems around the world in dramatic ways. Rising temperatures are causing ice caps to melt, leading to higher sea levels that threaten coastal communities. In tropical regions, coral reefs are experiencing bleaching events due to warmer ocean temperatures, destroying habitats for countless marine species. Meanwhile, changing precipitation patterns are creating droughts in some areas while causing floods in others. These environmental changes force animals to migrate to new territories, often disrupting food chains and breeding cycles. Scientists emphasize that immediate action is needed to reduce greenhouse gas emissions and implement conservation strategies to protect vulnerable ecosystems before irreversible damage occurs.",
      mainIdea: "Climate change is causing widespread environmental damage requiring immediate action.",
      wrongOptions: [
        "Rising sea levels are the most serious effect of climate change.",
        "Animals are adapting to climate change by migrating to new areas."
      ],
      hint: "Consider what the entire passage is arguing about climate change and its effects.",
      explanation: "The passage describes various impacts of climate change across different ecosystems and concludes with the need for immediate action, making the overall argument about widespread damage requiring urgent response."
    },
    {
      text: "Learning a musical instrument offers numerous benefits beyond simply creating music. Studies have shown that music education improves cognitive abilities, including memory, attention span, and problem-solving skills. Students who play instruments often perform better in mathematics and language arts, as music training strengthens neural pathways used in these subjects. Additionally, playing an instrument builds discipline and patience, as mastering musical pieces requires consistent practice and dedication. Music also provides emotional benefits, offering a healthy outlet for stress and self-expression. Many successful adults credit their musical training with teaching them perseverance and time management skills that benefited them throughout their careers.",
      mainIdea: "Playing musical instruments provides cognitive, academic, and personal development benefits.",
      wrongOptions: [
        "Students who play instruments always perform better in mathematics.",
        "Music education primarily helps students become professional musicians."
      ],
      hint: "Look for the overarching theme about what music education provides to students.",
      explanation: "The passage presents multiple types of benefits from musical training: cognitive improvements, academic performance, discipline building, and emotional outlets."
    },
    {
      text: "The invention of the printing press in the 15th century revolutionized human communication and knowledge sharing. Before Johannes Gutenberg's movable type system, books were hand-copied by scribes, making them extremely expensive and rare. Only wealthy individuals and religious institutions could afford books, limiting literacy to a small portion of the population. The printing press made books affordable and widely available, leading to increased literacy rates across Europe. This democratization of knowledge contributed to major social movements, including the Protestant Reformation and the Scientific Revolution. Ideas could spread rapidly across countries, challenging traditional authority and encouraging critical thinking among ordinary citizens.",
      mainIdea: "The printing press democratized knowledge and transformed society.",
      wrongOptions: [
        "Johannes Gutenberg invented the first printing press in the 15th century.",
        "Books were very expensive before the printing press was invented."
      ],
      hint: "Focus on the broader impact of the printing press on society and knowledge sharing.",
      explanation: "While the passage mentions Gutenberg's invention and its historical context, the main point is how the printing press transformed society by making knowledge accessible to everyone, not just the wealthy."
    },
    {
      text: "Adolescence is a critical period for developing independence and personal identity. During the teenage years, young people begin to question authority and established rules as they form their own values and beliefs. This natural developmental process often creates tension between parents and teens, as adolescents seek more freedom while parents worry about their safety and decision-making abilities. Successful navigation of this stage requires open communication, clear boundaries, and gradual increases in responsibility. Parents who respect their teenager's growing autonomy while providing guidance and support help foster healthy development. Understanding that some conflict is normal and necessary for growth can help families maintain strong relationships during this challenging but important transition.",
      mainIdea: "Healthy adolescent development requires balancing independence with parental guidance.",
      wrongOptions: [
        "Teenagers naturally rebel against authority as part of growing up.",
        "Parents should give teenagers complete freedom to make their own decisions."
      ],
      hint: "Consider what the passage suggests about the best approach to teenage development.",
      explanation: "The passage acknowledges that teens seek independence but emphasizes that successful development comes from finding the right balance between freedom and guidance, not from conflict or complete autonomy."
    }
  ];


  // Update problem when currentQuestion changes
  useEffect(() => {
    console.log('🎯 MainIdea: currentQuestion useEffect triggered');
    
    if (currentQuestion) {
      console.log('🎯 MainIdea received external question:', currentQuestion);
      generateProblemFromQuestion(currentQuestion);
    } else {
      console.log('🎯 MainIdea: No external question, generating internal problem');
      generateNewProblem();
    }
  }, [currentQuestion]);

  // Generate problem from external question
  const generateProblemFromQuestion = (question: any) => {
    // Use the external question data if all required fields are provided
    if (question.passage && question.options && question.answer) {
      console.log('🎯 MainIdea: Using external question data');
      console.log('🎯 External options:', question.options);
      console.log('🎯 External answer:', question.answer);
      const problem: MainIdeaProblem = {
        passage: question.passage,
        question: question.question || "What is the main idea of this passage?",
        correctAnswer: question.answer,
        options: question.options,
        hint: question.hint || "Look for the overall message, not just specific details.",
        explanation: question.explanation || "The correct answer captures the central theme of the passage.",
        difficulty: 'intermediate'
      };
      
      console.log('🎯 Setting currentProblem with options:', problem.options);
      setCurrentProblem(problem);
    } else {
      // Fall back to internal passages only if external data is incomplete
      console.log('🎯 MainIdea: External data incomplete, using internal passage');
      const randomPassage = passages[Math.floor(Math.random() * passages.length)];
      
      const problem: MainIdeaProblem = {
        passage: randomPassage.text,
        question: "What is the main idea of this passage?",
        correctAnswer: randomPassage.mainIdea,
        options: [
          randomPassage.mainIdea,
          ...randomPassage.wrongOptions
        ].sort(() => Math.random() - 0.5),
        hint: randomPassage.hint,
        explanation: randomPassage.explanation,
        difficulty: 'intermediate'
      };
      
      setCurrentProblem(problem);
    }
    
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttempts(0);
    setShowHint(false);
    setShowExplanation(false);
  };

  // Generate a new problem
  const generateNewProblem = () => {
    const randomPassage = passages[Math.floor(Math.random() * passages.length)];
    
    const problem: MainIdeaProblem = {
      passage: randomPassage.text,
      question: "What is the main idea of this passage?",
      correctAnswer: randomPassage.mainIdea,
      options: [
        randomPassage.mainIdea,
        ...randomPassage.wrongOptions
      ].sort(() => Math.random() - 0.5),
      hint: randomPassage.hint,
      explanation: randomPassage.explanation,
      difficulty: 'intermediate'
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
      console.log('🎯 MainIdea: Correct answer! Calling onResult with letter:', selectedLetter);
      setShowExplanation(true);
      if (onResult) {
        onResult(selectedLetter);
      }
    } else {
      console.log('❌ MainIdea: Wrong answer. Expected letter:', correctLetter, 'Got letter:', selectedLetter);
      if (attempts >= 1) {
        setShowHint(true);
      }
    }
  };

  // Reset when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      console.log('🎯 Main Idea Interactive cleared');
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

  console.log('🎯 MainIdea Render - currentProblem:', currentProblem);
  console.log('🎯 MainIdea Render - options:', currentProblem?.options);

  return (
    <div className="w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-4 flex flex-col max-h-[500px]">
      {/* Header */}
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-1 flex items-center justify-center gap-2">
          <Target className="w-5 h-5 text-blue-600" />
          Main Idea Analysis (A.1)
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Read the passage and identify the main idea
        </p>
      </div>


      {/* Question */}
      {currentProblem && (
        <div className="text-center mb-3">
          <p className="text-base font-semibold text-gray-800 dark:text-white">
            {currentProblem.question}
          </p>
        </div>
      )}

      {/* Answer Options */}
      <div className="flex flex-col space-y-2 mb-3">
        {currentProblem?.options.map((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
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
                    : 'bg-blue-500 text-white border-blue-600'
                  : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800'
              }`}
              disabled={isCorrect === true}
            >
              <span className="font-bold text-blue-600 dark:text-blue-400 mr-2">{letter}.</span>
              {option}
            </button>
          );
        })}
      </div>

      {/* Hint */}
      {showHint && (
        <div className="mb-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
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