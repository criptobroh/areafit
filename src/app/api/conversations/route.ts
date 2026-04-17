import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams
    const page = Math.max(parseInt(sp.get("page") ?? "1", 10), 1)
    const pageSize = Math.min(parseInt(sp.get("pageSize") ?? "25", 10), 100)
    const center = sp.get("center")
    const category = sp.get("category")
    const channel = sp.get("channel")
    const search = sp.get("search")

    const where: Prisma.ConversationWhereInput = {}
    if (center && center !== "all") {
      const centerRow = await db.center.findUnique({ where: { slug: center } })
      if (centerRow) where.centerId = centerRow.id
    }
    if (category && category !== "all") where.category = category
    if (channel && channel !== "all") where.channel = channel
    if (search) {
      where.OR = [
        { contactEmail: { contains: search, mode: "insensitive" } },
        { lastUserText: { contains: search, mode: "insensitive" } },
      ]
    }

    const [data, total] = await Promise.all([
      db.conversation.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          center: { select: { name: true } },
        },
      }),
      db.conversation.count({ where }),
    ])

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error("[api/conversations] Error:", error)
    return NextResponse.json({ error: "Error fetching conversations" }, { status: 500 })
  }
}
