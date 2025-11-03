"use client";

import { ReactNode } from "react";
import { TopBar } from "./TopBar";
import { SideNav, NavItem } from "./SideNav";
import { cn } from "@/lib/utils";

interface CreatorShellProps {
  activeTab: string;
  onTabChange: (key: string) => void;
  tabs: NavItem[];
  children: ReactNode;
}

export function CreatorShell({ activeTab, onTabChange, tabs, children }: CreatorShellProps) {
  // Show search only on Dashboard, Revenue, CRM tabs
  const showSearch = ["dashboard", "revenue", "crm"].includes(activeTab);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* TopBar - Sticky at top */}
      <TopBar showSearch={showSearch} />

      {/* Main Layout */}
      <div className="grid grid-cols-12 gap-6 px-6 py-8 flex-1">
        {/* Sidebar Navigation - Responsive width */}
        <div className="col-span-1 lg:col-span-2">
          <SideNav items={tabs} activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        {/* Main Content Area - Responsive width */}
        <main className="col-span-11 lg:col-span-10 p-6 md:p-8 lg:p-10 space-y-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/20 py-2 text-center text-xs text-muted-foreground/70">
        © {new Date().getFullYear()} OLIVER — v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}
      </footer>
    </div>
  );
}
