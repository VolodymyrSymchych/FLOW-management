import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { invoiceService } from '@/lib/invoice-service';
import { createInvoiceSchema, validateRequestBody, formatZodError } from '@/lib/validations';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    // Use invoice-service microservice
    if (projectId) {
      const result = await invoiceService.getProjectInvoices(parseInt(projectId));

      if (result.error) {
        console.error('Invoice service error:', result.error);
        return NextResponse.json({ error: result.error }, { status: 500 });
      }

      return NextResponse.json({ invoices: result.invoices || [] });
    }

    // For now, return empty array if no projectId
    // In the future, invoice-service should support getting all user invoices
    return NextResponse.json({ invoices: [] });
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

    // Validate request body
    const validation = validateRequestBody(createInvoiceSchema, data);
    if (validation.success === false) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }

    const {
      project_id,
      client_name,
      client_email,
      client_address,
      amount,
      currency,
      tax_rate,
      issue_date,
      due_date,
      description,
      items,
      notes,
    } = validation.data;

    // Use invoice-service microservice
    const result = await invoiceService.createInvoice({
      projectId: project_id,
      clientName: client_name || undefined,
      clientEmail: client_email || undefined,
      clientAddress: client_address || undefined,
      amount,
      currency: currency || 'usd',
      taxRate: tax_rate || 0,
      issueDate: issue_date ? new Date(issue_date).toISOString() : new Date().toISOString(),
      dueDate: due_date ? new Date(due_date).toISOString() : undefined,
      description: description || undefined,
      items: items ? JSON.stringify(items) : undefined,
      notes: notes || undefined,
    });

    if (result.error) {
      console.error('Invoice service error:', result.error);
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ invoice: result.invoice }, { status: 201 });
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

