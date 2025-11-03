'use client';

import { ReactNode, useEffect, useState, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Sidebar } from '@/components/admin/Sidebar';
import { ToastProvider } from '@/components/admin/Toast';
import { LoadingScreen } from '@/components/admin/LoadingScreen';
import ErrorBoundary from '@/components/ErrorBoundary';

// Helper to get locale from cookie
function getLocaleFromCookie(): string {
  if (typeof document === 'undefined') return 'en';
  const cookies = document.cookie.split(';');
  const localeCookie = cookies.find(c => c.trim().startsWith('NEXT_LOCALE='));
  if (localeCookie) {
    return localeCookie.split('=')[1].trim();
  }
  return 'en';
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [locale, setLocale] = useState('en');
  const [messages, setMessages] = useState({});
  const [messagesLoaded, setMessagesLoaded] = useState(false);

  // Track if we're currently redirecting to prevent loops
  const isRedirecting = useRef(false);
  const authChecked = useRef(false);

  // 🔍 DEBUG - Check if this is the login page (with or without locale prefix)
  // Matches: /admin/login, /fr/admin/login, /en/admin/login, etc.
  const isLoginPage = pathname === '/admin/login' || pathname.endsWith('/admin/login');

  console.log('[Admin Layout] 🔄 Render cycle:', {
    pathname,
    isLoginPage,
    loading,
    mounted,
    messagesLoaded,
    isRedirecting: isRedirecting.current,
    authChecked: authChecked.current
  });

  // Detect locale from cookie and load messages
  useEffect(() => {
    console.log('[Admin Layout] 🔄 Starting locale detection and message loading...');
    const detectedLocale = getLocaleFromCookie();
    console.log('[Admin Layout] 🌍 Detected locale:', detectedLocale);
    setLocale(detectedLocale);

    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (!messagesLoaded) {
        console.warn('[Admin Layout] ⚠️ Message loading timeout - proceeding with empty messages');
        setMessages({});
        setMessagesLoaded(true);
      }
    }, 5000); // 5 second timeout

    import(`../../../messages/${detectedLocale}.json`)
      .then((msgs) => {
        console.log(`[Admin Layout] ✅ Loaded messages for locale: ${detectedLocale}`, Object.keys(msgs.default));
        setMessages(msgs.default);
        setMessagesLoaded(true);
        clearTimeout(timeoutId);
      })
      .catch((err) => {
        console.error(`[Admin Layout] ❌ Failed to load messages for locale: ${detectedLocale}`, err);
        // Fallback to empty object - components will show keys
        setMessages({});
        setMessagesLoaded(true); // Still mark as loaded to unblock render
        clearTimeout(timeoutId);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // TEMPORARY: Auth disabled for debugging - bypassing infinite redirect loop
  // TODO: Re-enable auth after fixing redirect issue
  /*
  // Reset auth check when pathname changes (to re-verify on navigation)
  useEffect(() => {
    console.log('[Admin Layout] 📍 Pathname changed, resetting auth check');
    authChecked.current = false;
  }, [pathname]);

  useEffect(() => {
    console.log('[Admin Layout] 🔐 Auth check effect triggered', {
      mounted,
      messagesLoaded,
      pathname,
      isLoginPage,
      isRedirecting: isRedirecting.current,
      authChecked: authChecked.current
    });

    // Prevent running if already redirecting
    if (isRedirecting.current) {
      console.log('[Admin Layout] 🚫 Already redirecting - skipping auth check');
      return;
    }

    if (!mounted || !messagesLoaded) {
      console.log('[Admin Layout] ⏳ Waiting for mount or messages...', { mounted, messagesLoaded });
      return;
    }

    console.log('[Admin Layout] ✅ Mount and messages ready - proceeding with auth check');

    // Skip auth check for login page
    if (isLoginPage) {
      console.log('[Admin Layout] 🔓 Login page detected - skipping auth check');
      setLoading(false);
      return;
    }

    // Prevent duplicate auth checks (only for same pathname)
    if (authChecked.current) {
      console.log('[Admin Layout] ✓ Auth already checked for this pathname');
      setLoading(false);
      return;
    }

    // BYPASS AUTH IN DEVELOPMENT MODE (for faster testing)
    const bypassEnabled = process.env.NODE_ENV === 'development' &&
                          process.env.NEXT_PUBLIC_BYPASS_ADMIN_AUTH === 'true';
    console.log('[Admin Layout] 🔍 Checking bypass:', {
      nodeEnv: process.env.NODE_ENV,
      bypassVar: process.env.NEXT_PUBLIC_BYPASS_ADMIN_AUTH,
      bypassEnabled
    });

    if (bypassEnabled) {
      console.log('[Admin Layout] ⚠️ Admin auth bypassed in development mode');
      authChecked.current = true;
      setLoading(false);
      return;
    }

    // Check for admin token (synchronous, no delay)
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('admin_user');

    // Debug: Show ALL localStorage keys
    const allKeys = Object.keys(localStorage);
    console.log('[Admin Layout] 🔍 ALL localStorage keys:', allKeys);
    console.log('[Admin Layout] 🔑 Token check:', {
      hasToken: !!token,
      hasUser: !!user,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null',
      userPreview: user ? user.substring(0, 50) + '...' : 'null',
    });

    if (!token) {
      console.log('[Admin Layout] ❌ No token found - initiating redirect to login');
      console.log('[Admin Layout] 🔄 Redirect path:', '/admin/login');

      // Mark as redirecting to prevent loops
      isRedirecting.current = true;
      authChecked.current = true;

      // Stop loading before redirect to show a clean transition
      setLoading(false);

      // Use setTimeout to ensure state updates are processed
      setTimeout(() => {
        console.log('[Admin Layout] 🚀 Executing redirect now...');
        router.replace('/admin/login');
      }, 0);
    } else {
      console.log('[Admin Layout] ✅ Token found - rendering with sidebar');
      authChecked.current = true;
      setLoading(false);
    }
  }, [mounted, messagesLoaded, pathname, router, isLoginPage]);
  */

  // TEMPORARY: Just set loading to false immediately
  useEffect(() => {
    console.log('⚠️ [DEBUG MODE] Auth checks disabled - rendering without authentication');
    setLoading(false);
  }, []);

  // TEMPORARY: Disabled during auth debugging
  /*
  // Reset redirect flag on any pathname change
  useEffect(() => {
    console.log('[Admin Layout] 📍 Pathname changed - resetting redirect flag');
    isRedirecting.current = false;
  }, [pathname]);
  */

  // Wait for messages to load before rendering
  if (!messagesLoaded) {
    return (
      <ToastProvider>
        <LoadingScreen />
      </ToastProvider>
    );
  }

  // Page login : pas de chrome (no sidebar)
  if (isLoginPage) {
    console.log('🎨 Rendering login page WITHOUT sidebar');
    return (
      <ErrorBoundary>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ToastProvider>
            <div data-page="login" className="min-h-screen">
              {children}
            </div>
          </ToastProvider>
        </NextIntlClientProvider>
      </ErrorBoundary>
    );
  }

  // Loading state
  if (loading) {
    console.log('[Admin Layout] 🔄 Showing LoadingScreen', {
      pathname,
      isLoginPage,
      loading: true
    });
    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ToastProvider>
          <LoadingScreen />
        </ToastProvider>
      </NextIntlClientProvider>
    );
  }

  // Layout normal avec Sidebar uniquement (header supprimé)
  console.log('[Admin Layout] 🎨 Rendering admin page WITH sidebar', {
    pathname,
    hasToken: !!localStorage.getItem('accessToken')
  });
  return (
    <ErrorBoundary>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <ToastProvider>
          <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <div className="flex-1">
              {children}
            </div>
          </div>
        </ToastProvider>
      </NextIntlClientProvider>
    </ErrorBoundary>
  );
}
