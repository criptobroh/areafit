"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { useConversation } from "@/hooks/queries/use-data"
import { ArrowLeft, Bot, User } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import Link from "next/link"
import { use } from "react"
import { cn } from "@/lib/utils"

export default function ConversacionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data: conv, isLoading } = useConversation(id)

  return (
    <>
      <Topbar title="Detalle de Conversacion" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex items-center gap-3">
          <Link href="/conversaciones">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {isLoading ? (
            <Skeleton className="h-6 w-64" />
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-semibold">
                {conv?.contactEmail ?? "(sin email)"}
              </span>
              {conv && <ChannelBadge channel={conv.channel} />}
              {conv?.center?.name && (
                <Badge variant="outline">{conv.center.name}</Badge>
              )}
              {conv?.category && (
                <Badge variant="secondary">{conv.category}</Badge>
              )}
            </div>
          )}
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-6 space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            ) : !conv?.messages?.length ? (
              <p className="text-center text-muted-foreground py-8">
                Sin mensajes en esta conversacion
              </p>
            ) : (
              conv.messages.map((msg) => (
                <div key={msg.id} className="space-y-2">
                  {msg.userText && (
                    <div className="flex gap-3 flex-row-reverse">
                      <div className="shrink-0 mt-1 rounded-full bg-muted p-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="max-w-[75%] rounded-xl rounded-tr-sm bg-[#00AEEF]/10 px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.userText}</p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          {format(parseISO(msg.createdAt as unknown as string), "d MMM yyyy, HH:mm", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  {msg.botReply && (
                    <div className="flex gap-3">
                      <div className="shrink-0 mt-1 rounded-full bg-[#00AEEF]/10 p-2">
                        <Bot className="h-4 w-4 text-[#00AEEF]" />
                      </div>
                      <div className="max-w-[75%] rounded-xl rounded-tl-sm bg-muted/50 px-4 py-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.botReply}</p>
                        <p className="mt-1.5 text-[10px] text-muted-foreground">
                          {format(parseISO(msg.createdAt as unknown as string), "d MMM yyyy, HH:mm", {
                            locale: es,
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
