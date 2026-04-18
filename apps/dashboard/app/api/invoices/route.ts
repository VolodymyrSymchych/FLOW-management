import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
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
    const teamId = searchParams.get('team_id');

    if (projectId) {
      const numericProjectId = parseInt(projectId, 10);
      if (Number.isNaN(numericProjectId) || numericProjectId <= 0) {
        return NextResponse.json({ error: 'Invalid project ID' }, { status: 400 });
      }

      const hasAccess = await storage.userHasProjectAccess(session.userId, numericProjectId);
      if (!hasAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const invoices = await storage.getInvoices(numericProjectId);
      return NextResponse.json({ invoices });
    }

    if (teamId && teamId !== 'all') {
      const numericTeamId = parseInt(teamId, 10);
      if (Number.isNaN(numericTeamId) || numericTeamId <= 0) {
        return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
      }

      const userTeams = await storage.getUserTeams(session.userId);
      const hasTeamAccess = userTeams.some((team) => team.id === numericTeamId);
      if (!hasTeamAccess) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }

      const invoices = await storage.getInvoicesByTeam(numericTeamId);
      return NextResponse.json({ invoices });
    }

    const userProjects = await storage.getUserProjects(session.userId);
    const allowedProjectIds = new Set(userProjects.map((project) => project.id));
    const invoices = (await storage.getInvoices()).filter((invoice) => allowedProjectIds.has(invoice.projectId));

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

    // Validate request body
    const validation = validateRequestBody(createInvoiceSchema, data);
    if (validation.success === false) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }

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
    } = validation.data;

    const hasProjectAccess = await storage.userHasProjectAccess(session.userId, project_id);
    if (!hasProjectAccess) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const amountInCents = Math.round(amount * 100);
    const taxRateValue = Math.round(tax_rate || 0);
    const taxAmount = Math.round((amountInCents * taxRateValue) / 100);
    const totalAmount = amountInCents + taxAmount;

    const invoice = await storage.createInvoice({
      projectId: project_id,
      invoiceNumber: invoice_number,
      clientName: client_name || null,
      clientEmail: client_email || null,
      clientAddress: client_address || null,
      amount: amountInCents,
      currency: currency || 'usd',
      taxRate: taxRateValue,
      taxAmount,
      totalAmount,
      status: status || 'draft',
      issueDate: issue_date ? new Date(issue_date) : new Date(),
      dueDate: due_date ? new Date(due_date) : null,
      description: description || null,
      items: items ? JSON.stringify(items) : null,
      notes: notes || null,
    });

    try {
      await invalidateOnUpdate('invoice', invoice.id, session.userId, { projectId: invoice.projectId });
    } catch (cacheError) {
      console.error('Invoice created but cache invalidation failed:', cacheError);
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
