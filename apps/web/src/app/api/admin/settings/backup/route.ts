// path: src/app/api/admin/settings/backup/route.ts
import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

export async function GET() {
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    return new NextResponse(raw, {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `attachment; filename="settings-backup-${new Date().toISOString().slice(0,10)}.json"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Impossible de lire le backup' }, { status: 500 });
  }
}
