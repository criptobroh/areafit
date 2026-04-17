import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendMagicLinkEmail } from "@/lib/auth/send-magic-link";
import { createMagicLinkToken } from "@/lib/auth/magic-link";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await db.backofficeUser.findUnique({
      where: { email: normalizedEmail, active: true },
    });

    // Always return success to prevent email enumeration
    if (user) {
      if (!process.env.RESEND_API_KEY) {
        // Dev mode: no Resend key, generate direct login URL
        console.warn("[DEV] RESEND_API_KEY not set — generating direct login token");
        const token = await createMagicLinkToken(user.email);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const devLoginUrl = `${appUrl}/api/auth/magic-link/verify?token=${token}`;
        console.log(`[DEV] Magic link for ${user.email}: ${devLoginUrl}`);

        return NextResponse.json({
          ok: true,
          message: "Si tu email está registrado, recibirás un link de acceso.",
          // Only include devUrl when RESEND_API_KEY is missing (development)
          devUrl: devLoginUrl,
        });
      }

      await sendMagicLinkEmail(user.email, user.firstName);
    }

    return NextResponse.json({
      ok: true,
      message: "Si tu email está registrado, recibirás un link de acceso.",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Login failed: ${msg}`, { path: "/api/auth/login", method: "POST" }, error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud", detail: msg },
      { status: 500 }
    );
  }
}
