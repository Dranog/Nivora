// src/components/layout/Header.tsx
"use client";

import * as React from "react";
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[1600px] items-center gap-3 px-3 sm:h-16 sm:px-6">
        {/* Logo à gauche */}
        <Link href="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-brand-500" />
          <span className="text-[18px] font-bold tracking-tight text-gray-900">OLIVER</span>
        </Link>

        {/* Barre de recherche au centre (prend la place dispo) */}
        <div className="mx-2 flex flex-1 justify-center">
          <div className="w-full max-w-[780px]">
            <input
              className="w-full rounded-lg border bg-white px-4 py-2 text-sm outline-none ring-brand-500/30 focus:ring-2"
              placeholder="Search… (Cmd+K)"
            />
          </div>
        </div>

        {/* Actions + Profil à droite */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button
            className="hidden rounded-full border bg-white px-3 py-1.5 text-sm sm:block"
            aria-label="Notifications"
          >
            Notifications
          </button>

          {/* Profil plus visible */}
          <button
            className="group inline-flex items-center gap-3 rounded-full border bg-white px-3 py-1.5 transition hover:bg-gray-50"
            aria-label="User menu"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white">
              S
            </span>
            <div className="hidden text-left sm:block">
              <div className="text-[15px] font-semibold leading-4 text-gray-900">Sarah Chen</div>
              <div className="text-[12px] text-gray-500">Creator</div>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
