"use client"
import { cn } from "@/lib/ui"
import React from "react"
type Variant = "primary" | "secondary" | "ghost" | "destructive"
type Size = "sm" | "md" | "lg"
export function Button({
  children, className, variant = "primary", size = "md", loading = false, ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }) {
  const base = "inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed transition"
  const variants: Record<Variant, string> = {
    primary: "bg-primary text-white hover:opacity-95",
    secondary: "bg-foreground/5 text-foreground hover:bg-foreground/10",
    ghost: "bg-transparent hover:bg-foreground/5",
    destructive: "bg-destructive text-white hover:opacity-95",
  }
  const sizes: Record<Size, string> = { sm: "text-sm px-3 py-1.5", md: "text-sm px-4 py-2", lg: "text-base px-5 py-2.5" }
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {loading && <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />}
      {children}
    </button>
  )
}
