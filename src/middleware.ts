import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

// Inlined screen definitions for Edge runtime compatibility
// MUST stay in sync with src/config/screens.ts
const SCREENS = [
  { key: "dashboard", routePatterns: ["/"] },
  { key: "conversaciones", routePatterns: ["/conversaciones"] },
  { key: "contactos", routePatterns: ["/contactos"] },
  { key: "valoraciones", routePatterns: ["/valoraciones"] },
  { key: "social", routePatterns: ["/social"] },
  { key: "perfil", routePatterns: ["/perfil"] },
  { key: "admin.usuarios", routePatterns: ["/admin/usuarios"] },
  { key: "admin.roles", routePatterns: ["/admin/roles"] },
  { key: "admin.logs", routePatterns: ["/admin/logs"] },
];

type PermissionsMap = Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;

function getSecret() {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

interface SessionPayload {
  email: string;
  roleId: string;
  roleName: string;
  permissions: PermissionsMap;
  homeScreen: string | null;
}

async function getSessionFromToken(token: string): Promise<SessionPayload | null> {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return {
      email: payload.email as string,
      roleId: payload.roleId as string,
      roleName: payload.roleName as string,
      permissions: payload.permissions as PermissionsMap,
      homeScreen: (payload.homeScreen as string) ?? null,
    };
  } catch {
    return null;
  }
}

function findScreenKeyForPath(pathname: string): string | null {
  let bestKey: string | null = null;
  let bestLength = 0;

  for (const screen of SCREENS) {
    for (const pattern of screen.routePatterns) {
      if (pattern === "/") {
        if (pathname === "/" && bestLength === 0) {
          bestKey = screen.key;
          bestLength = 1;
        }
      } else if (pathname === pattern || pathname.startsWith(pattern + "/")) {
        if (pattern.length > bestLength) {
          bestKey = screen.key;
          bestLength = pattern.length;
        }
      }
    }
  }

  return bestKey;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow static assets and auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth") ||
    pathname === "/api/health" ||
    pathname === "/api/log" ||
    pathname === "/api/log/recent" ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("areafit-session")?.value;
  const session = token ? await getSessionFromToken(token) : null;

  // Redirect logged-in users away from login
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow login page
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Allow dev-login route
  if (pathname === "/api/dev-login") {
    return NextResponse.next();
  }

  // Dev bypass: skip auth when no AUTH_SECRET is set (local dev without DB)
  if (!session && !getSecret()) {
    return NextResponse.next();
  }

  // Protect all other routes
  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If session exists but has no permissions (old JWT format), allow through
  // User will need to re-login to get permissions
  if (!session.permissions) {
    return NextResponse.next();
  }

  // Permission-based route enforcement
  const isApiRoute = pathname.startsWith("/api/");
  const checkPathname = isApiRoute
    ? pathname.replace(/^\/api/, "")
    : pathname;

  const screenKey = findScreenKeyForPath(checkPathname);

  if (screenKey) {
    const perms = session.permissions[screenKey];

    // Check view permission for page routes
    if (!isApiRoute && !perms?.view) {
      // Redirect to homeScreen if set, otherwise to /
      const fallback = session.homeScreen ? `/${session.homeScreen}` : "/";
      // Avoid redirect loop: if we'd redirect to the same page, go to /
      const target = fallback === pathname ? "/" : fallback;
      return NextResponse.redirect(new URL(target, req.url));
    }

    // Check granular permissions for API routes
    if (isApiRoute) {
      const method = req.method;
      if (method === "GET" && !perms?.view) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
      }
      if (method === "POST" && !perms?.create) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
      }
      if ((method === "PUT" || method === "PATCH") && !perms?.edit) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
      }
      if (method === "DELETE" && !perms?.delete) {
        return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
