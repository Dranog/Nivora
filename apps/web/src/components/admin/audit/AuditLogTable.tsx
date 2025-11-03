"use client"

import * as React from "react"
import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Loader2, Eye, User, Clock, Globe, Monitor, AlertCircle, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

export interface AuditRow {
  id: string
  createdAt: string
  userId: string | null
  event: string
  resource: string | null
  ipHash: string | null
  ua: string | null
  meta?: Record<string, unknown> | null
  user?: { id: string; username: string | null; email?: string } | undefined
}

interface Props {
  rows: AuditRow[]
  total: number
  page: number
  pageSize: number
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPageSizeChange: (size: number) => void
  onRefresh?: () => void
}

// Get action type from event name
function getActionType(event: string): 'CREATE' | 'UPDATE' | 'DELETE' | 'READ' | 'OTHER' {
  const e = event.toUpperCase()
  if (e.includes('CREATE') || e.includes('REGISTER') || e.includes('SIGNUP')) return 'CREATE'
  if (e.includes('UPDATE') || e.includes('EDIT') || e.includes('MODIFY') || e.includes('APPROVE') || e.includes('REJECT')) return 'UPDATE'
  if (e.includes('DELETE') || e.includes('REMOVE') || e.includes('BAN')) return 'DELETE'
  if (e.includes('LOGIN') || e.includes('VIEW') || e.includes('READ') || e.includes('FETCH')) return 'READ'
  return 'OTHER'
}

// Get badge variant for action type
function getActionBadgeVariant(actionType: string): "default" | "secondary" | "destructive" | "outline" {
  switch (actionType) {
    case 'CREATE':
      return 'default' // Green
    case 'UPDATE':
      return 'secondary' // Blue
    case 'DELETE':
      return 'destructive' // Red
    case 'READ':
      return 'outline' // Gray
    default:
      return 'outline'
  }
}

// Format user agent
function formatUserAgent(ua: string | null): string {
  if (!ua) return 'Unknown'

  // Extract browser and OS
  const browserMatch = ua.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)
  const osMatch = ua.match(/(Windows|Mac OS X|Linux|Android|iOS)[\s/]?[\d._]*/)

  const browser = browserMatch ? browserMatch[1] : 'Unknown Browser'
  const os = osMatch ? osMatch[1].replace(/_/g, '.') : 'Unknown OS'

  return `${browser} on ${os}`
}

