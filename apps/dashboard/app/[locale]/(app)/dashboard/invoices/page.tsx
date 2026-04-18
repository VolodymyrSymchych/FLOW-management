'use client';

import { useMemo, useState } from 'react';
import { Plus, Search, Download, Trash2, Mail } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { useTeam } from '@/contexts/TeamContext';
import { useInvoices, useProjects } from '@/hooks/useQueries';

interface Invoice {
  id: number;
  projectId: number;
  invoiceNumber: string;
  clientName: string | null;
  clientEmail?: string | null;
  amount: number;
  totalAmount: number;
  status: string;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format((cents || 0) / 100);
}

function formatDate(value: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function invoiceStatusMeta(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === 'paid') return { label: 'Paid', cls: 'stat-paid' };
  if (normalized === 'overdue') return { label: 'Overdue', cls: 'stat-over' };
  if (normalized === 'sent' || normalized === 'pending') return { label: 'Pending', cls: 'stat-pend' };
  if (normalized === 'draft') return { label: 'Draft', cls: 'stat-draft' };
  return { label: status, cls: 'stat-draft' };
}

export default function InvoicesPage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const { selectedTeam, isLoading: teamsLoading } = useTeam();
  const queryClient = useQueryClient();
  const teamId = selectedTeam.type === 'single' && selectedTeam.teamId ? selectedTeam.teamId : 'all';
  const { data: invoices = [], isLoading: invoicesLoading, refetch } = useInvoices(teamId);
  const { data: projects = [] } = useProjects(teamId);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'overdue' | 'paid' | 'draft'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [clientFilter, setClientFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [dueAfter, setDueAfter] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; invoice: Invoice | null }>({ isOpen: false, invoice: null });

  const isLoading = teamsLoading || (invoicesLoading && invoices.length === 0);

  const projectName = (projectId: number) => projects.find((project) => project.id === projectId)?.name || 'Unknown Project';

  const clientOptions = useMemo(() => Array.from(new Set(invoices.map((invoice) => invoice.clientName).filter(Boolean))) as string[], [invoices]);
  const projectOptions = useMemo<string[]>(() => Array.from(new Set(invoices.map((invoice) => projectName(invoice.projectId)))), [invoices, projects]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const normalizedStatus = invoice.status.toLowerCase();
      const search = searchTerm.trim().toLowerCase();
      const invoiceProject = projectName(invoice.projectId);
      const invoiceClient = invoice.clientName || '';
      const amount = Math.round((invoice.totalAmount || invoice.amount || 0) / 100);

      const matchesSearch = !search
        || invoice.invoiceNumber.toLowerCase().includes(search)
        || invoiceClient.toLowerCase().includes(search)
        || invoiceProject.toLowerCase().includes(search);
      const matchesStatus = statusFilter === 'all' || normalizedStatus === statusFilter || (statusFilter === 'pending' && normalizedStatus === 'sent');
      const matchesClient = !clientFilter || invoiceClient === clientFilter;
      const matchesProject = !projectFilter || invoiceProject === projectFilter;
      const matchesAmount = !minAmount || amount >= Number(minAmount);
      const matchesDueDate = !dueAfter || (!invoice.dueDate ? false : invoice.dueDate >= dueAfter);

      return matchesSearch && matchesStatus && matchesClient && matchesProject && matchesAmount && matchesDueDate;
    });
  }, [clientFilter, dueAfter, invoices, minAmount, projectFilter, projects, searchTerm, statusFilter]);

  const stats = useMemo(() => {
    const outstanding = filteredInvoices.filter((invoice) => invoice.status !== 'paid').reduce((sum, invoice) => sum + (invoice.totalAmount || invoice.amount || 0), 0);
    const overdueInvoices = filteredInvoices.filter((invoice) => invoice.status.toLowerCase() === 'overdue');
    const overdue = overdueInvoices.reduce((sum, invoice) => sum + (invoice.totalAmount || invoice.amount || 0), 0);
    const paidThisMonth = filteredInvoices.filter((invoice) => invoice.status.toLowerCase() === 'paid').reduce((sum, invoice) => sum + (invoice.totalAmount || invoice.amount || 0), 0);

    const paymentDays = filteredInvoices
      .filter((invoice) => invoice.paidDate && invoice.issueDate)
      .map((invoice) => {
        const issue = new Date(invoice.issueDate).getTime();
        const paid = new Date(invoice.paidDate as string).getTime();
        return Math.max(0, Math.round((paid - issue) / (1000 * 60 * 60 * 24)));
      });

    const avgPaymentDays = paymentDays.length ? Math.round(paymentDays.reduce((sum, value) => sum + value, 0) / paymentDays.length) : 0;

    return {
      outstanding,
      outstandingCount: filteredInvoices.filter((invoice) => invoice.status !== 'paid').length,
      overdue,
      overdueCount: overdueInvoices.length,
      paidThisMonth,
      paidCount: filteredInvoices.filter((invoice) => invoice.status.toLowerCase() === 'paid').length,
      avgPaymentDays,
    };
  }, [filteredInvoices]);

  const loadData = async () => {
    await refetch();
    await queryClient.invalidateQueries({ queryKey: ['invoices'] });
  };

  const handleSendEmail = async (invoice: Invoice, action: 'send' | 'remind_overdue' | 'remind_due_date' = 'send') => {
    if (!invoice.clientEmail) {
      alert('Client email is required to send email');
      return;
    }

    try {
      await axios.post(`/api/invoices/${invoice.id}/send-email`, { action });
      alert(`Email sent to ${invoice.clientEmail}`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to send email');
    }
  };

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await axios.get(`/api/invoices/${invoice.id}`);
      await generateInvoicePDF({ ...response.data.invoice, projectName: projectName(invoice.projectId) });
    } catch (error) {
      console.error('Failed to download invoice:', error);
      alert('Failed to download invoice');
    }
  };

  const confirmDeleteInvoice = async () => {
    if (!deleteModal.invoice) return;
    try {
      await axios.delete(`/api/invoices/${deleteModal.invoice.id}`);
      setDeleteModal({ isOpen: false, invoice: null });
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete invoice');
    }
  };

  const clearFilters = () => {
    setClientFilter('');
    setProjectFilter('');
    setMinAmount('');
    setDueAfter('');
    setSearchTerm('');
    setStatusFilter('all');
  };

  const openNewInvoicePage = () => {
    router.push(`/${locale}/dashboard/invoices/new`);
  };

  if (isLoading) {
    return <div style={{ padding: 24, fontSize: 14, color: 'var(--muted)' }}>Loading invoices...</div>;
  }

  return (
    <div className="scr-inner" data-testid="invoices-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>Invoices</h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>{filteredInvoices.length} invoices · {stats.outstandingCount} outstanding · {stats.overdueCount} overdue</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="inv-search" style={{ maxWidth: 260 }}>
              <Search />
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search invoices..." />
            </div>
            <div className="inv-tabs">
              {[
                ['all', 'All'],
                ['pending', 'Pending'],
                ['overdue', 'Overdue'],
                ['paid', 'Paid'],
                ['draft', 'Drafts'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={`inv-tab ${statusFilter === value ? 'on' : ''}`}
                  onClick={() => setStatusFilter(value as typeof statusFilter)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button type="button" className={`chip ${showFilters ? 'on' : ''}`} onClick={() => setShowFilters((value) => !value)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 12, height: 12 }}><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="12" y1="18" x2="12" y2="18" /></svg>
              Filter
            </button>
            <button type="button" className="btn btn-acc" onClick={openNewInvoicePage}>
              <Plus />
              New Invoice
            </button>
          </div>
        </div>

        <div className={`inv-filters ${showFilters ? 'open' : ''}`}>
          <span className="inv-filter-lbl">Client</span>
          <select className="inv-filter-sel" value={clientFilter} onChange={(event) => setClientFilter(event.target.value)}>
            <option value="">All clients</option>
            {clientOptions.map((client) => <option key={client} value={client}>{client}</option>)}
          </select>
          <div className="inv-filter-sep" />
          <span className="inv-filter-lbl">Project</span>
          <select className="inv-filter-sel" value={projectFilter} onChange={(event) => setProjectFilter(event.target.value)}>
            <option value="">All projects</option>
            {projectOptions.map((project) => <option key={project} value={project}>{project}</option>)}
          </select>
          <div className="inv-filter-sep" />
          <span className="inv-filter-lbl">Amount &ge;</span>
          <input className="inv-filter-inp" type="number" min="0" step="100" placeholder="$ 0" value={minAmount} onChange={(event) => setMinAmount(event.target.value)} />
          <div className="inv-filter-sep" />
          <span className="inv-filter-lbl">Due after</span>
          <input className="inv-filter-inp" style={{ width: 130 }} type="date" value={dueAfter} onChange={(event) => setDueAfter(event.target.value)} />
          <button type="button" className="inv-filter-clear" onClick={clearFilters}>Clear filters</button>
        </div>

        <div className="inv-body" style={{ padding: '16px 28px 40px' }}>
          <div className="inv-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total Outstanding', value: formatCurrency(stats.outstanding), sub: `across ${stats.outstandingCount} invoices`, bg: 'var(--acc-bg)', color: 'var(--accent)', icon: stats.outstandingCount },
              { label: 'Overdue', value: formatCurrency(stats.overdue), sub: `${stats.overdueCount} invoices need attention`, bg: 'var(--red-bg)', color: 'var(--red)', icon: stats.overdueCount },
              { label: 'Paid', value: formatCurrency(stats.paidThisMonth), sub: `${stats.paidCount} invoices closed`, bg: 'var(--sage-bg)', color: 'var(--sage)', icon: stats.paidCount },
              { label: 'Avg Payment Time', value: stats.avgPaymentDays, suffix: 'days', sub: 'based on paid invoices', bg: 'var(--bg2)', color: 'var(--ink)', icon: stats.avgPaymentDays },
            ].map((item, index) => (
              <div key={item.label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color, fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 13, fontWeight: 700 }}>{item.icon}</div>
                <div>
                  <div style={{ fontFamily: "var(--font-inter), Inter, sans-serif", fontSize: 20, fontWeight: 600, color: item.color === 'var(--ink)' ? 'var(--ink)' : item.color }}>{item.value}{item.suffix ? <span style={{ fontSize: 14, color: 'var(--faint)', fontFamily: 'var(--font-inter), Inter, sans-serif', marginLeft: 2 }}> {item.suffix}</span> : ''}</div>
                  <div style={{ fontSize: 11, color: 'var(--faint)' }}>{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="surface-panel" style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--line)' }}>
        {filteredInvoices.length > 0 ? (
          <table className="inv-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map((invoice) => {
                const status = invoiceStatusMeta(invoice.status);
                const isOverdue = invoice.status.toLowerCase() === 'overdue';
                return (
                  <tr key={invoice.id}>
                    <td><Link href={`/dashboard/invoices/${invoice.id}`} className="inv-num">{invoice.invoiceNumber}</Link></td>
                    <td><div className="inv-client">{invoice.clientName || 'No client'}</div></td>
                    <td><div className="inv-proj">{projectName(invoice.projectId)}</div></td>
                    <td><span className="inv-amt">{formatCurrency(invoice.totalAmount || invoice.amount || 0)}</span></td>
                    <td><span className={`inv-stat ${status.cls}`}>{status.label}</span></td>
                    <td><span className="inv-date">{formatDate(invoice.issueDate)}</span></td>
                    <td><span className="inv-date" style={isOverdue ? { color: 'var(--red)' } : undefined}>{formatDate(invoice.dueDate)}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {invoice.clientEmail ? (
                          <button
                            type="button"
                            className={invoice.status.toLowerCase() === 'draft' ? 'btn btn-acc' : 'btn btn-ghost'}
                            style={{ fontSize: 12, padding: '4px 9px' }}
                            onClick={() => handleSendEmail(invoice, invoice.status.toLowerCase() === 'overdue' ? 'remind_overdue' : 'send')}
                          >
                            {invoice.status.toLowerCase() === 'overdue' ? 'Send reminder' : invoice.status.toLowerCase() === 'draft' ? 'Send invoice' : 'Email'}
                          </button>
                        ) : null}
                        <button type="button" className="btn btn-ghost" style={{ fontSize: 12, padding: '4px 9px' }} onClick={() => handleDownloadInvoice(invoice)}>
                          <Download style={{ width: 11, height: 11 }} />
                          View PDF
                        </button>
                        <button type="button" className="ib" style={{ width: 26, height: 26 }} onClick={() => setDeleteModal({ isOpen: true, invoice })} aria-label={`Delete ${invoice.invoiceNumber}`}>
                          <Trash2 style={{ width: 12, height: 12 }} />
                        </button>
                        {invoice.clientEmail ? (
                          <button type="button" className="ib" style={{ width: 26, height: 26 }} onClick={() => handleSendEmail(invoice)} aria-label={`Email ${invoice.invoiceNumber}`}>
                            <Mail style={{ width: 12, height: 12 }} />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, margin: '0 auto 16px', borderRadius: 14, background: 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ width: 24, height: 24, color: 'var(--ghost)' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--ink)', fontFamily: "var(--font-inter), Inter, sans-serif" }}>No invoices match</div>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 6 }}>Try adjusting your filters or create a new invoice</div>
            <button type="button" className="btn btn-acc" style={{ marginTop: 16 }} onClick={openNewInvoicePage}>
              <Plus />
              New Invoice
            </button>
            <div style={{ marginTop: 12 }}><button type="button" className="btn btn-ghost" style={{ fontSize: 13 }} onClick={clearFilters}>Clear all filters</button></div>
          </div>
        )}
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Invoice"
        message="This will mark the invoice as deleted."
        itemName={deleteModal.invoice?.invoiceNumber || ''}
        onConfirm={confirmDeleteInvoice}
        onCancel={() => setDeleteModal({ isOpen: false, invoice: null })}
      />
    </div>
  );
}
