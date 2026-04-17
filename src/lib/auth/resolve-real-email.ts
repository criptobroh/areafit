import type { BackofficeSession } from "./types";

/**
 * Returns the real operator email from a session.
 * When impersonating, returns originalEmail (the real person doing the action).
 * Otherwise returns session.email.
 *
 * Use this in API routes to resolve the actual backoffice user performing actions.
 */
export function resolveRealEmail(session: Pick<BackofficeSession, "email" | "impersonating" | "originalEmail">): string {
  return session.impersonating && session.originalEmail
    ? session.originalEmail
    : session.email;
}
