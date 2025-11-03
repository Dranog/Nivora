"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface NavItem {
  key: string;
  label: string;
  icon: LucideIcon;
  href?: string; // Optional external link
}

interface SideNavProps {
  items: NavItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export function SideNav({ items, activeTab, onTabChange }: SideNavProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-14 h-[calc(100vh-3.5rem)] w-full">
      <nav className="oliver-card p-3 h-full overflow-y-auto scrollbar-oliver bg-gradient-to-b from-primary/10 to-transparent">
        <TooltipProvider delayDuration={300}>
          <ul className="space-y-2">
            {/* Home button */}
            <li>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/"
                    aria-current={pathname === "/" ? "page" : undefined}
                    aria-label="Home"
                    title="Home"
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      "lg:justify-start justify-center",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      pathname === "/"
                        ? "bg-primary/10 text-primary font-medium border border-primary/30 shadow-sm"
                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <Home className={cn("h-5 w-5 flex-shrink-0", pathname === "/" && "text-primary")} />
                    <span className="truncate hidden lg:inline">Home</span>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  <p>Home</p>
                </TooltipContent>
              </Tooltip>
            </li>

            {/* Creator tabs */}
            {items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.key;

              // If item has href, render as Link
              if (item.href) {
                return (
                  <li key={item.key}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={item.href}
                          aria-current={pathname === item.href ? "page" : undefined}
                          aria-label={item.label}
                          title={item.label}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                            "lg:justify-start justify-center",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                            pathname === item.href
                              ? "bg-primary/10 text-primary font-medium border border-primary/30 shadow-sm"
                              : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                          )}
                        >
                          <Icon className={cn("h-5 w-5 flex-shrink-0", pathname === item.href && "text-primary")} />
                          <span className="truncate hidden lg:inline">{item.label}</span>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="lg:hidden">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  </li>
                );
              }

              // Otherwise, render as button (tab navigation)
              return (
                <li key={item.key}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => onTabChange(item.key)}
                        aria-current={isActive ? "page" : undefined}
                        aria-label={item.label}
                        title={item.label}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                          "lg:justify-start justify-center",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                          isActive
                            ? "bg-primary/10 text-primary font-medium border border-primary/30 shadow-sm"
                            : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        )}
                      >
                        <Icon className={cn("h-5 w-5 flex-shrink-0", isActive && "text-primary")} />
                        <span className="truncate hidden lg:inline">{item.label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="lg:hidden">
                      <p>{item.label}</p>
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            })}
          </ul>
        </TooltipProvider>
      </nav>
    </aside>
  );
}
