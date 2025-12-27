'use client';

import { useState } from 'react';
import { Search, Plus, MessageSquare } from 'lucide-react';
import { useChat, Chat } from '@/hooks/useChat';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { useUser } from '@/hooks/useUser';
import { useChats, useChatWithMessages, usePrefetch } from '@/hooks/useQueries';
import { ChatListSkeleton } from '@/components/chat/ChatSkeleton';

export default function MessagesPage() {
  const { user } = useUser();
  const { createDirectChat } = useChat();
  
  // React Query для оптимального кешування
  const { data: chats = [], isLoading: chatsLoading, refetch: refetchChats } = useChats();
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const { data: chatData } = useChatWithMessages(selectedChatId);
  const { prefetchChat } = usePrefetch();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatRecipient, setNewChatRecipient] = useState('');

  // Отримуємо currentChat з chatData
  const currentChat = chatData?.chat;

  const handleSelectChat = (chatId: number) => {
    setSelectedChatId(chatId);
  };

  const handleNewDirectChat = async () => {
    if (!newChatRecipient) return;

    try {
      // Search for user by username or email
      const response = await axios.get(`/api/users/search?q=${newChatRecipient}`);
      const users = response.data.users || [];
      
      if (users.length === 0) {
        alert('User not found');
        return;
      }

      const chat = await createDirectChat(users[0].id);
      setSelectedChatId(chat.id);
      setShowNewChatModal(false);
      setNewChatRecipient('');
      refetchChats();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create chat');
    }
  };

  // Prefetch chat on hover for instant loading
  const handleChatHover = (chatId: number) => {
    prefetchChat(chatId);
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    
    if (chat.type === 'direct' && chat.members) {
      return chat.members.some(member => 
        member.user.username.toLowerCase().includes(query) ||
        member.user.fullName?.toLowerCase().includes(query)
      );
    }
    
    return chat.name?.toLowerCase().includes(query);
  });

  const getChatDisplayName = (chat: Chat) => {
    if (chat.name) return chat.name;
    if (chat.type === 'direct' && chat.members) {
      const otherMember = chat.members.find(m => m.user.id !== currentChat?.members?.[0]?.user.id);
      return otherMember?.user.fullName || otherMember?.user.username || 'Unknown User';
    }
    return 'Chat';
  };

  const getChatAvatar = (chat: Chat) => {
    if (chat.type === 'direct' && chat.members) {
      const otherMember = chat.members.find(m => m.user.id !== currentChat?.members?.[0]?.user.id);
      return otherMember?.user.username[0].toUpperCase() || 'U';
    }
    return chat.name?.[0].toUpperCase() || 'G';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Messages</h1>
          <p className="text-text-secondary mt-1">
            Team communication and notifications
          </p>
        </div>
        <button
          onClick={() => setShowNewChatModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
        >
          <Plus className="w-5 h-5" />
          <span>New Message</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 glass-light rounded-xl p-4 border border-white/10">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg glass-light border border-white/10 text-text-primary text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {chatsLoading ? (
              <ChatListSkeleton />
            ) : filteredChats.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No conversations yet</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  onClick={() => handleSelectChat(chat.id)}
                  onMouseEnter={() => handleChatHover(chat.id)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChatId === chat.id
                      ? 'bg-primary-500/20 border border-primary-500/30'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {getChatAvatar(chat)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-text-primary truncate">
                        {getChatDisplayName(chat)}
                      </p>
                      {chat.lastMessage && (
                        <p className="text-sm text-text-secondary truncate">
                          {chat.lastMessage.content}
                        </p>
                      )}
                      {chat.updatedAt && (
                        <p className="text-xs text-text-tertiary mt-1">
                          {formatDistanceToNow(new Date(chat.updatedAt), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 glass-light rounded-xl border border-white/10 flex flex-col" style={{ height: '600px' }}>
          {selectedChatId && user ? (
            <ChatWindow chatId={selectedChatId} currentUserId={user.id} />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-text-tertiary mx-auto mb-3 opacity-50" />
                <p className="text-text-secondary">
                  Select a conversation or start a new message
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-light rounded-xl p-6 max-w-md w-full border border-white/20 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-text-primary">New Message</h2>
            <input
              type="text"
              placeholder="Search by username or email..."
              value={newChatRecipient}
              onChange={(e) => setNewChatRecipient(e.target.value)}
              className="w-full px-4 py-2 rounded-lg glass-light border border-white/10 text-text-primary mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <div className="flex space-x-2">
              <button
                onClick={handleNewDirectChat}
                className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Start Chat
              </button>
              <button
                onClick={() => {
                  setShowNewChatModal(false);
                  setNewChatRecipient('');
                }}
                className="px-4 py-2 glass-light border border-white/10 rounded-lg text-text-primary hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
