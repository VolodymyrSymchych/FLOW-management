'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Ban, ChevronRight, Download, Edit, Mail, Save, Send, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { InvoiceEditDrawer } from '@/components/InvoiceEditDrawer';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { useDelayedLoading } from '@/hooks/useDelayedLoading';
import { useEntityDrawerState } from '@/hooks/useEntityDrawerState';
import { useTeam } from '@/contexts/TeamContext';
import { toastError, toastSuccess } from '@/lib/toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  amount: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  issueDate: string;
  dueDate: string | null;
  paidDate: string | null;
  description: string | null;
  items: string | null;
  notes: string | null;
  projectId: number | null;
  publicToken: string | null;
}

interface Project {
  id: number;
  name: string;
}

function InvoiceDetailSkeleton() {
  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#202224]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(15,15,14,0.08)] bg-[#fbfbfa]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14 rounded-sm" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-12 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>

      <div className="grid items-start grid-cols-1 xl:grid-cols-[0.98fr_1.02fr] gap-6 px-6 py-4 2xl:px-8">
        <div className="space-y-4">
          {[1, 2, 3].map((section) => (
            <section key={section} className={section === 1 ? '' : 'border-t border-[rgba(15,15,14,0.08)] pt-3'}>
              <div className="py-2">
                <Skeleton className="h-6 w-44 rounded-sm" />
              </div>
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
                {section === 3 ? (
                  <>
                    <div className="grid grid-cols-4 gap-2.5">
                      <Skeleton className="h-3 w-full rounded-sm" />
                      <Skeleton className="h-3 w-full rounded-sm" />
                      <Skeleton className="h-3 w-full rounded-sm" />
                      <Skeleton className="h-3 w-full rounded-sm" />
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                    <div className="grid grid-cols-4 gap-2.5">
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                      <Skeleton className="h-10 w-full rounded-md" />
                    </div>
                  </>
                ) : null}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky top-4 self-start rounded-xl bg-white border border-[rgba(15,15,14,0.06)] shadow-[0_12px_30px_rgba(15,15,14,0.05)] px-5 py-5">
          <div className="min-h-[500px]">
            <Skeleton className="h-10 w-32 rounded-sm" />
            <Skeleton className="mt-2 h-5 w-40 rounded-sm" />
            <div className="grid grid-cols-[1fr_0.95fr_0.85fr] gap-6 mt-6">
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 rounded-sm" />
                <Skeleton className="h-4 w-28 rounded-sm" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-12 rounded-sm" />
                <Skeleton className="h-4 w-28 rounded-sm" />
                <Skeleton className="h-4 w-32 rounded-sm" />
                <Skeleton className="h-4 w-36 rounded-sm" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
                <Skeleton className="h-4 w-full rounded-sm" />
              </div>
            </div>
            <div className="mt-7 space-y-3">
              <Skeleton className="h-4 w-full rounded-sm" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="ml-auto mt-5 w-[250px] space-y-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-16 rounded-sm" />
                <Skeleton className="h-4 w-24 rounded-sm" />
              </div>
              <div className="flex justify-between pt-1">
                <Skeleton className="h-5 w-16 rounded-sm" />
                <Skeleton className="h-5 w-28 rounded-sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string; locale: string }>();
  const router = useRouter();
  const invoiceId = params.id as string;
  const locale = params.locale || 'en';
  const drawerState = useEntityDrawerState({ param: 'edit' });
  const { selectedTeam } = useTeam();
  const teamId = selectedTeam.type === 'single' && selectedTeam.teamId ? selectedTeam.teamId : 'all';

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Показувати індикатор завантаження тільки якщо завантаження триває > 250ms
  const shouldShowLoading = useDelayedLoading(loading, 250);

  useEffect(() => {
    if (invoiceId) {
      loadInvoice();
    }
  }, [invoiceId]);

  const loadInvoice = async () => {
    try {
      setError(null);
      const response = await axios.get(`/api/invoices/${invoiceId}`);
      const loadedInvoice = response.data.invoice;
      let loadedProject: Project | null = null;

      if (loadedInvoice.projectId) {
        try {
          const projectResponse = await axios.get(`/api/projects/${loadedInvoice.projectId}`);
          loadedProject = projectResponse.data.project || null;
        } catch (e) {
          console.error('Failed to load project:', e);
        }
      }

      setInvoice(loadedInvoice);
      setProject(loadedProject);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!invoice) return;
    
    try {
      const invoiceForPDF = {
        ...invoice,
        dueDate: invoice.dueDate 
          ? (typeof invoice.dueDate === 'string' 
              ? invoice.dueDate 
              : new Date(invoice.dueDate).toISOString())
          : null,
        projectName: project?.name || '',
      };
      await generateInvoicePDF(invoiceForPDF);
    } catch (error) {
      console.error('Failed to download invoice:', error);
      toastError('Failed to download invoice. Please try again.');
    }
  };

  const handleSendEmail = async () => {
    if (!invoice) return;
    
    try {
      const response = await axios.post(`/api/invoices/${invoice.id}/send-email`, { action: 'send' });
      toastSuccess(response.data.message || 'Email sent successfully');
    } catch (error: any) {
      console.error('Failed to send email:', error);
      toastError(error.response?.data?.error || 'Failed to send email');
    }
  };

  const handleGeneratePublicLink = async () => {
    if (!invoice) return;
    
    try {
      const response = await axios.post(`/api/invoices/${invoice.id}/generate-token`);
      const publicUrl = response.data.publicUrl;
      await navigator.clipboard.writeText(publicUrl);
      toastSuccess('Public link copied to clipboard');
    } catch (error: any) {
      console.error('Failed to generate public link:', error);
      toastError(error.response?.data?.error || 'Failed to generate public link');
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: (invoice?.currency || 'GBP').toUpperCase(),
      minimumFractionDigits: 2,
    }).format((cents || 0) / 100);
  };

  const formatShortDate = (dateString: string | null) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--';
    const day = `${date.getUTCDate()}`.padStart(2, '0');
    const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}-${month}-${year}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'sent':
        return 'bg-blue-500/20 text-blue-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      case 'draft':
        return 'bg-gray-500/20 text-gray-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading || shouldShowLoading || (!invoice && !error)) {
    return <InvoiceDetailSkeleton />;
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="glass-medium rounded-xl p-8 border border-white/10 text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">Invoice Not Found</h1>
          <p className="text-text-secondary mb-6">{error || 'The invoice you are looking for does not exist.'}</p>
          <button
            onClick={() => router.push(`/${locale}/dashboard/invoices`)}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors"
          >
            Back to Invoices
          </button>
        </div>
      </div>
    );
  }

  const parsedItems = invoice.items ? JSON.parse(invoice.items) : [];
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';
  const normalizedItems = parsedItems.map((item: any) => {
    const unitPrice = Number(item.unitPrice ?? item.rate ?? 0);
    const quantity = Number(item.quantity ?? 0);
    const lineTotal = item.amount !== undefined ? Number(item.amount) : unitPrice * quantity;
    return {
      description: item.description || '-',
      quantity,
      unitPrice,
      lineTotal,
    };
  });

  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#202224]">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] border-b border-[rgba(15,15,14,0.08)] bg-[#fbfbfa]">
        <div className="flex items-center gap-2 text-[#616161]">
          <Link href={`/${locale}/dashboard/invoices`} className="hover:text-[#202224]">Invoices</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202224]">{invoice.invoiceNumber}</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button type="button" onClick={() => router.push(`/${locale}/dashboard/invoices`)} className="text-[#3d3d3d] hover:text-[#111]">Back</button>
          <button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-1 text-[#4b4b4b] hover:text-[#111]">
            <Ban className="w-3.5 h-3.5" />
            {invoice.status}
          </button>
          {invoice.clientEmail ? (
            <button type="button" onClick={handleSendEmail} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e]">
              <Send className="w-3.5 h-3.5" />
              Send Invoice
            </button>
          ) : null}
          <button type="button" onClick={handleDownloadPDF} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e]">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => drawerState.open(invoice.id, { drawer: 'invoice' })}
            className="inline-flex items-center gap-1 rounded-full bg-[#ef4f6e] px-3 py-1 text-white shadow-sm hover:bg-[#dd4261]"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid items-start grid-cols-1 xl:grid-cols-[0.98fr_1.02fr] gap-6 px-6 py-4 2xl:px-8">
        <div className="space-y-4">
          <section>
            <div className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Customer Information</h2>
            </div>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Client</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{invoice.clientName || '-'}</div>
                </div>
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Email</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{invoice.clientEmail || '-'}</div>
                </div>
              </div>
              <div>
                <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Address</div>
                <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] whitespace-pre-line">{invoice.clientAddress || '-'}</div>
              </div>
              {project ? (
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Project</div>
                  <Link href={`/${locale}/dashboard/projects/${project.id}`} className="block w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] hover:text-[#111]">
                    {project.name}
                  </Link>
                </div>
              ) : null}
            </div>
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <div className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Details</h2>
            </div>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Invoice Number</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{invoice.invoiceNumber}</div>
                </div>
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Status</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{invoice.status}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Issue Date</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{formatShortDate(invoice.issueDate)}</div>
                </div>
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Due Date</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{formatShortDate(invoice.dueDate)}</div>
                </div>
              </div>
              {invoice.description ? (
                <div>
                  <div className="block text-[12px] text-[#5b5b5b] mb-1.5">Description</div>
                  <div className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] whitespace-pre-line">{invoice.description}</div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <div className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Items</h2>
              <button type="button" onClick={handleGeneratePublicLink} className="inline-flex items-center gap-1 text-[12px] text-[#545454] hover:text-[#111]">
                <LinkIcon className="w-3.5 h-3.5" />
                Public Link
              </button>
            </div>
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-[1.6fr_0.55fr_0.75fr_0.75fr] gap-2.5 text-[11px] uppercase tracking-[0.08em] text-[#8a8a8a]">
                <div>Description</div>
                <div>Qty</div>
                <div>Price</div>
                <div>Total</div>
              </div>
              {normalizedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-[1.6fr_0.55fr_0.75fr_0.75fr] gap-2.5">
                  <div className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{item.description}</div>
                  <div className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{item.quantity}</div>
                  <div className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{formatCurrency(Math.round(item.unitPrice * 100))}</div>
                  <div className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">{formatCurrency(Math.round(item.lineTotal * 100))}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky top-4 self-start rounded-xl bg-white border border-[rgba(15,15,14,0.06)] shadow-[0_12px_30px_rgba(15,15,14,0.05)] px-5 py-5">
          <div className="min-h-[500px]">
            <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#1e1f22]">Invoice</h1>
            <div className="text-[18px] text-[#727272] mt-1">INV-{invoice.invoiceNumber}</div>

            <div className="grid grid-cols-[1fr_0.95fr_0.85fr] gap-6 mt-6 text-[13px]">
              <div>
                <div className="text-[#8a8a8a] mb-2">From</div>
                <div className="font-medium text-[#242528]">ABC Private Ltd.</div>
              </div>
              <div>
                <div className="text-[#8a8a8a] mb-2">Bill To</div>
                <div className="font-medium text-[#242528]">{invoice.clientName || '-'}</div>
                <div className="text-[#555] mt-1">{invoice.clientEmail || '-'}</div>
                <div className="text-[#555] mt-1 whitespace-pre-line">{invoice.clientAddress || '-'}</div>
              </div>
              <div className="grid grid-cols-[auto_auto] gap-x-5 gap-y-2">
                <div className="text-[#8a8a8a]">Issue Date</div>
                <div className="font-medium">{formatShortDate(invoice.issueDate)}</div>
                <div className="text-[#8a8a8a]">Due Date</div>
                <div className="font-medium">{formatShortDate(invoice.dueDate)}</div>
                <div className="text-[#8a8a8a]">Billing Method</div>
                <div className="font-medium">Wire Transfer</div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-[1.8fr_0.6fr_0.9fr_0.9fr] text-[#8a8a8a] text-[12px] pb-2 border-b border-[rgba(15,15,14,0.08)]">
              <div>Description</div>
              <div>Qty</div>
              <div className="text-right">Price</div>
              <div className="text-right">Total</div>
            </div>
            <div>
              {normalizedItems.map((item, index) => (
                <div key={index} className="grid grid-cols-[1.8fr_0.6fr_0.9fr_0.9fr] text-[13px] py-2.5 border-b border-[rgba(15,15,14,0.05)]">
                  <div>{item.description}</div>
                  <div>{item.quantity}</div>
                  <div className="text-right">{formatCurrency(Math.round(item.unitPrice * 100))}</div>
                  <div className="text-right">{formatCurrency(Math.round(item.lineTotal * 100))}</div>
                </div>
              ))}
            </div>

            <div className="ml-auto mt-5 w-[250px] space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Subtotal</span>
                <span>{formatCurrency(invoice.amount)}</span>
              </div>
              {invoice.taxRate > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="text-[#666]">VAT ({invoice.taxRate}%)</span>
                  <span>{formatCurrency(invoice.taxAmount)}</span>
                </div>
              ) : null}
              <div className="flex items-center justify-between pt-1 font-semibold text-[16px]">
                <span>Total</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
            </div>

            {invoice.notes ? (
              <div className="mt-20">
                <div className="text-[#8a8a8a] text-[12px] mb-1.5">Notes</div>
                <div className="font-medium text-[13px] whitespace-pre-line">{invoice.notes}</div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <InvoiceEditDrawer
        invoiceId={drawerState.activeId || invoiceId}
        open={drawerState.isOpen}
        onOpenChange={(open) => {
          if (!open) {
            drawerState.close();
          }
        }}
        teamId={teamId}
        onSaved={loadInvoice}
      />
    </div>
  );
}
