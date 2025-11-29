'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search } from 'lucide-react';

interface User {
  id: number;
  username: string;
  avatarUrl?: string;
  email: string;
}

interface Project {
  id: number;
  name: string;
}

interface CreateChatModalProps {
  open: boolean;
  onClose: () => void;
  onChatCreated: (chatId: number) => void;
}

export function CreateChatModal({
  open,
  onClose,
  onChatCreated,
}: CreateChatModalProps) {
  const [chatType, setChatType] = useState<'direct' | 'group' | 'project'>(
    'direct'
  );
  const [chatName, setChatName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (open) {
      loadUsers();
      loadProjects();
    }
  }, [open]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const data = await response.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const createChat = async () => {
    setLoading(true);
    try {
      const body: any = {
        type: chatType,
      };

      if (chatType === 'group') {
        body.name = chatName;
      }

      if (chatType === 'project') {
        body.projectId = selectedProject;
      }

      const response = await fetch('/api/chat/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        const chatId = data.chat.id;

        // Add members to chat
        if (selectedUsers.length > 0) {
          await Promise.all(
            selectedUsers.map((userId) =>
              fetch(`/api/chat/chats/${chatId}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
              })
            )
          );
        }

        onChatCreated(chatId);
        handleClose();
      }
    } catch (error) {
      console.error('Failed to create chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setChatType('direct');
    setChatName('');
    setSelectedUsers([]);
    setSelectedProject(null);
    setSearchQuery('');
    onClose();
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const canCreate = () => {
    if (chatType === 'direct') return selectedUsers.length === 1;
    if (chatType === 'group') return chatName && selectedUsers.length >= 2;
    if (chatType === 'project') return selectedProject !== null;
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Створити новий чат</DialogTitle>
          <DialogDescription>
            Оберіть тип чату та учасників
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Chat Type */}
          <div className="space-y-2">
            <Label>Тип чату</Label>
            <Select
              value={chatType}
              onValueChange={(value: any) => setChatType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Прямий чат</SelectItem>
                <SelectItem value="group">Група</SelectItem>
                <SelectItem value="project">Проектний чат</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Group Name */}
          {chatType === 'group' && (
            <div className="space-y-2">
              <Label>Назва групи</Label>
              <Input
                placeholder="Введіть назву групи"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          )}

          {/* Project Selection */}
          {chatType === 'project' && (
            <div className="space-y-2">
              <Label>Проект</Label>
              <Select
                value={selectedProject?.toString()}
                onValueChange={(value) => setSelectedProject(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Оберіть проект" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* User Selection */}
          {(chatType === 'direct' || chatType === 'group') && (
            <div className="space-y-2">
              <Label>
                Учасники
                {chatType === 'direct' && ' (оберіть 1 користувача)'}
                {chatType === 'group' && ' (мінімум 2 користувача)'}
              </Label>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
                <Input
                  placeholder="Пошук користувачів..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* User List */}
              <ScrollArea className="h-64 rounded-md border">
                <div className="p-2 space-y-1">
                  {filteredUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 rounded-md p-2 hover:bg-accent cursor-pointer"
                      onClick={() => toggleUserSelection(user.id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(user.id)}
                        onCheckedChange={() => toggleUserSelection(user.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatarUrl} />
                        <AvatarFallback>
                          {user.username.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{user.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Скасувати
          </Button>
          <Button onClick={createChat} disabled={!canCreate() || loading}>
            {loading ? 'Створення...' : 'Створити'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

