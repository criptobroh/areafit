import { db } from "./lib/client"

async function main() {
  const r = await db.$queryRawUnsafe<Array<any>>(`
    SELECT id, contact_email, fiti_score, resolved_score, comment, modified_at, created_at
    FROM ratings
    ORDER BY created_at DESC
    LIMIT 10;
  `)
  console.log("Ultimas 10 ratings ordenadas por created_at DESC:")
  console.table(
    r.map((x) => ({
      email: x.contact_email,
      fiti: x.fiti_score,
      resolved: x.resolved_score,
      comment: (x.comment || "").slice(0, 30),
      created_at: x.created_at,
    }))
  )

  const recent = await db.$queryRawUnsafe<Array<any>>(
    `SELECT COUNT(*)::int as c FROM ratings WHERE created_at > NOW() - INTERVAL '7 days';`
  )
  console.log("\nRatings creadas ultimos 7 dias:", recent[0].c)

  const today = await db.$queryRawUnsafe<Array<any>>(
    `SELECT COUNT(*)::int as c FROM ratings WHERE created_at > NOW() - INTERVAL '24 hours';`
  )
  console.log("Ratings creadas ultimas 24h:", today[0].c)

  const all = await db.$queryRawUnsafe<Array<any>>(`SELECT COUNT(*)::int as c FROM ratings;`)
  console.log("Total ratings:", all[0].c)
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
