import { Client } from "pg"

// Probamos con DIRECT (sin pooler) y con POOLER
const DIRECT_HOST = "ep-young-wind-am82csxb.c-5.us-east-1.aws.neon.tech"
const POOLER_HOST = "ep-young-wind-am82csxb-pooler.c-5.us-east-1.aws.neon.tech"

async function tryHost(host: string, label: string) {
  console.log(`\n[${label}] Probando ${host}...`)
  const client = new Client({
    host,
    database: "neondb",
    user: "fiti_writer",
    password: "n8nFiti_W0rks2026!",
    ssl: { rejectUnauthorized: false },
  })
  try {
    await client.connect()
    console.log(`[${label}] Conectado`)
    const r = await client.query(
      `INSERT INTO public.ratings
         (id, contact_email, fiti_score, resolved_score, comment, modified_at)
       VALUES
         (gen_random_uuid()::text, $1, $2, $3, $4, NOW())
       RETURNING id, created_at;`,
      ["test-n8n@areafit.es", 4, 5, "TEST INSERT desde " + label]
    )
    console.log(`[${label}] INSERT OK:`, r.rows[0])
    await client.end()
    return true
  } catch (err) {
    console.log(`[${label}] ERROR:`, (err as Error).message)
    try { await client.end() } catch {}
    return false
  }
}

async function main() {
  await tryHost(DIRECT_HOST, "DIRECT")
  await tryHost(POOLER_HOST, "POOLER")
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
