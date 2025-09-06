/**
 * AI CHARACTER SELECTOR
 * Age-progressive character selection interface with grade-appropriate complexity
 * Allows students to choose their AI learning companion
 */

import React, { useState } from 'react';
import { useAICharacter } from './AICharacterProvider';
import { AICharacterAvatar } from './AICharacterAvatar';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Users, Star, Sparkles, Volume2 } from 'lucide-react';
import styles from '../../styles/shared/components/CompanionDisplay.module.css';

interface AICharacterSelectorProps {
  studentGrade?: string;
  subject?: string;
  onCharacterSelected?: (characterId: string) => void;
  showRecommendations?: boolean;
  compactMode?: boolean;
  className?: string;
}

export const AICharacterSelector: React.FC<AICharacterSelectorProps> = ({
  studentGrade = 'K',
  subject = 'Math',
  onCharacterSelected,
  showRecommendations = true,
  compactMode = false,
  className = ''
}) => {
  const {
    currentCharacter,
    availableCharacters,
    selectCharacter,
    getRecommendedCharacter,
    speakMessage,
    isLoading
  } = useAICharacter();

  const [previewingCharacter, setPreviewingCharacter] = useState<string | null>(null);

  // Age-progressive complexity
  const getGradeComplexity = (grade: string): 'simple' | 'medium' | 'advanced' => {
    const gradeLevel = grade?.toUpperCase() || 'K';
    
    if (['PREK', 'PRE-K', 'K', '1', '2'].includes(gradeLevel)) {
      return 'simple';
    } else if (['3', '4', '5', '6'].includes(gradeLevel)) {
      return 'medium';
    } else {
      return 'advanced';
    }
  };

  const complexity = getGradeComplexity(studentGrade);
  const recommendedCharacter = showRecommendations ? getRecommendedCharacter(studentGrade, subject) : null;

  // Debug logging and safety filtering
  console.log('🔍 AICharacterSelector - availableCharacters:', availableCharacters);
  console.log('🔍 AICharacterSelector - characters count:', availableCharacters?.length || 0);
  
  // Filter out any undefined or invalid characters
  const validCharacters = (availableCharacters || []).filter(character => 
    character && 
    character.id && 
    character.name && 
    typeof character === 'object'
  );
  
  console.log('🔍 AICharacterSelector - valid characters:', validCharacters);
  console.log('🔍 AICharacterSelector - valid count:', validCharacters.length);
  
  // If no valid characters, show loading or error state
  if (validCharacters.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500 dark:text-gray-400">
          {isLoading ? 'Loading AI characters...' : 'No AI characters available'}
        </div>
      </div>
    );
  }

  const handleCharacterSelect = (characterId: string) => {
    selectCharacter(characterId);
    onCharacterSelected?.(characterId);
  };

  const handlePreviewCharacter = async (characterId: string) => {
    setPreviewingCharacter(characterId);
    
    try {
      const character = availableCharacters.find(c => c.id === characterId);
      if (character) {
        const greetingMessage = getCharacterGreeting(character.id, complexity);
        await speakMessage(greetingMessage, characterId);
      }
    } catch (error) {
      console.error('Failed to preview character:', error);
    } finally {
      setTimeout(() => setPreviewingCharacter(null), 2000);
    }
  };

  const getCharacterGreeting = (characterId: string, complexity: 'simple' | 'medium' | 'advanced'): string => {
    const greetings = {
      simple: {
        finn: "Hi! I'm Finn! Let's explore together!",
        sage: "Hello! I'm Sage. I love helping with math!",
        spark: "Hey there! I'm Spark! Ready to be creative?",
        harmony: "Hi friend! I'm Harmony. Let's learn about our community!"
      },
      medium: {
        finn: "Hello! I'm Finn the Explorer. I'm excited to discover new things with you!",
        sage: "Greetings! I'm Sage the Wise. I'm here to help you solve problems step by step.",
        spark: "Hey there! I'm Spark the Creative. Let's make learning fun and imaginative!",
        harmony: "Hello! I'm Harmony the Helper. I'm here to support your learning journey."
      },
      advanced: {
        finn: "Welcome! I'm Finn the Explorer. I specialize in career exploration and scientific discovery. Ready to embark on an educational adventure?",
        sage: "Greetings, young scholar! I'm Sage the Wise. I excel in mathematics and analytical thinking. Let's tackle challenging problems together.",
        spark: "Hello, creative mind! I'm Spark the Creative. I love language arts and storytelling. Let's unleash your imagination!",
        harmony: "Welcome! I'm Harmony the Helper. I focus on social studies and community engagement. Let's explore how we can make a positive impact."
      }
    };
    
    return greetings[complexity][characterId as keyof typeof greetings.simple] || 
           greetings.simple[characterId as keyof typeof greetings.simple] ||
           "Hello! I'm here to help you learn!";
  };

  const getCharacterSpecialtiesBadges = (character: any, complexity: 'simple' | 'medium' | 'advanced') => {
    if (complexity === 'simple') return null;
    
    const maxBadges = complexity === 'medium' ? 2 : 3;
    const specialties = character.specialties.slice(0, maxBadges);
    
    return (
      <div className="flex flex-wrap gap-1 mt-2">
        {specialties.map((specialty: string, index: number) => (
          <Badge key={index} variant="secondary" className="text-xs">
            {specialty.replace('_', ' ')}
          </Badge>
        ))}
      </div>
    );
  };

  const getRecommendationBadge = (characterId: string) => {
    if (!showRecommendations || !recommendedCharacter || recommendedCharacter.id !== characterId) {
      return null;
    }
    
    return (
      <div className="absolute -top-2 -right-2 z-10">
        <Badge variant="default" className="bg-yellow-500 text-white animate-pulse">
          <Star className="w-3 h-3 mr-1" />
          {complexity === 'simple' ? 'Best' : 'Recommended'}
        </Badge>
      </div>
    );
  };

  const getAgeAppropriateLayout = () => {
    if (compactMode) {
      return (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {validCharacters.map((character) => (
            <div key={character.id} className="relative flex-shrink-0">
              {getRecommendationBadge(character.id)}
              <AICharacterAvatar
                character={character}
                size="small"
                showName={true}
                isActive={currentCharacter?.id === character.id}
                isSpeaking={previewingCharacter === character.id}
                studentGrade={studentGrade}
                onClick={() => handleCharacterSelect(character.id)}
              />
            </div>
          ))}
        </div>
      );
    }

    if (complexity === 'simple') {
      // Simple grid layout for K-2
      return (
        <div className="grid grid-cols-2 gap-4">
          {validCharacters.map((character) => (
            <Card key={character.id} className="relative p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              {getRecommendationBadge(character.id)}
              <AICharacterAvatar
                character={character}
                size="large"
                showName={false}
                isActive={currentCharacter?.id === character.id}
                isSpeaking={previewingCharacter === character.id}
                studentGrade={studentGrade}
                onClick={() => handleCharacterSelect(character.id)}
              />
              <h3 className="mt-3 text-lg font-semibold">{character.name.split(' ')[0]}</h3>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePreviewCharacter(character.id);
                }}
                className="mt-2"
              >
                <Volume2 className="w-4 h-4 mr-1" />
                Say Hi
              </Button>
            </Card>
          ))}
        </div>
      );
    }

    // Detailed layout for older students
    return (
      <div className="space-y-4">
        {validCharacters.map((character) => (
          <Card key={character.id} className="relative p-4 hover:shadow-lg transition-shadow">
            {getRecommendationBadge(character.id)}
            
            <div className="flex items-start space-x-4">
              <AICharacterAvatar
                character={character}
                size="medium"
                showName={false}
                isActive={currentCharacter?.id === character.id}
                isSpeaking={previewingCharacter === character.id}
                studentGrade={studentGrade}
                onClick={() => handleCharacterSelect(character.id)}
              />
              
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{character.name}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {Array.isArray(character.personality) 
                    ? character.personality[0] 
                    : character.personality?.toString().split('.')[0] || 'Helpful companion'
                  }
                </p>
                
                {getCharacterSpecialtiesBadges(character, complexity)}
                
                <div className="flex space-x-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleCharacterSelect(character.id)}
                    disabled={currentCharacter?.id === character.id}
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {currentCharacter?.id === character.id ? 'Selected' : 'Choose'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handlePreviewCharacter(character.id)}
                    disabled={previewingCharacter === character.id}
                  >
                    <Volume2 className="w-4 h-4 mr-1" />
                    {previewingCharacter === character.id ? 'Speaking...' : 'Preview'}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <Sparkles className="w-8 h-8 mx-auto animate-spin text-blue-500" />
        <p className="mt-2 text-gray-600">Loading AI characters...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {!compactMode && (
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            {complexity === 'simple' ? 'Choose Your Learning Friend!' : 
             complexity === 'medium' ? 'Select Your AI Learning Companion' :
             'Choose Your AI Educational Mentor'}
          </h2>
          <p className="text-gray-600 mt-2">
            {complexity === 'simple' ? 'Pick someone to help you learn!' :
             complexity === 'medium' ? 'Each character has special skills to help you learn better.' :
             'Each AI character specializes in different subjects and learning approaches.'}
          </p>
        </div>
      )}

      {getAgeAppropriateLayout()}

      {showRecommendations && recommendedCharacter && !compactMode && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-2" />
            <p className="text-sm">
              <span className="font-semibold">{recommendedCharacter.name}</span> is recommended for Grade {studentGrade} {subject}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};