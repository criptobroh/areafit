"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { useConversations } from "@/hooks/queries/use-data"
import { Search, MessageSquareText, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function ConversacionesPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useConversations({ page, search })

  return (
    <>
      <Topbar title="Conversaciones" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por email o mensaje..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-9 h-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {isLoading ? "Cargando..." : `${data?.total.toLocaleString("es-ES")} conversaciones`}
          </p>
        </div>

        <div className="space-y-2 stagger-children">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            : data?.data.map((conv) => (
                <Link key={conv.id} href={`/conversaciones/${conv.id}`}>
                  <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-1px]">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="mt-0.5 rounded-lg bg-[#00AEEF]/10 p-2">
                            <MessageSquareText className="h-4 w-4 text-[#00AEEF]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-sm truncate">
                                {conv.contactEmail ?? "(sin email)"}
                              </span>
                              <ChannelBadge channel={conv.channel} />
                              {conv.center?.name && (
                                <Badge variant="outline" className="text-[10px] h-5">
                                  {conv.center.name}
                                </Badge>
                              )}
                            </div>
                            {conv.lastUserText && (
                              <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                                {conv.lastUserText}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <MessageSquareText className="h-3 w-3" />
                                {conv.messageCount} mensajes
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {format(parseISO(conv.lastMessageAt as unknown as string), "d MMM yyyy", {
                                  locale: es,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        {conv.category && (
                          <Badge variant="secondary" className="shrink-0 text-[10px] h-5">
                            {conv.category}
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>

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
