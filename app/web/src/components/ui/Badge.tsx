import { cn } from "@/lib/ui"
export function Badge({
  children, variant = "default", className,
}: { children: React.ReactNode; variant?: "default" | "success" | "danger"; className?: string }) {
  const styles = {
    default: "bg-foreground/10 text-foreground",
    success: "bg-emerald-100 text-emerald-800",
    danger: "bg-red-100 text-red-800",
  } as const
  return (
    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", styles[variant], className)}>
      {children}
    </span>
  )
}
