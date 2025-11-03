"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";

export default function ConditionalAppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    // Pas d’AppShell -> pas de sidebar turquoise, pas de “Collapse”
    return <>{children}</>;
  }
  return <AppShell>{children}</AppShell>;
}
