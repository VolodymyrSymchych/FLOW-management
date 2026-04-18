'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  projectId?: number; // Optional - if provided, will pre-select this project
  invoice?: {
    id: number;
    projectId?: number;
    invoiceNumber: string;
    clientName: string | null;
    clientEmail: string | null;
    clientAddress: string | null;
    amount: number;
    currency: string;
    taxRate: number;
    totalAmount: number;
    status: string;
    issueDate: string;
    dueDate: string | null;
    description: string | null;
    items: string | null;
    notes: string | null;
  } | null;
}

export function InvoiceForm({ isOpen, onClose, onSave, projectId, invoice }: InvoiceFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    project_id: projectId || '',
    invoice_number: '',
    client_name: '',
    client_email: '',
    client_address: '',
    amount: '',
    currency: 'usd',
    tax_rate: '0',
    status: 'draft',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    description: '',
    notes: '',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadProjects();
      if (invoice) {
        // Edit mode - populate form with invoice data
        setFormData({
          project_id: invoice.projectId || projectId || '',
          invoice_number: invoice.invoiceNumber,
          client_name: invoice.clientName || '',
          client_email: invoice.clientEmail || '',
          client_address: invoice.clientAddress || '',
          amount: (invoice.amount / 100).toFixed(2), // Convert from cents
          currency: invoice.currency || 'usd',
          tax_rate: invoice.taxRate?.toString() || '0',
          status: invoice.status || 'draft',
          issue_date: invoice.issueDate.split('T')[0],
          due_date: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
          description: invoice.description || '',
          notes: invoice.notes || '',
        });
        // Parse items if they exist
        if (invoice.items) {
          try {
            const parsedItems = JSON.parse(invoice.items);
            if (Array.isArray(parsedItems) && parsedItems.length > 0) {
              setItems(parsedItems.map((item: any) => ({
                description: item.description || '',
                quantity: item.quantity || 1,
                unitPrice: item.unitPrice || 0,
              })));
            }
          } catch (e) {
            console.error('Failed to parse invoice items:', e);
          }
        }
      } else {
        // Create mode
        if (projectId) {
          setFormData(prev => ({ ...prev, project_id: projectId }));
        }
        // Generate invoice number
        const invoiceNumber = `INV-${Date.now()}`;
        setFormData(prev => ({ ...prev, invoice_number: invoiceNumber }));
      }
    }
  }, [isOpen, projectId, invoice]);

  const loadProjects = async () => {
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const calculateAmount = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    return subtotal;
  };

  const handleItemChange = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    
    // Update amount
    const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    setFormData(prev => ({ ...prev, amount: subtotal.toString() }));
  };

  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      const subtotal = newItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      setFormData(prev => ({ ...prev, amount: subtotal.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.project_id || !formData.invoice_number) {
      alert('Please fill in Project and Invoice Number');
      return;
    }

    // Check if there are valid items
    const validItems = items.filter(item => item.description && item.unitPrice > 0);
    if (validItems.length === 0) {
      alert('Please add at least one invoice item with description and price');
      return;
    }

    // Calculate amount from items
    const subtotal = validItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    if (subtotal === 0) {
      alert('Invoice total cannot be zero. Please add items with prices.');
      return;
    }

    setLoading(true);
    try {
      const invoiceData = {
        project_id: parseInt(formData.project_id as string),
        invoice_number: formData.invoice_number,
        client_name: formData.client_name || null,
        client_email: formData.client_email || null,
        client_address: formData.client_address || null,
        amount: subtotal, // Use calculated subtotal
        currency: formData.currency,
        tax_rate: parseFloat(formData.tax_rate) || 0,
        status: formData.status,
        issue_date: formData.issue_date,
        due_date: formData.due_date || null,
        description: formData.description || null,
        items: validItems,
        notes: formData.notes || null,
      };

      if (invoice) {
        // Update existing invoice
        await axios.put(`/api/invoices/${invoice.id}`, invoiceData);
      } else {
        // Create new invoice
        await axios.post('/api/invoices', invoiceData);
      }
      
      onSave();
      onClose();
      
      // Reset form
      setFormData({
        project_id: projectId || '',
        invoice_number: `INV-${Date.now()}`,
        client_name: '',
        client_email: '',
        client_address: '',
        amount: '',
        currency: 'usd',
        tax_rate: '0',
        status: 'draft',
        issue_date: new Date().toISOString().split('T')[0],
        due_date: '',
        description: '',
        notes: '',
      });
      setItems([{ description: '', quantity: 1, unitPrice: 0 }]);
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to save invoice. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = calculateAmount();
  const taxAmount = (subtotal * parseFloat(formData.tax_rate)) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="glass-medium rounded-2xl p-5 border border-white/10 w-full max-w-5xl max-h-[95vh] my-auto flex flex-col ">
        <div className="flex items-center justify-between mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-text-primary">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-text-primary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-4">
            {/* Top Row - Basic Info */}
            <div className="grid grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Project *
                </label>
                <select
                  required
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Invoice # *
                </label>
                <input
                  type="text"
                  required
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Client Info */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-text-primary">Client Information</h3>
                  <input
                    type="text"
                    placeholder="Client Name"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="email"
                    placeholder="Client Email"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <textarea
                    rows={2}
                    placeholder="Client Address"
                    value={formData.client_address}
                    onChange={(e) => setFormData({ ...formData, client_address: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>

                {/* Dates and Tax */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                      Due Date
                    </label>
                    <input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1">
                      Tax Rate (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax_rate}
                      onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="usd">USD</option>
                    <option value="eur">EUR</option>
                    <option value="gbp">GBP</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">Invoice Items</h3>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-xs text-primary hover:underline"
                  >
                    + Add
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <input
                          type="text"
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Price"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1.5 text-xs rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="col-span-1 text-xs text-text-secondary text-right">
                        ${(item.quantity * item.unitPrice).toFixed(2)}
                      </div>
                      <div className="col-span-1">
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="p-1 hover:bg-white/10 rounded transition-colors"
                          >
                            <X className="w-3 h-3 text-text-secondary" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-1 border-t border-white/10 pt-2 mt-2">
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-text-secondary">
                    <span>Tax ({formData.tax_rate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-text-primary border-t border-white/10 pt-1">
                    <span>Total:</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg glass-medium border border-white/10 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-white/10 mt-4 flex-shrink-0">
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
              {loading ? (invoice ? 'Updating...' : 'Creating...') : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

