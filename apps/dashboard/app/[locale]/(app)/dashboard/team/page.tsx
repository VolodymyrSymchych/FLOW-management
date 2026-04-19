'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Users, Mail, MoreVertical, UserPlus, Clock, Calendar, Building2 } from 'lucide-react';
import { useLocale } from 'next-intl';
import { useTeams, useTeamMembers } from '@/hooks/useQueries';
import { useEntityDrawerState } from '@/hooks/useEntityDrawerState';
import { EmployeeAttendanceDrawer } from '@/components/dashboard/EmployeeAttendanceDrawer';

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

const AVATAR_COLORS = ['#c4548e', '#B8870A', '#2E5DA8', '#3D7A5A', '#6941C6', '#E8753A'];

function initials(value?: string | null) {
  if (!value) return 'FL';
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function TeamPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const drawerState = useEntityDrawerState({ param: 'member' });
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  const { data: teams = [], isLoading: teamsLoading } = useTeams();
  const { data: members = [], isLoading: membersLoading, isFetching: membersFetching } = useTeamMembers(selectedTeamId || 0);

  useEffect(() => {
    const teamIdParam = searchParams.get('teamId');
    if (teamIdParam) {
      setSelectedTeamId(Number(teamIdParam));
    } else if (teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [searchParams, teams, selectedTeamId]);

  useEffect(() => {
    if (!drawerState.activeId) {
      setSelectedMember(null);
      return;
    }

    const matchedMember = members.find((member: TeamMember) => String(member.id) === drawerState.activeId);
    if (matchedMember) {
      setSelectedMember(matchedMember);
    }
  }, [drawerState.activeId, members]);

  const isInitialLoading = teamsLoading && teams.length === 0;
  const showMembersSkeleton = membersLoading && members.length === 0 && selectedTeamId;

  if (isInitialLoading) {
    return (
      <div className="scr-inner">
        <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading teams...</div>
      </div>
    );
  }

  const todayHours = members.reduce((sum: number, m: TeamMember) => sum + (m.attendance?.todayHours || 0), 0);
  const weekHours = members.reduce((sum: number, m: TeamMember) => sum + (m.attendance?.weekHours || 0), 0);
  const selectedTeam = teams.find((t) => t.id === selectedTeamId);

  return (
    <div className="scr-inner" data-testid="team-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>
              Team
            </h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>
              {selectedTeam ? `${selectedTeam.name} · ${members.length} members` : 'Manage your team members and roles'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {teams.length > 0 && (
              <div className="chip" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Building2 style={{ width: 13, height: 13 }} />
                <select
                  value={selectedTeamId || ''}
                  onChange={(e) => {
                    const teamId = Number(e.target.value);
                    setSelectedTeamId(teamId);
                    router.push(`${pathname}?teamId=${teamId}`);
                  }}
                  style={{ background: 'transparent', border: 'none', fontSize: 14, color: 'var(--ink)', cursor: 'pointer', outline: 'none' }}
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
                {membersFetching && !membersLoading && (
                  <span style={{ fontSize: 11, color: 'var(--faint)' }}>Updating…</span>
                )}
              </div>
            )}
            <button type="button" className="btn btn-acc">
              <UserPlus style={{ width: 12, height: 12 }} />
              Invite
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {teams.length === 0 ? (
            <div className="surface-panel" style={{ borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid var(--line)' }}>
              <Users style={{ width: 48, height: 48, color: 'var(--ghost)', margin: '0 auto 16px', display: 'block' }} />
              <h3 style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 20, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No Teams Yet</h3>
              <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 24 }}>Create your first team to get started</p>
            </div>
          ) : (
            <>
              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <div className="stat-card">
                  <div className="stat-lbl">Total Members</div>
                  <div className="stat-val">{members.length}</div>
                  <div className="stat-hint">in this team</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">Hours Today</div>
                  <div className="stat-val">{todayHours.toFixed(1)}<span style={{ fontSize: 16, color: 'var(--faint)' }}>h</span></div>
                  <div className="stat-hint" style={{ color: 'var(--sage)' }}>logged today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-lbl">This Week</div>
                  <div className="stat-val">{weekHours.toFixed(1)}<span style={{ fontSize: 16, color: 'var(--faint)' }}>h</span></div>
                  <div className="stat-hint">total hours</div>
                </div>
              </div>

              {/* Members */}
              {showMembersSkeleton ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="surface-panel" style={{ borderRadius: 14, padding: 20, border: '1px solid var(--line)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg2)' }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ height: 14, width: '60%', background: 'var(--bg2)', borderRadius: 4 }} />
                          <div style={{ height: 12, width: '40%', background: 'var(--bg2)', borderRadius: 4, marginTop: 6 }} />
                        </div>
                      </div>
                      <div style={{ height: 12, width: '80%', background: 'var(--bg2)', borderRadius: 4, marginBottom: 12 }} />
                      <div style={{ height: 32, background: 'var(--bg2)', borderRadius: 8 }} />
                    </div>
                  ))}
                </div>
              ) : members.length === 0 ? (
                <div className="surface-panel" style={{ borderRadius: 14, padding: 48, textAlign: 'center', border: '1px solid var(--line)' }}>
                  <Users style={{ width: 48, height: 48, color: 'var(--ghost)', margin: '0 auto 16px', display: 'block' }} />
                  <h3 style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 18, fontWeight: 600, color: 'var(--ink)', marginBottom: 8 }}>No Members</h3>
                  <p style={{ fontSize: 14, color: 'var(--muted)' }}>This team doesn&apos;t have any members yet</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
                  {members.map((member: TeamMember, index: number) => {
                    const user = member.user;
                    if (!user) return null;

                    const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

                    return (
                      <div
                        key={member.id}
                        className="surface-panel proj-card"
                        style={{
                          borderRadius: 14,
                          padding: 20,
                          border: '1px solid var(--line)',
                          cursor: 'pointer',
                          transition: 'box-shadow 0.15s',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,.08)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.boxShadow = '';
                        }}
                        onClick={() => {
                          setSelectedMember(member);
                          drawerState.open(member.id, selectedTeamId ? { teamId: String(selectedTeamId) } : undefined);
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                          <div
                            style={{
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              background: avatarBg,
                              color: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontFamily: 'var(--font-inter), Inter',
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {initials(user.fullName || user.username)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.fullName || user.username}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--faint)' }}>{member.role}</div>
                          </div>
                          <button
                            type="button"
                            className="ib"
                            style={{ width: 28, height: 28 }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical style={{ width: 14, height: 14 }} />
                          </button>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 13, color: 'var(--muted)' }}>
                          <Mail style={{ width: 14, height: 14, flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                        </div>
                        {member.attendance && (
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                            <span style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 10, padding: '2px 7px', background: 'var(--acc-bg)', color: 'var(--accent)', borderRadius: 99 }}>
                              {member.attendance.todayHours}h today
                            </span>
                            <span style={{ fontFamily: 'var(--font-inter), Inter', fontSize: 10, padding: '2px 7px', background: 'var(--bg2)', color: 'var(--muted)', borderRadius: 99 }}>
                              {member.attendance.weekHours}h this week
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-ghost"
                          style={{ width: '100%', justifyContent: 'center' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/${locale}/dashboard/profile/${user.id}`);
                          }}
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
      </div>
      
      <EmployeeAttendanceDrawer 
        member={selectedMember} 
        isOpen={drawerState.isOpen && !!selectedMember} 
        onClose={() => {
          setSelectedMember(null);
          drawerState.close(['teamId']);
        }}
        teamId={selectedTeamId || undefined}
      />
    </div>
  );
}

export default function TeamPage() {
  return (
    <Suspense fallback={<div className="scr-inner" style={{ padding: 24, color: 'var(--muted)' }}>Loading...</div>}>
      <TeamPageContent />
    </Suspense>
  );
}
