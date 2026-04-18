'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Modal, ModalFooter } from '@/components/ui/modal';

interface Team {
  id: number;
  name: string;
}

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  project: {
    id: number;
    name: string;
    type: string;
    industry: string;
    team_size: string;
    timeline: string;
    status: string;
    budget?: number;
    start_date?: string;
    end_date?: string;
    team_id?: number;
  };
}

export function EditProjectModal({ isOpen, onClose, onSave, project }: EditProjectModalProps) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [formData, setFormData] = useState({
    name: project.name || '',
    type: project.type || '',
    industry: project.industry || '',
    team_size: project.team_size || '',
    timeline: project.timeline || '',
    status: project.status || 'in_progress',
    budget: project.budget?.toString() || '',
    start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
    end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
    team_id: project.team_id?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      // Update form when project changes
      setFormData({
        name: project.name || '',
        type: project.type || '',
        industry: project.industry || '',
        team_size: project.team_size || '',
        timeline: project.timeline || '',
        status: project.status || 'in_progress',
        budget: project.budget?.toString() || '',
        start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
        end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
        team_id: project.team_id?.toString() || '',
      });
    }
  }, [isOpen, project]);

  const loadTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data.teams || []);
    } catch (error) {
      console.error('Failed to load teams:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`/api/projects/${project.id}`, {
        name: formData.name,
        type: formData.type,
        industry: formData.industry,
        team_size: formData.team_size,
        timeline: formData.timeline,
        status: formData.status,
        budget: formData.budget ? parseInt(formData.budget) : null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        team_id: formData.team_id ? parseInt(formData.team_id) : null,
      });

      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to update project. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Project"
      size="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Project Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Type and Industry */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Project Type
              </label>
              <input
                type="text"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                placeholder="e.g., Web Development"
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Industry
              </label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., Technology"
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Team Size and Timeline */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Team Size
              </label>
              <input
                type="text"
                value={formData.team_size}
                onChange={(e) => setFormData({ ...formData, team_size: e.target.value })}
                placeholder="e.g., 5-10 people"
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Timeline
              </label>
              <input
                type="text"
                value={formData.timeline}
                onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                placeholder="e.g., 6 months"
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {/* Status and Team */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="planning">Planning</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="on_hold">On Hold</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Assign Team
              </label>
              <select
                value={formData.team_id}
                onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">No Team</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">
              Budget (USD)
            </label>
            <input
              type="number"
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              placeholder="Enter budget in USD"
              className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Start and End Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">
                End Date
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg glass-medium border border-white/5 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

        <ModalFooter>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
