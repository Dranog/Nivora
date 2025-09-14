import { cn } from "@/lib/ui"
import React from "react"
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea ref={ref} className={cn("input min-h-[120px]", className)} {...props} />
  )
)
Textarea.displayName = "Textarea"
