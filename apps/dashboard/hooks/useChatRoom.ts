'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useMessages, useTyping, useRoom } from '@ably/chat/react';
import { ChatMessageEventType, RoomStatus } from '@ably/chat';
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

function msgFromData(data: unknown, chatId: number, fallbackClientId?: string): ChatMessage {
  const m = data as Record<string, unknown>;
  return {
    id: String(m.id ?? Date.now()),
    chatId,
    text: String(m.content ?? ''),
    clientId: String(m.senderId ?? fallbackClientId ?? ''),
    timestamp: Date.now(),
    metadata: { dbMessage: data },
  };
}

export function useChatRoom(options: UseChatRoomOptions) {
  const { chatId, onNewMessage, onMessageUpdated, onMessageDeleted, onMessageReaction, onTyping, onPresenceChange } = options;
  const { realtimeClient, isConnected: ablyConnected } = useAblyChat();

  const handlersRef = useRef({ onNewMessage, onMessageUpdated, onMessageDeleted, onMessageReaction, onTyping, onPresenceChange });
  useEffect(() => {
    handlersRef.current = { onNewMessage, onMessageUpdated, onMessageDeleted, onMessageReaction, onTyping, onPresenceChange };
  });

  // Ably Chat SDK: room status
  const { roomStatus } = useRoom();
  const roomAttached = roomStatus === RoomStatus.Attached;

  // Ably Chat SDK: new messages via Chat room subscription
  useMessages({
    listener: (event) => {
      if (event.type !== ChatMessageEventType.Created) return;
      const metadata = event.message.metadata as Record<string, unknown> | undefined;
      const dbMessage = metadata?.dbMessage;
      if (!dbMessage) return;
      handlersRef.current.onNewMessage?.(msgFromData(dbMessage, chatId, event.message.clientId));
    },
  });

  // Ably Chat SDK: typing indicators
  const { keystroke, stop, currentlyTyping } = useTyping();

  useEffect(() => {
    handlersRef.current.onTyping?.(Array.from(currentlyTyping));
  }, [currentlyTyping]);

  // Raw Ably channel: edit / delete / reaction events (still via triggerChatEvent)
  const [onlineClientIds, setOnlineClientIds] = useState(new Set<string>());
  const channelRef = useRef<Ably.RealtimeChannel | null>(null);

  useEffect(() => {
    if (!realtimeClient || !ablyConnected) return;

    const channel = realtimeClient.channels.get(`private-chat-${chatId}`);
    channelRef.current = channel;

    const onUpdated = (msg: Ably.Message) => {
      const data = msg.data as { message?: unknown };
      if (!data?.message) return;
      handlersRef.current.onMessageUpdated?.(msgFromData(data.message, chatId, msg.clientId ?? ''));
    };

    const onDeleted = (msg: Ably.Message) => {
      const data = msg.data as { messageId?: number | string };
      if (data?.messageId) handlersRef.current.onMessageDeleted?.(String(data.messageId));
    };

    const onReaction = (msg: Ably.Message) => {
      const data = msg.data as { messageId?: number; emoji?: string; userId?: number; removed?: boolean };
      if (data?.messageId && data?.emoji && data?.userId) {
        handlersRef.current.onMessageReaction?.({ messageId: data.messageId, emoji: data.emoji, userId: data.userId, removed: data.removed });
      }
    };

    const onEnter = (member: Ably.PresenceMessage) => {
      setOnlineClientIds((prev) => new Set([...prev, member.clientId]));
      handlersRef.current.onPresenceChange?.(member.clientId, 'enter');
    };
    const onLeave = (member: Ably.PresenceMessage) => {
      setOnlineClientIds((prev) => { const s = new Set(prev); s.delete(member.clientId); return s; });
      handlersRef.current.onPresenceChange?.(member.clientId, 'leave');
    };

    void channel.subscribe('message-updated', onUpdated);
    void channel.subscribe('message-deleted', onDeleted);
    void channel.subscribe('message-reaction', onReaction);
    channel.presence.subscribe('enter', onEnter);
    channel.presence.subscribe('leave', onLeave);

    void channel.attach().catch((err) => console.error('[useChatRoom] channel attach failed', err));
    void channel.presence.enter({ status: 'online' }).catch(() => {});
    void channel.presence.get().then((members) => {
      setOnlineClientIds(new Set(members.map((m) => m.clientId)));
    }).catch(() => {});

    return () => {
      channel.unsubscribe('message-updated', onUpdated);
      channel.unsubscribe('message-deleted', onDeleted);
      channel.unsubscribe('message-reaction', onReaction);
      channel.presence.unsubscribe('enter', onEnter);
      channel.presence.unsubscribe('leave', onLeave);
      void channel.presence.leave().catch(() => {});
      void channel.detach().catch(() => {});
      channelRef.current = null;
    };
  }, [chatId, ablyConnected, realtimeClient]);

  const startTyping = useCallback(async () => {
    try { await keystroke(); } catch {}
  }, [keystroke]);

  const stopTyping = useCallback(async () => {
    try { await stop(); } catch {}
  }, [stop]);

  return { isConnected: roomAttached, startTyping, stopTyping, onlineClientIds };
}
