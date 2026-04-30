"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { AnimatedCounter } from "@/components/shared/animated-counter"
import {
  useRatings,
  useRatingStats,
  useFitiReviews,
} from "@/hooks/queries/use-data"
import { Star, MessageSquareQuote, Radio } from "lucide-react"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

function StarDisplay({
  score,
  size = "sm",
}: {
  score: number | null
  size?: "sm" | "md"
}) {
  const iconSize = size === "md" ? "h-5 w-5" : "h-3.5 w-3.5"
  if (score === null) {
    return <span className="text-xs text-muted-foreground">—</span>
  }
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${iconSize} ${
            i < score ? "fill-yellow-400 text-yellow-400" : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  )
}

export default function ValoracionesPage() {
  const [page, setPage] = useState(1)
  const { data: stats } = useRatingStats()
  const { data: live, isLoading: liveLoading } = useFitiReviews()
  const { data: historical, isLoading: historicalLoading } = useRatings({
    page,
    hasComment: true,
  })

  return (
    <>
      <Topbar title="Valoraciones" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">
        {/* Stats Cards combinadas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 stagger-children">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Total Valoraciones</p>
              <AnimatedCounter
                value={stats?.total ?? 0}
                className="font-mono text-3xl font-bold"
              />
              <div className="mt-2 flex items-center justify-center gap-2 text-[10px] text-muted-foreground">
                <span>{stats?.historicalTotal?.toLocaleString("es-ES") ?? 0} historico</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Radio className="h-3 w-3 text-[#00AEEF] animate-pulse" />
                  {stats?.liveTotal ?? 0} en vivo
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Resolvimos tus consultas?</p>
              <div className="flex items-center justify-center gap-2">
                <StarDisplay
                  score={Math.round(stats?.avgResolvedScore ?? 0)}
                  size="md"
                />
                <span className="font-mono text-2xl font-bold ml-1">
                  {(stats?.avgResolvedScore ?? 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5 text-center">
              <p className="text-sm text-muted-foreground mb-2">Como calificarias a Fiti?</p>
              <div className="flex items-center justify-center gap-2">
                <StarDisplay score={Math.round(stats?.avgFitiScore ?? 0)} size="md" />
                <span className="font-mono text-2xl font-bold ml-1">
                  {(stats?.avgFitiScore ?? 0).toFixed(2)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Reviews (Supabase / n8n) */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-heading text-base font-semibold flex items-center gap-2">
                <Radio className="h-4 w-4 text-[#00AEEF] animate-pulse" />
                En Vivo desde Fiti
              </CardTitle>
              {live && (
                <Badge variant="outline" className="text-[10px]">
                  {live.total} valoraciones
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {liveLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))
            ) : !live?.data?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aun no hay valoraciones en vivo. Apareceran aqui cuando los usuarios respondan a Fiti.
              </p>
            ) : (
              live.data.map((rating) => (
                <div
                  key={`live-${rating.id}`}
                  className="rounded-lg border border-[#00AEEF]/20 bg-[#00AEEF]/5 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <Badge
                          variant="outline"
                          className="text-[9px] h-4 px-1.5 bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]/30"
                        >
                          EN VIVO
                        </Badge>
                        <span className="text-sm font-mono">
                          @{rating.contactUser ?? "anonimo"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(parseISO(rating.createdAt), {
                            addSuffix: true,
                            locale: es,
                          })}
                        </span>
                      </div>
                      {rating.comment && (
                        <div className="flex gap-2 items-start mt-2">
                          <MessageSquareQuote className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                          <p className="text-sm text-foreground/80 italic">
                            &ldquo;{rating.comment}&rdquo;
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 space-y-1.5 text-right">
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Fiti</p>
                        <StarDisplay score={rating.fitiScore} />
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground mb-0.5">Resolucion</p>
                        <StarDisplay score={rating.resolvedScore} />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Historical reviews */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="font-heading text-base font-semibold">
              Resenas Historicas (con comentario)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {historicalLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full" />
                ))
              : historical?.data.map((rating) => (
                  <div
                    key={rating.id}
                    className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-sm font-medium truncate">
                            {rating.contactEmail}
                          </span>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {rating.center}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              parseISO(rating.modifiedAt as unknown as string),
                              "d MMM yyyy",
                              { locale: es }
                            )}
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
                          <p className="text-[10px] text-muted-foreground mb-0.5">Fiti</p>
                          <StarDisplay score={rating.fitiScore} />
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground mb-0.5">Resolucion</p>
                          <StarDisplay score={rating.resolvedScore} />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        {historical && historical.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 text-sm rounded-md border disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="text-sm text-muted-foreground">
              Pagina {page} de {historical.totalPages}
            </span>
            <button
              disabled={page >= historical.totalPages}
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
