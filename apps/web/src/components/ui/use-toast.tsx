// apps/web/src/components/ui/use-toast.tsx
"use client"

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Variantes compatibles avec ton code (shadcn + customs) */
type ToastVariant =
  | "default"
  | "destructive"
  | "success"
  | "info"
  | "warning"
  | "error"

type ToastId = string

export interface ToastItem {
  id: ToastId
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number // ms
}

type CreateToast = Omit<ToastItem, "id">

type ToastContextValue = {
  /** alias pratique pour l’UI */
  toast: (t: CreateToast) => ToastId
  /** API originelle si tu l’utilises ailleurs */
  notify: (t: CreateToast) => ToastId
  dismiss: (id: ToastId) => void
}

const ToastCtx = createContext<ToastContextValue | null>(null)

const genId = () => Math.random().toString(36).slice(2)

/** API impérative globale (utilisable sans hook) */
export function toast(t: CreateToast): ToastId {
  const id = genId()
  const detail: ToastItem = { id, duration: 4000, variant: "default", ...t }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent<ToastItem>("__toast__", { detail }))
  }
  return id
}

/** Hook contextuel */
export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error("useToast must be used within <ToasterProvider/>")
  return ctx
}

/** Provider + rendu des toasts */
export function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timers = useRef<Map<ToastId, number>>(new Map())

  const dismiss = useCallback((id: ToastId) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    const tm = timers.current.get(id)
    if (tm) {
      window.clearTimeout(tm)
      timers.current.delete(id)
    }
  }, [])

  const notify = useCallback(
    (t: CreateToast) => {
      const id = genId()
      const item: ToastItem = { id, duration: 4000, variant: "default", ...t }
      setItems((prev) => [item, ...prev])
      if (item.duration && item.duration > 0) {
        const tm = window.setTimeout(() => dismiss(id), item.duration)
        timers.current.set(id, tm)
      }
      return id
    },
    [dismiss]
  )

  // Écoute l’API globale basée sur CustomEvent
  useEffect(() => {
    const onEv = (ev: Event) => {
      const e = ev as CustomEvent<ToastItem>
      const { id: _ignored, ...rest } = e.detail
      notify(rest)
    }
    window.addEventListener("__toast__", onEv as EventListener)
    return () => window.removeEventListener("__toast__", onEv as EventListener)
  }, [notify])

  const value = useMemo<ToastContextValue>(
    () => ({ notify, toast: notify, dismiss }),
    [notify, dismiss]
  )

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <ToastViewport items={items} onClose={dismiss} />
    </ToastCtx.Provider>
  )
}

/** Conteneur UI */
function ToastViewport({
  items,
  onClose,
}: {
  items: ToastItem[]
  onClose: (id: ToastId) => void
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-end gap-2 px-4"
    >
      {items.map((t) => (
        <ToastCard key={t.id} item={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  )
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const palette: Record<ToastVariant, string> = {
    default: "from-slate-600 to-slate-500",
    destructive: "from-red-600 to-rose-500",
    success: "from-green-600 to-emerald-500",
    info: "from-sky-600 to-blue-500",
    warning: "from-amber-600 to-yellow-500",
    error: "from-rose-600 to-red-500",
  }
  const bar = palette[item.variant ?? "default"]

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-background/95 shadow-lg ring-1 ring-border",
        "backdrop-blur supports-[backdrop-filter]:bg-background/70"
      )}
    >
      <div className={cn("h-1 w-full bg-gradient-to-r", bar)} />
      <div className="p-3">
        {item.title && <div className="text-sm font-semibold">{item.title}</div>}
        {item.description && (
          <div className="mt-1 text-sm text-muted-foreground">{item.description}</div>
        )}
        <div className="mt-2 flex justify-end">
          <Button size="sm" variant="outline" onClick={onClose} aria-label="Fermer la notification">
            Fermer
          </Button>
        </div>
      </div>
    </div>
  )
}
