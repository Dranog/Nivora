"use client"

import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { adminToasts } from "@/lib/toasts"
import AuditLogTable from "@/components/admin/audit/AuditLogTable"
import AuditFilters from "@/components/admin/audit/AuditFilters"
import { cn } from "@/lib/utils"
import { Loader2, RefreshCw, Download, AlertTriangle } from "lucide-react"
import { useAuditLog } from "@/hooks/useAuditLog"

interface Filters {
  page: number
  pageSize: number
  dateFrom?: string
  dateTo?: string
  actor?: string
  actionType?: string
}

const DEFAULT_PAGE_SIZE = 50
const AUTO_REFRESH_MS = 30_000

export default function AuditLogPage() {
  const router = useRouter()
  const search = useSearchParams()

  const [filters, setFilters] = useState<Filters>({
    page: Number(search.get("page")) || 1,
    pageSize: Number(search.get("pageSize")) || DEFAULT_PAGE_SIZE,
    dateFrom: search.get("dateFrom") || undefined,
    dateTo: search.get("dateTo") || undefined,
    actor: search.get("actor") || undefined,
    actionType: search.get("actionType") || undefined,
  })
  const [autoRefresh, setAutoRefresh] = useState(false)

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    exportCsv,
    isExporting,
  } = useAuditLog(filters)

  useEffect(() => {
    const p = new URLSearchParams()
    p.set("page", String(filters.page))
    p.set("pageSize", String(filters.pageSize))
    if (filters.dateFrom) p.set("dateFrom", filters.dateFrom)
    if (filters.dateTo) p.set("dateTo", filters.dateTo)
    if (filters.actor) p.set("actor", filters.actor)
    if (filters.actionType) p.set("actionType", filters.actionType)
    router.replace(`/admin/audit-log?${p.toString()}`)
  }, [filters, router])

  useEffect(() => {
    if (!autoRefresh) return
    const id = setInterval(() => {
      refetch()
        .then(() => adminToasts.audit.refreshed())
        .catch(() => adminToasts.audit.refreshFailed())
    }, AUTO_REFRESH_MS)
    return () => clearInterval(id)
  }, [autoRefresh, refetch])

  const handleFiltersChange = useCallback((next: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...next, page: 1 }))
  }, [])

  const handleResetFilters = useCallback(() => {
    if (!confirm("Réinitialiser tous les filtres ?")) return
    setFilters({ page: 1, pageSize: DEFAULT_PAGE_SIZE })
    adminToasts.audit.filtersReset()
  }, [])

  const handleManualRefresh = useCallback(async () => {
    try {
      await refetch()
      adminToasts.audit.refreshed()
    } catch {
      adminToasts.audit.refreshFailed()
    }
  }, [refetch])

  const handleExport = useCallback(async () => {
    if (!confirm("Exporter la vue actuelle des journaux en CSV ?")) return
    try {
      const blob = await exportCsv(filters)
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      const ts = new Date().toISOString().replace(/[:.]/g, "-")
      a.download = `audit-log_${ts}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      adminToasts.audit.exportSuccess()
    } catch (e) {
      adminToasts.audit.exportFailed(e instanceof Error ? e.message : undefined)
    }
  }, [exportCsv, filters])

  const disabledActions = isLoading || isError

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1
          className={cn(
            "text-2xl font-semibold bg-gradient-to-r from-brand-start to-brand-end bg-clip-text text-transparent"
          )}
        >
          Audit Log
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setAutoRefresh((v) => !v)}
            aria-pressed={autoRefresh}
            disabled={isLoading}
            title={
              autoRefresh ? "Auto-refresh activé" : "Activer l’auto-refresh (30s)"
            }
          >
            <RefreshCw
              className={cn("size-4", autoRefresh && "animate-spin")}
            />
            {autoRefresh ? "Auto" : "Auto (30s)"}
          </Button>
          <Button onClick={handleManualRefresh} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Rafraîchir
          </Button>
          <Button
            onClick={handleExport}
            disabled={disabledActions || isExporting}
          >
            {isExporting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <AuditFilters
          value={filters}
          onChange={handleFiltersChange}
          onReset={handleResetFilters}
          disabled={isLoading}
        />
      </Card>

      <Separator />

            <Card className="p-0 overflow-hidden">
        {isError ? (
          <div className="flex items-center gap-3 p-4 text-destructive">
            <AlertTriangle className="size-5 shrink-0" />
            <div>
              <p className="font-medium">Erreur de chargement</p>
              <p className="text-sm opacity-80">
                {(error as Error)?.message || "Impossible de récupérer les journaux."}
              </p>
            </div>
          </div>
        ) : (
          <AuditLogTable
            isLoading={isLoading}
            rows={data?.items ?? []}
            total={data?.total ?? 0}
            page={filters.page}
            pageSize={filters.pageSize}
            onPageChange={(p: number) =>
              setFilters((f) => ({ ...f, page: p }))
            }
            onPageSizeChange={(s: number) =>
              setFilters((f) => ({ ...f, page: 1, pageSize: s }))
            }
          />
        )}
      </Card>
    </div>
  )
}

