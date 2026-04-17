import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { firstName, lastName, roleId, active, userId } = body;

    const user = await db.backofficeUser.update({
      where: { id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(roleId !== undefined && { roleId }),
        ...(active !== undefined && { active }),
        ...(userId !== undefined && { userId: userId || null }),
      },
      include: { role: true },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Soft delete - mark as inactive
    const user = await db.backofficeUser.update({
      where: { id },
      data: { active: false },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Error al desactivar usuario" }, { status: 500 });
  }
}
