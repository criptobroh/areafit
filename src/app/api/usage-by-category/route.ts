import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const data = await db.message.groupBy({
      by: ["category"],
      _count: { _all: true },
      where: { category: { not: null } },
    })

    const result = data
      .map((d) => ({
        category: d.category ?? "Sin categoria",
        count: d._count._all,
      }))
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/usage-by-category] Error:", error)
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}
