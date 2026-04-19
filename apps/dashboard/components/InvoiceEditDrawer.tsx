'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Download, Plus, Save, Send, Trash2 } from 'lucide-react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { generateInvoicePDF } from '@/lib/invoice-pdf';
import { toastError, toastSuccess } from '@/lib/toast';
import { useProjects } from '@/hooks/useQueries';
import {
  AlertDialog,
  AlertDialogContent,
  Button,
  EditDrawer,
  Skeleton,
  Textarea,
  type DrawerTab,
} from '@/components/ui';

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

interface InvoiceEditDrawerProps {
  invoiceId: string | number | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamId?: number | string;
  onSaved?: () => Promise<void> | void;
}

const DRAWER_TABS: DrawerTab[] = [
  { id: 'details', label: 'Details' },
  { id: 'items', label: 'Items' },
  { id: 'preview', label: 'Preview' },
];

function buildSnapshot(customer: CustomerState, details: DetailsState, items: InvoiceItem[], notes: string) {
  return JSON.stringify({
    customer,
    details,
    items: items.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    notes,
  });
}

export function InvoiceEditDrawer({
  invoiceId,
  open,
  onOpenChange,
  teamId = 'all',
  onSaved,
}: InvoiceEditDrawerProps) {
  const queryClient = useQueryClient();
  const titleRef = useRef<HTMLInputElement>(null);
  const { data: projects = [] } = useProjects(teamId);

  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
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
  const [notes, setNotes] = useState('Thank you for your business!');
  const [initialSnapshot, setInitialSnapshot] = useState('');

  useEffect(() => {
    if (!open) {
      setActiveTab('details');
      return;
    }

    if (!invoiceId) return;

    const load = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/invoices/${invoiceId}`);
        const loaded = response.data.invoice as InvoicePayload;
        const nextCustomer = {
          billedTo: loaded.clientName || '',
          email: loaded.clientEmail || '',
          address: loaded.clientAddress || '',
        };
        const nextDetails = {
          projectId: loaded.projectId ? String(loaded.projectId) : '',
          invoiceNumber: loaded.invoiceNumber,
          invoiceDate: loaded.issueDate ? loaded.issueDate.split('T')[0] : '',
          dueDate: loaded.dueDate ? loaded.dueDate.split('T')[0] : '',
          paymentTerms: 'Net 30',
        };
        const parsedItems = loaded.items ? JSON.parse(loaded.items) : [];
        const nextItems =
          Array.isArray(parsedItems) && parsedItems.length > 0
            ? parsedItems.map((item: any, index: number) => ({
                id: String(index + 1),
                description: item.description || '',
                quantity: Number(item.quantity || 1),
                unitPrice: Number(item.unitPrice ?? item.rate ?? 0),
              }))
            : [{ id: '1', description: '', quantity: 1, unitPrice: 0 }];
        const nextNotes =
          loaded.notes || 'Thank you for your business!\n\nTerms & Conditions\n1. Pay this before due date';

        setInvoice(loaded);
        setCustomer(nextCustomer);
        setDetails(nextDetails);
        setItems(nextItems);
        setNotes(nextNotes);
        setInitialSnapshot(buildSnapshot(nextCustomer, nextDetails, nextItems, nextNotes));
      } catch (error: any) {
        toastError(error.response?.data?.error || 'Failed to load invoice');
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [invoiceId, onOpenChange, open]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
    [items]
  );
  const vatRate = invoice?.taxRate || 10;
  const vat = useMemo(() => (subtotal * vatRate) / 100, [subtotal, vatRate]);
  const total = subtotal + vat;
  const currentSnapshot = useMemo(
    () => buildSnapshot(customer, details, items, notes),
    [customer, details, items, notes]
  );
  const dirty = !!initialSnapshot && currentSnapshot !== initialSnapshot;

  const updateCustomer = <K extends keyof CustomerState>(key: K, value: CustomerState[K]) => {
    setCustomer((prev) => ({ ...prev, [key]: value }));
  };

  const updateDetails = <K extends keyof DetailsState>(key: K, value: DetailsState[K]) => {
    setDetails((prev) => ({ ...prev, [key]: value }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        description: '',
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: (invoice?.currency || 'GBP').toUpperCase(),
      minimumFractionDigits: 2,
    }).format(value);

  const formatShortDate = (value: string) => {
    if (!value) return '--';
    const [year, month, day] = value.split('-');
    return `${day}-${month}-${year}`;
  };

  const toIsoDateTime = (value: string) => (value ? new Date(`${value}T12:00:00.000Z`).toISOString() : null);

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
    notes,
  });

  const finalizeSave = async (status: string, successMessage: string) => {
    if (!invoiceId || !details.projectId) {
      toastError('Select a project');
      setActiveTab('details');
      return;
    }

    if (items.some((item) => !item.description.trim())) {
      toastError('Fill in all invoice item descriptions');
      setActiveTab('items');
      return;
    }

    setSaving(true);
    try {
      await axios.put(`/api/invoices/${invoiceId}`, buildPayload(status));
      await queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setInvoice((prev) => (prev ? { ...prev, status } : prev));
      setInitialSnapshot(currentSnapshot);
      await onSaved?.();
      toastSuccess(successMessage);
      onOpenChange(false);
    } catch (error: any) {
      toastError(error.response?.data?.message || error.response?.data?.error || 'Failed to update invoice');
    } finally {
      setSaving(false);
    }
  };

  const downloadPreview = async () => {
    try {
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
        items: JSON.stringify(
          items.map(({ description, quantity, unitPrice }) => ({
            description,
            quantity,
            unitPrice,
          }))
        ),
        notes,
      });
    } catch (error: any) {
      toastError(error.response?.data?.error || 'Failed to download invoice preview');
    }
  };

  const footer = (
    <div className="flex items-center justify-between gap-3">
      <div className="text-xs text-text-tertiary">
        {dirty ? 'Unsaved changes' : `Last synced status: ${invoice?.status || 'draft'}`}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          tone="neutral"
          onClick={() => {
            if (dirty) {
              setShowDiscardDialog(true);
              return;
            }
            onOpenChange(false);
          }}
        >
          Cancel
        </Button>
        <Button
          variant="outline"
          tone="neutral"
          icon={<Download className="h-4 w-4" />}
          onClick={downloadPreview}
        >
          PDF Preview
        </Button>
        <Button
          variant="outline"
          tone="primary"
          icon={<Send className="h-4 w-4" />}
          loading={saving}
          onClick={() => void finalizeSave('sent', 'Invoice saved and marked as sent')}
        >
          Send
        </Button>
        <Button
          icon={<Save className="h-4 w-4" />}
          loading={saving}
          onClick={() => void finalizeSave(invoice?.status || 'draft', 'Invoice updated')}
        >
          Save
        </Button>
      </div>
    </div>
  );

  return (
    <>
      <EditDrawer
        open={open}
        onOpenChange={onOpenChange}
        title={invoice ? `Edit ${invoice.invoiceNumber}` : 'Edit invoice'}
        subtitle="Update customer details, line items, and invoice status without leaving the current context."
        size="lg"
        tabs={DRAWER_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        dirty={dirty}
        onAttemptClose={() => setShowDiscardDialog(true)}
        initialFocusRef={titleRef}
        footer={footer}
        onPrimaryAction={() => void finalizeSave(invoice?.status || 'draft', 'Invoice updated')}
      >
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/2 rounded-lg" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-56 w-full rounded-xl" />
          </div>
        ) : activeTab === 'details' ? (
          <div className="space-y-6">
            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">Customer</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Client name</span>
                  <input
                    ref={titleRef}
                    value={customer.billedTo}
                    onChange={(event) => updateCustomer('billedTo', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                    placeholder="Client name"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Client email</span>
                  <input
                    value={customer.email}
                    onChange={(event) => updateCustomer('email', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                    placeholder="name@company.com"
                    type="email"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Billing address</span>
                  <Textarea
                    value={customer.address}
                    onChange={(event) => updateCustomer('address', event.target.value)}
                    className="min-h-[96px] rounded-xl"
                    placeholder="Client address"
                  />
                </label>
              </div>
            </section>

            <section className="rounded-2xl border border-border bg-surface p-5">
              <h3 className="text-sm font-semibold text-text-primary">Invoice details</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Project</span>
                  <select
                    value={details.projectId}
                    onChange={(event) => updateDetails('projectId', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Invoice number</span>
                  <input
                    value={details.invoiceNumber}
                    onChange={(event) => updateDetails('invoiceNumber', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Issue date</span>
                  <input
                    type="date"
                    value={details.invoiceDate}
                    onChange={(event) => updateDetails('invoiceDate', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  />
                </label>
                <label className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Due date</span>
                  <input
                    type="date"
                    value={details.dueDate}
                    onChange={(event) => updateDetails('dueDate', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                  />
                </label>
                <label className="md:col-span-2 flex flex-col gap-1.5">
                  <span className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Notes</span>
                  <Textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    className="min-h-[128px] rounded-xl"
                    placeholder="Internal notes or payment terms"
                  />
                </label>
              </div>
            </section>
          </div>
        ) : activeTab === 'items' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">Line items</h3>
                <p className="mt-1 text-sm text-text-secondary">Keep descriptions explicit so the generated PDF stays readable.</p>
              </div>
              <Button variant="outline" tone="neutral" icon={<Plus className="h-4 w-4" />} onClick={addItem}>
                Add item
              </Button>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-2xl border border-border bg-surface p-4 md:grid-cols-[1.6fr_0.5fr_0.7fr_auto]">
                  <input
                    value={item.description}
                    onChange={(event) => updateItem(item.id, 'description', event.target.value)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                    placeholder="Description"
                  />
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateItem(item.id, 'quantity', parseFloat(event.target.value) || 0)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                    placeholder="Qty"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(event) => updateItem(item.id, 'unitPrice', parseFloat(event.target.value) || 0)}
                    className="h-11 rounded-xl border border-border bg-background px-3 text-sm text-text-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/15"
                    placeholder="Price"
                  />
                  <Button
                    variant="ghost"
                    tone="danger"
                    size="icon"
                    onClick={() => removeItem(item.id)}
                    aria-label={`Remove ${item.description || 'invoice item'}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-surface p-5">
            <div className="flex items-start justify-between gap-6 border-b border-border pb-4">
              <div>
                <div className="text-3xl font-semibold tracking-[-0.03em] text-text-primary">Invoice</div>
                <div className="mt-1 text-lg text-text-secondary">INV-{details.invoiceNumber || '--'}</div>
              </div>
              <div className="grid gap-2 text-sm text-text-secondary">
                <div>Issue date: <span className="font-medium text-text-primary">{formatShortDate(details.invoiceDate)}</span></div>
                <div>Due date: <span className="font-medium text-text-primary">{formatShortDate(details.dueDate)}</span></div>
                <div>Status: <span className="font-medium capitalize text-text-primary">{invoice?.status || 'draft'}</span></div>
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <div className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Bill to</div>
                <div className="mt-2 text-sm font-medium text-text-primary">{customer.billedTo || '-'}</div>
                <div className="mt-1 text-sm text-text-secondary">{customer.email || '-'}</div>
                <div className="mt-1 whitespace-pre-line text-sm text-text-secondary">{customer.address || '-'}</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-medium text-text-primary">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary">VAT ({vatRate}%)</span>
                    <span className="font-medium text-text-primary">{formatCurrency(vat)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-text-primary">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-border">
              <div className="grid grid-cols-[1.7fr_0.45fr_0.85fr_0.85fr] gap-3 bg-background px-4 py-3 text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                <div>Description</div>
                <div>Qty</div>
                <div className="text-right">Price</div>
                <div className="text-right">Total</div>
              </div>
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[1.7fr_0.45fr_0.85fr_0.85fr] gap-3 border-t border-border px-4 py-3 text-sm text-text-primary">
                  <div>{item.description || '-'}</div>
                  <div>{item.quantity}</div>
                  <div className="text-right">{formatCurrency(item.unitPrice)}</div>
                  <div className="text-right">{formatCurrency(item.quantity * item.unitPrice)}</div>
                </div>
              ))}
            </div>

            {notes ? (
              <div className="mt-6">
                <div className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">Notes</div>
                <div className="mt-2 whitespace-pre-line rounded-2xl border border-border bg-background p-4 text-sm text-text-secondary">
                  {notes}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </EditDrawer>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent
          title="Discard invoice changes?"
          description="You have unsaved invoice changes in this drawer. Discard them and close the panel?"
          cancelText="Keep editing"
          actionText="Discard"
          tone="danger"
          onAction={() => {
            setShowDiscardDialog(false);
            onOpenChange(false);
          }}
        />
      </AlertDialog>
    </>
  );
}
