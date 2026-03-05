"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetPasswordAction } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("token", token || "");

    const result = await resetPasswordAction(formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess(true);
    }

    setLoading(false);
  }

  // Invalid / expired token state
  if (!token) {
    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .glass-card-rp {
                background: rgba(16, 17, 34, 0.4);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(38, 38, 38, 0.8);
                box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.1);
              }
            `,
          }}
        />
        <div className="max-w-[440px] w-full flex flex-col items-center text-center">
          {/* Icon with glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
              <span
                className="material-symbols-outlined text-4xl text-red-400"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                link_off
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Invalid link
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
            This password reset link is invalid or has expired. Please request a
            new one.
          </p>

          <div className="w-full flex flex-col gap-4 items-center">
            <Link
              href="/forgot-password"
              className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#6366f1]/20 flex items-center justify-center gap-2 group"
            >
              <span>Request new link</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-slate-400 hover:text-[#6366f1] transition-colors"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back to login
            </Link>
          </div>
        </div>

        <div
          className="fixed bottom-0 left-0 right-0 h-[300px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, #6366f1 0%, transparent 70%)",
          }}
        />
      </>
    );
  }

  // Success state — password has been reset
  if (success) {
    return (
      <>
        <div className="max-w-[440px] w-full flex flex-col items-center text-center">
          {/* Icon with glow */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-green-500/20 blur-2xl rounded-full" />
            <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
              <span
                className="material-symbols-outlined text-4xl text-green-400"
                style={{ fontVariationSettings: "'wght' 300" }}
              >
                check_circle
              </span>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
            Password reset successful
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
            Your password has been updated. You can now sign in with your new
            credentials.
          </p>

          <div className="w-full flex flex-col gap-4 items-center">
            <Link
              href="/login"
              className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#6366f1]/20 flex items-center justify-center gap-2 group"
            >
              <span>Continue to sign in</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        {/* Bottom glow decoration */}
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />
        <div
          className="fixed bottom-0 left-0 right-0 h-[300px] opacity-20 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 100%, #22c55e 0%, transparent 70%)",
          }}
        />
      </>
    );
  }

  // Reset password form
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .glass-card-rp {
              background: rgba(16, 17, 34, 0.4);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(38, 38, 38, 0.8);
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.1);
            }
          `,
        }}
      />

      <div className="glass-card-rp rounded-2xl p-8 md:p-10 border border-[#262626]">
        <div className="flex flex-col gap-2 mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Set new password
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Choose a strong password for your ArborVect account.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-300 ml-1"
            >
              New Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                required
                autoComplete="new-password"
                className="w-full bg-black/40 border border-[#262626] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-medium text-slate-300 ml-1"
            >
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full bg-black/40 border border-[#262626] focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50 rounded-xl px-4 py-3.5 text-white placeholder:text-slate-600 transition-all outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6366f1] hover:bg-[#6366f1]/90 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-[#6366f1]/20 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span>Reset password</span>
                <span className="material-symbols-outlined text-sm group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-[#262626]/50 text-center">
          <Link
            href="/login"
            className="text-sm text-slate-400 hover:text-white transition-colors inline-flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back to sign in
          </Link>
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 h-[300px] opacity-20 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 100%, #6366f1 0%, transparent 70%)",
        }}
      />
    </>
  );
}
