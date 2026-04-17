"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
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
import { toast } from "sonner"

type ErrorLog = {
  id: string
  level: string
  message: string
  path: string | null
  method: string | null
  statusCode: number | null
  userEmail: string | null
  resolved: boolean
  resolvedBy: string | null
  createdAt: string
}

type LogsResponse = {
  data: ErrorLog[]
  total: number
}

const levelConfig: Record<string, { icon: any; color: string; badge: string }> = {
  info: {
    icon: Info,
    color: "text-blue-500",
    badge: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  },
  warn: {
    icon: AlertTriangle,
    color: "text-yellow-500",
    badge: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
  },
  error: {
    icon: AlertCircle,
    color: "text-red-500",
    badge: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  },
  critical: {
    icon: Bug,
    color: "text-red-700",
    badge: "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700",
  },
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

export default function LogsPage() {
  const qc = useQueryClient()
  const [levelFilter, setLevelFilter] = useState("all")

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-logs", levelFilter],
    queryFn: () =>
      fetchJSON<LogsResponse>(
        `/api/admin/error-logs?${levelFilter !== "all" ? `level=${levelFilter}` : ""}`
      ),
  })

  const resolve = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/error-logs/${id}/resolve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resolution: "Resuelto desde dashboard" }),
      })
      if (!res.ok) throw new Error("Error")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-logs"] })
      toast.success("Log marcado como resuelto")
    },
    onError: () => toast.error("Error al resolver"),
  })

  const logs = data?.data ?? []
  const unresolvedCount = logs.filter((l) => !l.resolved).length

  const countByLevel = (lvl: string) => logs.filter((l) => l.level === lvl).length

  return (
    <>
      <Topbar title="Sistema" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(["info", "warn", "error", "critical"] as const).map((level) => {
            const config = levelConfig[level]
            const Icon = config.icon
            const count = countByLevel(level)
            return (
              <Card key={level} className="border-0 shadow-sm">
                <CardContent className="p-3 flex items-center gap-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <div>
                    <p className="font-mono text-xl font-bold">{count}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {level}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Select
              value={levelFilter}
              onValueChange={(v) => {
                if (v) setLevelFilter(v)
              }}
            >
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
              <Badge
                variant="outline"
                className="text-xs text-red-600 border-red-200 dark:text-red-400"
              >
                {unresolvedCount} sin resolver
              </Badge>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Refrescar
          </Button>
        </div>

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
                    <TableHead className="w-[120px] text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-6 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : logs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-12 text-muted-foreground"
                      >
                        Sin logs registrados
                      </TableCell>
                    </TableRow>
                  ) : (
                    logs.map((log) => {
                      const config = levelConfig[log.level] ?? levelConfig.info
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
                            {log.path && (
                              <code className="text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                                {log.method} {log.path}
                              </code>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {format(parseISO(log.createdAt), "d MMM yyyy, HH:mm", {
                              locale: es,
                            })}
                          </TableCell>
                          <TableCell className="text-center">
                            {log.resolved ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mx-auto" />
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 text-[10px]"
                                onClick={() => resolve.mutate(log.id)}
                                disabled={resolve.isPending}
                              >
                                Resolver
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
