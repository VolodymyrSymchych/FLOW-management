import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '../../../../../../server/storage';
import { sendInvoiceEmail, sendOverdueReminder, sendDueDateReminder } from '@/lib/email/send-invoice';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const { action } = await request.json(); // 'send', 'remind_overdue', 'remind_due_date'

    const invoice = await storage.getInvoice(id);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    // Verify user owns the project
    if (invoice.projectId) {
      const project = await storage.getProject(invoice.projectId);
      if (project && project.userId !== session.userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (!invoice.clientEmail) {
      return NextResponse.json(
        { error: 'Client email is required to send email' },
        { status: 400 }
      );
    }

    // Fetch project name if projectId exists
    let projectName = '';
    if (invoice.projectId) {
      const project = await storage.getProject(invoice.projectId);
      projectName = project?.name || '';
    }

    const invoiceWithProject = {
      ...invoice,
      dueDate: invoice.dueDate ? invoice.dueDate.toISOString() : null,
      projectName,
    };

    try {
      switch (action) {
        case 'send':
          await sendInvoiceEmail(invoiceWithProject);
          break;
        case 'remind_overdue':
          await sendOverdueReminder(invoiceWithProject);
          break;
        case 'remind_due_date':
          await sendDueDateReminder(invoiceWithProject);
          break;
        default:
          return NextResponse.json(
            { error: 'Invalid action. Use: send, remind_overdue, or remind_due_date' },
            { status: 400 }
          );
      }

      return NextResponse.json({ 
        success: true, 
        message: `Email sent successfully` 
      });
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json(
        { error: 'Failed to send email', message: emailError.message },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error sending invoice email:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}

