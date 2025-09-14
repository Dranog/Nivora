import { cn } from "@/lib/ui"
import React from "react"
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input ref={ref} className={cn("input", className)} {...props} />
  )
)
Input.displayName = "Input"
