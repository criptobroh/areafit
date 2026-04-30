import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { fitiPool } from "@/lib/supabase"

export async function GET() {
  try {
    // Stats historicas (Neon)
    const [historicalAggregate, historicalDistribution] = await Promise.all([
      db.rating.aggregate({
        _avg: { fitiScore: true, resolvedScore: true },
        _sum: { fitiScore: true, resolvedScore: true },
        _count: {
          _all: true,
          fitiScore: true,
          resolvedScore: true,
        },
        where: {},
      }),
      db.rating.groupBy({
        by: ["fitiScore"],
        _count: { _all: true },
        where: { fitiScore: { not: null } },
        orderBy: { fitiScore: "asc" },
      }),
    ])

    // Stats live (Supabase)
    let liveTotal = 0
    let liveAvgP1 = 0
    let liveAvgP2 = 0
    let liveCountP1 = 0
    let liveCountP2 = 0
    let liveDistribution = new Map<number, number>()

    if (fitiPool) {
      const { rows: agg } = await fitiPool.query<{
        total: string
        sum_p1: string | null
        sum_p2: string | null
        count_p1: string
        count_p2: string
      }>(
        `SELECT
           COUNT(*)::text AS total,
           SUM(pregunta1)::text AS sum_p1,
           SUM(pregunta2)::text AS sum_p2,
           COUNT(pregunta1)::text AS count_p1,
           COUNT(pregunta2)::text AS count_p2
         FROM public.calificaciones`
      )
      liveTotal = parseInt(agg[0].total, 10)
      liveCountP1 = parseInt(agg[0].count_p1, 10)
      liveCountP2 = parseInt(agg[0].count_p2, 10)
      const sumP1 = parseFloat(agg[0].sum_p1 || "0")
      const sumP2 = parseFloat(agg[0].sum_p2 || "0")
      liveAvgP1 = liveCountP1 > 0 ? sumP1 / liveCountP1 : 0
      liveAvgP2 = liveCountP2 > 0 ? sumP2 / liveCountP2 : 0

      const { rows: dist } = await fitiPool.query<{ score: number; count: string }>(
        `SELECT pregunta1::int AS score, COUNT(*)::text AS count
         FROM public.calificaciones
         WHERE pregunta1 IS NOT NULL
         GROUP BY pregunta1
         ORDER BY pregunta1`
      )
      for (const r of dist) {
        liveDistribution.set(r.score, parseInt(r.count, 10))
      }
    }

    // Combinar promedios ponderados (suma total / count total)
    const histSumP1 = historicalAggregate._sum.fitiScore ?? 0
    const histSumP2 = historicalAggregate._sum.resolvedScore ?? 0
    const histCountP1 = historicalAggregate._count.fitiScore ?? 0
    const histCountP2 = historicalAggregate._count.resolvedScore ?? 0

    const combinedSumP1 = histSumP1 + liveAvgP1 * liveCountP1
    const combinedSumP2 = histSumP2 + liveAvgP2 * liveCountP2
    const combinedCountP1 = histCountP1 + liveCountP1
    const combinedCountP2 = histCountP2 + liveCountP2

    const totalCombined = (historicalAggregate._count._all ?? 0) + liveTotal

    // Combinar distribucion
    const combinedDist = new Map<number, number>()
    for (const d of historicalDistribution) {
      if (d.fitiScore !== null) {
        combinedDist.set(d.fitiScore, (combinedDist.get(d.fitiScore) || 0) + d._count._all)
      }
    }
    for (const [score, count] of liveDistribution) {
      combinedDist.set(score, (combinedDist.get(score) || 0) + count)
    }

    return NextResponse.json({
      total: totalCombined,
      historicalTotal: historicalAggregate._count._all ?? 0,
      liveTotal,
      avgFitiScore: combinedCountP1 > 0 ? combinedSumP1 / combinedCountP1 : 0,
      avgResolvedScore: combinedCountP2 > 0 ? combinedSumP2 / combinedCountP2 : 0,
      distribution: Array.from(combinedDist.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([score, count]) => ({ score, count })),
    })
  } catch (error) {
    console.error("[api/ratings/stats] Error:", error)
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
  }
}
