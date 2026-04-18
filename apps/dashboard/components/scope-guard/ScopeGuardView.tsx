'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Check, FileText, History, Loader2, Shield, Upload, X } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { useTeam } from '@/contexts/TeamContext';
import { useProjects } from '@/hooks/useQueries';
import { toAnalysisHistoryItem, toAnalysisReportViewModel, type AnalysisHistoryItem, type AnalysisReportViewModel } from '@/lib/analysis-view-model';

interface AnalyzeFormState {
  project_name: string;
  project_type: string;
  industry: string;
  team_size: string;
  timeline: string;
  document: string;
}

const initialFormState: AnalyzeFormState = {
  project_name: '',
  project_type: 'software development',
  industry: 'technology',
  team_size: '',
  timeline: '',
  document: '',
};

function riskBadgeColor(riskLevel?: string) {
  const value = (riskLevel || '').toUpperCase();
  if (value === 'HIGH' || value === 'CRITICAL') return { background: 'var(--red-bg)', color: 'var(--red)' };
  if (value === 'MEDIUM') return { background: 'var(--amber-bg)', color: 'var(--amber)' };
  return { background: 'var(--sage-bg)', color: 'var(--sage)' };
}

function gaugeOffset(score: number) {
  const clamped = Math.max(0, Math.min(score, 100));
  return 125.6 - clamped * 1.256;
}

function fileExtension(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || 'default';
  return ['txt', 'csv', 'json', 'xml', 'md'].includes(ext) ? ext : 'default';
}

