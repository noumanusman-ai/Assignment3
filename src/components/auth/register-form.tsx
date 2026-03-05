"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OAuthButtons } from "./oauth-buttons";
import { registerAction } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await registerAction(formData);

      if (result.error) {
        setError(result.error);
      } else {
        router.push("/verify-email?sent=true");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* OAuth Buttons */}
      <OAuthButtons />

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#262626]" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-[#0a0a0a] px-3 text-slate-500">
            Or sign up with email
          </span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label
            htmlFor="name"
            className="text-sm font-medium text-slate-300"
          >
            Full name
          </label>
          <div className="glow-border bg-zinc-900/50 border border-[#262626] rounded-lg transition-all">
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Your full name"
              required
              autoComplete="name"
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 h-11 px-4 text-sm rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-300"
          >
            Email address
          </label>
          <div className="glow-border bg-zinc-900/50 border border-[#262626] rounded-lg transition-all">
            <input
              id="email"
              name="email"
              type="email"
              placeholder="name@company.com"
              required
              autoComplete="email"
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 h-11 px-4 text-sm rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-300"
          >
            Password
          </label>
          <div className="glow-border bg-zinc-900/50 border border-[#262626] rounded-lg transition-all">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              required
              autoComplete="new-password"
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 h-11 px-4 text-sm rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-slate-300"
          >
            Confirm password
          </label>
          <div className="glow-border bg-zinc-900/50 border border-[#262626] rounded-lg transition-all">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              className="w-full bg-transparent border-none focus:ring-0 text-white placeholder:text-slate-600 h-11 px-4 text-sm rounded-lg"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-medium rounded-lg transition-all shadow-lg shadow-[#6366f1]/20 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>

      {/* Sign in link */}
      <div className="text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-[#6366f1] font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
