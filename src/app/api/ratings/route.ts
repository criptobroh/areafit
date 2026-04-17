import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(parseInt(sp.get("page") ?? "1", 10), 1)
    const pageSize = Math.min(parseInt(sp.get("pageSize") ?? "25", 10), 100)
    const center = sp.get("center")
    const minScore = sp.get("minScore")
    const hasComment = sp.get("hasComment")

    const where: Prisma.RatingWhereInput = {}
    if (minScore) where.fitiScore = { gte: parseInt(minScore, 10) }
    if (hasComment === "true") where.comment = { not: null }

    // Center filter via contact email lookup
    if (center && center !== "all") {
      const centerRow = await db.center.findUnique({ where: { slug: center } })
      if (centerRow) {
        const emails = await db.contact.findMany({
          where: { centerId: centerRow.id },
          select: { email: true },
        })
        where.contactEmail = { in: emails.map((e) => e.email) }
      }
    }

    const [data, total] = await Promise.all([
      db.rating.findMany({
        where,
        orderBy: { modifiedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.rating.count({ where }),
    ])

    // Enrich with center name
    const emails = Array.from(new Set(data.map((r) => r.contactEmail)))
    const contacts = await db.contact.findMany({
      where: { email: { in: emails } },
      include: { center: { select: { name: true } } },
    })
    const contactMap = new Map(contacts.map((c) => [c.email, c]))

    const result = data.map((r) => ({
      id: r.id,
      contactEmail: r.contactEmail,
      center: contactMap.get(r.contactEmail)?.center?.name ?? "Sin centro",
      fitiScore: r.fitiScore,
      resolvedScore: r.resolvedScore,
      comment: r.comment,
      modifiedAt: r.modifiedAt,
    }))

    return NextResponse.json({
      data: result,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("[api/ratings] Error:", error)
    return NextResponse.json({ error: "Error fetching ratings" }, { status: 500 })
  }
}
