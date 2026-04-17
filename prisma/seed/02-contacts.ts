import { db } from "./lib/client"
import { normalizeEmail, trimOrNull, slugify } from "./lib/clean"
import Papa from "papaparse"
import fs from "fs"
import path from "path"

type Row = {
  "id-manychat": string
  procedencia: string
  email: string
}

export async function seedContacts() {
  console.log("[contacts] Loading centers...")
  const centers = await db.center.findMany()
  const centerBySlug = new Map(centers.map((c) => [c.slug, c.id]))

  console.log("[contacts] Parsing users.csv...")
  const csvPath = path.resolve("prisma/seed/csv/users.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const parsed = Papa.parse<Row>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  console.log(`[contacts] Found ${parsed.data.length} rows`)

  const BATCH_SIZE = 1000
  let batch: Array<{
    manychatId: string | null
    email: string
    centerId: string | null
  }> = []
  const seenEmails = new Set<string>()
  let total = 0
  let skipped = 0

  for (const row of parsed.data) {
    const email = normalizeEmail(row.email)
    if (!email) {
      skipped++
      continue
    }
    if (seenEmails.has(email)) {
      skipped++
      continue
    }
    seenEmails.add(email)

    const manychatId = trimOrNull(row["id-manychat"])
    const procedencia = trimOrNull(row.procedencia)
    const centerId = procedencia ? centerBySlug.get(slugify(procedencia)) ?? null : null

    batch.push({ manychatId, email, centerId })

    if (batch.length >= BATCH_SIZE) {
      await db.contact.createMany({
        data: batch,
        skipDuplicates: true,
      })
      total += batch.length
      console.log(`[contacts] Inserted ${total}...`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await db.contact.createMany({ data: batch, skipDuplicates: true })
    total += batch.length
  }

  console.log(`[contacts] Done. Inserted ${total} contacts, skipped ${skipped}`)
}

if (require.main === module) {
  seedContacts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
