/**
 * Reviews live de Fiti desde Supabase (public.calificaciones).
 * Insertadas por n8n cuando un usuario completa el feedback.
 */
import { NextResponse } from "next/server"
import { getFitiRatings, getFitiRatingsStats } from "@/lib/supabase"

export async function GET() {
  try {
    const [reviews, stats] = await Promise.all([
      getFitiRatings(100),
      getFitiRatingsStats(),
    ])

    return NextResponse.json({
      total: stats.total,
      avgFitiScore: stats.avgPregunta1,        // pregunta1 = "Como calificarias a Fiti"
      avgResolvedScore: stats.avgPregunta2,    // pregunta2 = "Resolvimos tus consultas"
      withComment: stats.withComment,
      data: reviews.map((r) => ({
        id: String(r.id),
        contactUser: r.user,
        fitiScore: r.pregunta1,
        resolvedScore: r.pregunta2,
        comment: r.pregunta3,
        createdAt: r.created_at,
      })),
    })
  } catch (error) {
    console.error("[api/fiti-reviews] Error:", error)
    return NextResponse.json({ error: "Error fetching live reviews" }, { status: 500 })
  }
}
