'use client';

import { Mail, Send, Search, Plus } from 'lucide-react';

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Team communication and notifications
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <Plus className="w-5 h-5" />
          <span>New Message</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversations List */}
        <div className="lg:col-span-1 bg-white dark:bg-card-dark rounded-2xl p-4 border border-gray-100 dark:border-gray-800">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                    U{i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                      User {i}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      Last message preview...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2 bg-white dark:bg-card-dark rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col" style={{ height: '600px' }}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-semibold">
                U1
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">User 1</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active now</p>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Mail className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  Select a conversation or start a new message
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <button className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
