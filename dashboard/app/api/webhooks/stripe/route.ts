import { NextRequest, NextResponse } from 'next/server';
import { storage } from '../../../../../server/storage';
import Stripe from 'stripe';

// Lazy-load Stripe to allow builds without STRIPE_SECRET_KEY
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
      apiVersion: '2025-10-29.clover',
    });
  }
  return _stripe;
}

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature || !webhookSecret) {
      return NextResponse.json(
        { error: 'Missing signature or webhook secret' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      const stripe = getStripe();
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const invoiceId = session.metadata?.invoiceId;

      if (invoiceId) {
        // Find payment record
        const payments = await storage.getInvoicePayments(parseInt(invoiceId));
        const payment = payments.find(p => p.stripePaymentIntentId === session.id);

        if (payment) {
          // Update payment status
          await storage.updateInvoicePayment(payment.id, {
            status: 'succeeded',
            paidAt: new Date(),
          });

          // Update invoice status
          await storage.updateInvoice(parseInt(invoiceId), {
            status: 'paid',
            paidDate: new Date(),
          });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

