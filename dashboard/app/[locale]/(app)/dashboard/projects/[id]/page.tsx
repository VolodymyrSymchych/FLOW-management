'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { useTeam } from '@/contexts/TeamContext';
import {
  ArrowLeft,
  Calendar,
  Users,
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
  loading: () => <div className="proj-detail-skeleton" />
});

const InvoicesAndCashFlow = dynamic(() => import('@/components/InvoicesAndCashFlow').then(m => ({ default: m.InvoicesAndCashFlow })), {
  ssr: false,
  loading: () => <div className="proj-detail-skeleton" />
});

const ProjectTeamManagement = dynamic(() => import('@/components/ProjectTeamManagement').then(m => ({ default: m.ProjectTeamManagement })), {
  ssr: false,
  loading: () => <div className="proj-detail-skeleton" />
});

const CommentsSection = dynamic(() => import('@/components/comments/CommentsSection').then(m => ({ default: m.CommentsSection })), {
  ssr: false,
  loading: () => <div className="proj-detail-skeleton" />
});

const FileUploader = dynamic(() => import('@/components/FileUploader').then(m => ({ default: m.FileUploader })), {
  ssr: false,
  loading: () => <div className="proj-detail-skeleton" />
});

const FileList = dynamic(() => import('@/components/FileList').then(m => ({ default: m.FileList })), {
  ssr: false,
  loading: () => <div className="proj-detail-skeleton" />
});

