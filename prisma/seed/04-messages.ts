import { db } from "./lib/client"
import { normalizeEmail, trimOrNull, parseCsvDate } from "./lib/clean"
import { categorize } from "./lib/categorize"
import Papa from "papaparse"
import fs from "fs"
import path from "path"

type Row = {
  reply: string
  text: string
  user: string
  "Creation Date": string
  "Modified Date": string
}

export async function seedMessages() {
  console.log("[messages] Loading contact email->id map...")
  const contacts = await db.contact.findMany({ select: { id: true, email: true } })
  const contactByEmail = new Map(contacts.map((c) => [c.email, c.id]))
  console.log(`[messages] Loaded ${contactByEmail.size} contacts`)

  console.log("[messages] Parsing messages.csv (this may take a while)...")
  const csvPath = path.resolve("prisma/seed/csv/messages.csv")
  const csvContent = fs.readFileSync(csvPath, "utf-8")
  const parsed = Papa.parse<Row>(csvContent, {
    header: true,
    skipEmptyLines: true,
  })

  console.log(`[messages] Found ${parsed.data.length} rows`)

  const BATCH_SIZE = 2000
  let batch: Array<{
    contactEmail: string | null
    contactId: string | null
    userText: string | null
    botReply: string | null
    category: string | null
    createdAt: Date
    modifiedAt: Date | null
  }> = []
  let total = 0
  let skipped = 0

  for (const row of parsed.data) {
    const createdAt = parseCsvDate(row["Creation Date"])
    if (!createdAt) {
      skipped++
      continue
    }

    const email = normalizeEmail(row.user)
    const contactId = email ? contactByEmail.get(email) ?? null : null
    const userText = trimOrNull(row.text)
    const botReply = trimOrNull(row.reply)
    const modifiedAt = parseCsvDate(row["Modified Date"])

    // Only categorize if there's userText (the user's question)
    const category = userText ? categorize(userText) : null

    batch.push({
      contactEmail: email,
      contactId,
      userText,
      botReply,
      category,
      createdAt,
      modifiedAt,
    })

    if (batch.length >= BATCH_SIZE) {
      await db.message.createMany({ data: batch })
      total += batch.length
      console.log(`[messages] Inserted ${total}...`)
      batch = []
    }
  }

  if (batch.length > 0) {
    await db.message.createMany({ data: batch })
    total += batch.length
  }

  console.log(`[messages] Done. Inserted ${total} messages, skipped ${skipped}`)
}

if (require.main === module) {
  seedMessages()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
