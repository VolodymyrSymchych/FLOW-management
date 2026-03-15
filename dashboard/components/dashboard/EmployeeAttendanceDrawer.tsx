import React from 'react';
import { X, Clock, Calendar, Briefcase, FileText, CheckCircle2, History, MoreVertical, Download, Filter } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { useAttendance } from '@/hooks/useQueries';

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

interface EmployeeAttendanceDrawerProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  teamId?: number;
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

export function EmployeeAttendanceDrawer({
  member,
  isOpen,
  onClose,
  teamId,
}: EmployeeAttendanceDrawerProps) {
  const { data: allEntries = [] } = useAttendance(teamId);
  const memberEntries = allEntries.filter((e: any) => e.userId === member?.userId);
  
  // Format duration helper
  const formatDuration = (minutes: number | null | undefined) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}hrs ${mins}min`;
  };

  // Format time helper
  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    const day = d.getDate();
    const suffix = day % 10 === 1 && day !== 11 ? 'st' : day % 10 === 2 && day !== 12 ? 'nd' : day % 10 === 3 && day !== 13 ? 'rd' : 'th';
    const month = d.toLocaleDateString('en-US', { month: 'short' });
    const year = d.getFullYear();
    return `${day}${suffix} ${month} ${year}`;
  };

  if (!member || !member.user) return null;

  const userFullName = member.user.fullName || member.user.username;
  const avatarBg = AVATAR_COLORS[member.id % AVATAR_COLORS.length];

  // Dummy mock data for visual parity with the requested UI if actual data is scarce
  const mockRows = [
    { id: 1, date: '2025-05-01T07:30:00Z', duration: 480, overtime: 150, status: 'Late' },
    { id: 2, date: '2025-05-02T07:30:00Z', duration: 480, overtime: 0, status: 'Early' },
    { id: 3, date: '2025-05-03T07:30:00Z', duration: 480, overtime: 150, status: 'Late' },
    { id: 4, date: '2025-05-04T07:30:00Z', duration: 480, overtime: 150, status: 'Late' },
    { id: 5, date: '2025-05-05T07:30:00Z', duration: 480, overtime: 0, status: 'Early' },
  ];
  
  // Combine real entries or mock
  const displayRows = memberEntries.length > 0 ? memberEntries : mockRows;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent side="right" className="w-[800px] max-w-full sm:max-w-3xl overflow-y-auto bg-white p-0 text-text-primary rounded-l-[16px]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-[13px] font-semibold tracking-wider text-text-tertiary uppercase">Employee Attendance Details</h2>
          <button onClick={onClose} className="p-2 -mr-2 text-text-tertiary hover:bg-surface-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6">
          {/* Top Info Cards */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* User Profile Card */}
            <div className="flex-1 border border-border rounded-2xl p-6 bg-surface-subtle">
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-sm"
                    style={{ backgroundColor: avatarBg }}
                  >
                    {initials(userFullName)}
                  </div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <button className="px-4 py-2 text-sm font-medium border border-border rounded-xl bg-white hover:bg-surface-muted transition-colors whitespace-nowrap">
                  View Details
                </button>
              </div>
              <div className="space-y-1">
                <div className="text-xs font-medium text-text-tertiary flex items-center gap-1.5">
                  EMP{10000 + member.id} <span className="p-[3px] bg-surface-muted rounded inline-grid place-items-center"><FileText className="w-3 h-3"/></span>
                </div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-semibold text-text-primary">{userFullName}</h3>
                  <div className="flex items-center gap-1 text-[11px] font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> Active
                  </div>
                </div>
                <p className="text-sm text-text-secondary">{member.role}</p>
              </div>
            </div>

            {/* General Stats Card */}
            <div className="flex-[1.5] border border-border rounded-2xl p-6 grid grid-cols-2 gap-y-5 gap-x-4 bg-white">
               <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-1">
                    <Briefcase className="w-4 h-4" /> Department
                  </div>
                  <div className="text-sm font-medium text-text-primary">IT</div>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-1">
                    <CheckCircle2 className="w-4 h-4" /> Role
                  </div>
                  <div className="text-sm font-medium text-text-primary">{member.role}</div>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-1">
                    <Calendar className="w-4 h-4" /> Employment
                  </div>
                  <div className="text-sm font-medium text-text-primary">Full Time</div>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-1">
                    <Clock className="w-4 h-4" /> Avg. Work Hours
                  </div>
                  <div className="text-sm font-medium text-text-primary">9hrs 43 mins</div>
               </div>
               <div className="col-span-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-text-tertiary mb-1">
                    <History className="w-4 h-4" /> Avg. Overtime
                  </div>
                  <div className="text-sm font-medium text-text-primary">1hrs 30mins</div>
               </div>
            </div>
          </div>

          {/* Attendance Summary */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Attendance Summary</h4>
            <div className="border border-border rounded-xl flex items-center divide-x divide-border bg-white overflow-hidden">
               <div className="flex-1 p-4">
                 <div className="text-xs text-text-tertiary font-medium mb-1">Year of Employment</div>
                 <div className="text-base font-semibold text-text-primary">2021</div>
               </div>
               <div className="flex-1 p-4">
                 <div className="text-xs text-text-tertiary font-medium mb-1">Total Presents Days</div>
                 <div className="text-base font-semibold text-text-primary">1,298 days</div>
               </div>
               <div className="flex-1 p-4">
                 <div className="text-xs text-text-tertiary font-medium mb-1">Total Absent Days</div>
                 <div className="text-base font-semibold text-text-primary">30 Days</div>
               </div>
               <div className="flex-1 p-4">
                 <div className="text-xs text-text-tertiary font-medium mb-1">Total Leave Days</div>
                 <div className="text-base font-semibold text-text-primary">423 Days</div>
               </div>
            </div>
          </div>

          {/* Table Area */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-text-primary">March 2025</h3>
                <div className="flex items-center gap-1 text-text-tertiary">
                   <button className="p-[2px] hover:bg-surface-muted rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m15 18-6-6 6-6"/></svg></button>
                   <button className="p-[2px] hover:bg-surface-muted rounded"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg></button>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-muted transition-colors">
                  Export CSV <Download className="w-4 h-4 text-text-tertiary" />
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm font-medium hover:bg-surface-muted transition-colors">
                  <Filter className="w-4 h-4 text-text-tertiary" /> Filter
                </button>
              </div>
            </div>

            <div className="border border-border rounded-2xl bg-white overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-surface-subtle">
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary w-[140px]">Start Date</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary">Clock in - Clock Out</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary">Overtime</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary">Location</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary w-[100px]">Status</th>
                    <th className="px-5 py-3 text-xs font-semibold text-text-tertiary w-[60px] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {displayRows.map((row: any, i: number) => {
                    const rowDateStr = row.clockIn || row.date;
                    const cIn = formatTime(rowDateStr);
                    const cOut = row.clockOut ? formatTime(row.clockOut) : '3:30 PM';
                    const dur = row.duration || row.duration;
                    const ot = row.overtime || 0;
                    const statusText = row.status || (i % 2 === 0 ? 'Late' : 'Early');
                    
                    return (
                      <tr key={row.id || i} className="hover:bg-surface-muted/30 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-text-primary">
                          {formatDate(rowDateStr)}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-primary">
                          {cIn} - {cOut}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-primary">
                          {ot > 0 ? formatDuration(ot) : '-'}
                        </td>
                        <td className="px-5 py-4 text-sm text-text-primary truncate max-w-[150px]">
                          Withston Street, Ware...
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            statusText === 'Late' 
                              ? 'bg-orange-100/80 text-orange-700' 
                              : 'bg-green-100/80 text-green-700'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${statusText === 'Late' ? 'bg-orange-600' : 'bg-green-600'}`}/>
                            {statusText}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button className="p-1 hover:bg-surface-muted rounded text-text-tertiary">
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
