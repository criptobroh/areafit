import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  try {
    const days = Math.min(
      parseInt(req.nextUrl.searchParams.get("days") ?? "30", 10),
      365
    )
    const since = new Date()
    since.setDate(since.getDate() - days)

    const result = await db.$queryRaw<
      Array<{ date: string; messages: bigint; conversations: bigint; ratings: bigint }>
    >`
      SELECT
        to_char(d.date, 'YYYY-MM-DD') AS date,
        COALESCE(m.count, 0)::bigint AS messages,
        COALESCE(c.count, 0)::bigint AS conversations,
        COALESCE(r.count, 0)::bigint AS ratings
      FROM generate_series(
        ${since}::date,
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(date)
      LEFT JOIN (
        SELECT DATE(created_at) AS date, COUNT(*) AS count
        FROM messages
        WHERE created_at >= ${since}
        GROUP BY DATE(created_at)
      ) m ON m.date = d.date
      LEFT JOIN (
        SELECT DATE(first_message_at) AS date, COUNT(*) AS count
        FROM conversations
        WHERE first_message_at >= ${since}
        GROUP BY DATE(first_message_at)
      ) c ON c.date = d.date
      LEFT JOIN (
        SELECT DATE(modified_at) AS date, COUNT(*) AS count
        FROM ratings
        WHERE modified_at >= ${since}
        GROUP BY DATE(modified_at)
      ) r ON r.date = d.date
      ORDER BY d.date ASC
    `

    const serialized = result.map((row) => ({
      date: row.date,
      messages: Number(row.messages),
      conversations: Number(row.conversations),
      ratings: Number(row.ratings),
    }))

    return NextResponse.json(serialized)
  } catch (error) {
    console.error("[api/trends] Error:", error)
    return NextResponse.json({ error: "Error fetching trends" }, { status: 500 })
  }
}
