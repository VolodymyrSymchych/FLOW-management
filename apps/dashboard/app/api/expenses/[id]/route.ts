import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { storage } from '@/server/storage';
import { invalidateOnUpdate } from '@/lib/cache-invalidation';
import { apiResponses, parseNumericId } from '@/lib/api-route-helpers';

export const dynamic = 'force-dynamic';

const unauthorized = () => apiResponses.unauthorized();
const invalidExpenseId = () => apiResponses.badRequest('Invalid expense ID');
const expenseNotFound = () => apiResponses.notFound('Expense not found');
const forbidden = () => apiResponses.forbidden();

function parseExpenseId(idStr: string): number | null {
  return parseNumericId(idStr);
}

function buildExpenseUpdateData(data: Record<string, unknown>): Record<string, unknown> {
  const updateData: Record<string, unknown> = {};
  if (data.category) updateData.category = data.category;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.amount !== undefined) updateData.amount = Math.round(Number(data.amount) * 100);
  if (data.currency) updateData.currency = data.currency;
  if (data.expense_date) updateData.expenseDate = new Date(data.expense_date as string);
  if (data.receipt_url !== undefined) updateData.receiptUrl = data.receipt_url;
  if (data.notes !== undefined) updateData.notes = data.notes;
  return updateData;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseExpenseId((await params).id);
    if (id === null) return invalidExpenseId();

    const expense = await storage.getExpense(id);
    if (!expense) return expenseNotFound();
    if (expense.userId !== session.userId) return forbidden();

    return NextResponse.json({ expense });
  } catch (error: unknown) {
    console.error('Error fetching expense:', error);
    return NextResponse.json({ error: 'Failed to fetch expense' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseExpenseId((await params).id);
    if (id === null) return invalidExpenseId();

    const existingExpense = await storage.getExpense(id);
    if (!existingExpense) return expenseNotFound();
    if (existingExpense.userId !== session.userId) return forbidden();

    const data = await request.json();
    const updateData = buildExpenseUpdateData(data);

    const expense = await storage.updateExpense(id, updateData);
    if (!expense) return expenseNotFound();

    await invalidateOnUpdate('expense', id, session.userId, { projectId: expense.projectId });

    return NextResponse.json({ expense });
  } catch (error: unknown) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Failed to update expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const id = parseExpenseId((await params).id);
    if (id === null) return invalidExpenseId();

    const expense = await storage.getExpense(id);
    if (!expense) return expenseNotFound();
    if (expense.userId !== session.userId) return forbidden();

    await storage.deleteExpense(id);

    await invalidateOnUpdate('expense', id, session.userId, { projectId: expense.projectId });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting expense:', error);
    return NextResponse.json({ error: 'Failed to delete expense' }, { status: 500 });
  }
}
