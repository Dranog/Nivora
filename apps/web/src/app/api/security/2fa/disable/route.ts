import { NextResponse } from 'next/server';

export async function POST() {
  // Mock disable
  return NextResponse.json({
    success: true,
    message: '2FA disabled successfully (mock)',
  });
}
