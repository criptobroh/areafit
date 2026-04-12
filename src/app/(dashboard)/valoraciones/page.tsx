"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import { mockKPIs, mockRatings } from "@/lib/mock-data"
import { Star, MessageSquareQuote } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

function StarDisplay({ score, size = "sm" }: { score: number; size?: "sm" | "md" }) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5"
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < score
              ? "fill-yellow-400 text-yellow-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}

export default function ValoracionesPage() {
  return (
    <>
      <Topbar title="Valoraciones" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Total Valoraciones
              </p>
              <AnimatedCounter
                value={mockKPIs.totalRatings}
                className="font-mono text-3xl font-bold"
              />
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Resolvimos las consultas?
              </p>
              <div className="flex items-center justify-center gap-2">
                <StarDisplay score={Math.round(mockKPIs.avgResolvedScore)} size="md" />
                <span className="font-mono text-2xl font-bold ml-1">
                  {mockKPIs.avgResolvedScore.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Como calificarias a Fiti?
              </p>
              <div className="flex items-center justify-center gap-2">
                <StarDisplay score={Math.round(mockKPIs.avgFitiScore)} size="md" />
                <span className="font-mono text-2xl font-bold ml-1">
                  {mockKPIs.avgFitiScore.toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">
              Resenas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockRatings.map((rating) => (
              <div
                key={rating.id}
                className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-sm font-medium">
                        {rating.contactName}
                      </span>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {rating.center}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(rating.createdAt), "d MMM yyyy", {
                          locale: es,
                        })}
                      </span>
                    </div>
                    {rating.comment && (
                      <div className="flex gap-2 items-start mt-2">
                        <MessageSquareQuote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                        <p className="text-sm text-muted-foreground italic">
                          &ldquo;{rating.comment}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 space-y-1.5 text-right">
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Resolucion
                      </p>
                      <StarDisplay score={rating.resolvedScore} />
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground mb-0.5">
                        Fiti
                      </p>
                      <StarDisplay score={rating.fitiScore} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
