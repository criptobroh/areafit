import { config } from "dotenv"
import { defineConfig } from "prisma/config"

config({ path: ".env.local" })
config({ path: ".env" })

const url =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.DATABASE_URL ||
  ""

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: { url },
  migrations: {
    seed: "tsx prisma/seed/index.ts",
  },
})
