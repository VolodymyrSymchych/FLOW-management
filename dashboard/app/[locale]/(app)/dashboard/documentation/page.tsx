'use client';

import { useMemo } from 'react';
import { FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { generateReportPDF } from '@/lib/report-pdf';
import { useTeam } from '@/contexts/TeamContext';
import { useReports } from '@/hooks/useQueries';

interface Report {
  id: number;
  title: string;
  content: string;
  type: 'project_status' | 'analysis' | 'financial_summary' | 'custom';
  status: 'draft' | 'published' | 'archived';
  projectId: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    username: string;
    fullName?: string | null;
  };
}

function formatShortDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function accentForType(type: Report['type']) {
  if (type === 'analysis') return { bg: '#F0EBFA', color: '#6941C6' };
  if (type === 'financial_summary') return { bg: '#EAF2ED', color: '#3D7A5A' };
  return { bg: '#FDF1EB', color: '#E8753A' };
}

function iconForType(type: Report['type']) {
  if (type === 'analysis') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 14, height: 14 }}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: 14, height: 14 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export default function DocumentationPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedTeam, isLoading: teamsLoading } = useTeam();
  const teamId = selectedTeam.type === 'single' && selectedTeam.teamId ? selectedTeam.teamId : 'all';
  const { data: reports = [], isLoading: reportsLoading } = useReports(teamId);

  const sortedReports = useMemo(() => [...reports].sort((a: Report, b: Report) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()), [reports]);
  const pinnedReports = sortedReports.slice(0, 3);
  const recentReports = sortedReports;

  const handleOpen = (id: number) => {
    router.push(`/dashboard/documentation/${id}`);
  };

  const handleDelete = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      await axios.delete(`/api/reports/${id}`);
      await queryClient.invalidateQueries({ queryKey: ['reports'] });
    } catch (error) {
      console.error('Failed to delete report', error);
      alert('Failed to delete document');
    }
  };

  const handlePdf = async (report: Report, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await generateReportPDF(report);
    } catch (error) {
      console.error('Failed to export PDF', error);
      alert('Failed to export PDF');
    }
  };

  if (teamsLoading || (reportsLoading && reports.length === 0)) {
    return <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading documentation...</div>;
  }

  return (
    <div className="scr-inner" data-testid="documentation-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>Documentation</h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{reports.length} documents · Reports, analyses & summaries</div>
          </div>
        </div>

        <div style={{ padding: '16px 28px 40px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Pinned</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
              {pinnedReports.map((report: Report) => {
                const accent = accentForType(report.type);
                return (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => handleOpen(report.id)}
                    className="proj-card glass-hover"
                    style={{ textAlign: 'left', minHeight: 100 }}
                  >
                    <div className="proj-card-hd">
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: accent.bg, color: accent.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {iconForType(report.type)}
                      </div>
                      <div className="proj-card-name">{report.title}</div>
                    </div>
                    <div className="proj-card-meta">
                      <span className="proj-card-team">{report.project?.name || 'Workspace'}</span>
                      <span className="proj-card-sprint">Updated {formatShortDate(report.updatedAt)}</span>
                    </div>
                  </button>
                );
              })}
              {pinnedReports.length === 0 ? (
                <div className="stat-card" style={{ gridColumn: '1 / -1', padding: 24, textAlign: 'center' }}>
                  <FileText style={{ width: 32, height: 32, margin: '0 auto 12px', color: 'var(--ghost)' }} />
                  <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--ink)' }}>No documents yet</div>
                  <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Create your first report or analysis</div>
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--faint)', marginBottom: 10 }}>Recent</div>
            <div className="surface-panel" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
              <table className="inv-table" style={{ marginTop: 0 }}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Project</th>
                    <th>Author</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReports.map((report: Report, index: number) => (
                    <tr
                      key={report.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleOpen(report.id)}
                    >
                      <td style={{ fontWeight: 500, color: 'var(--ink)' }}>{report.title}</td>
                      <td style={{ color: 'var(--muted)' }}>{report.project?.name || 'Workspace'}</td>
                      <td style={{ color: 'var(--muted)' }}>{report.user?.fullName || report.user?.username || 'Unknown'}</td>
                      <td style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 12, color: 'var(--faint)' }}>{formatShortDate(report.updatedAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 9px' }} onClick={(event) => { event.stopPropagation(); handleOpen(report.id); }}>Open</button>
                          <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 9px' }} onClick={(event) => handlePdf(report, event)}>PDF</button>
                          <button type="button" className="btn btn-red" style={{ fontSize: 12, padding: '4px 9px' }} onClick={(event) => handleDelete(report.id, event)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {recentReports.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ padding: '48px 24px', textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText style={{ width: 24, height: 24, color: 'var(--ghost)' }} />
                        </div>
                        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', fontFamily: "var(--font-inter), Inter, sans-serif" }}>No documentation yet</div>
                        <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>Create reports and analyses for your projects</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
