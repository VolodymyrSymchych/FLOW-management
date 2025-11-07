'use client';

import { Search, Bell, ChevronDown } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import Image from 'next/image';

export function Header() {
  return (
    <header className="sticky top-0 z-30 bg-surface dark:bg-surface border-b border-gray-200 dark:border-gray-800">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left section */}
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-primary">Overview</h1>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-text-secondary">All Teams</span>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 rounded-lg bg-background dark:bg-surface-elevated text-text-primary placeholder:text-text-tertiary border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary w-64"
            />
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-background dark:hover:bg-surface-elevated transition-colors">
            <Bell className="w-5 h-5 text-text-secondary" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>

          {/* User profile */}
          <div className="flex items-center space-x-3 pl-4 border-l border-border">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
              AR
            </div>
            <div className="hidden md:block">
              <div className="text-sm font-semibold text-text-primary">
                Alex Rogue
              </div>
              <div className="text-xs text-text-tertiary">Admin</div>
            </div>
            <ChevronDown className="w-4 h-4 text-text-secondary" />
          </div>
        </div>
      </div>
    </header>
  );
}