// Detail Drawer Component
function AuditLogDetailDrawer({ row, open, onClose }: { row: AuditRow | null; open: boolean; onClose: () => void }) {
  if (!row) return null

  const actionType = getActionType(row.event)
  const hasBefore = row.meta && 'before' in row.meta
  const hasAfter = row.meta && 'after' in row.meta
  const hasError = row.meta && 'error' in row.meta

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-[600px] sm:w-[700px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Badge variant={getActionBadgeVariant(actionType)}>
              {actionType}
            </Badge>
            {row.event}
          </SheetTitle>
          <SheetDescription>
            {format(new Date(row.createdAt), "PPPp", { locale: fr })}
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Actor Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Actor
            </h3>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${row.userId || 'unknown'}`} />
                <AvatarFallback>
                  {row.user?.username?.slice(0, 2).toUpperCase() || 'UN'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{row.user?.username || 'Unknown User'}</p>
                {row.user?.email && (
                  <p className="text-sm text-muted-foreground">{row.user.email}</p>
                )}
                <p className="text-xs text-muted-foreground">ID: {row.userId || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Resource Section */}
          {row.resource && (
            <div>
              <h3 className="text-sm font-semibold mb-3">Resource</h3>
              <p className="p-3 bg-muted/50 rounded-lg font-mono text-sm">
                {row.resource}
              </p>
            </div>
          )}

          {/* Network Info Section */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Network & Device
            </h3>
            <div className="space-y-2">
              {row.ipHash && (
                <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm text-muted-foreground">IP Hash</span>
                  <code className="text-xs font-mono">{row.ipHash}</code>
                </div>
              )}
              {row.ua && (
                <div className="flex items-start justify-between p-2 bg-muted/50 rounded">
                  <span className="text-sm text-muted-foreground">User Agent</span>
                  <div className="text-right">
                    <p className="text-xs font-medium">{formatUserAgent(row.ua)}</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-[300px] truncate">
                      {row.ua}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Before/After Comparison */}
          {(hasBefore || hasAfter) && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Changes
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {hasBefore && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Before</p>
                    <pre className="p-3 bg-destructive/10 border border-destructive/20 rounded text-xs overflow-auto max-h-[300px]">
                      {JSON.stringify(row.meta?.before, null, 2)}
                    </pre>
                  </div>
                )}
                {hasAfter && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">After</p>
                    <pre className="p-3 bg-primary/10 border border-primary/20 rounded text-xs overflow-auto max-h-[300px]">
                      {JSON.stringify(row.meta?.after, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Info */}
          {hasError && (
            <div>
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-destructive">
                <AlertCircle className="h-4 w-4" />
                Error
              </h3>
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded">
                <pre className="text-xs whitespace-pre-wrap break-all">
                  {typeof row.meta?.error === 'string'
                    ? row.meta.error
                    : JSON.stringify(row.meta?.error, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Full Metadata */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Full Metadata</h3>
            <ScrollArea className="h-[300px] w-full border rounded-lg">
              <pre className="p-4 text-xs">
                {JSON.stringify(row.meta || {}, null, 2)}
              </pre>
            </ScrollArea>
          </div>

          {/* Timestamp */}
          <div>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Timestamp
            </h3>
            <div className="p-3 bg-muted/50 rounded-lg space-y-1">
              <p className="text-sm">
                {format(new Date(row.createdAt), "PPPp", { locale: fr })}
              </p>
              <p className="text-xs text-muted-foreground font-mono">
                {new Date(row.createdAt).toISOString()}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(row.createdAt).getTime()}ms since epoch
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function AuditLogTable({
  rows,
  total,
  page,
  pageSize,
  isLoading = false,
  onPageChange,
  onPageSizeChange,
  onRefresh,
}: Props) {
  const [selectedRow, setSelectedRow] = useState<AuditRow | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const handleViewDetails = (row: AuditRow) => {
    setSelectedRow(row)
    setDrawerOpen(true)
  }

  return (
    <>
      <div className="border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b bg-muted/30">
          <div className="font-semibold">
            Journal — {rows.length} / {total} entrées
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Actualiser"}
          </Button>
        </div>

        {/* Table */}
        <ScrollArea className="max-h-[60vh]">
          <table className="w-full text-sm">
            <thead className="text-left sticky top-0 bg-background border-b">
              <tr>
                <th className="p-2 w-[180px]">Timestamp</th>
                <th className="p-2 w-[140px]">Action</th>
                <th className="p-2">Acteur</th>
                <th className="p-2">Ressource</th>
                <th className="p-2 w-[120px]">IP</th>
                <th className="p-2 w-[100px]">Details</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    <Loader2 className="inline size-5 animate-spin mr-2" />
                    Chargement des journaux...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-muted-foreground">
                    Aucun journal trouvé.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const actionType = getActionType(r.event)
                  return (
                    <tr key={r.id} className="border-t hover:bg-muted/20">
                      <td className="p-2">
                        <div className="text-xs">
                          <div className="font-medium">
                            {format(new Date(r.createdAt), "dd/MM/yyyy", { locale: fr })}
                          </div>
                          <div className="text-muted-foreground">
                            {format(new Date(r.createdAt), "HH:mm:ss.SSS", { locale: fr })}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="space-y-1">
                          <Badge variant={getActionBadgeVariant(actionType)} className="text-xs">
                            {actionType}
                          </Badge>
                          <div className="text-xs text-muted-foreground truncate max-w-[120px]" title={r.event}>
                            {r.event}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={`https://avatar.vercel.sh/${r.userId || 'unknown'}`} />
                            <AvatarFallback className="text-xs">
                              {r.user?.username?.slice(0, 2).toUpperCase() || 'UN'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-xs">
                            <div className="font-medium">{r.user?.username || 'Unknown'}</div>
                            {r.user?.email && (
                              <div className="text-muted-foreground truncate max-w-[150px]">
                                {r.user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-xs text-muted-foreground truncate max-w-[150px] block" title={r.resource || '-'}>
                          {r.resource || '-'}
                        </span>
                      </td>
                      <td className="p-2">
                        <code className="text-xs text-muted-foreground">
                          {r.ipHash ? `${r.ipHash.slice(0, 8)}...` : '-'}
                        </code>
                      </td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetails(r)}
                          className="h-7 w-7 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </ScrollArea>

        {/* Pagination */}
        <div className="flex items-center justify-between p-3 border-t bg-muted/30">
          <div className="text-xs text-muted-foreground">
            Page {page} sur {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              aria-label="Page précédente"
            >
              ←
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              aria-label="Page suivante"
            >
              →
            </Button>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              disabled={isLoading}
              className={cn(
                "border rounded-md text-xs px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring"
              )}
              aria-label="Taille de page"
            >
              {[10, 25, 50, 100].map((s) => (
                <option key={s} value={s}>
                  {s} / page
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <AuditLogDetailDrawer
        row={selectedRow}
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setSelectedRow(null)
        }}
      />
    </>
  )
}
