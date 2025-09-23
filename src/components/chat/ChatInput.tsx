/**
 * ChatInput Component
 * Input area for sending messages with text and voice support
 */

import React, { useState, useRef, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Paperclip, Smile } from 'lucide-react';
import styles from '../../styles/chat/ChatInput.module.css';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  voiceMode: boolean;
  onToggleVoice: () => void;
  disabled?: boolean;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  voiceMode,
  onToggleVoice,
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Handle send message
  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      inputRef.current?.focus();
    }
  };

  // Handle Enter key press
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize logic
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  // Handle voice recording (placeholder - will connect to Whisper)
  const handleVoiceToggle = () => {
    if (!disabled) {
      setIsRecording(!isRecording);
      onToggleVoice();
      // TODO: Implement actual voice recording with Whisper
      console.log('Voice recording:', !isRecording ? 'started' : 'stopped');
    }
  };

  // Handle file attachment (future feature)
  const handleAttachment = () => {
    if (!disabled) {
      console.log('File attachment clicked - future feature');
      // TODO: Implement file attachment for images
    }
  };

  return (
    <div className={styles.chatInput}>
      <div className={styles.inputContainer}>
        {/* Attachment button (future) */}
        <button
          className={styles.inputButton}
          onClick={handleAttachment}
          disabled={disabled}
          aria-label="Attach file"
          title="Attach file (coming soon)"
        >
          <Paperclip size={20} />
        </button>

        {/* Text input */}
        <textarea
          ref={inputRef}
          className={styles.textInput}
          value={message}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          aria-label="Chat message input"
        />

        {/* Voice button */}
        <button
          className={`${styles.inputButton} ${isRecording ? styles.recording : ''}`}
          onClick={handleVoiceToggle}
          disabled={disabled}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
          title={isRecording ? 'Stop recording' : 'Start voice input'}
        >
          {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
        </button>

        {/* Send button */}
        <button
          className={`${styles.sendButton} ${message.trim() ? styles.canSend : ''}`}
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          aria-label="Send message"
          title="Send message"
        >
          <Send size={20} />
        </button>
      </div>

      {/* Voice recording indicator */}
      {isRecording && (
        <div className={styles.recordingIndicator}>
          <span className={styles.recordingDot}></span>
          <span>Recording... Click microphone to stop</span>
        </div>
      )}
    </div>
  );
};

export default ChatInput;