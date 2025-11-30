import { useEffect, useState, useRef } from 'react';
import Pusher from 'pusher-js';
import { getToken } from '@/lib/auth-client';

let pusherInstance: Pusher | null = null;

export function usePusher() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (pusherInstance) {
      setIsConnected(pusherInstance.connection.state === 'connected');
      return;
    }

    const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
    const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'eu';

    if (!pusherKey) {
      console.warn('Pusher key not configured');
      return;
    }

    pusherInstance = new Pusher(pusherKey, {
      cluster: pusherCluster,
      authEndpoint: '/api/pusher/auth',
      auth: {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    });

    pusherInstance.connection.bind('connected', () => {
      setIsConnected(true);
      console.log('Pusher connected');
    });

    pusherInstance.connection.bind('disconnected', () => {
      setIsConnected(false);
      console.log('Pusher disconnected');
    });

    pusherInstance.connection.bind('error', (error: any) => {
      console.error('Pusher error:', error);
    });

    return () => {
      if (pusherInstance) {
        pusherInstance.disconnect();
        pusherInstance = null;
      }
    };
  }, []);

  return { pusher: pusherInstance, isConnected };
}

export function getPusherInstance() {
  return pusherInstance;
}

