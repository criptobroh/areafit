import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

// Rate limit: max 20 logs per IP per minute
const ipCounts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = ipCounts.get(ip);
  if (!entry || now > entry.resetAt) {
    ipCounts.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  entry.count++;
  return entry.count > 20;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { level, message, stack, context } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const logContext = {
      source: "client",
      ...(context ?? {}),
    };

    switch (level) {
      case "critical":
        logger.critical(message, logContext, stack ? { stack } : undefined);
        break;
      case "error":
        logger.error(message, logContext, stack ? { stack } : undefined);
        break;
      case "warn":
        logger.warn(message, logContext);
        break;
      default:
        logger.info(message, logContext);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
