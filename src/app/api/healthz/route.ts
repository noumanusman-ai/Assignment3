import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, string> = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };

  // Check database connection
  try {
    const { db } = await import("@/lib/db");
    await db.execute(new (await import("drizzle-orm")).SQL(["SELECT 1"]));
    checks.db = "connected";
  } catch {
    checks.db = "disconnected";
  }

  // Check embedding API
  try {
    const embedUrl = process.env.EMBEDDING_API_URL || "http://localhost:8000";
    const res = await fetch(`${embedUrl}/health`, { signal: AbortSignal.timeout(3000) });
    checks.embedApi = res.ok ? "connected" : "unhealthy";
  } catch {
    checks.embedApi = "disconnected";
  }

  const allHealthy = checks.db === "connected" && checks.embedApi === "connected";

  return NextResponse.json(checks, { status: allHealthy ? 200 : 503 });
}
