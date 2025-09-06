/**
 * AI CHARACTER PROVIDER TESTS
 * Comprehensive testing for Azure OpenAI character integration
 */

import React from 'react';
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AICharacterProvider, useAICharacter } from '../AICharacterProvider';
import { azureOpenAIService } from '../../../services/azureOpenAIService';

// Mock Azure OpenAI Service
vi.mock('../../../services/azureOpenAIService', () => ({
  azureOpenAIService: {
    getAllCharacters: vi.fn(),
    getCharacter: vi.fn(),
    getCharactersForContext: vi.fn(),
    generateCharacterContent: vi.fn(),
    performContentSafetyCheck: vi.fn()
  }
}));

// Mock Voice Manager Service
vi.mock('../../../services/voiceManagerService', () => ({
  voiceManagerService: {
    generateAndSpeak: vi.fn()
  }
}));

// Test component that uses the hook
const TestComponent = () => {
  const {
    currentCharacter,
    availableCharacters,
    selectCharacter,
    generateCharacterResponse,
    isContentSafe,
    isLoading,
    error
  } = useAICharacter();

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="error">{error || 'no-error'}</div>
      <div data-testid="current-character">
        {currentCharacter?.name || 'no-character'}
      </div>
      <div data-testid="available-count">{availableCharacters.length}</div>
      
      <button 
        data-testid="select-sage"
        onClick={() => selectCharacter('sage')}
      >
        Select Sage
      </button>
      
      <button
        data-testid="generate-response"
        onClick={() => generateCharacterResponse('Hello!')}
      >
        Generate Response
      </button>
      
      <button
        data-testid="check-safety"
        onClick={() => isContentSafe('Hello world', 'K')}
      >
        Check Safety
      </button>
    </div>
  );
};

const mockCharacters = [
  {
    id: 'finn',
    name: 'Finn the Explorer',
    personality: 'Curious and adventurous',
    voiceStyle: { tone: 'friendly', pace: 'normal', pitch: 'normal' },
    specialties: ['career_exploration', 'science'],
    ageGroups: ['K', '1', '2', '3'],
    safetyPrompt: 'Always maintain age-appropriate language'
  },
  {
    id: 'sage',
    name: 'Sage the Wise',
    personality: 'Calm and patient',
    voiceStyle: { tone: 'calm', pace: 'slow', pitch: 'low' },
    specialties: ['mathematics', 'problem_solving'],
    ageGroups: ['K', '1', '2', '3', '4', '5'],
    safetyPrompt: 'Use simple language and break down concepts'
  }
];

