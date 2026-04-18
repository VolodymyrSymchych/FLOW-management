'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import axios from 'axios';
import { useUser } from '@/hooks/useUser';

interface User {
  id: number;
  username: string;
  fullName?: string;
  avatarUrl?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  onMention?: (userId: number) => void;
  className?: string;
}

export function MentionInput({
  value,
  onChange,
  placeholder = 'Add a comment...',
  rows = 3,
  onMention,
  className = '',
}: MentionInputProps) {
  const { user: currentUser } = useUser();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [suggestions, setSuggestions] = useState<User[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const fetchUserSuggestions = useCallback(async (query: string) => {
    try {
      const response = await axios.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      setSuggestions(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch user suggestions:', error);
      setSuggestions([]);
    }
  }, []);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(text);
    
    // Знайти @mention pattern перед курсором
    const textBeforeCursor = text.substring(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);
    
    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      setMentionStart(cursorPos - query.length - 1);
      setShowSuggestions(true);
      setSelectedIndex(0);
      
      if (query.length > 0) {
        fetchUserSuggestions(query);
      } else {
        // Показати всіх користувачів якщо просто @
        fetchUserSuggestions('');
      }
    } else {
      setShowSuggestions(false);
      setMentionStart(null);
    }
  };

  const insertMention = (user: User) => {
    if (mentionStart === null || !textareaRef.current) return;

    const text = value;
    const beforeMention = text.substring(0, mentionStart);
    const afterMention = text.substring(textareaRef.current.selectionStart);
    const newText = `${beforeMention}@${user.username} ${afterMention}`;
    
    onChange(newText);
    setShowSuggestions(false);
    setMentionStart(null);
    
    // Встановити курсор після вставленого mention
    setTimeout(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionStart + user.username.length + 2; // +2 for @ and space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
        textareaRef.current.focus();
      }
    }, 0);

    if (onMention) {
      onMention(user.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % suggestions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        insertMention(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    }
  };

  // Позиціонування suggestions
  useEffect(() => {
    if (showSuggestions && textareaRef.current && suggestionsRef.current) {
      const textarea = textareaRef.current;
      const rect = textarea.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      suggestionsRef.current.style.top = `${rect.bottom + scrollTop + 5}px`;
      suggestionsRef.current.style.left = `${rect.left}px`;
      suggestionsRef.current.style.width = `${rect.width}px`;
    }
  }, [showSuggestions, value]);

  // Highlight mentions in text
  const renderContent = (text: string) => {
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span key={index} className="text-primary-500 font-medium">
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none ${className}`}
      />
      
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 glass-light border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto backdrop-blur-xl"
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-text-tertiary">
              No users found
            </div>
          ) : (
            suggestions.map((user, index) => (
              <div
                key={user.id}
                onClick={() => insertMention(user)}
                className={`px-4 py-2 cursor-pointer flex items-center space-x-3 transition-colors ${
                  index === selectedIndex
                    ? 'bg-primary-500/20'
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                  {user.username[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">
                    {user.fullName || user.username}
                  </p>
                  {user.fullName && (
                    <p className="text-xs text-text-tertiary truncate">
                      @{user.username}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

