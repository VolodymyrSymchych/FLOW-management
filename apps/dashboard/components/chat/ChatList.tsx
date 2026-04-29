'use client';

import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CreateChatModal } from './CreateChatModal';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { ChatListSkeleton } from './ChatSkeleton';
import { MessageSquare, Users, Hash, Search, Plus, X } from 'lucide-react';

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
  currentUserId?: number;
}

type FilterType = 'all' | 'direct' | 'group' | 'project';

const FILTERS: { label: string; value: FilterType }[] = [
  { label: 'All', value: 'all' },
  { label: 'Direct', value: 'direct' },
  { label: 'Groups', value: 'group' },
  { label: 'Projects', value: 'project' },
];

export function ChatList({ onChatSelect, selectedChatId, currentUserId }: ChatListProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const shouldShowLoading = useDelayedLoading(loading, 200);

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

  /** For direct chats returns the OTHER person; for group/project/team returns all members. */
  const getOtherMember = (chat: Chat) => {
    if (!chat.members) return null;
    if (chat.type === 'direct') {
      return chat.members.find((m) => m.id !== currentUserId) ?? chat.members[0] ?? null;
    }
    return null;
  };

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct') {
      const other = getOtherMember(chat);
      return other ? other.username : 'Direct Message';
    }
    return 'Unnamed Chat';
  };

  const getChatTypeLabel = (type: string) => {
    switch (type) {
      case 'group': return 'Group';
      case 'project': return 'Project';
      case 'team': return 'Team';
      default: return '';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--line)' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-text-primary tracking-tight">Messages</span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setSearchOpen(!searchOpen); if (searchOpen) setSearchQuery(''); }}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              style={{ background: searchOpen ? 'hsl(var(--accent-soft))' : 'transparent' }}
              aria-label="Toggle search"
            >
              {searchOpen ? <X className="h-3.5 w-3.5" style={{ color: 'hsl(var(--primary))' }} /> : <Search className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
              style={{ background: 'transparent' }}
              aria-label="New chat"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Search bar — slides in */}
        <div
          style={{
            overflow: 'hidden',
            maxHeight: searchOpen ? 40 : 0,
            opacity: searchOpen ? 1 : 0,
            marginBottom: searchOpen ? 10 : 0,
            transition: 'max-height 220ms var(--ease-out-quint), opacity 160ms var(--ease-standard), margin-bottom 160ms var(--ease-standard)',
          }}
        >
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-tertiary pointer-events-none" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-sm text-text-primary placeholder:text-text-tertiary rounded-lg outline-none"
              style={{
                background: 'hsl(var(--surface-muted))',
                border: '1px solid hsl(var(--border))',
                fontSize: '0.8125rem',
              }}
            />
          </div>
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                filter === f.value
                  ? {
                      background: 'hsl(var(--accent-soft))',
                      color: 'hsl(var(--primary))',
                      border: '1px solid hsl(var(--primary) / 0.25)',
                    }
                  : {
                      background: 'transparent',
                      color: 'hsl(var(--text-tertiary))',
                      border: '1px solid transparent',
                    }
              }
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat list */}
      <ScrollArea className="flex-1 no-scrollbar">
        {shouldShowLoading ? (
          <ChatListSkeleton />
        ) : filteredChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12 px-6 text-center">
            <div className="h-8 w-8 flex items-center justify-center rounded-xl" style={{ background: 'hsl(var(--surface-muted))' }}>
              <MessageSquare className="h-4 w-4 text-text-tertiary" />
            </div>
            <p className="text-xs text-text-tertiary">No conversations found</p>
          </div>
        ) : (
          <div className="py-1">
            {filteredChats.map((chat) => {
              const isSelected = selectedChatId === chat.id;
              const chatName = getChatName(chat);
              const isDirect = chat.type === 'direct';
              const otherMember = getOtherMember(chat);
              // For groups show up to 3 members (excluding self)
              const groupMembers = !isDirect
                ? (chat.members ?? []).filter((m) => m.id !== currentUserId).slice(0, 3)
                : [];
              const typeLabel = getChatTypeLabel(chat.type);

              return (
                <button
                  key={chat.id}
                  onClick={() => onChatSelect(chat.id)}
                  className="w-full text-left px-3 py-2.5 flex items-center gap-3 relative transition-colors"
                  style={{ background: isSelected ? 'hsl(var(--accent-soft))' : 'transparent' }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'hsl(var(--surface-muted))';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  {/* Selected left bar */}
                  {isSelected && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                      style={{ background: 'hsl(var(--primary))' }}
                    />
                  )}

                  {/* Avatar area */}
                  <div className="relative flex-shrink-0">
                    {isDirect ? (
                      /* Single person avatar */
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={otherMember?.avatarUrl} />
                        <AvatarFallback
                          className="text-xs font-medium"
                          style={{ background: 'hsl(var(--accent-soft))', color: 'hsl(var(--primary))' }}
                        >
                          {otherMember ? getInitials(otherMember.username) : '?'}
                        </AvatarFallback>
                      </Avatar>
                    ) : groupMembers.length > 0 ? (
                      /* Stacked avatars for group/team/project */
                      <div className="relative h-9 w-9">
                        {groupMembers.length === 1 ? (
                          <Avatar className="h-9 w-9">
                            <AvatarImage src={groupMembers[0].avatarUrl} />
                            <AvatarFallback
                              className="text-xs font-medium"
                              style={{ background: 'hsl(var(--surface-muted))', color: 'hsl(var(--text-secondary))' }}
                            >
                              {getInitials(groupMembers[0].username)}
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <>
                            {/* Back avatar (bottom-right) */}
                            <Avatar
                              className="absolute bottom-0 right-0 h-6 w-6 ring-2"
                              style={{ '--tw-ring-color': 'hsl(var(--surface))' } as React.CSSProperties}
                            >
                              <AvatarImage src={groupMembers[1]?.avatarUrl} />
                              <AvatarFallback
                                style={{
                                  background: 'hsl(var(--surface-muted))',
                                  color: 'hsl(var(--text-tertiary))',
                                  fontSize: '0.5rem',
                                  fontWeight: 600,
                                }}
                              >
                                {groupMembers[1] ? getInitials(groupMembers[1].username) : '?'}
                              </AvatarFallback>
                            </Avatar>
                            {/* Front avatar (top-left) */}
                            <Avatar
                              className="absolute top-0 left-0 h-6 w-6 ring-2"
                              style={{ '--tw-ring-color': 'hsl(var(--surface))' } as React.CSSProperties}
                            >
                              <AvatarImage src={groupMembers[0].avatarUrl} />
                              <AvatarFallback
                                style={{
                                  background: 'hsl(var(--accent-soft))',
                                  color: 'hsl(var(--primary))',
                                  fontSize: '0.5rem',
                                  fontWeight: 600,
                                }}
                              >
                                {getInitials(groupMembers[0].username)}
                              </AvatarFallback>
                            </Avatar>
                          </>
                        )}
                      </div>
                    ) : (
                      /* Fallback icon for empty group */
                      <div
                        className="h-9 w-9 flex items-center justify-center rounded-full"
                        style={{
                          background: 'hsl(var(--surface-muted))',
                          color: 'hsl(var(--text-secondary))',
                          border: '1px solid var(--line)',
                        }}
                      >
                        {chat.type === 'project' ? (
                          <Hash className="h-3.5 w-3.5" />
                        ) : (
                          <Users className="h-3.5 w-3.5" />
                        )}
                      </div>
                    )}

                    {/* Unread badge */}
                    {chat.unreadCount && chat.unreadCount > 0 ? (
                      <span
                        className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center rounded-full text-white px-1"
                        style={{
                          background: 'hsl(var(--primary))',
                          fontSize: '0.625rem',
                          fontWeight: 600,
                          lineHeight: 1,
                        }}
                      >
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    ) : null}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="truncate text-sm"
                          style={{ fontWeight: chat.unreadCount ? 600 : 500, color: 'hsl(var(--text-primary))' }}
                        >
                          {chatName}
                        </span>
                        {/* Type badge for non-direct chats */}
                        {typeLabel && (
                          <span
                            className="flex-shrink-0 rounded px-1 py-0.5 leading-none"
                            style={{
                              fontSize: '0.5625rem',
                              fontWeight: 500,
                              background: 'hsl(var(--surface-muted))',
                              color: 'hsl(var(--text-tertiary))',
                              border: '1px solid var(--line)',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                            }}
                          >
                            {typeLabel}
                          </span>
                        )}
                      </div>
                      {chat.lastMessage && (
                        <span className="flex-shrink-0 text-text-tertiary" style={{ fontSize: '0.6875rem' }}>
                          {formatTime(chat.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {chat.lastMessage && (
                      <p
                        className="truncate mt-0.5"
                        style={{
                          fontSize: '0.75rem',
                          color: chat.unreadCount ? 'hsl(var(--text-secondary))' : 'hsl(var(--text-tertiary))',
                          fontWeight: chat.unreadCount ? 500 : 400,
                        }}
                      >
                        {chat.lastMessage.content}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>

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
