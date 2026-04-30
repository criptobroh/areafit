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

// ── public.calificaciones (reviews live de Fiti via n8n) ──────────────

export type FitiRatingRow = {
  id: number
  created_at: Date
  user: string | null
  pregunta1: number | null   // estrellas - "Como calificarias a Fiti"
  pregunta2: number | null   // estrellas - "Resolvimos tus consultas"
  pregunta3: string | null   // texto libre
}

export async function getFitiRatings(limit = 100): Promise<FitiRatingRow[]> {
  if (!fitiPool) return []
  const { rows } = await fitiPool.query<FitiRatingRow>(
    `SELECT id, created_at, "user", pregunta1, pregunta2, pregunta3
     FROM public.calificaciones
     ORDER BY created_at DESC
     LIMIT $1`,
    [limit]
  )
  return rows
}

export async function getFitiRatingsCount(): Promise<number> {
  if (!fitiPool) return 0
  const { rows } = await fitiPool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM public.calificaciones`
  )
  return parseInt(rows[0].count, 10)
}

export async function getFitiRatingsStats(): Promise<{
  total: number
  avgPregunta1: number
  avgPregunta2: number
  withComment: number
}> {
  if (!fitiPool)
    return { total: 0, avgPregunta1: 0, avgPregunta2: 0, withComment: 0 }
  const { rows } = await fitiPool.query<{
    total: string
    avg_p1: string | null
    avg_p2: string | null
    with_comment: string
  }>(
    `SELECT
       COUNT(*)::text AS total,
       AVG(pregunta1)::text AS avg_p1,
       AVG(pregunta2)::text AS avg_p2,
       COUNT(*) FILTER (WHERE pregunta3 IS NOT NULL AND length(trim(pregunta3)) > 0)::text AS with_comment
     FROM public.calificaciones`
  )
  const r = rows[0]
  return {
    total: parseInt(r.total, 10),
    avgPregunta1: parseFloat(r.avg_p1 || "0"),
    avgPregunta2: parseFloat(r.avg_p2 || "0"),
    withComment: parseInt(r.with_comment, 10),
  }
}
