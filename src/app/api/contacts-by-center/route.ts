import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const data = await db.contact.groupBy({
      by: ["centerId"],
      _count: { _all: true },
    })

    const centers = await db.center.findMany()
    const centerMap = new Map(centers.map((c) => [c.id, c]))

    const result = data
      .map((d) => {
        const center = d.centerId ? centerMap.get(d.centerId) : null
        return {
          center: center?.name ?? "Sin centro",
          count: d._count._all,
          isWhatsapp: center?.isWhatsapp ?? false,
        }
      })
      .sort((a, b) => b.count - a.count)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[api/contacts-by-center] Error:", error)
    return NextResponse.json({ error: "Error fetching data" }, { status: 500 })
  }
}
