import { adjustUserCreditBalance } from '@/services/user/userService';
import { PurchaseOption } from 'fixitpdf-shared';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

// Type for the expected event payload
type StripeWebhookEvent =
  | {
    type: 'checkout.session.completed';
    data: { object: Stripe.Checkout.Session };
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { type: string; data: { object: any } };

// Webhook Secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const DEV_PURCHASE_OPTIONS: PurchaseOption[] = [
  { id: '1', priceId: 'price_1QMNctRqb2FjfvrJPVvvz5oD', credits: 5, price: 5, tagline: "Perfect to try things out (test)" },
  { id: '2', priceId: 'price_1QMNdhRqb2FjfvrJwvlxVOhu', credits: 15, price: 10, tagline: "Save 33%" },
  { id: '3', priceId: 'price_1QMNeVRqb2FjfvrJVETcL24d', credits: 35, price: 20, tagline: "Save 43%" },
  { id: '4', priceId: 'price_1QMNf6Rqb2FjfvrJrJaOXGOy', credits: 100, price: 50, tagline: "Best value! Save 50%" },
];

const PROD_PURCHASE_OPTIONS: PurchaseOption[] = [
  { id: '1', priceId: 'price_1QMNctRqb2FjfvrJPVvvz5oD', credits: 5, price: 5, tagline: "Perfect to try things out" },
  { id: '2', priceId: 'price_1QMNdhRqb2FjfvrJwvlxVOhu', credits: 15, price: 10, tagline: "Save 33%" },
  { id: '3', priceId: 'price_1QMNeVRqb2FjfvrJVETcL24d', credits: 35, price: 20, tagline: "Save 43%" },
  { id: '4', priceId: 'price_1QMNf6Rqb2FjfvrJrJaOXGOy', credits: 100, price: 50, tagline: "Best value! Save 50%" },
];

const priceIdToPurchaseOption = (priceId: string): PurchaseOption | undefined => {
  return DEV_PURCHASE_OPTIONS.concat(PROD_PURCHASE_OPTIONS).find((option) => option.priceId === priceId);
}

/**
 * Fulfills a users order by debiting their credit balance based on the priceId.
 * 
 * @param sessionId 
 * @param userId 
 * @param priceId 
 */
const fulfillUserOrder = async (sessionId: string, userId: string, priceId: string) => {
  console.log(`Fulfilling order (${sessionId}) for user ${userId} with priceId ${priceId}...`);

  const purchaseOption = priceIdToPurchaseOption(priceId);

  if (!purchaseOption) {
    throw new Error(`No purchase option found for priceId ${priceId}`);
  }

  // TODO 17Nov24: Add idempotency key here...
  await adjustUserCreditBalance(userId, purchaseOption.credits, `Fulfilled checkout session ${sessionId}`);
}

/**
 * POST /api/webhooks/stripe
 * 
 * Stripe webhook handler.
 * 
 * @param req 
 * @returns 
 */
export async function POST(req: NextRequest) {
  // Read raw body to verify webhook signature
  const rawBody = await req.text();
  const sig = req.headers.get('stripe-signature');

  if (!sig) {
    console.error('Missing Stripe signature header');
    return NextResponse.json({ error: 'Missing Stripe signature header' }, { status: 400 });
  }

  let event: StripeWebhookEvent;

  try {
    // Verify webhook signature and parse the event
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      endpointSecret
    ) as StripeWebhookEvent;
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the Stripe event
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      
      console.log(`Checkout session ${session.id} completed:`, session);
      console.log(`Metadata:`, session.metadata);
      // Fulfill the order based on the session
      const metadata = session.metadata;

      // Example: Fulfill credits for a user based on metadata
      if (metadata?.userId && metadata?.priceId) {
        console.log(`Fulfilling order for user ${metadata.userId} with priceId ${metadata.priceId}`);

        const { userId, priceId } = metadata;

        // Add credits to the users account
        await fulfillUserOrder(session.id, userId, priceId);
      } else {
        throw new Error(`Checkout session ${session.id} event did not include needed metadata`);
      }
    } else {
      // Fine to ignore for now
      console.warn(`Unhandled event type: ${event.type}`);
    }
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    return NextResponse.json({ error: 'Error processing webhook' }, { status: 500 });
  }
}