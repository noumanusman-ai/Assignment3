"use server";

import { db } from "@/lib/db";
import { users, verificationTokens } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { registerSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { sendVerificationEmail, sendPasswordResetEmail } from "./send-email";

export async function registerAction(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  // Check if user exists
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return { error: "An account with this email already exists" };
  }

  // Create user
  const hashedPassword = await hash(password, 12);
  await db.insert(users).values({
    name,
    email,
    hashedPassword,
    role: "user",
  });

  // Generate verification token
  const token = randomUUID();
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  // Send verification email
  try {
    await sendVerificationEmail(email, token);
  } catch {
    // Email sending may fail in dev without API key — account is still created
  }

  return { success: "Account created! Check your email to verify." };
}

export async function verifyEmailAction(token: string) {
  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record) {
    return { error: "Invalid or expired verification token" };
  }

  if (record.expires < new Date()) {
    await db
      .delete(verificationTokens)
      .where(
        and(
          eq(verificationTokens.identifier, record.identifier),
          eq(verificationTokens.token, token)
        )
      );
    return { error: "Verification token has expired" };
  }

  // Mark email as verified
  await db
    .update(users)
    .set({ emailVerified: new Date() })
    .where(eq(users.email, record.identifier));

  // Delete used token
  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, record.identifier),
        eq(verificationTokens.token, token)
      )
    );

  return { success: "Email verified! You can now sign in." };
}

export async function forgotPasswordAction(formData: FormData) {
  const raw = { email: formData.get("email") as string };

  const parsed = forgotPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { email } = parsed.data;

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  // Always return success to prevent email enumeration
  if (!user) {
    return { success: "If an account exists, a reset link has been sent." };
  }

  const token = randomUUID();
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  });

  try {
    await sendPasswordResetEmail(email, token);
  } catch {
    // Fail silently in dev
  }

  return { success: "If an account exists, a reset link has been sent." };
}

export async function resetPasswordAction(formData: FormData) {
  const raw = {
    token: formData.get("token") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  const parsed = resetPasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { token, password } = parsed.data;

  const [record] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token))
    .limit(1);

  if (!record || record.expires < new Date()) {
    return { error: "Invalid or expired reset token" };
  }

  const hashedPassword = await hash(password, 12);

  await db
    .update(users)
    .set({ hashedPassword, updatedAt: new Date() })
    .where(eq(users.email, record.identifier));

  await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, record.identifier),
        eq(verificationTokens.token, token)
      )
    );

  return { success: "Password reset! You can now sign in." };
}

export async function updateUserRoleAction(userId: string, role: "user" | "admin") {
  await db
    .update(users)
    .set({ role, updatedAt: new Date() })
    .where(eq(users.id, userId));

  return { success: true };
}
