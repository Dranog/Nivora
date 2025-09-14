import { cn } from "@/lib/ui"
import React from "react"
export function Card({ title, children, className }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("card p-4", className)}>
      {title && <h3 className="mb-2 text-base font-semibold">{title}</h3>}
      {children}
    </div>
  )
}
