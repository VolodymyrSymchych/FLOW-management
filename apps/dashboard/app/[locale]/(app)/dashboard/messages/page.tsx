'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MailPlus, MessageSquare, Plus, Send } from 'lucide-react';
import axios from 'axios';
import { useChat, type Chat } from '@/hooks/useChat';
import { useChats, useChatWithMessages, usePrefetch } from '@/hooks/useQueries';
import { useUser } from '@/hooks/useUser';

function initials(value?: string | null) {
  if (!value) return 'FL';
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function avatarColor(index: number) {
  return ['#c4548e', '#3D7A5A', '#2E5DA8', '#B8870A', '#6941C6', '#E8753A'][index % 6];
}

export default function MessagesPage() {
  const { user } = useUser();
  const { createDirectChat } = useChat();
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useChats();
  const { prefetchChat } = usePrefetch();

  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [filter, setFilter] = useState<'all' | 'direct' | 'group'>('all');
  const [showComposer, setShowComposer] = useState(false);
  const [newChatRecipient, setNewChatRecipient] = useState('');
  const [reply, setReply] = useState('');

  const { data: chatData, refetch: refetchChat } = useChatWithMessages(selectedChatId);

  useEffect(() => {
    if (!selectedChatId && chats.length > 0) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  const filteredChats = useMemo(() => chats.filter((chat) => filter === 'all' || chat.type === filter), [chats, filter]);

  const getOtherMember = (chat: Chat) => {
    if (chat.type !== 'direct' || !chat.members || !user) return null;
    return chat.members.find((member) => member.user.id !== user.id)?.user || null;
  };

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;
    const otherMember = getOtherMember(chat);
    return otherMember?.fullName || otherMember?.username || 'Conversation';
  };

  const getChatSubtitle = (chat: Chat) => {
    if (chat.lastMessage?.content) return chat.lastMessage.content;
    return chat.type === 'group' ? 'Team workspace conversation' : 'Start the conversation';
  };

  const selectedChat = filteredChats.find((chat) => chat.id === selectedChatId) || chats.find((chat) => chat.id === selectedChatId) || null;
  const selectedMessages = chatData?.messages || [];
  const selectedOtherMember = selectedChat ? getOtherMember(selectedChat) : null;

  const handleNewDirectChat = async () => {
    if (!newChatRecipient.trim()) return;
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(newChatRecipient)}`);
      const users = response.data.users || [];
      if (users.length === 0) {
        alert('User not found');
        return;
      }
      const chat = await createDirectChat(users[0].id);
      setSelectedChatId(chat.id);
      setShowComposer(false);
      setNewChatRecipient('');
      refetchChats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create chat');
    }
  };

  const handleReply = async () => {
    if (!reply.trim() || !selectedChatId) return;
    try {
      await axios.post(`/api/chat/${selectedChatId}/messages`, { content: reply, messageType: 'text' });
      setReply('');
      await refetchChat();
      await refetchChats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send message');
    }
  };

  return (
    <div className="messages-screen" data-testid="messages-screen">
      <div className="sg-wrap messages-shell" style={{ minHeight: 'calc(100vh - 51px)' }}>
        <div className="inbox-sidebar" data-testid="messages-list-pane">
          <div className="inbox-hd">
            <div className="inbox-hd-title">Inbox</div>
            <button type="button" className="inbox-action-btn" onClick={() => setShowComposer(true)} aria-label="New message">
              <Plus />
            </button>
          </div>

          <div className="inbox-tabs">
            <button type="button" className={`inbox-tab ${filter === 'all' ? 'on' : ''}`} onClick={() => setFilter('all')}>
              All
              <span className="inbox-tab-cnt">{chats.length}</span>
            </button>
            <button type="button" className={`inbox-tab ${filter === 'direct' ? 'on' : ''}`} onClick={() => setFilter('direct')}>
              Direct
            </button>
            <button type="button" className={`inbox-tab ${filter === 'group' ? 'on' : ''}`} onClick={() => setFilter('group')}>
              Group
            </button>
          </div>

          <div className="inbox-list">
            {chatsLoading ? (
              <div style={{ padding: 14, fontSize: 14, color: 'var(--muted)' }}>Loading conversations...</div>
            ) : filteredChats.length > 0 ? (
              filteredChats.map((chat, index) => {
                const otherMember = getOtherMember(chat);
                const unread = !!chat.lastMessage && chat.lastMessage.senderId !== user?.id && !chat.lastMessage.readAt;
                return (
                  <button
                    key={chat.id}
                    type="button"
                    className={`inbox-item ${selectedChatId === chat.id ? 'on' : ''} ${unread ? 'unread' : ''}`}
                    onClick={() => setSelectedChatId(chat.id)}
                    onMouseEnter={() => prefetchChat(chat.id)}
                  >
                    <div className="inbox-av" style={{ background: avatarColor(index) }}>{initials(getChatDisplayName(chat))}</div>
                    <div className="inbox-body">
                      <div className="inbox-row1">
                        <div className="inbox-who">{getChatDisplayName(chat)}</div>
                        <div className="inbox-time">{chat.updatedAt ? formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true }) : ''}</div>
                      </div>
                      <div className="inbox-subject">{chat.type === 'group' ? 'Group workspace thread' : otherMember?.username || 'Direct conversation'}</div>
                      <div className="inbox-preview">{getChatSubtitle(chat)}</div>
                    </div>
                    {unread ? <div className="inbox-unread-dot" /> : null}
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 16, fontSize: 14, color: 'var(--muted)' }}>No conversations found.</div>
            )}
          </div>
        </div>

        <div className="inbox-detail" data-testid="messages-detail-pane">
          {selectedChat ? (
            <div className="inbox-msg">
              <div className="inbox-msg-hd">
                <div className="inbox-msg-av" style={{ background: avatarColor(0) }}>{initials(getChatDisplayName(selectedChat))}</div>
                <div>
                  <div className="inbox-msg-from">{getChatDisplayName(selectedChat)}</div>
                  <div className="inbox-msg-meta">{selectedChat.type === 'group' ? 'Group workspace conversation' : selectedOtherMember?.username || 'Direct thread'}</div>
                </div>
              </div>
              <div className="inbox-msg-subject">{selectedChat.lastMessage?.content ? 'Latest conversation update' : 'Start the conversation'}</div>
              <div className="inbox-msg-body">
                {selectedMessages.length > 0 ? (
                  selectedMessages.map((message: any, index: number) => (
                    <p key={message.id || index}>
                      <strong>{message.sender?.fullName || message.sender?.username || 'User'}:</strong> {message.content}
                    </p>
                  ))
                ) : (
                  <p>No messages yet in this thread.</p>
                )}
              </div>
              {selectedChat.lastMessage ? (
                <div className="inbox-msg-task">
                  <div className="inbox-task-row">
                    <MessageSquare style={{ width: 13, height: 13, color: 'var(--violet)' }} />
                    <div style={{ fontSize: 14, color: 'var(--ink)' }}>Last activity: {formatDistanceToNow(new Date(selectedChat.lastMessage.createdAt), { addSuffix: true })}</div>
                  </div>
                </div>
              ) : null}
              <div className="inbox-reply">
                <div className="inbox-reply-av" style={{ background: '#c4548e' }}>{initials(user?.fullName || user?.username || 'FL')}</div>
                <input className="inbox-reply-input" value={reply} onChange={(event) => setReply(event.target.value)} placeholder={`Reply to ${getChatDisplayName(selectedChat)}...`} />
                <button type="button" className="inbox-reply-btn" onClick={handleReply}>Send</button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Select a conversation.</div>
          )}
        </div>
      </div>

      {showComposer ? (
        <div className="modal-overlay open" onClick={() => setShowComposer(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-hd">
              <div className="modal-hd-icon"><MailPlus style={{ width: 15, height: 15, color: 'var(--accent)' }} /></div>
              <div className="modal-hd-title">New Message</div>
              <button type="button" className="modal-close" onClick={() => setShowComposer(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <label className="form-lbl">Recipient</label>
                <input className="form-inp" value={newChatRecipient} onChange={(event) => setNewChatRecipient(event.target.value)} placeholder="username or email" autoFocus />
              </div>
            </div>
            <div className="modal-ft">
              <button type="button" className="btn btn-ghost" onClick={() => setShowComposer(false)}>Cancel</button>
              <button type="button" className="btn btn-acc" onClick={handleNewDirectChat}>Create chat</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
