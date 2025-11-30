import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { sendInvoiceEmail } from '@/lib/email/send-invoice';
import { createInvoiceSchema, validateRequestBody, formatZodError } from '@/lib/validations';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { db } from '@/server/db';
import { invoices } from '@/shared/schema';
import { eq, desc, and, isNull, inArray } from 'drizzle-orm';

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

    let invoicesData;
    let cacheKey: string;

    if (teamId && teamId !== 'all') {
      // Filter by team
      const teamIdNum = parseInt(teamId);

      // Verify user is a member of the team
      const teamMembers = await storage.getTeamMembers(teamIdNum);
      const isMember = teamMembers.some(tm => tm.userId === session.userId);

      if (!isMember) {
        return NextResponse.json({ error: 'Not a team member' }, { status: 403 });
      }

      cacheKey = CacheKeys.invoicesByTeam(teamIdNum);
      invoicesData = await cachedWithValidation(
        cacheKey,
        async () => await storage.getInvoicesByTeam(teamIdNum),
        {
          ttl: 300, // 5 minutes
          validate: true,
          getUpdatedAt: async () => {
            const result = await db
              .select({ updatedAt: invoices.updatedAt })
              .from(invoices)
              .where(isNull(invoices.deletedAt))
              .orderBy(desc(invoices.updatedAt))
              .limit(1);
            return result[0]?.updatedAt || null;
          },
        }
      );
    } else if (projectId) {
      // Filter by project
      cacheKey = CacheKeys.invoicesByProject(parseInt(projectId));
      invoicesData = await cachedWithValidation(
        cacheKey,
        async () => await storage.getInvoices(parseInt(projectId)),
        {
          ttl: 300, // 5 minutes
          validate: true,
          getUpdatedAt: async () => {
            const result = await db
              .select({ updatedAt: invoices.updatedAt })
              .from(invoices)
              .where(and(
                eq(invoices.projectId, parseInt(projectId)),
                isNull(invoices.deletedAt)
              ))
              .orderBy(desc(invoices.updatedAt))
              .limit(1);
            return result[0]?.updatedAt || null;
          },
        }
      );
    } else {
      // All invoices for user (through their projects)
      cacheKey = CacheKeys.invoicesByUser(session.userId);
      invoicesData = await cachedWithValidation(
        cacheKey,
        async () => {
          const userProjects = await storage.getUserProjects(session.userId);
          const projectIds = userProjects.map(p => p.id);

          if (projectIds.length === 0) {
            return [];
          }

          // Get all invoices for user's projects
          const allInvoices = await Promise.all(
            projectIds.map(id => storage.getInvoices(id))
          );
          return allInvoices.flat();
        },
        {
          ttl: 300, // 5 minutes
          validate: true,
          getUpdatedAt: async () => {
            const result = await db
              .select({ updatedAt: invoices.updatedAt })
              .from(invoices)
              .where(isNull(invoices.deletedAt))
              .orderBy(desc(invoices.updatedAt))
              .limit(1);
            return result[0]?.updatedAt || null;
          },
        }
      );
    }

    return NextResponse.json({ invoices: invoicesData });
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

    // Calculate tax and total (amount is in dollars, convert to cents)
    const amountInCents = Math.round(amount * 100);
    const taxRate = tax_rate || 0;
    const taxAmount = Math.round((amountInCents * taxRate) / 100);
    const totalAmount = amountInCents + taxAmount;

    const invoice = await storage.createInvoice({
      projectId: project_id,
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
          const project = await storage.getProject(project_id);
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

    // Invalidate caches after creating invoice
    await invalidateOnUpdate('invoice', invoice.id, session.userId, { projectId: project_id });

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

