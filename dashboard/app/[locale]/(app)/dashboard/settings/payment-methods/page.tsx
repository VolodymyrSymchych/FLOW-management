'use client';

import { useState } from 'react';
import { CreditCard, Plus, Trash2, Check, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PaymentMethod {
  id: string;
  type: 'card';
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function PaymentMethodsPage() {
  const router = useRouter();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expMonth: 12,
      expYear: 2025,
      isDefault: true,
    },
    {
      id: '2',
      type: 'card',
      last4: '5555',
      brand: 'Mastercard',
      expMonth: 6,
      expYear: 2026,
      isDefault: false,
    },
  ]);

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev =>
      prev.map(pm => ({ ...pm, isDefault: pm.id === id }))
    );
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment method?')) {
      setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
    }
  };

  const getCardIcon = (brand: string) => {
    const icons: Record<string, string> = {
      Visa: '💳',
      Mastercard: '💳',
      Amex: '💳',
      Discover: '💳',
    };
    return icons[brand] || '💳';
  };

  return (
    <div className="scr-inner" data-testid="payment-methods-screen">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <div style={{ padding: '20px 28px 14px', borderBottom: '1px solid var(--line)', background: 'var(--white)', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard/settings')}
            className="ib"
            aria-label="Back to settings"
          >
            <ArrowLeft style={{ width: 16, height: 16 }} />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-inter), Inter, sans-serif', fontSize: 26, fontWeight: 600, color: 'var(--ink)', letterSpacing: '-.02em', margin: 0 }}>Payment Methods</h1>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginTop: 2 }}>Manage your payment methods and billing information</div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px 40px', maxWidth: 640 }}>
          <button
            type="button"
            className="proj-card proj-card-new"
            style={{ marginBottom: 20 }}
          >
            <Plus style={{ width: 24, height: 24, color: 'var(--ghost)' }} />
            <span style={{ fontSize: 14, color: 'var(--faint)', marginTop: 6 }}>Add New Payment Method</span>
          </button>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="surface-panel"
                style={{ borderRadius: 12, padding: 20, border: '1px solid var(--line)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--violet-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                      {getCardIcon(method.brand)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)' }}>
                          {method.brand} •••• {method.last4}
                        </span>
                        {method.isDefault && (
                          <span className="tg tg-vi" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Check style={{ width: 10, height: 10 }} />
                            Default
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                        Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {!method.isDefault && (
                      <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set as Default
                      </button>
                    )}
                    <button
                      type="button"
                      className="ib"
                      onClick={() => handleDelete(method.id)}
                      disabled={method.isDefault}
                      title={method.isDefault ? 'Cannot delete default payment method' : 'Delete'}
                      style={method.isDefault ? { opacity: 0.5, cursor: 'not-allowed' } : { color: 'var(--red)' }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="surface-panel" style={{ borderRadius: 12, padding: 20, border: '1px solid var(--line)', marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--sage-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>🔒</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>Secure Payment Processing</div>
                <div style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                  All payment information is encrypted and securely processed by Stripe.
                  We never store your complete card details on our servers.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

