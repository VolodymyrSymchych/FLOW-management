'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  chatMembers?: User[];
}

export function MentionInput({
  value,
  onChange,
  onKeyPress,
  placeholder,
  className,
  chatMembers = [],
}: MentionInputProps) {
  const [showMentions, setShowMentions] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [mentionPosition, setMentionPosition] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter members based on search
  const filteredMembers = chatMembers.filter((member) =>
    member.username.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  useEffect(() => {
    // Reset selected index when filtered list changes
    setSelectedIndex(0);
  }, [mentionSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);

    // Check if user is typing @
    const cursorPosition = e.target.selectionStart || 0;
    const textBeforeCursor = newValue.substring(0, cursorPosition);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');

    if (lastAtSymbol !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtSymbol + 1);
      
      // Check if there's a space after @, if so, don't show mentions
      if (!textAfterAt.includes(' ')) {
        setMentionSearch(textAfterAt);
        setMentionPosition(lastAtSymbol);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (user: User) => {
    const beforeMention = value.substring(0, mentionPosition);
    const afterMention = value.substring(
      mentionPosition + mentionSearch.length + 1
    );

    // Insert mention with special format that includes user ID
    const newValue = `${beforeMention}@user:${user.id}[${user.username}]${afterMention}`;
    onChange(newValue);
    setShowMentions(false);
    setMentionSearch('');

    // Focus back on input
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showMentions && filteredMembers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredMembers.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertMention(filteredMembers[selectedIndex]);
        return;
      } else if (e.key === 'Escape') {
        setShowMentions(false);
        return;
      }
    }

    // Call parent keypress handler
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  // Format display value (replace @user:ID[username] with @username)
  const displayValue = value.replace(/@user:\d+\[([^\]]+)\]/g, '@$1');

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={displayValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${className} glass-input text-text-primary placeholder:text-text-tertiary`}
      />

      {/* Mention Suggestions */}
      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg glass-medium border border-white/10 shadow-lg">
          <ScrollArea className="max-h-48 scrollbar-thin">
            <div className="p-1">
              {filteredMembers.map((member, index) => (
                <button
                  key={member.id}
                  onClick={() => insertMention(member)}
                  className={`flex w-full items-center gap-2 rounded-md p-2 text-left transition-all duration-200 ${
                    index === selectedIndex
                      ? 'glass-medium border border-primary/30'
                      : 'glass-light hover:glass-medium'
                  }`}
                >
                  <Avatar className="h-6 w-6 ring-1 ring-primary/20">
                    <AvatarImage src={member.avatarUrl} />
                    <AvatarFallback className="glass-medium text-text-primary text-xs">
                      {member.username.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-text-primary">
                    @{member.username}
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

