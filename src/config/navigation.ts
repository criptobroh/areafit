import {
  LayoutDashboard,
  MessageSquareText,
  Users,
  Star,
  Share2,
  UserCog,
  ShieldCheck,
  Activity,
  type LucideIcon,
} from "lucide-react"

export type NavItem = {
  title: string
  href: string
  icon: LucideIcon
  screen?: string
}

export type NavGroup = {
  label: string
  items: NavItem[]
}

export const navigation: NavGroup[] = [
  {
    label: "General",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        screen: "dashboard",
      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      {
        title: "Conversaciones",
        href: "/conversaciones",
        icon: MessageSquareText,
        screen: "conversaciones",
      },
      {
        title: "Contactos",
        href: "/contactos",
        icon: Users,
        screen: "contactos",
      },
      {
        title: "Valoraciones",
        href: "/valoraciones",
        icon: Star,
        screen: "valoraciones",
      },
    ],
  },
  {
    label: "Marketing",
    items: [
      {
        title: "Social Media",
        href: "/social",
        icon: Share2,
        screen: "social",
      },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        title: "Usuarios",
        href: "/admin/usuarios",
        icon: UserCog,
        screen: "admin.usuarios",
      },
      {
        title: "Roles",
        href: "/admin/roles",
        icon: ShieldCheck,
        screen: "admin.roles",
      },
      {
        title: "Sistema",
        href: "/admin/logs",
        icon: Activity,
        screen: "admin.logs",
      },
    ],
  },
]
