// path: src/app/api/admin/system/route.ts
import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const pkgPath = path.join(process.cwd(), 'package.json');
    const pkgRaw = await fs.readFile(pkgPath, 'utf8');
    const pkg = JSON.parse(pkgRaw);
    const version = pkg?.version ?? '0.0.0';

    const now = new Date().toISOString();

    return NextResponse.json({
      version,
      node: process.version,
      time: now,
      env: process.env.NODE_ENV ?? 'development',
      sendgridConfigured: Boolean(process.env.SENDGRID_API_KEY),
    }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur système' }, { status: 500 });
  }
}
