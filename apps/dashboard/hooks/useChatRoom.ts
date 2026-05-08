'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessageEventType, PresenceEventType, type Room } from '@ably/chat';
import { useAblyChat } from '@/lib/ably-chat-provider';

export interface ChatMessage {
  id: string;
  chatId: number;
  text: string;
  clientId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface UseChatRoomOptions {
  chatId: number;
  onNewMessage?: (msg: ChatMessage) => void;
  onMessageUpdated?: (msg: ChatMessage) => void;
  onMessageDeleted?: (msgId: string) => void;
  onTyping?: (clientIds: string[]) => void;
  onPresenceChange?: (clientId: string, action: 'enter' | 'leave') => void;
}

function toMessage(raw: unknown, chatId: number): ChatMessage {
  const m = raw as Record<string, unknown>;
  return {
    id: m.serial as string ?? m.id as string,
    chatId,
    text: m.text as string,
    clientId: m.clientId as string,
    timestamp: (m.timestamp as number) ?? Date.now(),
    metadata: m.metadata as Record<string, unknown> | undefined,
  };
}

export function useChatRoom(options: UseChatRoomOptions) {
  const { chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onTyping, onPresenceChange } = options;
  const { chatClient, isConnected } = useAblyChat();
  const roomRef = useRef<Room | null>(null);
  const roomReadyRef = useRef(false);
  const [roomReady, setRoomReady] = useState(false);
  const [onlineClientIds, setOnlineClientIds] = useState(new Set<string>());

  useEffect(() => {
    if (!chatClient) return;

    let cancelled = false;

    (async () => {
      const roomId = `chat-${chatId}`;

      try {
        const room = await chatClient.rooms.get(roomId);
        if (cancelled) return;
        roomRef.current = room;

        // Messages
        room.messages.subscribe((event) => {
          const msg = toMessage(event.message, chatId);
          if (event.type === ChatMessageEventType.Created) onNewMessage?.(msg);
          else if (event.type === ChatMessageEventType.Updated) onMessageUpdated?.(msg);
          else if (event.type === ChatMessageEventType.Deleted) onMessageDeleted?.(msg.id);
        });

        // Typing
        room.typing.subscribe((event) => {
          onTyping?.(Array.from(event.currentlyTyping as Set<string>));
        });

        // Presence
        room.presence.subscribe((event) => {
          if (event.type === PresenceEventType.Enter) {
            onPresenceChange?.(event.member.clientId, 'enter');
            setOnlineClientIds(prev => new Set([...prev, event.member.clientId]));
          } else if (event.type === PresenceEventType.Leave) {
            onPresenceChange?.(event.member.clientId, 'leave');
            setOnlineClientIds(prev => { const s = new Set(prev); s.delete(event.member.clientId); return s; });
          }
        });

        await room.attach();
        if (!cancelled) { roomReadyRef.current = true; setRoomReady(true); }

        await room.presence.enter({ status: 'online' });

        // Load current presence members
        try {
          const presenceMembers = await room.presence.get();
          if (!cancelled) {
            setOnlineClientIds(new Set(presenceMembers.map((m: any) => m.clientId)));
          }
        } catch {}
      } catch (error) {
        if (!cancelled) console.error('[useChatRoom] failed to attach room', error);
      }
    })();

    return () => {
      cancelled = true;
      roomReadyRef.current = false;
      setRoomReady(false);
      const room = roomRef.current;
      if (room) {
        room.presence.leave().catch(() => {});
        room.detach().catch(() => {});
        roomRef.current = null;
      }
    };
  }, [chatClient, chatId]);

  const startTyping = useCallback(async () => {
    if (!roomReadyRef.current) return;
    try { await roomRef.current?.typing.keystroke(); } catch {}
  }, []);

  const stopTyping = useCallback(async () => {
    try { await roomRef.current?.typing.stop(); } catch {}
  }, []);

  return { isConnected: isConnected && roomReady, startTyping, stopTyping, onlineClientIds };
}
