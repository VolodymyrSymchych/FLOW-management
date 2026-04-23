'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { useParams, useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTeam } from '@/contexts/TeamContext';
import { useEntityDrawerState } from '@/hooks/useEntityDrawerState';
import {
  ArrowLeft,
  Calendar,
  Building,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Download,
  RefreshCw,
  Share2,
  Edit,
  BarChart3,
  FolderOpen,
  MessageSquare,
  FileSpreadsheet,
} from 'lucide-react';
import { ProjectBudgetTracking } from '@/components/ProjectBudgetTracking';
import { api } from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';
import { useProject } from '@/hooks/useQueries';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { ProjectDetailSkeleton } from '@/components/skeletons';

const CashFlowSummary = dynamic(() => import('@/components/CashFlowSummary').then(m => ({ default: m.CashFlowSummary })), {
  ssr: false,
  loading: () => <div className="h-32 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const InvoicesAndCashFlow = dynamic(() => import('@/components/InvoicesAndCashFlow').then(m => ({ default: m.InvoicesAndCashFlow })), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const ProjectTeamManagement = dynamic(() => import('@/components/ProjectTeamManagement').then(m => ({ default: m.ProjectTeamManagement })), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const CommentsSection = dynamic(() => import('@/components/comments/CommentsSection').then(m => ({ default: m.CommentsSection })), {
  ssr: false,
  loading: () => <div className="h-48 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const FileUploader = dynamic(() => import('@/components/FileUploader').then(m => ({ default: m.FileUploader })), {
  ssr: false,
  loading: () => <div className="h-12 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const FileList = dynamic(() => import('@/components/FileList').then(m => ({ default: m.FileList })), {
  ssr: false,
  loading: () => <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />,
});

const EditProjectModal = dynamic(() => import('@/components/EditProjectModal').then(m => ({ default: m.EditProjectModal })), {
  ssr: false,
  loading: () => null,
});

interface ProjectDetail {
  project: {
    id: number;
    name: string;
    type: string;
    industry: string;
    team_size: string;
    timeline: string;
    score: number;
    risk_level: string;
    created_at: string;
    status: string;
    team_id?: number;
  };
  analysis: {
    results: Record<string, string>;
    report: string;
    metadata: any;
  };
}

const TABS = [
  { id: 'overview'  as const, label: 'Overview',  icon: BarChart3      },
  { id: 'team'      as const, label: 'Team',       icon: FileSpreadsheet},
  { id: 'finance'   as const, label: 'Finance',    icon: FileSpreadsheet},
  { id: 'files'     as const, label: 'Files',      icon: FolderOpen     },
  { id: 'comments'  as const, label: 'Comments',   icon: MessageSquare  },
  { id: 'report'    as const, label: 'Report',     icon: FileText       },
] as const;

