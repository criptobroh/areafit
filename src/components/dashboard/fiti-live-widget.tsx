"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useFitiLive } from "@/hooks/queries/use-dashboard"
import { formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import { Radio, Bot, User } from "lucide-react"

export function FitiLiveWidget() {
  const { data, isLoading } = useFitiLive()

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
            <Radio className="h-4 w-4 text-[#00AEEF] animate-pulse" />
            Fiti en Vivo
          </CardTitle>
          {data && (
            <Badge variant="outline" className="text-[10px]">
              {data.total.toLocaleString("es-ES")} mensajes en DB en vivo
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))
          ) : !data?.recent?.length ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Sin mensajes recientes
            </p>
          ) : (
            data.recent.slice(0, 10).map((chat) => (
              <div
                key={chat.id}
                className="rounded-lg border border-border/50 p-3 space-y-1.5"
              >
                <div className="flex items-center gap-2 flex-wrap">
                  {chat.source && (
                    <Badge variant="outline" className="text-[10px] h-5">
                      {chat.source}
                    </Badge>
                  )}
                  {chat.user && (
                    <span className="text-xs text-muted-foreground font-mono">
                      @{chat.user}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {formatDistanceToNow(parseISO(chat.createdAt as unknown as string), {
                      addSuffix: true,
                      locale: es,
                    })}
                  </span>
                </div>
                {chat.userText && (
                  <div className="flex gap-2">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                    <p className="text-xs line-clamp-2">{chat.userText}</p>
                  </div>
                )}
                {chat.botReply && (
                  <div className="flex gap-2">
                    <Bot className="h-3.5 w-3.5 text-[#00AEEF] shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {chat.botReply}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
