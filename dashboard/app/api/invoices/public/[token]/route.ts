import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../server/storage';
import { nanoid } from 'nanoid';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invoice = await storage.getInvoiceByPublicToken(params.token);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Check if token is expired
    if (invoice.tokenExpiresAt && new Date(invoice.tokenExpiresAt) < new Date()) {
      return NextResponse.json({ error: 'Invoice link has expired' }, { status: 410 });
    }

    // Get comments (public only)
    const comments = await storage.getInvoiceComments(invoice.id, false);
    
    // Get payment history
    const payments = await storage.getInvoicePayments(invoice.id);

    return NextResponse.json({
      invoice,
      comments,
      payments,
    });
  } catch (error: any) {
    console.error('Error fetching public invoice:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invoice' },
      { status: 500 }
    );
  }
}

