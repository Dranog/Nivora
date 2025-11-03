"use client";

import Link from "next/link";
import { Search, Plus, Home } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

interface TopBarProps {
  showSearch?: boolean;
}

export function TopBar({ showSearch = true }: TopBarProps) {
  return (
    <div className="sticky top-0 z-50 h-14 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left: Logo + Home */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold tracking-tight text-primary">OLIVER</h1>
          <Link
            href="/"
            title="Home"
            aria-label="Home"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4 transition-colors" />
          </Link>
        </div>

        {/* Center: Search */}
        {showSearch && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search… (Cmd+K)"
                className="oliver-input h-9 pl-9"
              />
            </div>
          </div>
        )}

        {/* Right: Balance Badge, Theme Toggle, Create Button, Avatar */}
        <div className="flex items-center gap-4">
          <Badge className="oliver-badge-primary px-3 py-1.5 text-sm font-semibold">
            €12,450
          </Badge>

          <ThemeToggle />

          <Button className="oliver-btn-primary h-9 px-4 shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Create
          </Button>

          <Avatar className="h-9 w-9 rounded-xl">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold rounded-xl">
              SL
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </div>
  );
}
