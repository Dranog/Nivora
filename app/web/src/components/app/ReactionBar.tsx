"use client"
import { useState } from "react"
export function ReactionBar() {
  const [c, setC] = useState({ like: 0, fire: 0, heart: 0 })
  return (
    <div className="flex items-center gap-3 text-sm">
      <button onClick={() => setC(v => ({ ...v, like: v.like + 1 }))}>👍 {c.like}</button>
      <button onClick={() => setC(v => ({ ...v, fire: v.fire + 1 }))}>🔥 {c.fire}</button>
      <button onClick={() => setC(v => ({ ...v, heart: v.heart + 1 }))}>❤️ {c.heart}</button>
    </div>
  )
}
