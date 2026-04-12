"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { mockTopicsSummary } from "@/lib/mock-data"
import { MessageCircle, CreditCard, Clock, XCircle } from "lucide-react"

const topicIcons = [MessageCircle, CreditCard, Clock, XCircle]

export function TopicsSummary() {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="font-heading text-base font-semibold">
          Temas de Consulta a Fiti
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mockTopicsSummary.map((topic, i) => {
          const Icon = topicIcons[i % topicIcons.length]
          return (
            <div
              key={topic.topic}
              className="flex items-start gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-muted/50"
            >
              <div className="mt-0.5 rounded-md bg-areafit-teal/10 p-1.5">
                <Icon className="h-4 w-4 text-areafit-teal" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium truncate">{topic.topic}</p>
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-mono text-xs font-medium">
                    {topic.count}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                  {topic.description}
                </p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
