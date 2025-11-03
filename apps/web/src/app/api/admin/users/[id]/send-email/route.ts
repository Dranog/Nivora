/**
 * API Route: Send Email to User
 * POST /api/admin/users/:id/send-email
 */

import { NextRequest, NextResponse } from 'next/server';

interface SendEmailBody {
  to: string;
  subject: string;
  message: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body: SendEmailBody = await req.json();

    console.log('📧 [EMAIL API] Received email request:', {
      userId,
      to: body.to,
      subject: body.subject,
      messageLength: body.message?.length,
    });

    // Validation
    if (!body.to || !body.subject || !body.message) {
      console.error('❌ [EMAIL API] Missing required fields');
      return NextResponse.json(
        {
          success: false,
          message: 'Tous les champs sont requis (to, subject, message)',
        },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.to)) {
      console.error('❌ [EMAIL API] Invalid email format:', body.to);
      return NextResponse.json(
        {
          success: false,
          message: 'Format d\'email invalide',
        },
        { status: 400 }
      );
    }

    console.log('✅ [EMAIL API] Validation passed');

    // TODO: Integrate with real email service (Resend, SendGrid, etc.)
    // For now, simulate email sending
    console.log('📤 [EMAIL API] Simulating email send...');
    console.log('📧 [EMAIL API] Email details:', {
      from: 'admin@oliver.com',
      to: body.to,
      subject: body.subject,
      message: body.message.substring(0, 100) + '...',
    });

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock success
    console.log('✅ [EMAIL API] Email sent successfully (simulated)');

    return NextResponse.json(
      {
        success: true,
        message: 'Email envoyé avec succès',
        data: {
          emailId: `email_${Date.now()}`,
          sentAt: new Date().toISOString(),
          to: body.to,
        },
      },
      { status: 200 }
    );

    /* Example with real email service (Resend):

    import { Resend } from 'resend';
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: 'admin@oliver.com',
      to: body.to,
      subject: body.subject,
      text: body.message,
      html: `<p>${body.message.replace(/\n/g, '<br>')}</p>`,
    });

    if (error) {
      console.error('❌ [EMAIL API] Resend error:', error);
      return NextResponse.json(
        {
          success: false,
          message: 'Erreur lors de l\'envoi de l\'email',
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log('✅ [EMAIL API] Email sent via Resend:', data);

    return NextResponse.json(
      {
        success: true,
        message: 'Email envoyé avec succès',
        data,
      },
      { status: 200 }
    );
    */
  } catch (error) {
    console.error('❌ [EMAIL API] Unexpected error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Erreur serveur',
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
      message: 'Method not allowed. Use POST to send emails.',
    },
    { status: 405 }
  );
}
