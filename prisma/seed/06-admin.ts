import { db } from "./lib/client"

const ADMIN_EMAIL = "pablo.loyudice@gmail.com"

const SCREENS = [
  "dashboard",
  "conversaciones",
  "contactos",
  "valoraciones",
  "social",
  "admin.usuarios",
  "admin.roles",
  "admin.logs",
  "perfil",
]

export async function seedAdmin() {
  console.log("[admin] Creating administrator role...")

  const role = await db.role.upsert({
    where: { slug: "administrador" },
    update: {},
    create: {
      name: "Administrador",
      slug: "administrador",
      isSystem: true,
      homeScreen: "dashboard",
    },
  })

  console.log(`[admin] Role created: ${role.id}`)

  // Create all permissions with full access
  for (const screen of SCREENS) {
    await db.rolePermission.upsert({
      where: {
        roleId_screen: { roleId: role.id, screen },
      },
      update: {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
      create: {
        roleId: role.id,
        screen,
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
      },
    })
  }

  console.log(`[admin] Created ${SCREENS.length} permissions`)

  // Create viewer role with read-only access to non-admin screens
  const viewerRole = await db.role.upsert({
    where: { slug: "viewer" },
    update: {},
    create: {
      name: "Viewer",
      slug: "viewer",
      homeScreen: "dashboard",
    },
  })

  const viewerScreens = ["dashboard", "conversaciones", "contactos", "valoraciones", "social", "perfil"]
  for (const screen of viewerScreens) {
    await db.rolePermission.upsert({
      where: { roleId_screen: { roleId: viewerRole.id, screen } },
      update: { canView: true, canCreate: false, canEdit: false, canDelete: false },
      create: {
        roleId: viewerRole.id,
        screen,
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
      },
    })
  }

  console.log(`[admin] Created viewer role with ${viewerScreens.length} screens`)

  // Create admin user
  const user = await db.backofficeUser.upsert({
    where: { email: ADMIN_EMAIL },
    update: { roleId: role.id, active: true },
    create: {
      email: ADMIN_EMAIL,
      firstName: "Pablo",
      lastName: "Loyudice",
      roleId: role.id,
      active: true,
    },
  })

  console.log(`[admin] Admin user: ${user.email} (id: ${user.id})`)
}

if (require.main === module) {
  seedAdmin()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
