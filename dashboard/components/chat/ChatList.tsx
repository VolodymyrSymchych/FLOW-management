'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateChatModal } from './CreateChatModal';
import {
  MessageSquare,
  Users,
  Hash,
  Search,
  Plus,
  MoreVertical,
} from 'lucide-react';

interface Chat {
  id: number;
  name?: string;
  type: 'direct' | 'group' | 'project' | 'team';
  projectId?: number;
  teamId?: number;
  lastMessage?: {
    content: string;
    createdAt: string;
    senderId: number;
  };
  unreadCount?: number;
  members?: Array<{
    id: number;
    username: string;
    avatarUrl?: string;
  }>;
}

interface ChatListProps {
  onChatSelect: (chatId: number) => void;
  selectedChatId?: number;
}

export function ChatList({ onChatSelect, selectedChatId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'direct' | 'group' | 'project'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      const response = await fetch('/api/chat/chats');
      if (response.ok) {
        const data = await response.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to load chats:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChats = chats.filter((chat) => {
    const matchesFilter = filter === 'all' || chat.type === filter;
    const matchesSearch =
      !searchQuery ||
      chat.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.members?.some((m) =>
        m.username.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesFilter && matchesSearch;
  });

  const getChatIcon = (type: string) => {
    switch (type) {
      case 'direct':
        return <MessageSquare className="h-4 w-4" />;
      case 'group':
        return <Users className="h-4 w-4" />;
      case 'project':
        return <Hash className="h-4 w-4" />;
      case 'team':
        return <Users className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct' && chat.members) {
      return chat.members.map((m) => m.username).join(', ');
    }
    return 'Unnamed Chat';
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="flex h-full flex-col glass-medium border-r border-white/10">
      {/* Header */}
      <div className="border-b border-white/10 p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-text-primary">Чати</h2>
          <Button 
            size="sm" 
            variant="ghost"
            className="glass-light hover:glass-medium transition-all duration-200"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          <Input
            placeholder="Пошук чатів..."
            className="pl-9 glass-input text-text-primary placeholder:text-text-tertiary"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="mt-3 flex gap-2 flex-wrap">
          <Button
            size="sm"
            variant={filter === 'all' ? 'glass' : 'ghost'}
            className={filter === 'all' 
              ? 'glass-button text-text-primary' 
              : 'glass-light hover:glass-medium text-text-secondary'}
            onClick={() => setFilter('all')}
          >
            Всі
          </Button>
          <Button
            size="sm"
            variant={filter === 'direct' ? 'glass' : 'ghost'}
            className={filter === 'direct' 
              ? 'glass-button text-text-primary' 
              : 'glass-light hover:glass-medium text-text-secondary'}
            onClick={() => setFilter('direct')}
          >
            Прямі
          </Button>
          <Button
            size="sm"
            variant={filter === 'group' ? 'glass' : 'ghost'}
            className={filter === 'group' 
              ? 'glass-button text-text-primary' 
              : 'glass-light hover:glass-medium text-text-secondary'}
            onClick={() => setFilter('group')}
          >
            Групи
          </Button>
          <Button
            size="sm"
            variant={filter === 'project' ? 'glass' : 'ghost'}
            className={filter === 'project' 
              ? 'glass-button text-text-primary' 
              : 'glass-light hover:glass-medium text-text-secondary'}
            onClick={() => setFilter('project')}
          >
            Проекти
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 scrollbar-thin">
        {loading ? (
          <div className="p-4 text-center text-sm text-text-tertiary">
            Завантаження...
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="p-4 text-center text-sm text-text-tertiary">
            Чати не знайдено
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={`w-full p-4 text-left transition-all duration-200 glass-hover ${
                  selectedChatId === chat.id 
                    ? 'glass-medium border-l-2 border-l-primary' 
                    : 'glass-light hover:glass-medium'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {chat.type === 'direct' && chat.members?.[0] ? (
                      <Avatar className="ring-2 ring-primary/20">
                        <AvatarImage src={chat.members[0].avatarUrl} />
                        <AvatarFallback className="glass-medium text-text-primary">
                          {chat.members[0].username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full glass-medium border border-primary/30 text-primary">
                        {getChatIcon(chat.type)}
                      </div>
                    )}
                    {chat.unreadCount && chat.unreadCount > 0 && (
                      <Badge
                        variant="danger"
                        className="absolute -right-1 -top-1 h-5 min-w-[20px] rounded-full px-1.5 text-xs glass-heavy border-danger/50"
                      >
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </Badge>
                    )}
                  </div>

                  {/* Chat Info */}
                  <div className="flex-1 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-medium text-text-primary">
                        {getChatName(chat)}
                      </h3>
                      {chat.lastMessage && (
                        <span className="text-xs text-text-tertiary whitespace-nowrap">
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p className="truncate text-sm text-text-secondary mt-1">
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Create Chat Modal */}
      <CreateChatModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChatCreated={(chatId) => {
          loadChats();
          onChatSelect(chatId);
        }}
      />
    </div>
  );
}

