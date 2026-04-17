import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, createImpersonateToken } from "@/lib/auth/session";
import type { PermissionsMap } from "@/lib/auth/types";

export async function POST(req: NextRequest) {
  try {
    // Verify the requesting user is admin
    const token = req.cookies.get("areafit-session")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session) {
      return NextResponse.json({ error: "Sesión inválida" }, { status: 401 });
    }

    // Only admins can impersonate — check roleName or admin permissions
    const isAdmin =
      session.roleName === "Administrador" ||
      (session.permissions?.["admin.usuarios"]?.view && session.permissions?.["admin.roles"]?.view);
    if (!isAdmin) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Cannot impersonate while already impersonating
    if (session.impersonating) {
      return NextResponse.json(
        { error: "No se puede impersonar mientras ya estás impersonando" },
        { status: 400 },
      );
    }

    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    // Fetch target user with role and permissions
    const targetUser = await db.backofficeUser.findUnique({
      where: { id: userId, active: true },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Build permissions map
    const permissions: PermissionsMap = {};
    for (const perm of targetUser.role?.permissions ?? []) {
      permissions[perm.screen] = {
        view: perm.canView,
        create: perm.canCreate,
        edit: perm.canEdit,
        delete: perm.canDelete,
      };
    }

    // Create impersonate JWT (1 hour)
    const impersonateToken = await createImpersonateToken(
      {
        userId: targetUser.userId || targetUser.id,
        email: targetUser.email,
        firstName: targetUser.firstName,
        lastName: targetUser.lastName,
        nickname: targetUser.nickname,
        roleId: targetUser.role?.id ?? "",
        roleName: targetUser.role?.name ?? "Sin rol",
        homeScreen: targetUser.role?.homeScreen ?? null,
        permissions,
      },
      session.email,
    );

    // Return the URL that will set the cookie
    return NextResponse.json({
      url: `/api/auth/impersonate?token=${impersonateToken}`,
    });
  } catch (error) {
    console.error("Impersonate error:", error);
    return NextResponse.json(
      { error: "Error al impersonar usuario" },
      { status: 500 },
    );
  }
}
