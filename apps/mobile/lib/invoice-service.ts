/**
 * Invoice Service API Client for Mobile
 */

import axios from 'axios';

const INVOICE_SERVICE_URL = process.env.EXPO_PUBLIC_INVOICE_SERVICE_URL || 'https://flow-invoice-service.vercel.app';

console.log('Invoice Service URL:', INVOICE_SERVICE_URL);

const api = axios.create({
    baseURL: INVOICE_SERVICE_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Service-API-Key': process.env.EXPO_PUBLIC_INVOICE_SERVICE_API_KEY || '',
    },
    timeout: 10000,
});

api.interceptors.request.use(
    (config) => {
        return config;
    },
    (error) => {
        console.error('[InvoiceService] Request error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        console.error('[InvoiceService] Response error:', error.response?.status, error.message);
        return Promise.reject(error);
    }
);

export const invoiceService = {
    /**
     * Get invoice by ID
     */
    async getInvoice(token: string, invoiceId: number): Promise<{ invoice?: any; error?: string }> {
        try {
            const response = await api.get(`/api/invoices/${invoiceId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice',
            };
        }
    },

    /**
     * Get public invoice by token (no auth required)
     */
    async getPublicInvoice(token: string): Promise<{ invoice?: any; error?: string }> {
        try {
            const response = await api.get(`/api/invoices/public/${token}`);
            return { invoice: response.data.invoice };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice',
            };
        }
    },

    /**
     * Get project invoices
     */
    async getProjectInvoices(
        token: string,
        projectId: number,
        options?: {
            limit?: number;
            offset?: number;
            status?: string;
        }
    ): Promise<{ invoices?: any[]; limit?: number; offset?: number; error?: string }> {
        try {
            const params = new URLSearchParams();
            if (options?.limit) params.append('limit', options.limit.toString());
            if (options?.offset) params.append('offset', options.offset.toString());
            if (options?.status) params.append('status', options.status);

            const response = await api.get(
                `/api/invoices/project/${projectId}?${params.toString()}`,
                { headers: { Authorization: `Bearer ${token}` } }
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
    },

    /**
     * Get invoice statistics for project
     */
    async getInvoiceStats(token: string, projectId: number): Promise<{ stats?: any; error?: string }> {
        try {
            const response = await api.get(`/api/invoices/project/${projectId}/stats`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { stats: response.data.stats };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice stats',
            };
        }
    },

    /**
     * Get overdue invoices
     */
    async getOverdueInvoices(token: string, projectId?: number): Promise<{ invoices?: any[]; error?: string }> {
        try {
            const params = projectId ? `?projectId=${projectId}` : '';
            const response = await api.get(`/api/invoices/overdue${params}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { invoices: response.data.invoices };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get overdue invoices',
            };
        }
    },

    /**
     * Get invoice payments
     */
    async getInvoicePayments(token: string, invoiceId: number): Promise<{ payments?: any[]; error?: string }> {
        try {
            const response = await api.get(`/api/invoices/${invoiceId}/payments`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            return { payments: response.data.payments };
        } catch (error: any) {
            return {
                error: error.response?.data?.error || error.message || 'Failed to get invoice payments',
            };
        }
    },
};
