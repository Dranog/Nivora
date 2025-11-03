"use client"

import * as React from "react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const filterSchema = z.object({
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  actor: z.string().optional(),
  actionType: z.string().optional(),
  page: z.number().int().min(1),
  pageSize: z.number().int().min(5).max(200),
})
export type Filters = z.infer<typeof filterSchema>

type Props = {
  value: Filters
  onChange: (next: Filters) => void
  onReset: () => void
  disabled?: boolean
  className?: string
}

function AuditFilters({ value, onChange, onReset, disabled, className }: Props) {
  const [local, setLocal] = React.useState<Filters>(value)

  React.useEffect(() => setLocal(value), [value])

  const commit = () => onChange(filterSchema.parse({ ...local }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        commit()
      }}
      className={cn("grid gap-3 md:grid-cols-5", className)}
      aria-disabled={disabled}
    >
      <div>
        <Label htmlFor="dateFrom">Du</Label>
        <Input
          id="dateFrom"
          type="date"
          value={local.dateFrom ?? ""}
          onChange={(e) => setLocal((p) => ({ ...p, dateFrom: e.target.value || undefined }))}
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="dateTo">Au</Label>
        <Input
          id="dateTo"
          type="date"
          value={local.dateTo ?? ""}
          onChange={(e) => setLocal((p) => ({ ...p, dateTo: e.target.value || undefined }))}
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="actor">Acteur (userId/email)</Label>
        <Input
          id="actor"
          placeholder="user_..."
          value={local.actor ?? ""}
          onChange={(e) => setLocal((p) => ({ ...p, actor: e.target.value || undefined }))}
          disabled={disabled}
        />
      </div>
      <div>
        <Label htmlFor="actionType">Événement</Label>
        <Input
          id="actionType"
          placeholder="AI_MODERATION_DECISION"
          value={local.actionType ?? ""}
          onChange={(e) => setLocal((p) => ({ ...p, actionType: e.target.value || undefined }))}
          disabled={disabled}
        />
      </div>
      <div className="flex items-end gap-2">
        <Button type="submit" disabled={disabled} aria-busy={disabled}>
          Appliquer
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            if (confirm("Réinitialiser les filtres ?")) onReset()
          }}
          disabled={disabled}
        >
          Réinitialiser
        </Button>
      </div>
    </form>
  )
}

export default AuditFilters
