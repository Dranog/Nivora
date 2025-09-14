"use client"
import React from "react"
type ToastMsg = { id: number; text: string }
const Ctx = React.createContext<{ push: (text: string) => void } | null>(null)
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = React.useState<ToastMsg[]>([])
  const push = (text: string) => {
    const id = Date.now()
    setList((l) => [...l, { id, text }])
    setTimeout(() => setList((l) => l.filter(x => x.id !== id)), 2500)
  }
  return (
    <Ctx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {list.map(t => (<div key={t.id} className="rounded-md bg-foreground text-white px-3 py-2 shadow-popover">{t.text}</div>))}
      </div>
    </Ctx.Provider>
  )
}
export function useToast() {
  const ctx = React.useContext(Ctx)
  if (!ctx) throw new Error("useToast must be used within ToastProvider")
  return ctx
}
