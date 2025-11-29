'use client';

import React, { useState } from 'react';
import { ChatList } from '@/components/chat/ChatList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useUser } from '@/hooks/useUser';
import { Loader } from '@/components/Loader';

export default function ChatPage() {
  const { user, loading } = useUser();
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>();

  if (loading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-text-tertiary">Будь ласка, увійдіть в систему</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full">
      {/* Chat List - Sidebar */}
      <div className="w-96 flex-shrink-0">
        <ChatList
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
        />
      </div>

      {/* Chat Window - Main Content */}
      <div className="flex-1">
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} currentUserId={user.id} />
        ) : (
          <div className="flex h-full items-center justify-center glass-light">
            <div className="text-center glass-medium rounded-lg p-8 border border-white/10">
              <h2 className="mb-2 text-2xl font-semibold text-text-primary">Оберіть чат</h2>
              <p className="text-text-secondary">
                Виберіть чат зі списку або створіть новий
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

