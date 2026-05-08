'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { ChatMessageEventType, PresenceEventType, type Room } from '@ably/chat';
import { useAblyChat } from '@/lib/ably-chat-provider';
import type Ably from 'ably';

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
  onMessageReaction?: (event: { messageId: number; emoji: string; userId: number; removed?: boolean }) => void;
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
  const { chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onMessageReaction, onTyping, onPresenceChange } = options;
  const { chatClient, realtimeClient, isConnected } = useAblyChat();
  const handlersRef = useRef({
    onNewMessage,
    onMessageUpdated,
    onMessageDeleted,
    onMessageReaction,
    onTyping,
    onPresenceChange,
  });
  const roomRef = useRef<Room | null>(null);
  const roomReadyRef = useRef(false);
  const [roomReady, setRoomReady] = useState(false);
  const [onlineClientIds, setOnlineClientIds] = useState(new Set<string>());

  useEffect(() => {
    handlersRef.current = {
      onNewMessage,
      onMessageUpdated,
      onMessageDeleted,
      onMessageReaction,
      onTyping,
      onPresenceChange,
    };
  }, [onNewMessage, onMessageDeleted, onMessageReaction, onMessageUpdated, onPresenceChange, onTyping]);

  useEffect(() => {
    if (!chatClient) return;

    let cancelled = false;
    const subscriptions: Array<{ unsubscribe: () => void }> = [];

    (async () => {
      const roomId = `chat-${chatId}`;

      try {
        const room = await chatClient.rooms.get(roomId);
        if (cancelled) return;
        roomRef.current = room;

        // Messages
        subscriptions.push(room.messages.subscribe((event) => {
          const msg = toMessage(event.message, chatId);
          if (event.type === ChatMessageEventType.Created) handlersRef.current.onNewMessage?.(msg);
          else if (event.type === ChatMessageEventType.Updated) handlersRef.current.onMessageUpdated?.(msg);
          else if (event.type === ChatMessageEventType.Deleted) handlersRef.current.onMessageDeleted?.(msg.id);
        }));

        // Typing
        subscriptions.push(room.typing.subscribe((event) => {
          handlersRef.current.onTyping?.(Array.from(event.currentlyTyping as Set<string>));
        }));

        // Presence
        subscriptions.push(room.presence.subscribe((event) => {
          if (event.type === PresenceEventType.Enter) {
            handlersRef.current.onPresenceChange?.(event.member.clientId, 'enter');
            setOnlineClientIds(prev => new Set([...prev, event.member.clientId]));
          } else if (event.type === PresenceEventType.Leave) {
            handlersRef.current.onPresenceChange?.(event.member.clientId, 'leave');
            setOnlineClientIds(prev => { const s = new Set(prev); s.delete(event.member.clientId); return s; });
          }
        }));

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
      subscriptions.forEach((subscription) => subscription.unsubscribe());
      const room = roomRef.current;
      if (room) {
        room.presence.leave().catch(() => {});
        chatClient.rooms.release(room.name).catch(() => {});
        roomRef.current = null;
      }
    };
  }, [chatClient, chatId]);

  useEffect(() => {
    if (!realtimeClient || !isConnected) return;

    const channel = realtimeClient.channels.get(`private-chat-${chatId}`);

    const handleNewMessage = (msg: Ably.Message) => {
      const data = msg.data as { message?: unknown };
      if (data?.message) {
        handlersRef.current.onNewMessage?.({
          id: String((data.message as { id?: number | string }).id ?? msg.id ?? Date.now()),
          chatId,
          text: String((data.message as { content?: string }).content ?? ''),
          clientId: String((data.message as { senderId?: number | string }).senderId ?? ''),
          timestamp: Date.now(),
          metadata: { dbMessage: data.message },
        });
      }
    };

    const handleMessageUpdated = (msg: Ably.Message) => {
      const data = msg.data as { message?: unknown };
      if (data?.message) {
        handlersRef.current.onMessageUpdated?.({
          id: String((data.message as { id?: number | string }).id ?? msg.id ?? Date.now()),
          chatId,
          text: String((data.message as { content?: string }).content ?? ''),
          clientId: String((data.message as { senderId?: number | string }).senderId ?? ''),
          timestamp: Date.now(),
          metadata: { dbMessage: data.message },
        });
      }
    };

    const handleMessageDeleted = (msg: Ably.Message) => {
      const data = msg.data as { messageId?: number | string };
      if (data?.messageId) handlersRef.current.onMessageDeleted?.(String(data.messageId));
    };

    const handleMessageReaction = (msg: Ably.Message) => {
      const data = msg.data as { messageId?: number; emoji?: string; userId?: number; removed?: boolean };
      if (data?.messageId && data?.emoji && data?.userId) {
        handlersRef.current.onMessageReaction?.({
          messageId: data.messageId,
          emoji: data.emoji,
          userId: data.userId,
          removed: data.removed,
        });
      }
    };

    void channel.subscribe('new-message', handleNewMessage);
    void channel.subscribe('message-updated', handleMessageUpdated);
    void channel.subscribe('message-deleted', handleMessageDeleted);
    void channel.subscribe('message-reaction', handleMessageReaction);

    return () => {
      channel.unsubscribe('new-message', handleNewMessage);
      channel.unsubscribe('message-updated', handleMessageUpdated);
      channel.unsubscribe('message-deleted', handleMessageDeleted);
      channel.unsubscribe('message-reaction', handleMessageReaction);
    };
  }, [chatId, isConnected, realtimeClient]);

  const startTyping = useCallback(async () => {
    if (!roomReadyRef.current) return;
    try { await roomRef.current?.typing.keystroke(); } catch {}
  }, []);

  const stopTyping = useCallback(async () => {
    try { await roomRef.current?.typing.stop(); } catch {}
  }, []);

  return { isConnected: isConnected && roomReady, startTyping, stopTyping, onlineClientIds };
}
