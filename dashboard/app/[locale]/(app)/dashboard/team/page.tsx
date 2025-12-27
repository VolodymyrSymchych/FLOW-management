'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Users, Mail, MoreVertical, UserPlus, Clock, Calendar, Building2 } from 'lucide-react';
import { useTeams, useTeamMembers } from '@/hooks/useQueries';

interface TeamMember {
  id: number;
  userId: number;
  role: string;
  user?: {
    id: number;
    username: string;
    fullName?: string | null;
    email: string;
  };
  attendance?: {
    totalHours: number;
    todayHours: number;
    weekHours: number;
  };
}

// Skeleton для members
function MembersSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1,2,3,4,5,6].map((i) => (
        <div key={i} className="glass-medium rounded-2xl p-6 animate-pulse">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-14 h-14 rounded-full bg-white/10" />
              <div className="space-y-2">
                <div className="h-4 w-24 bg-white/10 rounded" />
                <div className="h-3 w-16 bg-white/10 rounded" />
              </div>
            </div>
          </div>
          <div className="h-3 w-40 bg-white/10 rounded mb-4" />
          <div className="space-y-2 mb-4">
            <div className="h-3 w-full bg-white/10 rounded" />
            <div className="h-3 w-full bg-white/10 rounded" />
          </div>
          <div className="h-8 w-full bg-white/10 rounded" />
        </div>
      ))}
    </div>
  );
}

// Skeleton для всієї сторінки
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-10 w-48 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-64 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="glass-medium rounded-xl p-4 border border-white/10">
        <div className="h-4 w-24 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-10 w-64 bg-white/10 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => (
          <div key={i} className="glass-medium rounded-2xl p-6 animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-20 bg-white/10 rounded" />
                <div className="h-6 w-12 bg-white/10 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <MembersSkeleton />
    </div>
  );
}

function TeamPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  
  // React Query для teams - кешовано, миттєве при повторному відвідуванні
  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  
  // React Query для members - кешовано по teamId
  const { 
    data: members = [], 
    isLoading: membersLoading,
    isFetching: membersFetching 
  } = useTeamMembers(selectedTeamId || 0);

  // Встановити selectedTeamId з URL або перший team
  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    if (teamIdParam) {
      setSelectedTeamId(Number(teamIdParam));
    } else if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [searchParams, teams, selectedTeamId]);

  // Показуємо skeleton тільки при першому завантаженні (немає кешу)
  const isInitialLoading = teamsLoading && teams.length === 0;
  
  if (isInitialLoading) {
    return <PageSkeleton />;
  }

  // Показуємо skeleton для members тільки при першому завантаженні цієї команди
  const showMembersSkeleton = membersLoading && members.length === 0 && selectedTeamId;

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

      {/* Team Selection */}
      {teams.length > 0 && (
        <div className="glass-medium rounded-xl p-4 border border-white/10">
          <label className="block text-sm font-medium text-text-primary mb-2 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Select Team
            {membersFetching && !membersLoading && (
              <span className="ml-2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            )}
          </label>
          <select
            value={selectedTeamId || ''}
            onChange={(e) => {
              const teamId = Number(e.target.value);
              setSelectedTeamId(teamId);
              router.push(`/team?teamId=${teamId}`);
            }}
            className="w-full md:w-64 px-4 py-2 rounded-lg glass-light border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {teams.map((team) => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="glass-medium rounded-2xl p-12 text-center">
          <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No Teams Yet</h3>
          <p className="text-text-secondary mb-6">Create your first team to get started</p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-medium rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
                  <Users className="w-6 h-6 text-[#8098F9]" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Members</p>
                  <p className="text-2xl font-bold text-text-primary">{members.length}</p>
                </div>
              </div>
            </div>

            <div className="glass-medium rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
                  <Clock className="w-6 h-6 text-[#00D66B]" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Total Hours Today</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {members.reduce((sum: number, m: TeamMember) => sum + (m.attendance?.todayHours || 0), 0).toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>

            <div className="glass-medium rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">This Week</p>
                  <p className="text-2xl font-bold text-text-primary">
                    {members.reduce((sum: number, m: TeamMember) => sum + (m.attendance?.weekHours || 0), 0).toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Team Members Grid */}
          {showMembersSkeleton ? (
            <MembersSkeleton />
          ) : members.length === 0 ? (
            <div className="glass-medium rounded-2xl p-12 text-center">
              <Users className="w-16 h-16 text-text-tertiary mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-text-primary mb-2">No Members</h3>
              <p className="text-text-secondary">This team doesn't have any members yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member: TeamMember) => {
                const user = member.user;
                if (!user) return null;

                const initials = user.fullName
                  ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                  : user.username.slice(0, 2).toUpperCase();

                return (
                  <div key={member.id} className="glass-medium glass-hover rounded-2xl p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-[#8098F9] flex items-center justify-center text-white font-semibold text-lg">
                            {initials}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-text-primary">
                            {user.fullName || user.username}
                          </h3>
                          <p className="text-sm text-text-secondary">{member.role}</p>
                        </div>
                      </div>
                      <button className="p-1 glass-subtle hover:glass-light rounded transition-all">
                        <MoreVertical className="w-5 h-5 text-text-tertiary" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-text-secondary mb-4">
                      <Mail className="w-4 h-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    {/* Attendance Stats */}
                    {member.attendance && (
                      <div className="mb-4 space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Today:</span>
                          <span className="text-text-primary font-medium">{member.attendance.todayHours}h</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">This Week:</span>
                          <span className="text-text-primary font-medium">{member.attendance.weekHours}h</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-text-tertiary">Total:</span>
                          <span className="text-text-primary font-medium">{member.attendance.totalHours}h</span>
                        </div>
                      </div>
                    )}

                    <button
                      onClick={() => router.push(`/profile/${user.id}`)}
                      className="w-full py-2 glass-light rounded-lg text-sm font-medium text-text-primary hover:glass-medium transition-all"
                    >
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <TeamPageContent />
    </Suspense>
  );
}
