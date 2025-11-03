// path: src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import * as fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type Settings = {
  // Core
  siteName: string;
  supportEmail: string;
  minPasswordLength: number;     // 8..128
  platformFeePct: number;        // 0..100
  enableRegistrations: boolean;
  defaultRole: 'User' | 'Creator';
  defaultUserAvatar: string;     // URL http(s) ou dataURL

  // Sécurité
  enforceAdmin2FA: boolean;
  lockoutThreshold: number;      // 3..20
  lockoutWindowMin: number;      // 1..120 (fenêtre de calcul)
  lockoutDurationMin: number;    // 5..1440 (durée de blocage)

  // UI / Branding
  primaryColor: string;          // hex #RRGGBB
  logoUrl: string;               // URL http(s) ou dataURL
  faviconUrl: string;            // URL http(s) ou dataURL

  // Notifications / Emails
  sendgridEnabled: boolean;
  sendgridFromEmail: string;
};

const DEFAULT_SETTINGS: Settings = {
  // Core
  siteName: 'Oliver Platform',
  supportEmail: 'support@oliver.app',
  minPasswordLength: 12,
  platformFeePct: 10,
  enableRegistrations: true,
  defaultRole: 'User',
  defaultUserAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Default',

  // Sécurité
  enforceAdmin2FA: true,
  lockoutThreshold: 5,
  lockoutWindowMin: 15,
  lockoutDurationMin: 30,

  // UI / Branding
  primaryColor: '#00B8A9',
  logoUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Oliver',
  faviconUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=Favicon',

  // Notifications
  sendgridEnabled: false,
  sendgridFromEmail: 'no-reply@oliver.app',
};

const DATA_DIR = path.join(process.cwd(), 'data');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function noStoreHeaders() {
  return {
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'application/json; charset=utf-8',
  };
}

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(SETTINGS_FILE);
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
  }
}

