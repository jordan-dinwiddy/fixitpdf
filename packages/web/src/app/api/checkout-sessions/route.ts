import { authOptions } from '@/lib/auth';
import { CreateCheckoutSessionsRequest, CreateCheckoutSessionsResponse } from 'fixitpdf-shared';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Stripe Initialization
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

/**
 * Create a checkout session
 * 
 * POST /api/checkout-sessions
 * 
 * {
 *   "priceId": ""
 * }
 * 
 * @param req 
 * @param param1 
 * @returns 
 */
export async function POST(
  req: NextRequest
): Promise<NextResponse<CreateCheckoutSessionsResponse>> {
  const body: CreateCheckoutSessionsRequest = await req.json();

  const session = await getServerSession(authOptions);

  // If the user is not authenticated, return a 401 Unauthorized response
  if (!session || !session.user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // Validate the incoming data
  if (!body.priceId) {
    return NextResponse.json({ success: false, error: 'Missing priceId in request body' }, { status: 400 });
  }

  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'], // Supports Apple Pay, Google Pay, etc.
      line_items: [
        {
          price: body.priceId,
          quantity: 1,
        },
      ],
      mode: 'payment', // One-time payment
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/?payment=cancelled`,
      metadata: {
        userId: session.userId,
      },
    });

    return NextResponse.json({ success: true, data: { url: checkoutSession.url! }});
  } catch (error) {
    console.error('Error creating checkout session', error);
    return NextResponse.json({ success: false, error: 'Error creating checkout session' }, { status: 500 });
  }
}

