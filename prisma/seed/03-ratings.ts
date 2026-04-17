import { db } from "./lib/client"
import { cleanRating, normalizeEmail, trimOrNull, parseCsvDate } from "./lib/clean"
import Papa from "papaparse"
import fs from "fs"
import path from "path"

type Row = {
  pregunta1: string
  pregunta2: string
  pregunta3: string
  user: string
  "Modified Date": string
}

export async function seedRatings() {
  console.log("[ratings] Parsing ratings.csv...")
  const csvPath = path.resolve("prisma/seed/csv/ratings.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const parsed = Papa.parse<Row>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  console.log(`[ratings] Found ${parsed.data.length} rows`)

  const BATCH_SIZE = 500
  let batch: Array<{
    contactEmail: string
    fitiScore: number | null
    resolvedScore: number | null
    rawFitiScore: number | null
    rawResolvedScore: number | null
    comment: string | null
    modifiedAt: Date
  }> = []
  let total = 0
  let skipped = 0

  for (const row of parsed.data) {
    const email = normalizeEmail(row.user)
    const modifiedAt = parseCsvDate(row["Modified Date"])
    if (!email || !modifiedAt) {
      skipped++
      continue
    }

    const fiti = cleanRating(row.pregunta1)
    const resolved = cleanRating(row.pregunta2)
    const comment = trimOrNull(row.pregunta3)

    batch.push({
      contactEmail: email,
      fitiScore: fiti.clean,
      resolvedScore: resolved.clean,
      rawFitiScore: fiti.raw,
      rawResolvedScore: resolved.raw,
      comment,
      modifiedAt,
    })

    if (batch.length >= BATCH_SIZE) {
      await db.rating.createMany({ data: batch })
      total += batch.length
      console.log(`[ratings] Inserted ${total}...`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await db.rating.createMany({ data: batch })
    total += batch.length
  }

  console.log(`[ratings] Done. Inserted ${total} ratings, skipped ${skipped}`)
}

if (require.main === module) {
  seedRatings()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
