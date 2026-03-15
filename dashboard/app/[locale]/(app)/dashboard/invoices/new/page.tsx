'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Ban, ChevronDown, ChevronRight, Download, Plus, Save, Send, Trash2 } from 'lucide-react';
import axios from 'axios';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { useProjects } from '@/hooks/useQueries';
import { useTeam } from '@/contexts/TeamContext';
import { useQueryClient } from '@tanstack/react-query';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface CustomerState {
  billedTo: string;
  firstName: string;
  lastName: string;
  business: string;
  phone: string;
  email: string;
  address: string;
}

interface DetailsState {
  projectId: string;
  invoiceNumber: string;
  poNumber: string;
  invoiceDate: string;
  dueDate: string;
  paymentTerms: string;
}

const makeInvoiceNumber = () => `${Date.now()}`;

export default function NewInvoicePage() {
  const router = useRouter();
  const params = useParams<{ locale: string }>();
  const locale = params?.locale || 'en';
  const queryClient = useQueryClient();
  const { selectedTeam } = useTeam();
  const teamId = selectedTeam.type === 'single' && selectedTeam.teamId ? selectedTeam.teamId : 'all';
  const { data: projects = [] } = useProjects(teamId);
  const [loading, setLoading] = useState(false);
  const [customer, setCustomer] = useState<CustomerState>({
    billedTo: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    business: '',
    phone: '+44 423-323-3232',
    email: 'john55@gmail.com',
    address: '12 Main St, London, UK',
  });
  const [details, setDetails] = useState<DetailsState>({
    projectId: '',
    invoiceNumber: makeInvoiceNumber(),
    poNumber: '',
    invoiceDate: '2025-10-20',
    dueDate: '2025-11-12',
    paymentTerms: 'Net 30',
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'SL Mobbin', quantity: 1, unitPrice: 35 },
    { id: '2', description: 'Perplexity', quantity: 1, unitPrice: 20 },
  ]);
  const [sections, setSections] = useState({
    customer: true,
    details: true,
    items: true,
  });

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );
  const vatRate = 10;
  const vat = useMemo(() => subtotal * vatRate / 100, [subtotal]);
  const total = subtotal + vat;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 2,
    }).format(value);

  const formatShortDate = (value: string) => {
    if (!value) return '--';
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
  };

  const toggleSection = (key: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateCustomer = <K extends keyof CustomerState>(key: K, value: CustomerState[K]) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetails = <K extends keyof DetailsState>(key: K, value: DetailsState[K]) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (
      item.id === id ? { ...item, [field]: value } : item
    )));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const toIsoDateTime = (value: string) => {
    if (!value) return undefined;
    return new Date(`${value}T12:00:00.000Z`).toISOString();
  };

  const buildPayload = (status: 'draft' | 'sent' = 'draft') => ({
    project_id: Number(details.projectId),
    invoice_number: details.invoiceNumber,
    client_name: customer.billedTo,
    client_email: customer.email,
    client_address: customer.address,
    amount: subtotal,
    currency: 'gbp',
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
    notes: 'Thank you for your business!\n\nTerms & Conditions\n1. Pay this before due date',
  });

  const saveInvoice = async (status: 'draft' | 'sent' = 'draft') => {
    if (!details.projectId) {
      alert('Select a project');
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      alert('Fill in all invoice item descriptions');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/invoices', buildPayload(status));
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      router.push(`/${locale}/dashboard/invoices`);
      router.refresh();
    } catch (error: any) {
      console.error('Failed to save invoice:', error);
      alert(error.response?.data?.message || error.response?.data?.error || 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  const downloadPreview = async () => {
    try {
      await generateInvoicePDF({
        id: 0,
        invoiceNumber: `INV-${details.invoiceNumber}`,
        clientName: customer.billedTo,
        clientEmail: customer.email,
        clientAddress: customer.address,
        amount: Math.round(subtotal * 100),
        currency: 'gbp',
        taxRate: vatRate,
        taxAmount: Math.round(vat * 100),
        totalAmount: Math.round(total * 100),
        status: 'draft',
        issueDate: details.invoiceDate,
        dueDate: details.dueDate,
        description: items.map((item) => item.description).join('\n'),
        items: JSON.stringify(items.map(({ description, quantity, unitPrice }) => ({ description, quantity, unitPrice }))),
        notes: 'Thank you for your business!\n\nTerms & Conditions\n1. Pay this before due date',
      });
    } catch (error) {
      console.error('Failed to download invoice preview:', error);
      alert('Failed to download invoice preview');
    }
  };

  return (
    <div className="min-h-full bg-[#f7f7f5] text-[#202224]">
      <div className="flex items-center justify-between px-4 py-2 text-[11px] border-b border-[rgba(15,15,14,0.08)] bg-[#fbfbfa]">
        <div className="flex items-center gap-2 text-[#616161]">
          <Link href={`/${locale}/dashboard/invoices`} className="hover:text-[#202224]">Invoices</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-[#202224]">New Invoice</span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <button type="button" onClick={() => router.push(`/${locale}/dashboard/invoices`)} className="text-[#3d3d3d] hover:text-[#111]">Cancel</button>
          <button type="button" onClick={() => router.refresh()} className="inline-flex items-center gap-1 text-[#4b4b4b] hover:text-[#111]">
            <Ban className="w-3.5 h-3.5" />
            Void Invoice
          </button>
          <button type="button" onClick={() => saveInvoice('sent')} disabled={loading} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e] disabled:opacity-50">
            <Send className="w-3.5 h-3.5" />
            Send Invoice
          </button>
          <button type="button" onClick={downloadPreview} className="inline-flex items-center gap-1 text-[#ef5a73] hover:text-[#d6425e]">
            <Download className="w-3.5 h-3.5" />
            Download PDF
          </button>
          <button
            type="button"
            onClick={() => saveInvoice('draft')}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full bg-[#ef4f6e] px-3 py-1 text-white shadow-sm hover:bg-[#dd4261] disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      <div className="grid items-start grid-cols-1 xl:grid-cols-[0.98fr_1.02fr] gap-6 px-6 py-4 2xl:px-8">
        <div className="space-y-4">
          <section>
            <button type="button" onClick={() => toggleSection('customer')} className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Customer Information</h2>
              <ChevronDown className={`w-4 h-4 text-[#5b5b5b] transition-transform ${sections.customer ? 'rotate-180' : ''}`} />
            </button>
            {sections.customer ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Billed to</label>
                  <select
                    value={customer.billedTo}
                    onChange={(event) => updateCustomer('billedTo', event.target.value)}
                    className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]"
                  >
                    <option>John Doe</option>
                    <option>Jane Doe</option>
                    <option>ABC Private Ltd.</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">First Name</label>
                    <input value={customer.firstName} onChange={(event) => updateCustomer('firstName', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Last Name</label>
                    <input value={customer.lastName} onChange={(event) => updateCustomer('lastName', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Business (Optional)</label>
                  <input value={customer.business} onChange={(event) => updateCustomer('business', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Phone Number</label>
                    <input value={customer.phone} onChange={(event) => updateCustomer('phone', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Email</label>
                    <input value={customer.email} onChange={(event) => updateCustomer('email', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Address</label>
                  <input value={customer.address} onChange={(event) => updateCustomer('address', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                </div>

                <button type="button" className="text-[13px] text-[#545454] hover:text-[#111]">Edit Customer Profile</button>
              </div>
            ) : null}
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <button type="button" onClick={() => toggleSection('details')} className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Details</h2>
              <ChevronDown className={`w-4 h-4 text-[#5b5b5b] transition-transform ${sections.details ? 'rotate-180' : ''}`} />
            </button>
            {sections.details ? (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Project</label>
                    <select value={details.projectId} onChange={(event) => updateDetails('projectId', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]">
                      <option value="">Select project</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>{project.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Invoice Number</label>
                    <input value={details.invoiceNumber} onChange={(event) => updateDetails('invoiceNumber', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">PO Number (Optional)</label>
                    <input value={details.poNumber} onChange={(event) => updateDetails('poNumber', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Invoice Date</label>
                    <input type="date" value={details.invoiceDate} onChange={(event) => updateDetails('invoiceDate', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                  <div>
                    <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Due Date</label>
                    <input type="date" value={details.dueDate} onChange={(event) => updateDetails('dueDate', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] text-[#5b5b5b] mb-1.5">Payment Terms</label>
                  <select value={details.paymentTerms} onChange={(event) => updateDetails('paymentTerms', event.target.value)} className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]">
                    <option>Net 30</option>
                    <option>Net 15</option>
                    <option>Due on receipt</option>
                  </select>
                </div>
              </div>
            ) : null}
          </section>

          <section className="border-t border-[rgba(15,15,14,0.08)] pt-3">
            <button type="button" onClick={() => toggleSection('items')} className="flex w-full items-center justify-between py-2 text-left">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#222]">Invoice Items</h2>
              <ChevronDown className={`w-4 h-4 text-[#5b5b5b] transition-transform ${sections.items ? 'rotate-180' : ''}`} />
            </button>
            {sections.items ? (
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-[1.6fr_0.55fr_0.75fr_auto] gap-2.5 text-[11px] uppercase tracking-[0.08em] text-[#8a8a8a]">
                  <div>Description</div>
                  <div>Qty</div>
                  <div>Price</div>
                  <div />
                </div>
                {items.map((item) => (
                  <div key={item.id} className="grid grid-cols-[1.6fr_0.55fr_0.75fr_auto] gap-2.5">
                    <input value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                    <input type="number" min="1" value={item.quantity} onChange={(event) => updateItem(item.id, 'quantity', parseFloat(event.target.value) || 0)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                    <input type="number" min="0" step="0.01" value={item.unitPrice} onChange={(event) => updateItem(item.id, 'unitPrice', parseFloat(event.target.value) || 0)} className="rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 text-[13px] shadow-[0_1px_4px_rgba(15,15,14,0.03)]" />
                    <button type="button" onClick={() => removeItem(item.id)} className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-md border border-[#e5e5e5] bg-white text-[#6d6d6d] hover:text-[#202224]" aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addItem} className="inline-flex items-center gap-2 rounded-md border border-[#d9d9d9] bg-white px-3 py-2 text-[13px] text-[#333] hover:bg-[#fafafa]">
                  <Plus className="h-4 w-4" />
                  Add item
                </button>
              </div>
            ) : null}
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
                <div className="font-medium text-[#242528]">{customer.billedTo}</div>
                <div className="text-[#555] mt-1">{customer.email}</div>
                <div className="text-[#555] mt-1">{customer.phone}</div>
                <div className="text-[#555] mt-1">{customer.address}</div>
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
                  <div>{item.description}</div>
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
                <span className="text-[#666]">VAT (10%)</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              <div className="flex items-center justify-between pt-1 font-semibold text-[16px]">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>

            <div className="mt-20">
              <div className="text-[#8a8a8a] text-[12px] mb-1.5">Notes</div>
              <div className="font-medium text-[13px]">Thank you for your business!</div>
            </div>

            <div className="mt-6">
              <div className="text-[#8a8a8a] text-[12px] mb-1.5">Terms & Conditions</div>
              <div className="text-[13px]">1. Pay this before due date</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
