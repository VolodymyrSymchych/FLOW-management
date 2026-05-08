'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Ably from 'ably';
import { ChatClient, LogLevel } from '@ably/chat';
import { ChatClientProvider } from '@ably/chat/react';
import { AvatarProvider, ChatSettingsProvider } from '@ably/chat-react-ui-kit';

interface AblyChatContextValue {
  chatClient: ChatClient | null;
  realtimeClient: Ably.Realtime | null;
  isConnected: boolean;
}

const AblyChatContext = createContext<AblyChatContextValue>({
  chatClient: null,
  realtimeClient: null,
  isConnected: false,
});

export function AblyChatProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const chatRef = useRef<ChatClient | null>(null);
  const realtimeRef = useRef<Ably.Realtime | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authUrl: '/api/pusher/auth',
      authMethod: 'POST',
    });

    const chat = new ChatClient(realtime, { logLevel: LogLevel.Error });
    realtimeRef.current = realtime;
    chatRef.current = chat;
    forceRender((n) => n + 1);

    realtime.connection.on('connected', () => setIsConnected(true));
    realtime.connection.on('disconnected', () => setIsConnected(false));
    realtime.connection.on('suspended', () => setIsConnected(false));
    realtime.connection.on('failed', (err) => {
      console.error('[Ably] Connection failed:', err);
      setIsConnected(false);
    });

    return () => {
      realtime.close();
      realtimeRef.current = null;
      chatRef.current = null;
    };
  }, []);

  const value: AblyChatContextValue = {
    chatClient: chatRef.current,
    realtimeClient: realtimeRef.current,
    isConnected,
  };

  return (
    <AblyChatContext.Provider value={value}>
      {chatRef.current ? (
        <ChatClientProvider client={chatRef.current}>
          <AvatarProvider>
            <ChatSettingsProvider>
              {children}
            </ChatSettingsProvider>
          </AvatarProvider>
        </ChatClientProvider>
      ) : (
        children
      )}
    </AblyChatContext.Provider>
  );
}

export function useAblyChat() {
  return useContext(AblyChatContext);
}
