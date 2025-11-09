import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../server/storage';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    
    const invoices = await storage.getInvoices(
      projectId ? parseInt(projectId) : undefined
    );
    
    return NextResponse.json({ invoices });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const {
      project_id,
      invoice_number,
      client_name,
      client_email,
      client_address,
      amount,
      currency,
      tax_rate,
      status,
      issue_date,
      due_date,
      description,
      items,
      notes,
    } = data;

    if (!project_id || !invoice_number) {
      return NextResponse.json(
        { error: 'Project ID and invoice number are required' },
        { status: 400 }
      );
    }

    // Validate amount - must be greater than 0
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invoice amount must be greater than zero. Please add items with prices.' },
        { status: 400 }
      );
    }

    // Calculate tax and total (amount is in dollars, convert to cents)
    const amountInCents = Math.round(amount * 100);
    const taxRate = tax_rate || 0;
    const taxAmount = Math.round((amountInCents * taxRate) / 100);
    const totalAmount = amountInCents + taxAmount;

    const invoice = await storage.createInvoice({
      projectId: parseInt(project_id),
      invoiceNumber: invoice_number,
      clientName: client_name || null,
      clientEmail: client_email || null,
      clientAddress: client_address || null,
      amount: amountInCents,
      currency: currency || 'usd',
      taxRate,
      taxAmount,
      totalAmount,
      status: status || 'draft',
      issueDate: issue_date ? new Date(issue_date) : new Date(),
      dueDate: due_date ? new Date(due_date) : null,
      description: description || null,
      items: items ? JSON.stringify(items) : null,
      notes: notes || null,
    });

    // Send email if status is 'sent' and client email exists
    if (status === 'sent' && client_email) {
      try {
        // Fetch project name if projectId exists
        let projectName = '';
        if (project_id) {
          const project = await storage.getProject(parseInt(project_id));
          projectName = project?.name || '';
        }
        
        await sendInvoiceEmail({
          ...invoice,
          dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
          projectName,
        }, client_email);
      } catch (emailError) {
        console.error('Failed to send invoice email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json({ invoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    // Return more specific error message
    const errorMessage = error.message || error.detail || 'Failed to create invoice';
    return NextResponse.json(
      { error: errorMessage },
      { status: error.code === '23505' ? 409 : 500 } // 409 for unique constraint violation
    );
  }
}

