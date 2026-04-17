import { db } from "./lib/client"
import { slugify } from "./lib/clean"

const CENTERS = [
  { name: "WhatsApp", isWhatsapp: true },
  { name: "Albacete" },
  { name: "Aleste" },
  { name: "Aljarafe" },
  { name: "Arrecife" },
  { name: "Ecija" },
  { name: "Inca" },
  { name: "Las Palmas" },
  { name: "Montequinto" },
  { name: "Moron" },
  { name: "Murcia" },
  { name: "Naron-Ferrol" },
  { name: "Palma" },
  { name: "Reus" },
  { name: "Terrassa" },
]

export async function seedCenters() {
  console.log("[centers] Seeding centers...")
  for (const c of CENTERS) {
    const slug = slugify(c.name)
    await db.center.upsert({
      where: { slug },
      update: { name: c.name, isWhatsapp: c.isWhatsapp ?? false },
      create: { slug, name: c.name, isWhatsapp: c.isWhatsapp ?? false },
    })
  }
  const count = await db.center.count()
  console.log(`[centers] Seeded ${count} centers`)
}

if (require.main === module) {
  seedCenters()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
