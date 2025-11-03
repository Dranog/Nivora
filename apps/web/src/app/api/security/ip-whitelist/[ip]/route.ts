import { NextResponse } from 'next/server';

export async function DELETE() {
  // Mock delete - always succeed
  return NextResponse.json({ success: true, message: 'IP removed (mock)' });
}
