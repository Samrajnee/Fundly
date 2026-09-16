"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";

interface FormValues {
  newPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    if (!token) {
      setError("Missing reset token. Use the link from your email.");
      return;
    }
    try {
      await apiPost("/password-reset/reset", { token, newPassword: values.newPassword });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    }
  }

  if (done) {
    return (
      <main style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem" }}>
        <h1>Password reset</h1>
        <p>Your password has been updated. Redirecting to login...</p>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 400, margin: "4rem auto", padding: "2rem" }}>
      <h1>Set a new password</h1>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          New Password (min 8 characters)
          <input type="password" {...register("newPassword", { required: true, minLength: 8 })} />
        </label>
        <button type="submit">Reset Password</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem" }}>Loading...</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}