"use client"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { useState } from "react"
export function PromoCodeInput() {
  const [code, setCode] = useState("")
  return (
    <div className="flex gap-2">
      <Input placeholder="Code promo" value={code} onChange={(e) => setCode(e.target.value)} />
      <Button variant="secondary">Appliquer</Button>
    </div>
  )
}
