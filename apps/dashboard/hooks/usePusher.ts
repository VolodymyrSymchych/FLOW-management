import { useEffect, useRef, useState } from 'react';
import Ably from 'ably';

let ablyClient: Ably.Realtime | null = null;

export function usePusher() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (ablyClient) {
      setIsConnected(ablyClient.connection.state === 'connected');
      return;
    }

    const ablyKey = process.env.NEXT_PUBLIC_ABLY_KEY;
    if (!ablyKey) {
      console.warn('Ably key not configured (NEXT_PUBLIC_ABLY_KEY)');
      return;
    }

    ablyClient = new Ably.Realtime({
      key: ablyKey,
      authUrl: '/api/pusher/auth',
    });

    ablyClient.connection.on('connected', () => setIsConnected(true));
    ablyClient.connection.on('disconnected', () => setIsConnected(false));
    ablyClient.connection.on('failed', (err) => console.error('Ably error:', err));

    return () => {
      ablyClient?.close();
      ablyClient = null;
    };
  }, []);

  return { pusher: ablyClient as unknown, isConnected };
}

export function getPusherInstance() {
  return ablyClient;
}

