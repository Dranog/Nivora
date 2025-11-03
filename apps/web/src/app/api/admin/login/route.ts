// apps/web/src/app/api/admin/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes, createHash } from "crypto";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().email().min(6).max(120),
  password: z.string().min(8).max(128),
});

const DEMO_EMAIL = process.env.ADMIN_DEMO_EMAIL ?? "admin@oliver.test";
const DEMO_PASSWORD = process.env.ADMIN_DEMO_PASSWORD ?? "Admin1234!";
const SESSION_COOKIE = "oliver_admin_sid";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

function hash(s: string): string {
  return createHash("sha256").update(s).digest("hex");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ message: "Payload invalide" }, { status: 400 });

  const { email, password } = parsed.data;
  const ok = email.toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD;
  if (!ok) return NextResponse.json({ message: "Identifiants invalides" }, { status: 401 });

  const sid = `${hash(email)}.${randomBytes(16).toString("hex")}.${Date.now()}`;
  const token = randomBytes(24).toString("hex");

  const res = NextResponse.json({
    access_token: token,
    user: { id: "admin-demo", email: DEMO_EMAIL, role: "ADMIN", name: "Oliver Admin", avatarUrl: null },
  });
  res.cookies.set({ name: SESSION_COOKIE, value: sid, httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: SESSION_TTL_SECONDS });
  return res;
}
