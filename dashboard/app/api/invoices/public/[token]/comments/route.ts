import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../../../server/storage';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const invoice = await storage.getInvoiceByPublicToken(params.token);

    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    const data = await request.json();
    const { authorName, authorEmail, comment } = data;

    if (!authorName || !authorEmail || !comment) {
      return NextResponse.json(
        { error: 'Author name, email, and comment are required' },
        { status: 400 }
      );
    }

    // Simple rate limiting: max 5 comments per hour per email
    const recentComments = await storage.getInvoiceComments(invoice.id, false);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = recentComments.filter(
      c => c.authorEmail === authorEmail && new Date(c.createdAt) > oneHourAgo
    ).length;

    if (recentCount >= 5) {
      return NextResponse.json(
        { error: 'Too many comments. Please try again later.' },
        { status: 429 }
      );
    }

    const newComment = await storage.createInvoiceComment({
      invoiceId: invoice.id,
      authorName,
      authorEmail,
      comment,
      isInternal: false,
    });

    return NextResponse.json({ comment: newComment }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

