'use client';

import { useState, useEffect } from 'react';
import { FileText, Check } from 'lucide-react';
import axios from 'axios';

interface ProjectTemplate {
  id: number;
  name: string;
  description: string | null;
  category: string;
  templateData: string;
  usageCount: number;
}

interface ProjectTemplateSelectorProps {
  onSelectTemplate: (template: ProjectTemplate) => void;
  onCancel: () => void;
}

export function ProjectTemplateSelector({ onSelectTemplate, onCancel }: ProjectTemplateSelectorProps) {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    loadTemplates();
  }, [selectedCategory]);

  const loadTemplates = async () => {
    try {
      const params = selectedCategory !== 'all' ? `?category=${selectedCategory}` : '';
      const response = await axios.get(`/api/project-templates${params}`);
      setTemplates(response.data.templates || []);
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { value: 'all', label: 'All Templates' },
    { value: 'web_app', label: 'Web Apps' },
    { value: 'mobile_app', label: 'Mobile Apps' },
    { value: 'ecommerce', label: 'E-commerce' },
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="glass-strong rounded-xl p-8 border border-white/20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-strong rounded-xl border border-white/20 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Select Project Template</h2>
          <p className="text-text-secondary">Choose a template to get started quickly</p>
        </div>

        {/* Category Filter */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === cat.value
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {templates.length === 0 ? (
            <div className="text-center py-12 text-text-tertiary">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No templates found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templates.map((template) => {
                const templateData = JSON.parse(template.templateData);
                return (
                  <button
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="glass-medium rounded-xl p-6 border border-white/10 hover:glass-light transition-all text-left group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-xs text-text-tertiary mt-1">
                          Used {template.usageCount} times
                        </p>
                      </div>
                      <FileText className="w-6 h-6 text-text-tertiary" />
                    </div>
                    <p className="text-sm text-text-secondary mb-4">{template.description}</p>
                    <div className="space-y-2">
                      <div className="text-xs text-text-tertiary">
                        <span className="font-medium">Timeline:</span> {templateData.timeline}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        <span className="font-medium">Budget:</span>{' '}
                        {templateData.budget ? `$${(templateData.budget / 100).toLocaleString()}` : 'Not set'}
                      </div>
                      <div className="text-xs text-text-tertiary">
                        <span className="font-medium">Tasks:</span> {templateData.tasks?.length || 0} pre-filled
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

