"use client"

import { useEffect, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, Plus, MoreHorizontal, Shield, Loader2, Pencil, Ban, Check } from "lucide-react"
import { toast } from "sonner"

type Role = {
  id: string
  name: string
  slug: string
}

type BackofficeUser = {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  roleId: string | null
  role: Role | null
  active: boolean
  lastSeenAt: string | null
  createdAt: string
}

async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${res.status}`)
  return res.json()
}

function initials(user: BackofficeUser) {
  const f = user.firstName?.[0] ?? user.email[0]
  const l = user.lastName?.[0] ?? ""
  return (f + l).toUpperCase()
}

function displayName(user: BackofficeUser) {
  if (user.firstName || user.lastName) {
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()
  }
  return user.email
}

export default function UsuariosPage() {
  const qc = useQueryClient()
  const [search, setSearch] = useState("")
  const [editUser, setEditUser] = useState<BackofficeUser | null>(null)
  const [createOpen, setCreateOpen] = useState(false)

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchJSON<BackofficeUser[]>("/api/admin/users"),
  })
  const { data: roles } = useQuery({
    queryKey: ["admin-roles"],
    queryFn: () => fetchJSON<Role[]>("/api/admin/roles"),
  })

  const toggleActive = useMutation({
    mutationFn: async (user: BackofficeUser) => {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: user.active ? "DELETE" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: user.active ? undefined : JSON.stringify({ active: true }),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: (_, user) => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success(user.active ? "Usuario desactivado" : "Usuario activado")
    },
    onError: () => toast.error("Error al cambiar estado"),
  })

  const filtered = (users ?? []).filter((u) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      u.email.toLowerCase().includes(q) ||
      displayName(u).toLowerCase().includes(q) ||
      u.role?.name.toLowerCase().includes(q)
    )
  })

  return (
    <>
      <Topbar title="Usuarios" />
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuarios..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button
            size="sm"
            onClick={() => setCreateOpen(true)}
            className="bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white gap-1.5"
          >
            <Plus className="h-4 w-4" />
            Nuevo usuario
          </Button>
        </div>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell colSpan={5}>
                          <Skeleton className="h-8 w-full" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Sin usuarios
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((user) => (
                      <TableRow key={user.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-[#00AEEF]/10 text-[#00AEEF] text-xs font-medium">
                                {initials(user)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">{displayName(user)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          {user.role ? (
                            <Badge
                              variant="outline"
                              className={
                                user.role.slug === "administrador"
                                  ? "bg-[#00AEEF]/10 text-[#00AEEF] border-[#00AEEF]/20"
                                  : "text-xs"
                              }
                            >
                              {user.role.slug === "administrador" && (
                                <Shield className="h-3 w-3 mr-1" />
                              )}
                              {user.role.name}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs text-muted-foreground">
                              Sin rol
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant="outline"
                            className={
                              user.active
                                ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                                : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            }
                          >
                            {user.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={<Button variant="ghost" size="icon-sm" />}
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setEditUser(user)}>
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => toggleActive.mutate(user)}
                                className={user.active ? "text-destructive" : ""}
                              >
                                {user.active ? (
                                  <>
                                    <Ban className="h-3.5 w-3.5 mr-2" />
                                    Desactivar
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-3.5 w-3.5 mr-2" />
                                    Activar
                                  </>
                                )}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <UserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        user={null}
        roles={roles ?? []}
      />

      {/* Edit Dialog */}
      <UserDialog
        open={!!editUser}
        onClose={() => setEditUser(null)}
        user={editUser}
        roles={roles ?? []}
      />
    </>
  )
}

function UserDialog({
  open,
  onClose,
  user,
  roles,
}: {
  open: boolean
  onClose: () => void
  user: BackofficeUser | null
  roles: Role[]
}) {
  const qc = useQueryClient()
  const [email, setEmail] = useState(user?.email ?? "")
  const [firstName, setFirstName] = useState(user?.firstName ?? "")
  const [lastName, setLastName] = useState(user?.lastName ?? "")
  const [roleId, setRoleId] = useState(user?.roleId ?? "")

  // Sync when user changes
  useEffect(() => {
    if (open) {
      setEmail(user?.email ?? "")
      setFirstName(user?.firstName ?? "")
      setLastName(user?.lastName ?? "")
      setRoleId(user?.roleId ?? "")
    }
  }, [open, user])

  const mutation = useMutation({
    mutationFn: async () => {
      const url = user ? `/api/admin/users/${user.id}` : "/api/admin/users"
      const method = user ? "PUT" : "POST"
      const body = user
        ? { firstName, lastName, roleId }
        : { email, firstName, lastName, roleId }
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || "Error")
      }
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success(user ? "Usuario actualizado" : "Usuario creado")
      onClose()
    },
    onError: (err: Error) => {
      toast.error(err.message || "Error al guardar")
    },
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!roleId) {
      toast.error("Seleccioná un rol")
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) onClose()
      }}
    >
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{user ? "Editar usuario" : "Nuevo usuario"}</DialogTitle>
            <DialogDescription>
              {user
                ? "Modifica los datos del usuario. Recibira el magic link al iniciar sesion."
                : "Crea un usuario. Podra loguearse con magic link usando este email."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!user}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nombre</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Apellido</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={roleId}
                onValueChange={(v) => {
                  if (v) setRoleId(v)
                }}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Seleccionar rol" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-[#00AEEF] hover:bg-[#00AEEF]/90 text-white"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {user ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
