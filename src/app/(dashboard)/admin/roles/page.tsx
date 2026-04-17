"use client"

import { useQuery } from "@tanstack/react-query"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Shield, Eye, Plus, Pencil, Trash2, Check, X } from "lucide-react"

type Permission = {
  id: string
  screen: string
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

type Role = {
  id: string
  name: string
  slug: string
  isSystem: boolean
  homeScreen: string | null
  permissions: Permission[]
  _count?: { users: number }
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function PermIcon({ allowed }: { allowed: boolean }) {
  return allowed ? (
    <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400 mx-auto" />
  ) : (
    <X className="h-3.5 w-3.5 text-muted-foreground/30 mx-auto" />
  )
}

export default function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => fetchJSON<Role[]>("/api/admin/roles"),
  })

  return (
    <>
      <Topbar title="Roles" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 stagger-children">
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-80 w-full" />
            ))
          ) : !roles?.length ? (
            <Card className="border-0 shadow-sm col-span-full">
              <CardContent className="p-8 text-center text-muted-foreground">
                Sin roles configurados
              </CardContent>
            </Card>
          ) : (
            roles.map((role) => (
              <Card key={role.id} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-[#00AEEF]" />
                      <CardTitle className="font-heading text-base font-semibold">
                        {role.name}
                      </CardTitle>
                      {role.isSystem && (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          Sistema
                        </Badge>
                      )}
                    </div>
                    {role._count && (
                      <Badge variant="outline" className="text-xs">
                        {role._count.users}{" "}
                        {role._count.users === 1 ? "usuario" : "usuarios"}
                      </Badge>
                    )}
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
                          <tr
                            key={perm.id}
                            className="border-b border-border/50 last:border-0"
                          >
                            <td className="py-1.5 pr-3 capitalize">
                              {perm.screen.replace("admin.", "admin / ")}
                            </td>
                            <td className="px-2 py-1.5">
                              <PermIcon allowed={perm.canView} />
                            </td>
                            <td className="px-2 py-1.5">
                              <PermIcon allowed={perm.canCreate} />
                            </td>
                            <td className="px-2 py-1.5">
                              <PermIcon allowed={perm.canEdit} />
                            </td>
                            <td className="px-2 py-1.5">
                              <PermIcon allowed={perm.canDelete} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </>
  )
}
