"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/useUIStore";

type Props = { open: boolean; panelId: string; title: string; children: ReactNode };

export function SlideOver({ open, panelId, title, children }: Props) {
  const { closeDrawer } = useUIStore() as any;

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
          onClick={() => closeDrawer?.()}
          aria-hidden={true}
        />
      )}

      {/* Slide Over Panel */}
      <div
        role="dialog"
        aria-label={title}
        aria-hidden={!open}
        className={
          "fixed inset-y-0 right-0 z-50 w-full max-w-3xl border-l border-border bg-background shadow-modal transition-transform duration-300 ease-in-out " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5 bg-card">
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl hover:bg-muted"
            aria-label="Close panel"
            onClick={() => closeDrawer?.()}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-[calc(100vh-80px)] overflow-y-auto scrollbar-oliver bg-background">
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
