import { seedCenters } from "./01-centers"
import { seedContacts } from "./02-contacts"
import { seedRatings } from "./03-ratings"
import { seedMessages } from "./04-messages"
import { seedConversations } from "./05-conversations"
import { seedAdmin } from "./06-admin"

async function main() {
  console.log("🌱 Starting AreaFit seed...")
  console.log("=" .repeat(60))

  const t0 = Date.now()

  await seedCenters()
  await seedContacts()
  await seedRatings()
  await seedMessages()
  await seedConversations()
  await seedAdmin()

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
  console.log("=" .repeat(60))
  console.log(`✅ Seed complete in ${elapsed}s`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Seed failed:", err)
    process.exit(1)
  })
