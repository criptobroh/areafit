"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ChannelBadge } from "@/components/shared/channel-badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { mockContacts } from "@/lib/mock-data"
import { Search, Star } from "lucide-react"
import { AnimatedCounter } from "@/components/shared/animated-counter"

export default function ContactosPage() {
  const [search, setSearch] = useState("")

  const filtered = mockContacts.filter(
    (c) =>
      c.user.toLowerCase().includes(search.toLowerCase()) ||
      c.center.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Topbar title="Contactos" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-baseline gap-2">
            <AnimatedCounter
              value={30509}
              className="font-heading text-2xl font-bold"
            />
            <span className="text-sm text-muted-foreground">contactos totales</span>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Telefono o Cuenta de Instagram..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Usuario</TableHead>
                    <TableHead>Procedencia</TableHead>
                    <TableHead className="text-center">Mensajes con Fiti</TableHead>
                    <TableHead className="text-center">Calificacion</TableHead>
                    <TableHead className="w-[100px]">Canal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((contact) => (
                    <TableRow
                      key={contact.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell className="font-medium text-sm">
                        {contact.user}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {contact.center}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center font-mono text-sm">
                        {contact.messageCount > 0
                          ? contact.messageCount
                          : "No hay mensajes"}
                      </TableCell>
                      <TableCell className="text-center">
                        {contact.rating ? (
                          <div className="flex items-center justify-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3.5 w-3.5 ${
                                  i < contact.rating!
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
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
      </div>
    </>
  )
}
