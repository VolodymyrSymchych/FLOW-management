'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projectId: number;
  expense?: {
    id: number;
    category: string;
    description: string;
    amount: number;
    currency: string;
    expenseDate: string;
    receiptUrl?: string | null;
    notes?: string | null;
  } | null;
}

export function ExpenseForm({ isOpen, onClose, onSave, projectId, expense }: ExpenseFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: projectId,
    category: 'materials',
    description: '',
    amount: '',
    currency: 'usd',
    expense_date: new Date().toISOString().split('T')[0],
    receipt_url: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      if (expense) {
        // Edit mode - populate form with expense data
        setFormData({
          project_id: projectId,
          category: expense.category,
          description: expense.description,
          amount: (expense.amount / 100).toFixed(2), // Convert from cents
          currency: expense.currency || 'usd',
          expense_date: expense.expenseDate.includes('T') 
            ? expense.expenseDate.split('T')[0] 
            : new Date(expense.expenseDate).toISOString().split('T')[0],
          receipt_url: expense.receiptUrl || '',
          notes: expense.notes || '',
        });
      } else {
        // Create mode - reset form
        setFormData({
          project_id: projectId,
          category: 'materials',
          description: '',
          amount: '',
          currency: 'usd',
          expense_date: new Date().toISOString().split('T')[0],
          receipt_url: '',
          notes: '',
        });
      }
    }
  }, [isOpen, expense, projectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.amount) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const expenseData = {
        project_id: projectId,
        category: formData.category,
        description: formData.description,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convert to cents
        currency: formData.currency,
        expense_date: formData.expense_date,
        receipt_url: formData.receipt_url || null,
        notes: formData.notes || null,
      };

      if (expense) {
        // Update existing expense
        await axios.put(`/api/expenses/${expense.id}`, expenseData);
      } else {
        // Create new expense
        await axios.post('/api/expenses', expenseData);
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save expense:', error);
      alert('Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="glass-medium rounded-2xl p-6 border border-white/10 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {expense ? 'Edit Expense' : 'Create New Expense'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Category *
              </label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="materials">Materials</option>
                <option value="labor">Labor</option>
                <option value="software">Software</option>
                <option value="travel">Travel</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Amount *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Describe the expense..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Expense Date *
              </label>
              <input
                type="date"
                required
                value={formData.expense_date}
                onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="usd">USD</option>
                <option value="eur">EUR</option>
                <option value="gbp">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Receipt URL (optional)
            </label>
            <input
              type="url"
              value={formData.receipt_url}
              onChange={(e) => setFormData({ ...formData, receipt_url: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Notes (optional)
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
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
              {loading ? (expense ? 'Updating...' : 'Creating...') : (expense ? 'Update Expense' : 'Create Expense')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

