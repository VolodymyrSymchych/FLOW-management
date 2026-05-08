'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Reply,
  Edit,
  Trash,
  Copy,
  CheckCheck,
  ListTodo,
  X,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CreateTaskFromMessageModal } from './CreateTaskFromMessageModal';
import { MentionInput } from './MentionInput';
import { useChatRoom, type ChatMessage as AblyMessage } from '@/hooks/useChatRoom';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { ChatMessagesSkeleton, ChatMembersSkeleton } from './ChatSkeleton';

interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  messageType: 'text' | 'file' | 'system';
  replyToId?: number;
  mentions?: number[];
  taskId?: number;
  readBy?: number[];
  editedAt?: string;
  createdAt: string;
  sender?: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  reactions?: Array<{
    emoji: string;
    count: number;
    users: number[];
  }>;
}

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface ChatWindowProps {
  chatId: number;
  currentUserId: number;
}

interface ChatInfo {
  id: number;
  name?: string;
  type: 'direct' | 'group' | 'project' | 'team';
}

export function ChatWindow({ chatId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [messageForTask, setMessageForTask] = useState<Message | null>(null);
  const [chatMembers, setChatMembers] = useState<User[]>([]);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [typingUsers, setTypingUsers] = useState(new Set<number>());
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const shouldShowLoadingMessages = useDelayedLoading(loading, 200);
  const shouldShowLoadingMembers = useDelayedLoading(loadingMembers, 150);

  const { isConnected, startTyping, onlineClientIds } = useChatRoom({
    chatId,
    onNewMessage: (msg: AblyMessage) => {
      const dbMessage = msg.metadata?.dbMessage as Message | undefined;
      if (!dbMessage) return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === dbMessage.id)) return prev;
        return [...prev, dbMessage];
      });
    },
    onMessageUpdated: (msg: AblyMessage) => {
      const dbMessage = msg.metadata?.dbMessage as Message | undefined;
      if (!dbMessage) return;
      setMessages((prev) => prev.map((m) => (m.id === dbMessage.id ? dbMessage : m)));
    },
    onMessageDeleted: (messageId) => {
      const numericMessageId = parseInt(messageId, 10);
      if (!Number.isNaN(numericMessageId)) {
        setMessages((prev) => prev.filter((m) => m.id !== numericMessageId));
      }
    },
    onMessageReaction: ({ messageId, emoji, userId, removed }) => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id !== messageId) return message;

          const reactions = message.reactions ?? [];
          const existingIndex = reactions.findIndex((reaction) => reaction.emoji === emoji);

          if (removed) {
            if (existingIndex < 0) return message;

            const nextReactions = reactions
              .map((reaction, index) => {
                if (index !== existingIndex) return reaction;
                const users = (reaction.users ?? []).filter((id) => id !== userId);
                return { ...reaction, users, count: Math.max(0, reaction.count - 1) };
              })
              .filter((reaction) => reaction.count > 0);

            return { ...message, reactions: nextReactions };
          }

          if (existingIndex >= 0) {
            const nextReactions = reactions.map((reaction, index) => {
              if (index !== existingIndex) return reaction;
              if (reaction.users?.includes(userId)) return reaction;
              return {
                ...reaction,
                count: reaction.count + 1,
                users: [...(reaction.users ?? []), userId],
              };
            });
            return { ...message, reactions: nextReactions };
          }

          return {
            ...message,
            reactions: [...reactions, { emoji, count: 1, users: [userId] }],
          };
        })
      );
    },
    onTyping: (clientIds: string[]) => {
      setTypingUsers(new Set(clientIds.map((id) => parseInt(id, 10)).filter(Boolean)));
    },
  });

  useEffect(() => {
    setMessages([]);
    setChatMembers([]);
    setChatInfo(null);
    setLoading(true);
    setLoadingMembers(true);
    setReplyTo(null);
    setTypingUsers(new Set());
    loadMessages();
    loadChatMembers();
    loadChatInfo();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(() => {
      void fetch(`/api/chat/${chatId}/messages`)
        .then(r => r.json())
        .then(data => {
          if (data.messages) {
            setMessages(prev => prev.map(m => {
              const updated = (data.messages as typeof prev).find(u => u.id === m.id);
              return updated ? { ...m, readBy: updated.readBy } : m;
            }));
          }
        })
        .catch(() => {});
    }, 10000);
    return () => clearInterval(interval);
  }, [chatId]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/${chatId}/messages`);
      if (response.ok) {
        const data = await response.json();
        const msgs = data.messages || [];
        setMessages(msgs);
        setHasMore(msgs.length >= 50);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = async () => {
    if (!hasMore || loadingMore || messages.length === 0) return;
    setLoadingMore(true);
    try {
      const oldest = messages[0];
      const response = await fetch(`/api/chat/${chatId}/messages?beforeId=${oldest.id}&limit=50`);
      if (response.ok) {
        const data = await response.json();
        const older = data.messages || [];
        setMessages((prev) => [...older, ...prev]);
        setHasMore(older.length >= 50);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadChatMembers = async () => {
    try {
      setLoadingMembers(true);
      const response = await fetch(`/api/chat/chats/${chatId}/members`);
      if (response.ok) {
        const data = await response.json();
        setChatMembers(data.members || []);
      }
    } catch (error) {
      console.error('Failed to load chat members:', error);
    } finally {
      setLoadingMembers(false);
    }
  };

  const loadChatInfo = async () => {
    try {
      const response = await fetch(`/api/chat/chats/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setChatInfo(data.chat ?? data ?? null);
      }
    } catch (error) {
      console.error('Failed to load chat info:', error);
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch(`/api/chat/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newMessage,
          replyToId: replyTo?.id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (value: string) => {
    setNewMessage(value);
    if (value.length > 0) {
      void startTyping();
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  const addReaction = async (messageId: number, emoji: string) => {
    try {
      const response = await fetch(`/api/chat/messages/${messageId}/reactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji }),
      });
      if (response.ok) {
        // Optimistic in-place update — add/increment reaction without reloading all messages
        setMessages((prev) =>
          prev.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions ?? [];
            const idx = existing.findIndex((r) => r.emoji === emoji);
            if (idx >= 0) {
              const updated = [...existing];
              if (updated[idx].users?.includes(currentUserId)) return m;
              updated[idx] = {
                ...updated[idx],
                count: updated[idx].count + 1,
                users: [...(updated[idx].users ?? []), currentUserId],
              };
              return { ...m, reactions: updated };
            }
            return { ...m, reactions: [...existing, { emoji, count: 1, users: [currentUserId] }] };
          })
        );
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const typingUserNames = chatMembers
    .filter((member) => typingUsers.has(member.id) && member.id !== currentUserId)
    .map((member) => member.username);

  const renderMessage = (message: Message, idx: number) => {
    const isOwn = message.senderId === currentUserId;
    const prevMsg = messages[idx - 1];
    const isGrouped = prevMsg && prevMsg.senderId === message.senderId;

    return (
      <div
        key={message.id}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${isGrouped ? 'mt-0.5' : 'mt-4'}`}
        style={{ animation: 'fadeSlideIn 0.18s var(--ease-out-quint) forwards' }}
      >
        <div className={`flex max-w-[68%] gap-2 items-end ${isOwn ? 'flex-row-reverse' : ''}`}>
          {/* Avatar — only for first in a group */}
          <div className="flex-shrink-0 w-7">
            {!isOwn && !isGrouped ? (
              <Avatar className="h-7 w-7">
                <AvatarImage src={message.sender?.avatarUrl} />
                <AvatarFallback
                  className="text-xs font-medium"
                  style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--primary))' }}
                >
                  {message.sender?.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>

          {/* Bubble + meta */}
          <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} min-w-0`}>
            {/* Sender name — first in group only */}
            {!isOwn && !isGrouped && (
              <span className="mb-1 text-xs font-medium text-text-secondary px-1">
                {message.sender?.username}
              </span>
            )}

            {/* Bubble */}
            <div className="group relative">
              {/* Reply reference */}
              {message.replyToId && (
                <div
                  className="mb-1 px-3 py-1.5 rounded-lg text-xs"
                  style={{
                    background: isOwn ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--surface-muted))',
                    borderLeft: `2px solid hsl(var(--primary))`,
                    color: 'hsl(var(--text-secondary))',
                  }}
                >
                  Reply to message
                </div>
              )}

              <div
                className="px-3.5 py-2 rounded-2xl"
                style={
                  isOwn
                    ? {
                        background: 'hsl(var(--primary))',
                        color: '#fff',
                        borderBottomRightRadius: isGrouped ? undefined : 4,
                        boxShadow: '0 1px 2px hsl(var(--primary) / 0.3)',
                      }
                    : {
                        background: 'hsl(var(--surface))',
                        color: 'hsl(var(--text-primary))',
                        border: '1px solid var(--line-strong)',
                        borderBottomLeftRadius: isGrouped ? undefined : 4,
                        boxShadow: 'var(--shadow-subtle)',
                      }
                }
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
                  {message.content}
                </p>

                {message.taskId && (
                  <div
                    className="mt-1.5 flex items-center gap-1 text-xs"
                    style={{ opacity: 0.75 }}
                  >
                    <ListTodo className="h-3 w-3" />
                    <span>Task created</span>
                  </div>
                )}
              </div>

              {/* Floating action bar on hover */}
              <div
                className={`absolute ${isOwn ? 'right-full mr-1.5' : 'left-full ml-1.5'} top-1/2 -translate-y-1/2 hidden group-hover:flex items-center gap-0.5 rounded-xl shadow-md`}
                style={{
                  background: 'hsl(var(--surface-elevated))',
                  border: '1px solid var(--line-strong)',
                  padding: '3px 4px',
                  zIndex: 10,
                }}
              >
                <ActionBtn title="Reply" onClick={() => setReplyTo(message)}>
                  <Reply className="h-3.5 w-3.5" />
                </ActionBtn>
                <ActionBtn title="React" onClick={() => addReaction(message.id, '👍')}>
                  <Smile className="h-3.5 w-3.5" />
                </ActionBtn>
                <ActionBtn title="Create task" onClick={() => setMessageForTask(message)} disabled={!!message.taskId}>
                  <ListTodo className="h-3.5 w-3.5" />
                </ActionBtn>
                <ActionBtn title="Copy" onClick={() => navigator.clipboard.writeText(message.content)}>
                  <Copy className="h-3.5 w-3.5" />
                </ActionBtn>
                {isOwn && (
                  <>
                    <ActionBtn title="Edit">
                      <Edit className="h-3.5 w-3.5" />
                    </ActionBtn>
                    <ActionBtn
                      title="Delete"
                      onClick={() => deleteMessage(message.id)}
                      danger
                    >
                      <Trash className="h-3.5 w-3.5" />
                    </ActionBtn>
                  </>
                )}
              </div>
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className={`flex gap-1 mt-1 flex-wrap ${isOwn ? 'justify-end' : ''}`}>
                {message.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    onClick={() => addReaction(message.id, reaction.emoji)}
                    className="flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs transition-colors"
                    style={{
                      background: 'hsl(var(--surface-muted))',
                      border: '1px solid var(--line)',
                      color: 'hsl(var(--text-secondary))',
                    }}
                  >
                    <span>{reaction.emoji}</span>
                    <span style={{ fontSize: '0.6875rem' }}>{reaction.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp + read */}
            <div className={`flex items-center gap-1 mt-1 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
              <span style={{ fontSize: '0.625rem', color: 'hsl(var(--text-tertiary))' }}>
                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
              </span>
              {message.editedAt && (
                <span style={{ fontSize: '0.625rem', color: 'hsl(var(--text-tertiary))' }}>(edited)</span>
              )}
              {isOwn && (
                <div className="flex items-center gap-1">
                  {message.readBy && message.readBy.filter(id => id !== currentUserId).length > 0 ? (
                    <span
                      className="text-xs flex items-center gap-0.5"
                      style={{ color: 'hsl(var(--primary))' }}
                      title={`Read by ${message.readBy.filter(id => id !== currentUserId).length} member(s)`}
                    >
                      <CheckCheck className="h-3 w-3" />
                      <span>{message.readBy.filter(id => id !== currentUserId).length}</span>
                    </span>
                  ) : (
                    <CheckCheck className="h-3 w-3" style={{ color: 'hsl(var(--text-tertiary))' }} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 flex items-center justify-between px-5 py-3"
        style={{
          background: 'hsl(var(--surface))',
          borderBottom: '1px solid var(--line-strong)',
          minHeight: 56,
        }}
      >
        {shouldShowLoadingMembers ? (
          <ChatMembersSkeleton />
        ) : (() => {
          const isDirect = chatInfo?.type === 'direct';
          const otherPerson = isDirect
            ? chatMembers.find((m) => m.id !== currentUserId) ?? chatMembers[0]
            : null;
          const groupName = chatInfo?.name ?? (chatInfo?.type ? `${chatInfo.type.charAt(0).toUpperCase()}${chatInfo.type.slice(1)} chat` : 'Chat');
          const otherMembers = !isDirect
            ? chatMembers.filter((m) => m.id !== currentUserId).slice(0, 4)
            : [];

          return (
            <div className="flex items-center gap-3 min-w-0">
              {/* Avatar */}
              {isDirect && otherPerson ? (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={otherPerson.avatarUrl} />
                  <AvatarFallback
                    style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--primary))', fontSize: '0.625rem', fontWeight: 600 }}
                  >
                    {otherPerson.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ) : otherMembers.length > 0 ? (
                <div className="flex-shrink-0 flex -space-x-1.5">
                  {otherMembers.map((m) => (
                    <Avatar
                      key={m.id}
                      className="relative h-7 w-7 ring-2"
                      style={{ '--tw-ring-color': 'hsl(var(--surface))' } as React.CSSProperties}
                    >
                      <AvatarImage src={m.avatarUrl} />
                      <AvatarFallback
                        style={{ background: 'hsl(var(--surface-muted))', color: 'hsl(var(--text-secondary))', fontSize: '0.5rem', fontWeight: 600 }}
                      >
                        {m.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                      {onlineClientIds.has(String(m.id)) && (
                        <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-background" />
                      )}
                    </Avatar>
                  ))}
                </div>
              ) : null}

              {/* Name + subtitle */}
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-text-primary tracking-tight truncate">
                  {isDirect ? (otherPerson?.username ?? 'Direct Message') : groupName}
                </h3>
                {!isDirect && chatMembers.length > 0 && (
                  <p className="text-xs text-text-tertiary">
                    {chatMembers.length} {chatMembers.length === 1 ? 'member' : 'members'}
                  </p>
                )}
              </div>
            </div>
          );
        })()}

        {/* Connection status dot */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: isConnected ? 'hsl(var(--success))' : 'hsl(var(--text-tertiary))' }}
          />
          <span className="text-xs text-text-tertiary">
            {isConnected ? 'Connected' : 'Connecting…'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 no-scrollbar" style={{ background: 'hsl(var(--background))' }}>
        <div className="px-5 py-4 space-y-0">
          {shouldShowLoadingMessages ? (
            <ChatMessagesSkeleton />
          ) : messages.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-sm text-text-tertiary">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <>
              {hasMore && (
                <div className="flex justify-center mb-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="glass-light hover:glass-medium text-text-secondary text-xs"
                    onClick={loadMoreMessages}
                    disabled={loadingMore}
                  >
                    {loadingMore ? 'Loading...' : 'Load older messages'}
                  </Button>
                </div>
              )}
              {messages.map((msg, i) => renderMessage(msg, i))}

              {typingUserNames.length > 0 && (
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex gap-1 items-center px-3 py-2 rounded-xl" style={{ background: 'hsl(var(--surface))', border: '1px solid var(--line)' }}>
                    <TypingDots />
                    <span className="text-xs text-text-tertiary ml-1">
                      {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'is typing' : 'are typing'}
                    </span>
                  </div>
                </div>
              )}

              <div ref={scrollRef} className="h-2" />
            </>
          )}
        </div>
      </ScrollArea>

      {/* Reply bar */}
      {replyTo && (
        <div
          className="flex-shrink-0 flex items-center justify-between gap-3 px-5 py-2.5"
          style={{
            background: 'hsl(var(--accent-soft))',
            borderTop: '1px solid hsl(var(--primary) / 0.2)',
          }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-0.5 h-4 rounded-full flex-shrink-0" style={{ background: 'hsl(var(--primary))' }} />
            <Reply className="h-3.5 w-3.5 flex-shrink-0" style={{ color: 'hsl(var(--primary))' }} />
            <span className="text-xs text-text-secondary truncate">
              {replyTo.content.substring(0, 60)}{replyTo.content.length > 60 ? '…' : ''}
            </span>
          </div>
          <button
            onClick={() => setReplyTo(null)}
            className="flex-shrink-0 h-5 w-5 flex items-center justify-center rounded-full transition-colors text-text-tertiary hover:text-text-primary"
            style={{ background: 'hsl(var(--surface-muted))' }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Compose */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{
          background: 'hsl(var(--surface))',
          borderTop: '1px solid var(--line-strong)',
        }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{
            background: 'hsl(var(--surface-muted))',
            border: '1px solid hsl(var(--border))',
          }}
        >
          {/* Attach */}
          <button
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>

          {/* Input */}
          <div className="flex-1 min-w-0">
            <MentionInput
              value={newMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Message… (@mention)"
              className="flex-1 bg-transparent border-0 outline-none text-sm text-text-primary placeholder:text-text-tertiary resize-none"
              chatMembers={chatMembers}
            />
          </div>

          {/* Emoji */}
          <button
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Add emoji"
          >
            <Smile className="h-4 w-4" />
          </button>

          {/* Send */}
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="flex-shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{
              background: newMessage.trim() ? 'hsl(var(--primary))' : 'transparent',
              color: newMessage.trim() ? '#fff' : 'hsl(var(--text-tertiary))',
            }}
            aria-label="Send message"
          >
            <Send className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <CreateTaskFromMessageModal
        open={!!messageForTask}
        onClose={() => setMessageForTask(null)}
        message={messageForTask}
        onTaskCreated={(taskId) => {
          if (messageForTask) {
            setMessages((prev) =>
              prev.map((m) => (m.id === messageForTask.id ? { ...m, taskId } : m))
            );
          }
        }}
      />
    </div>
  );
}

/* ─── Small helpers ─────────────────────────────────────────── */

function ActionBtn({
  children,
  onClick,
  title,
  disabled,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors disabled:opacity-30"
      style={{
        color: danger ? 'hsl(var(--danger))' : 'hsl(var(--text-secondary))',
        background: 'transparent',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = danger
          ? 'hsl(var(--danger-soft))'
          : 'hsl(var(--surface-muted))';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {children}
    </button>
  );
}

function TypingDots() {
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{
            background: 'hsl(var(--text-tertiary))',
            animation: `pulseSoft 1.2s ${i * 0.2}s ease-in-out infinite`,
          }}
        />
      ))}
    </span>
  );
}
