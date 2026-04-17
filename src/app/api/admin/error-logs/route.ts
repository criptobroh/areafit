import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const resolved = url.searchParams.get("resolved");
  const level = url.searchParams.get("level");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "50");

  const where: Record<string, unknown> = {};

  if (resolved !== null) {
    where.resolved = resolved === "true";
  }
  if (level) {
    where.level = level;
  }
  if (from || to) {
    const createdAt: Record<string, Date> = {};
    if (from) createdAt.gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      createdAt.lte = toDate;
    }
    where.createdAt = createdAt;
  }

  const [logs, total] = await Promise.all([
    db.errorLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.errorLog.count({ where }),
  ]);

  return NextResponse.json({
    data: logs,
    total,
    page,
    pages: Math.ceil(total / limit),
  });
}
