import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, createSessionToken } from "@/lib/auth/session";
import type { PermissionsMap } from "@/lib/auth/types";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("areafit-session")?.value;
    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const session = await verifySessionToken(token);
    if (!session || !session.impersonating || !session.originalEmail) {
      return NextResponse.json({ error: "No estás impersonando" }, { status: 400 });
    }

    // Fetch the original admin user to restore their session
    const adminUser = await db.backofficeUser.findUnique({
      where: { email: session.originalEmail, active: true },
      include: {
        role: {
          include: { permissions: true },
        },
      },
    });

    if (!adminUser) {
      // If for some reason the admin user is gone, clear the session
      const response = NextResponse.json({ ok: true });
      response.cookies.set("areafit-session", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 0,
      });
      return response;
    }

    // Build permissions map for the admin
    const permissions: PermissionsMap = {};
    for (const perm of adminUser.role?.permissions ?? []) {
      permissions[perm.screen] = {
        view: perm.canView,
        create: perm.canCreate,
        edit: perm.canEdit,
        delete: perm.canDelete,
      };
    }

    // Create a new normal session token for the admin
    const adminToken = await createSessionToken({
      userId: adminUser.userId || adminUser.id,
      email: adminUser.email,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      nickname: adminUser.nickname,
      roleId: adminUser.role?.id ?? "",
      roleName: adminUser.role?.name ?? "Sin rol",
      homeScreen: adminUser.role?.homeScreen ?? null,
      permissions,
    });

    const response = NextResponse.json({ ok: true });
    response.cookies.set("areafit-session", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Stop impersonate error:", error);
    return NextResponse.json(
      { error: "Error al restaurar sesión" },
      { status: 500 },
    );
  }
}