const EditProjectModal = dynamic(() => import('@/components/EditProjectModal').then(m => ({ default: m.EditProjectModal })), {
  ssr: false,
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
  { id: 'overview' as const, label: 'Overview', icon: BarChart3 },
  { id: 'team' as const, label: 'Team', icon: Users },
  { id: 'finance' as const, label: 'Finance', icon: FileSpreadsheet },
  { id: 'files' as const, label: 'Files', icon: FolderOpen },
  { id: 'comments' as const, label: 'Comments', icon: MessageSquare },
  { id: 'report' as const, label: 'Report', icon: FileText },
] as const;

export default function ProjectDetailPage() {
  const { isLoading: teamsLoading } = useTeam();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = Number(params.id);
  const { data: project, isLoading: projectLoading, refetch: loadProject } = useProject(projectId);
  
  const initialTab = (searchParams.get('tab') as typeof TABS[number]['id']) || 'overview';
  const validTab = TABS.some(t => t.id === initialTab) ? initialTab : 'overview';
  
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>(validTab);
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const getRiskStyle = (risk: string) => {
    switch (risk?.toLowerCase()) {
      case 'low': return { bg: 'var(--sage-bg)', color: 'var(--sage)', border: 'var(--sage)' };
      case 'medium': return { bg: 'var(--amber-bg)', color: 'var(--amber)', border: 'var(--amber)' };
      case 'high': return { bg: 'var(--red-bg)', color: 'var(--red)', border: 'var(--red)' };
      default: return { bg: 'var(--bg2)', color: 'var(--muted)', border: 'var(--line2)' };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'var(--sage)';
    if (score >= 60) return 'var(--accent)';
    if (score >= 40) return 'var(--amber)';
    return 'var(--red)';
  };

  if (shouldShowLoading) {
    return (
      <div className="proj-detail-screen">
        <ProjectDetailSkeleton />
      </div>
    );
  }

  const rawProject = project?.project;
  const analysis = project?.analysis ?? { results: {} as Record<string, string>, report: 'Analysis not available' };

  if (!projectId || isNaN(projectId) || !rawProject || typeof rawProject !== 'object') {
    return (
      <div className="proj-detail-screen">
        <div className="proj-detail-empty">
          <AlertTriangle style={{ width: 48, height: 48, color: 'var(--amber)' }} />
          <h3 className="proj-detail-empty-title">Project not found</h3>
          <p className="proj-detail-empty-desc">The project you're looking for doesn't exist or has been removed.</p>
          <button type="button" className="btn btn-ghost" onClick={() => router.back()}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const projectData = rawProject;
  const riskStyle = getRiskStyle(projectData.risk_level);
  const scoreColor = getScoreColor(projectData.score || 0);

  return (
    <div className="proj-detail-screen" data-testid="project-detail-screen">
      {/* Header */}
      <div className="proj-detail-header">
        <div className="proj-detail-header-inner">
          <Link
            href="/dashboard/projects"
            className="proj-detail-back"
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
            <span>Projects</span>
          </Link>

          <div className="proj-detail-header-main">
            <div className="proj-detail-header-left">
              <h1 className="proj-detail-title">{projectData.name}</h1>
              <div className="proj-detail-meta">
                <span className="proj-detail-meta-item">
                  <Calendar style={{ width: 14, height: 14 }} />
                  {formatDate(projectData.created_at)}
                </span>
                <span className="proj-detail-meta-item">
                  <Building style={{ width: 14, height: 14 }} />
                  {projectData.industry}
                </span>
                <span
                  className="proj-detail-risk"
                  style={{ background: riskStyle.bg, color: riskStyle.color, borderColor: riskStyle.border }}
                >
                  {projectData.risk_level} Risk
                </span>
              </div>
            </div>

            <div className="proj-detail-header-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowEditModal(true)}
              >
                <Edit style={{ width: 14, height: 14 }} />
                Edit
              </button>
              <button type="button" className="btn btn-acc" onClick={downloadReport}>
                <Download style={{ width: 14, height: 14 }} />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="proj-detail-tabs">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={cn('proj-detail-tab', activeTab === tab.id && 'active')}
              onClick={() => {
                setActiveTab(tab.id);
                // Optional: update URL silently to keep state
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('tab', tab.id);
                window.history.replaceState({}, '', currentUrl.toString());
              }}
            >
              <Icon style={{ width: 14, height: 14 }} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <div className="proj-detail-content">
        {activeTab === 'overview' && (
          <div className="proj-detail-overview">
            <div className="proj-detail-overview-main">
              <div className="proj-detail-card">
                <CashFlowSummary projectId={projectData.id} />
              </div>

              <div className="proj-detail-card">
                <h3 className="proj-detail-card-title">
                  <CheckCircle style={{ width: 16, height: 16, color: 'var(--sage)' }} />
                  Analysis Stages
                </h3>
                <div className="proj-detail-stages">
                  {Object.keys(analysis.results).map((stage, idx) => (
                    <div key={idx} className="proj-detail-stage">
                      <CheckCircle style={{ width: 16, height: 16, color: 'var(--sage)' }} />
                      <span>{stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="proj-detail-stage-badge">Completed</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="proj-detail-overview-sidebar">
              <div className="proj-detail-card">
                <ProjectBudgetTracking
                  projectId={projectData.id}
                  projectBudget={(projectData as any).budget}
                  projectStartDate={(projectData as any).start_date}
                  projectEndDate={(projectData as any).end_date}
                />
              </div>

              <div className="proj-detail-card">
                <h3 className="proj-detail-card-title">
                  <TrendingUp style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                  Scope Clarity Score
                </h3>
                <div className="proj-detail-score-wrap">
                  <div className="proj-detail-score-ring" style={{ ['--score-color' as string]: scoreColor }}>
                    <svg className="proj-detail-score-svg" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="var(--bg3)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        stroke="var(--score-color)"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={264 - (264 * (projectData.score || 0)) / 100}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="proj-detail-score-value" style={{ color: scoreColor }}>
                      {projectData.score || 0}
                    </div>
                  </div>
                  <div className="proj-detail-score-label">out of 100</div>
                </div>
              </div>

              <div className="proj-detail-card">
                <h3 className="proj-detail-card-title">
                  <FileText style={{ width: 16, height: 16, color: 'var(--accent)' }} />
                  Project Details
                </h3>
                <div className="proj-detail-details">
                  <div className="proj-detail-detail-row">
                    <span className="proj-detail-detail-label">Type</span>
                    <span className="proj-detail-detail-val">{projectData.type}</span>
                  </div>
                  <div className="proj-detail-detail-row">
                    <span className="proj-detail-detail-label">Team Size</span>
                    <span className="proj-detail-detail-val">{projectData.team_size}</span>
                  </div>
                  <div className="proj-detail-detail-row">
                    <span className="proj-detail-detail-label">Timeline</span>
                    <span className="proj-detail-detail-val">{projectData.timeline}</span>
                  </div>
                  <div className="proj-detail-detail-row">
                    <span className="proj-detail-detail-label">Industry</span>
                    <span className="proj-detail-detail-val">{projectData.industry}</span>
                  </div>
                </div>
              </div>

              <div className="proj-detail-card">
                <h3 className="proj-detail-card-title">Quick Actions</h3>
                <div className="proj-detail-actions">
                  <button type="button" className="proj-detail-action-btn">
                    <RefreshCw style={{ width: 16, height: 16 }} />
                    Re-analyze Project
                  </button>
                  <button type="button" className="proj-detail-action-btn">
                    <Share2 style={{ width: 16, height: 16 }} />
                    Share with Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'team' && (
          <div className="proj-detail-card proj-detail-card-full">
            <ProjectTeamManagement
              projectId={projectData.id}
              teamId={projectData.team_id}
            />
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="proj-detail-card proj-detail-card-full">
            <InvoicesAndCashFlow projectId={projectData.id} />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="proj-detail-files">
            <div className="proj-detail-card">
              <h3 className="proj-detail-card-title">Upload Files</h3>
              <FileUploader
                projectId={projectData.id}
                onUploadSuccess={() => setFilesRefreshKey(prev => prev + 1)}
              />
            </div>
            <div className="proj-detail-card">
              <h3 className="proj-detail-card-title">Project Files</h3>
              <FileList
                key={filesRefreshKey}
                projectId={projectData.id}
                onDelete={() => setFilesRefreshKey(prev => prev + 1)}
              />
            </div>
          </div>
        )}

        {activeTab === 'comments' && (
          <div className="proj-detail-card proj-detail-card-full">
            <CommentsSection entityType="project" entityId={projectData.id} />
          </div>
        )}

        {activeTab === 'report' && (
          <div className="proj-detail-card proj-detail-card-full">
            <pre className="proj-detail-report">
              {analysis.report}
            </pre>
          </div>
        )}
      </div>

      {project && showEditModal && (
        <EditProjectModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
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
