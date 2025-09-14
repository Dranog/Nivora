"use client"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { useState } from "react"
export function Paywall({ priceMonthly }: { priceMonthly: number }) {
  const [code, setCode] = useState("")
  return (
    <Card title="S’abonner">
      <div className="space-y-2">
        <div className="text-2xl font-semibold">€{priceMonthly.toFixed(2)} / mois</div>
        <div className="text-sm text-slate-600">Accès aux posts payants + messages privés.</div>
        <div className="flex gap-2 pt-2">
          <Input placeholder="Code promo (optionnel)" value={code} onChange={e => setCode(e.target.value)} />
          <Button variant="secondary">Appliquer</Button>
        </div>
        <Button className="w-full mt-2">S’abonner</Button>
      </div>
    </Card>
  )
}
