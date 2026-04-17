import type { NextRequest } from "next/server";

/**
 * Extract user email from JWT cookie without full verification.
 * Used for logging context — not for auth decisions.
 */
export function extractUserEmail(request: NextRequest): string | undefined {
  try {
    const token = request.cookies.get("areafit-session")?.value;
    if (!token) return undefined;
    // JWT = header.payload.signature — decode payload (base64url)
    const parts = token.split(".");
    if (parts.length !== 3) return undefined;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8")
    );
    return payload.email ?? undefined;
  } catch {
    return undefined;
  }
}
