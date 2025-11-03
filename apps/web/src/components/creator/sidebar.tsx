// apps/web/src/components/creator/sidebar.tsx
"use client";
import Link from "next/link";
import { useUIStore } from "@/store/useUIStore";
import { Home, Image as ImageIcon, Wallet, Megaphone, Users, Brain, Settings } from "lucide-react";

const NAV = [
  { type: "link", href: "/creator", label: "Dashboard", icon: Home },
  { type: "panel", id: "content", label: "Contenu", icon: ImageIcon },
  { type: "panel", id: "earnings", label: "Revenus / Wallet", icon: Wallet },
  { type: "panel", id: "marketing", label: "Marketing", icon: Megaphone },
  { type: "panel", id: "crm", label: "CRM", icon: Users },
  { type: "panel", id: "growth", label: "Growth & IA", icon: Brain },
  { type: "panel", id: "settings", label: "Paramètres", icon: Settings },
] as const;

export function Sidebar() {
  const { openPanel } = useUIStore();
  return (
    <aside className="hidden w-20 shrink-0 border-r bg-primary/10 lg:block">
      <nav className="flex flex-col items-center gap-2 p-2">
        {NAV.map((item) => {
          const Icon = item.icon;
          if (item.type === "link") {
            return (
              <Link key={item.label} href={item.href} aria-label={item.label}
                className="grid h-12 w-12 place-items-center rounded-xl hover:bg-white">
                <Icon className="h-5 w-5" />
              </Link>
            );
          }
          return (
            <button
              key={item.label}
              aria-label={item.label}
              onClick={() => openPanel(item.id as any)}
              className="grid h-12 w-12 place-items-center rounded-xl hover:bg-white"
              type="button"
            >
              <Icon className="h-5 w-5" />
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
