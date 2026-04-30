import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import type { PermissionsMap } from "@/lib/auth/types";

// Dev-only login — tries DB first, falls back to hardcoded admin JWT
export async function GET(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  // Try DB-backed login first
  try {
    const { db } = await import("@/lib/db");
    const { createSessionToken } = await import("@/lib/auth/session");

    const email = req.nextUrl.searchParams.get("email");
    const user = await db.backofficeUser.findFirst({
      where: email ? { email, active: true } : { role: { slug: "admin" }, active: true },
      include: { role: { include: { permissions: true } } },
    });

    if (user) {
      const permissions: PermissionsMap = {};
      for (const perm of user.role?.permissions ?? []) {
        permissions[perm.screen] = {
          view: perm.canView,
          create: perm.canCreate,
          edit: perm.canEdit,
          delete: perm.canDelete,
        };
      }

      const sessionToken = await createSessionToken({
        userId: user.userId || user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        nickname: user.nickname,
        roleId: user.role?.id ?? "",
        roleName: user.role?.name ?? "Sin rol",
        homeScreen: user.role?.homeScreen ?? null,
        permissions,
      });

      const response = NextResponse.redirect(new URL("/", req.url));
      response.cookies.set("areafit-session", sessionToken, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }
  } catch (err) {
    console.error("[dev-login] DB lookup failed, using fallback:", err)
  }

  // Fallback: generate JWT without DB (admin con permisos full a screens AreaFit)
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "dev-secret-32-chars-minimum-here!";
  const key = new TextEncoder().encode(secret);

  const screens = [
    "dashboard",
    "conversaciones",
    "contactos",
    "valoraciones",
    "social",
    "perfil",
    "admin.usuarios",
    "admin.roles",
    "admin.logs",
  ];
  const permissions: PermissionsMap = {};
  for (const s of screens) {
    permissions[s] = { view: true, create: true, edit: true, delete: true };
  }

  const token = await new SignJWT({
    userId: "dev-user",
    email: "dev@areafit.es",
    firstName: "Dev",
    lastName: "User",
    nickname: null,
    roleId: "dev",
    roleName: "Administrador",
    homeScreen: "dashboard",
    permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);

  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("areafit-session", token, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return response;
}
