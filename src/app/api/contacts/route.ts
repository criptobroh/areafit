import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(parseInt(sp.get("page") ?? "1", 10), 1)
    const pageSize = Math.min(parseInt(sp.get("pageSize") ?? "25", 10), 100)
    const center = sp.get("center")
    const search = sp.get("search")

    const where: Prisma.ContactWhereInput = {}
    if (center && center !== "all") {
      const centerRow = await db.center.findUnique({ where: { slug: center } })
      if (centerRow) where.centerId = centerRow.id
    }
    if (search) {
      where.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { manychatId: { contains: search, mode: "insensitive" } },
      ]
    }

    const [data, total] = await Promise.all([
      db.contact.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          center: { select: { name: true, isWhatsapp: true } },
          _count: { select: { messages: true } },
        },
      }),
      db.contact.count({ where }),
    ])

    // For each contact, fetch latest rating (avg fiti score)
    const emails = data.map((c) => c.email)
    const ratings = await db.rating.groupBy({
      by: ["contactEmail"],
      where: { contactEmail: { in: emails }, fitiScore: { not: null } },
      _avg: { fitiScore: true },
    })
    const ratingMap = new Map(ratings.map((r) => [r.contactEmail, r._avg.fitiScore]))

    const result = data.map((c) => ({
      id: c.id,
      manychatId: c.manychatId,
      email: c.email,
      center: c.center?.name ?? "Sin centro",
      channel: c.center?.isWhatsapp ? "whatsapp" : "instagram",
      messageCount: c._count.messages,
      avgFitiScore: ratingMap.get(c.email) ?? null,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("[api/contacts] Error:", error)
    return NextResponse.json({ error: "Error fetching contacts" }, { status: 500 })
  }
}
