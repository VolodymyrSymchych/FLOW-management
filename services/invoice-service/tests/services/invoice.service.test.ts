// Mock DB
const mockDb = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    limit: jest.fn(),
    offset: jest.fn(),
    orderBy: jest.fn().mockReturnThis(),
    groupBy: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    values: jest.fn().mockReturnThis(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
};

jest.mock('../../src/db', () => ({
    db: mockDb,
    invoices: {
        id: 'id',
        invoiceNumber: 'invoiceNumber',
        projectId: 'projectId',
        status: 'status',
        dueDate: 'dueDate',
        deletedAt: 'deletedAt',
        createdAt: 'createdAt',
        publicToken: 'publicToken',
        totalAmount: 'totalAmount',
    },
    invoicePayments: {
        invoiceId: 'invoiceId',
        createdAt: 'createdAt',
    },
}));

jest.mock('drizzle-orm', () => ({
    eq: jest.fn((f, v) => ({ eq: f, v })),
    and: jest.fn((...a) => ({ and: a })),
    desc: jest.fn((f) => ({ desc: f })),
    sql: jest.fn((s, ...v) => ({ sql: s, v })),
    gte: jest.fn((f, v) => ({ gte: f, v })),
    lte: jest.fn((f, v) => ({ lte: f, v })),
    or: jest.fn((...a) => ({ or: a })),
}));

import { InvoiceService } from '../../src/services/invoice.service';

