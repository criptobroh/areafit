/**
 * Live chats from the Supabase DB (read-only).
 * Shows the latest messages from the active Fiti chatbot via n8n.
 */
import { NextResponse } from "next/server"
import { getRecentFitiChats, getFitiChatsCount } from "@/lib/supabase"

export async function GET() {
  try {
    const [chats, total] = await Promise.all([
      getRecentFitiChats(50),
      getFitiChatsCount(),
    ])

    return NextResponse.json({
      total,
      recent: chats.map((c) => ({
        id: c.id,
        createdAt: c.created_at,
        user: c.user,
        source: c.source,
        userText: c.text,
        botReply: c.reply,
      })),
    })
  } catch (error) {
    console.error("[api/fiti-live] Error:", error)
    return NextResponse.json({ error: "Error fetching live chats" }, { status: 500 })
  }
}
