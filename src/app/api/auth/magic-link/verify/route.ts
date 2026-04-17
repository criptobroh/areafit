import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyMagicLinkToken } from "@/lib/auth/magic-link";
import { createSessionToken } from "@/lib/auth/session";
import type { PermissionsMap } from "@/lib/auth/types";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", req.url));
  }

  const payload = await verifyMagicLinkToken(token);
  if (!payload) {
    return NextResponse.redirect(new URL("/login?error=expired", req.url));
  }

  const user = await db.backofficeUser.findUnique({
    where: { email: payload.email, active: true },
    include: {
      role: {
        include: { permissions: true },
      },
    },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", req.url));
  }

  // Build permissions map from role permissions
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
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return response;
}
