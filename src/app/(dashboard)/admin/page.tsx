import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, documents, conversations } from "@/lib/db/schema";
import { count } from "drizzle-orm";
import { StatsCards } from "@/components/admin/stats-cards";
import { UserTable } from "@/components/admin/user-table";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/chat");
  }

  // Fetch stats
  const [userCount] = await db.select({ count: count() }).from(users);
  const [docCount] = await db.select({ count: count() }).from(documents);
  const [convCount] = await db.select({ count: count() }).from(conversations);

  // Fetch all users
  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(users.createdAt);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and monitor application stats.
        </p>
      </div>

      <StatsCards
        totalUsers={userCount.count}
        totalDocuments={docCount.count}
        totalConversations={convCount.count}
      />

      <div>
        <h2 className="mb-4 text-lg font-semibold">Users</h2>
        <UserTable users={allUsers} currentUserId={session.user.id} />
      </div>
    </div>
  );
}
