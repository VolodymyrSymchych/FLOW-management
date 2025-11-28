import { Response } from 'express';
import { invoiceService } from '../services/invoice.service';
import { AuthenticatedRequest } from '../types/express';
import { z } from 'zod';
import { BadRequestError } from '@project-scope-analyzer/shared';

// Validation schemas
const createInvoiceSchema = z.object({
  projectId: z.number(),
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientAddress: z.string().optional(),
  amount: z.number().min(0),
  currency: z.string().length(3).default('usd'),
  taxRate: z.number().min(0).max(100).default(0),
  issueDate: z.string().datetime(),
  dueDate: z.string().datetime().optional(),
  description: z.string().optional(),
  items: z.string().optional(), // JSON string
  notes: z.string().optional(),
});

const updateInvoiceSchema = z.object({
  clientName: z.string().optional(),
  clientEmail: z.string().email().optional(),
  clientAddress: z.string().optional(),
  amount: z.number().min(0).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).optional(),
  dueDate: z.string().datetime().optional(),
  paidDate: z.string().datetime().optional(),
  description: z.string().optional(),
  items: z.string().optional(),
  notes: z.string().optional(),
});

const recordPaymentSchema = z.object({
  amount: z.number().min(0),
  currency: z.string().length(3).default('usd'),
  stripePaymentIntentId: z.string().optional(),
  status: z.enum(['pending', 'succeeded', 'failed']).default('pending'),
});

export class InvoiceController {
  // Create invoice
  async createInvoice(req: AuthenticatedRequest, res: Response) {
    const validated = createInvoiceSchema.parse(req.body);

    const invoice = await invoiceService.createInvoice({
      ...validated,
      issueDate: new Date(validated.issueDate),
      dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    });

    res.status(201).json({ invoice });
  }

  // Get invoice by ID
  async getInvoice(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const invoice = await invoiceService.getInvoiceById(id);

    res.json({ invoice });
  }

  // Get invoice by invoice number
  async getInvoiceByNumber(req: AuthenticatedRequest, res: Response) {
    const { invoiceNumber } = req.params;
    const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber);

    res.json({ invoice });
  }

  // Get public invoice by token
  async getPublicInvoice(req: AuthenticatedRequest, res: Response) {
    const { token } = req.params;
    const invoice = await invoiceService.getInvoiceByToken(token);

    res.json({ invoice });
  }

  // Get project invoices
  async getProjectInvoices(req: AuthenticatedRequest, res: Response) {
    const projectId = parseInt(req.params.projectId);
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    if (isNaN(projectId)) {
      throw new BadRequestError('Invalid project ID');
    }

    let invoices;
    if (status) {
      invoices = await invoiceService.getInvoicesByStatus(projectId, status);
    } else {
      invoices = await invoiceService.getProjectInvoices(projectId, limit, offset);
    }

    res.json({ invoices, limit, offset });
  }

  // Update invoice
  async updateInvoice(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    const validated = updateInvoiceSchema.parse(req.body);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const updates: any = { ...validated };
    if (validated.dueDate) {
      updates.dueDate = new Date(validated.dueDate);
    }
    if (validated.paidDate) {
      updates.paidDate = new Date(validated.paidDate);
    }

    const invoice = await invoiceService.updateInvoice(id, updates);

    res.json({ invoice });
  }

  // Mark as sent
  async markAsSent(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const invoice = await invoiceService.markAsSent(id);

    res.json({ invoice });
  }

  // Mark as paid
  async markAsPaid(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    const paidDate = req.body.paidDate ? new Date(req.body.paidDate) : undefined;

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const invoice = await invoiceService.markAsPaid(id, paidDate);

    res.json({ invoice });
  }

  // Cancel invoice
  async cancelInvoice(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const invoice = await invoiceService.cancelInvoice(id);

    res.json({ invoice });
  }

  // Generate share link
  async generateShareLink(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);
    const expiresInDays = parseInt(req.body.expiresInDays) || 30;

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const { token, url } = await invoiceService.generateShareLink(id, expiresInDays);

    res.json({ token, url });
  }

  // Delete invoice
  async deleteInvoice(req: AuthenticatedRequest, res: Response) {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    await invoiceService.deleteInvoice(id);

    res.json({ message: 'Invoice deleted successfully' });
  }

  // Get overdue invoices
  async getOverdueInvoices(req: AuthenticatedRequest, res: Response) {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;

    const invoices = await invoiceService.getOverdueInvoices(projectId);

    res.json({ invoices });
  }

  // Get invoice statistics
  async getInvoiceStats(req: AuthenticatedRequest, res: Response) {
    const projectId = parseInt(req.params.projectId);

    if (isNaN(projectId)) {
      throw new BadRequestError('Invalid project ID');
    }

    const stats = await invoiceService.getInvoiceStats(projectId);

    res.json({ stats });
  }

  // Record payment
  async recordPayment(req: AuthenticatedRequest, res: Response) {
    const invoiceId = parseInt(req.params.id);
    const validated = recordPaymentSchema.parse(req.body);

    if (isNaN(invoiceId)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const payment = await invoiceService.recordPayment({
      ...validated,
      invoiceId,
    });

    res.status(201).json({ payment });
  }

  // Get invoice payments
  async getInvoicePayments(req: AuthenticatedRequest, res: Response) {
    const invoiceId = parseInt(req.params.id);

    if (isNaN(invoiceId)) {
      throw new BadRequestError('Invalid invoice ID');
    }

    const payments = await invoiceService.getInvoicePayments(invoiceId);

    res.json({ payments });
  }
}

export const invoiceController = new InvoiceController();
