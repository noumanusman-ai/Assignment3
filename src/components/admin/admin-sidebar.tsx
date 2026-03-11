"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", icon: "dashboard", label: "Dashboard Overview" },
  { href: "/admin/users", icon: "group", label: "User Management" },
  // { href: "/admin/logs", icon: "terminal", label: "System Logs" },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-16 md:w-64 border-r border-[#27272a] bg-[#09090b] flex flex-col shrink-0 transition-all duration-300">
      {/* Logo */}
      <div className="p-4 md:p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#6467f2] flex items-center justify-center text-white shrink-0">
          <span className="material-symbols-outlined text-xl">
            account_tree
          </span>
        </div>
        <div className="hidden md:block">
          <h1 className="text-sm font-bold tracking-tight">ArborVect</h1>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            Admin Console
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 md:px-3 space-y-1">
        {navItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#6467f2]/10 text-[#6467f2]"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {item.icon}
              </span>
              <span className="text-sm font-medium hidden md:block">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-[#27272a]">
        <Link
          href="/chat"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">
            arrow_back
          </span>
          <span className="text-sm font-medium hidden md:block">
            Back to Chat
          </span>
        </Link>
      </div>
    </aside>
  );
}
