'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronRight, Download, Plus, Save, Send, Trash2 } from 'lucide-react';
import axios from 'axios';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { useProjects } from '@/hooks/useQueries';
import { useTeam } from '@/contexts/TeamContext';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoicePayload {
  id: number;
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
  projectId: number | null;
}

interface CustomerState {
  billedTo: string;
  email: string;
  address: string;
}

interface DetailsState {
  projectId: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
}

function EditInvoiceSkeleton() {
  return (
    <div className="min-h-full bg-[#f7f7f5]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(15,15,14,0.08)] bg-[#fbfbfa]">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-14 rounded-sm" />
          <Skeleton className="h-3 w-3 rounded-sm" />
          <Skeleton className="h-3 w-24 rounded-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-6 w-24 rounded-md" />
          <Skeleton className="h-7 w-16 rounded-full" />
        </div>
      </div>
      <div className="grid items-start grid-cols-1 xl:grid-cols-[0.98fr_1.02fr] gap-6 px-6 py-4 2xl:px-8">
        <div className="space-y-4">
          {[1, 2, 3].map((key) => (
            <section key={key} className={key === 1 ? '' : 'border-t border-[rgba(15,15,14,0.08)] pt-3'}>
              <Skeleton className="h-6 w-44 rounded-sm my-2" />
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-10 w-full rounded-md" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </section>
          ))}
        </div>
        <div className="rounded-xl bg-white border border-[rgba(15,15,14,0.06)] px-5 py-5">
          <Skeleton className="h-10 w-32 rounded-sm" />
          <Skeleton className="mt-2 h-5 w-40 rounded-sm" />
          <div className="mt-6 space-y-3">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams<{ locale: string; id: string }>();
  const locale = params?.locale || 'en';
  const invoiceId = params?.id;
  const queryClient = useQueryClient();
  const { selectedTeam } = useTeam();
  const teamId = selectedTeam.type === 'single' && selectedTeam.teamId ? selectedTeam.teamId : 'all';
  const { data: projects = [] } = useProjects(teamId);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [invoice, setInvoice] = useState<InvoicePayload | null>(null);
  const [customer, setCustomer] = useState<CustomerState>({ billedTo: '', email: '', address: '' });
  const [details, setDetails] = useState<DetailsState>({
    projectId: '',
    invoiceNumber: '',
    invoiceDate: '',
    dueDate: '',
    paymentTerms: 'Net 30',
  });
  const [items, setItems] = useState<InvoiceItem[]>([{ id: '1', description: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    if (!invoiceId) return;
    const load = async () => {
      try {
        const response = await axios.get(`/api/invoices/${invoiceId}`);
        const loaded = response.data.invoice as InvoicePayload;
        setInvoice(loaded);
        setCustomer({
          billedTo: loaded.clientName || '',
          email: loaded.clientEmail || '',
          address: loaded.clientAddress || '',
        });
        setDetails({
          projectId: loaded.projectId ? String(loaded.projectId) : '',
          invoiceNumber: loaded.invoiceNumber,
          invoiceDate: loaded.issueDate ? loaded.issueDate.split('T')[0] : '',
          dueDate: loaded.dueDate ? loaded.dueDate.split('T')[0] : '',
          paymentTerms: 'Net 30',
        });
        const parsedItems = loaded.items ? JSON.parse(loaded.items) : [];
        if (Array.isArray(parsedItems) && parsedItems.length > 0) {
          setItems(parsedItems.map((item: any, index: number) => ({
            id: String(index + 1),
            description: item.description || '',
            quantity: Number(item.quantity || 1),
            unitPrice: Number(item.unitPrice ?? item.rate ?? 0),
          })));
        }
      } catch (error: any) {
        alert(error.response?.data?.error || 'Failed to load invoice');
        router.push(`/${locale}/dashboard/invoices`);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [invoiceId, locale, router]);

  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), [items]);
  const vatRate = invoice?.taxRate || 10;
  const vat = useMemo(() => subtotal * vatRate / 100, [subtotal, vatRate]);
  const total = subtotal + vat;

  const updateCustomer = <K extends keyof CustomerState>(key: K, value: CustomerState[K]) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetails = <K extends keyof DetailsState>(key: K, value: DetailsState[K]) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => item.id === id ? { ...item, [field]: value } : item));
  };

  const addItem = () => {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const toIsoDateTime = (value: string) => value ? new Date(`${value}T12:00:00.000Z`).toISOString() : null;

  const buildPayload = (status: string) => ({
    project_id: Number(details.projectId),
    invoice_number: details.invoiceNumber,
    client_name: customer.billedTo,
    client_email: customer.email,
    client_address: customer.address,
    amount: subtotal,
    currency: invoice?.currency || 'gbp',
    tax_rate: vatRate,
    status,
    issue_date: toIsoDateTime(details.invoiceDate),
    due_date: toIsoDateTime(details.dueDate),
    description: items.map((item) => item.description).join('\n'),
    items: items.map(({ description, quantity, unitPrice }) => ({
      description,
      quantity,
      rate: unitPrice,
      amount: quantity * unitPrice,
    })),
    notes: invoice?.notes || 'Thank you for your business!\n\nTerms & Conditions\n1. Pay this before due date',
  });

  const saveInvoice = async (status: string) => {
    if (!invoiceId || !details.projectId) {
      alert('Select a project');
      return;
    }
    if (items.some((item) => !item.description.trim())) {
      alert('Fill in all invoice item descriptions');
      return;
    }
    setSaving(true);
    try {
      await axios.put(`/api/invoices/${invoiceId}`, buildPayload(status));
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/${locale}/dashboard/invoices/${invoiceId}`);
      router.refresh();
    } catch (error: any) {
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const downloadPreview = async () => {
    await generateInvoicePDF({
      id: Number(invoiceId),
      invoiceNumber: details.invoiceNumber,
      clientName: customer.billedTo,
      clientEmail: customer.email,
      clientAddress: customer.address,
      amount: Math.round(subtotal * 100),
      currency: invoice?.currency || 'gbp',
      taxRate: vatRate,
      taxAmount: Math.round(vat * 100),
      totalAmount: Math.round(total * 100),
      status: invoice?.status || 'draft',
      issueDate: details.invoiceDate,
      dueDate: details.dueDate,
      items: JSON.stringify(items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice }))),
      notes: invoice?.notes || '',
    });
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: (invoice?.currency || 'GBP').toUpperCase(), minimumFractionDigits: 2 }).format(value);

  const formatShortDate = (value: string) => {
    if (!value) return '--';
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
  };

  if (loading) {
    return <EditInvoiceSkeleton />;
  }

  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#202224]">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] border-b border-[rgba(15,15,14,0.08)] bg-[#fbfbfa]">
        <div className="flex items-center gap-2 text-[#616161]">
          <Link href={`/${locale}/dashboard/invoices`} className="hover:text-[#202224]">Invoices</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/${locale}/dashboard/invoices/${invoiceId}`} className="hover:text-[#202224]">{details.invoiceNumber}</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202224]">Edit</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <button type="button" onClick={() => router.push(`/${locale}/dashboard/invoices/${invoiceId}`)} className="text-[#3d3d3d] hover:text-[#111]">Cancel</button>
          <button type="button" onClick={() => saveInvoice('sent')} disabled={saving} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e] disabled:opacity-50">
            <Send className="w-3.5 h-3.5" />
            Send Invoice
          </button>
          <button type="button" onClick={downloadPreview} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e]">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button type="button" onClick={() => saveInvoice(invoice?.status || 'draft')} disabled={saving} className="inline-flex items-center gap-1 rounded-full bg-[#ef4f6e] px-3 py-1 text-white shadow-sm hover:bg-[#dd4261] disabled:opacity-50">
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      <div className="grid items-start grid-cols-1 xl:grid-cols-[0.98fr_1.02fr] gap-6 px-6 py-4 2xl:px-8">
        <div className="space-y-4">
          <section>
            <div className="py-2 text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Customer Information</div>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <input value={customer.billedTo} onChange={(e) => updateCustomer('billedTo', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" placeholder="Client name" />
                <input value={customer.email} onChange={(e) => updateCustomer('email', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" placeholder="Client email" />
              </div>
              <input value={customer.address} onChange={(e) => updateCustomer('address', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" placeholder="Client address" />
            </div>
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <div className="py-2 text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Details</div>
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-2 gap-3">
                <select value={details.projectId} onChange={(e) => updateDetails('projectId', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]">
                  <option value="">Select project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select>
                <input value={details.invoiceNumber} onChange={(e) => updateDetails('invoiceNumber', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" value={details.invoiceDate} onChange={(e) => updateDetails('invoiceDate', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
                <input type="date" value={details.dueDate} onChange={(e) => updateDetails('dueDate', e.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
              </div>
            </div>
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <div className="flex items-center justify-between py-2">
              <div className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Items</div>
              <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-[13px] text-[#333]">
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>
            <div className="space-y-2 pt-1">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.6fr_0.55fr_0.75fr_auto] gap-2.5">
                  <input value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
                  <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
                  <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px]" />
                  <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#6d6d6d]" aria-label="Remove item">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky top-4 self-start rounded-xl bg-white border border-[rgba(15,15,14,0.06)] shadow-[0_12px_30px_rgba(15,15,14,0.05)] px-5 py-5">
          <div className="min-h-[500px]">
            <h1 className="text-[34px] font-semibold tracking-[-0.03em] text-[#1e1f22]">Invoice</h1>
            <div className="text-[18px] text-[#727272] mt-1">INV-{details.invoiceNumber}</div>
            <div className="grid grid-cols-[1fr_0.95fr_0.85fr] gap-6 mt-6 text-[13px]">
              <div>
                <div className="text-[#8a8a8a] mb-2">From</div>
                <div className="font-medium text-[#242528]">ABC Private Ltd.</div>
              </div>
              <div>
                <div className="text-[#8a8a8a] mb-2">Bill To</div>
                <div className="font-medium text-[#242528]">{customer.billedTo || '-'}</div>
                <div className="text-[#555] mt-1">{customer.email || '-'}</div>
                <div className="text-[#555] mt-1 whitespace-pre-line">{customer.address || '-'}</div>
              </div>
              <div className="grid grid-cols-[auto_auto] gap-x-5 gap-y-2">
                <div className="text-[#8a8a8a]">Issue Date</div>
                <div className="font-medium">{formatShortDate(details.invoiceDate)}</div>
                <div className="text-[#8a8a8a]">Due Date</div>
                <div className="font-medium">{formatShortDate(details.dueDate)}</div>
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
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.8fr_0.6fr_0.9fr_0.9fr] text-[13px] py-2.5 border-b border-[rgba(15,15,14,0.05)]">
                  <div>{item.description || '-'}</div>
                  <div>{item.quantity}</div>
                  <div className="text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</div>
                </div>
              ))}
            </div>
            <div className="ml-auto mt-5 w-[250px] space-y-2 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="text-[#666]">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#666]">VAT ({vatRate}%)</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 font-semibold text-[16px]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
