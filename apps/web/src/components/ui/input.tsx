/**
 * Input – accessible, TS strict, styles cohérents.
 */
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        aria-invalid={error || undefined}
        className={cn(
          [
            "flex h-10 w-full rounded-2xl border bg-background px-3 text-sm",
            "border-input placeholder:text-muted-foreground",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-colors duration-200",
          ].join(" "),
          error && "border-destructive focus-visible:ring-destructive/40",
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
