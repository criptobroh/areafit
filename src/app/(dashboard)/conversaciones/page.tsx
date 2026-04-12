"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { mockConversations } from "@/lib/mock-data"
import { Search, MessageSquareText, Clock } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"

export default function ConversacionesPage() {
  const [search, setSearch] = useState("")

  const filtered = mockConversations.filter(
    (c) =>
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <>
      <Topbar title="Conversaciones" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        {/* Search & Stats */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversaciones..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            {filtered.length} conversaciones
          </p>
        </div>

        {/* Conversation List */}
        <div className="space-y-2 stagger-children">
          {filtered.map((conv) => (
            <Link key={conv.id} href={`/conversaciones/${conv.id}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer hover:translate-y-[-1px]">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="mt-0.5 rounded-lg bg-areafit-teal/10 p-2">
                        <MessageSquareText className="h-4 w-4 text-areafit-teal" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">
                            {conv.contactName}
                          </span>
                          <ChannelBadge channel={conv.channel} />
                          <Badge variant="outline" className="text-[10px] h-5">
                            {conv.center}
                          </Badge>
                          {conv.status === "active" && (
                            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {conv.lastMessage}
                        </p>
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageSquareText className="h-3 w-3" />
                            {conv.messageCount} mensajes
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(conv.startedAt), "d MMM yyyy", {
                              locale: es,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="shrink-0 text-[10px] h-5"
                    >
                      {conv.category}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