async function readSettings(): Promise<Settings> {
  await ensureFile();
  try {
    const raw = await fs.readFile(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf8');
    return { ...DEFAULT_SETTINGS };
  }
}

function isHttpUrl(v: string) {
  return /^https?:\/\/.+/i.test(v);
}
function isDataImage(v: string) {
  return /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(v);
}
function isValidImageValue(v: string) {
  return isHttpUrl(v) || isDataImage(v);
}

function validate(payload: any): { ok: true; data: Settings } | { ok: false; error: string } {
  const data: Settings = {
    siteName: String(payload?.siteName ?? ''),
    supportEmail: String(payload?.supportEmail ?? ''),
    minPasswordLength: Number(payload?.minPasswordLength),
    platformFeePct: Number(payload?.platformFeePct),
    enableRegistrations: Boolean(payload?.enableRegistrations),
    defaultRole: payload?.defaultRole === 'Creator' ? 'Creator' : 'User',
    defaultUserAvatar: String(payload?.defaultUserAvatar ?? ''),

    enforceAdmin2FA: Boolean(payload?.enforceAdmin2FA),
    lockoutThreshold: Number(payload?.lockoutThreshold),
    lockoutWindowMin: Number(payload?.lockoutWindowMin),
    lockoutDurationMin: Number(payload?.lockoutDurationMin),

    primaryColor: String(payload?.primaryColor ?? ''),
    logoUrl: String(payload?.logoUrl ?? ''),
    faviconUrl: String(payload?.faviconUrl ?? ''),

    sendgridEnabled: Boolean(payload?.sendgridEnabled),
    sendgridFromEmail: String(payload?.sendgridFromEmail ?? ''),
  };

  if (!data.siteName || data.siteName.trim().length < 2) {
    return { ok: false, error: 'Le nom du site doit contenir au moins 2 caractères.' };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.supportEmail)) {
    return { ok: false, error: "L'email support est invalide." };
  }
  if (!Number.isFinite(data.minPasswordLength) || data.minPasswordLength < 8 || data.minPasswordLength > 128) {
    return { ok: false, error: 'La longueur minimale du mot de passe doit être comprise entre 8 et 128.' };
  }
  if (!Number.isFinite(data.platformFeePct) || data.platformFeePct < 0 || data.platformFeePct > 100) {
    return { ok: false, error: 'Le pourcentage de frais doit être entre 0 et 100.' };
  }
  if (!data.defaultUserAvatar || !isValidImageValue(data.defaultUserAvatar)) {
    return { ok: false, error: "Avatar par défaut invalide (URL http(s) ou dataURL image)." };
  }

  if (!Number.isFinite(data.lockoutThreshold) || data.lockoutThreshold < 3 || data.lockoutThreshold > 20) {
    return { ok: false, error: "Seuil de verrouillage invalide (3–20)." };
  }
  if (!Number.isFinite(data.lockoutWindowMin) || data.lockoutWindowMin < 1 || data.lockoutWindowMin > 120) {
    return { ok: false, error: "Fenêtre d'analyse invalide (1–120 minutes)." };
  }
  if (!Number.isFinite(data.lockoutDurationMin) || data.lockoutDurationMin < 5 || data.lockoutDurationMin > 1440) {
    return { ok: false, error: "Durée de verrouillage invalide (5–1440 minutes)." };
  }

  if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(data.primaryColor)) {
    return { ok: false, error: 'Couleur primaire invalide (format hex, ex: #00B8A9).' };
  }
  if (!data.logoUrl || !isValidImageValue(data.logoUrl)) {
    return { ok: false, error: 'Logo invalide (URL http(s) ou dataURL image).' };
  }
  if (!data.faviconUrl || !isValidImageValue(data.faviconUrl)) {
    return { ok: false, error: 'Favicon invalide (URL http(s) ou dataURL image).' };
  }

  if (data.sendgridEnabled) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.sendgridFromEmail)) {
      return { ok: false, error: "Email d'expéditeur SendGrid invalide." };
    }
  }

  if (data.defaultUserAvatar.startsWith('data:image')) {
    const approxBytes = Math.ceil((data.defaultUserAvatar.length * 3) / 4);
    if (approxBytes > 2 * 1024 * 1024) {
      return { ok: false, error: "L'avatar encodé dépasse 2 Mo." };
    }
  }
  if (data.logoUrl.startsWith('data:image')) {
    const approxBytes = Math.ceil((data.logoUrl.length * 3) / 4);
    if (approxBytes > 2 * 1024 * 1024) {
      return { ok: false, error: 'Le logo encodé dépasse 2 Mo.' };
    }
  }
  if (data.faviconUrl.startsWith('data:image')) {
    const approxBytes = Math.ceil((data.faviconUrl.length * 3) / 4);
    if (approxBytes > 1 * 1024 * 1024) {
      return { ok: false, error: 'Le favicon encodé dépasse 1 Mo.' };
    }
  }

  return { ok: true, data };
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings, { status: 200, headers: noStoreHeaders() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur serveur' }, { status: 500, headers: noStoreHeaders() });
  }
}

export async function PUT(req: Request) {
  try {
    const payload = await req.json();
    const v = validate(payload);
    if (!v.ok) {
      return NextResponse.json({ error: v.error }, { status: 400, headers: noStoreHeaders() });
    }
    await ensureFile();
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(v.data, null, 2), 'utf8');
    return NextResponse.json(v.data, { status: 200, headers: noStoreHeaders() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur serveur' }, { status: 500, headers: noStoreHeaders() });
  }
}

// POST utilisé pour des actions utilitaires (ex: test email)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (body?.action === 'testEmail') {
      const apiKey = process.env.SENDGRID_API_KEY ?? '';
      if (!apiKey) {
        return NextResponse.json(
          { ok: false, error: 'SENDGRID_API_KEY manquant côté serveur.' },
          { status: 400, headers: noStoreHeaders() },
        );
      }
      // En dev: on ne déclenche pas d’envoi réel. On valide la config.
      return NextResponse.json({ ok: true, message: 'Configuration SendGrid OK (simulation).' }, { status: 200, headers: noStoreHeaders() });
    }
    return NextResponse.json({ error: 'Action invalide.' }, { status: 400, headers: noStoreHeaders() });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'Erreur serveur' }, { status: 500, headers: noStoreHeaders() });
  }
}
