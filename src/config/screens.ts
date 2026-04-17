export type ScreenDefinition = {
  key: string
  label: string
  group: string
  routePatterns: string[]
}

export const SCREEN_KEYS = [
  "dashboard",
  "conversaciones",
  "contactos",
  "valoraciones",
  "social",
  "perfil",
  "admin.usuarios",
  "admin.roles",
  "admin.logs",
] as const

export type ScreenKey = (typeof SCREEN_KEYS)[number]

export const SCREENS: ScreenDefinition[] = [
  { key: "dashboard", label: "Dashboard", group: "General", routePatterns: ["/"] },
  { key: "conversaciones", label: "Conversaciones", group: "Operaciones", routePatterns: ["/conversaciones"] },
  { key: "contactos", label: "Contactos", group: "Operaciones", routePatterns: ["/contactos"] },
  { key: "valoraciones", label: "Valoraciones", group: "Operaciones", routePatterns: ["/valoraciones"] },
  { key: "social", label: "Social Media", group: "Marketing", routePatterns: ["/social"] },
  { key: "perfil", label: "Perfil", group: "Usuario", routePatterns: ["/perfil"] },
  { key: "admin.usuarios", label: "Usuarios", group: "Admin", routePatterns: ["/admin/usuarios"] },
  { key: "admin.roles", label: "Roles", group: "Admin", routePatterns: ["/admin/roles"] },
  { key: "admin.logs", label: "Sistema", group: "Admin", routePatterns: ["/admin/logs"] },
]
