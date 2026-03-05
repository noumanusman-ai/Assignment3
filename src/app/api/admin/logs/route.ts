import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { systemLogs } from "@/lib/db/schema";
import { desc, eq, ilike, and, SQL } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level");
  const source = searchParams.get("source");
  const search = searchParams.get("search");
  const limit = Math.min(Number(searchParams.get("limit") || 50), 200);
  const offset = Number(searchParams.get("offset") || 0);

  const conditions: SQL[] = [];

  if (level && level !== "All") {
    conditions.push(eq(systemLogs.level, level as "INFO" | "WARNING" | "ERROR"));
  }
  if (source && source !== "All") {
    conditions.push(eq(systemLogs.source, source));
  }
  if (search) {
    conditions.push(ilike(systemLogs.message, `%${search}%`));
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, sources] = await Promise.all([
    db
      .select()
      .from(systemLogs)
      .where(where)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit)
      .offset(offset),
    db
      .selectDistinct({ source: systemLogs.source })
      .from(systemLogs),
  ]);

  return NextResponse.json({
    logs,
    sources: sources.map((s) => s.source),
  });
}
