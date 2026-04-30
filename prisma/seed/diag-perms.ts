import { Client } from "pg"

async function main() {
  const client = new Client({
    host: "ep-young-wind-am82csxb-pooler.c-5.us-east-1.aws.neon.tech",
    database: "neondb",
    user: "neondb_owner",
    password: "npg_DZHQtO8FCVe2",
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  const r = await client.query(`
    SELECT relname, relrowsecurity AS rls_enabled
    FROM pg_class WHERE relname = 'ratings';
  `)
  console.log("RLS enabled:", r.rows)

  const sch = await client.query(`
    SELECT has_schema_privilege('fiti_writer', 'public', 'USAGE') AS has_usage;
  `)
  console.log("Schema USAGE:", sch.rows)

  const can = await client.query(`
    SELECT has_table_privilege('fiti_writer', 'public.ratings', 'INSERT') AS can_insert;
  `)
  console.log("fiti_writer puede INSERT en ratings:", can.rows)

  // Existe la extension pgcrypto? (para gen_random_uuid)
  const ext = await client.query(`
    SELECT extname FROM pg_extension WHERE extname IN ('pgcrypto', 'uuid-ossp');
  `)
  console.log("Extensions:", ext.rows)

  await client.end()
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
