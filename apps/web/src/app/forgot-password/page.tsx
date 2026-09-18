"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import { AuthShell } from "@/components/ui/AuthShell";

interface FormValues { email: string; }

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<FormValues>();

  async function onSubmit(values: FormValues) {
    setError(null);
    try {
      const result = await apiPost<{ message: string }>("/password-reset/request", values);
      setMessage(result.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <AuthShell title="Forgot your password?" description="Enter your email and we'll send you a reset link.">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email<input type="email" {...register("email", { required: true })} /></label>
        <button type="submit" style={{ width: "100%" }}>Send reset link</button>
      </form>
      {message && <p style={{ color: "var(--color-success)" }}>{message}</p>}
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <p><a href="/login">Back to login</a></p>
    </AuthShell>
  );
}