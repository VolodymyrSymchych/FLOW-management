'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface RecurringInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projectId: number;
  baseInvoiceId?: number;
}

export function RecurringInvoiceForm({
  isOpen,
  onClose,
  onSave,
  projectId,
  baseInvoiceId,
}: RecurringInvoiceFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    frequency: 'monthly',
    custom_interval_days: '',
    next_generation_date: '',
    end_date: '',
    auto_send_email: true,
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post('/api/recurring-invoices', {
        project_id: projectId,
        base_invoice_id: baseInvoiceId,
        ...formData,
        custom_interval_days: formData.custom_interval_days ? parseInt(formData.custom_interval_days) : null,
      });
      onSave();
      onClose();
    } catch (error: any) {
      console.error('Failed to create recurring invoice:', error);
      alert(error.response?.data?.error || 'Failed to create recurring invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="glass-strong rounded-xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-text-primary">Create Recurring Invoice</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Frequency *
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary"
                required
              >
                <option value="weekly">Weekly</option>
                <option value="bi-weekly">Bi-weekly</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="yearly">Yearly</option>
                <option value="custom">Custom</option>
              </select>
            </div>

            {formData.frequency === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Custom Interval (days) *
                </label>
                <input
                  type="number"
                  value={formData.custom_interval_days}
                  onChange={(e) => setFormData({ ...formData, custom_interval_days: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary"
                  min="1"
                  required={formData.frequency === 'custom'}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Next Generation Date *
              </label>
              <input
                type="date"
                value={formData.next_generation_date}
                onChange={(e) => setFormData({ ...formData, next_generation_date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                End Date (optional)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="auto_send_email"
                checked={formData.auto_send_email}
                onChange={(e) => setFormData({ ...formData, auto_send_email: e.target.checked })}
                className="w-4 h-4 rounded"
              />
              <label htmlFor="auto_send_email" className="text-sm text-text-primary">
                Automatically send email when invoice is generated
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Recurring Invoice'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

