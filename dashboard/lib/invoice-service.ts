import axios, { AxiosInstance } from 'axios';

const INVOICE_SERVICE_URL = process.env.NEXT_PUBLIC_INVOICE_SERVICE_URL || 'http://localhost:3005';

class InvoiceServiceClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: INVOICE_SERVICE_URL,
            timeout: 10000,
            withCredentials: true,
        });
    }

    private async getAuthToken(): Promise<string | null> {
        if (typeof document !== 'undefined') {
            // Client-side: cookies are automatically sent with withCredentials: true
            return null;
        }
        // Server-side: get from cookies
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            return cookieStore.get('auth_token')?.value || null;
        } catch (error) {
            // If cookies() fails (e.g., in middleware), return null
            return null;
        }
    }

    private async getHeaders(): Promise<Record<string, string>> {
        const headers: Record<string, string> = {};

        // Add user JWT token (for user authentication)
        const token = await this.getAuthToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        // Add service API key (for service-to-service authentication, server-side only)
        if (typeof window === 'undefined') {
            const serviceApiKey = process.env.INVOICE_SERVICE_API_KEY;
            if (serviceApiKey) {
                headers['X-Service-API-Key'] = serviceApiKey;
            }
        }

        return headers;
    }

    /**
     * Create invoice
     */
    async createInvoice(data: {
        projectId: number;
        clientName?: string;
        clientEmail?: string;
        clientAddress?: string;
        amount: number;
        currency?: string;
        taxRate?: number;
        issueDate: string;
        dueDate?: string;
        description?: string;
        items?: string;
        notes?: string;
    }): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.post('/api/invoices', data, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to create invoice',
            };
        }
    }

    /**
     * Get invoice by ID
     */
    async getInvoice(invoiceId: number): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/invoices/${invoiceId}`, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice',
            };
        }
    }

    /**
     * Get invoice by invoice number
     */
    async getInvoiceByNumber(invoiceNumber: string): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/invoices/number/${invoiceNumber}`, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice',
            };
        }
    }

    /**
     * Get public invoice by token (no auth required)
     */
    async getPublicInvoice(token: string): Promise<{ invoice?: any; error?: string }> {
        try {
            const response = await this.client.get(`/api/invoices/public/${token}`);
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice',
            };
        }
    }

    /**
     * Get project invoices
     */
    async getProjectInvoices(
        projectId: number,
        options?: {
            limit?: number;
            offset?: number;
            status?: string;
        }
    ): Promise<{ invoices?: any[]; limit?: number; offset?: number; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.offset) params.append('offset', options.offset.toString());
            if (options?.status) params.append('status', options.status);

            const response = await this.client.get(
                `/api/invoices/project/${projectId}?${params.toString()}`,
                { headers }
            );
            return {
                invoices: response.data.invoices,
                limit: response.data.limit,
                offset: response.data.offset,
            };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get project invoices',
            };
        }
    }

    /**
     * Get invoice statistics for project
     */
    async getInvoiceStats(projectId: number): Promise<{ stats?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/invoices/project/${projectId}/stats`, { headers });
            return { stats: response.data.stats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice stats',
            };
        }
    }

    /**
     * Update invoice
     */
    async updateInvoice(
        invoiceId: number,
        data: {
            clientName?: string;
            clientEmail?: string;
            clientAddress?: string;
            amount?: number;
            taxRate?: number;
            status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
            dueDate?: string;
            paidDate?: string;
            description?: string;
            items?: string;
            notes?: string;
        }
    ): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(`/api/invoices/${invoiceId}`, data, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to update invoice',
            };
        }
    }

    /**
     * Mark invoice as sent
     */
    async markAsSent(invoiceId: number): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(`/api/invoices/${invoiceId}/sent`, {}, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to mark invoice as sent',
            };
        }
    }

    /**
     * Mark invoice as paid
     */
    async markAsPaid(
        invoiceId: number,
        paidDate?: string
    ): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(
                `/api/invoices/${invoiceId}/paid`,
                { paidDate },
                { headers }
            );
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to mark invoice as paid',
            };
        }
    }

    /**
     * Cancel invoice
     */
    async cancelInvoice(invoiceId: number): Promise<{ invoice?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.put(`/api/invoices/${invoiceId}/cancel`, {}, { headers });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to cancel invoice',
            };
        }
    }

    /**
     * Generate share link for invoice
     */
    async generateShareLink(
        invoiceId: number,
        expiresInDays: number = 30
    ): Promise<{ token?: string; url?: string; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.post(
                `/api/invoices/${invoiceId}/share`,
                { expiresInDays },
                { headers }
            );
            return { token: response.data.token, url: response.data.url };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to generate share link',
            };
        }
    }

    /**
     * Delete invoice
     */
    async deleteInvoice(invoiceId: number): Promise<{ error?: string }> {
        try {
            const headers = await this.getHeaders();
            await this.client.delete(`/api/invoices/${invoiceId}`, { headers });
            return {};
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to delete invoice',
            };
        }
    }

    /**
     * Get overdue invoices
     */
    async getOverdueInvoices(projectId?: number): Promise<{ invoices?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const params = projectId ? `?projectId=${projectId}` : '';
            const response = await this.client.get(`/api/invoices/overdue${params}`, { headers });
            return { invoices: response.data.invoices };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get overdue invoices',
            };
        }
    }

    /**
     * Record payment for invoice
     */
    async recordPayment(
        invoiceId: number,
        data: {
            amount: number;
            currency?: string;
            stripePaymentIntentId?: string;
            status?: 'pending' | 'succeeded' | 'failed';
        }
    ): Promise<{ payment?: any; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.post(`/api/invoices/${invoiceId}/payments`, data, { headers });
            return { payment: response.data.payment };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to record payment',
            };
        }
    }

    /**
     * Get invoice payments
     */
    async getInvoicePayments(invoiceId: number): Promise<{ payments?: any[]; error?: string }> {
        try {
            const headers = await this.getHeaders();
            const response = await this.client.get(`/api/invoices/${invoiceId}/payments`, { headers });
            return { payments: response.data.payments };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice payments',
            };
        }
    }
}

export const invoiceService = new InvoiceServiceClient();
