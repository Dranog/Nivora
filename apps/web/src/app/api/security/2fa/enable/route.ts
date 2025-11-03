import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Mock enable - verify token format
    if (!token || !/^\d{6}$/.test(token)) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '2FA enabled successfully (mock)',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
