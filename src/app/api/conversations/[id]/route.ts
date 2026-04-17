import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const conversation = await db.conversation.findUnique({
      where: { id },
      include: {
        center: { select: { name: true, slug: true } },
        messages: {
          orderBy: { createdAt: "asc" },
          select: {
            id: true,
            userText: true,
            botReply: true,
            createdAt: true,
            category: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("[api/conversations/[id]] Error:", error)
    return NextResponse.json({ error: "Error fetching conversation" }, { status: 500 })
  }
}
