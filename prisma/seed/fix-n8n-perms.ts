/**
 * Re-aplica permisos al rol fiti_writer.
 * Nos conectamos con el OWNER (neondb_owner) y hacemos los GRANTs
 * con un nombre cualificado completo del schema.
 */
import { db } from "./lib/client"

async function main() {
  console.log("[perms] Verificando que rol exista...")
  const exists = await db.$queryRawUnsafe<Array<{ exists: boolean }>>(
    `SELECT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'fiti_writer') AS exists;`
  )
  console.log("[perms] Rol fiti_writer existe:", exists[0].exists)

  // Vemos quien es el owner de la tabla
  const owner = await db.$queryRawUnsafe<Array<{ tableowner: string }>>(
    `SELECT tableowner FROM pg_tables WHERE tablename = 'ratings' AND schemaname = 'public';`
  )
  console.log("[perms] Owner de la tabla ratings:", owner[0]?.tableowner)

  console.log("[perms] Aplicando GRANTs explicitos...")

  // GRANT con ownership-aware: nos aseguramos que el current_user pueda otorgar
  await db.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT INSERT ON TABLE public.ratings TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT SELECT ON TABLE public.contacts TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT SELECT ON TABLE public.centers TO fiti_writer;`)

  // Default privileges para tablas futuras (por si el schema cambia)
  await db.$executeRawUnsafe(
    `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO fiti_writer;`
  )

  console.log("[perms] OK. Verificando permisos efectivos...")
  const grants = await db.$queryRawUnsafe<Array<any>>(`
    SELECT table_schema, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE grantee = 'fiti_writer'
    ORDER BY table_name, privilege_type;
  `)
  console.table(grants)

  // Verificar el ACL real
  const acl = await db.$queryRawUnsafe<Array<{ relname: string; relacl: string }>>(`
    SELECT c.relname, c.relacl::text
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ('ratings', 'contacts', 'centers');
  `)
  console.log("\n[perms] ACL real:")
  console.table(acl)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
