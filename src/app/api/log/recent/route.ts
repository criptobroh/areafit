import { NextResponse } from "next/server";
import { getRecentLogs } from "@/lib/logger";

export async function GET() {
  return NextResponse.json(getRecentLogs(100));
}
