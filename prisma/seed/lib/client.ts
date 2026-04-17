/**
 * Standalone Prisma client for seed scripts (uses plain pg + unpooled connection)
 */
import { config } from "dotenv"
config({ path: ".env.local" })
config({ path: ".env" })

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL
if (!connectionString) {
  throw new Error("DATABASE_URL_UNPOOLED or DATABASE_URL must be set")
}

const adapter = new PrismaPg({ connectionString })
export const db = new PrismaClient({ adapter })
