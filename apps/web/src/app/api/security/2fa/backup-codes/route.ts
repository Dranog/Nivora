import { NextResponse } from 'next/server';

export async function POST() {
  // Generate 8 mock backup codes
  const codes = Array.from({ length: 8 }, (_, i) =>
    `MOCK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
  );

  return NextResponse.json({
    codes,
    message: 'Backup codes generated (mock)',
  });
}
