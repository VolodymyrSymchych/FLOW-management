import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId') ? parseInt(searchParams.get('projectId')!) : undefined;

    const recurringInvoices = await storage.getRecurringInvoices(projectId);

    return NextResponse.json({ recurringInvoices });
  } catch (error: any) {
    console.error('Error fetching recurring invoices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring invoices' },
      { status: 500 }
    );
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
      base_invoice_id,
      frequency,
      custom_interval_days,
      next_generation_date,
      end_date,
      auto_send_email,
    } = data;

    if (!project_id || !frequency || !next_generation_date) {
      return NextResponse.json(
        { error: 'Project ID, frequency, and next generation date are required' },
        { status: 400 }
      );
    }

    // Verify project ownership
    const project = await storage.getProject(parseInt(project_id));
    if (!project || project.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const recurringInvoice = await storage.createRecurringInvoice({
      projectId: parseInt(project_id),
      baseInvoiceId: base_invoice_id ? parseInt(base_invoice_id) : null,
      frequency,
      customIntervalDays: custom_interval_days || null,
      nextGenerationDate: new Date(next_generation_date),
      lastGeneratedDate: null,
      isActive: true,
      endDate: end_date ? new Date(end_date) : null,
      autoSendEmail: auto_send_email !== undefined ? auto_send_email : true,
    });

    return NextResponse.json({ recurringInvoice }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating recurring invoice:', error);
    return NextResponse.json(
      { error: 'Failed to create recurring invoice' },
      { status: 500 }
    );
  }
}

