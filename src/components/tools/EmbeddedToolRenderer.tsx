// ================================================================
// EMBEDDED TOOL RENDERER
// Renders tools inline without modal overlay for split-screen layout
// ================================================================

import React, { useState } from 'react';
import { ToolType, AssignmentContext, ToolConfiguration } from './MasterToolInterface';
import { SimpleCalculator } from './SimpleCalculator';
import { GeoAlgebraCalculator } from './GeoAlgebraCalculator';
import { NumberLineInteractive } from './educational/NumberLineInteractive';
import { LetterIdentificationInteractive } from './educational/LetterIdentificationInteractive';
import { ShapeSortingInteractive } from './educational/ShapeSortingInteractive';
import { CommunityHelperInteractive } from './educational/CommunityHelperInteractive';
import { RulesAndLawsInteractive } from './educational/RulesAndLawsInteractive';
import { GrammarInteractive } from './educational/GrammarInteractive';
import { ReadingComprehensionInteractive } from './educational/ReadingComprehensionInteractive';
import { MainIdeaInteractive } from './educational/MainIdeaInteractive';
import { ScientificInquiryInteractive } from './educational/ScientificInquiryInteractive';
import { MapReadingInteractive } from './educational/MapReadingInteractive';
import { LatitudeLongitudeInteractive } from './educational/LatitudeLongitudeInteractive';

interface EmbeddedToolRendererProps {
  toolType: ToolType;
  assignment: AssignmentContext;
  configuration: ToolConfiguration;
  onInteraction: (action: string, data?: any) => void;
  onComplete: (results: any) => void;
  toolState: any;
  clearTrigger?: boolean;
  currentQuestion?: {
    question: string;
    answer: number;
    hint?: string;
    displayNumber?: number;
    questionType?: string;
  };
}

