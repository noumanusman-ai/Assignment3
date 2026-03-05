"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { LogOut, Shield, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const initials =
    session?.user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-[#262626] bg-[#0a0a0a] shrink-0 flex items-center px-6">
      {/* Logo section */}
      <Link
        href="/chat"
        className="flex items-center gap-3 border-r border-[#262626] pr-6 mr-6 shrink-0"
      >
        <div className="size-9 bg-[#6467f2] rounded-lg flex items-center justify-center text-white shadow-lg shadow-[#6467f2]/20">
          <span className="material-symbols-outlined text-xl">
            account_tree
          </span>
        </div>
        <div>
          <h1 className="text-sm font-semibold tracking-tight text-white">
            ArborVect
          </h1>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
            Enterprise AI v1.2
          </p>
        </div>
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu */}
      <div className="relative pl-6 border-l border-[#262626]" ref={menuRef}>
        <button
          onClick={() => setOpen(!open)}
          className="size-9 rounded-full bg-slate-800 flex items-center justify-center overflow-hidden border border-[#262626] hover:border-[#6467f2]/50 transition-colors"
        >
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xs font-semibold text-white">
              {initials}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-[#262626] bg-[#0d0d0d] shadow-2xl z-50 overflow-hidden backdrop-blur-xl">
            <div className="px-4 py-3 border-b border-[#262626]">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>
            <div className="py-1">
              {session?.user?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Shield className="h-4 w-4 text-slate-500" />
                  Admin Dashboard
                </Link>
              )}
              <Link
                href="/chat"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
              >
                <User className="h-4 w-4 text-slate-500" />
                Chat
              </Link>
            </div>
            <div className="border-t border-[#262626] py-1">
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-white/5 transition-colors w-full text-left"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
