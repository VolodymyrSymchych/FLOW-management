import { db, invoices, Invoice, InsertInvoice, invoicePayments, InvoicePayment, InsertInvoicePayment } from '../db';
import { eq, desc, and, sql, lte } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '@project-scope-analyzer/shared';


export class InvoiceService {
  // Generate unique invoice number
  async generateInvoiceNumber(): Promise<string> {
    const { nanoid } = await import('nanoid');
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = nanoid(6).toUpperCase();
    return `INV-${year}${month}-${random}`;
  }

  // Generate public token for invoice sharing
  async generatePublicToken(): Promise<string> {
    const { nanoid } = await import('nanoid');
    return nanoid(32);
  }

  // Calculate tax and total
  calculateAmounts(amount: number, taxRate: number): { taxAmount: number; totalAmount: number } {
    const taxAmount = Math.round((amount * taxRate) / 100);
    const totalAmount = amount + taxAmount;
    return { taxAmount, totalAmount };
  }

  // Create invoice
  async createInvoice(data: Omit<InsertInvoice, 'invoiceNumber' | 'taxAmount' | 'totalAmount'>): Promise<Invoice> {
    const invoiceNumber = await this.generateInvoiceNumber();
    const { taxAmount, totalAmount } = this.calculateAmounts(data.amount, data.taxRate || 0);

    const [invoice] = await db
      .insert(invoices)
      .values({
        ...data,
        invoiceNumber,
        taxAmount,
        totalAmount,
      })
      .returning();

    return invoice;
  }

  // Get invoice by ID
  async getInvoiceById(id: number): Promise<Invoice> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.id, id), sql`${invoices.deletedAt} IS NULL`))
      .limit(1);

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  // Get invoice by invoice number
  async getInvoiceByNumber(invoiceNumber: string): Promise<Invoice> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.invoiceNumber, invoiceNumber), sql`${invoices.deletedAt} IS NULL`))
      .limit(1);

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    return invoice;
  }

  // Get invoice by public token
  async getInvoiceByToken(token: string): Promise<Invoice> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.publicToken, token), sql`${invoices.deletedAt} IS NULL`))
      .limit(1);

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Check if token is expired
    if (invoice.tokenExpiresAt && new Date(invoice.tokenExpiresAt) < new Date()) {
      throw new ValidationError('Invoice link has expired');
    }

    return invoice;
  }

  // Get invoices for a project
  async getProjectInvoices(projectId: number, limit = 50, offset = 0): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(and(eq(invoices.projectId, projectId), sql`${invoices.deletedAt} IS NULL`))
      .orderBy(desc(invoices.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Get invoices by status
  async getInvoicesByStatus(projectId: number, status: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.projectId, projectId),
          eq(invoices.status, status),
          sql`${invoices.deletedAt} IS NULL`
        )
      )
      .orderBy(desc(invoices.createdAt));
  }

  // Update invoice
  async updateInvoice(
    id: number,
    updates: Partial<Omit<Invoice, 'id' | 'invoiceNumber' | 'createdAt' | 'updatedAt'>>
  ): Promise<Invoice> {
    // Recalculate amounts if amount or taxRate changed
    if (updates.amount !== undefined || updates.taxRate !== undefined) {
      const currentInvoice = await this.getInvoiceById(id);
      const amount = updates.amount ?? currentInvoice.amount;
      const taxRate = updates.taxRate ?? currentInvoice.taxRate ?? 0;
      const { taxAmount, totalAmount } = this.calculateAmounts(amount, taxRate);
      updates.taxAmount = taxAmount;
      updates.totalAmount = totalAmount;
    }

    const [updated] = await db
      .update(invoices)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(invoices.id, id), sql`${invoices.deletedAt} IS NULL`))
      .returning();

    if (!updated) {
      throw new NotFoundError('Invoice not found');
    }

    return updated;
  }

  // Mark invoice as sent
  async markAsSent(id: number): Promise<Invoice> {
    return await this.updateInvoice(id, { status: 'sent' });
  }

  // Mark invoice as paid
  async markAsPaid(id: number, paidDate?: Date): Promise<Invoice> {
    return await this.updateInvoice(id, {
      status: 'paid',
      paidDate: paidDate || new Date(),
    });
  }

  // Cancel invoice
  async cancelInvoice(id: number): Promise<Invoice> {
    return await this.updateInvoice(id, { status: 'cancelled' });
  }

  // Generate public share link
  async generateShareLink(id: number, expiresInDays = 30): Promise<{ token: string; url: string }> {
    const token = await this.generatePublicToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.updateInvoice(id, {
      publicToken: token,
      tokenExpiresAt: expiresAt,
    });

    // In production, this would be your actual domain
    const url = `${process.env.APP_URL || 'http://localhost:3000'}/invoices/public/${token}`;

    return { token, url };
  }

  // Soft delete invoice
  async deleteInvoice(id: number): Promise<void> {
    const [result] = await db
      .update(invoices)
      .set({ deletedAt: new Date() })
      .where(and(eq(invoices.id, id), sql`${invoices.deletedAt} IS NULL`))
      .returning({ id: invoices.id });

    if (!result) {
      throw new NotFoundError('Invoice not found');
    }
  }

  // Get overdue invoices
  async getOverdueInvoices(projectId?: number): Promise<Invoice[]> {
    const now = new Date();
    const conditions = [
      eq(invoices.status, 'sent'),
      lte(invoices.dueDate, now),
      sql`${invoices.deletedAt} IS NULL`,
    ];

    if (projectId) {
      conditions.push(eq(invoices.projectId, projectId));
    }

    return await db
      .select()
      .from(invoices)
      .where(and(...conditions))
      .orderBy(desc(invoices.dueDate));
  }

  // Get invoice statistics
  async getInvoiceStats(projectId: number): Promise<{ status: string | null; count: number; total: number }[]> {
    const stats = await db
      .select({
        status: invoices.status,
        count: sql<number>`count(*)::int`,
        total: sql<number>`sum(${invoices.totalAmount})::int`,
      })
      .from(invoices)
      .where(and(eq(invoices.projectId, projectId), sql`${invoices.deletedAt} IS NULL`))
      .groupBy(invoices.status);

    return stats;
  }

  // Record payment
  async recordPayment(data: InsertInvoicePayment): Promise<InvoicePayment> {
    const [payment] = await db.insert(invoicePayments).values(data).returning();

    // If payment succeeded, mark invoice as paid
    if (data.status === 'succeeded') {
      await this.markAsPaid(data.invoiceId, new Date());
    }

    return payment;
  }

  // Get invoice payments
  async getInvoicePayments(invoiceId: number): Promise<InvoicePayment[]> {
    return await db
      .select()
      .from(invoicePayments)
      .where(eq(invoicePayments.invoiceId, invoiceId))
      .orderBy(desc(invoicePayments.createdAt));
  }
}

export const invoiceService = new InvoiceService();
