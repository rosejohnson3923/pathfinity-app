/**
 * PATHFINITY AI CHARACTER AVATAR - UNIT TESTS
 * Comprehensive test suite for AI character avatar component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../testing/setupTests';
import { AICharacterAvatar } from '../ai/AICharacterAvatar';

// Mock Three.js components
jest.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="three-canvas">{children}</div>
  ),
  useFrame: jest.fn(),
  useLoader: jest.fn(() => ({}))
}));

jest.mock('@react-three/drei', () => ({
  useGLTF: jest.fn(() => ({
    scene: {},
    nodes: {},
    materials: {}
  })),
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Environment: () => <div data-testid="environment" />,
  PerspectiveCamera: () => <div data-testid="camera" />
}));

describe('AICharacterAvatar', () => {
  const defaultProps = {
    character: 'finn' as const,
    emotion: 'happy' as const,
    isAnimating: false,
    onClick: jest.fn(),
    size: 'medium' as const
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    test('should render character avatar successfully', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      expect(screen.getByTestId('ai-character-avatar')).toBeInTheDocument();
      expect(screen.getByTestId('three-canvas')).toBeInTheDocument();
    });

    test('should display character name', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      expect(screen.getByText('Finn')).toBeInTheDocument();
    });

    test('should apply correct CSS classes for character', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('character-finn');
    });

    test('should apply correct size classes', () => {
      const { rerender } = render(<AICharacterAvatar {...defaultProps} size="small" />);
      expect(screen.getByTestId('ai-character-avatar')).toHaveClass('size-small');

      rerender(<AICharacterAvatar {...defaultProps} size="large" />);
      expect(screen.getByTestId('ai-character-avatar')).toHaveClass('size-large');
    });
  });

  describe('Character Variations', () => {
    test('should render Finn with correct styling', () => {
      render(<AICharacterAvatar {...defaultProps} character="finn" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('character-finn');
      expect(screen.getByText('Finn')).toBeInTheDocument();
    });

    test('should render Sage with correct styling', () => {
      render(<AICharacterAvatar {...defaultProps} character="sage" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('character-sage');
      expect(screen.getByText('Sage')).toBeInTheDocument();
    });

    test('should render Spark with correct styling', () => {
      render(<AICharacterAvatar {...defaultProps} character="spark" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('character-spark');
      expect(screen.getByText('Spark')).toBeInTheDocument();
    });

    test('should render Harmony with correct styling', () => {
      render(<AICharacterAvatar {...defaultProps} character="harmony" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('character-harmony');
      expect(screen.getByText('Harmony')).toBeInTheDocument();
    });
  });

  describe('Emotions', () => {
    test('should apply happy emotion class', () => {
      render(<AICharacterAvatar {...defaultProps} emotion="happy" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('emotion-happy');
    });

    test('should apply thinking emotion class', () => {
      render(<AICharacterAvatar {...defaultProps} emotion="thinking" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('emotion-thinking');
    });

    test('should apply excited emotion class', () => {
      render(<AICharacterAvatar {...defaultProps} emotion="excited" />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('emotion-excited');
    });

    test('should apply neutral emotion by default', () => {
      render(<AICharacterAvatar {...defaultProps} emotion={undefined} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('emotion-neutral');
    });
  });

  describe('Animations', () => {
    test('should show animation indicator when isAnimating is true', () => {
      render(<AICharacterAvatar {...defaultProps} isAnimating={true} />);
      
      expect(screen.getByTestId('animation-indicator')).toBeInTheDocument();
    });

    test('should hide animation indicator when isAnimating is false', () => {
      render(<AICharacterAvatar {...defaultProps} isAnimating={false} />);
      
      expect(screen.queryByTestId('animation-indicator')).not.toBeInTheDocument();
    });

    test('should apply animation CSS class when animating', () => {
      render(<AICharacterAvatar {...defaultProps} isAnimating={true} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('is-animating');
    });

    test('should show speaking animation during interaction', () => {
      render(<AICharacterAvatar {...defaultProps} isAnimating={true} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('is-speaking');
    });
  });

  describe('Interactions', () => {
    test('should call onClick when avatar is clicked', () => {
      const onClickMock = jest.fn();
      render(<AICharacterAvatar {...defaultProps} onClick={onClickMock} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      fireEvent.click(avatar);
      
      expect(onClickMock).toHaveBeenCalledTimes(1);
    });

    test('should not call onClick when disabled', () => {
      const onClickMock = jest.fn();
      render(
        <AICharacterAvatar 
          {...defaultProps} 
          onClick={onClickMock} 
          disabled={true} 
        />
      );
      
      const avatar = screen.getByTestId('ai-character-avatar');
      fireEvent.click(avatar);
      
      expect(onClickMock).not.toHaveBeenCalled();
    });

    test('should show hover effect on mouse enter', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      fireEvent.mouseEnter(avatar);
      
      expect(avatar).toHaveClass('is-hovered');
    });

    test('should remove hover effect on mouse leave', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      fireEvent.mouseEnter(avatar);
      fireEvent.mouseLeave(avatar);
      
      expect(avatar).not.toHaveClass('is-hovered');
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA attributes', () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveAttribute('role', 'button');
      expect(avatar).toHaveAttribute('aria-label', 'Chat with Finn');
      expect(avatar).toHaveAttribute('tabIndex', '0');
    });

    test('should be keyboard accessible', () => {
      const onClickMock = jest.fn();
      render(<AICharacterAvatar {...defaultProps} onClick={onClickMock} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      
      // Simulate Enter key press
      fireEvent.keyDown(avatar, { key: 'Enter', code: 'Enter' });
      expect(onClickMock).toHaveBeenCalledTimes(1);
      
      // Simulate Space key press
      fireEvent.keyDown(avatar, { key: ' ', code: 'Space' });
      expect(onClickMock).toHaveBeenCalledTimes(2);
    });

    test('should indicate disabled state to screen readers', () => {
      render(<AICharacterAvatar {...defaultProps} disabled={true} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveAttribute('aria-disabled', 'true');
    });

    test('should announce emotion changes to screen readers', () => {
      const { rerender } = render(
        <AICharacterAvatar {...defaultProps} emotion="happy" />
      );
      
      rerender(<AICharacterAvatar {...defaultProps} emotion="thinking" />);
      
      expect(screen.getByTestId('emotion-announcement')).toHaveTextContent(
        'Finn is thinking'
      );
    });
  });

  describe('Performance', () => {
    test('should not re-render unnecessarily', () => {
      const renderSpy = jest.fn();
      const TestComponent = React.memo(() => {
        renderSpy();
        return <AICharacterAvatar {...defaultProps} />;
      });

      const { rerender } = render(<TestComponent />);
      
      // Re-render with same props
      rerender(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    test('should lazy load 3D models', async () => {
      render(<AICharacterAvatar {...defaultProps} />);
      
      // Should show loading state initially
      expect(screen.getByTestId('model-loading')).toBeInTheDocument();
      
      // Wait for model to load
      await waitFor(() => {
        expect(screen.queryByTestId('model-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('should show fallback when 3D model fails to load', async () => {
      // Mock Three.js loader to throw error
      const mockUseGLTF = require('@react-three/drei').useGLTF;
      mockUseGLTF.mockImplementation(() => {
        throw new Error('Model failed to load');
      });

      render(<AICharacterAvatar {...defaultProps} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('fallback-avatar')).toBeInTheDocument();
      });
    });

    test('should handle invalid character gracefully', () => {
      // TypeScript would prevent this, but test runtime behavior
      render(
        <AICharacterAvatar 
          {...defaultProps} 
          character={'invalid' as any} 
        />
      );
      
      // Should render with default character styling
      expect(screen.getByTestId('ai-character-avatar')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    test('should adapt to container size', () => {
      const { container } = render(
        <div style={{ width: '200px', height: '200px' }}>
          <AICharacterAvatar {...defaultProps} />
        </div>
      );
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('responsive');
    });

    test('should show simplified version on small screens', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 400
      });

      render(<AICharacterAvatar {...defaultProps} />);
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('simplified');
    });
  });

  describe('Integration with AI System', () => {
    test('should reflect current conversation state', () => {
      render(
        <AICharacterAvatar 
          {...defaultProps} 
          isAnimating={true} 
          emotion="thinking" 
        />
      );
      
      const avatar = screen.getByTestId('ai-character-avatar');
      expect(avatar).toHaveClass('is-animating');
      expect(avatar).toHaveClass('emotion-thinking');
    });

    test('should show typing indicator during AI response', () => {
      render(
        <AICharacterAvatar 
          {...defaultProps} 
          isAnimating={true} 
          showTyping={true} 
        />
      );
      
      expect(screen.getByTestId('typing-indicator')).toBeInTheDocument();
    });
  });
});