import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", req.url));
  }

  // Verify the impersonate token is valid
  const session = await verifySessionToken(token);
  if (!session || !session.impersonating) {
    return NextResponse.redirect(new URL("/login?error=invalid_link", req.url));
  }

  // Set the impersonate session cookie (1 hour)
  const response = NextResponse.redirect(new URL("/", req.url));
  response.cookies.set("areafit-session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60, // 1 hour
    path: "/",
  });

  return response;
}
