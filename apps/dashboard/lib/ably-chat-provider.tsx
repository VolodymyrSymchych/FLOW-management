'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import Ably from 'ably';
import { ChatClient, LogLevel } from '@ably/chat';

interface AblyChatContextValue {
  chatClient: ChatClient | null;
  isConnected: boolean;
}

const AblyChatContext = createContext<AblyChatContextValue>({
  chatClient: null,
  isConnected: false,
});

export function AblyChatProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const clientRef = useRef<ChatClient | null>(null);
  const [, forceRender] = useState(0);

  useEffect(() => {
    const realtime = new Ably.Realtime({
      authUrl: '/api/pusher/auth',
      authMethod: 'POST',
    });

    const chat = new ChatClient(realtime, { logLevel: LogLevel.Error });
    clientRef.current = chat;
    forceRender((n) => n + 1);

    realtime.connection.on('connected', () => setIsConnected(true));
    realtime.connection.on('disconnected', () => setIsConnected(false));
    realtime.connection.on('failed', () => setIsConnected(false));

    return () => {
      realtime.close();
      clientRef.current = null;
    };
  }, []);

  return (
    <AblyChatContext.Provider value={{ chatClient: clientRef.current, isConnected }}>
      {children}
    </AblyChatContext.Provider>
  );
}

export function useAblyChat() {
  return useContext(AblyChatContext);
}
