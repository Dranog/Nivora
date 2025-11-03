import { NextResponse } from 'next/server';

// In-memory store for demo (would be database in production)
let ipWhitelist: Array<{ ipAddress: string; description: string; addedAt: string }> = [
  {
    ipAddress: '127.0.0.1',
    description: 'Localhost',
    addedAt: new Date().toISOString(),
  },
];

export async function GET() {
  return NextResponse.json({ ips: ipWhitelist });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ipAddress, description } = body;

    if (!ipAddress) {
      return NextResponse.json({ error: 'IP address required' }, { status: 400 });
    }

    const newEntry = {
      ipAddress,
      description: description || '',
      addedAt: new Date().toISOString(),
    };

    ipWhitelist.push(newEntry);

    return NextResponse.json({ success: true, ip: newEntry });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