const EmbeddedToolRenderer: React.FC<EmbeddedToolRendererProps> = ({
  toolType,
  assignment,
  configuration,
  onInteraction,
  onComplete,
  toolState,
  clearTrigger,
  currentQuestion
}) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);

  // Get the tool URL from configuration with cache busting
  const baseUrl = configuration.parameters?.launchUrl || 'https://calculator-1.com/';
  
  // Add cache busting parameters to force fresh session
  const separator = baseUrl.includes('?') ? '&' : '?';
  const cacheKey = `t=${Date.now()}&session=${Math.random().toString(36).substring(7)}`;
  const toolUrl = `${baseUrl}${separator}${cacheKey}`;

  // Check tool type and render appropriate component
  const isCalculator = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('calculator') || 
     configuration.description?.toLowerCase().includes('calculator'));

  const isNumberLine = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('number line') || 
     configuration.description?.toLowerCase().includes('number line') ||
     configuration.toolName?.toLowerCase().includes('numberline') ||
     currentQuestion?.questionType === 'number_identification' ||
     configuration.description?.toLowerCase().includes('number identification') ||
     configuration.description?.toLowerCase().includes('what number is this'));

  const isLetterIdentification = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('letter identification') || 
     configuration.description?.toLowerCase().includes('letter identification') ||
     configuration.toolName?.toLowerCase().includes('letter') ||
     configuration.description?.toLowerCase().includes('alphabet'));

  const isShapeSorting = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('shape sorting') || 
     configuration.description?.toLowerCase().includes('shape sorting') ||
     configuration.toolName?.toLowerCase().includes('shape') ||
     configuration.description?.toLowerCase().includes('classify objects') ||
     configuration.description?.toLowerCase().includes('two-dimensional'));

  const isCommunityHelper = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('community helper') || 
     configuration.name?.toLowerCase().includes('community helper') ||
     configuration.description?.toLowerCase().includes('community helper') ||
     configuration.toolName?.toLowerCase().includes('community') ||
     configuration.name?.toLowerCase().includes('community') ||
     configuration.description?.toLowerCase().includes('what is a community') ||
     configuration.description?.toLowerCase().includes('social studies'));

  const isRulesAndLaws = toolType === 'generic' && 
    !isCommunityHelper && // Don't match if it's already identified as Community Helper
    (configuration.toolName?.toLowerCase().includes('rules and laws') || 
     configuration.description?.toLowerCase().includes('rules and laws') ||
     configuration.toolName?.toLowerCase().includes('rules') ||
     configuration.description?.toLowerCase().includes('basic rules') ||
     configuration.description?.toLowerCase().includes('safety'));

  const isMainIdea = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('main idea') || 
     configuration.description?.toLowerCase().includes('main idea') ||
     configuration.description?.toLowerCase().includes('determine the main idea') ||
     (configuration.description?.toLowerCase().includes('a.1') && 
      configuration.description?.toLowerCase().includes('ela')));

  const isReadingComprehension = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('reading') || 
     configuration.description?.toLowerCase().includes('reading') ||
     configuration.description?.toLowerCase().includes('passage') ||
     configuration.description?.toLowerCase().includes('comprehension')) &&
     !isMainIdea; // Exclude if it's specifically main idea

  const isGrammar = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('grammar') || 
     configuration.description?.toLowerCase().includes('grammar') ||
     configuration.toolName?.toLowerCase().includes('sentence') ||
     configuration.description?.toLowerCase().includes('sentence structure') ||
     configuration.description?.toLowerCase().includes('punctuation')) &&
     !isReadingComprehension && !isMainIdea; // Exclude if it's reading comprehension or main idea

  const isScientificInquiry = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('scientific inquiry') || 
     configuration.description?.toLowerCase().includes('scientific inquiry') ||
     configuration.description?.toLowerCase().includes('process of scientific inquiry') ||
     configuration.description?.toLowerCase().includes('scientific method') ||
     (configuration.description?.toLowerCase().includes('a.1') && 
      configuration.description?.toLowerCase().includes('science')));

  const isMapReading = toolType === 'generic' && 
    !isCommunityHelper && // Don't match if it's already identified as Community Helper
    !isRulesAndLaws && // Don't match if it's already identified as Rules and Laws
    (configuration.toolName?.toLowerCase().includes('map reading') || 
     configuration.description?.toLowerCase().includes('map reading') ||
     configuration.description?.toLowerCase().includes('read maps') ||
     configuration.description?.toLowerCase().includes('map skills') ||
     (configuration.description?.toLowerCase().includes('a.1') && 
      configuration.description?.toLowerCase().includes('social')));

  const isLatitudeLongitude = toolType === 'generic' && 
    (configuration.toolName?.toLowerCase().includes('latitude') || 
     configuration.toolName?.toLowerCase().includes('longitude') ||
     configuration.description?.toLowerCase().includes('latitude') ||
     configuration.description?.toLowerCase().includes('longitude') ||
     configuration.description?.toLowerCase().includes('coordinates') ||
     configuration.description?.toLowerCase().includes('use lines of latitude and longitude') ||
     (configuration.description?.toLowerCase().includes('a.2') && 
      configuration.description?.toLowerCase().includes('social')));

  if (isLatitudeLongitude) {
    console.log('🌍 Rendering LatitudeLongitudeInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[500px] landscape:max-h-[420px] sm:landscape:max-h-[450px]">
          <LatitudeLongitudeInteractive 
            onResult={(result) => {
              console.log('🌍 Latitude/Longitude result:', result);
              onInteraction?.('latitude_longitude_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isMapReading) {
    console.log('🗺️ Rendering MapReadingInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[500px] landscape:max-h-[420px] sm:landscape:max-h-[450px]">
          <MapReadingInteractive 
            onResult={(result) => {
              console.log('🗺️ Map Reading result:', result);
              onInteraction?.('map_reading_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isScientificInquiry) {
    console.log('🔬 Rendering ScientificInquiryInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[500px] landscape:max-h-[420px] sm:landscape:max-h-[450px]">
          <ScientificInquiryInteractive 
            onResult={(result) => {
              console.log('🔬 Scientific Inquiry result:', result);
              onInteraction?.('scientific_inquiry_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isMainIdea) {
    console.log('🎯 Rendering MainIdeaInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[500px] landscape:max-h-[420px] sm:landscape:max-h-[450px]">
          <MainIdeaInteractive 
            onResult={(result) => {
              console.log('🎯 Main Idea result:', result);
              onInteraction?.('main_idea_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isReadingComprehension) {
    console.log('📖 Rendering ReadingComprehensionInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <ReadingComprehensionInteractive 
            onResult={(result) => {
              console.log('📖 Reading Comprehension result:', result);
              onInteraction?.('reading_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isGrammar) {
    console.log('📝 Rendering GrammarInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <GrammarInteractive 
            onResult={(result) => {
              console.log('📝 Grammar result:', result);
              onInteraction?.('grammar_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isCommunityHelper) {
    console.log('🏘️ Rendering CommunityHelperInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <CommunityHelperInteractive 
            onResult={(result) => {
              console.log('🏘️ Community Helper result:', result);
              onInteraction?.('community_helper_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isRulesAndLaws) {
    console.log('🏛️ Rendering RulesAndLawsInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <RulesAndLawsInteractive 
            onResult={(result) => {
              console.log('🏛️ Rules and Laws result:', result);
              onInteraction?.('rules_and_laws_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isShapeSorting) {
    console.log('🔷 Rendering ShapeSortingInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <ShapeSortingInteractive 
            onResult={(result) => {
              console.log('🔷 Shape Sorting result:', result);
              onInteraction?.('shape_sorting_result', result);
            }}
            clearTrigger={clearTrigger}
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isLetterIdentification) {
    console.log('🔤 Rendering LetterIdentificationInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <LetterIdentificationInteractive 
            onResult={(result) => {
              console.log('🔤 Letter Identification result:', result);
              onInteraction?.('letter_identification_result', result);
            }}
            clearTrigger={clearTrigger}
            showCase="uppercase"
            currentQuestion={currentQuestion}
          />
        </div>
      </div>
    );
  }

  if (isNumberLine) {
    console.log('🔢 Rendering NumberLineInteractive tool');
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[400px] landscape:max-h-[380px] sm:landscape:max-h-[390px]">
          <NumberLineInteractive 
            onResult={(result) => {
              console.log('🔢 Number Line result:', result);
              onInteraction?.('number_line_result', result);
            }}
            clearTrigger={clearTrigger}
            maxNumber={10}
            showNumbers={true}
            problemType={currentQuestion?.questionType as any || "number_identification"}
            currentQuestion={currentQuestion}
            targetNumber={currentQuestion?.displayNumber || currentQuestion?.answer}
          />
        </div>
      </div>
    );
  }

  if (isCalculator) {
    // Extract grade level from assignment context
    const gradeLevel = assignment.gradeLevel || 'K';
    const numericGrade = parseInt(gradeLevel.replace(/[^0-9]/g, '')) || 0;
    
    // Use GeoAlgebra calculator for grades 9-12, SimpleCalculator for PreK-8
    const useAdvancedCalculator = numericGrade >= 9 || gradeLevel.includes('9') || gradeLevel.includes('10') || gradeLevel.includes('11') || gradeLevel.includes('12');
    
    console.log('🧮 Calculator selection:', { gradeLevel, numericGrade, useAdvancedCalculator });
    
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-2">
        <div className="w-full h-full max-h-[350px] landscape:max-h-[340px] sm:landscape:max-h-[350px]">
          {useAdvancedCalculator ? (
            <GeoAlgebraCalculator 
              onResult={(result) => {
                console.log('🧮 GeoAlgebra Calculator result:', result);
                onInteraction?.('calculator_result', result);
              }}
              clearTrigger={clearTrigger}
            />
          ) : (
            <SimpleCalculator 
              onResult={(result) => {
                console.log('🧮 Simple Calculator result:', result);
                onInteraction?.('calculator_result', result);
              }}
              clearTrigger={clearTrigger}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Loading State */}
      {!iframeLoaded && !iframeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading tool...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {iframeError && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-50 dark:bg-red-900/20">
          <div className="text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-600 dark:text-red-400 mb-4">
              Unable to load the tool
            </p>
            <button
              onClick={() => {
                setIframeError(false);
                setIframeLoaded(false);
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {/* Clean Tool Iframe - No Debug Headers */}
      <iframe
        key={toolUrl} // Force reload when URL changes
        src={toolUrl}
        className="w-full h-full border-0"
        title={`Practice Tool: ${configuration.toolName}`}
        onLoad={() => {
          setIframeLoaded(true);
          onInteraction?.('tool-loaded', { url: toolUrl });
        }}
        onError={() => {
          setIframeError(true);
          onInteraction?.('tool-error', { url: toolUrl });
        }}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-storage-access-by-user-activation"
        allow="fullscreen; microphone; camera"
        style={{ 
          width: '100%',
          height: '100%',
          border: 'none',
          background: 'transparent'
        }}
      />
    </div>
  );
};

export default EmbeddedToolRenderer;