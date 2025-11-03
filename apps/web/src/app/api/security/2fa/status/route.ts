import { NextResponse } from 'next/server';

export async function GET() {
  // Mock data - 2FA disabled by default
  return NextResponse.json({ enabled: false });
}
