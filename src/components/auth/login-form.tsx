"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { OAuthButtons } from "./oauth-buttons";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/chat");
        router.refresh();
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
            Or sign in with email
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
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-[#6366f1] hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="glow-border bg-zinc-900/50 border border-[#262626] rounded-lg transition-all">
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
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
          Sign in to ArborVect
        </button>
      </form>

      {/* Sign up link */}
      <div className="text-center">
        <p className="text-sm text-slate-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="text-[#6366f1] font-medium hover:underline"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
