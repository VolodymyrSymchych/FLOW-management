import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';
import { sendInvoiceEmail, sendStatusChangeEmail } from '@/lib/email/send-invoice';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const invoice = await storage.getInvoice(id);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const data = await request.json();
    
    // Get old invoice to track status changes
    const oldInvoice = await storage.getInvoice(id);
    if (!oldInvoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    const updateData: any = {};
    if (data.invoice_number) updateData.invoiceNumber = data.invoice_number;
    if (data.client_name !== undefined) updateData.clientName = data.client_name;
    if (data.client_email !== undefined) updateData.clientEmail = data.client_email;
    if (data.client_address !== undefined) updateData.clientAddress = data.client_address;
    if (data.amount !== undefined) {
      const amount = Math.round(data.amount * 100);
      updateData.amount = amount;
      // Recalculate tax and total
      const taxRate = data.tax_rate !== undefined ? data.tax_rate : oldInvoice.taxRate || 0;
      const taxAmount = Math.round((amount * taxRate) / 100);
      updateData.taxAmount = taxAmount;
      updateData.totalAmount = amount + taxAmount;
    }
    if (data.tax_rate !== undefined) {
      updateData.taxRate = data.tax_rate;
      const invoice = await storage.getInvoice(id);
      if (invoice) {
        const taxAmount = Math.round((invoice.amount * data.tax_rate) / 100);
        updateData.taxAmount = taxAmount;
        updateData.totalAmount = invoice.amount + taxAmount;
      }
    }
    if (data.currency) updateData.currency = data.currency;
    if (data.status) updateData.status = data.status;
    if (data.issue_date) updateData.issueDate = new Date(data.issue_date);
    if (data.due_date !== undefined) updateData.dueDate = data.due_date ? new Date(data.due_date) : null;
    if (data.paid_date !== undefined) updateData.paidDate = data.paid_date ? new Date(data.paid_date) : null;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.items !== undefined) updateData.items = JSON.stringify(data.items);
    if (data.notes !== undefined) updateData.notes = data.notes;

    const invoice = await storage.updateInvoice(id, updateData);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Send emails based on status changes
    try {
      // If status changed, send status change email
      if (data.status && data.status !== oldInvoice.status) {
        // Fetch project name if projectId exists
        let projectName = '';
        if (invoice.projectId) {
          const project = await storage.getProject(invoice.projectId);
          projectName = project?.name || '';
        }
        
        await sendStatusChangeEmail({
          ...invoice,
          dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
          projectName,
        }, oldInvoice.status);
      }

      // If status changed to 'sent', send invoice email
      if (data.status === 'sent' && oldInvoice.status !== 'sent' && invoice.clientEmail) {
        let projectName = '';
        if (invoice.projectId) {
          const project = await storage.getProject(invoice.projectId);
          projectName = project?.name || '';
        }
        
          await sendInvoiceEmail({
            ...invoice,
            dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
            projectName,
          });
      }
    } catch (emailError) {
      console.error('Failed to send invoice email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({ invoice });
  } catch (error: any) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    await storage.deleteInvoice(id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}

