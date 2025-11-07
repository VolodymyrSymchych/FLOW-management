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
          <h1 className="text-3xl font-bold text-text-primary">Team</h1>
          <p className="text-text-secondary mt-1">
            Manage your team members and roles
          </p>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 glass-button text-white rounded-lg">
          <UserPlus className="w-5 h-5" />
          <span>Invite Member</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-medium rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center shadow-[0_0_15px_rgba(128,152,249,0.4)]">
              <Users className="w-6 h-6 text-[#8098F9]" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Total Members</p>
              <p className="text-2xl font-bold text-text-primary">{teamMembers.length}</p>
            </div>
          </div>
        </div>

        <div className="glass-medium rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center shadow-[0_0_15px_rgba(0,214,107,0.4)]">
              <div className="w-3 h-3 rounded-full bg-[#00D66B]"></div>
            </div>
            <div>
              <p className="text-sm text-text-secondary">Online Now</p>
              <p className="text-2xl font-bold text-text-primary">
                {teamMembers.filter(m => m.status === 'online').length}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-medium rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              <Users className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-text-secondary">Active Projects</p>
              <p className="text-2xl font-bold text-text-primary">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div key={idx} className="glass-medium glass-hover rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-[#8098F9] flex items-center justify-center text-white font-semibold text-lg shadow-[0_0_20px_rgba(128,152,249,0.5)]">
                    {member.avatar}
                  </div>
                  <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white/20 ${
                    member.status === 'online' ? 'bg-[#00D66B]' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div>
                  <h3 className="font-semibold text-text-primary">{member.name}</h3>
                  <p className="text-sm text-text-secondary">{member.role}</p>
                </div>
              </div>
              <button className="p-1 glass-subtle hover:glass-light rounded transition-all">
                <MoreVertical className="w-5 h-5 text-text-tertiary" />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
              <Mail className="w-4 h-4" />
              <span>{member.email}</span>
            </div>
            <button className="w-full py-2 glass-light rounded-lg text-sm font-medium text-text-primary hover:glass-medium transition-all">
              View Profile
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
