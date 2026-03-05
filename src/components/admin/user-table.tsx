"use client";

import { useState, useRef, useEffect } from "react";
import { updateUserRoleAction } from "@/lib/auth/actions";

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: "user" | "admin";
  emailVerified: boolean;
  authMethod: "google" | "github" | "password";
  createdAt: Date;
}

interface UserTableProps {
  users: UserRow[];
  currentUserId: string;
}

const authMethodConfig = {
  google: { icon: "mail", label: "Google" },
  github: { icon: "code", label: "GitHub" },
  password: { icon: "key", label: "Password" },
};

export function UserTable({
  users: initialUsers,
  currentUserId,
}: UserTableProps) {
  const [users, setUsers] = useState(initialUsers);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleRoleChange(
    userId: string,
    newRole: "user" | "admin"
  ) {
    await updateUserRoleAction(userId, newRole);
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    setOpenDropdown(null);
  }

  async function handleDelete(userId: string, name: string | null) {
    if (!confirm(`Delete user "${name || "this user"}"? This cannot be undone.`))
      return;

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      }
    } catch {
      // silently fail
    }
  }

  return (
    <div className="bg-[#18181b] border border-[#27272a] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-[#27272a]">
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-center">
                Auth Method
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {users.map((user) => {
              const auth = authMethodConfig[user.authMethod];
              const isSelf = user.id === currentUserId;

              return (
                <tr
                  key={user.id}
                  className="hover:bg-white/[0.02] transition-colors group"
                >
                  {/* User */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-slate-800 border border-[#27272a] shrink-0 flex items-center justify-center overflow-hidden"
                      >
                        {user.image ? (
                          <img
                            src={user.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-bold text-slate-500 uppercase">
                            {(user.name || user.email)[0]}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">
                          {user.name || "Unnamed"}
                        </p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-6 py-4">
                    {user.role === "admin" ? (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#6366f1]/20 text-[#6366f1] border border-[#6366f1]/30">
                        Admin
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-[#27272a]">
                        User
                      </span>
                    )}
                  </td>

                  {/* Auth Method */}
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center gap-2">
                      <span className="material-symbols-outlined text-slate-500 text-lg">
                        {auth.icon}
                      </span>
                      <span className="text-xs text-slate-600">
                        {auth.label}
                      </span>
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4">
                    {user.emailVerified || user.authMethod !== "password" ? (
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-sm">Verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-sm">Pending</span>
                      </div>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4 text-right">
                    {!isSelf && (
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Role dropdown */}
                        <div className="relative inline-block text-left" ref={openDropdown === user.id ? dropdownRef : undefined}>
                          <button
                            onClick={() =>
                              setOpenDropdown(
                                openDropdown === user.id ? null : user.id
                              )
                            }
                            className="text-xs font-semibold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-[#27272a] transition-all"
                          >
                            Edit Role
                          </button>
                          {openDropdown === user.id && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl bg-[#18181b] border border-[#27272a] shadow-2xl z-20 py-2">
                              <div className="px-4 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-[#27272a] mb-1">
                                Select Role
                              </div>
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "admin")
                                }
                                className="w-full text-left px-4 py-2 text-sm hover:bg-[#6366f1]/10 hover:text-[#6366f1] flex items-center justify-between"
                              >
                                Admin
                                {user.role === "admin" && (
                                  <span className="material-symbols-outlined text-sm">
                                    check
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleRoleChange(user.id, "user")
                                }
                                className="w-full text-left px-4 py-2 text-sm hover:bg-[#6366f1]/10 hover:text-[#6366f1] flex items-center justify-between"
                              >
                                User
                                {user.role === "user" && (
                                  <span className="material-symbols-outlined text-sm">
                                    check
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">
                            delete
                          </span>
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#27272a] bg-white/[0.01] flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}
