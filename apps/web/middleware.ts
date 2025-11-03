// apps/web/middleware.ts
/**
 * F1 Shell SPA — Auth & RBAC middleware + i18n (messages policy included)
 * - Detects locale from IP/Accept-Language, persists in cookie
 * - Public routes pass
 * - /creator/messages: CREATOR only (onboarding not required)
 * - /fan/messages: FAN or CREATOR (onboarding not required)
 * - Other protected routes: auth + onboarding + role guard
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

type Role = 'fan' | 'creator' | 'admin' | null;

interface PersistState {
  isAuthenticated: boolean;
  role: Role;
  onboardingDone: boolean;
  userId: string | null;
}
interface AuthState {
  state: PersistState;
}

const SESSION_COOKIE = 'oliver_admin_sid';
const PERSIST_COOKIE = 'auth-storage';

// i18n Configuration
const COUNTRY_TO_LOCALE: Record<string, string> = {
  FR: 'fr',
  ES: 'es',
  DE: 'de',
  GB: 'en',
  US: 'en',
  CA: 'en',
  MX: 'es',
  AR: 'es',
  CL: 'es',
  CO: 'es',
  PE: 'es',
  AT: 'de',
  CH: 'de',
};

const intlMiddleware = createIntlMiddleware({
  locales: ['en', 'fr', 'es', 'de'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
});

async function detectLocaleFromIP(request: NextRequest): Promise<string> {
  try {
    // Vercel Edge provides geo data automatically
    const country = (request as any).geo?.country || request.headers.get('x-vercel-ip-country');

    console.log('[i18n] Detected country:', country);

    if (country && COUNTRY_TO_LOCALE[country]) {
      const locale = COUNTRY_TO_LOCALE[country];
      console.log('[i18n] Country mapped to locale:', country, '→', locale);
      return locale;
    }

    // Fallback: Accept-Language header (parse all with priorities)
    const acceptLanguage = request.headers.get('accept-language');
    console.log('[i18n] Accept-Language header:', acceptLanguage);

    if (acceptLanguage) {
      // Parse all languages with their q values, sort by priority
      const languages = acceptLanguage
        .split(',')
        .map((lang) => {
          const [code, q] = lang.trim().split(';q=');
          const priority = q ? parseFloat(q) : 1.0;
          const locale = code.split('-')[0].toLowerCase();
          return { locale, priority };
        })
        .sort((a, b) => b.priority - a.priority);

      // Find first supported locale
      for (const { locale } of languages) {
        if (['en', 'fr', 'es', 'de'].includes(locale)) {
          console.log('[i18n] Detected locale from Accept-Language:', locale);
          return locale;
        }
      }
    }
  } catch (error) {
    console.error('[i18n] Locale detection failed:', error);
  }

  console.log('[i18n] Using default locale: en');
  return 'en'; // Default to English
}

const PUBLIC_ROUTES = new Set<string>([
  '/',
  '/about',
  '/privacy',
  '/terms',
  '/login',
  '/register',
  '/admin/login',
]);

const PROTECTED_ROOTS = ['/fan', '/creator', '/admin', '/onboarding', '/settings'] as const;

function parseAuthCookie(raw: string | undefined): AuthState | null {
  if (!raw) return null;
  const v = raw.startsWith('%7B') ? decodeURIComponent(raw) : raw;
  try {
    return JSON.parse(v) as AuthState;
  } catch {
    return null;
  }
}

function isProtected(pathname: string): boolean {
  return PROTECTED_ROOTS.some((p) => pathname.startsWith(p));
}

function redirect(req: NextRequest, to: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = to;
  return NextResponse.redirect(url);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  console.log('[Middleware] 🔍 Request:', {
    pathname,
    method: request.method,
    url: request.url
  });

  // 0) i18n: Detect and set locale if not already set
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;

  if (!cookieLocale) {
    const detectedLocale = await detectLocaleFromIP(request);
    const response = intlMiddleware(request);
    response.cookies.set('NEXT_LOCALE', detectedLocale, {
      maxAge: 31536000, // 1 year
      path: '/',
    });
    // Continue with auth logic below using this response
    return response;
  }

  // 1) Public paths (check both with and without locale prefix)
  const pathnameWithoutLocale = pathname.replace(/^\/(en|fr|es|de)\//, '/');
  const isPublicRoute = PUBLIC_ROUTES.has(pathname) || PUBLIC_ROUTES.has(pathnameWithoutLocale);

  console.log('[Middleware] 🔍 Public route check:', {
    pathname,
    pathnameWithoutLocale,
    isPublicRoute
  });

  if (isPublicRoute) {
    console.log('[Middleware] ✅ Public route - allowing access');
    return NextResponse.next();
  }

  // 2) Auth sources: client persist (Zustand) + server session cookie
  const authPersist = parseAuthCookie(request.cookies.get(PERSIST_COOKIE)?.value);
  const sid = request.cookies.get(SESSION_COOKIE)?.value ?? '';

  const persistAuth = authPersist?.state?.isAuthenticated ?? false;
  const role = (authPersist?.state?.role ?? null) as Role;
  const onboardingDone = authPersist?.state?.onboardingDone ?? false;

  const isAuthenticated = persistAuth || Boolean(sid);

  console.log('[Middleware] 🔐 Auth check:', {
    persistAuth,
    hasSid: Boolean(sid),
    role,
    onboardingDone,
    isAuthenticated,
    cookies: {
      'auth-storage': request.cookies.has(PERSIST_COOKIE),
      'oliver_admin_sid': request.cookies.has(SESSION_COOKIE)
    }
  });

  // 3) Messages policy (auth required, onboarding ignored)
  const isCreatorMessages = pathname.startsWith('/creator/messages');
  const isFanMessages = pathname.startsWith('/fan/messages');
  const isMessagesPath = isCreatorMessages || isFanMessages;

  if (isMessagesPath) {
    if (!isAuthenticated) return redirect(request, '/');
    if (isCreatorMessages && role !== 'creator') {
      return redirect(request, role ? `/${role}` : '/');
    }
    if (isFanMessages && role !== 'fan' && role !== 'creator') {
      return redirect(request, role ? `/${role}` : '/');
    }
    return NextResponse.next();
  }

  // 4) Protected routes require auth
  if (isProtected(pathname) && !isAuthenticated) {
    console.log('[Middleware] ❌ Not authenticated - redirecting to home');
    return redirect(request, '/');
  }

  // 5) Onboarding gate (except /onboarding)
  if (isAuthenticated && !onboardingDone && pathname !== '/onboarding') {
    return redirect(request, '/onboarding');
  }

  // 6) Block /onboarding when already completed
  if (isAuthenticated && onboardingDone && pathname === '/onboarding') {
    return redirect(request, role ? `/${role}` : '/');
  }

  // 7) RBAC generic guard (outside messages paths)
  if (isAuthenticated && role) {
    const roots: Record<Exclude<Role, null>, string> = {
      fan: '/fan',
      creator: '/creator',
      admin: '/admin',
    };
    for (const [r, root] of Object.entries(roots)) {
      if (pathname.startsWith(root) && role !== (r as Role)) {
        return redirect(request, roots[role]);
      }
    }
  }

  // 8) Pass
  console.log('[Middleware] ✅ All checks passed - allowing access');
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Intercept everything except API and static assets
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
