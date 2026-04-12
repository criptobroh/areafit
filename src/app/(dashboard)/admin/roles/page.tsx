"use client"

import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Shield, Eye, Pencil, Trash2, Check, X } from "lucide-react"

const mockRoles = [
  {
    id: "1",
    name: "Administrador",
    slug: "admin",
    isSystem: true,
    userCount: 1,
    permissions: [
      { screen: "dashboard", view: true, create: true, edit: true, delete: true },
      { screen: "conversaciones", view: true, create: true, edit: true, delete: true },
      { screen: "contactos", view: true, create: true, edit: true, delete: true },
      { screen: "valoraciones", view: true, create: true, edit: true, delete: true },
      { screen: "social", view: true, create: true, edit: true, delete: true },
      { screen: "admin.usuarios", view: true, create: true, edit: true, delete: true },
      { screen: "admin.roles", view: true, create: true, edit: true, delete: true },
      { screen: "admin.logs", view: true, create: true, edit: true, delete: true },
    ],
  },
  {
    id: "2",
    name: "Manager",
    slug: "manager",
    isSystem: false,
    userCount: 1,
    permissions: [
      { screen: "dashboard", view: true, create: false, edit: false, delete: false },
      { screen: "conversaciones", view: true, create: false, edit: true, delete: false },
      { screen: "contactos", view: true, create: false, edit: true, delete: false },
      { screen: "valoraciones", view: true, create: false, edit: false, delete: false },
      { screen: "social", view: true, create: true, edit: true, delete: false },
      { screen: "admin.usuarios", view: true, create: false, edit: false, delete: false },
      { screen: "admin.roles", view: false, create: false, edit: false, delete: false },
      { screen: "admin.logs", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: "3",
    name: "Operador",
    slug: "operador",
    isSystem: false,
    userCount: 2,
    permissions: [
      { screen: "dashboard", view: true, create: false, edit: false, delete: false },
      { screen: "conversaciones", view: true, create: false, edit: false, delete: false },
      { screen: "contactos", view: true, create: false, edit: false, delete: false },
      { screen: "valoraciones", view: true, create: false, edit: false, delete: false },
      { screen: "social", view: true, create: false, edit: false, delete: false },
      { screen: "admin.usuarios", view: false, create: false, edit: false, delete: false },
      { screen: "admin.roles", view: false, create: false, edit: false, delete: false },
      { screen: "admin.logs", view: false, create: false, edit: false, delete: false },
    ],
  },
  {
    id: "4",
    name: "Viewer",
    slug: "viewer",
    isSystem: false,
    userCount: 1,
    permissions: [
      { screen: "dashboard", view: true, create: false, edit: false, delete: false },
      { screen: "conversaciones", view: true, create: false, edit: false, delete: false },
      { screen: "contactos", view: false, create: false, edit: false, delete: false },
      { screen: "valoraciones", view: true, create: false, edit: false, delete: false },
      { screen: "social", view: false, create: false, edit: false, delete: false },
      { screen: "admin.usuarios", view: false, create: false, edit: false, delete: false },
      { screen: "admin.roles", view: false, create: false, edit: false, delete: false },
      { screen: "admin.logs", view: false, create: false, edit: false, delete: false },
    ],
  },
]

function PermIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
  ) : (
    <X className="h-3.5 w-3.5 text-muted-foreground/30" />
  )
}

export default function RolesPage() {
  return (
    <>
      <Topbar title="Roles" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex justify-end">
          <Button size="sm" className="bg-areafit-teal hover:bg-areafit-teal/90 text-white gap-1.5">
            <Plus className="h-4 w-4" />
            Nuevo rol
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {mockRoles.map((role) => (
            <Card key={role.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-areafit-teal" />
                    <CardTitle className="font-heading text-base font-semibold">
                      {role.name}
                    </CardTitle>
                    {role.isSystem && (
                      <Badge variant="secondary" className="text-[10px] h-5">
                        Sistema
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {role.userCount} {role.userCount === 1 ? "usuario" : "usuarios"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-1.5 pr-3 font-medium text-muted-foreground">
                          Pantalla
                        </th>
                        <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                          <Eye className="h-3 w-3 mx-auto" />
                        </th>
                        <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                          <Plus className="h-3 w-3 mx-auto" />
                        </th>
                        <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                          <Pencil className="h-3 w-3 mx-auto" />
                        </th>
                        <th className="px-2 py-1.5 text-center font-medium text-muted-foreground">
                          <Trash2 className="h-3 w-3 mx-auto" />
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {role.permissions.map((perm) => (
                        <tr key={perm.screen} className="border-b border-border/50 last:border-0">
                          <td className="py-1.5 pr-3 capitalize">
                            {perm.screen.replace("admin.", "admin / ").replace(".", " ")}
                          </td>
                          <td className="px-2 py-1.5 text-center"><PermIcon allowed={perm.view} /></td>
                          <td className="px-2 py-1.5 text-center"><PermIcon allowed={perm.create} /></td>
                          <td className="px-2 py-1.5 text-center"><PermIcon allowed={perm.edit} /></td>
                          <td className="px-2 py-1.5 text-center"><PermIcon allowed={perm.delete} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </>
  )
}
