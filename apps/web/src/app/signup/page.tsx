"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiPost } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { AuthShell } from "@/components/ui/AuthShell";

interface SignupFormValues { name: string; email: string; password: string; }

export default function SignupPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<SignupFormValues>();

  async function onSubmit(values: SignupFormValues) {
    setError(null);
    try {
      await apiPost("/auth/register", values);
      await refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
    }
  }

  return (
    <AuthShell title="Create your Fundly account">
      <form onSubmit={handleSubmit(onSubmit)}>
        <label>Name<input type="text" {...register("name", { required: true })} /></label>
        <label>Email<input type="email" {...register("email", { required: true })} /></label>
        <label>Password (min 8 characters)<input type="password" {...register("password", { required: true, minLength: 8 })} /></label>
        <button type="submit" style={{ width: "100%" }}>Sign up</button>
      </form>
      {error && <p style={{ color: "var(--color-danger)" }}>{error}</p>}
      <p>Already have an account? <a href="/login">Log in</a></p>
    </AuthShell>
  );
}