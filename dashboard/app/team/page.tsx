'use client';

import { Users, Mail, MoreVertical, UserPlus } from 'lucide-react';

const teamMembers = [
  { name: 'Alex Rogue', role: 'Admin', email: 'alex@example.com', avatar: 'AR', status: 'online' },
  { name: 'John Doe', role: 'Developer', email: 'john@example.com', avatar: 'JD', status: 'online' },
  { name: 'Sarah Kim', role: 'Designer', email: 'sarah@example.com', avatar: 'SK', status: 'offline' },
  { name: 'Mike Ross', role: 'Developer', email: 'mike@example.com', avatar: 'MR', status: 'online' },
  { name: 'Lisa Chen', role: 'Product Manager', email: 'lisa@example.com', avatar: 'LC', status: 'offline' },
  { name: 'Tom Wilson', role: 'QA Engineer', email: 'tom@example.com', avatar: 'TW', status: 'online' },
];

export default function TeamPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Team</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage your team members and roles
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{teamMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Online Now</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {teamMembers.filter(m => m.status === 'online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Projects</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="bg-white dark:bg-card-dark rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-semibold text-lg">
                    {member.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-card-dark ${
                    member.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{member.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{member.role}</p>
                </div>
              </div>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
              <Mail className="w-4 h-4" />
              <span>{member.email}</span>
            </div>
            <button className="w-full py-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
