"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import { AuthShell } from "@/components/ui/AuthShell";

interface FormValues { newPassword: string; }

function ResetPasswordForm() {
  const router = useRouter();
  const token = useSearchParams().get("token");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!token) { setError("Missing reset token. Use the link from your email."); return; }
    try {
      await apiPost("/password-reset/reset", { token, newPassword: values.newPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  if (done) {
    return <AuthShell title="Password reset"><p>Your password has been updated. Redirecting to login.</p></AuthShell>;
  }

  return (
    <AuthShell title="Set a new password">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>New password (min 8 characters)<input type="password" {...register("newPassword", { required: true, minLength: 8 })} /></label>
        <button type="submit" style={{ width: "100%" }}>Reset password</button>
      </form>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
    </AuthShell>
  );
}

export default function ResetPasswordPage() {
  return <Suspense fallback={<main style={{ padding: "2rem" }}>Loading</main>}><ResetPasswordForm /></Suspense>;
}