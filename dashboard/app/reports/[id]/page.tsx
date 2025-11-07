'use client';

import { useState } from 'react';
import { ArrowLeft, Save, Download, FileText } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { RichTextEditor } from '@/components/RichTextEditor';
import jsPDF from 'jspdf';

export default function ReportEditorPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === 'new';

  const [title, setTitle] = useState(
    isNew ? '' : 'Mobile Banking App - Project Status Report'
  );
  const [content, setContent] = useState(
    isNew
      ? '<h1>New Report</h1><p>Start writing your report here...</p>'
      : `<h1>Mobile Banking App - Project Status Report</h1>
<h2>Executive Summary</h2>
<p>The Mobile Banking App project is progressing according to schedule. Key milestones have been achieved in Q4 2024.</p>

<h2>Project Overview</h2>
<ul>
  <li><strong>Start Date:</strong> November 1, 2024</li>
  <li><strong>Expected Completion:</strong> December 31, 2024</li>
  <li><strong>Team Size:</strong> 6 members</li>
  <li><strong>Budget Status:</strong> On track</li>
</ul>

<h2>Key Accomplishments</h2>
<ol>
  <li>Completed UI/UX design phase</li>
  <li>Implemented core authentication system</li>
  <li>Integrated payment gateway APIs</li>
  <li>Completed security audit</li>
</ol>

<h2>Current Status</h2>
<p>The project is currently in the development phase with 65% completion. All major features are implemented and undergoing testing.</p>

<h2>Challenges & Risks</h2>
<p>Minor delays in third-party API integration have been identified. Mitigation strategies are in place.</p>

<h2>Next Steps</h2>
<ul>
  <li>Complete integration testing by Dec 10</li>
  <li>User acceptance testing Dec 11-15</li>
  <li>Beta release Dec 15</li>
  <li>Final release Dec 31</li>
</ul>`
  );
  const [reportType, setReportType] = useState<'project_status' | 'analysis' | 'custom'>(
    'project_status'
  );

  const handleSave = () => {
    // In real app, save to backend
    alert('Report saved successfully!');
    router.push('/reports');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text(title, 20, 20);

    // Convert HTML content to text (simplified)
    const textContent = content
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '\n\n$1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '\n\n$1\n')
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n')
      .replace(/<li[^>]*>(.*?)<\/li>/gi, '• $1\n')
      .replace(/<[^>]+>/g, '');

    doc.setFontSize(12);
    const lines = doc.splitTextToSize(textContent, 170);
    doc.text(lines, 20, 40);

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/reports')}
          className="flex items-center space-x-2 text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Reports</span>
        </button>
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToPDF}
            className="flex items-center space-x-2 px-4 py-2 glass-light hover:glass-medium rounded-lg transition-all"
          >
            <Download className="w-5 h-5 text-text-secondary" />
            <span className="text-text-primary">Export PDF</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 glass-button text-white rounded-lg"
          >
            <Save className="w-5 h-5" />
            <span>Save Report</span>
          </button>
        </div>
      </div>

      {/* Report Details */}
      <div className="glass-medium rounded-2xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Report Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter report title..."
            className="w-full px-4 py-3 rounded-lg glass-input text-text-primary text-xl font-semibold"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-lg glass-input text-text-primary"
            >
              <option value="project_status">Project Status</option>
              <option value="analysis">Analysis Report</option>
              <option value="custom">Custom Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Related Project (Optional)
            </label>
            <input
              type="text"
              placeholder="Enter project name..."
              className="w-full px-4 py-3 rounded-lg glass-input text-text-primary"
            />
          </div>
        </div>
      </div>

      {/* Rich Text Editor */}
      <div className="glass-medium rounded-2xl p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Report Content</h3>
        <RichTextEditor content={content} onChange={setContent} />
      </div>

      {/* Additional Actions */}
      <div className="flex justify-end space-x-3 pb-8">
        <button
          onClick={() => router.push('/reports')}
          className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-3 glass-button text-white rounded-lg font-medium"
        >
          Save Report
        </button>
      </div>
    </div>
  );
}
