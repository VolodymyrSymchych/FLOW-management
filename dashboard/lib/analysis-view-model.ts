import { getScoreLabel } from '@/lib/utils';

export interface AnalysisHistoryItem {
  id: number;
  name: string;
  status: string;
  score: number;
  riskLevel: string;
  type: string;
  industry: string;
  teamSize: string;
  timeline: string;
  createdAt?: string;
  updatedAt?: string;
  hasAnalysis: boolean;
}

export interface AnalysisSectionViewModel {
  id: string;
  title: string;
  body: string;
  bullets: string[];
}

export interface AnalysisRiskRow {
  label: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string;
}

export interface AnalysisInvestRow {
  dimension: 'Independent' | 'Negotiable' | 'Valuable' | 'Estimable' | 'Small' | 'Testable';
  status: 'strong' | 'mixed' | 'weak';
  evidence: string;
}

export interface AnalysisReportViewModel {
  id: number;
  name: string;
  status: string;
  score: number;
  scoreLabel: string;
  riskLevel: string;
  createdAt?: string;
  metadata: {
    type: string;
    industry: string;
    teamSize: string;
    timeline: string;
  };
  report: string;
  summary: string;
  sections: AnalysisSectionViewModel[];
  stagesCompleted: number;
  riskRows: AnalysisRiskRow[];
  investRows: AnalysisInvestRow[];
}

interface ProjectListItem {
  id: number;
  name: string;
  status?: string | null;
  score?: number | null;
  risk_level?: string | null;
  type?: string | null;
  industry?: string | null;
  team_size?: string | null;
  teamSize?: string | null;
  timeline?: string | null;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  analysisData?: string | null;
  document?: string | null;
}

interface ProjectDetailPayload {
  project: {
    id: number;
    name: string;
    status?: string | null;
    score?: number | null;
    risk_level?: string | null;
    type?: string | null;
    industry?: string | null;
    team_size?: string | null;
    timeline?: string | null;
    created_at?: string;
  };
  analysis: {
    results?: Record<string, string>;
    report?: string;
    metadata?: {
      project_type?: string;
      industry?: string;
      team_size?: string;
      timeline?: string;
    };
  };
}

const investDimensions: AnalysisInvestRow['dimension'][] = [
  'Independent',
  'Negotiable',
  'Valuable',
  'Estimable',
  'Small',
  'Testable',
];

function toSentences(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((chunk) => chunk.split(/(?<=[.!?])\s+/))
    .map((item) => item.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function toBullets(text: string): string[] {
  const bulletLines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => /^[-*]\s+/.test(line))
    .map((line) => line.replace(/^[-*]\s+/, '').trim());

  if (bulletLines.length > 0) return bulletLines.slice(0, 5);
  return toSentences(text).slice(0, 5);
}

function normalizeRiskLevel(value?: string | null) {
  return (value || 'unknown').toUpperCase();
}

function titleize(key: string) {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function severityFromText(text: string): AnalysisRiskRow['severity'] {
  const normalized = text.toLowerCase();
  if (/(critical|high risk|danger|blocker|severe|must)/.test(normalized)) return 'high';
  if (/(medium|watch|dependency|clarif|unknown|question)/.test(normalized)) return 'medium';
  return 'low';
}

function investStatus(score: number, text: string, dimension: AnalysisInvestRow['dimension']): AnalysisInvestRow['status'] {
  const normalized = text.toLowerCase();
  const weakSignals = /(vague|poor|missing|unclear|not measurable|lack|ambig)/;
  const strongSignals = /(clear|specific|testable|measurable|well-structured|outstanding|strong)/;

  if (weakSignals.test(normalized)) return 'weak';
  if (strongSignals.test(normalized) && score >= 70) return 'strong';
  if (score >= 82) return 'strong';
  if (score >= 60) return 'mixed';
  if (dimension === 'Valuable' && /(value|objective|success criteria)/.test(normalized)) return 'mixed';
  return 'weak';
}

function parseSummary(report: string, fallback: string) {
  const summaryLine = toSentences(report)[0];
  return summaryLine || fallback;
}

function parseSections(results: Record<string, string>, report: string): AnalysisSectionViewModel[] {
  const entries = Object.entries(results || {});
  if (entries.length > 0) {
    return entries.map(([key, value]) => ({
      id: key,
      title: titleize(key),
      body: value,
      bullets: toBullets(value),
    }));
  }

  return [
    {
      id: 'report',
      title: 'Full report',
      body: report,
      bullets: toBullets(report),
    },
  ];
}

function parseRiskRows(text: string, sections: AnalysisSectionViewModel[]): AnalysisRiskRow[] {
  const riskText = text || sections.find((section) => section.id === 'risk_assessment')?.body || '';
  const bullets = toBullets(riskText);
  if (bullets.length === 0) {
    return [{ label: 'General risk posture', severity: 'medium', evidence: 'Detailed risk markers were not extracted from the latest analysis.' }];
  }

  return bullets.slice(0, 5).map((bullet, index) => ({
    label: `Risk ${index + 1}`,
    severity: severityFromText(bullet),
    evidence: bullet,
  }));
}

function parseInvestRows(text: string, score: number): AnalysisInvestRow[] {
  const sentences = toSentences(text);
  return investDimensions.map((dimension, index) => ({
    dimension,
    status: investStatus(score, text, dimension),
    evidence: sentences[index] || sentences[0] || 'Heuristic summary derived from the requirements-quality analysis.',
  }));
}

export function toAnalysisHistoryItem(project: ProjectListItem): AnalysisHistoryItem {
  return {
    id: project.id,
    name: project.name,
    status: project.status || 'draft',
    score: project.score || 0,
    riskLevel: normalizeRiskLevel(project.risk_level),
    type: project.type || 'not specified',
    industry: project.industry || 'not specified',
    teamSize: project.team_size || project.teamSize || 'not specified',
    timeline: project.timeline || 'not specified',
    createdAt: project.created_at || project.createdAt,
    updatedAt: project.updatedAt,
    hasAnalysis: Boolean(project.analysisData || project.document || (project.score && project.score > 0)),
  };
}

export function toAnalysisReportViewModel(payload: ProjectDetailPayload): AnalysisReportViewModel {
  const score = payload.project.score || 0;
  const report = payload.analysis.report || 'Analysis not available.';
  const sections = parseSections(payload.analysis.results || {}, report);
  const summary = parseSummary(report, sections[0]?.bullets[0] || 'Analysis summary is unavailable.');
  const requirementsText = payload.analysis.results?.requirements_quality || report;
  const riskText = payload.analysis.results?.risk_assessment || report;

  return {
    id: payload.project.id,
    name: payload.project.name,
    status: payload.project.status || 'completed',
    score,
    scoreLabel: getScoreLabel(score),
    riskLevel: normalizeRiskLevel(payload.project.risk_level),
    createdAt: payload.project.created_at,
    metadata: {
      type: payload.analysis.metadata?.project_type || payload.project.type || 'not specified',
      industry: payload.analysis.metadata?.industry || payload.project.industry || 'not specified',
      teamSize: payload.analysis.metadata?.team_size || payload.project.team_size || 'not specified',
      timeline: payload.analysis.metadata?.timeline || payload.project.timeline || 'not specified',
    },
    report,
    summary,
    sections,
    stagesCompleted: Object.keys(payload.analysis.results || {}).length,
    riskRows: parseRiskRows(riskText, sections),
    investRows: parseInvestRows(requirementsText, score),
  };
}
