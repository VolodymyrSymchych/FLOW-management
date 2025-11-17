'use client';

import { useEffect, useRef, useState } from 'react';
import { Send, Paperclip, Smile, X, CheckCheck } from 'lucide-react';
import { useChat, ChatMessage } from '@/hooks/useChat';
import { useUser } from '@/hooks/useUser';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { ChatWebSocket } from '@/lib/websocket';

interface ChatWindowProps {
  chatId: number;
}

export function ChatWindow({ chatId }: ChatWindowProps) {
  const { messages, sendMessage, addReaction, removeReaction, markMessageAsRead, currentChat } = useChat();
  const { user } = useUser();
  const [input, setInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<{ id: number; username: string }[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    
    // Mark messages as read when viewing
    const unreadMessages = messages.filter(
      m => m.chatId === chatId && m.senderId !== user?.id && !m.readAt
    );
    
    unreadMessages.forEach(message => {
      markMessageAsRead(message.id);
    });
  }, [messages, chatId, user?.id, markMessageAsRead]);

  // Handle typing indicator
  useEffect(() => {
    if (!input.trim()) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    // This would be implemented with WebSocket
    // For now, we'll simulate it

    // Clear typing after 3 seconds of no input
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing indicator
    }, 3000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() && !replyingTo) return;

    try {
      await sendMessage(
        chatId,
        input.trim(),
        'text',
        replyingTo?.id
      );
      setInput('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Create file attachment and send as message
      // This would need to be implemented based on your file attachment system
      console.log('File uploaded:', uploadResponse.data);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleReaction = async (messageId: number, emoji: string) => {
    try {
      const message = messages.find(m => m.id === messageId);
      const existingReaction = message?.reactions?.find(r => r.emoji === emoji && r.user.id === user?.id);

      if (existingReaction) {
        await removeReaction(messageId, emoji);
      } else {
        await addReaction(messageId, emoji);
      }
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
    }
  };

  const chatMessages = messages.filter(m => m.chatId === chatId);

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          chatMessages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${message.senderId === user?.id ? 'order-2' : 'order-1'}`}>
                <div className="flex items-start space-x-2">
                  {message.senderId !== user?.id && (
                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                      {message.sender.username[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    {message.senderId !== user?.id && (
                      <p className="text-xs text-text-secondary mb-1">{message.sender.username}</p>
                    )}
                    <div
                      className={`rounded-lg px-4 py-2 ${
                        message.senderId === user?.id
                          ? 'bg-primary-500 text-white'
                          : 'glass-light border border-white/10 text-text-primary'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      {message.reactions && message.reactions.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {Object.entries(
                            message.reactions.reduce((acc: any, r) => {
                              if (!acc[r.emoji]) acc[r.emoji] = [];
                              acc[r.emoji].push(r.user.username);
                              return acc;
                            }, {})
                          ).map(([emoji, usernames]: [string, any]) => (
                            <button
                              key={emoji}
                              onClick={() => handleReaction(message.id, emoji)}
                              className="text-xs px-2 py-1 rounded bg-white/20 hover:bg-white/30"
                            >
                              {emoji} {usernames.length}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-text-tertiary">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </p>
                      {message.senderId === user?.id && message.readAt && (
                        <CheckCheck className="w-3 h-3 text-primary-500" />
                      )}
                      {message.senderId === user?.id && !message.readAt && (
                        <CheckCheck className="w-3 h-3 text-text-tertiary" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center space-x-2 px-4 py-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-xs text-text-secondary">
              {typingUsers.length === 1 
                ? `${typingUsers[0].username} is typing...`
                : `${typingUsers.length} people are typing...`}
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Reply preview */}
      {replyingTo && (
        <div className="px-4 py-2 glass-light border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-text-tertiary">Replying to {replyingTo.sender.username}</p>
              <p className="text-sm text-text-primary truncate">{replyingTo.content}</p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center space-x-2">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label
            htmlFor="file-upload"
            className="p-2 text-text-tertiary hover:text-text-primary cursor-pointer transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 rounded-lg glass-light border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() && !replyingTo}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

