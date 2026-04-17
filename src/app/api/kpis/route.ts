import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const [totalContacts, totalMessages, totalConversations, totalRatings, avgScores] =
      await Promise.all([
        db.contact.count(),
        db.message.count(),
        db.conversation.count(),
        db.rating.count(),
        db.rating.aggregate({
          _avg: { fitiScore: true, resolvedScore: true },
          where: { fitiScore: { not: null } },
        }),
      ])

    return NextResponse.json({
      totalContacts,
      totalMessages,
      totalConversations,
      totalRatings,
      avgFitiScore: avgScores._avg.fitiScore ?? 0,
      avgResolvedScore: avgScores._avg.resolvedScore ?? 0,
    })
  } catch (error) {
    console.error("[api/kpis] Error:", error)
    return NextResponse.json({ error: "Error fetching KPIs" }, { status: 500 })
  }
}
