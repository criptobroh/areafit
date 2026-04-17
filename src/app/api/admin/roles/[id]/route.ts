import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SCREEN_KEYS } from "@/config/screens";
import { logger } from "@/lib/logger";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, permissions, isSystem, homeScreen } = body as {
      name?: string;
      permissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;
      isSystem?: boolean;
      homeScreen?: string | null;
    };

    const role = await db.role.findUnique({ where: { id } });
    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    // Update role fields if provided
    const updateData: { name?: string; isSystem?: boolean; homeScreen?: string | null } = {};
    if (name?.trim() && name.trim() !== role.name) updateData.name = name.trim();
    if (typeof isSystem === "boolean") updateData.isSystem = isSystem;
    if (homeScreen !== undefined) updateData.homeScreen = homeScreen;
    if (Object.keys(updateData).length > 0) {
      await db.role.update({ where: { id }, data: updateData });
    }

    // Update permissions if provided
    if (permissions) {
      for (const screen of SCREEN_KEYS) {
        const perms = permissions[screen];
        if (perms) {
          await db.rolePermission.upsert({
            where: { roleId_screen: { roleId: id, screen } },
            update: {
              canView: perms.view,
              canCreate: perms.create,
              canEdit: perms.edit,
              canDelete: perms.delete,
            },
            create: {
              roleId: id,
              screen,
              canView: perms.view,
              canCreate: perms.create,
              canEdit: perms.edit,
              canDelete: perms.delete,
            },
          });
        }
      }
    }

    const updated = await db.role.findUnique({
      where: { id },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error(`Role update failed: ${msg}`, { path: `/api/admin/roles/${(await params).id}`, method: "PUT" }, error);
    return NextResponse.json({ error: "Error al actualizar rol", detail: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const role = await db.role.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!role) {
      return NextResponse.json({ error: "Rol no encontrado" }, { status: 404 });
    }

    if (role.isSystem) {
      return NextResponse.json({ error: "No se puede eliminar un rol del sistema" }, { status: 400 });
    }

    // Unassign users from this role before deleting
    if (role._count.users > 0) {
      await db.backofficeUser.updateMany({
        where: { roleId: id },
        data: { roleId: null },
      });
    }

    // RolePermissions cascade-delete automatically
    await db.role.delete({ where: { id } });

    return NextResponse.json({ ok: true, unassignedUsers: role._count.users });
  } catch (error) {
    console.error("Delete role error:", error);
    return NextResponse.json({ error: "Error al eliminar rol" }, { status: 500 });
  }
}
