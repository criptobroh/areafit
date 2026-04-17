import { SignJWT, jwtVerify } from "jose";
import type { BackofficeSession, PermissionsMap } from "./types";

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: BackofficeSession): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    nickname: user.nickname,
    roleId: user.roleId,
    roleName: user.roleName,
    homeScreen: user.homeScreen,
    permissions: user.permissions,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function createImpersonateToken(
  targetUser: BackofficeSession,
  originalEmail: string,
): Promise<string> {
  return new SignJWT({
    userId: targetUser.userId,
    email: targetUser.email,
    firstName: targetUser.firstName,
    lastName: targetUser.lastName,
    nickname: targetUser.nickname,
    roleId: targetUser.roleId,
    roleName: targetUser.roleName,
    homeScreen: targetUser.homeScreen,
    permissions: targetUser.permissions,
    impersonating: true,
    originalEmail,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<BackofficeSession | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: (payload.userId as string) || "",
      email: payload.email as string,
      firstName: payload.firstName as string | null,
      lastName: payload.lastName as string | null,
      nickname: (payload.nickname as string | null) ?? null,
      roleId: payload.roleId as string,
      roleName: payload.roleName as string,
      homeScreen: (payload.homeScreen as string | null) ?? null,
      permissions: payload.permissions as PermissionsMap,
      ...(payload.impersonating
        ? {
            impersonating: true,
            originalEmail: payload.originalEmail as string,
          }
        : {}),
    };
  } catch {
    return null;
  }
}
