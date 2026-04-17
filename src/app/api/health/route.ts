import { NextResponse } from "next/server";

interface CheckResult {
  status: "ok" | "error";
  latency_ms: number;
  error?: string;
}

export async function GET() {
  const timestamp = new Date().toISOString();
  const checks: Record<string, CheckResult> = {};

  // Check database
  const dbStart = Date.now();
  try {
    const { db } = await import("@/lib/db");
    await db.$queryRaw`SELECT 1`;
    checks.database = { status: "ok", latency_ms: Date.now() - dbStart };
  } catch (err) {
    checks.database = {
      status: "error",
      latency_ms: Date.now() - dbStart,
      error: err instanceof Error ? err.message : "Unknown DB error",
    };
  }

  // Check external API
  const apiStart = Date.now();
  try {
    const apiBase = process.env.PSI_API_BASE_URL;
    const apiKey = process.env.PSI_API_KEY;
    if (!apiBase || !apiKey) {
      checks.api = { status: "error", latency_ms: 0, error: "API env vars not set" };
    } else {
      const res = await fetch(`${apiBase}/v1/psychologists?take=1`, {
        headers: { "x-api-key": apiKey },
        signal: AbortSignal.timeout(10000),
      });
      checks.api = {
        status: res.ok ? "ok" : "error",
        latency_ms: Date.now() - apiStart,
        ...(res.ok ? {} : { error: `HTTP ${res.status}` }),
      };
    }
  } catch (err) {
    checks.api = {
      status: "error",
      latency_ms: Date.now() - apiStart,
      error: err instanceof Error ? err.message : "API unreachable",
    };
  }

  const allOk = Object.values(checks).every((c) => c.status === "ok");
  const anyError = Object.values(checks).some((c) => c.status === "error");

  return NextResponse.json({
    status: allOk ? "ok" : anyError ? "degraded" : "ok",
    timestamp,
    checks,
  });
}
