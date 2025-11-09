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

interface Report {
  id: number;
  title: string;
  content: string;
  type: string;
  status: string;
  projectId?: number | null;
  userId: number;
  createdAt: string;
  updatedAt: string;
  project?: {
    id: number;
    name: string;
  };
  user?: {
    id: number;
    username: string;
  };
}

export async function generateReportPDF(report: Report): Promise<void> {
  const PDF = await getJsPDF();
  const doc = new PDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to strip HTML tags and get text
  const stripHtml = (html: string): string => {
    if (typeof window === 'undefined') {
      // Server-side: simple regex-based stripping
      return html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
    }
    
    // Client-side: use DOM
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Header
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(report.title, margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Type: ${report.type}`, margin, yPos);
  
  yPos += 5;
  doc.text(`Status: ${report.status.toUpperCase()}`, margin, yPos);
  
  yPos += 5;
  doc.text(`Created: ${formatDate(report.createdAt)}`, margin, yPos);
  
  if (report.project) {
    yPos += 5;
    doc.text(`Project: ${report.project.name}`, margin, yPos);
  }
  
  yPos += 15;

  // Content
  const textContent = stripHtml(report.content);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const lines = doc.splitTextToSize(textContent, contentWidth);
  
  lines.forEach((line: string) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = margin;
    }
    doc.text(line, margin, yPos);
    yPos += 6;
  });

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-US')}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Download PDF
  doc.save(`report-${report.title.replace(/\s+/g, '_')}.pdf`);
}