describe('InvoiceService', () => {
    let invoiceService: InvoiceService;

    const mockInvoice = {
        id: 1,
        invoiceNumber: 'INV-202401-ABC123',
        projectId: 1,
        clientName: 'Test Client',
        clientEmail: 'client@test.com',
        amount: 1000,
        taxRate: 10,
        taxAmount: 100,
        totalAmount: 1100,
        status: 'draft',
        dueDate: new Date('2024-02-01'),
        publicToken: null,
        tokenExpiresAt: null,
        paidDate: null,
        deletedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        invoiceService = new InvoiceService();
        jest.clearAllMocks();

        mockDb.select.mockReturnThis();
        mockDb.from.mockReturnThis();
        mockDb.where.mockReturnThis();
        mockDb.orderBy.mockReturnThis();
        mockDb.insert.mockReturnThis();
        mockDb.values.mockReturnThis();
        mockDb.update.mockReturnThis();
        mockDb.set.mockReturnThis();
    });

    describe('generateInvoiceNumber', () => {
        it('should generate unique invoice number', async () => {
            const result = await invoiceService.generateInvoiceNumber();

            expect(result).toMatch(/^INV-\d{6}-[A-Z0-9]{6}$/);
        });
    });

    describe('generatePublicToken', () => {
        it('should generate 32 character token', async () => {
            const result = await invoiceService.generatePublicToken();

            expect(result).toHaveLength(32);
        });
    });

    describe('calculateAmounts', () => {
        it('should calculate tax and total correctly', () => {
            const result = invoiceService.calculateAmounts(1000, 10);

            expect(result.taxAmount).toBe(100);
            expect(result.totalAmount).toBe(1100);
        });

        it('should handle zero tax rate', () => {
            const result = invoiceService.calculateAmounts(1000, 0);

            expect(result.taxAmount).toBe(0);
            expect(result.totalAmount).toBe(1000);
        });
    });

    describe('createInvoice', () => {
        it('should create invoice with generated number', async () => {
            mockDb.returning.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.createInvoice({
                projectId: 1,
                clientName: 'Test Client',
                clientEmail: 'client@test.com',
                amount: 1000,
                issueDate: new Date(),
            });

            expect(result.id).toBe(1);
            expect(mockDb.insert).toHaveBeenCalled();
        });
    });

    describe('getInvoiceById', () => {
        it('should return invoice when found', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.getInvoiceById(1);

            expect(result.id).toBe(1);
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(invoiceService.getInvoiceById(999)).rejects.toThrow('Invoice not found');
        });
    });

    describe('getInvoiceByNumber', () => {
        it('should return invoice when found', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.getInvoiceByNumber('INV-202401-ABC123');

            expect(result.invoiceNumber).toBe('INV-202401-ABC123');
        });

        it('should throw NotFoundError when not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(invoiceService.getInvoiceByNumber('INVALID')).rejects.toThrow('Invoice not found');
        });
    });

    describe('getInvoiceByToken', () => {
        it('should return invoice when token is valid', async () => {
            mockDb.limit.mockResolvedValue([{ ...mockInvoice, publicToken: 'validtoken' }]);

            const result = await invoiceService.getInvoiceByToken('validtoken');

            expect(result.id).toBe(1);
        });

        it('should throw NotFoundError when token not found', async () => {
            mockDb.limit.mockResolvedValue([]);

            await expect(invoiceService.getInvoiceByToken('invalidtoken')).rejects.toThrow('Invoice not found');
        });

        it('should throw ValidationError when token is expired', async () => {
            const expiredInvoice = {
                ...mockInvoice,
                publicToken: 'expired',
                tokenExpiresAt: new Date('2020-01-01'),
            };
            mockDb.limit.mockResolvedValue([expiredInvoice]);

            await expect(invoiceService.getInvoiceByToken('expired')).rejects.toThrow('Invoice link has expired');
        });
    });

    describe('getProjectInvoices', () => {
        it('should return project invoices', async () => {
            mockDb.orderBy.mockReturnValueOnce({
                limit: jest.fn().mockReturnValue({
                    offset: jest.fn().mockResolvedValue([mockInvoice]),
                }),
            });

            const result = await invoiceService.getProjectInvoices(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getInvoicesByStatus', () => {
        it('should return invoices by status', async () => {
            mockDb.orderBy.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.getInvoicesByStatus(1, 'draft');

            expect(result).toHaveLength(1);
        });
    });

    describe('updateInvoice', () => {
        it('should update invoice', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, status: 'sent' }]);

            const result = await invoiceService.updateInvoice(1, { status: 'sent' });

            expect(result.status).toBe('sent');
        });

        it('should recalculate amounts when amount changes', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, amount: 2000, taxAmount: 200, totalAmount: 2200 }]);

            const result = await invoiceService.updateInvoice(1, { amount: 2000 });

            expect(result.amount).toBe(2000);
        });

        it('should throw NotFoundError when invoice not found', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]); // for getInvoiceById
            mockDb.returning.mockResolvedValue([]);

            await expect(invoiceService.updateInvoice(999, { status: 'sent' })).rejects.toThrow('Invoice not found');
        });
    });

    describe('markAsSent', () => {
        it('should mark invoice as sent', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, status: 'sent' }]);

            const result = await invoiceService.markAsSent(1);

            expect(result.status).toBe('sent');
        });
    });

    describe('markAsPaid', () => {
        it('should mark invoice as paid', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, status: 'paid', paidDate: new Date() }]);

            const result = await invoiceService.markAsPaid(1);

            expect(result.status).toBe('paid');
        });
    });

    describe('cancelInvoice', () => {
        it('should cancel invoice', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, status: 'cancelled' }]);

            const result = await invoiceService.cancelInvoice(1);

            expect(result.status).toBe('cancelled');
        });
    });

    describe('deleteInvoice', () => {
        it('should soft delete invoice', async () => {
            mockDb.returning.mockResolvedValue([{ id: 1 }]);

            await invoiceService.deleteInvoice(1);

            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should throw NotFoundError when invoice not found', async () => {
            mockDb.returning.mockResolvedValue([]);

            await expect(invoiceService.deleteInvoice(999)).rejects.toThrow('Invoice not found');
        });
    });

    describe('getOverdueInvoices', () => {
        it('should return overdue invoices', async () => {
            mockDb.orderBy.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.getOverdueInvoices();

            expect(result).toHaveLength(1);
        });

        it('should filter by projectId when provided', async () => {
            mockDb.orderBy.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.getOverdueInvoices(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('getInvoiceStats', () => {
        it('should return invoice statistics', async () => {
            mockDb.groupBy.mockResolvedValue([
                { status: 'draft', count: 5, total: 5000 },
                { status: 'paid', count: 10, total: 10000 },
            ]);

            const result = await invoiceService.getInvoiceStats(1);

            expect(result).toHaveLength(2);
        });
    });

    describe('recordPayment', () => {
        it('should record payment', async () => {
            const payment = { invoiceId: 1, amount: 1100, status: 'pending' };
            mockDb.returning.mockResolvedValue([{ id: 1, ...payment }]);

            const result = await invoiceService.recordPayment(payment as any);

            expect(result.id).toBe(1);
        });

        it('should mark invoice as paid when payment succeeds', async () => {
            const payment = { invoiceId: 1, amount: 1100, status: 'succeeded' };
            mockDb.returning.mockResolvedValue([{ id: 1, ...payment }]);
            mockDb.limit.mockResolvedValue([mockInvoice]);

            const result = await invoiceService.recordPayment(payment as any);

            expect(result.id).toBe(1);
        });
    });

    describe('getInvoicePayments', () => {
        it('should return invoice payments', async () => {
            mockDb.orderBy.mockResolvedValue([{ id: 1, invoiceId: 1, amount: 1100 }]);

            const result = await invoiceService.getInvoicePayments(1);

            expect(result).toHaveLength(1);
        });
    });

    describe('generateShareLink', () => {
        it('should generate share link with token', async () => {
            mockDb.limit.mockResolvedValue([mockInvoice]);
            mockDb.returning.mockResolvedValue([{ ...mockInvoice, publicToken: 'newtoken' }]);

            const result = await invoiceService.generateShareLink(1);

            expect(result.token).toHaveLength(32);
            expect(result.url).toContain('/invoices/public/');
        });
    });
});
