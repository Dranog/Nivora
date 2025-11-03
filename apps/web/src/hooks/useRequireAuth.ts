"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Garde d'accès client.
 * - Redirige vers `redirectTo` si non connecté.
 * - Optionnellement force un rôle (fan | creator | admin).
 * - Laisse passer si `allowIfOnboarding` et que l'utilisateur n'a pas fini l'onboarding.
 */
export function useRequireAuth(
  opts: {
    role?: "fan" | "creator" | "admin";
    redirectTo?: string;
    allowIfOnboarding?: boolean;
  } = {}
) {
  const { role, redirectTo = "/",
          allowIfOnboarding = true } = opts;

  const router = useRouter();
  const pathname = usePathname();

  const {
    isAuthenticated,
    role: currentRole,
    onboardingDone,
    isLoading,
  } = useAuthStore();

  useEffect(() => {
    if (isLoading) return;

    // Pas connecté → redirection
    if (!isAuthenticated) {
      // évite boucle infinie si déjà sur la page cible
      if (pathname !== redirectTo) router.replace(redirectTo);
      return;
    }

    // Onboarding non terminé
    if (!onboardingDone && !allowIfOnboarding) {
      if (!pathname?.startsWith("/onboarding")) router.replace("/onboarding");
      return;
    }

    // Rôle imposé
    if (role && currentRole && currentRole !== role) {
      router.replace("/");
    }
  }, [
    isAuthenticated,
    currentRole,
    onboardingDone,
    isLoading,
    role,
    allowIfOnboarding,
    redirectTo,
    router,
    pathname,
  ]);
}
