/**
 * WebSocket client for real-time chat communication
 * Falls back to polling if WebSocket is not available
 */

export type MessageType = 
  | 'message'
  | 'message_sent'
  | 'message_updated'
  | 'message_deleted'
  | 'reaction_added'
  | 'reaction_removed'
  | 'typing'
  | 'user_joined'
  | 'user_left'
  | 'error';

export interface WebSocketMessage {
  type: MessageType;
  chatId?: number;
  message?: any;
  reaction?: any;
  userId?: number;
  error?: string;
  data?: any;
}

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<MessageType, Set<(data: any) => void>> = new Map();
  private isConnecting = false;
  private userId: number | null = null;
  private token: string | null = null;

  constructor(userId: number, token: string) {
    this.userId = userId;
    this.token = token;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 
          (typeof window !== 'undefined' 
            ? `ws://${window.location.hostname}:${window.location.port === '3001' ? '3002' : '3001'}/ws`
            : 'ws://localhost:3002/ws');

        this.ws = new WebSocket(`${wsUrl}?userId=${this.userId}&token=${this.token}`);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket disconnected');
          this.isConnecting = false;
          this.ws = null;
          this.attemptReconnect();
        };
      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch(() => {
        // Reconnection will be attempted again
      });
    }, delay);
  }

  private handleMessage(message: WebSocketMessage) {
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(listener => listener(message));
    }

    // Also trigger generic listeners
    const allListeners = this.listeners.get('message' as MessageType);
    if (allListeners) {
      allListeners.forEach(listener => listener(message));
    }
  }

  on(type: MessageType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  send(type: MessageType, data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, ...data }));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  joinChat(chatId: number) {
    this.send('message', { action: 'join_chat', chatId });
  }

  leaveChat(chatId: number) {
    this.send('message', { action: 'leave_chat', chatId });
  }

  sendTyping(chatId: number) {
    this.send('typing', { chatId });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.listeners.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Polling fallback for when WebSocket is not available
export class ChatPolling {
  private intervalId: NodeJS.Timeout | null = null;
  private listeners: Map<MessageType, Set<(data: any) => void>> = new Map();
  private lastMessageId: Map<number, number> = new Map();
  private chatIds: Set<number> = new Set();
  private pollingInterval = 2000; // 2 seconds

  constructor(private userId: number, private apiUrl: string) {}

  start() {
    if (this.intervalId) {
      return;
    }

    this.intervalId = setInterval(() => {
      this.poll();
    }, this.pollingInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private async poll() {
    for (const chatId of Array.from(this.chatIds)) {
      try {
        const response = await fetch(
          `${this.apiUrl}/api/chat/${chatId}/messages?limit=1`,
          {
            credentials: 'include',
          }
        );

        if (response.ok) {
          const data = await response.json();
          const messages = data.messages || [];
          
          if (messages.length > 0) {
            const latestMessage = messages[messages.length - 1];
            const lastId = this.lastMessageId.get(chatId) || 0;

            if (latestMessage.id > lastId) {
              this.lastMessageId.set(chatId, latestMessage.id);
              
              // Notify listeners
              const listeners = this.listeners.get('message');
              if (listeners) {
                listeners.forEach(listener => 
                  listener({
                    type: 'message',
                    chatId,
                    message: latestMessage,
                  })
                );
              }
            }
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }
  }

  watchChat(chatId: number) {
    this.chatIds.add(chatId);
    if (!this.intervalId) {
      this.start();
    }
  }

  unwatchChat(chatId: number) {
    this.chatIds.delete(chatId);
    this.lastMessageId.delete(chatId);
    if (this.chatIds.size === 0 && this.intervalId) {
      this.stop();
    }
  }

  on(type: MessageType, callback: (data: any) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      const listeners = this.listeners.get(type);
      if (listeners) {
        listeners.delete(callback);
      }
    };
  }

  destroy() {
    this.stop();
    this.listeners.clear();
    this.chatIds.clear();
    this.lastMessageId.clear();
  }
}

