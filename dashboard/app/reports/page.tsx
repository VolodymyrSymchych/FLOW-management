'use client';

import { useState } from 'react';
import { Plus, FileText, Download, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Report {
  id: number;
  title: string;
  type: 'project_status' | 'analysis' | 'custom';
  created_by: string;
  created_at: string;
  updated_at: string;
  project?: string;
}

export default function ReportsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([
    {
      id: 1,
      title: 'Mobile Banking App - Project Status Report',
      type: 'project_status',
      created_by: 'AR',
      created_at: '2024-11-06T10:00:00Z',
      updated_at: '2024-11-07T14:30:00Z',
      project: 'Mobile Banking App'
    },
    {
      id: 2,
      title: 'Q4 2024 Analysis Report',
      type: 'analysis',
      created_by: 'JD',
      created_at: '2024-11-05T09:00:00Z',
      updated_at: '2024-11-05T16:00:00Z',
    },
    {
      id: 3,
      title: 'E-commerce Platform Technical Documentation',
      type: 'custom',
      created_by: 'SK',
      created_at: '2024-11-03T11:00:00Z',
      updated_at: '2024-11-06T10:00:00Z',
      project: 'E-commerce Platform'
    },
  ]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'project_status': return 'Project Status';
      case 'analysis': return 'Analysis';
      case 'custom': return 'Custom';
      default: return type;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'project_status': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
      case 'analysis': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400';
      case 'custom': return 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
          <p className="text-text-secondary mt-1">
            Create and manage rich text reports
          </p>
        </div>
        <button
          onClick={() => router.push('/reports/new')}
          className="flex items-center space-x-2 px-4 py-2 glass-button text-white rounded-lg"
        >
          <Plus className="w-5 h-5" />
          <span>New Report</span>
        </button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <div
            key={report.id}
            className="glass-medium glass-hover rounded-2xl p-6 cursor-pointer group"
            onClick={() => router.push(`/reports/${report.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl glass-light flex items-center justify-center">
                <FileText className="w-6 h-6 text-[#FF6B4A] drop-shadow-[0_0_8px_rgba(255,107,74,0.5)]" />
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(report.type)}`}>
                {getTypeLabel(report.type)}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-text-primary mb-2 group-hover:text-primary transition-colors">
              {report.title}
            </h3>

            {report.project && (
              <p className="text-sm text-text-tertiary mb-3">
                📁 {report.project}
              </p>
            )}

            <div className="flex items-center justify-between text-sm text-text-tertiary pt-4 border-t border-white/10">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xs font-semibold">
                  {report.created_by}
                </div>
                <span>{report.created_by}</span>
              </div>
              <span>{formatDate(report.updated_at)}</span>
            </div>

            <div className="flex items-center space-x-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/reports/${report.id}`);
                }}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors text-sm"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Export to PDF
                }}
                className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/40 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                <span>PDF</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {reports.length === 0 && (
        <div className="text-center py-12 glass-medium rounded-2xl">
          <FileText className="w-12 h-12 text-text-tertiary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">No reports yet</p>
          <button
            onClick={() => router.push('/reports/new')}
            className="px-4 py-2 glass-button text-white rounded-lg"
          >
            Create Your First Report
          </button>
        </div>
      )}
    </div>
  );
}
