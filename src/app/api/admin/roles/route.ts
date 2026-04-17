import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { SCREEN_KEYS } from "@/config/screens";

export async function GET() {
  const roles = await db.role.findMany({
    include: {
      permissions: true,
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(roles);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, permissions, homeScreen } = body as {
      name: string;
      permissions?: Record<string, { view: boolean; create: boolean; edit: boolean; delete: boolean }>;
      homeScreen?: string | null;
    };

    if (!name?.trim()) {
      return NextResponse.json({ error: "Nombre requerido" }, { status: 400 });
    }

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");

    const existing = await db.role.findFirst({
      where: { OR: [{ name: name.trim() }, { slug }] },
    });
    if (existing) {
      return NextResponse.json({ error: "Ya existe un rol con ese nombre" }, { status: 409 });
    }

    const role = await db.role.create({
      data: {
        name: name.trim(),
        slug,
        isSystem: false,
        homeScreen: homeScreen ?? null,
        permissions: {
          create: SCREEN_KEYS.map((screen) => ({
            screen,
            canView: permissions?.[screen]?.view ?? false,
            canCreate: permissions?.[screen]?.create ?? false,
            canEdit: permissions?.[screen]?.edit ?? false,
            canDelete: permissions?.[screen]?.delete ?? false,
          })),
        },
      },
      include: {
        permissions: true,
        _count: { select: { users: true } },
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Create role error:", error);
    return NextResponse.json({ error: "Error al crear rol" }, { status: 500 });
  }
}