function getRiskConfig(risk: string) {
  switch ((risk || '').toLowerCase()) {
    case 'low':      return { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20' };
    case 'medium':   return { cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20' };
    case 'high':     return { cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20' };
    case 'critical': return { cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-300 dark:border-red-500/20' };
    default:         return { cls: 'bg-gray-100 text-gray-500 border-gray-200 dark:bg-white/5 dark:text-white/40 dark:border-white/10' };
  }
}

function getScoreColor(score: number) {
  if (score >= 80) return '#3D7A5A';
  if (score >= 60) return '#E8753A';
  if (score >= 40) return '#B8870A';
  return '#B83232';
}

export default function ProjectDetailPage() {
  const { isLoading: teamsLoading } = useTeam();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const projectId = Number(params.id);
  const { data: project, isLoading: projectLoading, refetch: loadProject } = useProject(projectId);
  const drawerState = useEntityDrawerState({ param: 'edit' });

  const initialTab = (searchParams.get('tab') as typeof TABS[number]['id']) || 'overview';
  const validTab = TABS.some(t => t.id === initialTab) ? initialTab : 'overview';

  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>(validTab);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const shouldShowLoading = useDelayedLoading(projectLoading || teamsLoading, 250);

  const downloadReport = () => {
    const p = project?.project;
    const a = project?.analysis;
    if (!p || !a) return;
    const blob = new Blob([a.report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.name}_analysis.md`;
    link.click();
  };

  if (shouldShowLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="h-[94px] flex-shrink-0 animate-pulse border-b border-[var(--line)] bg-white dark:border-white/10 dark:bg-[#1A1A1A]" />
        <div className="p-7">
          <ProjectDetailSkeleton />
        </div>
      </div>
    );
  }

  const rawProject = project?.project;
  const analysis = project?.analysis ?? { results: {} as Record<string, string>, report: 'Analysis not available' };

  if (!projectId || isNaN(projectId) || !rawProject || typeof rawProject !== 'object') {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <AlertTriangle className="h-12 w-12 text-amber-500" />
        <h3 className="text-[18px] font-bold text-[var(--ink)] dark:text-white">Project not found</h3>
        <p className="max-w-sm text-[14px] text-[var(--muted)]">The project you&apos;re looking for doesn&apos;t exist or has been removed.</p>
        <button type="button" onClick={() => router.back()}
          className="rounded-lg border border-[var(--line2)] px-4 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] dark:border-white/10 dark:hover:text-white">
          Go back
        </button>
      </div>
    );
  }

  const projectData = rawProject;
  const riskConfig  = getRiskConfig(projectData.risk_level);
  const scoreColor  = getScoreColor(projectData.score || 0);

  return (
    <div className="flex h-full flex-col overflow-hidden" data-testid="project-detail-screen">

      {/* ── Header ── */}
      <div className="flex-shrink-0 border-b border-[var(--line)] bg-white px-7 py-4 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
        <Link
          href="/dashboard/projects"
          className="mb-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-[var(--muted)] transition-colors hover:text-[var(--ink)] dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Projects
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[var(--ink)] dark:text-white">{projectData.name}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(projectData.created_at)}
              </span>
              <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
                <Building className="h-3.5 w-3.5" />
                {projectData.industry}
              </span>
              {projectData.risk_level && (
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold capitalize ${riskConfig.cls}`}>
                  {projectData.risk_level.toLowerCase()} risk
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => drawerState.open(projectData.id, { tab: activeTab, editTab: activeTab })}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--line2)] px-3.5 py-2 text-[13px] font-semibold text-[var(--muted)] transition-colors hover:text-[var(--ink)] dark:border-white/10 dark:hover:text-white"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>
            <button
              type="button"
              onClick={downloadReport}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--accent)] px-3.5 py-2 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Download className="h-3.5 w-3.5" />
              Download report
            </button>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex flex-shrink-0 items-center gap-0 border-b border-[var(--line)] bg-white px-7 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                const p = new URLSearchParams(searchParams.toString());
                p.set('tab', tab.id);
                if (drawerState.isOpen) p.set('editTab', tab.id);
                router.replace(`${pathname}${p.toString() ? `?${p.toString()}` : ''}`, { scroll: false });
              }}
              className={`flex items-center gap-1.5 border-b-2 px-1 pb-3 pt-3 mr-6 text-[13px] font-semibold transition-all active:scale-[0.97] last:mr-0 ${
                activeTab === tab.id
                  ? 'border-[var(--accent)] text-[var(--accent)]'
                  : 'border-transparent text-[var(--muted)] hover:text-[var(--ink)] dark:hover:text-white'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="p-7"
          >

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-[1fr_300px] gap-6">
            {/* main col */}
            <div className="space-y-5">
              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <CashFlowSummary projectId={projectData.id} />
              </div>

              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[var(--ink)] dark:text-white">
                  <CheckCircle className="h-4 w-4 text-[#3D7A5A]" />
                  Analysis stages
                </h3>
                <div className="space-y-2">
                  {Object.keys(analysis.results).map((stage, idx) => (
                    <div key={idx} className="flex items-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 dark:border-white/[0.06] dark:bg-white/[0.02]">
                      <CheckCircle className="h-4 w-4 flex-shrink-0 text-[#3D7A5A]" />
                      <span className="flex-1 text-[13px] text-[var(--ink)] dark:text-white">
                        {stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                        Completed
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* sidebar */}
            <div className="space-y-4">
              {/* budget */}
              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <ProjectBudgetTracking
                  projectId={projectData.id}
                  projectBudget={(projectData as any).budget}
                  projectStartDate={(projectData as any).start_date}
                  projectEndDate={(projectData as any).end_date}
                />
              </div>

              {/* score ring */}
              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <h3 className="mb-4 flex items-center gap-2 text-[13px] font-semibold text-[var(--ink)] dark:text-white">
                  <TrendingUp className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Scope clarity score
                </h3>
                <div className="flex flex-col items-center gap-2">
                  <div className="relative h-24 w-24">
                    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg3)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke={scoreColor}
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * (projectData.score || 0)) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[22px] font-black leading-none" style={{ color: scoreColor }}>{projectData.score || 0}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[var(--faint)]">out of 100</p>
                </div>
              </div>

              {/* project details */}
              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <h3 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[var(--ink)] dark:text-white">
                  <FileText className="h-4 w-4" style={{ color: 'var(--accent)' }} />
                  Project details
                </h3>
                <div className="space-y-2">
                  {[
                    ['Type',      projectData.type],
                    ['Team size', projectData.team_size],
                    ['Timeline',  projectData.timeline],
                    ['Industry',  projectData.industry],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--line)] last:border-b-0 dark:border-white/[0.05]">
                      <span className="text-[11px] text-[var(--faint)]">{label}</span>
                      <span className="text-[12px] font-medium text-[var(--ink)] dark:text-white">{value || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* quick actions */}
              <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
                <h3 className="mb-3 text-[13px] font-semibold text-[var(--ink)] dark:text-white">Quick actions</h3>
                <div className="space-y-2">
                  {[
                    { icon: RefreshCw, label: 'Re-analyze project' },
                    { icon: Share2,    label: 'Share with team' },
                  ].map(({ icon: Icon, label }) => (
                    <button key={label} type="button"
                      className="flex w-full items-center gap-2.5 rounded-lg border border-[var(--line)] px-3.5 py-2.5 text-[12px] font-medium text-[var(--muted)] transition-colors hover:border-[var(--line2)] hover:text-[var(--ink)] dark:border-white/[0.07] dark:hover:text-white">
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Team */}
        {activeTab === 'team' && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <ProjectTeamManagement projectId={projectData.id} teamId={projectData.team_id} />
          </div>
        )}

        {/* Finance */}
        {activeTab === 'finance' && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <InvoicesAndCashFlow projectId={projectData.id} />
          </div>
        )}

        {/* Files */}
        {activeTab === 'files' && (
          <div className="grid grid-cols-2 gap-5">
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <h3 className="mb-4 text-[14px] font-semibold text-[var(--ink)] dark:text-white">Upload files</h3>
              <FileUploader projectId={projectData.id} onUploadSuccess={() => setFilesRefreshKey(prev => prev + 1)} />
            </div>
            <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
              <h3 className="mb-4 text-[14px] font-semibold text-[var(--ink)] dark:text-white">Project files</h3>
              <FileList key={filesRefreshKey} projectId={projectData.id} onDelete={() => setFilesRefreshKey(prev => prev + 1)} />
            </div>
          </div>
        )}

        {/* Comments */}
        {activeTab === 'comments' && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <CommentsSection entityType="project" entityId={projectData.id} />
          </div>
        )}

        {/* Report */}
        {activeTab === 'report' && (
          <div className="rounded-xl border border-[var(--line)] bg-white p-5 dark:border-white/[0.07] dark:bg-[#1A1A1A]">
            <pre className="whitespace-pre-wrap font-mono text-[13px] leading-7 text-[var(--ink)] dark:text-white/80">
              {analysis.report}
            </pre>
          </div>
        )}

          </motion.div>
        </AnimatePresence>
      </div>

      {project && drawerState.activeId === String(projectData.id) && (
        <EditProjectModal
          isOpen={drawerState.isOpen}
          onClose={() => drawerState.close(['tab'])}
          onSave={() => {
            drawerState.close(['tab']);
            loadProject();
          }}
          project={{
            id: projectData.id,
            name: projectData.name,
            type: projectData.type,
            industry: projectData.industry,
            team_size: projectData.team_size,
            timeline: projectData.timeline,
            status: projectData.status,
            budget: (projectData as any).budget,
            start_date: (projectData as any).start_date,
            end_date: (projectData as any).end_date,
            team_id: projectData.team_id,
          }}
        />
      )}
    </div>
  );
}
