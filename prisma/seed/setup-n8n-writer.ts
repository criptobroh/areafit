/**
 * Crea un rol Postgres `fiti_writer` con permisos:
 *   - INSERT en public.ratings
 *   - SELECT en public.contacts (para validar contactEmail si quieren)
 * Sin acceso al resto de tablas.
 */
import { db } from "./lib/client"

async function main() {
  const password = "n8nFiti_W0rks2026!"

  console.log("[setup] Creando rol fiti_writer...")

  await db.$executeRawUnsafe(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fiti_writer') THEN
        CREATE ROLE fiti_writer WITH LOGIN PASSWORD '${password}';
      ELSE
        ALTER ROLE fiti_writer WITH PASSWORD '${password}';
      END IF;
    END $$;
  `)

  // Permisos
  await db.$executeRawUnsafe(`GRANT CONNECT ON DATABASE neondb TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT USAGE ON SCHEMA public TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT INSERT ON public.ratings TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT SELECT ON public.contacts TO fiti_writer;`)
  await db.$executeRawUnsafe(`GRANT SELECT ON public.centers TO fiti_writer;`)

  console.log(`[setup] OK. Connection string para n8n:`)
  console.log(
    `postgresql://fiti_writer:${password}@ep-young-wind-am82csxb-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require`
  )

  // Verifica que SELECT en ratings este bloqueado
  console.log("[setup] Verificacion - permisos de fiti_writer:")
  const perms = await db.$queryRawUnsafe<Array<{ table_name: string; privilege_type: string }>>(`
    SELECT table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE grantee = 'fiti_writer'
    ORDER BY table_name, privilege_type;
  `)
  console.table(perms)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
