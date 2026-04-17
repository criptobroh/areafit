/**
 * Read-only connection to the AreaFit Supabase DB
 * (public.chats = live data from n8n Fiti Chat workflow)
 *
 * Schema:
 *   id bigint PK, created_at timestamptz, "user" text (ManyChat handle),
 *   source text (center), text text (user msg), reply text (bot msg)
 *
 * IMPORTANT: "user" is a reserved SQL word - always quote it.
 * This pool has ONLY SELECT permissions on public.chats.
 */

import { Pool } from "pg"

declare global {
  // eslint-disable-next-line no-var
  var _fitiPool: Pool | undefined
}

function createPool() {
  const connectionString = process.env.DATABASE_URL_READONLY
  if (!connectionString) {
    console.warn("[supabase] DATABASE_URL_READONLY not set - live chat data unavailable")
    return null
  }
  // Parse URL manually and strip sslmode so our explicit ssl config is the source of truth
  const url = new URL(connectionString)
  return new Pool({
    host: url.hostname,
    port: parseInt(url.port || "5432", 10),
    database: url.pathname.slice(1),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    // Supabase pooler uses self-signed cert; this is the standard workaround
    ssl: {
      rejectUnauthorized: false,
      checkServerIdentity: () => undefined,
    },
    max: 3,
    idleTimeoutMillis: 10_000,
  })
}

export const fitiPool: Pool | null = global._fitiPool ?? createPool()

if (process.env.NODE_ENV !== "production" && fitiPool) {
  global._fitiPool = fitiPool
}

export type FitiChatRow = {
  id: number
  created_at: Date
  user: string | null
  source: string | null
  text: string | null
  reply: string | null
}

export async function getRecentFitiChats(limit = 50): Promise<FitiChatRow[]> {
  if (!fitiPool) return []
  const { rows } = await fitiPool.query<FitiChatRow>(
    `SELECT id, created_at, "user", source, text, reply
     FROM public.chats
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  )
  return rows
}

export async function getFitiChatsCount(): Promise<number> {
  if (!fitiPool) return 0
  const { rows } = await fitiPool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM public.chats`
  )
  return parseInt(rows[0].count, 10)
}

export async function getFitiChatsByContact(contactId: string, limit = 100): Promise<FitiChatRow[]> {
  if (!fitiPool) return []
  const { rows } = await fitiPool.query<FitiChatRow>(
    `SELECT id, created_at, "user", source, text, reply
     FROM public.chats
     WHERE "user" = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [contactId, limit]
  )
  return rows
}
