"use client"

import { useState } from "react"
import { Topbar } from "@/components/layout/topbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, Plus, MoreHorizontal, Shield, Mail } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const mockUsers = [
  { id: "1", email: "admin@areafit.es", firstName: "Pablo", lastName: "Admin", role: "Administrador", active: true, lastSeenAt: "2026-04-12T10:30:00Z" },
  { id: "2", email: "maria@areafit.es", firstName: "Maria", lastName: "Garcia", role: "Manager", active: true, lastSeenAt: "2026-04-11T16:45:00Z" },
  { id: "3", email: "carlos@areafit.es", firstName: "Carlos", lastName: "Lopez", role: "Operador", active: true, lastSeenAt: "2026-04-10T09:15:00Z" },
  { id: "4", email: "lucia@areafit.es", firstName: "Lucia", lastName: "Martinez", role: "Operador", active: false, lastSeenAt: "2026-03-20T14:00:00Z" },
  { id: "5", email: "pedro@areafit.es", firstName: "Pedro", lastName: "Fernandez", role: "Viewer", active: true, lastSeenAt: "2026-04-09T11:20:00Z" },
]

export default function UsuariosPage() {
  const [search, setSearch] = useState("")

  const filtered = mockUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase())
  )

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
          <Button size="sm" className="bg-areafit-teal hover:bg-areafit-teal/90 text-white gap-1.5">
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
                  {filtered.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-areafit-teal/10 text-areafit-teal text-xs font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">
                            {user.firstName} {user.lastName}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "Administrador" ? "default" : "outline"}
                          className={
                            user.role === "Administrador"
                              ? "bg-areafit-teal/10 text-areafit-teal border-areafit-teal/20 hover:bg-areafit-teal/20"
                              : "text-xs"
                          }
                        >
                          {user.role === "Administrador" && <Shield className="h-3 w-3 mr-1" />}
                          {user.role}
                        </Badge>
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
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Editar</DropdownMenuItem>
                            <DropdownMenuItem>
                              <Mail className="h-3.5 w-3.5 mr-2" />
                              Reenviar invitacion
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              {user.active ? "Desactivar" : "Activar"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
