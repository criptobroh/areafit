import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifySessionToken, createSessionToken } from "@/lib/auth/session";
import type { PermissionsMap } from "@/lib/auth/types";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("areafit-session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });

  const user = await db.backofficeUser.findUnique({
    where: { email: session.email },
    select: { id: true, email: true, firstName: true, lastName: true, nickname: true, avatarUrl: true },
  });

  if (!user) return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("areafit-session")?.value;
  if (!token) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

  const session = await verifySessionToken(token);
  if (!session) return NextResponse.json({ error: "Sesion invalida" }, { status: 401 });

  const body = await req.json();
  const { firstName, lastName, nickname, avatarUrl } = body;

  // Validate avatar size (max ~200KB base64)
  if (avatarUrl && avatarUrl.length > 300_000) {
    return NextResponse.json({ error: "La imagen es demasiado grande (max 200KB)" }, { status: 400 });
  }

  const updated = await db.backofficeUser.update({
    where: { email: session.email },
    data: {
      ...(firstName !== undefined && { firstName }),
      ...(lastName !== undefined && { lastName }),
      ...(nickname !== undefined && { nickname }),
      ...(avatarUrl !== undefined && { avatarUrl }),
    },
    include: { role: { include: { permissions: true } } },
  });

  // Re-issue JWT with updated data
  const permissions: PermissionsMap = {};
  for (const perm of updated.role?.permissions ?? []) {
    permissions[perm.screen] = {
      view: perm.canView,
      create: perm.canCreate,
      edit: perm.canEdit,
      delete: perm.canDelete,
    };
  }

  const newToken = await createSessionToken({
    userId: updated.userId || updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    nickname: updated.nickname,
    roleId: updated.role?.id ?? "",
    roleName: updated.role?.name ?? "Sin rol",
    homeScreen: updated.role?.homeScreen ?? null,
    permissions,
  });

  const response = NextResponse.json({
    id: updated.id,
    email: updated.email,
    firstName: updated.firstName,
    lastName: updated.lastName,
    nickname: updated.nickname,
    avatarUrl: updated.avatarUrl,
  });

  response.cookies.set("areafit-session", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}
