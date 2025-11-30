'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
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
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { uk } from 'date-fns/locale';
import { CreateTaskFromMessageModal } from './CreateTaskFromMessageModal';
import { MentionInput } from './MentionInput';
import { useChatPusher } from '@/hooks/useChatPusher';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { ChatMessagesSkeleton, ChatMembersSkeleton } from './ChatSkeleton';
import { Badge } from '@/components/ui/badge';

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

export function ChatWindow({ chatId, currentUserId }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [messageForTask, setMessageForTask] = useState<Message | null>(null);
  const [chatMembers, setChatMembers] = useState<User[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Показувати індикатор завантаження тільки якщо завантаження триває > 200ms
  const shouldShowLoadingMessages = useDelayedLoading(loading, 200);
  const shouldShowLoadingMembers = useDelayedLoading(loadingMembers, 150);

  // Pusher connection
  const { isConnected, sendTypingIndicator } = useChatPusher({
    chatId,
    onNewMessage: (message) => {
      setMessages((prev) => [...prev, message]);
    },
    onMessageUpdated: (message) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    },
    onMessageDeleted: (messageId) => {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    },
    onTyping: (userId) => {
      // Add user to typing indicator
      setTypingUsers((prev) => new Set(prev).add(userId));

      // Clear existing timeout for this user
      if (typingTimeoutRef.current[userId]) {
        clearTimeout(typingTimeoutRef.current[userId]);
      }

      // Remove typing indicator after 3 seconds
      typingTimeoutRef.current[userId] = setTimeout(() => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      }, 3000);
    },
  });

  useEffect(() => {
    // Reset state when switching chats
    setMessages([]);
    setChatMembers([]);
    setLoading(true);
    setLoadingMembers(true);
    setReplyTo(null);
    setTypingUsers(new Set());
    
    // Load data for new chat
    loadMessages();
    loadChatMembers();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Removed joinChat call as Pusher automatically subscribes to channel

  const loadMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/messages/chat/${chatId}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
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

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId,
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
    // Send typing indicator
    if (value.length > 0) {
      sendTypingIndicator();
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

  const openTaskCreationModal = (message: Message) => {
    setMessageForTask(message);
  };

  const handleTaskCreated = (taskId: number) => {
    if (messageForTask) {
      // Update message to show it has a task
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageForTask.id ? { ...m, taskId } : m
        )
      );
    }
  };

  const addReaction = async (messageId: number, emoji: string) => {
    try {
      const response = await fetch(
        `/api/chat/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji }),
        }
      );

      if (response.ok) {
        // Reload messages to get updated reactions
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  const renderMessage = (message: Message) => {
    const isOwnMessage = message.senderId === currentUserId;

    return (
      <div
        key={message.id}
        className={`mb-4 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
      >
        <div className={`flex max-w-[70%] gap-2 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          {/* Avatar */}
          {!isOwnMessage && (
            <Avatar className="h-8 w-8 ring-2 ring-primary/20">
              <AvatarImage src={message.sender?.avatarUrl} />
              <AvatarFallback className="glass-medium text-text-primary">
                {message.sender?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          )}

          {/* Message Content */}
          <div>
            {!isOwnMessage && (
              <div className="mb-1 text-xs font-medium text-text-primary">
                {message.sender?.username}
              </div>
            )}

            <div
              className={`group relative rounded-lg px-4 py-2 glass-hover ${
                isOwnMessage
                  ? 'glass-button border-primary/40 text-text-primary'
                  : 'glass-light border-white/10 text-text-primary'
              }`}
            >
              {/* Reply indicator */}
              {message.replyToId && (
                <div className="mb-2 border-l-2 border-primary/50 pl-2 text-xs text-text-secondary">
                  Відповідь на повідомлення
                </div>
              )}

              {/* Message text */}
              <p className="whitespace-pre-wrap break-words text-text-primary">
                {message.content}
              </p>

              {/* Task indicator */}
              {message.taskId && (
                <div className="mt-2 flex items-center gap-1 text-xs text-text-secondary">
                  <ListTodo className="h-3 w-3" />
                  <span>Створено завдання</span>
                </div>
              )}

              {/* Timestamp and status */}
              <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary">
                <span>
                  {formatDistanceToNow(new Date(message.createdAt), {
                    addSuffix: true,
                    locale: uk,
                  })}
                </span>
                {message.editedAt && <span>(редаговано)</span>}
                {isOwnMessage && message.readBy && message.readBy.length > 1 && (
                  <CheckCheck className="h-3 w-3" />
                )}
              </div>

              {/* Message actions */}
              <div className="absolute -right-2 -top-2 hidden group-hover:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-6 w-6 p-0 glass-light hover:glass-medium"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="glass-medium border-white/10">
                    <DropdownMenuItem onClick={() => setReplyTo(message)}>
                      <Reply className="mr-2 h-4 w-4" />
                      Відповісти
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, '👍')}>
                      <Smile className="mr-2 h-4 w-4" />
                      Реакція
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => openTaskCreationModal(message)}
                      disabled={!!message.taskId}
                    >
                      <ListTodo className="mr-2 h-4 w-4" />
                      {message.taskId ? 'Завдання створено' : 'Створити завдання'}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Копіювати
                    </DropdownMenuItem>
                    {isOwnMessage && (
                      <>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Редагувати
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => deleteMessage(message.id)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Видалити
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div className="mt-1 flex gap-1">
                {message.reactions.map((reaction, idx) => (
                  <button
                    key={idx}
                    onClick={() => addReaction(message.id, reaction.emoji)}
                    className="rounded-full glass-light hover:glass-medium border-white/10 px-2 py-0.5 text-xs text-text-primary transition-all duration-200"
                  >
                    {reaction.emoji} {reaction.count}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Get typing users names
  const typingUserNames = chatMembers
    .filter((member) => typingUsers.has(member.id) && member.id !== currentUserId)
    .map((member) => member.username);

  return (
    <div className="flex h-full flex-col glass-medium">
      {/* Header with connection status */}
      <div className="border-b border-white/10 px-4 py-3 glass-medium">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-text-primary">Чат</h3>
              {shouldShowLoadingMembers ? (
                <ChatMembersSkeleton />
              ) : chatMembers.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {chatMembers.slice(0, 5).map((member) => (
                      <Avatar key={member.id} className="h-6 w-6 ring-2 ring-background">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback className="glass-medium text-xs text-text-primary">
                          {member.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                  <span className="text-sm text-text-secondary">
                    {chatMembers.length} {chatMembers.length === 1 ? 'учасник' : chatMembers.length < 5 ? 'учасники' : 'учасників'}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
          <Badge 
            variant={isConnected ? 'primary' : 'secondary'}
            className={isConnected 
              ? 'glass-button border-primary/50 text-text-primary' 
              : 'glass-light border-white/20 text-text-secondary'}
          >
            {isConnected ? '🟢 Підключено' : '🔴 Відключено'}
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 scrollbar-thin">
        {shouldShowLoadingMessages ? (
          <ChatMessagesSkeleton />
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-text-tertiary">
            Немає повідомлень. Почніть розмову!
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            
            {/* Typing indicator */}
            {typingUserNames.length > 0 && (
              <div className="mb-4 text-sm text-text-secondary glass-light rounded-lg px-3 py-2 inline-block">
                {typingUserNames.join(', ')} {typingUserNames.length === 1 ? 'друкує' : 'друкують'}...
              </div>
            )}
            
            <div ref={scrollRef} />
          </>
        )}
      </ScrollArea>

      {/* Reply indicator */}
      {replyTo && (
        <div className="border-t border-white/10 glass-medium px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-text-primary">
              <Reply className="h-4 w-4" />
              <span>Відповідь на: {replyTo.content.substring(0, 50)}...</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="glass-light hover:glass-medium"
              onClick={() => setReplyTo(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-white/10 glass-medium p-4">
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="ghost"
            className="glass-light hover:glass-medium"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <MentionInput
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Введіть повідомлення... (@ для згадування)"
            className="flex-1"
            chatMembers={chatMembers}
          />
          <Button 
            size="sm" 
            variant="ghost"
            className="glass-light hover:glass-medium"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button 
            onClick={sendMessage} 
            disabled={!newMessage.trim()}
            className="glass-button disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Create Task Modal */}
      <CreateTaskFromMessageModal
        open={!!messageForTask}
        onClose={() => setMessageForTask(null)}
        message={messageForTask}
        onTaskCreated={handleTaskCreated}
      />
    </div>
  );
}
