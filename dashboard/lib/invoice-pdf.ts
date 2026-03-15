let jsPDF: any = null;
let fontsRegistered = false;

async function getJsPDF() {
  if (typeof window === 'undefined') {
    throw new Error('PDF generation is only available in the browser');
  }
  if (!jsPDF) {
    const jsPDFModule = await import('jspdf');
    jsPDF = jsPDFModule.default;
  }
  return jsPDF;
}

async function loadFontAsBinary(path: string): Promise<string> {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Failed to load font: ${path}`);
  }
  const bytes = new Uint8Array(await response.arrayBuffer());
  let binary = '';
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return binary;
}

async function ensureFonts(doc: any) {
  if (fontsRegistered) {
    return;
  }

  const [regular, bold] = await Promise.all([
    loadFontAsBinary('/fonts/NotoSans-Regular.ttf'),
    loadFontAsBinary('/fonts/NotoSans-Bold.ttf'),
  ]);

  doc.addFileToVFS('NotoSans-Regular.ttf', regular);
  doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  doc.addFileToVFS('NotoSans-Bold.ttf', bold);
  doc.addFont('NotoSans-Bold.ttf', 'NotoSans', 'bold');
  fontsRegistered = true;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice?: number;
  rate?: number;
  amount?: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  amount: number;
  currency?: string;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number;
  status: string;
  issueDate: string;
  dueDate?: string | Date | null;
  paidDate?: string | null;
  description?: string | null;
  items?: string | null;
  notes?: string | null;
  projectId?: number;
  projectName?: string;
}

function formatCurrencyFromCents(value: number, currency?: string): string {
  const code = (currency || 'USD').toUpperCase();
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
  }).format((value || 0) / 100);
}

function formatCurrencyFromUnits(value: number, currency?: string): string {
  const code = (currency || 'USD').toUpperCase();
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(dateString: string | Date | null | undefined): string {
  if (!dateString) return '--';
  const date = dateString instanceof Date ? dateString : new Date(dateString);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function normalizeItems(invoice: Invoice): Array<{ description: string; quantity: number; unitPrice: number; total: number }> {
  let items: InvoiceItem[] = [];
  if (invoice.items) {
    try {
      items = JSON.parse(invoice.items);
    } catch (error) {
      console.error('Failed to parse invoice items:', error);
    }
  }

  if (!items.length) {
    items = [{
      description: invoice.description || 'Service',
      quantity: 1,
      unitPrice: invoice.amount / 100,
      amount: invoice.amount / 100,
    }];
  }

  return items.map((item) => {
    const unitPrice = Number(item.unitPrice ?? item.rate ?? 0);
    const quantity = Number(item.quantity || 0);
    const total = item.amount !== undefined ? Number(item.amount) : unitPrice * quantity;
    return {
      description: item.description || '-',
      quantity,
      unitPrice,
      total,
    };
  });
}

function drawTextBlock(doc: any, lines: string[], x: number, y: number, lineHeight: number) {
  let currentY = y;
  lines.forEach((line) => {
    doc.text(line, x, currentY);
    currentY += lineHeight;
  });
  return currentY;
}

export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  const PDF = await getJsPDF();
  const doc = new PDF('p', 'mm', 'a4');
  await ensureFonts(doc);

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  const items = normalizeItems(invoice);

  let y = margin;

  const addPageIfNeeded = (requiredHeight: number) => {
    if (y + requiredHeight <= pageHeight - margin) return;
    doc.addPage();
    doc.setFont('NotoSans', 'normal');
    y = margin;
  };

  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(26);
  doc.text('Invoice', margin, y);

  doc.setFontSize(11);
  doc.setFont('NotoSans', 'normal');
  y += 10;
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, margin, y);
  y += 5;
  doc.text(`Status: ${invoice.status.toUpperCase()}`, margin, y);

  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(11);
  doc.text('ABC Private Ltd.', pageWidth - margin, margin + 2, { align: 'right' });
  doc.setFont('NotoSans', 'normal');
  doc.text('123 Business Street', pageWidth - margin, margin + 7, { align: 'right' });
  doc.text('City, State 12345', pageWidth - margin, margin + 12, { align: 'right' });
  doc.text('info@company.com', pageWidth - margin, margin + 17, { align: 'right' });

  y += 18;
  doc.setFont('NotoSans', 'bold');
  doc.text('Bill To', margin, y);
  y += 6;
  doc.setFont('NotoSans', 'normal');

  const addressLines = (invoice.clientAddress || '').split('\n').filter(Boolean);
  const customerLines = [
    invoice.clientName || '-',
    ...(invoice.clientEmail ? [invoice.clientEmail] : []),
    ...addressLines,
  ];
  y = drawTextBlock(doc, customerLines, margin, y, 5);

  const detailsX = margin + 78;
  let detailsY = margin + 38;
  doc.setFont('NotoSans', 'bold');
  doc.text('Invoice Details', detailsX, detailsY);
  detailsY += 6;
  doc.setFont('NotoSans', 'normal');
  detailsY = drawTextBlock(doc, [
    `Issue Date: ${formatDate(invoice.issueDate)}`,
    `Due Date: ${formatDate(invoice.dueDate || null)}`,
    `Project: ${invoice.projectName || '-'}`,
  ], detailsX, detailsY, 5);

  y = Math.max(y, detailsY) + 8;

  addPageIfNeeded(14);
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, y - 4.5, contentWidth, 8, 'F');
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(10);
  doc.text('Description', margin + 2, y);
  doc.text('Qty', margin + contentWidth * 0.62, y);
  doc.text('Price', margin + contentWidth * 0.76, y, { align: 'right' });
  doc.text('Total', pageWidth - margin - 2, y, { align: 'right' });
  y += 8;

  doc.setFont('NotoSans', 'normal');
  doc.setFontSize(10);

  items.forEach((item) => {
    const descriptionLines = doc.splitTextToSize(item.description, contentWidth * 0.52);
    const rowHeight = Math.max(7, descriptionLines.length * 5 + 2);
    addPageIfNeeded(rowHeight + 2);

    doc.line(margin, y - 2, pageWidth - margin, y - 2);
    doc.text(descriptionLines, margin + 2, y + 2);
    doc.text(String(item.quantity), margin + contentWidth * 0.62, y + 2);
    doc.text(formatCurrencyFromUnits(item.unitPrice, invoice.currency), margin + contentWidth * 0.76, y + 2, { align: 'right' });
    doc.text(formatCurrencyFromUnits(item.total, invoice.currency), pageWidth - margin - 2, y + 2, { align: 'right' });
    y += rowHeight;
  });

  y += 6;
  addPageIfNeeded(28);

  const totalsX = pageWidth - margin - 54;
  doc.setFont('NotoSans', 'normal');
  doc.text('Subtotal', totalsX, y);
  doc.text(formatCurrencyFromCents(invoice.amount, invoice.currency), pageWidth - margin, y, { align: 'right' });
  y += 6;
  doc.text(`Tax (${invoice.taxRate || 0}%)`, totalsX, y);
  doc.text(formatCurrencyFromCents(invoice.taxAmount || 0, invoice.currency), pageWidth - margin, y, { align: 'right' });
  y += 8;
  doc.setFont('NotoSans', 'bold');
  doc.setFontSize(12);
  doc.text('Total', totalsX, y);
  doc.text(formatCurrencyFromCents(invoice.totalAmount, invoice.currency), pageWidth - margin, y, { align: 'right' });

  if (invoice.notes) {
    y += 16;
    addPageIfNeeded(20);
    doc.setFont('NotoSans', 'bold');
    doc.setFontSize(10);
    doc.text('Notes', margin, y);
    y += 6;
    doc.setFont('NotoSans', 'normal');
    const noteLines = doc.splitTextToSize(invoice.notes, contentWidth);
    drawTextBlock(doc, noteLines, margin, y, 5);
  }

  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}
