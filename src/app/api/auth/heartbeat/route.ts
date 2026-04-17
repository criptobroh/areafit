import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifySessionToken } from "@/lib/auth/session"
import { resolveRealEmail } from "@/lib/auth/resolve-real-email"

export async function POST(req: NextRequest) {
  const token = req.cookies.get("areafit-session")?.value
  if (!token) return NextResponse.json({ ok: false }, { status: 401 })

  const session = await verifySessionToken(token)
  if (!session) return NextResponse.json({ ok: false }, { status: 401 })

  const emailToUpdate = resolveRealEmail(session)

  const user = await db.backofficeUser.findUnique({
    where: { email: emailToUpdate },
    select: { id: true },
  })

  if (!user) return NextResponse.json({ ok: false }, { status: 404 })

  await db.backofficeUser.update({
    where: { id: user.id },
    data: { lastSeenAt: new Date() },
  })

  return NextResponse.json({ ok: true })
}
