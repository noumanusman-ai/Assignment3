"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "@/lib/auth/actions";
import { CheckCircle2, XCircle, Mail, Loader2 } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const sent = searchParams.get("sent");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "sent">(
    sent ? "sent" : token ? "loading" : "sent"
  );
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
    <Card className="w-full max-w-md text-center">
      <CardHeader>
        <div className="mx-auto mb-2">
          {status === "loading" && (
            <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
          )}
          {status === "sent" && (
            <Mail className="h-12 w-12 text-primary" />
          )}
          {status === "success" && (
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          )}
          {status === "error" && (
            <XCircle className="h-12 w-12 text-destructive" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {status === "sent" && "Check your email"}
          {status === "loading" && "Verifying..."}
          {status === "success" && "Email verified!"}
          {status === "error" && "Verification failed"}
        </CardTitle>
        <CardDescription>
          {status === "sent" &&
            "We sent a verification link to your email address."}
          {status === "loading" && "Please wait while we verify your email."}
          {message}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {(status === "success" || status === "error") && (
          <Button asChild className="w-full">
            <Link href="/login">Go to Sign In</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
