"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { UserRole } from "@/types/user";

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  userRole?: UserRole;
}

export function Sidebar({ open, onClose, userRole }: SidebarProps = {}) {
  const pathname = usePathname();

  // Dynamic navigation based on user role
  const NAV = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/content", label: "Content" },
    { href: "/analytics", label: "Analytics" },
    { href: "/revenue", label: "Revenue" },
    {
      href: userRole === "creator" ? "/creator/messages" : "/fan/messages",
      label: "Messages"
    },
    { href: "/settings", label: "Settings" },
    { href: "/admin", label: "Admin" },
  ];

  return (
    <aside className="hidden w-60 shrink-0 border-r bg-white lg:block">
      <nav className="space-y-1 p-3">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? "brand-filled block rounded-md px-3 py-2 text-sm"
                  : "block rounded-md px-3 py-2 text-sm hover:bg-gray-50"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
