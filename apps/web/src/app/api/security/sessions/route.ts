import { NextResponse } from 'next/server';

export async function GET() {
  // Mock session logs
  const mockSessions = [
    {
      id: '1',
      event: 'LOGIN',
      userId: 'admin-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date().toISOString(),
      success: true,
      device: 'Desktop',
      location: 'Local',
    },
    {
      id: '2',
      event: '2FA_VERIFY',
      userId: 'admin-1',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      success: true,
      device: 'Desktop',
      location: 'Local',
    },
  ];

  return NextResponse.json({
    sessions: mockSessions,
    total: mockSessions.length,
  });
}
