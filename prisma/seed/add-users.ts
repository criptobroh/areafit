import { db } from "./lib/client"

const USERS = [
  { email: "pablo@nocoda.ai", firstName: "Pablo", lastName: "NoCoda" },
  { email: "direccion@areafit.es", firstName: "Direccion", lastName: "AreaFit" },
  { email: "marketing@areafit.es", firstName: "Marketing", lastName: "AreaFit" },
]

async function main() {
  const adminRole = await db.role.findUnique({ where: { slug: "administrador" } })
  if (!adminRole) throw new Error("Admin role not found - run 06-admin.ts first")

  for (const u of USERS) {
    const user = await db.backofficeUser.upsert({
      where: { email: u.email },
      update: { roleId: adminRole.id, active: true },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        roleId: adminRole.id,
        active: true,
      },
    })
    console.log(`✓ ${user.email}`)
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
