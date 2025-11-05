/**
 * API Route: Process Tip Payment
 * POST /api/tips
 */

import { NextRequest, NextResponse } from 'next/server';

interface TipRequestBody {
  creatorId: string;
  amount: number;
  message?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body: TipRequestBody = await req.json();

    console.log('💸 [TIP API] Received tip request:', {
      creatorId: body.creatorId,
      amount: body.amount,
      hasMessage: !!body.message,
    });

    // Validation: Required fields
    if (!body.creatorId || body.amount === undefined || body.amount === null) {
      console.error('❌ [TIP API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          message: 'Les champs creatorId et amount sont requis',
        },
        { status: 400 }
      );
    }

    // Validation: Amount range (same as Zod schema in TipDialog)
    if (body.amount < 1 || body.amount > 1000) {
      console.error('❌ [TIP API] Invalid amount:', body.amount);
      return NextResponse.json(
        {
          success: false,
          message: 'Le montant doit être entre 1€ et 1000€',
        },
        { status: 400 }
      );
    }

    // Validation: Amount must be a number
    if (typeof body.amount !== 'number' || isNaN(body.amount)) {
      console.error('❌ [TIP API] Amount is not a valid number');
      return NextResponse.json(
        {
          success: false,
          message: 'Le montant doit être un nombre valide',
        },
        { status: 400 }
      );
    }

    // Validation: Message length (optional, max 500 chars as per Zod schema)
    if (body.message && body.message.length > 500) {
      console.error('❌ [TIP API] Message too long:', body.message.length);
      return NextResponse.json(
        {
          success: false,
          message: 'Le message ne peut pas dépasser 500 caractères',
        },
        { status: 400 }
      );
    }

    console.log('✅ [TIP API] Validation passed');

    // TODO: Integrate with real payment service (Stripe)
    // For now, simulate payment processing
    console.log('💳 [TIP API] Simulating payment processing...');
    console.log('💸 [TIP API] Payment details:', {
      creatorId: body.creatorId,
      amount: `€${body.amount}`,
      message: body.message || '(no message)',
      timestamp: new Date().toISOString(),
    });

    // Simulate network delay for payment processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock success
    console.log('✅ [TIP API] Payment processed successfully (simulated)');

    return NextResponse.json(
      {
        success: true,
        message: 'Pourboire envoyé avec succès',
        data: {
          tipId: `tip_${Date.now()}`,
          creatorId: body.creatorId,
          amount: body.amount,
          message: body.message,
          processedAt: new Date().toISOString(),
          status: 'completed',
        },
      },
      { status: 200 }
    );

    /* Example with real Stripe integration:

    import Stripe from 'stripe';
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2024-11-20.acacia',
    });

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(body.amount * 100), // Convert to cents
      currency: 'eur',
      metadata: {
        type: 'tip',
        creatorId: body.creatorId,
        message: body.message || '',
      },
    });

    if (!paymentIntent.id) {
      console.error('❌ [TIP API] Stripe payment intent creation failed');
      return NextResponse.json(
        {
          success: false,
          message: 'Erreur lors de la création du paiement',
        },
        { status: 500 }
      );
    }

    console.log('✅ [TIP API] Stripe payment intent created:', paymentIntent.id);

    // Save to database (Prisma)
    // const tip = await prisma.tip.create({
    //   data: {
    //     creatorId: body.creatorId,
    //     amount: body.amount,
    //     message: body.message,
    //     stripePaymentIntentId: paymentIntent.id,
    //     status: 'completed',
    //   },
    // });

    return NextResponse.json(
      {
        success: true,
        message: 'Pourboire traité avec succès',
        data: {
          tipId: paymentIntent.id,
          clientSecret: paymentIntent.client_secret,
          amount: body.amount,
          status: paymentIntent.status,
        },
      },
      { status: 200 }
    );
    */
  } catch (error) {
    console.error('❌ [TIP API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur lors du traitement du pourboire',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// GET method not allowed
export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: 'Method not allowed. Use POST to send tips.',
    },
    { status: 405 }
  );
}
