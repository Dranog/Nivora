import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Mock verification - accept any 6-digit code for demo
    const isValid = token && /^\d{6}$/.test(token);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
