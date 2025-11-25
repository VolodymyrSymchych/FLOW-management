'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { FileText, Calendar, DollarSign, CreditCard, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string | null;
  clientEmail: string | null;
  clientAddress: string | null;
  amount: number;
  currency: string;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  status: string;
  issueDate: string;
  dueDate: string | null;
  description: string | null;
  items: string | null;
  notes: string | null;
}

interface Comment {
  id: number;
  authorName: string;
  authorEmail: string;
  comment: string;
  createdAt: string;
}

interface Payment {
  id: number;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function PublicInvoicePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const token = params.token as string;
  const paymentStatus = searchParams.get('payment');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [commentForm, setCommentForm] = useState({ authorName: '', authorEmail: '', comment: '' });
  const [submittingComment, setSubmittingComment] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    if (token) {
      loadInvoice();
    }
  }, [token]);

  const loadInvoice = async () => {
    try {
      const response = await axios.get(`/api/invoices/public/${token}`);
      setInvoice(response.data.invoice);
      setComments(response.data.comments || []);
      setPayments(response.data.payments || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async () => {
    setProcessingPayment(true);
    try {
      const response = await axios.post(`/api/invoices/public/${token}/pay`);
      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to initiate payment');
      setProcessingPayment(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingComment(true);
    try {
      const response = await axios.post(`/api/invoices/public/${token}/comments`, commentForm);
      setComments([response.data.comment, ...comments]);
      setCommentForm({ authorName: '', authorEmail: '', comment: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to submit comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatCurrency = (cents: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const parseItems = (itemsJson: string | null) => {
    if (!itemsJson) return [];
    try {
      return JSON.parse(itemsJson);
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text-primary mb-2">Invoice Not Found</h1>
          <p className="text-text-secondary">{error || 'The invoice you are looking for does not exist or has expired.'}</p>
        </div>
      </div>
    );
  }

  const invoiceItems = parseItems(invoice.items);
  const isPaid = invoice.status === 'paid';
  const isOverdue = invoice.status === 'overdue';

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Payment Status Messages */}
        {paymentStatus === 'success' && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400">Payment successful! Thank you for your payment.</p>
          </div>
        )}
        {paymentStatus === 'cancelled' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center space-x-3">
            <XCircle className="w-5 h-5 text-yellow-400" />
            <p className="text-yellow-400">Payment was cancelled. You can try again anytime.</p>
          </div>
        )}

        {/* Invoice Header */}
        <div className="glass-medium rounded-xl p-8 border border-white/10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">Invoice</h1>
              <p className="text-text-secondary">#{invoice.invoiceNumber}</p>
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold ${
              isPaid ? 'bg-green-500/20 text-green-400' :
              isOverdue ? 'bg-red-500/20 text-red-400' :
              'bg-blue-500/20 text-blue-400'
            }`}>
              {invoice.status.toUpperCase()}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-text-tertiary mb-2">Bill To</h3>
              <p className="text-text-primary font-medium">{invoice.clientName || 'N/A'}</p>
              {invoice.clientEmail && (
                <p className="text-text-secondary text-sm">{invoice.clientEmail}</p>
              )}
              {invoice.clientAddress && (
                <p className="text-text-secondary text-sm mt-2 whitespace-pre-line">{invoice.clientAddress}</p>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2 text-text-secondary mb-2">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Issue Date: {formatDate(invoice.issueDate)}</span>
              </div>
              {invoice.dueDate && (
                <div className="flex items-center space-x-2 text-text-secondary">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Due Date: {formatDate(invoice.dueDate)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Invoice Items */}
        <div className="glass-medium rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-text-primary mb-4">Items</h2>
          <div className="space-y-3">
            {invoiceItems.length > 0 ? (
              <>
                <div className="grid grid-cols-12 gap-4 pb-2 border-b border-white/10 text-sm font-medium text-text-tertiary">
                  <div className="col-span-6">Description</div>
                  <div className="col-span-2 text-right">Quantity</div>
                  <div className="col-span-2 text-right">Price</div>
                  <div className="col-span-2 text-right">Total</div>
                </div>
                {invoiceItems.map((item: any, index: number) => (
                  <div key={index} className="grid grid-cols-12 gap-4 py-2 text-sm">
                    <div className="col-span-6 text-text-primary">{item.description || 'Item'}</div>
                    <div className="col-span-2 text-right text-text-secondary">{item.quantity || 1}</div>
                    <div className="col-span-2 text-right text-text-secondary">
                      {formatCurrency(item.price || 0, invoice.currency)}
                    </div>
                    <div className="col-span-2 text-right text-text-primary font-medium">
                      {formatCurrency((item.price || 0) * (item.quantity || 1), invoice.currency)}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <p className="text-text-secondary">{invoice.description || 'No items listed'}</p>
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 pt-6 border-t border-white/10 space-y-2">
            <div className="flex justify-between text-text-secondary">
              <span>Subtotal:</span>
              <span>{formatCurrency(invoice.amount, invoice.currency)}</span>
            </div>
            {invoice.taxRate > 0 && (
              <div className="flex justify-between text-text-secondary">
                <span>Tax ({invoice.taxRate}%):</span>
                <span>{formatCurrency(invoice.taxAmount, invoice.currency)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold text-text-primary pt-2">
              <span>Total:</span>
              <span>{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        {!isPaid && (
          <div className="glass-medium rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
              <CreditCard className="w-5 h-5" />
              <span>Pay Invoice</span>
            </h2>
            <p className="text-text-secondary mb-4">
              Pay securely using Stripe. Your payment will be processed immediately.
            </p>
            <button
              onClick={handlePayInvoice}
              disabled={processingPayment}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4" />
                  <span>Pay {formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Payment History */}
        {payments.length > 0 && (
          <div className="glass-medium rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-text-primary mb-4">Payment History</h2>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-text-primary font-medium">
                      {formatCurrency(payment.amount, payment.currency)}
                    </p>
                    <p className="text-xs text-text-tertiary">
                      {payment.paidAt ? formatDate(payment.paidAt) : 'Pending'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded text-xs font-medium ${
                    payment.status === 'succeeded' ? 'bg-green-500/20 text-green-400' :
                    payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {payment.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="glass-medium rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>Comments</span>
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Your Name"
                value={commentForm.authorName}
                onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary placeholder:text-text-tertiary"
                required
              />
              <input
                type="email"
                placeholder="Your Email"
                value={commentForm.authorEmail}
                onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                className="px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary placeholder:text-text-tertiary"
                required
              />
            </div>
            <textarea
              placeholder="Add a comment or question..."
              value={commentForm.comment}
              onChange={(e) => setCommentForm({ ...commentForm, comment: e.target.value })}
              className="w-full px-4 py-2 rounded-lg glass-medium border border-white/10 text-text-primary placeholder:text-text-tertiary"
              rows={3}
              required
            />
            <button
              type="submit"
              disabled={submittingComment}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
            >
              {submittingComment ? 'Submitting...' : 'Submit Comment'}
            </button>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-text-tertiary text-center py-4">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-text-primary">{comment.authorName}</p>
                    <p className="text-xs text-text-tertiary">{formatDate(comment.createdAt)}</p>
                  </div>
                  <p className="text-text-secondary">{comment.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="glass-medium rounded-xl p-6 border border-white/10">
            <h2 className="text-lg font-bold text-text-primary mb-2">Notes</h2>
            <p className="text-text-secondary whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

