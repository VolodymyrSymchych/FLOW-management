'use client';

import { useEffect, useState } from 'react';
import { Users, Mail, Trash2, Plus, Clock } from 'lucide-react';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: number;
  userId: number;
  teamId: number;
  role: string;
  joinedAt: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
  workedHours?: number;
}

interface ProjectTeamManagementProps {
  projectId: number;
  teamId?: number;
}

export function ProjectTeamManagement({ projectId, teamId }: ProjectTeamManagementProps) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('member');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (teamId) {
      loadTeamMembers();
    } else {
      setLoading(false);
    }
  }, [teamId]);

  const loadTeamMembers = async () => {
    try {
      const response = await axios.get(`/api/teams/${teamId}/members`);
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    try {
      await axios.post(`/api/teams/${teamId}/members`, {
        userEmail: newMemberEmail,
        role: newMemberRole,
      });
      setNewMemberEmail('');
      setNewMemberRole('member');
      setShowAddMember(false);
      loadTeamMembers();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const removeMember = async (userId: number) => {
    if (!confirm('Are you sure you want to remove this member?')) return;

    try {
      await axios.delete(`/api/teams/${teamId}/members`, {
        data: { userId },
      });
      loadTeamMembers();
    } catch (error) {
      console.error('Failed to remove member:', error);
      alert('Failed to remove member');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-primary/20 text-primary border-primary/30';
      case 'admin':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'member':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  if (!teamId) {
    return (
      <div className="glass-light rounded-xl p-8 border border-white/10 text-center">
        <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
        <p className="text-text-secondary">No team assigned to this project</p>
        <p className="text-xs text-text-tertiary mt-2">
          Assign a team to manage members and track hours
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-light rounded-xl p-8 border border-white/10">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-white/5 rounded w-1/4"></div>
          <div className="h-12 bg-white/5 rounded"></div>
          <div className="h-12 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-text-primary flex items-center space-x-2">
            <Users className="w-5 h-5 text-primary" />
            <span>Team Members</span>
          </h3>
          <p className="text-sm text-text-tertiary mt-1">
            {members.length} {members.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        <button
          onClick={() => setShowAddMember(!showAddMember)}
          className="flex items-center space-x-2 px-3 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Member</span>
        </button>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <form onSubmit={addMember} className="glass-medium rounded-xl p-4 border border-white/10">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={newMemberEmail}
                onChange={(e) => setNewMemberEmail(e.target.value)}
                placeholder="member@example.com"
                className="w-full px-3 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Role
              </label>
              <select
                value={newMemberRole}
                onChange={(e) => setNewMemberRole(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary text-sm"
              >
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddMember(false)}
                className="px-3 py-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={adding}
                className="px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {adding ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.length > 0 ? (
          members.map((member) => (
            <div
              key={member.id}
              className="glass-light rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                    {member.user.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-text-primary truncate">
                        {member.user.name || member.user.email}
                      </p>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full border font-medium',
                          getRoleColor(member.role)
                        )}
                      >
                        {member.role}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <p className="text-xs text-text-tertiary flex items-center space-x-1">
                        <Mail className="w-3 h-3" />
                        <span>{member.user.email}</span>
                      </p>
                      {member.workedHours !== undefined && (
                        <p className="text-xs text-text-tertiary flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{member.workedHours}h worked</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                {member.role !== 'owner' && (
                  <button
                    onClick={() => removeMember(member.userId)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Remove member"
                  >
                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="glass-light rounded-lg p-8 border border-white/10 text-center">
            <Users className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
            <p className="text-text-secondary">No team members yet</p>
            <p className="text-xs text-text-tertiary mt-1">
              Add members to start collaborating
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
