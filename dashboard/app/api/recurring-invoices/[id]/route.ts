import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../server/storage';

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
    const recurringInvoice = await storage.getRecurringInvoice(id);

    if (!recurringInvoice) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ recurringInvoice });
  } catch (error: any) {
    console.error('Error fetching recurring invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recurring invoice' },
      { status: 500 }
    );
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

    const updateData: any = {};
    if (data.frequency) updateData.frequency = data.frequency;
    if (data.custom_interval_days !== undefined) updateData.customIntervalDays = data.custom_interval_days;
    if (data.next_generation_date) updateData.nextGenerationDate = new Date(data.next_generation_date);
    if (data.end_date !== undefined) updateData.endDate = data.end_date ? new Date(data.end_date) : null;
    if (data.is_active !== undefined) updateData.isActive = data.is_active;
    if (data.auto_send_email !== undefined) updateData.autoSendEmail = data.auto_send_email;

    const recurringInvoice = await storage.updateRecurringInvoice(id, updateData);

    if (!recurringInvoice) {
      return NextResponse.json({ error: 'Recurring invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ recurringInvoice });
  } catch (error: any) {
    console.error('Error updating recurring invoice:', error);
    return NextResponse.json(
      { error: 'Failed to update recurring invoice' },
      { status: 500 }
    );
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
    
    // Deactivate instead of delete
    await storage.updateRecurringInvoice(id, { isActive: false });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting recurring invoice:', error);
    return NextResponse.json(
      { error: 'Failed to delete recurring invoice' },
      { status: 500 }
    );
  }
}

