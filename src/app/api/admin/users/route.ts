import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const users = await db.backofficeUser.findMany({
    include: { role: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, firstName, lastName, roleId, userId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requerido" }, { status: 400 });
    }

    if (!roleId) {
      return NextResponse.json({ error: "Rol requerido" }, { status: 400 });
    }

    const existing = await db.backofficeUser.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "El email ya existe" }, { status: 409 });
    }

    const user = await db.backofficeUser.create({
      data: {
        email: email.toLowerCase().trim(),
        firstName: firstName || null,
        lastName: lastName || null,
        roleId,
        userId: userId || null,
      },
      include: { role: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 });
  }
}
