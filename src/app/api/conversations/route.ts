import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { eq, desc, like } from "drizzle-orm";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");

  let query = db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, session.user.id))
    .orderBy(desc(conversations.updatedAt));

  const results = await query;

  // Filter by search if provided
  const filtered = search
    ? results.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
      )
    : results;

  return NextResponse.json(filtered);
}
