// Dynamic import for client-side only
let jsPDF: any = null;

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

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string | null;
  clientEmail?: string | null;
  clientAddress?: string | null;
  amount: number; // in cents
  currency?: string;
  taxRate?: number;
  taxAmount?: number;
  totalAmount: number; // in cents
  status: string;
  issueDate: string;
  dueDate?: string | Date | null;
  paidDate?: string | null;
  description?: string | null;
  items?: string | null; // JSON string
  notes?: string | null;
  projectId?: number;
  projectName?: string;
}

export async function generateInvoicePDF(invoice: Invoice): Promise<void> {
  const PDF = await getJsPDF();
  const doc = new PDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to format currency
  const formatCurrency = (cents: number): string => {
    const currency = invoice.currency?.toUpperCase() || 'USD';
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency;
    return `${symbol}${(cents / 100).toFixed(2)}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string | Date | null): string => {
    if (!dateString) return '';
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, margin, yPos);
  
  yPos += 5;
  doc.text(`Status: ${invoice.status.toUpperCase()}`, margin, yPos);
  
  yPos += 15;

  // Company/From section (right aligned)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  const companyText = [
    'Your Company Name',
    '123 Business Street',
    'City, State 12345',
    'Email: info@company.com',
    'Phone: +1 (555) 123-4567',
  ];
  companyText.forEach((line, index) => {
    doc.text(line, pageWidth - margin, yPos + index * 5, { align: 'right' });
  });
  
  yPos += 25;

  // Bill To section
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  if (invoice.clientName) {
    doc.text(invoice.clientName, margin, yPos);
    yPos += 5;
  }
  if (invoice.clientAddress) {
    const addressLines = invoice.clientAddress.split('\n');
    addressLines.forEach((line) => {
      if (line.trim()) {
        doc.text(line.trim(), margin, yPos);
        yPos += 5;
      }
    });
  }
  if (invoice.clientEmail) {
    doc.text(invoice.clientEmail, margin, yPos);
    yPos += 5;
  }
  
  yPos += 10;

  // Invoice Details
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`Issue Date: ${formatDate(invoice.issueDate)}`, margin, yPos);
  yPos += 5;
  if (invoice.dueDate) {
    doc.text(`Due Date: ${formatDate(invoice.dueDate)}`, margin, yPos);
    yPos += 5;
  }
  if (invoice.projectName) {
    doc.text(`Project: ${invoice.projectName}`, margin, yPos);
    yPos += 5;
  }
  
  yPos += 10;

  // Items Table Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setFillColor(240, 240, 240);
  doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
  
  doc.text('Description', margin + 2, yPos);
  doc.text('Qty', margin + contentWidth * 0.6, yPos);
  doc.text('Price', margin + contentWidth * 0.7, yPos);
  doc.text('Total', margin + contentWidth * 0.85, yPos);
  
  yPos += 8;

  // Parse and display items
  let items: InvoiceItem[] = [];
  if (invoice.items) {
    try {
      items = JSON.parse(invoice.items);
    } catch (e) {
      console.error('Failed to parse invoice items:', e);
    }
  }

  // If no items, add a default item
  if (items.length === 0) {
    items = [{
      description: invoice.description || 'Service',
      quantity: 1,
      unitPrice: invoice.amount,
    }];
  }

  doc.setFont('helvetica', 'normal');
  items.forEach((item) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    const itemTotal = item.quantity * item.unitPrice;
    const descriptionLines = doc.splitTextToSize(item.description || '', contentWidth * 0.55);
    
    doc.text(descriptionLines[0], margin + 2, yPos);
    doc.text(item.quantity.toString(), margin + contentWidth * 0.6, yPos);
    doc.text(formatCurrency(item.unitPrice), margin + contentWidth * 0.7, yPos);
    doc.text(formatCurrency(itemTotal), margin + contentWidth * 0.85, yPos);
    
    // If description is multi-line, add remaining lines
    if (descriptionLines.length > 1) {
      for (let i = 1; i < descriptionLines.length; i++) {
        yPos += 5;
        doc.text(descriptionLines[i], margin + 2, yPos);
      }
    }
    
    yPos += 7;
  });

  yPos += 5;

  // Totals
  const subtotal = invoice.amount;
  const taxRate = invoice.taxRate || 0;
  const taxAmount = invoice.taxAmount || Math.round((subtotal * taxRate) / 100);
  const total = invoice.totalAmount;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', margin + contentWidth * 0.7, yPos);
  doc.text(formatCurrency(subtotal), margin + contentWidth * 0.85, yPos);
  
  if (taxRate > 0) {
    yPos += 6;
    doc.text(`Tax (${taxRate}%):`, margin + contentWidth * 0.7, yPos);
    doc.text(formatCurrency(taxAmount), margin + contentWidth * 0.85, yPos);
  }
  
  yPos += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('Total:', margin + contentWidth * 0.7, yPos);
  doc.text(formatCurrency(total), margin + contentWidth * 0.85, yPos);
  
  yPos += 15;

  // Notes
  if (invoice.notes) {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes:', margin, yPos);
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, contentWidth);
    notesLines.forEach((line: string) => {
      if (yPos > pageHeight - 20) {
        doc.addPage();
        yPos = margin;
      }
      doc.text(line, margin, yPos);
      yPos += 5;
    });
  }

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Thank you for your business!',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Download PDF
  doc.save(`invoice-${invoice.invoiceNumber}.pdf`);
}

