import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  users,
  documents,
  conversations,
  chunks,
  embeddings,
} from "@/lib/db/schema";
import { count, desc, sql } from "drizzle-orm";
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

  // Recent users for activity feed
  const recentUsers = await db
    .select({ name: users.name, email: users.email, createdAt: users.createdAt })
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
        {/* Request Volume Chart */}
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-sm">Request Volume</h4>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#6467f2]" />
              <span className="text-[10px] text-slate-500">API Requests</span>
            </div>
          </div>
          <div className="h-64 w-full mt-auto relative">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
            >
              <defs>
                <linearGradient
                  id="chartGradient"
                  x1="0"
                  x2="0"
                  y1="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#6467f2"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="100%"
                    stopColor="#6467f2"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <path
                d="M0,80 Q40,75 80,40 T160,50 T240,20 T320,60 T400,30 L400,100 L0,100 Z"
                fill="url(#chartGradient)"
              />
              <path
                d="M0,80 Q40,75 80,40 T160,50 T240,20 T320,60 T400,30"
                fill="none"
                stroke="#6467f2"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-slate-600 px-1 pt-2">
              <span>00:00</span>
              <span>06:00</span>
              <span>12:00</span>
              <span>18:00</span>
              <span>23:59</span>
            </div>
          </div>
        </div>

        {/* Storage Growth Chart */}
        <div className="p-6 rounded-xl border border-[#27272a] bg-slate-900/20 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h4 className="font-semibold text-sm">Storage Growth</h4>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-1 rounded">
              Cumulative
            </span>
          </div>
          <div className="h-64 w-full mt-auto relative">
            <svg
              className="w-full h-full"
              preserveAspectRatio="none"
              viewBox="0 0 400 100"
            >
              <path
                d="M0,90 C50,88 100,80 150,70 S250,40 300,35 S350,15 400,10 L400,100 L0,100 Z"
                fill="rgba(255, 255, 255, 0.05)"
              />
              <path
                d="M0,90 C50,88 100,80 150,70 S250,40 300,35 S350,15 400,10"
                fill="none"
                stroke="#94a3b8"
                strokeDasharray="4"
                strokeWidth="2"
              />
            </svg>
            <div className="absolute bottom-0 left-0 w-full flex justify-between text-[10px] text-slate-600 px-1 pt-2">
              <span>Day 1</span>
              <span>Day 7</span>
              <span>Day 14</span>
              <span>Day 21</span>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <RecentActivity activities={activities} />
    </div>
  );
}
