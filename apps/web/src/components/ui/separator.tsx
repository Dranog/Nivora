"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

type SeparatorProps = {
  className?: string
  orientation?: "horizontal" | "vertical"
  decorative?: boolean
}

export function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
}: SeparatorProps) {
  const base =
    orientation === "vertical"
      ? "w-px h-full"
      : "h-px w-full"

  return (
    <div
      className={cn(base, "bg-slate-200", className)}
      role={decorative ? "presentation" : "separator"}
      aria-orientation={orientation}
    />
  )
}

export default Separator
