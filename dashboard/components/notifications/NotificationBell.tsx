'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCheck, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { createPortal } from 'react-dom';
import { Button } from '@/components/ui/button';
import { IconButton } from '@/components/ui/icon-button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Notification {
  id: number;
  type: string;
  title: string;
  content: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
}

const toneMap: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'> = {
  friend_request: 'info',
  friend_accepted: 'success',
  project_invite: 'primary',
  task_assigned: 'warning',
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showNotifications && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({ top: rect.bottom + 10, right: window.innerWidth - rect.right });
    }
  }, [showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        buttonRef.current &&
        dropdownRef.current &&
        !buttonRef.current.contains(event.target as Node) &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
      if (response.ok) {
        setNotifications((prev) => prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)));
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const unreadCount = useMemo(() => notifications.filter((notification) => !notification.read).length, [notifications]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        data-testid="notification-bell"
        onClick={() => setShowNotifications((prev) => !prev)}
        className="ib"
      >
        <Bell />
        {unreadCount > 0 ? (
          <span className="dot" />
        ) : null}
      </button>

      {showNotifications && mounted && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setShowNotifications(false)} />
          <div
            ref={dropdownRef}
            className="fixed z-[10000] w-[24rem] overflow-hidden rounded-2xl border border-border bg-surface shadow-floating"
            style={{ top: `${dropdownPosition.top}px`, right: `${dropdownPosition.right}px` }}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="app-eyebrow">Inbox</div>
                <h3 className="text-base font-semibold text-text-primary">Notifications</h3>
              </div>
              <IconButton icon={<X className="h-4 w-4" />} label="Close notifications" onClick={() => setShowNotifications(false)} />
            </div>

            <div className="max-h-[28rem] overflow-y-auto scrollbar-thin">
              {notifications.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-muted text-text-tertiary">
                    <Bell className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-text-primary">No notifications yet</p>
                  <p className="mt-1 text-sm text-text-secondary">Everything new in the workspace will appear here.</p>
                </div>
              ) : (
                notifications.map((notification) => {
                  const tone = toneMap[notification.type] ?? 'neutral';
                  return (
                    <button
                      key={notification.id}
                      type="button"
                      onClick={async () => {
                        if (!notification.read) {
                          await markAsRead(notification.id);
                        }
                        if (notification.actionUrl) {
                          window.location.href = notification.actionUrl;
                        }
                      }}
                      className={cn(
                        'flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left transition-colors last:border-b-0 hover:bg-surface-muted',
                        !notification.read && 'bg-accent-soft/60'
                      )}
                    >
                      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-text-primary">
                        {notification.title.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold text-text-primary">{notification.title}</p>
                          <Badge tone={tone} variant="soft">
                            {notification.type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-text-secondary">{notification.content}</p>
                        <p className="mt-2 text-xs text-text-tertiary">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                      {!notification.read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" /> : null}
                    </button>
                  );
                })
              )}
            </div>

            {notifications.length > 0 ? (
              <div className="border-t border-border px-4 py-3">
                <Button
                  variant="ghost"
                  tone="neutral"
                  fullWidth
                  icon={<CheckCheck className="h-4 w-4" />}
                  onClick={() => notifications.forEach((notification) => !notification.read && markAsRead(notification.id))}
                >
                  Mark all as read
                </Button>
              </div>
            ) : null}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}
