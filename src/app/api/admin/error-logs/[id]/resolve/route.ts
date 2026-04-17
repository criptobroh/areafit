import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { extractUserEmail } from "@/lib/extract-user";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const userEmail = extractUserEmail(request) ?? "unknown";
  const body = await request.json();
  const { resolved, resolution } = body;

  const log = await db.errorLog.update({
    where: { id },
    data: {
      resolved: resolved ?? true,
      resolvedBy: resolved === false ? null : userEmail,
      resolvedAt: resolved === false ? null : new Date(),
      resolution: resolution ?? null,
    },
  });

  return NextResponse.json(log);
}