export function ScopeGuardView() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { selectedTeam } = useTeam();
  const teamId = selectedTeam.type === 'all' ? 'all' : selectedTeam.teamId;
  const { data: projects = [], isLoading: projectsLoading, refetch: refetchProjects } = useProjects(teamId);

  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [report, setReport] = useState<AnalysisReportViewModel | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [form, setForm] = useState<AnalyzeFormState>(initialFormState);

  const history = useMemo<AnalysisHistoryItem[]>(() => {
    return projects
      .map((project) => toAnalysisHistoryItem(project))
      .sort((left, right) => {
        const leftDate = new Date(left.updatedAt || left.createdAt || 0).getTime();
        const rightDate = new Date(right.updatedAt || right.createdAt || 0).getTime();
        return rightDate - leftDate;
      });
  }, [projects]);

  useEffect(() => {
    if (selectedProjectId || history.length === 0) return;
    const preferred = history.find((item) => item.hasAnalysis) || history[0];
    setSelectedProjectId(preferred.id);
  }, [history, selectedProjectId]);

  useEffect(() => {
    if (!selectedProjectId) return;
    const loadProject = async () => {
      setDetailLoading(true);
      try {
        const response = await axios.get(`/api/projects/${selectedProjectId}`);
        setReport(toAnalysisReportViewModel(response.data));
      } catch (error) {
        console.error('Failed to load scope-guard report:', error);
        setReport(null);
      } finally {
        setDetailLoading(false);
      }
    };
    loadProject();
  }, [selectedProjectId]);

  const handleFileUpload = async (file: File) => {
    setUploadingFile(true);
    try {
      const payload = new FormData();
      payload.append('file', file);
      const response = await axios.post('/api/upload', payload);
      setForm((current) => ({ ...current, document: response.data.content, project_name: current.project_name || file.name.replace(/\.[^.]+$/, '') }));
      setUploadedFileName(file.name);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to upload document.');
    } finally {
      setUploadingFile(false);
    }
  };

  const handleAnalyze = async () => {
    if (!form.document.trim() || !form.project_name.trim()) return;
    setSubmitting(true);
    try {
      const response = await axios.post('/api/analyze', form);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['stats'] });
      await refetchProjects();
      setSelectedProjectId(response.data.project.id);
      setForm(initialFormState);
      setUploadedFileName(null);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to analyze scope.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedHistoryItem = history.find((item) => item.id === selectedProjectId) || null;
  const score = report?.score || selectedHistoryItem?.score || 0;
  const verdictClass = score >= 85 ? 'sg-vs-ok' : score >= 60 ? 'sg-vs-warn' : 'sg-vs-err';
  const verdictText = score >= 85 ? 'Approved for execution.' : score >= 60 ? 'Conditional approval.' : 'Scope requires revision.';

  return (
    <div className="scope-guard-screen" data-testid="scope-guard-screen">
      <div className="sg-wrap">
        <div className="sg-left">
          <div className="sg-left-hd">
            <div className="sg-left-title">
              <Shield />
              AI Scope Guard
            </div>
            <div className="sg-left-sub">Automatic scope analysis powered by AI</div>
          </div>

          <div className="sg-upload-section" data-testid="scope-guard-upload">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv,.json,.xml,text/plain,text/csv,application/json,application/xml,text/xml"
              style={{ display: 'none' }}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
            />

            <div className={`sg-drop ${uploadingFile ? 'drag' : ''}`} onClick={() => fileInputRef.current?.click()}>
              <div className="sg-drop-icon"><Upload /></div>
              <div className="sg-drop-title">Drop scope document here</div>
              <div className="sg-drop-sub">Drag and drop or click to browse</div>
              <div className="sg-drop-formats">
                {['TXT', 'CSV', 'JSON', 'XML', 'real API'].map((label) => <span key={label} className="sg-fmt-tag">{label}</span>)}
              </div>
              <div className="sg-drop-or">or</div>
              <button type="button" className="sg-drop-choose" onClick={(event) => { event.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload />
                Choose file
              </button>
            </div>

            {uploadedFileName ? (
              <div className="sg-file-list-wrap">
                <div className="sg-file-item">
                  <div className={`sg-file-ext ${fileExtension(uploadedFileName)}`}>{fileExtension(uploadedFileName)}</div>
                  <div className="sg-file-info">
                    <div className="sg-file-name">{uploadedFileName}</div>
                    <div className="sg-file-size">Uploaded for `/api/analyze`</div>
                  </div>
                  <div className={`sg-file-status ${uploadingFile ? 'loading' : ''}`} />
                </div>
              </div>
            ) : null}

            <div className="form-row">
              <label className="form-lbl">Project name</label>
              <input className="form-inp" value={form.project_name} onChange={(event) => setForm((current) => ({ ...current, project_name: event.target.value }))} placeholder="Customer portal refresh" />
            </div>
            <div className="form-row-2">
              <div className="form-row">
                <label className="form-lbl">Project type</label>
                <input className="form-inp" value={form.project_type} onChange={(event) => setForm((current) => ({ ...current, project_type: event.target.value }))} />
              </div>
              <div className="form-row">
                <label className="form-lbl">Industry</label>
                <input className="form-inp" value={form.industry} onChange={(event) => setForm((current) => ({ ...current, industry: event.target.value }))} />
              </div>
            </div>
            <div className="form-row-2">
              <div className="form-row">
                <label className="form-lbl">Team size</label>
                <input className="form-inp" value={form.team_size} onChange={(event) => setForm((current) => ({ ...current, team_size: event.target.value }))} placeholder="6 people" />
              </div>
              <div className="form-row">
                <label className="form-lbl">Timeline</label>
                <input className="form-inp" value={form.timeline} onChange={(event) => setForm((current) => ({ ...current, timeline: event.target.value }))} placeholder="10 weeks" />
              </div>
            </div>
            <div className="form-row">
              <label className="form-lbl">Scope document</label>
              <textarea className="form-ta" value={form.document} onChange={(event) => setForm((current) => ({ ...current, document: event.target.value }))} placeholder="Paste the requirements, brief, or functional scope here." style={{ minHeight: 120 }} />
            </div>
            <div id="sgAnalyzeWrap">
              <button id="sgAnalyzeBtn" type="button" className="btn btn-ai" style={{ width: '100%', justifyContent: 'center', fontSize: 15, padding: '9px 14px' }} onClick={handleAnalyze} disabled={submitting || !form.document.trim() || !form.project_name.trim()}>
                {submitting ? <Loader2 className="animate-spin" /> : <Shield />}
                {submitting ? 'Analyzing...' : 'Analyze with AI'}
              </button>
            </div>
            <div className="sg-proj-row">
              <span className="sg-proj-lbl">Link to project:</span>
              <select className="sg-proj-sel" value={selectedProjectId || ''} onChange={(event) => setSelectedProjectId(Number(event.target.value))}>
                {history.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </div>
          </div>

          <div className="sg-hist-hd"><span className="sg-hist-title">Recent analyses</span></div>
          <div className="sg-hist-list" data-testid="scope-guard-history">
            {projectsLoading ? (
              <div style={{ padding: 14, fontSize: 14, color: 'var(--muted)' }}>Loading history...</div>
            ) : history.length > 0 ? (
              history.map((item, index) => {
                const badgeStyle = riskBadgeColor(item.riskLevel);
                return (
                  <button key={item.id} type="button" className={`sg-hist-item ${item.id === selectedProjectId ? 'on' : ''}`} onClick={() => setSelectedProjectId(item.id)}>
                    <div className="sg-hi-dot" style={{ background: ['#E8753A', '#3D7A5A', '#6941C6', '#B83232'][index % 4] }} />
                    <div className="sg-hi-inf">
                      <div className="sg-hi-name">{item.name}</div>
                      <div className="sg-hi-meta">{item.createdAt ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true }) : 'recent'} · {item.type}</div>
                    </div>
                    <div className="sg-hi-badge" style={badgeStyle}>{item.riskLevel}</div>
                  </button>
                );
              })
            ) : (
              <div style={{ padding: 14, fontSize: 14, color: 'var(--muted)' }}>No analysis history yet.</div>
            )}
          </div>
        </div>

        <div className="sg-center" data-testid="scope-guard-report">
          {detailLoading ? (
            <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading report...</div>
          ) : report ? (
            <div className="sg-report-wrap">
              <div className="ai-summary">
                <div className="ai-summary-label">AI Summary</div>
                {report.summary}
              </div>

              <div className="sg-report-hd">
                <div className="sg-rh-top">
                  <div className="sg-rh-icon"><Shield /></div>
                  <div className="sg-rh-info">
                    <div className="sg-rh-title">{report.name}</div>
                    <div className="sg-rh-meta">
                      <span>{selectedHistoryItem?.name || report.name}</span>
                      <span>{report.metadata.type}</span>
                      <span>{report.metadata.industry}</span>
                      <span style={{ color: 'var(--violet)' }}>{report.metadata.timeline}</span>
                    </div>
                  </div>
                  <div className="sg-rh-actions">
                    <button type="button" className="btn btn-ghost" style={{ fontSize: 14, padding: '5px 11px' }}>Export</button>
                    <button type="button" className="btn btn-ai" style={{ fontSize: 14, padding: '5px 11px' }}>Approve</button>
                  </div>
                </div>
                <div className="sg-score-row">
                  <div className="sg-score-card"><div className="sg-sc-label">Scope Score</div><div className="sg-sc-val" style={{ color: score >= 85 ? 'var(--sage)' : score >= 60 ? 'var(--amber)' : 'var(--red)' }}>{report.score}<span style={{ fontSize: 16, color: 'var(--faint)' }}>/100</span></div><div className="sg-sc-sub">{report.scoreLabel}</div></div>
                  <div className="sg-score-card"><div className="sg-sc-label">Stories</div><div className="sg-sc-val">{report.sections.length}</div><div className="sg-sc-sub">Mapped report sections</div></div>
                  <div className="sg-score-card"><div className="sg-sc-label">Risks</div><div className="sg-sc-val" style={{ color: 'var(--red)' }}>{report.riskRows.length}</div><div className="sg-sc-sub">Across extracted analysis</div></div>
                  <div className="sg-score-card"><div className="sg-sc-label">INVEST</div><div className="sg-sc-val">{report.investRows.filter((row) => row.status === 'strong').length}</div><div className="sg-sc-sub">Strong dimensions</div></div>
                </div>
                <div className={`sg-verdict-strip ${verdictClass}`}><AlertTriangle style={{ width: 13, height: 13 }} /><strong>{verdictText}</strong> Review the extracted ambiguities before sprint start.</div>
              </div>

              <div className="sg-section">
                <div className="sg-sec-hd">
                  <div className="sg-sec-title"><AlertTriangle style={{ color: 'var(--red)' }} />Scope Creep Detection</div>
                  <span className="sg-sec-ct" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>{report.riskRows.length} alerts</span>
                </div>
                <div className="creep-alert">
                  <AlertTriangle style={{ width: 16, height: 16, flexShrink: 0 }} />
                  <div className="creep-body">
                    <div className="creep-title">Top extracted risk</div>
                    <div className="creep-desc">{report.riskRows[0]?.evidence || 'No high-confidence creep signal extracted from the latest analysis.'}</div>
                    <div className="creep-delta">{report.riskLevel} risk posture · score {report.score}/100</div>
                  </div>
                </div>
              </div>

              <div className="sg-section">
                <div className="sg-sec-hd">
                  <div className="sg-sec-title"><FileText style={{ color: 'var(--amber)' }} />Risk Matrix</div>
                  <span className="sg-sec-ct" style={{ background: 'var(--amber-bg)', color: 'var(--amber)' }}>{report.riskRows.length} risks</span>
                </div>
                <table className="risk-table">
                  <thead><tr><th>Severity</th><th>Risk</th><th>Category</th><th>Mitigation</th></tr></thead>
                  <tbody>
                    {report.riskRows.map((row) => (
                      <tr key={row.label}>
                        <td><span className={`risk-sev ${row.severity === 'high' ? 'sev-h' : row.severity === 'medium' ? 'sev-m' : 'sev-l'}`}>● {row.severity}</span></td>
                        <td>{row.evidence}</td>
                        <td><span className="risk-cat">{row.label}</span></td>
                        <td>Clarify and document the requirement before execution.</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="sg-section">
                <div className="sg-sec-hd">
                  <div className="sg-sec-title"><Check style={{ color: 'var(--blue)' }} />INVEST Analysis</div>
                  <div style={{ display: 'flex', gap: 7 }}>
                    <span className="sg-sec-ct" style={{ background: 'var(--sage-bg)', color: 'var(--sage)' }}>{report.investRows.filter((row) => row.status === 'strong').length} pass</span>
                    <span className="sg-sec-ct" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}>{report.investRows.filter((row) => row.status === 'weak').length} fail</span>
                  </div>
                </div>
                <div className="invest-grid">
                  {report.investRows.map((row, index) => (
                    <div key={row.dimension} className="invest-card">
                      <div className="ic-id">D-0{index + 1}</div>
                      <div className="ic-title">{row.dimension}</div>
                      <div className="ic-invest">
                        {['I', 'N', 'V', 'E', 'S', 'T'].map((letter) => (
                          <span key={letter} className={row.status === 'strong' ? 'ic-i-ok' : row.status === 'mixed' ? 'ic-i-warn' : 'ic-i-bad'}>{letter}</span>
                        ))}
                      </div>
                      <div className="ic-footer">
                        <span style={{ fontSize: 12, color: row.status === 'strong' ? 'var(--sage)' : row.status === 'mixed' ? 'var(--amber)' : 'var(--red)' }}>{row.evidence}</span>
                        <span className="ic-pts">{row.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : selectedHistoryItem ? (
            <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Selected project has no analysis payload yet.</div>
          ) : (
            <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Choose a history item or run a new analysis.</div>
          )}
        </div>

        <div className="sg-right">
          <div className="sg-meta-sec">
            <div className="sg-meta-lbl">Scope Health Score</div>
            <div className="sg-gauge-wrap">
              <svg className="sg-gauge-svg" viewBox="0 0 100 56">
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#E5E4DE" strokeWidth="8" strokeLinecap="round" />
                <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke={score >= 85 ? '#3D7A5A' : score >= 60 ? '#B8870A' : '#B83232'} strokeWidth="8" strokeLinecap="round" strokeDasharray="125.6" strokeDashoffset={gaugeOffset(score)} />
                <circle cx="67" cy="22" r="4" fill={score >= 85 ? '#3D7A5A' : score >= 60 ? '#B8870A' : '#B83232'} />
              </svg>
              <div className="sg-gauge-val">{score}</div>
              <div className="sg-gauge-lbl">{report?.scoreLabel || 'Needs attention'}</div>
            </div>
          </div>

          <div className="sg-meta-sec">
            <div className="sg-meta-lbl">Document Info</div>
            <div className="sg-meta-row"><span className="sg-meta-key">File</span><span className="sg-meta-val">{uploadedFileName || 'project scope'}</span></div>
            <div className="sg-meta-row"><span className="sg-meta-key">Type</span><span className="sg-meta-val">{report?.metadata.type || selectedHistoryItem?.type || 'n/a'}</span></div>
            <div className="sg-meta-row"><span className="sg-meta-key">Industry</span><span className="sg-meta-val">{report?.metadata.industry || selectedHistoryItem?.industry || 'n/a'}</span></div>
            <div className="sg-meta-row"><span className="sg-meta-key">Timeline</span><span className="sg-meta-val">{report?.metadata.timeline || selectedHistoryItem?.timeline || 'n/a'}</span></div>
          </div>

          <div className="sg-meta-sec">
            <div className="sg-meta-lbl">Approval Checklist</div>
            <div className="sg-checklist">
              {report?.investRows.map((row) => (
                <div key={row.dimension} className="sg-chk">
                  <div className={`sg-chk-box ${row.status === 'strong' ? 'sg-chk-box-ok' : 'sg-chk-box-no'}`}>
                    {row.status === 'strong' ? <Check /> : <X />}
                  </div>
                  <span className={row.status === 'strong' ? 'sg-chk-text-ok' : 'sg-chk-text-no'}>{row.dimension}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="sg-meta-sec">
            <div className="sg-meta-lbl">Sprint Capacity</div>
            <div className="sg-meta-row"><span className="sg-meta-key">Committed</span><span className="sg-meta-val">{Math.max(score - 18, 0)} SP</span></div>
            <div className="sg-meta-row"><span className="sg-meta-key">Potential creep</span><span className="sg-meta-val" style={{ color: 'var(--red)' }}>+{report?.riskRows.length || 0} items</span></div>
            <div className="sg-meta-row"><span className="sg-meta-key">Velocity</span><span className="sg-meta-val">42 SP/sprint</span></div>
            <div style={{ marginTop: 8, height: 5, background: 'var(--bg3)', borderRadius: 99, overflow: 'hidden' }}><div style={{ width: `${Math.min(score, 100)}%`, height: '100%', background: 'var(--accent)', borderRadius: 99 }} /></div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{Math.min(score, 100)}% confidence in scope readiness</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <button type="button" className="btn btn-ghost" style={{ justifyContent: 'center', fontSize: 14 }}>Ask AI about this scope</button>
            <button type="button" className="btn btn-ai" style={{ justifyContent: 'center', fontSize: 14 }}>Approve and link to sprint</button>
          </div>
        </div>
      </div>
    </div>
  );
}
