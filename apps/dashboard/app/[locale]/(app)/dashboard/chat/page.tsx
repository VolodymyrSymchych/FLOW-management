'use client';

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
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
        <p className="text-sm text-text-tertiary">Please sign in</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
      {/* Sidebar */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'var(--line-strong)', background: 'hsl(var(--surface))' }}>
        <ChatList
          onChatSelect={setSelectedChatId}
          selectedChatId={selectedChatId}
          currentUserId={user.id}
        />
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0" style={{ background: 'hsl(var(--background))' }}>
        {selectedChatId ? (
          <ChatWindow chatId={selectedChatId} currentUserId={user.id} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3">
            <div
              className="flex flex-col items-center gap-4 text-center"
              style={{ maxWidth: 320 }}
            >
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl"
                style={{
                  background: 'hsl(var(--accent-soft))',
                  border: '1px solid hsl(var(--primary) / 0.2)',
                }}
              >
                <MessageSquare className="h-6 w-6" style={{ color: 'hsl(var(--primary))' }} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary mb-1">Select a conversation</h2>
                <p className="text-sm text-text-tertiary leading-relaxed">
                  Choose a chat from the sidebar or start a new one
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
