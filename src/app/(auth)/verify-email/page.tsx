"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { verifyEmailAction } from "@/lib/auth/actions";
import { Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const sent = searchParams.get("sent");
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "sent"
  >(sent ? "sent" : token ? "loading" : "sent");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (token) {
      verifyEmailAction(token).then((result) => {
        if (result.error) {
          setStatus("error");
          setMessage(result.error);
        } else {
          setStatus("success");
          setMessage(result.success!);
        }
      });
    }
  }, [token]);

  return (
    <div className="max-w-[440px] w-full flex flex-col items-center text-center">
      {/* Icon Container with Glow Effect */}
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-[#6467f2]/20 blur-2xl rounded-full" />
        <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-white/5 border border-white/10 shadow-xl">
          {status === "loading" && (
            <Loader2 className="h-10 w-10 animate-spin text-[#6467f2]" />
          )}
          {status === "sent" && (
            <span
              className="material-symbols-outlined text-4xl text-[#6467f2]"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              mail
            </span>
          )}
          {status === "success" && (
            <span
              className="material-symbols-outlined text-4xl text-green-400"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              check_circle
            </span>
          )}
          {status === "error" && (
            <span
              className="material-symbols-outlined text-4xl text-red-400"
              style={{ fontVariationSettings: "'wght' 300" }}
            >
              cancel
            </span>
          )}
        </div>
      </div>

      {/* Text Content */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
        {status === "sent" && "Check your inbox"}
        {status === "loading" && "Verifying..."}
        {status === "success" && "Email verified!"}
        {status === "error" && "Verification failed"}
      </h1>
      <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-sm">
        {status === "sent" &&
          "We\u2019ve sent a verification link to your email address. Please click the link to confirm your account."}
        {status === "loading" &&
          "Please wait while we verify your email address."}
        {(status === "success" || status === "error") && message}
      </p>

      {/* Actions Container */}
      <div className="w-full flex flex-col gap-4 items-center">
        {status === "sent" && (
          <button className="w-full h-12 flex items-center justify-center rounded-lg border border-[#262626] bg-transparent hover:bg-white/5 text-white font-semibold transition-all">
            Resend verification link
          </button>
        )}

        {status === "success" && (
          <Link
            href="/login"
            className="w-full h-12 flex items-center justify-center rounded-lg bg-[#6467f2] hover:bg-[#6467f2]/90 text-white font-semibold transition-all shadow-lg shadow-[#6467f2]/20"
          >
            Continue to Sign In
          </Link>
        )}

        {status === "error" && (
          <Link
            href="/login"
            className="w-full h-12 flex items-center justify-center rounded-lg bg-[#6467f2] hover:bg-[#6467f2]/90 text-white font-semibold transition-all shadow-lg shadow-[#6467f2]/20"
          >
            Go to Sign In
          </Link>
        )}

        <Link
          href="/login"
          className="inline-flex items-center gap-2 mt-4 text-sm font-medium text-slate-400 hover:text-[#6467f2] transition-colors"
        >
          <span className="material-symbols-outlined text-base">
            arrow_back
          </span>
          Back to login
        </Link>
      </div>

      {/* Bottom glow decoration */}
      <div className="pointer-events-none fixed bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#6467f2]/20 to-transparent" />
      <div className="pointer-events-none fixed -bottom-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#6467f2]/5 blur-[120px] rounded-full" />
    </div>
  );
}
