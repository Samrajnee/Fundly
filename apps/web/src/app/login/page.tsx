"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/ui/AuthShell";

interface LoginFormValues { email: string; password: string; }

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<LoginFormValues>();

  async function onSubmit(values: LoginFormValues) {
    setError(null);
    try {
      await apiPost("/auth/login", values);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  }

  return (
    <AuthShell title="Log in to Fundly">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Email<input type="email" {...register("email", { required: true })} /></label>
        <label>Password<input type="password" {...register("password", { required: true })} /></label>
        <button type="submit" style={{ width: "100%" }}>Log in</button>
      </form>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <p><a href="/forgot-password">Forgot your password?</a></p>
      <p>Don't have an account? <a href="/signup">Sign up</a></p>
    </AuthShell>
  );
}