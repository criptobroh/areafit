import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [totals, distribution] = await Promise.all([
      db.rating.aggregate({
        _avg: { fitiScore: true, resolvedScore: true },
        _count: { _all: true },
        where: { fitiScore: { not: null } },
      }),
      db.rating.groupBy({
        by: ["fitiScore"],
        _count: { _all: true },
        where: { fitiScore: { not: null } },
        orderBy: { fitiScore: "asc" },
      }),
    ])

    return NextResponse.json({
      total: totals._count._all,
      avgFitiScore: totals._avg.fitiScore ?? 0,
      avgResolvedScore: totals._avg.resolvedScore ?? 0,
      distribution: distribution.map((d) => ({
        score: d.fitiScore,
        count: d._count._all,
      })),
    })
  } catch (error) {
    console.error("[api/ratings/stats] Error:", error)
    return NextResponse.json({ error: "Error fetching stats" }, { status: 500 })
  }
}
