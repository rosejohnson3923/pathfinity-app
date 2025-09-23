/**
 * Chat WebSocket Service
 * Manages real-time WebSocket connection for live chat
 */

class ChatWebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private messageQueue: any[] = [];
  private statusListeners: ((status: 'connected' | 'disconnected' | 'reconnecting') => void)[] = [];
  private messageListeners: ((message: any) => void)[] = [];

  constructor() {
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
  }

  /**
   * Connect to WebSocket server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Get WebSocket URL from environment or use default
        const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:3002';

        // Get session ID for connection
        const sessionId = sessionStorage.getItem('sessionId') || this.generateSessionId();
        sessionStorage.setItem('sessionId', sessionId);

        // Create WebSocket connection with correct path
        this.ws = new WebSocket(`${wsUrl}/ws/chat?session=${sessionId}`);

        // Connection opened
        this.ws.onopen = () => {
          console.log('✅ Chat WebSocket connected');
          this.reconnectAttempts = 0;
          this.notifyStatusChange('connected');

          // Send any queued messages
          this.flushMessageQueue();

          resolve();
        };

        // Message received
        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.notifyMessageListeners(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        // Connection closed
        this.ws.onclose = () => {
          console.log('❌ Chat WebSocket disconnected');
          this.notifyStatusChange('disconnected');
          this.attemptReconnect();
        };

        // Connection error
        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.notifyStatusChange('disconnected');
  }

  /**
   * Send message through WebSocket
   */
  sendMessage(message: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      // Queue message if not connected
      this.messageQueue.push(message);
      console.log('Message queued (WebSocket not ready):', message);
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    this.notifyStatusChange('reconnecting');

    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    console.log(`Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      this.sendMessage(message);
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Subscribe to status changes
   */
  onStatusChange(listener: (status: 'connected' | 'disconnected' | 'reconnecting') => void): void {
    this.statusListeners.push(listener);
  }

  /**
   * Subscribe to messages
   */
  onMessage(listener: (message: any) => void): void {
    this.messageListeners.push(listener);
  }

  /**
   * Notify status listeners
   */
  private notifyStatusChange(status: 'connected' | 'disconnected' | 'reconnecting'): void {
    this.statusListeners.forEach(listener => listener(status));
  }

  /**
   * Notify message listeners
   */
  private notifyMessageListeners(message: any): void {
    this.messageListeners.forEach(listener => listener(message));
  }

  /**
   * Get connection state
   */
  get isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Export singleton instance
export const chatWebSocketService = new ChatWebSocketService();