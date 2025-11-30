import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/lib/storage';
import { createExpenseSchema, validateRequestBody, formatZodError } from '@/lib/validations';
import { cachedWithValidation } from '@/lib/redis';
import { CacheKeys } from '@/lib/cache-keys';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { db } from '@/server/db';
import { expenses } from '@/shared/schema';
import { eq, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const projectIdNum = projectId ? parseInt(projectId) : undefined;

    // Use different cache key based on filter
    const cacheKey = projectIdNum
      ? CacheKeys.expensesByProject(projectIdNum)
      : CacheKeys.expensesByUser(session.userId);

    // Cache expenses for 5 minutes with timestamp validation
    const expensesData = await cachedWithValidation(
      cacheKey,
      async () => await storage.getExpenses(projectIdNum),
      {
        ttl: 300, // 5 minutes
        validate: true,
        getUpdatedAt: async () => {
          try {
            // Get most recent expense update based on filter
            const result = projectIdNum
              ? await db
                  .select({ updatedAt: expenses.updatedAt })
                  .from(expenses)
                  .where(eq(expenses.projectId, projectIdNum))
                  .orderBy(desc(expenses.updatedAt))
                  .limit(1)
              : await db
                  .select({ updatedAt: expenses.updatedAt })
                  .from(expenses)
                  .where(eq(expenses.userId, session.userId))
                  .orderBy(desc(expenses.updatedAt))
                  .limit(1);

            return result[0]?.updatedAt || null;
          } catch (error) {
            console.warn('[Expenses] Error getting timestamps:', error);
            return null;
          }
        },
      }
    );

    return NextResponse.json({ expenses: expensesData });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
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
    const validation = validateRequestBody(createExpenseSchema, data);
    if (validation.success === false) {
      return NextResponse.json(formatZodError(validation.error), { status: 400 });
    }

    const {
      project_id,
      category,
      description,
      amount,
      currency,
      expense_date,
      receipt_url,
      notes,
    } = validation.data;

    const expense = await storage.createExpense({
      projectId: project_id,
      userId: session.userId,
      category,
      description,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'usd',
      expenseDate: expense_date ? new Date(expense_date) : new Date(),
      receiptUrl: receipt_url || null,
      notes: notes || null,
    });

    // Invalidate caches after creating expense
    await invalidateOnUpdate('expense', expense.id, session.userId, { projectId: project_id });

    return NextResponse.json({ expense }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating expense:', error);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

