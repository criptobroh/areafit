"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertTriangle, AlertCircle, Info, Bug, CheckCircle, RefreshCw } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

const levelConfig: Record<string, { icon: any; color: string; badge: string }> = {
  info: { icon: Info, color: "text-blue-500", badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" },
  warn: { icon: AlertTriangle, color: "text-yellow-500", badge: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800" },
  error: { icon: AlertCircle, color: "text-red-500", badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800" },
  critical: { icon: Bug, color: "text-red-700", badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700" },
}

const mockLogs = [
  { id: "1", level: "error", message: "Failed to fetch conversations from database", path: "/api/conversations", method: "GET", userEmail: "system", resolved: false, createdAt: "2026-04-12T08:30:00Z" },
  { id: "2", level: "warn", message: "Rate limit approaching for Resend API", path: "/api/auth/login", method: "POST", userEmail: "system", resolved: false, createdAt: "2026-04-12T07:15:00Z" },
  { id: "3", level: "info", message: "User maria@areafit.es logged in successfully", path: "/api/auth/verify", method: "GET", userEmail: "maria@areafit.es", resolved: true, createdAt: "2026-04-11T16:45:00Z" },
  { id: "4", level: "error", message: "Connection timeout to PostgreSQL", path: "/api/dashboard/kpis", method: "GET", userEmail: "system", resolved: true, createdAt: "2026-04-11T14:20:00Z" },
  { id: "5", level: "critical", message: "JWT secret rotation failed - falling back to previous key", path: "/api/auth/session", method: "GET", userEmail: "system", resolved: true, createdAt: "2026-04-10T22:00:00Z" },
  { id: "6", level: "warn", message: "Slow query detected: contacts list took 3200ms", path: "/api/contacts", method: "GET", userEmail: "carlos@areafit.es", resolved: false, createdAt: "2026-04-10T11:30:00Z" },
  { id: "7", level: "info", message: "Daily backup completed successfully", path: "/api/health", method: "GET", userEmail: "system", resolved: true, createdAt: "2026-04-10T03:00:00Z" },
  { id: "8", level: "error", message: "Failed to send magic link email to unknown@test.com", path: "/api/auth/login", method: "POST", userEmail: "unknown@test.com", resolved: false, createdAt: "2026-04-09T19:45:00Z" },
]

export default function LogsPage() {
  const [levelFilter, setLevelFilter] = useState("all")

  const filtered = levelFilter === "all"
    ? mockLogs
    : mockLogs.filter((l) => l.level === levelFilter)

  const unresolvedCount = mockLogs.filter((l) => !l.resolved).length

  return (
    <>
      <Topbar title="Sistema" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["info", "warn", "error", "critical"] as const).map((level) => {
            const config = levelConfig[level]
            const Icon = config.icon
            const count = mockLogs.filter((l) => l.level === level).length
            return (
              <Card key={level} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="font-mono text-xl font-bold">{count}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{level}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select value={levelFilter} onValueChange={(v) => { if (v) setLevelFilter(v) }}>
              <SelectTrigger className="w-[140px] h-9 text-sm">
                <SelectValue placeholder="Nivel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            {unresolvedCount > 0 && (
              <Badge variant="outline" className="text-xs text-red-600 border-red-200 dark:text-red-400">
                {unresolvedCount} sin resolver
              </Badge>
            )}
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 h-8">
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
        </div>

        {/* Logs Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[90px]">Nivel</TableHead>
                    <TableHead>Mensaje</TableHead>
                    <TableHead className="w-[180px]">Ruta</TableHead>
                    <TableHead className="w-[160px]">Fecha</TableHead>
                    <TableHead className="w-[80px] text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((log) => {
                    const config = levelConfig[log.level]
                    const Icon = config.icon
                    return (
                      <TableRow key={log.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Badge variant="outline" className={`text-[10px] ${config.badge}`}>
                            <Icon className="h-3 w-3 mr-1" />
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm max-w-[300px] truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {log.method} {log.path}
                          </code>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {format(parseISO(log.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="text-center">
                          {log.resolved ? (
                            <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-yellow-600 border-yellow-300 dark:text-yellow-400">
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
