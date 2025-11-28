import { Router } from 'express';
import { invoiceController } from '../controllers/invoice.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public route - no auth required
router.get('/public/:token', (req, res, next) =>
  invoiceController.getPublicInvoice(req, res).catch(next)
);

// All other routes require authentication
router.use(authMiddleware);

// Get overdue invoices
router.get('/overdue', (req, res, next) =>
  invoiceController.getOverdueInvoices(req, res).catch(next)
);

// Get invoices by project
router.get('/project/:projectId', (req, res, next) =>
  invoiceController.getProjectInvoices(req, res).catch(next)
);

// Get project invoice statistics
router.get('/project/:projectId/stats', (req, res, next) =>
  invoiceController.getInvoiceStats(req, res).catch(next)
);

// Create invoice
router.post('/', (req, res, next) =>
  invoiceController.createInvoice(req, res).catch(next)
);

// Get invoice by invoice number
router.get('/number/:invoiceNumber', (req, res, next) =>
  invoiceController.getInvoiceByNumber(req, res).catch(next)
);

// Get invoice by ID
router.get('/:id', (req, res, next) =>
  invoiceController.getInvoice(req, res).catch(next)
);

// Update invoice
router.put('/:id', (req, res, next) =>
  invoiceController.updateInvoice(req, res).catch(next)
);

// Mark as sent
router.put('/:id/sent', (req, res, next) =>
  invoiceController.markAsSent(req, res).catch(next)
);

// Mark as paid
router.put('/:id/paid', (req, res, next) =>
  invoiceController.markAsPaid(req, res).catch(next)
);

// Cancel invoice
router.put('/:id/cancel', (req, res, next) =>
  invoiceController.cancelInvoice(req, res).catch(next)
);

// Generate share link
router.post('/:id/share', (req, res, next) =>
  invoiceController.generateShareLink(req, res).catch(next)
);

// Delete invoice
router.delete('/:id', (req, res, next) =>
  invoiceController.deleteInvoice(req, res).catch(next)
);

// Record payment
router.post('/:id/payments', (req, res, next) =>
  invoiceController.recordPayment(req, res).catch(next)
);

// Get invoice payments
router.get('/:id/payments', (req, res, next) =>
  invoiceController.getInvoicePayments(req, res).catch(next)
);

export default router;
