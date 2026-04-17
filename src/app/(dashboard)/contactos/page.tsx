"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ChannelBadge } from "@/components/shared/channel-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useContacts } from "@/hooks/queries/use-data"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { Search, Star } from "lucide-react"

export default function ContactosPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useContacts({ page, search })

  return (
    <>
      <Topbar title="Contactos" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-baseline gap-2">
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <AnimatedCounter
                value={data?.total ?? 0}
                className="font-heading text-2xl font-bold"
              />
            )}
            <span className="text-sm text-muted-foreground">contactos totales</span>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Email o ManyChat ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Procedencia</TableHead>
                    <TableHead className="text-center">Mensajes</TableHead>
                    <TableHead className="text-center">Puntuacion Fiti</TableHead>
                    <TableHead className="w-[120px]">Canal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading
                    ? Array.from({ length: 10 }).map((_, i) => (
                        <TableRow key={i}>
                          <TableCell colSpan={5}>
                            <Skeleton className="h-6 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : data?.data.map((contact) => (
                        <TableRow key={contact.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium text-sm">
                            {contact.email}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {contact.center}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-mono text-sm">
                            {contact.messageCount > 0 ? contact.messageCount : "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            {contact.avgFitiScore ? (
                              <div className="flex items-center justify-center gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3.5 w-3.5 ${
                                      i < Math.round(contact.avgFitiScore!)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-muted text-muted"
                                    }`}
                                  />
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <ChannelBadge channel={contact.channel} />
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm rounded-md border disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Pagina {page} de {data.totalPages}
            </span>
            <button
              disabled={page >= data.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-3 py-1 text-sm rounded-md border disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        )}
      </div>
    </>
  )
}
