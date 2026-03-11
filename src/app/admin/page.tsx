import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  documents,
  conversations,
  chunks,
  messages,
} from "@/lib/db/schema";
import { count, desc, sql, gte, eq } from "drizzle-orm";
import { RecentActivity } from "@/components/admin/recent-activity";

export default async function AdminOverviewPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/chat");
  }

  const [userCount] = await db.select({ count: count() }).from(users);
  const [docCount] = await db.select({ count: count() }).from(documents);
  const [chunkCount] = await db.select({ count: count() }).from(chunks);
  const [convCount] = await db.select({ count: count() }).from(conversations);

  // Chat activity: messages per day for last 7 days
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const chatActivity = await db
    .select({
      date: sql<string>`DATE(${messages.createdAt})`.as("date"),
      count: count(),
    })
    .from(messages)
    .where(gte(messages.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${messages.createdAt})`)
    .orderBy(sql`DATE(${messages.createdAt})`);

  // Document uploads per day for last 7 days
  const docActivity = await db
    .select({
      date: sql<string>`DATE(${documents.createdAt})`.as("date"),
      count: count(),
    })
    .from(documents)
    .where(gte(documents.createdAt, sevenDaysAgo))
    .groupBy(sql`DATE(${documents.createdAt})`)
    .orderBy(sql`DATE(${documents.createdAt})`);

  // Fill in missing days with 0
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }

  const chatByDay = days.map((day) => {
    const match = chatActivity.find(
      (r) => String(r.date).split("T")[0] === day
    );
    return { day, count: match ? match.count : 0 };
  });

  const docByDay = days.map((day) => {
    const match = docActivity.find(
      (r) => String(r.date).split("T")[0] === day
    );
    return { day, count: match ? match.count : 0 };
  });

  const chatMax = Math.max(...chatByDay.map((d) => d.count), 1);
  const docMax = Math.max(...docByDay.map((d) => d.count), 1);

  // Top active users by message count
  const topUsers = await db
    .select({
      name: users.name,
      email: users.email,
      messageCount: count(messages.id),
    })
    .from(users)
    .leftJoin(conversations, eq(conversations.userId, users.id))
    .leftJoin(messages, eq(messages.conversationId, conversations.id))
    .groupBy(users.id, users.name, users.email)
    .orderBy(desc(count(messages.id)))
    .limit(5);

  // Recent users for activity feed
  const recentUsers = await db
    .select({
      name: users.name,
      email: users.email,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt))
    .limit(3);

  // Recent documents for activity feed
  const recentDocs = await db
    .select({
      title: documents.title,
      filename: documents.filename,
      status: documents.status,
      createdAt: documents.createdAt,
    })
    .from(documents)
    .orderBy(desc(documents.createdAt))
    .limit(3);

  // Build activity feed from real data
  const activities: {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    description: string;
    time: Date;
  }[] = [];

  for (const u of recentUsers) {
    activities.push({
      icon: "person_add",
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-500",
      title: "User Signed Up",
      description: `New user "${u.name || u.email}" joined the platform.`,
      time: u.createdAt,
    });
  }

  for (const d of recentDocs) {
    activities.push({
      icon: d.status === "ready" ? "article" : "pending",
      iconBg:
        d.status === "ready" ? "bg-emerald-500/10" : "bg-orange-500/10",
      iconColor:
        d.status === "ready" ? "text-emerald-500" : "text-orange-500",
      title:
        d.status === "ready"
          ? "Document Indexed"
          : "Document Processing",
      description:
        d.status === "ready"
          ? `"${d.title}" successfully vectorized.`
          : `"${d.title}" is being processed.`,
      time: d.createdAt,
    });
  }

  activities.sort((a, b) => b.time.getTime() - a.time.getTime());

  function formatDay(dateStr: string) {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diff = Math.round(
      (today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }

  return (
    <div className="p-8 space-y-8 bg-[#09090b]">
      {/* Page Title */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
          <p className="text-sm text-slate-500">
            Monitoring real-time performance and data ingestion.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/40 hover:border-[#6467f2]/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-slate-500">
              group
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Total Users
          </p>
          <h3 className="text-2xl font-bold mt-1">
            {userCount.count.toLocaleString()}
          </h3>
        </div>

        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/40 hover:border-[#6467f2]/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-slate-500">
              description
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Total Documents
          </p>
          <h3 className="text-2xl font-bold mt-1">
            {docCount.count.toLocaleString()}
          </h3>
        </div>

        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/40 hover:border-[#6467f2]/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <span className="material-symbols-outlined text-slate-500">
              data_array
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            Total Chunks
          </p>
          <h3 className="text-2xl font-bold mt-1">
            {chunkCount.count.toLocaleString()}
          </h3>
        </div>

        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/40 hover:border-[#6467f2]/50 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-500 text-xs font-medium">
              Operational
            </span>
          </div>
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
            System Health
          </p>
          <h3 className="text-2xl font-bold mt-1">
            {convCount.count.toLocaleString()} chats
          </h3>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Chat Activity - Last 7 Days */}
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-sm">Chat Activity</h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
              Last 7 days
            </span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {chatByDay.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] text-slate-400 font-medium">
                  {d.count}
                </span>
                <div className="w-full relative rounded-t-md overflow-hidden bg-[#27272a]"
                  style={{ height: "140px" }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-[#6467f2] transition-all"
                    style={{
                      height: `${Math.max((d.count / chatMax) * 100, d.count > 0 ? 8 : 0)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-600">
                  {formatDay(d.day)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#27272a] flex items-center justify-between">
            <span className="text-xs text-slate-500">Total messages</span>
            <span className="text-sm font-semibold">
              {chatByDay.reduce((s, d) => s + d.count, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Document Uploads - Last 7 Days */}
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-sm">Document Uploads</h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
              Last 7 days
            </span>
          </div>
          <div className="flex items-end gap-2 h-48">
            {docByDay.map((d) => (
              <div
                key={d.day}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <span className="text-[10px] text-slate-400 font-medium">
                  {d.count}
                </span>
                <div className="w-full relative rounded-t-md overflow-hidden bg-[#27272a]"
                  style={{ height: "140px" }}
                >
                  <div
                    className="absolute bottom-0 w-full rounded-t-md bg-emerald-500 transition-all"
                    style={{
                      height: `${Math.max((d.count / docMax) * 100, d.count > 0 ? 8 : 0)}%`,
                    }}
                  />
                </div>
                <span className="text-[10px] text-slate-600">
                  {formatDay(d.day)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[#27272a] flex items-center justify-between">
            <span className="text-xs text-slate-500">Total uploads</span>
            <span className="text-sm font-semibold">
              {docByDay.reduce((s, d) => s + d.count, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Top Users + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Top Active Users */}
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/20">
          <h4 className="font-semibold text-sm mb-4">Top Active Users</h4>
          {topUsers.length === 0 ? (
            <p className="text-sm text-slate-500">No activity yet.</p>
          ) : (
            <div className="space-y-3">
              {topUsers.map((u, i) => {
                const maxMsgs = topUsers[0].messageCount || 1;
                return (
                  <div key={u.email} className="flex items-center gap-3">
                    <span className="text-xs text-slate-600 w-4 text-right">
                      {i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-200 truncate">
                          {u.name || u.email}
                        </span>
                        <span className="text-xs text-slate-500 shrink-0 ml-2">
                          {u.messageCount} msgs
                        </span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-[#27272a]">
                        <div
                          className="h-full rounded-full bg-[#6467f2]"
                          style={{
                            width: `${(u.messageCount / maxMsgs) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <RecentActivity activities={activities} />
      </div>
    </div>
  );
}