describe('AICharacterProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    (azureOpenAIService.getAllCharacters as any).mockReturnValue(mockCharacters);
    (azureOpenAIService.getCharacter as any).mockImplementation((id: string) => 
      mockCharacters.find(c => c.id === id) || null
    );
    (azureOpenAIService.getCharactersForContext as any).mockReturnValue([mockCharacters[0]]);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  test('initializes with default character', async () => {
    render(
      <AICharacterProvider defaultCharacterId="finn" studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    expect(screen.getByTestId('current-character')).toHaveTextContent('Finn the Explorer');
    expect(screen.getByTestId('available-count')).toHaveTextContent('2');
    expect(screen.getByTestId('error')).toHaveTextContent('no-error');
  });

  test('selects character by ID', async () => {
    render(
      <AICharacterProvider studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    fireEvent.click(screen.getByTestId('select-sage'));

    await waitFor(() => {
      expect(screen.getByTestId('current-character')).toHaveTextContent('Sage the Wise');
    });
  });

  test('generates character response', async () => {
    const mockResponse = {
      message: 'Hello, young learner!',
      emotion: 'friendly',
      educationalPoints: ['greeting', 'encouragement'],
      character: mockCharacters[0],
      _safety: { isAppropriate: true, coppaCompliant: true, concerns: [] }
    };

    (azureOpenAIService.generateCharacterContent as any).mockResolvedValue(mockResponse);

    render(
      <AICharacterProvider defaultCharacterId="finn" studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    fireEvent.click(screen.getByTestId('generate-response'));

    await waitFor(() => {
      expect(azureOpenAIService.generateCharacterContent).toHaveBeenCalledWith(
        'finn',
        'Hello!',
        'K',
        { requiresSafetyCheck: true, includeVoiceMetadata: true }
      );
    });
  });

  test('handles content safety check', async () => {
    const mockSafetyResult = {
      isAppropriate: true,
      coppaCompliant: true,
      concerns: []
    };

    (azureOpenAIService.performContentSafetyCheck as any).mockResolvedValue(mockSafetyResult);

    render(
      <AICharacterProvider studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    fireEvent.click(screen.getByTestId('check-safety'));

    await waitFor(() => {
      expect(azureOpenAIService.performContentSafetyCheck).toHaveBeenCalledWith(
        'Hello world',
        'K'
      );
    });
  });

  test('handles Azure service errors gracefully', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (azureOpenAIService.getAllCharacters as any).mockImplementation(() => {
      throw new Error('Azure service unavailable');
    });

    render(
      <AICharacterProvider studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Failed to initialize AI characters');
    });

    consoleError.mockRestore();
  });

  test('recommends appropriate character for grade and subject', async () => {
    const mathCharacters = [mockCharacters[1]]; // Sage for math
    (azureOpenAIService.getCharactersForContext as any).mockReturnValue(mathCharacters);

    render(
      <AICharacterProvider studentGrade="3" studentSubject="Math">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    expect(azureOpenAIService.getCharactersForContext).toHaveBeenCalledWith('3', 'Math');
    expect(screen.getByTestId('current-character')).toHaveTextContent('Sage the Wise');
  });

  test('handles character response errors', async () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    (azureOpenAIService.generateCharacterContent as any).mockRejectedValue(
      new Error('Content generation failed')
    );

    render(
      <AICharacterProvider defaultCharacterId="finn" studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    fireEvent.click(screen.getByTestId('generate-response'));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Finn the Explorer couldn\'t respond: Content generation failed'
      );
    });

    consoleError.mockRestore();
  });

  test('fails safe when safety check fails', async () => {
    (azureOpenAIService.performContentSafetyCheck as any).mockRejectedValue(
      new Error('Safety check failed')
    );

    const TestSafetyComponent = () => {
      const { isContentSafe } = useAICharacter();
      const [safetyResult, setSafetyResult] = React.useState<boolean | null>(null);

      const checkSafety = async () => {
        const result = await isContentSafe('test content', 'K');
        setSafetyResult(result);
      };

      return (
        <div>
          <button onClick={checkSafety} data-testid="check-safety">
            Check Safety
          </button>
          <div data-testid="safety-result">
            {safetyResult === null ? 'not-checked' : safetyResult ? 'safe' : 'unsafe'}
          </div>
        </div>
      );
    };

    render(
      <AICharacterProvider studentGrade="K">
        <TestSafetyComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('safety-result')).toHaveTextContent('not-checked');
    });

    fireEvent.click(screen.getByTestId('check-safety'));

    await waitFor(() => {
      // Should fail safe to 'unsafe' when safety check fails
      expect(screen.getByTestId('safety-result')).toHaveTextContent('unsafe');
    });
  });
});

describe('AICharacterProvider Edge Cases', () => {
  test('throws error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAICharacter must be used within AICharacterProvider');

    consoleError.mockRestore();
  });

  test('handles empty character list', async () => {
    (azureOpenAIService.getAllCharacters as any).mockReturnValue([]);
    (azureOpenAIService.getCharactersForContext as any).mockReturnValue([]);

    render(
      <AICharacterProvider studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('current-character')).toHaveTextContent('no-character');
      expect(screen.getByTestId('available-count')).toHaveTextContent('0');
    });
  });

  test('handles invalid character selection', async () => {
    render(
      <AICharacterProvider studentGrade="K">
        <TestComponent />
      </AICharacterProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('ready');
    });

    const TestInvalidSelection = () => {
      const { selectCharacter } = useAICharacter();
      return (
        <button onClick={() => selectCharacter('nonexistent')}>
          Select Invalid
        </button>
      );
    };

    const { rerender } = render(
      <AICharacterProvider studentGrade="K">
        <TestInvalidSelection />
      </AICharacterProvider>
    );

    // Should not crash when selecting invalid character
    fireEvent.click(screen.getByText('Select Invalid'));
    
    // Component should still render without errors
    expect(screen.getByText('Select Invalid')).toBeInTheDocument();
  });
});