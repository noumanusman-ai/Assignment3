"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await forgotPasswordAction(formData);

    if (result.success) {
      setMessage(result.success);
    } else if (result.error) {
      setMessage(result.error);
    }

    setLoading(false);
  }

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .glass-card-fp {
              background: rgba(16, 17, 34, 0.4);
              backdrop-filter: blur(12px);
              border: 1px solid rgba(38, 38, 38, 0.8);
              box-shadow: 0 0 20px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(99, 102, 241, 0.1);
            }
          `,
        }}
      />

      <div className="glass-card-fp rounded-2xl p-8 md:p-10 border border-[#262626]">
        <div className="flex flex-col gap-2 mb-8 text-center">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Reset password
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Enter your email address and we will send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div className="rounded-xl bg-[#6366f1]/10 border border-[#6366f1]/20 p-3 text-sm text-[#6366f1]">
              {message}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-slate-300 ml-1"
            >
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                autoComplete="email"
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
                <span>Send reset link</span>
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

      {/* Footer links */}
      <footer className="mt-8 flex justify-center gap-6 text-xs text-slate-500">
        <a className="hover:text-slate-300 transition-colors" href="#">
          Privacy Policy
        </a>
        <a className="hover:text-slate-300 transition-colors" href="#">
          Terms of Service
        </a>
        <a className="hover:text-slate-300 transition-colors" href="#">
          Contact Support
        </a>
      </footer>

      {/* Background gradient at bottom */}
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
