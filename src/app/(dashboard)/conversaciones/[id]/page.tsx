"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChannelBadge } from "@/components/shared/channel-badge"
import { mockConversations, mockConversationMessages } from "@/lib/mock-data"
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
  const conversation = mockConversations.find((c) => c.id === id) || mockConversations[0]

  return (
    <>
      <Topbar title="Detalle de Conversacion" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        {/* Back & Info */}
        <div className="flex items-center gap-3">
          <Link href="/conversaciones">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-heading font-semibold">
              {conversation.contactName}
            </span>
            <ChannelBadge channel={conversation.channel} />
            <Badge variant="outline">{conversation.center}</Badge>
            <Badge variant="secondary">{conversation.category}</Badge>
          </div>
        </div>

        {/* Messages */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4 md:p-6 space-y-4">
            {mockConversationMessages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-3",
                  msg.sender === "fiti" ? "flex-row" : "flex-row-reverse"
                )}
              >
                <div
                  className={cn(
                    "shrink-0 mt-1 rounded-full p-2",
                    msg.sender === "fiti"
                      ? "bg-areafit-teal/10"
                      : "bg-muted"
                  )}
                >
                  {msg.sender === "fiti" ? (
                    <Bot className="h-4 w-4 text-areafit-teal" />
                  ) : (
                    <User className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div
                  className={cn(
                    "max-w-[75%] rounded-xl px-4 py-3",
                    msg.sender === "fiti"
                      ? "bg-muted/50 rounded-tl-sm"
                      : "bg-areafit-teal/10 rounded-tr-sm"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className="mt-1.5 text-[10px] text-muted-foreground">
                    {format(parseISO(msg.timestamp), "d MMM yyyy, HH:mm", {
                      locale: es,
                    })}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
