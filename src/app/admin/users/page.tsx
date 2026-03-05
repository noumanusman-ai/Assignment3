import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, accounts } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { UserTable } from "@/components/admin/user-table";

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect("/chat");
  }

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      image: users.image,
      role: users.role,
      emailVerified: users.emailVerified,
      hashedPassword: users.hashedPassword,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const allAccounts = await db
    .select({
      userId: accounts.userId,
      provider: accounts.provider,
    })
    .from(accounts);

  const accountsByUser = new Map<string, string[]>();
  for (const acc of allAccounts) {
    if (!accountsByUser.has(acc.userId)) {
      accountsByUser.set(acc.userId, []);
    }
    accountsByUser.get(acc.userId)!.push(acc.provider);
  }

  const usersWithAuth = allUsers.map((u) => {
    const providers = accountsByUser.get(u.id) || [];
    let authMethod: "google" | "github" | "password" = "password";
    if (providers.includes("google")) authMethod = "google";
    else if (providers.includes("github")) authMethod = "github";

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      image: u.image,
      role: u.role,
      emailVerified: !!u.emailVerified,
      authMethod,
      createdAt: u.createdAt,
    };
  });

  return (
    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#09090b]">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">User Management</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage platform users and their roles within the RBAC system.
          </p>
        </div>
      </div>
      <UserTable users={usersWithAuth} currentUserId={session.user.id} />
    </div>
  );
}
